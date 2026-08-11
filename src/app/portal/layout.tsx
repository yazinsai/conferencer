import Link from "next/link";

import { requirePortalUser, roleSet } from "@/lib/guards";
import { contactName, linkContactToUser, portalContact } from "@/lib/repo/contacts";
import { get } from "@/lib/db";
import { Avatar } from "@/components/ui";
import { PortalNav } from "@/components/portal/nav";

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
    <div className="flex min-h-screen flex-col" style={{ ["--event-accent" as string]: accent }}>
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-5xl px-4 py-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                Speaker portal
              </p>
              <Link href="/portal" className="text-lg font-semibold" style={{ color: accent }}>
                {event.name}
              </Link>
            </div>
            <div className="flex items-center gap-3">
              {roles.has("organizer") ? (
                <Link
                  href="/admin"
                  className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Back to Admin Mode
                </Link>
              ) : null}
              {roles.has("reviewer") ? (
                <Link
                  href="/review"
                  className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Review area
                </Link>
              ) : null}
              <div className="flex items-center gap-2">
                <Avatar src={contact.headshot_url} name={contactName(contact)} size={32} />
                <span className="text-sm text-slate-700">{contactName(contact)}</span>
              </div>
              <form action="/sign-out" method="post">
                <button
                  type="submit"
                  className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Sign out
                </button>
              </form>
            </div>
          </div>
          <PortalNav />
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">{children}</main>
      <footer className="border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-500">
        Signed in as {user.email} · <Link href={`/e/${event.slug}`} className="hover:text-slate-800">Public event site</Link>
      </footer>
    </div>
  );
}
