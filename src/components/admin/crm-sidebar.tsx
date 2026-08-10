import Link from "next/link";

const sections = [
  {
    title: "CRM",
    items: [
      { href: "", label: "Overview" },
      { href: "/contacts", label: "Contacts" },
      { href: "/pipeline", label: "Pipeline" },
      { href: "/duplicates", label: "Duplicates" },
    ],
  },
];

export function CrmSidebar({
  orgName,
  eventSlug,
}: {
  orgName: string;
  eventSlug: string;
}) {
  const base = "/admin/crm";
  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-slate-200 bg-slate-950 text-slate-100">
      <div className="border-b border-slate-800 px-4 py-4">
        <div className="text-xs uppercase tracking-wide text-slate-400">Conferencer</div>
        <div className="mt-1 text-sm font-semibold leading-snug">{orgName}</div>
        <div className="mt-1 text-xs text-slate-500">Speaker CRM</div>
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
                    href={`${base}${item.href}`}
                    className="block rounded-md px-2 py-1.5 text-sm text-slate-200 hover:bg-slate-800 hover:text-white"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
        <div className="mt-6 border-t border-slate-800 pt-4">
          <Link
            href={`/admin/e/${eventSlug}`}
            className="block rounded-md px-2 py-1.5 text-sm text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            ← Back to event
          </Link>
        </div>
      </nav>
    </aside>
  );
}
