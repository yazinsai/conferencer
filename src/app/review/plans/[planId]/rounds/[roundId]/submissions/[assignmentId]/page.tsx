import Link from "next/link";
import { and, eq } from "drizzle-orm";
import { forbidden, requireAnyAuth } from "@/lib/auth/guards";
import { getSubmissionParticipants } from "@/lib/db/queries";
import { getDb, schema } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { AbstainDialog } from "./abstain-dialog";
import { ReviewScorecardForm } from "./review-form";

export default async function ReviewSubmissionPage({
  params,
}: {
  params: Promise<{ planId: string; roundId: string; assignmentId: string }>;
}) {
  const { planId, roundId, assignmentId } = await params;
  const user = await requireAnyAuth(
    `/review/plans/${planId}/rounds/${roundId}/submissions/${assignmentId}`,
  );

  const db = getDb();
  const row = db
    .select({
      assignment: schema.evaluationAssignments,
      submission: schema.submissions,
      round: schema.evaluationRounds,
      plan: schema.evaluationPlans,
    })
    .from(schema.evaluationAssignments)
    .innerJoin(
      schema.submissions,
      eq(schema.evaluationAssignments.submissionId, schema.submissions.id),
    )
    .innerJoin(
      schema.evaluationRounds,
      eq(schema.evaluationAssignments.roundId, schema.evaluationRounds.id),
    )
    .innerJoin(
      schema.evaluationPlans,
      eq(schema.evaluationRounds.planId, schema.evaluationPlans.id),
    )
    .where(eq(schema.evaluationAssignments.id, assignmentId))
    .get();

  if (!row || row.round.id !== roundId || row.plan.id !== planId) {
    forbidden();
  }
  if (row.assignment.reviewerUserId !== user.id) {
    forbidden();
  }

  const anonymize = row.round.anonymize || row.plan.anonymize;
  const questions = db
    .select()
    .from(schema.scorecardQuestions)
    .where(eq(schema.scorecardQuestions.roundId, roundId))
    .orderBy(schema.scorecardQuestions.sortOrder)
    .all();

  const existingReview = db
    .select()
    .from(schema.reviews)
    .where(eq(schema.reviews.assignmentId, assignmentId))
    .get();

  let initialAnswers: Record<string, string | number> = {};
  if (existingReview?.answers) {
    try {
      initialAnswers = JSON.parse(existingReview.answers);
    } catch {
      initialAnswers = {};
    }
  }

  const track = row.submission.trackId
    ? db.select().from(schema.tracks).where(eq(schema.tracks.id, row.submission.trackId)).get()
    : null;
  const format = row.submission.formatId
    ? db.select().from(schema.formats).where(eq(schema.formats.id, row.submission.formatId)).get()
    : null;

  const participants = anonymize ? [] : getSubmissionParticipants(row.submission.id);

  let answers: Record<string, unknown> = {};
  try {
    answers = JSON.parse(row.submission.answers || "{}");
  } catch {
    answers = {};
  }

  const isAbstained = row.assignment.status === "abstained";
  const isComplete = row.assignment.status === "complete";

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Link
          href={`/review/plans/${planId}/rounds/${roundId}`}
          className="text-sm text-blue-700 hover:underline"
        >
          ← Back to queue
        </Link>
        <div className="flex flex-wrap items-center gap-2">
          {row.plan.allowAbstain && !isComplete && !isAbstained ? (
            <AbstainDialog
              planId={planId}
              roundId={roundId}
              assignmentId={assignmentId}
              requireReason={row.plan.requireAbstainReason}
            />
          ) : null}
          <Badge
            className={
              isComplete
                ? "bg-emerald-100 text-emerald-800"
                : isAbstained
                  ? "bg-slate-200 text-slate-800"
                  : "bg-amber-100 text-amber-800"
            }
          >
            {isComplete ? "Reviewed" : isAbstained ? "Abstained" : "Pending"}
          </Badge>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Submission" subtitle={anonymize ? "Anonymous review" : undefined} />
          <CardBody className="space-y-4 text-sm">
            <div>
              <div className="text-xs uppercase text-slate-500">Title</div>
              <div className="font-medium text-slate-900">{row.submission.title}</div>
            </div>
            {row.submission.description ? (
              <div>
                <div className="text-xs uppercase text-slate-500">Description</div>
                <div
                  className="prose prose-sm max-w-none text-slate-700"
                  dangerouslySetInnerHTML={{ __html: row.submission.description }}
                />
              </div>
            ) : null}
            <div className="grid gap-3 sm:grid-cols-2">
              {track ? (
                <div>
                  <div className="text-xs uppercase text-slate-500">Track</div>
                  <div>{track.name}</div>
                </div>
              ) : null}
              {format ? (
                <div>
                  <div className="text-xs uppercase text-slate-500">Format</div>
                  <div>{format.name}</div>
                </div>
              ) : null}
              {row.submission.level ? (
                <div>
                  <div className="text-xs uppercase text-slate-500">Level</div>
                  <div>{row.submission.level}</div>
                </div>
              ) : null}
            </div>
            {!anonymize && participants.length > 0 ? (
              <div>
                <div className="text-xs uppercase text-slate-500">Speakers</div>
                <ul className="mt-1 space-y-1">
                  {participants.map((p) => (
                    <li key={p.contactId}>
                      {p.firstName} {p.lastName}
                      {p.email ? ` · ${p.email}` : ""}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            {Object.keys(answers).length > 0 ? (
              <div>
                <div className="text-xs uppercase text-slate-500">Additional fields</div>
                <dl className="mt-1 space-y-1">
                  {Object.entries(answers).map(([key, val]) => (
                    <div key={key}>
                      <dt className="font-medium text-slate-700">{key}</dt>
                      <dd className="text-slate-600">{String(val)}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            ) : null}
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            title="Scorecard"
            subtitle={row.round.instructions ?? row.plan.instructions ?? undefined}
          />
          <CardBody>
            {isAbstained ? (
              <div className="space-y-2 text-sm text-slate-600">
                <p>You have abstained from reviewing this submission.</p>
                {row.assignment.abstainReason ? (
                  <p>
                    <span className="font-medium text-slate-700">Reason:</span>{" "}
                    {row.assignment.abstainReason}
                  </p>
                ) : null}
              </div>
            ) : (
              <ReviewScorecardForm
                planId={planId}
                roundId={roundId}
                assignmentId={assignmentId}
                questions={questions}
                initialAnswers={initialAnswers}
              />
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
