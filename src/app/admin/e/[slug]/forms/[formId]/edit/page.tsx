import Link from "next/link";
import { and, asc, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { requireEventRole } from "@/lib/auth/guards";
import { getDb, schema } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Input, Select, Textarea } from "@/components/ui/input";
import {
  addQuestionAction,
  moveQuestionAction,
  removeQuestionAction,
  saveFormWizardAction,
  toggleQuestionRequiredAction,
} from "./actions";
import { CopyUrlButton } from "./copy-url-button";

const STEPS = [
  { n: 1, label: "Submission Setup" },
  { n: 2, label: "Welcome Screen" },
  { n: 3, label: "Abstract Information" },
  { n: 4, label: "Participant Information" },
  { n: 5, label: "Payments & Fees" },
  { n: 6, label: "Form Settings" },
  { n: 7, label: "Notifications" },
] as const;

function toDatetimeLocal(iso: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default async function FormEditPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string; formId: string }>;
  searchParams: Promise<{ step?: string; saved?: string }>;
}) {
  const { slug, formId } = await params;
  const sp = await searchParams;
  const step = Math.min(7, Math.max(1, Number(sp.step || 1)));
  const { event } = await requireEventRole(slug, ["organizer"]);
  const db = getDb();

  const form = db
    .select()
    .from(schema.submissionForms)
    .where(
      and(eq(schema.submissionForms.id, formId), eq(schema.submissionForms.eventId, event.id)),
    )
    .get();
  if (!form) notFound();

  const sections = db
    .select()
    .from(schema.formSections)
    .where(eq(schema.formSections.formId, formId))
    .orderBy(asc(schema.formSections.sortOrder))
    .all();

  const submissionSection = sections.find((s) => s.kind === "submission");
  const participantSection = sections.find((s) => s.kind === "participant");

  const questions = db
    .select({
      id: schema.formQuestions.id,
      sectionId: schema.formQuestions.sectionId,
      fieldId: schema.formQuestions.fieldId,
      isRequired: schema.formQuestions.isRequired,
      isLocked: schema.formQuestions.isLocked,
      sortOrder: schema.formQuestions.sortOrder,
      labelOverride: schema.formQuestions.labelOverride,
      fieldLabel: schema.fields.label,
      fieldType: schema.fields.type,
      fieldKey: schema.fields.key,
      maxLength: schema.fields.maxLength,
      scope: schema.fields.scope,
    })
    .from(schema.formQuestions)
    .innerJoin(schema.fields, eq(schema.formQuestions.fieldId, schema.fields.id))
    .where(eq(schema.formQuestions.formId, formId))
    .orderBy(asc(schema.formQuestions.sortOrder))
    .all();

  const sessionFields = db
    .select()
    .from(schema.fields)
    .where(and(eq(schema.fields.eventId, event.id), eq(schema.fields.scope, "session")))
    .all();
  const contactFields = db
    .select()
    .from(schema.fields)
    .where(and(eq(schema.fields.eventId, event.id), eq(schema.fields.scope, "contact")))
    .all();

  const roleConfig = db
    .select()
    .from(schema.participantRoleConfigs)
    .where(
      and(
        eq(schema.participantRoleConfigs.formId, formId),
        eq(schema.participantRoleConfigs.role, "speaker"),
      ),
    )
    .get();

  const organizers = db
    .select({
      userId: schema.users.id,
      firstName: schema.users.firstName,
      lastName: schema.users.lastName,
      email: schema.users.email,
    })
    .from(schema.eventMemberships)
    .innerJoin(schema.users, eq(schema.eventMemberships.userId, schema.users.id))
    .where(
      and(
        eq(schema.eventMemberships.eventId, event.id),
        eq(schema.eventMemberships.role, "organizer"),
      ),
    )
    .all();

  const notifyIds: string[] = JSON.parse(form.notifyAdminUserIds || "[]");
  const publicUrl = `/e/${slug}/submit/${formId}`;
  const baseEdit = `/admin/e/${slug}/forms/${formId}/edit`;

  const submissionQuestions = questions.filter((q) => q.sectionId === submissionSection?.id);
  const participantQuestions = questions.filter((q) => q.sectionId === participantSection?.id);

  const usedSessionFieldIds = new Set(submissionQuestions.map((q) => q.fieldId));
  const usedContactFieldIds = new Set(participantQuestions.map((q) => q.fieldId));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link href={`/admin/e/${slug}/forms`} className="text-sm text-blue-700 hover:underline">
            ← Back to forms
          </Link>
          <h1 className="mt-2 text-2xl font-semibold">{form.name}</h1>
          <p className="text-slate-600">Seven-step form builder</p>
          {sp.saved === "1" ? (
            <p className="mt-1 text-sm text-emerald-600">Saved successfully.</p>
          ) : null}
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="flex flex-wrap gap-2">
            <a
              href={publicUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50"
            >
              View Form
            </a>
            <Button type="submit" form="wizard-form">
              Save
            </Button>
          </div>
          <CopyUrlButton url={publicUrl} />
        </div>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        <aside className="w-full shrink-0 lg:w-56">
          <nav className="space-y-1 rounded-xl border border-slate-200 bg-white p-2 shadow-sm">
            {STEPS.map((s) => {
              const active = step === s.n;
              return (
                <Link
                  key={s.n}
                  href={`${baseEdit}?step=${s.n}`}
                  className={`block rounded-md px-3 py-2 text-sm ${
                    active
                      ? "bg-blue-600 font-medium text-white"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {s.n}. {s.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        <div className="min-w-0 flex-1">
          <form id="wizard-form" action={saveFormWizardAction}>
            <input type="hidden" name="slug" value={slug} />
            <input type="hidden" name="formId" value={formId} />
            <input type="hidden" name="step" value={step} />

            {step === 1 ? (
              <Card>
                <CardHeader title="Submission Setup" subtitle="What this form collects" />
                <CardBody className="space-y-4">
                  <label className="block text-sm">
                    Collects
                    <Select name="collects" defaultValue={form.collects} className="mt-1 max-w-xs">
                      <option value="abstracts">Abstracts</option>
                      <option value="sessions">Sessions</option>
                    </Select>
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      name="collectParticipants"
                      defaultChecked={form.collectParticipants}
                      className="rounded border-slate-300"
                    />
                    Collect participant information (speakers)
                  </label>
                </CardBody>
              </Card>
            ) : null}

            {step === 2 ? (
              <Card>
                <CardHeader title="Welcome Screen" subtitle="Public-facing intro" />
                <CardBody className="grid gap-4 md:grid-cols-2">
                  <label className="text-sm">
                    Internal name
                    <Input name="name" defaultValue={form.name} required className="mt-1" />
                  </label>
                  <label className="text-sm">
                    Public title
                    <Input name="title" defaultValue={form.title} required className="mt-1" />
                  </label>
                  <label className="text-sm md:col-span-2">
                    Page heading
                    <Input name="pageHeading" defaultValue={form.pageHeading ?? ""} className="mt-1" />
                  </label>
                  <label className="text-sm md:col-span-2">
                    Welcome message (HTML)
                    <Textarea
                      name="welcomeMessage"
                      rows={5}
                      defaultValue={form.welcomeMessage ?? ""}
                      className="mt-1"
                    />
                  </label>
                  <label className="flex items-center gap-2 text-sm md:col-span-2">
                    <input
                      type="checkbox"
                      name="showWelcome"
                      defaultChecked={form.showWelcome}
                      className="rounded border-slate-300"
                    />
                    Show welcome screen on public form
                  </label>
                </CardBody>
              </Card>
            ) : null}

            {step === 3 && submissionSection ? (
              <div className="space-y-4">
                <Card>
                  <CardHeader title="Abstract Information" subtitle="Section settings" />
                  <CardBody className="grid gap-4">
                    <input type="hidden" name="sectionId" value={submissionSection.id} />
                    <label className="text-sm">
                      Section title
                      <Input name="sectionTitle" defaultValue={submissionSection.title ?? ""} className="mt-1" />
                    </label>
                    <label className="text-sm">
                      Heading
                      <Input name="sectionHeading" defaultValue={submissionSection.heading ?? ""} className="mt-1" />
                    </label>
                    <label className="text-sm">
                      Instructions (HTML)
                      <Textarea
                        name="sectionDescription"
                        rows={3}
                        defaultValue={submissionSection.description ?? ""}
                        className="mt-1"
                      />
                    </label>
                  </CardBody>
                </Card>
                <QuestionList
                  slug={slug}
                  formId={formId}
                  step={3}
                  sectionId={submissionSection.id}
                  questions={submissionQuestions}
                />
                <Card>
                  <CardHeader title="Add from field library" />
                  <CardBody>
                    <form action={addQuestionAction} className="flex flex-wrap items-end gap-3">
                      <input type="hidden" name="slug" value={slug} />
                      <input type="hidden" name="formId" value={formId} />
                      <input type="hidden" name="sectionId" value={submissionSection.id} />
                      <input type="hidden" name="step" value="3" />
                      <label className="text-sm">
                        Field
                        <Select name="fieldId" className="mt-1 w-64">
                          {sessionFields
                            .filter((f) => !usedSessionFieldIds.has(f.id))
                            .map((f) => (
                              <option key={f.id} value={f.id}>
                                {f.label} ({f.type})
                              </option>
                            ))}
                        </Select>
                      </label>
                      <Button type="submit" variant="secondary">
                        Add question
                      </Button>
                    </form>
                  </CardBody>
                </Card>
              </div>
            ) : null}

            {step === 4 && participantSection ? (
              <div className="space-y-4">
                <Card>
                  <CardHeader title="Participant role config" subtitle="Speaker limits" />
                  <CardBody className="grid gap-4 md:grid-cols-3">
                    <input type="hidden" name="roleConfigId" value={roleConfig?.id ?? ""} />
                    <label className="flex items-center gap-2 text-sm md:col-span-3">
                      <input
                        type="checkbox"
                        name="speakerEnabled"
                        defaultChecked={roleConfig?.enabled ?? true}
                        className="rounded border-slate-300"
                      />
                      Enable Speaker role
                    </label>
                    <label className="text-sm">
                      Min speakers
                      <Input
                        name="speakerMin"
                        type="number"
                        min={0}
                        defaultValue={roleConfig?.minCount ?? 1}
                        className="mt-1"
                      />
                    </label>
                    <label className="text-sm">
                      Max speakers
                      <Input
                        name="speakerMax"
                        type="number"
                        min={1}
                        defaultValue={roleConfig?.maxCount ?? 5}
                        className="mt-1"
                      />
                    </label>
                  </CardBody>
                </Card>
                <Card>
                  <CardHeader title="Participant Information" subtitle="Section settings" />
                  <CardBody className="grid gap-4">
                    <input type="hidden" name="sectionId" value={participantSection.id} />
                    <label className="text-sm">
                      Section title
                      <Input name="sectionTitle" defaultValue={participantSection.title ?? ""} className="mt-1" />
                    </label>
                    <label className="text-sm">
                      Heading
                      <Input name="sectionHeading" defaultValue={participantSection.heading ?? ""} className="mt-1" />
                    </label>
                    <label className="text-sm">
                      Instructions (HTML)
                      <Textarea
                        name="sectionDescription"
                        rows={3}
                        defaultValue={participantSection.description ?? ""}
                        className="mt-1"
                      />
                    </label>
                  </CardBody>
                </Card>
                <QuestionList
                  slug={slug}
                  formId={formId}
                  step={4}
                  sectionId={participantSection.id}
                  questions={participantQuestions}
                />
                <Card>
                  <CardHeader title="Add from field library" />
                  <CardBody>
                    <form action={addQuestionAction} className="flex flex-wrap items-end gap-3">
                      <input type="hidden" name="slug" value={slug} />
                      <input type="hidden" name="formId" value={formId} />
                      <input type="hidden" name="sectionId" value={participantSection.id} />
                      <input type="hidden" name="step" value="4" />
                      <label className="text-sm">
                        Field
                        <Select name="fieldId" className="mt-1 w-64">
                          {contactFields
                            .filter((f) => !usedContactFieldIds.has(f.id))
                            .map((f) => (
                              <option key={f.id} value={f.id}>
                                {f.label} ({f.type})
                              </option>
                            ))}
                        </Select>
                      </label>
                      <Button type="submit" variant="secondary">
                        Add question
                      </Button>
                    </form>
                  </CardBody>
                </Card>
              </div>
            ) : null}

            {step === 5 ? (
              <Card>
                <CardHeader title="Payments & Fees" />
                <CardBody>
                  <p className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-6 text-center text-slate-600">
                    Payments are out of scope for Conferencer v1.
                  </p>
                </CardBody>
              </Card>
            ) : null}

            {step === 6 ? (
              <Card>
                <CardHeader title="Form Settings" subtitle="Close date, limits, and success page" />
                <CardBody className="grid gap-4 md:grid-cols-2">
                  <label className="text-sm">
                    Close date
                    <Input
                      name="closesAt"
                      type="datetime-local"
                      defaultValue={toDatetimeLocal(form.closesAt)}
                      className="mt-1"
                    />
                  </label>
                  <label className="text-sm">
                    Submission limit per user
                    <Input
                      name="submissionLimit"
                      type="number"
                      min={1}
                      defaultValue={form.submissionLimit ?? ""}
                      placeholder="Unlimited"
                      className="mt-1"
                    />
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      name="allowDrafts"
                      defaultChecked={form.allowDrafts}
                      className="rounded border-slate-300"
                    />
                    Allow drafts
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      name="allowMultipleDrafts"
                      defaultChecked={form.allowMultipleDrafts}
                      className="rounded border-slate-300"
                    />
                    Allow multiple drafts
                  </label>
                  <label className="text-sm md:col-span-2">
                    Success message (HTML)
                    <Textarea
                      name="successMessage"
                      rows={4}
                      defaultValue={form.successMessage ?? ""}
                      className="mt-1"
                    />
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      name="autoRedirectToPortal"
                      defaultChecked={form.autoRedirectToPortal}
                      className="rounded border-slate-300"
                    />
                    Auto-redirect to portal
                  </label>
                  <label className="text-sm">
                    Redirect after (seconds)
                    <Input
                      name="redirectSeconds"
                      type="number"
                      min={0}
                      defaultValue={form.redirectSeconds}
                      className="mt-1"
                    />
                  </label>
                </CardBody>
              </Card>
            ) : null}

            {step === 7 ? (
              <Card>
                <CardHeader title="Notifications" subtitle="Admin alerts and confirmation email" />
                <CardBody className="space-y-4">
                  <fieldset>
                    <legend className="mb-2 text-sm font-medium text-slate-700">
                      Notify organizers on new submission
                    </legend>
                    <div className="space-y-2">
                      {organizers.map((o) => (
                        <label key={o.userId} className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            name="notifyAdminUserIds"
                            value={o.userId}
                            defaultChecked={notifyIds.includes(o.userId)}
                            className="rounded border-slate-300"
                          />
                          {o.firstName} {o.lastName} ({o.email})
                        </label>
                      ))}
                      {organizers.length === 0 ? (
                        <p className="text-sm text-slate-500">No organizers found for this event.</p>
                      ) : null}
                    </div>
                  </fieldset>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      name="sendConfirmationEmail"
                      defaultChecked={form.sendConfirmationEmail}
                      className="rounded border-slate-300"
                    />
                    Send confirmation email to submitter
                  </label>
                  <label className="block text-sm">
                    Confirmation email body (HTML, optional override)
                    <Textarea
                      name="confirmationEmailBody"
                      rows={5}
                      defaultValue={form.confirmationEmailBody ?? ""}
                      className="mt-1"
                      placeholder="Leave blank to use the default template"
                    />
                  </label>
                </CardBody>
              </Card>
            ) : null}

            <div className="mt-4 flex justify-between">
              {step > 1 ? (
                <ButtonLink href={`${baseEdit}?step=${step - 1}`} variant="secondary">
                  Back
                </ButtonLink>
              ) : (
                <span />
              )}
              <div className="flex gap-2">
                <Button type="submit">Save</Button>
                {step < 7 ? (
                  <ButtonLink href={`${baseEdit}?step=${step + 1}`} variant="secondary">
                    Next
                  </ButtonLink>
                ) : null}
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

type QuestionRow = {
  id: string;
  fieldLabel: string | null;
  fieldType: string;
  maxLength: number | null;
  isRequired: boolean;
  isLocked: boolean;
  sortOrder: number;
};

function QuestionList({
  slug,
  formId,
  step,
  sectionId,
  questions,
}: {
  slug: string;
  formId: string;
  step: number;
  sectionId: string;
  questions: QuestionRow[];
}) {
  return (
    <Card>
      <CardHeader title="Questions" subtitle="Drag handle via reorder arrows" />
      <CardBody className="p-0">
        {questions.length === 0 ? (
          <p className="px-5 py-4 text-sm text-slate-500">No questions yet.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {questions.map((q, index) => (
              <li key={q.id} className="flex flex-wrap items-center gap-3 px-5 py-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium text-slate-900">{q.fieldLabel}</span>
                    <Badge className="bg-slate-100 text-slate-700">{q.fieldType}</Badge>
                    {q.isLocked ? (
                      <Badge className="bg-amber-100 text-amber-800">Locked</Badge>
                    ) : null}
                    {q.isRequired ? (
                      <Badge className="bg-blue-100 text-blue-800">Required</Badge>
                    ) : (
                      <Badge className="bg-slate-100 text-slate-500">Optional</Badge>
                    )}
                  </div>
                  {q.maxLength ? (
                    <p className="mt-0.5 text-xs text-slate-500">Max length: {q.maxLength}</p>
                  ) : null}
                </div>
                <div className="flex flex-wrap gap-1">
                  {!q.isLocked ? (
                    <form action={toggleQuestionRequiredAction}>
                      <input type="hidden" name="slug" value={slug} />
                      <input type="hidden" name="formId" value={formId} />
                      <input type="hidden" name="questionId" value={q.id} />
                      <input type="hidden" name="step" value={String(step)} />
                      <Button type="submit" variant="ghost">
                        {q.isRequired ? "Make optional" : "Make required"}
                      </Button>
                    </form>
                  ) : null}
                  <form action={moveQuestionAction}>
                    <input type="hidden" name="slug" value={slug} />
                    <input type="hidden" name="formId" value={formId} />
                    <input type="hidden" name="questionId" value={q.id} />
                    <input type="hidden" name="direction" value="up" />
                    <input type="hidden" name="step" value={String(step)} />
                    <Button type="submit" variant="ghost" disabled={index === 0}>
                      ↑
                    </Button>
                  </form>
                  <form action={moveQuestionAction}>
                    <input type="hidden" name="slug" value={slug} />
                    <input type="hidden" name="formId" value={formId} />
                    <input type="hidden" name="questionId" value={q.id} />
                    <input type="hidden" name="direction" value="down" />
                    <input type="hidden" name="step" value={String(step)} />
                    <Button type="submit" variant="ghost" disabled={index === questions.length - 1}>
                      ↓
                    </Button>
                  </form>
                  {!q.isLocked ? (
                    <form action={removeQuestionAction}>
                      <input type="hidden" name="slug" value={slug} />
                      <input type="hidden" name="formId" value={formId} />
                      <input type="hidden" name="questionId" value={q.id} />
                      <input type="hidden" name="step" value={String(step)} />
                      <Button type="submit" variant="danger">
                        Remove
                      </Button>
                    </form>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardBody>
    </Card>
  );
}
