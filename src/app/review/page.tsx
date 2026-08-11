import Link from "next/link";

import { requireReviewer } from "@/lib/guards";
import { plansForReviewer, roundsForReviewer } from "@/lib/repo/evaluations";
import { Card, CardHeader, Chip, EmptyState, Progress } from "@/components/ui";
import { formatDate } from "@/lib/datetime";

export const metadata = { title: "Review" };
export const dynamic = "force-dynamic";

export default async function ReviewHome() {
  const { user, event } = await requireReviewer();
  const plans = plansForReviewer(event.id, user.id);

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Your review queue</h1>
      <p className="mt-1 text-sm text-slate-600">
        {event.name} · You only see the submissions assigned to you.
      </p>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {plans.map((plan) => {
          const rounds = roundsForReviewer(plan.plan_id, user.id);
          return (
            <Card key={plan.plan_id}>
              <CardHeader
                title={plan.plan_name}
                description={`${plan.rounds} round${plan.rounds === 1 ? "" : "s"}`}
                actions={
                  <Chip tone={plan.is_open ? "green" : "slate"}>
                    {plan.is_open ? "Open" : "Closed"}
                  </Chip>
                }
              />
              <div className="px-4 py-3">
                {plan.instructions ? (
                  <div
                    className="prose-cf mb-3 text-sm text-slate-600"
                    dangerouslySetInnerHTML={{ __html: plan.instructions }}
                  />
                ) : null}
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>
                    {plan.complete ?? 0} of {plan.assigned ?? 0} reviews complete
                  </span>
                  <span>
                    {plan.assigned
                      ? `${Math.round(((plan.complete ?? 0) / plan.assigned) * 100)}%`
                      : "—"}
                  </span>
                </div>
                <div className="mt-1">
                  <Progress value={plan.complete ?? 0} max={Math.max(plan.assigned ?? 0, 1)} />
                </div>
                <ul className="mt-3 space-y-2">
                  {rounds
                    .filter((round) => round.assigned > 0 || round.is_member)
                    .map((round) => (
                      <li key={round.id}>
                        <Link
                          href={`/review/round/${round.id}`}
                          className="flex items-center justify-between rounded-md border border-slate-200 px-3 py-2 text-sm hover:border-brand-300"
                        >
                          <span>
                            <span className="font-medium text-slate-800">{round.name}</span>
                            <span className="ml-2 text-xs text-slate-500">
                              {round.opens_at ? formatDate(round.opens_at) : "—"} –{" "}
                              {round.closes_at ? formatDate(round.closes_at) : "—"}
                            </span>
                            {round.anonymize ? (
                              <Chip tone="violet" className="ml-2">
                                Blind
                              </Chip>
                            ) : null}
                          </span>
                          <span className="text-xs font-medium text-slate-600">
                            {round.complete}/{round.assigned}
                          </span>
                        </Link>
                      </li>
                    ))}
                </ul>
              </div>
            </Card>
          );
        })}
      </div>

      {!plans.length ? (
        <EmptyState
          title="Nothing assigned to you yet"
          description="When an organizer adds you to a review round and assigns submissions, they appear here."
        />
      ) : null}
    </div>
  );
}
