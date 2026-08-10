"use server";

import { and, asc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireEventRole } from "@/lib/auth/guards";
import {
  checkRoomConflictForCandidate,
  loadAgendaSubmissions,
  loadScheduledSubmissions,
  loadUnscheduledSubmissions,
  speakerConflictsForCandidate,
} from "@/lib/calendar/agenda-data";
import { combineDateAndTime } from "@/lib/calendar/agenda-dates";
import {
  buildCalendarInvite,
  icsEmailHtml,
} from "@/lib/calendar/ics";
import { nowIso } from "@/lib/dates";
import { getDb, schema } from "@/lib/db";
import type { TimedSession } from "@/lib/domain/conflicts";
import { sendEmail } from "@/lib/email/send";
import { id } from "@/lib/id";
import {
  computeAutoScheduleDraft,
  type DraftPlacement,
} from "@/lib/calendar/auto-schedule";

function revalidateAgenda(slug: string) {
  revalidatePath(`/admin/e/${slug}/agenda`);
  revalidatePath(`/admin/e/${slug}`);
}

function agendaUrl(slug: string, params?: Record<string, string>) {
  const base = `/admin/e/${slug}/agenda`;
  if (!params || !Object.keys(params).length) return base;
  const q = new URLSearchParams(params);
  return `${base}?${q.toString()}`;
}

async function sendSessionInvites(opts: {
  event: { id: string; name: string; location: string | null };
  submissionId: string;
  title: string;
  startsAt: string;
  endsAt: string;
  roomName: string | null;
}) {
  const db = getDb();
  const participants = db
    .select({
      contact: schema.contacts,
      acceptanceStatus: schema.submissionParticipants.acceptanceStatus,
      speakerStatus: schema.eventContacts.speakerStatus,
    })
    .from(schema.submissionParticipants)
    .innerJoin(
      schema.contacts,
      eq(schema.submissionParticipants.contactId, schema.contacts.id),
    )
    .leftJoin(
      schema.eventContacts,
      and(
        eq(schema.eventContacts.contactId, schema.contacts.id),
        eq(schema.eventContacts.eventId, opts.event.id),
      ),
    )
    .where(eq(schema.submissionParticipants.submissionId, opts.submissionId))
    .all();

  const location = [opts.roomName, opts.event.location].filter(Boolean).join(", ");
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";

  for (const { contact, acceptanceStatus, speakerStatus } of participants) {
    const confirmed =
      acceptanceStatus === "accepted" || speakerStatus === "confirmed";
    if (!confirmed) continue;

    const icsEvent = {
      uid: `${opts.submissionId}@${opts.event.id}@conferencer`,
      summary: opts.title,
      description: `Speaking at ${opts.event.name}`,
      location: location || undefined,
      startsAt: opts.startsAt,
      endsAt: opts.endsAt,
      organizerEmail:
        process.env.EMAIL_FROM?.match(/<([^>]+)>/)?.[1] ?? "events@conferencer.local",
      organizerName: opts.event.name,
      attendees: [
        { email: contact.email, name: `${contact.firstName} ${contact.lastName}` },
      ],
    };
    const ics = buildCalendarInvite(icsEvent);

    const calendarLink =
      contact.calendarToken && appUrl
        ? `${appUrl}/portal/calendar/${contact.calendarToken}`
        : null;

    const bodyHtml =
      `<p>Hi ${contact.firstName},</p>` +
      `<p>Your session <strong>${opts.title}</strong> at <strong>${opts.event.name}</strong> has been scheduled.</p>` +
      `<p><strong>When:</strong> ${new Date(opts.startsAt).toLocaleString()} – ${new Date(opts.endsAt).toLocaleTimeString()}</p>` +
      (location ? `<p><strong>Where:</strong> ${location}</p>` : "") +
      icsEmailHtml(icsEvent, ics) +
      (calendarLink
        ? `<p>You can also subscribe to your personal calendar feed: <a href="${calendarLink}">${calendarLink}</a></p>`
        : "");

    await sendEmail({
      eventId: opts.event.id,
      toEmail: contact.email,
      toContactId: contact.id,
      subject: `Scheduled: ${opts.title} — ${opts.event.name}`,
      bodyHtml,
      templateKey: "session_scheduled",
    });
  }
}

export async function scheduleSessionAction(formData: FormData) {
  const slug = String(formData.get("slug") || "");
  const submissionId = String(formData.get("submissionId") || "");
  const date = String(formData.get("date") || "");
  const startTime = String(formData.get("startTime") || "");
  const endTime = String(formData.get("endTime") || "");
  const locationId = String(formData.get("locationId") || "");
  const view = String(formData.get("view") || "list");
  const day = String(formData.get("day") || "");

  const { event } = await requireEventRole(slug, ["organizer"]);
  if (!submissionId || !date || !startTime || !endTime || !locationId) {
    redirect(
      agendaUrl(slug, {
        view,
        ...(day ? { day } : {}),
        error: "missing_fields",
        schedule: submissionId,
      }),
    );
  }

  const startsAt = combineDateAndTime(date, startTime, event.startsAt);
  const endsAt = combineDateAndTime(date, endTime, event.startsAt);
  if (new Date(endsAt) <= new Date(startsAt)) {
    redirect(
      agendaUrl(slug, {
        view,
        ...(day ? { day } : {}),
        error: "invalid_times",
        schedule: submissionId,
      }),
    );
  }

  const db = getDb();
  const submission = db
    .select()
    .from(schema.submissions)
    .where(
      and(
        eq(schema.submissions.id, submissionId),
        eq(schema.submissions.eventId, event.id),
        eq(schema.submissions.status, "accepted"),
      ),
    )
    .get();
  if (!submission) {
    redirect(agendaUrl(slug, { view, error: "not_found" }));
  }

  const candidate: TimedSession = {
    id: submissionId,
    title: submission.title,
    startsAt,
    endsAt,
    locationId,
    participantContactIds:
      loadAgendaSubmissions(event.id).find((s) => s.id === submissionId)
        ?.participantContactIds ?? [],
  };

  if (checkRoomConflictForCandidate(event.id, candidate)) {
    redirect(
      agendaUrl(slug, {
        view,
        ...(day ? { day } : {}),
        error: "room_conflict",
        schedule: submissionId,
      }),
    );
  }

  const speakerWarnings = speakerConflictsForCandidate(event.id, candidate);

  db.update(schema.submissions)
    .set({
      startsAt,
      endsAt,
      locationId,
      updatedAt: nowIso(),
    })
    .where(eq(schema.submissions.id, submissionId))
    .run();

  const room = db
    .select()
    .from(schema.rooms)
    .where(eq(schema.rooms.id, locationId))
    .get();

  await sendSessionInvites({
    event,
    submissionId,
    title: submission.title,
    startsAt,
    endsAt,
    roomName: room?.name ?? null,
  });

  db.insert(schema.auditEntries)
    .values({
      id: id("aud"),
      eventId: event.id,
      entityType: "submission",
      entityId: submissionId,
      action: "schedule",
      before: JSON.stringify({
        startsAt: submission.startsAt,
        endsAt: submission.endsAt,
        locationId: submission.locationId,
      }),
      after: JSON.stringify({ startsAt, endsAt, locationId }),
      createdAt: nowIso(),
    })
    .run();

  revalidateAgenda(slug);

  const params: Record<string, string> = { view };
  if (day) params.day = day;
  if (speakerWarnings.length) params.warn = "speaker_conflict";
  params.scheduled = submissionId;
  redirect(agendaUrl(slug, params));
}

/** Client DnD drop handler — returns error instead of redirecting. */
export async function scheduleFromDropAction(input: {
  slug: string;
  submissionId: string;
  date: string;
  startTime: string;
  endTime: string;
  roomId: string;
  view?: string;
}): Promise<{ ok: true; warn?: string } | { ok: false; error: string }> {
  const { event } = await requireEventRole(input.slug, ["organizer"]);
  const { submissionId, date, startTime, endTime, roomId } = input;
  if (!submissionId || !date || !startTime || !endTime || !roomId) {
    return { ok: false, error: "Date, times, and room are required." };
  }

  const startsAt = combineDateAndTime(date, startTime, event.startsAt);
  const endsAt = combineDateAndTime(date, endTime, event.startsAt);
  if (new Date(endsAt) <= new Date(startsAt)) {
    return { ok: false, error: "End time must be after start time." };
  }

  const db = getDb();
  const submission = db
    .select()
    .from(schema.submissions)
    .where(
      and(
        eq(schema.submissions.id, submissionId),
        eq(schema.submissions.eventId, event.id),
        eq(schema.submissions.status, "accepted"),
      ),
    )
    .get();
  if (!submission) return { ok: false, error: "Submission not found." };

  const candidate: TimedSession = {
    id: submissionId,
    title: submission.title,
    startsAt,
    endsAt,
    locationId: roomId,
    participantContactIds:
      loadAgendaSubmissions(event.id).find((s) => s.id === submissionId)
        ?.participantContactIds ?? [],
  };

  if (checkRoomConflictForCandidate(event.id, candidate)) {
    return {
      ok: false,
      error: "Cannot save: this room is already booked for an overlapping time.",
    };
  }

  const speakerWarnings = speakerConflictsForCandidate(event.id, candidate);

  db.update(schema.submissions)
    .set({
      startsAt,
      endsAt,
      locationId: roomId,
      updatedAt: nowIso(),
    })
    .where(eq(schema.submissions.id, submissionId))
    .run();

  const room = db
    .select()
    .from(schema.rooms)
    .where(eq(schema.rooms.id, roomId))
    .get();

  await sendSessionInvites({
    event,
    submissionId,
    title: submission.title,
    startsAt,
    endsAt,
    roomName: room?.name ?? null,
  });

  db.insert(schema.auditEntries)
    .values({
      id: id("aud"),
      eventId: event.id,
      entityType: "submission",
      entityId: submissionId,
      action: "schedule_drop",
      before: JSON.stringify({
        startsAt: submission.startsAt,
        endsAt: submission.endsAt,
        locationId: submission.locationId,
      }),
      after: JSON.stringify({ startsAt, endsAt, locationId: roomId }),
      createdAt: nowIso(),
    })
    .run();

  revalidateAgenda(input.slug);
  return {
    ok: true,
    warn: speakerWarnings.length ? "speaker_conflict" : undefined,
  };
}

export async function unscheduleSessionAction(formData: FormData) {
  const slug = String(formData.get("slug") || "");
  const submissionId = String(formData.get("submissionId") || "");
  const view = String(formData.get("view") || "list");
  const day = String(formData.get("day") || "");

  const { event } = await requireEventRole(slug, ["organizer"]);
  const db = getDb();
  const submission = db
    .select()
    .from(schema.submissions)
    .where(
      and(
        eq(schema.submissions.id, submissionId),
        eq(schema.submissions.eventId, event.id),
      ),
    )
    .get();
  if (!submission) {
    redirect(agendaUrl(slug, { view, error: "not_found" }));
  }

  db.update(schema.submissions)
    .set({
      startsAt: null,
      endsAt: null,
      locationId: null,
      updatedAt: nowIso(),
    })
    .where(eq(schema.submissions.id, submissionId))
    .run();

  db.insert(schema.auditEntries)
    .values({
      id: id("aud"),
      eventId: event.id,
      entityType: "submission",
      entityId: submissionId,
      action: "unschedule",
      before: JSON.stringify({
        startsAt: submission.startsAt,
        endsAt: submission.endsAt,
        locationId: submission.locationId,
      }),
      after: JSON.stringify({ startsAt: null, endsAt: null, locationId: null }),
      createdAt: nowIso(),
    })
    .run();

  revalidateAgenda(slug);
  redirect(
    agendaUrl(slug, {
      view,
      ...(day ? { day } : {}),
      unscheduled: submissionId,
    }),
  );
}

export async function publishAgendaAction(formData: FormData) {
  const slug = String(formData.get("slug") || "");
  const view = String(formData.get("view") || "list");
  const { event } = await requireEventRole(slug, ["organizer"]);
  const db = getDb();
  const publishedAt = nowIso();
  const scheduledCount = db
    .select()
    .from(schema.submissions)
    .where(
      and(
        eq(schema.submissions.eventId, event.id),
        eq(schema.submissions.status, "accepted"),
      ),
    )
    .all()
    .filter((s) => s.startsAt).length;

  db.update(schema.events)
    .set({ agendaPublishedAt: publishedAt })
    .where(eq(schema.events.id, event.id))
    .run();

  db.insert(schema.auditEntries)
    .values({
      id: id("aud"),
      eventId: event.id,
      entityType: "event",
      entityId: event.id,
      action: "publish_agenda",
      before: JSON.stringify({ agendaPublishedAt: event.agendaPublishedAt }),
      after: JSON.stringify({ agendaPublishedAt: publishedAt, scheduledCount }),
      createdAt: publishedAt,
    })
    .run();

  revalidateAgenda(slug);
  redirect(
    agendaUrl(slug, {
      view,
      published: "1",
      scheduled: String(scheduledCount),
    }),
  );
}

export type AutoScheduleDraftResult = {
  placements: DraftPlacement[];
  unplaced: Array<{ submissionId: string; title: string; reason: string }>;
  speakerWarnings: number;
};

export async function autoScheduleAssistAction(
  formData: FormData,
): Promise<AutoScheduleDraftResult> {
  const slug = String(formData.get("slug") || "");
  const { event } = await requireEventRole(slug, ["organizer"]);
  const db = getDb();

  const rooms = db
    .select()
    .from(schema.rooms)
    .where(eq(schema.rooms.eventId, event.id))
    .orderBy(asc(schema.rooms.sortOrder))
    .all();

  const unscheduled = loadUnscheduledSubmissions(event.id);
  const scheduled = loadScheduledSubmissions(event.id);

  return computeAutoScheduleDraft({
    eventStartsAt: event.startsAt,
    eventEndsAt: event.endsAt,
    rooms: rooms.map((r) => ({ id: r.id, name: r.name })),
    scheduled: scheduled.map((s) => ({
      id: s.id,
      title: s.title,
      startsAt: s.startsAt,
      endsAt: s.endsAt,
      locationId: s.locationId,
      participantContactIds: s.participantContactIds,
    })),
    unscheduled: unscheduled.map((s) => ({
      id: s.id,
      title: s.title,
      participantContactIds: s.participantContactIds,
      durationMinutes: s.formatDurationMinutes ?? 30,
    })),
  });
}

export async function commitAutoScheduleDraftAction(formData: FormData) {
  const slug = String(formData.get("slug") || "");
  const view = String(formData.get("view") || "list");
  const day = String(formData.get("day") || "");
  const raw = String(formData.get("placements") || "[]");

  const { event } = await requireEventRole(slug, ["organizer"]);
  const db = getDb();

  let placements: DraftPlacement[];
  try {
    placements = JSON.parse(raw) as DraftPlacement[];
    if (!Array.isArray(placements)) throw new Error("invalid");
  } catch {
    redirect(
      agendaUrl(slug, {
        view,
        ...(day ? { day } : {}),
        error: "invalid_draft",
      }),
    );
  }

  let speakerWarnCount = 0;
  const committed: string[] = [];

  for (const p of placements) {
    const submission = db
      .select()
      .from(schema.submissions)
      .where(
        and(
          eq(schema.submissions.id, p.submissionId),
          eq(schema.submissions.eventId, event.id),
          eq(schema.submissions.status, "accepted"),
        ),
      )
      .get();
    if (!submission) continue;

    const candidate: TimedSession = {
      id: p.submissionId,
      title: submission.title,
      startsAt: p.startsAt,
      endsAt: p.endsAt,
      locationId: p.locationId,
      participantContactIds:
        loadAgendaSubmissions(event.id).find((s) => s.id === p.submissionId)
          ?.participantContactIds ?? [],
    };

    if (checkRoomConflictForCandidate(event.id, candidate)) {
      redirect(
        agendaUrl(slug, {
          view,
          ...(day ? { day } : {}),
          error: "room_conflict",
        }),
      );
    }

    const speakerWarnings = speakerConflictsForCandidate(event.id, candidate);
    if (speakerWarnings.length) speakerWarnCount++;

    db.update(schema.submissions)
      .set({
        startsAt: p.startsAt,
        endsAt: p.endsAt,
        locationId: p.locationId,
        updatedAt: nowIso(),
      })
      .where(eq(schema.submissions.id, p.submissionId))
      .run();

    const room = db
      .select()
      .from(schema.rooms)
      .where(eq(schema.rooms.id, p.locationId))
      .get();

    await sendSessionInvites({
      event,
      submissionId: p.submissionId,
      title: submission.title,
      startsAt: p.startsAt,
      endsAt: p.endsAt,
      roomName: room?.name ?? p.roomName ?? null,
    });

    db.insert(schema.auditEntries)
      .values({
        id: id("aud"),
        eventId: event.id,
        entityType: "submission",
        entityId: p.submissionId,
        action: "schedule",
        before: JSON.stringify({
          startsAt: submission.startsAt,
          endsAt: submission.endsAt,
          locationId: submission.locationId,
        }),
        after: JSON.stringify({
          startsAt: p.startsAt,
          endsAt: p.endsAt,
          locationId: p.locationId,
          source: "auto_schedule_assist",
        }),
        createdAt: nowIso(),
      })
      .run();

    committed.push(p.submissionId);
  }

  revalidateAgenda(slug);

  const params: Record<string, string> = {
    view,
    scheduled: String(committed.length),
  };
  if (day) params.day = day;
  if (speakerWarnCount) params.warn = "speaker_conflict";
  redirect(agendaUrl(slug, params));
}
