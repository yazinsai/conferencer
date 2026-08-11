"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireOrganizer } from "@/lib/guards";
import { fullName, provisionUser } from "@/lib/auth";
import { get, writeJson } from "@/lib/db";
import { formatEventDates } from "@/lib/datetime";
import { appUrl, sendEmail, sendTemplate } from "@/lib/email";
import { renderMerge } from "@/lib/merge";
import { autoMap, parseCsv } from "@/lib/csv";
import { logAudit } from "@/lib/repo/audit";
import {
  contactName,
  ensureEventContact,
  getContact,
  listRoster,
  setSpeakerStatus,
  splitName,
  updateContact,
  upsertContact,
} from "@/lib/repo/contacts";
import { storeUpload, uploadProblem } from "@/lib/repo/uploads";
import { submissionsForContact } from "@/lib/repo/submissions";

async function ctx(formData: FormData) {
  const slug = String(formData.get("slug"));
  const auth = await requireOrganizer(slug);
  return { slug, ...auth };
}

export async function saveSpeakerAction(formData: FormData) {
  const { slug, event, user } = await ctx(formData);
  const contactId = String(formData.get("contact_id") ?? "");
  const email = String(formData.get("email") ?? "").trim();
  if (!email) redirect(`/admin/e/${slug}/speakers/new?error=Email+is+required`);

  const patch = {
    first_name: String(formData.get("first_name") ?? ""),
    last_name: String(formData.get("last_name") ?? ""),
    email,
    job_title: String(formData.get("job_title") ?? "") || null,
    company: String(formData.get("company") ?? "") || null,
    biography: String(formData.get("biography") ?? "") || null,
    pronouns: String(formData.get("pronouns") ?? "") || null,
    phone: String(formData.get("phone") ?? "") || null,
    linkedin_url: String(formData.get("linkedin_url") ?? "") || null,
    twitter_url: String(formData.get("twitter_url") ?? "") || null,
    website_url: String(formData.get("website_url") ?? "") || null,
    dietary: String(formData.get("dietary") ?? "") || null,
    tshirt_size: String(formData.get("tshirt_size") ?? "") || null,
    travel_notes: String(formData.get("travel_notes") ?? "") || null,
    notes: String(formData.get("notes") ?? "") || null,
    tags: writeJson(
      String(formData.get("tags") ?? "")
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    ),
  };

  let id = contactId;
  if (contactId) {
    const before = getContact(contactId);
    updateContact(contactId, patch);
    logAudit({
      eventId: event.id,
      entityType: "contact",
      entityId: contactId,
      actorUserId: user.id,
      actorName: fullName(user),
      action: "edited",
      summary: `Updated ${patch.first_name} ${patch.last_name}`,
      before: { biography: before?.biography, job_title: before?.job_title, company: before?.company },
      after: { biography: patch.biography, job_title: patch.job_title, company: patch.company },
    });
  } else {
    const { contact } = upsertContact(event.org_id, patch);
    id = contact.id;
    logAudit({
      eventId: event.id,
      entityType: "contact",
      entityId: id,
      actorUserId: user.id,
      actorName: fullName(user),
      action: "created",
      summary: `Added speaker ${patch.first_name} ${patch.last_name}`,
    });
  }

  ensureEventContact(event.id, id, {
    speaker_status: String(formData.get("speaker_status") ?? "prospect"),
  });

  const file = formData.get("headshot");
  if (file instanceof File && file.size > 0) {
    const problem = uploadProblem(
      { name: file.name, size: file.size },
      ".png,.jpg,.jpeg,.webp,.gif,.svg",
    );
    if (!problem) {
      const upload = await storeUpload({
        eventId: event.id,
        file,
        kind: "headshot",
        contactId: id,
        userId: user.id,
        isPublic: true,
      });
      updateContact(id, { headshot_url: `/f/${upload.id}` });
    }
  }

  revalidatePath(`/admin/e/${slug}`, "layout");
  revalidatePath(`/e/${slug}`, "layout");
  redirect(`/admin/e/${slug}/speakers/${id}?saved=1`);
}

export async function setSpeakerStatusAction(formData: FormData) {
  const { slug, event } = await ctx(formData);
  const status = String(formData.get("speaker_status"));
  const contactIds = formData.getAll("contact_ids").map(String).filter(Boolean);
  const single = formData.get("contact_id");
  if (single) contactIds.push(String(single));
  for (const contactId of contactIds) {
    setSpeakerStatus(event.id, contactId, status);
  }
  revalidatePath(`/admin/e/${slug}`, "layout");
}

export async function invitePortalAction(formData: FormData) {
  const { slug, event, user } = await ctx(formData);
  const contactIds = formData.getAll("contact_ids").map(String).filter(Boolean);
  const single = formData.get("contact_id");
  if (single) contactIds.push(String(single));

  let sent = 0;
  let lastInvite = "";
  for (const contactId of contactIds) {
    const contact = getContact(contactId);
    if (!contact) continue;
    const { invite } = provisionUser({
      email: contact.email,
      firstName: contact.first_name,
      lastName: contact.last_name,
      eventId: event.id,
      role: "participant",
      contactId: contact.id,
    });
    lastInvite = invite.token;
    ensureEventContact(event.id, contact.id, { speaker_status: "invited" });
    await sendTemplate({
      eventId: event.id,
      templateKey: "portal_invite",
      to: contact.email,
      toName: contactName(contact),
      contactId: contact.id,
      context: {
        first_name: contact.first_name,
        speaker_name: contactName(contact),
        event_name: event.name,
        event_dates: formatEventDates(event.starts_at, event.ends_at),
        portal_link: appUrl(`/set-password/${invite.token}`),
      },
      force: true,
    });
    sent += 1;
  }

  logAudit({
    eventId: event.id,
    entityType: "event",
    entityId: event.id,
    actorUserId: user.id,
    actorName: fullName(user),
    action: "portal_invites_sent",
    summary: `Sent ${sent} portal invitation(s)`,
  });

  revalidatePath(`/admin/e/${slug}`, "layout");
  redirect(
    `/admin/e/${slug}/speakers?invited=${sent}${
      contactIds.length === 1 && lastInvite ? `&invite=${lastInvite}` : ""
    }`,
  );
}

export async function importSpeakersAction(formData: FormData) {
  const { slug, event, user } = await ctx(formData);
  const raw = String(formData.get("csv") ?? "");
  if (!raw.trim()) redirect(`/admin/e/${slug}/speakers/import?error=Paste+or+upload+a+CSV+first`);

  const { headers, rows } = parseCsv(raw);
  const mapping: Record<number, string> = {};
  const submittedMapping = formData.getAll("map").map(String);
  if (submittedMapping.length === headers.length) {
    submittedMapping.forEach((key, index) => {
      if (key) mapping[index] = key;
    });
  } else {
    Object.assign(mapping, autoMap(headers));
  }

  let created = 0;
  let updated = 0;
  let skipped = 0;

  for (const row of rows) {
    const values: Record<string, string> = {};
    row.forEach((cell, index) => {
      const key = mapping[index];
      if (key) values[key] = cell.trim();
    });
    if (values.full_name && !values.first_name) {
      const { first, last } = splitName(values.full_name);
      values.first_name = first;
      values.last_name = last;
    }
    if (!values.email) {
      skipped += 1;
      continue;
    }
    const { contact, created: isNew } = upsertContact(event.org_id, {
      email: values.email,
      first_name: values.first_name ?? "",
      last_name: values.last_name ?? "",
      job_title: values.job_title || null,
      company: values.company || null,
      biography: values.biography || null,
      pronouns: values.pronouns || null,
      phone: values.phone || null,
      linkedin_url: values.linkedin_url || null,
      twitter_url: values.twitter_url || null,
      website_url: values.website_url || null,
      dietary: values.dietary || null,
      tshirt_size: values.tshirt_size || null,
      travel_notes: values.travel_notes || null,
    });
    ensureEventContact(event.id, contact.id, {
      speaker_status: (values.speaker_status || "prospect").toLowerCase(),
    });
    if (isNew) created += 1;
    else updated += 1;
  }

  logAudit({
    eventId: event.id,
    entityType: "event",
    entityId: event.id,
    actorUserId: user.id,
    actorName: fullName(user),
    action: "speakers_imported",
    summary: `CSV import: ${created} created, ${updated} updated, ${skipped} skipped`,
  });

  revalidatePath(`/admin/e/${slug}`, "layout");
  redirect(
    `/admin/e/${slug}/speakers?created=${created}&updated=${updated}&skipped=${skipped}`,
  );
}

export async function bulkEmailAction(formData: FormData) {
  const { slug, event, user } = await ctx(formData);
  const subject = String(formData.get("subject") ?? "").trim();
  const body = String(formData.get("body") ?? "");
  const templateKey = String(formData.get("template_key") ?? "") || null;
  if (!subject) redirect(`/admin/e/${slug}/emails/compose?error=Subject+is+required`);

  let recipients = formData.getAll("contact_ids").map(String).filter(Boolean);
  const audience = String(formData.get("audience") ?? "");
  if (audience === "all_speakers") {
    recipients = listRoster(event.id).map((row) => row.id);
  } else if (audience === "confirmed") {
    recipients = listRoster(event.id, { status: "confirmed" }).map((row) => row.id);
  } else if (audience === "accepted") {
    recipients = listRoster(event.id)
      .filter((row) => submissionsForContact(event.id, row.id).some((s) => s.status === "accepted"))
      .map((row) => row.id);
  }

  let sent = 0;
  for (const contactId of recipients) {
    const contact = getContact(contactId);
    if (!contact?.email) continue;
    const sessions = submissionsForContact(event.id, contact.id);
    const context = {
      first_name: contact.first_name,
      last_name: contact.last_name,
      speaker_name: contactName(contact),
      talk_title: sessions[0]?.title ?? "",
      track: sessions[0]?.track_name ?? "",
      event_name: event.name,
      event_dates: formatEventDates(event.starts_at, event.ends_at),
      event_location: event.location ?? "",
      portal_link: appUrl("/portal"),
      organizer_name: fullName(user),
    };
    await sendEmail({
      eventId: event.id,
      to: contact.email,
      toName: contactName(contact),
      contactId: contact.id,
      subject: renderMerge(subject, context),
      body: renderMerge(body, context),
      templateKey,
      kind: "manual",
    });
    sent += 1;
  }

  logAudit({
    eventId: event.id,
    entityType: "event",
    entityId: event.id,
    actorUserId: user.id,
    actorName: fullName(user),
    action: "bulk_email",
    summary: `Sent "${subject}" to ${sent} recipient(s)`,
  });

  revalidatePath(`/admin/e/${slug}`, "layout");
  redirect(`/admin/e/${slug}/emails?sent=${sent}`);
}

export async function deleteSpeakerAction(formData: FormData) {
  const { slug, event } = await ctx(formData);
  const contactId = String(formData.get("contact_id"));
  const row = get<{ id: string }>(
    "SELECT id FROM event_contacts WHERE event_id = ? AND contact_id = ?",
    event.id,
    contactId,
  );
  if (row) {
    const { run } = await import("@/lib/db");
    run("DELETE FROM event_contacts WHERE id = ?", row.id);
  }
  revalidatePath(`/admin/e/${slug}`, "layout");
  redirect(`/admin/e/${slug}/speakers`);
}
