"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireOrganizer } from "@/lib/guards";
import { addMembership, fullName, provisionUser } from "@/lib/auth";
import { all, get } from "@/lib/db";
import { normalizeLocal, formatEventDates } from "@/lib/datetime";
import { textToOptions } from "@/lib/fields";
import { appUrl, sendTemplate } from "@/lib/email";
import { logAudit } from "@/lib/repo/audit";
import { splitName, upsertContact } from "@/lib/repo/contacts";
import {
  addRoundReviewer,
  addScorecardQuestion,
  assign,
  createPlan,
  createRound,
  deletePlan,
  deleteRound,
  deleteScorecardQuestion,
  getPlan,
  getRound,
  removeRoundReviewer,
  unassign,
  updatePlan,
  updateRound,
  updateScorecardQuestion,
} from "@/lib/repo/evaluations";
import { listSubmissions } from "@/lib/repo/submissions";

async function ctx(formData: FormData) {
  const slug = String(formData.get("slug"));
  const auth = await requireOrganizer(slug);
  return { slug, ...auth };
}

export async function createPlanAction(formData: FormData) {
  const { slug, event } = await ctx(formData);
  const plan = createPlan(event.id, {
    name: String(formData.get("name") ?? "Evaluation plan"),
    instructions: String(formData.get("instructions") ?? "") || null,
    opens_at: normalizeLocal(String(formData.get("opens_at") ?? "")),
    closes_at: normalizeLocal(String(formData.get("closes_at") ?? "")),
    mode: (String(formData.get("mode") ?? "parallel") as "funnel" | "parallel"),
    anonymize: formData.get("anonymize") ? 1 : 0,
    is_open: 1,
  });
  const round = createRound(plan.id, {
    name: "Round 1",
    opens_at: plan.opens_at,
    closes_at: plan.closes_at,
    anonymize: plan.anonymize,
  });
  addScorecardQuestion(round.id, { type: "scale_1_5", label: "Overall rating", is_required: 1, weight: 1 });
  addScorecardQuestion(round.id, { type: "free_text", label: "Comments", sort_order: 1 });
  revalidatePath(`/admin/e/${slug}/evaluation`);
  redirect(`/admin/e/${slug}/evaluation/${plan.id}`);
}

export async function updatePlanAction(formData: FormData) {
  const { slug, event } = await ctx(formData);
  const planId = String(formData.get("plan_id"));
  const plan = getPlan(planId);
  if (!plan || plan.event_id !== event.id) return;
  updatePlan(planId, {
    name: String(formData.get("name") ?? plan.name),
    instructions: String(formData.get("instructions") ?? "") || null,
    opens_at: normalizeLocal(String(formData.get("opens_at") ?? "")),
    closes_at: normalizeLocal(String(formData.get("closes_at") ?? "")),
    mode: (String(formData.get("mode") ?? plan.mode) as "funnel" | "parallel"),
    is_open: formData.get("is_open") ? 1 : 0,
    anonymize: formData.get("anonymize") ? 1 : 0,
    show_other_scores: formData.get("show_other_scores") ? 1 : 0,
    allow_abstain: formData.get("allow_abstain") ? 1 : 0,
    require_abstain_reason: formData.get("require_abstain_reason") ? 1 : 0,
  });
  revalidatePath(`/admin/e/${slug}/evaluation`, "layout");
  redirect(`/admin/e/${slug}/evaluation/${planId}?saved=1`);
}

export async function deletePlanAction(formData: FormData) {
  const { slug, event } = await ctx(formData);
  const plan = getPlan(String(formData.get("plan_id")));
  if (plan && plan.event_id === event.id) deletePlan(plan.id);
  revalidatePath(`/admin/e/${slug}/evaluation`);
  redirect(`/admin/e/${slug}/evaluation`);
}

export async function createRoundAction(formData: FormData) {
  const { slug, event } = await ctx(formData);
  const planId = String(formData.get("plan_id"));
  const plan = getPlan(planId);
  if (!plan || plan.event_id !== event.id) return;
  const round = createRound(planId, {
    name: String(formData.get("name") ?? "New round"),
    opens_at: normalizeLocal(String(formData.get("opens_at") ?? "")),
    closes_at: normalizeLocal(String(formData.get("closes_at") ?? "")),
    anonymize: formData.get("anonymize") ? 1 : 0,
    instructions: String(formData.get("instructions") ?? "") || null,
  });
  addScorecardQuestion(round.id, { type: "scale_1_5", label: "Overall rating", is_required: 1 });
  addScorecardQuestion(round.id, { type: "free_text", label: "Comments", sort_order: 1 });
  revalidatePath(`/admin/e/${slug}/evaluation`, "layout");
  redirect(`/admin/e/${slug}/evaluation/${planId}/rounds/${round.id}`);
}

export async function updateRoundAction(formData: FormData) {
  const { slug, event } = await ctx(formData);
  const roundId = String(formData.get("round_id"));
  const round = getRound(roundId);
  const plan = round ? getPlan(round.plan_id) : undefined;
  if (!round || !plan || plan.event_id !== event.id) return;
  updateRound(roundId, {
    name: String(formData.get("name") ?? round.name),
    opens_at: normalizeLocal(String(formData.get("opens_at") ?? "")),
    closes_at: normalizeLocal(String(formData.get("closes_at") ?? "")),
    anonymize: formData.get("anonymize") ? 1 : 0,
    instructions: String(formData.get("instructions") ?? "") || null,
    show_participants: formData.get("show_participants") ? 1 : 0,
    visible_fields: JSON.stringify(formData.getAll("visible_fields").map(String)),
    card_fields: JSON.stringify(formData.getAll("card_fields").map(String).slice(0, 3)),
    filter_fields: JSON.stringify(formData.getAll("filter_fields").map(String)),
  });
  revalidatePath(`/admin/e/${slug}/evaluation`, "layout");
  redirect(`/admin/e/${slug}/evaluation/${plan.id}/rounds/${roundId}?saved=1`);
}

export async function deleteRoundAction(formData: FormData) {
  const { slug, event } = await ctx(formData);
  const roundId = String(formData.get("round_id"));
  const round = getRound(roundId);
  const plan = round ? getPlan(round.plan_id) : undefined;
  if (!round || !plan || plan.event_id !== event.id) return;
  deleteRound(roundId);
  revalidatePath(`/admin/e/${slug}/evaluation`, "layout");
  redirect(`/admin/e/${slug}/evaluation/${plan.id}`);
}

export async function addScorecardQuestionAction(formData: FormData) {
  const { slug, event } = await ctx(formData);
  const roundId = String(formData.get("round_id"));
  const round = getRound(roundId);
  const plan = round ? getPlan(round.plan_id) : undefined;
  if (!round || !plan || plan.event_id !== event.id) return;
  const type = String(formData.get("type") ?? "scale_1_5");
  addScorecardQuestion(roundId, {
    type,
    label: String(formData.get("label") ?? "Criterion"),
    options: JSON.stringify(textToOptions(String(formData.get("options") ?? ""))),
    weight: Number(formData.get("weight") ?? (type === "dropdown" ? 0 : 1)),
    min: formData.get("min") ? Number(formData.get("min")) : null,
    max: formData.get("max") ? Number(formData.get("max")) : null,
    is_required: formData.get("is_required") ? 1 : 0,
  });
  revalidatePath(`/admin/e/${slug}/evaluation`, "layout");
}

export async function updateScorecardQuestionAction(formData: FormData) {
  const { slug } = await ctx(formData);
  updateScorecardQuestion(String(formData.get("question_id")), {
    label: String(formData.get("label") ?? ""),
    type: String(formData.get("type") ?? "scale_1_5"),
    options: JSON.stringify(textToOptions(String(formData.get("options") ?? ""))),
    weight: Number(formData.get("weight") ?? 1),
    min: formData.get("min") ? Number(formData.get("min")) : null,
    max: formData.get("max") ? Number(formData.get("max")) : null,
    is_required: formData.get("is_required") ? 1 : 0,
    sort_order: formData.get("sort_order") ? Number(formData.get("sort_order")) : undefined,
  });
  revalidatePath(`/admin/e/${slug}/evaluation`, "layout");
}

export async function deleteScorecardQuestionAction(formData: FormData) {
  const { slug } = await ctx(formData);
  deleteScorecardQuestion(String(formData.get("question_id")));
  revalidatePath(`/admin/e/${slug}/evaluation`, "layout");
}

/* ------------------------------------------------------------- reviewers -- */

export async function inviteReviewerAction(formData: FormData) {
  const { slug, event, user } = await ctx(formData);
  const roundId = String(formData.get("round_id"));
  const round = getRound(roundId);
  const plan = round ? getPlan(round.plan_id) : undefined;
  if (!round || !plan || plan.event_id !== event.id) return;

  const email = String(formData.get("email") ?? "").trim();
  const existingUserId = String(formData.get("user_id") ?? "");

  if (existingUserId) {
    addMembership(event.id, existingUserId, "reviewer");
    addRoundReviewer(roundId, existingUserId, numberOrNull(formData.get("max_assignments")));
    revalidatePath(`/admin/e/${slug}/evaluation`, "layout");
    return;
  }
  if (!email) return;

  const { first, last } = splitName(String(formData.get("name") ?? "") || email.split("@")[0]);
  const password = String(formData.get("password") ?? "").trim() || null;
  const { contact } = upsertContact(event.org_id, {
    email,
    first_name: first,
    last_name: last,
  });
  const { user: reviewer, invite } = provisionUser({
    email,
    firstName: first,
    lastName: last,
    password,
    eventId: event.id,
    role: "reviewer",
    contactId: contact.id,
  });
  addRoundReviewer(roundId, reviewer.id, numberOrNull(formData.get("max_assignments")));

  await sendTemplate({
    eventId: event.id,
    templateKey: "evaluation_invite",
    to: email,
    toName: `${first} ${last}`,
    contactId: contact.id,
    context: {
      first_name: first,
      speaker_name: `${first} ${last}`,
      event_name: event.name,
      event_dates: formatEventDates(event.starts_at, event.ends_at),
      portal_link: appUrl(`/set-password/${invite.token}`),
    },
    force: true,
  });

  logAudit({
    eventId: event.id,
    entityType: "round",
    entityId: roundId,
    actorUserId: user.id,
    actorName: fullName(user),
    action: "reviewer_invited",
    summary: `Invited ${email} to review ${round.name}`,
  });

  revalidatePath(`/admin/e/${slug}/evaluation`, "layout");
  redirect(
    `/admin/e/${slug}/evaluation/${plan.id}?tab=reviewers&invite=${invite.token}&email=${encodeURIComponent(email)}`,
  );
}

export async function removeReviewerAction(formData: FormData) {
  const { slug } = await ctx(formData);
  removeRoundReviewer(String(formData.get("round_id")), String(formData.get("user_id")));
  revalidatePath(`/admin/e/${slug}/evaluation`, "layout");
}

/* ----------------------------------------------------------- assignments -- */

export async function assignAction(formData: FormData) {
  const { slug, event } = await ctx(formData);
  const roundId = String(formData.get("round_id"));
  const round = getRound(roundId);
  const plan = round ? getPlan(round.plan_id) : undefined;
  if (!round || !plan || plan.event_id !== event.id) return;

  const reviewerId = String(formData.get("reviewer_user_id"));
  const submissionIds = formData.getAll("submission_ids").map(String).filter(Boolean);
  const mode = String(formData.get("mode") ?? "replace");

  if (mode === "replace") {
    const existing = all<{ submission_id: string }>(
      "SELECT submission_id FROM evaluation_assignments WHERE round_id = ? AND reviewer_user_id = ?",
      roundId,
      reviewerId,
    );
    for (const row of existing) {
      if (!submissionIds.includes(row.submission_id)) {
        unassign(roundId, row.submission_id, reviewerId);
      }
    }
  }
  for (const submissionId of submissionIds) assign(roundId, submissionId, reviewerId);

  revalidatePath(`/admin/e/${slug}/evaluation`, "layout");
  redirect(`/admin/e/${slug}/evaluation/${plan.id}?tab=assignments&assigned=1`);
}

/** Auto-distribute N reviewers per submission, honouring per-reviewer caps. */
export async function autoAssignAction(formData: FormData) {
  const { slug, event } = await ctx(formData);
  const roundId = String(formData.get("round_id"));
  const round = getRound(roundId);
  const plan = round ? getPlan(round.plan_id) : undefined;
  if (!round || !plan || plan.event_id !== event.id) return;

  const perSubmission = Math.max(1, Number(formData.get("per_submission") ?? 2));
  const cap = numberOrNull(formData.get("cap"));
  const trackId = String(formData.get("track_id") ?? "");
  const statusFilter = String(formData.get("status") ?? "pending");

  const reviewers = all<{ user_id: string }>(
    "SELECT user_id FROM round_reviewers WHERE round_id = ?",
    roundId,
  ).map((r) => r.user_id);
  if (!reviewers.length) return;

  const submissions = listSubmissions(event.id, {
    status: statusFilter === "all" ? "all" : statusFilter,
    trackId: trackId || undefined,
    limit: 1000,
  });

  const load = new Map<string, number>();
  for (const reviewer of reviewers) {
    load.set(
      reviewer,
      get<{ n: number }>(
        "SELECT COUNT(*) AS n FROM evaluation_assignments WHERE round_id = ? AND reviewer_user_id = ?",
        roundId,
        reviewer,
      )?.n ?? 0,
    );
  }

  let created = 0;
  for (const submission of submissions) {
    const already = all<{ reviewer_user_id: string }>(
      "SELECT reviewer_user_id FROM evaluation_assignments WHERE round_id = ? AND submission_id = ?",
      roundId,
      submission.id,
    ).map((r) => r.reviewer_user_id);
    let needed = perSubmission - already.length;
    if (needed <= 0) continue;
    const candidates = reviewers
      .filter((r) => !already.includes(r))
      .filter((r) => cap === null || (load.get(r) ?? 0) < cap)
      .sort((a, b) => (load.get(a) ?? 0) - (load.get(b) ?? 0));
    for (const candidate of candidates) {
      if (needed <= 0) break;
      assign(roundId, submission.id, candidate);
      load.set(candidate, (load.get(candidate) ?? 0) + 1);
      needed -= 1;
      created += 1;
    }
  }

  revalidatePath(`/admin/e/${slug}/evaluation`, "layout");
  redirect(`/admin/e/${slug}/evaluation/${plan.id}?tab=assignments&created=${created}`);
}

export async function promoteAction(formData: FormData) {
  const { slug, event } = await ctx(formData);
  const fromRoundId = String(formData.get("from_round_id"));
  const toRoundId = String(formData.get("to_round_id"));
  const submissionIds = formData.getAll("submission_ids").map(String);
  const round = getRound(toRoundId);
  const plan = round ? getPlan(round.plan_id) : undefined;
  if (!round || !plan || plan.event_id !== event.id) return;

  const reviewers = all<{ user_id: string }>(
    "SELECT user_id FROM round_reviewers WHERE round_id = ?",
    toRoundId,
  ).map((r) => r.user_id);

  for (const submissionId of submissionIds) {
    for (const reviewer of reviewers) assign(toRoundId, submissionId, reviewer);
  }
  void fromRoundId;
  revalidatePath(`/admin/e/${slug}/evaluation`, "layout");
  redirect(`/admin/e/${slug}/evaluation/${plan.id}?tab=rounds&promoted=${submissionIds.length}`);
}

export async function demoteAction(formData: FormData) {
  const { slug, event } = await ctx(formData);
  const roundId = String(formData.get("round_id"));
  const round = getRound(roundId);
  const plan = round ? getPlan(round.plan_id) : undefined;
  if (!round || !plan || plan.event_id !== event.id) return;
  for (const submissionId of formData.getAll("submission_ids").map(String)) {
    for (const row of all<{ reviewer_user_id: string }>(
      "SELECT reviewer_user_id FROM evaluation_assignments WHERE round_id = ? AND submission_id = ?",
      roundId,
      submissionId,
    )) {
      unassign(roundId, submissionId, row.reviewer_user_id);
    }
  }
  revalidatePath(`/admin/e/${slug}/evaluation`, "layout");
}

export async function remindReviewersAction(formData: FormData) {
  const { slug, event, user } = await ctx(formData);
  const planId = String(formData.get("plan_id"));
  const plan = getPlan(planId);
  if (!plan || plan.event_id !== event.id) return;
  const userIds = formData.getAll("reviewer_user_ids").map(String).filter(Boolean);
  if (!userIds.length) {
    redirect(`/admin/e/${slug}/evaluation/${planId}?tab=progress&reminded=0`);
  }

  let sent = 0;
  for (const reviewerId of userIds) {
    const reviewer = get<{ email: string; first_name: string; last_name: string }>(
      "SELECT email, first_name, last_name FROM users WHERE id = ?",
      reviewerId,
    );
    if (!reviewer) continue;
    const outstanding =
      get<{ n: number }>(
        `SELECT COUNT(*) AS n FROM evaluation_assignments a
           JOIN evaluation_rounds r ON r.id = a.round_id
          WHERE r.plan_id = ? AND a.reviewer_user_id = ? AND a.status NOT IN ('complete','abstained')`,
        planId,
        reviewerId,
      )?.n ?? 0;
    await sendTemplate({
      eventId: event.id,
      templateKey: "evaluation_reminder",
      to: reviewer.email,
      toName: `${reviewer.first_name} ${reviewer.last_name}`,
      context: {
        first_name: reviewer.first_name,
        speaker_name: `${reviewer.first_name} ${reviewer.last_name}`,
        event_name: event.name,
        due_date: plan.closes_at ?? "soon",
        portal_link: appUrl("/review"),
        task_name: `${outstanding} outstanding reviews`,
      },
      kind: "manual",
      force: true,
    });
    sent += 1;
  }

  logAudit({
    eventId: event.id,
    entityType: "plan",
    entityId: planId,
    actorUserId: user.id,
    actorName: fullName(user),
    action: "reviewers_reminded",
    summary: `Sent ${sent} reviewer reminder(s)`,
  });

  revalidatePath(`/admin/e/${slug}/evaluation`, "layout");
  redirect(`/admin/e/${slug}/evaluation/${planId}?tab=progress&reminded=${sent}`);
}

function numberOrNull(value: FormDataEntryValue | null): number | null {
  const raw = value === null ? "" : String(value).trim();
  if (!raw) return null;
  const n = Number(raw);
  return Number.isNaN(n) ? null : n;
}
