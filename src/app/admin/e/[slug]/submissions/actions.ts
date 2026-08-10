"use server";

import { and, eq, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requireEventRole } from "@/lib/auth/guards";
import { getDb, schema } from "@/lib/db";
import { nowIso } from "@/lib/dates";
import { id } from "@/lib/id";
import { sendTemplatedEmail } from "@/lib/email/send";
import { SUBMISSION_STATUSES } from "@/lib/domain/status";

async function audit(
  eventId: string,
  actorUserId: string,
  entityId: string,
  action: string,
  before: unknown,
  after: unknown,
) {
  getDb()
    .insert(schema.auditEntries)
    .values({
      id: id("aud"),
      eventId,
      entityType: "submission",
      entityId,
      actorUserId,
      action,
      before: JSON.stringify(before),
      after: JSON.stringify(after),
      createdAt: nowIso(),
    })
    .run();
}

export async function updateSubmissionStatusAction(formData: FormData) {
  const slug = String(formData.get("slug") || "");
  const submissionId = String(formData.get("submissionId") || "");
  const status = String(formData.get("status") || "");
  const { user, event } = await requireEventRole(slug, ["organizer"]);
  if (!SUBMISSION_STATUSES.includes(status as (typeof SUBMISSION_STATUSES)[number])) {
    throw new Error("Invalid status");
  }
  const db = getDb();
  const before = db
    .select()
    .from(schema.submissions)
    .where(
      and(
        eq(schema.submissions.id, submissionId),
        eq(schema.submissions.eventId, event.id),
      ),
    )
    .get();
  if (!before) throw new Error("Not found");

  const patch: Record<string, unknown> = {
    status,
    updatedAt: nowIso(),
    isDraft: status === "draft",
  };

  if (status === "accepted") {
    await onAccept(event.id, submissionId, user.id, slug);
    patch.approvalStatus =
      before.approvalStatus === "draft" ? "in_review" : before.approvalStatus;
  }

  db.update(schema.submissions)
    .set(patch)
    .where(eq(schema.submissions.id, submissionId))
    .run();

  await audit(event.id, user.id, submissionId, "status_change", before, {
    ...before,
    ...patch,
  });
  revalidatePath(`/admin/e/${slug}/submissions`);
  revalidatePath(`/admin/e/${slug}/submissions/${submissionId}`);
  revalidatePath(`/portal`);
}

export async function bulkUpdateStatusAction(formData: FormData) {
  const slug = String(formData.get("slug") || "");
  const status = String(formData.get("status") || "");
  const ids = formData.getAll("ids").map(String).filter(Boolean);
  const { user, event } = await requireEventRole(slug, ["organizer"]);
  if (!ids.length) return;
  const db = getDb();
  for (const submissionId of ids) {
    const before = db
      .select()
      .from(schema.submissions)
      .where(
        and(
          eq(schema.submissions.id, submissionId),
          eq(schema.submissions.eventId, event.id),
        ),
      )
      .get();
    if (!before) continue;
    db.update(schema.submissions)
      .set({ status, updatedAt: nowIso(), isDraft: status === "draft" })
      .where(eq(schema.submissions.id, submissionId))
      .run();
    if (status === "accepted") {
      await onAccept(event.id, submissionId, user.id, slug);
    }
    await audit(event.id, user.id, submissionId, "bulk_status_change", before, {
      status,
    });
  }
  revalidatePath(`/admin/e/${slug}/submissions`);
}

async function onAccept(
  eventId: string,
  submissionId: string,
  actorUserId: string,
  slug: string,
) {
  const db = getDb();
  const participants = db
    .select()
    .from(schema.submissionParticipants)
    .where(eq(schema.submissionParticipants.submissionId, submissionId))
    .all();
  const defaultTasks = db
    .select()
    .from(schema.tasks)
    .where(eq(schema.tasks.eventId, eventId))
    .all();
  const createdAt = nowIso();

  for (const p of participants) {
    const existing = db
      .select()
      .from(schema.eventContacts)
      .where(
        and(
          eq(schema.eventContacts.eventId, eventId),
          eq(schema.eventContacts.contactId, p.contactId),
        ),
      )
      .get();
    if (existing) {
      db.update(schema.eventContacts)
        .set({ status: "active", speakerStatus: "confirmed" })
        .where(eq(schema.eventContacts.id, existing.id))
        .run();
    } else {
      db.insert(schema.eventContacts)
        .values({
          id: id("ec"),
          eventId,
          contactId: p.contactId,
          status: "active",
          speakerStatus: "confirmed",
          createdAt,
        })
        .run();
    }

    const contact = db
      .select()
      .from(schema.contacts)
      .where(eq(schema.contacts.id, p.contactId))
      .get();
    if (contact?.userId) {
      const mem = db
        .select()
        .from(schema.eventMemberships)
        .where(
          and(
            eq(schema.eventMemberships.eventId, eventId),
            eq(schema.eventMemberships.userId, contact.userId),
            eq(schema.eventMemberships.role, "participant"),
          ),
        )
        .get();
      if (!mem) {
        db.insert(schema.eventMemberships)
          .values({
            id: id("mem"),
            eventId,
            userId: contact.userId,
            role: "participant",
            createdAt,
          })
          .run();
      }
    }

    for (const task of defaultTasks) {
      const has = db
        .select()
        .from(schema.taskAssignments)
        .where(
          and(
            eq(schema.taskAssignments.taskId, task.id),
            eq(schema.taskAssignments.contactId, p.contactId),
          ),
        )
        .get();
      if (!has) {
        db.insert(schema.taskAssignments)
          .values({
            id: id("ta"),
            taskId: task.id,
            eventId,
            contactId: p.contactId,
            submissionId,
            dueAt: "2027-04-15T00:00:00Z",
            isRequired: true,
            status: "not_started",
            createdAt,
          })
          .run();
      }
    }

    if (contact) {
      const event = db
        .select()
        .from(schema.events)
        .where(eq(schema.events.id, eventId))
        .get();
      const sub = db
        .select()
        .from(schema.submissions)
        .where(eq(schema.submissions.id, submissionId))
        .get();
      await sendTemplatedEmail({
        eventId,
        toEmail: contact.email,
        toContactId: contact.id,
        templateKey: "portal_invite",
        fields: {
          speaker_name: `${contact.firstName} ${contact.lastName}`,
          first_name: contact.firstName,
          talk_title: sub?.title,
          event_name: event?.name,
          portal_link: `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/portal`,
        },
      });
    }
  }
  void actorUserId;
  void slug;
}

export async function sendDecisionsAction(formData: FormData) {
  const slug = String(formData.get("slug") || "");
  const mode = String(formData.get("mode") || "accepted");
  const note = String(formData.get("note") || "");
  const { event } = await requireEventRole(slug, ["organizer"]);
  const db = getDb();
  const status = mode === "declined" ? "declined" : "accepted";
  const templateKey = mode === "declined" ? "decision_declined" : "decision_accepted";
  const rows = db
    .select()
    .from(schema.submissions)
    .where(
      and(
        eq(schema.submissions.eventId, event.id),
        eq(schema.submissions.status, status),
      ),
    )
    .all();

  let sent = 0;
  for (const sub of rows) {
    const participants = db
      .select({
        contact: schema.contacts,
      })
      .from(schema.submissionParticipants)
      .innerJoin(
        schema.contacts,
        eq(schema.submissionParticipants.contactId, schema.contacts.id),
      )
      .where(eq(schema.submissionParticipants.submissionId, sub.id))
      .all();
    const track = sub.trackId
      ? db.select().from(schema.tracks).where(eq(schema.tracks.id, sub.trackId)).get()
      : null;
    for (const { contact } of participants) {
      await sendTemplatedEmail({
        eventId: event.id,
        toEmail: contact.email,
        toContactId: contact.id,
        templateKey,
        bodyAppend: note || undefined,
        fields: {
          speaker_name: `${contact.firstName} ${contact.lastName}`,
          first_name: contact.firstName,
          talk_title: sub.title,
          event_name: event.name,
          track: track?.name,
          portal_link: `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/portal`,
        },
      });
      sent++;
    }
    db.update(schema.submissions)
      .set({ notifiedAt: nowIso(), updatedAt: nowIso() })
      .where(eq(schema.submissions.id, sub.id))
      .run();
  }
  revalidatePath(`/admin/e/${slug}/submissions`);
  revalidatePath(`/admin/e/${slug}/emails`);
  void sent;
}

export async function createManualSubmissionAction(formData: FormData) {
  const slug = String(formData.get("slug") || "");
  const kind = String(formData.get("kind") || "abstract") as "abstract" | "session";
  const title = String(formData.get("title") || "").trim();
  const description = String(formData.get("description") || "");
  const trackId = String(formData.get("trackId") || "") || null;
  const formatId = String(formData.get("formatId") || "") || null;
  const { user, event } = await requireEventRole(slug, ["organizer"]);
  if (!title) throw new Error("Title required");
  const db = getDb();
  const sid = id("sub");
  const createdAt = nowIso();
  db.insert(schema.submissions)
    .values({
      id: sid,
      eventId: event.id,
      kind,
      status: kind === "session" ? "accepted" : "pending",
      title,
      description,
      trackId,
      formatId,
      answers: "{}",
      approvalStatus: kind === "session" ? "approved" : "draft",
      createdAt,
      updatedAt: createdAt,
    })
    .run();
  await audit(event.id, user.id, sid, "create", null, { title, kind });
  revalidatePath(`/admin/e/${slug}/submissions`);
}

export async function setApprovalStatusAction(formData: FormData) {
  const slug = String(formData.get("slug") || "");
  const submissionId = String(formData.get("submissionId") || "");
  const approvalStatus = String(formData.get("approvalStatus") || "draft");
  const { user, event } = await requireEventRole(slug, ["organizer"]);
  const db = getDb();
  db.update(schema.submissions)
    .set({ approvalStatus, updatedAt: nowIso() })
    .where(
      and(
        eq(schema.submissions.id, submissionId),
        eq(schema.submissions.eventId, event.id),
      ),
    )
    .run();
  await audit(event.id, user.id, submissionId, "approval_status", null, {
    approvalStatus,
  });
  revalidatePath(`/admin/e/${slug}/submissions/${submissionId}`);
  revalidatePath(`/e/${slug}/sessions`);
}
