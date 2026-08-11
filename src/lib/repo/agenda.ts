import { all, get, run } from "../db";
import { id } from "../ids";
import { dateOf, nowIso, overlaps } from "../datetime";
import { listParticipants, type SubmissionRow } from "./submissions";

export type Conflict = {
  kind: "speaker" | "room";
  message: string;
  submissionIds: string[];
  detail: string;
};

type Scheduled = Pick<
  SubmissionRow,
  "id" | "title" | "starts_at" | "ends_at" | "location_id" | "room_name"
>;

/**
 * Speaker double-bookings are advisory (sometimes intentional), room clashes are
 * hard errors (never intentional) — Appendix B #6.
 */
export function findConflicts(sessions: Scheduled[]): Conflict[] {
  const conflicts: Conflict[] = [];
  const speakerCache = new Map<string, Array<{ id: string; name: string }>>();
  const speakersOf = (submissionId: string) => {
    if (!speakerCache.has(submissionId)) {
      speakerCache.set(
        submissionId,
        listParticipants(submissionId)
          .filter((p) => p.role !== "submitter")
          .map((p) => ({ id: p.contact_id, name: `${p.first_name} ${p.last_name}` })),
      );
    }
    return speakerCache.get(submissionId)!;
  };

  for (let i = 0; i < sessions.length; i += 1) {
    for (let j = i + 1; j < sessions.length; j += 1) {
      const a = sessions[i];
      const b = sessions[j];
      if (!a.starts_at || !b.starts_at) continue;
      if (!overlaps(a.starts_at, a.ends_at, b.starts_at, b.ends_at)) continue;

      if (a.location_id && a.location_id === b.location_id) {
        conflicts.push({
          kind: "room",
          message: `Room clash in ${a.room_name ?? "the same room"}`,
          submissionIds: [a.id, b.id],
          detail: `“${a.title}” and “${b.title}” overlap in ${a.room_name ?? "the same room"}.`,
        });
      }

      const shared = speakersOf(a.id).filter((sa) =>
        speakersOf(b.id).some((sb) => sb.id === sa.id),
      );
      for (const speaker of shared) {
        conflicts.push({
          kind: "speaker",
          message: `${speaker.name} is double-booked`,
          submissionIds: [a.id, b.id],
          detail: `${speaker.name} is scheduled for “${a.title}” and “${b.title}” at the same time.`,
        });
      }
    }
  }
  return conflicts;
}

export function scheduledSessions(eventId: string): SubmissionRow[] {
  return all<SubmissionRow>(
    `SELECT s.*, t.name AS track_name, t.color AS track_color, f.name AS format_name,
            r.name AS room_name, NULL AS submitter_name,
            (SELECT GROUP_CONCAT(c.first_name || ' ' || c.last_name, ', ')
               FROM submission_participants sp JOIN contacts c ON c.id = sp.contact_id
              WHERE sp.submission_id = s.id AND sp.role != 'submitter') AS speakers,
            NULL AS avg_score, 0 AS review_count, 0 AS file_count
       FROM submissions s
       LEFT JOIN tracks t ON t.id = s.track_id
       LEFT JOIN formats f ON f.id = s.format_id
       LEFT JOIN rooms r ON r.id = s.location_id
      WHERE s.event_id = ? AND s.status = 'accepted' AND s.starts_at IS NOT NULL
      ORDER BY s.starts_at, r.sort_order`,
    eventId,
  );
}

export function unscheduledSessions(eventId: string): SubmissionRow[] {
  return all<SubmissionRow>(
    `SELECT s.*, t.name AS track_name, t.color AS track_color, f.name AS format_name,
            NULL AS room_name, NULL AS submitter_name,
            (SELECT GROUP_CONCAT(c.first_name || ' ' || c.last_name, ', ')
               FROM submission_participants sp JOIN contacts c ON c.id = sp.contact_id
              WHERE sp.submission_id = s.id AND sp.role != 'submitter') AS speakers,
            NULL AS avg_score, 0 AS review_count, 0 AS file_count
       FROM submissions s
       LEFT JOIN tracks t ON t.id = s.track_id
       LEFT JOIN formats f ON f.id = s.format_id
      WHERE s.event_id = ? AND s.status = 'accepted' AND s.starts_at IS NULL
      ORDER BY s.created_at`,
    eventId,
  );
}

export type PublishChange = {
  submissionId: string;
  title: string;
  before: string;
  after: string;
};

/** Copies the working schedule into the published snapshot (R-AGN-8). */
export function publishAgenda(eventId: string, actorUserId: string | null) {
  const sessions = all<{
    id: string;
    title: string;
    starts_at: string | null;
    ends_at: string | null;
    location_id: string | null;
    pub_starts_at: string | null;
    pub_ends_at: string | null;
    pub_room_id: string | null;
    room_name: string | null;
    pub_room_name: string | null;
  }>(
    `SELECT s.id, s.title, s.starts_at, s.ends_at, s.location_id,
            s.pub_starts_at, s.pub_ends_at, s.pub_room_id,
            (SELECT name FROM rooms WHERE id = s.location_id) AS room_name,
            (SELECT name FROM rooms WHERE id = s.pub_room_id) AS pub_room_name
       FROM submissions s
      WHERE s.event_id = ? AND s.status = 'accepted'`,
    eventId,
  );

  const changes: PublishChange[] = [];
  for (const session of sessions) {
    const before = describe(session.pub_starts_at, session.pub_ends_at, session.pub_room_name);
    const after = describe(session.starts_at, session.ends_at, session.room_name);
    if (before === after) continue;
    changes.push({ submissionId: session.id, title: session.title, before, after });
    run(
      `UPDATE submissions SET pub_starts_at = ?, pub_ends_at = ?, pub_room_id = ?,
              pub_published_at = ?, ics_sequence = ics_sequence + 1
        WHERE id = ?`,
      session.starts_at,
      session.ends_at,
      session.location_id,
      nowIso(),
      session.id,
    );
  }

  run(
    "INSERT INTO agenda_publications (id, event_id, actor_user_id, summary, created_at) VALUES (?,?,?,?,?)",
    id(),
    eventId,
    actorUserId,
    JSON.stringify(changes),
    nowIso(),
  );
  return changes;
}

function describe(start: string | null, end: string | null, room: string | null): string {
  if (!start) return "not scheduled";
  return `${start}${end ? `–${end.slice(11)}` : ""} in ${room ?? "no room"}`;
}

export function lastPublication(eventId: string) {
  return get<{ id: string; created_at: string; summary: string; actor_user_id: string | null }>(
    "SELECT * FROM agenda_publications WHERE event_id = ? ORDER BY created_at DESC LIMIT 1",
    eventId,
  );
}

/** Unpublished scheduling differences — shown to organizers before publishing. */
export function pendingChanges(eventId: string): PublishChange[] {
  return all<{
    id: string;
    title: string;
    starts_at: string | null;
    ends_at: string | null;
    room_name: string | null;
    pub_starts_at: string | null;
    pub_ends_at: string | null;
    pub_room_name: string | null;
  }>(
    `SELECT s.id, s.title, s.starts_at, s.ends_at,
            (SELECT name FROM rooms WHERE id = s.location_id) AS room_name,
            s.pub_starts_at, s.pub_ends_at,
            (SELECT name FROM rooms WHERE id = s.pub_room_id) AS pub_room_name
       FROM submissions s
      WHERE s.event_id = ? AND s.status = 'accepted'`,
    eventId,
  )
    .map((row) => ({
      submissionId: row.id,
      title: row.title,
      before: describe(row.pub_starts_at, row.pub_ends_at, row.pub_room_name),
      after: describe(row.starts_at, row.ends_at, row.room_name),
    }))
    .filter((change) => change.before !== change.after);
}

export function eventDays(eventId: string, start?: string | null, end?: string | null): string[] {
  const scheduled = all<{ day: string }>(
    `SELECT DISTINCT substr(starts_at, 1, 10) AS day FROM submissions
      WHERE event_id = ? AND starts_at IS NOT NULL ORDER BY day`,
    eventId,
  ).map((row) => row.day);
  const from = dateOf(start);
  const to = dateOf(end);
  const days = new Set(scheduled);
  if (from) {
    const cursor = new Date(`${from}T00:00:00Z`);
    const last = new Date(`${to ?? from}T00:00:00Z`);
    while (cursor <= last && days.size < 60) {
      days.add(cursor.toISOString().slice(0, 10));
      cursor.setUTCDate(cursor.getUTCDate() + 1);
    }
  }
  return [...days].sort();
}
