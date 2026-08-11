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

/**
 * N3 side-rail — the app family's nav archetype (see design.md § Macrostructure
 * families). The wordmark lives at the top of the rail rather than in the top
 * bar, so the bar is free to be nothing but search and account.
 *
 * The active row is a quiet paper-3 fill, not a brand-tinted one: fifteen rows
 * of signal colour would spend the whole accent budget on chrome and leave the
 * primary action competing with the navigation.
 */
export function Sidebar({ groups, eventName }: { groups: NavGroup[]; eventName: string }) {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Admin"
      className="hidden w-60 shrink-0 border-r border-rule bg-paper md:block"
    >
      <div className="sticky top-0 flex max-h-screen flex-col overflow-y-auto px-3 py-4">
        <div className="px-2 pb-4">
          <Link
            href="/admin"
            className="wordmark nowrap-affordance block text-[0.9375rem] text-ink"
          >
            Conferencer
          </Link>
          <p className="mt-1 truncate text-xs text-muted-foreground" title={eventName}>
            {eventName}
          </p>
        </div>

        {groups.map((group, index) => (
          <div key={group.label ?? index} className="mb-4">
            {group.label ? (
              <p className="wordmark px-2 pb-1 text-[0.625rem] uppercase tracking-[0.14em] text-muted-foreground">
                {group.label}
              </p>
            ) : null}
            <ul className="space-y-px">
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
                        "nowrap-affordance flex items-center justify-between gap-2 rounded-lg px-2 py-1 text-[0.8125rem]",
                        "transition-[background-color,color] duration-[120ms] ease-out",
                        active
                          ? "bg-paper-3 font-medium text-ink"
                          : "text-neutral hover:bg-paper-2 hover:text-ink",
                      )}
                    >
                      <span className="truncate">{item.label}</span>
                      {item.badge ? (
                        <span
                          className={cx(
                            "tnum rounded-pill px-1.5 text-[0.6875rem] font-medium",
                            active ? "bg-ink text-paper" : "bg-paper-3 text-muted-foreground",
                          )}
                        >
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

/**
 * Below the layout breakpoint the rail collapses into a native <details>
 * disclosure. No JavaScript, no focus trap to get wrong, and it still works if
 * the bundle never arrives.
 */
export function SidebarSheet({ groups, eventName }: { groups: NavGroup[]; eventName: string }) {
  const pathname = usePathname();
  return (
    <details className="group border-b border-rule bg-paper md:hidden">
      <summary
        className={cx(
          "flex cursor-pointer list-none items-center justify-between gap-2 px-4 py-3",
          "[&::-webkit-details-marker]:hidden",
        )}
      >
        <span className="min-w-0">
          <span className="wordmark block text-[0.9375rem] text-ink">Conferencer</span>
          <span className="block truncate text-xs text-muted-foreground">{eventName}</span>
        </span>
        <span className={cx(buttonClass("secondary", "sm"), "pointer-events-none")}>
          Menu
          <ChevronDownIcon aria-hidden className="size-3.5 transition-transform duration-[180ms] ease-out group-open:rotate-180" />
        </span>
      </summary>
      <div className="px-3 pb-4">
        {groups.map((group, index) => (
          <div key={group.label ?? index} className="mb-4">
            {group.label ? (
              <p className="wordmark px-2 pb-1 text-[0.625rem] uppercase tracking-[0.14em] text-muted-foreground">
                {group.label}
              </p>
            ) : null}
            <ul className="space-y-px">
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
                        "nowrap-affordance flex items-center justify-between gap-2 rounded-lg px-2 py-2 text-sm",
                        active ? "bg-paper-3 font-medium text-ink" : "text-neutral",
                      )}
                    >
                      <span className="truncate">{item.label}</span>
                      {item.badge ? (
                        <span className="tnum rounded-pill bg-paper-3 px-1.5 text-[0.6875rem] text-muted-foreground">
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
    </details>
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
      <DropdownMenuTrigger className={cx(buttonClass("ghost", "md"), "gap-2 pl-1.5")}>
        <span className="wordmark inline-flex size-6 items-center justify-center rounded-full bg-paper-3 text-[0.625rem] font-medium text-ink-2">
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
