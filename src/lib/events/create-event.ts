import { and, eq, ne } from "drizzle-orm";
import type { getDb } from "@/lib/db";
import { schema } from "@/lib/db";
import { nowIso } from "@/lib/dates";
import { seedEmailTemplatesForEvent } from "@/lib/email/templates";
import { id } from "@/lib/id";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export type CreateEventInput = {
  name: string;
  slug: string;
  type: string;
  websiteUrl?: string | null;
  location?: string | null;
  timezone: string;
  startsAt: string;
  endsAt: string;
  theme?: string | null;
  orgId: string;
  userId: string;
};

export function getOrCreateDefaultOrg(
  db: ReturnType<typeof getDb>,
  user: { firstName: string; lastName: string },
) {
  const existing = db.select().from(schema.organizations).limit(1).get();
  if (existing) return existing;

  const createdAt = nowIso();
  const orgId = id("org");
  const name = `${user.firstName} ${user.lastName}`.trim() || "My Organization";
  db.insert(schema.organizations)
    .values({
      id: orgId,
      name,
      slug: slugify(name) || "org",
      createdAt,
    })
    .run();

  return db.select().from(schema.organizations).where(eq(schema.organizations.id, orgId)).get()!;
}

export function createEventRecord(db: ReturnType<typeof getDb>, input: CreateEventInput) {
  const eventSlug = slugify(input.slug);
  if (!eventSlug) throw new Error("Slug is required");

  const conflict = db
    .select({ id: schema.events.id })
    .from(schema.events)
    .where(eq(schema.events.slug, eventSlug))
    .get();
  if (conflict) throw new Error("Slug is already in use");

  const createdAt = nowIso();
  const eventId = id("evt");

  db.insert(schema.events)
    .values({
      id: eventId,
      orgId: input.orgId,
      name: input.name.trim(),
      slug: eventSlug,
      type: input.type || "conference",
      websiteUrl: input.websiteUrl || null,
      location: input.location || null,
      timezone: input.timezone,
      startsAt: new Date(input.startsAt).toISOString(),
      endsAt: new Date(input.endsAt).toISOString(),
      theme: input.theme || null,
      accentColor: "#2563eb",
      status: "active",
      createdAt,
    })
    .run();

  db.insert(schema.eventMemberships)
    .values({
      id: id("mem"),
      eventId,
      userId: input.userId,
      role: "organizer",
      createdAt,
    })
    .run();

  seedEmailTemplatesForEvent(db, eventId);

  return { id: eventId, slug: eventSlug };
}

export function listOrganizerEventsForUser(db: ReturnType<typeof getDb>, userId: string) {
  return db
    .select({
      id: schema.events.id,
      name: schema.events.name,
      slug: schema.events.slug,
      startsAt: schema.events.startsAt,
      endsAt: schema.events.endsAt,
    })
    .from(schema.events)
    .innerJoin(
      schema.eventMemberships,
      and(
        eq(schema.eventMemberships.eventId, schema.events.id),
        eq(schema.eventMemberships.userId, userId),
        eq(schema.eventMemberships.role, "organizer"),
      ),
    )
    .orderBy(schema.events.startsAt)
    .all();
}

export function isSlugAvailable(db: ReturnType<typeof getDb>, slug: string, excludeEventId?: string) {
  const eventSlug = slugify(slug);
  if (!eventSlug) return false;
  const filters = [eq(schema.events.slug, eventSlug)];
  if (excludeEventId) {
    filters.push(ne(schema.events.id, excludeEventId));
  }
  const conflict = db
    .select({ id: schema.events.id })
    .from(schema.events)
    .where(and(...filters))
    .get();
  return !conflict;
}
