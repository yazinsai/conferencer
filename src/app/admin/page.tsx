import { redirect } from "next/navigation";

import { requireUser, landingFor } from "@/lib/guards";
import { defaultEvent } from "@/lib/repo/events";
import { hasRole } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminIndex() {
  const user = await requireUser("/admin");
  const event = defaultEvent();
  if (!event) redirect("/sign-in");
  if (!user.is_superadmin && !hasRole(user.id, event.id, "organizer")) {
    redirect(landingFor(user));
  }
  redirect(`/admin/e/${event.slug}`);
}
