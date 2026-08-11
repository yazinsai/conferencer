"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { ChevronDownIcon } from "lucide-react";

import { buttonClass, cx } from "@/components/ui";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
    <DropdownMenu>
      <DropdownMenuTrigger className={cx(buttonClass("secondary", "md"), "gap-2")}>
        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
          {name
            .split(" ")
            .slice(0, 2)
            .map((p) => p[0])
            .join("")}
        </span>
        <span className="hidden sm:inline">{name}</span>
        <ChevronDownIcon aria-hidden className="size-3.5 opacity-60" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal text-muted-foreground">
          {email}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {links.map((link) => (
          <DropdownMenuItem key={link.href} asChild>
            <Link href={link.href}>{link.label}</Link>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <form action="/sign-out" method="post">
          <DropdownMenuItem
            variant="destructive"
            asChild
            onSelect={(event) => {
              // Let the form submit rather than closing before the POST fires.
              event.preventDefault();
              (event.currentTarget as HTMLElement)
                .closest("form")
                ?.requestSubmit();
            }}
          >
            <button type="submit" className="w-full">
              Sign out
            </button>
          </DropdownMenuItem>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
