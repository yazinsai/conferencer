"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cx } from "@/components/ui";

const ITEMS = [
  { href: "/portal", label: "Home", exact: true },
  { href: "/portal/submissions", label: "Submissions" },
  { href: "/portal/profile", label: "Profile" },
  { href: "/portal/tasks", label: "Tasks" },
];

export function PortalNav() {
  const pathname = usePathname();
  return (
    <nav className="mt-4 flex flex-wrap gap-1 border-t border-slate-100 pt-3" aria-label="Portal">
      {ITEMS.map((item) => {
        const active = item.exact
          ? pathname === item.href
          : pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cx(
              "rounded-md px-3 py-1.5 text-sm font-medium",
              active
                ? "bg-slate-900 text-white"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
