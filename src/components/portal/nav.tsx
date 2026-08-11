"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { buttonClass, cx } from "@/components/ui";
import { Icon, type IconName } from "@/components/ui/icon";
import { LogoMark } from "@/components/ui/logo";

const ITEMS: Array<{ href: string; label: string; icon: IconName; exact?: boolean }> = [
  { href: "/portal", label: "Home", icon: "dashboard", exact: true },
  { href: "/portal/submissions", label: "Submissions", icon: "submissions" },
  { href: "/portal/profile", label: "Profile", icon: "person" },
  { href: "/portal/tasks", label: "Tasks", icon: "tasks" },
];

function isActive(pathname: string, item: (typeof ITEMS)[number]) {
  return item.exact
    ? pathname === item.href
    : pathname === item.href || pathname.startsWith(`${item.href}/`);
}

/**
 * N3 side-rail for the speaker portal — same app-family archetype as admin
 * (design.md § Macrostructure), with a quieter speaker-facing wordmark and
 * progressive-enhancement mobile sheet (native <details>).
 */
export function PortalSidebar({ eventName }: { eventName: string }) {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Portal"
      className="hidden w-56 shrink-0 border-r border-rule bg-paper md:block"
    >
      <div className="sticky top-0 flex max-h-screen flex-col overflow-y-auto px-3 py-4">
        <div className="px-2 pb-4">
          <Link
            href="/portal"
            className="wordmark nowrap-affordance flex items-center gap-2 text-[0.9375rem] text-ink"
          >
            <LogoMark size={18} />
            Conferencer
          </Link>
          <p className="mt-1 truncate text-xs text-muted-foreground" title={eventName}>
            {eventName}
          </p>
          <p className="wordmark mt-3 px-0 text-[0.625rem] uppercase tracking-[0.14em] text-muted-foreground">
            Speaker portal
          </p>
        </div>

        <ul className="space-y-px">
          {ITEMS.map((item) => {
            const active = isActive(pathname, item);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cx(
                    "nowrap-affordance flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-[0.8125rem]",
                    "transition-[background-color,color] duration-[120ms] ease-out",
                    active
                      ? "bg-paper-3 font-medium text-ink"
                      : "text-neutral hover:bg-paper-2 hover:text-ink",
                  )}
                >
                  <Icon
                    name={item.icon}
                    size={17}
                    className={active ? "text-ink" : "text-muted-foreground"}
                  />
                  <span className="truncate">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}

/** Below md the rail collapses into a native disclosure — no client JS required. */
export function PortalSidebarSheet({ eventName }: { eventName: string }) {
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
          <span className="wordmark flex items-center gap-2 text-[0.9375rem] text-ink">
            <LogoMark size={18} />
            Conferencer
          </span>
          <span className="block truncate text-xs text-muted-foreground">{eventName}</span>
        </span>
        <span className={cx(buttonClass("secondary", "sm"), "pointer-events-none")}>
          Menu
          <Icon
            name="chevronDown"
            size={14}
            className="transition-transform duration-[180ms] ease-out group-open:rotate-180"
          />
        </span>
      </summary>
      <div className="px-3 pb-4">
        <p className="wordmark px-2 pb-1 text-[0.625rem] uppercase tracking-[0.14em] text-muted-foreground">
          Speaker portal
        </p>
        <ul className="space-y-px">
          {ITEMS.map((item) => {
            const active = isActive(pathname, item);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cx(
                    "nowrap-affordance flex items-center gap-2.5 rounded-lg px-2 py-2 text-sm",
                    active ? "bg-paper-3 font-medium text-ink" : "text-neutral",
                  )}
                >
                  <Icon
                    name={item.icon}
                    size={17}
                    className={active ? "text-ink" : "text-muted-foreground"}
                  />
                  <span className="truncate">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </details>
  );
}
