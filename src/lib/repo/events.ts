import { cache } from "react";

import { all, get, run } from "../db";
import { id, slugify } from "../ids";
import { nowIso } from "../datetime";

export type Event = {
  id: string;
  org_id: string;
  name: string;
  slug: string;
  type: string;
  website_url: string | null;
  location: string | null;
  timezone: string;
  starts_at: string | null;
  ends_at: string | null;
  theme: string | null;
  tagline: string | null;
  logo_url: string | null;
  accent_color: string;
  status: string;
  participant_acceptance_enabled: number;
  allow_withdrawal: number;
  label_accepted: string;
  label_pending: string;
  created_at: string;
  updated_at: string;
};

export type Lookup = {
  id: string;
  event_id: string;
  name: string;
  color: string;
  sort_order: number;
  created_at: string;
  duration_minutes?: number | null;
  capacity?: number | null;
};

export function listEvents(): Event[] {
  return all<Event>("SELECT * FROM events ORDER BY starts_at IS NULL, starts_at, name");
}

export function getEvent(eventId: string): Event | undefined {
  return get<Event>("SELECT * FROM events WHERE id = ?", eventId);
}

export const getEventBySlug = cache(function getEventBySlug(slug: string): Event | undefined {
  return get<Event>("SELECT * FROM events WHERE slug = ?", slug);
});

/** The event a bare /admin or /sessions URL should resolve to. */
export function defaultEvent(): Event | undefined {
  return get<Event>(
    "SELECT * FROM events WHERE status != 'archived' ORDER BY created_at LIMIT 1",
  );
}

export function uniqueSlug(base: string, ignoreId?: string): string {
  const root = slugify(base) || "event";
  let candidate = root;
  let n = 2;
  for (;;) {
    const clash = get<{ id: string }>("SELECT id FROM events WHERE slug = ?", candidate);
    if (!clash || clash.id === ignoreId) return candidate;
    candidate = `${root}-${n++}`;
  }
}

export function createEvent(input: Partial<Event> & { org_id: string; name: string }): Event {
  const eventId = input.id ?? id();
  run(
    `INSERT INTO events (id, org_id, name, slug, type, website_url, location, timezone,
        starts_at, ends_at, theme, tagline, logo_url, accent_color, status, created_at, updated_at)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    eventId,
    input.org_id,
    input.name,
    uniqueSlug(input.slug || input.name),
    input.type ?? "conference",
    input.website_url ?? null,
    input.location ?? null,
    input.timezone ?? "America/Los_Angeles",
    input.starts_at ?? null,
    input.ends_at ?? null,
    input.theme ?? null,
    input.tagline ?? null,
    input.logo_url ?? null,
    input.accent_color ?? "#4f46e5",
    input.status ?? "active",
    nowIso(),
    nowIso(),
  );
  return getEvent(eventId)!;
}

const EVENT_FIELDS = [
  "name",
  "slug",
  "type",
  "website_url",
  "location",
  "timezone",
  "starts_at",
  "ends_at",
  "theme",
  "tagline",
  "logo_url",
  "accent_color",
  "status",
  "participant_acceptance_enabled",
  "allow_withdrawal",
  "label_accepted",
  "label_pending",
] as const;

export function updateEvent(eventId: string, patch: Partial<Event>) {
  const sets: string[] = [];
  const params: unknown[] = [];
  for (const key of EVENT_FIELDS) {
    if (key in patch) {
      sets.push(`${key} = ?`);
      params.push(patch[key] ?? null);
    }
  }
  if (!sets.length) return;
  sets.push("updated_at = ?");
  params.push(nowIso(), eventId);
  run(`UPDATE events SET ${sets.join(", ")} WHERE id = ?`, ...params);
}

/* ------------------------------------------------------------- lookups --- */

export const LOOKUP_TABLES = ["tracks", "formats", "rooms", "tags", "levels"] as const;
export type LookupTable = (typeof LOOKUP_TABLES)[number];

export function listLookup(table: LookupTable, eventId: string): Lookup[] {
  return all<Lookup>(
    `SELECT * FROM ${table} WHERE event_id = ? ORDER BY sort_order, name`,
    eventId,
  );
}

export function getLookup(table: LookupTable, rowId: string): Lookup | undefined {
  return get<Lookup>(`SELECT * FROM ${table} WHERE id = ?`, rowId);
}

export function findLookupByName(
  table: LookupTable,
  eventId: string,
  name: string,
): Lookup | undefined {
  return get<Lookup>(
    `SELECT * FROM ${table} WHERE event_id = ? AND name = ? COLLATE NOCASE`,
    eventId,
    name.trim(),
  );
}

export function createLookup(
  table: LookupTable,
  eventId: string,
  input: { name: string; color?: string; sort_order?: number; duration_minutes?: number | null; capacity?: number | null },
): Lookup {
  const rowId = id();
  const order =
    input.sort_order ??
    (get<{ n: number }>(
      `SELECT COALESCE(MAX(sort_order), -1) + 1 AS n FROM ${table} WHERE event_id = ?`,
      eventId,
    )?.n ??
      0);
  if (table === "formats") {
    run(
      `INSERT INTO formats (id, event_id, name, color, duration_minutes, sort_order, created_at)
       VALUES (?,?,?,?,?,?,?)`,
      rowId,
      eventId,
      input.name.trim(),
      input.color ?? "#0ea5e9",
      input.duration_minutes ?? null,
      order,
      nowIso(),
    );
  } else if (table === "rooms") {
    run(
      `INSERT INTO rooms (id, event_id, name, color, capacity, sort_order, created_at)
       VALUES (?,?,?,?,?,?,?)`,
      rowId,
      eventId,
      input.name.trim(),
      input.color ?? "#14b8a6",
      input.capacity ?? null,
      order,
      nowIso(),
    );
  } else {
    run(
      `INSERT INTO ${table} (id, event_id, name, color, sort_order, created_at)
       VALUES (?,?,?,?,?,?)`,
      rowId,
      eventId,
      input.name.trim(),
      input.color ?? defaultColor(table),
      order,
      nowIso(),
    );
  }
  return getLookup(table, rowId)!;
}

function defaultColor(table: LookupTable): string {
  switch (table) {
    case "tracks":
      return "#6366f1";
    case "tags":
      return "#a855f7";
    case "levels":
      return "#f59e0b";
    default:
      return "#14b8a6";
  }
}

export function updateLookup(
  table: LookupTable,
  rowId: string,
  patch: { name?: string; color?: string; sort_order?: number; duration_minutes?: number | null; capacity?: number | null },
) {
  const sets: string[] = [];
  const params: unknown[] = [];
  if (patch.name !== undefined) {
    sets.push("name = ?");
    params.push(patch.name.trim());
  }
  if (patch.color !== undefined) {
    sets.push("color = ?");
    params.push(patch.color);
  }
  if (patch.sort_order !== undefined) {
    sets.push("sort_order = ?");
    params.push(patch.sort_order);
  }
  if (table === "formats" && patch.duration_minutes !== undefined) {
    sets.push("duration_minutes = ?");
    params.push(patch.duration_minutes);
  }
  if (table === "rooms" && patch.capacity !== undefined) {
    sets.push("capacity = ?");
    params.push(patch.capacity);
  }
  if (!sets.length) return;
  params.push(rowId);
  run(`UPDATE ${table} SET ${sets.join(", ")} WHERE id = ?`, ...params);
}

export function deleteLookup(table: LookupTable, rowId: string) {
  run(`DELETE FROM ${table} WHERE id = ?`, rowId);
}

/** Find-or-create by name — used by seeding, CSV import and the API. */
export function ensureLookup(
  table: LookupTable,
  eventId: string,
  name: string,
  extra?: { color?: string; duration_minutes?: number | null },
): Lookup {
  return (
    findLookupByName(table, eventId, name) ??
    createLookup(table, eventId, { name, ...extra })
  );
}

/**
 * How many records point at this lookup row. Deleting it nulls those references,
 * so the confirmation dialog states the blast radius rather than just asking
 * "are you sure?" (Appendix B #10 — the buyer's team is non-technical).
 */
export function lookupUsage(table: LookupTable, rowId: string): number {
  const column =
    table === "tracks"
      ? "track_id"
      : table === "formats"
        ? "format_id"
        : table === "rooms"
          ? "location_id"
          : null;
  if (column) {
    return (
      get<{ n: number }>(
        `SELECT COUNT(*) AS n FROM submissions WHERE ${column} = ?`,
        rowId,
      )?.n ?? 0
    );
  }
  if (table === "levels") {
    const row = getLookup("levels", rowId);
    return row
      ? (get<{ n: number }>("SELECT COUNT(*) AS n FROM submissions WHERE level = ?", row.name)
          ?.n ?? 0)
      : 0;
  }
  const row = getLookup("tags", rowId);
  return row
    ? (get<{ n: number }>("SELECT COUNT(*) AS n FROM submissions WHERE tags LIKE ?", `%"${row.name}"%`)
        ?.n ?? 0)
    : 0;
}
