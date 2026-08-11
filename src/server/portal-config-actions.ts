"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireOrganizer } from "@/lib/guards";
import { get, run } from "@/lib/db";
import { id } from "@/lib/ids";
import { nowIso } from "@/lib/datetime";

export async function savePortalAction(formData: FormData) {
  const slug = String(formData.get("slug"));
  const { event } = await requireOrganizer(slug);
  const portalId = String(formData.get("portal_id") ?? "");
  const flag = (name: string) => (formData.get(name) ? 1 : 0);

  const values = {
    name: String(formData.get("name") ?? "Speaker Portal"),
    welcome_message: String(formData.get("welcome_message") ?? "") || null,
    accent_color: String(formData.get("accent_color") ?? "") || null,
    show_tasks_always: flag("show_tasks_always"),
    show_sessions: flag("show_sessions"),
    allow_manage_profile: flag("allow_manage_profile"),
    allow_manage_participants: flag("allow_manage_participants"),
    send_weekly_digest: flag("send_weekly_digest"),
    final_deadline_days: formData.get("final_deadline_days")
      ? Number(formData.get("final_deadline_days"))
      : null,
    heading_invited: String(formData.get("heading_invited") ?? "Invited Sessions"),
    heading_submissions: String(formData.get("heading_submissions") ?? "My Submissions"),
    heading_confirmed: String(formData.get("heading_confirmed") ?? "Confirmed Participation"),
  };

  const existing = portalId
    ? get<{ id: string }>("SELECT id FROM portals WHERE id = ? AND event_id = ?", portalId, event.id)
    : undefined;

  if (existing) {
    run(
      `UPDATE portals SET name = ?, welcome_message = ?, accent_color = ?, show_tasks_always = ?,
              show_sessions = ?, allow_manage_profile = ?, allow_manage_participants = ?,
              send_weekly_digest = ?, final_deadline_days = ?, heading_invited = ?,
              heading_submissions = ?, heading_confirmed = ?
        WHERE id = ?`,
      values.name,
      values.welcome_message,
      values.accent_color,
      values.show_tasks_always,
      values.show_sessions,
      values.allow_manage_profile,
      values.allow_manage_participants,
      values.send_weekly_digest,
      values.final_deadline_days,
      values.heading_invited,
      values.heading_submissions,
      values.heading_confirmed,
      existing.id,
    );
  } else {
    run(
      `INSERT INTO portals (id, event_id, name, is_default, welcome_message, accent_color,
          show_tasks_always, show_sessions, allow_manage_profile, allow_manage_participants,
          send_weekly_digest, final_deadline_days, heading_invited, heading_submissions,
          heading_confirmed, created_at)
       VALUES (?,?,?,1,?,?,?,?,?,?,?,?,?,?,?,?)`,
      id(),
      event.id,
      values.name,
      values.welcome_message,
      values.accent_color,
      values.show_tasks_always,
      values.show_sessions,
      values.allow_manage_profile,
      values.allow_manage_participants,
      values.send_weekly_digest,
      values.final_deadline_days,
      values.heading_invited,
      values.heading_submissions,
      values.heading_confirmed,
      nowIso(),
    );
  }

  revalidatePath(`/admin/e/${slug}/portals`);
  revalidatePath("/portal", "layout");
  redirect(`/admin/e/${slug}/portals?saved=1`);
}
