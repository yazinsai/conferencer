import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session";
import { forbidden, getUserRolesForEvent } from "@/lib/auth/guards";
import { getDefaultEvent } from "@/lib/db/queries";
import { signOutAction } from "@/lib/auth/actions";
import { Button, ButtonLink } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

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
    <div className="min-h-full bg-background">
      <header className="border-b bg-card">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <div>
            <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Speaker Portal
            </div>
            <div className="font-semibold">{event.name}</div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            {roles.includes("organizer") ? (
              <ButtonLink href={`/admin/e/${event.slug}`} variant="link" size="sm">
                Back to Admin Mode
              </ButtonLink>
            ) : null}
            <span className="text-muted-foreground">
              {user.firstName} {user.lastName}
            </span>
            <form action={signOutAction}>
              <Button type="submit" variant="ghost" size="sm">
                Sign out
              </Button>
            </form>
          </div>
        </div>
        <Separator />
        <nav className="mx-auto flex max-w-5xl gap-1 px-4">
          {tabs.map((t) => (
            <Link
              key={t.href}
              href={t.href}
              className={cn(
                "border-b-2 border-transparent px-3 py-2 text-sm font-medium text-muted-foreground transition-colors",
                "hover:border-primary hover:text-foreground",
              )}
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
