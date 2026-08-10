import { and, count, eq, inArray, like, or, sql } from "drizzle-orm";
import { getDb, schema } from "@/lib/db";
import { id } from "@/lib/id";
import {
  CRM_PIPELINE_STAGES,
  type CrmPipelineStage,
  type CrmSegmentFilter,
} from "./types";

export function parseSegmentFilter(raw: string | null | undefined): CrmSegmentFilter {
  if (!raw) return {};
  try {
    return JSON.parse(raw) as CrmSegmentFilter;
  } catch {
    return {};
  }
}

export function listOrgContacts(opts: {
  orgId: string;
  q?: string;
  company?: string;
  jobTitle?: string;
  tagId?: string;
}) {
  const db = getDb();
  const filters = [eq(schema.contacts.orgId, opts.orgId)];

  if (opts.q) {
    const q = `%${opts.q}%`;
    filters.push(
      or(
        like(schema.contacts.firstName, q),
        like(schema.contacts.lastName, q),
        like(schema.contacts.email, q),
        like(schema.contacts.company, q),
        like(schema.contacts.jobTitle, q),
      )!,
    );
  }
  if (opts.company) {
    filters.push(like(schema.contacts.company, `%${opts.company}%`));
  }
  if (opts.jobTitle) {
    filters.push(like(schema.contacts.jobTitle, `%${opts.jobTitle}%`));
  }

  let contacts = db
    .select()
    .from(schema.contacts)
    .where(and(...filters))
    .orderBy(schema.contacts.lastName, schema.contacts.firstName)
    .all();

  if (opts.tagId) {
    const tagged = db
      .select({ contactId: schema.crmContactTags.contactId })
      .from(schema.crmContactTags)
      .where(eq(schema.crmContactTags.tagId, opts.tagId))
      .all();
    const ids = new Set(tagged.map((t) => t.contactId));
    contacts = contacts.filter((c) => ids.has(c.id));
  }

  return contacts;
}

export function getContactTags(contactIds: string[]) {
  if (!contactIds.length) return new Map<string, Array<{ id: string; name: string; color: string }>>();
  const db = getDb();
  const rows = db
    .select({
      contactId: schema.crmContactTags.contactId,
      tag: schema.crmTags,
    })
    .from(schema.crmContactTags)
    .innerJoin(schema.crmTags, eq(schema.crmContactTags.tagId, schema.crmTags.id))
    .where(inArray(schema.crmContactTags.contactId, contactIds))
    .all();

  const map = new Map<string, Array<{ id: string; name: string; color: string }>>();
  for (const row of rows) {
    const list = map.get(row.contactId) ?? [];
    list.push({ id: row.tag.id, name: row.tag.name, color: row.tag.color });
    map.set(row.contactId, list);
  }
  return map;
}

export function getPipelineStageCounts(orgId: string) {
  const db = getDb();
  const rows = db
    .select({
      stage: schema.crmPipelineCards.stage,
      c: count(),
    })
    .from(schema.crmPipelineCards)
    .where(eq(schema.crmPipelineCards.orgId, orgId))
    .groupBy(schema.crmPipelineCards.stage)
    .all();

  const counts: Record<string, number> = {};
  for (const stage of CRM_PIPELINE_STAGES) counts[stage] = 0;
  for (const row of rows) counts[row.stage] = Number(row.c);
  return counts;
}

export function getCrmOverviewMetrics(orgId: string) {
  const db = getDb();
  const totalContacts =
    db
      .select({ c: count() })
      .from(schema.contacts)
      .where(eq(schema.contacts.orgId, orgId))
      .get()?.c ?? 0;

  const stageCounts = getPipelineStageCounts(orgId);
  const inPipeline = Object.values(stageCounts).reduce((a, b) => a + b, 0);

  return {
    totalContacts: Number(totalContacts),
    stageCounts,
    inPipeline,
    notInPipeline: Number(totalContacts) - inPipeline,
  };
}

export function ensurePipelineCard(orgId: string, contactId: string, createdAt: string) {
  const db = getDb();
  const existing = db
    .select()
    .from(schema.crmPipelineCards)
    .where(
      and(
        eq(schema.crmPipelineCards.orgId, orgId),
        eq(schema.crmPipelineCards.contactId, contactId),
      ),
    )
    .get();

  if (existing) return existing;

  const cardId = id("cpc");
  db.insert(schema.crmPipelineCards)
    .values({
      id: cardId,
      orgId,
      contactId,
      stage: "researching",
      sortOrder: 0,
      createdAt,
      updatedAt: createdAt,
    })
    .run();

  return db
    .select()
    .from(schema.crmPipelineCards)
    .where(eq(schema.crmPipelineCards.id, cardId))
    .get()!;
}

export function findDuplicateContacts(orgId: string) {
  const db = getDb();
  const contacts = db
    .select()
    .from(schema.contacts)
    .where(eq(schema.contacts.orgId, orgId))
    .all();

  const groups = new Map<string, typeof contacts>();
  for (const c of contacts) {
    const key = `${c.firstName.trim().toLowerCase()}|${c.lastName.trim().toLowerCase()}`;
    const list = groups.get(key) ?? [];
    list.push(c);
    groups.set(key, list);
  }

  return [...groups.values()].filter((g) => {
    if (g.length < 2) return false;
    const emails = new Set(g.map((c) => c.email.toLowerCase()));
    return emails.size > 1;
  });
}

export function listPipelineCards(orgId: string, stage?: CrmPipelineStage) {
  const db = getDb();
  const filters = [eq(schema.crmPipelineCards.orgId, orgId)];
  if (stage) filters.push(eq(schema.crmPipelineCards.stage, stage));

  return db
    .select({
      card: schema.crmPipelineCards,
      contact: schema.contacts,
    })
    .from(schema.crmPipelineCards)
    .innerJoin(schema.contacts, eq(schema.crmPipelineCards.contactId, schema.contacts.id))
    .where(and(...filters))
    .orderBy(schema.crmPipelineCards.sortOrder, schema.contacts.lastName)
    .all();
}

export function filterContactsByStage<T extends { id: string }>(
  contacts: T[],
  orgId: string,
  stage: CrmPipelineStage | "all" | undefined,
): T[] {
  if (!stage || stage === "all") return contacts;
  const db = getDb();
  const cards = db
    .select({ contactId: schema.crmPipelineCards.contactId })
    .from(schema.crmPipelineCards)
    .where(
      and(eq(schema.crmPipelineCards.orgId, orgId), eq(schema.crmPipelineCards.stage, stage)),
    )
    .all();
  const ids = new Set(cards.map((c) => c.contactId));
  return contacts.filter((c) => ids.has(c.id));
}

export function getContactEventHistory(contactId: string) {
  const db = getDb();
  const eventLinks = db
    .select({
      eventContact: schema.eventContacts,
      event: schema.events,
    })
    .from(schema.eventContacts)
    .innerJoin(schema.events, eq(schema.eventContacts.eventId, schema.events.id))
    .where(eq(schema.eventContacts.contactId, contactId))
    .orderBy(schema.events.startsAt)
    .all();

  const submissions = db
    .select({
      submission: schema.submissions,
      event: schema.events,
      role: schema.submissionParticipants.role,
    })
    .from(schema.submissionParticipants)
    .innerJoin(
      schema.submissions,
      eq(schema.submissionParticipants.submissionId, schema.submissions.id),
    )
    .innerJoin(schema.events, eq(schema.submissions.eventId, schema.events.id))
    .where(eq(schema.submissionParticipants.contactId, contactId))
    .orderBy(sql`${schema.submissions.updatedAt} desc`)
    .all();

  return { eventLinks, submissions };
}
