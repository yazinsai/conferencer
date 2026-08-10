import { and, asc, count, desc, eq, like, or, sql } from "drizzle-orm";
import { getDb, schema } from "@/lib/db";

export function getDefaultEvent() {
  const db = getDb();
  return (
    db
      .select()
      .from(schema.events)
      .where(eq(schema.events.slug, "devflow-conf-2027"))
      .get() ?? db.select().from(schema.events).limit(1).get()
  );
}

export function getEventOrThrow(slug: string) {
  const db = getDb();
  const event = db
    .select()
    .from(schema.events)
    .where(eq(schema.events.slug, slug))
    .get();
  if (!event) throw new Error("Event not found");
  return event;
}

export function submissionStatusCounts(eventId: string) {
  const db = getDb();
  const rows = db
    .select({
      status: schema.submissions.status,
      c: count(),
    })
    .from(schema.submissions)
    .where(eq(schema.submissions.eventId, eventId))
    .groupBy(schema.submissions.status)
    .all();
  const map: Record<string, number> = {};
  for (const r of rows) map[r.status] = Number(r.c);
  return map;
}

function submissionFilters(opts: {
  eventId: string;
  status?: string;
  kind?: string;
  q?: string;
}) {
  const filters = [eq(schema.submissions.eventId, opts.eventId)];
  if (opts.status && opts.status !== "all") {
    filters.push(eq(schema.submissions.status, opts.status));
  }
  if (opts.kind) {
    filters.push(eq(schema.submissions.kind, opts.kind));
  }
  if (opts.q) {
    filters.push(
      or(
        like(schema.submissions.title, `%${opts.q}%`),
        like(schema.submissions.description, `%${opts.q}%`),
      )!,
    );
  }
  return filters;
}

export function countSubmissions(opts: {
  eventId: string;
  status?: string;
  kind?: string;
  q?: string;
}) {
  const db = getDb();
  const row = db
    .select({ c: count() })
    .from(schema.submissions)
    .where(and(...submissionFilters(opts)))
    .get();
  return Number(row?.c ?? 0);
}

export function listSubmissions(opts: {
  eventId: string;
  status?: string;
  kind?: string;
  q?: string;
  limit?: number;
  offset?: number;
}) {
  const db = getDb();
  return db
    .select()
    .from(schema.submissions)
    .where(and(...submissionFilters(opts)))
    .orderBy(desc(schema.submissions.updatedAt))
    .limit(opts.limit ?? 50)
    .offset(opts.offset ?? 0)
    .all();
}

export type FormQuestionRow = {
  id: string;
  sectionId: string;
  label: string;
  helpText: string | null;
  isRequired: boolean;
  sortOrder: number;
  field: {
    id: string;
    key: string;
    type: string;
    options: string[];
    maxLength: number | null;
  };
};

export function loadFormQuestions(formId: string): FormQuestionRow[] {
  const db = getDb();
  const questionRows = db
    .select({
      id: schema.formQuestions.id,
      sectionId: schema.formQuestions.sectionId,
      labelOverride: schema.formQuestions.labelOverride,
      helpText: schema.formQuestions.helpText,
      isRequired: schema.formQuestions.isRequired,
      sortOrder: schema.formQuestions.sortOrder,
      fieldId: schema.formQuestions.fieldId,
      fieldKey: schema.fields.key,
      fieldType: schema.fields.type,
      fieldOptions: schema.fields.options,
      fieldMaxLength: schema.fields.maxLength,
      fieldLabel: schema.fields.label,
    })
    .from(schema.formQuestions)
    .innerJoin(schema.fields, eq(schema.formQuestions.fieldId, schema.fields.id))
    .where(eq(schema.formQuestions.formId, formId))
    .orderBy(asc(schema.formQuestions.sortOrder))
    .all();

  return questionRows.map((q) => {
    let options: string[] = [];
    try {
      const parsed = JSON.parse(q.fieldOptions ?? "[]");
      options = Array.isArray(parsed) ? parsed.map(String) : [];
    } catch {
      options = [];
    }
    return {
      id: q.id,
      sectionId: q.sectionId,
      label: q.labelOverride ?? q.fieldLabel,
      helpText: q.helpText,
      isRequired: q.isRequired,
      sortOrder: q.sortOrder,
      field: {
        id: q.fieldId,
        key: q.fieldKey,
        type: q.fieldType,
        options,
        maxLength: q.fieldMaxLength,
      },
    };
  });
}

export function getSubmissionParticipants(submissionId: string) {
  const db = getDb();
  return db
    .select({
      id: schema.submissionParticipants.id,
      role: schema.submissionParticipants.role,
      acceptanceStatus: schema.submissionParticipants.acceptanceStatus,
      sortOrder: schema.submissionParticipants.sortOrder,
      contactId: schema.contacts.id,
      firstName: schema.contacts.firstName,
      lastName: schema.contacts.lastName,
      email: schema.contacts.email,
      jobTitle: schema.contacts.jobTitle,
      company: schema.contacts.company,
      headshotUrl: schema.contacts.headshotUrl,
      biography: schema.contacts.biography,
    })
    .from(schema.submissionParticipants)
    .innerJoin(
      schema.contacts,
      eq(schema.submissionParticipants.contactId, schema.contacts.id),
    )
    .where(eq(schema.submissionParticipants.submissionId, submissionId))
    .orderBy(asc(schema.submissionParticipants.sortOrder))
    .all();
}

export function getContactForUser(eventId: string, userId: string) {
  const db = getDb();
  return db
    .select({
      contact: schema.contacts,
      eventContact: schema.eventContacts,
    })
    .from(schema.contacts)
    .innerJoin(
      schema.eventContacts,
      eq(schema.eventContacts.contactId, schema.contacts.id),
    )
    .where(
      and(
        eq(schema.contacts.userId, userId),
        eq(schema.eventContacts.eventId, eventId),
      ),
    )
    .get();
}

export function dashboardStats(eventId: string) {
  const db = getDb();
  const submissions = db
    .select({ c: count() })
    .from(schema.submissions)
    .where(eq(schema.submissions.eventId, eventId))
    .get()?.c;
  const acceptedSpeakers = db
    .select({ c: count() })
    .from(schema.eventContacts)
    .where(
      and(
        eq(schema.eventContacts.eventId, eventId),
        eq(schema.eventContacts.speakerStatus, "confirmed"),
      ),
    )
    .get()?.c;
  const scheduled = db
    .select({ c: count() })
    .from(schema.submissions)
    .where(
      and(
        eq(schema.submissions.eventId, eventId),
        eq(schema.submissions.status, "accepted"),
        sql`${schema.submissions.startsAt} is not null`,
      ),
    )
    .get()?.c;
  const tasksOutstanding = db
    .select({ c: count() })
    .from(schema.taskAssignments)
    .where(
      and(
        eq(schema.taskAssignments.eventId, eventId),
        sql`${schema.taskAssignments.status} != 'complete'`,
      ),
    )
    .get()?.c;
  return {
    submissions: Number(submissions ?? 0),
    acceptedSpeakers: Number(acceptedSpeakers ?? 0),
    sessionsScheduled: Number(scheduled ?? 0),
    tasksOutstanding: Number(tasksOutstanding ?? 0),
  };
}
