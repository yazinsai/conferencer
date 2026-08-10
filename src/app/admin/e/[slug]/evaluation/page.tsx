import Link from "next/link";
import { and, count, eq } from "drizzle-orm";
import { requireEventRole } from "@/lib/auth/guards";
import { getDb, schema } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Input, Label, Textarea } from "@/components/ui/input";
import { createEvaluationPlanAction } from "./actions";

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default async function EvaluationPlansPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { event } = await requireEventRole(slug, ["organizer"]);
  const db = getDb();

  const plans = db
    .select()
    .from(schema.evaluationPlans)
    .where(eq(schema.evaluationPlans.eventId, event.id))
    .orderBy(schema.evaluationPlans.createdAt)
    .all();

  const enriched = plans.map((plan) => {
    const rounds = db
      .select({ c: count() })
      .from(schema.evaluationRounds)
      .where(eq(schema.evaluationRounds.planId, plan.id))
      .get();
    const assignments = db
      .select({ c: count() })
      .from(schema.evaluationAssignments)
      .innerJoin(
        schema.evaluationRounds,
        eq(schema.evaluationAssignments.roundId, schema.evaluationRounds.id),
      )
      .where(eq(schema.evaluationRounds.planId, plan.id))
      .get();
    const done = db
      .select({ c: count() })
      .from(schema.evaluationAssignments)
      .innerJoin(
        schema.evaluationRounds,
        eq(schema.evaluationAssignments.roundId, schema.evaluationRounds.id),
      )
      .where(
        and(
          eq(schema.evaluationRounds.planId, plan.id),
          eq(schema.evaluationAssignments.status, "complete"),
        ),
      )
      .get();

    return {
      ...plan,
      roundCount: Number(rounds?.c ?? 0),
      assignmentCount: Number(assignments?.c ?? 0),
      completeCount: Number(done?.c ?? 0),
    };
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Evaluation plans</h1>
        <p className="text-slate-600">
          Configure rounds, scorecards, reviewers, and submission assignments.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Create plan" subtitle="Start a new evaluation workflow" />
          <CardBody>
            <form action={createEvaluationPlanAction} className="space-y-4">
              <input type="hidden" name="slug" value={slug} />
              <div>
                <Label htmlFor="name">Name</Label>
                <Input id="name" name="name" required placeholder="Program Committee Review" />
              </div>
              <div>
                <Label htmlFor="instructions">Instructions</Label>
                <Textarea
                  id="instructions"
                  name="instructions"
                  rows={3}
                  placeholder="Guidance shown to reviewers…"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="opensAt">Opens</Label>
                  <Input id="opensAt" name="opensAt" type="datetime-local" />
                </div>
                <div>
                  <Label htmlFor="closesAt">Closes</Label>
                  <Input id="closesAt" name="closesAt" type="datetime-local" />
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="isOpen" defaultChecked className="rounded" />
                Plan is open
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="allowAbstain" className="rounded" />
                Allow reviewers to abstain (conflict of interest)
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="requireAbstainReason" className="rounded" />
                Require reason when abstaining
              </label>
              <Button type="submit">Create plan</Button>
            </form>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title={`${enriched.length} plans`} />
          <CardBody className="space-y-3 p-0">
            {enriched.length === 0 ? (
              <p className="px-5 py-8 text-center text-slate-500">No evaluation plans yet.</p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {enriched.map((plan) => (
                  <li key={plan.id} className="px-5 py-4 hover:bg-slate-50">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <Link
                          href={`/admin/e/${slug}/evaluation/${plan.id}`}
                          className="font-medium text-blue-700 hover:underline"
                        >
                          {plan.name}
                        </Link>
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-slate-600">
                          <Badge
                            className={
                              plan.isOpen
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-slate-100 text-slate-700"
                            }
                          >
                            {plan.isOpen ? "Open" : "Closed"}
                          </Badge>
                          <span>
                            {plan.roundCount} round(s) · {plan.completeCount}/
                            {plan.assignmentCount} reviews complete
                          </span>
                        </div>
                        <div className="mt-1 text-xs text-slate-500">
                          {formatDate(plan.opensAt)} → {formatDate(plan.closesAt)}
                        </div>
                      </div>
                      <Link
                        href={`/admin/e/${slug}/evaluation/${plan.id}`}
                        className="text-sm font-medium text-blue-700"
                      >
                        Manage →
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
