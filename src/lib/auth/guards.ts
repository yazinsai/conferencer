import { eq, and } from "drizzle-orm";
import { redirect } from "next/navigation";
import { getDb, schema } from "@/lib/db";
import { getSessionUser } from "./session";

export type EventRole = "organizer" | "reviewer" | "participant";

export async function getEventBySlug(slug: string) {
  const db = getDb();
  return db
    .select()
    .from(schema.events)
    .where(eq(schema.events.slug, slug))
    .get();
}

export async function getUserRolesForEvent(userId: string, eventId: string) {
  const db = getDb();
  const rows = db
    .select()
    .from(schema.eventMemberships)
    .where(
      and(
        eq(schema.eventMemberships.userId, userId),
        eq(schema.eventMemberships.eventId, eventId),
      ),
    )
    .all();
  return rows.map((r) => r.role as EventRole);
}

export async function requireEventRole(
  slug: string,
  allowed: EventRole[],
  opts?: { redirectTo?: string },
) {
  const user = await getSessionUser();
  if (!user) {
    redirect(`/sign-in?next=${encodeURIComponent(opts?.redirectTo ?? `/admin/e/${slug}`)}`);
  }
  const event = await getEventBySlug(slug);
  if (!event) {
    redirect("/admin");
  }
  const roles = await getUserRolesForEvent(user.id, event.id);
  if (!roles.some((r) => allowed.includes(r))) {
    redirect("/forbidden");
  }
  return { user, event, roles };
}

export async function requireAnyAuth(redirectTo = "/") {
  const user = await getSessionUser();
  if (!user) redirect(`/sign-in?next=${encodeURIComponent(redirectTo)}`);
  return user;
}

export function forbidden() {
  redirect("/forbidden");
}

export function notFoundPage(): never {
  redirect("/not-found");
}
