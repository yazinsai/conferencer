"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cx } from "@/components/ui";

const ITEMS = [
  { sub: "/sessions", label: "Sessions" },
  { sub: "/speakers", label: "Speakers" },
  { sub: "/agenda", label: "Agenda" },
  { sub: "/itinerary", label: "Itinerary" },
  { sub: "/gallery", label: "Speaker Gallery" },
  { sub: "/my-schedule", label: "My Schedule" },
];

export function PublicNav({ slug }: { slug: string }) {
  const pathname = usePathname();
  return (
    <nav className="mt-4 flex flex-wrap gap-1 border-t border-slate-100 pt-3" aria-label="Event">
      {ITEMS.map((item) => {
        const href = `/e/${slug}${item.sub}`;
        const active = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={item.sub}
            href={href}
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
