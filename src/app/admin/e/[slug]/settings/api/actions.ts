"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requireEventRole } from "@/lib/auth/guards";
import { createApiTokenRecord } from "@/lib/api/auth";
import { getDb, schema } from "@/lib/db";

function revalidateApi(slug: string) {
  revalidatePath(`/admin/e/${slug}/settings/api`);
}

export async function createApiTokenAction(formData: FormData) {
  const slug = String(formData.get("slug") || "");
  const name = String(formData.get("name") || "").trim();
  const { event } = await requireEventRole(slug, ["organizer"]);

  if (!name) throw new Error("Token name is required");

  const token = await createApiTokenRecord(event.id, name);
  revalidateApi(slug);
  return token;
}

export async function revokeApiTokenAction(formData: FormData) {
  const slug = String(formData.get("slug") || "");
  const tokenId = String(formData.get("tokenId") || "");
  const { event } = await requireEventRole(slug, ["organizer"]);

  const db = getDb();
  const row = db
    .select()
    .from(schema.apiTokens)
    .where(eq(schema.apiTokens.id, tokenId))
    .get();

  if (!row || row.eventId !== event.id) {
    throw new Error("Token not found");
  }

  db.delete(schema.apiTokens).where(eq(schema.apiTokens.id, tokenId)).run();
  revalidateApi(slug);
}
