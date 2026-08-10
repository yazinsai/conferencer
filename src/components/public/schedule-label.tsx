import {
  formatSessionDateTime,
  formatTimeRange,
} from "@/lib/public/format";

export function ScheduleLabel({
  startsAt,
  endsAt,
  roomName,
  timezone,
  schedulePublished,
  className = "",
}: {
  startsAt: string | null;
  endsAt: string | null;
  roomName: string | null;
  timezone: string;
  schedulePublished: boolean;
  className?: string;
}) {
  if (!schedulePublished) {
    return (
      <p className={`text-sm italic text-slate-500 ${className}`}>
        Schedule to be announced
      </p>
    );
  }

  if (!startsAt) {
    return (
      <p className={`text-sm text-slate-500 ${className}`}>Time TBD</p>
    );
  }

  const when = formatSessionDateTime(startsAt, endsAt, timezone);
  return (
    <p className={`text-sm text-slate-600 ${className}`}>
      <span>{when}</span>
      {roomName ? (
        <span className="text-slate-500"> · {roomName}</span>
      ) : null}
    </p>
  );
}

export function ScheduleTimeOnly({
  startsAt,
  endsAt,
  timezone,
}: {
  startsAt: string;
  endsAt: string | null;
  timezone: string;
}) {
  return (
    <span>{formatTimeRange(startsAt, endsAt, timezone)}</span>
  );
}
