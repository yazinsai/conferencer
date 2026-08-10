"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireOrganizer } from "@/lib/guards";
import { fullName } from "@/lib/auth";
import { formatEventDates, formatRange } from "@/lib/datetime";
import { appUrl, sendEmail } from "@/lib/email";
import { renderMerge } from "@/lib/merge";
import { logAudit } from "@/lib/repo/audit";
import { contactName, getContact } from "@/lib/repo/contacts";
import { getTemplate, getTemplateById, updateTemplate } from "@/lib/repo/emails";
import {
  getSubmissionRow,
  listParticipants,
  listSubmissions,
} from "@/lib/repo/submissions";
import { markNotified } from "@/lib/services/decisions";

async function ctx(formData: FormData) {
  const slug = String(formData.get("slug"));
  const auth = await requireOrganizer(slug);
  return { slug, ...auth };
}

export async function saveTemplateAction(formData: FormData) {
  const { slug, event } = await ctx(formData);
  const template = getTemplateById(String(formData.get("template_id")));
  if (!template || template.event_id !== event.id) return;
  updateTemplate(template.id, {
    subject: String(formData.get("subject") ?? template.subject),
    body_html: String(formData.get("body_html") ?? template.body_html),
    is_enabled: Boolean(formData.get("is_enabled")),
  });
  revalidatePath(`/admin/e/${slug}/emails/templates`);
  redirect(`/admin/e/${slug}/emails/templates?saved=${template.key}`);
}

/**
 * Send decisions (R-DEC-3). Recipient set is "all accepted", "all declined" or a
 * manual selection; every message lands in the outbox and marks the submission
 * Notified.
 */
export async function sendDecisionsAction(formData: FormData) {
  const { slug, event, user } = await ctx(formData);
  const audience = String(formData.get("audience") ?? "manual");
  const note = String(formData.get("note") ?? "").trim();
  const subjectOverride = String(formData.get("subject") ?? "").trim();
  const bodyOverride = String(formData.get("body") ?? "").trim();

  let ids = formData.getAll("submission_ids").map(String).filter(Boolean);
  if (audience === "accepted") {
    ids = listSubmissions(event.id, { status: "accepted", limit: 1000 }).map((s) => s.id);
  } else if (audience === "declined") {
    ids = listSubmissions(event.id, { status: "declined", limit: 1000 }).map((s) => s.id);
  }

  let sent = 0;
  for (const submissionId of ids) {
    const submission = getSubmissionRow(submissionId);
    if (!submission || submission.event_id !== event.id) continue;
    const accepted = submission.status === "accepted";
    const templateKey = accepted ? "decision_accepted" : "decision_declined";
    const template = getTemplate(event.id, templateKey);
    const recipients = listParticipants(submission.id).filter((p) => p.role !== "submitter");
    const targets = recipients.length
      ? recipients
      : submission.submitter_contact_id
        ? listParticipants(submission.id)
        : [];

    for (const participant of targets) {
      const contact = getContact(participant.contact_id);
      if (!contact?.email) continue;
      const context = {
        speaker_name: contactName(contact),
        first_name: contact.first_name,
        last_name: contact.last_name,
        talk_title: submission.title,
        event_name: event.name,
        event_dates: formatEventDates(event.starts_at, event.ends_at),
        event_location: event.location ?? "",
        track: submission.track_name ?? "",
        format: submission.format_name ?? "",
        room: submission.room_name ?? "",
        session_time: submission.starts_at
          ? formatRange(submission.starts_at, submission.ends_at)
          : "",
        decision: accepted ? "Accepted" : "Declined",
        portal_link: appUrl("/portal"),
        organizer_name: fullName(user),
      };
      const subject = renderMerge(
        subjectOverride || template?.subject || "An update on your submission",
        context,
      );
      let body = renderMerge(bodyOverride || template?.body_html || "", context);
      if (note) body += `\n<hr />\n<div>${note}</div>`;

      await sendEmail({
        eventId: event.id,
        to: contact.email,
        toName: contactName(contact),
        contactId: contact.id,
        subject,
        body,
        templateKey,
        kind: "manual",
      });
      sent += 1;
    }
    markNotified(submission.id, submission.status);
  }

  logAudit({
    eventId: event.id,
    entityType: "event",
    entityId: event.id,
    actorUserId: user.id,
    actorName: fullName(user),
    action: "decisions_sent",
    summary: `Sent ${sent} decision email(s) across ${ids.length} submission(s)`,
  });

  revalidatePath(`/admin/e/${slug}`, "layout");
  revalidatePath("/portal", "layout");
  redirect(`/admin/e/${slug}/emails?sent=${sent}&decisions=${ids.length}`);
}
