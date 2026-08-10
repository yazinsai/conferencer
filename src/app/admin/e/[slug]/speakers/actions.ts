"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requireEventRole } from "@/lib/auth/guards";
import { getDb, schema } from "@/lib/db";
import { id } from "@/lib/id";
import { nowIso } from "@/lib/dates";

function revalidateSpeakers(slug: string) {
  revalidatePath(`/admin/e/${slug}/speakers`);
  revalidatePath(`/admin/e/${slug}/deliverables`);
}

export async function addSpeakerAction(formData: FormData) {
  const slug = String(formData.get("slug") || "");
  const { event } = await requireEventRole(slug, ["organizer"]);
  const db = getDb();

  const firstName = String(formData.get("firstName") || "").trim();
  const lastName = String(formData.get("lastName") || "").trim();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const speakerStatus = String(formData.get("speakerStatus") || "prospect");

  if (!firstName || !lastName || !email) {
    throw new Error("First name, last name, and email are required");
  }

  const createdAt = nowIso();
  const contactId = id("ctc");

  db.insert(schema.contacts)
    .values({
      id: contactId,
      orgId: event.orgId,
      userId: null,
      firstName,
      lastName,
      email,
      createdAt,
    })
    .run();

  db.insert(schema.eventContacts)
    .values({
      id: id("ec"),
      eventId: event.id,
      contactId,
      status: "active",
      speakerStatus,
      createdAt,
    })
    .run();

  revalidateSpeakers(slug);
}

export async function updateSpeakerStatusAction(formData: FormData) {
  const slug = String(formData.get("slug") || "");
  const contactId = String(formData.get("contactId") || "");
  const speakerStatus = String(formData.get("speakerStatus") || "");
  const { event } = await requireEventRole(slug, ["organizer"]);
  if (!contactId || !speakerStatus) throw new Error("Invalid input");

  const db = getDb();
  db.update(schema.eventContacts)
    .set({ speakerStatus })
    .where(
      and(
        eq(schema.eventContacts.eventId, event.id),
        eq(schema.eventContacts.contactId, contactId),
      ),
    )
    .run();

  revalidateSpeakers(slug);
  revalidatePath(`/admin/e/${slug}/speakers/${contactId}`);
}

export async function saveSpeakerProfileAction(formData: FormData) {
  const slug = String(formData.get("slug") || "");
  const contactId = String(formData.get("contactId") || "");
  const { event } = await requireEventRole(slug, ["organizer"]);
  if (!contactId) throw new Error("Invalid contact");

  const db = getDb();
  const link = db
    .select()
    .from(schema.eventContacts)
    .where(
      and(
        eq(schema.eventContacts.eventId, event.id),
        eq(schema.eventContacts.contactId, contactId),
      ),
    )
    .get();
  if (!link) throw new Error("Speaker not found");

  const str = (key: string) => String(formData.get(key) || "").trim();

  db.update(schema.contacts)
    .set({
      firstName: str("firstName"),
      lastName: str("lastName"),
      email: str("email").toLowerCase(),
      pronouns: str("pronouns") || null,
      jobTitle: str("jobTitle") || null,
      company: str("company") || null,
      biography: str("biography") || null,
      linkedinUrl: str("linkedinUrl") || null,
      twitterUrl: str("twitterUrl") || null,
      facebookUrl: str("facebookUrl") || null,
      websiteUrl: str("websiteUrl") || null,
      dietary: str("dietary") || null,
      tshirtSize: str("tshirtSize") || null,
      headshotUrl: str("headshotUrl") || null,
    })
    .where(eq(schema.contacts.id, contactId))
    .run();

  revalidateSpeakers(slug);
  revalidatePath(`/admin/e/${slug}/speakers/${contactId}`);
}
