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
}: {
  params: Promise<{ slug: string; formId: string }>;
}) {
  const { slug, formId } = await params;
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

  if (closed) {
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
    />
  );
}
