import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session";
import { forbidden, getUserRolesForEvent } from "@/lib/auth/guards";
import { getDefaultEvent } from "@/lib/db/queries";
import { signOutAction } from "@/lib/auth/actions";

export default async function ReviewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();
  if (!user) redirect("/sign-in?next=/review");
  const event = getDefaultEvent();
  if (!event) redirect("/");
  const roles = await getUserRolesForEvent(user.id, event.id);
  if (!roles.includes("reviewer") && !roles.includes("organizer")) {
    forbidden();
  }

  return (
    <div className="min-h-full">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div>
            <div className="text-xs uppercase tracking-wide text-slate-500">Reviews</div>
            <div className="font-semibold">{event.name}</div>
          </div>
          <div className="flex items-center gap-3 text-sm">
            {roles.includes("organizer") ? (
              <Link href={`/admin/e/${event.slug}`} className="font-medium text-blue-700">
                Admin
              </Link>
            ) : null}
            <span>
              {user.firstName} {user.lastName}
            </span>
            <form action={signOutAction}>
              <button type="submit" className="text-slate-600 hover:text-slate-900">
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
    </div>
  );
}
