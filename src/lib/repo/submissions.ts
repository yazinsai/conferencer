import { all, get, run } from "../db";
import { id } from "../ids";
import { nowIso } from "../datetime";
import { contactName, type Contact } from "./contacts";

export const SUBMISSION_STATUSES = [
  "draft",
  "pending",
  "accept_queue",
  "decline_queue",
  "accepted",
  "declined",
  "withdrawn",
] as const;

export type SubmissionStatus = (typeof SUBMISSION_STATUSES)[number];

export const STATUS_LABELS: Record<SubmissionStatus, string> = {
  draft: "Draft",
  pending: "Pending",
  accept_queue: "Accept Queue",
  decline_queue: "Decline Queue",
  accepted: "Accepted",
  declined: "Declined",
  withdrawn: "Withdrawn",
};

/** R-DATA-1: queue statuses are internal — speakers only ever see "Pending". */
export function speakerFacingStatus(status: string): string {
  switch (status) {
    case "accepted":
      return "Accepted";
    case "declined":
      return "Declined";
    case "withdrawn":
      return "Withdrawn";
    case "draft":
      return "Draft";
    default:
      return "Pending";
  }
}

export function statusTone(
  status: string,
): "slate" | "green" | "amber" | "red" | "blue" | "violet" {
  switch (status) {
    case "accepted":
      return "green";
    case "declined":
      return "red";
    case "accept_queue":
      return "blue";
    case "decline_queue":
      return "amber";
    case "withdrawn":
      return "slate";
    case "draft":
      return "slate";
    default:
      return "violet";
  }
}

export const APPROVAL_STATUSES = ["draft", "in_review", "approved"] as const;
export const APPROVAL_LABELS: Record<string, string> = {
  draft: "Draft",
  in_review: "In review",
  approved: "Approved",
};

export type Submission = {
  id: string;
  event_id: string;
  form_id: string | null;
  kind: "abstract" | "session";
  status: SubmissionStatus;
  title: string;
  description: string | null;
  track_id: string | null;
  format_id: string | null;
  level: string | null;
  language: string | null;
  location_id: string | null;
  starts_at: string | null;
  ends_at: string | null;
  capacity: number | null;
  submitter_contact_id: string | null;
  answers: string;
  tags: string;
  is_draft: number;
  withdrawn_at: string | null;
  withdraw_reason: string | null;
  approval_status: string;
  notified_at: string | null;
  notified_status: string | null;
  client_session_id: string | null;
  pub_starts_at: string | null;
  pub_ends_at: string | null;
  pub_room_id: string | null;
  pub_published_at: string | null;
  ai_score: number | null;
  ai_rationale: string | null;
  ai_override_score: number | null;
  ics_sequence: number;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type SubmissionRow = Submission & {
  track_name: string | null;
  track_color: string | null;
  format_name: string | null;
  room_name: string | null;
  submitter_name: string | null;
  speakers: string | null;
  avg_score: number | null;
  review_count: number;
  file_count: number;
};

export type Participant = {
  id: string;
  submission_id: string;
  contact_id: string;
  role: string;
  acceptance_status: string;
  sort_order: number;
  created_at: string;
};

export type ParticipantRow = Participant & Omit<Contact, "id" | "created_at" | "updated_at"> & {
  contact_created_at: string;
};

const SELECT_ROW = `
  SELECT s.*,
         t.name AS track_name, t.color AS track_color,
         f.name AS format_name,
         r.name AS room_name,
         (SELECT c.first_name || ' ' || c.last_name FROM contacts c WHERE c.id = s.submitter_contact_id) AS submitter_name,
         (SELECT GROUP_CONCAT(c2.first_name || ' ' || c2.last_name, ', ')
            FROM submission_participants sp JOIN contacts c2 ON c2.id = sp.contact_id
           WHERE sp.submission_id = s.id) AS speakers,
         (SELECT ROUND(AVG(rv.score), 2) FROM reviews rv WHERE rv.submission_id = s.id AND rv.submitted_at IS NOT NULL) AS avg_score,
         (SELECT COUNT(*) FROM reviews rv WHERE rv.submission_id = s.id AND rv.submitted_at IS NOT NULL) AS review_count,
         (SELECT COUNT(*) FROM uploads u WHERE u.submission_id = s.id) AS file_count
    FROM submissions s
    LEFT JOIN tracks t ON t.id = s.track_id
    LEFT JOIN formats f ON f.id = s.format_id
    LEFT JOIN rooms r ON r.id = s.location_id
`;

export type SubmissionFilters = {
  status?: string;
  kind?: string;
  q?: string;
  trackId?: string;
  formatId?: string;
  formId?: string;
  level?: string;
  language?: string;
  submitterId?: string;
  approval?: string;
  scheduled?: "yes" | "no";
  tag?: string;
  sort?: string;
  limit?: number;
  offset?: number;
};

function buildWhere(eventId: string, filters: SubmissionFilters) {
  const where: string[] = ["s.event_id = ?"];
  const params: unknown[] = [eventId];

  if (filters.status && filters.status !== "all") {
    if (filters.status === "drafts") where.push("s.status = 'draft'");
    else {
      where.push("s.status = ?");
      params.push(filters.status);
    }
  }
  if (filters.kind && filters.kind !== "all") {
    where.push("s.kind = ?");
    params.push(filters.kind);
  }
  if (filters.q) {
    where.push(
      `(s.title LIKE ? OR s.description LIKE ? OR EXISTS (
          SELECT 1 FROM submission_participants sp JOIN contacts c ON c.id = sp.contact_id
           WHERE sp.submission_id = s.id
             AND (c.first_name || ' ' || c.last_name LIKE ? OR c.email LIKE ?)))`,
    );
    const like = `%${filters.q}%`;
    params.push(like, like, like, like);
  }
  if (filters.trackId) {
    where.push("s.track_id = ?");
    params.push(filters.trackId);
  }
  if (filters.formatId) {
    where.push("s.format_id = ?");
    params.push(filters.formatId);
  }
  if (filters.formId) {
    where.push("s.form_id = ?");
    params.push(filters.formId);
  }
  if (filters.level) {
    where.push("s.level = ?");
    params.push(filters.level);
  }
  if (filters.language) {
    where.push("s.language = ?");
    params.push(filters.language);
  }
  if (filters.submitterId) {
    where.push("s.submitter_contact_id = ?");
    params.push(filters.submitterId);
  }
  if (filters.approval) {
    where.push("s.approval_status = ?");
    params.push(filters.approval);
  }
  if (filters.scheduled === "yes") where.push("s.starts_at IS NOT NULL");
  if (filters.scheduled === "no") where.push("s.starts_at IS NULL");
  if (filters.tag) {
    where.push("s.tags LIKE ?");
    params.push(`%"${filters.tag}"%`);
  }
  return { where: where.join(" AND "), params };
}

const SORTS: Record<string, string> = {
  recent: "s.created_at DESC",
  oldest: "s.created_at ASC",
  title: "s.title COLLATE NOCASE ASC",
  title_desc: "s.title COLLATE NOCASE DESC",
  status: "s.status ASC, s.title COLLATE NOCASE",
  track: "track_name ASC, s.title COLLATE NOCASE",
  format: "format_name ASC, s.title COLLATE NOCASE",
  score: "avg_score DESC NULLS LAST, s.title COLLATE NOCASE",
  score_asc: "avg_score ASC NULLS LAST, s.title COLLATE NOCASE",
  schedule: "s.starts_at ASC NULLS LAST, room_name ASC",
};

export function listSubmissions(eventId: string, filters: SubmissionFilters = {}): SubmissionRow[] {
  const { where, params } = buildWhere(eventId, filters);
  const order = SORTS[filters.sort ?? "recent"] ?? SORTS.recent;
  return all<SubmissionRow>(
    `${SELECT_ROW} WHERE ${where} ORDER BY ${order} LIMIT ? OFFSET ?`,
    ...params,
    filters.limit ?? 100,
    filters.offset ?? 0,
  );
}

export function countSubmissions(eventId: string, filters: SubmissionFilters = {}): number {
  const { where, params } = buildWhere(eventId, filters);
  return (
    get<{ n: number }>(
      `SELECT COUNT(*) AS n FROM submissions s WHERE ${where.replace(/avg_score[^)]*\)/g, "0")}`,
      ...params,
    )?.n ?? 0
  );
}

export function statusCounts(
  eventId: string,
  kind?: string,
): Record<string, number> {
  const rows = all<{ status: string; n: number }>(
    `SELECT status, COUNT(*) AS n FROM submissions
      WHERE event_id = ? ${kind && kind !== "all" ? "AND kind = ?" : ""}
      GROUP BY status`,
    ...(kind && kind !== "all" ? [eventId, kind] : [eventId]),
  );
  const counts: Record<string, number> = { all: 0 };
  for (const status of SUBMISSION_STATUSES) counts[status] = 0;
  for (const row of rows) {
    counts[row.status] = row.n;
    counts.all += row.n;
  }
  return counts;
}

export function getSubmission(submissionId: string): Submission | undefined {
  return get<Submission>("SELECT * FROM submissions WHERE id = ?", submissionId);
}

export function getSubmissionRow(submissionId: string): SubmissionRow | undefined {
  return get<SubmissionRow>(`${SELECT_ROW} WHERE s.id = ?`, submissionId);
}

export function createSubmission(
  eventId: string,
  patch: Partial<Submission> & { title?: string },
): Submission {
  const submissionId = patch.id ?? id();
  run(
    `INSERT INTO submissions (id, event_id, form_id, kind, status, title, description, track_id,
        format_id, level, language, location_id, starts_at, ends_at, capacity,
        submitter_contact_id, answers, tags, is_draft, approval_status, created_at, updated_at)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    submissionId,
    eventId,
    patch.form_id ?? null,
    patch.kind ?? "abstract",
    patch.status ?? "pending",
    patch.title ?? "Untitled",
    patch.description ?? null,
    patch.track_id ?? null,
    patch.format_id ?? null,
    patch.level ?? null,
    patch.language ?? "English",
    patch.location_id ?? null,
    patch.starts_at ?? null,
    patch.ends_at ?? null,
    patch.capacity ?? null,
    patch.submitter_contact_id ?? null,
    patch.answers ?? "{}",
    patch.tags ?? "[]",
    patch.is_draft ?? 0,
    patch.approval_status ?? "draft",
    nowIso(),
    nowIso(),
  );
  return getSubmission(submissionId)!;
}

const SUBMISSION_FIELDS = [
  "form_id",
  "kind",
  "status",
  "title",
  "description",
  "track_id",
  "format_id",
  "level",
  "language",
  "location_id",
  "starts_at",
  "ends_at",
  "capacity",
  "submitter_contact_id",
  "answers",
  "tags",
  "is_draft",
  "withdrawn_at",
  "withdraw_reason",
  "approval_status",
  "notified_at",
  "notified_status",
  "client_session_id",
  "pub_starts_at",
  "pub_ends_at",
  "pub_room_id",
  "pub_published_at",
  "ai_score",
  "ai_rationale",
  "ai_override_score",
  "ics_sequence",
  "sort_order",
] as const;

export function updateSubmission(submissionId: string, patch: Partial<Submission>) {
  const sets: string[] = [];
  const params: unknown[] = [];
  for (const key of SUBMISSION_FIELDS) {
    if (key in patch) {
      sets.push(`${key} = ?`);
      params.push(patch[key] ?? null);
    }
  }
  if (!sets.length) return;
  sets.push("updated_at = ?");
  params.push(nowIso(), submissionId);
  run(`UPDATE submissions SET ${sets.join(", ")} WHERE id = ?`, ...params);
}

export function deleteSubmission(submissionId: string) {
  run("DELETE FROM submissions WHERE id = ?", submissionId);
}

/* ---------------------------------------------------------- participants -- */

export function listParticipants(submissionId: string): ParticipantRow[] {
  return all<ParticipantRow>(
    `SELECT sp.*, c.first_name, c.last_name, c.email, c.headshot_url, c.biography, c.job_title,
            c.company, c.pronouns, c.linkedin_url, c.twitter_url, c.website_url,
            c.created_at AS contact_created_at
       FROM submission_participants sp
       JOIN contacts c ON c.id = sp.contact_id
      WHERE sp.submission_id = ?
      ORDER BY sp.sort_order, c.last_name`,
    submissionId,
  );
}

export function addParticipant(
  submissionId: string,
  contactId: string,
  role = "speaker",
): Participant {
  const existing = get<Participant>(
    "SELECT * FROM submission_participants WHERE submission_id = ? AND contact_id = ? AND role = ?",
    submissionId,
    contactId,
    role,
  );
  if (existing) return existing;
  const rowId = id();
  const order =
    get<{ n: number }>(
      "SELECT COALESCE(MAX(sort_order),-1)+1 AS n FROM submission_participants WHERE submission_id = ?",
      submissionId,
    )?.n ?? 0;
  run(
    `INSERT INTO submission_participants (id, submission_id, contact_id, role, sort_order, created_at)
     VALUES (?,?,?,?,?,?)`,
    rowId,
    submissionId,
    contactId,
    role,
    order,
    nowIso(),
  );
  return get<Participant>("SELECT * FROM submission_participants WHERE id = ?", rowId)!;
}

export function removeParticipant(participantId: string) {
  run("DELETE FROM submission_participants WHERE id = ?", participantId);
}

export function setParticipantRole(participantId: string, role: string) {
  run("UPDATE submission_participants SET role = ? WHERE id = ?", role, participantId);
}

export function setParticipantAcceptance(participantId: string, status: string) {
  run(
    "UPDATE submission_participants SET acceptance_status = ? WHERE id = ?",
    status,
    participantId,
  );
}

export function speakerNames(submissionId: string): string {
  return listParticipants(submissionId)
    .filter((p) => p.role !== "submitter")
    .map((p) => contactName(p))
    .join(", ");
}

/** Submissions a contact is attached to (as submitter or participant). */
export function submissionsForContact(eventId: string, contactId: string): SubmissionRow[] {
  return all<SubmissionRow>(
    `${SELECT_ROW}
      WHERE s.event_id = ?
        AND (s.submitter_contact_id = ?
             OR EXISTS (SELECT 1 FROM submission_participants sp
                         WHERE sp.submission_id = s.id AND sp.contact_id = ?))
      ORDER BY s.created_at DESC`,
    eventId,
    contactId,
    contactId,
  );
}

export function countSubmissionsBySubmitter(
  eventId: string,
  contactId: string,
  formId?: string,
): number {
  return (
    get<{ n: number }>(
      `SELECT COUNT(*) AS n FROM submissions
        WHERE event_id = ? AND submitter_contact_id = ? AND status != 'withdrawn'
        ${formId ? "AND form_id = ?" : ""}`,
      ...(formId ? [eventId, contactId, formId] : [eventId, contactId]),
    )?.n ?? 0
  );
}

/* --------------------------------------------------------------- public --- */

export type PublicSession = SubmissionRow & {
  room_name: string | null;
};

/**
 * The single projection every public surface and the public API use, so a
 * session cannot disagree with itself across widgets (R-SITE-6 / EMB-16).
 * Accepted + approved only; scheduling comes from the published snapshot.
 */
export function publicSessions(
  eventId: string,
  opts: { q?: string; trackId?: string; formatId?: string; roomId?: string; day?: string } = {},
): PublicSession[] {
  const where: string[] = [
    "s.event_id = ?",
    "s.status = 'accepted'",
    "s.approval_status = 'approved'",
  ];
  const params: unknown[] = [eventId];
  if (opts.q) {
    where.push(
      `(s.title LIKE ? OR s.description LIKE ? OR EXISTS (
          SELECT 1 FROM submission_participants sp JOIN contacts c ON c.id = sp.contact_id
           WHERE sp.submission_id = s.id AND (c.first_name || ' ' || c.last_name) LIKE ?))`,
    );
    const like = `%${opts.q}%`;
    params.push(like, like, like);
  }
  if (opts.trackId) {
    where.push("s.track_id = ?");
    params.push(opts.trackId);
  }
  if (opts.formatId) {
    where.push("s.format_id = ?");
    params.push(opts.formatId);
  }
  if (opts.roomId) {
    where.push("COALESCE(s.pub_room_id, '') = ?");
    params.push(opts.roomId);
  }
  if (opts.day) {
    where.push("substr(s.pub_starts_at, 1, 10) = ?");
    params.push(opts.day);
  }
  return all<PublicSession>(
    `SELECT s.*,
            t.name AS track_name, t.color AS track_color,
            f.name AS format_name,
            r.name AS room_name,
            NULL AS submitter_name,
            (SELECT GROUP_CONCAT(c2.first_name || ' ' || c2.last_name, ', ')
               FROM submission_participants sp JOIN contacts c2 ON c2.id = sp.contact_id
              WHERE sp.submission_id = s.id AND sp.role != 'submitter') AS speakers,
            NULL AS avg_score, 0 AS review_count, 0 AS file_count
       FROM submissions s
       LEFT JOIN tracks t ON t.id = s.track_id
       LEFT JOIN formats f ON f.id = s.format_id
       LEFT JOIN rooms r ON r.id = COALESCE(s.pub_room_id, s.location_id)
      WHERE ${where.join(" AND ")}
      ORDER BY s.pub_starts_at IS NULL, s.pub_starts_at, r.sort_order, s.title`,
    ...params,
  );
}

export function publicSession(eventId: string, submissionId: string): PublicSession | undefined {
  return publicSessions(eventId).find((s) => s.id === submissionId);
}

/** Speakers visible on public surfaces: participants of public sessions. */
export type PublicSpeaker = Contact & { session_count: number };

export function publicSpeakers(eventId: string, q?: string): PublicSpeaker[] {
  const params: unknown[] = [eventId];
  let filter = "";
  if (q) {
    filter =
      "AND (c.first_name || ' ' || c.last_name LIKE ? OR c.company LIKE ? OR c.job_title LIKE ?)";
    const like = `%${q}%`;
    params.push(like, like, like);
  }
  return all<PublicSpeaker>(
    `SELECT c.*, COUNT(DISTINCT s.id) AS session_count
       FROM contacts c
       JOIN submission_participants sp ON sp.contact_id = c.id
       JOIN submissions s ON s.id = sp.submission_id
      WHERE s.event_id = ? AND s.status = 'accepted' AND s.approval_status = 'approved'
        AND sp.role != 'submitter'
        ${filter}
      GROUP BY c.id
      ORDER BY c.last_name COLLATE NOCASE, c.first_name COLLATE NOCASE`,
    ...params,
  );
}

export type SpeakerBrief = {
  submission_id: string;
  contact_id: string;
  role: string;
  first_name: string;
  last_name: string;
  job_title: string | null;
  company: string | null;
  headshot_url: string | null;
};

/** One query for the speaker lists of many sessions (public cards, exports). */
export function speakersForSubmissions(ids: string[]): Map<string, SpeakerBrief[]> {
  const map = new Map<string, SpeakerBrief[]>();
  if (!ids.length) return map;
  const placeholders = ids.map(() => "?").join(",");
  const rows = all<SpeakerBrief>(
    `SELECT sp.submission_id, sp.contact_id, sp.role, c.first_name, c.last_name,
            c.job_title, c.company, c.headshot_url
       FROM submission_participants sp
       JOIN contacts c ON c.id = sp.contact_id
      WHERE sp.submission_id IN (${placeholders}) AND sp.role != 'submitter'
      ORDER BY sp.sort_order`,
    ...ids,
  );
  for (const row of rows) {
    const list = map.get(row.submission_id) ?? [];
    list.push(row);
    map.set(row.submission_id, list);
  }
  return map;
}

export function publicSessionsForSpeaker(eventId: string, contactId: string): PublicSession[] {
  return publicSessions(eventId).filter((session) =>
    listParticipants(session.id).some(
      (p) => p.contact_id === contactId && p.role !== "submitter",
    ),
  );
}
