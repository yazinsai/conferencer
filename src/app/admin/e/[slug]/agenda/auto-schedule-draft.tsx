"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { formatTimeRange } from "@/lib/calendar/agenda-dates";
import type { DraftPlacement } from "@/lib/calendar/auto-schedule";
import {
  autoScheduleAssistAction,
  commitAutoScheduleDraftAction,
  type AutoScheduleDraftResult,
} from "./actions";

export function AutoScheduleDraft({
  slug,
  view,
  day,
  unscheduledCount,
}: {
  slug: string;
  view: string;
  day: string;
  unscheduledCount: number;
}) {
  const [draft, setDraft] = useState<AutoScheduleDraftResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function runAssist() {
    setError(null);
    const fd = new FormData();
    fd.set("slug", slug);
    startTransition(async () => {
      try {
        const result = await autoScheduleAssistAction(fd);
        setDraft(result);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Auto-schedule failed");
        setDraft(null);
      }
    });
  }

  function discardDraft() {
    setDraft(null);
    setError(null);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="secondary"
          disabled={isPending || unscheduledCount === 0}
          onClick={runAssist}
        >
          {isPending ? "Computing…" : "Auto-schedule assist"}
        </Button>
        {unscheduledCount === 0 ? (
          <span className="text-xs text-slate-500">
            No unscheduled sessions to pack.
          </span>
        ) : null}
      </div>

      {error ? (
        <p className="text-sm text-rose-600">{error}</p>
      ) : null}

      {draft ? (
        <div className="space-y-3 rounded-lg border border-blue-200 bg-blue-50/50 p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                Draft schedule review
              </h3>
              <p className="mt-1 text-xs text-slate-600">
                {draft.placements.length} proposed placement
                {draft.placements.length === 1 ? "" : "s"}
                {draft.unplaced.length
                  ? ` · ${draft.unplaced.length} could not be placed`
                  : ""}
                {draft.speakerWarnings
                  ? ` · ${draft.speakerWarnings} with speaker conflicts`
                  : ""}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <form action={commitAutoScheduleDraftAction}>
                <input type="hidden" name="slug" value={slug} />
                <input type="hidden" name="view" value={view} />
                {day ? <input type="hidden" name="day" value={day} /> : null}
                <input
                  type="hidden"
                  name="placements"
                  value={JSON.stringify(draft.placements)}
                />
                <Button
                  type="submit"
                  disabled={draft.placements.length === 0 || isPending}
                >
                  Commit draft
                </Button>
              </form>
              <Button
                type="button"
                variant="secondary"
                onClick={discardDraft}
                disabled={isPending}
              >
                Discard
              </Button>
            </div>
          </div>

          {draft.placements.length > 0 ? (
            <div className="overflow-x-auto rounded-md border border-slate-200 bg-white">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-slate-500">
                    <th className="px-3 py-2 font-medium">Session</th>
                    <th className="px-3 py-2 font-medium">Date</th>
                    <th className="px-3 py-2 font-medium">Time</th>
                    <th className="px-3 py-2 font-medium">Room</th>
                    <th className="px-3 py-2 font-medium">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {draft.placements
                    .sort((a, b) =>
                      a.startsAt < b.startsAt ? -1 : 1,
                    )
                    .map((p: DraftPlacement) => (
                      <tr
                        key={p.submissionId}
                        className="border-b border-slate-100 last:border-0"
                      >
                        <td className="px-3 py-2 font-medium">{p.title}</td>
                        <td className="px-3 py-2 whitespace-nowrap">
                          {p.startsAt.slice(0, 10)}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap">
                          {formatTimeRange(p.startsAt, p.endsAt)}
                        </td>
                        <td className="px-3 py-2">{p.roomName}</td>
                        <td className="px-3 py-2 text-xs text-amber-700">
                          {p.speakerWarning ? "Speaker conflict" : ""}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-slate-600">
              No slots could be proposed. Add rooms or extend working hours.
            </p>
          )}

          {draft.unplaced.length > 0 ? (
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Not placed
              </h4>
              <ul className="mt-1 space-y-1 text-sm text-slate-600">
                {draft.unplaced.map((u) => (
                  <li key={u.submissionId}>
                    <span className="font-medium">{u.title}</span>
                    <span className="text-slate-500"> — {u.reason}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
