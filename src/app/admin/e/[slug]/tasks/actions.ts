"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requireEventRole } from "@/lib/auth/guards";
import { getDb, schema } from "@/lib/db";
import { id } from "@/lib/id";
import { nowIso } from "@/lib/dates";

function revalidateTasks(slug: string) {
  revalidatePath(`/admin/e/${slug}/tasks`);
  revalidatePath(`/admin/e/${slug}/deliverables`);
  revalidatePath(`/admin/e/${slug}/speakers`);
}

export async function createTaskAction(formData: FormData) {
  const slug = String(formData.get("slug") || "");
  const { event } = await requireEventRole(slug, ["organizer"]);
  const db = getDb();

  const name = String(formData.get("name") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const type = String(formData.get("type") || "action") as
    | "action"
    | "file_request"
    | "form";
  const linkUrl = String(formData.get("linkUrl") || "").trim();
  const acceptedTypes = String(
    formData.get("acceptedTypes") || "application/pdf,image/png,image/jpeg",
  ).trim();
  const maxSizeMb = Number(formData.get("maxSizeMb") || 20);
  const dueAt = String(formData.get("dueAt") || "").trim();
  const assignMode = String(formData.get("assignMode") || "selected");
  const isRequired = formData.get("isRequired") === "on";
  const formIdRaw = String(formData.get("formId") || "").trim();
  const formId = type === "form" && formIdRaw ? formIdRaw : null;

  if (!name) throw new Error("Task name is required");

  const createdAt = nowIso();
  const taskId = id("tsk");

  db.insert(schema.tasks)
    .values({
      id: taskId,
      eventId: event.id,
      name,
      description: description || null,
      type,
      target: "contact",
      linkUrl: linkUrl || null,
      formId,
      acceptedTypes: type === "file_request" ? acceptedTypes : null,
      maxSizeMb: type === "file_request" ? maxSizeMb : 20,
      createdAt,
    })
    .run();

  let contactIds: string[] = [];
  if (assignMode === "all_confirmed") {
    contactIds = db
      .select({ contactId: schema.eventContacts.contactId })
      .from(schema.eventContacts)
      .where(
        and(
          eq(schema.eventContacts.eventId, event.id),
          eq(schema.eventContacts.speakerStatus, "confirmed"),
        ),
      )
      .all()
      .map((r) => r.contactId);
  } else {
    contactIds = formData.getAll("contactIds").map(String).filter(Boolean);
  }

  const dueIso = dueAt ? new Date(dueAt).toISOString() : null;

  for (const contactId of contactIds) {
    db.insert(schema.taskAssignments)
      .values({
        id: id("ta"),
        taskId,
        eventId: event.id,
        contactId,
        dueAt: dueIso,
        isRequired,
        status: "not_started",
        createdAt,
      })
      .run();
  }

  revalidateTasks(slug);
}
