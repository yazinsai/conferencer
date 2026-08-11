import { all, get, run } from "./db";
import { addDays, formatDate, formatEventDates, localToday, nowIso } from "./datetime";
import { appUrl, sendTemplate } from "./email";
import { listEvents } from "./repo/events";
import { contactName, getContact } from "./repo/contacts";
import { effectiveDue, listAssignments } from "./repo/tasks";
import { logAudit } from "./repo/audit";

export type CronResult = {
  draftReminders: number;
  taskReminders: number;
  digests: number;
};

/**
 * Scheduled sends (R-COM-4). Run from `npm run cron`, a platform cron trigger,
 * or POST /api/cron with CRON_SECRET. Every send is idempotent per day.
 */
export async function runDueJobs(now = new Date()): Promise<CronResult> {
  const result: CronResult = { draftReminders: 0, taskReminders: 0, digests: 0 };
  const today = localToday();

  for (const event of listEvents()) {
    /* -------------------------------------------- draft deadline reminders -- */
    const forms = all<{ id: string; name: string; closes_at: string | null }>(
      "SELECT id, name, closes_at FROM submission_forms WHERE event_id = ? AND status = 'open'",
      event.id,
    );
    for (const form of forms) {
      if (!form.closes_at) continue;
      const closeDay = form.closes_at.slice(0, 10);
      const isFiveDays = addDays(today, 5) === closeDay;
      const isOneDay = addDays(today, 1) === closeDay;
      if (!isFiveDays && !isOneDay) continue;

      const drafts = all<{ id: string; title: string; contact_id: string }>(
        `SELECT s.id, s.title, s.submitter_contact_id AS contact_id
           FROM submissions s
          WHERE s.form_id = ? AND s.status = 'draft' AND s.submitter_contact_id IS NOT NULL`,
        form.id,
      );
      for (const draft of drafts) {
        if (alreadySent(event.id, draft.contact_id, "draft_deadline_reminder", today)) continue;
        const contact = getContact(draft.contact_id);
        if (!contact?.email) continue;
        await sendTemplate({
          eventId: event.id,
          templateKey: "draft_deadline_reminder",
          to: contact.email,
          toName: contactName(contact),
          contactId: contact.id,
          context: {
            first_name: contact.first_name,
            speaker_name: contactName(contact),
            talk_title: draft.title,
            event_name: event.name,
            event_dates: formatEventDates(event.starts_at, event.ends_at),
            due_date: formatDate(form.closes_at),
            portal_link: appUrl("/portal/submissions"),
          },
        });
        result.draftReminders += 1;
      }
    }

    /* -------------------------------------------------- task due reminders -- */
    const assignments = listAssignments(event.id, { status: "outstanding" });
    const byContact = new Map<string, string[]>();
    for (const assignment of assignments) {
      const due = effectiveDue(assignment);
      if (!due) continue;
      const dueDay = due.slice(0, 10);
      const soon = dueDay === addDays(today, 3) || dueDay === addDays(today, 1);
      const overdue = dueDay < today;
      if (!soon && !overdue) continue;
      if (assignment.reminded_at && assignment.reminded_at.slice(0, 10) === today) continue;
      const list = byContact.get(assignment.contact_id) ?? [];
      list.push(`${assignment.task_name} (due ${formatDate(due)})`);
      byContact.set(assignment.contact_id, list);
      run("UPDATE task_assignments SET reminded_at = ? WHERE id = ?", nowIso(), assignment.id);
    }
    for (const [contactId, tasks] of byContact) {
      const contact = getContact(contactId);
      if (!contact?.email) continue;
      await sendTemplate({
        eventId: event.id,
        templateKey: "task_reminder",
        to: contact.email,
        toName: contactName(contact),
        contactId: contact.id,
        context: {
          first_name: contact.first_name,
          speaker_name: contactName(contact),
          event_name: event.name,
          task_name: tasks.join(", "),
          due_date: "soon",
          portal_link: appUrl("/portal/tasks"),
        },
      });
      result.taskReminders += 1;
    }

    /* ---------------------------------------------------- weekly digest ----- */
    const digestOn = get<{ send_weekly_digest: number }>(
      "SELECT send_weekly_digest FROM portals WHERE event_id = ? ORDER BY is_default DESC LIMIT 1",
      event.id,
    );
    const isMonday = now.getUTCDay() === 1;
    if (digestOn?.send_weekly_digest && isMonday) {
      const contacts = new Set(assignments.map((a) => a.contact_id));
      for (const contactId of contacts) {
        if (alreadySent(event.id, contactId, "speaker_announcement", today)) continue;
        const contact = getContact(contactId);
        if (!contact?.email) continue;
        const outstanding = assignments.filter((a) => a.contact_id === contactId);
        await sendTemplate({
          eventId: event.id,
          templateKey: "speaker_announcement",
          to: contact.email,
          toName: contactName(contact),
          contactId: contact.id,
          context: {
            first_name: contact.first_name,
            speaker_name: contactName(contact),
            event_name: event.name,
            event_dates: formatEventDates(event.starts_at, event.ends_at),
            event_location: event.location ?? "",
            task_name: `${outstanding.length} outstanding task(s)`,
            portal_link: appUrl("/portal/tasks"),
          },
        });
        result.digests += 1;
      }
    }

    if (result.draftReminders + result.taskReminders + result.digests > 0) {
      logAudit({
        eventId: event.id,
        entityType: "event",
        entityId: event.id,
        actorName: "Scheduler",
        action: "scheduled_emails",
        summary: `Scheduled run: ${result.draftReminders} draft reminders, ${result.taskReminders} task reminders, ${result.digests} digests`,
      });
    }
  }

  return result;
}

function alreadySent(
  eventId: string,
  contactId: string,
  templateKey: string,
  day: string,
): boolean {
  return Boolean(
    get(
      `SELECT id FROM email_messages
        WHERE event_id = ? AND to_contact_id = ? AND template_key = ?
          AND substr(created_at, 1, 10) = ?`,
      eventId,
      contactId,
      templateKey,
      day,
    ),
  );
}
