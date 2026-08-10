import Link from "next/link";
import {
  CalendarDays,
  ClipboardList,
  FileStack,
  Files,
  FormInput,
  LayoutDashboard,
  Mail,
  Settings,
  Sparkles,
  Users,
  CheckSquare,
  Presentation,
  Bot,
  Building2,
} from "lucide-react";
import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
  external?: boolean;
  icon?: React.ComponentType<{ className?: string }>;
};

const sections: Array<{ title: string; items: NavItem[] }> = [
  {
    title: "Program",
    items: [
      { href: "", label: "Dashboard", icon: LayoutDashboard },
      { href: "/submissions", label: "Submissions", icon: ClipboardList },
      { href: "/submissions?kind=abstract", label: "Abstracts", icon: FileStack },
      { href: "/submissions?kind=session", label: "Sessions", icon: Presentation },
      { href: "/files", label: "Files", icon: Files },
      { href: "/forms", label: "Forms", icon: FormInput },
      { href: "/evaluation", label: "Evaluations", icon: Sparkles },
      { href: "/agenda", label: "Agenda", icon: CalendarDays },
    ],
  },
  {
    title: "Portals",
    items: [
      { href: "/portals", label: "Portals", icon: Users },
      { href: "/tasks", label: "Tasks", icon: CheckSquare },
      { href: "/deliverables", label: "Deliverables", icon: ClipboardList },
    ],
  },
  {
    title: "People",
    items: [
      { href: "/speakers", label: "Speakers", icon: Users },
      { href: "/team", label: "Event Team", icon: Users },
    ],
  },
  {
    title: "Organization",
    items: [{ href: "/admin/crm", label: "Speaker CRM", external: true, icon: Building2 }],
  },
  {
    title: "Configure",
    items: [
      { href: "/settings", label: "Settings", icon: Settings },
      { href: "/agent", label: "Assistant", icon: Bot },
      { href: "/emails", label: "Emails", icon: Mail },
      { href: "/admin/emails", label: "All Emails", external: true, icon: Mail },
      { href: "/embeds", label: "Embeds", icon: FormInput },
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
    <aside className="flex w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
      <div className="border-b border-sidebar-border px-4 py-4">
        <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Conferencer
        </div>
        <div className="mt-1 text-sm font-semibold leading-snug">{eventName}</div>
      </div>
      <nav className="flex-1 overflow-y-auto px-2 py-3">
        {sections.map((section) => (
          <div key={section.title} className="mb-4">
            <div className="px-2 pb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              {section.title}
            </div>
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const href =
                  item.external ? item.href : `${base}${item.href}`;
                const Icon = item.icon;
                return (
                  <li key={item.href + item.label}>
                    <Link
                      href={href}
                      className={cn(
                        "flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-sidebar-foreground/90 transition-colors",
                        "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                      )}
                    >
                      {Icon ? <Icon className="size-4 shrink-0 opacity-70" /> : null}
                      <span>{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );
}
