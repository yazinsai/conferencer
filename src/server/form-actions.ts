"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireOrganizer } from "@/lib/guards";
import { normalizeLocal } from "@/lib/datetime";
import { textToOptions, type FieldType } from "@/lib/fields";
import {
  addQuestion,
  createField,
  createForm,
  deleteForm,
  deleteQuestion,
  duplicateForm,
  getForm,
  getQuestion,
  moveQuestion,
  sectionOfKind,
  setRoleConfig,
  updateForm,
  updateQuestion,
  updateSection,
} from "@/lib/repo/forms";

async function ctx(formData: FormData) {
  const slug = String(formData.get("slug"));
  const auth = await requireOrganizer(slug);
  return { slug, ...auth };
}

export async function createFormAction(formData: FormData) {
  const { slug, event } = await ctx(formData);
  const name = String(formData.get("name") ?? "").trim() || "Untitled form";
  const form = createForm(event.id, {
    name,
    title: name,
    page_heading: `Submit to ${event.name}`,
    collects: (String(formData.get("collects") ?? "abstracts") as "abstracts" | "sessions"),
    status: "closed",
  });
  const submission = sectionOfKind(form.id, "submission");
  sectionOfKind(form.id, "welcome");
  sectionOfKind(form.id, "participant");
  sectionOfKind(form.id, "review");

  // Every form starts with the locked essentials so it is usable immediately.
  const titleField = createField(event.id, {
    scope: "session",
    key: "title",
    label: "Title",
    type: "text",
    is_standard: true,
  });
  const descField = createField(event.id, {
    scope: "session",
    key: "description",
    label: "Description",
    type: "textarea",
    is_standard: true,
  });
  addQuestion({ formId: form.id, sectionId: submission.id, fieldId: titleField.id, isRequired: true, isLocked: true });
  addQuestion({ formId: form.id, sectionId: submission.id, fieldId: descField.id, isRequired: true });

  const participant = sectionOfKind(form.id, "participant");
  for (const key of ["first_name", "last_name", "email"] as const) {
    const field = createField(event.id, {
      scope: "contact",
      key,
      label: key === "first_name" ? "First Name" : key === "last_name" ? "Last Name" : "Email",
      type: key === "email" ? "email" : "text",
      is_standard: true,
    });
    addQuestion({
      formId: form.id,
      sectionId: participant.id,
      fieldId: field.id,
      isRequired: true,
      isLocked: true,
    });
  }
  setRoleConfig(form.id, "speaker", { enabled: true, min_count: 1, max_count: 5 });

  revalidatePath(`/admin/e/${slug}/forms`);
  redirect(`/admin/e/${slug}/forms/${form.id}?step=1`);
}

export async function duplicateFormAction(formData: FormData) {
  const { slug } = await ctx(formData);
  const copy = duplicateForm(String(formData.get("id")));
  revalidatePath(`/admin/e/${slug}/forms`);
  if (copy) redirect(`/admin/e/${slug}/forms/${copy.id}?step=1`);
}

export async function deleteFormAction(formData: FormData) {
  const { slug, event } = await ctx(formData);
  const form = getForm(String(formData.get("id")));
  if (form && form.event_id === event.id) deleteForm(form.id);
  revalidatePath(`/admin/e/${slug}/forms`);
  redirect(`/admin/e/${slug}/forms`);
}

export async function saveFormStepAction(formData: FormData) {
  const { slug, event } = await ctx(formData);
  const formId = String(formData.get("id"));
  const form = getForm(formId);
  if (!form || form.event_id !== event.id) return;
  const step = Number(formData.get("step") ?? 1);

  const patch: Record<string, unknown> = {};
  const text = (key: string) => (formData.has(key) ? String(formData.get(key)) : undefined);
  const flag = (key: string) => (formData.has(`${key}__present`) ? (formData.get(key) ? 1 : 0) : undefined);
  const num = (key: string) => {
    if (!formData.has(key)) return undefined;
    const raw = String(formData.get(key)).trim();
    return raw === "" ? null : Number(raw);
  };

  if (step === 1) {
    patch.collects = text("collects");
    patch.collect_participants = flag("collect_participants");
  }
  if (step === 2) {
    patch.name = text("name");
    patch.title = text("title");
    patch.page_heading = text("page_heading");
    patch.welcome_message = text("welcome_message");
    patch.show_welcome = flag("show_welcome");
  }
  if (step === 3 || step === 4) {
    const kind = step === 3 ? "submission" : "participant";
    const section = sectionOfKind(formId, kind);
    updateSection(section.id, {
      title: text("section_title") ?? null,
      heading: text("section_heading") ?? null,
      description: text("section_description") ?? null,
    });
    if (step === 4) {
      for (const role of ["speaker", "moderator", "chairperson"]) {
        setRoleConfig(formId, role, {
          enabled: Boolean(formData.get(`role_${role}_enabled`)),
          min_count: Number(formData.get(`role_${role}_min`) ?? 0),
          max_count: Number(formData.get(`role_${role}_max`) ?? 5),
        });
      }
    }
  }
  if (step === 6) {
    patch.closes_at = normalizeLocal(String(formData.get("closes_at") ?? "")) ?? null;
    patch.opens_at = normalizeLocal(String(formData.get("opens_at") ?? "")) ?? null;
    patch.submission_limit = num("submission_limit");
    patch.allow_drafts = flag("allow_drafts");
    patch.allow_multiple_drafts = flag("allow_multiple_drafts");
    patch.success_message = text("success_message");
    patch.auto_redirect_to_portal = flag("auto_redirect_to_portal");
    patch.redirect_seconds = num("redirect_seconds");
    patch.status = text("status");
    const combinedKeys = String(formData.get("combined_keys") ?? "").trim();
    const combinedMax = String(formData.get("combined_max") ?? "").trim();
    patch.combined_limit =
      combinedKeys && combinedMax
        ? JSON.stringify({
            question_keys: combinedKeys.split(",").map((k) => k.trim()).filter(Boolean),
            max: Number(combinedMax),
            label: String(formData.get("combined_label") ?? "Combined character limit"),
          })
        : null;
  }
  if (step === 7) {
    patch.notify_admin_user_ids = JSON.stringify(formData.getAll("notify_admin_user_ids").map(String));
    patch.notify_on_revision = flag("notify_on_revision");
    patch.send_confirmation_email = flag("send_confirmation_email");
    patch.confirmation_email_subject = text("confirmation_email_subject");
    patch.confirmation_email_body = text("confirmation_email_body");
  }
  if (formData.has("track_routing")) {
    patch.track_routing = String(formData.get("track_routing"));
  }

  const clean = Object.fromEntries(
    Object.entries(patch).filter(([, value]) => value !== undefined),
  );
  updateForm(formId, clean);

  revalidatePath(`/admin/e/${slug}`, "layout");
  revalidatePath(`/e/${slug}`, "layout");

  const next = String(formData.get("next_step") ?? step);
  redirect(`/admin/e/${slug}/forms/${formId}?step=${next}&saved=1`);
}

export async function setFormStatusAction(formData: FormData) {
  const { slug, event } = await ctx(formData);
  const formId = String(formData.get("id"));
  const form = getForm(formId);
  if (!form || form.event_id !== event.id) return;
  updateForm(formId, { status: String(formData.get("status")) as "open" | "closed" });
  revalidatePath(`/admin/e/${slug}`, "layout");
  revalidatePath(`/e/${slug}`, "layout");
}

export async function addQuestionAction(formData: FormData) {
  const { slug, event } = await ctx(formData);
  const formId = String(formData.get("id"));
  const form = getForm(formId);
  if (!form || form.event_id !== event.id) return;
  const kind = String(formData.get("kind") ?? "submission") as "submission" | "participant";
  const section = sectionOfKind(formId, kind);

  let fieldId = String(formData.get("field_id") ?? "");
  if (fieldId === "__new__" || !fieldId) {
    const label = String(formData.get("new_label") ?? "").trim();
    if (!label) return;
    const field = createField(event.id, {
      scope: kind === "submission" ? "session" : "contact",
      label,
      type: String(formData.get("new_type") ?? "text") as FieldType,
      options: JSON.stringify(textToOptions(String(formData.get("new_options") ?? ""))),
      max_length: formData.get("new_max_length") ? Number(formData.get("new_max_length")) : null,
      help_text: String(formData.get("new_help") ?? "") || null,
    });
    fieldId = field.id;
  }

  addQuestion({
    formId,
    sectionId: section.id,
    fieldId,
    isRequired: Boolean(formData.get("is_required")),
    helpText: String(formData.get("help_text") ?? "") || null,
  });
  revalidatePath(`/admin/e/${slug}`, "layout");
  revalidatePath(`/e/${slug}`, "layout");
}

export async function updateQuestionAction(formData: FormData) {
  const { slug, event } = await ctx(formData);
  const questionId = String(formData.get("question_id"));
  const question = getQuestion(questionId);
  if (!question) return;
  const form = getForm(question.form_id);
  if (!form || form.event_id !== event.id) return;

  const conditionQuestion = String(formData.get("condition_question_id") ?? "");
  const condition = conditionQuestion
    ? JSON.stringify({
        question_id: conditionQuestion,
        operator: String(formData.get("condition_operator") ?? "equals"),
        value: String(formData.get("condition_value") ?? ""),
      })
    : null;

  updateQuestion(questionId, {
    label_override: String(formData.get("label_override") ?? "") || null,
    help_text: String(formData.get("help_text") ?? "") || null,
    // Locked questions can never be made optional (R-FORM-5).
    is_required: question.is_locked ? 1 : formData.get("is_required") ? 1 : 0,
    condition,
  });
  revalidatePath(`/admin/e/${slug}`, "layout");
  revalidatePath(`/e/${slug}`, "layout");
}

export async function deleteQuestionAction(formData: FormData) {
  const { slug, event } = await ctx(formData);
  const questionId = String(formData.get("question_id"));
  const question = getQuestion(questionId);
  if (!question) return;
  const form = getForm(question.form_id);
  if (!form || form.event_id !== event.id) return;
  deleteQuestion(questionId);
  revalidatePath(`/admin/e/${slug}`, "layout");
  revalidatePath(`/e/${slug}`, "layout");
}

export async function moveQuestionAction(formData: FormData) {
  const { slug, event } = await ctx(formData);
  const questionId = String(formData.get("question_id"));
  const question = getQuestion(questionId);
  if (!question) return;
  const form = getForm(question.form_id);
  if (!form || form.event_id !== event.id) return;
  moveQuestion(questionId, Number(formData.get("direction")) as -1 | 1);
  revalidatePath(`/admin/e/${slug}`, "layout");
  revalidatePath(`/e/${slug}`, "layout");
}

export async function duplicateQuestionAction(formData: FormData) {
  const { slug, event } = await ctx(formData);
  const questionId = String(formData.get("question_id"));
  const question = getQuestion(questionId);
  if (!question) return;
  const form = getForm(question.form_id);
  if (!form || form.event_id !== event.id) return;
  addQuestion({
    formId: question.form_id,
    sectionId: question.section_id,
    fieldId: question.field_id,
    isRequired: Boolean(question.is_required),
    labelOverride: question.label_override ? `${question.label_override} (copy)` : null,
    helpText: question.help_text,
    condition: question.condition,
  });
  revalidatePath(`/admin/e/${slug}`, "layout");
}
