import type { IconName } from "@/components/ui/icon";
import type { NavGroup } from "@/components/admin/shell";

export type CommandItem = {
  id: string;
  label: string;
  href: string;
  icon: IconName;
  group: "Go to" | "Recent";
  hint?: string;
};

/**
 * Lives outside the palette's own module because that module is `"use client"`,
 * and the layout builds the index on the server.
 *
 * The destinations come from the side-rail's own groups rather than a second
 * hand-kept list, so a route added to the nav is searchable without a matching
 * edit here.
 */
export function commandsFromNav(groups: NavGroup[]): CommandItem[] {
  return groups
    .flatMap((group) => group.items)
    .map((item) => ({
      id: `goto:${item.href}`,
      label: item.label,
      href: item.href,
      icon: item.icon,
      group: "Go to" as const,
    }));
}
