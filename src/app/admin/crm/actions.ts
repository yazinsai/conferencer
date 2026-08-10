"use server";

import { and, eq, inArray } from "drizzle-orm";
import Papa from "papaparse";
import { revalidatePath } from "next/cache";
import { requireCrmAccess } from "@/lib/auth/crm-guards";
import {
  ensurePipelineCard,
  listOrgContacts,
  parseSegmentFilter,
} from "@/lib/crm/queries";
import { isCrmPipelineStage } from "@/lib/crm/types";
import { nowIso } from "@/lib/dates";
import { getDb, schema } from "@/lib/db";
import { applyMergeFields } from "@/lib/email/merge";
import { sendEmail } from "@/lib/email/send";
import { id } from "@/lib/id";

export type CrmCsvRow = {
  first_name: string;
  last_name: string;
  email: string;
  job_title: string;
  company: string;
  biography: string;
};

export type ImportPreview = {
  created: number;
  updated: number;
  skipped: number;
  total: number;
  errors: string[];
};

function revalidateCrm() {
  revalidatePath("/admin/crm");
  revalidatePath("/admin/crm/contacts");
  revalidatePath("/admin/crm/pipeline");
  revalidatePath("/admin/crm/duplicates");
}

function portalLink() {
  return `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/portal`;
}

function parseCrmCsv(csvText: string): { rows: CrmCsvRow[]; errors: string[] } {
  const result = Papa.parse<Record<string, string>>(csvText, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h: string) => h.trim().toLowerCase().replace(/\s+/g, "_"),
  });

  const errors = result.errors.map((e: { message: string }) => e.message);
  const rows: CrmCsvRow[] = [];

  for (const raw of result.data) {
    const email = (raw.email || "").trim().toLowerCase();
    const first_name = (raw.first_name || "").trim();
    const last_name = (raw.last_name || "").trim();

    if (!email || !first_name || !last_name) {
      errors.push(
        `Skipped row: missing required field (${[first_name, last_name, email].filter(Boolean).join(", ") || "empty row"})`,
      );
      continue;
    }

    rows.push({
      first_name,
      last_name,
      email,
      job_title: (raw.job_title || "").trim(),
      company: (raw.company || "").trim(),
      biography: (raw.biography || "").trim(),
    });
  }

  return { rows, errors };
}

function upsertContactRow(row: CrmCsvRow, orgId: string): "created" | "updated" {
  const db = getDb();
  const createdAt = nowIso();

  const contact = db
    .select()
    .from(schema.contacts)
    .where(and(eq(schema.contacts.orgId, orgId), eq(schema.contacts.email, row.email)))
    .get();

  if (contact) {
    db.update(schema.contacts)
      .set({
        firstName: row.first_name,
        lastName: row.last_name,
        jobTitle: row.job_title || null,
        company: row.company || null,
        biography: row.biography || null,
      })
      .where(eq(schema.contacts.id, contact.id))
      .run();
    return "updated";
  }

  const contactId = id("ctc");
  db.insert(schema.contacts)
    .values({
      id: contactId,
      orgId,
      userId: null,
      firstName: row.first_name,
      lastName: row.last_name,
      email: row.email,
      jobTitle: row.job_title || null,
      company: row.company || null,
      biography: row.biography || null,
      createdAt,
    })
    .run();
  return "created";
}

export async function previewCrmCsvAction(formData: FormData): Promise<ImportPreview> {
  await requireCrmAccess();
  const orgId = String(formData.get("orgId") || "");

  const file = formData.get("csvFile");
  if (!(file instanceof File) || file.size === 0) {
    return { created: 0, updated: 0, skipped: 0, total: 0, errors: ["No CSV file uploaded"] };
  }

  const csvText = await file.text();
  const { rows, errors } = parseCrmCsv(csvText);
  const db = getDb();
  let created = 0;
  let updated = 0;

  for (const row of rows) {
    const contact = db
      .select()
      .from(schema.contacts)
      .where(and(eq(schema.contacts.orgId, orgId), eq(schema.contacts.email, row.email)))
      .get();
    if (contact) updated++;
    else created++;
  }

  return {
    created,
    updated,
    skipped: errors.length,
    total: rows.length,
    errors: errors.slice(0, 20),
  };
}

export async function importCrmCsvAction(formData: FormData): Promise<ImportPreview> {
  const { orgId } = await requireCrmAccess();
  const csvText = String(formData.get("csvText") || "");

  if (!csvText.trim()) {
    return { created: 0, updated: 0, skipped: 0, total: 0, errors: ["No CSV data"] };
  }

  const { rows, errors } = parseCrmCsv(csvText);
  let created = 0;
  let updated = 0;

  for (const row of rows) {
    const result = upsertContactRow(row, orgId);
    if (result === "created") created++;
    else updated++;
  }

  revalidateCrm();
  return {
    created,
    updated,
    skipped: errors.length,
    total: rows.length,
    errors: errors.slice(0, 20),
  };
}

export async function addCrmNoteAction(formData: FormData) {
  const { user, orgId } = await requireCrmAccess();
  const contactId = String(formData.get("contactId") || "");
  const body = String(formData.get("body") || "").trim();
  if (!contactId || !body) throw new Error("Note body is required");

  const db = getDb();
  const contact = db
    .select()
    .from(schema.contacts)
    .where(and(eq(schema.contacts.id, contactId), eq(schema.contacts.orgId, orgId)))
    .get();
  if (!contact) throw new Error("Contact not found");

  db.insert(schema.crmNotes)
    .values({
      id: id("cn"),
      contactId,
      orgId,
      authorUserId: user.id,
      body,
      createdAt: nowIso(),
    })
    .run();

  revalidatePath(`/admin/crm/contacts/${contactId}`);
  revalidatePath("/admin/crm/pipeline");
}

export async function saveCrmContactAction(formData: FormData) {
  const { orgId } = await requireCrmAccess();
  const contactId = String(formData.get("contactId") || "");
  if (!contactId) throw new Error("Invalid contact");

  const db = getDb();
  const contact = db
    .select()
    .from(schema.contacts)
    .where(and(eq(schema.contacts.id, contactId), eq(schema.contacts.orgId, orgId)))
    .get();
  if (!contact) throw new Error("Contact not found");

  const str = (key: string) => String(formData.get(key) || "").trim();

  db.update(schema.contacts)
    .set({
      firstName: str("firstName"),
      lastName: str("lastName"),
      email: str("email").toLowerCase(),
      pronouns: str("pronouns") || null,
      jobTitle: str("jobTitle") || null,
      company: str("company") || null,
      biography: str("biography") || null,
      linkedinUrl: str("linkedinUrl") || null,
      twitterUrl: str("twitterUrl") || null,
      websiteUrl: str("websiteUrl") || null,
      phone: str("phone") || null,
      headshotUrl: str("headshotUrl") || null,
    })
    .where(eq(schema.contacts.id, contactId))
    .run();

  revalidatePath(`/admin/crm/contacts/${contactId}`);
  revalidateCrm();
}

export async function createCrmTagAction(formData: FormData) {
  const { orgId } = await requireCrmAccess();
  const name = String(formData.get("name") || "").trim();
  const color = String(formData.get("color") || "#94a3b8").trim();
  if (!name) throw new Error("Tag name is required");

  const db = getDb();
  db.insert(schema.crmTags)
    .values({ id: id("ctg"), orgId, name, color })
    .run();

  revalidateCrm();
}

export async function toggleContactTagAction(formData: FormData) {
  const { orgId } = await requireCrmAccess();
  const contactId = String(formData.get("contactId") || "");
  const tagId = String(formData.get("tagId") || "");
  const action = String(formData.get("action") || "add");
  if (!contactId || !tagId) throw new Error("Invalid input");

  const db = getDb();
  const contact = db
    .select()
    .from(schema.contacts)
    .where(and(eq(schema.contacts.id, contactId), eq(schema.contacts.orgId, orgId)))
    .get();
  if (!contact) throw new Error("Contact not found");

  const tag = db
    .select()
    .from(schema.crmTags)
    .where(and(eq(schema.crmTags.id, tagId), eq(schema.crmTags.orgId, orgId)))
    .get();
  if (!tag) throw new Error("Tag not found");

  const existing = db
    .select()
    .from(schema.crmContactTags)
    .where(
      and(
        eq(schema.crmContactTags.contactId, contactId),
        eq(schema.crmContactTags.tagId, tagId),
      ),
    )
    .get();

  if (action === "remove" && existing) {
    db.delete(schema.crmContactTags).where(eq(schema.crmContactTags.id, existing.id)).run();
  } else if (action === "add" && !existing) {
    db.insert(schema.crmContactTags)
      .values({ id: id("cct"), contactId, tagId })
      .run();
  }

  revalidatePath(`/admin/crm/contacts/${contactId}`);
  revalidateCrm();
}

export async function movePipelineStageAction(formData: FormData) {
  const { user, orgId } = await requireCrmAccess();
  const cardId = String(formData.get("cardId") || "");
  const toStage = String(formData.get("toStage") || "");
  if (!cardId || !isCrmPipelineStage(toStage)) throw new Error("Invalid stage");

  const db = getDb();
  const card = db
    .select()
    .from(schema.crmPipelineCards)
    .where(and(eq(schema.crmPipelineCards.id, cardId), eq(schema.crmPipelineCards.orgId, orgId)))
    .get();
  if (!card) throw new Error("Card not found");
  if (card.stage === toStage) return;

  const updatedAt = nowIso();
  db.update(schema.crmPipelineCards)
    .set({ stage: toStage, updatedAt })
    .where(eq(schema.crmPipelineCards.id, cardId))
    .run();

  db.insert(schema.crmStageHistory)
    .values({
      id: id("csh"),
      cardId,
      fromStage: card.stage,
      toStage,
      actorUserId: user.id,
      createdAt: updatedAt,
    })
    .run();

  revalidatePath("/admin/crm/pipeline");
  revalidatePath("/admin/crm");
}

export async function addToPipelineAction(formData: FormData) {
  const { orgId } = await requireCrmAccess();
  const contactId = String(formData.get("contactId") || "");
  if (!contactId) throw new Error("Invalid contact");

  const db = getDb();
  const contact = db
    .select()
    .from(schema.contacts)
    .where(and(eq(schema.contacts.id, contactId), eq(schema.contacts.orgId, orgId)))
    .get();
  if (!contact) throw new Error("Contact not found");

  ensurePipelineCard(orgId, contactId, nowIso());
  revalidatePath("/admin/crm/pipeline");
  revalidatePath(`/admin/crm/contacts/${contactId}`);
}

export async function saveCrmSegmentAction(formData: FormData) {
  const { orgId } = await requireCrmAccess();
  const name = String(formData.get("name") || "").trim();
  const filterJson = String(formData.get("filter") || "{}");
  if (!name) throw new Error("Segment name is required");

  parseSegmentFilter(filterJson);

  const db = getDb();
  db.insert(schema.crmSegments)
    .values({
      id: id("csg"),
      orgId,
      name,
      filter: filterJson,
      createdAt: nowIso(),
    })
    .run();

  revalidatePath("/admin/crm/contacts");
}

export async function deleteCrmSegmentAction(formData: FormData) {
  const { orgId } = await requireCrmAccess();
  const segmentId = String(formData.get("segmentId") || "");
  if (!segmentId) throw new Error("Invalid segment");

  const db = getDb();
  db.delete(schema.crmSegments)
    .where(and(eq(schema.crmSegments.id, segmentId), eq(schema.crmSegments.orgId, orgId)))
    .run();

  revalidatePath("/admin/crm/contacts");
}

export async function pushToEventAction(formData: FormData) {
  const { orgId } = await requireCrmAccess();
  const contactId = String(formData.get("contactId") || "");
  const eventId = String(formData.get("eventId") || "");
  if (!contactId || !eventId) throw new Error("Contact and event are required");

  const db = getDb();
  const contact = db
    .select()
    .from(schema.contacts)
    .where(and(eq(schema.contacts.id, contactId), eq(schema.contacts.orgId, orgId)))
    .get();
  if (!contact) throw new Error("Contact not found");

  const event = db
    .select()
    .from(schema.events)
    .where(and(eq(schema.events.id, eventId), eq(schema.events.orgId, orgId)))
    .get();
  if (!event) throw new Error("Event not found");

  const existing = db
    .select()
    .from(schema.eventContacts)
    .where(
      and(
        eq(schema.eventContacts.eventId, eventId),
        eq(schema.eventContacts.contactId, contactId),
      ),
    )
    .get();

  const createdAt = nowIso();
  if (!existing) {
    db.insert(schema.eventContacts)
      .values({
        id: id("ec"),
        eventId,
        contactId,
        status: "active",
        speakerStatus: "prospect",
        createdAt,
      })
      .run();
  }

  revalidatePath(`/admin/crm/contacts/${contactId}`);
  revalidatePath(`/admin/e/${event.slug}/speakers`);
}

export async function mergeContactsAction(formData: FormData) {
  const { orgId } = await requireCrmAccess();
  const primaryId = String(formData.get("primaryId") || "");
  const mergeIds = formData.getAll("mergeIds").map(String).filter(Boolean);
  if (!primaryId || !mergeIds.length) throw new Error("Select contacts to merge");

  const db = getDb();
  const primary = db
    .select()
    .from(schema.contacts)
    .where(and(eq(schema.contacts.id, primaryId), eq(schema.contacts.orgId, orgId)))
    .get();
  if (!primary) throw new Error("Primary contact not found");

  for (const mergeId of mergeIds) {
    if (mergeId === primaryId) continue;

    const dup = db
      .select()
      .from(schema.contacts)
      .where(and(eq(schema.contacts.id, mergeId), eq(schema.contacts.orgId, orgId)))
      .get();
    if (!dup) continue;

    db.update(schema.eventContacts)
      .set({ contactId: primaryId })
      .where(eq(schema.eventContacts.contactId, mergeId))
      .run();

    db.update(schema.submissionParticipants)
      .set({ contactId: primaryId })
      .where(eq(schema.submissionParticipants.contactId, mergeId))
      .run();

    db.update(schema.submissions)
      .set({ submitterContactId: primaryId })
      .where(eq(schema.submissions.submitterContactId, mergeId))
      .run();

    db.update(schema.taskAssignments)
      .set({ contactId: primaryId })
      .where(eq(schema.taskAssignments.contactId, mergeId))
      .run();

    db.update(schema.uploads)
      .set({ contactId: primaryId })
      .where(eq(schema.uploads.contactId, mergeId))
      .run();

    db.update(schema.crmNotes)
      .set({ contactId: primaryId })
      .where(eq(schema.crmNotes.contactId, mergeId))
      .run();

    const dupTags = db
      .select()
      .from(schema.crmContactTags)
      .where(eq(schema.crmContactTags.contactId, mergeId))
      .all();
    for (const dt of dupTags) {
      const exists = db
        .select()
        .from(schema.crmContactTags)
        .where(
          and(
            eq(schema.crmContactTags.contactId, primaryId),
            eq(schema.crmContactTags.tagId, dt.tagId),
          ),
        )
        .get();
      if (!exists) {
        db.update(schema.crmContactTags)
          .set({ contactId: primaryId })
          .where(eq(schema.crmContactTags.id, dt.id))
          .run();
      } else {
        db.delete(schema.crmContactTags).where(eq(schema.crmContactTags.id, dt.id)).run();
      }
    }

    const dupCard = db
      .select()
      .from(schema.crmPipelineCards)
      .where(eq(schema.crmPipelineCards.contactId, mergeId))
      .get();
    if (dupCard) {
      const primaryCard = db
        .select()
        .from(schema.crmPipelineCards)
        .where(eq(schema.crmPipelineCards.contactId, primaryId))
        .get();
      if (!primaryCard) {
        db.update(schema.crmPipelineCards)
          .set({ contactId: primaryId })
          .where(eq(schema.crmPipelineCards.id, dupCard.id))
          .run();
      } else {
        db.delete(schema.crmPipelineCards).where(eq(schema.crmPipelineCards.id, dupCard.id)).run();
      }
    }

    db.delete(schema.contacts).where(eq(schema.contacts.id, mergeId)).run();
  }

  revalidateCrm();
  revalidatePath(`/admin/crm/contacts/${primaryId}`);
}

export async function sendBulkCrmEmailAction(formData: FormData) {
  const { event, orgId } = await requireCrmAccess();
  const contactIds = formData.getAll("contactIds").map(String).filter(Boolean);
  const subject = String(formData.get("subject") || "").trim();
  const bodyHtml = String(formData.get("bodyHtml") || "").trim();
  const templateKey = String(formData.get("templateKey") || "").trim();

  if (!contactIds.length) throw new Error("Select at least one contact");
  if (!subject || !bodyHtml) throw new Error("Subject and message body are required");

  const db = getDb();
  let templateSubject = subject;
  let templateBody = bodyHtml;

  if (templateKey) {
    const tpl = db
      .select()
      .from(schema.emailTemplates)
      .where(
        and(
          eq(schema.emailTemplates.eventId, event.id),
          eq(schema.emailTemplates.key, templateKey),
        ),
      )
      .get();
    if (tpl) {
      templateSubject = subject || tpl.subject;
      templateBody = bodyHtml || tpl.bodyHtml;
    }
  }

  const contacts = db
    .select()
    .from(schema.contacts)
    .where(
      and(eq(schema.contacts.orgId, orgId), inArray(schema.contacts.id, contactIds)),
    )
    .all();

  for (const contact of contacts) {
    const fields = {
      speaker_name: `${contact.firstName} ${contact.lastName}`,
      first_name: contact.firstName,
      last_name: contact.lastName,
      event_name: event.name,
      portal_link: portalLink(),
      company: contact.company ?? "",
      job_title: contact.jobTitle ?? "",
    };

    await sendEmail({
      eventId: event.id,
      toEmail: contact.email,
      toContactId: contact.id,
      subject: applyMergeFields(templateSubject, fields),
      bodyHtml: applyMergeFields(templateBody, fields),
      templateKey: templateKey || null,
    });
  }

  revalidatePath(`/admin/e/${event.slug}/emails`);
}

export async function bulkAddToPipelineAction(formData: FormData) {
  const { orgId } = await requireCrmAccess();
  const contactIds = formData.getAll("contactIds").map(String).filter(Boolean);
  const createdAt = nowIso();

  for (const contactId of contactIds) {
    ensurePipelineCard(orgId, contactId, createdAt);
  }

  revalidatePath("/admin/crm/pipeline");
}
