import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { requireEventRole } from "@/lib/auth/guards";
import { getDb, schema } from "@/lib/db";
import {
  buildCumulativeCsv,
  buildIndividualCsv,
  getRoundResults,
  sortResults,
} from "@/lib/evaluation/results";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string; planId: string }> },
) {
  const { slug, planId } = await params;
  const { event } = await requireEventRole(slug, ["organizer"]);

  const url = new URL(request.url);
  const shape = url.searchParams.get("shape") ?? "cumulative";
  const roundId = url.searchParams.get("round");
  const sort = url.searchParams.get("sort") === "title" ? "title" : "avg";
  const dir = url.searchParams.get("dir") === "asc" ? "asc" : "desc";

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
    return NextResponse.json({ error: "Plan not found" }, { status: 404 });
  }

  const rounds = db
    .select()
    .from(schema.evaluationRounds)
    .where(eq(schema.evaluationRounds.planId, planId))
    .orderBy(schema.evaluationRounds.sortOrder)
    .all();

  const activeRoundId =
    roundId && rounds.some((r) => r.id === roundId) ? roundId : rounds[0]?.id;
  if (!activeRoundId) {
    return NextResponse.json({ error: "No rounds" }, { status: 404 });
  }

  const rows = sortResults(getRoundResults(activeRoundId), sort, dir);
  const csv =
    shape === "individual" ? buildIndividualCsv(rows) : buildCumulativeCsv(rows);
  const filename =
    shape === "individual"
      ? `evaluation-${planId}-individual.csv`
      : `evaluation-${planId}-cumulative.csv`;

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
