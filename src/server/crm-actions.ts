"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAnyOrganizer } from "@/lib/guards";
import { fullName } from "@/lib/auth";
import { writeJson } from "@/lib/db";
import { formatEventDates } from "@/lib/datetime";
import { appUrl, sendEmail } from "@/lib/email";
import { renderMerge } from "@/lib/merge";
import { autoMap, parseCsv } from "@/lib/csv";
import {
  contactName,
  ensureEventContact,
  getContact,
  splitName,
  updateContact,
  upsertContact,
} from "@/lib/repo/contacts";
import { getEvent, listEvents } from "@/lib/repo/events";
import {
  addEvent as addPipelineEvent,
  createSegment,
  deleteSegment,
  enroll,
  mergeContacts,
  moveStage,
  removeEntry,
} from "@/lib/repo/crm";

async function ctx() {
  const { user, event } = await requireAnyOrganizer();
  return { user, orgId: event.org_id, event };
}

export async function saveContactAction(formData: FormData) {
  const { orgId } = await ctx();
  const contactId = String(formData.get("contact_id") ?? "");
  const patch = {
    first_name: String(formData.get("first_name") ?? ""),
    last_name: String(formData.get("last_name") ?? ""),
    email: String(formData.get("email") ?? "").trim(),
    job_title: String(formData.get("job_title") ?? "") || null,
    company: String(formData.get("company") ?? "") || null,
    biography: String(formData.get("biography") ?? "") || null,
    notes: String(formData.get("notes") ?? "") || null,
    linkedin_url: String(formData.get("linkedin_url") ?? "") || null,
    twitter_url: String(formData.get("twitter_url") ?? "") || null,
    website_url: String(formData.get("website_url") ?? "") || null,
    tags: writeJson(
      String(formData.get("tags") ?? "")
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    ),
    custom: writeJson({
      speaker_type: String(formData.get("custom_speaker_type") ?? "") || undefined,
      focus_area: String(formData.get("custom_focus_area") ?? "") || undefined,
    }),
  };
  if (!patch.email) return;

  let id = contactId;
  if (contactId) updateContact(contactId, patch);
  else id = upsertContact(orgId, patch).contact.id;

  revalidatePath("/crm", "layout");
  redirect(`/crm/contacts/${id}?saved=1`);
}

export async function importContactsAction(formData: FormData) {
  const { orgId } = await ctx();
  const raw = String(formData.get("csv") ?? "");
  if (!raw.trim()) redirect("/crm/contacts?error=Paste+or+upload+a+CSV+first");
  const { headers, rows } = parseCsv(raw);
  const submitted = formData.getAll("map").map(String);
  const mapping: Record<number, string> =
    submitted.length === headers.length
      ? Object.fromEntries(submitted.map((key, index) => [index, key]).filter(([, key]) => key))
      : autoMap(headers);

  let created = 0;
  let updated = 0;
  for (const row of rows) {
    const values: Record<string, string> = {};
    row.forEach((cell, index) => {
      const key = mapping[index];
      if (key) values[key] = cell.trim();
    });
    if (values.full_name && !values.first_name) {
      const parts = splitName(values.full_name);
      values.first_name = parts.first;
      values.last_name = parts.last;
    }
    if (!values.email) continue;
    const result = upsertContact(orgId, {
      email: values.email,
      first_name: values.first_name ?? "",
      last_name: values.last_name ?? "",
      job_title: values.job_title || null,
      company: values.company || null,
      biography: values.biography || null,
    });
    if (result.created) created += 1;
    else updated += 1;
  }
  revalidatePath("/crm", "layout");
  redirect(`/crm/contacts?created=${created}&updated=${updated}`);
}

export async function mergeContactsAction(formData: FormData) {
  const { orgId } = await ctx();
  const primaryId = String(formData.get("primary_id"));
  const duplicateIds = formData.getAll("duplicate_ids").map(String).filter(Boolean);
  const primary = getContact(primaryId);
  if (!primary || primary.org_id !== orgId) return;
  mergeContacts(primaryId, duplicateIds);
  revalidatePath("/crm", "layout");
  redirect(`/crm/contacts/${primaryId}?merged=${duplicateIds.length}`);
}

export async function saveSegmentAction(formData: FormData) {
  const { orgId } = await ctx();
  createSegment(orgId, {
    name: String(formData.get("name") ?? "Segment"),
    kind: String(formData.get("kind") ?? "dynamic"),
    config: {
      q: String(formData.get("q") ?? ""),
      company: String(formData.get("company") ?? ""),
      jobTitle: String(formData.get("job_title") ?? ""),
      tag: String(formData.get("tag") ?? ""),
    },
  });
  revalidatePath("/crm", "layout");
  redirect("/crm/segments?saved=1");
}

export async function deleteSegmentAction(formData: FormData) {
  await ctx();
  deleteSegment(String(formData.get("segment_id")));
  revalidatePath("/crm", "layout");
}

export async function enrollAction(formData: FormData) {
  const { orgId, user } = await ctx();
  const contactIds = formData.getAll("contact_ids").map(String).filter(Boolean);
  const single = formData.get("contact_id");
  if (single) contactIds.push(String(single));
  for (const contactId of contactIds) {
    enroll(orgId, contactId, {
      stage: String(formData.get("stage") ?? "researching"),
      score: formData.get("score") ? Number(formData.get("score")) : null,
      rationale: String(formData.get("rationale") ?? "") || null,
      actor: fullName(user),
    });
  }
  revalidatePath("/crm", "layout");
  redirect("/crm/pipeline?enrolled=1");
}

export async function moveStageAction(formData: FormData) {
  const { user } = await ctx();
  moveStage(String(formData.get("entry_id")), String(formData.get("stage")), fullName(user));
  revalidatePath("/crm", "layout");
}

export async function removeEntryAction(formData: FormData) {
  await ctx();
  removeEntry(String(formData.get("entry_id")));
  revalidatePath("/crm", "layout");
}

export async function addPipelineNoteAction(formData: FormData) {
  const { user } = await ctx();
  const entryId = String(formData.get("entry_id"));
  const body = String(formData.get("body") ?? "").trim();
  if (!body) return;
  addPipelineEvent(entryId, { kind: "note", body, actor: fullName(user) });
  revalidatePath("/crm", "layout");
}

export async function pushToEventAction(formData: FormData) {
  const { orgId } = await ctx();
  const contactIds = formData.getAll("contact_ids").map(String).filter(Boolean);
  const single = formData.get("contact_id");
  if (single) contactIds.push(String(single));
  const eventId = String(formData.get("event_id"));
  const target = getEvent(eventId);
  if (!target || target.org_id !== orgId) return;

  let pushed = 0;
  for (const contactId of contactIds) {
    const contact = getContact(contactId);
    if (!contact || contact.org_id !== orgId) continue;
    ensureEventContact(target.id, contact.id, { status: "active", speaker_status: "prospect" });
    pushed += 1;
  }
  revalidatePath("/crm", "layout");
  revalidatePath(`/admin/e/${target.slug}`, "layout");
  redirect(`/crm/contacts?pushed=${pushed}&event=${encodeURIComponent(target.name)}`);
}

export async function crmBulkEmailAction(formData: FormData) {
  const { orgId, user, event } = await ctx();
  const contactIds = formData.getAll("contact_ids").map(String).filter(Boolean);
  const subject = String(formData.get("subject") ?? "").trim();
  const body = String(formData.get("body") ?? "");
  if (!subject || !contactIds.length) {
    redirect("/crm/contacts?error=Pick+recipients+and+a+subject");
  }

  const target = listEvents().find((e) => e.org_id === orgId) ?? event;
  let sent = 0;
  for (const contactId of contactIds) {
    const contact = getContact(contactId);
    if (!contact?.email) continue;
    const context = {
      first_name: contact.first_name,
      last_name: contact.last_name,
      speaker_name: contactName(contact),
      event_name: target.name,
      event_dates: formatEventDates(target.starts_at, target.ends_at),
      portal_link: appUrl("/portal"),
      organizer_name: fullName(user),
    };
    await sendEmail({
      eventId: target.id,
      to: contact.email,
      toName: contactName(contact),
      contactId: contact.id,
      subject: renderMerge(subject, context),
      body: renderMerge(body, context),
      templateKey: "crm_outreach",
      kind: "manual",
    });
    sent += 1;
  }
  revalidatePath("/crm", "layout");
  redirect(`/crm/contacts?sent=${sent}`);
}
