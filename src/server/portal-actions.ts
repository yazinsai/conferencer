"use server";

import { revalidatePath } from "next/cache";
import { forbidden, redirect } from "next/navigation";

import { requirePortalUser } from "@/lib/guards";
import { fullName } from "@/lib/auth";
import { writeJson } from "@/lib/db";
import { nowIso } from "@/lib/datetime";
import { logAudit } from "@/lib/repo/audit";
import { contactName, linkContactToUser, portalContact, updateContact } from "@/lib/repo/contacts";
import {
  getSubmission,
  listParticipants,
  setParticipantAcceptance,
  updateSubmission,
} from "@/lib/repo/submissions";
import {
  getAssignment,
  setAssignmentStatus,
  updateAssignment,
} from "@/lib/repo/tasks";
import { addComment, storeUpload, uploadProblem } from "@/lib/repo/uploads";
import { stripHtml } from "@/lib/fields";

async function me() {
  const { user, event } = await requirePortalUser();
  const contact = portalContact(event, user) ?? linkContactToUser(event, user);
  return { user, event, contact };
}

export async function saveProfileAction(formData: FormData) {
  const { user, event, contact } = await me();

  const biography = String(formData.get("biography") ?? "");
  if (stripHtml(biography).length > 5000) {
    redirect("/portal/profile?error=Biography+must+be+5000+characters+or+fewer");
  }

  updateContact(contact.id, {
    first_name: String(formData.get("first_name") ?? contact.first_name),
    last_name: String(formData.get("last_name") ?? contact.last_name),
    salutation: String(formData.get("salutation") ?? "") || null,
    honorific: String(formData.get("honorific") ?? "") || null,
    pronouns: String(formData.get("pronouns") ?? "") || null,
    gender: String(formData.get("gender") ?? "") || null,
    job_title: String(formData.get("job_title") ?? "") || null,
    company: String(formData.get("company") ?? "") || null,
    phone: String(formData.get("phone") ?? "") || null,
    biography,
    linkedin_url: String(formData.get("linkedin_url") ?? "") || null,
    twitter_url: String(formData.get("twitter_url") ?? "") || null,
    facebook_url: String(formData.get("facebook_url") ?? "") || null,
    website_url: String(formData.get("website_url") ?? "") || null,
    dietary: String(formData.get("dietary") ?? "") || null,
    tshirt_size: String(formData.get("tshirt_size") ?? "") || null,
    travel_notes: String(formData.get("travel_notes") ?? "") || null,
  });

  const file = formData.get("headshot");
  if (file instanceof File && file.size > 0) {
    const problem = uploadProblem(
      { name: file.name, size: file.size },
      ".png,.jpg,.jpeg,.webp,.gif,.svg",
    );
    if (problem) redirect(`/portal/profile?error=${encodeURIComponent(problem)}`);
    const upload = await storeUpload({
      eventId: event.id,
      file,
      kind: "headshot",
      contactId: contact.id,
      userId: user.id,
      isPublic: true,
    });
    updateContact(contact.id, { headshot_url: `/f/${upload.id}` });
  }

  logAudit({
    eventId: event.id,
    entityType: "contact",
    entityId: contact.id,
    actorUserId: user.id,
    actorName: fullName(user),
    action: "profile_updated",
    summary: "Speaker updated their profile in the portal",
  });

  revalidatePath("/portal", "layout");
  revalidatePath(`/admin/e/${event.slug}`, "layout");
  revalidatePath(`/e/${event.slug}`, "layout");
  redirect("/portal/profile?saved=1");
}

export async function completeTaskAction(formData: FormData) {
  const { user, event, contact } = await me();
  const assignmentId = String(formData.get("assignment_id"));
  const assignment = getAssignment(assignmentId);
  if (!assignment || assignment.event_id !== event.id || assignment.contact_id !== contact.id) {
    forbidden();
  }
  const status = String(formData.get("status") ?? "complete");
  setAssignmentStatus(assignmentId, status);
  if (status === "complete") {
    const { emitWebhook } = await import("@/lib/webhooks");
    await emitWebhook(event.id, "task.completed", {
      assignment_id: assignmentId,
      task: assignment.task_name,
      contact: contact.email,
    });
  }
  logAudit({
    eventId: event.id,
    entityType: "task_assignment",
    entityId: assignmentId,
    actorUserId: user.id,
    actorName: fullName(user),
    action: status === "complete" ? "completed" : "reopened",
    summary: `${contactName(contact)} marked "${assignment.task_name}" ${status}`,
  });
  revalidatePath("/portal", "layout");
  revalidatePath(`/admin/e/${event.slug}`, "layout");
}

export async function submitTaskFormAction(formData: FormData) {
  const { user, event, contact } = await me();
  const assignmentId = String(formData.get("assignment_id"));
  const assignment = getAssignment(assignmentId);
  if (!assignment || assignment.event_id !== event.id || assignment.contact_id !== contact.id) {
    forbidden();
  }
  const response: Record<string, string> = {};
  for (const [key, value] of formData.entries()) {
    if (key.startsWith("field_")) response[key.slice("field_".length)] = String(value);
  }
  setAssignmentStatus(assignmentId, "complete", { response: writeJson(response) });
  logAudit({
    eventId: event.id,
    entityType: "task_assignment",
    entityId: assignmentId,
    actorUserId: user.id,
    actorName: fullName(user),
    action: "form_submitted",
    summary: `${contactName(contact)} completed the form "${assignment.task_name}"`,
  });
  revalidatePath("/portal", "layout");
  revalidatePath(`/admin/e/${event.slug}`, "layout");
  redirect(`/portal/tasks/${assignmentId}?saved=1`);
}

export async function uploadTaskFileAction(formData: FormData) {
  const { user, event, contact } = await me();
  const assignmentId = String(formData.get("assignment_id"));
  const assignment = getAssignment(assignmentId);
  if (!assignment || assignment.event_id !== event.id || assignment.contact_id !== contact.id) {
    forbidden();
  }
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    redirect(`/portal/tasks/${assignmentId}?error=Choose+a+file+to+upload`);
  }
  const problem = uploadProblem({ name: file.name, size: file.size }, assignment.accepted_types);
  if (problem) redirect(`/portal/tasks/${assignmentId}?error=${encodeURIComponent(problem)}`);

  await storeUpload({
    eventId: event.id,
    file,
    kind: "deliverable",
    taskAssignmentId: assignmentId,
    submissionId: assignment.submission_id,
    contactId: contact.id,
    userId: user.id,
  });
  setAssignmentStatus(assignmentId, "complete");
  logAudit({
    eventId: event.id,
    entityType: "task_assignment",
    entityId: assignmentId,
    actorUserId: user.id,
    actorName: fullName(user),
    action: "file_uploaded",
    summary: `${contactName(contact)} uploaded ${file.name} for "${assignment.task_name}"`,
  });
  revalidatePath("/portal", "layout");
  revalidatePath(`/admin/e/${event.slug}`, "layout");
  redirect(`/portal/tasks/${assignmentId}?uploaded=1`);
}

export async function commentOnFileAction(formData: FormData) {
  const { user, event, contact } = await me();
  const uploadId = String(formData.get("upload_id"));
  const assignmentId = String(formData.get("assignment_id"));
  const assignment = getAssignment(assignmentId);
  if (!assignment || assignment.event_id !== event.id || assignment.contact_id !== contact.id) {
    forbidden();
  }
  const body = String(formData.get("body") ?? "").trim();
  if (!body) return;
  addComment({ uploadId, authorUserId: user.id, authorName: contactName(contact), body });
  revalidatePath("/portal", "layout");
  revalidatePath(`/admin/e/${event.slug}`, "layout");
}

export async function confirmParticipationAction(formData: FormData) {
  const { user, event, contact } = await me();
  const participantId = String(formData.get("participant_id"));
  const decision = String(formData.get("decision") ?? "accepted");
  const submissionId = String(formData.get("submission_id"));
  const submission = getSubmission(submissionId);
  if (!submission || submission.event_id !== event.id) forbidden();
  const participant = listParticipants(submissionId).find(
    (p) => p.id === participantId && p.contact_id === contact.id,
  );
  if (!participant) forbidden();

  setParticipantAcceptance(participantId, decision);
  logAudit({
    eventId: event.id,
    entityType: "submission",
    entityId: submissionId,
    actorUserId: user.id,
    actorName: fullName(user),
    action: "participation_" + decision,
    summary: `${contactName(contact)} ${decision} their ${participant.role} role`,
  });
  revalidatePath("/portal", "layout");
  revalidatePath(`/admin/e/${event.slug}`, "layout");
}

export async function withdrawSubmissionAction(formData: FormData) {
  const { user, event, contact } = await me();
  if (!event.allow_withdrawal) forbidden();
  const submissionId = String(formData.get("submission_id"));
  const submission = getSubmission(submissionId);
  if (!submission || submission.event_id !== event.id) forbidden();
  const owns =
    submission.submitter_contact_id === contact.id ||
    listParticipants(submissionId).some((p) => p.contact_id === contact.id);
  if (!owns) forbidden();

  updateSubmission(submissionId, {
    status: "withdrawn",
    withdrawn_at: nowIso(),
    withdraw_reason: String(formData.get("reason") ?? "") || null,
  });
  logAudit({
    eventId: event.id,
    entityType: "submission",
    entityId: submissionId,
    actorUserId: user.id,
    actorName: fullName(user),
    action: "withdrawn",
    summary: `${contactName(contact)} withdrew "${submission.title}": ${
      String(formData.get("reason") ?? "") || "no reason given"
    }`,
  });
  revalidatePath("/portal", "layout");
  revalidatePath(`/admin/e/${event.slug}`, "layout");
  revalidatePath(`/e/${event.slug}`, "layout");
  redirect("/portal/submissions?withdrawn=1");
}

export async function extendDueDateAction(formData: FormData) {
  // Organizer-only helper kept here so the deliverables view can reuse it.
  const { event } = await requirePortalUser();
  const assignmentId = String(formData.get("assignment_id"));
  updateAssignment(assignmentId, {
    extended_due_at: String(formData.get("extended_due_at") ?? "") || null,
  });
  revalidatePath(`/admin/e/${event.slug}`, "layout");
}
