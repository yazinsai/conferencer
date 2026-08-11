import { all, get, run } from "./db";
import { nowIso } from "./datetime";
import { defaultEvent, getEventBySlug, type Event } from "./repo/events";

export type ApiContext = { event: Event; tokenId: string | null; readOnly: boolean };

export function apiError(status: number, message: string, detail?: unknown) {
  return Response.json({ error: { status, message, detail } }, { status });
}

/**
 * Bearer-token auth scoped to one event (R-API-1). `?event=<slug>` picks the
 * event for tokens that could match several; otherwise the token's own event wins.
 */
export function authenticate(request: Request): ApiContext | Response {
  const url = new URL(request.url);
  const header = request.headers.get("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7).trim() : url.searchParams.get("token");

  if (!token) return apiError(401, "Missing bearer token. Create one in Settings → API tokens.");
  const row = get<{ id: string; event_id: string }>(
    "SELECT id, event_id FROM api_tokens WHERE token = ?",
    token,
  );
  if (!row) return apiError(401, "That API token is not valid.");
  run("UPDATE api_tokens SET last_used_at = ? WHERE id = ?", nowIso(), row.id);

  const event =
    get<Event>("SELECT * FROM events WHERE id = ?", row.event_id) ?? defaultEvent();
  if (!event) return apiError(404, "No event found for this token.");
  return { event, tokenId: row.id, readOnly: false };
}

/** Public endpoints (R-API-5) resolve the event from ?event=<slug>. */
export function publicContext(request: Request): ApiContext | Response {
  const url = new URL(request.url);
  const slug = url.searchParams.get("event");
  const event = slug ? getEventBySlug(slug) : defaultEvent();
  if (!event) return apiError(404, "Event not found.");
  return { event, tokenId: null, readOnly: true };
}

export type Page<T> = { data: T[]; meta: { count: number; limit: number; next_cursor: string | null } };

export function paginate<T extends { id: string; updated_at?: string; created_at?: string }>(
  rows: T[],
  url: URL,
): Page<T> {
  const limit = Math.min(200, Math.max(1, Number(url.searchParams.get("limit") ?? 50)));
  const cursor = url.searchParams.get("cursor");
  const updatedSince = url.searchParams.get("updated_since");

  let filtered = rows;
  if (updatedSince) {
    filtered = filtered.filter(
      (row) => (row.updated_at ?? row.created_at ?? "") >= updatedSince,
    );
  }
  let start = 0;
  if (cursor) {
    const index = filtered.findIndex((row) => row.id === cursor);
    start = index >= 0 ? index + 1 : 0;
  }
  const slice = filtered.slice(start, start + limit);
  const next = start + limit < filtered.length ? (slice[slice.length - 1]?.id ?? null) : null;
  return { data: slice, meta: { count: filtered.length, limit, next_cursor: next } };
}

export function jsonBody<T = Record<string, unknown>>(request: Request): Promise<T> {
  return request.json().catch(() => ({}) as T);
}

export function listRows<T>(sql: string, ...params: unknown[]): T[] {
  return all<T>(sql, ...params);
}
