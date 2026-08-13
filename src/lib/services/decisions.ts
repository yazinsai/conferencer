import { get } from "../db";
import { nowIso } from "../datetime";
import { ensureEventContact, getContact } from "../repo/contacts";
import type { Event } from "../repo/events";
import { listParticipants, updateSubmission, type Submission } from "../repo/submissions";
import { assignTask, listTasks, taskProgress } from "../repo/tasks";
import { addMembership, findUserByEmail } from "../auth";
import { logAudit } from "../repo/audit";

/**
 * Accepting a submission has to do the whole hand-off automatically (R-DEC-6):
 * activate every participant's event record, grant portal access, and assign the
 * default onboarding tasks. No re-entry anywhere.
 */
export function onSubmissionAccepted(
  event: Event,
  submission: Submission,
  actor?: { id: string; name: string },
) {
  const participants = listParticipants(submission.id).filter((p) => p.role !== "submitter");
  const tasks = listTasks(event.id).filter((t) => t.is_default);

  for (const participant of participants) {
    const contact = getContact(participant.contact_id);
    if (!contact) continue;
    ensureEventContact(event.id, contact.id, { status: "active", speaker_status: "invited" });

    const user = findUserByEmail(contact.email);
    if (user) addMembership(event.id, user.id, "participant");

    for (const task of tasks) {
      assignTask({
        taskId: task.id,
        eventId: event.id,
        contactId: contact.id,
        submissionId: task.target === "submission" ? submission.id : null,
        dueAt: defaultDueDate(event, task.name),
      });
    }
  }

  // Accepted content still needs an editorial pass before it is public (R-TSK-11).
  if (submission.approval_status === "draft") {
    updateSubmission(submission.id, { approval_status: "in_review" });
  }

  logAudit({
    eventId: event.id,
    entityType: "submission",
    entityId: submission.id,
    actorUserId: actor?.id ?? null,
    actorName: actor?.name ?? "System",
    action: "accepted",
    summary: `Accepted "${submission.title}" — ${participants.length} speaker record(s) activated and onboarding tasks assigned`,
  });
}

function defaultDueDate(event: Event, taskName: string): string | null {
  const start = event.starts_at?.slice(0, 10);
  if (!start) return null;
  const offsets: Record<string, number> = {
    "Confirm participation": -41,
    "Upload headshot": -28,
    "Complete bio and profile": -41,
    "Upload final slides": -11,
    "Sign speaker release form": -27,
    "Hotel and travel reservations": -22,
    "Flight reimbursement form": 6,
    "Announce your participation": -17,
    "Invite colleagues with your speaker discount": -17,
  };
  const offset = offsets[taskName] ?? -14;
  const date = new Date(`${start}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + offset);
  return date.toISOString().slice(0, 10);
}

export function onSubmissionDeclined(
  event: Event,
  submission: Submission,
  actor?: { id: string; name: string },
) {
  logAudit({
    eventId: event.id,
    entityType: "submission",
    entityId: submission.id,
    actorUserId: actor?.id ?? null,
    actorName: actor?.name ?? "System",
    action: "declined",
    summary: `Declined "${submission.title}"`,
  });
}

export function speakerReadiness(eventId: string, contactId: string) {
  return taskProgress(eventId, contactId);
}

export function submissionOwnedByContact(submissionId: string, contactId: string): boolean {
  return Boolean(
    get(
      `SELECT 1 FROM submissions s
        WHERE s.id = ?
          AND (s.submitter_contact_id = ?
               OR EXISTS (SELECT 1 FROM submission_participants sp
                           WHERE sp.submission_id = s.id AND sp.contact_id = ?))`,
      submissionId,
      contactId,
      contactId,
    ),
  );
}

export function markNotified(submissionId: string, status: string) {
  updateSubmission(submissionId, { notified_at: nowIso(), notified_status: status });
}
