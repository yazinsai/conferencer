import Link from "next/link";

import { Avatar, Chip, cx } from "@/components/ui";
import { ShowMore } from "@/components/client/basics";
import { formatDate, formatRange, formatTime } from "@/lib/datetime";
import type { PublicSession, SpeakerBrief } from "@/lib/repo/submissions";
import { stripHtml } from "@/lib/fields";

/**
 * The measure for a public sub-page. The layout's <main> is deliberately
 * unpadded so the event home can run a full-bleed Marquee fold; every other
 * public page opts into this container instead.
 */
export function PublicPage({
  children,
  className,
  width = "wide",
}: {
  children: React.ReactNode;
  className?: string;
  width?: "wide" | "prose";
}) {
  return (
    <div
      className={cx(
        "mx-auto w-full px-4 py-10 sm:px-6",
        width === "wide" ? "max-w-6xl" : "max-w-3xl",
        className,
      )}
    >
      {children}
    </div>
  );
}

/** A public page's h1 plus its one-line orientation. */
export function PublicHeading({
  title,
  meta,
  action,
}: {
  title: React.ReactNode;
  meta?: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-7 flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
      <div className="min-w-0">
        <h1 className="display text-2xl text-ink sm:text-3xl">{title}</h1>
        {meta ? <p className="mt-2 text-sm text-neutral">{meta}</p> : null}
      </div>
      {action ? <div className="flex shrink-0 items-center gap-2">{action}</div> : null}
    </div>
  );
}

export function SpeakerLine({ speakers }: { speakers: SpeakerBrief[] }) {
  if (!speakers.length) return null;
  return (
    <ul className="mt-3 space-y-1.5">
      {speakers.map((s) => (
        <li key={s.contact_id} className="flex items-center gap-2 text-sm">
          <Avatar src={s.headshot_url} name={`${s.first_name} ${s.last_name}`} size={26} />
          <span className="min-w-0 text-neutral">
            <span className="font-medium text-ink">
              {s.first_name} {s.last_name}
            </span>
            {s.job_title || s.company ? (
              <span className="text-muted-foreground">
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
    <p className="wordmark tnum mt-1.5 text-xs text-muted-foreground">
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
    <article className="group rounded-card border border-rule bg-card p-5 shadow-[var(--shadow-card)] transition-[border-color,box-shadow] duration-[180ms] ease-out hover:border-rule-2 hover:shadow-[var(--shadow-raised)]">
      <div className="flex items-start justify-between gap-3">
        <h3 className="display min-w-0 text-base leading-snug text-ink">
          <Link href={href} className="underline-offset-4 hover:underline">
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
          className="mt-2.5 text-sm leading-relaxed text-neutral"
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
    <div className="mb-6 flex flex-wrap gap-1.5" role="tablist" aria-label="Event days">
      {days.map((day, index) => {
        const active = day === current;
        return (
          <Link
            key={day}
            href={hrefFor(day)}
            role="tab"
            aria-selected={active}
            className={cx(
              "nowrap-affordance rounded-pill border px-3.5 py-2 text-sm font-medium",
              "transition-colors duration-[120ms] ease-out",
              active
                ? "border-ink bg-ink text-paper"
                : "border-rule-2 bg-paper text-neutral hover:bg-paper-2 hover:text-ink",
            )}
          >
            {`Day ${index + 1}`}
            <span
              className={cx(
                "wordmark tnum ml-1.5 text-xs",
                active ? "text-paper/70" : "text-muted-foreground",
              )}
            >
              {formatDate(day)}
            </span>
          </Link>
        );
      })}
    </div>
  );
}

export function TimeLabel({ value }: { value?: string | null }) {
  return <span className="wordmark tnum text-xs text-muted-foreground">{formatTime(value)}</span>;
}
