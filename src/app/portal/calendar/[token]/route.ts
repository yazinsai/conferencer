import { getContact } from "@/lib/repo/contacts";
import { defaultEvent } from "@/lib/repo/events";
import { publicSessionsForSpeaker, submissionsForContact } from "@/lib/repo/submissions";
import { buildIcs } from "@/lib/ics";

export const dynamic = "force-dynamic";

/**
 * Per-speaker subscribable feed (R-COM-5). Calendar clients cannot sign in, so
 * the unguessable contact id is the capability — it exposes only that speaker's
 * own sessions.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  const contactId = token.replace(/\.ics$/, "");
  const contact = getContact(contactId);
  const event = defaultEvent();
  if (!contact || !event) return new Response("Not found", { status: 404 });

  const url = new URL(request.url);
  const published = publicSessionsForSpeaker(event.id, contact.id);
  const mine = submissionsForContact(event.id, contact.id).filter(
    (s) => s.status === "accepted" && s.starts_at,
  );

  const seen = new Set<string>();
  const events = [...published, ...mine]
    .filter((session) => {
      if (seen.has(session.id)) return false;
      seen.add(session.id);
      return true;
    })
    .map((session) => ({
      uid: `${session.id}@conferencer`,
      title: session.title,
      description: session.description,
      location: session.room_name ?? event.location,
      start: session.pub_starts_at ?? session.starts_at,
      end: session.pub_ends_at ?? session.ends_at,
      sequence: session.ics_sequence,
      url: `${url.origin}/e/${event.slug}/sessions/${session.id}`,
    }))
    .filter((entry) => entry.start);

  const ics = buildIcs(events, {
    calendarName: `${event.name} — ${contact.first_name} ${contact.last_name}`,
    timezone: event.timezone,
  });

  return new Response(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `inline; filename="${event.slug}-${contact.last_name.toLowerCase()}.ics"`,
      "Cache-Control": "public, max-age=300",
    },
  });
}
