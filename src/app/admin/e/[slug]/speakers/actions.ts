"use server";

import { and, eq } from "drizzle-orm";
import Papa from "papaparse";
import { revalidatePath } from "next/cache";
import { requireEventRole } from "@/lib/auth/guards";
import { getDb, schema } from "@/lib/db";
import { id } from "@/lib/id";
import { nowIso } from "@/lib/dates";
import { sendEmail } from "@/lib/email/send";
import { applyMergeFields } from "@/lib/email/merge";

const SPEAKER_STATUSES = [
  "prospect",
  "invited",
  "confirmed",
  "declined",
  "cancelled",
] as const;

export type SpeakerCsvRow = {
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

function revalidateSpeakers(slug: string) {
  revalidatePath(`/admin/e/${slug}/speakers`);
  revalidatePath(`/admin/e/${slug}/deliverables`);
}

function portalLink() {
  return `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/portal`;
}

function parseSpeakerCsv(csvText: string): {
  rows: SpeakerCsvRow[];
  errors: string[];
} {
  const result = Papa.parse<Record<string, string>>(csvText, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h: string) => h.trim().toLowerCase().replace(/\s+/g, "_"),
  });

  const errors = result.errors.map((e: { message: string }) => e.message);
  const rows: SpeakerCsvRow[] = [];

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

function previewUpsert(
  rows: SpeakerCsvRow[],
  orgId: string,
  eventId: string,
): ImportPreview {
  const db = getDb();
  let created = 0;
  let updated = 0;

  for (const row of rows) {
    const contact = db
      .select()
      .from(schema.contacts)
      .where(
        and(eq(schema.contacts.orgId, orgId), eq(schema.contacts.email, row.email)),
      )
      .get();

    if (!contact) {
      created++;
      continue;
    }

    const eventContact = db
      .select()
      .from(schema.eventContacts)
      .where(
        and(
          eq(schema.eventContacts.eventId, eventId),
          eq(schema.eventContacts.contactId, contact.id),
        ),
      )
      .get();

    if (eventContact) updated++;
    else created++;
  }

  return {
    created,
    updated,
    skipped: 0,
    total: rows.length,
    errors: [],
  };
}

function upsertSpeakerRow(
  row: SpeakerCsvRow,
  orgId: string,
  eventId: string,
): "created" | "updated" {
  const db = getDb();
  const createdAt = nowIso();

  let contact = db
    .select()
    .from(schema.contacts)
    .where(
      and(eq(schema.contacts.orgId, orgId), eq(schema.contacts.email, row.email)),
    )
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
    contact = db
      .select()
      .from(schema.contacts)
      .where(eq(schema.contacts.id, contact.id))
      .get()!;
  } else {
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
    contact = db
      .select()
      .from(schema.contacts)
      .where(eq(schema.contacts.id, contactId))
      .get()!;
  }

  const eventContact = db
    .select()
    .from(schema.eventContacts)
    .where(
      and(
        eq(schema.eventContacts.eventId, eventId),
        eq(schema.eventContacts.contactId, contact.id),
      ),
    )
    .get();

  if (eventContact) {
    return "updated";
  }

  db.insert(schema.eventContacts)
    .values({
      id: id("ec"),
      eventId,
      contactId: contact.id,
      status: "active",
      speakerStatus: "prospect",
      createdAt,
    })
    .run();

  return "created";
}

export async function previewSpeakersCsvAction(
  formData: FormData,
): Promise<ImportPreview> {
  const slug = String(formData.get("slug") || "");
  const { event } = await requireEventRole(slug, ["organizer"]);

  const file = formData.get("csvFile");
  if (!(file instanceof File) || file.size === 0) {
    return { created: 0, updated: 0, skipped: 0, total: 0, errors: ["No CSV file uploaded"] };
  }

  const csvText = await file.text();
  const { rows, errors } = parseSpeakerCsv(csvText);
  const preview = previewUpsert(rows, event.orgId, event.id);

  const parseSkipped = errors.length;
  return {
    ...preview,
    skipped: parseSkipped,
    errors: errors.slice(0, 20),
  };
}

export async function importSpeakersCsvAction(
  formData: FormData,
): Promise<ImportPreview> {
  const slug = String(formData.get("slug") || "");
  const { event } = await requireEventRole(slug, ["organizer"]);

  const csvText = String(formData.get("csvText") || "");
  if (!csvText.trim()) {
    const file = formData.get("csvFile");
    if (!(file instanceof File) || file.size === 0) {
      return { created: 0, updated: 0, skipped: 0, total: 0, errors: ["No CSV data"] };
    }
    const text = await file.text();
    return importSpeakersCsvAction(
      (() => {
        const fd = new FormData();
        fd.set("slug", slug);
        fd.set("csvText", text);
        return fd;
      })(),
    );
  }

  const { rows, errors } = parseSpeakerCsv(csvText);
  let created = 0;
  let updated = 0;

  for (const row of rows) {
    const result = upsertSpeakerRow(row, event.orgId, event.id);
    if (result === "created") created++;
    else updated++;
  }

  revalidateSpeakers(slug);

  return {
    created,
    updated,
    skipped: errors.length,
    total: rows.length,
    errors: errors.slice(0, 20),
  };
}

export async function addSpeakerAction(formData: FormData) {
  const slug = String(formData.get("slug") || "");
  const { event } = await requireEventRole(slug, ["organizer"]);
  const db = getDb();

  const firstName = String(formData.get("firstName") || "").trim();
  const lastName = String(formData.get("lastName") || "").trim();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const speakerStatus = String(formData.get("speakerStatus") || "prospect");

  if (!firstName || !lastName || !email) {
    throw new Error("First name, last name, and email are required");
  }

  const createdAt = nowIso();
  let contact = db
    .select()
    .from(schema.contacts)
    .where(
      and(eq(schema.contacts.orgId, event.orgId), eq(schema.contacts.email, email)),
    )
    .get();

  if (!contact) {
    const contactId = id("ctc");
    db.insert(schema.contacts)
      .values({
        id: contactId,
        orgId: event.orgId,
        userId: null,
        firstName,
        lastName,
        email,
        createdAt,
      })
      .run();
    contact = db
      .select()
      .from(schema.contacts)
      .where(eq(schema.contacts.id, contactId))
      .get()!;
  }

  const existing = db
    .select()
    .from(schema.eventContacts)
    .where(
      and(
        eq(schema.eventContacts.eventId, event.id),
        eq(schema.eventContacts.contactId, contact.id),
      ),
    )
    .get();

  if (!existing) {
    db.insert(schema.eventContacts)
      .values({
        id: id("ec"),
        eventId: event.id,
        contactId: contact.id,
        status: "active",
        speakerStatus,
        createdAt,
      })
      .run();
  } else if (speakerStatus !== existing.speakerStatus) {
    db.update(schema.eventContacts)
      .set({ speakerStatus })
      .where(eq(schema.eventContacts.id, existing.id))
      .run();
  }

  revalidateSpeakers(slug);
}

export async function updateSpeakerStatusAction(formData: FormData) {
  const slug = String(formData.get("slug") || "");
  const contactId = String(formData.get("contactId") || "");
  const speakerStatus = String(formData.get("speakerStatus") || "");
  const { event } = await requireEventRole(slug, ["organizer"]);
  if (!contactId || !speakerStatus) throw new Error("Invalid input");
  if (!SPEAKER_STATUSES.includes(speakerStatus as (typeof SPEAKER_STATUSES)[number])) {
    throw new Error("Invalid speaker status");
  }

  const db = getDb();
  db.update(schema.eventContacts)
    .set({ speakerStatus })
    .where(
      and(
        eq(schema.eventContacts.eventId, event.id),
        eq(schema.eventContacts.contactId, contactId),
      ),
    )
    .run();

  revalidateSpeakers(slug);
  revalidatePath(`/admin/e/${slug}/speakers/${contactId}`);
}

export async function saveSpeakerProfileAction(formData: FormData) {
  const slug = String(formData.get("slug") || "");
  const contactId = String(formData.get("contactId") || "");
  const { event } = await requireEventRole(slug, ["organizer"]);
  if (!contactId) throw new Error("Invalid contact");

  const db = getDb();
  const link = db
    .select()
    .from(schema.eventContacts)
    .where(
      and(
        eq(schema.eventContacts.eventId, event.id),
        eq(schema.eventContacts.contactId, contactId),
      ),
    )
    .get();
  if (!link) throw new Error("Speaker not found");

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
      facebookUrl: str("facebookUrl") || null,
      websiteUrl: str("websiteUrl") || null,
      dietary: str("dietary") || null,
      tshirtSize: str("tshirtSize") || null,
      headshotUrl: str("headshotUrl") || null,
    })
    .where(eq(schema.contacts.id, contactId))
    .run();

  revalidateSpeakers(slug);
  revalidatePath(`/admin/e/${slug}/speakers/${contactId}`);
}

export async function sendBulkSpeakerEmailAction(formData: FormData) {
  const slug = String(formData.get("slug") || "");
  const { event } = await requireEventRole(slug, ["organizer"]);
  const contactIds = formData.getAll("contactIds").map(String).filter(Boolean);
  const templateKey = String(formData.get("templateKey") || "").trim();
  const subject = String(formData.get("subject") || "").trim();
  const bodyHtml = String(formData.get("bodyHtml") || "").trim();

  if (!contactIds.length) {
    throw new Error("Select at least one speaker");
  }
  if (!subject || !bodyHtml) {
    throw new Error("Subject and message body are required");
  }

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

  for (const contactId of contactIds) {
    const row = db
      .select({ contact: schema.contacts })
      .from(schema.eventContacts)
      .innerJoin(schema.contacts, eq(schema.eventContacts.contactId, schema.contacts.id))
      .where(
        and(
          eq(schema.eventContacts.eventId, event.id),
          eq(schema.eventContacts.contactId, contactId),
        ),
      )
      .get();

    if (!row) continue;

    const { contact } = row;
    const fields = {
      speaker_name: `${contact.firstName} ${contact.lastName}`,
      first_name: contact.firstName,
      event_name: event.name,
      portal_link: portalLink(),
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

  revalidatePath(`/admin/e/${slug}/emails`);
}
