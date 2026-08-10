import { and, eq } from "drizzle-orm";
import { getDb, schema } from "@/lib/db";
import { id } from "@/lib/id";

export type ReviewerScore = {
  reviewerUserId: string;
  reviewerName: string;
  score: number | null;
  status: string;
  abstainReason: string | null;
};

export type AiReviewSummary = {
  score: number;
  reasoning: string;
  overridden: boolean;
  createdAt: string;
};

export type SubmissionResultRow = {
  submissionId: string;
  submissionTitle: string;
  averageScore: number | null;
  reviewCount: number;
  reviewerScores: ReviewerScore[];
  aiReview: AiReviewSummary | null;
};

export function getRoundResults(roundId: string): SubmissionResultRow[] {
  const db = getDb();
  const rows = db
    .select({
      assignment: schema.evaluationAssignments,
      submission: schema.submissions,
      reviewer: schema.users,
      review: schema.reviews,
    })
    .from(schema.evaluationAssignments)
    .innerJoin(
      schema.submissions,
      eq(schema.evaluationAssignments.submissionId, schema.submissions.id),
    )
    .innerJoin(schema.users, eq(schema.evaluationAssignments.reviewerUserId, schema.users.id))
    .leftJoin(schema.reviews, eq(schema.reviews.assignmentId, schema.evaluationAssignments.id))
    .where(eq(schema.evaluationAssignments.roundId, roundId))
    .all();

  const bySubmission = new Map<string, SubmissionResultRow>();

  for (const row of rows) {
    let entry = bySubmission.get(row.submission.id);
    if (!entry) {
      entry = {
        submissionId: row.submission.id,
        submissionTitle: row.submission.title,
        averageScore: null,
        reviewCount: 0,
        reviewerScores: [],
        aiReview: null,
      };
      bySubmission.set(row.submission.id, entry);
    }

    entry.reviewerScores.push({
      reviewerUserId: row.reviewer.id,
      reviewerName: `${row.reviewer.firstName} ${row.reviewer.lastName}`.trim(),
      score: row.review?.score ?? null,
      status: row.assignment.status,
      abstainReason: row.assignment.abstainReason,
    });
  }

  for (const entry of bySubmission.values()) {
    const humanCompleted = entry.reviewerScores.filter(
      (r) => r.status === "complete" && r.score != null,
    );
    entry.reviewCount = humanCompleted.length;
    entry.averageScore =
      humanCompleted.length > 0
        ? Math.round(
            humanCompleted.reduce((sum, r) => sum + (r.score ?? 0), 0) /
              humanCompleted.length,
          )
        : null;
  }

  const aiRows = db
    .select()
    .from(schema.aiReviews)
    .where(eq(schema.aiReviews.roundId, roundId))
    .all();
  const aiBySubmission = new Map(aiRows.map((r) => [r.submissionId, r]));

  for (const entry of bySubmission.values()) {
    const ai = aiBySubmission.get(entry.submissionId);
    if (!ai) {
      entry.aiReview = null;
      continue;
    }
    entry.aiReview = {
      score: ai.score,
      reasoning: ai.reasoning,
      overridden: ai.overriddenByReviewId != null,
      createdAt: ai.createdAt,
    };
    if (entry.averageScore == null && !ai.overriddenByReviewId) {
      entry.averageScore = ai.score;
    }
  }

  return Array.from(bySubmission.values());
}

export function sortResults(
  rows: SubmissionResultRow[],
  sort: "avg" | "title",
  dir: "asc" | "desc",
): SubmissionResultRow[] {
  const mult = dir === "asc" ? 1 : -1;
  return [...rows].sort((a, b) => {
    if (sort === "title") {
      return mult * a.submissionTitle.localeCompare(b.submissionTitle);
    }
    const av = a.averageScore ?? -1;
    const bv = b.averageScore ?? -1;
    return mult * (av - bv);
  });
}

export function csvEscape(val: string | number | null | undefined): string {
  const s = val == null ? "" : String(val);
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export function buildIndividualCsv(rows: SubmissionResultRow[]): string {
  const header = ["submission_id", "submission_title", "reviewer_name", "score", "status"];
  const lines = [header.join(",")];
  for (const row of rows) {
    for (const rs of row.reviewerScores) {
      lines.push(
        [
          csvEscape(row.submissionId),
          csvEscape(row.submissionTitle),
          csvEscape(rs.reviewerName),
          csvEscape(rs.score),
          csvEscape(rs.status),
        ].join(","),
      );
    }
  }
  return lines.join("\n");
}

export function buildCumulativeCsv(rows: SubmissionResultRow[]): string {
  const reviewerNames = new Map<string, string>();
  for (const row of rows) {
    for (const rs of row.reviewerScores) {
      reviewerNames.set(rs.reviewerUserId, rs.reviewerName);
    }
  }
  const reviewerIds = Array.from(reviewerNames.keys());
  const header = [
    "submission_id",
    "submission_title",
    "average_score",
    "review_count",
    ...reviewerIds.map((id) => csvEscape(reviewerNames.get(id) ?? id)),
  ];
  const lines = [header.join(",")];
  for (const row of rows) {
    const scoreByReviewer = new Map(row.reviewerScores.map((rs) => [rs.reviewerUserId, rs.score]));
    lines.push(
      [
        csvEscape(row.submissionId),
        csvEscape(row.submissionTitle),
        csvEscape(row.averageScore),
        csvEscape(row.reviewCount),
        ...reviewerIds.map((id) => csvEscape(scoreByReviewer.get(id) ?? "")),
      ].join(","),
    );
  }
  return lines.join("\n");
}

export type ReviewerProgress = {
  userId: string;
  name: string;
  email: string;
  total: number;
  done: number;
  percent: number;
};

export function getRoundReviewerProgress(roundId: string): ReviewerProgress[] {
  const db = getDb();
  const rows = db
    .select({
      reviewer: schema.users,
      assignment: schema.evaluationAssignments,
    })
    .from(schema.evaluationAssignments)
    .innerJoin(schema.users, eq(schema.evaluationAssignments.reviewerUserId, schema.users.id))
    .where(eq(schema.evaluationAssignments.roundId, roundId))
    .all();

  const byReviewer = new Map<string, ReviewerProgress>();
  for (const row of rows) {
    let entry = byReviewer.get(row.reviewer.id);
    if (!entry) {
      entry = {
        userId: row.reviewer.id,
        name: `${row.reviewer.firstName} ${row.reviewer.lastName}`.trim(),
        email: row.reviewer.email,
        total: 0,
        done: 0,
        percent: 0,
      };
      byReviewer.set(row.reviewer.id, entry);
    }
    entry.total++;
    if (row.assignment.status === "complete" || row.assignment.status === "abstained") {
      entry.done++;
    }
  }

  for (const entry of byReviewer.values()) {
    entry.percent = entry.total > 0 ? Math.round((entry.done / entry.total) * 100) : 0;
  }

  return Array.from(byReviewer.values()).sort((a, b) => a.name.localeCompare(b.name));
}

export function getRoundProgressStats(roundId: string) {
  const db = getDb();
  const assignments = db
    .select({
      assignment: schema.evaluationAssignments,
      submissionId: schema.evaluationAssignments.submissionId,
    })
    .from(schema.evaluationAssignments)
    .where(eq(schema.evaluationAssignments.roundId, roundId))
    .all();

  const totalEvaluations = assignments.length;
  const doneAssignments = assignments.filter(
    (a) =>
      a.assignment.status === "complete" || a.assignment.status === "abstained",
  ).length;

  const submissionStatus = new Map<string, { total: number; done: number }>();
  for (const row of assignments) {
    let s = submissionStatus.get(row.submissionId);
    if (!s) {
      s = { total: 0, done: 0 };
      submissionStatus.set(row.submissionId, s);
    }
    s.total++;
    if (row.assignment.status === "complete") s.done++;
  }

  const evaluatedSubmissions = Array.from(submissionStatus.values()).filter(
    (s) => s.done > 0,
  ).length;

  return { totalEvaluations, doneAssignments, evaluatedSubmissions };
}

export type AutoAssignPreview = {
  newAssignments: number;
  submissionCount: number;
  reviewerCount: number;
  description: string;
};

export function previewAutoAssign(opts: {
  roundId: string;
  eventId: string;
  mode: "reviewers_per_submission" | "max_per_reviewer";
  count: number;
  trackId?: string | null;
  reviewerUserIds: string[];
}): AutoAssignPreview {
  const db = getDb();
  const { roundId, eventId, mode, count, trackId, reviewerUserIds } = opts;
  if (!count || count < 1 || reviewerUserIds.length === 0) {
    return {
      newAssignments: 0,
      submissionCount: 0,
      reviewerCount: reviewerUserIds.length,
      description: "Set a count and ensure reviewers exist for this round.",
    };
  }

  const submissionFilter = trackId
    ? and(
        eq(schema.submissions.eventId, eventId),
        eq(schema.submissions.isDraft, false),
        eq(schema.submissions.trackId, trackId),
      )
    : and(eq(schema.submissions.eventId, eventId), eq(schema.submissions.isDraft, false));

  const submissions = db
    .select({ id: schema.submissions.id })
    .from(schema.submissions)
    .where(submissionFilter)
    .all();

  const existing = db
    .select({
      submissionId: schema.evaluationAssignments.submissionId,
      reviewerUserId: schema.evaluationAssignments.reviewerUserId,
    })
    .from(schema.evaluationAssignments)
    .where(eq(schema.evaluationAssignments.roundId, roundId))
    .all();

  const existingSet = new Set(
    existing.map((e) => `${e.submissionId}:${e.reviewerUserId}`),
  );

  const reviewerLoads = new Map<string, number>();
  for (const rid of reviewerUserIds) reviewerLoads.set(rid, 0);
  for (const e of existing) {
    if (reviewerUserIds.includes(e.reviewerUserId)) {
      reviewerLoads.set(
        e.reviewerUserId,
        (reviewerLoads.get(e.reviewerUserId) ?? 0) + 1,
      );
    }
  }

  let newAssignments = 0;

  if (mode === "reviewers_per_submission") {
    for (const sub of submissions) {
      const assigned = new Set(
        existing
          .filter((e) => e.submissionId === sub.id)
          .map((e) => e.reviewerUserId),
      );
      const candidates = reviewerUserIds
        .filter((rid) => !assigned.has(rid))
        .sort((a, b) => (reviewerLoads.get(a) ?? 0) - (reviewerLoads.get(b) ?? 0));
      const toAdd = candidates.slice(0, count);
      newAssignments += toAdd.length;
      for (const rid of toAdd) {
        reviewerLoads.set(rid, (reviewerLoads.get(rid) ?? 0) + 1);
        existingSet.add(`${sub.id}:${rid}`);
      }
    }
  } else {
    const unassigned = submissions.map((s) => s.id);
    const subsPerReviewer = count;
    for (const rid of reviewerUserIds) {
      let added = 0;
      for (let i = unassigned.length - 1; i >= 0; i--) {
        if (added >= subsPerReviewer) break;
        const subId = unassigned[i];
        if (existingSet.has(`${subId}:${rid}`)) continue;
        newAssignments++;
        added++;
        existingSet.add(`${subId}:${rid}`);
        unassigned.splice(i, 1);
      }
    }
  }

  return {
    newAssignments,
    submissionCount: submissions.length,
    reviewerCount: reviewerUserIds.length,
    description: `${submissions.length} submission(s) × ${reviewerUserIds.length} reviewer(s) → ${newAssignments} new assignment(s)`,
  };
}

export function applyAutoAssign(opts: {
  roundId: string;
  eventId: string;
  mode: "reviewers_per_submission" | "max_per_reviewer";
  count: number;
  trackId?: string | null;
  reviewerUserIds: string[];
  createdAt: string;
}): number {
  const db = getDb();
  const { roundId, eventId, mode, count, trackId, reviewerUserIds, createdAt } = opts;
  if (!count || count < 1 || reviewerUserIds.length === 0) return 0;

  const submissionFilter = trackId
    ? and(
        eq(schema.submissions.eventId, eventId),
        eq(schema.submissions.isDraft, false),
        eq(schema.submissions.trackId, trackId),
      )
    : and(eq(schema.submissions.eventId, eventId), eq(schema.submissions.isDraft, false));

  const submissions = db
    .select({ id: schema.submissions.id })
    .from(schema.submissions)
    .where(submissionFilter)
    .all();

  const existing = db
    .select({
      submissionId: schema.evaluationAssignments.submissionId,
      reviewerUserId: schema.evaluationAssignments.reviewerUserId,
    })
    .from(schema.evaluationAssignments)
    .where(eq(schema.evaluationAssignments.roundId, roundId))
    .all();

  const existingSet = new Set(
    existing.map((e) => `${e.submissionId}:${e.reviewerUserId}`),
  );

  const reviewerLoads = new Map<string, number>();
  for (const rid of reviewerUserIds) reviewerLoads.set(rid, 0);
  for (const e of existing) {
    if (reviewerUserIds.includes(e.reviewerUserId)) {
      reviewerLoads.set(
        e.reviewerUserId,
        (reviewerLoads.get(e.reviewerUserId) ?? 0) + 1,
      );
    }
  }

  let created = 0;

  if (mode === "reviewers_per_submission") {
    for (const sub of submissions) {
      const assigned = new Set(
        existing
          .filter((e) => e.submissionId === sub.id)
          .map((e) => e.reviewerUserId),
      );
      const candidates = reviewerUserIds
        .filter((rid) => !assigned.has(rid))
        .sort((a, b) => (reviewerLoads.get(a) ?? 0) - (reviewerLoads.get(b) ?? 0));
      for (const rid of candidates.slice(0, count)) {
        if (existingSet.has(`${sub.id}:${rid}`)) continue;
        db.insert(schema.evaluationAssignments)
          .values({
            id: id("asg"),
            roundId,
            submissionId: sub.id,
            reviewerUserId: rid,
            status: "pending",
            createdAt,
          })
          .run();
        existingSet.add(`${sub.id}:${rid}`);
        reviewerLoads.set(rid, (reviewerLoads.get(rid) ?? 0) + 1);
        created++;
      }
    }
  } else {
    const unassigned = submissions.map((s) => s.id);
    for (const rid of reviewerUserIds) {
      let added = 0;
      for (let i = unassigned.length - 1; i >= 0; i--) {
        if (added >= count) break;
        const subId = unassigned[i];
        if (existingSet.has(`${subId}:${rid}`)) continue;
        db.insert(schema.evaluationAssignments)
          .values({
            id: id("asg"),
            roundId,
            submissionId: subId,
            reviewerUserId: rid,
            status: "pending",
            createdAt,
          })
          .run();
        existingSet.add(`${subId}:${rid}`);
        unassigned.splice(i, 1);
        added++;
        created++;
      }
    }
  }

  return created;
}
