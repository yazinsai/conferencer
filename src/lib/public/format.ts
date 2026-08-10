export function formatSessionDate(
  iso: string,
  timezone: string,
): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(iso));
}

export function formatSessionTime(iso: string, timezone: string): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function formatTimeRange(
  startsAt: string,
  endsAt: string | null,
  timezone: string,
): string {
  const start = formatSessionTime(startsAt, timezone);
  if (!endsAt) return start;
  const end = formatSessionTime(endsAt, timezone);
  return `${start} – ${end}`;
}

export function formatSessionDateTime(
  startsAt: string,
  endsAt: string | null,
  timezone: string,
): string {
  const date = formatSessionDate(startsAt, timezone);
  const time = formatTimeRange(startsAt, endsAt, timezone);
  return `${date} · ${time}`;
}

export function dayKey(iso: string, timezone: string): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: timezone }).format(
    new Date(iso),
  );
}

export function formatDayLabel(iso: string, timezone: string): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(new Date(iso));
}

export function speakerDisplayName(firstName: string, lastName: string): string {
  return `${firstName} ${lastName}`;
}

export function speakerTitleLine(
  jobTitle: string | null,
  company: string | null,
): string | null {
  if (jobTitle && company) return `${jobTitle}, ${company}`;
  return jobTitle ?? company;
}
