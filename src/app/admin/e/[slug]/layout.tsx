import Link from "next/link";
import { buttonClass, cx } from "@/components/ui";
import { requireOrganizer, roleSet } from "@/lib/guards";
import { fullName } from "@/lib/auth";
import { AccountMenu, Sidebar, SidebarSheet, type NavGroup } from "@/components/admin/shell";
import { CommandPalette } from "@/components/admin/command-search";
import { commandsFromNav, type CommandItem } from "@/components/admin/command-search.routes";
import { all } from "@/lib/db";
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

  // The palette filters a fixed index in the browser, so it stays a single
  // render with no search endpoint behind it. Anything past these recents is
  // what the full search page is for.
  const commands: CommandItem[] = [
    ...commandsFromNav(groups),
    ...all<{ id: string; title: string }>(
      "SELECT id, title FROM submissions WHERE event_id = ? ORDER BY updated_at DESC LIMIT 8",
      event.id,
    ).map((row) => ({
      id: `submission-${row.id}`,
      label: row.title,
      href: `${base}/submissions/${row.id}`,
      icon: "submissions" as const,
      group: "Recent" as const,
      hint: "Submission",
    })),
    ...all<{ id: string; name: string }>(
      `SELECT c.id, c.first_name || ' ' || c.last_name AS name
         FROM contacts c JOIN event_contacts ec ON ec.contact_id = c.id
        WHERE ec.event_id = ? ORDER BY c.last_name LIMIT 8`,
      event.id,
    ).map((row) => ({
      id: `speaker-${row.id}`,
      label: row.name,
      href: `${base}/speakers/${row.id}`,
      icon: "speakers" as const,
      group: "Recent" as const,
      hint: "Speaker",
    })),
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
            {/* Still the plain form posting to the search page — it works with
                JavaScript switched off. Hydration upgrades it into the command
                palette (⌘K), which jumps straight to a page or record. */}
            <CommandPalette trigger="searchbar" slug={event.slug} items={commands} />
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
