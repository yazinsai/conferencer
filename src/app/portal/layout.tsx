import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session";
import { forbidden, getUserRolesForEvent } from "@/lib/auth/guards";
import { getDefaultEvent } from "@/lib/db/queries";
import { signOutAction } from "@/lib/auth/actions";

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();
  if (!user) redirect("/sign-in?next=/portal");
  const event = getDefaultEvent();
  if (!event) redirect("/");
  const roles = await getUserRolesForEvent(user.id, event.id);
  if (!roles.includes("participant") && !roles.includes("organizer")) {
    forbidden();
  }

  const tabs = [
    { href: "/portal", label: "Home" },
    { href: "/portal/submissions", label: "Submissions" },
    { href: "/portal/profile", label: "Profile" },
    { href: "/portal/tasks", label: "Tasks" },
  ];

  return (
    <div className="min-h-full">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <div>
            <div className="text-xs uppercase tracking-wide text-slate-500">
              Speaker Portal
            </div>
            <div className="font-semibold">{event.name}</div>
          </div>
          <div className="flex items-center gap-3 text-sm">
            {roles.includes("organizer") ? (
              <Link
                href={`/admin/e/${event.slug}`}
                className="font-medium text-blue-700"
              >
                Back to Admin Mode
              </Link>
            ) : null}
            <span className="text-slate-600">
              {user.firstName} {user.lastName}
            </span>
            <form action={signOutAction}>
              <button
                type="submit"
                className="text-slate-600 hover:text-slate-900"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
        <nav className="mx-auto flex max-w-5xl gap-1 px-4">
          {tabs.map((t) => (
            <Link
              key={t.href}
              href={t.href}
              className="border-b-2 border-transparent px-3 py-2 text-sm font-medium text-slate-600 hover:border-blue-600 hover:text-blue-700"
            >
              {t.label}
            </Link>
          ))}
        </nav>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
    </div>
  );
}
