"use server";

import { and, count, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { nanoid } from "nanoid";
import { requireEventRole } from "@/lib/auth/guards";
import { hashPassword } from "@/lib/auth/password";
import { getDb, schema } from "@/lib/db";
import { nowIso } from "@/lib/dates";
import { sendTemplatedEmail } from "@/lib/email/send";
import { id } from "@/lib/id";
import {
  applyAutoAssign,
  previewAutoAssign,
} from "@/lib/evaluation/results";

type ScorecardQuestion = typeof schema.scorecardQuestions.$inferSelect;

function revalidateEvaluation(slug: string, planId?: string) {
  revalidatePath(`/admin/e/${slug}/evaluation`);
  if (planId) {
    revalidatePath(`/admin/e/${slug}/evaluation/${planId}`);
  }
}

function parseIsoDate(raw: string) {
  if (!raw) return null;
  return new Date(raw).toISOString();
}

function parseOptions(raw: string) {
  try {
    const parsed = JSON.parse(raw || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function computeReviewScore(
  questions: ScorecardQuestion[],
  answers: Record<string, string | number>,
): number | null {
  let totalWeight = 0;
  let weightedSum = 0;
  for (const q of questions) {
    const val = answers[q.label];
    if (val === undefined || val === "") continue;
    if (q.type === "free_text") continue;

    let points: number | null = null;
    if (q.type === "scale_1_5" || q.type === "numeric") {
      points = Number(val);
    } else if (q.type === "dropdown") {
      const opts = parseOptions(q.options ?? "[]") as Array<{
        label: string;
        points?: number;
      }>;
      const opt = opts.find((o) => o.label === String(val));
      points = opt?.points ?? null;
    }
    if (points === null || Number.isNaN(points)) continue;
    const w = q.weight || 1;
    weightedSum += points * w;
    totalWeight += w;
  }
  if (totalWeight === 0) return null;
  return Math.round(weightedSum / totalWeight);
}

function updateSubmissionAverageScore(submissionId: string) {
  const db = getDb();
  const rows = db
    .select({ score: schema.reviews.score })
    .from(schema.reviews)
    .innerJoin(
      schema.evaluationAssignments,
      eq(schema.reviews.assignmentId, schema.evaluationAssignments.id),
    )
    .where(eq(schema.evaluationAssignments.submissionId, submissionId))
    .all();
  const scores = rows.map((r) => r.score).filter((s): s is number => s != null);
  const averageScore =
    scores.length > 0
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : null;
  db.update(schema.submissions)
    .set({ averageScore, updatedAt: nowIso() })
    .where(eq(schema.submissions.id, submissionId))
    .run();
}

export async function createEvaluationPlanAction(formData: FormData) {
  const slug = String(formData.get("slug") || "");
  const name = String(formData.get("name") || "").trim();
  const instructions = String(formData.get("instructions") || "");
  const opensAt = parseIsoDate(String(formData.get("opensAt") || ""));
  const closesAt = parseIsoDate(String(formData.get("closesAt") || ""));
  const isOpen = formData.get("isOpen") === "on" || formData.get("isOpen") === "true";

  const { event } = await requireEventRole(slug, ["organizer"]);
  if (!name) throw new Error("Name is required");

  const db = getDb();
  const planId = id("plan");
  const createdAt = nowIso();
  db.insert(schema.evaluationPlans)
    .values({
      id: planId,
      eventId: event.id,
      name,
      instructions: instructions || null,
      isOpen,
      opensAt,
      closesAt,
      createdAt,
    })
    .run();

  revalidateEvaluation(slug);
}

export async function createRoundAction(formData: FormData) {
  const slug = String(formData.get("slug") || "");
  const planId = String(formData.get("planId") || "");
  const name = String(formData.get("name") || "").trim();
  const instructions = String(formData.get("instructions") || "");
  const opensAt = parseIsoDate(String(formData.get("opensAt") || ""));
  const closesAt = parseIsoDate(String(formData.get("closesAt") || ""));
  const anonymize = formData.get("anonymize") === "on";

  const { event } = await requireEventRole(slug, ["organizer"]);
  if (!name) throw new Error("Round name is required");

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
  if (!plan) throw new Error("Plan not found");

  const existing = db
    .select({ sortOrder: schema.evaluationRounds.sortOrder })
    .from(schema.evaluationRounds)
    .where(eq(schema.evaluationRounds.planId, planId))
    .all();
  const sortOrder = existing.reduce((m, r) => Math.max(m, r.sortOrder), -1) + 1;

  const roundId = id("rnd");
  db.insert(schema.evaluationRounds)
    .values({
      id: roundId,
      planId,
      name,
      sortOrder,
      opensAt,
      closesAt,
      anonymize,
      instructions: instructions || null,
      visibleFields: JSON.stringify(["title", "description", "track", "format", "level"]),
    })
    .run();

  revalidateEvaluation(slug, planId);
}

export async function createScorecardQuestionAction(formData: FormData) {
  const slug = String(formData.get("slug") || "");
  const planId = String(formData.get("planId") || "");
  const roundId = String(formData.get("roundId") || "");
  const type = String(formData.get("type") || "scale_1_5");
  const label = String(formData.get("label") || "").trim();
  const weight = Number(formData.get("weight") || 1);
  const min = formData.get("min") ? Number(formData.get("min")) : null;
  const max = formData.get("max") ? Number(formData.get("max")) : null;
  const isRequired = formData.get("isRequired") !== "off";
  const optionsRaw = String(formData.get("options") || "");

  const { event } = await requireEventRole(slug, ["organizer"]);
  if (!label) throw new Error("Label is required");

  const db = getDb();
  const round = db
    .select({ planId: schema.evaluationRounds.planId })
    .from(schema.evaluationRounds)
    .innerJoin(
      schema.evaluationPlans,
      eq(schema.evaluationRounds.planId, schema.evaluationPlans.id),
    )
    .where(
      and(
        eq(schema.evaluationRounds.id, roundId),
        eq(schema.evaluationPlans.eventId, event.id),
      ),
    )
    .get();
  if (!round) throw new Error("Round not found");

  const existing = db
    .select({ sortOrder: schema.scorecardQuestions.sortOrder })
    .from(schema.scorecardQuestions)
    .where(eq(schema.scorecardQuestions.roundId, roundId))
    .all();
  const sortOrder = existing.reduce((m, q) => Math.max(m, q.sortOrder), -1) + 1;

  let options = "[]";
  if (type === "dropdown" && optionsRaw.trim()) {
    const lines = optionsRaw
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    const parsed = lines.map((line) => {
      const [lbl, pts] = line.split("|").map((s) => s.trim());
      return { label: lbl, points: pts ? Number(pts) : undefined };
    });
    options = JSON.stringify(parsed);
  }

  db.insert(schema.scorecardQuestions)
    .values({
      id: id("scq"),
      roundId,
      type,
      label,
      options,
      weight: Number.isFinite(weight) ? weight : 1,
      min: type === "scale_1_5" ? 1 : min,
      max: type === "scale_1_5" ? 5 : max,
      isRequired,
      sortOrder,
    })
    .run();

  revalidateEvaluation(slug, planId);
}

export async function updateScorecardQuestionAction(formData: FormData) {
  const slug = String(formData.get("slug") || "");
  const planId = String(formData.get("planId") || "");
  const questionId = String(formData.get("questionId") || "");
  const label = String(formData.get("label") || "").trim();
  const weight = Number(formData.get("weight") || 1);
  const isRequired = formData.get("isRequired") === "on";
  const optionsRaw = String(formData.get("options") || "");

  const { event } = await requireEventRole(slug, ["organizer"]);
  if (!label) throw new Error("Label is required");

  const db = getDb();
  const row = db
    .select({ question: schema.scorecardQuestions })
    .from(schema.scorecardQuestions)
    .innerJoin(
      schema.evaluationRounds,
      eq(schema.scorecardQuestions.roundId, schema.evaluationRounds.id),
    )
    .innerJoin(
      schema.evaluationPlans,
      eq(schema.evaluationRounds.planId, schema.evaluationPlans.id),
    )
    .where(
      and(
        eq(schema.scorecardQuestions.id, questionId),
        eq(schema.evaluationPlans.eventId, event.id),
      ),
    )
    .get();
  if (!row) throw new Error("Question not found");
  const question = row.question;

  let options = question.options;
  if (question.type === "dropdown" && optionsRaw.trim()) {
    const lines = optionsRaw
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    const parsed = lines.map((line) => {
      const [lbl, pts] = line.split("|").map((s) => s.trim());
      return { label: lbl, points: pts ? Number(pts) : undefined };
    });
    options = JSON.stringify(parsed);
  }

  db.update(schema.scorecardQuestions)
    .set({ label, weight, isRequired, options })
    .where(eq(schema.scorecardQuestions.id, questionId))
    .run();

  revalidateEvaluation(slug, planId);
}

export async function deleteScorecardQuestionAction(formData: FormData) {
  const slug = String(formData.get("slug") || "");
  const planId = String(formData.get("planId") || "");
  const questionId = String(formData.get("questionId") || "");

  const { event } = await requireEventRole(slug, ["organizer"]);

  const db = getDb();
  const question = db
    .select({ id: schema.scorecardQuestions.id })
    .from(schema.scorecardQuestions)
    .innerJoin(
      schema.evaluationRounds,
      eq(schema.scorecardQuestions.roundId, schema.evaluationRounds.id),
    )
    .innerJoin(
      schema.evaluationPlans,
      eq(schema.evaluationRounds.planId, schema.evaluationPlans.id),
    )
    .where(
      and(
        eq(schema.scorecardQuestions.id, questionId),
        eq(schema.evaluationPlans.eventId, event.id),
      ),
    )
    .get();
  if (!question) throw new Error("Question not found");

  db.delete(schema.scorecardQuestions)
    .where(eq(schema.scorecardQuestions.id, questionId))
    .run();

  revalidateEvaluation(slug, planId);
}

export async function addReviewerAction(formData: FormData) {
  const slug = String(formData.get("slug") || "");
  const planId = String(formData.get("planId") || "");
  const userId = String(formData.get("userId") || "");

  const { event } = await requireEventRole(slug, ["organizer"]);
  if (!userId) throw new Error("User required");

  const db = getDb();
  const existing = db
    .select()
    .from(schema.eventMemberships)
    .where(
      and(
        eq(schema.eventMemberships.eventId, event.id),
        eq(schema.eventMemberships.userId, userId),
        eq(schema.eventMemberships.role, "reviewer"),
      ),
    )
    .get();
  if (!existing) {
    db.insert(schema.eventMemberships)
      .values({
        id: id("mem"),
        eventId: event.id,
        userId,
        role: "reviewer",
        createdAt: nowIso(),
      })
      .run();
  }

  revalidateEvaluation(slug, planId);
}

export async function inviteReviewerAction(formData: FormData) {
  const slug = String(formData.get("slug") || "");
  const planId = String(formData.get("planId") || "");
  const email = String(formData.get("email") || "")
    .trim()
    .toLowerCase();
  const firstName = String(formData.get("firstName") || "").trim();
  const lastName = String(formData.get("lastName") || "").trim();
  const sendEmail = formData.get("sendEmail") === "on";

  const { event } = await requireEventRole(slug, ["organizer"]);
  if (!email) throw new Error("Email is required");

  const db = getDb();
  let user = db.select().from(schema.users).where(eq(schema.users.email, email)).get();
  const createdAt = nowIso();

  if (!user) {
    const userId = id("usr");
    const fn = firstName || email.split("@")[0] || "Reviewer";
    const ln = lastName || "";
    db.insert(schema.users)
      .values({
        id: userId,
        email,
        passwordHash: await hashPassword(nanoid(24)),
        firstName: fn,
        lastName: ln,
        createdAt,
      })
      .run();
    user = db.select().from(schema.users).where(eq(schema.users.id, userId)).get()!;
  }

  const mem = db
    .select()
    .from(schema.eventMemberships)
    .where(
      and(
        eq(schema.eventMemberships.eventId, event.id),
        eq(schema.eventMemberships.userId, user.id),
        eq(schema.eventMemberships.role, "reviewer"),
      ),
    )
    .get();
  if (!mem) {
    db.insert(schema.eventMemberships)
      .values({
        id: id("mem"),
        eventId: event.id,
        userId: user.id,
        role: "reviewer",
        createdAt,
      })
      .run();
  }

  const token = nanoid(32);
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  db.insert(schema.inviteTokens)
    .values({
      id: id("inv"),
      userId: user.id,
      eventId: event.id,
      token,
      purpose: "set_password",
      expiresAt,
      createdAt,
    })
    .run();

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
  const setPasswordUrl = `${baseUrl}/set-password?token=${token}`;

  if (sendEmail) {
    await sendTemplatedEmail({
      eventId: event.id,
      toEmail: email,
      templateKey: "evaluation_invite",
      fields: {
        first_name: user.firstName,
        event_name: event.name,
        set_password_link: setPasswordUrl,
      },
    });
    revalidatePath(`/admin/e/${slug}/emails`);
  }

  revalidateEvaluation(slug, planId);
  return { setPasswordUrl, token };
}

export async function assignSubmissionsAction(formData: FormData) {
  const slug = String(formData.get("slug") || "");
  const planId = String(formData.get("planId") || "");
  const roundId = String(formData.get("roundId") || "");
  const reviewerUserId = String(formData.get("reviewerUserId") || "");
  const submissionIds = formData.getAll("submissionIds").map(String).filter(Boolean);

  const { event } = await requireEventRole(slug, ["organizer"]);
  if (!roundId || !reviewerUserId || !submissionIds.length) {
    throw new Error("Round, reviewer, and submissions are required");
  }

  const db = getDb();
  const round = db
    .select()
    .from(schema.evaluationRounds)
    .innerJoin(
      schema.evaluationPlans,
      eq(schema.evaluationRounds.planId, schema.evaluationPlans.id),
    )
    .where(
      and(
        eq(schema.evaluationRounds.id, roundId),
        eq(schema.evaluationPlans.eventId, event.id),
      ),
    )
    .get();
  if (!round) throw new Error("Round not found");

  const createdAt = nowIso();
  let created = 0;
  for (const submissionId of submissionIds) {
    const sub = db
      .select()
      .from(schema.submissions)
      .where(
        and(
          eq(schema.submissions.id, submissionId),
          eq(schema.submissions.eventId, event.id),
        ),
      )
      .get();
    if (!sub) continue;

    const dup = db
      .select()
      .from(schema.evaluationAssignments)
      .where(
        and(
          eq(schema.evaluationAssignments.roundId, roundId),
          eq(schema.evaluationAssignments.submissionId, submissionId),
          eq(schema.evaluationAssignments.reviewerUserId, reviewerUserId),
        ),
      )
      .get();
    if (dup) continue;

    db.insert(schema.evaluationAssignments)
      .values({
        id: id("asg"),
        roundId,
        submissionId,
        reviewerUserId,
        status: "pending",
        createdAt,
      })
      .run();
    created++;
  }

  revalidateEvaluation(slug, planId);
  revalidatePath(`/review/plans/${planId}/rounds/${roundId}`);
  void created;
}

export async function previewAutoAssignAction(formData: FormData) {
  const slug = String(formData.get("slug") || "");
  const planId = String(formData.get("planId") || "");
  const roundId = String(formData.get("roundId") || "");
  const mode = String(formData.get("mode") || "reviewers_per_submission") as
    | "reviewers_per_submission"
    | "max_per_reviewer";
  const count = Number(formData.get("count") || 0);
  const trackId = String(formData.get("trackId") || "") || null;
  const reviewerUserIds = formData.getAll("reviewerUserIds").map(String).filter(Boolean);

  const { event } = await requireEventRole(slug, ["organizer"]);

  const db = getDb();
  const round = db
    .select()
    .from(schema.evaluationRounds)
    .innerJoin(
      schema.evaluationPlans,
      eq(schema.evaluationRounds.planId, schema.evaluationPlans.id),
    )
    .where(
      and(
        eq(schema.evaluationRounds.id, roundId),
        eq(schema.evaluationPlans.eventId, event.id),
        eq(schema.evaluationPlans.id, planId),
      ),
    )
    .get();
  if (!round) throw new Error("Round not found");

  const reviewerIds =
    reviewerUserIds.length > 0
      ? reviewerUserIds
      : db
          .select({ userId: schema.evaluationAssignments.reviewerUserId })
          .from(schema.evaluationAssignments)
          .where(eq(schema.evaluationAssignments.roundId, roundId))
          .all()
          .map((r) => r.userId)
          .filter((id, i, arr) => arr.indexOf(id) === i);

  if (reviewerIds.length === 0) {
    const eventReviewers = db
      .select({ userId: schema.eventMemberships.userId })
      .from(schema.eventMemberships)
      .where(
        and(
          eq(schema.eventMemberships.eventId, event.id),
          eq(schema.eventMemberships.role, "reviewer"),
        ),
      )
      .all()
      .map((r) => r.userId);
    reviewerIds.push(...eventReviewers);
  }

  return previewAutoAssign({
    roundId,
    eventId: event.id,
    mode,
    count,
    trackId,
    reviewerUserIds: reviewerIds,
  });
}

export async function autoAssignAction(formData: FormData) {
  const slug = String(formData.get("slug") || "");
  const planId = String(formData.get("planId") || "");
  const roundId = String(formData.get("roundId") || "");
  const mode = String(formData.get("mode") || "reviewers_per_submission") as
    | "reviewers_per_submission"
    | "max_per_reviewer";
  const count = Number(formData.get("count") || 0);
  const trackId = String(formData.get("trackId") || "") || null;
  const reviewerUserIds = formData.getAll("reviewerUserIds").map(String).filter(Boolean);

  const { event } = await requireEventRole(slug, ["organizer"]);
  if (!roundId || !count) throw new Error("Round and count are required");

  const db = getDb();
  const round = db
    .select()
    .from(schema.evaluationRounds)
    .innerJoin(
      schema.evaluationPlans,
      eq(schema.evaluationRounds.planId, schema.evaluationPlans.id),
    )
    .where(
      and(
        eq(schema.evaluationRounds.id, roundId),
        eq(schema.evaluationPlans.eventId, event.id),
        eq(schema.evaluationPlans.id, planId),
      ),
    )
    .get();
  if (!round) throw new Error("Round not found");

  let reviewerIds = reviewerUserIds;
  if (reviewerIds.length === 0) {
    reviewerIds = db
      .select({ userId: schema.evaluationAssignments.reviewerUserId })
      .from(schema.evaluationAssignments)
      .where(eq(schema.evaluationAssignments.roundId, roundId))
      .all()
      .map((r) => r.userId)
      .filter((id, i, arr) => arr.indexOf(id) === i);
  }
  if (reviewerIds.length === 0) {
    reviewerIds = db
      .select({ userId: schema.eventMemberships.userId })
      .from(schema.eventMemberships)
      .where(
        and(
          eq(schema.eventMemberships.eventId, event.id),
          eq(schema.eventMemberships.role, "reviewer"),
        ),
      )
      .all()
      .map((r) => r.userId);
  }

  const created = applyAutoAssign({
    roundId,
    eventId: event.id,
    mode,
    count,
    trackId,
    reviewerUserIds: reviewerIds,
    createdAt: nowIso(),
  });

  revalidateEvaluation(slug, planId);
  revalidatePath(`/review/plans/${planId}/rounds/${roundId}`);
  return { created };
}

export async function sendBulkReminderAction(formData: FormData) {
  const slug = String(formData.get("slug") || "");
  const planId = String(formData.get("planId") || "");
  const roundId = String(formData.get("roundId") || "");
  const reviewerUserIds = formData.getAll("reviewerUserIds").map(String).filter(Boolean);

  const { event } = await requireEventRole(slug, ["organizer"]);
  if (!roundId) throw new Error("Round is required");

  const db = getDb();
  const round = db
    .select()
    .from(schema.evaluationRounds)
    .innerJoin(
      schema.evaluationPlans,
      eq(schema.evaluationRounds.planId, schema.evaluationPlans.id),
    )
    .where(
      and(
        eq(schema.evaluationRounds.id, roundId),
        eq(schema.evaluationPlans.eventId, event.id),
        eq(schema.evaluationPlans.id, planId),
      ),
    )
    .get();
  if (!round) throw new Error("Round not found");

  let targetIds = reviewerUserIds;
  if (targetIds.length === 0) {
    const pending = db
      .select({ reviewerUserId: schema.evaluationAssignments.reviewerUserId })
      .from(schema.evaluationAssignments)
      .where(
        and(
          eq(schema.evaluationAssignments.roundId, roundId),
          eq(schema.evaluationAssignments.status, "pending"),
        ),
      )
      .all();
    targetIds = [...new Set(pending.map((p) => p.reviewerUserId))];
  }

  let sent = 0;
  for (const userId of targetIds) {
    const user = db.select().from(schema.users).where(eq(schema.users.id, userId)).get();
    if (!user) continue;

    const outstanding = db
      .select({ c: count() })
      .from(schema.evaluationAssignments)
      .where(
        and(
          eq(schema.evaluationAssignments.roundId, roundId),
          eq(schema.evaluationAssignments.reviewerUserId, userId),
          eq(schema.evaluationAssignments.status, "pending"),
        ),
      )
      .get();
    if (Number(outstanding?.c ?? 0) === 0) continue;

    await sendTemplatedEmail({
      eventId: event.id,
      toEmail: user.email,
      templateKey: "evaluation_reminder",
      fields: {
        first_name: user.firstName,
        event_name: event.name,
      },
    });
    sent++;
  }

  revalidatePath(`/admin/e/${slug}/emails`);
  return { sent };
}

export async function saveReviewAction(formData: FormData) {
  const planId = String(formData.get("planId") || "");
  const roundId = String(formData.get("roundId") || "");
  const assignmentId = String(formData.get("assignmentId") || "");

  const { requireAnyAuth, forbidden } = await import("@/lib/auth/guards");
  const user = await requireAnyAuth(
    `/review/plans/${planId}/rounds/${roundId}/submissions/${assignmentId}`,
  );

  const db = getDb();
  const assignment = db
    .select()
    .from(schema.evaluationAssignments)
    .where(eq(schema.evaluationAssignments.id, assignmentId))
    .get();
  if (!assignment) throw new Error("Assignment not found");
  if (assignment.reviewerUserId !== user.id) throw new Error("Forbidden");
  if (assignment.roundId !== roundId) throw new Error("Forbidden");

  const round = db
    .select()
    .from(schema.evaluationRounds)
    .where(eq(schema.evaluationRounds.id, roundId))
    .get();
  if (!round || round.planId !== planId) {
    forbidden();
  }

  const questions = db
    .select()
    .from(schema.scorecardQuestions)
    .where(eq(schema.scorecardQuestions.roundId, roundId))
    .orderBy(schema.scorecardQuestions.sortOrder)
    .all();

  const answers: Record<string, string | number> = {};
  let comment = "";
  for (const q of questions) {
    const val = formData.get(`q_${q.id}`);
    if (val != null && String(val) !== "") {
      answers[q.label] = q.type === "numeric" ? Number(val) : String(val);
      if (q.type === "free_text") {
        comment = String(val);
      }
    } else if (q.isRequired) {
      throw new Error(`"${q.label}" is required`);
    }
  }

  const score = computeReviewScore(questions, answers);
  const updatedAt = nowIso();

  const existing = db
    .select()
    .from(schema.reviews)
    .where(eq(schema.reviews.assignmentId, assignmentId))
    .get();

  if (existing) {
    db.update(schema.reviews)
      .set({
        answers: JSON.stringify(answers),
        score,
        comment: comment || null,
        submittedAt: updatedAt,
        updatedAt,
      })
      .where(eq(schema.reviews.id, existing.id))
      .run();
  } else {
    db.insert(schema.reviews)
      .values({
        id: id("rev"),
        assignmentId,
        answers: JSON.stringify(answers),
        score,
        comment: comment || null,
        submittedAt: updatedAt,
        updatedAt,
      })
      .run();
  }

  db.update(schema.evaluationAssignments)
    .set({ status: "complete" })
    .where(eq(schema.evaluationAssignments.id, assignmentId))
    .run();

  updateSubmissionAverageScore(assignment.submissionId);

  revalidatePath(`/review/plans/${planId}/rounds/${roundId}`);
  revalidatePath(
    `/review/plans/${planId}/rounds/${roundId}/submissions/${assignmentId}`,
  );
}
