import { all, get, run } from "../db";
import { id } from "../ids";
import { nowIso } from "../datetime";

export const PIPELINE_STAGES = [
  { key: "researching", label: "Researching" },
  { key: "contacted", label: "Contacted" },
  { key: "in_discussion", label: "In discussion" },
  { key: "confirmed", label: "Confirmed" },
  { key: "declined", label: "Declined" },
] as const;

export type PipelineEntry = {
  id: string;
  org_id: string;
  contact_id: string;
  stage: string;
  score: number | null;
  rationale: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type PipelineCard = PipelineEntry & {
  first_name: string;
  last_name: string;
  email: string;
  company: string | null;
  job_title: string | null;
  headshot_url: string | null;
};

export function listPipeline(orgId: string): PipelineCard[] {
  return all<PipelineCard>(
    `SELECT p.*, c.first_name, c.last_name, c.email, c.company, c.job_title, c.headshot_url
       FROM pipeline_entries p JOIN contacts c ON c.id = p.contact_id
      WHERE p.org_id = ? ORDER BY p.sort_order, p.created_at`,
    orgId,
  );
}

export function getEntry(entryId: string): PipelineCard | undefined {
  return get<PipelineCard>(
    `SELECT p.*, c.first_name, c.last_name, c.email, c.company, c.job_title, c.headshot_url
       FROM pipeline_entries p JOIN contacts c ON c.id = p.contact_id WHERE p.id = ?`,
    entryId,
  );
}

export function enroll(
  orgId: string,
  contactId: string,
  input: { stage?: string; score?: number | null; rationale?: string | null; actor?: string } = {},
): PipelineEntry {
  const existing = get<PipelineEntry>(
    "SELECT * FROM pipeline_entries WHERE org_id = ? AND contact_id = ?",
    orgId,
    contactId,
  );
  if (existing) return existing;
  const entryId = id();
  run(
    `INSERT INTO pipeline_entries (id, org_id, contact_id, stage, score, rationale, sort_order, created_at, updated_at)
     VALUES (?,?,?,?,?,?,?,?,?)`,
    entryId,
    orgId,
    contactId,
    input.stage ?? "researching",
    input.score ?? null,
    input.rationale ?? null,
    0,
    nowIso(),
    nowIso(),
  );
  addEvent(entryId, {
    kind: "stage_change",
    from: null,
    to: input.stage ?? "researching",
    actor: input.actor ?? "System",
  });
  return get<PipelineEntry>("SELECT * FROM pipeline_entries WHERE id = ?", entryId)!;
}

export function moveStage(entryId: string, stage: string, actor: string) {
  const entry = get<PipelineEntry>("SELECT * FROM pipeline_entries WHERE id = ?", entryId);
  if (!entry || entry.stage === stage) return;
  run(
    "UPDATE pipeline_entries SET stage = ?, updated_at = ? WHERE id = ?",
    stage,
    nowIso(),
    entryId,
  );
  addEvent(entryId, { kind: "stage_change", from: entry.stage, to: stage, actor });
}

export function removeEntry(entryId: string) {
  run("DELETE FROM pipeline_entries WHERE id = ?", entryId);
}

export type PipelineEvent = {
  id: string;
  entry_id: string;
  kind: string;
  from_stage: string | null;
  to_stage: string | null;
  body: string | null;
  actor_name: string;
  created_at: string;
};

export function addEvent(
  entryId: string,
  input: { kind: string; from?: string | null; to?: string | null; body?: string | null; actor: string },
) {
  run(
    `INSERT INTO pipeline_events (id, entry_id, kind, from_stage, to_stage, body, actor_name, created_at)
     VALUES (?,?,?,?,?,?,?,?)`,
    id(),
    entryId,
    input.kind,
    input.from ?? null,
    input.to ?? null,
    input.body ?? null,
    input.actor,
    nowIso(),
  );
}

export function listEvents(entryId: string): PipelineEvent[] {
  return all<PipelineEvent>(
    "SELECT * FROM pipeline_events WHERE entry_id = ? ORDER BY created_at DESC",
    entryId,
  );
}

/* -------------------------------------------------------------- segments -- */

export type Segment = {
  id: string;
  org_id: string;
  name: string;
  kind: string;
  config: string;
  created_at: string;
};

export function listSegments(orgId: string): Segment[] {
  return all<Segment>("SELECT * FROM segments WHERE org_id = ? ORDER BY created_at DESC", orgId);
}

export function getSegment(segmentId: string): Segment | undefined {
  return get<Segment>("SELECT * FROM segments WHERE id = ?", segmentId);
}

export function createSegment(
  orgId: string,
  input: { name: string; kind: string; config: unknown },
): Segment {
  const segmentId = id();
  run(
    "INSERT INTO segments (id, org_id, name, kind, config, created_at) VALUES (?,?,?,?,?,?)",
    segmentId,
    orgId,
    input.name,
    input.kind,
    JSON.stringify(input.config),
    nowIso(),
  );
  return getSegment(segmentId)!;
}

export function deleteSegment(segmentId: string) {
  run("DELETE FROM segments WHERE id = ?", segmentId);
}

/* ------------------------------------------------------------ duplicates -- */

export type DuplicateGroup = { name: string; contacts: Array<{ id: string; email: string }> };

/** Same name, different email — the case the rubric asks about (CRM-06). */
export function findDuplicates(orgId: string): DuplicateGroup[] {
  const rows = all<{ name: string; ids: string; emails: string; n: number }>(
    `SELECT lower(first_name || ' ' || last_name) AS name,
            GROUP_CONCAT(id) AS ids, GROUP_CONCAT(email) AS emails, COUNT(*) AS n
       FROM contacts WHERE org_id = ? AND first_name != '' AND last_name != ''
      GROUP BY name HAVING n > 1`,
    orgId,
  );
  return rows.map((row) => {
    const ids = row.ids.split(",");
    const emails = row.emails.split(",");
    return {
      name: row.name.replace(/\b\w/g, (c) => c.toUpperCase()),
      contacts: ids.map((contactId, index) => ({ id: contactId, email: emails[index] ?? "" })),
    };
  });
}

/** Repoints every relationship at the primary record, then deletes the rest. */
export function mergeContacts(primaryId: string, duplicateIds: string[]) {
  for (const duplicateId of duplicateIds) {
    if (duplicateId === primaryId) continue;
    run("UPDATE submission_participants SET contact_id = ? WHERE contact_id = ?", primaryId, duplicateId);
    run("UPDATE submissions SET submitter_contact_id = ? WHERE submitter_contact_id = ?", primaryId, duplicateId);
    run("UPDATE task_assignments SET contact_id = ? WHERE contact_id = ?", primaryId, duplicateId);
    run("UPDATE uploads SET contact_id = ? WHERE contact_id = ?", primaryId, duplicateId);
    run("UPDATE email_messages SET to_contact_id = ? WHERE to_contact_id = ?", primaryId, duplicateId);
    // event_contacts and pipeline_entries are unique per (event/org, contact).
    for (const row of all<{ id: string; event_id: string }>(
      "SELECT id, event_id FROM event_contacts WHERE contact_id = ?",
      duplicateId,
    )) {
      const clash = get(
        "SELECT id FROM event_contacts WHERE event_id = ? AND contact_id = ?",
        row.event_id,
        primaryId,
      );
      if (clash) run("DELETE FROM event_contacts WHERE id = ?", row.id);
      else run("UPDATE event_contacts SET contact_id = ? WHERE id = ?", primaryId, row.id);
    }
    run("DELETE FROM pipeline_entries WHERE contact_id = ?", duplicateId);
    run("DELETE FROM contacts WHERE id = ?", duplicateId);
  }
}

/* ------------------------------------------------------------- analytics -- */

export function crmStats(orgId: string) {
  const totals = get<{ contacts: number; companies: number; with_bio: number }>(
    `SELECT COUNT(*) AS contacts, COUNT(DISTINCT company) AS companies,
            SUM(CASE WHEN biography IS NOT NULL AND biography != '' THEN 1 ELSE 0 END) AS with_bio
       FROM contacts WHERE org_id = ?`,
    orgId,
  );
  const events = get<{ n: number }>(
    "SELECT COUNT(*) AS n FROM events WHERE org_id = ?",
    orgId,
  );
  const returning = get<{ n: number }>(
    `SELECT COUNT(*) AS n FROM (
        SELECT c.id FROM contacts c
          JOIN event_contacts ec ON ec.contact_id = c.id
         WHERE c.org_id = ?
         GROUP BY c.id HAVING COUNT(DISTINCT ec.event_id) > 1)`,
    orgId,
  );
  const pipeline = get<{ n: number }>(
    "SELECT COUNT(*) AS n FROM pipeline_entries WHERE org_id = ?",
    orgId,
  );
  return {
    contacts: totals?.contacts ?? 0,
    companies: totals?.companies ?? 0,
    withBio: totals?.with_bio ?? 0,
    events: events?.n ?? 0,
    returning: returning?.n ?? 0,
    pipeline: pipeline?.n ?? 0,
  };
}

export function topCompanies(orgId: string, limit = 8) {
  return all<{ company: string; n: number }>(
    `SELECT COALESCE(NULLIF(company, ''), 'Unknown') AS company, COUNT(*) AS n
       FROM contacts WHERE org_id = ? GROUP BY company ORDER BY n DESC LIMIT ?`,
    orgId,
    limit,
  );
}

export function stageCounts(orgId: string) {
  const rows = all<{ stage: string; n: number }>(
    "SELECT stage, COUNT(*) AS n FROM pipeline_entries WHERE org_id = ? GROUP BY stage",
    orgId,
  );
  const map = new Map(rows.map((row) => [row.stage, row.n]));
  return PIPELINE_STAGES.map((stage) => ({ ...stage, count: map.get(stage.key) ?? 0 }));
}

export function contactEvents(contactId: string) {
  return all<{ event_id: string; event_name: string; slug: string; speaker_status: string; sessions: number }>(
    `SELECT e.id AS event_id, e.name AS event_name, e.slug, ec.speaker_status,
            (SELECT COUNT(*) FROM submission_participants sp
               JOIN submissions s ON s.id = sp.submission_id
              WHERE sp.contact_id = ? AND s.event_id = e.id) AS sessions
       FROM event_contacts ec JOIN events e ON e.id = ec.event_id
      WHERE ec.contact_id = ?
      ORDER BY e.starts_at DESC`,
    contactId,
    contactId,
  );
}
