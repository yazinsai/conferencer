import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { getUserRolesForEvent } from "@/lib/auth/guards";
import { getSessionUser } from "@/lib/auth/session";
import { getDb, schema } from "@/lib/db";
import { getDefaultEvent } from "@/lib/db/queries";

export async function requireCrmAccess(redirectTo = "/admin/crm") {
  const user = await getSessionUser();
  if (!user) {
    redirect(`/sign-in?next=${encodeURIComponent(redirectTo)}`);
  }

  const event = getDefaultEvent();
  if (!event) {
    redirect("/admin");
  }

  const roles = await getUserRolesForEvent(user.id, event.id);
  if (!roles.includes("organizer")) {
    redirect("/forbidden");
  }

  const db = getDb();
  const org = db
    .select()
    .from(schema.organizations)
    .where(eq(schema.organizations.id, event.orgId))
    .get();

  const orgEvents = db
    .select()
    .from(schema.events)
    .where(eq(schema.events.orgId, event.orgId))
    .orderBy(schema.events.createdAt)
    .all();

  return { user, event, org, orgId: event.orgId, orgEvents };
}
