import Link from "next/link";
import { buttonClass, cx } from "@/components/ui";
import { Icon } from "@/components/ui/icon";
import { requireOrganizer, roleSet } from "@/lib/guards";
import { fullName } from "@/lib/auth";
import { AccountMenu, Sidebar, SidebarSheet, type NavGroup } from "@/components/admin/shell";
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
    { items: [{ href: base, label: "Dashboard", icon: "dashboard", exact: true }] },
    {
      label: "Submissions",
      items: [
        { href: `${base}/submissions`, label: "View All", icon: "submissions", badge: counts.all },
        { href: `${base}/abstracts`, label: "Abstracts", icon: "abstracts" },
        { href: `${base}/sessions`, label: "Sessions", icon: "sessions" },
        { href: `${base}/files`, label: "Files", icon: "files" },
      ],
    },
    {
      label: "Collect & Review",
      items: [
        { href: `${base}/forms`, label: "Forms", icon: "forms" },
        { href: `${base}/evaluation`, label: "Evaluation", icon: "evaluation" },
        { href: `${base}/agenda`, label: "Agenda", icon: "agenda" },
        { href: `${base}/embeds`, label: "Site & Embeds", icon: "embeds" },
      ],
    },
    {
      label: "Portals",
      items: [
        { href: `${base}/portals`, label: "Portals", icon: "portals" },
        { href: `${base}/tasks`, label: "Tasks", icon: "tasks", badge: outstanding },
        { href: `${base}/tasks/deliverables`, label: "Deliverables", icon: "deliverables" },
      ],
    },
    {
      label: "People",
      items: [
        { href: `${base}/speakers`, label: "Speakers", icon: "speakers" },
        { href: `${base}/team`, label: "Event Team", icon: "team" },
        { href: "/crm", label: "Speaker CRM", icon: "crm" },
      ],
    },
    {
      label: "Communications",
      items: [
        { href: `${base}/emails`, label: "Emails", icon: "emails" },
        { href: `${base}/emails/templates`, label: "Templates", icon: "templates" },
      ],
    },
    {
      items: [
        { href: `${base}/reports`, label: "Reports", icon: "reports" },
        { href: `${base}/settings`, label: "Settings", icon: "settings" },
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
    <div className="flex min-h-screen flex-col md:flex-row">
      <Sidebar groups={groups} eventName={event.name} />
      <SidebarSheet groups={groups} eventName={event.name} />
      <div className="flex min-w-0 flex-1 flex-col">
        {/* z-sticky-nav so an in-page sticky element can never paint over the bar. */}
        <header className="sticky top-0 z-[300] border-b border-rule bg-paper/85 backdrop-blur-md">
          <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 sm:px-6">
            {/* Styled to read like a command bar, but it is a plain form posting
                to the search page — it works with JavaScript switched off. */}
            <form action={`${base}/search`} role="search" className="min-w-0 flex-1 sm:max-w-sm">
              <label htmlFor="global-search" className="sr-only">
                Search submissions, speakers and sessions
              </label>
              {/* The shell carries the focus ring, so it draws around the whole
                  control rather than inside the pill. */}
              <div className="flex h-9 items-center gap-2 rounded-pill border border-rule bg-paper-2 pl-3 pr-1.5 outline-2 outline-offset-2 outline-transparent focus-within:border-ink-2 focus-within:bg-paper focus-within:outline-ring">
                <Icon name="search" size={16} className="text-muted-foreground" />
                <input
                  id="global-search"
                  name="q"
                  type="search"
                  placeholder="Search submissions, speakers…"
                  className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                />
                <kbd className="wordmark hidden shrink-0 rounded-md border border-rule bg-paper px-1.5 py-0.5 text-[0.625rem] text-muted-foreground sm:block">
                  Enter
                </kbd>
              </div>
            </form>
            <div className="flex items-center gap-1">
              <Link
                href="/portal"
                className={cx(buttonClass("ghost", "sm"), "nowrap-affordance hidden lg:inline-flex")}
              >
                Speaker portal
              </Link>
              <Link
                href={`/e/${event.slug}`}
                className={cx(buttonClass("secondary", "sm"), "nowrap-affordance hidden sm:inline-flex")}
              >
                Public site
              </Link>
              <AccountMenu name={fullName(user)} email={user.email} links={accountLinks} />
            </div>
          </div>
        </header>
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
