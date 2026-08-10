import { redirect } from "next/navigation";
import { getDefaultEvent } from "@/lib/db/queries";
import { getSessionUser } from "@/lib/auth/session";

export default async function AdminIndexPage() {
  const user = await getSessionUser();
  if (!user) redirect("/sign-in?next=/admin");
  const event = getDefaultEvent();
  if (!event) {
    return (
      <div className="p-8">
        <h1 className="text-xl font-semibold">No events yet</h1>
        <p className="mt-2 text-slate-600">Run npm run seed to create the demo event.</p>
      </div>
    );
  }
  redirect(`/admin/e/${event.slug}`);
}
