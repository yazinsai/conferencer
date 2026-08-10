"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { saveReviewAction } from "@/app/admin/e/[slug]/evaluation/actions";

type Question = {
  id: string;
  type: string;
  label: string;
  options: string | null;
  min: number | null;
  max: number | null;
  isRequired: boolean;
};

type Answers = Record<string, string | number>;

export function ReviewScorecardForm({
  planId,
  roundId,
  assignmentId,
  questions,
  initialAnswers,
}: {
  planId: string;
  roundId: string;
  assignmentId: string;
  questions: Question[];
  initialAnswers: Answers;
}) {
  const router = useRouter();
  const [answers, setAnswers] = useState<Answers>(initialAnswers);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (dirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty]);

  function setAnswer(questionId: string, label: string, value: string) {
    setAnswers((prev) => ({ ...prev, [label]: value }));
    setDirty(true);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const formData = new FormData();
    formData.set("planId", planId);
    formData.set("roundId", roundId);
    formData.set("assignmentId", assignmentId);
    for (const q of questions) {
      const val = answers[q.label];
      if (val != null && String(val) !== "") {
        formData.set(`q_${q.id}`, String(val));
      }
    }
    try {
      await saveReviewAction(formData);
      setDirty(false);
      router.push(`/review/plans/${planId}/rounds/${roundId}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save review");
      setSaving(false);
    }
  }

  function parseOptions(raw: string | null) {
    try {
      return JSON.parse(raw || "[]") as Array<{ label: string; points?: number }>;
    } catch {
      return [];
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {questions.map((q) => {
        const value = answers[q.label] ?? "";
        const opts = q.type === "dropdown" ? parseOptions(q.options) : [];
        return (
          <div key={q.id}>
            <Label>
              {q.label}
              {q.isRequired ? <span className="text-rose-600"> *</span> : null}
            </Label>
            {q.type === "scale_1_5" ? (
              <Select
                value={String(value)}
                onChange={(e) => setAnswer(q.id, q.label, e.target.value)}
                required={q.isRequired}
              >
                <option value="">Select…</option>
                {[1, 2, 3, 4, 5].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </Select>
            ) : q.type === "numeric" ? (
              <Input
                type="number"
                min={q.min ?? undefined}
                max={q.max ?? undefined}
                value={String(value)}
                onChange={(e) => setAnswer(q.id, q.label, e.target.value)}
                required={q.isRequired}
              />
            ) : q.type === "dropdown" ? (
              <Select
                value={String(value)}
                onChange={(e) => setAnswer(q.id, q.label, e.target.value)}
                required={q.isRequired}
              >
                <option value="">Select…</option>
                {opts.map((o) => (
                  <option key={o.label} value={o.label}>
                    {o.label}
                    {o.points != null ? ` (${o.points} pts)` : ""}
                  </option>
                ))}
              </Select>
            ) : (
              <Textarea
                rows={4}
                value={String(value)}
                onChange={(e) => setAnswer(q.id, q.label, e.target.value)}
                required={q.isRequired}
              />
            )}
          </div>
        );
      })}
      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
      {dirty ? (
        <p className="text-xs text-amber-700">You have unsaved changes.</p>
      ) : null}
      <Button type="submit" disabled={saving}>
        {saving ? "Saving…" : "Save review"}
      </Button>
    </form>
  );
}
