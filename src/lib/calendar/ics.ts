export type IcsAttendee = {
  email: string;
  name?: string;
};

export type IcsEventInput = {
  uid: string;
  summary: string;
  description?: string;
  location?: string;
  startsAt: string;
  endsAt: string;
  organizerEmail?: string;
  organizerName?: string;
  attendees?: IcsAttendee[];
  sequence?: number;
  status?: "CONFIRMED" | "TENTATIVE" | "CANCELLED";
};

function escapeIcsText(value: string) {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}

function foldLine(line: string) {
  const max = 75;
  if (line.length <= max) return line;
  const parts: string[] = [line.slice(0, max)];
  let rest = line.slice(max);
  while (rest.length > 0) {
    parts.push(` ${rest.slice(0, max - 1)}`);
    rest = rest.slice(max - 1);
  }
  return parts.join("\r\n");
}

function toIcsUtc(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}` +
    `T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`
  );
}

export function buildVEvent(event: IcsEventInput): string {
  const lines: string[] = [
    "BEGIN:VEVENT",
    foldLine(`UID:${event.uid}`),
    foldLine(`DTSTAMP:${toIcsUtc(new Date().toISOString())}`),
    foldLine(`DTSTART:${toIcsUtc(event.startsAt)}`),
    foldLine(`DTEND:${toIcsUtc(event.endsAt)}`),
    foldLine(`SUMMARY:${escapeIcsText(event.summary)}`),
  ];

  if (event.description) {
    lines.push(foldLine(`DESCRIPTION:${escapeIcsText(event.description)}`));
  }
  if (event.location) {
    lines.push(foldLine(`LOCATION:${escapeIcsText(event.location)}`));
  }
  if (event.organizerEmail) {
    const cn = event.organizerName
      ? `;CN=${escapeIcsText(event.organizerName)}`
      : "";
    lines.push(foldLine(`ORGANIZER${cn}:mailto:${event.organizerEmail}`));
  }
  for (const attendee of event.attendees ?? []) {
    const cn = attendee.name ? `;CN=${escapeIcsText(attendee.name)}` : "";
    lines.push(
      foldLine(
        `ATTENDEE${cn};ROLE=REQ-PARTICIPANT;PARTSTAT=NEEDS-ACTION;RSVP=TRUE:mailto:${attendee.email}`,
      ),
    );
  }
  lines.push(`SEQUENCE:${event.sequence ?? 0}`);
  lines.push(`STATUS:${event.status ?? "CONFIRMED"}`);
  lines.push("END:VEVENT");
  return lines.join("\r\n");
}

export function buildCalendarInvite(
  event: IcsEventInput,
  opts?: { prodId?: string },
): string {
  const prodId = opts?.prodId ?? "-//Conferencer//Agenda//EN";
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    `PRODID:${prodId}`,
    "CALSCALE:GREGORIAN",
    "METHOD:REQUEST",
    buildVEvent(event),
    "END:VCALENDAR",
  ].join("\r\n");
}

export function buildCalendarFeed(
  events: IcsEventInput[],
  opts?: { name?: string; prodId?: string },
): string {
  const prodId = opts?.prodId ?? "-//Conferencer//Agenda//EN";
  const name = opts?.name ?? "Conferencer Agenda";
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    `PRODID:${prodId}`,
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    foldLine(`X-WR-CALNAME:${escapeIcsText(name)}`),
    ...events.map((e) => buildVEvent(e)),
    "END:VCALENDAR",
  ].join("\r\n");
}

export function icsDownloadDataUrl(ics: string) {
  return `data:text/calendar;charset=utf-8,${encodeURIComponent(ics)}`;
}

export function icsEmailHtml(ics: string, label = "Download calendar invite (.ics)") {
  const href = icsDownloadDataUrl(ics);
  return (
    `<p><a href="${href}" download="invite.ics">${label}</a></p>` +
    `<details><summary>Calendar data</summary><pre style="white-space:pre-wrap;font-size:12px;background:#f8fafc;padding:12px;border-radius:8px;">${escapeHtml(ics)}</pre></details>`
  );
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
