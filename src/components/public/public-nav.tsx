"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "sessions", label: "Sessions" },
  { href: "speakers", label: "Speakers" },
  { href: "agenda", label: "Agenda" },
  { href: "itinerary", label: "Itinerary" },
  { href: "gallery", label: "Gallery" },
] as const;

export function PublicNav({ slug }: { slug: string }) {
  const pathname = usePathname();

  return (
    <nav
      className="flex gap-1 overflow-x-auto border-t px-4 py-2"
      aria-label="Event program"
    >
      {LINKS.map((link) => {
        const href = `/e/${slug}/${link.href}`;
        const active = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={link.href}
            href={href}
            className={cn(
              "shrink-0 rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
              active
                ? "bg-[var(--event-accent,#2563eb)] text-white"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
