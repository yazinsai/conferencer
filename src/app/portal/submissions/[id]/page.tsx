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
  Chip,
  LinkButton,
  Notice,
  Textarea,
} from "@/components/ui";
import { ConfirmSubmit } from "@/components/client/basics";
import { formatRange } from "@/lib/datetime";
import { stripHtml } from "@/lib/fields";

export const dynamic = "force-dynamic";

function sentenceLabel(label: string) {
  if (!label) return label;
  const spaced = label.replace(/_/g, " ");
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

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
  const showParticipation =
    submission.status === "accepted" && event.participant_acceptance_enabled && mine.length > 0;
  const outstanding = mine.filter((p) => p.acceptance_status === "pending").length;

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href="/portal/submissions"
        className="text-sm font-medium text-signal hover:underline"
      >
        ← My submissions
      </Link>
      <div className="mt-2 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="display text-xl text-ink sm:text-2xl">{submission.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
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
              variant="secondary"
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

      {showParticipation ? (
        <section className="mt-5 rounded-card border border-rule bg-paper p-5 shadow-[var(--shadow-raised)]">
          <h2 className="text-base font-semibold text-ink">Confirm your participation</h2>
          <p className="mt-1 text-sm text-neutral">
            {outstanding
              ? `${outstanding} role${outstanding === 1 ? "" : "s"} still need${outstanding === 1 ? "s" : ""} a response. Let the organizers know you can speak.`
              : "You have responded for every role. You can update an answer below if plans change."}
          </p>
          <ul className="mt-4 divide-y divide-rule border-t border-rule">
            {mine.map((participant) => (
              <li
                key={participant.id}
                className="flex flex-wrap items-center justify-between gap-3 py-3"
              >
                <div>
                  <p className="text-sm font-medium capitalize text-ink">{participant.role}</p>
                  <p className="text-xs text-muted-foreground">
                    Current answer:{" "}
                    <strong className="capitalize text-ink-2">
                      {participant.acceptance_status}
                    </strong>
                  </p>
                </div>
                <div className="flex gap-2">
                  <form action={confirmParticipationAction}>
                    <input type="hidden" name="participant_id" value={participant.id} />
                    <input type="hidden" name="submission_id" value={submission.id} />
                    <input type="hidden" name="decision" value="accepted" />
                    <Button type="submit" size="sm" variant="primary">
                      Confirm
                    </Button>
                  </form>
                  <form action={confirmParticipationAction}>
                    <input type="hidden" name="participant_id" value={participant.id} />
                    <input type="hidden" name="submission_id" value={submission.id} />
                    <input type="hidden" name="decision" value="declined" />
                    <Button type="submit" size="sm" variant="danger">
                      Decline
                    </Button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <div className="mt-8 space-y-8">
        <section className="border-b border-rule pb-8">
          <h2 className="text-sm font-semibold text-ink">Abstract</h2>
          <p className="mt-2 whitespace-pre-line text-sm text-ink-2">
            {stripHtml(submission.description ?? "") || "No description yet."}
          </p>
        </section>

        {Object.keys(answers).length ? (
          <section className="border-b border-rule pb-8">
            <h2 className="text-sm font-semibold text-ink">Your answers</h2>
            <dl className="mt-3 divide-y divide-rule">
              {Object.entries(answers).map(([key, value]) => {
                const raw = questions.find((q) => q.key === key)?.label ?? key.replace(/_/g, " ");
                return (
                  <div key={key} className="grid gap-1 py-3 sm:grid-cols-3">
                    <dt className="text-xs font-medium text-muted-foreground">
                      {sentenceLabel(raw)}
                    </dt>
                    <dd className="text-sm text-ink-2 sm:col-span-2">
                      {stripHtml(String(value ?? "")) || "—"}
                    </dd>
                  </div>
                );
              })}
            </dl>
          </section>
        ) : null}

        <section className="border-b border-rule pb-8">
          <h2 className="text-sm font-semibold text-ink">Speakers</h2>
          <ul className="mt-3 divide-y divide-rule">
            {participants
              .filter((p) => p.role !== "submitter")
              .map((participant) => (
                <li key={participant.id} className="flex items-center gap-3 py-3">
                  <Avatar
                    src={participant.headshot_url}
                    name={`${participant.first_name} ${participant.last_name}`}
                    size={34}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-ink">
                      {participant.first_name} {participant.last_name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {[participant.job_title, participant.company].filter(Boolean).join(", ")}
                    </p>
                  </div>
                  <Chip tone="slate">{participant.role}</Chip>
                </li>
              ))}
          </ul>
        </section>

        {uploads.length ? (
          <section className="border-b border-rule pb-8">
            <h2 className="text-sm font-semibold text-ink">Files</h2>
            <ul className="mt-3 divide-y divide-rule">
              {uploads.map((upload) => (
                <li
                  key={upload.id}
                  className="flex items-center justify-between py-2.5 text-sm"
                >
                  <span className="text-ink-2">
                    {upload.filename}{" "}
                    <span className="tnum text-xs text-muted-foreground">v{upload.version}</span>
                  </span>
                  <a href={`/f/${upload.id}`} className="font-medium text-signal hover:underline">
                    View
                  </a>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {event.allow_withdrawal && submission.status !== "withdrawn" ? (
          <section>
            <details>
              <summary className="cursor-pointer text-sm font-medium text-destructive">
                Withdraw this submission
              </summary>
              <form action={withdrawSubmissionAction} className="mt-3 max-w-lg space-y-2">
                <input type="hidden" name="submission_id" value={submission.id} />
                <label htmlFor="reason" className="block text-xs font-medium text-ink-2">
                  Reason (shared with the organizers)
                </label>
                <Textarea id="reason" name="reason" rows={3} required />
                <ConfirmSubmit message="Withdraw this submission? The organizers will be notified.">
                  Withdraw submission
                </ConfirmSubmit>
              </form>
            </details>
          </section>
        ) : null}
      </div>
    </div>
  );
}
