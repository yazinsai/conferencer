import { get, run } from "./db";
import { id } from "./ids";
import { nowIso } from "./datetime";
import { renderMerge, type MergeContext } from "./merge";
import { publicUrl } from "./public-url";
import { getTemplate } from "./repo/emails";
import { stripHtml } from "./fields";

export type Attachment = {
  filename: string;
  contentType: string;
  content: string; // utf8 for .ics
};

export type SendInput = {
  eventId: string;
  to: string;
  toName?: string | null;
  contactId?: string | null;
  subject: string;
  body: string;
  templateKey?: string | null;
  kind?: "auto" | "manual";
  attachments?: Attachment[];
};

export function appUrl(path = ""): string {
  return publicUrl(path);
}

/**
 * Every send writes an EmailMessage row first, then tries the provider.
 * Missing credentials must never break the product (R-COM-1) — the outbox at
 * /admin/e/:slug/emails is the observable record (R-EVAL-6).
 */
export async function sendEmail(input: SendInput): Promise<string> {
  const messageId = id();
  const attachments = input.attachments ?? [];
  run(
    `INSERT INTO email_messages (id, event_id, to_email, to_name, to_contact_id, subject,
        body_html, body_text, template_key, kind, status, attachments, created_at)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    messageId,
    input.eventId,
    input.to,
    input.toName ?? null,
    input.contactId ?? null,
    input.subject,
    input.body,
    stripHtml(input.body),
    input.templateKey ?? null,
    input.kind ?? "auto",
    "queued",
    JSON.stringify(attachments.map((a) => ({ filename: a.filename, contentType: a.contentType }))),
    nowIso(),
  );

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    // No provider configured: mark as sent-to-outbox so the UI reads truthfully.
    run(
      "UPDATE email_messages SET status = 'sent', sent_at = ?, provider_id = 'outbox' WHERE id = ?",
      nowIso(),
      messageId,
    );
    return messageId;
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM ?? "Conferencer <onboarding@resend.dev>",
        to: [input.to],
        subject: input.subject,
        html: input.body,
        attachments: attachments.map((a) => ({
          filename: a.filename,
          content: Buffer.from(a.content, "utf8").toString("base64"),
        })),
      }),
    });
    if (!response.ok) throw new Error(`Resend responded ${response.status}`);
    const data = (await response.json()) as { id?: string };
    run(
      "UPDATE email_messages SET status = 'sent', sent_at = ?, provider_id = ? WHERE id = ?",
      nowIso(),
      data.id ?? null,
      messageId,
    );
  } catch (error) {
    run(
      "UPDATE email_messages SET status = 'failed', error = ? WHERE id = ?",
      error instanceof Error ? error.message : String(error),
      messageId,
    );
  }
  return messageId;
}

/** Send using a stored template, honouring its enabled flag. */
export async function sendTemplate(input: {
  eventId: string;
  templateKey: string;
  to: string;
  toName?: string | null;
  contactId?: string | null;
  context: MergeContext;
  extraNote?: string | null;
  attachments?: Attachment[];
  kind?: "auto" | "manual";
  force?: boolean;
}): Promise<string | null> {
  const template = getTemplate(input.eventId, input.templateKey);
  if (!template) return null;
  if (!template.is_enabled && !input.force) return null;
  const subject = renderMerge(template.subject, input.context);
  let body = renderMerge(template.body_html, input.context);
  if (input.extraNote) {
    body += `\n<hr />\n<div>${input.extraNote}</div>`;
  }
  return sendEmail({
    eventId: input.eventId,
    to: input.to,
    toName: input.toName,
    contactId: input.contactId,
    subject,
    body,
    templateKey: input.templateKey,
    kind: input.kind ?? "auto",
    attachments: input.attachments,
  });
}

export function adminEmails(eventId: string, userIds: string[]): Array<{ email: string; name: string }> {
  if (!userIds.length) return [];
  const placeholders = userIds.map(() => "?").join(",");
  const rows = get<{ list: string }>(
    `SELECT GROUP_CONCAT(u.email || '|' || u.first_name || ' ' || u.last_name, ';;') AS list
       FROM users u
       JOIN event_memberships m ON m.user_id = u.id AND m.event_id = ? AND m.role = 'organizer'
      WHERE u.id IN (${placeholders})`,
    eventId,
    ...userIds,
  );
  if (!rows?.list) return [];
  return rows.list.split(";;").map((entry) => {
    const [email, name] = entry.split("|");
    return { email, name: (name ?? "").trim() };
  });
}
