import Link from "next/link";

import { requireOrganizer, roleSet } from "@/lib/guards";
import { fullName } from "@/lib/auth";
import { AccountMenu, Sidebar, type NavGroup } from "@/components/admin/shell";
import { statusCounts } from "@/lib/repo/submissions";
import { listAssignments } from "@/lib/repo/tasks";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children, params }: LayoutProps<"/admin/e/[slug]">) {
  const { slug } = await params;
  const { user, event } = await requireOrganizer(slug);
  const base = `/admin/e/${event.slug}`;
  const counts = statusCounts(event.id);
  const outstanding = listAssignments(event.id, { status: "outstanding" }).length;
  const roles = roleSet(user.id, event.id);

  const groups: NavGroup[] = [
    { items: [{ href: base, label: "Dashboard", exact: true }] },
    {
      label: "Submissions",
      items: [
        { href: `${base}/submissions`, label: "View All", badge: counts.all },
        { href: `${base}/abstracts`, label: "Abstracts" },
        { href: `${base}/sessions`, label: "Sessions" },
        { href: `${base}/files`, label: "Files" },
      ],
    },
    {
      label: "Collect & Review",
      items: [
        { href: `${base}/forms`, label: "Forms" },
        { href: `${base}/evaluation`, label: "Evaluation" },
        { href: `${base}/agenda`, label: "Agenda" },
        { href: `${base}/embeds`, label: "Site & Embeds" },
      ],
    },
    {
      label: "Portals",
      items: [
        { href: `${base}/portals`, label: "Portals" },
        { href: `${base}/tasks`, label: "Tasks", badge: outstanding },
        { href: `${base}/tasks/deliverables`, label: "Deliverables" },
      ],
    },
    {
      label: "People",
      items: [
        { href: `${base}/speakers`, label: "Speakers" },
        { href: `${base}/team`, label: "Event Team" },
        { href: "/crm", label: "Speaker CRM" },
      ],
    },
    {
      label: "Communications",
      items: [
        { href: `${base}/emails`, label: "Emails" },
        { href: `${base}/emails/templates`, label: "Templates" },
      ],
    },
    {
      items: [
        { href: `${base}/reports`, label: "Reports" },
        { href: `${base}/settings`, label: "Settings" },
      ],
    },
  ];

  const accountLinks = [
    { href: "/portal", label: "Speaker portal" },
    ...(roles.has("reviewer") || roles.has("organizer")
      ? [{ href: "/review", label: "Review area" }]
      : []),
    { href: `/e/${event.slug}`, label: "Public event site" },
  ];

  return (
    <div className="flex min-h-screen">
      <Sidebar groups={groups} eventName={event.name} />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white">
          <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3">
            <div className="flex items-center gap-3">
              <Link href="/admin" className="text-sm font-semibold text-slate-900">
                Conferencer
              </Link>
              <form action={`${base}/search`} role="search" className="relative">
                <label htmlFor="global-search" className="sr-only">
                  Search submissions, speakers and sessions
                </label>
                <input
                  id="global-search"
                  name="q"
                  type="search"
                  placeholder="Search submissions, speakers…"
                  className="w-64 rounded-md border border-slate-300 px-3 py-1.5 text-sm placeholder:text-slate-400 focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                />
              </form>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/portal"
                className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                View Portal
              </Link>
              <Link
                href={`/e/${event.slug}`}
                className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Public site
              </Link>
              <AccountMenu name={fullName(user)} email={user.email} links={accountLinks} />
            </div>
          </div>
        </header>
        <main className="flex-1 px-5 py-6">{children}</main>
      </div>
    </div>
  );
}
