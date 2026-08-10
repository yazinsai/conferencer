import { normalizeLocal } from "./datetime";
import { stripHtml } from "./fields";

export type IcsEvent = {
  uid: string;
  title: string;
  description?: string | null;
  location?: string | null;
  start: string | null;
  end?: string | null;
  sequence?: number;
  organizerName?: string;
  organizerEmail?: string;
  attendees?: Array<{ name: string; email: string }>;
  url?: string;
};

function escape(value: string): string {
  return String(value)
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

/** "2027-05-12T10:00" -> "20270512T100000" (local, paired with TZID). */
function stamp(value?: string | null): string | null {
  const v = normalizeLocal(value);
  if (!v) return null;
  const [date, time = "00:00"] = v.split("T");
  return `${date.replace(/-/g, "")}T${time.replace(":", "")}00`;
}

function utcStamp(date = new Date()): string {
  return `${date.toISOString().replace(/[-:]/g, "").split(".")[0]}Z`;
}

function fold(line: string): string {
  if (line.length <= 74) return line;
  const parts: string[] = [];
  let rest = line;
  while (rest.length > 74) {
    parts.push(rest.slice(0, 74));
    rest = ` ${rest.slice(74)}`;
  }
  parts.push(rest);
  return parts.join("\r\n");
}

/** Minimal but valid VTIMEZONE for US Pacific; good enough for Outlook/Google. */
function vtimezone(tzid: string): string[] {
  if (tzid !== "America/Los_Angeles") return [];
  return [
    "BEGIN:VTIMEZONE",
    `TZID:${tzid}`,
    "X-LIC-LOCATION:America/Los_Angeles",
    "BEGIN:DAYLIGHT",
    "TZOFFSETFROM:-0800",
    "TZOFFSETTO:-0700",
    "TZNAME:PDT",
    "DTSTART:19700308T020000",
    "RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=2SU",
    "END:DAYLIGHT",
    "BEGIN:STANDARD",
    "TZOFFSETFROM:-0700",
    "TZOFFSETTO:-0800",
    "TZNAME:PST",
    "DTSTART:19701101T020000",
    "RRULE:FREQ=YEARLY;BYMONTH=11;BYDAY=1SU",
    "END:STANDARD",
    "END:VTIMEZONE",
  ];
}

export function buildIcs(
  events: IcsEvent[],
  opts: { calendarName: string; timezone: string; method?: "PUBLISH" | "REQUEST" },
): string {
  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Conferencer//Program//EN",
    "CALSCALE:GREGORIAN",
    `METHOD:${opts.method ?? "PUBLISH"}`,
    `X-WR-CALNAME:${escape(opts.calendarName)}`,
    `X-WR-TIMEZONE:${opts.timezone}`,
    ...vtimezone(opts.timezone),
  ];

  for (const event of events) {
    const start = stamp(event.start);
    if (!start) continue;
    const end = stamp(event.end) ?? start;
    lines.push("BEGIN:VEVENT");
    lines.push(`UID:${event.uid}`);
    lines.push(`DTSTAMP:${utcStamp()}`);
    lines.push(`SEQUENCE:${event.sequence ?? 0}`);
    lines.push(`DTSTART;TZID=${opts.timezone}:${start}`);
    lines.push(`DTEND;TZID=${opts.timezone}:${end}`);
    lines.push(fold(`SUMMARY:${escape(event.title)}`));
    if (event.description) {
      lines.push(fold(`DESCRIPTION:${escape(stripHtml(event.description).slice(0, 900))}`));
    }
    if (event.location) lines.push(fold(`LOCATION:${escape(event.location)}`));
    if (event.url) lines.push(fold(`URL:${escape(event.url)}`));
    if (event.organizerEmail) {
      lines.push(
        fold(
          `ORGANIZER;CN=${escape(event.organizerName ?? event.organizerEmail)}:mailto:${event.organizerEmail}`,
        ),
      );
    }
    for (const attendee of event.attendees ?? []) {
      lines.push(
        fold(
          `ATTENDEE;CN=${escape(attendee.name)};ROLE=REQ-PARTICIPANT;PARTSTAT=NEEDS-ACTION;RSVP=TRUE:mailto:${attendee.email}`,
        ),
      );
    }
    lines.push("STATUS:CONFIRMED");
    lines.push("END:VEVENT");
  }

  lines.push("END:VCALENDAR");
  return `${lines.join("\r\n")}\r\n`;
}

/** Google / Outlook "add to calendar" links for the email body (R-COM-5). */
export function calendarLinks(event: {
  title: string;
  description?: string | null;
  location?: string | null;
  start: string | null;
  end?: string | null;
}): { google: string; outlook: string } {
  const start = stamp(event.start);
  const end = stamp(event.end) ?? start;
  const text = encodeURIComponent(event.title);
  const details = encodeURIComponent(stripHtml(event.description ?? "").slice(0, 500));
  const location = encodeURIComponent(event.location ?? "");
  const google = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}&dates=${start}/${end}&details=${details}&location=${location}&ctz=America/Los_Angeles`;
  const isoStart = normalizeLocal(event.start) ?? "";
  const isoEnd = normalizeLocal(event.end) ?? isoStart;
  const outlook = `https://outlook.live.com/calendar/0/deeplink/compose?path=/calendar/action/compose&rru=addevent&subject=${text}&body=${details}&location=${location}&startdt=${isoStart}&enddt=${isoEnd}`;
  return { google, outlook };
}
