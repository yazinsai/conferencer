"use client";

import { useMemo, useState } from "react";

import { Chip, cx, inputClass } from "@/components/ui";
import { Icon } from "@/components/ui/icon";

export type SearchRow = { id: string; label: string; meta: string; kind: string };

/**
 * The search tile: one box across submissions, speakers and sessions.
 *
 * Mirrors `/admin/e/[slug]/search`. Every row here is a row of the demo conference —
 * the same titles and names the rest of this page shows — filtered in the browser
 * because the tile holds the whole set. The real screen queries SQLite, which is why
 * it can search bodies and answers as well as titles.
 */
export function SearchDemo({ rows }: { rows: SearchRow[] }) {
  const [query, setQuery] = useState("");
  const trimmed = query.trim().toLowerCase();

  const hits = useMemo(() => {
    if (!trimmed) return rows.slice(0, 3);
    return rows
      .filter(
        (row) =>
          row.label.toLowerCase().includes(trimmed) || row.meta.toLowerCase().includes(trimmed),
      )
      .slice(0, 4);
  }, [rows, trimmed]);

  return (
    <div className="min-w-0">
      <div className="relative min-w-0">
        <Icon
          name="search"
          size={14}
          className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search talks, speakers, sessions…"
          aria-label="Search the demo conference"
          className={cx(inputClass, "h-9 pl-8 text-xs")}
        />
      </div>

      <ul className="mt-2.5 grid gap-1.5">
        {hits.map((row) => (
          <li
            key={`${row.kind}-${row.id}`}
            className="flex min-w-0 items-start gap-2 rounded-input border border-rule bg-paper px-2.5 py-2"
          >
            <span className="min-w-0 flex-1">
              <span className="line-clamp-1 text-xs font-medium text-ink">{row.label}</span>
              <span className="block truncate text-[11px] text-muted-foreground">{row.meta}</span>
            </span>
            <Chip tone="slate">{row.kind}</Chip>
          </li>
        ))}
        {!hits.length ? (
          <li className="rounded-input border border-dashed border-rule-2 px-2.5 py-3 text-center text-[11px] text-muted-foreground">
            Nothing matches “{query.trim()}”.
          </li>
        ) : null}
      </ul>

      <p className="mt-2 text-[11px] text-muted-foreground">
        {trimmed ? `${hits.length} of ${rows.length} rows` : "Try a word from any talk above."}
      </p>
    </div>
  );
}
