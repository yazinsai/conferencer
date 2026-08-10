"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session";
import { getDb, schema } from "@/lib/db";
import { getContactForUser, getDefaultEvent } from "@/lib/db/queries";
import { saveUpload } from "@/lib/storage/files";
import { id } from "@/lib/id";
import { nowIso } from "@/lib/dates";

async function getOwnedAssignment(assignmentId: string, userId: string) {
  const event = getDefaultEvent();
  if (!event) throw new Error("Event not found");
  const row = getContactForUser(event.id, userId);
  if (!row) throw new Error("Contact not found");

  const db = getDb();
  const assignment = db
    .select({
      assignment: schema.taskAssignments,
      task: schema.tasks,
    })
    .from(schema.taskAssignments)
    .innerJoin(schema.tasks, eq(schema.taskAssignments.taskId, schema.tasks.id))
    .where(
      and(
        eq(schema.taskAssignments.id, assignmentId),
        eq(schema.taskAssignments.contactId, row.contact.id),
        eq(schema.taskAssignments.eventId, event.id),
      ),
    )
    .get();

  if (!assignment) throw new Error("Task assignment not found");
  return { event, contact: row.contact, ...assignment };
}

export async function completeActionTaskAction(formData: FormData) {
  const user = await getSessionUser();
  if (!user) redirect("/sign-in?next=/portal/tasks");

  const assignmentId = String(formData.get("assignmentId") || "");
  const { assignment } = await getOwnedAssignment(assignmentId, user.id);

  if (assignment.status === "complete" && assignment.lockOnComplete) {
    throw new Error("Task is locked");
  }

  const db = getDb();
  db.update(schema.taskAssignments)
    .set({
      status: "complete",
      completedAt: nowIso(),
    })
    .where(eq(schema.taskAssignments.id, assignmentId))
    .run();

  revalidatePath("/portal");
  revalidatePath("/portal/tasks");
}

export async function uploadFileTaskAction(formData: FormData) {
  const user = await getSessionUser();
  if (!user) redirect("/sign-in?next=/portal/tasks");

  const assignmentId = String(formData.get("assignmentId") || "");
  const { event, contact, assignment, task } = await getOwnedAssignment(
    assignmentId,
    user.id,
  );

  if (task.type !== "file_request") throw new Error("Not a file request task");
  if (assignment.status === "complete" && assignment.lockOnComplete) {
    throw new Error("Task is locked");
  }

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    throw new Error("Please choose a file");
  }

  const maxBytes = (task.maxSizeMb ?? 20) * 1024 * 1024;
  if (file.size > maxBytes) {
    throw new Error(`File exceeds ${task.maxSizeMb ?? 20} MB limit`);
  }

  const accepted = (task.acceptedTypes ?? "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
  if (accepted.length && !accepted.includes(file.type)) {
    throw new Error(`File type not allowed. Accepted: ${accepted.join(", ")}`);
  }

  const buf = Buffer.from(await file.arrayBuffer());
  const saved = await saveUpload({
    eventId: event.id,
    filename: file.name,
    contentType: file.type || "application/octet-stream",
    data: buf,
  });

  const db = getDb();
  const uploadId = id("upl");
  db.insert(schema.uploads)
    .values({
      id: uploadId,
      eventId: event.id,
      taskAssignmentId: assignmentId,
      contactId: contact.id,
      filename: saved.filename,
      contentType: saved.contentType,
      size: saved.size,
      storageKey: saved.storageKey,
      uploadedByUserId: user.id,
      createdAt: nowIso(),
    })
    .run();

  db.update(schema.taskAssignments)
    .set({
      status: "complete",
      completedAt: nowIso(),
    })
    .where(eq(schema.taskAssignments.id, assignmentId))
    .run();

  revalidatePath("/portal");
  revalidatePath("/portal/tasks");
}

export async function submitFormTaskAction(formData: FormData) {
  const user = await getSessionUser();
  if (!user) redirect("/sign-in?next=/portal/tasks");

  const assignmentId = String(formData.get("assignmentId") || "");
  const answer = String(formData.get("answer") || "").trim();
  const { assignment, task } = await getOwnedAssignment(assignmentId, user.id);

  if (task.type !== "form") throw new Error("Not a form task");
  if (assignment.status === "complete" && assignment.lockOnComplete) {
    throw new Error("Task is locked");
  }
  if (!answer) throw new Error("Please provide an answer");

  const db = getDb();
  db.update(schema.taskAssignments)
    .set({
      status: "complete",
      completedAt: nowIso(),
      formAnswers: JSON.stringify({ answer }),
    })
    .where(eq(schema.taskAssignments.id, assignmentId))
    .run();

  revalidatePath("/portal");
  revalidatePath("/portal/tasks");
}
