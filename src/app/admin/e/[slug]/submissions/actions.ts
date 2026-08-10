"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireOrganizer } from "@/lib/guards";
import { fullName } from "@/lib/auth";
import { readJson, writeJson } from "@/lib/db";
import { normalizeLocal, nowIso } from "@/lib/datetime";
import { diff, getAudit, logAudit } from "@/lib/repo/audit";
import {
  addParticipant,
  createSubmission,
  deleteSubmission,
  getSubmission,
  listParticipants,
  removeParticipant,
  setParticipantRole,
  updateSubmission,
} from "@/lib/repo/submissions";
import { ensureEventContact, splitName, upsertContact } from "@/lib/repo/contacts";
import { onSubmissionAccepted, onSubmissionDeclined } from "@/lib/services/decisions";

function ids(formData: FormData): string[] {
  return formData.getAll("ids").map(String).filter(Boolean);
}

export async function setStatusAction(formData: FormData) {
  const slug = String(formData.get("slug"));
  const { user, event } = await requireOrganizer(slug);
  const status = String(formData.get("status"));
  const targets = ids(formData);
  const single = formData.get("id");
  if (single) targets.push(String(single));

  for (const submissionId of targets) {
    const submission = getSubmission(submissionId);
    if (!submission || submission.event_id !== event.id) continue;
    if (submission.status === status) continue;
    const before = submission.status;
    updateSubmission(submissionId, {
      status: status as never,
      is_draft: status === "draft" ? 1 : 0,
      withdrawn_at: status === "withdrawn" ? nowIso() : null,
    });
    logAudit({
      eventId: event.id,
      entityType: "submission",
      entityId: submissionId,
      actorUserId: user.id,
      actorName: fullName(user),
      action: "status_changed",
      summary: `Status changed from ${before} to ${status}`,
      before: { status: before },
      after: { status },
    });
    const updated = getSubmission(submissionId)!;
    if (status === "accepted") onSubmissionAccepted(event, updated, { id: user.id, name: fullName(user) });
    if (status === "declined") onSubmissionDeclined(event, updated, { id: user.id, name: fullName(user) });
  }
  revalidatePath(`/admin/e/${slug}`, "layout");
  revalidatePath("/portal", "layout");
}

export async function setApprovalAction(formData: FormData) {
  const slug = String(formData.get("slug"));
  const { user, event } = await requireOrganizer(slug);
  const approval = String(formData.get("approval_status"));
  const targets = ids(formData);
  const single = formData.get("id");
  if (single) targets.push(String(single));

  for (const submissionId of targets) {
    const submission = getSubmission(submissionId);
    if (!submission || submission.event_id !== event.id) continue;
    updateSubmission(submissionId, { approval_status: approval });
    logAudit({
      eventId: event.id,
      entityType: "submission",
      entityId: submissionId,
      actorUserId: user.id,
      actorName: fullName(user),
      action: "approval_changed",
      summary: `Content approval set to ${approval}`,
      before: { approval_status: submission.approval_status },
      after: { approval_status: approval },
    });
  }
  revalidatePath(`/admin/e/${slug}`, "layout");
  revalidatePath(`/e/${slug}`, "layout");
}

export async function saveSubmissionAction(formData: FormData) {
  const slug = String(formData.get("slug"));
  const { user, event } = await requireOrganizer(slug);
  const submissionId = String(formData.get("id"));
  const submission = getSubmission(submissionId);
  if (!submission || submission.event_id !== event.id) return;

  const answers = readJson<Record<string, unknown>>(submission.answers, {});
  for (const [key, value] of formData.entries()) {
    if (!key.startsWith("answer_")) continue;
    answers[key.slice("answer_".length)] = String(value);
  }

  const patch = {
    title: String(formData.get("title") ?? submission.title).trim(),
    description: String(formData.get("description") ?? ""),
    track_id: emptyToNull(formData.get("track_id")),
    format_id: emptyToNull(formData.get("format_id")),
    level: emptyToNull(formData.get("level")),
    language: emptyToNull(formData.get("language")),
    kind: (String(formData.get("kind") ?? submission.kind) as "abstract" | "session"),
    capacity: numberOrNull(formData.get("capacity")),
    tags: writeJson(formData.getAll("tags").map(String).filter(Boolean)),
    answers: writeJson(answers),
  };

  const changes = diff(
    {
      title: submission.title,
      description: submission.description,
      track_id: submission.track_id,
      format_id: submission.format_id,
      level: submission.level,
      language: submission.language,
      kind: submission.kind,
      capacity: submission.capacity,
      tags: submission.tags,
      answers: submission.answers,
    },
    patch,
  );

  updateSubmission(submissionId, patch);

  if (changes.keys.length) {
    logAudit({
      eventId: event.id,
      entityType: "submission",
      entityId: submissionId,
      actorUserId: user.id,
      actorName: fullName(user),
      action: "edited",
      summary: `Edited ${changes.keys.join(", ")}`,
      before: changes.before,
      after: changes.after,
    });
  }
  revalidatePath(`/admin/e/${slug}`, "layout");
  revalidatePath(`/e/${slug}`, "layout");
  redirect(`/admin/e/${slug}/submissions/${submissionId}?saved=1`);
}

export async function restoreVersionAction(formData: FormData) {
  const slug = String(formData.get("slug"));
  const { user, event } = await requireOrganizer(slug);
  const submissionId = String(formData.get("id"));
  const entryId = String(formData.get("entry_id"));
  const submission = getSubmission(submissionId);
  const entry = getAudit(entryId);
  if (!submission || submission.event_id !== event.id || !entry) return;

  const before = readJson<Record<string, unknown>>(entry.before, {});
  const restorable: Record<string, unknown> = {};
  for (const key of ["title", "description", "track_id", "format_id", "level", "answers", "tags"]) {
    if (key in before) restorable[key] = before[key];
  }
  if (!Object.keys(restorable).length) return;
  updateSubmission(submissionId, restorable);
  logAudit({
    eventId: event.id,
    entityType: "submission",
    entityId: submissionId,
    actorUserId: user.id,
    actorName: fullName(user),
    action: "restored",
    summary: `Restored the version from ${entry.created_at}`,
    before: readJson(entry.after, {}),
    after: restorable,
  });
  revalidatePath(`/admin/e/${slug}`, "layout");
  revalidatePath(`/e/${slug}`, "layout");
  redirect(`/admin/e/${slug}/submissions/${submissionId}?restored=1`);
}

export async function createSubmissionAction(formData: FormData) {
  const slug = String(formData.get("slug"));
  const { user, event } = await requireOrganizer(slug);
  const kind = String(formData.get("kind") ?? "abstract") as "abstract" | "session";
  const title = String(formData.get("title") ?? "").trim();
  if (!title) redirect(`/admin/e/${slug}/submissions/new?kind=${kind}&error=Title+is+required`);

  const speakerName = String(formData.get("speaker_name") ?? "").trim();
  const speakerEmail = String(formData.get("speaker_email") ?? "").trim();

  const submission = createSubmission(event.id, {
    kind,
    status: (String(formData.get("status") ?? "pending") as never),
    title,
    description: String(formData.get("description") ?? ""),
    track_id: emptyToNull(formData.get("track_id")),
    format_id: emptyToNull(formData.get("format_id")),
    level: emptyToNull(formData.get("level")),
    location_id: emptyToNull(formData.get("location_id")),
    starts_at: normalizeLocal(String(formData.get("starts_at") ?? "")),
    ends_at: normalizeLocal(String(formData.get("ends_at") ?? "")),
    approval_status: "in_review",
  });

  if (speakerEmail) {
    const { first, last } = splitName(speakerName || speakerEmail.split("@")[0]);
    const { contact } = upsertContact(event.org_id, {
      email: speakerEmail,
      first_name: first,
      last_name: last,
      job_title: String(formData.get("speaker_title") ?? "") || null,
      company: String(formData.get("speaker_company") ?? "") || null,
    });
    ensureEventContact(event.id, contact.id, { status: "active" });
    updateSubmission(submission.id, { submitter_contact_id: contact.id });
    addParticipant(submission.id, contact.id, "speaker");
  }

  logAudit({
    eventId: event.id,
    entityType: "submission",
    entityId: submission.id,
    actorUserId: user.id,
    actorName: fullName(user),
    action: "created",
    summary: `Created ${kind} "${title}" manually`,
  });

  if (submission.status === "accepted") {
    onSubmissionAccepted(event, getSubmission(submission.id)!, { id: user.id, name: fullName(user) });
  }

  revalidatePath(`/admin/e/${slug}`, "layout");
  redirect(`/admin/e/${slug}/submissions/${submission.id}`);
}

export async function deleteSubmissionAction(formData: FormData) {
  const slug = String(formData.get("slug"));
  const { user, event } = await requireOrganizer(slug);
  const submissionId = String(formData.get("id"));
  const submission = getSubmission(submissionId);
  if (!submission || submission.event_id !== event.id) return;
  deleteSubmission(submissionId);
  logAudit({
    eventId: event.id,
    entityType: "submission",
    entityId: submissionId,
    actorUserId: user.id,
    actorName: fullName(user),
    action: "deleted",
    summary: `Deleted "${submission.title}"`,
  });
  revalidatePath(`/admin/e/${slug}`, "layout");
  redirect(`/admin/e/${slug}/submissions`);
}

export async function addParticipantAction(formData: FormData) {
  const slug = String(formData.get("slug"));
  const { user, event } = await requireOrganizer(slug);
  const submissionId = String(formData.get("id"));
  const submission = getSubmission(submissionId);
  if (!submission || submission.event_id !== event.id) return;

  const email = String(formData.get("email") ?? "").trim();
  if (!email) return;
  const { first, last } = splitName(String(formData.get("name") ?? "") || email.split("@")[0]);
  const { contact } = upsertContact(event.org_id, {
    email,
    first_name: first,
    last_name: last,
    job_title: String(formData.get("job_title") ?? "") || null,
    company: String(formData.get("company") ?? "") || null,
  });
  ensureEventContact(event.id, contact.id, { status: "active" });
  addParticipant(submissionId, contact.id, String(formData.get("role") ?? "speaker"));
  logAudit({
    eventId: event.id,
    entityType: "submission",
    entityId: submissionId,
    actorUserId: user.id,
    actorName: fullName(user),
    action: "participant_added",
    summary: `Added ${first} ${last} as ${String(formData.get("role") ?? "speaker")}`,
  });
  revalidatePath(`/admin/e/${slug}`, "layout");
}

export async function removeParticipantAction(formData: FormData) {
  const slug = String(formData.get("slug"));
  const { event } = await requireOrganizer(slug);
  const submissionId = String(formData.get("id"));
  const participantId = String(formData.get("participant_id"));
  const submission = getSubmission(submissionId);
  if (!submission || submission.event_id !== event.id) return;
  const owns = listParticipants(submissionId).some((p) => p.id === participantId);
  if (!owns) return;
  removeParticipant(participantId);
  revalidatePath(`/admin/e/${slug}`, "layout");
}

export async function setParticipantRoleAction(formData: FormData) {
  const slug = String(formData.get("slug"));
  const { event } = await requireOrganizer(slug);
  const submissionId = String(formData.get("id"));
  const submission = getSubmission(submissionId);
  if (!submission || submission.event_id !== event.id) return;
  const participantId = String(formData.get("participant_id"));
  if (!listParticipants(submissionId).some((p) => p.id === participantId)) return;
  setParticipantRole(participantId, String(formData.get("role")));
  revalidatePath(`/admin/e/${slug}`, "layout");
}

export async function scheduleSubmissionAction(formData: FormData) {
  const slug = String(formData.get("slug"));
  const { user, event } = await requireOrganizer(slug);
  const submissionId = String(formData.get("id"));
  const submission = getSubmission(submissionId);
  if (!submission || submission.event_id !== event.id) return;

  const date = String(formData.get("date") ?? "").trim();
  const start = String(formData.get("start") ?? "").trim();
  const end = String(formData.get("end") ?? "").trim();
  const roomId = emptyToNull(formData.get("location_id"));

  const startsAt = date && start ? normalizeLocal(`${date}T${start}`) : null;
  const endsAt = date && end ? normalizeLocal(`${date}T${end}`) : null;

  updateSubmission(submissionId, {
    starts_at: startsAt,
    ends_at: endsAt,
    location_id: roomId,
    ics_sequence: submission.ics_sequence + 1,
  });
  logAudit({
    eventId: event.id,
    entityType: "submission",
    entityId: submissionId,
    actorUserId: user.id,
    actorName: fullName(user),
    action: "scheduled",
    summary: startsAt ? `Scheduled for ${startsAt}` : "Removed from the schedule",
    before: { starts_at: submission.starts_at, location_id: submission.location_id },
    after: { starts_at: startsAt, location_id: roomId },
  });
  revalidatePath(`/admin/e/${slug}`, "layout");
}

function emptyToNull(value: FormDataEntryValue | null): string | null {
  const s = value === null ? "" : String(value).trim();
  return s === "" ? null : s;
}

function numberOrNull(value: FormDataEntryValue | null): number | null {
  const s = value === null ? "" : String(value).trim();
  if (!s) return null;
  const n = Number(s);
  return Number.isNaN(n) ? null : n;
}
