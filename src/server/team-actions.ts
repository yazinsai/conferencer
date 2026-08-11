"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireOrganizer } from "@/lib/guards";
import { fullName, provisionUser } from "@/lib/auth";
import { get, run } from "@/lib/db";
import { logAudit } from "@/lib/repo/audit";
import { splitName, upsertContact } from "@/lib/repo/contacts";

export async function addTeamMemberAction(formData: FormData) {
  const slug = String(formData.get("slug"));
  const { event, user } = await requireOrganizer(slug);
  const email = String(formData.get("email") ?? "").trim();
  if (!email) return;
  const role = String(formData.get("role") ?? "reviewer") as
    | "organizer"
    | "reviewer"
    | "participant";
  const first = String(formData.get("first_name") ?? "").trim();
  const last = String(formData.get("last_name") ?? "").trim();
  const name = `${first} ${last}`.trim() || email.split("@")[0];
  const parts = first ? { first, last } : splitName(name);

  const { contact } = upsertContact(event.org_id, {
    email,
    first_name: parts.first,
    last_name: parts.last,
  });
  const { invite } = provisionUser({
    email,
    firstName: parts.first,
    lastName: parts.last,
    password: String(formData.get("password") ?? "").trim() || null,
    eventId: event.id,
    role,
    contactId: contact.id,
  });

  logAudit({
    eventId: event.id,
    entityType: "event",
    entityId: event.id,
    actorUserId: user.id,
    actorName: fullName(user),
    action: "team_member_added",
    summary: `Added ${email} as ${role}`,
  });

  revalidatePath(`/admin/e/${slug}/team`);
  redirect(
    `/admin/e/${slug}/team?invite=${invite.token}&email=${encodeURIComponent(email)}`,
  );
}

export async function removeTeamMemberAction(formData: FormData) {
  const slug = String(formData.get("slug"));
  const { event } = await requireOrganizer(slug);
  const membershipId = String(formData.get("membership_id"));
  const row = get<{ id: string }>(
    "SELECT id FROM event_memberships WHERE id = ? AND event_id = ?",
    membershipId,
    event.id,
  );
  if (row) run("DELETE FROM event_memberships WHERE id = ?", row.id);
  revalidatePath(`/admin/e/${slug}/team`);
}
