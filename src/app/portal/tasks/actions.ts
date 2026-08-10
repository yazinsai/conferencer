"use server";

import { and, desc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { forbidden } from "@/lib/auth/guards";
import { getSessionUser } from "@/lib/auth/session";
import { getDb, schema } from "@/lib/db";
import { getContactForUser, getDefaultEvent, loadFormQuestions } from "@/lib/db/queries";
import { saveUpload } from "@/lib/storage/files";
import { id } from "@/lib/id";
import { nowIso } from "@/lib/dates";

async function getOwnedAssignment(assignmentId: string, userId: string) {
  const event = getDefaultEvent();
  if (!event) throw new Error("Event not found");
  const row = getContactForUser(event.id, userId);
  if (!row) forbidden();

  const db = getDb();
  const owned = db
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

  if (!owned) {
    // Assignment exists for someone else, or doesn't exist — never leak.
    const any = db
      .select({ id: schema.taskAssignments.id })
      .from(schema.taskAssignments)
      .where(eq(schema.taskAssignments.id, assignmentId))
      .get();
    if (any) forbidden();
    forbidden();
  }
  return { event, contact: row.contact, ...owned };
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
  const prior = db
    .select({ version: schema.uploads.version })
    .from(schema.uploads)
    .where(eq(schema.uploads.taskAssignmentId, assignmentId))
    .orderBy(desc(schema.uploads.version))
    .get();
  const version = (prior?.version ?? 0) + 1;

  const uploadId = id("upl");
  const createdAt = nowIso();
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
      version,
      uploadedByUserId: user.id,
      createdAt,
    })
    .run();

  const completedAt = assignment.completedAt ?? createdAt;
  db.update(schema.taskAssignments)
    .set({
      status: "complete",
      completedAt,
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
  const { assignment, task } = await getOwnedAssignment(assignmentId, user.id);

  if (task.type !== "form") throw new Error("Not a form task");
  if (assignment.status === "complete" && assignment.lockOnComplete) {
    throw new Error("Task is locked");
  }

  let formAnswers: Record<string, string>;

  if (task.formId) {
    const questions = loadFormQuestions(task.formId);
    if (questions.length > 0) {
      formAnswers = {};
      for (const q of questions) {
        const value = String(formData.get(`q_${q.id}`) || "").trim();
        if (q.isRequired && !value) {
          throw new Error(`"${q.label}" is required`);
        }
        if (value) formAnswers[q.id] = value;
      }
      if (Object.keys(formAnswers).length === 0) {
        throw new Error("Please complete the form");
      }
    } else {
      const answer = String(formData.get("answer") || "").trim();
      if (!answer) throw new Error("Please provide an answer");
      formAnswers = { answer };
    }
  } else {
    const answer = String(formData.get("answer") || "").trim();
    if (!answer) throw new Error("Please provide an answer");
    formAnswers = { answer };
  }

  const db = getDb();
  db.update(schema.taskAssignments)
    .set({
      status: "complete",
      completedAt: nowIso(),
      formAnswers: JSON.stringify(formAnswers),
    })
    .where(eq(schema.taskAssignments.id, assignmentId))
    .run();

  revalidatePath("/portal");
  revalidatePath("/portal/tasks");
}
