"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireOrganizer } from "@/lib/guards";
import { fullName } from "@/lib/auth";
import { addMinutes, formatRange, normalizeLocal, overlaps } from "@/lib/datetime";
import { logAudit } from "@/lib/repo/audit";
import { getLookup, listLookup } from "@/lib/repo/events";
import {
  getSubmission,
  getSubmissionRow,
  listParticipants,
  updateSubmission,
} from "@/lib/repo/submissions";
import { publishAgenda, scheduledSessions, unscheduledSessions } from "@/lib/repo/agenda";
import { appUrl, sendTemplate } from "@/lib/email";
import { buildIcs, calendarLinks } from "@/lib/ics";
import { getContact } from "@/lib/repo/contacts";

async function ctx(formData: FormData) {
  const slug = String(formData.get("slug"));
  const auth = await requireOrganizer(slug);
  return { slug, ...auth };
}

/** Place or move a session. Room clashes are refused; speaker clashes warn. */
export async function scheduleAction(formData: FormData) {
  const { slug, event, user } = await ctx(formData);
  const submissionId = String(formData.get("submission_id"));
  const submission = getSubmission(submissionId);
  if (!submission || submission.event_id !== event.id) return;

  const date = String(formData.get("date") ?? "").trim();
  const start = String(formData.get("start") ?? "").trim();
  const roomId = String(formData.get("room_id") ?? "").trim() || null;
  const view = String(formData.get("view") ?? "rooms");
  const backDay = String(formData.get("day") ?? date);

  if (!date || !start) {
    // Unscheduling.
    updateSubmission(submissionId, {
      starts_at: null,
      ends_at: null,
      location_id: null,
      ics_sequence: submission.ics_sequence + 1,
    });
    logAudit({
      eventId: event.id,
      entityType: "submission",
      entityId: submissionId,
      actorUserId: user.id,
      actorName: fullName(user),
      action: "unscheduled",
      summary: `Removed "${submission.title}" from the agenda`,
    });
    revalidatePath(`/admin/e/${slug}`, "layout");
    redirect(`/admin/e/${slug}/agenda?view=${view}&day=${backDay}&moved=1`);
  }

  const startsAt = normalizeLocal(`${date}T${start}`)!;
  const explicitEnd = String(formData.get("end") ?? "").trim();
  const format = submission.format_id ? getLookup("formats", submission.format_id) : undefined;
  const duration = format?.duration_minutes ?? 30;
  const endsAt = explicitEnd
    ? normalizeLocal(`${date}T${explicitEnd}`)!
    : addMinutes(startsAt, duration);

  // Room double-booking is blocked outright (R-AGN-5).
  if (roomId) {
    const clash = scheduledSessions(event.id).find(
      (other) =>
        other.id !== submissionId &&
        other.location_id === roomId &&
        overlaps(other.starts_at, other.ends_at, startsAt, endsAt),
    );
    if (clash) {
      const room = getLookup("rooms", roomId);
      redirect(
        `/admin/e/${slug}/agenda?view=${view}&day=${date}&error=${encodeURIComponent(
          `${room?.name ?? "That room"} is already booked at ${formatRange(
            clash.starts_at,
            clash.ends_at,
          )} by “${clash.title}”. Pick another room or time.`,
        )}`,
      );
    }
  }

  updateSubmission(submissionId, {
    starts_at: startsAt,
    ends_at: endsAt,
    location_id: roomId,
    ics_sequence: submission.ics_sequence + 1,
  });

  logAudit({
    eventId: event.id,
    entityType: "submission",
    entityId: submissionId,
    actorUserId: user.id,
    actorName: fullName(user),
    action: "scheduled",
    summary: `Scheduled "${submission.title}" for ${startsAt}${
      roomId ? ` in ${getLookup("rooms", roomId)?.name}` : ""
    }`,
    before: { starts_at: submission.starts_at, location_id: submission.location_id },
    after: { starts_at: startsAt, location_id: roomId },
  });

  revalidatePath(`/admin/e/${slug}`, "layout");
  redirect(`/admin/e/${slug}/agenda?view=${view}&day=${date}&moved=1`);
}

export async function publishAgendaAction(formData: FormData) {
  const { slug, event, user } = await ctx(formData);
  const changes = publishAgenda(event.id, user.id);
  logAudit({
    eventId: event.id,
    entityType: "event",
    entityId: event.id,
    actorUserId: user.id,
    actorName: fullName(user),
    action: "agenda_published",
    summary: `Published the agenda — ${changes.length} change(s)`,
  });
  revalidatePath(`/admin/e/${slug}`, "layout");
  revalidatePath(`/e/${slug}`, "layout");
  redirect(`/admin/e/${slug}/agenda?published=${changes.length}`);
}

/** One-action packing of everything still in the tray (R-AGN-10). */
export async function autoScheduleAction(formData: FormData) {
  const { slug, event, user } = await ctx(formData);
  const rooms = listLookup("rooms", event.id);
  if (!rooms.length) return;

  const days = String(formData.get("days") ?? "")
    .split(",")
    .map((d) => d.trim())
    .filter(Boolean);
  const dayList = days.length
    ? days
    : [...new Set(scheduledSessions(event.id).map((s) => s.starts_at?.slice(0, 10) ?? ""))].filter(
        Boolean,
      );
  const startHour = Number(formData.get("start_hour") ?? 9);
  const endHour = Number(formData.get("end_hour") ?? 17);

  const pending = unscheduledSessions(event.id);
  let placed = 0;

  for (const submission of pending) {
    const format = submission.format_id ? getLookup("formats", submission.format_id) : undefined;
    const duration = format?.duration_minutes ?? 30;
    let done = false;

    for (const day of dayList.length ? dayList : [event.starts_at?.slice(0, 10) ?? ""]) {
      if (!day || done) continue;
      for (let minute = startHour * 60; minute + duration <= endHour * 60 && !done; minute += 15) {
        const startsAt = `${day}T${String(Math.floor(minute / 60)).padStart(2, "0")}:${String(
          minute % 60,
        ).padStart(2, "0")}`;
        const endsAt = addMinutes(startsAt, duration);
        const current = scheduledSessions(event.id);

        for (const room of rooms) {
          const roomBusy = current.some(
            (other) =>
              other.location_id === room.id && overlaps(other.starts_at, other.ends_at, startsAt, endsAt),
          );
          if (roomBusy) continue;

          const speakerIds = listParticipants(submission.id)
            .filter((p) => p.role !== "submitter")
            .map((p) => p.contact_id);
          const speakerBusy = current.some((other) => {
            if (!overlaps(other.starts_at, other.ends_at, startsAt, endsAt)) return false;
            return listParticipants(other.id).some((p) => speakerIds.includes(p.contact_id));
          });
          if (speakerBusy) continue;

          updateSubmission(submission.id, {
            starts_at: startsAt,
            ends_at: endsAt,
            location_id: room.id,
          });
          placed += 1;
          done = true;
          break;
        }
      }
    }
  }

  logAudit({
    eventId: event.id,
    entityType: "event",
    entityId: event.id,
    actorUserId: user.id,
    actorName: fullName(user),
    action: "agenda_auto_scheduled",
    summary: `Auto-placed ${placed} session(s) into free, conflict-free slots`,
  });

  revalidatePath(`/admin/e/${slug}`, "layout");
  redirect(`/admin/e/${slug}/agenda?autoplaced=${placed}`);
}

/** Emails each confirmed speaker a calendar invite for their session (R-COM-5). */
export async function sendCalendarInvitesAction(formData: FormData) {
  const { slug, event, user } = await ctx(formData);
  const submissionId = String(formData.get("submission_id") ?? "");
  const sessions = submissionId
    ? [getSubmissionRow(submissionId)].filter(Boolean)
    : scheduledSessions(event.id);

  let sent = 0;
  for (const session of sessions) {
    if (!session || !session.starts_at) continue;
    const links = calendarLinks({
      title: session.title,
      description: session.description,
      location: session.room_name ?? event.location,
      start: session.starts_at,
      end: session.ends_at,
    });

    for (const participant of listParticipants(session.id)) {
      if (participant.role === "submitter") continue;
      const contact = getContact(participant.contact_id);
      if (!contact?.email) continue;

      const ics = buildIcs(
        [
          {
            uid: `${session.id}@conferencer`,
            title: session.title,
            description: session.description,
            location: session.room_name ?? event.location,
            start: session.starts_at,
            end: session.ends_at,
            sequence: session.ics_sequence,
            organizerName: fullName(user),
            organizerEmail: user.email,
            attendees: [{ name: `${contact.first_name} ${contact.last_name}`, email: contact.email }],
            url: appUrl(`/e/${event.slug}/sessions/${session.id}`),
          },
        ],
        { calendarName: event.name, timezone: event.timezone, method: "REQUEST" },
      );

      await sendTemplate({
        eventId: event.id,
        templateKey: "calendar_invite",
        to: contact.email,
        toName: `${contact.first_name} ${contact.last_name}`,
        contactId: contact.id,
        context: {
          first_name: contact.first_name,
          speaker_name: `${contact.first_name} ${contact.last_name}`,
          talk_title: session.title,
          event_name: event.name,
          room: session.room_name ?? event.location ?? "",
          session_time: formatRange(session.starts_at, session.ends_at),
          portal_link: appUrl("/portal"),
        },
        extraNote: `<p><a href="${links.google}">Add to Google Calendar</a> · <a href="${links.outlook}">Add to Outlook</a></p>
<p>Subscribe to every session you are speaking at: <a href="${appUrl(`/portal/calendar/${contact.id}.ics`)}">personal calendar feed</a></p>`,
        attachments: [
          { filename: `${session.title.slice(0, 40)}.ics`, contentType: "text/calendar", content: ics },
        ],
        force: true,
      });
      sent += 1;
    }
  }

  logAudit({
    eventId: event.id,
    entityType: "event",
    entityId: event.id,
    actorUserId: user.id,
    actorName: fullName(user),
    action: "calendar_invites_sent",
    summary: `Sent ${sent} calendar invite(s)`,
  });

  revalidatePath(`/admin/e/${slug}`, "layout");
  redirect(`/admin/e/${slug}/agenda?invites=${sent}`);
}
