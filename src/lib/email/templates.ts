import { eq } from "drizzle-orm";
import type { getDb } from "@/lib/db";
import { schema } from "@/lib/db";
import { id } from "@/lib/id";

export type EmailTemplateDef = {
  key: string;
  subject: string;
  bodyHtml: string;
};

export const DEFAULT_EMAIL_TEMPLATES: EmailTemplateDef[] = [
  {
    key: "submission_confirmation",
    subject: "We received your submission to {event_name}",
    bodyHtml:
      "<p>Hi {speaker_name},</p><p>Thanks for submitting <strong>{talk_title}</strong> to {event_name}. We'll be in touch.</p>",
  },
  {
    key: "submission_admin_alert",
    subject: "New submission: {talk_title}",
    bodyHtml:
      "<p>A new submission arrived for {event_name}: <strong>{talk_title}</strong> by {speaker_name}.</p>",
  },
  {
    key: "decision_accepted",
    subject: "Your talk has been accepted to {event_name}",
    bodyHtml:
      "<p>Hi {speaker_name}, congratulations! Your session '{talk_title}' has been accepted. Please confirm your participation and complete your speaker profile.</p><p>Portal: {portal_link}</p>",
  },
  {
    key: "decision_declined",
    subject: "Update on your {event_name} submission",
    bodyHtml:
      "<p>Hi {speaker_name}, thank you for submitting '{talk_title}'. Unfortunately we are unable to accept it this year.</p>",
  },
  {
    key: "portal_invite",
    subject: "Your {event_name} speaker portal is ready",
    bodyHtml:
      "<p>Hi {first_name}, open your portal to complete onboarding tasks: {portal_link}</p>",
  },
  {
    key: "task_assigned",
    subject: "New task for {event_name}: due {due_date}",
    bodyHtml:
      "<p>Hi {speaker_name}, you have a new task. Due: {due_date}. Portal: {portal_link}</p>",
  },
  {
    key: "task_reminder",
    subject: "Reminder: outstanding tasks for {event_name}",
    bodyHtml:
      "<p>Hi {speaker_name}, you still have outstanding onboarding tasks. Portal: {portal_link}</p>",
  },
  {
    key: "draft_deadline_reminder",
    subject: "CFP closes soon for {event_name}",
    bodyHtml:
      "<p>Hi {speaker_name}, the call for speakers closes soon. Finish your draft in the portal.</p>",
  },
  {
    key: "evaluation_invite",
    subject: "You have reviews waiting for {event_name}",
    bodyHtml: "<p>Hi {first_name}, please complete your assigned reviews for {event_name}.</p>",
  },
  {
    key: "evaluation_reminder",
    subject: "Reminder: outstanding reviews for {event_name}",
    bodyHtml: "<p>Hi {first_name}, you still have outstanding reviews.</p>",
  },
  {
    key: "speaker_announcement",
    subject: "Announcement from {event_name}",
    bodyHtml: "<p>Hi {speaker_name},</p><p>{event_name} update.</p>",
  },
];

export function seedEmailTemplatesForEvent(
  db: ReturnType<typeof getDb>,
  eventId: string,
) {
  const existing = db
    .select({ key: schema.emailTemplates.key })
    .from(schema.emailTemplates)
    .where(eq(schema.emailTemplates.eventId, eventId))
    .all();
  const existingKeys = new Set(existing.map((r) => r.key));

  for (const tpl of DEFAULT_EMAIL_TEMPLATES) {
    if (existingKeys.has(tpl.key)) continue;
    db.insert(schema.emailTemplates)
      .values({
        id: id("et"),
        eventId,
        key: tpl.key,
        subject: tpl.subject,
        bodyHtml: tpl.bodyHtml,
        isEnabled: true,
      })
      .run();
  }
}

export const SAMPLE_MERGE_FIELDS = {
  speaker_name: "Priya Raman",
  first_name: "Priya",
  event_name: "DevFlow Conf 2027",
  talk_title: "Building Reliable Event Platforms",
  portal_link: "https://example.com/portal",
  due_date: "May 1, 2027",
} as const;
