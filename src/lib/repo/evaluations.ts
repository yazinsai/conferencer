import { all, get, run } from "../db";
import { id } from "../ids";
import { nowIso, isPast, isFuture } from "../datetime";
import { parseOptions } from "../fields";
import {
  SCORECARD_TYPES,
  SCORECARD_TYPE_LABELS,
  scaleRange,
  isScored,
} from "../scorecard";

export { SCORECARD_TYPES, SCORECARD_TYPE_LABELS, scaleRange, isScored };

export type EvaluationPlan = {
  id: string;
  event_id: string;
  name: string;
  instructions: string | null;
  is_open: number;
  opens_at: string | null;
  closes_at: string | null;
  scoring_method: string;
  mode: "funnel" | "parallel";
  anonymize: number;
  show_other_scores: number;
  allow_abstain: number;
  require_abstain_reason: number;
  created_at: string;
  updated_at: string;
};

export type EvaluationRound = {
  id: string;
  plan_id: string;
  name: string;
  sort_order: number;
  opens_at: string | null;
  closes_at: string | null;
  anonymize: number;
  instructions: string | null;
  visible_fields: string;
  card_fields: string;
  filter_fields: string;
  show_participants: number;
  created_at: string;
};

export type ScorecardQuestion = {
  id: string;
  round_id: string;
  type: string;
  label: string;
  options: string;
  weight: number;
  min: number | null;
  max: number | null;
  is_required: number;
  sort_order: number;
};

export type Assignment = {
  id: string;
  round_id: string;
  submission_id: string;
  reviewer_user_id: string;
  status: string;
  abstain_reason: string | null;
  created_at: string;
};

export type Review = {
  id: string;
  assignment_id: string;
  round_id: string;
  submission_id: string;
  reviewer_user_id: string;
  answers: string;
  score: number | null;
  raw_score: number | null;
  comment: string | null;
  submitted_at: string | null;
  updated_at: string;
};

/* ----------------------------------------------------------------- plans -- */

export function listPlans(eventId: string): EvaluationPlan[] {
  return all<EvaluationPlan>(
    "SELECT * FROM evaluation_plans WHERE event_id = ? ORDER BY created_at",
    eventId,
  );
}

export function getPlan(planId: string): EvaluationPlan | undefined {
  return get<EvaluationPlan>("SELECT * FROM evaluation_plans WHERE id = ?", planId);
}

export function createPlan(eventId: string, input: Partial<EvaluationPlan> & { name: string }) {
  const planId = input.id ?? id();
  run(
    `INSERT INTO evaluation_plans (id, event_id, name, instructions, is_open, opens_at, closes_at,
        scoring_method, mode, anonymize, show_other_scores, allow_abstain, require_abstain_reason,
        created_at, updated_at)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    planId,
    eventId,
    input.name,
    input.instructions ?? null,
    input.is_open ?? 1,
    input.opens_at ?? null,
    input.closes_at ?? null,
    input.scoring_method ?? "points",
    input.mode ?? "parallel",
    input.anonymize ?? 0,
    input.show_other_scores ?? 0,
    input.allow_abstain ?? 1,
    input.require_abstain_reason ?? 0,
    nowIso(),
    nowIso(),
  );
  return getPlan(planId)!;
}

const PLAN_FIELDS = [
  "name",
  "instructions",
  "is_open",
  "opens_at",
  "closes_at",
  "scoring_method",
  "mode",
  "anonymize",
  "show_other_scores",
  "allow_abstain",
  "require_abstain_reason",
] as const;

export function updatePlan(planId: string, patch: Partial<EvaluationPlan>) {
  const sets: string[] = [];
  const params: unknown[] = [];
  for (const key of PLAN_FIELDS) {
    if (key in patch) {
      sets.push(`${key} = ?`);
      params.push(patch[key] ?? null);
    }
  }
  if (!sets.length) return;
  sets.push("updated_at = ?");
  params.push(nowIso(), planId);
  run(`UPDATE evaluation_plans SET ${sets.join(", ")} WHERE id = ?`, ...params);
}

export function deletePlan(planId: string) {
  run("DELETE FROM evaluation_plans WHERE id = ?", planId);
}

/* ---------------------------------------------------------------- rounds -- */

export function listRounds(planId: string): EvaluationRound[] {
  return all<EvaluationRound>(
    "SELECT * FROM evaluation_rounds WHERE plan_id = ? ORDER BY sort_order, created_at",
    planId,
  );
}

export function getRound(roundId: string): EvaluationRound | undefined {
  return get<EvaluationRound>("SELECT * FROM evaluation_rounds WHERE id = ?", roundId);
}

export function createRound(planId: string, input: Partial<EvaluationRound> & { name: string }) {
  const roundId = input.id ?? id();
  run(
    `INSERT INTO evaluation_rounds (id, plan_id, name, sort_order, opens_at, closes_at, anonymize,
        instructions, visible_fields, card_fields, filter_fields, show_participants, created_at)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    roundId,
    planId,
    input.name,
    input.sort_order ??
      (get<{ n: number }>(
        "SELECT COALESCE(MAX(sort_order),-1)+1 AS n FROM evaluation_rounds WHERE plan_id = ?",
        planId,
      )?.n ??
        0),
    input.opens_at ?? null,
    input.closes_at ?? null,
    input.anonymize ?? 0,
    input.instructions ?? null,
    input.visible_fields ?? "[]",
    input.card_fields ?? "[]",
    input.filter_fields ?? "[]",
    input.show_participants ?? 1,
    nowIso(),
  );
  return getRound(roundId)!;
}

const ROUND_FIELDS = [
  "name",
  "sort_order",
  "opens_at",
  "closes_at",
  "anonymize",
  "instructions",
  "visible_fields",
  "card_fields",
  "filter_fields",
  "show_participants",
] as const;

export function updateRound(roundId: string, patch: Partial<EvaluationRound>) {
  const sets: string[] = [];
  const params: unknown[] = [];
  for (const key of ROUND_FIELDS) {
    if (key in patch) {
      sets.push(`${key} = ?`);
      params.push(patch[key] ?? null);
    }
  }
  if (!sets.length) return;
  params.push(roundId);
  run(`UPDATE evaluation_rounds SET ${sets.join(", ")} WHERE id = ?`, ...params);
}

export function deleteRound(roundId: string) {
  run("DELETE FROM evaluation_rounds WHERE id = ?", roundId);
}

export function roundIsOpen(round: EvaluationRound, plan: EvaluationPlan): boolean {
  if (!plan.is_open) return false;
  if (round.opens_at && isFuture(round.opens_at)) return false;
  if (round.closes_at && isPast(round.closes_at)) return false;
  if (plan.opens_at && isFuture(plan.opens_at)) return false;
  if (plan.closes_at && isPast(plan.closes_at)) return false;
  return true;
}

/* ------------------------------------------------------------- scorecard -- */

export function listScorecard(roundId: string): ScorecardQuestion[] {
  return all<ScorecardQuestion>(
    "SELECT * FROM scorecard_questions WHERE round_id = ? ORDER BY sort_order",
    roundId,
  );
}

export function addScorecardQuestion(
  roundId: string,
  input: Partial<ScorecardQuestion> & { label: string; type: string },
): ScorecardQuestion {
  const rowId = id();
  run(
    `INSERT INTO scorecard_questions (id, round_id, type, label, options, weight, min, max,
        is_required, sort_order)
     VALUES (?,?,?,?,?,?,?,?,?,?)`,
    rowId,
    roundId,
    input.type,
    input.label,
    input.options ?? "[]",
    input.weight ?? 1,
    input.min ?? null,
    input.max ?? null,
    input.is_required ?? 0,
    input.sort_order ??
      (get<{ n: number }>(
        "SELECT COALESCE(MAX(sort_order),-1)+1 AS n FROM scorecard_questions WHERE round_id = ?",
        roundId,
      )?.n ??
        0),
  );
  return get<ScorecardQuestion>("SELECT * FROM scorecard_questions WHERE id = ?", rowId)!;
}

export function updateScorecardQuestion(questionId: string, patch: Partial<ScorecardQuestion>) {
  const keys = ["type", "label", "options", "weight", "min", "max", "is_required", "sort_order"] as const;
  const sets: string[] = [];
  const params: unknown[] = [];
  for (const key of keys) {
    if (key in patch) {
      sets.push(`${key} = ?`);
      params.push(patch[key] ?? null);
    }
  }
  if (!sets.length) return;
  params.push(questionId);
  run(`UPDATE scorecard_questions SET ${sets.join(", ")} WHERE id = ?`, ...params);
}

export function deleteScorecardQuestion(questionId: string) {
  run("DELETE FROM scorecard_questions WHERE id = ?", questionId);
}

/* -------------------------------------------------------------- reviewers -- */

export type ReviewerRow = {
  id: string;
  round_id: string;
  user_id: string;
  max_assignments: number | null;
  email: string;
  first_name: string;
  last_name: string;
  assigned: number;
  completed: number;
};

export function listRoundReviewers(roundId: string): ReviewerRow[] {
  return all<ReviewerRow>(
    `SELECT rr.*, u.email, u.first_name, u.last_name,
            (SELECT COUNT(*) FROM evaluation_assignments a
              WHERE a.round_id = rr.round_id AND a.reviewer_user_id = rr.user_id) AS assigned,
            (SELECT COUNT(*) FROM evaluation_assignments a
              WHERE a.round_id = rr.round_id AND a.reviewer_user_id = rr.user_id
                AND a.status IN ('complete','abstained')) AS completed
       FROM round_reviewers rr JOIN users u ON u.id = rr.user_id
      WHERE rr.round_id = ?
      ORDER BY u.last_name, u.first_name`,
    roundId,
  );
}

export function addRoundReviewer(roundId: string, userId: string, maxAssignments?: number | null) {
  const existing = get(
    "SELECT id FROM round_reviewers WHERE round_id = ? AND user_id = ?",
    roundId,
    userId,
  );
  if (existing) {
    if (maxAssignments !== undefined) {
      run(
        "UPDATE round_reviewers SET max_assignments = ? WHERE round_id = ? AND user_id = ?",
        maxAssignments,
        roundId,
        userId,
      );
    }
    return;
  }
  run(
    "INSERT INTO round_reviewers (id, round_id, user_id, max_assignments, created_at) VALUES (?,?,?,?,?)",
    id(),
    roundId,
    userId,
    maxAssignments ?? null,
    nowIso(),
  );
}

export function removeRoundReviewer(roundId: string, userId: string) {
  run("DELETE FROM round_reviewers WHERE round_id = ? AND user_id = ?", roundId, userId);
  run(
    "DELETE FROM evaluation_assignments WHERE round_id = ? AND reviewer_user_id = ? AND status = 'pending'",
    roundId,
    userId,
  );
}

/* ------------------------------------------------------------ assignments -- */

export function assign(roundId: string, submissionId: string, reviewerUserId: string): Assignment {
  const existing = get<Assignment>(
    "SELECT * FROM evaluation_assignments WHERE round_id = ? AND submission_id = ? AND reviewer_user_id = ?",
    roundId,
    submissionId,
    reviewerUserId,
  );
  if (existing) return existing;
  const rowId = id();
  run(
    `INSERT INTO evaluation_assignments (id, round_id, submission_id, reviewer_user_id, status, created_at)
     VALUES (?,?,?,?,?,?)`,
    rowId,
    roundId,
    submissionId,
    reviewerUserId,
    "pending",
    nowIso(),
  );
  return get<Assignment>("SELECT * FROM evaluation_assignments WHERE id = ?", rowId)!;
}

export function unassign(roundId: string, submissionId: string, reviewerUserId: string) {
  run(
    `DELETE FROM evaluation_assignments
      WHERE round_id = ? AND submission_id = ? AND reviewer_user_id = ?
        AND id NOT IN (SELECT assignment_id FROM reviews WHERE submitted_at IS NOT NULL)`,
    roundId,
    submissionId,
    reviewerUserId,
  );
}

export function getAssignment(assignmentId: string): Assignment | undefined {
  return get<Assignment>("SELECT * FROM evaluation_assignments WHERE id = ?", assignmentId);
}

export function listAssignmentsForRound(roundId: string): Assignment[] {
  return all<Assignment>("SELECT * FROM evaluation_assignments WHERE round_id = ?", roundId);
}

export function listAssignmentsForSubmission(submissionId: string) {
  return all<
    Assignment & { first_name: string; last_name: string; email: string; round_name: string }
  >(
    `SELECT a.*, u.first_name, u.last_name, u.email, r.name AS round_name
       FROM evaluation_assignments a
       JOIN users u ON u.id = a.reviewer_user_id
       JOIN evaluation_rounds r ON r.id = a.round_id
      WHERE a.submission_id = ?
      ORDER BY r.sort_order, u.last_name`,
    submissionId,
  );
}

export type ReviewerQueueItem = Assignment & {
  title: string;
  description: string | null;
  track_name: string | null;
  track_color: string | null;
  format_name: string | null;
  level: string | null;
  language: string | null;
  answers: string;
  submission_created: string;
  has_review: number;
};

/** A reviewer's queue is exactly their assignments — enforced in SQL (ABS-05). */
export function reviewerQueue(
  roundId: string,
  userId: string,
  opts: { q?: string; trackId?: string; formatId?: string; level?: string; language?: string; state?: string } = {},
): ReviewerQueueItem[] {
  const where = ["a.round_id = ?", "a.reviewer_user_id = ?"];
  const params: unknown[] = [roundId, userId];
  if (opts.q) {
    where.push("(s.title LIKE ? OR s.description LIKE ?)");
    params.push(`%${opts.q}%`, `%${opts.q}%`);
  }
  if (opts.trackId) {
    where.push("s.track_id = ?");
    params.push(opts.trackId);
  }
  if (opts.formatId) {
    where.push("s.format_id = ?");
    params.push(opts.formatId);
  }
  if (opts.level) {
    where.push("s.level = ?");
    params.push(opts.level);
  }
  if (opts.language) {
    where.push("s.language = ?");
    params.push(opts.language);
  }
  if (opts.state === "pending") where.push("a.status NOT IN ('complete','abstained')");
  if (opts.state === "reviewed") where.push("a.status IN ('complete','abstained')");

  return all<ReviewerQueueItem>(
    `SELECT a.*, s.title, s.description, s.level, s.language, s.answers,
            s.created_at AS submission_created,
            t.name AS track_name, t.color AS track_color, f.name AS format_name,
            (SELECT COUNT(*) FROM reviews rv WHERE rv.assignment_id = a.id AND rv.submitted_at IS NOT NULL) AS has_review
       FROM evaluation_assignments a
       JOIN submissions s ON s.id = a.submission_id
       LEFT JOIN tracks t ON t.id = s.track_id
       LEFT JOIN formats f ON f.id = s.format_id
      WHERE ${where.join(" AND ")}
      ORDER BY s.title`,
    ...params,
  );
}

export function setAssignmentStatus(assignmentId: string, status: string, reason?: string | null) {
  run(
    "UPDATE evaluation_assignments SET status = ?, abstain_reason = ? WHERE id = ?",
    status,
    reason ?? null,
    assignmentId,
  );
}

/* ---------------------------------------------------------------- reviews -- */

export function getReviewByAssignment(assignmentId: string): Review | undefined {
  return get<Review>("SELECT * FROM reviews WHERE assignment_id = ?", assignmentId);
}

export function saveReview(input: {
  assignment: Assignment;
  answers: Record<string, unknown>;
  comment: string | null;
  score: number | null;
  rawScore: number | null;
  submitted: boolean;
}): Review {
  const existing = getReviewByAssignment(input.assignment.id);
  if (existing) {
    run(
      `UPDATE reviews SET answers = ?, comment = ?, score = ?, raw_score = ?,
              submitted_at = COALESCE(submitted_at, ?), updated_at = ?
        WHERE id = ?`,
      JSON.stringify(input.answers),
      input.comment,
      input.score,
      input.rawScore,
      input.submitted ? nowIso() : null,
      nowIso(),
      existing.id,
    );
    return getReviewByAssignment(input.assignment.id)!;
  }
  const rowId = id();
  run(
    `INSERT INTO reviews (id, assignment_id, round_id, submission_id, reviewer_user_id, answers,
        score, raw_score, comment, submitted_at, updated_at)
     VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
    rowId,
    input.assignment.id,
    input.assignment.round_id,
    input.assignment.submission_id,
    input.assignment.reviewer_user_id,
    JSON.stringify(input.answers),
    input.score,
    input.rawScore,
    input.comment,
    input.submitted ? nowIso() : null,
    nowIso(),
  );
  return getReviewByAssignment(input.assignment.id)!;
}

export type ReviewRow = Review & {
  reviewer_name: string;
  reviewer_email: string;
  round_name: string;
  plan_name: string;
};

export function reviewsForSubmission(submissionId: string): ReviewRow[] {
  return all<ReviewRow>(
    `SELECT rv.*, u.first_name || ' ' || u.last_name AS reviewer_name, u.email AS reviewer_email,
            r.name AS round_name, p.name AS plan_name
       FROM reviews rv
       JOIN users u ON u.id = rv.reviewer_user_id
       JOIN evaluation_rounds r ON r.id = rv.round_id
       JOIN evaluation_plans p ON p.id = r.plan_id
      WHERE rv.submission_id = ? AND rv.submitted_at IS NOT NULL
      ORDER BY rv.submitted_at`,
    submissionId,
  );
}

/**
 * Weighted score for one review (ABS-04). Each scored answer is normalised to
 * its own scale, weighted, and summed back onto the widest scale in the card so
 * "4 and 2 with weights 2 and 1" reads as 3.33 rather than 3.0.
 */
export function computeScore(
  questions: ScorecardQuestion[],
  answers: Record<string, unknown>,
): { score: number | null; raw: number | null; weighted: boolean } {
  let weightedSum = 0;
  let weightTotal = 0;
  let rawSum = 0;
  let rawCount = 0;
  let anyWeighted = false;

  for (const question of questions) {
    if (!isScored(question)) continue;
    // Weight 0 means "collect it, but keep it out of the aggregate" — the default
    // for dropdown criteria such as Accept/Maybe/Reject recommendations.
    const weight = Number(question.weight ?? 1);
    if (!weight || weight <= 0) continue;
    const raw = answers[question.id];
    if (raw === undefined || raw === null || raw === "") continue;

    let value: number | null = null;
    let max = 5;
    if (question.type === "dropdown") {
      const options = parseOptions(question.options);
      const chosen = options.find((o) => o.value === String(raw) || o.label === String(raw));
      if (!chosen || chosen.points === undefined || Number.isNaN(chosen.points)) continue;
      value = Number(chosen.points);
      max = Math.max(...options.map((o) => Number(o.points ?? 0)), 1);
    } else {
      const range = scaleRange(question);
      if (!range) continue;
      value = Number(raw);
      if (Number.isNaN(value)) continue;
      max = range.max;
    }
    if (weight !== 1) anyWeighted = true;
    // Normalise onto a 1..5-style comparable scale then weight it.
    weightedSum += (value / max) * weight;
    weightTotal += weight;
    rawSum += value;
    rawCount += 1;
  }

  if (!weightTotal) return { score: null, raw: null, weighted: false };
  const maxScale = Math.max(
    ...questions
      .filter((q) => isScored(q) && Number(q.weight ?? 1) > 0)
      .map((q) => scaleRange(q)?.max ?? 5),
    1,
  );
  const score = Number(((weightedSum / weightTotal) * maxScale).toFixed(2));
  const raw = rawCount ? Number((rawSum / rawCount).toFixed(2)) : null;
  return { score, raw, weighted: anyWeighted };
}

export type ResultRow = {
  submission_id: string;
  title: string;
  track_name: string | null;
  format_name: string | null;
  status: string;
  avg_score: number | null;
  avg_raw: number | null;
  review_count: number;
  assigned_count: number;
};

export function results(eventId: string, planId?: string): ResultRow[] {
  const params: unknown[] = [eventId];
  let planFilter = "";
  if (planId) {
    planFilter = "AND r.plan_id = ?";
    params.push(planId);
  }
  return all<ResultRow>(
    `SELECT s.id AS submission_id, s.title, s.status,
            t.name AS track_name, f.name AS format_name,
            ROUND(AVG(rv.score), 2) AS avg_score,
            ROUND(AVG(rv.raw_score), 2) AS avg_raw,
            COUNT(rv.id) AS review_count,
            (SELECT COUNT(*) FROM evaluation_assignments a
               JOIN evaluation_rounds r2 ON r2.id = a.round_id
              WHERE a.submission_id = s.id ${planId ? "AND r2.plan_id = ?" : ""}) AS assigned_count
       FROM submissions s
       LEFT JOIN tracks t ON t.id = s.track_id
       LEFT JOIN formats f ON f.id = s.format_id
       LEFT JOIN reviews rv ON rv.submission_id = s.id AND rv.submitted_at IS NOT NULL
       LEFT JOIN evaluation_rounds r ON r.id = rv.round_id
      WHERE s.event_id = ? ${planFilter}
      GROUP BY s.id
      ORDER BY avg_score DESC NULLS LAST, s.title`,
    ...(planId ? [planId, ...params] : params),
  );
}

export function planProgress(planId: string) {
  return get<{ assigned: number; complete: number; reviewers: number; submissions: number }>(
    `SELECT COUNT(*) AS assigned,
            SUM(CASE WHEN a.status IN ('complete','abstained') THEN 1 ELSE 0 END) AS complete,
            COUNT(DISTINCT a.reviewer_user_id) AS reviewers,
            COUNT(DISTINCT a.submission_id) AS submissions
       FROM evaluation_assignments a
       JOIN evaluation_rounds r ON r.id = a.round_id
      WHERE r.plan_id = ?`,
    planId,
  ) ?? { assigned: 0, complete: 0, reviewers: 0, submissions: 0 };
}

export type ReviewerProgress = {
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  round_id: string;
  round_name: string;
  assigned: number;
  complete: number;
};

export function reviewerProgress(planId: string): ReviewerProgress[] {
  return all<ReviewerProgress>(
    `SELECT u.id AS user_id, u.first_name, u.last_name, u.email,
            r.id AS round_id, r.name AS round_name,
            COUNT(a.id) AS assigned,
            SUM(CASE WHEN a.status IN ('complete','abstained') THEN 1 ELSE 0 END) AS complete
       FROM round_reviewers rr
       JOIN evaluation_rounds r ON r.id = rr.round_id
       JOIN users u ON u.id = rr.user_id
       LEFT JOIN evaluation_assignments a ON a.round_id = r.id AND a.reviewer_user_id = u.id
      WHERE r.plan_id = ?
      GROUP BY r.id, u.id
      ORDER BY r.sort_order, u.last_name`,
    planId,
  );
}

/** Plans a reviewer can see, with their own counts (R-REV-1). */
export function plansForReviewer(eventId: string, userId: string) {
  return all<{
    plan_id: string;
    plan_name: string;
    instructions: string | null;
    is_open: number;
    rounds: number;
    assigned: number;
    complete: number;
  }>(
    `SELECT p.id AS plan_id, p.name AS plan_name, p.instructions, p.is_open,
            COUNT(DISTINCT r.id) AS rounds,
            COUNT(a.id) AS assigned,
            SUM(CASE WHEN a.status IN ('complete','abstained') THEN 1 ELSE 0 END) AS complete
       FROM evaluation_plans p
       JOIN evaluation_rounds r ON r.plan_id = p.id
       LEFT JOIN evaluation_assignments a ON a.round_id = r.id AND a.reviewer_user_id = ?
      WHERE p.event_id = ?
        AND (EXISTS (SELECT 1 FROM round_reviewers rr WHERE rr.round_id = r.id AND rr.user_id = ?)
             OR a.id IS NOT NULL)
      GROUP BY p.id
      ORDER BY p.created_at`,
    userId,
    eventId,
    userId,
  );
}

export function roundsForReviewer(planId: string, userId: string) {
  return all<EvaluationRound & { assigned: number; complete: number; is_member: number }>(
    `SELECT r.*,
            (SELECT COUNT(*) FROM evaluation_assignments a
              WHERE a.round_id = r.id AND a.reviewer_user_id = ?) AS assigned,
            (SELECT COUNT(*) FROM evaluation_assignments a
              WHERE a.round_id = r.id AND a.reviewer_user_id = ?
                AND a.status IN ('complete','abstained')) AS complete,
            (SELECT COUNT(*) FROM round_reviewers rr WHERE rr.round_id = r.id AND rr.user_id = ?) AS is_member
       FROM evaluation_rounds r
      WHERE r.plan_id = ?
      ORDER BY r.sort_order`,
    userId,
    userId,
    userId,
    planId,
  );
}
