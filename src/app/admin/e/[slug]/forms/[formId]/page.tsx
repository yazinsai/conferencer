import Link from "next/link";
import { notFound } from "next/navigation";

import { requireOrganizer } from "@/lib/guards";
import { all, readJson } from "@/lib/db";
import {
  formIsOpen,
  getForm,
  listFields,
  listQuestions,
  listRoleConfigs,
  sectionOfKind,
} from "@/lib/repo/forms";
import { listLookup } from "@/lib/repo/events";
import { listPlans, listRounds } from "@/lib/repo/evaluations";
import { saveFormStepAction } from "@/server/form-actions";
import { QuestionList } from "@/components/admin/question-list";
import {
  Button,
  Card,

  Chip,
  Dot,
  Field,
  Input,
  LinkButton,
  Notice,
  PageHeader,
  Select,
  Textarea,
  cx,
} from "@/components/ui";
import { CopyButton } from "@/components/client/basics";

export const dynamic = "force-dynamic";

const STEPS = [
  { n: 1, label: "Submission Setup" },
  { n: 2, label: "Welcome Screen" },
  { n: 3, label: "Abstract Information" },
  { n: 4, label: "Participant Information" },
  { n: 5, label: "Payments & Fees" },
  { n: 6, label: "Form Settings" },
  { n: 7, label: "Notifications" },
];

export default async function FormBuilderPage({
  params,
  searchParams,
}: PageProps<"/admin/e/[slug]/forms/[formId]">) {
  const { slug, formId } = await params;
  const sp = await searchParams;
  const { event } = await requireOrganizer(slug);
  const form = getForm(formId);
  if (!form || form.event_id !== event.id) notFound();

  const step = Math.min(7, Math.max(1, Number(sp.step ?? 1)));
  const base = `/admin/e/${slug}/forms/${form.id}`;
  const publicUrl = `/e/${event.slug}/submit/${form.id}`;

  const submissionSection = sectionOfKind(form.id, "submission");
  const participantSection = sectionOfKind(form.id, "participant");
  const submissionQuestions = listQuestions(form.id, "submission");
  const participantQuestions = listQuestions(form.id, "participant");
  const roleConfigs = listRoleConfigs(form.id);
  const sessionFields = listFields(event.id, "session");
  const contactFields = listFields(event.id, "contact");
  const admins = all<{ id: string; first_name: string; last_name: string; email: string }>(
    `SELECT u.id, u.first_name, u.last_name, u.email FROM users u
       JOIN event_memberships m ON m.user_id = u.id
      WHERE m.event_id = ? AND m.role = 'organizer' ORDER BY u.last_name`,
    event.id,
  );
  const notifyIds = readJson<string[]>(form.notify_admin_user_ids, []);
  const combined = readJson<{ question_keys?: string[]; max?: number; label?: string } | null>(
    form.combined_limit,
    null,
  );
  const routing = readJson<
    Array<{ track_id: string; round_id?: string; reviewer_user_ids?: string[] }>
  >(form.track_routing, []);
  const tracks = listLookup("tracks", event.id);
  const rounds = listPlans(event.id).flatMap((plan) =>
    listRounds(plan.id).map((round) => ({ id: round.id, name: round.name, planName: plan.name })),
  );
  const reviewers = all<{ id: string; first_name: string; last_name: string }>(
    `SELECT DISTINCT u.id, u.first_name, u.last_name FROM users u
       JOIN event_memberships m ON m.user_id = u.id
      WHERE m.event_id = ? AND m.role IN ('reviewer','organizer')
      ORDER BY u.last_name`,
    event.id,
  );

  return (
    <div>
      <PageHeader
        breadcrumb={
          <Link href={`/admin/e/${slug}/forms`} className="hover:underline">
            Forms
          </Link>
        }
        title={form.name}
        description={`Step ${step} of 7 · ${STEPS[step - 1].label}`}
        actions={
          <>
            <Chip tone={formIsOpen(form) ? "green" : "slate"}>
              {formIsOpen(form) ? "Open" : "Closed"}
            </Chip>
            <LinkButton href={publicUrl} size="sm">
              View Form
            </LinkButton>
            <CopyButton value={publicUrl} label="Copy Link" />
          </>
        }
      />

      {sp.saved ? <Notice tone="success" className="mb-4">Saved.</Notice> : null}

      <div className="flex flex-col gap-5 lg:flex-row">
        <nav aria-label="Builder steps" className="w-full shrink-0 lg:w-56">
          <ol className="space-y-1">
            {STEPS.map((s) => (
              <li key={s.n}>
                <Link
                  href={`${base}?step=${s.n}`}
                  aria-current={s.n === step ? "step" : undefined}
                  className={cx(
                    "flex items-center gap-2 rounded-md px-3 py-2 text-sm",
                    s.n === step
                      ? "bg-brand-50 font-medium text-brand-800"
                      : "text-slate-600 hover:bg-slate-100",
                  )}
                >
                  <span
                    className={cx(
                      "inline-flex h-5 w-5 items-center justify-center rounded-full text-xs",
                      s.n === step ? "bg-brand-600 text-white" : "bg-slate-200 text-slate-600",
                    )}
                  >
                    {s.n}
                  </span>
                  {s.label}
                </Link>
              </li>
            ))}
          </ol>
        </nav>

        <div className="min-w-0 flex-1 space-y-4">
          {step === 1 ? (
            <Card className="p-5">
              <h2 className="text-sm font-semibold text-slate-900">Submission setup</h2>
              <form action={saveFormStepAction} className="mt-4 space-y-4">
                <StepFields slug={slug} formId={form.id} step={1} next={2} />
                <fieldset>
                  <legend className="mb-1 text-sm font-medium text-slate-700">
                    What does this form collect?
                  </legend>
                  {[
                    {
                      value: "abstracts",
                      label: "Abstracts",
                      hint: "Proposals that go through review before a decision.",
                    },
                    {
                      value: "sessions",
                      label: "Sessions",
                      hint: "Confirmed programme items, e.g. sponsor slots.",
                    },
                  ].map((option) => (
                    <label
                      key={option.value}
                      className="mb-2 flex items-start gap-3 rounded-md border border-slate-200 p-3"
                    >
                      <input
                        type="radio"
                        name="collects"
                        value={option.value}
                        defaultChecked={form.collects === option.value}
                        className="mt-1"
                      />
                      <span>
                        <span className="block text-sm font-medium text-slate-800">
                          {option.label}
                        </span>
                        <span className="block text-xs text-slate-500">{option.hint}</span>
                      </span>
                    </label>
                  ))}
                </fieldset>
                <label className="flex items-start gap-3">
                  <input type="hidden" name="collect_participants__present" value="1" />
                  <input
                    type="checkbox"
                    name="collect_participants"
                    defaultChecked={Boolean(form.collect_participants)}
                    className="mt-1"
                  />
                  <span>
                    <span className="block text-sm font-medium text-slate-800">
                      Collect participants
                    </span>
                    <span className="block text-xs text-slate-500">
                      Ask the submitter to add speakers, with their own questions and limits.
                    </span>
                  </span>
                </label>
                <StepButtons step={1} base={base} />
              </form>
            </Card>
          ) : null}

          {step === 2 ? (
            <Card className="p-5">
              <h2 className="text-sm font-semibold text-slate-900">Welcome screen</h2>
              <form action={saveFormStepAction} className="mt-4 space-y-4">
                <StepFields slug={slug} formId={form.id} step={2} next={3} />
                <Field label="Internal name" name="name" hint="Only organizers see this." required>
                  <Input id="name" name="name" defaultValue={form.name} required />
                </Field>
                <Field label="Public title" name="title" required>
                  <Input id="title" name="title" defaultValue={form.title} required />
                </Field>
                <Field label="Page heading" name="page_heading">
                  <Input id="page_heading" name="page_heading" defaultValue={form.page_heading ?? ""} />
                </Field>
                <Field
                  label="Welcome message"
                  name="welcome_message"
                  hint="Simple HTML is allowed: <p>, <strong>, <em>, <ul>, <a>."
                >
                  <Textarea
                    id="welcome_message"
                    name="welcome_message"
                    rows={8}
                    defaultValue={form.welcome_message ?? ""}
                  />
                </Field>
                <label className="flex items-center gap-2 text-sm">
                  <input type="hidden" name="show_welcome__present" value="1" />
                  <input
                    type="checkbox"
                    name="show_welcome"
                    defaultChecked={Boolean(form.show_welcome)}
                  />
                  Show the welcome step on the public form
                </label>
                <StepButtons step={2} base={base} />
              </form>
            </Card>
          ) : null}

          {step === 3 ? (
            <>
              <Card className="p-5">
                <h2 className="text-sm font-semibold text-slate-900">Section heading</h2>
                <form action={saveFormStepAction} className="mt-4 space-y-4">
                  <StepFields slug={slug} formId={form.id} step={3} next={4} />
                  <Field label="Section title" name="section_title">
                    <Input
                      id="section_title"
                      name="section_title"
                      defaultValue={submissionSection.title ?? ""}
                    />
                  </Field>
                  <Field label="Heading shown to submitters" name="section_heading">
                    <Input
                      id="section_heading"
                      name="section_heading"
                      defaultValue={submissionSection.heading ?? ""}
                    />
                  </Field>
                  <Field label="Instructions" name="section_description">
                    <Textarea
                      id="section_description"
                      name="section_description"
                      rows={4}
                      defaultValue={submissionSection.description ?? ""}
                    />
                  </Field>
                  <StepButtons step={3} base={base} />
                </form>
              </Card>
              <QuestionList
                slug={slug}
                formId={form.id}
                kind="submission"
                questions={submissionQuestions}
                library={sessionFields}
              />
            </>
          ) : null}

          {step === 4 ? (
            <>
              <Card className="p-5">
                <h2 className="text-sm font-semibold text-slate-900">Participants</h2>
                <form action={saveFormStepAction} className="mt-4 space-y-4">
                  <StepFields slug={slug} formId={form.id} step={4} next={5} />
                  <Field label="Section title" name="section_title">
                    <Input
                      id="section_title"
                      name="section_title"
                      defaultValue={participantSection.title ?? ""}
                    />
                  </Field>
                  <Field label="Heading" name="section_heading">
                    <Input
                      id="section_heading"
                      name="section_heading"
                      defaultValue={participantSection.heading ?? ""}
                    />
                  </Field>
                  <Field label="Instructions" name="section_description">
                    <Textarea
                      id="section_description"
                      name="section_description"
                      rows={3}
                      defaultValue={participantSection.description ?? ""}
                    />
                  </Field>

                  <fieldset className="rounded-md border border-slate-200 p-3">
                    <legend className="px-1 text-sm font-medium text-slate-700">
                      Participant roles and limits
                    </legend>
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-xs uppercase tracking-wide text-slate-500">
                          <th className="py-1">Role</th>
                          <th className="py-1">Enabled</th>
                          <th className="py-1">Min</th>
                          <th className="py-1">Max</th>
                        </tr>
                      </thead>
                      <tbody>
                        {roleConfigs.map((rc) => (
                          <tr key={rc.role}>
                            <td className="py-1 capitalize">{rc.role}</td>
                            <td className="py-1">
                              <input
                                type="checkbox"
                                name={`role_${rc.role}_enabled`}
                                defaultChecked={Boolean(rc.enabled)}
                                aria-label={`Enable ${rc.role}`}
                              />
                            </td>
                            <td className="py-1">
                              <Input
                                name={`role_${rc.role}_min`}
                                type="number"
                                min={0}
                                defaultValue={rc.min_count}
                                className="w-20"
                                aria-label={`Minimum ${rc.role}s`}
                              />
                            </td>
                            <td className="py-1">
                              <Input
                                name={`role_${rc.role}_max`}
                                type="number"
                                min={0}
                                defaultValue={rc.max_count}
                                className="w-20"
                                aria-label={`Maximum ${rc.role}s`}
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <p className="mt-2 text-xs text-slate-500">
                      Only organizers can assign moderator and chairperson roles after submission.
                    </p>
                  </fieldset>

                  <StepButtons step={4} base={base} />
                </form>
              </Card>
              <QuestionList
                slug={slug}
                formId={form.id}
                kind="participant"
                questions={participantQuestions}
                library={contactFields}
              />
            </>
          ) : null}

          {step === 5 ? (
            <Card className="p-5">
              <h2 className="text-sm font-semibold text-slate-900">Payments &amp; fees</h2>
              <Notice tone="info" className="mt-3">
                Payments are intentionally out of scope for Conferencer. Submission fees, invoices
                and promo codes are not collected. This step exists so the wizard matches the flow
                you know — nothing here to configure.
              </Notice>
              <div className="mt-4 flex gap-2">
                <LinkButton href={`${base}?step=4`}>Back</LinkButton>
                <LinkButton href={`${base}?step=6`} variant="primary">
                  Next
                </LinkButton>
              </div>
            </Card>
          ) : null}

          {step === 6 ? (
            <Card className="p-5">
              <h2 className="text-sm font-semibold text-slate-900">Form settings</h2>
              <form action={saveFormStepAction} className="mt-4 space-y-4">
                <StepFields slug={slug} formId={form.id} step={6} next={7} />
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Opens at" name="opens_at">
                    <Input
                      id="opens_at"
                      name="opens_at"
                      type="datetime-local"
                      defaultValue={form.opens_at ?? ""}
                    />
                  </Field>
                  <Field
                    label="Closes at"
                    name="closes_at"
                    hint="After this moment the public form shows a closed state and submissions lock."
                  >
                    <Input
                      id="closes_at"
                      name="closes_at"
                      type="datetime-local"
                      defaultValue={form.closes_at ?? ""}
                    />
                  </Field>
                  <Field
                    label="Submissions per person"
                    name="submission_limit"
                    hint="Counts drafts and submitted proposals together. Blank = unlimited."
                  >
                    <Input
                      id="submission_limit"
                      name="submission_limit"
                      type="number"
                      min={1}
                      defaultValue={form.submission_limit ?? ""}
                    />
                  </Field>
                  <Field label="Form state" name="status">
                    <Select id="status" name="status" defaultValue={form.status}>
                      <option value="open">Open</option>
                      <option value="closed">Closed</option>
                    </Select>
                  </Field>
                </div>

                <label className="flex items-center gap-2 text-sm">
                  <input type="hidden" name="allow_drafts__present" value="1" />
                  <input type="checkbox" name="allow_drafts" defaultChecked={Boolean(form.allow_drafts)} />
                  Allow saving a draft and resuming later
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="hidden" name="allow_multiple_drafts__present" value="1" />
                  <input
                    type="checkbox"
                    name="allow_multiple_drafts"
                    defaultChecked={Boolean(form.allow_multiple_drafts)}
                  />
                  Allow more than one draft at a time
                </label>

                <Field
                  label="Success page message"
                  name="success_message"
                  hint="Shown right after a successful submission."
                >
                  <Textarea
                    id="success_message"
                    name="success_message"
                    rows={5}
                    defaultValue={form.success_message ?? ""}
                  />
                </Field>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="flex items-center gap-2 text-sm">
                    <input type="hidden" name="auto_redirect_to_portal__present" value="1" />
                    <input
                      type="checkbox"
                      name="auto_redirect_to_portal"
                      defaultChecked={Boolean(form.auto_redirect_to_portal)}
                    />
                    Redirect to the speaker portal afterwards
                  </label>
                  <Field label="Redirect after (seconds)" name="redirect_seconds">
                    <Input
                      id="redirect_seconds"
                      name="redirect_seconds"
                      type="number"
                      min={1}
                      defaultValue={form.redirect_seconds}
                    />
                  </Field>
                </div>

                <fieldset className="rounded-md border border-slate-200 p-3">
                  <legend className="px-1 text-sm font-medium text-slate-700">Track routing</legend>
                  <p className="mb-2 text-xs text-slate-500">
                    Send a submission straight into a review round the moment it arrives, based on
                    the track the submitter picked. Leave a track&apos;s round blank to route it by
                    hand.
                  </p>
                  {rounds.length ? (
                    <div className="space-y-2">
                      {tracks.map((track) => {
                        const rule = routing.find((r) => r.track_id === track.id);
                        return (
                          <div
                            key={track.id}
                            className="grid items-end gap-2 rounded-md border border-slate-100 p-2 sm:grid-cols-3"
                          >
                            <input type="hidden" name="routing_tracks" value={track.id} />
                            <p className="text-sm font-medium text-slate-800">
                              <Dot color={track.color} /> {track.name}
                            </p>
                            <label className="block text-xs font-medium text-slate-600">
                              Round
                              <Select
                                name={`routing_round_${track.id}`}
                                defaultValue={rule?.round_id ?? ""}
                              >
                                <option value="">No automatic routing</option>
                                {rounds.map((round) => (
                                  <option key={round.id} value={round.id}>
                                    {round.planName} · {round.name}
                                  </option>
                                ))}
                              </Select>
                            </label>
                            <label className="block text-xs font-medium text-slate-600">
                              Reviewers (ctrl-click for several)
                              <select
                                name={`routing_reviewers_${track.id}`}
                                multiple
                                defaultValue={rule?.reviewer_user_ids ?? []}
                                size={Math.min(4, Math.max(2, reviewers.length))}
                                className="w-full rounded-md border border-slate-300 bg-white px-2 py-1 text-xs"
                              >
                                {reviewers.map((reviewer) => (
                                  <option key={reviewer.id} value={reviewer.id}>
                                    {reviewer.first_name} {reviewer.last_name}
                                  </option>
                                ))}
                              </select>
                            </label>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500">
                      Create an evaluation plan with at least one round first — then you can route
                      each track to it automatically.
                    </p>
                  )}
                </fieldset>

                <fieldset className="rounded-md border border-slate-200 p-3">
                  <legend className="px-1 text-sm font-medium text-slate-700">
                    Cross-field character limit
                  </legend>
                  <p className="mb-2 text-xs text-slate-500">
                    Cap the combined length of several answers. The public form shows a live counter.
                  </p>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <Field label="Field keys (comma separated)" name="combined_keys">
                      <Input
                        id="combined_keys"
                        name="combined_keys"
                        defaultValue={(combined?.question_keys ?? []).join(", ")}
                        placeholder="description, key_takeaway"
                      />
                    </Field>
                    <Field label="Maximum characters" name="combined_max">
                      <Input
                        id="combined_max"
                        name="combined_max"
                        type="number"
                        defaultValue={combined?.max ?? ""}
                      />
                    </Field>
                    <Field label="Label" name="combined_label">
                      <Input
                        id="combined_label"
                        name="combined_label"
                        defaultValue={combined?.label ?? ""}
                      />
                    </Field>
                  </div>
                </fieldset>

                <StepButtons step={6} base={base} />
              </form>
            </Card>
          ) : null}

          {step === 7 ? (
            <Card className="p-5">
              <h2 className="text-sm font-semibold text-slate-900">Notifications</h2>
              <form action={saveFormStepAction} className="mt-4 space-y-4">
                <StepFields slug={slug} formId={form.id} step={7} next={7} />

                <fieldset>
                  <legend className="mb-1 text-sm font-medium text-slate-700">
                    Email these admins on a new submission
                  </legend>
                  <div className="space-y-1">
                    {admins.map((admin) => (
                      <label key={admin.id} className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          name="notify_admin_user_ids"
                          value={admin.id}
                          defaultChecked={notifyIds.includes(admin.id)}
                        />
                        {admin.first_name} {admin.last_name}{" "}
                        <span className="text-xs text-slate-400">{admin.email}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>
                <label className="flex items-center gap-2 text-sm">
                  <input type="hidden" name="notify_on_revision__present" value="1" />
                  <input
                    type="checkbox"
                    name="notify_on_revision"
                    defaultChecked={Boolean(form.notify_on_revision)}
                  />
                  Also notify them when a submission is revised
                </label>

                <hr className="border-slate-200" />

                <label className="flex items-center gap-2 text-sm">
                  <input type="hidden" name="send_confirmation_email__present" value="1" />
                  <input
                    type="checkbox"
                    name="send_confirmation_email"
                    defaultChecked={Boolean(form.send_confirmation_email)}
                  />
                  Send the submitter a confirmation email
                </label>
                <Field
                  label="Confirmation subject"
                  name="confirmation_email_subject"
                  hint="Leave blank to use the submission_confirmation template."
                >
                  <Input
                    id="confirmation_email_subject"
                    name="confirmation_email_subject"
                    defaultValue={form.confirmation_email_subject ?? ""}
                    placeholder="We received your submission to {event_name}"
                  />
                </Field>
                <Field
                  label="Confirmation body"
                  name="confirmation_email_body"
                  hint="Merge fields: {first_name} {speaker_name} {talk_title} {event_name} {portal_link}"
                >
                  <Textarea
                    id="confirmation_email_body"
                    name="confirmation_email_body"
                    rows={6}
                    defaultValue={form.confirmation_email_body ?? ""}
                  />
                </Field>

                <div className="flex gap-2">
                  <LinkButton href={`${base}?step=6`}>Back</LinkButton>
                  <Button type="submit" variant="primary">
                    Save
                  </Button>
                  <LinkButton href={publicUrl} variant="secondary">
                    View form
                  </LinkButton>
                </div>
              </form>
            </Card>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function StepFields({
  slug,
  formId,
  step,
  next,
}: {
  slug: string;
  formId: string;
  step: number;
  next: number;
}) {
  return (
    <>
      <input type="hidden" name="slug" value={slug} />
      <input type="hidden" name="id" value={formId} />
      <input type="hidden" name="step" value={step} />
      <input type="hidden" name="next_step" value={next} />
    </>
  );
}

function StepButtons({ step, base }: { step: number; base: string }) {
  return (
    <div className="flex flex-wrap gap-2 border-t border-slate-200 pt-4">
      {step > 1 ? <LinkButton href={`${base}?step=${step - 1}`}>Back</LinkButton> : null}
      <Button type="submit" name="next_step" value={String(step)} variant="secondary">
        Save
      </Button>
      {step < 7 ? (
        <Button type="submit" name="next_step" value={String(step + 1)} variant="primary">
          Save and continue
        </Button>
      ) : null}
    </div>
  );
}
