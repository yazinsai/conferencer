"use server";

import { revalidatePath } from "next/cache";

import {
  createSession,
  createUser,
  currentUser,
  findUserByEmail,
  passwordProblem,
  verifyPassword,
  addMembership,
} from "@/lib/auth";
import { writeJson } from "@/lib/db";
import { conditionMet, parseCondition, visibleQuestionIds } from "@/lib/conditions";
import { columnForKey, parseOptions, stripHtml, validateAnswer } from "@/lib/fields";
import { appUrl, sendTemplate } from "@/lib/email";
import { adminEmails } from "@/lib/email";
import { readJson } from "@/lib/db";
import { getEventBySlug, listLookup } from "@/lib/repo/events";
import {
  formIsOpen,
  getForm,
  listQuestions,
  listRoleConfigs,
  type QuestionWithField,
} from "@/lib/repo/forms";
import {
  ensureEventContact,
  linkContactToUser,
  portalContact,
  upsertContact,
  contactName,
} from "@/lib/repo/contacts";
import {
  addParticipant,
  countSubmissionsBySubmitter,
  createSubmission,
  getSubmission,
  listParticipants,
  removeParticipant,
  updateSubmission,
} from "@/lib/repo/submissions";
import { logAudit } from "@/lib/repo/audit";
import { formatEventDates } from "@/lib/datetime";

export type WizardParticipant = {
  role: string;
  values: Record<string, string>;
};

export type WizardPayload = {
  slug: string;
  formId: string;
  submissionId?: string | null;
  answers: Record<string, string | string[]>;
  participants: WizardParticipant[];
};

export type WizardResult = {
  ok: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
  submissionId?: string;
  redirectTo?: string;
};

async function context(slug: string, formId: string) {
  const event = getEventBySlug(slug);
  if (!event) throw new Error("Event not found");
  const form = getForm(formId);
  if (!form || form.event_id !== event.id) throw new Error("Form not found");
  return { event, form };
}

/* --------------------------------------------------------------- account -- */

export async function accountAction(input: {
  mode: "signin" | "signup";
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  slug: string;
}): Promise<WizardResult> {
  const email = input.email.trim();
  if (!email.includes("@")) return { ok: false, error: "Enter a valid email address." };

  if (input.mode === "signin") {
    const user = findUserByEmail(email);
    if (!user || !verifyPassword(input.password, user.password_hash)) {
      return { ok: false, error: "That email and password did not match an account." };
    }
    await createSession(user.id);
  } else {
    const problem = passwordProblem(input.password);
    if (problem) return { ok: false, error: problem };
    const existing = findUserByEmail(email);
    if (existing) {
      // Be forgiving: if the password matches, treat it as a sign-in.
      if (verifyPassword(input.password, existing.password_hash)) {
        await createSession(existing.id);
      } else {
        return {
          ok: false,
          error: "An account with that email already exists. Use your existing password to sign in.",
        };
      }
    } else {
      const user = createUser({
        email,
        password: input.password,
        firstName: input.firstName ?? "",
        lastName: input.lastName ?? "",
      });
      await createSession(user.id);
    }
  }

  const event = getEventBySlug(input.slug);
  const user = await currentUser();
  if (event && user) {
    addMembership(event.id, user.id, "participant");
    linkContactToUser(event, user);
  }
  return { ok: true };
}

/* ------------------------------------------------------------ validation -- */

function coerce(value: string | string[] | undefined): string | string[] {
  return value === undefined ? "" : value;
}

function validate(
  questions: QuestionWithField[],
  answers: Record<string, string | string[]>,
): Record<string, string> {
  const visible = visibleQuestionIds(questions, answers);
  const errors: Record<string, string> = {};
  for (const question of questions) {
    if (!visible.has(question.id)) continue;
    const error = validateAnswer(
      { label: question.label, type: question.type, max_length: question.max_length },
      coerce(answers[question.id]),
      Boolean(question.is_required),
    );
    if (error) errors[question.id] = error;
  }
  return errors;
}

function applyAnswers(
  eventId: string,
  questions: QuestionWithField[],
  answers: Record<string, string | string[]>,
) {
  const visible = visibleQuestionIds(questions, answers);
  const columns: Record<string, unknown> = {};
  const extra: Record<string, unknown> = {};
  const tracks = listLookup("tracks", eventId);
  const formats = listLookup("formats", eventId);
  const rooms = listLookup("rooms", eventId);

  for (const question of questions) {
    // Hidden questions are neither validated nor stored (R-FORM-6).
    if (!visible.has(question.id)) continue;
    const raw = answers[question.id];
    if (raw === undefined) continue;
    const value = Array.isArray(raw) ? raw : String(raw);
    const column = columnForKey("session", question.key);

    if (question.key === "track") {
      const match = tracks.find((t) => t.id === value || t.name === value);
      columns.track_id = match?.id ?? null;
      continue;
    }
    if (question.key === "format") {
      const match = formats.find((f) => f.id === value || f.name === value);
      columns.format_id = match?.id ?? null;
      continue;
    }
    if (question.key === "location") {
      const match = rooms.find((r) => r.id === value || r.name === value);
      columns.location_id = match?.id ?? null;
      continue;
    }
    if (question.key === "tags") {
      columns.tags = writeJson(Array.isArray(value) ? value : [value].filter(Boolean));
      continue;
    }
    if (column) {
      columns[column] = Array.isArray(value) ? value.join(", ") : value;
      continue;
    }
    extra[question.key] = value;
  }
  return { columns, extra };
}

function syncParticipants(
  event: { id: string; org_id: string },
  submissionId: string,
  participants: WizardParticipant[],
  submitterContactId: string | null,
) {
  const existing = listParticipants(submissionId);
  const keep = new Set<string>();

  for (const [index, participant] of participants.entries()) {
    const email = (participant.values.email ?? "").trim();
    if (!email) continue;
    const { contact } = upsertContact(event.org_id, {
      email,
      first_name: participant.values.first_name ?? "",
      last_name: participant.values.last_name ?? "",
      job_title: participant.values.job_title ?? null,
      company: participant.values.company ?? null,
      biography: participant.values.biography ?? null,
      pronouns: participant.values.pronouns ?? null,
      linkedin_url: participant.values.linkedin_url ?? null,
      twitter_url: participant.values.twitter_url ?? null,
      website_url: participant.values.website_url ?? null,
      phone: participant.values.phone ?? null,
    });
    ensureEventContact(event.id, contact.id, { status: "active" });
    const row = addParticipant(submissionId, contact.id, participant.role || "speaker");
    keep.add(row.id);
    if (index === 0 && !submitterContactId) {
      updateSubmission(submissionId, { submitter_contact_id: contact.id });
    }
  }

  for (const row of existing) {
    if (row.role === "submitter") continue;
    if (!keep.has(row.id)) removeParticipant(row.id);
  }
}

/* ----------------------------------------------------------------- draft -- */

export async function saveDraftAction(payload: WizardPayload): Promise<WizardResult> {
  const { event, form } = await context(payload.slug, payload.formId);
  const user = await currentUser();
  if (!user) return { ok: false, error: "Create an account before saving a draft." };
  if (!form.allow_drafts) return { ok: false, error: "This form does not allow drafts." };
  if (!formIsOpen(form)) return { ok: false, error: "This call for speakers is closed." };

  const contact = portalContact(event, user) ?? linkContactToUser(event, user);
  const questions = listQuestions(form.id, "submission");
  const { columns, extra } = applyAnswers(event.id, questions, payload.answers);

  const titleQuestion = questions.find((q) => q.key === "title");
  const title =
    (titleQuestion ? String(payload.answers[titleQuestion.id] ?? "") : "").trim() ||
    "Untitled draft";

  let submissionId = payload.submissionId ?? null;
  if (submissionId) {
    const existing = getSubmission(submissionId);
    if (!existing || existing.event_id !== event.id || existing.submitter_contact_id !== contact.id) {
      return { ok: false, error: "That draft cannot be edited." };
    }
    updateSubmission(submissionId, {
      ...columns,
      title,
      answers: writeJson(extra),
      is_draft: 1,
      status: "draft",
    });
  } else {
    if (!form.allow_multiple_drafts) {
      const drafts = countSubmissionsBySubmitter(event.id, contact.id, form.id);
      if (drafts > 0) {
        return { ok: false, error: "You already have a draft on this form." };
      }
    }
    const created = createSubmission(event.id, {
      form_id: form.id,
      kind: form.collects === "sessions" ? "session" : "abstract",
      status: "draft",
      title,
      submitter_contact_id: contact.id,
      answers: writeJson(extra),
      is_draft: 1,
      approval_status: "draft",
      ...columns,
    });
    submissionId = created.id;
    addParticipant(created.id, contact.id, "submitter");
  }

  syncParticipants(event, submissionId, payload.participants, contact.id);
  revalidatePath("/portal", "layout");
  revalidatePath(`/admin/e/${event.slug}`, "layout");
  return { ok: true, submissionId };
}

/* ---------------------------------------------------------------- submit -- */

export async function submitProposalAction(payload: WizardPayload): Promise<WizardResult> {
  const { event, form } = await context(payload.slug, payload.formId);
  const user = await currentUser();
  if (!user) return { ok: false, error: "Create an account or sign in to submit." };
  if (!formIsOpen(form)) {
    return { ok: false, error: "This call for speakers is closed and no longer accepts submissions." };
  }

  const contact = portalContact(event, user) ?? linkContactToUser(event, user);
  const submissionQuestions = listQuestions(form.id, "submission");
  const participantQuestions = listQuestions(form.id, "participant");

  const fieldErrors = validate(submissionQuestions, payload.answers);
  if (Object.keys(fieldErrors).length) {
    return { ok: false, fieldErrors, error: "Please fix the highlighted fields." };
  }

  // Participant role limits (R-FORM-8).
  if (form.collect_participants) {
    const configs = listRoleConfigs(form.id).filter((rc) => rc.enabled);
    for (const rc of configs) {
      const count = payload.participants.filter(
        (p) => (p.role || "speaker") === rc.role && (p.values.email ?? "").trim(),
      ).length;
      if (count < rc.min_count) {
        return {
          ok: false,
          error: `Add at least ${rc.min_count} ${rc.role}${rc.min_count === 1 ? "" : "s"}.`,
        };
      }
      if (rc.max_count && count > rc.max_count) {
        return {
          ok: false,
          error: `You can add at most ${rc.max_count} ${rc.role}${rc.max_count === 1 ? "" : "s"}.`,
        };
      }
    }
    for (const [index, participant] of payload.participants.entries()) {
      for (const question of participantQuestions) {
        const condition = parseCondition(question.condition);
        if (condition && !conditionMet(condition, participant.values)) continue;
        const error = validateAnswer(
          { label: question.label, type: question.type, max_length: question.max_length },
          participant.values[question.key] ?? "",
          Boolean(question.is_required),
        );
        if (error) {
          return { ok: false, error: `Speaker ${index + 1}: ${error}` };
        }
      }
    }
  }

  // Cross-field combined limit (R-FORM-10).
  const combined = readJson<{ question_keys?: string[]; max?: number; label?: string } | null>(
    form.combined_limit,
    null,
  );
  if (combined?.max && combined.question_keys?.length) {
    const total = combined.question_keys.reduce((sum, key) => {
      const question = submissionQuestions.find((q) => q.key === key);
      if (!question) return sum;
      const raw = payload.answers[question.id];
      return sum + stripHtml(Array.isArray(raw) ? raw.join(" ") : String(raw ?? "")).length;
    }, 0);
    if (total > combined.max) {
      return {
        ok: false,
        error: `${combined.label ?? "Combined limit"}: ${total} characters used of ${combined.max} allowed.`,
      };
    }
  }

  // Per-person submission limit (R-PUB-10).
  if (form.submission_limit) {
    const existingCount = countSubmissionsBySubmitter(event.id, contact.id, form.id);
    const isUpdate = Boolean(payload.submissionId);
    if (!isUpdate && existingCount >= form.submission_limit) {
      return {
        ok: false,
        error: `You have reached the limit of ${form.submission_limit} submissions for this call.`,
      };
    }
  }

  const { columns, extra } = applyAnswers(event.id, submissionQuestions, payload.answers);
  const titleQuestion = submissionQuestions.find((q) => q.key === "title");
  const title = (titleQuestion ? String(payload.answers[titleQuestion.id] ?? "") : "").trim();

  let submissionId = payload.submissionId ?? null;
  let isNew = false;
  if (submissionId) {
    const existing = getSubmission(submissionId);
    if (!existing || existing.event_id !== event.id) {
      return { ok: false, error: "That submission cannot be edited." };
    }
    const owns =
      existing.submitter_contact_id === contact.id ||
      listParticipants(existing.id).some((p) => p.contact_id === contact.id);
    if (!owns) return { ok: false, error: "That submission belongs to someone else." };
    updateSubmission(submissionId, {
      ...columns,
      title,
      answers: writeJson(extra),
      is_draft: 0,
      status: existing.status === "draft" ? "pending" : existing.status,
    });
    logAudit({
      eventId: event.id,
      entityType: "submission",
      entityId: submissionId,
      actorUserId: user.id,
      actorName: contactName(contact),
      action: "edited",
      summary: "Submitter updated their proposal",
    });
  } else {
    const created = createSubmission(event.id, {
      form_id: form.id,
      kind: form.collects === "sessions" ? "session" : "abstract",
      status: "pending",
      title,
      submitter_contact_id: contact.id,
      answers: writeJson(extra),
      is_draft: 0,
      approval_status: "draft",
      ...columns,
    });
    submissionId = created.id;
    isNew = true;
    addParticipant(created.id, contact.id, "submitter");
    logAudit({
      eventId: event.id,
      entityType: "submission",
      entityId: submissionId,
      actorUserId: user.id,
      actorName: contactName(contact),
      action: "created",
      summary: `Submitted via ${form.name}`,
    });
  }

  syncParticipants(event, submissionId, payload.participants, contact.id);

  // Track routing: assign to the configured round/reviewers on arrival (R-FORM-7).
  await routeByTrack(event.id, form, submissionId);

  if (isNew || form.notify_on_revision) {
    await notify(event, form, submissionId, contact, isNew);
  }

  const { emitWebhook } = await import("@/lib/webhooks");
  await emitWebhook(event.id, "submission.created", {
    id: submissionId,
    title,
    is_new: isNew,
    submitter: contact.email,
  });

  revalidatePath("/portal", "layout");
  revalidatePath(`/admin/e/${event.slug}`, "layout");
  revalidatePath(`/e/${event.slug}`, "layout");

  return { ok: true, submissionId, redirectTo: `/portal/submissions/${submissionId}` };
}

async function routeByTrack(
  eventId: string,
  form: { track_routing: string },
  submissionId: string,
) {
  const routing = readJson<Array<{ track_id: string; round_id?: string; reviewer_user_ids?: string[] }>>(
    form.track_routing,
    [],
  );
  if (!routing.length) return;
  const submission = getSubmission(submissionId);
  if (!submission?.track_id) return;
  const rule = routing.find((r) => r.track_id === submission.track_id);
  if (!rule?.round_id) return;
  const { assign, listRoundReviewers } = await import("@/lib/repo/evaluations");
  // Named reviewers win; otherwise the whole pool for that round picks it up.
  const reviewers = rule.reviewer_user_ids?.length
    ? rule.reviewer_user_ids
    : listRoundReviewers(rule.round_id).map((reviewer) => reviewer.user_id);
  for (const reviewerId of reviewers) {
    assign(rule.round_id, submissionId, reviewerId);
  }
  void eventId;
}

async function notify(
  event: { id: string; name: string; slug: string; starts_at: string | null; ends_at: string | null; location: string | null },
  form: {
    id: string;
    name: string;
    send_confirmation_email: number;
    confirmation_email_subject: string | null;
    confirmation_email_body: string | null;
    notify_admin_user_ids: string;
  },
  submissionId: string,
  contact: { id: string; email: string; first_name: string; last_name: string },
  isNew: boolean,
) {
  const submission = getSubmission(submissionId);
  if (!submission) return;
  const context = {
    speaker_name: `${contact.first_name} ${contact.last_name}`.trim(),
    first_name: contact.first_name,
    last_name: contact.last_name,
    talk_title: submission.title,
    event_name: event.name,
    event_dates: formatEventDates(event.starts_at, event.ends_at),
    event_location: event.location ?? "",
    portal_link: appUrl("/portal"),
  };

  if (form.send_confirmation_email && isNew) {
    if (form.confirmation_email_subject || form.confirmation_email_body) {
      const { sendEmail } = await import("@/lib/email");
      const { renderMerge } = await import("@/lib/merge");
      await sendEmail({
        eventId: event.id,
        to: contact.email,
        toName: context.speaker_name,
        contactId: contact.id,
        subject: renderMerge(
          form.confirmation_email_subject || "We received your submission to {event_name}",
          context,
        ),
        body: renderMerge(form.confirmation_email_body || "<p>Thank you for your submission.</p>", context),
        templateKey: "submission_confirmation",
      });
    } else {
      await sendTemplate({
        eventId: event.id,
        templateKey: "submission_confirmation",
        to: contact.email,
        toName: context.speaker_name,
        contactId: contact.id,
        context,
        force: true,
      });
    }
  }

  const adminIds = readJson<string[]>(form.notify_admin_user_ids, []);
  for (const admin of adminEmails(event.id, adminIds)) {
    await sendTemplate({
      eventId: event.id,
      templateKey: "submission_admin_alert",
      to: admin.email,
      toName: admin.name,
      context: {
        ...context,
        track: "",
      },
    });
  }
}

/** Options for a choice question, resolving track/format/room lookups. */
export async function optionsForQuestion(eventId: string, question: QuestionWithField) {
  if (question.key === "track") {
    return listLookup("tracks", eventId).map((t) => ({ value: t.name, label: t.name }));
  }
  if (question.key === "format") {
    return listLookup("formats", eventId).map((f) => ({ value: f.name, label: f.name }));
  }
  if (question.key === "location") {
    return listLookup("rooms", eventId).map((r) => ({ value: r.name, label: r.name }));
  }
  if (question.key === "level") {
    return listLookup("levels", eventId).map((l) => ({ value: l.name, label: l.name }));
  }
  if (question.key === "tags") {
    return listLookup("tags", eventId).map((t) => ({ value: t.name, label: t.name }));
  }
  return parseOptions(question.options);
}
