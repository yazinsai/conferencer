"use server";

import { revalidatePath } from "next/cache";
import { forbidden, redirect } from "next/navigation";

import { requireReviewer } from "@/lib/guards";
import { fullName } from "@/lib/auth";
import { logAudit } from "@/lib/repo/audit";
import {
  computeScore,
  getAssignment,
  getPlan,
  getRound,
  isScored,
  listScorecard,
  roundIsOpen,
  saveReview,
  setAssignmentStatus,
} from "@/lib/repo/evaluations";

export async function saveReviewAction(formData: FormData) {
  const { user, event } = await requireReviewer();
  const assignmentId = String(formData.get("assignment_id"));
  const assignment = getAssignment(assignmentId);
  if (!assignment) forbidden();
  // A reviewer may only touch their own assignment (ABS-05).
  if (assignment.reviewer_user_id !== user.id && !user.is_superadmin) forbidden();

  const round = getRound(assignment.round_id);
  const plan = round ? getPlan(round.plan_id) : undefined;
  if (!round || !plan || plan.event_id !== event.id) forbidden();
  if (!roundIsOpen(round, plan)) {
    redirect(`/review/a/${assignmentId}?error=This+round+is+closed`);
  }

  const questions = listScorecard(round.id);
  const answers: Record<string, unknown> = {};
  const missing: string[] = [];
  for (const question of questions) {
    if (question.type === "separator") continue;
    const raw = formData.get(`q_${question.id}`);
    const value = raw === null ? "" : String(raw);
    if (question.is_required && !value.trim()) missing.push(question.label);
    answers[question.id] = isScored(question) && value !== "" ? Number(value) || value : value;
  }
  if (missing.length) {
    redirect(
      `/review/a/${assignmentId}?error=${encodeURIComponent(`Required: ${missing.join(", ")}`)}`,
    );
  }

  const comment =
    String(formData.get("comment") ?? "") ||
    (Object.entries(answers).find(
      ([id]) => questions.find((q) => q.id === id)?.type === "free_text",
    )?.[1] as string) ||
    null;

  const computed = computeScore(questions, answers);
  saveReview({
    assignment,
    answers,
    comment: comment ? String(comment) : null,
    score: computed.score,
    rawScore: computed.raw,
    submitted: true,
  });
  setAssignmentStatus(assignmentId, "complete");

  logAudit({
    eventId: event.id,
    entityType: "submission",
    entityId: assignment.submission_id,
    actorUserId: user.id,
    actorName: fullName(user),
    action: "reviewed",
    summary: `${fullName(user)} submitted a review (score ${
      computed.score !== null ? computed.score.toFixed(2) : "n/a"
    })`,
  });

  revalidatePath("/review", "layout");
  revalidatePath(`/admin/e/${event.slug}`, "layout");

  const next = String(formData.get("next_after_save") ?? "");
  if (next) redirect(next);
  redirect(`/review/round/${round.id}?saved=1`);
}

export async function abstainAction(formData: FormData) {
  const { user, event } = await requireReviewer();
  const assignmentId = String(formData.get("assignment_id"));
  const assignment = getAssignment(assignmentId);
  if (!assignment) forbidden();
  if (assignment.reviewer_user_id !== user.id && !user.is_superadmin) forbidden();
  const round = getRound(assignment.round_id);
  const plan = round ? getPlan(round.plan_id) : undefined;
  if (!round || !plan || plan.event_id !== event.id) forbidden();

  const reason = String(formData.get("reason") ?? "").trim();
  if (plan.require_abstain_reason && !reason) {
    redirect(`/review/a/${assignmentId}?error=A+reason+is+required+to+declare+a+conflict`);
  }
  const undo = String(formData.get("undo") ?? "") === "1";
  setAssignmentStatus(assignmentId, undo ? "pending" : "abstained", undo ? null : reason);

  logAudit({
    eventId: event.id,
    entityType: "submission",
    entityId: assignment.submission_id,
    actorUserId: user.id,
    actorName: fullName(user),
    action: undo ? "conflict_cleared" : "conflict_declared",
    summary: undo
      ? `${fullName(user)} withdrew their conflict of interest`
      : `${fullName(user)} declared a conflict of interest: ${reason || "no reason given"}`,
  });

  revalidatePath("/review", "layout");
  revalidatePath(`/admin/e/${event.slug}`, "layout");
  redirect(`/review/round/${round.id}?abstained=1`);
}
