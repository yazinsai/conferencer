import {
  Button,
  Card,
  CardHeader,
  Chip,
  Input,
  Select,
  Textarea,
} from "@/components/ui";
import { ConfirmSubmit } from "@/components/client/basics";
import {
  addQuestionAction,
  deleteQuestionAction,
  duplicateQuestionAction,
  moveQuestionAction,
  updateQuestionAction,
} from "@/server/form-actions";
import { FIELD_TYPES, FIELD_TYPE_LABELS, parseOptions } from "@/lib/fields";
import { OPERATOR_LABELS, parseCondition } from "@/lib/conditions";
import type { Field, QuestionWithField } from "@/lib/repo/forms";

export function QuestionList({
  slug,
  formId,
  kind,
  questions,
  library,
}: {
  slug: string;
  formId: string;
  kind: "submission" | "participant";
  questions: QuestionWithField[];
  library: Field[];
}) {
  return (
    <Card>
      <CardHeader
        title={kind === "submission" ? "Questions about the submission" : "Questions about each participant"}
        description="Drag order with the arrows, mark questions required, or give one a show-when rule."
      />
      <ul className="divide-y divide-slate-100">
        {questions.map((question, index) => {
          const condition = parseCondition(question.condition);
          const controller = condition
            ? questions.find((q) => q.id === condition.question_id)
            : null;
          const options = parseOptions(question.options);
          return (
            <li key={question.id} className="px-4 py-3">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="cursor-grab select-none text-slate-300" aria-hidden title="Drag to reorder">
                      ⠿
                    </span>
                    <span className="font-medium text-slate-900">{question.label}</span>
                    <Chip tone="slate">{FIELD_TYPE_LABELS[question.type] ?? question.type}</Chip>
                    {question.is_required ? <Chip tone="red">Required</Chip> : null}
                    {question.is_locked ? (
                      <Chip tone="amber" title="System-required — cannot be removed or made optional">
                        🔒 Locked
                      </Chip>
                    ) : null}
                    {question.max_length ? (
                      <Chip tone="slate">{question.max_length} chars</Chip>
                    ) : null}
                    {condition ? (
                      <Chip tone="violet">
                        Shows when “{controller?.label ?? "?"}” {OPERATOR_LABELS[condition.operator]}{" "}
                        “{condition.value}”
                      </Chip>
                    ) : null}
                  </div>
                  {question.help_text ? (
                    <p className="mt-1 text-xs text-slate-500">{question.help_text}</p>
                  ) : null}
                  {options.length ? (
                    <p className="mt-1 text-xs text-slate-500">
                      Options: {options.map((o) => o.label).join(" · ")}
                    </p>
                  ) : null}
                </div>

                <div className="flex shrink-0 items-center gap-1">
                  {[-1, 1].map((direction) => (
                    <form key={direction} action={moveQuestionAction}>
                      <input type="hidden" name="slug" value={slug} />
                      <input type="hidden" name="question_id" value={question.id} />
                      <input type="hidden" name="direction" value={direction} />
                      <Button
                        type="submit"
                        size="sm"
                        variant="ghost"
                        aria-label={direction === -1 ? "Move up" : "Move down"}
                        disabled={direction === -1 ? index === 0 : index === questions.length - 1}
                      >
                        {direction === -1 ? "↑" : "↓"}
                      </Button>
                    </form>
                  ))}
                  <details className="relative">
                    <summary className="cursor-pointer list-none rounded px-2 py-1 text-slate-500 hover:bg-slate-100 [&::-webkit-details-marker]:hidden">
                      ⋯
                    </summary>
                    <div className="absolute right-0 z-30 mt-1 w-80 rounded-md border border-slate-200 bg-white p-3 shadow-lg">
                      <form action={updateQuestionAction} className="space-y-2">
                        <input type="hidden" name="slug" value={slug} />
                        <input type="hidden" name="question_id" value={question.id} />
                        <label className="block text-xs font-medium text-slate-600">
                          Label override
                          <Input
                            name="label_override"
                            defaultValue={question.label_override ?? ""}
                            placeholder={question.label}
                          />
                        </label>
                        <label className="block text-xs font-medium text-slate-600">
                          Help text
                          <Textarea name="help_text" rows={2} defaultValue={question.help_text ?? ""} />
                        </label>
                        <label className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            name="is_required"
                            defaultChecked={Boolean(question.is_required)}
                            disabled={Boolean(question.is_locked)}
                          />
                          Required
                          {question.is_locked ? (
                            <span className="text-xs text-slate-400">(locked)</span>
                          ) : null}
                        </label>

                        <fieldset className="rounded-md border border-slate-200 p-2">
                          <legend className="px-1 text-xs font-medium text-slate-600">
                            Show this question when…
                          </legend>
                          <Select
                            name="condition_question_id"
                            defaultValue={condition?.question_id ?? ""}
                            className="mb-1 text-xs"
                            aria-label="Controlling question"
                          >
                            <option value="">Always show</option>
                            {questions
                              .filter((q) => q.id !== question.id)
                              .map((q) => (
                                <option key={q.id} value={q.id}>
                                  {q.label}
                                </option>
                              ))}
                          </Select>
                          <div className="flex gap-1">
                            <Select
                              name="condition_operator"
                              defaultValue={condition?.operator ?? "equals"}
                              className="text-xs"
                              aria-label="Operator"
                            >
                              {Object.entries(OPERATOR_LABELS).map(([value, label]) => (
                                <option key={value} value={value}>
                                  {label}
                                </option>
                              ))}
                            </Select>
                            <Input
                              name="condition_value"
                              defaultValue={condition?.value ?? ""}
                              placeholder="Workshop (120 min)"
                              className="text-xs"
                              aria-label="Value"
                            />
                          </div>
                          <p className="mt-1 text-[11px] text-slate-400">
                            Separate several values with a pipe: A|B
                          </p>
                        </fieldset>

                        <Button type="submit" size="sm" variant="primary" className="w-full">
                          Save question
                        </Button>
                      </form>

                      <div className="mt-2 flex gap-2 border-t border-slate-200 pt-2">
                        <form action={duplicateQuestionAction}>
                          <input type="hidden" name="slug" value={slug} />
                          <input type="hidden" name="question_id" value={question.id} />
                          <Button type="submit" size="sm" variant="ghost">
                            Duplicate
                          </Button>
                        </form>
                        {!question.is_locked ? (
                          <form action={deleteQuestionAction}>
                            <input type="hidden" name="slug" value={slug} />
                            <input type="hidden" name="question_id" value={question.id} />
                            <ConfirmSubmit
                              message={`Remove "${question.label}" from this form?`}
                              variant="ghost"
                            >
                              Remove
                            </ConfirmSubmit>
                          </form>
                        ) : (
                          <span className="px-2 py-1 text-xs text-slate-400">
                            Locked questions cannot be removed
                          </span>
                        )}
                      </div>
                    </div>
                  </details>
                </div>
              </div>
            </li>
          );
        })}
        {!questions.length ? (
          <li className="px-4 py-6 text-sm text-slate-500">No questions yet — add one below.</li>
        ) : null}
      </ul>

      <form action={addQuestionAction} className="border-t border-slate-200 p-4">
        <input type="hidden" name="slug" value={slug} />
        <input type="hidden" name="id" value={formId} />
        <input type="hidden" name="kind" value={kind} />
        <p className="mb-2 text-sm font-medium text-slate-800">Add a question</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-xs font-medium text-slate-600">
            From the field library
            <Select name="field_id" defaultValue="">
              <option value="">Choose an existing field…</option>
              {library.map((field) => (
                <option key={field.id} value={field.id}>
                  {field.label} ({FIELD_TYPE_LABELS[field.type] ?? field.type})
                </option>
              ))}
              <option value="__new__">➕ Create a new field…</option>
            </Select>
          </label>
          <label className="flex items-end gap-2 text-sm">
            <input type="checkbox" name="is_required" className="mb-2.5" /> Required
          </label>
        </div>

        <details className="mt-3 rounded-md border border-slate-200 p-3">
          <summary className="cursor-pointer text-sm font-medium text-slate-700">
            …or create a new field inline
          </summary>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <label className="block text-xs font-medium text-slate-600">
              Label
              <Input name="new_label" placeholder="Key takeaway" />
            </label>
            <label className="block text-xs font-medium text-slate-600">
              Type
              <Select name="new_type" defaultValue="text">
                {FIELD_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {FIELD_TYPE_LABELS[type]}
                  </option>
                ))}
              </Select>
            </label>
            <label className="block text-xs font-medium text-slate-600">
              Character limit
              <Input name="new_max_length" type="number" min={1} />
            </label>
            <label className="block text-xs font-medium text-slate-600">
              Options (one per line)
              <Textarea name="new_options" rows={3} placeholder={"Beginner\nIntermediate\nAdvanced"} />
            </label>
            <label className="block text-xs font-medium text-slate-600 sm:col-span-2">
              Help text
              <Input name="new_help" />
            </label>
          </div>
          <p className="mt-2 text-xs text-slate-500">
            Leave the library dropdown empty (or pick “Create a new field”) and this field is created
            and added in one step.
          </p>
        </details>

        <Button type="submit" variant="primary" className="mt-3">
          Add question
        </Button>
      </form>
    </Card>
  );
}
