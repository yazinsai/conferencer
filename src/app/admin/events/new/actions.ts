"use server";

import { redirect } from "next/navigation";
import { requireAnyAuth } from "@/lib/auth/guards";
import { getDb } from "@/lib/db";
import { createEventRecord, getOrCreateDefaultOrg } from "@/lib/events/create-event";

export async function createEventAction(formData: FormData) {
  const user = await requireAnyAuth("/admin/events/new");
  const db = getDb();
  const org = getOrCreateDefaultOrg(db, user);

  const name = String(formData.get("name") || "").trim();
  const slug = String(formData.get("slug") || "").trim();
  const type = String(formData.get("type") || "conference");
  const websiteUrl = String(formData.get("websiteUrl") || "").trim() || null;
  const location = String(formData.get("location") || "").trim() || null;
  const timezone = String(formData.get("timezone") || "America/Los_Angeles");
  const startsAt = String(formData.get("startsAt") || "");
  const endsAt = String(formData.get("endsAt") || "");
  const theme = String(formData.get("theme") || "").trim() || null;

  if (!name) throw new Error("Event name is required");
  if (!startsAt || !endsAt) throw new Error("Start and end dates are required");
  if (new Date(endsAt) <= new Date(startsAt)) {
    throw new Error("End date must be after start date");
  }

  try {
    const event = createEventRecord(db, {
      name,
      slug: slug || name,
      type,
      websiteUrl,
      location,
      timezone,
      startsAt,
      endsAt,
      theme,
      orgId: org.id,
      userId: user.id,
    });
    redirect(`/admin/e/${event.slug}`);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create event";
    redirect(`/admin/events/new?error=${encodeURIComponent(message)}`);
  }
}
