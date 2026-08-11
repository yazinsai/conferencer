import { all } from "./db";
import { stripHtml } from "./fields";
import { contactName, listRoster, upsertContact, ensureEventContact } from "./repo/contacts";
import { listSubmissions, updateSubmission, getSubmission } from "./repo/submissions";
import type { Event } from "./repo/events";

/**
 * Optional Airtable mirror (R-NFR-7). Off unless AIRTABLE_API_KEY and
 * AIRTABLE_BASE_ID are set — the product never depends on it.
 *
 * Tables expected in the base (created by hand, names configurable):
 *   Submissions  — Title, Status, Track, Format, Speakers, Abstract, ConferencerId
 *   Speakers     — Name, Email, Job Title, Company, Status, ConferencerId
 */
export function airtableEnabled(): boolean {
  return Boolean(process.env.AIRTABLE_API_KEY && process.env.AIRTABLE_BASE_ID);
}

const SUBMISSIONS_TABLE = process.env.AIRTABLE_SUBMISSIONS_TABLE ?? "Submissions";
const SPEAKERS_TABLE = process.env.AIRTABLE_SPEAKERS_TABLE ?? "Speakers";

type AirtableRecord = { id: string; fields: Record<string, unknown> };

async function request(
  table: string,
  init: RequestInit & { query?: Record<string, string> } = {},
): Promise<{ records: AirtableRecord[] }> {
  const base = process.env.AIRTABLE_BASE_ID!;
  const url = new URL(`https://api.airtable.com/v0/${base}/${encodeURIComponent(table)}`);
  for (const [key, value] of Object.entries(init.query ?? {})) url.searchParams.set(key, value);
  const response = await fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${process.env.AIRTABLE_API_KEY}`,
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });
  if (!response.ok) {
    throw new Error(`Airtable ${table} responded ${response.status}: ${await response.text()}`);
  }
  return (await response.json()) as { records: AirtableRecord[] };
}

async function existingByConferencerId(table: string): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  const { records } = await request(table, { query: { pageSize: "100" } });
  for (const record of records) {
    const key = record.fields.ConferencerId;
    if (typeof key === "string") map.set(key, record.id);
  }
  return map;
}

/** Push submissions and speakers into Airtable. */
export async function pushToAirtable(event: Event): Promise<{ submissions: number; speakers: number }> {
  if (!airtableEnabled()) throw new Error("Airtable is not configured.");

  const submissionIds = await existingByConferencerId(SUBMISSIONS_TABLE);
  const submissions = listSubmissions(event.id, { limit: 1000 });
  const toCreate: Array<{ fields: Record<string, unknown> }> = [];
  const toUpdate: Array<{ id: string; fields: Record<string, unknown> }> = [];

  for (const submission of submissions) {
    const fields = {
      Title: submission.title,
      Status: submission.status,
      Track: submission.track_name ?? "",
      Format: submission.format_name ?? "",
      Speakers: submission.speakers ?? "",
      Abstract: stripHtml(submission.description ?? "").slice(0, 90_000),
      ConferencerId: submission.id,
    };
    const recordId = submissionIds.get(submission.id);
    if (recordId) toUpdate.push({ id: recordId, fields });
    else toCreate.push({ fields });
  }
  await batch(SUBMISSIONS_TABLE, toCreate, toUpdate);

  const speakerIds = await existingByConferencerId(SPEAKERS_TABLE);
  const speakerCreate: Array<{ fields: Record<string, unknown> }> = [];
  const speakerUpdate: Array<{ id: string; fields: Record<string, unknown> }> = [];
  for (const row of listRoster(event.id)) {
    const fields = {
      Name: contactName(row),
      Email: row.email,
      "Job Title": row.job_title ?? "",
      Company: row.company ?? "",
      Status: row.speaker_status,
      ConferencerId: row.id,
    };
    const recordId = speakerIds.get(row.id);
    if (recordId) speakerUpdate.push({ id: recordId, fields });
    else speakerCreate.push({ fields });
  }
  await batch(SPEAKERS_TABLE, speakerCreate, speakerUpdate);

  return { submissions: submissions.length, speakers: listRoster(event.id).length };
}

async function batch(
  table: string,
  create: Array<{ fields: Record<string, unknown> }>,
  update: Array<{ id: string; fields: Record<string, unknown> }>,
) {
  for (let i = 0; i < create.length; i += 10) {
    await request(table, {
      method: "POST",
      body: JSON.stringify({ records: create.slice(i, i + 10), typecast: true }),
    });
  }
  for (let i = 0; i < update.length; i += 10) {
    await request(table, {
      method: "PATCH",
      body: JSON.stringify({ records: update.slice(i, i + 10), typecast: true }),
    });
  }
}

/** Read Airtable back so edits made there are picked up. */
export async function pullFromAirtable(event: Event): Promise<{ submissions: number; speakers: number }> {
  if (!airtableEnabled()) throw new Error("Airtable is not configured.");
  let submissions = 0;
  let speakers = 0;

  const { records: submissionRecords } = await request(SUBMISSIONS_TABLE, {
    query: { pageSize: "100" },
  });
  for (const record of submissionRecords) {
    const localId = record.fields.ConferencerId;
    if (typeof localId !== "string") continue;
    const local = getSubmission(localId);
    if (!local || local.event_id !== event.id) continue;
    const patch: Record<string, unknown> = {};
    if (typeof record.fields.Title === "string" && record.fields.Title !== local.title) {
      patch.title = record.fields.Title;
    }
    if (
      typeof record.fields.Abstract === "string" &&
      record.fields.Abstract !== stripHtml(local.description ?? "")
    ) {
      patch.description = record.fields.Abstract;
    }
    if (typeof record.fields.Status === "string" && record.fields.Status !== local.status) {
      patch.status = record.fields.Status;
    }
    if (Object.keys(patch).length) {
      updateSubmission(localId, patch);
      submissions += 1;
    }
  }

  const { records: speakerRecords } = await request(SPEAKERS_TABLE, { query: { pageSize: "100" } });
  for (const record of speakerRecords) {
    const email = record.fields.Email;
    if (typeof email !== "string" || !email) continue;
    const [first, ...rest] = String(record.fields.Name ?? "").split(" ");
    const { contact } = upsertContact(event.org_id, {
      email,
      first_name: first ?? "",
      last_name: rest.join(" "),
      job_title: (record.fields["Job Title"] as string) ?? null,
      company: (record.fields.Company as string) ?? null,
    });
    ensureEventContact(event.id, contact.id, {
      speaker_status: (record.fields.Status as string) ?? "prospect",
    });
    speakers += 1;
  }

  return { submissions, speakers };
}

export function airtableStatus() {
  return {
    enabled: airtableEnabled(),
    baseId: process.env.AIRTABLE_BASE_ID ?? null,
    submissionsTable: SUBMISSIONS_TABLE,
    speakersTable: SPEAKERS_TABLE,
    localSubmissions: all<{ n: number }>("SELECT COUNT(*) AS n FROM submissions")[0]?.n ?? 0,
  };
}
