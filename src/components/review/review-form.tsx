"use client";

import { useEffect, useRef, useState } from "react";

import { buttonClass, cx, inputClass } from "@/components/ui";
import { parseOptions } from "@/lib/fields";

export type ScorecardField = {
  id: string;
  type: string;
  label: string;
  options: string;
  min: number | null;
  max: number | null;
  weight: number;
  required: boolean;
};

export function ReviewForm({
  assignmentId,
  questions,
  answers,
  comment,
  readOnly,
  saved,
  nextHref,
  backHref,
  allowAbstain,
  requireAbstainReason,
  abstained,
  abstainReason,
  saveAction,
  abstainAction,
}: {
  assignmentId: string;
  questions: ScorecardField[];
  answers: Record<string, unknown>;
  comment: string;
  readOnly: boolean;
  saved: boolean;
  nextHref: string | null;
  backHref: string;
  allowAbstain: boolean;
  requireAbstainReason: boolean;
  abstained: boolean;
  abstainReason: string | null;
  saveAction: (formData: FormData) => Promise<void>;
  abstainAction: (formData: FormData) => Promise<void>;
}) {
  const [dirty, setDirty] = useState(false);
  const [goNext, setGoNext] = useState(false);
  const submitting = useRef(false);

  useEffect(() => {
    function onBeforeUnload(e: BeforeUnloadEvent) {
      if (dirty && !submitting.current) {
        e.preventDefault();
        e.returnValue = "";
      }
    }
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty]);

  return (
    <div className="sticky top-4 space-y-4">
      <form
        action={saveAction}
        onChange={() => setDirty(true)}
        onSubmit={() => {
          submitting.current = true;
        }}
        className="rounded-lg border border-slate-200 bg-white"
      >
        <div className="border-b border-slate-200 px-4 py-3">
          <h2 className="text-sm font-semibold text-slate-900">Scorecard</h2>
          <p className="text-xs text-slate-500">
            Fields marked <span className="text-red-600">*</span> are required.
          </p>
        </div>
        <input type="hidden" name="assignment_id" value={assignmentId} />
        {goNext && nextHref ? (
          <input type="hidden" name="next_after_save" value={nextHref} />
        ) : null}

        <div className="space-y-4 p-4">
          {questions.map((question) => {
            const value = answers[question.id];
            if (question.type === "separator") {
              return (
                <div key={question.id} className="border-t border-slate-200 pt-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {question.label}
                  </p>
                </div>
              );
            }
            const scale = scaleFor(question);
            return (
              <div key={question.id}>
                <label
                  htmlFor={`q_${question.id}`}
                  className="block text-sm font-medium text-slate-700"
                >
                  {question.label}
                  {question.required ? <span className="ml-0.5 text-red-600">*</span> : null}
                  {question.weight !== 1 ? (
                    <span className="ml-2 text-xs font-normal text-slate-400">
                      weight {question.weight}
                      {question.weight === 0 ? " (not scored)" : ""}
                    </span>
                  ) : null}
                </label>

                {scale ? (
                  <div className="mt-1 flex flex-wrap gap-1.5" role="radiogroup" aria-label={question.label}>
                    {range(scale.min, scale.max).map((n) => (
                      <label
                        key={n}
                        className={cx(
                          "cursor-pointer rounded-md border px-3 py-1.5 text-sm",
                          String(value) === String(n)
                            ? "border-brand-600 bg-brand-600 text-white"
                            : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50",
                        )}
                      >
                        <input
                          type="radio"
                          name={`q_${question.id}`}
                          value={n}
                          defaultChecked={String(value) === String(n)}
                          disabled={readOnly}
                          className="sr-only"
                        />
                        {n}
                      </label>
                    ))}
                  </div>
                ) : question.type === "dropdown" ? (
                  <select
                    id={`q_${question.id}`}
                    name={`q_${question.id}`}
                    defaultValue={String(value ?? "")}
                    disabled={readOnly}
                    className={inputClass}
                  >
                    <option value="">Select…</option>
                    {parseOptions(question.options).map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                        {option.points !== undefined ? ` (${option.points})` : ""}
                      </option>
                    ))}
                  </select>
                ) : question.type === "free_text" ? (
                  <textarea
                    id={`q_${question.id}`}
                    name={`q_${question.id}`}
                    rows={5}
                    defaultValue={String(value ?? "")}
                    disabled={readOnly}
                    className={inputClass}
                  />
                ) : question.type === "file" ? (
                  <input
                    id={`q_${question.id}`}
                    name={`q_${question.id}`}
                    type="url"
                    placeholder="Link to a file"
                    defaultValue={String(value ?? "")}
                    disabled={readOnly}
                    className={inputClass}
                  />
                ) : (
                  <input
                    id={`q_${question.id}`}
                    name={`q_${question.id}`}
                    type="number"
                    min={question.min ?? undefined}
                    max={question.max ?? undefined}
                    defaultValue={String(value ?? "")}
                    disabled={readOnly}
                    className={inputClass}
                  />
                )}
              </div>
            );
          })}

          <div>
            <label htmlFor="comment" className="block text-sm font-medium text-slate-700">
              Comment to the committee
            </label>
            <textarea
              id="comment"
              name="comment"
              rows={4}
              defaultValue={comment}
              disabled={readOnly}
              className={inputClass}
            />
          </div>

          {nextHref ? (
            <label className="flex items-center gap-2 text-sm text-slate-600">
              <input
                type="checkbox"
                checked={goNext}
                onChange={(e) => setGoNext(e.target.checked)}
                disabled={readOnly}
              />
              Go to the next submission after saving
            </label>
          ) : null}

          <div className="flex flex-wrap gap-2">
            <button
              type="submit"
              disabled={readOnly}
              className={buttonClass("primary", "md")}
              onClick={() => {
                submitting.current = true;
              }}
            >
              {saved ? "Update review" : "Save Review"}
            </button>
            <a href={backHref} className={buttonClass("secondary", "md")}>
              Back to queue
            </a>
          </div>
          {saved ? (
            <p className="text-xs text-emerald-700">
              Your review is saved and visible to the organizers.
            </p>
          ) : null}
          {dirty && !readOnly ? (
            <p className="text-xs text-amber-700">You have unsaved changes.</p>
          ) : null}
        </div>
      </form>

      {allowAbstain ? (
        <form action={abstainAction} className="rounded-lg border border-slate-200 bg-white p-4">
          <input type="hidden" name="assignment_id" value={assignmentId} />
          <h3 className="text-sm font-semibold text-slate-900">Conflict of interest</h3>
          {abstained ? (
            <>
              <p className="mt-1 text-sm text-amber-800">
                You declared a conflict on this submission
                {abstainReason ? `: “${abstainReason}”` : ""}.
              </p>
              <input type="hidden" name="undo" value="1" />
              <button type="submit" className={cx(buttonClass("secondary", "sm"), "mt-2")}>
                Withdraw the conflict
              </button>
            </>
          ) : (
            <>
              <p className="mt-1 text-xs text-slate-500">
                Recuse yourself if you know the author or your organisation is involved. It stays in
                your pending count and is flagged to the organizers.
              </p>
              <textarea
                name="reason"
                rows={2}
                required={requireAbstainReason}
                placeholder="Reason (e.g. same employer)"
                className={cx(inputClass, "mt-2")}
              />
              <button
                type="submit"
                disabled={readOnly}
                className={cx(buttonClass("secondary", "sm"), "mt-2")}
              >
                Declare conflict / recuse
              </button>
            </>
          )}
        </form>
      ) : null}
    </div>
  );
}

function scaleFor(question: ScorecardField): { min: number; max: number } | null {
  switch (question.type) {
    case "scale_1_3":
      return { min: 1, max: 3 };
    case "scale_1_5":
      return { min: 1, max: 5 };
    case "scale_1_10":
      return { min: 1, max: 10 };
    default:
      return null;
  }
}

function range(min: number, max: number): number[] {
  return Array.from({ length: max - min + 1 }, (_, i) => min + i);
}
