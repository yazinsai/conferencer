"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session";
import { getDb, schema } from "@/lib/db";
import { getContactForUser, getDefaultEvent } from "@/lib/db/queries";
import { saveUpload } from "@/lib/storage/files";
import { id } from "@/lib/id";
import { nowIso } from "@/lib/dates";

function str(formData: FormData, key: string) {
  const v = formData.get(key);
  return v == null ? "" : String(v).trim();
}

export async function saveProfileAction(formData: FormData) {
  const user = await getSessionUser();
  if (!user) redirect("/sign-in?next=/portal/profile");
  const event = getDefaultEvent();
  if (!event) redirect("/");

  const row = getContactForUser(event.id, user.id);
  if (!row) throw new Error("No contact profile found for this event");

  const biography = str(formData, "biography");
  if (biography.length > 5000) throw new Error("Biography exceeds 5000 characters");

  let headshotUrl = str(formData, "headshotUrl") || row.contact.headshotUrl || null;
  const headshotFile = formData.get("headshotFile");
  if (headshotFile instanceof File && headshotFile.size > 0) {
    const buf = Buffer.from(await headshotFile.arrayBuffer());
    const saved = await saveUpload({
      eventId: event.id,
      filename: headshotFile.name,
      contentType: headshotFile.type || "application/octet-stream",
      data: buf,
    });
    headshotUrl = `/api/files/${saved.storageKey}`;
    const db = getDb();
    db.insert(schema.uploads)
      .values({
        id: id("upl"),
        eventId: event.id,
        contactId: row.contact.id,
        filename: saved.filename,
        contentType: saved.contentType,
        size: saved.size,
        storageKey: saved.storageKey,
        uploadedByUserId: user.id,
        createdAt: nowIso(),
      })
      .run();
  }

  const db = getDb();
  db.update(schema.contacts)
    .set({
      firstName: str(formData, "firstName") || row.contact.firstName,
      lastName: str(formData, "lastName") || row.contact.lastName,
      pronouns: str(formData, "pronouns") || null,
      jobTitle: str(formData, "jobTitle") || null,
      company: str(formData, "company") || null,
      biography: biography || null,
      linkedinUrl: str(formData, "linkedinUrl") || null,
      twitterUrl: str(formData, "twitterUrl") || null,
      facebookUrl: str(formData, "facebookUrl") || null,
      websiteUrl: str(formData, "websiteUrl") || null,
      dietary: str(formData, "dietary") || null,
      tshirtSize: str(formData, "tshirtSize") || null,
      headshotUrl,
    })
    .where(eq(schema.contacts.id, row.contact.id))
    .run();

  revalidatePath("/portal");
  revalidatePath("/portal/profile");
}
