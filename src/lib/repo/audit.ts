import { all, get, run } from "../db";
import { id } from "../ids";
import { nowIso } from "../datetime";

export type AuditEntry = {
  id: string;
  event_id: string | null;
  entity_type: string;
  entity_id: string;
  actor_user_id: string | null;
  actor_name: string;
  action: string;
  summary: string | null;
  before: string | null;
  after: string | null;
  created_at: string;
};

export function logAudit(input: {
  eventId: string | null;
  entityType: string;
  entityId: string;
  actorUserId?: string | null;
  actorName?: string;
  action: string;
  summary?: string | null;
  before?: unknown;
  after?: unknown;
}): void {
  run(
    `INSERT INTO audit_entries (id, event_id, entity_type, entity_id, actor_user_id, actor_name,
        action, summary, before, after, created_at)
     VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
    id(),
    input.eventId,
    input.entityType,
    input.entityId,
    input.actorUserId ?? null,
    input.actorName ?? "System",
    input.action,
    input.summary ?? null,
    input.before === undefined ? null : JSON.stringify(input.before),
    input.after === undefined ? null : JSON.stringify(input.after),
    nowIso(),
  );
}

export function historyFor(entityType: string, entityId: string, limit = 50): AuditEntry[] {
  return all<AuditEntry>(
    `SELECT * FROM audit_entries WHERE entity_type = ? AND entity_id = ?
      ORDER BY created_at DESC LIMIT ?`,
    entityType,
    entityId,
    limit,
  );
}

export function getAudit(entryId: string): AuditEntry | undefined {
  return get<AuditEntry>("SELECT * FROM audit_entries WHERE id = ?", entryId);
}

export function recentActivity(eventId: string, limit = 25): AuditEntry[] {
  return all<AuditEntry>(
    "SELECT * FROM audit_entries WHERE event_id = ? ORDER BY created_at DESC LIMIT ?",
    eventId,
    limit,
  );
}

/** Diff two shallow records, ignoring unchanged keys. */
export function diff(
  before: Record<string, unknown>,
  after: Record<string, unknown>,
): { before: Record<string, unknown>; after: Record<string, unknown>; keys: string[] } {
  const keys = new Set([...Object.keys(before), ...Object.keys(after)]);
  const b: Record<string, unknown> = {};
  const a: Record<string, unknown> = {};
  const changed: string[] = [];
  for (const key of keys) {
    if (JSON.stringify(before[key] ?? null) === JSON.stringify(after[key] ?? null)) continue;
    b[key] = before[key] ?? null;
    a[key] = after[key] ?? null;
    changed.push(key);
  }
  return { before: b, after: a, keys: changed };
}
