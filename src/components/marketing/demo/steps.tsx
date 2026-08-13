"use client";

import { startTransition, useRef, useState, type ReactNode } from "react";

import { cx } from "@/components/ui";

import { ViewTransition } from "./view-transition";

/**
 * The three-step tour: three cards that are also a tab strip, and one wide panel
 * beneath them that crossfades between the live screens.
 *
 * The studied reference puts three small cards here. Three cards cannot each hold
 * a working screen, so the cards became the control and the screen got the width —
 * which is the only way a builder and its live preview can sit side by side and
 * still be legible on a laptop.
 *
 * A real tablist: arrow keys move, Home and End jump, `aria-controls` ties each tab
 * to its panel. Nothing autoplays — a panel that changes under a reader who is
 * typing in it is a bug, not delight.
 */
export type Step = {
  id: string;
  n: string;
  title: string;
  body: string;
  panel: ReactNode;
};

export function Steps({ steps }: { steps: Step[] }) {
  const [active, setActive] = useState(0);
  const tabs = useRef<Array<HTMLButtonElement | null>>([]);

  function select(index: number) {
    if (index === active) return;
    startTransition(() => setActive(index));
  }

  function onKeyDown(event: React.KeyboardEvent) {
    const last = steps.length - 1;
    let next: number | null = null;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") next = active === last ? 0 : active + 1;
    if (event.key === "ArrowLeft" || event.key === "ArrowUp") next = active === 0 ? last : active - 1;
    if (event.key === "Home") next = 0;
    if (event.key === "End") next = last;
    if (next === null) return;
    event.preventDefault();
    select(next);
    tabs.current[next]?.focus();
  }

  return (
    <div className="min-w-0">
      <div
        role="tablist"
        aria-label="How a call for speakers runs"
        onKeyDown={onKeyDown}
        className="grid gap-3 sm:grid-cols-3 sm:gap-4"
      >
        {steps.map((step, index) => {
          const selected = index === active;
          return (
            <button
              key={step.id}
              ref={(node) => {
                tabs.current[index] = node;
              }}
              role="tab"
              id={`step-tab-${step.id}`}
              aria-selected={selected}
              aria-controls={`step-panel-${step.id}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => select(index)}
              className={cx(
                "hm-reveal min-w-0 rounded-tile border p-4 text-left transition-[background-color,border-color,transform] duration-[120ms] ease-out sm:p-5",
                "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus",
                selected
                  ? "border-ink bg-ink text-paper"
                  : "border-rule bg-paper text-ink hover:border-rule-2 hover:bg-paper-2",
              )}
            >
              <span
                className={cx(
                  "wordmark tnum text-[11px] tracking-[0.14em]",
                  selected ? "text-paper/60" : "text-muted-foreground",
                )}
              >
                {step.n}
              </span>
              <span className="display mt-2 block text-md">{step.title}</span>
              <span
                className={cx(
                  "mt-1.5 block text-sm leading-relaxed",
                  selected ? "text-paper/75" : "text-neutral",
                )}
              >
                {step.body}
              </span>
            </button>
          );
        })}
      </div>

      <div className="hm-reveal mt-6 min-w-0 sm:mt-8">
        <ViewTransition
          key={steps[active].id}
          name="steps-panel"
          share="auto"
          enter="auto"
          default="none"
        >
          <div
            role="tabpanel"
            id={`step-panel-${steps[active].id}`}
            aria-labelledby={`step-tab-${steps[active].id}`}
            tabIndex={-1}
            className="min-w-0 rounded-tile border border-rule bg-paper-2 p-3 shadow-[var(--shadow-tile)] sm:p-5"
          >
            {steps[active].panel}
          </div>
        </ViewTransition>
      </div>
    </div>
  );
}
