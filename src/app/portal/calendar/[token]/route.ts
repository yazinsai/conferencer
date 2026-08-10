import { and, eq, isNotNull } from "drizzle-orm";
import { getDb, schema } from "@/lib/db";
import { buildCalendarFeed } from "@/lib/calendar/ics";

export async function GET(
  _request: Request,
  context: { params: Promise<{ token: string }> },
) {
  const { token: rawToken } = await context.params;
  // Support `/portal/calendar/:token.ics` (R-COM-5) — strip trailing extension.
  const token = rawToken.replace(/\.ics$/i, "");
  const db = getDb();

  const contact = db
    .select()
    .from(schema.contacts)
    .where(eq(schema.contacts.calendarToken, token))
    .get();

  if (!contact) {
    return new Response("Not found", { status: 404 });
  }

  const rows = db
    .select({
      submissionId: schema.submissions.id,
      title: schema.submissions.title,
      startsAt: schema.submissions.startsAt,
      endsAt: schema.submissions.endsAt,
      eventId: schema.events.id,
      eventName: schema.events.name,
      eventLocation: schema.events.location,
      roomName: schema.rooms.name,
    })
    .from(schema.submissionParticipants)
    .innerJoin(
      schema.submissions,
      eq(schema.submissionParticipants.submissionId, schema.submissions.id),
    )
    .innerJoin(schema.events, eq(schema.submissions.eventId, schema.events.id))
    .leftJoin(schema.rooms, eq(schema.submissions.locationId, schema.rooms.id))
    .where(
      and(
        eq(schema.submissionParticipants.contactId, contact.id),
        eq(schema.submissions.status, "accepted"),
        isNotNull(schema.submissions.startsAt),
        isNotNull(schema.submissions.endsAt),
      ),
    )
    .all();

  const icsEvents = rows
    .filter((r) => r.startsAt && r.endsAt)
    .map((r) => ({
      uid: `${r.submissionId}@${r.eventId}@conferencer`,
      summary: r.title,
      description: `Speaking at ${r.eventName}`,
      location: [r.roomName, r.eventLocation].filter(Boolean).join(", ") || undefined,
      startsAt: r.startsAt!,
      endsAt: r.endsAt!,
    }));

  const feedName = `${contact.firstName} ${contact.lastName} — Conferencer`;
  const body = buildCalendarFeed(icsEvents, { name: feedName });

  return new Response(body, {
    status: 200,
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="conferencer-${token.slice(0, 8)}.ics"`,
      "Cache-Control": "private, max-age=300",
    },
  });
}
