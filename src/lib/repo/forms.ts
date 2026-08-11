import { all, get, run } from "../db";
import { id } from "../ids";
import { nowIso, isPast, isFuture, normalizeLocal } from "../datetime";
import type { FieldType } from "../fields";

export type Field = {
  id: string;
  event_id: string;
  scope: "session" | "contact";
  key: string;
  label: string;
  type: FieldType;
  options: string;
  max_length: number | null;
  help_text: string | null;
  is_standard: number;
  sort_order: number;
  created_at: string;
};

export type SubmissionForm = {
  id: string;
  event_id: string;
  name: string;
  title: string;
  page_heading: string | null;
  welcome_message: string | null;
  show_welcome: number;
  collects: "abstracts" | "sessions";
  collect_participants: number;
  opens_at: string | null;
  closes_at: string | null;
  submission_limit: number | null;
  allow_drafts: number;
  allow_multiple_drafts: number;
  success_message: string | null;
  auto_redirect_to_portal: number;
  redirect_seconds: number;
  send_confirmation_email: number;
  confirmation_email_subject: string | null;
  confirmation_email_body: string | null;
  notify_admin_user_ids: string;
  notify_on_revision: number;
  combined_limit: string | null;
  track_routing: string;
  status: "open" | "closed";
  created_at: string;
  updated_at: string;
};

export type FormSection = {
  id: string;
  form_id: string;
  kind: "welcome" | "submission" | "participant" | "review";
  title: string | null;
  heading: string | null;
  description: string | null;
  sort_order: number;
};

export type FormQuestion = {
  id: string;
  form_id: string;
  section_id: string;
  field_id: string;
  label_override: string | null;
  help_text: string | null;
  is_required: number;
  is_locked: number;
  sort_order: number;
  condition: string | null;
};

export type QuestionWithField = FormQuestion & {
  label: string;
  key: string;
  type: FieldType;
  options: string;
  max_length: number | null;
  scope: "session" | "contact";
  field_help: string | null;
  is_standard: number;
};

export type RoleConfig = {
  id: string;
  form_id: string;
  role: string;
  enabled: number;
  min_count: number;
  max_count: number;
};

/* ---------------------------------------------------------------- fields -- */

export function listFields(eventId: string, scope?: "session" | "contact"): Field[] {
  return scope
    ? all<Field>(
        "SELECT * FROM fields WHERE event_id = ? AND scope = ? ORDER BY is_standard DESC, sort_order, label",
        eventId,
        scope,
      )
    : all<Field>(
        "SELECT * FROM fields WHERE event_id = ? ORDER BY scope, is_standard DESC, sort_order, label",
        eventId,
      );
}

export function getField(fieldId: string): Field | undefined {
  return get<Field>("SELECT * FROM fields WHERE id = ?", fieldId);
}

export function findField(
  eventId: string,
  scope: "session" | "contact",
  key: string,
): Field | undefined {
  return get<Field>(
    "SELECT * FROM fields WHERE event_id = ? AND scope = ? AND key = ?",
    eventId,
    scope,
    key,
  );
}

export function createField(
  eventId: string,
  input: {
    scope: "session" | "contact";
    key?: string;
    label: string;
    type: FieldType;
    options?: string;
    max_length?: number | null;
    help_text?: string | null;
    is_standard?: boolean;
  },
): Field {
  const key =
    input.key ??
    uniqueKey(
      eventId,
      input.scope,
      input.label
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/^_|_$/g, "") || "field",
    );
  const existing = findField(eventId, input.scope, key);
  if (existing) return existing;
  const fieldId = id();
  run(
    `INSERT INTO fields (id, event_id, scope, key, label, type, options, max_length, help_text, is_standard, sort_order, created_at)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
    fieldId,
    eventId,
    input.scope,
    key,
    input.label,
    input.type,
    input.options ?? "[]",
    input.max_length ?? null,
    input.help_text ?? null,
    input.is_standard ? 1 : 0,
    get<{ n: number }>(
      "SELECT COALESCE(MAX(sort_order),-1)+1 AS n FROM fields WHERE event_id = ? AND scope = ?",
      eventId,
      input.scope,
    )?.n ?? 0,
    nowIso(),
  );
  return getField(fieldId)!;
}

function uniqueKey(eventId: string, scope: string, base: string): string {
  let candidate = base;
  let n = 2;
  while (
    get("SELECT id FROM fields WHERE event_id = ? AND scope = ? AND key = ?", eventId, scope, candidate)
  ) {
    candidate = `${base}_${n++}`;
  }
  return candidate;
}

export function updateField(fieldId: string, patch: Partial<Field>) {
  const keys = ["label", "type", "options", "max_length", "help_text", "sort_order"] as const;
  const sets: string[] = [];
  const params: unknown[] = [];
  for (const key of keys) {
    if (key in patch) {
      sets.push(`${key} = ?`);
      params.push(patch[key] ?? null);
    }
  }
  if (!sets.length) return;
  params.push(fieldId);
  run(`UPDATE fields SET ${sets.join(", ")} WHERE id = ?`, ...params);
}

export function deleteField(fieldId: string) {
  run("DELETE FROM fields WHERE id = ? AND is_standard = 0", fieldId);
}

/* ----------------------------------------------------------------- forms -- */

export function listForms(eventId: string): SubmissionForm[] {
  return all<SubmissionForm>(
    "SELECT * FROM submission_forms WHERE event_id = ? ORDER BY created_at DESC",
    eventId,
  );
}

export function getForm(formId: string): SubmissionForm | undefined {
  return get<SubmissionForm>("SELECT * FROM submission_forms WHERE id = ?", formId);
}

export function defaultForm(eventId: string): SubmissionForm | undefined {
  return (
    get<SubmissionForm>(
      `SELECT * FROM submission_forms WHERE event_id = ? AND status = 'open'
        ORDER BY created_at LIMIT 1`,
      eventId,
    ) ??
    get<SubmissionForm>(
      "SELECT * FROM submission_forms WHERE event_id = ? ORDER BY created_at LIMIT 1",
      eventId,
    )
  );
}

export function createForm(eventId: string, input: Partial<SubmissionForm> = {}): SubmissionForm {
  const formId = input.id ?? id();
  run(
    `INSERT INTO submission_forms (id, event_id, name, title, page_heading, welcome_message,
        collects, collect_participants, opens_at, closes_at, submission_limit, allow_drafts,
        allow_multiple_drafts, success_message, auto_redirect_to_portal, send_confirmation_email,
        confirmation_email_subject, confirmation_email_body, notify_admin_user_ids, status,
        created_at, updated_at)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    formId,
    eventId,
    input.name ?? "Untitled form",
    input.title ?? input.name ?? "Call for Speakers",
    input.page_heading ?? null,
    input.welcome_message ?? null,
    input.collects ?? "abstracts",
    input.collect_participants ?? 1,
    input.opens_at ?? null,
    input.closes_at ?? null,
    input.submission_limit ?? null,
    input.allow_drafts ?? 1,
    input.allow_multiple_drafts ?? 1,
    input.success_message ??
      "<p>Thank you! Your submission has been received and our program committee will review it.</p>",
    input.auto_redirect_to_portal ?? 1,
    input.send_confirmation_email ?? 1,
    input.confirmation_email_subject ?? null,
    input.confirmation_email_body ?? null,
    input.notify_admin_user_ids ?? "[]",
    input.status ?? "open",
    nowIso(),
    nowIso(),
  );
  return getForm(formId)!;
}

const FORM_FIELDS = [
  "name",
  "title",
  "page_heading",
  "welcome_message",
  "show_welcome",
  "collects",
  "collect_participants",
  "opens_at",
  "closes_at",
  "submission_limit",
  "allow_drafts",
  "allow_multiple_drafts",
  "success_message",
  "auto_redirect_to_portal",
  "redirect_seconds",
  "send_confirmation_email",
  "confirmation_email_subject",
  "confirmation_email_body",
  "notify_admin_user_ids",
  "notify_on_revision",
  "combined_limit",
  "track_routing",
  "status",
] as const;

export function updateForm(formId: string, patch: Partial<SubmissionForm>) {
  const sets: string[] = [];
  const params: unknown[] = [];
  for (const key of FORM_FIELDS) {
    if (key in patch) {
      sets.push(`${key} = ?`);
      params.push(patch[key] ?? null);
    }
  }
  if (!sets.length) return;
  sets.push("updated_at = ?");
  params.push(nowIso(), formId);
  run(`UPDATE submission_forms SET ${sets.join(", ")} WHERE id = ?`, ...params);
}

export function deleteForm(formId: string) {
  run("DELETE FROM submission_forms WHERE id = ?", formId);
}

/** Open == status open AND inside the opens_at/closes_at window (R-PUB-5). */
export function formIsOpen(form: SubmissionForm): boolean {
  if (form.status !== "open") return false;
  if (form.opens_at && isFuture(form.opens_at)) return false;
  if (form.closes_at && isPast(form.closes_at)) return false;
  return true;
}

export function formClosedReason(form: SubmissionForm): string | null {
  if (form.status !== "open") return "This call for speakers is closed.";
  if (form.opens_at && isFuture(form.opens_at)) {
    return `This call for speakers opens on ${normalizeLocal(form.opens_at)}.`;
  }
  if (form.closes_at && isPast(form.closes_at)) {
    return "This call for speakers closed and is no longer accepting submissions.";
  }
  return null;
}

/* -------------------------------------------------------------- sections -- */

export function listSections(formId: string): FormSection[] {
  return all<FormSection>(
    "SELECT * FROM form_sections WHERE form_id = ? ORDER BY sort_order",
    formId,
  );
}

export function sectionOfKind(formId: string, kind: FormSection["kind"]): FormSection {
  const existing = get<FormSection>(
    "SELECT * FROM form_sections WHERE form_id = ? AND kind = ? ORDER BY sort_order LIMIT 1",
    formId,
    kind,
  );
  if (existing) return existing;
  const sectionId = id();
  const order = { welcome: 0, submission: 1, participant: 2, review: 3 }[kind];
  run(
    `INSERT INTO form_sections (id, form_id, kind, title, heading, description, sort_order)
     VALUES (?,?,?,?,?,?,?)`,
    sectionId,
    formId,
    kind,
    defaultSectionTitle(kind),
    defaultSectionTitle(kind),
    null,
    order,
  );
  return get<FormSection>("SELECT * FROM form_sections WHERE id = ?", sectionId)!;
}

function defaultSectionTitle(kind: FormSection["kind"]): string {
  switch (kind) {
    case "welcome":
      return "Welcome";
    case "submission":
      return "Abstract Information";
    case "participant":
      return "Participant Information";
    default:
      return "Review";
  }
}

export function updateSection(sectionId: string, patch: Partial<FormSection>) {
  const keys = ["title", "heading", "description", "sort_order"] as const;
  const sets: string[] = [];
  const params: unknown[] = [];
  for (const key of keys) {
    if (key in patch) {
      sets.push(`${key} = ?`);
      params.push(patch[key] ?? null);
    }
  }
  if (!sets.length) return;
  params.push(sectionId);
  run(`UPDATE form_sections SET ${sets.join(", ")} WHERE id = ?`, ...params);
}

/* ------------------------------------------------------------- questions -- */

export function listQuestions(formId: string, kind?: FormSection["kind"]): QuestionWithField[] {
  const rows = all<QuestionWithField>(
    `SELECT q.*, f.label AS field_label, f.key, f.type, f.options, f.max_length, f.scope,
            f.help_text AS field_help, f.is_standard
       FROM form_questions q
       JOIN fields f ON f.id = q.field_id
       JOIN form_sections s ON s.id = q.section_id
      WHERE q.form_id = ? ${kind ? "AND s.kind = ?" : ""}
      ORDER BY s.sort_order, q.sort_order`,
    ...(kind ? [formId, kind] : [formId]),
  ) as Array<QuestionWithField & { field_label: string }>;
  return rows.map((row) => ({
    ...row,
    label: row.label_override || row.field_label,
  }));
}

export function getQuestion(questionId: string): QuestionWithField | undefined {
  const row = get<QuestionWithField & { field_label: string }>(
    `SELECT q.*, f.label AS field_label, f.key, f.type, f.options, f.max_length, f.scope,
            f.help_text AS field_help, f.is_standard
       FROM form_questions q JOIN fields f ON f.id = q.field_id
      WHERE q.id = ?`,
    questionId,
  );
  if (!row) return undefined;
  return { ...row, label: row.label_override || row.field_label };
}

export function addQuestion(input: {
  formId: string;
  sectionId: string;
  fieldId: string;
  isRequired?: boolean;
  isLocked?: boolean;
  labelOverride?: string | null;
  helpText?: string | null;
  condition?: string | null;
  sortOrder?: number;
}): FormQuestion {
  const questionId = id();
  const order =
    input.sortOrder ??
    (get<{ n: number }>(
      "SELECT COALESCE(MAX(sort_order),-1)+1 AS n FROM form_questions WHERE section_id = ?",
      input.sectionId,
    )?.n ??
      0);
  run(
    `INSERT INTO form_questions (id, form_id, section_id, field_id, label_override, help_text,
        is_required, is_locked, sort_order, condition)
     VALUES (?,?,?,?,?,?,?,?,?,?)`,
    questionId,
    input.formId,
    input.sectionId,
    input.fieldId,
    input.labelOverride ?? null,
    input.helpText ?? null,
    input.isRequired ? 1 : 0,
    input.isLocked ? 1 : 0,
    order,
    input.condition ?? null,
  );
  return get<FormQuestion>("SELECT * FROM form_questions WHERE id = ?", questionId)!;
}

export function updateQuestion(questionId: string, patch: Partial<FormQuestion>) {
  const keys = ["label_override", "help_text", "is_required", "sort_order", "condition"] as const;
  const sets: string[] = [];
  const params: unknown[] = [];
  for (const key of keys) {
    if (key in patch) {
      sets.push(`${key} = ?`);
      params.push(patch[key] ?? null);
    }
  }
  if (!sets.length) return;
  params.push(questionId);
  run(`UPDATE form_questions SET ${sets.join(", ")} WHERE id = ?`, ...params);
}

export function deleteQuestion(questionId: string) {
  run("DELETE FROM form_questions WHERE id = ? AND is_locked = 0", questionId);
}

export function moveQuestion(questionId: string, direction: -1 | 1) {
  const q = get<FormQuestion>("SELECT * FROM form_questions WHERE id = ?", questionId);
  if (!q) return;
  const siblings = all<FormQuestion>(
    "SELECT * FROM form_questions WHERE section_id = ? ORDER BY sort_order, rowid",
    q.section_id,
  );
  const index = siblings.findIndex((s) => s.id === questionId);
  const target = index + direction;
  if (index < 0 || target < 0 || target >= siblings.length) return;
  const reordered = [...siblings];
  const [moved] = reordered.splice(index, 1);
  reordered.splice(target, 0, moved);
  reordered.forEach((row, i) => {
    run("UPDATE form_questions SET sort_order = ? WHERE id = ?", i, row.id);
  });
}

export function reorderQuestions(sectionId: string, orderedIds: string[]) {
  orderedIds.forEach((questionId, index) => {
    run(
      "UPDATE form_questions SET sort_order = ? WHERE id = ? AND section_id = ?",
      index,
      questionId,
      sectionId,
    );
  });
}

/* ------------------------------------------------------------ role config -- */

export const PARTICIPANT_ROLES = ["speaker", "moderator", "chairperson"] as const;

export function listRoleConfigs(formId: string): RoleConfig[] {
  const rows = all<RoleConfig>("SELECT * FROM participant_role_configs WHERE form_id = ?", formId);
  const byRole = new Map(rows.map((r) => [r.role, r]));
  return PARTICIPANT_ROLES.map(
    (role) =>
      byRole.get(role) ?? {
        id: "",
        form_id: formId,
        role,
        enabled: role === "speaker" ? 1 : 0,
        min_count: role === "speaker" ? 1 : 0,
        max_count: role === "speaker" ? 5 : 2,
      },
  );
}

export function setRoleConfig(
  formId: string,
  role: string,
  patch: { enabled: boolean; min_count: number; max_count: number },
) {
  const existing = get<RoleConfig>(
    "SELECT * FROM participant_role_configs WHERE form_id = ? AND role = ?",
    formId,
    role,
  );
  if (existing) {
    run(
      "UPDATE participant_role_configs SET enabled = ?, min_count = ?, max_count = ? WHERE id = ?",
      patch.enabled ? 1 : 0,
      patch.min_count,
      patch.max_count,
      existing.id,
    );
    return;
  }
  run(
    `INSERT INTO participant_role_configs (id, form_id, role, enabled, min_count, max_count)
     VALUES (?,?,?,?,?,?)`,
    id(),
    formId,
    role,
    patch.enabled ? 1 : 0,
    patch.min_count,
    patch.max_count,
  );
}

/* ------------------------------------------------------------- duplicate -- */

export function duplicateForm(formId: string): SubmissionForm | undefined {
  const source = getForm(formId);
  if (!source) return undefined;
  const copy = createForm(source.event_id, {
    ...source,
    id: undefined,
    name: `${source.name} (copy)`,
    status: "closed",
  });
  updateForm(copy.id, {
    show_welcome: source.show_welcome,
    redirect_seconds: source.redirect_seconds,
    notify_on_revision: source.notify_on_revision,
    combined_limit: source.combined_limit,
    track_routing: source.track_routing,
  });
  const sectionMap = new Map<string, string>();
  for (const section of listSections(formId)) {
    const created = sectionOfKind(copy.id, section.kind);
    updateSection(created.id, {
      title: section.title,
      heading: section.heading,
      description: section.description,
      sort_order: section.sort_order,
    });
    sectionMap.set(section.id, created.id);
  }
  const questionMap = new Map<string, string>();
  for (const q of listQuestions(formId)) {
    const created = addQuestion({
      formId: copy.id,
      sectionId: sectionMap.get(q.section_id) ?? sectionOfKind(copy.id, "submission").id,
      fieldId: q.field_id,
      isRequired: Boolean(q.is_required),
      isLocked: Boolean(q.is_locked),
      labelOverride: q.label_override,
      helpText: q.help_text,
      sortOrder: q.sort_order,
    });
    questionMap.set(q.id, created.id);
  }
  // Re-point conditions at the copied question ids.
  for (const q of listQuestions(formId)) {
    if (!q.condition) continue;
    const newId = questionMap.get(q.id);
    if (!newId) continue;
    try {
      const parsed = JSON.parse(q.condition) as { question_id: string };
      const mapped = questionMap.get(parsed.question_id);
      if (mapped) {
        updateQuestion(newId, {
          condition: JSON.stringify({ ...parsed, question_id: mapped }),
        });
      }
    } catch {
      /* ignore malformed condition */
    }
  }
  for (const rc of listRoleConfigs(formId)) {
    setRoleConfig(copy.id, rc.role, {
      enabled: Boolean(rc.enabled),
      min_count: rc.min_count,
      max_count: rc.max_count,
    });
  }
  return getForm(copy.id);
}
