import Link from "next/link";
import { forbidden, notFound } from "next/navigation";

import { requirePortalUser } from "@/lib/guards";
import { readJson } from "@/lib/db";
import { linkContactToUser, portalContact } from "@/lib/repo/contacts";
import { formIsOpen, getForm, listQuestions } from "@/lib/repo/forms";
import { getSubmissionRow, listParticipants } from "@/lib/repo/submissions";
import { speakerFacingStatus, statusTone } from "@/lib/status";
import { listUploads } from "@/lib/repo/uploads";
import {
  confirmParticipationAction,
  withdrawSubmissionAction,
} from "@/server/portal-actions";
import {
  Avatar,
  Button,
  Card,
  CardHeader,
  Chip,
  LinkButton,
  Notice,
  Textarea,
} from "@/components/ui";
import { ConfirmSubmit } from "@/components/client/basics";
import { formatRange } from "@/lib/datetime";
import { stripHtml } from "@/lib/fields";

export const dynamic = "force-dynamic";

export default async function PortalSubmissionDetail({
  params,
}: PageProps<"/portal/submissions/[id]">) {
  const { id } = await params;
  const { user, event } = await requirePortalUser();
  const contact = portalContact(event, user) ?? linkContactToUser(event, user);
  const submission = getSubmissionRow(id);
  if (!submission || submission.event_id !== event.id) notFound();

  const participants = listParticipants(submission.id);
  const mine = participants.filter((p) => p.contact_id === contact.id);
  const owns = submission.submitter_contact_id === contact.id || mine.length > 0;
  if (!owns) forbidden();

  const form = submission.form_id ? getForm(submission.form_id) : undefined;
  const open = form ? formIsOpen(form) : false;
  const answers = readJson<Record<string, unknown>>(submission.answers, {});
  const questions = form ? listQuestions(form.id, "submission") : [];
  const uploads = listUploads(event.id, { submissionId: submission.id });

  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/portal/submissions" className="text-sm font-medium text-brand-700 hover:underline">
        ← My submissions
      </Link>
      <div className="mt-2 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-slate-900">
            {submission.title}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {submission.format_name ?? "Format to be confirmed"}
            {submission.track_name ? ` · ${submission.track_name}` : ""}
            {submission.pub_starts_at
              ? ` · ${formatRange(submission.pub_starts_at, submission.pub_ends_at)}`
              : ""}
            {submission.room_name ? ` · ${submission.room_name}` : ""}
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <Chip tone={statusTone(submission.status)}>
            {speakerFacingStatus(submission.status)}
          </Chip>
          {open && submission.status !== "withdrawn" ? (
            <LinkButton
              href={`/e/${event.slug}/submit/${submission.form_id}?submission=${submission.id}`}
              variant="primary"
              size="sm"
            >
              Edit submission
            </LinkButton>
          ) : null}
        </div>
      </div>

      {!open ? (
        <Notice tone="warning" className="mt-4">
          The call for speakers is closed, so this submission is now read-only.
        </Notice>
      ) : null}

      {submission.status === "accepted" && event.participant_acceptance_enabled ? (
        <Card className="mt-4">
          <CardHeader
            title="Confirm your participation"
            description="Let the organizers know you can speak. Confirm each role you hold."
          />
          <ul className="divide-y divide-slate-100">
            {mine.map((participant) => (
              <li
                key={participant.id}
                className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
              >
                <div>
                  <p className="text-sm font-medium capitalize text-slate-800">
                    {participant.role}
                  </p>
                  <p className="text-xs text-slate-500">
                    Current answer:{" "}
                    <strong className="capitalize">{participant.acceptance_status}</strong>
                  </p>
                </div>
                <div className="flex gap-2">
                  {(["accepted", "declined"] as const).map((decision) => (
                    <form key={decision} action={confirmParticipationAction}>
                      <input type="hidden" name="participant_id" value={participant.id} />
                      <input type="hidden" name="submission_id" value={submission.id} />
                      <input type="hidden" name="decision" value={decision} />
                      <Button
                        type="submit"
                        size="sm"
                        variant={decision === "accepted" ? "success" : "danger"}
                      >
                        {decision === "accepted" ? "Confirm" : "Decline"}
                      </Button>
                    </form>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        </Card>
      ) : null}

      <Card className="mt-4 p-5">
        <h2 className="text-sm font-semibold text-slate-900">Abstract</h2>
        <p className="mt-2 whitespace-pre-line text-sm text-slate-700">
          {stripHtml(submission.description ?? "") || "No description yet."}
        </p>
      </Card>

      {Object.keys(answers).length ? (
        <Card className="mt-4">
          <CardHeader title="Your answers" />
          <dl className="divide-y divide-slate-100">
            {Object.entries(answers).map(([key, value]) => (
              <div key={key} className="grid gap-1 px-4 py-3 sm:grid-cols-3">
                <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  {questions.find((q) => q.key === key)?.label ?? key.replace(/_/g, " ")}
                </dt>
                <dd className="text-sm text-slate-800 sm:col-span-2">
                  {stripHtml(String(value ?? "")) || "—"}
                </dd>
              </div>
            ))}
          </dl>
        </Card>
      ) : null}

      <Card className="mt-4">
        <CardHeader title="Speakers" />
        <ul className="divide-y divide-slate-100">
          {participants
            .filter((p) => p.role !== "submitter")
            .map((participant) => (
              <li key={participant.id} className="flex items-center gap-3 px-4 py-3">
                <Avatar
                  src={participant.headshot_url}
                  name={`${participant.first_name} ${participant.last_name}`}
                  size={34}
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-slate-900">
                    {participant.first_name} {participant.last_name}
                  </p>
                  <p className="text-xs text-slate-500">
                    {[participant.job_title, participant.company].filter(Boolean).join(", ")}
                  </p>
                </div>
                <Chip tone="slate">{participant.role}</Chip>
              </li>
            ))}
        </ul>
      </Card>

      {uploads.length ? (
        <Card className="mt-4">
          <CardHeader title="Files" />
          <ul className="divide-y divide-slate-100">
            {uploads.map((upload) => (
              <li key={upload.id} className="flex items-center justify-between px-4 py-2.5 text-sm">
                <span>
                  {upload.filename}{" "}
                  <span className="text-xs text-slate-400">v{upload.version}</span>
                </span>
                <a href={`/f/${upload.id}`} className="text-brand-700 hover:underline">
                  View
                </a>
              </li>
            ))}
          </ul>
        </Card>
      ) : null}

      {event.allow_withdrawal && submission.status !== "withdrawn" ? (
        <Card className="mt-4 p-4">
          <details>
            <summary className="cursor-pointer text-sm font-medium text-red-700">
              Withdraw this submission
            </summary>
            <form action={withdrawSubmissionAction} className="mt-3 space-y-2">
              <input type="hidden" name="submission_id" value={submission.id} />
              <label htmlFor="reason" className="block text-xs font-medium text-slate-600">
                Reason (shared with the organizers)
              </label>
              <Textarea id="reason" name="reason" rows={3} required />
              <ConfirmSubmit message="Withdraw this submission? The organizers will be notified.">
                Withdraw submission
              </ConfirmSubmit>
            </form>
          </details>
        </Card>
      ) : null}
    </div>
  );
}
