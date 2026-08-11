import Link from "next/link";

import { eventBySlugOr404 } from "@/lib/guards";
import { listLookup } from "@/lib/repo/events";
import { publicSessions, speakersForSubmissions } from "@/lib/repo/submissions";
import { AgendaGrid, type GridBlock } from "@/components/public/agenda-grid";
import { DayTabs, PublicPage } from "@/components/public/pieces";
import { Card, Chip, EmptyState, LinkButton } from "@/components/ui";
import { dateOf, daysBetween, formatRange } from "@/lib/datetime";
import { stripHtml } from "@/lib/fields";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps<"/e/[slug]/agenda">) {
  const { slug } = await params;
  const event = eventBySlugOr404(slug);
  return { title: `Agenda · ${event.name}` };
}

export default async function AgendaPage({ params, searchParams }: PageProps<"/e/[slug]/agenda">) {
  const { slug } = await params;
  const sp = await searchParams;
  const event = eventBySlugOr404(slug);

  const sessions = publicSessions(event.id).filter((s) => s.pub_starts_at);
  const scheduleDays = Array.from(
    new Set(sessions.map((s) => dateOf(s.pub_starts_at)).filter(Boolean) as string[]),
  ).sort();
  const days = scheduleDays.length
    ? scheduleDays
    : daysBetween(event.starts_at, event.ends_at);
  const day = typeof sp.day === "string" && days.includes(sp.day) ? sp.day : days[0];
  const selectedId = typeof sp.session === "string" ? sp.session : null;

  const rooms = listLookup("rooms", event.id);
  const dayySessions = sessions.filter((s) => dateOf(s.pub_starts_at) === day);
  const speakerMap = speakersForSubmissions(dayySessions.map((s) => s.id));

  const blocks: GridBlock[] = dayySessions.map((s) => ({
    id: s.id,
    title: s.title,
    roomId: s.pub_room_id ?? s.location_id,
    startsAt: s.pub_starts_at,
    endsAt: s.pub_ends_at,
    trackName: s.track_name,
    trackColor: s.track_color,
    formatName: s.format_name,
    speakers: (speakerMap.get(s.id) ?? []).map((p) => `${p.first_name} ${p.last_name}`).join(", "),
    href: `/e/${event.slug}/agenda?day=${day}&session=${s.id}`,
  }));

  const selected = selectedId ? sessions.find((s) => s.id === selectedId) : null;
  const usedRooms = rooms.filter((room) => blocks.some((b) => b.roomId === room.id));
  const gridRooms = usedRooms.length ? usedRooms : rooms;

  return (
    <PublicPage>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="display text-2xl text-ink sm:text-3xl">Agenda</h1>
          <p className="mt-1 text-sm text-neutral">
            Room-by-room schedule for {event.name}. Pick a day, then a session for details.
          </p>
        </div>
        <LinkButton href={`/e/${event.slug}/itinerary`} size="sm">
          Itinerary view
        </LinkButton>
      </div>

      {days.length ? (
        <DayTabs
          days={days}
          current={day}
          hrefFor={(d) => `/e/${event.slug}/agenda?day=${d}`}
        />
      ) : null}

      {selected ? (
        <Card className="mb-4 border-rule-2 p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="display text-lg text-ink">{selected.title}</h2>
              <p className="mt-0.5 text-sm text-neutral">
                {formatRange(selected.pub_starts_at, selected.pub_ends_at)}
                {selected.room_name ? ` · ${selected.room_name}` : ""}
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {selected.track_name ? (
                  <Chip color={selected.track_color}>{selected.track_name}</Chip>
                ) : null}
                {selected.format_name ? <Chip tone="slate">{selected.format_name}</Chip> : null}
                {selected.speakers ? <Chip tone="blue">{selected.speakers}</Chip> : null}
              </div>
              {selected.description ? (
                <p className="mt-3 max-w-2xl text-sm text-neutral">
                  {stripHtml(selected.description)}
                </p>
              ) : null}
              <Link
                href={`/e/${event.slug}/sessions/${selected.id}`}
                className="mt-3 inline-block text-sm font-medium text-signal hover:underline"
              >
                Full session page →
              </Link>
            </div>
            <Link
              href={`/e/${event.slug}/agenda?day=${day}`}
              className="rounded-md border border-rule-2 px-2.5 py-1.5 text-xs font-medium text-neutral hover:bg-paper-2"
            >
              Close
            </Link>
          </div>
        </Card>
      ) : null}

      {blocks.length ? (
        <AgendaGrid rooms={gridRooms} blocks={blocks} />
      ) : (
        <EmptyState
          title="Nothing scheduled on this day yet"
          description="The programme team is still placing sessions. Check the sessions list in the meantime."
          action={<LinkButton href={`/e/${event.slug}/sessions`}>Browse sessions</LinkButton>}
        />
      )}
    </PublicPage>
  );
}
