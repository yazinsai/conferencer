"use client";

import { useState } from "react";

import { Chip, cx } from "@/components/ui";
import { Icon } from "@/components/ui/icon";
import type { DemoRoom, DemoTalk } from "@/lib/demo-conference";

/**
 * The public-site tile: an attendee's view of a session, and the one control that
 * makes the public site more than a poster — adding it to a personal schedule that
 * exports as `.ics`.
 *
 * Mirrors `/e/[slug]/sessions` and `/e/[slug]/my-schedule`. Nobody signs in to read
 * any of it.
 */
export function ScheduleToggle({
  talks,
  rooms,
  slots,
}: {
  talks: DemoTalk[];
  rooms: DemoRoom[];
  slots: string[];
}) {
  const [mine, setMine] = useState<string[]>([]);
  const shown = talks.slice(0, 3);

  return (
    <div className="min-w-0">
      <ul className="grid gap-2">
        {shown.map((talk, index) => {
          const added = mine.includes(talk.id);
          return (
            <li
              key={talk.id}
              className="flex min-w-0 items-start gap-3 rounded-card border border-rule bg-paper p-3"
              style={{
                borderLeftWidth: 3,
                borderLeftColor: talk.trackColor ?? "var(--color-rule-2)",
              }}
            >
              <span className="wordmark tnum w-11 shrink-0 pt-0.5 text-[11px] text-muted-foreground">
                {slots[index] ?? slots[0]}
              </span>
              <span className="min-w-0 flex-1">
                <span className="line-clamp-2 text-xs font-medium text-ink">{talk.title}</span>
                <span className="mt-0.5 block truncate text-[11px] text-muted-foreground">
                  {[rooms[index % rooms.length]?.name, talk.speakers].filter(Boolean).join(" · ")}
                </span>
              </span>
              <button
                type="button"
                onClick={() =>
                  setMine((current) =>
                    added ? current.filter((id) => id !== talk.id) : [...current, talk.id],
                  )
                }
                aria-pressed={added}
                aria-label={`${added ? "Remove" : "Add"} ${talk.title} ${added ? "from" : "to"} my schedule`}
                className={cx(
                  "grid size-7 shrink-0 place-items-center rounded-pill border transition-colors duration-[120ms] ease-out",
                  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus",
                  added
                    ? "border-ink bg-ink text-paper"
                    : "border-rule-2 bg-paper text-muted-foreground hover:text-ink",
                )}
              >
                <Icon name={added ? "check" : "plus"} size={13} />
              </button>
            </li>
          );
        })}
      </ul>

      <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-rule pt-3">
        <span aria-live="polite" className="wordmark tnum text-[11px] text-muted-foreground">
          My schedule · {mine.length} session{mine.length === 1 ? "" : "s"}
        </span>
        {mine.length ? (
          <span className="hm-insert">
            <Chip tone="blue">
              <span className="wordmark">.ics ready</span>
            </Chip>
          </span>
        ) : null}
      </div>
    </div>
  );
}
