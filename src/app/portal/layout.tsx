import Link from "next/link";

import { requirePortalUser, roleSet } from "@/lib/guards";
import { contactName, linkContactToUser, portalContact } from "@/lib/repo/contacts";
import { get } from "@/lib/db";
import { Avatar, buttonClass, cx } from "@/components/ui";
import { PortalSidebar, PortalSidebarSheet } from "@/components/portal/nav";

export const dynamic = "force-dynamic";

export default async function PortalLayout({ children }: LayoutProps<"/portal">) {
  const { user, event } = await requirePortalUser();
  const contact = portalContact(event, user) ?? linkContactToUser(event, user);
  const roles = roleSet(user.id, event.id);
  const portal = get<{ welcome_message: string | null; accent_color: string | null }>(
    "SELECT welcome_message, accent_color FROM portals WHERE event_id = ? ORDER BY is_default DESC LIMIT 1",
    event.id,
  );
  const accent = portal?.accent_color ?? event.accent_color;

  return (
    <div
      className="flex min-h-screen flex-col bg-paper text-ink md:flex-row"
      style={{ ["--event-accent" as string]: accent }}
    >
      <PortalSidebar eventName={event.name} />
      <PortalSidebarSheet eventName={event.name} />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-[300] min-h-[var(--nav-height)] border-b border-rule bg-paper/85 backdrop-blur-md">
          <div className="flex min-h-[var(--nav-height)] flex-wrap items-center justify-between gap-3 px-4 py-2.5 sm:px-6">
            <div className="min-w-0">
              <p className="wordmark text-[0.625rem] uppercase tracking-[0.14em] text-muted-foreground">
                Speaker portal
              </p>
              <Link
                href="/portal"
                className="block truncate text-sm font-semibold text-ink"
                style={{ color: "var(--event-accent)" }}
              >
                {event.name}
              </Link>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {roles.has("organizer") ? (
                <Link
                  href="/admin"
                  className={cx(buttonClass("secondary", "sm"), "nowrap-affordance")}
                >
                  Back to Admin Mode
                </Link>
              ) : null}
              {roles.has("reviewer") ? (
                <Link
                  href="/review"
                  className={cx(buttonClass("secondary", "sm"), "nowrap-affordance")}
                >
                  Review area
                </Link>
              ) : null}
              <Link
                href={`/e/${event.slug}`}
                className={cx(
                  buttonClass("ghost", "sm"),
                  "nowrap-affordance hidden text-signal sm:inline-flex",
                )}
              >
                Public site
              </Link>
              <div className="flex items-center gap-2 pl-1">
                <Avatar src={contact.headshot_url} name={contactName(contact)} size={28} />
                <span className="hidden text-sm text-ink-2 sm:inline">{contactName(contact)}</span>
              </div>
              <form action="/sign-out" method="post">
                <button type="submit" className={cx(buttonClass("secondary", "sm"), "nowrap-affordance")}>
                  Sign out
                </button>
              </form>
            </div>
          </div>
        </header>
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
