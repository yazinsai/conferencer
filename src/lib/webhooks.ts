import { createHmac } from "node:crypto";

import { all, readJson, run } from "./db";
import { id, token } from "./ids";
import { nowIso } from "./datetime";

export const WEBHOOK_EVENTS = [
  "submission.created",
  "submission.status_changed",
  "task.completed",
  "session.scheduled",
] as const;

export type WebhookEvent = (typeof WEBHOOK_EVENTS)[number];

/** Human labels for configuration UI; submitted values remain the identifiers above. */
export const WEBHOOK_EVENT_LABELS: Record<WebhookEvent, string> = {
  "submission.created": "Submission created",
  "submission.status_changed": "Submission status changed",
  "task.completed": "Task completed",
  "session.scheduled": "Session scheduled",
};

export type Webhook = {
  id: string;
  event_id: string;
  url: string;
  secret: string;
  events: string;
  is_active: number;
  last_status: string | null;
  last_sent_at: string | null;
  created_at: string;
};

export function listWebhooks(eventId: string): Webhook[] {
  return all<Webhook>(
    "SELECT * FROM webhooks WHERE event_id = ? ORDER BY created_at",
    eventId,
  );
}

export function createWebhook(eventId: string, url: string, events: string[]): Webhook {
  const rowId = id();
  run(
    "INSERT INTO webhooks (id, event_id, url, secret, events, is_active, created_at) VALUES (?,?,?,?,?,1,?)",
    rowId,
    eventId,
    url,
    `whsec_${token().slice(0, 32)}`,
    JSON.stringify(events.length ? events : WEBHOOK_EVENTS),
    nowIso(),
  );
  return listWebhooks(eventId).find((row) => row.id === rowId)!;
}

export function deleteWebhook(webhookId: string) {
  run("DELETE FROM webhooks WHERE id = ?", webhookId);
}

export function toggleWebhook(webhookId: string, active: boolean) {
  run("UPDATE webhooks SET is_active = ? WHERE id = ?", active ? 1 : 0, webhookId);
}

/**
 * Fire-and-forget delivery (R-API-7). Each request carries an HMAC-SHA256
 * signature of the raw body in `X-Conferencer-Signature` so the receiver can
 * verify it. Failures are recorded, never thrown — a broken endpoint must not
 * break a submission.
 */
export async function emitWebhook(
  eventId: string,
  type: WebhookEvent,
  payload: Record<string, unknown>,
): Promise<void> {
  const hooks = listWebhooks(eventId).filter(
    (hook) => hook.is_active && readJson<string[]>(hook.events, []).includes(type),
  );
  if (!hooks.length) return;

  const body = JSON.stringify({
    type,
    event_id: eventId,
    created_at: nowIso(),
    data: payload,
  });

  await Promise.all(
    hooks.map(async (hook) => {
      const signature = createHmac("sha256", hook.secret).update(body).digest("hex");
      try {
        const response = await fetch(hook.url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Conferencer-Event": type,
            "X-Conferencer-Signature": `sha256=${signature}`,
          },
          body,
          signal: AbortSignal.timeout(5000),
        });
        run(
          "UPDATE webhooks SET last_status = ?, last_sent_at = ? WHERE id = ?",
          String(response.status),
          nowIso(),
          hook.id,
        );
      } catch (error) {
        run(
          "UPDATE webhooks SET last_status = ?, last_sent_at = ? WHERE id = ?",
          error instanceof Error ? error.message.slice(0, 120) : "failed",
          nowIso(),
          hook.id,
        );
      }
    }),
  );
}
