"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { runAiFirstPassAction } from "@/app/admin/e/[slug]/evaluation/actions";
import { Button } from "@/components/ui/button";

type SubmissionOption = { id: string; title: string };

export function AiFirstPassForm({
  slug,
  planId,
  roundId,
  submissions,
}: {
  slug: string;
  planId: string;
  roundId: string;
  submissions: SubmissionOption[];
}) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [running, setRunning] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function run(runAll: boolean) {
    setRunning(true);
    setMessage(null);
    const formData = new FormData();
    formData.set("slug", slug);
    formData.set("planId", planId);
    formData.set("roundId", roundId);
    if (runAll) {
      formData.set("runAllPending", "on");
    } else {
      for (const id of selected) formData.append("submissionIds", id);
    }
    try {
      const result = await runAiFirstPassAction(formData);
      setMessage(`AI first-pass completed for ${result.processed} submission(s).`);
      router.refresh();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Failed to run AI first-pass");
    } finally {
      setRunning(false);
    }
  }

  if (submissions.length === 0) {
    return <p className="text-sm text-slate-500">No assigned submissions in this round.</p>;
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600">
        Run a heuristic AI first-pass score (1–10) based on description length, keywords,
        and level. Results are labeled clearly and excluded from human averages when human
        reviews exist.
      </p>
      <div className="max-h-48 overflow-y-auto rounded-md border border-slate-200 p-3">
        <ul className="space-y-2 text-sm">
          {submissions.map((s) => (
            <li key={s.id}>
              <label className="flex items-start gap-2">
                <input
                  type="checkbox"
                  checked={selected.has(s.id)}
                  onChange={() => toggle(s.id)}
                  className="mt-1 rounded"
                />
                <span>{s.title}</span>
              </label>
            </li>
          ))}
        </ul>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="secondary"
          disabled={running || selected.size === 0}
          onClick={() => run(false)}
        >
          {running ? "Running…" : `Run for selected (${selected.size})`}
        </Button>
        <Button type="button" disabled={running} onClick={() => run(true)}>
          {running ? "Running…" : "Run for all assigned"}
        </Button>
      </div>
      {message ? <p className="text-sm text-slate-700">{message}</p> : null}
    </div>
  );
}
