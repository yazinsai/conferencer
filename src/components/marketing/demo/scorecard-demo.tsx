"use client";

import { useMemo, useState } from "react";

import { Chip, Progress, buttonClass, cx, inputClass } from "@/components/ui";
import { Icon } from "@/components/ui/icon";
import { parseOptions } from "@/lib/fields";
import { computeScore, isScored, scaleRange, type ScorecardQuestion } from "@/lib/scorecard";

/**
 * Step 3 of the three-step panel: a reviewer's scorecard.
 *
 * Mirrors `/review/a/[assignmentId]`. The weighted total is computed by
 * `computeScore` from `lib/scorecard.ts` — the same function the server action
 * writes to the database with, not a copy of its arithmetic (design.md § Live
 * product tiles, rule 1). Weight 0 means "collect it but keep it out of the
 * aggregate", which is why the recommendation dropdown moves the chip and not the
 * number.
 *
 * The anonymized toggle is the round's real setting: in an anonymized round the
 * reviewer never sees who wrote the thing they are scoring.
 */
export function ScorecardDemo({
  questions,
  reviewOf,
  queue,
}: {
  questions: ScorecardQuestion[];
  reviewOf: { title: string; author: string; affiliation: string | null };
  queue: { done: number; total: number; nextTitle: string };
}) {
  const [answers, setAnswers] = useState<Record<string, unknown>>({});
  const [anonymized, setAnonymized] = useState(true);
  const [saved, setSaved] = useState(false);

  const scored = useMemo(() => computeScore(questions, answers), [questions, answers]);
  const scoredQuestions = questions.filter((question) => isScored(question));
  const answeredCount = scoredQuestions.filter(
    (question) => answers[question.id] !== undefined && answers[question.id] !== "",
  ).length;

  const done = saved ? queue.done + 1 : queue.done;

  function set(id: string, value: unknown) {
    setAnswers((current) => ({ ...current, [id]: value }));
    setSaved(false);
  }

  return (
    <div className="mx-auto min-w-0 max-w-3xl">
      {/* ------------------------------------------------------ queue header -- */}
      <div className="mb-3 flex flex-wrap items-end justify-between gap-x-4 gap-y-2">
        <div className="min-w-0">
          <p className="wordmark tnum text-[11px] uppercase tracking-[0.1em] text-muted-foreground">
            Your queue · {done} of {queue.total} reviewed
          </p>
          <div className="mt-1.5 w-48 max-w-full">
            <Progress value={done} max={queue.total} />
          </div>
        </div>
        <label className="flex shrink-0 cursor-pointer items-center gap-2 text-[11px] text-neutral">
          <input
            type="checkbox"
            checked={anonymized}
            onChange={(event) => setAnonymized(event.target.checked)}
            className="size-3.5"
          />
          Anonymized round
        </label>
      </div>

      <div className="min-w-0 overflow-hidden rounded-card border border-rule bg-paper">
        {/* ------------------------------------------------- what is reviewed -- */}
        <div className="border-b border-rule bg-paper-2 px-4 py-3">
          <p className="text-sm font-medium leading-snug text-ink">{reviewOf.title}</p>
          <p className="mt-1 text-[11px] text-muted-foreground">
            {anonymized ? (
              <span className="inline-flex items-center gap-1.5">
                <Icon name="lock" size={12} />
                Author hidden — this round is anonymized
              </span>
            ) : (
              [reviewOf.author, reviewOf.affiliation].filter(Boolean).join(" · ")
            )}
          </p>
        </div>

        {/* ------------------------------------------------------- scorecard -- */}
        <div className="grid gap-4 p-4">
          {questions.map((question) => {
            const scale = scaleRange(question);
            const value = answers[question.id];
            const options = parseOptions(question.options);

            return (
              <div key={question.id} className="min-w-0">
                <p className="mb-1.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[0.8125rem] font-medium text-ink-2">
                  <span>
                    {question.label}
                    {question.is_required ? (
                      <span className="ml-0.5 text-destructive">*</span>
                    ) : null}
                  </span>
                  {Number(question.weight) !== 1 ? (
                    <span className="wordmark text-[10px] font-normal text-muted-foreground">
                      {Number(question.weight) === 0
                        ? "not scored"
                        : `weight ${Number(question.weight)}`}
                    </span>
                  ) : null}
                </p>

                {scale ? (
                  <div className="flex flex-wrap gap-1.5" role="group" aria-label={question.label}>
                    {Array.from({ length: scale.max - scale.min + 1 }, (_, i) => scale.min + i).map(
                      (n) => {
                        const active = String(value) === String(n);
                        return (
                          <label
                            key={n}
                            className={cx(
                              "wordmark tnum cursor-pointer rounded-md border px-3 py-1 text-xs transition-colors duration-[120ms] ease-out",
                              active
                                ? "border-signal bg-signal text-signal-ink"
                                : "border-rule-2 bg-paper text-neutral hover:bg-paper-2",
                            )}
                          >
                            <input
                              type="radio"
                              name={`score-${question.id}`}
                              value={n}
                              checked={active}
                              onChange={() => set(question.id, n)}
                              className="sr-only"
                            />
                            {n}
                          </label>
                        );
                      },
                    )}
                  </div>
                ) : options.length ? (
                  <select
                    aria-label={question.label}
                    value={String(value ?? "")}
                    onChange={(event) => set(question.id, event.target.value)}
                    className={cx(inputClass, "h-8 max-w-xs text-xs")}
                  >
                    <option value="">Select…</option>
                    {options.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <textarea
                    aria-label={question.label}
                    rows={2}
                    placeholder="Visible to the organizers, not the speaker."
                    className={cx(inputClass, "h-auto py-1.5 text-xs")}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* ----------------------------------------------------------- total -- */}
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3 border-t border-rule bg-paper-2 px-4 py-3">
          <div className="flex min-w-0 items-baseline gap-2">
            <span className="text-[11px] text-muted-foreground">Weighted score</span>
            <span className="wordmark tnum text-lg font-medium text-ink">
              {scored.score === null ? "—" : scored.score.toFixed(2)}
            </span>
            {scored.weighted ? <Chip tone="slate">weighted</Chip> : null}
            {answeredCount < scoredQuestions.length ? (
              <span className="text-[11px] text-muted-foreground">
                {scoredQuestions.length - answeredCount} to go
              </span>
            ) : null}
          </div>
          <button
            type="button"
            disabled={scored.score === null || saved}
            onClick={() => setSaved(true)}
            className={cx(buttonClass("primary", "sm"), "nowrap-affordance")}
          >
            {saved ? "Review saved" : "Save review"}
          </button>
        </div>
      </div>

      <p aria-live="polite" className="mt-2.5 min-h-[1.75rem] text-[11px] leading-relaxed">
        {saved ? (
          <span className="hm-insert inline-flex items-start gap-1.5 text-positive">
            <Icon name="success" size={13} className="mt-px shrink-0" />
            <span>
              Saved and visible to the organizers. Next in your queue:{" "}
              <span className="font-medium">{queue.nextTitle}</span>
            </span>
          </span>
        ) : (
          <span className="text-muted-foreground">
            Score it — the total re-weights as you go. Untick “Anonymized round” to see who wrote it.
          </span>
        )}
      </p>
    </div>
  );
}
