"use client";

import { useState } from "react";

import { Chip, Notice, buttonClass, cx, inputClass } from "@/components/ui";
import { Icon } from "@/components/ui/icon";
import type { DemoQuestion } from "@/lib/demo-conference";

/**
 * Step 2 of the three-step panel: the speaker's side of the same form.
 *
 * Mirrors `/e/[slug]/submit/[formId]`. Three of the public form's real behaviours,
 * because they are the three a speaker actually notices: the show-when question
 * that arrives when the format calls for it, the character counter that turns red
 * at the limit the organizer set, and a draft that saves without an invitation or
 * a confirmation step.
 *
 * Saving is silent — a `<Notice>` the reader can see rather than a celebratory
 * toast (design.md § Microinteractions stance).
 */
export function SubmitDemo({
  questions,
  longFormat,
  eventName,
}: {
  questions: DemoQuestion[];
  longFormat: string;
  eventName: string;
}) {
  const conditional = questions.find((question) => question.showWhenFormat);
  const abstract = questions.find(
    (question) => question.maxLength && question.maxLength > 200,
  );
  const limit = abstract?.maxLength ?? 4000;

  const [format, setFormat] = useState("");
  const [text, setText] = useState(
    "Our monorepo's CI took forty minutes, and every engineer had learned to context-switch around it. This talk is the eighteen months we spent getting it to four.",
  );
  const [saved, setSaved] = useState(false);

  const formatOptions =
    questions.find((question) => /format/i.test(question.label))?.options ?? [];
  const showConditional = Boolean(conditional) && format === conditional?.showWhenFormat;
  const over = text.length > limit;

  return (
    <div className="mx-auto min-w-0 max-w-2xl overflow-hidden rounded-card border border-rule bg-paper">
      <div className="border-b border-rule bg-paper-2 px-4 py-3">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <p className="text-xs font-medium text-ink">Submit a talk · {eventName}</p>
          <Chip tone="slate">Step 2 of 4</Chip>
        </div>
        <p className="mt-0.5 text-[11px] text-muted-foreground">
          No invitation needed. The form creates the account as it goes.
        </p>
      </div>

      <div className="grid gap-3.5 p-4">
        <div>
          <label htmlFor="submit-title" className="mb-1 block text-[0.8125rem] font-medium text-ink-2">
            Session title<span className="ml-0.5 text-destructive">*</span>
          </label>
          <input
            id="submit-title"
            type="text"
            defaultValue="Taming 40-Minute CI: Incremental Builds at Monorepo Scale"
            className={cx(inputClass, "text-sm")}
          />
        </div>

        {formatOptions.length ? (
          <div>
            <label
              htmlFor="submit-format"
              className="mb-1 block text-[0.8125rem] font-medium text-ink-2"
            >
              Format<span className="ml-0.5 text-destructive">*</span>
            </label>
            <select
              id="submit-format"
              value={format}
              onChange={(event) => {
                setFormat(event.target.value);
                setSaved(false);
              }}
              className={cx(inputClass, "text-sm")}
            >
              <option value="">Select…</option>
              {formatOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            {!showConditional ? (
              <p className="mt-1 text-[11px] text-muted-foreground">
                Choose {longFormat} — the organizer put a show-when rule on one question.
              </p>
            ) : null}
          </div>
        ) : null}

        {showConditional && conditional ? (
          <div className="hm-insert rounded-input border border-signal/25 bg-signal-soft p-3">
            <label
              htmlFor="submit-conditional"
              className="mb-1 block text-[0.8125rem] font-medium text-ink-2"
            >
              {conditional.label}
              {conditional.required ? <span className="ml-0.5 text-destructive">*</span> : null}
            </label>
            <input
              id="submit-conditional"
              type="text"
              placeholder={conditional.helpText ?? "Only asked for this format"}
              className={cx(inputClass, "bg-paper text-sm")}
            />
            <p className="mt-1.5 flex items-start gap-1.5 text-[11px] leading-relaxed text-neutral">
              <Icon name="info" size={13} className="mt-px shrink-0 text-signal" />
              <span>
                This question was hidden a moment ago. It exists because you picked {longFormat}.
              </span>
            </p>
          </div>
        ) : null}

        <div>
          <label
            htmlFor="submit-abstract"
            className="mb-1 block text-[0.8125rem] font-medium text-ink-2"
          >
            Abstract<span className="ml-0.5 text-destructive">*</span>
          </label>
          <textarea
            id="submit-abstract"
            rows={4}
            value={text}
            onChange={(event) => {
              setText(event.target.value);
              setSaved(false);
            }}
            className={cx(inputClass, "h-auto py-2 text-sm", over && "border-destructive")}
          />
          <p
            className={cx(
              "wordmark tnum mt-1 text-right text-[11px]",
              over ? "font-medium text-destructive" : "text-muted-foreground",
            )}
          >
            {text.length} / {limit} characters
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 border-t border-rule pt-3.5">
          <button
            type="button"
            onClick={() => setSaved(true)}
            className={cx(buttonClass("primary", "sm"), "nowrap-affordance")}
          >
            Save draft
          </button>
          <button type="button" className={cx(buttonClass("secondary", "sm"), "nowrap-affordance")}>
            Add a co-speaker
          </button>
        </div>

        {saved ? (
          <Notice tone="success" className="hm-insert">
            Draft saved. Come back to it any time from your speaker portal — the link is in your
            inbox.
          </Notice>
        ) : null}
      </div>
    </div>
  );
}
