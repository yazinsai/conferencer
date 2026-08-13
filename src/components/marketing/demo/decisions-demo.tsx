"use client";

import { useState } from "react";

import { Chip, buttonClass, cx } from "@/components/ui";
import { Icon } from "@/components/ui/icon";
import type { DemoSubmission } from "@/lib/demo-conference";

/**
 * The decisions tile: accept in bulk, and see the email each speaker will get.
 *
 * Mirrors `/admin/e/[slug]/submissions`. The merge fields are the product's own
 * (`{{first_name}}`, `{{title}}`), and the per-recipient preview is the real
 * screen's answer to the thing that goes wrong with bulk email: you cannot check a
 * template, only the letters it produces. So the stepper walks the actual letters.
 */
export function DecisionsDemo({ submissions }: { submissions: DemoSubmission[] }) {
  const [picked, setPicked] = useState<string[]>(() => submissions.slice(0, 2).map((s) => s.id));
  const [accepted, setAccepted] = useState<string[]>([]);
  const [preview, setPreview] = useState(0);

  const chosen = submissions.filter((row) => picked.includes(row.id));
  const previewing = chosen[Math.min(preview, Math.max(chosen.length - 1, 0))];
  const allPicked = picked.length === submissions.length;

  function toggle(id: string) {
    setPicked((current) =>
      current.includes(id) ? current.filter((value) => value !== id) : [...current, id],
    );
    setPreview(0);
  }

  return (
    <div className="grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:gap-5">
      {/* ------------------------------------------------------------ table -- */}
      <div className="min-w-0 overflow-hidden rounded-card border border-rule bg-paper">
        <div className="flex items-center gap-2 border-b border-rule bg-paper-2 px-3 py-2">
          <label className="flex cursor-pointer items-center gap-2 text-[11px] text-neutral">
            <input
              type="checkbox"
              checked={allPicked}
              onChange={() => setPicked(allPicked ? [] : submissions.map((row) => row.id))}
              aria-label="Select every submission"
              className="size-3.5"
            />
            Pending
          </label>
          <span className="wordmark tnum ml-auto text-[10px] text-muted-foreground">
            {submissions.length} rows
          </span>
        </div>

        <ul className="divide-y divide-rule">
          {submissions.map((row) => {
            const isAccepted = accepted.includes(row.id);
            return (
              <li
                key={row.id}
                className={cx(
                  "flex min-w-0 items-start gap-2.5 px-3 py-2.5 transition-colors duration-[120ms] ease-out",
                  picked.includes(row.id) && !isAccepted && "bg-paper-2",
                )}
              >
                <input
                  type="checkbox"
                  checked={picked.includes(row.id)}
                  onChange={() => toggle(row.id)}
                  disabled={isAccepted}
                  aria-label={`Select ${row.title}`}
                  className="mt-0.5 size-3.5 shrink-0"
                />
                <span className="min-w-0 flex-1">
                  <span className="line-clamp-2 text-xs font-medium text-ink">{row.title}</span>
                  <span className="mt-0.5 block truncate text-[11px] text-muted-foreground">
                    {[row.speakers, row.track].filter(Boolean).join(" · ")}
                  </span>
                </span>
                <span className="flex shrink-0 flex-col items-end gap-1">
                  {isAccepted ? (
                    <span className="hm-insert">
                      <Chip tone="green">Accepted</Chip>
                    </span>
                  ) : (
                    <Chip tone="slate">Pending</Chip>
                  )}
                  <span className="wordmark tnum text-[10px] text-muted-foreground">
                    {row.score === null ? "—" : row.score.toFixed(1)}
                  </span>
                </span>
              </li>
            );
          })}
        </ul>

        {picked.length ? (
          <div className="hm-insert flex flex-wrap items-center gap-2 border-t border-rule bg-ink px-3 py-2.5">
            <span className="wordmark tnum text-[11px] text-paper/70">
              {picked.length} selected
            </span>
            <button
              type="button"
              onClick={() => {
                setAccepted((current) => [...new Set([...current, ...picked])]);
                setPicked([]);
              }}
              className="nowrap-affordance ml-auto inline-flex h-7 items-center rounded-pill bg-paper px-3 text-[11px] font-medium text-ink transition-colors duration-[120ms] ease-out hover:bg-paper-3 active:translate-y-px focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
            >
              Accept {picked.length}
            </button>
          </div>
        ) : null}
      </div>

      {/* ------------------------------------------------------------ email -- */}
      <div className="min-w-0 overflow-hidden rounded-card border border-rule bg-paper">
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5 border-b border-rule bg-paper-2 px-3 py-2">
          <p className="text-[11px] font-medium text-ink">Acceptance email</p>
          {chosen.length > 1 ? (
            <span className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setPreview((n) => Math.max(0, n - 1))}
                disabled={preview === 0}
                aria-label="Previous recipient"
                className="grid size-5 place-items-center rounded-md border border-rule text-muted-foreground hover:bg-paper-3 hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-focus disabled:opacity-35"
              >
                <Icon name="chevronUp" size={12} />
              </button>
              <span className="wordmark tnum text-[10px] text-muted-foreground">
                {Math.min(preview + 1, chosen.length)}/{chosen.length}
              </span>
              <button
                type="button"
                onClick={() => setPreview((n) => Math.min(chosen.length - 1, n + 1))}
                disabled={preview >= chosen.length - 1}
                aria-label="Next recipient"
                className="grid size-5 place-items-center rounded-md border border-rule text-muted-foreground hover:bg-paper-3 hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-focus disabled:opacity-35"
              >
                <Icon name="chevronDown" size={12} />
              </button>
            </span>
          ) : null}
        </div>

        {previewing ? (
          <div className="p-3 text-xs leading-relaxed">
            <p className="text-muted-foreground">
              To <span className="text-ink">{previewing.speakers}</span>
            </p>
            <p className="mt-2 font-medium text-ink">
              Your talk was accepted for DevFlow Conf 2027
            </p>
            <p className="mt-2 text-neutral">
              Hi <Merge>{previewing.firstName}</Merge>, the committee has accepted{" "}
              <Merge>{previewing.title}</Merge> for the{" "}
              <Merge>{previewing.track ?? "programme"}</Merge> track. Your speaker portal is open —
              we need your bio, a headshot and your slides.
            </p>
            <p className="mt-3 border-t border-rule pt-2 text-[11px] text-muted-foreground">
              Merge fields are filled per recipient, so you check the letters rather than the
              template.
            </p>
          </div>
        ) : (
          <p className="p-3 text-xs leading-relaxed text-muted-foreground">
            Tick a row to see the letter that speaker would get.
          </p>
        )}
      </div>
    </div>
  );
}

/** A value that came out of a merge field, marked so the swap is visible. */
function Merge({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-[4px] bg-signal-soft px-1 py-px font-medium text-ink">{children}</span>
  );
}
