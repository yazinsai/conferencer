"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireOrganizer } from "@/lib/guards";
import { fullName } from "@/lib/auth";
import { all, writeJson } from "@/lib/db";
import { formatDate, formatEventDates, normalizeLocal } from "@/lib/datetime";
import { appUrl, sendTemplate } from "@/lib/email";
import { logAudit } from "@/lib/repo/audit";
import { contactName, getContact, listRoster } from "@/lib/repo/contacts";
import {
  assignTask,
  createTask,
  deleteAssignment,
  deleteTask,
  effectiveDue,
  getAssignment,
  getTask,
  listAssignments,
  setAssignmentStatus,
  updateAssignment,
  updateTask,
} from "@/lib/repo/tasks";
import { addComment } from "@/lib/repo/uploads";
import { listSubmissions } from "@/lib/repo/submissions";

async function ctx(formData: FormData) {
  const slug = String(formData.get("slug"));
  const auth = await requireOrganizer(slug);
  return { slug, ...auth };
}

function parseFormSchema(raw: string) {
  // "Arrival date | date | required" one per line
  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [label, type = "text", flag = "", options = ""] = line.split("|").map((s) => s.trim());
      return {
        key: label.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, ""),
        label,
        type,
        required: flag.toLowerCase() === "required",
        options: options ? options.split(";").map((o) => o.trim()) : undefined,
      };
    });
}

export async function saveTaskAction(formData: FormData) {
  const { slug, event, user } = await ctx(formData);
  const taskId = String(formData.get("task_id") ?? "");
  const patch = {
    name: String(formData.get("name") ?? "").trim(),
    description: String(formData.get("description") ?? "") || null,
    type: String(formData.get("type") ?? "action") as "action" | "file_request" | "form",
    target: String(formData.get("target") ?? "contact") as "contact" | "submission",
    link_url: String(formData.get("link_url") ?? "") || null,
    accepted_types: String(formData.get("accepted_types") ?? ""),
    max_size_mb: Number(formData.get("max_size_mb") ?? 20),
    form_schema: writeJson(parseFormSchema(String(formData.get("form_schema") ?? ""))),
  };
  if (!patch.name) redirect(`/admin/e/${slug}/tasks?error=Task+name+is+required`);

  let id = taskId;
  if (taskId) {
    updateTask(taskId, patch);
  } else {
    const task = createTask(event.id, patch);
    id = task.id;
  }

  logAudit({
    eventId: event.id,
    entityType: "task",
    entityId: id,
    actorUserId: user.id,
    actorName: fullName(user),
    action: taskId ? "edited" : "created",
    summary: `${taskId ? "Updated" : "Created"} task "${patch.name}"`,
  });

  revalidatePath(`/admin/e/${slug}/tasks`, "layout");
  redirect(`/admin/e/${slug}/tasks?saved=1`);
}

export async function deleteTaskAction(formData: FormData) {
  const { slug, event } = await ctx(formData);
  const task = getTask(String(formData.get("task_id")));
  if (task && task.event_id === event.id) deleteTask(task.id);
  revalidatePath(`/admin/e/${slug}/tasks`, "layout");
  redirect(`/admin/e/${slug}/tasks`);
}

export async function assignTaskAction(formData: FormData) {
  const { slug, event, user } = await ctx(formData);
  const taskId = String(formData.get("task_id"));
  const task = getTask(taskId);
  if (!task || task.event_id !== event.id) return;

  const dueAt = normalizeLocal(String(formData.get("due_at") ?? ""));
  const isRequired = Boolean(formData.get("is_required"));
  const audience = String(formData.get("audience") ?? "selected");
  const notify = Boolean(formData.get("notify"));

  let contactIds = formData.getAll("contact_ids").map(String).filter(Boolean);
  if (audience === "all") {
    contactIds = listRoster(event.id).map((row) => row.id);
  } else if (audience === "accepted") {
    const accepted = listSubmissions(event.id, { status: "accepted", limit: 1000 });
    const set = new Set<string>();
    for (const submission of accepted) {
      for (const row of all<{ contact_id: string }>(
        "SELECT contact_id FROM submission_participants WHERE submission_id = ? AND role != 'submitter'",
        submission.id,
      )) {
        set.add(row.contact_id);
      }
    }
    contactIds = [...set];
  }

  let assigned = 0;
  for (const contactId of contactIds) {
    const submissionId =
      task.target === "submission"
        ? (all<{ submission_id: string }>(
            `SELECT sp.submission_id FROM submission_participants sp
               JOIN submissions s ON s.id = sp.submission_id
              WHERE sp.contact_id = ? AND s.event_id = ? AND s.status = 'accepted'
              ORDER BY s.created_at LIMIT 1`,
            contactId,
            event.id,
          )[0]?.submission_id ?? null)
        : null;
    const assignment = assignTask({
      taskId: task.id,
      eventId: event.id,
      contactId,
      submissionId,
      dueAt,
      isRequired,
    });
    assigned += 1;

    if (notify) {
      const contact = getContact(contactId);
      if (contact?.email) {
        await sendTemplate({
          eventId: event.id,
          templateKey: "task_assigned",
          to: contact.email,
          toName: contactName(contact),
          contactId: contact.id,
          context: {
            first_name: contact.first_name,
            speaker_name: contactName(contact),
            event_name: event.name,
            event_dates: formatEventDates(event.starts_at, event.ends_at),
            task_name: task.name,
            due_date: dueAt ? formatDate(dueAt) : "soon",
            portal_link: appUrl(`/portal/tasks/${assignment.id}`),
          },
        });
      }
    }
  }

  logAudit({
    eventId: event.id,
    entityType: "task",
    entityId: task.id,
    actorUserId: user.id,
    actorName: fullName(user),
    action: "assigned",
    summary: `Assigned "${task.name}" to ${assigned} speaker(s)`,
  });

  revalidatePath(`/admin/e/${slug}`, "layout");
  revalidatePath("/portal", "layout");
  redirect(`/admin/e/${slug}/tasks?assigned=${assigned}`);
}

export async function setAssignmentStatusAction(formData: FormData) {
  const { slug, event } = await ctx(formData);
  const assignmentId = String(formData.get("assignment_id"));
  const assignment = getAssignment(assignmentId);
  if (!assignment || assignment.event_id !== event.id) return;
  setAssignmentStatus(assignmentId, String(formData.get("status")));
  revalidatePath(`/admin/e/${slug}`, "layout");
  revalidatePath("/portal", "layout");
}

export async function extendDueAction(formData: FormData) {
  const { slug, event } = await ctx(formData);
  const assignmentId = String(formData.get("assignment_id"));
  const assignment = getAssignment(assignmentId);
  if (!assignment || assignment.event_id !== event.id) return;
  updateAssignment(assignmentId, {
    extended_due_at: normalizeLocal(String(formData.get("extended_due_at") ?? "")),
  });
  revalidatePath(`/admin/e/${slug}`, "layout");
  revalidatePath("/portal", "layout");
}

export async function removeAssignmentAction(formData: FormData) {
  const { slug, event } = await ctx(formData);
  const assignmentId = String(formData.get("assignment_id"));
  const assignment = getAssignment(assignmentId);
  if (!assignment || assignment.event_id !== event.id) return;
  deleteAssignment(assignmentId);
  revalidatePath(`/admin/e/${slug}`, "layout");
  revalidatePath("/portal", "layout");
}

export async function remindOutstandingAction(formData: FormData) {
  const { slug, event, user } = await ctx(formData);
  const explicit = formData.getAll("assignment_ids").map(String).filter(Boolean);
  const assignments = explicit.length
    ? explicit.map((id) => getAssignment(id)).filter(Boolean)
    : listAssignments(event.id, { status: "outstanding" });

  const byContact = new Map<string, string[]>();
  for (const assignment of assignments) {
    if (!assignment) continue;
    const list = byContact.get(assignment.contact_id) ?? [];
    list.push(
      `${assignment.task_name}${
        effectiveDue(assignment) ? ` (due ${formatDate(effectiveDue(assignment))})` : ""
      }`,
    );
    byContact.set(assignment.contact_id, list);
  }

  let sent = 0;
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
      kind: "manual",
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
    action: "task_reminders",
    summary: `Sent ${sent} deliverable reminder(s)`,
  });

  revalidatePath(`/admin/e/${slug}`, "layout");
  redirect(`/admin/e/${slug}/tasks/deliverables?reminded=${sent}`);
}

export async function commentOnUploadAction(formData: FormData) {
  const { slug, event, user } = await ctx(formData);
  const uploadId = String(formData.get("upload_id"));
  const body = String(formData.get("body") ?? "").trim();
  if (!body) return;
  addComment({ uploadId, authorUserId: user.id, authorName: fullName(user), body });
  revalidatePath(`/admin/e/${slug}`, "layout");
  revalidatePath("/portal", "layout");
  void event;
}
