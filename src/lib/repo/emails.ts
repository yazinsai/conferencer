import { all, get, run } from "../db";
import { id } from "../ids";
import { nowIso } from "../datetime";
import { renderMerge, type MergeContext } from "../merge";

export type EmailTemplate = {
  id: string;
  event_id: string;
  key: string;
  name: string;
  subject: string;
  body_html: string;
  is_enabled: number;
  created_at: string;
  updated_at: string;
};

export type EmailMessage = {
  id: string;
  event_id: string;
  to_email: string;
  to_name: string | null;
  to_contact_id: string | null;
  subject: string;
  body_html: string;
  body_text: string | null;
  template_key: string | null;
  kind: string;
  status: string;
  provider_id: string | null;
  error: string | null;
  attachments: string;
  sent_at: string | null;
  created_at: string;
};

export type TemplateSeed = {
  key: string;
  name: string;
  subject: string;
  body: string;
};

/** The 11 seeded templates from R-COM (§4 EmailTemplate). */
export const TEMPLATE_SEEDS: TemplateSeed[] = [
  {
    key: "submission_confirmation",
    name: "Submission received",
    subject: "We received your submission to {event_name}",
    body: `<p>Hi {first_name},</p>
<p>Thanks for submitting <strong>{talk_title}</strong> to {event_name} ({event_dates}).</p>
<p>Our program committee reviews every proposal and we will be in touch with a decision. You can review or edit your submission any time from your speaker portal:</p>
<p><a href="{portal_link}">Open your speaker portal</a></p>
<p>— The {event_name} program team</p>`,
  },
  {
    key: "submission_admin_alert",
    name: "New submission (admin alert)",
    subject: "New submission: {talk_title}",
    body: `<p>{speaker_name} submitted <strong>{talk_title}</strong> to the {track} track.</p>
<p>Review it in the organizer dashboard.</p>`,
  },
  {
    key: "decision_accepted",
    name: "Decision — accepted",
    subject: "Your talk has been accepted to {event_name}",
    body: `<p>Hi {speaker_name}, congratulations!</p>
<p>Your session '<strong>{talk_title}</strong>' has been accepted for the {track} track at {event_name}.</p>
<p>Please confirm your participation and complete your speaker profile in your portal:</p>
<p><a href="{portal_link}">Open your speaker portal</a></p>
<p>— {organizer_name}</p>`,
  },
  {
    key: "decision_declined",
    name: "Decision — declined",
    subject: "An update on your {event_name} submission",
    body: `<p>Hi {speaker_name},</p>
<p>Thank you for submitting '<strong>{talk_title}</strong>' to {event_name}. We received far more strong proposals than we have slots, and this one was not selected for the programme this year.</p>
<p>We would genuinely welcome a proposal from you next time.</p>
<p>— {organizer_name}</p>`,
  },
  {
    key: "portal_invite",
    name: "Speaker portal invitation",
    subject: "Your {event_name} speaker portal",
    body: `<p>Hi {first_name},</p>
<p>Your speaker portal for {event_name} is ready. It is where you complete your profile, upload your materials and track your onboarding tasks.</p>
<p><a href="{portal_link}">Open your speaker portal</a></p>`,
  },
  {
    key: "task_assigned",
    name: "Task assigned",
    subject: "New task for {event_name}: {task_name}",
    body: `<p>Hi {first_name},</p>
<p>A new task has been added to your speaker checklist: <strong>{task_name}</strong>, due {due_date}.</p>
<p><a href="{portal_link}">Complete it in your portal</a></p>`,
  },
  {
    key: "task_reminder",
    name: "Task reminder",
    subject: "Reminder: {task_name} is due {due_date}",
    body: `<p>Hi {first_name},</p>
<p>This is a friendly reminder that <strong>{task_name}</strong> is due {due_date} and is still outstanding.</p>
<p><a href="{portal_link}">Complete it in your portal</a></p>`,
  },
  {
    key: "draft_deadline_reminder",
    name: "Draft deadline reminder",
    subject: "Your {event_name} draft is not submitted yet",
    body: `<p>Hi {first_name},</p>
<p>You have a draft submission for {event_name} that has not been submitted. The call for speakers closes {due_date}.</p>
<p><a href="{portal_link}">Finish your submission</a></p>`,
  },
  {
    key: "evaluation_invite",
    name: "Evaluation invitation",
    subject: "You are reviewing for {event_name}",
    body: `<p>Hi {first_name},</p>
<p>You have been added to the review committee for {event_name}. Your queue is ready.</p>
<p><a href="{portal_link}">Open the review area</a></p>`,
  },
  {
    key: "evaluation_reminder",
    name: "Evaluation reminder",
    subject: "Reviews still outstanding for {event_name}",
    body: `<p>Hi {first_name},</p>
<p>You still have submissions waiting for your review at {event_name}. Reviews close {due_date}.</p>
<p><a href="{portal_link}">Open the review area</a></p>`,
  },
  {
    key: "speaker_announcement",
    name: "Speaker announcement",
    subject: "Welcome to {event_name} speakers",
    body: `<p>Hi {first_name},</p>
<p>Welcome to the {event_name} speaker line-up. Here is everything you need to know ahead of {event_dates} at {event_location}.</p>
<p><a href="{portal_link}">Open your speaker portal</a></p>`,
  },
  {
    key: "calendar_invite",
    name: "Session calendar invite",
    subject: "Calendar invite: {talk_title} at {event_name}",
    body: `<p>Hi {first_name},</p>
<p>Your session <strong>{talk_title}</strong> is scheduled for {session_time} in {room}.</p>
<p>A calendar invitation is attached. You can also add it directly:</p>`,
  },
];

export function ensureTemplates(eventId: string) {
  for (const seed of TEMPLATE_SEEDS) {
    const existing = get(
      "SELECT id FROM email_templates WHERE event_id = ? AND key = ?",
      eventId,
      seed.key,
    );
    if (existing) continue;
    run(
      `INSERT INTO email_templates (id, event_id, key, name, subject, body_html, is_enabled, created_at, updated_at)
       VALUES (?,?,?,?,?,?,1,?,?)`,
      id(),
      eventId,
      seed.key,
      seed.name,
      seed.subject,
      seed.body,
      nowIso(),
      nowIso(),
    );
  }
}

export function listTemplates(eventId: string): EmailTemplate[] {
  return all<EmailTemplate>(
    "SELECT * FROM email_templates WHERE event_id = ? ORDER BY name",
    eventId,
  );
}

export function getTemplate(eventId: string, key: string): EmailTemplate | undefined {
  return get<EmailTemplate>(
    "SELECT * FROM email_templates WHERE event_id = ? AND key = ?",
    eventId,
    key,
  );
}

export function getTemplateById(templateId: string): EmailTemplate | undefined {
  return get<EmailTemplate>("SELECT * FROM email_templates WHERE id = ?", templateId);
}

export function updateTemplate(
  templateId: string,
  patch: { subject?: string; body_html?: string; is_enabled?: boolean; name?: string },
) {
  const sets: string[] = [];
  const params: unknown[] = [];
  if (patch.subject !== undefined) {
    sets.push("subject = ?");
    params.push(patch.subject);
  }
  if (patch.body_html !== undefined) {
    sets.push("body_html = ?");
    params.push(patch.body_html);
  }
  if (patch.name !== undefined) {
    sets.push("name = ?");
    params.push(patch.name);
  }
  if (patch.is_enabled !== undefined) {
    sets.push("is_enabled = ?");
    params.push(patch.is_enabled ? 1 : 0);
  }
  if (!sets.length) return;
  sets.push("updated_at = ?");
  params.push(nowIso(), templateId);
  run(`UPDATE email_templates SET ${sets.join(", ")} WHERE id = ?`, ...params);
}

export function renderTemplate(
  template: Pick<EmailTemplate, "subject" | "body_html">,
  context: MergeContext,
) {
  return {
    subject: renderMerge(template.subject, context),
    body: renderMerge(template.body_html, context),
  };
}

/* -------------------------------------------------------------- messages -- */

export function listMessages(
  eventId: string,
  opts: { q?: string; templateKey?: string; contactId?: string; limit?: number } = {},
): EmailMessage[] {
  const where = ["event_id = ?"];
  const params: unknown[] = [eventId];
  if (opts.q) {
    where.push("(to_email LIKE ? OR subject LIKE ? OR to_name LIKE ?)");
    const like = `%${opts.q}%`;
    params.push(like, like, like);
  }
  if (opts.templateKey) {
    where.push("template_key = ?");
    params.push(opts.templateKey);
  }
  if (opts.contactId) {
    where.push("to_contact_id = ?");
    params.push(opts.contactId);
  }
  return all<EmailMessage>(
    `SELECT * FROM email_messages WHERE ${where.join(" AND ")}
      ORDER BY created_at DESC LIMIT ?`,
    ...params,
    opts.limit ?? 300,
  );
}

export function getMessage(messageId: string): EmailMessage | undefined {
  return get<EmailMessage>("SELECT * FROM email_messages WHERE id = ?", messageId);
}

export function countMessages(eventId: string): number {
  return (
    get<{ n: number }>("SELECT COUNT(*) AS n FROM email_messages WHERE event_id = ?", eventId)
      ?.n ?? 0
  );
}
