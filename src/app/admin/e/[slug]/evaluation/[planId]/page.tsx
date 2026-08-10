import Link from "next/link";
import { and, count, eq, like, or } from "drizzle-orm";
import { requireEventRole } from "@/lib/auth/guards";
import { getDb, schema } from "@/lib/db";
import {
  getRoundProgressStats,
  getRoundResults,
  getRoundReviewerProgress,
  sortResults,
} from "@/lib/evaluation/results";
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
  updateEvaluationPlanAction,
  updateScorecardQuestionAction,
} from "../actions";
import { AiFirstPassForm } from "./ai-first-pass-form";
import { AutoAssignForm } from "./auto-assign-form";
import { BulkReminderForm } from "./bulk-reminder-form";
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

function toDatetimeLocal(iso: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default async function EvaluationPlanDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string; planId: string }>;
  searchParams: Promise<{ round?: string; q?: string; tab?: string; sort?: string; dir?: string }>;
}) {
  const { slug, planId } = await params;
  const sp = await searchParams;
  const tab = sp.tab === "results" ? "results" : "configure";
  const sortCol = sp.sort === "title" ? "title" : "avg";
  const sortDir = sp.dir === "asc" ? "asc" : "desc";
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
          or(
            eq(schema.evaluationAssignments.status, "complete"),
            eq(schema.evaluationAssignments.status, "abstained"),
          ),
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

  const tracks = db
    .select({ id: schema.tracks.id, name: schema.tracks.name })
    .from(schema.tracks)
    .where(eq(schema.tracks.eventId, event.id))
    .orderBy(schema.tracks.sortOrder)
    .all();

  const progressStats = activeRound ? getRoundProgressStats(activeRound.id) : null;
  const reviewerProgress = activeRound ? getRoundReviewerProgress(activeRound.id) : [];
  const resultRows = activeRound
    ? sortResults(getRoundResults(activeRound.id), sortCol, sortDir)
    : [];

  const reviewerColumns = new Map<string, string>();
  for (const row of resultRows) {
    for (const rs of row.reviewerScores) {
      reviewerColumns.set(rs.reviewerUserId, rs.reviewerName);
    }
  }

  const reminderReviewers = reviewerProgress.map((r) => ({
    userId: r.userId,
    name: r.name,
    email: r.email,
    pending: r.total - r.done,
  }));

  const assignedSubmissionIds = new Set(assignments.map((a) => a.submission.id));
  const aiFirstPassSubmissions = submissions
    .filter((s) => assignedSubmissionIds.has(s.id))
    .map((s) => ({ id: s.id, title: s.title }));

  function tabHref(nextTab: string) {
    const params = new URLSearchParams();
    if (activeRoundId) params.set("round", activeRoundId);
    if (nextTab !== "configure") params.set("tab", nextTab);
    if (userQuery) params.set("q", userQuery);
    const qs = params.toString();
    return `/admin/e/${slug}/evaluation/${planId}${qs ? `?${qs}` : ""}`;
  }

  function sortHref(col: "avg" | "title") {
    const params = new URLSearchParams();
    if (activeRoundId) params.set("round", activeRoundId);
    params.set("tab", "results");
    params.set("sort", col);
    const nextDir = sortCol === col && sortDir === "desc" ? "asc" : "desc";
    params.set("dir", nextDir);
    return `/admin/e/${slug}/evaluation/${planId}?${params.toString()}`;
  }

  const exportBase = `/admin/e/${slug}/evaluation/${planId}/export`;
  const exportRound = activeRoundId ? `&round=${activeRoundId}` : "";

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
            {plan.allowAbstain ? (
              <Badge className="bg-sky-100 text-sky-800">Abstain allowed</Badge>
            ) : null}
            <span>
              Progress: {totalDone}/{totalAssignments} reviews complete
            </span>
          </div>
        </div>
      </div>

      {activeRound && progressStats ? (
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardBody className="py-4">
              <div className="text-xs uppercase text-slate-500">Total evaluations</div>
              <div className="text-2xl font-semibold">{progressStats.totalEvaluations}</div>
              <div className="text-xs text-slate-500">
                {progressStats.doneAssignments} complete in {activeRound.name}
              </div>
            </CardBody>
          </Card>
          <Card>
            <CardBody className="py-4">
              <div className="text-xs uppercase text-slate-500">Evaluated submissions</div>
              <div className="text-2xl font-semibold">{progressStats.evaluatedSubmissions}</div>
              <div className="text-xs text-slate-500">With at least one review</div>
            </CardBody>
          </Card>
          <Card>
            <CardBody className="py-4">
              <div className="text-xs uppercase text-slate-500">Reviewers</div>
              <div className="text-2xl font-semibold">{reviewerProgress.length}</div>
              <div className="text-xs text-slate-500">
                {reviewerProgress.filter((r) => r.percent === 100).length} at 100%
              </div>
            </CardBody>
          </Card>
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <Link
          href={tabHref("configure")}
          className={`rounded-full px-3 py-1.5 text-sm ${
            tab === "configure"
              ? "bg-blue-600 text-white"
              : "border border-slate-200 bg-white text-slate-700"
          }`}
        >
          Configure
        </Link>
        <Link
          href={tabHref("results")}
          className={`rounded-full px-3 py-1.5 text-sm ${
            tab === "results"
              ? "bg-blue-600 text-white"
              : "border border-slate-200 bg-white text-slate-700"
          }`}
        >
          Results
        </Link>
      </div>

      {tab === "results" ? (
        <Card>
          <CardHeader
            title={`Results — ${activeRound?.name ?? "No round"}`}
            subtitle="Aggregate scores per submission for the selected round"
          />
          <CardBody className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href={`${exportBase}?shape=individual${exportRound}`}
                className="text-sm text-blue-700 hover:underline"
              >
                Export individual CSV
              </Link>
              <Link
                href={`${exportBase}?shape=cumulative${exportRound}`}
                className="text-sm text-blue-700 hover:underline"
              >
                Export cumulative CSV
              </Link>
            </div>
            {!activeRound ? (
              <p className="text-sm text-slate-500">Add a round to view results.</p>
            ) : resultRows.length === 0 ? (
              <p className="text-sm text-slate-500">No assignments yet for this round.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="text-xs uppercase text-slate-500">
                    <tr>
                      <th className="py-2 pr-4">
                        <Link href={sortHref("title")} className="hover:text-blue-700">
                          Submission
                          {sortCol === "title" ? (sortDir === "asc" ? " ↑" : " ↓") : ""}
                        </Link>
                      </th>
                      <th className="py-2 pr-4">
                        <Link href={sortHref("avg")} className="hover:text-blue-700">
                          Avg score
                          {sortCol === "avg" ? (sortDir === "asc" ? " ↑" : " ↓") : ""}
                        </Link>
                      </th>
                      <th className="py-2 pr-4">Reviews</th>
                      <th className="py-2 pr-4">AI first-pass</th>
                      {Array.from(reviewerColumns.entries()).map(([id, name]) => (
                        <th key={id} className="py-2 pr-4">
                          {name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {resultRows.map((row) => {
                      const scoreMap = new Map(
                        row.reviewerScores.map((rs) => [rs.reviewerUserId, rs]),
                      );
                      return (
                        <tr key={row.submissionId} className="border-t border-slate-100">
                          <td className="py-2 pr-4 font-medium">{row.submissionTitle}</td>
                          <td className="py-2 pr-4">
                            {row.averageScore != null ? row.averageScore : "—"}
                          </td>
                          <td className="py-2 pr-4">{row.reviewCount}</td>
                          <td className="py-2 pr-4">
                            {row.aiReview ? (
                              <span className="inline-flex items-center gap-1">
                                <Badge className="bg-violet-100 text-violet-800">AI</Badge>
                                <span>{row.aiReview.score}</span>
                                {row.aiReview.overridden ? (
                                  <span className="text-xs text-slate-400">(overridden)</span>
                                ) : null}
                              </span>
                            ) : (
                              "—"
                            )}
                          </td>
                          {Array.from(reviewerColumns.keys()).map((id) => {
                            const rs = scoreMap.get(id);
                            return (
                              <td key={id} className="py-2 pr-4">
                                {rs?.status === "abstained" ? (
                                  <span
                                    className="text-slate-500"
                                    title={rs.abstainReason ?? "Abstained"}
                                  >
                                    abstained
                                  </span>
                                ) : rs?.score != null ? (
                                  rs.score
                                ) : rs ? (
                                  <span className="text-slate-400">pending</span>
                                ) : (
                                  "—"
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardBody>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-3">
          <CardHeader title="Plan settings" subtitle="Name, schedule, and abstain options" />
          <CardBody>
            <form action={updateEvaluationPlanAction} className="grid gap-4 sm:grid-cols-2">
              <input type="hidden" name="slug" value={slug} />
              <input type="hidden" name="planId" value={planId} />
              <div>
                <Label htmlFor="planName">Name</Label>
                <Input id="planName" name="name" defaultValue={plan.name} required />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="planInstructions">Instructions</Label>
                <Textarea
                  id="planInstructions"
                  name="instructions"
                  rows={2}
                  defaultValue={plan.instructions ?? ""}
                />
              </div>
              <div>
                <Label htmlFor="planOpensAt">Opens</Label>
                <Input
                  id="planOpensAt"
                  name="opensAt"
                  type="datetime-local"
                  defaultValue={toDatetimeLocal(plan.opensAt)}
                />
              </div>
              <div>
                <Label htmlFor="planClosesAt">Closes</Label>
                <Input
                  id="planClosesAt"
                  name="closesAt"
                  type="datetime-local"
                  defaultValue={toDatetimeLocal(plan.closesAt)}
                />
              </div>
              <div className="flex flex-col gap-2 sm:col-span-2">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    name="isOpen"
                    defaultChecked={plan.isOpen}
                    className="rounded"
                  />
                  Plan is open
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    name="allowAbstain"
                    defaultChecked={plan.allowAbstain}
                    className="rounded"
                  />
                  Allow reviewers to abstain (conflict of interest)
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    name="requireAbstainReason"
                    defaultChecked={plan.requireAbstainReason}
                    className="rounded"
                  />
                  Require reason when abstaining
                </label>
              </div>
              <div className="sm:col-span-2">
                <Button type="submit">Save plan settings</Button>
              </div>
            </form>
          </CardBody>
        </Card>

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
                  title="Reviewer progress"
                  subtitle="Completion percentage per reviewer in this round"
                />
                <CardBody>
                  {reviewerProgress.length === 0 ? (
                    <p className="text-sm text-slate-500">No assignments in this round yet.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-left text-sm">
                        <thead className="text-xs uppercase text-slate-500">
                          <tr>
                            <th className="py-1 pr-4">Reviewer</th>
                            <th className="py-1 pr-4">Complete</th>
                            <th className="py-1">Progress</th>
                          </tr>
                        </thead>
                        <tbody>
                          {reviewerProgress.map((r) => (
                            <tr key={r.userId} className="border-t border-slate-100">
                              <td className="py-2 pr-4">
                                {r.name}
                                <span className="block text-xs text-slate-500">{r.email}</span>
                              </td>
                              <td className="py-2 pr-4">
                                {r.done}/{r.total}
                              </td>
                              <td className="py-2">
                                <div className="flex items-center gap-2">
                                  <div className="h-2 w-24 overflow-hidden rounded-full bg-slate-100">
                                    <div
                                      className="h-full bg-emerald-500"
                                      style={{ width: `${r.percent}%` }}
                                    />
                                  </div>
                                  <span className="text-xs text-slate-600">{r.percent}%</span>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardBody>
              </Card>

              <Card>
                <CardHeader
                  title="AI first-pass"
                  subtitle="Heuristic pre-scoring for assigned submissions"
                />
                <CardBody>
                  <AiFirstPassForm
                    slug={slug}
                    planId={planId}
                    roundId={activeRound.id}
                    submissions={aiFirstPassSubmissions}
                  />
                </CardBody>
              </Card>

              <Card>
                <CardHeader
                  title="Bulk reminder"
                  subtitle="Email reviewers with outstanding assignments"
                />
                <CardBody>
                  <BulkReminderForm
                    slug={slug}
                    planId={planId}
                    roundId={activeRound.id}
                    reviewers={reminderReviewers}
                  />
                </CardBody>
              </Card>

              <Card>
                <CardHeader
                  title="Auto-assign"
                  subtitle="Distribute submissions across reviewers at scale"
                />
                <CardBody>
                  <AutoAssignForm
                    slug={slug}
                    planId={planId}
                    roundId={activeRound.id}
                    tracks={tracks}
                  />
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
                                  {assignment.status === "complete" ? (
                                    <Badge className="bg-emerald-100 text-emerald-800">
                                      Complete
                                    </Badge>
                                  ) : assignment.status === "abstained" ? (
                                    <div className="space-y-1">
                                      <Badge className="bg-slate-200 text-slate-800">
                                        Abstained
                                      </Badge>
                                      {assignment.abstainReason ? (
                                        <p className="max-w-xs text-xs text-slate-500">
                                          {assignment.abstainReason}
                                        </p>
                                      ) : null}
                                    </div>
                                  ) : (
                                    <Badge className="bg-amber-100 text-amber-800">Pending</Badge>
                                  )}
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
      )}
    </div>
  );
}
