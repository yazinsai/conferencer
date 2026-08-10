import { getEventBySlug } from "@/lib/repo/events";
import { publicSessions } from "@/lib/repo/submissions";
import { buildIcs } from "@/lib/ics";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const event = getEventBySlug(slug);
  if (!event) return new Response("Not found", { status: 404 });

  const url = new URL(request.url);
  const ids = (url.searchParams.get("ids") ?? "").split(",").filter(Boolean);
  const sessions = publicSessions(event.id).filter(
    (s) => s.pub_starts_at && (ids.length === 0 || ids.includes(s.id)),
  );

  const ics = buildIcs(
    sessions.map((s) => ({
      uid: `${s.id}@conferencer`,
      title: s.title,
      description: s.description,
      location: s.room_name ?? event.location,
      start: s.pub_starts_at,
      end: s.pub_ends_at,
      url: `${url.origin}/e/${event.slug}/sessions/${s.id}`,
    })),
    { calendarName: `${event.name} — my schedule`, timezone: event.timezone },
  );

  return new Response(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="${event.slug}-my-schedule.ics"`,
    },
  });
}
