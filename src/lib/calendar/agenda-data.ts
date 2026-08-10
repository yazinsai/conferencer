import { and, asc, eq, isNotNull, isNull } from "drizzle-orm";
import { getDb, schema } from "@/lib/db";
import {
  detectConflicts,
  hasRoomConflict,
  type TimedSession,
} from "@/lib/domain/conflicts";

export type AgendaSubmission = {
  id: string;
  title: string;
  status: string;
  startsAt: string | null;
  endsAt: string | null;
  locationId: string | null;
  trackName: string | null;
  formatName: string | null;
  roomName: string | null;
  participantContactIds: string[];
  participantNames: string[];
};

export function loadAgendaSubmissions(eventId: string): AgendaSubmission[] {
  const db = getDb();
  const rows = db
    .select({
      id: schema.submissions.id,
      title: schema.submissions.title,
      status: schema.submissions.status,
      startsAt: schema.submissions.startsAt,
      endsAt: schema.submissions.endsAt,
      locationId: schema.submissions.locationId,
      trackName: schema.tracks.name,
      formatName: schema.formats.name,
      roomName: schema.rooms.name,
    })
    .from(schema.submissions)
    .leftJoin(schema.tracks, eq(schema.submissions.trackId, schema.tracks.id))
    .leftJoin(schema.formats, eq(schema.submissions.formatId, schema.formats.id))
    .leftJoin(schema.rooms, eq(schema.submissions.locationId, schema.rooms.id))
    .where(
      and(
        eq(schema.submissions.eventId, eventId),
        eq(schema.submissions.status, "accepted"),
      ),
    )
    .orderBy(asc(schema.submissions.title))
    .all();

  return rows.map((row) => {
    const participants = db
      .select({
        contactId: schema.submissionParticipants.contactId,
        firstName: schema.contacts.firstName,
        lastName: schema.contacts.lastName,
      })
      .from(schema.submissionParticipants)
      .innerJoin(
        schema.contacts,
        eq(schema.submissionParticipants.contactId, schema.contacts.id),
      )
      .where(eq(schema.submissionParticipants.submissionId, row.id))
      .orderBy(asc(schema.submissionParticipants.sortOrder))
      .all();

    return {
      ...row,
      participantContactIds: participants.map((p) => p.contactId),
      participantNames: participants.map((p) => `${p.firstName} ${p.lastName}`),
    };
  });
}

export function loadUnscheduledSubmissions(eventId: string) {
  return loadAgendaSubmissions(eventId).filter((s) => !s.startsAt);
}

export function loadScheduledSubmissions(eventId: string) {
  return loadAgendaSubmissions(eventId).filter((s) => s.startsAt && s.endsAt);
}

export function toTimedSessions(submissions: AgendaSubmission[]): TimedSession[] {
  return submissions.map((s) => ({
    id: s.id,
    title: s.title,
    startsAt: s.startsAt,
    endsAt: s.endsAt,
    locationId: s.locationId,
    participantContactIds: s.participantContactIds,
  }));
}

export function getAgendaConflicts(eventId: string) {
  const scheduled = loadScheduledSubmissions(eventId);
  return detectConflicts(toTimedSessions(scheduled));
}

export function countScheduledSessions(eventId: string) {
  const db = getDb();
  const row = db
    .select({ c: schema.submissions.id })
    .from(schema.submissions)
    .where(
      and(
        eq(schema.submissions.eventId, eventId),
        eq(schema.submissions.status, "accepted"),
        isNotNull(schema.submissions.startsAt),
      ),
    )
    .all();
  return row.length;
}

export function countUnscheduledSessions(eventId: string) {
  const db = getDb();
  const row = db
    .select({ c: schema.submissions.id })
    .from(schema.submissions)
    .where(
      and(
        eq(schema.submissions.eventId, eventId),
        eq(schema.submissions.status, "accepted"),
        isNull(schema.submissions.startsAt),
      ),
    )
    .all();
  return row.length;
}

export function checkRoomConflictForCandidate(
  eventId: string,
  candidate: TimedSession,
) {
  const others = loadScheduledSubmissions(eventId).filter((s) => s.id !== candidate.id);
  return hasRoomConflict(toTimedSessions(others), candidate);
}

export function speakerConflictsForCandidate(
  eventId: string,
  candidate: TimedSession,
) {
  const sessions = toTimedSessions(loadScheduledSubmissions(eventId)).filter(
    (s) => s.id !== candidate.id,
  );
  sessions.push(candidate);
  return detectConflicts(sessions).filter((c) => c.type === "speaker");
}
