import {
  Button,
  Card,
  CardHeader,
  Chip,
  Icon,
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
        description="Use the arrows to reorder, mark questions required, or give one a show-when rule."
      />
      <ul className="divide-y divide-rule">
        {questions.map((question, index) => {
          const condition = parseCondition(question.condition);
          const controller = condition
            ? questions.find((q) => q.id === condition.question_id)
            : null;
          const options = parseOptions(question.options);
          const typeLabel = FIELD_TYPE_LABELS[question.type] ?? question.type;
          return (
            <li key={question.id} className="px-4 py-3">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium text-ink">{question.label}</span>
                    {question.is_required ? <Chip tone="red">Required</Chip> : null}
                    {question.is_locked ? (
                      <Chip tone="amber" title="System-required — cannot be removed or made optional">
                        <span className="inline-flex items-center gap-1">
                          <Icon name="lock" size={12} />
                          Locked
                        </span>
                      </Chip>
                    ) : null}
                    {condition ? (
                      <Chip tone="violet">
                        Shows when “{controller?.label ?? "?"}” {OPERATOR_LABELS[condition.operator]}{" "}
                        “{condition.value}”
                      </Chip>
                    ) : null}
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {typeLabel}
                    {question.max_length ? ` · ${question.max_length} chars` : ""}
                  </p>
                  {question.help_text ? (
                    <p className="mt-1 text-xs text-muted-foreground">{question.help_text}</p>
                  ) : null}
                  {options.length ? (
                    <p className="mt-1 text-xs text-muted-foreground">
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
                        variant="secondary"
                        aria-label={direction === -1 ? "Move up" : "Move down"}
                        disabled={direction === -1 ? index === 0 : index === questions.length - 1}
                      >
                        <Icon name={direction === -1 ? "chevronUp" : "chevronDown"} size={16} />
                      </Button>
                    </form>
                  ))}
                  <details className="relative">
                    <summary className="cursor-pointer list-none rounded-input px-2 py-1 text-muted-foreground hover:bg-paper-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus [&::-webkit-details-marker]:hidden">
                      ⋯
                    </summary>
                    <div className="absolute right-0 z-30 mt-1 w-80 rounded-card border border-rule bg-paper p-3 shadow-[var(--shadow-raised)]">
                      <form action={updateQuestionAction} className="space-y-2">
                        <input type="hidden" name="slug" value={slug} />
                        <input type="hidden" name="question_id" value={question.id} />
                        <label className="block text-xs font-medium text-ink-2">
                          Label override
                          <Input
                            name="label_override"
                            defaultValue={question.label_override ?? ""}
                            placeholder={question.label}
                          />
                        </label>
                        <label className="block text-xs font-medium text-ink-2">
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
                            <span className="text-xs text-muted-foreground">(locked)</span>
                          ) : null}
                        </label>

                        <fieldset className="rounded-input border border-rule p-2">
                          <legend className="px-1 text-xs font-medium text-ink-2">
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
                          <p className="mt-1 text-[11px] text-muted-foreground">
                            Separate several values with a pipe: A|B
                          </p>
                        </fieldset>

                        <Button type="submit" size="sm" variant="primary" className="w-full">
                          Save question
                        </Button>
                      </form>

                      <div className="mt-2 flex gap-2 border-t border-rule pt-2">
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
                              variant="danger"
                            >
                              Remove
                            </ConfirmSubmit>
                          </form>
                        ) : (
                          <span className="px-2 py-1 text-xs text-muted-foreground">
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
          <li className="px-4 py-6 text-sm text-muted-foreground">No questions yet — add one below.</li>
        ) : null}
      </ul>

      <form action={addQuestionAction} className="border-t border-rule p-4">
        <input type="hidden" name="slug" value={slug} />
        <input type="hidden" name="id" value={formId} />
        <input type="hidden" name="kind" value={kind} />
        <p className="mb-2 text-sm font-medium text-ink">Add a question</p>
        <fieldset className="rounded-input border border-rule bg-paper-2 p-3">
          <legend className="px-1 text-xs font-medium text-ink-2">From the field library</legend>
          <div className="flex flex-wrap items-end gap-3">
            <label className="block min-w-[14rem] flex-1 text-xs font-medium text-muted-foreground">
              Existing field
              <Select name="field_id" defaultValue="" className="bg-paper">
                <option value="">Choose an existing field…</option>
                {library.map((field) => (
                  <option key={field.id} value={field.id}>
                    {field.label} ({FIELD_TYPE_LABELS[field.type] ?? field.type})
                  </option>
                ))}
                <option value="__new__">Create a new field…</option>
              </Select>
            </label>
            <label className="flex items-center gap-2 pb-2 text-sm text-ink">
              <input type="checkbox" name="is_required" /> Required
            </label>
          </div>
        </fieldset>

        <Button type="submit" variant="primary" className="mt-3">
          Add question
        </Button>

        <details className="mt-3 rounded-input border border-rule bg-paper px-3 py-2">
          <summary className="cursor-pointer text-sm text-neutral underline decoration-rule-2 underline-offset-2 marker:content-none [&::-webkit-details-marker]:hidden">
            Create a new field instead
          </summary>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <label className="block text-xs font-medium text-ink-2">
              Label
              <Input name="new_label" placeholder="Key takeaway" />
            </label>
            <label className="block text-xs font-medium text-ink-2">
              Type
              <Select name="new_type" defaultValue="text">
                {FIELD_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {FIELD_TYPE_LABELS[type]}
                  </option>
                ))}
              </Select>
            </label>
            <label className="block text-xs font-medium text-ink-2">
              Character limit
              <Input name="new_max_length" type="number" min={1} />
            </label>
            <label className="block text-xs font-medium text-ink-2">
              Options (one per line)
              <Textarea name="new_options" rows={3} placeholder={"Beginner\nIntermediate\nAdvanced"} />
            </label>
            <label className="block text-xs font-medium text-ink-2 sm:col-span-2">
              Help text
              <Input name="new_help" />
            </label>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Leave the library dropdown empty (or pick “Create a new field”) and this field is created
            and added in one step.
          </p>
        </details>
      </form>
    </Card>
  );
}
