import { and, asc, eq, inArray } from "drizzle-orm";
import type { ApiAuthContext } from "@/lib/api/auth";
import {
  buildListConditions,
  paginate,
  parseListParams,
} from "@/lib/api/query";
import {
  badRequest,
  jsonData,
  notFound,
} from "@/lib/api/response";
import {
  serializeContact,
  serializeEmail,
  serializeEvaluationPlan,
  serializeEvent,
  serializeEventContact,
  serializeForm,
  serializeFormat,
  serializeParticipant,
  serializeReview,
  serializeRoom,
  serializeSubmission,
  serializeTask,
  serializeTaskAssignment,
  serializeTrack,
  serializeUpload,
} from "@/lib/api/serialize";
import { SUBMISSION_STATUSES } from "@/lib/domain/status";
import { getDb, schema } from "@/lib/db";
import { nowIso } from "@/lib/dates";
import { id } from "@/lib/id";

export function getEventHandler(_req: Request, ctx: ApiAuthContext) {
  return jsonData(serializeEvent(ctx.event));
}

export function listSubmissions(req: Request, ctx: ApiAuthContext) {
  const params = parseListParams(new URL(req.url));
  const db = getDb();
  const conditions = buildListConditions(
    schema.submissions,
    [eq(schema.submissions.eventId, ctx.event.id)],
    params,
    {
      updatedAtColumn: schema.submissions.updatedAt,
      filterMap: {
        status: schema.submissions.status,
        kind: schema.submissions.kind,
        form_id: schema.submissions.formId,
        track_id: schema.submissions.trackId,
      },
    },
  );

  const rows = db
    .select()
    .from(schema.submissions)
    .where(and(...conditions))
    .orderBy(asc(schema.submissions.id))
    .limit(params.limit + 1)
    .all();

  const { items, nextCursor } = paginate(rows, params.limit);
  return jsonData(items.map(serializeSubmission), {
    limit: params.limit,
    ...(nextCursor ? { next_cursor: nextCursor } : {}),
  });
}

export function getSubmission(submissionId: string, ctx: ApiAuthContext) {
  const db = getDb();
  const row = db
    .select()
    .from(schema.submissions)
    .where(
      and(
        eq(schema.submissions.id, submissionId),
        eq(schema.submissions.eventId, ctx.event.id),
      ),
    )
    .get();
  if (!row) return notFound("Submission not found");
  return jsonData(serializeSubmission(row));
}

export async function createSubmission(req: Request, ctx: ApiAuthContext) {
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return badRequest("Invalid JSON body");
  }
  const title = String((body as { title?: string }).title || "").trim();
  if (!title) return badRequest("title is required");

  const db = getDb();
  const createdAt = nowIso();
  const submissionId = id("sub");
  const kind = String((body as { kind?: string }).kind || "abstract");
  const status = String((body as { status?: string }).status || "pending");

  db.insert(schema.submissions)
    .values({
      id: submissionId,
      eventId: ctx.event.id,
      formId: (body as { formId?: string }).formId ?? null,
      kind,
      status,
      title,
      description: (body as { description?: string }).description ?? null,
      trackId: (body as { trackId?: string }).trackId ?? null,
      formatId: (body as { formatId?: string }).formatId ?? null,
      level: (body as { level?: string }).level ?? null,
      language: (body as { language?: string }).language ?? "English",
      locationId: (body as { locationId?: string }).locationId ?? null,
      startsAt: (body as { startsAt?: string }).startsAt ?? null,
      endsAt: (body as { endsAt?: string }).endsAt ?? null,
      capacity: (body as { capacity?: number }).capacity ?? null,
      submitterContactId:
        (body as { submitterContactId?: string }).submitterContactId ?? null,
      answers: JSON.stringify((body as { answers?: unknown }).answers ?? {}),
      isDraft: status === "draft",
      approvalStatus: "draft",
      createdAt,
      updatedAt: createdAt,
    })
    .run();

  const row = db
    .select()
    .from(schema.submissions)
    .where(eq(schema.submissions.id, submissionId))
    .get()!;

  return jsonData(serializeSubmission(row), undefined, { status: 201 });
}

export async function patchSubmission(
  submissionId: string,
  req: Request,
  ctx: ApiAuthContext,
) {
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return badRequest("Invalid JSON body");
  }

  const db = getDb();
  const existing = db
    .select()
    .from(schema.submissions)
    .where(
      and(
        eq(schema.submissions.id, submissionId),
        eq(schema.submissions.eventId, ctx.event.id),
      ),
    )
    .get();
  if (!existing) return notFound("Submission not found");

  const patch: Record<string, unknown> = { updatedAt: nowIso() };
  const allowed = [
    "status",
    "title",
    "description",
    "trackId",
    "formatId",
    "level",
    "language",
    "locationId",
    "startsAt",
    "endsAt",
    "capacity",
    "approvalStatus",
    "kind",
  ] as const;

  for (const key of allowed) {
    if (key in (body as Record<string, unknown>)) {
      patch[key] = (body as Record<string, unknown>)[key];
    }
  }

  if ("answers" in (body as Record<string, unknown>)) {
    patch.answers = JSON.stringify((body as { answers?: unknown }).answers);
  }

  if (patch.status) {
    if (
      !SUBMISSION_STATUSES.includes(
        patch.status as (typeof SUBMISSION_STATUSES)[number],
      )
    ) {
      return badRequest("Invalid status");
    }
    patch.isDraft = patch.status === "draft";
  }

  db.update(schema.submissions)
    .set(patch)
    .where(eq(schema.submissions.id, submissionId))
    .run();

  const row = db
    .select()
    .from(schema.submissions)
    .where(eq(schema.submissions.id, submissionId))
    .get()!;

  return jsonData(serializeSubmission(row));
}

export function listSessions(req: Request, ctx: ApiAuthContext) {
  const url = new URL(req.url);
  if (!url.searchParams.has("status")) {
    url.searchParams.set("status", "accepted");
  }
  if (!url.searchParams.has("kind")) {
    url.searchParams.set("kind", "session");
  }
  return listSubmissions(new Request(url.toString(), req), ctx);
}

export function listContacts(req: Request, ctx: ApiAuthContext) {
  const params = parseListParams(new URL(req.url));
  const db = getDb();

  const eventContactRows = db
    .select({ contactId: schema.eventContacts.contactId })
    .from(schema.eventContacts)
    .where(eq(schema.eventContacts.eventId, ctx.event.id))
    .all();
  const contactIds = eventContactRows.map((r) => r.contactId);

  if (contactIds.length === 0) {
    return jsonData([], { limit: params.limit });
  }

  const conditions = buildListConditions(
    schema.contacts,
    [
      eq(schema.contacts.orgId, ctx.event.orgId),
      inArray(schema.contacts.id, contactIds),
    ],
    params,
    {
      updatedAtColumn: schema.contacts.createdAt,
      filterMap: { email: schema.contacts.email },
    },
  );

  const rows = db
    .select()
    .from(schema.contacts)
    .where(and(...conditions))
    .orderBy(asc(schema.contacts.id))
    .limit(params.limit + 1)
    .all();

  const { items, nextCursor } = paginate(rows, params.limit);
  return jsonData(items.map(serializeContact), {
    limit: params.limit,
    ...(nextCursor ? { next_cursor: nextCursor } : {}),
  });
}

export function getContact(contactId: string, ctx: ApiAuthContext) {
  const db = getDb();
  const row = db
    .select()
    .from(schema.contacts)
    .where(
      and(
        eq(schema.contacts.id, contactId),
        eq(schema.contacts.orgId, ctx.event.orgId),
      ),
    )
    .get();
  if (!row) return notFound("Contact not found");

  const eventContact = db
    .select()
    .from(schema.eventContacts)
    .where(
      and(
        eq(schema.eventContacts.eventId, ctx.event.id),
        eq(schema.eventContacts.contactId, contactId),
      ),
    )
    .get();
  if (!eventContact) return notFound("Contact not found for this event");

  return jsonData({
    ...serializeContact(row),
    eventContact: serializeEventContact(eventContact),
  });
}

export async function createContact(req: Request, ctx: ApiAuthContext) {
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return badRequest("Invalid JSON body");
  }

  const firstName = String((body as { firstName?: string }).firstName || "").trim();
  const lastName = String((body as { lastName?: string }).lastName || "").trim();
  const email = String((body as { email?: string }).email || "")
    .trim()
    .toLowerCase();
  if (!firstName || !lastName || !email) {
    return badRequest("firstName, lastName, and email are required");
  }

  const db = getDb();
  const createdAt = nowIso();
  let contactId: string;

  const existing = db
    .select()
    .from(schema.contacts)
    .where(
      and(eq(schema.contacts.orgId, ctx.event.orgId), eq(schema.contacts.email, email)),
    )
    .get();

  if (existing) {
    contactId = existing.id;
    db.update(schema.contacts)
      .set({
        firstName,
        lastName,
        jobTitle: (body as { jobTitle?: string }).jobTitle ?? existing.jobTitle,
        company: (body as { company?: string }).company ?? existing.company,
        biography: (body as { biography?: string }).biography ?? existing.biography,
        phone: (body as { phone?: string }).phone ?? existing.phone,
      })
      .where(eq(schema.contacts.id, contactId))
      .run();
  } else {
    contactId = id("ctc");
    db.insert(schema.contacts)
      .values({
        id: contactId,
        orgId: ctx.event.orgId,
        firstName,
        lastName,
        email,
        jobTitle: (body as { jobTitle?: string }).jobTitle ?? null,
        company: (body as { company?: string }).company ?? null,
        biography: (body as { biography?: string }).biography ?? null,
        phone: (body as { phone?: string }).phone ?? null,
        createdAt,
      })
      .run();
  }

  const eventContact = db
    .select()
    .from(schema.eventContacts)
    .where(
      and(
        eq(schema.eventContacts.eventId, ctx.event.id),
        eq(schema.eventContacts.contactId, contactId),
      ),
    )
    .get();

  if (!eventContact) {
    db.insert(schema.eventContacts)
      .values({
        id: id("ec"),
        eventId: ctx.event.id,
        contactId,
        status: "active",
        speakerStatus:
          (body as { speakerStatus?: string }).speakerStatus ?? "prospect",
        createdAt,
      })
      .run();
  }

  const row = db
    .select()
    .from(schema.contacts)
    .where(eq(schema.contacts.id, contactId))
    .get()!;

  return jsonData(serializeContact(row), undefined, { status: 201 });
}

export async function patchContact(
  contactId: string,
  req: Request,
  ctx: ApiAuthContext,
) {
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return badRequest("Invalid JSON body");
  }

  const db = getDb();
  const existing = db
    .select()
    .from(schema.contacts)
    .where(
      and(
        eq(schema.contacts.id, contactId),
        eq(schema.contacts.orgId, ctx.event.orgId),
      ),
    )
    .get();
  if (!existing) return notFound("Contact not found");

  const patch: Record<string, unknown> = {};
  const fields = [
    "firstName",
    "lastName",
    "email",
    "jobTitle",
    "company",
    "biography",
    "phone",
    "headshotUrl",
    "pronouns",
    "dietary",
    "tshirtSize",
  ] as const;
  for (const key of fields) {
    if (key in (body as Record<string, unknown>)) {
      patch[key] = (body as Record<string, unknown>)[key];
    }
  }
  if ("custom" in (body as Record<string, unknown>)) {
    patch.custom = JSON.stringify((body as { custom?: unknown }).custom);
  }

  db.update(schema.contacts)
    .set(patch)
    .where(eq(schema.contacts.id, contactId))
    .run();

  if ("speakerStatus" in (body as Record<string, unknown>)) {
    db.update(schema.eventContacts)
      .set({
        speakerStatus: String((body as { speakerStatus?: string }).speakerStatus),
      })
      .where(
        and(
          eq(schema.eventContacts.eventId, ctx.event.id),
          eq(schema.eventContacts.contactId, contactId),
        ),
      )
      .run();
  }

  const row = db
    .select()
    .from(schema.contacts)
    .where(eq(schema.contacts.id, contactId))
    .get()!;

  return jsonData(serializeContact(row));
}

export function deleteContact(contactId: string, ctx: ApiAuthContext) {
  const db = getDb();
  const eventContact = db
    .select()
    .from(schema.eventContacts)
    .where(
      and(
        eq(schema.eventContacts.eventId, ctx.event.id),
        eq(schema.eventContacts.contactId, contactId),
      ),
    )
    .get();
  if (!eventContact) return notFound("Contact not found for this event");

  db.delete(schema.eventContacts)
    .where(eq(schema.eventContacts.id, eventContact.id))
    .run();

  return jsonData({ deleted: true });
}

export async function bulkUpsertContacts(req: Request, ctx: ApiAuthContext) {
  const body = await req.json().catch(() => null);
  if (!body || !Array.isArray((body as { contacts?: unknown }).contacts)) {
    return badRequest("contacts array is required");
  }

  const contacts = (body as { contacts: Record<string, unknown>[] }).contacts;
  const results: { email: string; contactId: string; created: boolean }[] = [];

  for (const item of contacts) {
    const fakeReq = new Request("http://local", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(item),
    });
    const db = getDb();
    const email = String(item.email || "")
      .trim()
      .toLowerCase();
    const existed = email
      ? db
          .select({ id: schema.contacts.id })
          .from(schema.contacts)
          .where(
            and(
              eq(schema.contacts.orgId, ctx.event.orgId),
              eq(schema.contacts.email, email),
            ),
          )
          .get()
      : null;

    const res = await createContact(fakeReq, ctx);
    if (res.status >= 400) continue;
    const data = (await res.json()) as { data: { id: string; email: string } };
    results.push({
      email: data.data.email,
      contactId: data.data.id,
      created: !existed,
    });
  }

  return jsonData({ results });
}

export async function bulkUpdateSubmissionStatus(
  req: Request,
  ctx: ApiAuthContext,
) {
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return badRequest("Invalid JSON body");
  }

  const ids = (body as { ids?: string[] }).ids;
  const status = String((body as { status?: string }).status || "");
  if (!Array.isArray(ids) || !ids.length) {
    return badRequest("ids array is required");
  }
  if (
    !SUBMISSION_STATUSES.includes(status as (typeof SUBMISSION_STATUSES)[number])
  ) {
    return badRequest("Invalid status");
  }

  const db = getDb();
  const updated: string[] = [];

  for (const submissionId of ids) {
    const existing = db
      .select()
      .from(schema.submissions)
      .where(
        and(
          eq(schema.submissions.id, submissionId),
          eq(schema.submissions.eventId, ctx.event.id),
        ),
      )
      .get();
    if (!existing) continue;

    db.update(schema.submissions)
      .set({
        status,
        isDraft: status === "draft",
        updatedAt: nowIso(),
      })
      .where(eq(schema.submissions.id, submissionId))
      .run();
    updated.push(submissionId);
  }

  return jsonData({ updated, status });
}

export function listParticipants(req: Request, ctx: ApiAuthContext) {
  const params = parseListParams(new URL(req.url));
  const db = getDb();

  const submissionIds = db
    .select({ id: schema.submissions.id })
    .from(schema.submissions)
    .where(eq(schema.submissions.eventId, ctx.event.id))
    .all()
    .map((r) => r.id);

  if (!submissionIds.length) {
    return jsonData([], { limit: params.limit });
  }

  const conditions = buildListConditions(
    schema.submissionParticipants,
    [inArray(schema.submissionParticipants.submissionId, submissionIds)],
    params,
    {
      filterMap: {
        role: schema.submissionParticipants.role,
        submission_id: schema.submissionParticipants.submissionId,
        contact_id: schema.submissionParticipants.contactId,
      },
    },
  );

  const rows = db
    .select()
    .from(schema.submissionParticipants)
    .where(and(...conditions))
    .orderBy(asc(schema.submissionParticipants.id))
    .limit(params.limit + 1)
    .all();

  const { items, nextCursor } = paginate(rows, params.limit);
  return jsonData(items.map(serializeParticipant), {
    limit: params.limit,
    ...(nextCursor ? { next_cursor: nextCursor } : {}),
  });
}

export function getParticipant(participantId: string, ctx: ApiAuthContext) {
  const db = getDb();
  const row = db
    .select()
    .from(schema.submissionParticipants)
    .where(eq(schema.submissionParticipants.id, participantId))
    .get();
  if (!row) return notFound("Participant not found");

  const submission = db
    .select()
    .from(schema.submissions)
    .where(
      and(
        eq(schema.submissions.id, row.submissionId),
        eq(schema.submissions.eventId, ctx.event.id),
      ),
    )
    .get();
  if (!submission) return notFound("Participant not found");

  return jsonData(serializeParticipant(row));
}

function listEventScoped(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  table: any,
  req: Request,
  ctx: ApiAuthContext,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  serialize: (row: any) => unknown,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  filterMap?: Record<string, any>,
) {
  const params = parseListParams(new URL(req.url));
  const db = getDb();
  const conditions = buildListConditions(
    table,
    [eq(table.eventId, ctx.event.id)],
    params,
    { filterMap },
  );

  const rows = db
    .select()
    .from(table)
    .where(and(...conditions))
    .orderBy(asc(table.id))
    .limit(params.limit + 1)
    .all() as { id: string }[];

  const { items, nextCursor } = paginate(rows, params.limit);
  return jsonData(items.map((r) => serialize(r)), {
    limit: params.limit,
    ...(nextCursor ? { next_cursor: nextCursor } : {}),
  });
}

function getEventScoped(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  table: any,
  itemId: string,
  ctx: ApiAuthContext,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  serialize: (row: any) => unknown,
) {
  const db = getDb();
  const row = db
    .select()
    .from(table)
    .where(and(eq(table.id, itemId), eq(table.eventId, ctx.event.id)))
    .get();
  if (!row) return notFound();
  return jsonData(serialize(row));
}

export const listForms = (req: Request, ctx: ApiAuthContext) =>
  listEventScoped(schema.submissionForms, req, ctx, serializeForm, {
    status: schema.submissionForms.status,
  });

export const getForm = (formId: string, ctx: ApiAuthContext) =>
  getEventScoped(schema.submissionForms, formId, ctx, serializeForm);

export const listTracks = (req: Request, ctx: ApiAuthContext) =>
  listEventScoped(schema.tracks, req, ctx, serializeTrack);

export const getTrack = (trackId: string, ctx: ApiAuthContext) =>
  getEventScoped(schema.tracks, trackId, ctx, serializeTrack);

export const listFormats = (req: Request, ctx: ApiAuthContext) =>
  listEventScoped(schema.formats, req, ctx, serializeFormat);

export const getFormat = (formatId: string, ctx: ApiAuthContext) =>
  getEventScoped(schema.formats, formatId, ctx, serializeFormat);

export const listRooms = (req: Request, ctx: ApiAuthContext) =>
  listEventScoped(schema.rooms, req, ctx, serializeRoom);

export const getRoom = (roomId: string, ctx: ApiAuthContext) =>
  getEventScoped(schema.rooms, roomId, ctx, serializeRoom);

export const listTasks = (req: Request, ctx: ApiAuthContext) =>
  listEventScoped(schema.tasks, req, ctx, serializeTask, {
    type: schema.tasks.type,
  });

export const getTask = (taskId: string, ctx: ApiAuthContext) =>
  getEventScoped(schema.tasks, taskId, ctx, serializeTask);

export async function createTask(req: Request, ctx: ApiAuthContext) {
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return badRequest("Invalid JSON body");
  }
  const name = String((body as { name?: string }).name || "").trim();
  if (!name) return badRequest("name is required");

  const db = getDb();
  const taskId = id("tsk");
  const createdAt = nowIso();

  db.insert(schema.tasks)
    .values({
      id: taskId,
      eventId: ctx.event.id,
      name,
      description: (body as { description?: string }).description ?? null,
      type: (body as { type?: string }).type ?? "action",
      target: (body as { target?: string }).target ?? "contact",
      linkUrl: (body as { linkUrl?: string }).linkUrl ?? null,
      acceptedTypes:
        (body as { acceptedTypes?: string }).acceptedTypes ??
        "application/pdf,image/png,image/jpeg",
      maxSizeMb: (body as { maxSizeMb?: number }).maxSizeMb ?? 20,
      createdAt,
    })
    .run();

  const row = db.select().from(schema.tasks).where(eq(schema.tasks.id, taskId)).get()!;
  return jsonData(serializeTask(row), undefined, { status: 201 });
}

export async function patchTask(
  taskId: string,
  req: Request,
  ctx: ApiAuthContext,
) {
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return badRequest("Invalid JSON body");
  }

  const db = getDb();
  const existing = db
    .select()
    .from(schema.tasks)
    .where(and(eq(schema.tasks.id, taskId), eq(schema.tasks.eventId, ctx.event.id)))
    .get();
  if (!existing) return notFound("Task not found");

  const patch: Record<string, unknown> = {};
  for (const key of ["name", "description", "type", "linkUrl", "acceptedTypes", "maxSizeMb"]) {
    if (key in (body as Record<string, unknown>)) {
      patch[key] = (body as Record<string, unknown>)[key];
    }
  }

  db.update(schema.tasks).set(patch).where(eq(schema.tasks.id, taskId)).run();
  const row = db.select().from(schema.tasks).where(eq(schema.tasks.id, taskId)).get()!;
  return jsonData(serializeTask(row));
}

export function deleteTask(taskId: string, ctx: ApiAuthContext) {
  const db = getDb();
  const existing = db
    .select()
    .from(schema.tasks)
    .where(and(eq(schema.tasks.id, taskId), eq(schema.tasks.eventId, ctx.event.id)))
    .get();
  if (!existing) return notFound("Task not found");

  db.delete(schema.tasks).where(eq(schema.tasks.id, taskId)).run();
  return jsonData({ deleted: true });
}

export function listTaskAssignments(req: Request, ctx: ApiAuthContext) {
  const params = parseListParams(new URL(req.url));
  const db = getDb();
  const conditions = buildListConditions(
    schema.taskAssignments,
    [eq(schema.taskAssignments.eventId, ctx.event.id)],
    params,
    {
      filterMap: {
        status: schema.taskAssignments.status,
        task_id: schema.taskAssignments.taskId,
        contact_id: schema.taskAssignments.contactId,
      },
    },
  );

  const rows = db
    .select()
    .from(schema.taskAssignments)
    .where(and(...conditions))
    .orderBy(asc(schema.taskAssignments.id))
    .limit(params.limit + 1)
    .all();

  const { items, nextCursor } = paginate(rows, params.limit);
  return jsonData(items.map(serializeTaskAssignment), {
    limit: params.limit,
    ...(nextCursor ? { next_cursor: nextCursor } : {}),
  });
}

export function getTaskAssignment(assignmentId: string, ctx: ApiAuthContext) {
  const db = getDb();
  const row = db
    .select()
    .from(schema.taskAssignments)
    .where(
      and(
        eq(schema.taskAssignments.id, assignmentId),
        eq(schema.taskAssignments.eventId, ctx.event.id),
      ),
    )
    .get();
  if (!row) return notFound("Task assignment not found");
  return jsonData(serializeTaskAssignment(row));
}

export async function createTaskAssignment(req: Request, ctx: ApiAuthContext) {
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return badRequest("Invalid JSON body");
  }

  const taskId = String((body as { taskId?: string }).taskId || "");
  const contactId = String((body as { contactId?: string }).contactId || "");
  if (!taskId || !contactId) {
    return badRequest("taskId and contactId are required");
  }

  const db = getDb();
  const task = db
    .select()
    .from(schema.tasks)
    .where(and(eq(schema.tasks.id, taskId), eq(schema.tasks.eventId, ctx.event.id)))
    .get();
  if (!task) return notFound("Task not found");

  const assignmentId = id("ta");
  const createdAt = nowIso();

  db.insert(schema.taskAssignments)
    .values({
      id: assignmentId,
      taskId,
      eventId: ctx.event.id,
      contactId,
      submissionId: (body as { submissionId?: string }).submissionId ?? null,
      dueAt: (body as { dueAt?: string }).dueAt ?? null,
      isRequired: (body as { isRequired?: boolean }).isRequired ?? true,
      status: "not_started",
      createdAt,
    })
    .run();

  const row = db
    .select()
    .from(schema.taskAssignments)
    .where(eq(schema.taskAssignments.id, assignmentId))
    .get()!;

  return jsonData(serializeTaskAssignment(row), undefined, { status: 201 });
}

export async function patchTaskAssignment(
  assignmentId: string,
  req: Request,
  ctx: ApiAuthContext,
) {
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return badRequest("Invalid JSON body");
  }

  const db = getDb();
  const existing = db
    .select()
    .from(schema.taskAssignments)
    .where(
      and(
        eq(schema.taskAssignments.id, assignmentId),
        eq(schema.taskAssignments.eventId, ctx.event.id),
      ),
    )
    .get();
  if (!existing) return notFound("Task assignment not found");

  const patch: Record<string, unknown> = {};
  for (const key of [
    "status",
    "dueAt",
    "extendedDueAt",
    "isRequired",
    "completedAt",
  ]) {
    if (key in (body as Record<string, unknown>)) {
      patch[key] = (body as Record<string, unknown>)[key];
    }
  }

  db.update(schema.taskAssignments)
    .set(patch)
    .where(eq(schema.taskAssignments.id, assignmentId))
    .run();

  const row = db
    .select()
    .from(schema.taskAssignments)
    .where(eq(schema.taskAssignments.id, assignmentId))
    .get()!;

  return jsonData(serializeTaskAssignment(row));
}

export function deleteTaskAssignment(assignmentId: string, ctx: ApiAuthContext) {
  const db = getDb();
  const existing = db
    .select()
    .from(schema.taskAssignments)
    .where(
      and(
        eq(schema.taskAssignments.id, assignmentId),
        eq(schema.taskAssignments.eventId, ctx.event.id),
      ),
    )
    .get();
  if (!existing) return notFound("Task assignment not found");

  db.delete(schema.taskAssignments)
    .where(eq(schema.taskAssignments.id, assignmentId))
    .run();

  return jsonData({ deleted: true });
}

export async function bulkAssignTasks(req: Request, ctx: ApiAuthContext) {
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return badRequest("Invalid JSON body");
  }

  const taskId = String((body as { taskId?: string }).taskId || "");
  const contactIds = (body as { contactIds?: string[] }).contactIds;
  if (!taskId || !Array.isArray(contactIds) || !contactIds.length) {
    return badRequest("taskId and contactIds are required");
  }

  const db = getDb();
  const task = db
    .select()
    .from(schema.tasks)
    .where(and(eq(schema.tasks.id, taskId), eq(schema.tasks.eventId, ctx.event.id)))
    .get();
  if (!task) return notFound("Task not found");

  const created: string[] = [];
  const createdAt = nowIso();
  const dueAt = (body as { dueAt?: string }).dueAt ?? null;

  for (const contactId of contactIds) {
    const existing = db
      .select()
      .from(schema.taskAssignments)
      .where(
        and(
          eq(schema.taskAssignments.taskId, taskId),
          eq(schema.taskAssignments.contactId, contactId),
          eq(schema.taskAssignments.eventId, ctx.event.id),
        ),
      )
      .get();
    if (existing) continue;

    const assignmentId = id("ta");
    db.insert(schema.taskAssignments)
      .values({
        id: assignmentId,
        taskId,
        eventId: ctx.event.id,
        contactId,
        dueAt,
        isRequired: (body as { isRequired?: boolean }).isRequired ?? true,
        status: "not_started",
        createdAt,
      })
      .run();
    created.push(assignmentId);
  }

  return jsonData({ created, taskId });
}

export function listEvaluationPlans(req: Request, ctx: ApiAuthContext) {
  const params = parseListParams(new URL(req.url));
  const db = getDb();
  const conditions = buildListConditions(
    schema.evaluationPlans,
    [eq(schema.evaluationPlans.eventId, ctx.event.id)],
    params,
    { updatedAtColumn: schema.evaluationPlans.createdAt },
  );

  const rows = db
    .select()
    .from(schema.evaluationPlans)
    .where(and(...conditions))
    .orderBy(asc(schema.evaluationPlans.id))
    .limit(params.limit + 1)
    .all();

  const { items, nextCursor } = paginate(rows, params.limit);
  return jsonData(items.map(serializeEvaluationPlan), {
    limit: params.limit,
    ...(nextCursor ? { next_cursor: nextCursor } : {}),
  });
}

export function getEvaluationPlan(planId: string, ctx: ApiAuthContext) {
  const db = getDb();
  const row = db
    .select()
    .from(schema.evaluationPlans)
    .where(
      and(
        eq(schema.evaluationPlans.id, planId),
        eq(schema.evaluationPlans.eventId, ctx.event.id),
      ),
    )
    .get();
  if (!row) return notFound("Evaluation plan not found");
  return jsonData(serializeEvaluationPlan(row));
}

export function listReviews(req: Request, ctx: ApiAuthContext) {
  const params = parseListParams(new URL(req.url));
  const db = getDb();

  const planIds = db
    .select({ id: schema.evaluationPlans.id })
    .from(schema.evaluationPlans)
    .where(eq(schema.evaluationPlans.eventId, ctx.event.id))
    .all()
    .map((r) => r.id);

  if (!planIds.length) {
    return jsonData([], { limit: params.limit });
  }

  const roundIds = db
    .select({ id: schema.evaluationRounds.id })
    .from(schema.evaluationRounds)
    .where(inArray(schema.evaluationRounds.planId, planIds))
    .all()
    .map((r) => r.id);

  if (!roundIds.length) {
    return jsonData([], { limit: params.limit });
  }

  const assignmentIds = db
    .select({ id: schema.evaluationAssignments.id })
    .from(schema.evaluationAssignments)
    .where(inArray(schema.evaluationAssignments.roundId, roundIds))
    .all()
    .map((r) => r.id);

  if (!assignmentIds.length) {
    return jsonData([], { limit: params.limit });
  }

  const conditions = buildListConditions(
    schema.reviews,
    [inArray(schema.reviews.assignmentId, assignmentIds)],
    params,
    { updatedAtColumn: schema.reviews.updatedAt },
  );

  const rows = db
    .select()
    .from(schema.reviews)
    .where(and(...conditions))
    .orderBy(asc(schema.reviews.id))
    .limit(params.limit + 1)
    .all();

  const { items, nextCursor } = paginate(rows, params.limit);
  return jsonData(items.map(serializeReview), {
    limit: params.limit,
    ...(nextCursor ? { next_cursor: nextCursor } : {}),
  });
}

export function getReview(reviewId: string, ctx: ApiAuthContext) {
  const db = getDb();
  const row = db
    .select()
    .from(schema.reviews)
    .where(eq(schema.reviews.id, reviewId))
    .get();
  if (!row) return notFound("Review not found");

  const assignment = db
    .select()
    .from(schema.evaluationAssignments)
    .where(eq(schema.evaluationAssignments.id, row.assignmentId))
    .get();
  if (!assignment) return notFound("Review not found");

  const round = db
    .select()
    .from(schema.evaluationRounds)
    .where(eq(schema.evaluationRounds.id, assignment.roundId))
    .get();
  if (!round) return notFound("Review not found");

  const plan = db
    .select()
    .from(schema.evaluationPlans)
    .where(
      and(
        eq(schema.evaluationPlans.id, round.planId),
        eq(schema.evaluationPlans.eventId, ctx.event.id),
      ),
    )
    .get();
  if (!plan) return notFound("Review not found");

  return jsonData(serializeReview(row));
}

export function listUploads(req: Request, ctx: ApiAuthContext) {
  const params = parseListParams(new URL(req.url));
  const db = getDb();
  const conditions = buildListConditions(
    schema.uploads,
    [eq(schema.uploads.eventId, ctx.event.id)],
    params,
    {
      updatedAtColumn: schema.uploads.createdAt,
      filterMap: {
        contact_id: schema.uploads.contactId,
        submission_id: schema.uploads.submissionId,
      },
    },
  );

  const rows = db
    .select()
    .from(schema.uploads)
    .where(and(...conditions))
    .orderBy(asc(schema.uploads.id))
    .limit(params.limit + 1)
    .all();

  const { items, nextCursor } = paginate(rows, params.limit);
  return jsonData(items.map(serializeUpload), {
    limit: params.limit,
    ...(nextCursor ? { next_cursor: nextCursor } : {}),
  });
}

export function listEmails(req: Request, ctx: ApiAuthContext) {
  const params = parseListParams(new URL(req.url));
  const db = getDb();
  const conditions = buildListConditions(
    schema.emailMessages,
    [eq(schema.emailMessages.eventId, ctx.event.id)],
    params,
    {
      updatedAtColumn: schema.emailMessages.createdAt,
      filterMap: {
        status: schema.emailMessages.status,
        to_email: schema.emailMessages.toEmail,
      },
    },
  );

  const rows = db
    .select()
    .from(schema.emailMessages)
    .where(and(...conditions))
    .orderBy(asc(schema.emailMessages.id))
    .limit(params.limit + 1)
    .all();

  const { items, nextCursor } = paginate(rows, params.limit);
  return jsonData(items.map(serializeEmail), {
    limit: params.limit,
    ...(nextCursor ? { next_cursor: nextCursor } : {}),
  });
}

async function createLookup(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  table: any,
  prefix: string,
  req: Request,
  ctx: ApiAuthContext,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  serialize: (row: any) => unknown,
) {
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return badRequest("Invalid JSON body");
  }
  const name = String((body as { name?: string }).name || "").trim();
  if (!name) return badRequest("name is required");

  const db = getDb();
  const itemId = id(prefix);
  db.insert(table)
    .values({
      id: itemId,
      eventId: ctx.event.id,
      name,
      color: (body as { color?: string }).color ?? "#2563eb",
      sortOrder: (body as { sortOrder?: number }).sortOrder ?? 0,
      ...((body as { durationMinutes?: number }).durationMinutes != null
        ? { durationMinutes: (body as { durationMinutes?: number }).durationMinutes }
        : {}),
    } as Record<string, unknown>)
    .run();

  const row = db.select().from(table).where(eq(table.id, itemId)).get()!;
  return jsonData(serialize(row), undefined, { status: 201 });
}

async function patchLookup(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  table: any,
  itemId: string,
  req: Request,
  ctx: ApiAuthContext,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  serialize: (row: any) => unknown,
) {
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return badRequest("Invalid JSON body");
  }

  const db = getDb();
  const existing = db
    .select()
    .from(table)
    .where(and(eq(table.id, itemId), eq(table.eventId, ctx.event.id)))
    .get();
  if (!existing) return notFound();

  const patch: Record<string, unknown> = {};
  for (const key of ["name", "color", "sortOrder", "durationMinutes"]) {
    if (key in (body as Record<string, unknown>)) {
      patch[key] = (body as Record<string, unknown>)[key];
    }
  }

  db.update(table).set(patch).where(eq(table.id, itemId)).run();
  const row = db.select().from(table).where(eq(table.id, itemId)).get()!;
  return jsonData(serialize(row));
}

function deleteLookup(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  table: any,
  itemId: string,
  ctx: ApiAuthContext,
) {
  const db = getDb();
  const existing = db
    .select()
    .from(table)
    .where(and(eq(table.id, itemId), eq(table.eventId, ctx.event.id)))
    .get();
  if (!existing) return notFound();

  db.delete(table).where(eq(table.id, itemId)).run();
  return jsonData({ deleted: true });
}

export const createTrack = (req: Request, ctx: ApiAuthContext) =>
  createLookup(schema.tracks, "trk", req, ctx, serializeTrack);
export const patchTrack = (trackId: string, req: Request, ctx: ApiAuthContext) =>
  patchLookup(schema.tracks, trackId, req, ctx, serializeTrack);
export const deleteTrack = (trackId: string, ctx: ApiAuthContext) =>
  deleteLookup(schema.tracks, trackId, ctx);

export const createFormat = (req: Request, ctx: ApiAuthContext) =>
  createLookup(schema.formats, "fmt", req, ctx, serializeFormat);
export const patchFormat = (formatId: string, req: Request, ctx: ApiAuthContext) =>
  patchLookup(schema.formats, formatId, req, ctx, serializeFormat);
export const deleteFormat = (formatId: string, ctx: ApiAuthContext) =>
  deleteLookup(schema.formats, formatId, ctx);

export const createRoom = (req: Request, ctx: ApiAuthContext) =>
  createLookup(schema.rooms, "rom", req, ctx, serializeRoom);
export const patchRoom = (roomId: string, req: Request, ctx: ApiAuthContext) =>
  patchLookup(schema.rooms, roomId, req, ctx, serializeRoom);
export const deleteRoom = (roomId: string, ctx: ApiAuthContext) =>
  deleteLookup(schema.rooms, roomId, ctx);
