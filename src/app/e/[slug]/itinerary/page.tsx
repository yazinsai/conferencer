import Link from "next/link";

import { eventBySlugOr404 } from "@/lib/guards";
import { listLookup } from "@/lib/repo/events";
import { publicSessions, speakersForSubmissions } from "@/lib/repo/submissions";
import { DayTabs, SpeakerLine } from "@/components/public/pieces";
import { StarButton } from "@/components/client/schedule";
import { FilterSelect, SearchBox, ShowMore } from "@/components/client/basics";
import { Chip, EmptyState, LinkButton } from "@/components/ui";
import { dateOf, daysBetween, formatDate, formatRange, formatTime } from "@/lib/datetime";
import { stripHtml } from "@/lib/fields";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps<"/e/[slug]/itinerary">) {
  const { slug } = await params;
  const event = eventBySlugOr404(slug);
  return { title: `Schedule itinerary · ${event.name}` };
}

export default async function ItineraryPage({
  params,
  searchParams,
}: PageProps<"/e/[slug]/itinerary">) {
  const { slug } = await params;
  const sp = await searchParams;
  const event = eventBySlugOr404(slug);

  const q = typeof sp.q === "string" ? sp.q : "";
  const trackId = typeof sp.track === "string" ? sp.track : "";
  const tracks = listLookup("tracks", event.id);

  const all = publicSessions(event.id).filter((s) => s.pub_starts_at);
  const scheduleDays = Array.from(
    new Set(all.map((s) => dateOf(s.pub_starts_at)).filter(Boolean) as string[]),
  ).sort();
  const days = scheduleDays.length ? scheduleDays : daysBetween(event.starts_at, event.ends_at);
  const day = typeof sp.day === "string" && days.includes(sp.day) ? sp.day : days[0];

  const sessions = publicSessions(event.id, { q, trackId })
    .filter((s) => s.pub_starts_at && dateOf(s.pub_starts_at) === day)
    .sort((a, b) => (a.pub_starts_at ?? "").localeCompare(b.pub_starts_at ?? ""));
  const speakerMap = speakersForSubmissions(sessions.map((s) => s.id));

  const groups = new Map<string, typeof sessions>();
  for (const session of sessions) {
    const key = formatTime(session.pub_starts_at);
    groups.set(key, [...(groups.get(key) ?? []), session]);
  }

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Schedule itinerary
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Every session in time order, day by day. Star the ones you want and they will appear in{" "}
            <Link href={`/e/${event.slug}/my-schedule`} className="font-medium text-brand-700 hover:underline">
              My Schedule
            </Link>
            .
          </p>
        </div>
        <LinkButton href={`/e/${event.slug}/my-schedule`} size="sm" variant="primary">
          My schedule
        </LinkButton>
      </div>

      <DayTabs days={days} current={day} hrefFor={(d) => `/e/${event.slug}/itinerary?day=${d}`} />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <SearchBox
          param="q"
          label="Search the itinerary"
          placeholder="Search sessions or speakers…"
          className="w-full sm:w-72"
        />
        <FilterSelect
          param="track"
          label="Track"
          allLabel="All tracks"
          options={tracks.map((t) => ({ value: t.id, label: t.name }))}
        />
        {q || trackId ? (
          <LinkButton href={`/e/${event.slug}/itinerary?day=${day}`} size="sm">
            Clear
          </LinkButton>
        ) : null}
        <p className="text-sm text-slate-500" role="status">
          {sessions.length} {sessions.length === 1 ? "session" : "sessions"} on{" "}
          {formatDate(day, { weekday: true })}
        </p>
      </div>

      {sessions.length ? (
        <div className="space-y-6">
          {[...groups.entries()].map(([time, items]) => (
            <section key={time}>
              <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-500">
                <span className="font-mono">{time}</span>
                <span className="h-px flex-1 bg-slate-200" />
              </h2>
              <div className="space-y-3">
                {items.map((session) => (
                  <article
                    key={session.id}
                    className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        {session.track_name ? (
                          <Chip color={session.track_color}>{session.track_name}</Chip>
                        ) : null}
                        <h3 className="mt-1.5 text-base font-semibold text-slate-900">
                          <Link
                            href={`/e/${event.slug}/sessions/${session.id}`}
                            className="hover:text-brand-700"
                          >
                            {session.title}
                          </Link>
                        </h3>
                        <p className="mt-0.5 text-sm text-slate-500">
                          {formatRange(session.pub_starts_at, session.pub_ends_at)}
                          {session.room_name ? ` · ${session.room_name}` : ""}
                        </p>
                        {session.description ? (
                          <ShowMore
                            text={stripHtml(session.description)}
                            limit={180}
                            className="mt-2 text-sm text-slate-600"
                          />
                        ) : null}
                        <SpeakerLine speakers={speakerMap.get(session.id) ?? []} />
                        <div className="mt-3 flex flex-wrap gap-1.5 text-xs text-slate-500">
                          {session.format_name ? (
                            <span>
                              <strong className="font-medium text-slate-700">Format:</strong>{" "}
                              {session.format_name}
                            </span>
                          ) : null}
                          {session.track_name ? (
                            <span>
                              · <strong className="font-medium text-slate-700">Track:</strong>{" "}
                              {session.track_name}
                            </span>
                          ) : null}
                        </div>
                      </div>
                      <StarButton slug={event.slug} sessionId={session.id} title={session.title} />
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No sessions on this day match"
          description="Try another day or clear the filters."
          action={<LinkButton href={`/e/${event.slug}/itinerary`}>Clear filters</LinkButton>}
        />
      )}
    </div>
  );
}
