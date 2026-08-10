"use server";

import { and, eq, ne } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requireEventRole } from "@/lib/auth/guards";
import { getDb, schema } from "@/lib/db";
import { nowIso } from "@/lib/dates";
import { id } from "@/lib/id";

function revalidateSettings(slug: string) {
  revalidatePath(`/admin/e/${slug}/settings`);
  revalidatePath(`/admin/e/${slug}/settings/tracks`);
  revalidatePath(`/admin/e/${slug}/settings/formats`);
  revalidatePath(`/admin/e/${slug}/settings/rooms`);
  revalidatePath(`/admin/e/${slug}/settings/tags`);
  revalidatePath(`/admin/e/${slug}/settings/levels`);
  revalidatePath(`/admin/e/${slug}/settings/fields`);
  revalidatePath(`/admin/e/${slug}/settings/records`);
}

type LookupKind = "tracks" | "formats" | "rooms" | "tags" | "levels";

function lookupTable(kind: LookupKind) {
  switch (kind) {
    case "tracks":
      return schema.tracks;
    case "formats":
      return schema.formats;
    case "rooms":
      return schema.rooms;
    case "tags":
      return schema.tags;
    case "levels":
      return schema.levels;
  }
}

function lookupIdPrefix(kind: LookupKind) {
  switch (kind) {
    case "tracks":
      return "trk";
    case "formats":
      return "fmt";
    case "rooms":
      return "rom";
    case "tags":
      return "tag";
    case "levels":
      return "lvl";
  }
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function saveEventSettingsAction(formData: FormData) {
  const slug = String(formData.get("slug") || "");
  const { event } = await requireEventRole(slug, ["organizer"]);
  const db = getDb();

  const newSlug = slugify(String(formData.get("eventSlug") || event.slug));
  if (!newSlug) throw new Error("Slug is required");

  const conflict = db
    .select({ id: schema.events.id })
    .from(schema.events)
    .where(and(eq(schema.events.slug, newSlug), ne(schema.events.id, event.id)))
    .get();
  if (conflict) throw new Error("Slug is already in use");

  const startsRaw = String(formData.get("startsAt") || "");
  const endsRaw = String(formData.get("endsAt") || "");

  db.update(schema.events)
    .set({
      name: String(formData.get("name") || event.name),
      slug: newSlug,
      type: String(formData.get("type") || "conference"),
      websiteUrl: String(formData.get("websiteUrl") || "") || null,
      location: String(formData.get("location") || "") || null,
      timezone: String(formData.get("timezone") || event.timezone),
      startsAt: startsRaw ? new Date(startsRaw).toISOString() : event.startsAt,
      endsAt: endsRaw ? new Date(endsRaw).toISOString() : event.endsAt,
      theme: String(formData.get("theme") || "") || null,
    })
    .where(eq(schema.events.id, event.id))
    .run();

  revalidateSettings(slug);
  if (newSlug !== slug) {
    revalidatePath(`/admin/e/${newSlug}`);
  }
}

function nextSortOrder(kind: LookupKind, eventId: string): number {
  const db = getDb();
  const table = lookupTable(kind);
  const items = db
    .select({ sortOrder: table.sortOrder })
    .from(table)
    .where(eq(table.eventId, eventId))
    .all();
  const max = items.reduce((m, i) => Math.max(m, i.sortOrder), -1);
  return max + 1;
}

export async function createLookupAction(formData: FormData) {
  const slug = String(formData.get("slug") || "");
  const kind = String(formData.get("kind") || "") as LookupKind;
  const name = String(formData.get("name") || "").trim();
  const color = String(formData.get("color") || "#2563eb");
  const { event } = await requireEventRole(slug, ["organizer"]);
  if (!name) throw new Error("Name is required");

  const db = getDb();
  const table = lookupTable(kind);
  const sortOrder = nextSortOrder(kind, event.id);

  db.insert(table)
    .values({
      id: id(lookupIdPrefix(kind)),
      eventId: event.id,
      name,
      color,
      sortOrder,
    })
    .run();

  revalidateSettings(slug);
}

export async function updateLookupAction(formData: FormData) {
  const slug = String(formData.get("slug") || "");
  const kind = String(formData.get("kind") || "") as LookupKind;
  const itemId = String(formData.get("itemId") || "");
  const name = String(formData.get("name") || "").trim();
  const color = String(formData.get("color") || "#2563eb");
  const { event } = await requireEventRole(slug, ["organizer"]);
  if (!name || !itemId) throw new Error("Invalid input");

  const db = getDb();
  const table = lookupTable(kind);

  db.update(table)
    .set({ name, color })
    .where(and(eq(table.id, itemId), eq(table.eventId, event.id)))
    .run();

  revalidateSettings(slug);
}

export async function deleteLookupAction(formData: FormData) {
  const slug = String(formData.get("slug") || "");
  const kind = String(formData.get("kind") || "") as LookupKind;
  const itemId = String(formData.get("itemId") || "");
  const { event } = await requireEventRole(slug, ["organizer"]);
  if (!itemId) throw new Error("Invalid input");

  const db = getDb();
  const table = lookupTable(kind);

  db.delete(table)
    .where(and(eq(table.id, itemId), eq(table.eventId, event.id)))
    .run();

  revalidateSettings(slug);
}

export async function moveLookupAction(formData: FormData) {
  const slug = String(formData.get("slug") || "");
  const kind = String(formData.get("kind") || "") as LookupKind;
  const itemId = String(formData.get("itemId") || "");
  const direction = String(formData.get("direction") || "") as "up" | "down";
  const { event } = await requireEventRole(slug, ["organizer"]);
  if (!itemId) throw new Error("Invalid input");

  const db = getDb();
  const table = lookupTable(kind);

  const items = db
    .select()
    .from(table)
    .where(eq(table.eventId, event.id))
    .orderBy(table.sortOrder)
    .all();

  const idx = items.findIndex((i) => i.id === itemId);
  if (idx < 0) return;
  const swapIdx = direction === "up" ? idx - 1 : idx + 1;
  if (swapIdx < 0 || swapIdx >= items.length) return;

  const current = items[idx];
  const other = items[swapIdx];
  db.update(table).set({ sortOrder: other.sortOrder }).where(eq(table.id, current.id)).run();
  db.update(table).set({ sortOrder: current.sortOrder }).where(eq(table.id, other.id)).run();

  revalidateSettings(slug);
}

export async function saveRecordSettingsAction(formData: FormData) {
  const slug = String(formData.get("slug") || "");
  const { event } = await requireEventRole(slug, ["organizer"]);
  const db = getDb();

  db.update(schema.events)
    .set({
      enableAcceptance: formData.get("enableAcceptance") === "on",
      allowWithdrawal: formData.get("allowWithdrawal") === "on",
      portalPendingLabel: String(formData.get("portalPendingLabel") || "Pending"),
      portalAcceptedLabel: String(formData.get("portalAcceptedLabel") || "Accepted"),
    })
    .where(eq(schema.events.id, event.id))
    .run();

  revalidateSettings(slug);
}

export async function createCustomFieldAction(formData: FormData) {
  const slug = String(formData.get("slug") || "");
  const { event } = await requireEventRole(slug, ["organizer"]);
  const scope = String(formData.get("scope") || "session") as "session" | "contact";
  const label = String(formData.get("label") || "").trim();
  const type = String(formData.get("type") || "text");
  const optionsRaw = String(formData.get("options") || "").trim();
  const maxLengthRaw = String(formData.get("maxLength") || "").trim();

  if (!label) throw new Error("Label is required");

  const key = slugify(label);
  const db = getDb();
  const conflict = db
    .select({ id: schema.fields.id })
    .from(schema.fields)
    .where(and(eq(schema.fields.eventId, event.id), eq(schema.fields.key, key)))
    .get();
  if (conflict) throw new Error("A field with this key already exists");

  let options = "[]";
  if (optionsRaw) {
    try {
      const parsed = JSON.parse(optionsRaw);
      if (!Array.isArray(parsed)) throw new Error("Options must be a JSON array");
      options = JSON.stringify(parsed);
    } catch {
      options = JSON.stringify(
        optionsRaw.split(",").map((s) => s.trim()).filter(Boolean),
      );
    }
  }

  db.insert(schema.fields)
    .values({
      id: id("fld"),
      eventId: event.id,
      scope,
      key,
      label,
      type,
      options,
      maxLength: maxLengthRaw ? Number(maxLengthRaw) : null,
      isStandard: false,
      createdAt: nowIso(),
    })
    .run();

  revalidateSettings(slug);
}
