import { authenticate, apiError, jsonBody, paginate, publicContext } from "@/lib/api";
import { all, get, readJson } from "@/lib/db";
import { listLookup, createLookup } from "@/lib/repo/events";
import { contactName, listRoster, upsertContact, ensureEventContact } from "@/lib/repo/contacts";
import {
  addParticipant,
  createSubmission,
  getSubmission,
  listParticipants,
  listSubmissions,
  publicSessions,
  publicSpeakers,
  speakersForSubmissions,
  updateSubmission,
} from "@/lib/repo/submissions";
import { listForms } from "@/lib/repo/forms";
import { assignTask, listAssignments, listTasks } from "@/lib/repo/tasks";
import { listPlans, results } from "@/lib/repo/evaluations";
import { listMessages } from "@/lib/repo/emails";
import { listUploads } from "@/lib/repo/uploads";
import { stripHtml } from "@/lib/fields";
import { onSubmissionAccepted } from "@/lib/services/decisions";

export const dynamic = "force-dynamic";

const PUBLIC_RESOURCES = new Set(["public"]);

export async function GET(request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const [resource, id, sub] = path;
  const url = new URL(request.url);

  if (PUBLIC_RESOURCES.has(resource)) return handlePublic(request, path);

  const ctx = authenticate(request);
  if (ctx instanceof Response) return ctx;
  const { event } = ctx;

  switch (resource) {
    case "events":
      return Response.json({ data: [eventJson(event)] });

    case "submissions":
    case "sessions": {
      if (id) {
        const submission = getSubmission(id);
        if (!submission || submission.event_id !== event.id) return apiError(404, "Not found");
        if (sub === "participants") {
          return Response.json({ data: listParticipants(id).map(participantJson) });
        }
        return Response.json({ data: submissionJson(submission.id, event.id) });
      }
      const rows = listSubmissions(event.id, {
        status: url.searchParams.get("status") ?? "all",
        kind: resource === "sessions" ? "session" : (url.searchParams.get("kind") ?? "all"),
        q: url.searchParams.get("q") ?? undefined,
        trackId: url.searchParams.get("track_id") ?? undefined,
        limit: 1000,
      });
      return Response.json(paginate(rows.map((row) => submissionRowJson(row)), url));
    }

    case "contacts":
    case "speakers": {
      const rows = listRoster(event.id, { q: url.searchParams.get("q") ?? undefined, limit: 1000 });
      if (id) {
        const row = rows.find((r) => r.id === id);
        if (!row) return apiError(404, "Not found");
        return Response.json({ data: contactJson(row) });
      }
      return Response.json(paginate(rows.map(contactJson), url));
    }

    case "participants": {
      const rows = all<{ id: string; submission_id: string; contact_id: string; role: string; acceptance_status: string; created_at: string }>(
        `SELECT sp.* FROM submission_participants sp
           JOIN submissions s ON s.id = sp.submission_id WHERE s.event_id = ?`,
        event.id,
      );
      return Response.json(paginate(rows, url));
    }

    case "forms":
      return Response.json(paginate(listForms(event.id), url));

    case "tracks":
      return Response.json({ data: listLookup("tracks", event.id) });
    case "formats":
      return Response.json({ data: listLookup("formats", event.id) });
    case "rooms":
      return Response.json({ data: listLookup("rooms", event.id) });

    case "tasks":
      return Response.json(paginate(listTasks(event.id), url));

    case "task-assignments":
      return Response.json(
        paginate(
          listAssignments(event.id, { contactId: url.searchParams.get("contact_id") ?? undefined }),
          url,
        ),
      );

    case "evaluation-plans":
      return Response.json(paginate(listPlans(event.id), url));

    case "reviews":
      return Response.json({ data: results(event.id) });

    case "uploads":
      return Response.json(paginate(listUploads(event.id), url));

    case "emails":
      return Response.json(paginate(listMessages(event.id, { limit: 1000 }), url));

    default:
      return apiError(404, `Unknown resource "${resource}"`);
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const [resource, id] = path;
  const ctx = authenticate(request);
  if (ctx instanceof Response) return ctx;
  const { event } = ctx;
  const body = await jsonBody<Record<string, unknown>>(request);

  switch (resource) {
    case "submissions":
    case "sessions": {
      if (id === "bulk-status") {
        const ids = (body.ids as string[]) ?? [];
        const status = String(body.status ?? "pending");
        let changed = 0;
        for (const submissionId of ids) {
          const submission = getSubmission(submissionId);
          if (!submission || submission.event_id !== event.id) continue;
          updateSubmission(submissionId, { status: status as never });
          if (status === "accepted") onSubmissionAccepted(event, getSubmission(submissionId)!);
          changed += 1;
        }
        return Response.json({ data: { changed } });
      }
      const created = createSubmission(event.id, {
        title: String(body.title ?? "Untitled"),
        description: body.description ? String(body.description) : null,
        kind: (String(body.kind ?? "session") as "abstract" | "session"),
        status: (String(body.status ?? "pending") as never),
        track_id: body.track_id ? String(body.track_id) : null,
        format_id: body.format_id ? String(body.format_id) : null,
        starts_at: body.starts_at ? String(body.starts_at) : null,
        ends_at: body.ends_at ? String(body.ends_at) : null,
        location_id: body.room_id ? String(body.room_id) : null,
      });
      return Response.json({ data: submissionJson(created.id, event.id) }, { status: 201 });
    }

    case "contacts":
    case "speakers": {
      if (id === "bulk-upsert") {
        const rows = (body.contacts as Array<Record<string, string>>) ?? [];
        let created = 0;
        let updated = 0;
        for (const row of rows) {
          if (!row.email) continue;
          const result = upsertContact(event.org_id, {
            email: row.email,
            first_name: row.first_name ?? "",
            last_name: row.last_name ?? "",
            job_title: row.job_title ?? null,
            company: row.company ?? null,
            biography: row.biography ?? null,
          });
          ensureEventContact(event.id, result.contact.id, {
            speaker_status: row.speaker_status ?? "prospect",
          });
          if (result.created) created += 1;
          else updated += 1;
        }
        return Response.json({ data: { created, updated } });
      }
      if (!body.email) return apiError(422, "email is required");
      const { contact } = upsertContact(event.org_id, {
        email: String(body.email),
        first_name: String(body.first_name ?? ""),
        last_name: String(body.last_name ?? ""),
        job_title: body.job_title ? String(body.job_title) : null,
        company: body.company ? String(body.company) : null,
        biography: body.biography ? String(body.biography) : null,
      });
      ensureEventContact(event.id, contact.id, {
        speaker_status: String(body.speaker_status ?? "prospect"),
      });
      return Response.json({ data: contact }, { status: 201 });
    }

    case "participants": {
      const submissionId = String(body.submission_id ?? "");
      const submission = getSubmission(submissionId);
      if (!submission || submission.event_id !== event.id) return apiError(404, "Submission not found");
      const { contact } = upsertContact(event.org_id, {
        email: String(body.email ?? ""),
        first_name: String(body.first_name ?? ""),
        last_name: String(body.last_name ?? ""),
      });
      ensureEventContact(event.id, contact.id, {});
      const participant = addParticipant(submissionId, contact.id, String(body.role ?? "speaker"));
      return Response.json({ data: participant }, { status: 201 });
    }

    case "task-assignments": {
      if (id === "bulk") {
        const rows = (body.assignments as Array<Record<string, string>>) ?? [];
        let created = 0;
        for (const row of rows) {
          if (!row.task_id || !row.contact_id) continue;
          assignTask({
            taskId: row.task_id,
            eventId: event.id,
            contactId: row.contact_id,
            dueAt: row.due_at ?? null,
          });
          created += 1;
        }
        return Response.json({ data: { created } });
      }
      const assignment = assignTask({
        taskId: String(body.task_id ?? ""),
        eventId: event.id,
        contactId: String(body.contact_id ?? ""),
        dueAt: body.due_at ? String(body.due_at) : null,
      });
      return Response.json({ data: assignment }, { status: 201 });
    }

    case "tracks":
    case "formats":
    case "rooms": {
      const row = createLookup(resource, event.id, { name: String(body.name ?? "Untitled") });
      return Response.json({ data: row }, { status: 201 });
    }

    default:
      return apiError(404, `Cannot POST to "${resource}"`);
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const [resource, id] = path;
  const ctx = authenticate(request);
  if (ctx instanceof Response) return ctx;
  const { event } = ctx;
  const body = await jsonBody<Record<string, unknown>>(request);

  if (resource === "submissions" || resource === "sessions") {
    const submission = getSubmission(id ?? "");
    if (!submission || submission.event_id !== event.id) return apiError(404, "Not found");
    const patch: Record<string, unknown> = {};
    for (const key of [
      "title",
      "description",
      "status",
      "approval_status",
      "track_id",
      "format_id",
      "starts_at",
      "ends_at",
      "level",
      "capacity",
    ]) {
      if (key in body) patch[key] = body[key];
    }
    if ("room_id" in body) patch.location_id = body.room_id;
    updateSubmission(submission.id, patch);
    if (patch.status === "accepted") onSubmissionAccepted(event, getSubmission(submission.id)!);
    return Response.json({ data: submissionJson(submission.id, event.id) });
  }

  return apiError(404, `Cannot PATCH "${resource}"`);
}

export async function DELETE(request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const [resource, id] = path;
  const ctx = authenticate(request);
  if (ctx instanceof Response) return ctx;
  const { event } = ctx;

  if (resource === "submissions" || resource === "sessions") {
    const submission = getSubmission(id ?? "");
    if (!submission || submission.event_id !== event.id) return apiError(404, "Not found");
    const { deleteSubmission } = await import("@/lib/repo/submissions");
    deleteSubmission(submission.id);
    return new Response(null, { status: 204 });
  }
  return apiError(404, `Cannot DELETE "${resource}"`);
}

/* ---------------------------------------------------------------- public -- */

function handlePublic(request: Request, path: string[]) {
  const ctx = publicContext(request);
  if (ctx instanceof Response) return ctx;
  const { event } = ctx;
  const url = new URL(request.url);
  const what = path[1] ?? "sessions";

  if (what === "speakers") {
    return Response.json(
      {
        data: publicSpeakers(event.id).map((speaker) => ({
          id: speaker.id,
          name: contactName(speaker),
          job_title: speaker.job_title,
          company: speaker.company,
          biography: stripHtml(speaker.biography ?? ""),
          headshot_url: speaker.headshot_url,
          session_count: speaker.session_count,
        })),
      },
      { headers: { "Cache-Control": "public, max-age=60" } },
    );
  }

  const sessions = publicSessions(event.id, { q: url.searchParams.get("q") ?? undefined });
  const speakerMap = speakersForSubmissions(sessions.map((s) => s.id));
  return Response.json(
    {
      data: sessions.map((session) => ({
        id: session.id,
        title: session.title,
        description: stripHtml(session.description ?? ""),
        track: session.track_name,
        format: session.format_name,
        room: session.room_name,
        starts_at: session.pub_starts_at,
        ends_at: session.pub_ends_at,
        speakers: (speakerMap.get(session.id) ?? []).map((s) => ({
          id: s.contact_id,
          name: `${s.first_name} ${s.last_name}`,
          job_title: s.job_title,
          company: s.company,
        })),
      })),
    },
    { headers: { "Cache-Control": "public, max-age=60" } },
  );
}

/* ----------------------------------------------------------------- json --- */

function eventJson(event: {
  id: string;
  name: string;
  slug: string;
  starts_at: string | null;
  ends_at: string | null;
  location: string | null;
  timezone: string;
}) {
  return {
    id: event.id,
    name: event.name,
    slug: event.slug,
    starts_at: event.starts_at,
    ends_at: event.ends_at,
    location: event.location,
    timezone: event.timezone,
  };
}

function submissionJson(submissionId: string, eventId: string) {
  const row = listSubmissions(eventId, { limit: 1000 }).find((s) => s.id === submissionId);
  return row ? submissionRowJson(row) : null;
}

function submissionRowJson(row: ReturnType<typeof listSubmissions>[number]) {
  return {
    id: row.id,
    title: row.title,
    kind: row.kind,
    status: row.status,
    approval_status: row.approval_status,
    description: row.description,
    track: row.track_name,
    track_id: row.track_id,
    format: row.format_name,
    format_id: row.format_id,
    level: row.level,
    room: row.room_name,
    room_id: row.location_id,
    starts_at: row.starts_at,
    ends_at: row.ends_at,
    published_starts_at: row.pub_starts_at,
    speakers: row.speakers,
    average_score: row.avg_score,
    review_count: row.review_count,
    answers: readJson(row.answers, {}),
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

function contactJson(row: ReturnType<typeof listRoster>[number]) {
  return {
    id: row.id,
    name: contactName(row),
    first_name: row.first_name,
    last_name: row.last_name,
    email: row.email,
    job_title: row.job_title,
    company: row.company,
    biography: row.biography,
    headshot_url: row.headshot_url,
    speaker_status: row.speaker_status,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

function participantJson(row: ReturnType<typeof listParticipants>[number]) {
  return {
    id: row.id,
    contact_id: row.contact_id,
    name: `${row.first_name} ${row.last_name}`,
    email: row.email,
    role: row.role,
    acceptance_status: row.acceptance_status,
  };
}

void get;
