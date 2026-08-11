import Link from "next/link";

import { eventBySlugOr404 } from "@/lib/guards";
import { publicSessionsForSpeaker, publicSpeakers } from "@/lib/repo/submissions";
import { SearchBox, ShowMore } from "@/components/client/basics";
import { Avatar, Chip, EmptyState, LinkButton } from "@/components/ui";
import { formatRange } from "@/lib/datetime";
import { stripHtml } from "@/lib/fields";
import { PublicPage } from "@/components/public/pieces";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps<"/e/[slug]/gallery">) {
  const { slug } = await params;
  const event = eventBySlugOr404(slug);
  return { title: `Speaker gallery · ${event.name}` };
}

export default async function GalleryPage({
  params,
  searchParams,
}: PageProps<"/e/[slug]/gallery">) {
  const { slug } = await params;
  const sp = await searchParams;
  const event = eventBySlugOr404(slug);
  const q = typeof sp.q === "string" ? sp.q : "";
  const openId = typeof sp.speaker === "string" ? sp.speaker : null;

  const total = publicSpeakers(event.id).length;
  const speakers = publicSpeakers(event.id, q);
  const open = openId ? speakers.find((s) => s.id === openId) ?? null : null;
  const openSessions = open ? publicSessionsForSpeaker(event.id, open.id) : [];

  const backHref = `/e/${event.slug}/gallery${q ? `?q=${encodeURIComponent(q)}` : ""}`;

  return (
    <PublicPage>
      <div className="mb-5">
        <h1 className="display text-2xl text-ink sm:text-3xl">Speaker gallery</h1>
        <p className="mt-1 text-sm text-neutral">
          The faces of {event.name}. Click a speaker for their bio and sessions.
        </p>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <SearchBox
          param="q"
          label="Search speakers by name"
          placeholder="Search by name…"
          className="w-full sm:w-72"
        />
        {q ? <LinkButton href={`/e/${event.slug}/gallery`} size="sm">Clear</LinkButton> : null}
        <p className="text-sm text-muted-foreground" role="status">
          Showing <strong className="text-ink">{speakers.length}</strong> of {total} speakers
        </p>
      </div>

      {open ? (
        <div
          role="dialog"
          aria-modal="false"
          aria-label={`${open.first_name} ${open.last_name}`}
          className="mb-6 rounded-card border border-rule-2 bg-paper p-5 shadow-[var(--shadow-card)]"
        >
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex flex-wrap gap-4">
              <Avatar
                src={open.headshot_url}
                name={`${open.first_name} ${open.last_name}`}
                size={112}
              />
              <div className="max-w-xl">
                <h2 className="text-xl font-semibold text-ink">
                  {open.first_name} {open.last_name}
                </h2>
                <p className="text-sm text-neutral">
                  {[open.job_title, open.company].filter(Boolean).join(", ") || "Speaker"}
                </p>
                {open.biography ? (
                  <ShowMore
                    text={stripHtml(open.biography)}
                    limit={240}
                    className="mt-3 text-sm text-neutral"
                  />
                ) : null}
                <h3 className="mt-4 text-sm font-semibold text-ink">
                  Sessions ({openSessions.length})
                </h3>
                <ul className="mt-2 space-y-2">
                  {openSessions.map((session) => (
                    <li key={session.id} className="text-sm">
                      <Link
                        href={`/e/${event.slug}/sessions/${session.id}`}
                        className="font-medium text-ink hover:text-signal"
                      >
                        {session.title}
                      </Link>
                      <span className="block text-muted-foreground">
                        {session.pub_starts_at
                          ? formatRange(session.pub_starts_at, session.pub_ends_at)
                          : "Time to be announced"}
                        {session.room_name ? ` · ${session.room_name}` : ""}
                      </span>
                      {session.track_name ? (
                        <Chip color={session.track_color} className="mt-1">
                          {session.track_name}
                        </Chip>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <Link
              href={backHref}
              className="rounded-md border border-rule-2 px-2.5 py-1.5 text-xs font-medium text-neutral hover:bg-paper-2"
            >
              Close
            </Link>
          </div>
        </div>
      ) : null}

      {speakers.length ? (
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {speakers.map((speaker) => (
            <li key={speaker.id}>
              <Link
                href={`/e/${event.slug}/gallery?${q ? `q=${encodeURIComponent(q)}&` : ""}speaker=${speaker.id}`}
                className="group block rounded-card border border-rule bg-paper p-4 text-center shadow-sm transition-shadow hover:shadow-md"
              >
                <Avatar
                  src={speaker.headshot_url}
                  name={`${speaker.first_name} ${speaker.last_name}`}
                  size={104}
                  className="mx-auto"
                />
                <p className="mt-3 font-semibold text-ink group-hover:text-signal">
                  {speaker.first_name} {speaker.last_name}
                </p>
                <p className="mt-0.5 text-xs text-neutral">
                  {speaker.job_title || <span className="text-muted-foreground">Speaker</span>}
                </p>
                {speaker.company ? (
                  <p className="text-xs text-muted-foreground">{speaker.company}</p>
                ) : null}
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState
          title="No speakers match that search"
          description="Try a different name."
          action={<LinkButton href={`/e/${event.slug}/gallery`}>Clear search</LinkButton>}
        />
      )}
    </PublicPage>
  );
}
