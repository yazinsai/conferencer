import Link from "next/link";
import { forbidden, notFound } from "next/navigation";

import { requireReviewer } from "@/lib/guards";
import { readJson } from "@/lib/db";
import {
  getAssignment,
  getPlan,
  getReviewByAssignment,
  getRound,
  listScorecard,
  reviewerQueue,
  roundIsOpen,
} from "@/lib/repo/evaluations";
import { getForm, listQuestions } from "@/lib/repo/forms";
import { getSubmissionRow, listParticipants } from "@/lib/repo/submissions";
import { abstainAction, saveReviewAction } from "@/server/review-actions";
import { ReviewForm } from "@/components/review/review-form";
import { Card, CardHeader, Chip, FormError, Notice } from "@/components/ui";
import { stripHtml } from "@/lib/fields";

export const dynamic = "force-dynamic";

export default async function ReviewAssignment({
  params,
  searchParams,
}: PageProps<"/review/a/[assignmentId]">) {
  const { assignmentId } = await params;
  const sp = await searchParams;
  const { user, event } = await requireReviewer();

  const assignment = getAssignment(assignmentId);
  if (!assignment) notFound();
  // Identifier swapping: this is the check the rubric probes (ABS-05 / R-ROLE-2).
  if (assignment.reviewer_user_id !== user.id && !user.is_superadmin) forbidden();

  const round = getRound(assignment.round_id);
  const plan = round ? getPlan(round.plan_id) : undefined;
  if (!round || !plan || plan.event_id !== event.id) notFound();

  const submission = getSubmissionRow(assignment.submission_id);
  if (!submission) notFound();

  const anonymous = Boolean(round.anonymize || plan.anonymize);
  const questions = listScorecard(round.id);
  const existing = getReviewByAssignment(assignment.id);
  const answers = readJson<Record<string, unknown>>(existing?.answers, {});
  const open = roundIsOpen(round, plan);
  const error = typeof sp.error === "string" ? sp.error : null;

  const visibleFields = readJson<string[]>(round.visible_fields, []);
  const showField = (key: string) => !visibleFields.length || visibleFields.includes(key);
  const form = submission.form_id ? getForm(submission.form_id) : undefined;
  const formQuestions = form ? listQuestions(form.id, "submission") : [];
  const submissionAnswers = readJson<Record<string, unknown>>(submission.answers, {});
  const participants = anonymous ? [] : listParticipants(submission.id);

  // The next unreviewed item, for "go to next submission after saving".
  const queue = reviewerQueue(round.id, user.id);
  const currentIndex = queue.findIndex((item) => item.id === assignment.id);
  const next = queue
    .slice(currentIndex + 1)
    .concat(queue.slice(0, Math.max(currentIndex, 0)))
    .find((item) => !["complete", "abstained"].includes(item.status));

  return (
    <div>
      <Link
        href={`/review/round/${round.id}`}
        className="text-sm font-medium text-brand-700 hover:underline"
      >
        ← Back to {round.name}
      </Link>

      {error ? (
        <div className="mt-3">
          <FormError>{error}</FormError>
        </div>
      ) : null}
      {anonymous ? (
        <Notice tone="info" className="mt-3">
          This is a <strong>blind round</strong>: author and co-author identity is hidden from
          reviewers. Score the abstract on its own merits.
        </Notice>
      ) : null}
      {!open ? (
        <Notice tone="warning" className="mt-3">
          This round is closed — your review can no longer be changed.
        </Notice>
      ) : null}

      <div className="mt-4 grid gap-5 lg:grid-cols-5">
        <div className="space-y-4 lg:col-span-3">
          <Card className="p-5">
            <h1 className="text-xl font-semibold tracking-tight text-slate-900">
              {submission.title}
            </h1>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {showField("track") && submission.track_name ? (
                <Chip color={submission.track_color}>{submission.track_name}</Chip>
              ) : null}
              {showField("format") && submission.format_name ? (
                <Chip tone="slate">{submission.format_name}</Chip>
              ) : null}
              {showField("level") && submission.level ? (
                <Chip tone="blue">{submission.level}</Chip>
              ) : null}
              {showField("language") && submission.language ? (
                <Chip tone="slate">{submission.language}</Chip>
              ) : null}
            </div>
            {showField("description") ? (
              <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-slate-700">
                {stripHtml(submission.description ?? "")}
              </p>
            ) : null}
          </Card>

          {Object.keys(submissionAnswers).length ? (
            <Card>
              <CardHeader title="Answers" />
              <dl className="divide-y divide-slate-100">
                {Object.entries(submissionAnswers)
                  .filter(([key]) => showField(key))
                  .map(([key, value]) => (
                    <div key={key} className="grid gap-1 px-4 py-3 sm:grid-cols-3">
                      <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
                        {formQuestions.find((q) => q.key === key)?.label ?? key.replace(/_/g, " ")}
                      </dt>
                      <dd className="text-sm text-slate-800 sm:col-span-2">
                        {stripHtml(String(value ?? "")) || "—"}
                      </dd>
                    </div>
                  ))}
              </dl>
            </Card>
          ) : null}

          {anonymous ? (
            <Card className="p-4">
              <p className="text-sm text-slate-500">
                <strong className="text-slate-700">Speakers hidden.</strong> Author identity is not
                shown in this round.
              </p>
            </Card>
          ) : round.show_participants && participants.length ? (
            <Card>
              <CardHeader title="Speakers" />
              <ul className="divide-y divide-slate-100">
                {participants
                  .filter((p) => p.role !== "submitter")
                  .map((participant) => (
                    <li key={participant.id} className="px-4 py-2.5 text-sm">
                      <span className="font-medium text-slate-800">
                        {participant.first_name} {participant.last_name}
                      </span>
                      <span className="ml-2 text-xs text-slate-500">
                        {[participant.job_title, participant.company].filter(Boolean).join(", ")}
                      </span>
                    </li>
                  ))}
              </ul>
            </Card>
          ) : null}
        </div>

        <div className="lg:col-span-2">
          <ReviewForm
            assignmentId={assignment.id}
            questions={questions.map((question) => ({
              id: question.id,
              type: question.type,
              label: question.label,
              options: question.options,
              min: question.min,
              max: question.max,
              weight: question.weight,
              required: Boolean(question.is_required),
            }))}
            answers={answers}
            comment={existing?.comment ?? ""}
            readOnly={!open}
            saved={Boolean(existing?.submitted_at)}
            nextHref={next ? `/review/a/${next.id}` : null}
            backHref={`/review/round/${round.id}`}
            allowAbstain={Boolean(plan.allow_abstain)}
            requireAbstainReason={Boolean(plan.require_abstain_reason)}
            abstained={assignment.status === "abstained"}
            abstainReason={assignment.abstain_reason}
            saveAction={saveReviewAction}
            abstainAction={abstainAction}
          />
        </div>
      </div>
    </div>
  );
}
