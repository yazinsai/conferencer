"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getEventBySlug } from "@/lib/auth/guards";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { getSessionUser, setSessionCookie } from "@/lib/auth/session";
import { nowIso } from "@/lib/dates";
import { evaluateCondition, parseCondition } from "@/lib/domain/conditions";
import { sendTemplatedEmail } from "@/lib/email/send";
import { getDb, schema } from "@/lib/db";
import { id } from "@/lib/id";

export type WizardAuthResult =
  | { ok: true; user: { id: string; email: string; firstName: string; lastName: string } }
  | { ok: false; error: string };

export type SubmitCfpResult =
  | {
      ok: true;
      submissionId: string;
      successMessage: string;
      autoRedirectToPortal: boolean;
      redirectSeconds: number;
    }
  | { ok: false; error: string };

type QuestionRow = {
  id: string;
  fieldId: string;
  isRequired: boolean;
  condition: string | null;
  fieldKey: string;
};

function splitName(full: string) {
  const parts = full.trim().split(/\s+/);
  return { firstName: parts[0] || "User", lastName: parts.slice(1).join(" ") || "" };
}

function isFormClosed(form: { status: string; closesAt: string | null }) {
  if (form.status === "closed") return true;
  if (form.closesAt && new Date(form.closesAt) < new Date()) return true;
  return false;
}

function loadFormQuestions(formId: string): QuestionRow[] {
  const db = getDb();
  const rows = db
    .select({
      id: schema.formQuestions.id,
      fieldId: schema.formQuestions.fieldId,
      isRequired: schema.formQuestions.isRequired,
      condition: schema.formQuestions.condition,
      fieldKey: schema.fields.key,
    })
    .from(schema.formQuestions)
    .innerJoin(schema.fields, eq(schema.formQuestions.fieldId, schema.fields.id))
    .where(eq(schema.formQuestions.formId, formId))
    .all();
  return rows;
}

function visibleQuestionIds(
  questions: QuestionRow[],
  answers: Record<string, unknown>,
): Set<string> {
  const ids = new Set<string>();
  for (const q of questions) {
    const cond = parseCondition(q.condition);
    if (evaluateCondition(cond, answers)) ids.add(q.id);
  }
  return ids;
}

function answerByKey(
  answers: Record<string, unknown>,
  questions: QuestionRow[],
  key: string,
): string {
  const q = questions.find((row) => row.fieldKey === key);
  if (!q) return "";
  const v = answers[q.id];
  return v == null ? "" : String(v).trim();
}

function validateRequired(
  questions: QuestionRow[],
  answers: Record<string, unknown>,
  label: string,
): string | null {
  const visible = visibleQuestionIds(questions, answers);
  for (const q of questions) {
    if (!visible.has(q.id) || !q.isRequired) continue;
    const v = answers[q.id];
    if (v == null || String(v).trim() === "") {
      return `${label}: required field missing (${q.fieldKey})`;
    }
  }
  return null;
}

function filterStoredAnswers(
  questions: QuestionRow[],
  answers: Record<string, unknown>,
): Record<string, unknown> {
  const visible = visibleQuestionIds(questions, answers);
  const stored: Record<string, unknown> = {};
  for (const q of questions) {
    if (visible.has(q.id) && answers[q.id] != null && String(answers[q.id]).trim() !== "") {
      stored[q.id] = answers[q.id];
    }
  }
  return stored;
}

export async function wizardSignUpAction(input: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}): Promise<WizardAuthResult> {
  const email = input.email.trim().toLowerCase();
  const password = input.password;
  const firstName = input.firstName.trim();
  const lastName = input.lastName.trim();

  if (!email || !password || password.length < 8) {
    return { ok: false, error: "Email and password (8+ characters) are required." };
  }
  if (!firstName) {
    return { ok: false, error: "First name is required." };
  }

  const db = getDb();
  const existing = db
    .select()
    .from(schema.users)
    .where(eq(schema.users.email, email))
    .get();
  if (existing) {
    return { ok: false, error: "An account with this email already exists. Sign in instead." };
  }

  const userId = id("usr");
  const createdAt = nowIso();
  db.insert(schema.users)
    .values({
      id: userId,
      email,
      passwordHash: await hashPassword(password),
      firstName,
      lastName: lastName || "Speaker",
      createdAt,
    })
    .run();

  await setSessionCookie(userId);
  return {
    ok: true,
    user: { id: userId, email, firstName, lastName: lastName || "Speaker" },
  };
}

export async function wizardSignInAction(input: {
  email: string;
  password: string;
}): Promise<WizardAuthResult> {
  const email = input.email.trim().toLowerCase();
  const password = input.password;

  if (!email || !password) {
    return { ok: false, error: "Email and password are required." };
  }

  const db = getDb();
  const user = db
    .select()
    .from(schema.users)
    .where(eq(schema.users.email, email))
    .get();
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return { ok: false, error: "Invalid email or password." };
  }

  await setSessionCookie(user.id);
  return {
    ok: true,
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    },
  };
}

async function countUserSubmissions(eventId: string, formId: string, userId: string) {
  const db = getDb();
  const contacts = db
    .select({ id: schema.contacts.id })
    .from(schema.contacts)
    .where(eq(schema.contacts.userId, userId))
    .all();
  if (!contacts.length) return 0;
  const contactIds = contacts.map((c) => c.id);
  const allForForm = db
    .select()
    .from(schema.submissions)
    .where(
      and(eq(schema.submissions.eventId, eventId), eq(schema.submissions.formId, formId)),
    )
    .all();
  return allForForm.filter(
    (s) => s.submitterContactId && contactIds.includes(s.submitterContactId),
  ).length;
}

function findOrCreateContact(
  orgId: string,
  eventId: string,
  data: {
    email: string;
    firstName: string;
    lastName: string;
    userId?: string | null;
    biography?: string;
    jobTitle?: string;
    company?: string;
  },
) {
  const db = getDb();
  const email = data.email.trim().toLowerCase();
  const createdAt = nowIso();

  let contact = db
    .select()
    .from(schema.contacts)
    .where(and(eq(schema.contacts.orgId, orgId), eq(schema.contacts.email, email)))
    .get();

  if (contact) {
    db.update(schema.contacts)
      .set({
        firstName: data.firstName || contact.firstName,
        lastName: data.lastName || contact.lastName,
        biography: data.biography ?? contact.biography,
        jobTitle: data.jobTitle ?? contact.jobTitle,
        company: data.company ?? contact.company,
        userId: data.userId ?? contact.userId,
      })
      .where(eq(schema.contacts.id, contact.id))
      .run();
    contact = db.select().from(schema.contacts).where(eq(schema.contacts.id, contact.id)).get()!;
  } else {
    const contactId = id("cnt");
    db.insert(schema.contacts)
      .values({
        id: contactId,
        orgId,
        userId: data.userId ?? null,
        firstName: data.firstName,
        lastName: data.lastName,
        email,
        biography: data.biography ?? null,
        jobTitle: data.jobTitle ?? null,
        company: data.company ?? null,
        createdAt,
      })
      .run();
    contact = db.select().from(schema.contacts).where(eq(schema.contacts.id, contactId)).get()!;
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

  if (!eventContact) {
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
  }

  if (data.userId) {
    const mem = db
      .select()
      .from(schema.eventMemberships)
      .where(
        and(
          eq(schema.eventMemberships.eventId, eventId),
          eq(schema.eventMemberships.userId, data.userId!),
          eq(schema.eventMemberships.role, "participant"),
        ),
      )
      .get();
    if (!mem) {
      db.insert(schema.eventMemberships)
        .values({
          id: id("mem"),
          eventId,
          userId: data.userId!,
          role: "participant",
          createdAt,
        })
        .run();
    }
  }

  return contact;
}

export type DraftResult =
  | { ok: true; submissionId: string }
  | { ok: false; error: string };

export async function saveDraftAction(input: {
  eventSlug: string;
  formId: string;
  submissionId?: string | null;
  submissionAnswers: Record<string, unknown>;
  speakers: Array<Record<string, unknown>>;
}): Promise<DraftResult> {
  const user = await getSessionUser();
  if (!user) return { ok: false, error: "Sign in to save a draft." };

  const event = await getEventBySlug(input.eventSlug);
  if (!event) return { ok: false, error: "Event not found." };
  const db = getDb();
  const form = db
    .select()
    .from(schema.submissionForms)
    .where(
      and(
        eq(schema.submissionForms.id, input.formId),
        eq(schema.submissionForms.eventId, event.id),
      ),
    )
    .get();
  if (!form) return { ok: false, error: "Form not found." };
  if (!form.allowDrafts) return { ok: false, error: "Drafts are disabled for this form." };
  if (isFormClosed(form)) {
    return { ok: false, error: "This form is closed. Drafts can no longer be saved." };
  }

  const questions = loadFormQuestions(form.id);
  const titleQ = questions.find((q) => q.fieldKey === "title");
  const titleRaw = titleQ ? input.submissionAnswers[titleQ.id] : null;
  const title = titleRaw != null ? String(titleRaw).trim() : "";
  if (!title) {
    return { ok: false, error: "Enter a title to save as draft." };
  }

  const contact = findOrCreateContact(event.orgId, event.id, {
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    userId: user.id,
  });

  const stored = filterStoredAnswers(questions, input.submissionAnswers);
  const trackName = answerByKey(input.submissionAnswers, questions, "track");
  const formatName = answerByKey(input.submissionAnswers, questions, "format");
  const description = answerByKey(input.submissionAnswers, questions, "description");
  const level = answerByKey(input.submissionAnswers, questions, "level") || null;
  const track = trackName
    ? db
        .select()
        .from(schema.tracks)
        .where(and(eq(schema.tracks.eventId, event.id), eq(schema.tracks.name, trackName)))
        .get()
    : null;
  const format = formatName
    ? db
        .select()
        .from(schema.formats)
        .where(and(eq(schema.formats.eventId, event.id), eq(schema.formats.name, formatName)))
        .get()
    : null;

  const now = nowIso();
  let submissionId = input.submissionId ?? null;

  if (submissionId) {
    const existing = db
      .select()
      .from(schema.submissions)
      .where(
        and(
          eq(schema.submissions.id, submissionId),
          eq(schema.submissions.eventId, event.id),
          eq(schema.submissions.submitterContactId, contact.id),
        ),
      )
      .get();
    if (!existing) return { ok: false, error: "Draft not found." };
    if (!existing.isDraft && existing.status !== "draft") {
      // Allow editing pending while form open (R-PUB-8) via draft save path only for drafts
      if (isFormClosed(form)) {
        return { ok: false, error: "Form is closed; this submission is read-only." };
      }
    }
    db.update(schema.submissions)
      .set({
        title,
        description: description || null,
        trackId: track?.id ?? null,
        formatId: format?.id ?? null,
        level,
        answers: JSON.stringify({
          ...stored,
          __speakers: input.speakers,
        }),
        isDraft: existing.status === "draft" || existing.isDraft,
        status: existing.status === "pending" ? "pending" : "draft",
        updatedAt: now,
      })
      .where(eq(schema.submissions.id, submissionId))
      .run();
  } else {
    submissionId = id("sub");
    db.insert(schema.submissions)
      .values({
        id: submissionId,
        eventId: event.id,
        formId: form.id,
        kind: form.collects === "sessions" ? "session" : "abstract",
        status: "draft",
        title,
        description: description || null,
        trackId: track?.id ?? null,
        formatId: format?.id ?? null,
        level,
        submitterContactId: contact.id,
        answers: JSON.stringify({
          ...stored,
          __speakers: input.speakers,
        }),
        isDraft: true,
        approvalStatus: "draft",
        createdAt: now,
        updatedAt: now,
      })
      .run();
    db.insert(schema.submissionParticipants)
      .values({
        id: id("sp"),
        submissionId,
        contactId: contact.id,
        role: "speaker",
        acceptanceStatus: "pending",
        sortOrder: 0,
      })
      .run();
  }

  revalidatePath("/portal");
  revalidatePath(`/admin/e/${input.eventSlug}/submissions`);
  return { ok: true, submissionId };
}

export async function submitCfpAction(input: {
  eventSlug: string;
  formId: string;
  submissionId?: string | null;
  submissionAnswers: Record<string, unknown>;
  speakers: Array<Record<string, unknown>>;
}): Promise<SubmitCfpResult> {
  const user = await getSessionUser();
  if (!user) {
    return { ok: false, error: "You must be signed in to submit." };
  }

  const event = await getEventBySlug(input.eventSlug);
  if (!event) return { ok: false, error: "Event not found." };

  const db = getDb();
  const form = db
    .select()
    .from(schema.submissionForms)
    .where(
      and(
        eq(schema.submissionForms.id, input.formId),
        eq(schema.submissionForms.eventId, event.id),
      ),
    )
    .get();
  if (!form) return { ok: false, error: "Form not found." };
  if (isFormClosed(form)) {
    return { ok: false, error: "This form is closed and no longer accepts submissions." };
  }

  if (form.submissionLimit != null && !input.submissionId) {
    const existing = await countUserSubmissions(event.id, form.id, user.id);
    if (existing >= form.submissionLimit) {
      return {
        ok: false,
        error: `You have reached the submission limit (${form.submissionLimit}) for this form.`,
      };
    }
  }

  const allQuestions = loadFormQuestions(form.id);
  const submissionSectionIds = db
    .select({ id: schema.formSections.id })
    .from(schema.formSections)
    .where(
      and(
        eq(schema.formSections.formId, form.id),
        eq(schema.formSections.kind, "submission"),
      ),
    )
    .all()
    .map((s) => s.id);

  const participantSectionIds = db
    .select({ id: schema.formSections.id })
    .from(schema.formSections)
    .where(
      and(
        eq(schema.formSections.formId, form.id),
        eq(schema.formSections.kind, "participant"),
      ),
    )
    .all()
    .map((s) => s.id);

  const submissionQuestions = db
    .select({
      id: schema.formQuestions.id,
      sectionId: schema.formQuestions.sectionId,
      fieldId: schema.formQuestions.fieldId,
      isRequired: schema.formQuestions.isRequired,
      condition: schema.formQuestions.condition,
      fieldKey: schema.fields.key,
    })
    .from(schema.formQuestions)
    .innerJoin(schema.fields, eq(schema.formQuestions.fieldId, schema.fields.id))
    .where(eq(schema.formQuestions.formId, form.id))
    .all()
    .filter((q) => submissionSectionIds.includes(q.sectionId))
    .map((q) => ({
      id: q.id,
      fieldId: q.fieldId,
      isRequired: q.isRequired,
      condition: q.condition,
      fieldKey: q.fieldKey,
    }));

  const participantQuestions = db
    .select({
      id: schema.formQuestions.id,
      sectionId: schema.formQuestions.sectionId,
      fieldId: schema.formQuestions.fieldId,
      isRequired: schema.formQuestions.isRequired,
      condition: schema.formQuestions.condition,
      fieldKey: schema.fields.key,
    })
    .from(schema.formQuestions)
    .innerJoin(schema.fields, eq(schema.formQuestions.fieldId, schema.fields.id))
    .where(eq(schema.formQuestions.formId, form.id))
    .all()
    .filter((q) => participantSectionIds.includes(q.sectionId))
    .map((q) => ({
      id: q.id,
      fieldId: q.fieldId,
      isRequired: q.isRequired,
      condition: q.condition,
      fieldKey: q.fieldKey,
    }));

  const subErr = validateRequired(
    submissionQuestions,
    input.submissionAnswers,
    "Submission",
  );
  if (subErr) return { ok: false, error: subErr };

  const roleConfig = db
    .select()
    .from(schema.participantRoleConfigs)
    .where(
      and(
        eq(schema.participantRoleConfigs.formId, form.id),
        eq(schema.participantRoleConfigs.role, "speaker"),
        eq(schema.participantRoleConfigs.enabled, true),
      ),
    )
    .get();

  const minSpeakers = roleConfig?.minCount ?? 1;
  const maxSpeakers = roleConfig?.maxCount ?? 5;
  const speakerCount = input.speakers.length;

  if (speakerCount < minSpeakers) {
    return { ok: false, error: `At least ${minSpeakers} speaker(s) required.` };
  }
  if (speakerCount > maxSpeakers) {
    return { ok: false, error: `Maximum ${maxSpeakers} speaker(s) allowed.` };
  }

  for (let i = 0; i < input.speakers.length; i++) {
    const spErr = validateRequired(
      participantQuestions,
      input.speakers[i],
      `Speaker ${i + 1}`,
    );
    if (spErr) return { ok: false, error: spErr };
  }

  const storedSubmissionAnswers = filterStoredAnswers(
    submissionQuestions,
    input.submissionAnswers,
  );

  const title = answerByKey(input.submissionAnswers, submissionQuestions, "title");
  const description = answerByKey(input.submissionAnswers, submissionQuestions, "description");
  const trackName = answerByKey(input.submissionAnswers, submissionQuestions, "track");
  const formatName = answerByKey(input.submissionAnswers, submissionQuestions, "format");
  const level = answerByKey(input.submissionAnswers, submissionQuestions, "level") || null;

  const track = trackName
    ? db
        .select()
        .from(schema.tracks)
        .where(and(eq(schema.tracks.eventId, event.id), eq(schema.tracks.name, trackName)))
        .get()
    : null;

  const format = formatName
    ? db
        .select()
        .from(schema.formats)
        .where(and(eq(schema.formats.eventId, event.id), eq(schema.formats.name, formatName)))
        .get()
    : null;

  const primarySpeakerAnswers = input.speakers[0] ?? {};
  const submitterEmail =
    answerByKey(primarySpeakerAnswers, participantQuestions, "email") || user.email;
  const submitterFirst =
    answerByKey(primarySpeakerAnswers, participantQuestions, "first_name") || user.firstName;
  const submitterLast =
    answerByKey(primarySpeakerAnswers, participantQuestions, "last_name") || user.lastName;

  const submitterContact = findOrCreateContact(event.orgId, event.id, {
    email: submitterEmail,
    firstName: submitterFirst,
    lastName: submitterLast,
    userId: user.id,
    biography: answerByKey(primarySpeakerAnswers, participantQuestions, "biography"),
    jobTitle: answerByKey(primarySpeakerAnswers, participantQuestions, "job_title"),
    company: answerByKey(primarySpeakerAnswers, participantQuestions, "company"),
  });

  const createdAt = nowIso();
  const kind = form.collects === "sessions" ? "session" : "abstract";
  let submissionId = input.submissionId ?? null;

  if (submissionId) {
    const existing = db
      .select()
      .from(schema.submissions)
      .where(
        and(
          eq(schema.submissions.id, submissionId),
          eq(schema.submissions.eventId, event.id),
        ),
      )
      .get();
    if (!existing || existing.submitterContactId !== submitterContact.id) {
      return { ok: false, error: "Submission not found." };
    }
    db.update(schema.submissions)
      .set({
        status: "pending",
        title: title || "Untitled submission",
        description: description || null,
        trackId: track?.id ?? null,
        formatId: format?.id ?? null,
        level,
        answers: JSON.stringify(storedSubmissionAnswers),
        isDraft: false,
        approvalStatus:
          existing.approvalStatus === "draft" ? "in_review" : existing.approvalStatus,
        updatedAt: createdAt,
      })
      .where(eq(schema.submissions.id, submissionId))
      .run();
    db.delete(schema.submissionParticipants)
      .where(eq(schema.submissionParticipants.submissionId, submissionId))
      .run();
  } else {
    submissionId = id("sub");
    db.insert(schema.submissions)
      .values({
        id: submissionId,
        eventId: event.id,
        formId: form.id,
        kind,
        status: "pending",
        title: title || "Untitled submission",
        description: description || null,
        trackId: track?.id ?? null,
        formatId: format?.id ?? null,
        level,
        language: "English",
        submitterContactId: submitterContact.id,
        answers: JSON.stringify(storedSubmissionAnswers),
        isDraft: false,
        approvalStatus: "in_review",
        createdAt,
        updatedAt: createdAt,
      })
      .run();
  }

  for (let i = 0; i < input.speakers.length; i++) {
    const email = answerByKey(input.speakers[i], participantQuestions, "email");
    const firstName = answerByKey(input.speakers[i], participantQuestions, "first_name");
    const lastName = answerByKey(input.speakers[i], participantQuestions, "last_name");

    const speakerContact = findOrCreateContact(event.orgId, event.id, {
      email,
      firstName,
      lastName,
      userId: i === 0 ? user.id : null,
      biography: answerByKey(input.speakers[i], participantQuestions, "biography"),
      jobTitle: answerByKey(input.speakers[i], participantQuestions, "job_title"),
      company: answerByKey(input.speakers[i], participantQuestions, "company"),
    });

    db.insert(schema.submissionParticipants)
      .values({
        id: id("sp"),
        submissionId,
        contactId: speakerContact.id,
        role: "speaker",
        acceptanceStatus: "pending",
        sortOrder: i,
      })
      .run();
  }

  const speakerName = `${submitterFirst} ${submitterLast}`.trim();
  if (form.sendConfirmationEmail) {
    await sendTemplatedEmail({
      eventId: event.id,
      toEmail: submitterContact.email,
      toContactId: submitterContact.id,
      templateKey: "submission_confirmation",
      bodyAppend: form.confirmationEmailBody ?? undefined,
      fields: {
        speaker_name: speakerName,
        first_name: submitterFirst,
        talk_title: title,
        event_name: event.name,
        portal_link: `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/portal`,
      },
    });
  }

  revalidatePath(`/admin/e/${input.eventSlug}/submissions`);
  revalidatePath(`/e/${input.eventSlug}/submit/${form.id}`);
  revalidatePath("/portal");

  return {
    ok: true,
    submissionId,
    successMessage:
      form.successMessage ??
      "<p>Thank you for your submission!</p>",
    autoRedirectToPortal: form.autoRedirectToPortal,
    redirectSeconds: form.redirectSeconds ?? 10,
  };
}
