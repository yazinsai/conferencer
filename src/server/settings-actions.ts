"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireOrganizer } from "@/lib/guards";
import { fullName } from "@/lib/auth";
import { normalizeLocal } from "@/lib/datetime";
import { logAudit } from "@/lib/repo/audit";
import {
  createLookup,
  deleteLookup,
  updateEvent,
  updateLookup,
  uniqueSlug,
  type LookupTable,
} from "@/lib/repo/events";
import { createField, deleteField, updateField } from "@/lib/repo/forms";
import { textToOptions, type FieldType } from "@/lib/fields";
import { id as newId, token } from "@/lib/ids";
import { run } from "@/lib/db";
import { nowIso } from "@/lib/datetime";

const TABLES: LookupTable[] = ["tracks", "formats", "rooms", "tags", "levels"];

function table(value: FormDataEntryValue | null): LookupTable {
  const name = String(value ?? "");
  if (!TABLES.includes(name as LookupTable)) throw new Error("Unknown list");
  return name as LookupTable;
}

export async function saveEventAction(formData: FormData) {
  const slug = String(formData.get("slug"));
  const { user, event } = await requireOrganizer(slug);
  const nextSlug = uniqueSlug(String(formData.get("event_slug") ?? event.slug), event.id);

  updateEvent(event.id, {
    name: String(formData.get("name") ?? event.name).trim(),
    slug: nextSlug,
    type: String(formData.get("type") ?? event.type),
    website_url: String(formData.get("website_url") ?? "") || null,
    location: String(formData.get("location") ?? "") || null,
    timezone: String(formData.get("timezone") ?? event.timezone),
    starts_at: normalizeLocal(String(formData.get("starts_at") ?? "")),
    ends_at: normalizeLocal(String(formData.get("ends_at") ?? "")),
    tagline: String(formData.get("tagline") ?? "") || null,
    theme: String(formData.get("theme") ?? "") || null,
    accent_color: String(formData.get("accent_color") ?? event.accent_color),
  });

  logAudit({
    eventId: event.id,
    entityType: "event",
    entityId: event.id,
    actorUserId: user.id,
    actorName: fullName(user),
    action: "edited",
    summary: "Updated event details",
  });

  revalidatePath("/", "layout");
  redirect(`/admin/e/${nextSlug}/settings/event?saved=1`);
}

export async function saveRecordSettingsAction(formData: FormData) {
  const slug = String(formData.get("slug"));
  const { event } = await requireOrganizer(slug);
  updateEvent(event.id, {
    participant_acceptance_enabled: formData.get("participant_acceptance_enabled") ? 1 : 0,
    allow_withdrawal: formData.get("allow_withdrawal") ? 1 : 0,
    label_accepted: String(formData.get("label_accepted") ?? "Accepted"),
    label_pending: String(formData.get("label_pending") ?? "Pending"),
  });
  revalidatePath(`/admin/e/${slug}`, "layout");
  redirect(`/admin/e/${slug}/settings/records?saved=1`);
}

export async function createLookupAction(formData: FormData) {
  const slug = String(formData.get("slug"));
  const { event } = await requireOrganizer(slug);
  const list = table(formData.get("table"));
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;
  createLookup(list, event.id, {
    name,
    color: String(formData.get("color") ?? "") || undefined,
    duration_minutes: formData.get("duration_minutes")
      ? Number(formData.get("duration_minutes"))
      : null,
    capacity: formData.get("capacity") ? Number(formData.get("capacity")) : null,
  });
  revalidatePath(`/admin/e/${slug}`, "layout");
  revalidatePath(`/e/${slug}`, "layout");
}

export async function updateLookupAction(formData: FormData) {
  const slug = String(formData.get("slug"));
  await requireOrganizer(slug);
  const list = table(formData.get("table"));
  updateLookup(list, String(formData.get("id")), {
    name: String(formData.get("name") ?? "").trim(),
    color: String(formData.get("color") ?? "") || undefined,
    sort_order: formData.get("sort_order") ? Number(formData.get("sort_order")) : undefined,
    duration_minutes: formData.get("duration_minutes")
      ? Number(formData.get("duration_minutes"))
      : undefined,
    capacity: formData.get("capacity") ? Number(formData.get("capacity")) : undefined,
  });
  revalidatePath(`/admin/e/${slug}`, "layout");
  revalidatePath(`/e/${slug}`, "layout");
}

export async function deleteLookupAction(formData: FormData) {
  const slug = String(formData.get("slug"));
  await requireOrganizer(slug);
  deleteLookup(table(formData.get("table")), String(formData.get("id")));
  revalidatePath(`/admin/e/${slug}`, "layout");
  revalidatePath(`/e/${slug}`, "layout");
}

export async function createFieldAction(formData: FormData) {
  const slug = String(formData.get("slug"));
  const { event } = await requireOrganizer(slug);
  const label = String(formData.get("label") ?? "").trim();
  if (!label) return;
  createField(event.id, {
    scope: (String(formData.get("scope") ?? "session") as "session" | "contact"),
    label,
    type: String(formData.get("type") ?? "text") as FieldType,
    options: JSON.stringify(textToOptions(String(formData.get("options") ?? ""))),
    max_length: formData.get("max_length") ? Number(formData.get("max_length")) : null,
    help_text: String(formData.get("help_text") ?? "") || null,
  });
  revalidatePath(`/admin/e/${slug}`, "layout");
}

export async function updateFieldAction(formData: FormData) {
  const slug = String(formData.get("slug"));
  await requireOrganizer(slug);
  updateField(String(formData.get("id")), {
    label: String(formData.get("label") ?? "").trim(),
    options: JSON.stringify(textToOptions(String(formData.get("options") ?? ""))),
    max_length: formData.get("max_length") ? Number(formData.get("max_length")) : null,
    help_text: String(formData.get("help_text") ?? "") || null,
  });
  revalidatePath(`/admin/e/${slug}`, "layout");
}

export async function deleteFieldAction(formData: FormData) {
  const slug = String(formData.get("slug"));
  await requireOrganizer(slug);
  deleteField(String(formData.get("id")));
  revalidatePath(`/admin/e/${slug}`, "layout");
}

export async function createApiTokenAction(formData: FormData) {
  const slug = String(formData.get("slug"));
  const { event } = await requireOrganizer(slug);
  run(
    "INSERT INTO api_tokens (id, event_id, name, token, created_at) VALUES (?,?,?,?,?)",
    newId(),
    event.id,
    String(formData.get("name") ?? "API token"),
    `cft_${token().slice(0, 32)}`,
    nowIso(),
  );
  revalidatePath(`/admin/e/${slug}/settings/api`);
}

export async function deleteApiTokenAction(formData: FormData) {
  const slug = String(formData.get("slug"));
  const { event } = await requireOrganizer(slug);
  run("DELETE FROM api_tokens WHERE id = ? AND event_id = ?", String(formData.get("id")), event.id);
  revalidatePath(`/admin/e/${slug}/settings/api`);
}
