"use server";

import { and, count, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireEventRole } from "@/lib/auth/guards";
import { getDb, schema } from "@/lib/db";
import { nowIso } from "@/lib/dates";
import { id } from "@/lib/id";

function revalidateForms(slug: string, formId?: string) {
  revalidatePath(`/admin/e/${slug}/forms`);
  if (formId) {
    revalidatePath(`/admin/e/${slug}/forms/${formId}/edit`);
    revalidatePath(`/e/${slug}/submit/${formId}`);
  }
}

function bootstrapForm(eventId: string, overrides?: Partial<typeof schema.submissionForms.$inferInsert>) {
  const db = getDb();
  const createdAt = nowIso();
  const formId = id("frm");

  const fields = db
    .select()
    .from(schema.fields)
    .where(eq(schema.fields.eventId, eventId))
    .all();
  const fieldByKey = Object.fromEntries(fields.map((f) => [f.key, f]));

  db.insert(schema.submissionForms)
    .values({
      id: formId,
      eventId,
      name: "New submission form",
      title: "Submit a proposal",
      pageHeading: "Call for Speakers",
      welcomeMessage: "<p>Welcome! Tell us about your session.</p>",
      showWelcome: true,
      collects: "abstracts",
      collectParticipants: true,
      allowDrafts: true,
      allowMultipleDrafts: false,
      autoRedirectToPortal: true,
      redirectSeconds: 10,
      sendConfirmationEmail: true,
      notifyAdminUserIds: "[]",
      status: "open",
      createdAt,
      ...overrides,
    })
    .run();

  const sectionSub = id("sec");
  const sectionPart = id("sec");
  db.insert(schema.formSections)
    .values([
      {
        id: sectionSub,
        formId,
        kind: "submission",
        title: "Abstract Information",
        heading: "Tell us about your session",
        description: "",
        sortOrder: 0,
      },
      {
        id: sectionPart,
        formId,
        kind: "participant",
        title: "Participant Information",
        heading: "Who is speaking?",
        description: "",
        sortOrder: 1,
      },
    ])
    .run();

  const lockedSession = ["title"] as const;
  let sort = 0;
  for (const key of lockedSession) {
    const field = fieldByKey[key];
    if (!field) continue;
    db.insert(schema.formQuestions)
      .values({
        id: id("q"),
        formId,
        sectionId: sectionSub,
        fieldId: field.id,
        isRequired: true,
        isLocked: true,
        sortOrder: sort++,
      })
      .run();
  }

  const lockedContact = ["first_name", "last_name", "email"] as const;
  sort = 0;
  for (const key of lockedContact) {
    const field = fieldByKey[key];
    if (!field) continue;
    db.insert(schema.formQuestions)
      .values({
        id: id("q"),
        formId,
        sectionId: sectionPart,
        fieldId: field.id,
        isRequired: true,
        isLocked: true,
        sortOrder: sort++,
      })
      .run();
  }

  db.insert(schema.participantRoleConfigs)
    .values({
      id: id("prc"),
      formId,
      role: "speaker",
      enabled: true,
      minCount: 1,
      maxCount: 5,
    })
    .run();

  return formId;
}

export async function createFormAction(formData: FormData) {
  const slug = String(formData.get("slug") || "");
  const { event } = await requireEventRole(slug, ["organizer"]);
  const formId = bootstrapForm(event.id);
  revalidateForms(slug);
  redirect(`/admin/e/${slug}/forms/${formId}/edit?step=1`);
}

export async function duplicateFormAction(formData: FormData) {
  const slug = String(formData.get("slug") || "");
  const sourceId = String(formData.get("formId") || "");
  const { event } = await requireEventRole(slug, ["organizer"]);
  const db = getDb();

  const source = db
    .select()
    .from(schema.submissionForms)
    .where(and(eq(schema.submissionForms.id, sourceId), eq(schema.submissionForms.eventId, event.id)))
    .get();
  if (!source) throw new Error("Form not found");

  const newFormId = id("frm");
  const createdAt = nowIso();
  const { id: _id, createdAt: _ca, ...rest } = source;

  db.insert(schema.submissionForms)
    .values({
      ...rest,
      id: newFormId,
      name: `${source.name} (copy)`,
      createdAt,
    })
    .run();

  const sections = db
    .select()
    .from(schema.formSections)
    .where(eq(schema.formSections.formId, sourceId))
    .all();
  const sectionMap = new Map<string, string>();
  for (const sec of sections) {
    const newSecId = id("sec");
    sectionMap.set(sec.id, newSecId);
    db.insert(schema.formSections)
      .values({
        id: newSecId,
        formId: newFormId,
        kind: sec.kind,
        title: sec.title,
        heading: sec.heading,
        description: sec.description,
        sortOrder: sec.sortOrder,
      })
      .run();
  }

  const questions = db
    .select()
    .from(schema.formQuestions)
    .where(eq(schema.formQuestions.formId, sourceId))
    .all();
  const questionMap = new Map<string, string>();
  for (const q of questions) {
    const newQId = id("q");
    questionMap.set(q.id, newQId);
  }
  for (const q of questions) {
    let condition = q.condition;
    if (condition) {
      try {
        const parsed = JSON.parse(condition) as { question_id?: string };
        if (parsed.question_id && questionMap.has(parsed.question_id)) {
          parsed.question_id = questionMap.get(parsed.question_id)!;
          condition = JSON.stringify(parsed);
        }
      } catch {
        /* keep as-is */
      }
    }
    db.insert(schema.formQuestions)
      .values({
        id: questionMap.get(q.id)!,
        formId: newFormId,
        sectionId: sectionMap.get(q.sectionId)!,
        fieldId: q.fieldId,
        labelOverride: q.labelOverride,
        helpText: q.helpText,
        isRequired: q.isRequired,
        isLocked: q.isLocked,
        sortOrder: q.sortOrder,
        condition,
      })
      .run();
  }

  const roleConfigs = db
    .select()
    .from(schema.participantRoleConfigs)
    .where(eq(schema.participantRoleConfigs.formId, sourceId))
    .all();
  for (const rc of roleConfigs) {
    db.insert(schema.participantRoleConfigs)
      .values({
        id: id("prc"),
        formId: newFormId,
        role: rc.role,
        enabled: rc.enabled,
        minCount: rc.minCount,
        maxCount: rc.maxCount,
      })
      .run();
  }

  revalidateForms(slug, newFormId);
  redirect(`/admin/e/${slug}/forms/${newFormId}/edit?step=1`);
}

export async function deleteFormAction(formData: FormData) {
  const slug = String(formData.get("slug") || "");
  const formId = String(formData.get("formId") || "");
  const { event } = await requireEventRole(slug, ["organizer"]);
  const db = getDb();

  const linked = db
    .select({ c: count() })
    .from(schema.submissions)
    .where(and(eq(schema.submissions.formId, formId), eq(schema.submissions.eventId, event.id)))
    .get();
  if (Number(linked?.c ?? 0) > 0) {
    throw new Error("Cannot delete a form with existing submissions");
  }

  db.delete(schema.formQuestions).where(eq(schema.formQuestions.formId, formId)).run();
  db.delete(schema.formSections).where(eq(schema.formSections.formId, formId)).run();
  db.delete(schema.participantRoleConfigs)
    .where(eq(schema.participantRoleConfigs.formId, formId))
    .run();
  db.delete(schema.submissionForms)
    .where(and(eq(schema.submissionForms.id, formId), eq(schema.submissionForms.eventId, event.id)))
    .run();

  revalidateForms(slug);
  redirect(`/admin/e/${slug}/forms`);
}
