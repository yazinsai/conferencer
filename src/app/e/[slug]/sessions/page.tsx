import { eventBySlugOr404 } from "@/lib/guards";
import { listLookup } from "@/lib/repo/events";
import { publicSessions, speakersForSubmissions } from "@/lib/repo/submissions";
import { PublicPage, SessionCard } from "@/components/public/pieces";
import { FilterSelect, SearchBox } from "@/components/client/basics";
import { EmptyState, LinkButton } from "@/components/ui";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps<"/e/[slug]/sessions">) {
  const { slug } = await params;
  const event = eventBySlugOr404(slug);
  return { title: `Sessions · ${event.name}` };
}

export default async function SessionsPage({
  params,
  searchParams,
}: PageProps<"/e/[slug]/sessions">) {
  const { slug } = await params;
  const sp = await searchParams;
  const event = eventBySlugOr404(slug);

  const q = typeof sp.q === "string" ? sp.q : "";
  const trackId = typeof sp.track === "string" ? sp.track : "";
  const formatId = typeof sp.format === "string" ? sp.format : "";
  const roomId = typeof sp.room === "string" ? sp.room : "";

  const tracks = listLookup("tracks", event.id);
  const formats = listLookup("formats", event.id);
  const rooms = listLookup("rooms", event.id);

  const total = publicSessions(event.id).length;
  const sessions = publicSessions(event.id, { q, trackId, formatId, roomId });
  const speakers = speakersForSubmissions(sessions.map((s) => s.id));
  const filtered = Boolean(q || trackId || formatId || roomId);

  return (
    <PublicPage>
      <div className="mb-5">
        <h1 className="display text-2xl text-ink sm:text-3xl">Sessions</h1>
        <p className="mt-1 text-sm text-neutral">
          The full programme for {event.name}. Search by session title or speaker name.
        </p>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <SearchBox
          param="q"
          label="Search sessions"
          placeholder="Search sessions or speakers…"
          className="w-full sm:w-80"
        />
        <div className="flex flex-wrap items-center gap-3" aria-label="Filters">
          <FilterSelect
            param="track"
            label="Track"
            allLabel="All tracks"
            options={tracks.map((t) => ({ value: t.id, label: t.name }))}
          />
          <FilterSelect
            param="format"
            label="Format"
            allLabel="All formats"
            options={formats.map((f) => ({ value: f.id, label: f.name }))}
          />
          <FilterSelect
            param="room"
            label="Location"
            allLabel="All rooms"
            options={rooms.map((r) => ({ value: r.id, label: r.name }))}
          />
          {filtered ? (
            <LinkButton href={`/e/${event.slug}/sessions`} size="sm">
              Clear
            </LinkButton>
          ) : null}
        </div>
      </div>

      <p className="mb-3 text-sm text-muted-foreground" role="status">
        Showing <strong className="text-ink">{sessions.length}</strong> of {total} sessions
      </p>

      {sessions.length ? (
        <div className="grid gap-4 md:grid-cols-2">
          {sessions.map((session) => (
            <SessionCard
              key={session.id}
              session={session}
              speakers={speakers.get(session.id) ?? []}
              href={`/e/${event.slug}/sessions/${session.id}`}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No sessions match those filters"
          description="Try a different search term, or clear the filters to see the whole programme."
          action={<LinkButton href={`/e/${event.slug}/sessions`}>Clear filters</LinkButton>}
        />
      )}
    </PublicPage>
  );
}
