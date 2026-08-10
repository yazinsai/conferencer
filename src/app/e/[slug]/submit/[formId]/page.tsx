import { notFound } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { asc } from "drizzle-orm";
import { getSessionUser } from "@/lib/auth/session";
import { getEventBySlug } from "@/lib/auth/guards";
import { getDb, schema } from "@/lib/db";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { PublicSubmitWizard } from "./PublicSubmitWizard";

function isFormClosed(form: { status: string; closesAt: string | null }) {
  if (form.status === "closed") return true;
  if (form.closesAt && new Date(form.closesAt) < new Date()) return true;
  return false;
}

function formatCloseDate(iso: string | null) {
  if (!iso) return null;
  try {
    return new Date(iso).toLocaleString("en-US", {
      dateStyle: "long",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

async function countUserSubmissions(
  eventId: string,
  formId: string,
  userId: string,
): Promise<number> {
  const db = getDb();
  const contacts = db
    .select({ id: schema.contacts.id })
    .from(schema.contacts)
    .where(eq(schema.contacts.userId, userId))
    .all();
  if (!contacts.length) return 0;
  const contactIds = contacts.map((c) => c.id);
  const subs = db
    .select()
    .from(schema.submissions)
    .where(
      and(eq(schema.submissions.eventId, eventId), eq(schema.submissions.formId, formId)),
    )
    .all();
  return subs.filter(
    (s) => s.submitterContactId && contactIds.includes(s.submitterContactId),
  ).length;
}

export default async function PublicSubmitPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string; formId: string }>;
  searchParams: Promise<{ edit?: string }>;
}) {
  const { slug, formId } = await params;
  const sp = await searchParams;
  const event = await getEventBySlug(slug);
  if (!event) notFound();

  const db = getDb();
  const form = db
    .select()
    .from(schema.submissionForms)
    .where(
      and(
        eq(schema.submissionForms.id, formId),
        eq(schema.submissionForms.eventId, event.id),
      ),
    )
    .get();
  if (!form) notFound();

  const closed = isFormClosed(form);
  const sessionUser = await getSessionUser();

  // Editing an existing submission while closed → read-only wizard if owner
  let editSubmission: typeof schema.submissions.$inferSelect | null = null;
  if (sp.edit && sessionUser) {
    const contact = db
      .select()
      .from(schema.contacts)
      .where(eq(schema.contacts.userId, sessionUser.id))
      .get();
    if (contact) {
      editSubmission =
        db
          .select()
          .from(schema.submissions)
          .where(
            and(
              eq(schema.submissions.id, sp.edit),
              eq(schema.submissions.formId, formId),
              eq(schema.submissions.submitterContactId, contact.id),
            ),
          )
          .get() ?? null;
    }
  }

  if (closed && !editSubmission) {
    return (
      <Card>
        <CardHeader
          title={form.pageHeading ?? form.title}
          subtitle={`${event.name} — submissions closed`}
        />
        <CardBody>
          <p className="text-slate-700">
            This call for speakers is no longer accepting submissions.
          </p>
          {form.closesAt ? (
            <p className="mt-2 text-sm text-slate-500">
              Closed date: {formatCloseDate(form.closesAt)}
            </p>
          ) : null}
          <p className="mt-4 text-sm text-slate-500">
            If you already submitted, manage your proposal from the{" "}
            <a href="/portal" className="text-blue-600 hover:underline">speaker portal</a>.
          </p>
        </CardBody>
      </Card>
    );
  }

  const sections = db
    .select()
    .from(schema.formSections)
    .where(eq(schema.formSections.formId, form.id))
    .orderBy(asc(schema.formSections.sortOrder))
    .all();

  const questionRows = db
    .select({
      id: schema.formQuestions.id,
      sectionId: schema.formQuestions.sectionId,
      labelOverride: schema.formQuestions.labelOverride,
      helpText: schema.formQuestions.helpText,
      isRequired: schema.formQuestions.isRequired,
      isLocked: schema.formQuestions.isLocked,
      sortOrder: schema.formQuestions.sortOrder,
      condition: schema.formQuestions.condition,
      fieldId: schema.formQuestions.fieldId,
      fieldKey: schema.fields.key,
      fieldType: schema.fields.type,
      fieldOptions: schema.fields.options,
      fieldMaxLength: schema.fields.maxLength,
      fieldLabel: schema.fields.label,
    })
    .from(schema.formQuestions)
    .innerJoin(schema.fields, eq(schema.formQuestions.fieldId, schema.fields.id))
    .where(eq(schema.formQuestions.formId, form.id))
    .orderBy(asc(schema.formQuestions.sortOrder))
    .all();

  const questions = questionRows.map((q) => {
    let options: string[] = [];
    try {
      const parsed = JSON.parse(q.fieldOptions ?? "[]");
      options = Array.isArray(parsed) ? parsed.map(String) : [];
    } catch {
      options = [];
    }
    return {
      id: q.id,
      sectionId: q.sectionId,
      label: q.labelOverride ?? q.fieldLabel,
      helpText: q.helpText,
      isRequired: q.isRequired,
      isLocked: q.isLocked,
      sortOrder: q.sortOrder,
      condition: q.condition,
      field: {
        id: q.fieldId,
        key: q.fieldKey,
        type: q.fieldType,
        options,
        maxLength: q.fieldMaxLength,
      },
    };
  });

  const roleConfigRow = db
    .select()
    .from(schema.participantRoleConfigs)
    .where(
      and(
        eq(schema.participantRoleConfigs.formId, form.id),
        eq(schema.participantRoleConfigs.role, "speaker"),
      ),
    )
    .get();

  const userSubmissionCount = sessionUser
    ? await countUserSubmissions(event.id, form.id, sessionUser.id)
    : 0;

  let initialDraft: {
    id: string;
    answers: Record<string, unknown>;
    speakers: Array<Record<string, unknown>>;
    isDraft: boolean;
  } | null = null;

  if (editSubmission) {
    let parsed: Record<string, unknown> = {};
    try {
      parsed = JSON.parse(editSubmission.answers || "{}") as Record<string, unknown>;
    } catch {
      parsed = {};
    }
    const speakers = Array.isArray(parsed.__speakers)
      ? (parsed.__speakers as Array<Record<string, unknown>>)
      : [{}];
    const { __speakers: _s, ...answers } = parsed;
    initialDraft = {
      id: editSubmission.id,
      answers,
      speakers,
      isDraft: editSubmission.isDraft || editSubmission.status === "draft",
    };
  } else if (sessionUser && form.allowDrafts) {
    // Resume latest draft for this user+form if present
    const contact = db
      .select()
      .from(schema.contacts)
      .where(eq(schema.contacts.userId, sessionUser.id))
      .get();
    if (contact) {
      const draft = db
        .select()
        .from(schema.submissions)
        .where(
          and(
            eq(schema.submissions.formId, form.id),
            eq(schema.submissions.submitterContactId, contact.id),
            eq(schema.submissions.isDraft, true),
          ),
        )
        .get();
      if (draft) {
        let parsed: Record<string, unknown> = {};
        try {
          parsed = JSON.parse(draft.answers || "{}") as Record<string, unknown>;
        } catch {
          parsed = {};
        }
        const speakers = Array.isArray(parsed.__speakers)
          ? (parsed.__speakers as Array<Record<string, unknown>>)
          : [{}];
        const { __speakers: _s, ...answers } = parsed;
        initialDraft = {
          id: draft.id,
          answers,
          speakers,
          isDraft: true,
        };
      }
    }
  }

  return (
    <PublicSubmitWizard
      eventSlug={slug}
      eventName={event.name}
      accentColor={event.accentColor ?? "#2563eb"}
      form={{
        id: form.id,
        title: form.title,
        pageHeading: form.pageHeading,
        welcomeMessage: form.welcomeMessage,
        showWelcome: form.showWelcome,
        closesAt: form.closesAt,
        submissionLimit: form.submissionLimit,
        allowDrafts: form.allowDrafts,
        successMessage: form.successMessage,
        autoRedirectToPortal: form.autoRedirectToPortal,
        redirectSeconds: form.redirectSeconds,
      }}
      sections={sections.map((s) => ({
        id: s.id,
        kind: s.kind,
        title: s.title,
        heading: s.heading,
        description: s.description,
      }))}
      questions={questions}
      roleConfig={{
        minCount: roleConfigRow?.minCount ?? 1,
        maxCount: roleConfigRow?.maxCount ?? 5,
      }}
      initialUser={
        sessionUser
          ? {
              id: sessionUser.id,
              email: sessionUser.email,
              firstName: sessionUser.firstName,
              lastName: sessionUser.lastName,
            }
          : null
      }
      userSubmissionCount={userSubmissionCount}
      initialDraft={initialDraft}
      readOnly={closed && Boolean(editSubmission)}
    />
  );
}
