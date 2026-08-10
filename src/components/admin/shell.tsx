"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cx } from "@/components/ui";

export type NavGroup = {
  label?: string;
  items: Array<{ href: string; label: string; exact?: boolean; badge?: number }>;
};

export function Sidebar({ groups, eventName }: { groups: NavGroup[]; eventName: string }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Admin" className="w-56 shrink-0 border-r border-slate-200 bg-white">
      <div className="sticky top-0 max-h-screen overflow-y-auto px-3 py-4">
        <p className="px-2 pb-3 text-sm font-semibold text-slate-900">{eventName}</p>
        {groups.map((group, index) => (
          <div key={group.label ?? index} className="mb-4">
            {group.label ? (
              <p className="px-2 pb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                {group.label}
              </p>
            ) : null}
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const active = item.exact
                  ? pathname === item.href
                  : pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={cx(
                        "flex items-center justify-between rounded-md px-2 py-1.5 text-sm",
                        active
                          ? "bg-brand-50 font-medium text-brand-800"
                          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
                      )}
                    >
                      <span>{item.label}</span>
                      {item.badge ? (
                        <span className="rounded-full bg-slate-200 px-1.5 text-[11px] font-medium text-slate-700">
                          {item.badge}
                        </span>
                      ) : null}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </nav>
  );
}

export function AccountMenu({
  name,
  email,
  links,
}: {
  name: string;
  email: string;
  links: Array<{ href: string; label: string }>;
}) {
  return (
    <details className="relative">
      <summary className="flex cursor-pointer list-none items-center gap-2 rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-sm text-slate-700 hover:bg-slate-50 [&::-webkit-details-marker]:hidden">
        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-700">
          {name
            .split(" ")
            .slice(0, 2)
            .map((p) => p[0])
            .join("")}
        </span>
        <span className="hidden sm:inline">{name}</span>
        <span aria-hidden className="text-slate-400">
          ▾
        </span>
      </summary>
      <div className="absolute right-0 z-40 mt-1 w-56 rounded-md border border-slate-200 bg-white p-1 shadow-lg">
        <p className="px-3 py-2 text-xs text-slate-500">{email}</p>
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="block rounded px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
          >
            {link.label}
          </Link>
        ))}
        <form action="/sign-out" method="post">
          <button
            type="submit"
            className="w-full rounded px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
          >
            Sign out
          </button>
        </form>
      </div>
    </details>
  );
}
