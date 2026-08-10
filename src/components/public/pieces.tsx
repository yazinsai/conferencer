import Link from "next/link";

import { Avatar, Chip, cx } from "@/components/ui";
import { ShowMore } from "@/components/client/basics";
import { formatDate, formatRange, formatTime } from "@/lib/datetime";
import type { PublicSession, SpeakerBrief } from "@/lib/repo/submissions";
import { stripHtml } from "@/lib/fields";

export function SpeakerLine({ speakers }: { speakers: SpeakerBrief[] }) {
  if (!speakers.length) return null;
  return (
    <ul className="mt-3 space-y-1.5">
      {speakers.map((s) => (
        <li key={s.contact_id} className="flex items-center gap-2 text-sm">
          <Avatar src={s.headshot_url} name={`${s.first_name} ${s.last_name}`} size={28} />
          <span className="text-slate-800">
            <span className="font-medium">
              {s.first_name} {s.last_name}
            </span>
            {s.job_title || s.company ? (
              <span className="text-slate-500">
                {" — "}
                {[s.job_title, s.company].filter(Boolean).join(", ")}
              </span>
            ) : null}
          </span>
        </li>
      ))}
    </ul>
  );
}

export function SessionMeta({ session }: { session: PublicSession }) {
  const when = session.pub_starts_at
    ? formatRange(session.pub_starts_at, session.pub_ends_at)
    : "Time to be announced";
  return (
    <p className="mt-1 text-sm text-slate-500">
      <span>{when}</span>
      {session.room_name ? <span> · {session.room_name}</span> : null}
    </p>
  );
}

export function SessionTags({ session }: { session: PublicSession }) {
  return (
    <div className="mt-3 flex flex-wrap gap-1.5">
      {session.track_name ? (
        <Chip color={session.track_color} title="Track">
          {session.track_name}
        </Chip>
      ) : null}
      {session.format_name ? <Chip tone="slate">{session.format_name}</Chip> : null}
      {session.level ? <Chip tone="blue">{session.level}</Chip> : null}
    </div>
  );
}

export function SessionCard({
  session,
  speakers,
  href,
  action,
}: {
  session: PublicSession;
  speakers: SpeakerBrief[];
  href: string;
  action?: React.ReactNode;
}) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-base font-semibold leading-snug text-slate-900">
          <Link href={href} className="hover:text-brand-700">
            {session.title}
          </Link>
        </h3>
        {action}
      </div>
      <SessionMeta session={session} />
      {session.description ? (
        <ShowMore
          text={stripHtml(session.description)}
          limit={200}
          className="mt-2 text-sm text-slate-600"
        />
      ) : null}
      <SpeakerLine speakers={speakers} />
      <SessionTags session={session} />
    </article>
  );
}

export function DayTabs({
  days,
  current,
  hrefFor,
}: {
  days: string[];
  current: string;
  hrefFor: (day: string) => string;
}) {
  return (
    <div className="mb-4 flex flex-wrap gap-1" role="tablist" aria-label="Event days">
      {days.map((day, index) => {
        const active = day === current;
        return (
          <Link
            key={day}
            href={hrefFor(day)}
            role="tab"
            aria-selected={active}
            className={cx(
              "rounded-md border px-3 py-2 text-sm font-medium",
              active
                ? "border-slate-900 bg-slate-900 text-white"
                : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50",
            )}
          >
            Day {index + 1}
            <span className={cx("ml-1.5 text-xs", active ? "text-slate-300" : "text-slate-500")}>
              {formatDate(day)}
            </span>
          </Link>
        );
      })}
    </div>
  );
}

export function TimeLabel({ value }: { value?: string | null }) {
  return <span className="font-mono text-xs text-slate-500">{formatTime(value)}</span>;
}
