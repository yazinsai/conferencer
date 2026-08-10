"use server";

import { and, count, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireEventRole } from "@/lib/auth/guards";
import { getDb, schema } from "@/lib/db";
import { nowIso } from "@/lib/dates";
import { id } from "@/lib/id";

function revalidateForm(slug: string, formId: string) {
  revalidatePath(`/admin/e/${slug}/forms`);
  revalidatePath(`/admin/e/${slug}/forms/${formId}/edit`);
  revalidatePath(`/e/${slug}/submit/${formId}`);
}

function bool(formData: FormData, key: string) {
  return formData.get(key) === "on" || formData.get(key) === "true";
}

function parseAdminIds(formData: FormData) {
  const raw = formData.getAll("notifyAdminUserIds");
  return JSON.stringify(raw.map(String));
}

export async function saveFormWizardAction(formData: FormData) {
  const slug = String(formData.get("slug") || "");
  const formId = String(formData.get("formId") || "");
  const step = Number(formData.get("step") || 1);
  const { event } = await requireEventRole(slug, ["organizer"]);
  const db = getDb();

  const form = db
    .select()
    .from(schema.submissionForms)
    .where(and(eq(schema.submissionForms.id, formId), eq(schema.submissionForms.eventId, event.id)))
    .get();
  if (!form) throw new Error("Form not found");

  if (step === 1) {
    db.update(schema.submissionForms)
      .set({
        collects: String(formData.get("collects") || "abstracts"),
        collectParticipants: bool(formData, "collectParticipants"),
      })
      .where(eq(schema.submissionForms.id, formId))
      .run();
  } else if (step === 2) {
    db.update(schema.submissionForms)
      .set({
        name: String(formData.get("name") || form.name),
        title: String(formData.get("title") || form.title),
        pageHeading: String(formData.get("pageHeading") || "") || null,
        welcomeMessage: String(formData.get("welcomeMessage") || "") || null,
        showWelcome: bool(formData, "showWelcome"),
      })
      .where(eq(schema.submissionForms.id, formId))
      .run();
  } else if (step === 3) {
    const sectionId = String(formData.get("sectionId") || "");
    if (sectionId) {
      db.update(schema.formSections)
        .set({
          title: String(formData.get("sectionTitle") || "") || null,
          heading: String(formData.get("sectionHeading") || "") || null,
          description: String(formData.get("sectionDescription") || "") || null,
        })
        .where(and(eq(schema.formSections.id, sectionId), eq(schema.formSections.formId, formId)))
        .run();
    }
  } else if (step === 4) {
    const sectionId = String(formData.get("sectionId") || "");
    if (sectionId) {
      db.update(schema.formSections)
        .set({
          title: String(formData.get("sectionTitle") || "") || null,
          heading: String(formData.get("sectionHeading") || "") || null,
          description: String(formData.get("sectionDescription") || "") || null,
        })
        .where(and(eq(schema.formSections.id, sectionId), eq(schema.formSections.formId, formId)))
        .run();
    }
    const roleConfigId = String(formData.get("roleConfigId") || "");
    if (roleConfigId) {
      db.update(schema.participantRoleConfigs)
        .set({
          minCount: Number(formData.get("speakerMin") || 1),
          maxCount: Number(formData.get("speakerMax") || 5),
          enabled: bool(formData, "speakerEnabled"),
        })
        .where(
          and(
            eq(schema.participantRoleConfigs.id, roleConfigId),
            eq(schema.participantRoleConfigs.formId, formId),
          ),
        )
        .run();
    }
  } else if (step === 6) {
    const closesAtRaw = String(formData.get("closesAt") || "");
    const closesAt = closesAtRaw ? new Date(closesAtRaw).toISOString() : null;
    const limitRaw = String(formData.get("submissionLimit") || "");
    db.update(schema.submissionForms)
      .set({
        closesAt,
        submissionLimit: limitRaw ? Number(limitRaw) : null,
        allowDrafts: bool(formData, "allowDrafts"),
        allowMultipleDrafts: bool(formData, "allowMultipleDrafts"),
        successMessage: String(formData.get("successMessage") || "") || null,
        autoRedirectToPortal: bool(formData, "autoRedirectToPortal"),
        redirectSeconds: Number(formData.get("redirectSeconds") || 10),
        status: closesAt && new Date(closesAt) < new Date() ? "closed" : "open",
      })
      .where(eq(schema.submissionForms.id, formId))
      .run();
  } else if (step === 7) {
    db.update(schema.submissionForms)
      .set({
        notifyAdminUserIds: parseAdminIds(formData),
        sendConfirmationEmail: bool(formData, "sendConfirmationEmail"),
        confirmationEmailBody: String(formData.get("confirmationEmailBody") || "") || null,
      })
      .where(eq(schema.submissionForms.id, formId))
      .run();
  }

  revalidateForm(slug, formId);
  redirect(`/admin/e/${slug}/forms/${formId}/edit?step=${step}&saved=1`);
}

export async function addQuestionAction(formData: FormData) {
  const slug = String(formData.get("slug") || "");
  const formId = String(formData.get("formId") || "");
  const sectionId = String(formData.get("sectionId") || "");
  const fieldId = String(formData.get("fieldId") || "");
  const step = String(formData.get("step") || "3");
  const { event } = await requireEventRole(slug, ["organizer"]);
  const db = getDb();

  const section = db
    .select()
    .from(schema.formSections)
    .where(and(eq(schema.formSections.id, sectionId), eq(schema.formSections.formId, formId)))
    .get();
  if (!section) throw new Error("Section not found");

  const field = db
    .select()
    .from(schema.fields)
    .where(and(eq(schema.fields.id, fieldId), eq(schema.fields.eventId, event.id)))
    .get();
  if (!field) throw new Error("Field not found");

  const existing = db
    .select()
    .from(schema.formQuestions)
    .where(
      and(
        eq(schema.formQuestions.formId, formId),
        eq(schema.formQuestions.sectionId, sectionId),
        eq(schema.formQuestions.fieldId, fieldId),
      ),
    )
    .get();
  if (existing) {
    redirect(`/admin/e/${slug}/forms/${formId}/edit?step=${step}`);
  }

  const maxSort = db
    .select({ c: count() })
    .from(schema.formQuestions)
    .where(eq(schema.formQuestions.sectionId, sectionId))
    .get();

  const lockedKeys = ["title", "first_name", "last_name", "email"];
  db.insert(schema.formQuestions)
    .values({
      id: id("q"),
      formId,
      sectionId,
      fieldId,
      isRequired: lockedKeys.includes(field.key),
      isLocked: lockedKeys.includes(field.key),
      sortOrder: Number(maxSort?.c ?? 0),
    })
    .run();

  revalidateForm(slug, formId);
  redirect(`/admin/e/${slug}/forms/${formId}/edit?step=${step}`);
}

export async function toggleQuestionRequiredAction(formData: FormData) {
  const slug = String(formData.get("slug") || "");
  const formId = String(formData.get("formId") || "");
  const questionId = String(formData.get("questionId") || "");
  const step = String(formData.get("step") || "3");
  const { event } = await requireEventRole(slug, ["organizer"]);
  const db = getDb();

  const q = db
    .select()
    .from(schema.formQuestions)
    .where(and(eq(schema.formQuestions.id, questionId), eq(schema.formQuestions.formId, formId)))
    .get();
  if (!q) throw new Error("Question not found");
  if (q.isLocked) throw new Error("Locked questions cannot be changed");

  db.update(schema.formQuestions)
    .set({ isRequired: !q.isRequired })
    .where(eq(schema.formQuestions.id, questionId))
    .run();

  revalidateForm(slug, formId);
  redirect(`/admin/e/${slug}/forms/${formId}/edit?step=${step}`);
}

export async function removeQuestionAction(formData: FormData) {
  const slug = String(formData.get("slug") || "");
  const formId = String(formData.get("formId") || "");
  const questionId = String(formData.get("questionId") || "");
  const step = String(formData.get("step") || "3");
  await requireEventRole(slug, ["organizer"]);
  const db = getDb();

  const q = db
    .select()
    .from(schema.formQuestions)
    .where(and(eq(schema.formQuestions.id, questionId), eq(schema.formQuestions.formId, formId)))
    .get();
  if (!q) throw new Error("Question not found");
  if (q.isLocked) throw new Error("Locked questions cannot be removed");

  db.delete(schema.formQuestions).where(eq(schema.formQuestions.id, questionId)).run();

  revalidateForm(slug, formId);
  redirect(`/admin/e/${slug}/forms/${formId}/edit?step=${step}`);
}

export async function moveQuestionAction(formData: FormData) {
  const slug = String(formData.get("slug") || "");
  const formId = String(formData.get("formId") || "");
  const questionId = String(formData.get("questionId") || "");
  const direction = String(formData.get("direction") || "") as "up" | "down";
  const step = String(formData.get("step") || "3");
  await requireEventRole(slug, ["organizer"]);
  const db = getDb();

  const sectionId = db
    .select({ sectionId: schema.formQuestions.sectionId })
    .from(schema.formQuestions)
    .where(eq(schema.formQuestions.id, questionId))
    .get()?.sectionId;
  if (!sectionId) throw new Error("Question not found");

  const items = db
    .select()
    .from(schema.formQuestions)
    .where(eq(schema.formQuestions.sectionId, sectionId))
    .orderBy(schema.formQuestions.sortOrder)
    .all();

  const idx = items.findIndex((i) => i.id === questionId);
  if (idx < 0) return redirect(`/admin/e/${slug}/forms/${formId}/edit?step=${step}`);
  const swapIdx = direction === "up" ? idx - 1 : idx + 1;
  if (swapIdx < 0 || swapIdx >= items.length) {
    return redirect(`/admin/e/${slug}/forms/${formId}/edit?step=${step}`);
  }

  const current = items[idx];
  const other = items[swapIdx];
  db.update(schema.formQuestions)
    .set({ sortOrder: other.sortOrder })
    .where(eq(schema.formQuestions.id, current.id))
    .run();
  db.update(schema.formQuestions)
    .set({ sortOrder: current.sortOrder })
    .where(eq(schema.formQuestions.id, other.id))
    .run();

  revalidateForm(slug, formId);
  redirect(`/admin/e/${slug}/forms/${formId}/edit?step=${step}`);
}
