import Link from "next/link";
import { notFound } from "next/navigation";

import { requireOrganizer } from "@/lib/guards";
import { readJson } from "@/lib/db";
import { listLookup } from "@/lib/repo/events";
import { getForm, listQuestions } from "@/lib/repo/forms";
import { historyFor } from "@/lib/repo/audit";
import { listAssignmentsForSubmission, reviewsForSubmission } from "@/lib/repo/evaluations";
import { listUploads } from "@/lib/repo/uploads";
import {
  APPROVAL_LABELS,
  APPROVAL_STATUSES,
  getSubmissionRow,
  listParticipants,
  speakerFacingStatus,
  STATUS_LABELS,
  statusTone,
  SUBMISSION_STATUSES,
} from "@/lib/repo/submissions";
import {
  addParticipantAction,
  removeParticipantAction,
  restoreVersionAction,
  saveSubmissionAction,
  scheduleSubmissionAction,
  setApprovalAction,
  setParticipantRoleAction,
  setStatusAction,
  deleteSubmissionAction,
} from "../actions";
import {
  Avatar,
  Button,
  Card,
  CardHeader,
  Chip,
  Field,
  Input,
  LinkButton,
  Notice,
  Select,
  SubNav,
  Table,
  Td,
  Textarea,
  Th,
} from "@/components/ui";
import { ConfirmSubmit } from "@/components/client/basics";
import { dateOf, formatStamp, formatDateTime, timeOf } from "@/lib/datetime";
import { stripHtml } from "@/lib/fields";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps<"/admin/e/[slug]/submissions/[id]">) {
  const { slug, id } = await params;
  const { event } = await requireOrganizer(slug);
  const submission = getSubmissionRow(id);
  return { title: submission ? `${submission.title} · ${event.name}` : "Submission" };
}

export default async function SubmissionDetailPage({
  params,
  searchParams,
}: PageProps<"/admin/e/[slug]/submissions/[id]">) {
  const { slug, id } = await params;
  const sp = await searchParams;
  const { event } = await requireOrganizer(slug);
  const submission = getSubmissionRow(id);
  if (!submission || submission.event_id !== event.id) notFound();

  const tab = typeof sp.tab === "string" ? sp.tab : "details";
  const editing = sp.edit === "1" || tab === "edit";
  const base = `/admin/e/${slug}/submissions/${submission.id}`;

  const participants = listParticipants(submission.id);
  const reviews = reviewsForSubmission(submission.id);
  const assignments = listAssignmentsForSubmission(submission.id);
  const uploads = listUploads(event.id, { submissionId: submission.id });
  const history = historyFor("submission", submission.id);
  const answers = readJson<Record<string, unknown>>(submission.answers, {});
  const tags = readJson<string[]>(submission.tags, []);

  const tracks = listLookup("tracks", event.id);
  const formats = listLookup("formats", event.id);
  const rooms = listLookup("rooms", event.id);
  const levels = listLookup("levels", event.id);
  const allTags = listLookup("tags", event.id);
  const form = submission.form_id ? getForm(submission.form_id) : undefined;
  const questions = form ? listQuestions(form.id, "submission") : [];

  const answerLabel = (key: string) =>
    questions.find((q) => q.key === key)?.label ??
    key.replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase());

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <Link
            href={`/admin/e/${slug}/submissions`}
            className="text-sm font-medium text-brand-700 hover:underline"
          >
            ← All submissions
          </Link>
          <h1 className="mt-1 text-xl font-semibold tracking-tight text-slate-900">
            {submission.title}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Chip tone={statusTone(submission.status)}>{STATUS_LABELS[submission.status]}</Chip>
            <Chip tone={submission.approval_status === "approved" ? "green" : "slate"}>
              Content: {APPROVAL_LABELS[submission.approval_status]}
            </Chip>
            {submission.track_name ? (
              <Chip color={submission.track_color}>{submission.track_name}</Chip>
            ) : null}
            {submission.format_name ? <Chip tone="slate">{submission.format_name}</Chip> : null}
            <span className="text-xs text-slate-500">
              Speaker sees: <strong>{speakerFacingStatus(submission.status)}</strong>
            </span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <form action={setStatusAction} className="flex items-center gap-1">
            <input type="hidden" name="slug" value={slug} />
            <input type="hidden" name="id" value={submission.id} />
            <input type="hidden" name="status" value="accepted" />
            <Button type="submit" variant="success" size="sm">
              Accept
            </Button>
          </form>
          <form action={setStatusAction} className="flex items-center gap-1">
            <input type="hidden" name="slug" value={slug} />
            <input type="hidden" name="id" value={submission.id} />
            <input type="hidden" name="status" value="declined" />
            <Button type="submit" variant="danger" size="sm">
              Decline (Reject)
            </Button>
          </form>
          <LinkButton
            href={`/admin/e/${slug}/emails/compose?submission=${submission.id}`}
            size="sm"
          >
            Notify speaker
          </LinkButton>
          <LinkButton href={`${base}?edit=1`} size="sm" variant="primary">
            Edit
          </LinkButton>
        </div>
      </div>

      {sp.saved ? <Notice tone="success" className="mb-4">Changes saved.</Notice> : null}
      {sp.restored ? (
        <Notice tone="success" className="mb-4">Earlier version restored.</Notice>
      ) : null}

      <SubNav
        current={tab === "details" ? base : `${base}?tab=${tab}`}
        items={[
          { href: base, label: "Details" },
          { href: `${base}?tab=participants`, label: "Participants", count: participants.length },
          { href: `${base}?tab=files`, label: "Files", count: uploads.length },
          { href: `${base}?tab=reviews`, label: "Reviews", count: reviews.length },
          { href: `${base}?tab=history`, label: "History", count: history.length },
        ]}
      />

      {editing ? (
        <Card className="p-5">
          <h2 className="mb-4 text-sm font-semibold text-slate-900">Edit submission</h2>
          <form action={saveSubmissionAction} className="space-y-4">
            <input type="hidden" name="slug" value={slug} />
            <input type="hidden" name="id" value={submission.id} />
            <Field label="Title" name="title" required>
              <Input id="title" name="title" defaultValue={submission.title} required />
            </Field>
            <Field label="Abstract / description" name="description">
              <Textarea
                id="description"
                name="description"
                rows={8}
                defaultValue={submission.description ?? ""}
              />
            </Field>
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Track" name="track_id">
                <Select id="track_id" name="track_id" defaultValue={submission.track_id ?? ""}>
                  <option value="">—</option>
                  {tracks.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Format" name="format_id">
                <Select id="format_id" name="format_id" defaultValue={submission.format_id ?? ""}>
                  <option value="">—</option>
                  {formats.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Level" name="level">
                <Select id="level" name="level" defaultValue={submission.level ?? ""}>
                  <option value="">—</option>
                  {levels.map((l) => (
                    <option key={l.id} value={l.name}>
                      {l.name}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Record type" name="kind">
                <Select id="kind" name="kind" defaultValue={submission.kind}>
                  <option value="abstract">Abstract</option>
                  <option value="session">Session</option>
                </Select>
              </Field>
              <Field label="Language" name="language">
                <Input id="language" name="language" defaultValue={submission.language ?? ""} />
              </Field>
              <Field label="Capacity" name="capacity">
                <Input
                  id="capacity"
                  name="capacity"
                  type="number"
                  defaultValue={submission.capacity ?? ""}
                />
              </Field>
            </div>
            {allTags.length ? (
              <fieldset>
                <legend className="mb-1 text-sm font-medium text-slate-700">Tags</legend>
                <div className="flex flex-wrap gap-3">
                  {allTags.map((t) => (
                    <label key={t.id} className="flex items-center gap-1.5 text-sm">
                      <input
                        type="checkbox"
                        name="tags"
                        value={t.name}
                        defaultChecked={tags.includes(t.name)}
                      />
                      {t.name}
                    </label>
                  ))}
                </div>
              </fieldset>
            ) : null}
            {questions
              .filter((q) => !["title", "description", "track", "format"].includes(q.key))
              .map((q) => (
                <Field key={q.id} label={q.label} name={`answer_${q.key}`}>
                  {q.type === "textarea" || q.type === "wysiwyg" ? (
                    <Textarea
                      id={`answer_${q.key}`}
                      name={`answer_${q.key}`}
                      rows={4}
                      defaultValue={String(answers[q.key] ?? "")}
                    />
                  ) : (
                    <Input
                      id={`answer_${q.key}`}
                      name={`answer_${q.key}`}
                      defaultValue={String(answers[q.key] ?? "")}
                    />
                  )}
                </Field>
              ))}
            <div className="flex gap-2">
              <Button type="submit" variant="primary">
                Save changes
              </Button>
              <LinkButton href={base}>Cancel</LinkButton>
            </div>
          </form>

          <form action={deleteSubmissionAction} className="mt-6 border-t border-slate-200 pt-4">
            <input type="hidden" name="slug" value={slug} />
            <input type="hidden" name="id" value={submission.id} />
            <ConfirmSubmit message={`Delete "${submission.title}"? This cannot be undone.`}>
              Delete submission
            </ConfirmSubmit>
          </form>
        </Card>
      ) : tab === "participants" ? (
        <Card>
          <CardHeader
            title="Participants"
            description="Everyone attached to this submission and the role they hold."
          />
          <Table className="rounded-none border-0">
            <thead>
              <tr>
                <Th>Person</Th>
                <Th>Email</Th>
                <Th>Role</Th>
                <Th>Acceptance</Th>
                <Th />
              </tr>
            </thead>
            <tbody>
              {participants.map((p) => (
                <tr key={p.id}>
                  <Td>
                    <div className="flex items-center gap-2">
                      <Avatar
                        src={p.headshot_url}
                        name={`${p.first_name} ${p.last_name}`}
                        size={30}
                      />
                      <div>
                        <Link
                          href={`/admin/e/${slug}/speakers/${p.contact_id}`}
                          className="font-medium text-slate-800 hover:text-brand-700"
                        >
                          {p.first_name} {p.last_name}
                        </Link>
                        <p className="text-xs text-slate-500">
                          {[p.job_title, p.company].filter(Boolean).join(", ")}
                        </p>
                      </div>
                    </div>
                  </Td>
                  <Td className="text-xs">{p.email}</Td>
                  <Td>
                    <form action={setParticipantRoleAction} className="flex items-center gap-1">
                      <input type="hidden" name="slug" value={slug} />
                      <input type="hidden" name="id" value={submission.id} />
                      <input type="hidden" name="participant_id" value={p.id} />
                      <Select
                        name="role"
                        defaultValue={p.role}
                        aria-label={`Role for ${p.first_name}`}
                        className="w-36 py-1 text-xs"
                      >
                        {["submitter", "speaker", "moderator", "chairperson"].map((r) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                      </Select>
                      <Button type="submit" size="sm">
                        Set
                      </Button>
                    </form>
                  </Td>
                  <Td>
                    <Chip
                      tone={
                        p.acceptance_status === "accepted"
                          ? "green"
                          : p.acceptance_status === "declined"
                            ? "red"
                            : "slate"
                      }
                    >
                      {p.acceptance_status}
                    </Chip>
                  </Td>
                  <Td>
                    <form action={removeParticipantAction}>
                      <input type="hidden" name="slug" value={slug} />
                      <input type="hidden" name="id" value={submission.id} />
                      <input type="hidden" name="participant_id" value={p.id} />
                      <ConfirmSubmit
                        message={`Remove ${p.first_name} ${p.last_name} from this submission?`}
                        variant="ghost"
                      >
                        Remove
                      </ConfirmSubmit>
                    </form>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
          <form
            action={addParticipantAction}
            className="grid gap-3 border-t border-slate-200 p-4 sm:grid-cols-5"
          >
            <input type="hidden" name="slug" value={slug} />
            <input type="hidden" name="id" value={submission.id} />
            <Field label="Name" name="name">
              <Input id="name" name="name" placeholder="Ada Lovelace" />
            </Field>
            <Field label="Email" name="email" required>
              <Input id="email" name="email" type="email" required />
            </Field>
            <Field label="Job title" name="job_title">
              <Input id="job_title" name="job_title" />
            </Field>
            <Field label="Company" name="company">
              <Input id="company" name="company" />
            </Field>
            <Field label="Role" name="role">
              <div className="flex gap-2">
                <Select id="role" name="role" defaultValue="speaker">
                  {["speaker", "moderator", "chairperson"].map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </Select>
                <Button type="submit" variant="primary">
                  Add
                </Button>
              </div>
            </Field>
          </form>
        </Card>
      ) : tab === "files" ? (
        <Card>
          <CardHeader
            title="Files"
            description="Everything uploaded against this session."
            actions={
              <LinkButton href={`/admin/e/${slug}/files?submission=${submission.id}`} size="sm">
                Files library
              </LinkButton>
            }
          />
          {uploads.length ? (
            <Table className="rounded-none border-0">
              <thead>
                <tr>
                  <Th>File</Th>
                  <Th>Task</Th>
                  <Th>Uploaded by</Th>
                  <Th>Version</Th>
                  <Th>When</Th>
                  <Th />
                </tr>
              </thead>
              <tbody>
                {uploads.map((upload) => (
                  <tr key={upload.id}>
                    <Td className="font-medium">{upload.filename}</Td>
                    <Td>{upload.task_name ?? "—"}</Td>
                    <Td>{upload.contact_name ?? "—"}</Td>
                    <Td>v{upload.version}</Td>
                    <Td className="text-xs">{formatStamp(upload.created_at)}</Td>
                    <Td>
                      <a
                        className="text-sm font-medium text-brand-700 hover:underline"
                        href={`/f/${upload.id}?download=1`}
                      >
                        Download
                      </a>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <p className="px-4 py-6 text-sm text-slate-500">No files uploaded yet.</p>
          )}
        </Card>
      ) : tab === "reviews" ? (
        <Card>
          <CardHeader
            title="Reviews"
            description="Committee scores for this submission."
            actions={<LinkButton href={`/admin/e/${slug}/evaluation`} size="sm">Evaluation</LinkButton>}
          />
          {reviews.length ? (
            <ul className="divide-y divide-slate-100">
              {reviews.map((review) => (
                <li key={review.id} className="px-4 py-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-medium text-slate-900">
                      {review.reviewer_name}
                      <span className="ml-2 text-xs font-normal text-slate-500">
                        {review.plan_name} · {review.round_name}
                      </span>
                    </p>
                    <Chip tone="blue">
                      Score {review.score !== null ? review.score.toFixed(2) : "—"}
                    </Chip>
                  </div>
                  {review.comment ? (
                    <p className="mt-1 text-sm text-slate-700">{review.comment}</p>
                  ) : null}
                  <p className="mt-1 text-xs text-slate-400">
                    Submitted {formatStamp(review.submitted_at)}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-4 py-6 text-sm text-slate-500">No reviews submitted yet.</p>
          )}
          {assignments.length ? (
            <div className="border-t border-slate-200 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Assigned reviewers
              </p>
              <ul className="mt-1 flex flex-wrap gap-2">
                {assignments.map((a) => (
                  <li key={a.id}>
                    <Chip tone={a.status === "complete" ? "green" : "slate"}>
                      {a.first_name} {a.last_name} · {a.round_name} · {a.status}
                    </Chip>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </Card>
      ) : tab === "history" ? (
        <Card>
          <CardHeader
            title="Change history"
            description="Every edit, with who made it and when. Restore an earlier version if needed."
          />
          {history.length ? (
            <ul className="divide-y divide-slate-100">
              {history.map((entry) => (
                <li key={entry.id} className="flex items-start justify-between gap-3 px-4 py-3">
                  <div>
                    <p className="text-sm text-slate-800">{entry.summary ?? entry.action}</p>
                    <p className="text-xs text-slate-500">
                      {entry.actor_name} · {formatStamp(entry.created_at)}
                    </p>
                    {entry.before ? (
                      <details className="mt-1">
                        <summary className="cursor-pointer text-xs text-brand-700">
                          What changed
                        </summary>
                        <pre className="mt-1 max-w-2xl overflow-x-auto rounded bg-slate-50 p-2 text-[11px] text-slate-600">
                          {JSON.stringify(
                            { before: JSON.parse(entry.before), after: JSON.parse(entry.after ?? "{}") },
                            null,
                            2,
                          )}
                        </pre>
                      </details>
                    ) : null}
                  </div>
                  {entry.before && entry.action === "edited" ? (
                    <form action={restoreVersionAction}>
                      <input type="hidden" name="slug" value={slug} />
                      <input type="hidden" name="id" value={submission.id} />
                      <input type="hidden" name="entry_id" value={entry.id} />
                      <ConfirmSubmit
                        message="Restore the content from before this edit?"
                        variant="secondary"
                      >
                        Restore this version
                      </ConfirmSubmit>
                    </form>
                  ) : null}
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-4 py-6 text-sm text-slate-500">No changes recorded yet.</p>
          )}
        </Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            <Card className="p-5">
              <h2 className="text-sm font-semibold text-slate-900">Abstract</h2>
              <p className="mt-2 whitespace-pre-line text-sm text-slate-700">
                {stripHtml(submission.description ?? "") || "No description provided."}
              </p>
            </Card>

            <Card>
              <CardHeader title="Answers" description="Everything captured by the form." />
              <dl className="divide-y divide-slate-100">
                {Object.entries(answers).length ? (
                  Object.entries(answers).map(([key, value]) => (
                    <div key={key} className="grid gap-1 px-4 py-3 sm:grid-cols-3">
                      <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
                        {answerLabel(key)}
                      </dt>
                      <dd className="text-sm text-slate-800 sm:col-span-2">
                        {Array.isArray(value) ? value.join(", ") : stripHtml(String(value ?? "—")) || "—"}
                      </dd>
                    </div>
                  ))
                ) : (
                  <p className="px-4 py-6 text-sm text-slate-500">No custom answers.</p>
                )}
              </dl>
            </Card>

            <Card>
              <CardHeader title="Participants" description="Speakers attached to this submission." />
              <ul className="divide-y divide-slate-100">
                {participants.map((p) => (
                  <li key={p.id} className="flex items-center gap-3 px-4 py-3">
                    <Avatar src={p.headshot_url} name={`${p.first_name} ${p.last_name}`} size={34} />
                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/admin/e/${slug}/speakers/${p.contact_id}`}
                        className="text-sm font-medium text-slate-900 hover:text-brand-700"
                      >
                        {p.first_name} {p.last_name}
                      </Link>
                      <p className="text-xs text-slate-500">
                        {[p.job_title, p.company].filter(Boolean).join(", ")} · {p.email}
                      </p>
                    </div>
                    <Chip tone="slate">{p.role}</Chip>
                  </li>
                ))}
              </ul>
            </Card>
          </div>

          <div className="space-y-4">
            <Card className="p-4">
              <h2 className="text-sm font-semibold text-slate-900">Decision</h2>
              <form action={setStatusAction} className="mt-3 space-y-2">
                <input type="hidden" name="slug" value={slug} />
                <input type="hidden" name="id" value={submission.id} />
                <Select name="status" defaultValue={submission.status} aria-label="Status">
                  {SUBMISSION_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {STATUS_LABELS[s]}
                    </option>
                  ))}
                </Select>
                <Button type="submit" variant="primary" className="w-full">
                  Save status
                </Button>
              </form>

              <h3 className="mt-4 text-sm font-semibold text-slate-900">Content approval</h3>
              <p className="mt-1 text-xs text-slate-500">
                Only approved content appears on the public site.
              </p>
              <form action={setApprovalAction} className="mt-2 space-y-2">
                <input type="hidden" name="slug" value={slug} />
                <input type="hidden" name="id" value={submission.id} />
                <Select
                  name="approval_status"
                  defaultValue={submission.approval_status}
                  aria-label="Content approval status"
                >
                  {APPROVAL_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {APPROVAL_LABELS[s]}
                    </option>
                  ))}
                </Select>
                <Button type="submit" className="w-full">
                  Save approval
                </Button>
              </form>
            </Card>

            <Card className="p-4">
              <h2 className="text-sm font-semibold text-slate-900">Schedule</h2>
              <p className="mt-1 text-xs text-slate-500">
                Set a slot here or drag the session on the agenda board.
              </p>
              <form action={scheduleSubmissionAction} className="mt-3 space-y-3">
                <input type="hidden" name="slug" value={slug} />
                <input type="hidden" name="id" value={submission.id} />
                <Field label="Date" name="date">
                  <Input
                    id="date"
                    name="date"
                    type="date"
                    defaultValue={dateOf(submission.starts_at) ?? ""}
                    min={dateOf(event.starts_at) ?? undefined}
                    max={dateOf(event.ends_at) ?? undefined}
                  />
                </Field>
                <div className="grid grid-cols-2 gap-2">
                  <Field label="Start" name="start">
                    <Input
                      id="start"
                      name="start"
                      type="time"
                      defaultValue={timeOf(submission.starts_at) ?? ""}
                    />
                  </Field>
                  <Field label="End" name="end">
                    <Input
                      id="end"
                      name="end"
                      type="time"
                      defaultValue={timeOf(submission.ends_at) ?? ""}
                    />
                  </Field>
                </div>
                <Field label="Room" name="location_id">
                  <Select
                    id="location_id"
                    name="location_id"
                    defaultValue={submission.location_id ?? ""}
                  >
                    <option value="">Unassigned</option>
                    {rooms.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Button type="submit" variant="primary" className="w-full">
                  Save schedule
                </Button>
              </form>
              {submission.pub_published_at ? (
                <p className="mt-2 text-xs text-emerald-700">
                  Published to the public agenda {formatStamp(submission.pub_published_at)}
                </p>
              ) : submission.starts_at ? (
                <p className="mt-2 text-xs text-amber-700">
                  Scheduled but not published yet — publish from the agenda board.
                </p>
              ) : null}
            </Card>

            <Card className="p-4 text-sm">
              <h2 className="text-sm font-semibold text-slate-900">Record</h2>
              <dl className="mt-2 space-y-1 text-xs text-slate-600">
                <div className="flex justify-between gap-2">
                  <dt>Submitted</dt>
                  <dd>{formatDateTime(submission.created_at.slice(0, 16))}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt>Source form</dt>
                  <dd>{form ? form.name : "Added manually"}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt>Submitter</dt>
                  <dd>{submission.submitter_name ?? "—"}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt>Average score</dt>
                  <dd>
                    {submission.avg_score !== null && submission.avg_score !== undefined
                      ? `${submission.avg_score.toFixed(2)} (${submission.review_count})`
                      : "—"}
                  </dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt>Notified</dt>
                  <dd>{submission.notified_at ? formatStamp(submission.notified_at) : "Not yet"}</dd>
                </div>
              </dl>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
