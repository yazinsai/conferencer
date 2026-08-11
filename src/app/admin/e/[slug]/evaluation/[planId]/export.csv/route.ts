import { requireOrganizer } from "@/lib/guards";
import { readJson } from "@/lib/db";
import { toCsv } from "@/lib/csv";
import {
  getPlan,
  listRounds,
  listScorecard,
  results,
  reviewsForSubmission,
} from "@/lib/repo/evaluations";
import { parseOptions } from "@/lib/fields";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string; planId: string }> },
) {
  const { slug, planId } = await params;
  const { event } = await requireOrganizer(slug);
  const plan = getPlan(planId);
  if (!plan || plan.event_id !== event.id) return new Response("Not found", { status: 404 });

  const shape = new URL(request.url).searchParams.get("shape") ?? "cumulative";
  const rows = results(event.id, plan.id).filter((row) => row.assigned_count > 0);

  if (shape === "individual") {
    const questionLabels = new Map<string, string>();
    for (const round of listRounds(plan.id)) {
      for (const question of listScorecard(round.id)) questionLabels.set(question.id, question.label);
    }
    const out = rows.flatMap((row) =>
      reviewsForSubmission(row.submission_id).map((review) => {
        const answers = readJson<Record<string, unknown>>(review.answers, {});
        const named: Record<string, unknown> = {};
        for (const [questionId, value] of Object.entries(answers)) {
          named[questionLabels.get(questionId) ?? questionId] = Array.isArray(value)
            ? value.join(", ")
            : value;
        }
        return {
          submission: row.title,
          track: row.track_name ?? "",
          reviewer: review.reviewer_name,
          reviewer_email: review.reviewer_email,
          round: review.round_name,
          weighted_score: review.score ?? "",
          unweighted_score: review.raw_score ?? "",
          comment: review.comment ?? "",
          submitted_at: review.submitted_at ?? "",
          ...named,
        };
      }),
    );
    return csvResponse(out, `${event.slug}-individual-grades.csv`);
  }

  const out = rows.map((row) => {
    const reviews = reviewsForSubmission(row.submission_id);
    return {
      submission: row.title,
      track: row.track_name ?? "",
      format: row.format_name ?? "",
      status: row.status,
      weighted_average: row.avg_score ?? "",
      unweighted_average: row.avg_raw ?? "",
      reviews_complete: row.review_count,
      reviews_assigned: row.assigned_count,
      reviewers: reviews.map((r) => r.reviewer_name).join("; "),
      scores: reviews.map((r) => (r.score !== null ? r.score.toFixed(2) : "")).join("; "),
      comments: reviews.map((r) => r.comment ?? "").join(" || "),
    };
  });
  return csvResponse(out, `${event.slug}-cumulative-grades.csv`);
}

function csvResponse(rows: Array<Record<string, unknown>>, filename: string) {
  return new Response(toCsv(rows.length ? rows : [{ note: "no reviews yet" }]), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}

void parseOptions;
