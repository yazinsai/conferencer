import { addDays, endOfDay, startOfDay } from "date-fns";
import { and, eq, inArray, not } from "drizzle-orm";
import { getDb, schema } from "../lib/db";
import { sendTemplatedEmail } from "../lib/email/send";

function inDayWindow(iso: string, daysFromNow: number) {
  const d = new Date(iso);
  const start = addDays(startOfDay(new Date()), daysFromNow);
  const end = endOfDay(start);
  return d >= start && d <= end;
}

function effectiveDue(assignment: {
  dueAt: string | null;
  extendedDueAt: string | null;
}) {
  return assignment.extendedDueAt ?? assignment.dueAt;
}

function portalLink() {
  return `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/portal`;
}

async function remindDraftDeadlines() {
  const db = getDb();
  const forms = db.select().from(schema.submissionForms).all();
  let sent = 0;

  for (const form of forms) {
    if (!form.closesAt || form.status === "closed" || !form.allowDrafts) continue;
    const closingIn =
      inDayWindow(form.closesAt, 5) ? 5 : inDayWindow(form.closesAt, 1) ? 1 : null;
    if (!closingIn) continue;

    const event = db
      .select()
      .from(schema.events)
      .where(eq(schema.events.id, form.eventId))
      .get();
    if (!event) continue;

    const drafts = db
      .select({
        contact: schema.contacts,
        submission: schema.submissions,
      })
      .from(schema.submissions)
      .innerJoin(
        schema.contacts,
        eq(schema.submissions.submitterContactId, schema.contacts.id),
      )
      .where(
        and(
          eq(schema.submissions.formId, form.id),
          eq(schema.submissions.isDraft, true),
        ),
      )
      .all();

    const seen = new Set<string>();
    for (const { contact } of drafts) {
      if (seen.has(contact.id)) continue;
      seen.add(contact.id);

      await sendTemplatedEmail({
        eventId: event.id,
        toEmail: contact.email,
        toContactId: contact.id,
        templateKey: "draft_deadline_reminder",
        fields: {
          speaker_name: `${contact.firstName} ${contact.lastName}`,
          first_name: contact.firstName,
          event_name: event.name,
          portal_link: portalLink(),
        },
        bodyAppend: `Form "${form.name}" closes in ${closingIn} day${closingIn === 1 ? "" : "s"}.`,
      });
      sent += 1;
    }
  }

  return sent;
}

async function remindTasks() {
  const db = getDb();
  const incomplete = db
    .select({
      assignment: schema.taskAssignments,
      contact: schema.contacts,
      task: schema.tasks,
    })
    .from(schema.taskAssignments)
    .innerJoin(schema.contacts, eq(schema.taskAssignments.contactId, schema.contacts.id))
    .innerJoin(schema.tasks, eq(schema.taskAssignments.taskId, schema.tasks.id))
    .where(
      not(inArray(schema.taskAssignments.status, ["complete", "approved"])),
    )
    .all();

  let sent = 0;
  const seen = new Set<string>();

  for (const { assignment, contact, task } of incomplete) {
    const due = effectiveDue(assignment);
    if (!due) continue;

    const overdue = new Date(due) < new Date();
    const dueSoon = inDayWindow(due, 1);
    if (!overdue && !dueSoon) continue;

    const key = `${assignment.id}:${overdue ? "overdue" : "due"}`;
    if (seen.has(key)) continue;
    seen.add(key);

    const event = db
      .select()
      .from(schema.events)
      .where(eq(schema.events.id, assignment.eventId))
      .get();
    if (!event) continue;

    await sendTemplatedEmail({
      eventId: event.id,
      toEmail: contact.email,
      toContactId: contact.id,
      templateKey: "task_reminder",
      fields: {
        speaker_name: `${contact.firstName} ${contact.lastName}`,
        first_name: contact.firstName,
        event_name: event.name,
        due_date: new Date(due).toLocaleDateString(),
        portal_link: portalLink(),
      },
      bodyAppend: overdue
        ? `Task "${task.name}" is overdue.`
        : `Task "${task.name}" is due tomorrow.`,
    });
    sent += 1;
  }

  return sent;
}

async function main() {
  console.log("Running reminder jobs…");
  const draftReminders = await remindDraftDeadlines();
  const taskReminders = await remindTasks();
  console.log(
    `Done. Sent ${draftReminders} draft deadline reminder(s) and ${taskReminders} task reminder(s).`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
