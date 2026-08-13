"use client";

import { useState } from "react";

import { cx } from "@/components/ui";
import { Icon } from "@/components/ui/icon";
import type { DemoTask } from "@/lib/demo-conference";

/**
 * The onboarding tile: a speaker ticks a task, and the organizer's deliverables
 * matrix updates.
 *
 * Mirrors `/portal/tasks` and `/admin/e/[slug]/tasks/deliverables`. This is the
 * half of the job free tools hand back to you and paid ones charge for, and the
 * only way to show it is both sides at once — which is why the tile is one panel
 * with a hairline down the middle rather than two tiles.
 */
export function PortalTasksDemo({ tasks: initial, speaker }: { tasks: DemoTask[]; speaker: string }) {
  const [tasks, setTasks] = useState(initial);
  const done = tasks.filter((task) => task.done).length;
  const complete = done === tasks.length;

  return (
    <div className="min-w-0">
      <div className="flex items-center gap-2.5">
        <Ring done={done} total={tasks.length} />
        <div className="min-w-0">
          <p className="text-xs font-medium text-ink">
            {done} of {tasks.length} done
          </p>
          <p className="truncate text-[11px] text-muted-foreground">{speaker}&rsquo;s portal</p>
        </div>
      </div>

      <ul className="mt-3 grid gap-1.5">
        {tasks.map((task) => (
          <li key={task.id}>
            <label
              className={cx(
                "flex cursor-pointer items-start gap-2 rounded-input border p-2 transition-colors duration-[120ms] ease-out",
                task.done ? "border-positive/30 bg-positive-soft" : "border-rule hover:bg-paper-2",
              )}
            >
              <input
                type="checkbox"
                checked={task.done}
                onChange={(event) =>
                  setTasks((current) =>
                    current.map((row) =>
                      row.id === task.id ? { ...row, done: event.target.checked } : row,
                    ),
                  )
                }
                className="mt-0.5 size-3.5 shrink-0"
              />
              <span className="min-w-0 flex-1">
                <span
                  className={cx(
                    "block truncate text-xs font-medium",
                    task.done ? "text-ink" : "text-ink",
                  )}
                >
                  {task.title}
                </span>
                <span className="block truncate text-[11px] text-muted-foreground">{task.due}</span>
              </span>
              {task.done ? (
                <Icon name="success" size={14} className="mt-0.5 shrink-0 text-positive" />
              ) : null}
            </label>
          </li>
        ))}
      </ul>

      {/* The organizer's side of the same rows. */}
      <div className="mt-3 border-t border-rule pt-3">
        <p className="text-[11px] font-medium text-ink">The organizer&rsquo;s matrix</p>
        <div className="mt-1.5 flex items-center gap-1.5">
          {tasks.map((task) => (
            <span
              key={task.id}
              title={`${task.title} — ${task.done ? "complete" : "outstanding"}`}
              className={cx(
                "h-6 flex-1 rounded-[5px] border transition-colors duration-[180ms] ease-out",
                task.done ? "border-positive/40 bg-positive/25" : "border-rule bg-paper-3",
              )}
            />
          ))}
        </div>
        <p aria-live="polite" className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
          {complete ? (
            <span className="text-positive">
              Every deliverable in. Nothing left to chase for this speaker.
            </span>
          ) : (
            <>Tick a task and the cell the organizer is chasing turns green.</>
          )}
        </p>
      </div>
    </div>
  );
}

/** A progress ring. Stroke-based, so it animates without a layout property. */
function Ring({ done, total }: { done: number; total: number }) {
  const pct = total ? done / total : 0;
  const circumference = 2 * Math.PI * 13;
  return (
    <svg viewBox="0 0 32 32" aria-hidden className="size-9 shrink-0 -rotate-90">
      <circle cx="16" cy="16" r="13" fill="none" stroke="var(--color-rule)" strokeWidth="3" />
      <circle
        cx="16"
        cy="16"
        r="13"
        fill="none"
        stroke={pct === 1 ? "var(--color-positive)" : "var(--color-ink)"}
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={circumference * (1 - pct)}
        style={{ transition: "stroke-dashoffset var(--dur-reveal) var(--ease-out), stroke 180ms" }}
      />
    </svg>
  );
}
