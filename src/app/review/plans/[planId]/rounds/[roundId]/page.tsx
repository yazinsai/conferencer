import Link from "next/link";
import { and, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { requireAnyAuth } from "@/lib/auth/guards";
import { getDb, schema } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { Card, CardBody } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

function truncate(text: string | null, len = 140) {
  if (!text) return "";
  const plain = text.replace(/<[^>]+>/g, "").trim();
  return plain.length > len ? `${plain.slice(0, len)}…` : plain;
}

export default async function ReviewRoundQueuePage({
  params,
  searchParams,
}: {
  params: Promise<{ planId: string; roundId: string }>;
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const { planId, roundId } = await params;
  const sp = await searchParams;
  const user = await requireAnyAuth(`/review/plans/${planId}/rounds/${roundId}`);

  const db = getDb();
  const round = db
    .select({
      round: schema.evaluationRounds,
      plan: schema.evaluationPlans,
    })
    .from(schema.evaluationRounds)
    .innerJoin(
      schema.evaluationPlans,
      eq(schema.evaluationRounds.planId, schema.evaluationPlans.id),
    )
    .where(
      and(eq(schema.evaluationRounds.id, roundId), eq(schema.evaluationPlans.id, planId)),
    )
    .get();
  if (!round) redirect("/review");

  const rows = db
    .select({
      assignment: schema.evaluationAssignments,
      submission: schema.submissions,
    })
    .from(schema.evaluationAssignments)
    .innerJoin(
      schema.submissions,
      eq(schema.evaluationAssignments.submissionId, schema.submissions.id),
    )
    .where(
      and(
        eq(schema.evaluationAssignments.roundId, roundId),
        eq(schema.evaluationAssignments.reviewerUserId, user.id),
      ),
    )
    .orderBy(schema.submissions.title)
    .all();

  const pendingCount = rows.filter(
    (r) => r.assignment.status === "pending" || r.assignment.status === "in_progress",
  ).length;
  const reviewedCount = rows.filter((r) => r.assignment.status === "complete").length;
  const abstainedCount = rows.filter((r) => r.assignment.status === "abstained").length;

  const q = sp.q?.trim().toLowerCase();
  const statusFilter =
    sp.status === "reviewed"
      ? "reviewed"
      : sp.status === "pending"
        ? "pending"
        : sp.status === "abstained"
          ? "abstained"
          : "all";

  let filtered = rows;
  if (statusFilter === "pending") {
    filtered = filtered.filter(
      (r) =>
        r.assignment.status === "pending" || r.assignment.status === "in_progress",
    );
  } else if (statusFilter === "reviewed") {
    filtered = filtered.filter((r) => r.assignment.status === "complete");
  } else if (statusFilter === "abstained") {
    filtered = filtered.filter((r) => r.assignment.status === "abstained");
  }
  if (q) {
    filtered = filtered.filter((r) => {
      const hay = `${r.submission.title} ${r.submission.description ?? ""}`.toLowerCase();
      return hay.includes(q);
    });
  }

  return (
    <div className="flex gap-6">
      <aside className="hidden w-48 shrink-0 space-y-4 md:block">
        <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm">
          <div className="font-medium text-slate-900">{round.plan.name}</div>
          <div className="mt-1 text-slate-600">{round.round.name}</div>
          <dl className="mt-4 space-y-2">
            <div className="flex justify-between">
              <dt className="text-slate-500">Pending</dt>
              <dd className="font-semibold text-amber-700">{pendingCount}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">Reviewed</dt>
              <dd className="font-semibold text-emerald-700">{reviewedCount}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">Abstained</dt>
              <dd className="font-semibold text-slate-600">{abstainedCount}</dd>
            </div>
          </dl>
        </div>
        <Link href="/review" className="text-sm text-blue-700 hover:underline">
          ← All plans
        </Link>
      </aside>

      <div className="min-w-0 flex-1 space-y-4">
        <div>
          <h1 className="text-2xl font-semibold">{round.round.name}</h1>
          <p className="text-slate-600">
            {pendingCount} pending · {reviewedCount} reviewed
            {abstainedCount > 0 ? ` · ${abstainedCount} abstained` : ""}
          </p>
        </div>

        <form className="flex flex-wrap gap-2" method="get">
          <Input
            name="q"
            placeholder="Search submissions…"
            defaultValue={sp.q}
            className="max-w-xs"
          />
          <select
            name="status"
            defaultValue={statusFilter}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="reviewed">Reviewed</option>
            <option value="abstained">Abstained</option>
          </select>
          <button
            type="submit"
            className="rounded-md border border-slate-300 px-3 py-2 text-sm hover:bg-slate-50"
          >
            Filter
          </button>
        </form>

        <div className="grid gap-3">
          {filtered.length === 0 ? (
            <p className="text-slate-600">No assignments match your filters.</p>
          ) : (
            filtered.map(({ assignment, submission }) => {
              const reviewed = assignment.status === "complete";
              const abstained = assignment.status === "abstained";
              return (
                <Link
                  key={assignment.id}
                  href={`/review/plans/${planId}/rounds/${roundId}/submissions/${assignment.id}`}
                >
                  <Card className="transition hover:border-blue-300 hover:shadow-md">
                    <CardBody className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h2 className="font-medium text-slate-900">{submission.title}</h2>
                        <p className="mt-1 text-sm text-slate-600">
                          {truncate(submission.description)}
                        </p>
                      </div>
                      <Badge
                        className={
                          reviewed
                            ? "shrink-0 bg-emerald-100 text-emerald-800"
                            : abstained
                              ? "shrink-0 bg-slate-200 text-slate-800"
                              : "shrink-0 bg-amber-100 text-amber-800"
                        }
                      >
                        {reviewed ? "Reviewed" : abstained ? "Abstained" : "Pending"}
                      </Badge>
                    </CardBody>
                  </Card>
                </Link>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
