import Link from "next/link";

const sections = [
  {
    title: "Program",
    items: [
      { href: "", label: "Dashboard" },
      { href: "/submissions", label: "Submissions" },
      { href: "/submissions?kind=abstract", label: "Abstracts" },
      { href: "/submissions?kind=session", label: "Sessions" },
      { href: "/files", label: "Files" },
      { href: "/forms", label: "Forms" },
      { href: "/evaluation", label: "Evaluations" },
      { href: "/agenda", label: "Agenda" },
    ],
  },
  {
    title: "Portals",
    items: [
      { href: "/portals", label: "Portals" },
      { href: "/tasks", label: "Tasks" },
      { href: "/deliverables", label: "Deliverables" },
    ],
  },
  {
    title: "People",
    items: [
      { href: "/speakers", label: "Speakers" },
      { href: "/team", label: "Event Team" },
    ],
  },
  {
    title: "Organization",
    items: [{ href: "/admin/crm", label: "Speaker CRM", external: true }],
  },
  {
    title: "Configure",
    items: [
      { href: "/settings", label: "Settings" },
      { href: "/agent", label: "Assistant" },
      { href: "/emails", label: "Emails" },
      { href: "/embeds", label: "Embeds" },
    ],
  },
];

export function AdminSidebar({
  slug,
  eventName,
}: {
  slug: string;
  eventName: string;
}) {
  const base = `/admin/e/${slug}`;
  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-slate-200 bg-slate-950 text-slate-100">
      <div className="border-b border-slate-800 px-4 py-4">
        <div className="text-xs uppercase tracking-wide text-slate-400">Conferencer</div>
        <div className="mt-1 text-sm font-semibold leading-snug">{eventName}</div>
      </div>
      <nav className="flex-1 overflow-y-auto px-2 py-3">
        {sections.map((section) => (
          <div key={section.title} className="mb-4">
            <div className="px-2 pb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              {section.title}
            </div>
            <ul className="space-y-0.5">
              {section.items.map((item) => (
                <li key={item.href + item.label}>
                  <Link
                    href={
                      "external" in item && item.external
                        ? item.href
                        : `${base}${item.href}`
                    }
                    className="block rounded-md px-2 py-1.5 text-sm text-slate-200 hover:bg-slate-800 hover:text-white"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );
}
