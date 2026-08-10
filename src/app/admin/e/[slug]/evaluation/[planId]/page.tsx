import Link from "next/link";
import { and, count, eq, like, or } from "drizzle-orm";
import { requireEventRole } from "@/lib/auth/guards";
import { getDb, schema } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import {
  addReviewerAction,
  assignSubmissionsAction,
  createRoundAction,
  createScorecardQuestionAction,
  deleteScorecardQuestionAction,
  updateScorecardQuestionAction,
} from "../actions";
import { InviteReviewerForm } from "./invite-reviewer-form";

function formatOptions(options: string | null) {
  try {
    const parsed = JSON.parse(options || "[]") as Array<{
      label: string;
      points?: number;
    }>;
    return parsed.map((o) => `${o.label}${o.points != null ? ` | ${o.points}` : ""}`).join("\n");
  } catch {
    return "";
  }
}

export default async function EvaluationPlanDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string; planId: string }>;
  searchParams: Promise<{ round?: string; q?: string }>;
}) {
  const { slug, planId } = await params;
  const sp = await searchParams;
  const { event } = await requireEventRole(slug, ["organizer"]);
  const db = getDb();

  const plan = db
    .select()
    .from(schema.evaluationPlans)
    .where(
      and(
        eq(schema.evaluationPlans.id, planId),
        eq(schema.evaluationPlans.eventId, event.id),
      ),
    )
    .get();
  if (!plan) {
    return (
      <div className="text-slate-600">
        Plan not found.{" "}
        <Link href={`/admin/e/${slug}/evaluation`} className="text-blue-700">
          Back to plans
        </Link>
      </div>
    );
  }

  const rounds = db
    .select()
    .from(schema.evaluationRounds)
    .where(eq(schema.evaluationRounds.planId, planId))
    .orderBy(schema.evaluationRounds.sortOrder)
    .all();

  const activeRoundId = sp.round && rounds.some((r) => r.id === sp.round) ? sp.round : rounds[0]?.id;
  const activeRound = rounds.find((r) => r.id === activeRoundId);

  const roundStats = rounds.map((round) => {
    const total = db
      .select({ c: count() })
      .from(schema.evaluationAssignments)
      .where(eq(schema.evaluationAssignments.roundId, round.id))
      .get();
    const done = db
      .select({ c: count() })
      .from(schema.evaluationAssignments)
      .where(
        and(
          eq(schema.evaluationAssignments.roundId, round.id),
          eq(schema.evaluationAssignments.status, "complete"),
        ),
      )
      .get();
    return {
      round,
      total: Number(total?.c ?? 0),
      done: Number(done?.c ?? 0),
    };
  });

  const questions = activeRound
    ? db
        .select()
        .from(schema.scorecardQuestions)
        .where(eq(schema.scorecardQuestions.roundId, activeRound.id))
        .orderBy(schema.scorecardQuestions.sortOrder)
        .all()
    : [];

  const reviewers = db
    .select({ user: schema.users })
    .from(schema.eventMemberships)
    .innerJoin(schema.users, eq(schema.eventMemberships.userId, schema.users.id))
    .where(
      and(
        eq(schema.eventMemberships.eventId, event.id),
        eq(schema.eventMemberships.role, "reviewer"),
      ),
    )
    .all()
    .map((r) => r.user);

  const userQuery = sp.q?.trim();
  const searchResults =
    userQuery && userQuery.length >= 2
      ? db
          .select()
          .from(schema.users)
          .where(
            or(
              like(schema.users.email, `%${userQuery}%`),
              like(schema.users.firstName, `%${userQuery}%`),
              like(schema.users.lastName, `%${userQuery}%`),
            ),
          )
          .limit(10)
          .all()
          .filter((u) => !reviewers.some((r) => r.id === u.id))
      : [];

  const submissions = db
    .select()
    .from(schema.submissions)
    .where(
      and(eq(schema.submissions.eventId, event.id), eq(schema.submissions.isDraft, false)),
    )
    .orderBy(schema.submissions.title)
    .all();

  const assignments = activeRound
    ? db
        .select({
          assignment: schema.evaluationAssignments,
          submission: schema.submissions,
          reviewer: schema.users,
        })
        .from(schema.evaluationAssignments)
        .innerJoin(
          schema.submissions,
          eq(schema.evaluationAssignments.submissionId, schema.submissions.id),
        )
        .innerJoin(schema.users, eq(schema.evaluationAssignments.reviewerUserId, schema.users.id))
        .where(eq(schema.evaluationAssignments.roundId, activeRound.id))
        .all()
    : [];

  const totalAssignments = roundStats.reduce((a, r) => a + r.total, 0);
  const totalDone = roundStats.reduce((a, r) => a + r.done, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link
            href={`/admin/e/${slug}/evaluation`}
            className="text-sm text-blue-700 hover:underline"
          >
            ← Evaluation plans
          </Link>
          <h1 className="mt-1 text-2xl font-semibold">{plan.name}</h1>
          {plan.instructions ? (
            <div
              className="prose prose-sm mt-2 max-w-none text-slate-600"
              dangerouslySetInnerHTML={{ __html: plan.instructions }}
            />
          ) : null}
          <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-slate-600">
            <Badge
              className={
                plan.isOpen ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-700"
              }
            >
              {plan.isOpen ? "Open" : "Closed"}
            </Badge>
            <span>
              Progress: {totalDone}/{totalAssignments} reviews complete
            </span>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader title="Rounds" subtitle="Select a round to configure" />
          <CardBody className="space-y-4">
            <ul className="space-y-2">
              {roundStats.map(({ round, total, done }) => (
                <li key={round.id}>
                  <Link
                    href={`/admin/e/${slug}/evaluation/${planId}?round=${round.id}`}
                    className={`block rounded-md border px-3 py-2 text-sm ${
                      round.id === activeRoundId
                        ? "border-blue-500 bg-blue-50"
                        : "border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <div className="font-medium">{round.name}</div>
                    <div className="text-slate-500">
                      {done}/{total} complete
                    </div>
                  </Link>
                </li>
              ))}
              {rounds.length === 0 ? (
                <p className="text-sm text-slate-500">No rounds yet.</p>
              ) : null}
            </ul>

            <form action={createRoundAction} className="space-y-3 border-t border-slate-100 pt-4">
              <input type="hidden" name="slug" value={slug} />
              <input type="hidden" name="planId" value={planId} />
              <div>
                <Label htmlFor="roundName">Add round</Label>
                <Input id="roundName" name="name" placeholder="Initial Review" required />
              </div>
              <div>
                <Label htmlFor="roundInstructions">Instructions</Label>
                <Textarea id="roundInstructions" name="instructions" rows={2} />
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                <Input name="opensAt" type="datetime-local" />
                <Input name="closesAt" type="datetime-local" />
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="anonymize" className="rounded" />
                Anonymize submissions
              </label>
              <Button type="submit" variant="secondary">
                Add round
              </Button>
            </form>
          </CardBody>
        </Card>

        <div className="space-y-6 lg:col-span-2">
          {activeRound ? (
            <>
              <Card>
                <CardHeader
                  title={`Scorecard — ${activeRound.name}`}
                  subtitle={activeRound.instructions ?? undefined}
                />
                <CardBody className="space-y-4">
                  <form
                    action={createScorecardQuestionAction}
                    className="grid gap-3 rounded-lg border border-dashed border-slate-200 p-4 sm:grid-cols-2"
                  >
                    <input type="hidden" name="slug" value={slug} />
                    <input type="hidden" name="planId" value={planId} />
                    <input type="hidden" name="roundId" value={activeRound.id} />
                    <div>
                      <Label>Type</Label>
                      <Select name="type" defaultValue="scale_1_5">
                        <option value="scale_1_5">Scale 1–5</option>
                        <option value="numeric">Numeric</option>
                        <option value="dropdown">Dropdown</option>
                        <option value="free_text">Free text</option>
                      </Select>
                    </div>
                    <div>
                      <Label>Label</Label>
                      <Input name="label" required placeholder="Originality" />
                    </div>
                    <div>
                      <Label>Weight</Label>
                      <Input name="weight" type="number" defaultValue={1} min={0} />
                    </div>
                    <div>
                      <Label>Min / Max (numeric)</Label>
                      <div className="flex gap-2">
                        <Input name="min" type="number" placeholder="Min" />
                        <Input name="max" type="number" placeholder="Max" />
                      </div>
                    </div>
                    <div className="sm:col-span-2">
                      <Label>Dropdown options (label | points per line)</Label>
                      <Textarea
                        name="options"
                        rows={3}
                        placeholder={"Accept | 3\nMaybe | 2\nReject | 1"}
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <Button type="submit">Add question</Button>
                    </div>
                  </form>

                  {questions.length === 0 ? (
                    <p className="text-sm text-slate-500">No scorecard questions yet.</p>
                  ) : (
                    <ul className="space-y-3">
                      {questions.map((q) => (
                        <li
                          key={q.id}
                          className="rounded-lg border border-slate-200 p-4 text-sm"
                        >
                          <form action={updateScorecardQuestionAction} className="space-y-2">
                            <input type="hidden" name="slug" value={slug} />
                            <input type="hidden" name="planId" value={planId} />
                            <input type="hidden" name="questionId" value={q.id} />
                            <div className="flex flex-wrap items-center gap-2">
                              <Badge className="bg-slate-100 text-slate-700">{q.type}</Badge>
                              {q.isRequired ? (
                                <Badge className="bg-amber-100 text-amber-800">Required</Badge>
                              ) : null}
                              <span className="text-slate-500">weight {q.weight}</span>
                            </div>
                            <Input name="label" defaultValue={q.label} required />
                            <Input name="weight" type="number" defaultValue={q.weight} />
                            {q.type === "dropdown" ? (
                              <Textarea
                                name="options"
                                rows={3}
                                defaultValue={formatOptions(q.options)}
                              />
                            ) : null}
                            <label className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                name="isRequired"
                                defaultChecked={q.isRequired}
                              />
                              Required
                            </label>
                            <div className="flex gap-2">
                              <Button type="submit" variant="secondary">
                                Save
                              </Button>
                            </div>
                          </form>
                          <form action={deleteScorecardQuestionAction} className="mt-2">
                            <input type="hidden" name="slug" value={slug} />
                            <input type="hidden" name="planId" value={planId} />
                            <input type="hidden" name="questionId" value={q.id} />
                            <Button type="submit" variant="danger">
                              Delete
                            </Button>
                          </form>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardBody>
              </Card>

              <Card>
                <CardHeader title="Reviewers" subtitle="Add existing users or invite by email" />
                <CardBody className="space-y-4">
                  <form method="get" className="flex gap-2">
                    <input type="hidden" name="round" value={activeRound.id} />
                    <Input
                      name="q"
                      placeholder="Search users by name or email…"
                      defaultValue={userQuery}
                    />
                    <Button type="submit" variant="secondary">
                      Search
                    </Button>
                  </form>
                  {searchResults.length > 0 ? (
                    <ul className="space-y-2">
                      {searchResults.map((u) => (
                        <li
                          key={u.id}
                          className="flex items-center justify-between rounded-md border border-slate-200 px-3 py-2 text-sm"
                        >
                          <span>
                            {u.firstName} {u.lastName} · {u.email}
                          </span>
                          <form action={addReviewerAction}>
                            <input type="hidden" name="slug" value={slug} />
                            <input type="hidden" name="planId" value={planId} />
                            <input type="hidden" name="userId" value={u.id} />
                            <Button type="submit" variant="secondary">
                              Add reviewer
                            </Button>
                          </form>
                        </li>
                      ))}
                    </ul>
                  ) : null}

                  <InviteReviewerForm slug={slug} planId={planId} />

                  <div>
                    <h3 className="mb-2 text-sm font-medium text-slate-700">
                      Current reviewers ({reviewers.length})
                    </h3>
                    {reviewers.length === 0 ? (
                      <p className="text-sm text-slate-500">No reviewers yet.</p>
                    ) : (
                      <ul className="space-y-1 text-sm">
                        {reviewers.map((r) => (
                          <li key={r.id}>
                            {r.firstName} {r.lastName} · {r.email}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </CardBody>
              </Card>

              <Card>
                <CardHeader
                  title="Assign submissions"
                  subtitle="Multi-select submissions and assign to a reviewer"
                />
                <CardBody>
                  <form action={assignSubmissionsAction} className="space-y-4">
                    <input type="hidden" name="slug" value={slug} />
                    <input type="hidden" name="planId" value={planId} />
                    <input type="hidden" name="roundId" value={activeRound.id} />
                    <div>
                      <Label>Reviewer</Label>
                      <Select name="reviewerUserId" required defaultValue="">
                        <option value="" disabled>
                          Select reviewer…
                        </option>
                        {reviewers.map((r) => (
                          <option key={r.id} value={r.id}>
                            {r.firstName} {r.lastName} ({r.email})
                          </option>
                        ))}
                      </Select>
                    </div>
                    <div className="max-h-64 overflow-y-auto rounded-md border border-slate-200 p-3">
                      {submissions.length === 0 ? (
                        <p className="text-sm text-slate-500">No submissions available.</p>
                      ) : (
                        <ul className="space-y-2 text-sm">
                          {submissions.map((s) => (
                            <li key={s.id}>
                              <label className="flex items-start gap-2">
                                <input
                                  type="checkbox"
                                  name="submissionIds"
                                  value={s.id}
                                  className="mt-1 rounded"
                                />
                                <span>
                                  <span className="font-medium">{s.title}</span>
                                  {s.description ? (
                                    <span className="block text-slate-500 line-clamp-1">
                                      {s.description.replace(/<[^>]+>/g, "").slice(0, 120)}
                                    </span>
                                  ) : null}
                                </span>
                              </label>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                    <Button type="submit">Assign selected</Button>
                  </form>

                  {assignments.length > 0 ? (
                    <div className="mt-6 border-t border-slate-100 pt-4">
                      <h3 className="mb-2 text-sm font-medium text-slate-700">
                        Assignments ({assignments.length})
                      </h3>
                      <div className="overflow-x-auto">
                        <table className="min-w-full text-left text-sm">
                          <thead className="text-xs uppercase text-slate-500">
                            <tr>
                              <th className="py-1 pr-4">Submission</th>
                              <th className="py-1 pr-4">Reviewer</th>
                              <th className="py-1">Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {assignments.map(({ assignment, submission, reviewer }) => (
                              <tr key={assignment.id} className="border-t border-slate-100">
                                <td className="py-2 pr-4">{submission.title}</td>
                                <td className="py-2 pr-4">
                                  {reviewer.firstName} {reviewer.lastName}
                                </td>
                                <td className="py-2">
                                  <Badge
                                    className={
                                      assignment.status === "complete"
                                        ? "bg-emerald-100 text-emerald-800"
                                        : "bg-amber-100 text-amber-800"
                                    }
                                  >
                                    {assignment.status === "complete" ? "Complete" : "Pending"}
                                  </Badge>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ) : null}
                </CardBody>
              </Card>
            </>
          ) : (
            <Card>
              <CardBody>
                <p className="text-slate-600">Add a round to configure scorecards and assignments.</p>
              </CardBody>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
