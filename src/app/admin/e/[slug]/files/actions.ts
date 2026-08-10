"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requireEventRole } from "@/lib/auth/guards";
import { getDb, schema } from "@/lib/db";
import { nowIso } from "@/lib/dates";
import { id } from "@/lib/id";

export async function addFileCommentAction(formData: FormData) {
  const slug = String(formData.get("slug") || "");
  const uploadId = String(formData.get("uploadId") || "");
  const body = String(formData.get("body") || "").trim();
  const { user, event } = await requireEventRole(slug, ["organizer"]);
  if (!uploadId || !body) throw new Error("Comment is required");

  const db = getDb();
  const upload = db
    .select()
    .from(schema.uploads)
    .where(and(eq(schema.uploads.id, uploadId), eq(schema.uploads.eventId, event.id)))
    .get();
  if (!upload) throw new Error("Upload not found");

  db.insert(schema.fileComments)
    .values({
      id: id("fcm"),
      uploadId,
      authorUserId: user.id,
      body,
      createdAt: nowIso(),
    })
    .run();

  revalidatePath(`/admin/e/${slug}/files`);
  revalidatePath(`/admin/e/${slug}/speakers`);
}
