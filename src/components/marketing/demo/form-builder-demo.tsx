"use client";

import { useState } from "react";

import { Chip, cx, inputClass } from "@/components/ui";
import { Icon } from "@/components/ui/icon";
import { FIELD_TYPE_LABELS } from "@/lib/fields";
import type { DemoQuestion } from "@/lib/demo-conference";

/**
 * Step 1 of the three-step panel: the call-for-speakers builder, beside the form
 * the speaker will actually see.
 *
 * Mirrors `/admin/e/[slug]/forms/[formId]`. The two-up is the point: every change
 * on the left redraws the right, so a reader learns in one glance that the builder
 * and the public form are the same object. The behaviours are the product's:
 * required marks the asterisk, locked questions cannot be made optional or moved
 * out of the way, and a show-when rule hides its question until the controlling
 * answer arrives.
 */
export function FormBuilderDemo({
  questions: initial,
  longFormat,
}: {
  questions: DemoQuestion[];
  longFormat: string;
}) {
  const [questions, setQuestions] = useState(initial);
  const [selected, setSelected] = useState<string | null>(
    initial.find((question) => !question.locked)?.id ?? null,
  );
  /** What the speaker has picked in the preview's format question. */
  const [format, setFormat] = useState<string>("");

  const formatQuestion = questions.find(
    (question) => question.options.length && /format/i.test(question.label),
  );

  function patch(id: string, change: Partial<DemoQuestion>) {
    setQuestions((current) =>
      current.map((question) => (question.id === id ? { ...question, ...change } : question)),
    );
  }

  function move(id: string, direction: -1 | 1) {
    setQuestions((current) => {
      const index = current.findIndex((question) => question.id === id);
      const next = index + direction;
      if (index < 0 || next < 0 || next >= current.length) return current;
      const copy = [...current];
      [copy[index], copy[next]] = [copy[next], copy[index]];
      return copy;
    });
  }

  /** A question is hidden from the speaker until its controlling answer arrives. */
  const hiddenFromSpeaker = (question: DemoQuestion) =>
    Boolean(question.showWhenFormat) && format !== question.showWhenFormat;

  const visible = questions.filter((question) => !hiddenFromSpeaker(question));

  return (
    <div className="grid min-w-0 gap-4 lg:grid-cols-2 lg:gap-5">
      {/* ---------------------------------------------------------- builder -- */}
      <div className="min-w-0 overflow-hidden rounded-card border border-rule bg-paper">
        <div className="border-b border-rule bg-paper-2 px-4 py-2.5">
          <p className="text-xs font-medium text-ink">Your questions</p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            Reorder, require, or hide one until it matters.
          </p>
        </div>

        <ul className="divide-y divide-rule">
          {questions.map((question, index) => {
            const open = selected === question.id;
            return (
              <li key={question.id} className="min-w-0 px-3 py-2.5">
                <div className="flex min-w-0 items-start gap-2">
                  <button
                    type="button"
                    onClick={() => setSelected(open ? null : question.id)}
                    aria-expanded={open}
                    className="min-w-0 flex-1 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
                  >
                    <span className="flex min-w-0 flex-wrap items-center gap-1.5">
                      <span className="truncate text-xs font-medium text-ink">
                        {question.label}
                      </span>
                      {question.required ? <Chip tone="red">Required</Chip> : null}
                      {question.locked ? (
                        <Chip tone="amber" title="System question — it cannot be removed">
                          <span className="inline-flex items-center gap-1">
                            <Icon name="lock" size={11} />
                            Locked
                          </span>
                        </Chip>
                      ) : null}
                      {question.showWhenFormat ? (
                        <Chip tone="violet" title={`Shown when Format is ${question.showWhenFormat}`}>
                          Show-when
                        </Chip>
                      ) : null}
                    </span>
                    <span className="mt-0.5 block truncate text-[11px] text-muted-foreground">
                      {FIELD_TYPE_LABELS[question.type as keyof typeof FIELD_TYPE_LABELS] ??
                        question.type}
                      {question.maxLength ? ` · ${question.maxLength} chars` : ""}
                    </span>
                  </button>

                  <span className="flex shrink-0 items-center gap-0.5">
                    {([-1, 1] as const).map((direction) => (
                      <button
                        key={direction}
                        type="button"
                        onClick={() => move(question.id, direction)}
                        disabled={direction === -1 ? index === 0 : index === questions.length - 1}
                        aria-label={`Move ${question.label} ${direction === -1 ? "up" : "down"}`}
                        className="grid size-6 place-items-center rounded-md border border-rule text-muted-foreground transition-colors duration-[120ms] ease-out hover:bg-paper-3 hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-focus disabled:opacity-35"
                      >
                        <Icon name={direction === -1 ? "chevronUp" : "chevronDown"} size={13} />
                      </button>
                    ))}
                  </span>
                </div>

                {open ? (
                  <div className="hm-insert mt-2.5 grid gap-2 rounded-input border border-rule bg-paper-2 p-2.5">
                    <label className="flex items-center gap-2 text-[11px] text-ink">
                      <input
                        type="checkbox"
                        checked={question.required}
                        disabled={question.locked}
                        onChange={(event) => patch(question.id, { required: event.target.checked })}
                        className="size-3.5"
                      />
                      Required
                      {question.locked ? (
                        <span className="text-muted-foreground">— locked questions stay required</span>
                      ) : null}
                    </label>
                    <label className="flex items-start gap-2 text-[11px] text-ink">
                      <input
                        type="checkbox"
                        checked={Boolean(question.showWhenFormat)}
                        onChange={(event) =>
                          patch(question.id, {
                            showWhenFormat: event.target.checked ? longFormat : undefined,
                          })
                        }
                        className="mt-0.5 size-3.5"
                      />
                      <span>
                        Only show when <span className="font-medium">Format</span> is{" "}
                        <span className="font-medium">{longFormat}</span>
                      </span>
                    </label>
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      </div>

      {/* ---------------------------------------------------------- preview -- */}
      <div className="min-w-0 overflow-hidden rounded-card border border-rule bg-paper">
        <div className="flex items-center justify-between gap-3 border-b border-rule bg-paper-2 px-4 py-2.5">
          <div className="min-w-0">
            <p className="text-xs font-medium text-ink">What the speaker sees</p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              The public form, redrawn as you edit.
            </p>
          </div>
          <Icon name="globe" size={15} className="shrink-0 text-muted-foreground" />
        </div>

        <div className="grid gap-3 p-4">
          {visible.map((question) => (
            <div key={question.id} className="hm-insert min-w-0">
              <label
                htmlFor={`preview-${question.id}`}
                className="mb-1 block text-[0.8125rem] font-medium text-ink-2"
              >
                {question.label}
                {question.required ? <span className="ml-0.5 text-destructive">*</span> : null}
              </label>
              {question.options.length && formatQuestion?.id === question.id ? (
                // The format question is the one the show-when rule keys on, so it
                // is the only controlled field here.
                <select
                  id={`preview-${question.id}`}
                  value={format}
                  onChange={(event) => setFormat(event.target.value)}
                  className={cx(inputClass, "h-8 text-xs")}
                >
                  <option value="">Select…</option>
                  {question.options.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              ) : question.options.length ? (
                <select
                  id={`preview-${question.id}`}
                  defaultValue=""
                  className={cx(inputClass, "h-8 text-xs")}
                >
                  <option value="">Select…</option>
                  {question.options.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              ) : question.type === "textarea" || question.type === "wysiwyg" ? (
                <textarea
                  id={`preview-${question.id}`}
                  rows={2}
                  placeholder={question.helpText ?? ""}
                  className={cx(inputClass, "h-auto py-1.5 text-xs")}
                />
              ) : (
                <input
                  id={`preview-${question.id}`}
                  type="text"
                  placeholder={question.helpText ?? ""}
                  className={cx(inputClass, "h-8 text-xs")}
                />
              )}
            </div>
          ))}

          {questions.length > visible.length ? (
            <p className="flex items-start gap-1.5 border-t border-rule pt-3 text-[11px] leading-relaxed text-muted-foreground">
              <Icon name="info" size={13} className="mt-px shrink-0" />
              <span>
                {questions.length - visible.length} question is hidden by a show-when rule. Pick{" "}
                <span className="font-medium text-ink">{longFormat}</span> above and watch it
                appear.
              </span>
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
