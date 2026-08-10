/** Extract trailing timezone offset (e.g. -07:00) or Z from an ISO string. */
export function offsetFromIso(iso: string): string {
  const m = iso.match(/(Z|[+-]\d{2}:\d{2})$/);
  return m?.[1] ?? "Z";
}

/** Combine a calendar date + HH:mm time using the event's reference offset. */
export function combineDateAndTime(
  date: string,
  time: string,
  referenceIso: string,
): string {
  const offset = offsetFromIso(referenceIso);
  const suffix = offset === "Z" ? "Z" : offset;
  return `${date}T${time}:00${suffix}`;
}

/** List YYYY-MM-DD strings for each day the event spans (inclusive). */
export function eventDayKeys(startsAt: string, endsAt: string): string[] {
  const start = new Date(startsAt);
  const end = new Date(endsAt);
  const days: string[] = [];
  const cursor = new Date(
    Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate()),
  );
  const last = new Date(
    Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate()),
  );
  while (cursor <= last) {
    const y = cursor.getUTCFullYear();
    const m = String(cursor.getUTCMonth() + 1).padStart(2, "0");
    const d = String(cursor.getUTCDate()).padStart(2, "0");
    days.push(`${y}-${m}-${d}`);
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return days.length ? days : [startsAt.slice(0, 10)];
}

export function formatDayLabel(dayKey: string) {
  const d = new Date(`${dayKey}T12:00:00Z`);
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function formatTimeRange(startsAt: string, endsAt: string) {
  const opts: Intl.DateTimeFormatOptions = {
    hour: "numeric",
    minute: "2-digit",
  };
  return `${new Date(startsAt).toLocaleTimeString("en-US", opts)} – ${new Date(endsAt).toLocaleTimeString("en-US", opts)}`;
}

export function isoToDateInput(iso: string | null | undefined) {
  if (!iso) return "";
  return iso.slice(0, 10);
}

export function isoToTimeInput(iso: string | null | undefined) {
  if (!iso) return "";
  const m = iso.match(/T(\d{2}:\d{2})/);
  return m?.[1] ?? "";
}
