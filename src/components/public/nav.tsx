"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cx } from "@/components/ui";

const ITEMS = [
  { sub: "", label: "Overview", exact: true },
  { sub: "/sessions", label: "Sessions" },
  { sub: "/speakers", label: "Speakers" },
  { sub: "/agenda", label: "Agenda" },
  { sub: "/itinerary", label: "Itinerary" },
  { sub: "/gallery", label: "Gallery" },
  { sub: "/my-schedule", label: "My schedule" },
];

/**
 * The link row inside the N12 bar. Horizontally scrollable rather than wrapping,
 * because a nav link that breaks onto a second line reads as a styling error
 * (slop gate 49) and a conference site has more destinations than a phone bar fits.
 */
export function PublicNav({ slug }: { slug: string }) {
  const pathname = usePathname();
  return (
    <nav
      className="-mx-1 flex min-w-0 items-center gap-0.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      aria-label="Event"
    >
      {ITEMS.map((item) => {
        const href = `/e/${slug}${item.sub}`;
        const active = item.exact
          ? pathname === href
          : pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={item.sub || "overview"}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cx(
              "nowrap-affordance rounded-pill px-2.5 py-1.5 text-[0.8125rem]",
              "transition-colors duration-[120ms] ease-out",
              active
                ? "bg-paper-3 font-medium text-ink"
                : "text-neutral hover:bg-paper-2 hover:text-ink",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
