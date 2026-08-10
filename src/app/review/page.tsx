import Link from "next/link";
import { and, count, eq } from "drizzle-orm";
import { getSessionUser } from "@/lib/auth/session";
import { getDb, schema } from "@/lib/db";
import { getDefaultEvent } from "@/lib/db/queries";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { redirect } from "next/navigation";

export default async function ReviewHomePage() {
  const user = await getSessionUser();
  if (!user) redirect("/sign-in?next=/review");
  const event = getDefaultEvent();
  if (!event) redirect("/");
  const db = getDb();

  const plans = db
    .select()
    .from(schema.evaluationPlans)
    .where(eq(schema.evaluationPlans.eventId, event.id))
    .all();

  const cards = plans.map((plan) => {
    const rounds = db
      .select()
      .from(schema.evaluationRounds)
      .where(eq(schema.evaluationRounds.planId, plan.id))
      .all();
    const roundStats = rounds.map((round) => {
      const assigned = db
        .select({ c: count() })
        .from(schema.evaluationAssignments)
        .where(
          and(
            eq(schema.evaluationAssignments.roundId, round.id),
            eq(schema.evaluationAssignments.reviewerUserId, user.id),
          ),
        )
        .get()?.c;
      const done = db
        .select({ c: count() })
        .from(schema.evaluationAssignments)
        .where(
          and(
            eq(schema.evaluationAssignments.roundId, round.id),
            eq(schema.evaluationAssignments.reviewerUserId, user.id),
            eq(schema.evaluationAssignments.status, "complete"),
          ),
        )
        .get()?.c;
      return {
        round,
        assigned: Number(assigned ?? 0),
        done: Number(done ?? 0),
      };
    });
    const total = roundStats.reduce((a, r) => a + r.assigned, 0);
    const complete = roundStats.reduce((a, r) => a + r.done, 0);
    return { plan, rounds: roundStats, total, complete };
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Evaluation plans</h1>
        <p className="text-slate-600">Only your assigned submissions appear in each queue.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {cards.map(({ plan, rounds, total, complete }) => (
          <Card key={plan.id}>
            <CardHeader
              title={plan.name}
              subtitle={plan.isOpen ? "Open" : "Closed"}
            />
            <CardBody className="space-y-3">
              <div className="text-sm text-slate-600">
                {rounds.length} round(s) · {complete}/{total} reviews complete
              </div>
              <ul className="space-y-2">
                {rounds.map(({ round, assigned, done }) => (
                  <li key={round.id}>
                    <Link
                      href={`/review/plans/${plan.id}/rounds/${round.id}`}
                      className="flex items-center justify-between rounded-md border border-slate-200 px-3 py-2 text-sm hover:bg-slate-50"
                    >
                      <span className="font-medium">{round.name}</span>
                      <span className="text-slate-500">
                        {done}/{assigned} · due{" "}
                        {round.closesAt
                          ? new Date(round.closesAt).toLocaleDateString()
                          : "—"}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </CardBody>
          </Card>
        ))}
        {cards.length === 0 ? (
          <p className="text-slate-600">No evaluation plans assigned.</p>
        ) : null}
      </div>
    </div>
  );
}
