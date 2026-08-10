import { and, asc, eq, inArray } from "drizzle-orm";
import { getEventBySlug } from "@/lib/auth/guards";
import { getDb, schema } from "@/lib/db";

export type PublicTrack = { id: string; name: string; color: string };
export type PublicFormat = { id: string; name: string; color: string };
export type PublicRoom = { id: string; name: string; color: string };

export type PublicSpeaker = {
  id: string;
  firstName: string;
  lastName: string;
  jobTitle: string | null;
  company: string | null;
  biography: string | null;
  headshotUrl: string | null;
  role: string;
  sortOrder: number;
};

export type PublicSession = {
  id: string;
  title: string;
  description: string | null;
  kind: string;
  track: PublicTrack | null;
  format: PublicFormat | null;
  room: PublicRoom | null;
  startsAt: string | null;
  endsAt: string | null;
  schedulePublished: boolean;
  speakers: PublicSpeaker[];
};

export type PublicSessionRef = Pick<
  PublicSession,
  "id" | "title" | "startsAt" | "endsAt" | "room" | "track" | "format" | "schedulePublished"
>;

export type PublicSpeakerWithSessions = PublicSpeaker & {
  sessions: PublicSessionRef[];
};

export type PublicProgram = {
  event: NonNullable<Awaited<ReturnType<typeof getEventBySlug>>>;
  sessions: PublicSession[];
  agendaPublished: boolean;
};

function mapTrack(row: typeof schema.tracks.$inferSelect | null): PublicTrack | null {
  if (!row) return null;
  return { id: row.id, name: row.name, color: row.color };
}

function mapFormat(row: typeof schema.formats.$inferSelect | null): PublicFormat | null {
  if (!row) return null;
  return { id: row.id, name: row.name, color: row.color };
}

function mapRoom(row: typeof schema.rooms.$inferSelect | null): PublicRoom | null {
  if (!row) return null;
  return { id: row.id, name: row.name, color: row.color };
}

export async function getPublicSessions(slug: string): Promise<PublicProgram | null> {
  const event = await getEventBySlug(slug);
  if (!event) return null;

  const db = getDb();
  const agendaPublished = event.agendaPublishedAt != null;

  const rows = db
    .select({
      submission: schema.submissions,
      track: schema.tracks,
      format: schema.formats,
      room: schema.rooms,
    })
    .from(schema.submissions)
    .leftJoin(schema.tracks, eq(schema.submissions.trackId, schema.tracks.id))
    .leftJoin(schema.formats, eq(schema.submissions.formatId, schema.formats.id))
    .leftJoin(schema.rooms, eq(schema.submissions.locationId, schema.rooms.id))
    .where(
      and(
        eq(schema.submissions.eventId, event.id),
        eq(schema.submissions.status, "accepted"),
        eq(schema.submissions.approvalStatus, "approved"),
      ),
    )
    .orderBy(asc(schema.submissions.startsAt), asc(schema.submissions.title))
    .all();

  const submissionIds = rows.map((r) => r.submission.id);
  const participantsBySubmission = new Map<string, PublicSpeaker[]>();

  if (submissionIds.length > 0) {
    const participants = db
      .select({
        submissionId: schema.submissionParticipants.submissionId,
        role: schema.submissionParticipants.role,
        sortOrder: schema.submissionParticipants.sortOrder,
        contact: schema.contacts,
      })
      .from(schema.submissionParticipants)
      .innerJoin(
        schema.contacts,
        eq(schema.submissionParticipants.contactId, schema.contacts.id),
      )
      .where(inArray(schema.submissionParticipants.submissionId, submissionIds))
      .orderBy(asc(schema.submissionParticipants.sortOrder))
      .all();

    for (const p of participants) {
      const speaker: PublicSpeaker = {
        id: p.contact.id,
        firstName: p.contact.firstName,
        lastName: p.contact.lastName,
        jobTitle: p.contact.jobTitle,
        company: p.contact.company,
        biography: p.contact.biography,
        headshotUrl: p.contact.headshotUrl,
        role: p.role,
        sortOrder: p.sortOrder,
      };
      const list = participantsBySubmission.get(p.submissionId) ?? [];
      list.push(speaker);
      participantsBySubmission.set(p.submissionId, list);
    }
  }

  const sessions: PublicSession[] = rows.map((row) => ({
    id: row.submission.id,
    title: row.submission.title,
    description: row.submission.description,
    kind: row.submission.kind,
    track: mapTrack(row.track),
    format: mapFormat(row.format),
    room: agendaPublished ? mapRoom(row.room) : null,
    startsAt: agendaPublished ? row.submission.startsAt : null,
    endsAt: agendaPublished ? row.submission.endsAt : null,
    schedulePublished: agendaPublished,
    speakers: participantsBySubmission.get(row.submission.id) ?? [],
  }));

  return { event, sessions, agendaPublished };
}

export async function getPublicSpeakers(slug: string): Promise<{
  event: NonNullable<Awaited<ReturnType<typeof getEventBySlug>>>;
  speakers: PublicSpeakerWithSessions[];
  agendaPublished: boolean;
} | null> {
  const program = await getPublicSessions(slug);
  if (!program) return null;

  const speakerMap = new Map<string, PublicSpeakerWithSessions>();

  for (const session of program.sessions) {
    const sessionRef: PublicSessionRef = {
      id: session.id,
      title: session.title,
      startsAt: session.startsAt,
      endsAt: session.endsAt,
      room: session.room,
      track: session.track,
      format: session.format,
      schedulePublished: session.schedulePublished,
    };

    for (const speaker of session.speakers) {
      const existing = speakerMap.get(speaker.id);
      if (existing) {
        existing.sessions.push(sessionRef);
        if (!existing.biography && speaker.biography) {
          existing.biography = speaker.biography;
        }
        if (!existing.headshotUrl && speaker.headshotUrl) {
          existing.headshotUrl = speaker.headshotUrl;
        }
        if (!existing.jobTitle && speaker.jobTitle) {
          existing.jobTitle = speaker.jobTitle;
        }
        if (!existing.company && speaker.company) {
          existing.company = speaker.company;
        }
      } else {
        speakerMap.set(speaker.id, {
          ...speaker,
          sessions: [sessionRef],
        });
      }
    }
  }

  const speakers = Array.from(speakerMap.values()).sort(
    (a, b) =>
      a.lastName.localeCompare(b.lastName, undefined, { sensitivity: "base" }) ||
      a.firstName.localeCompare(b.firstName, undefined, { sensitivity: "base" }),
  );

  for (const speaker of speakers) {
    speaker.sessions.sort((a, b) => {
      if (a.startsAt && b.startsAt) return a.startsAt.localeCompare(b.startsAt);
      if (a.startsAt) return -1;
      if (b.startsAt) return 1;
      return a.title.localeCompare(b.title);
    });
  }

  return {
    event: program.event,
    speakers,
    agendaPublished: program.agendaPublished,
  };
}

export async function getPublicSpeaker(
  slug: string,
  contactId: string,
): Promise<{
  event: NonNullable<Awaited<ReturnType<typeof getEventBySlug>>>;
  speaker: PublicSpeakerWithSessions;
  agendaPublished: boolean;
} | null> {
  const data = await getPublicSpeakers(slug);
  if (!data) return null;
  const speaker = data.speakers.find((s) => s.id === contactId);
  if (!speaker) return null;
  return { event: data.event, speaker, agendaPublished: data.agendaPublished };
}
