"use client";

import { useEffect, useState } from "react";
import { useFormStatus } from "react-dom";

import {
  Button,
  Card,
  CardHeader,
  Chip,
  cx,
  Field,
  Input,
  Select,
  Table,
  Td,
  Textarea,
  Th,
} from "@/components/ui";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ConfirmSubmit } from "@/components/client/basics";
import { optionsToText, parseOptions } from "@/lib/fields";
import {
  SCORECARD_TYPE_LABELS,
  SCORECARD_TYPES,
  scaleRange,
} from "@/lib/scorecard";
import {
  deleteRoundAction,
  saveRoundEditorAction,
} from "@/server/evaluation-actions";

const FILTERABLE_KEYS = ["track", "format", "level", "language"] as const;

const PREVIEW = {
  title: "Shipping observability without drowning in dashboards",
  description:
    "A practical talk on picking a few high-signal metrics, wiring alerts that page for the right reasons, and keeping on-call sane as the product grows.",
  track: "Platform",
  format: "Talk (30 min)",
  level: "Intermediate",
  language: "English",
  speakers: [
    { name: "Alex Chen", meta: "Principal Engineer, Contoso" },
    { name: "Sam Okonkwo", meta: "SRE Lead, Contoso" },
  ],
  answers: [
    { key: "key_takeaway", label: "Key takeaway", value: "Measure what on-call can act on." },
  ],
} as const;

export type RoundEditorField = { key: string; label: string };

export type RoundEditorCriterion = {
  id: string;
  label: string;
  type: string;
  weight: number;
  is_required: number;
  options: string;
  min: number | null;
  max: number | null;
};

type CriterionDraft = {
  id: string;
  label: string;
  type: string;
  weight: number;
  is_required: boolean;
  optionsText: string;
  min: number | null;
  max: number | null;
};

type RoundDraft = {
  name: string;
  opens_at: string;
  closes_at: string;
  instructions: string;
  anonymize: boolean;
  show_participants: boolean;
  visible_fields: string[];
  card_fields: string[];
  filter_fields: string[];
};

function needsOptions(type: string) {
  return type === "dropdown" || type === "numeric";
}

function optionsSummary(criterion: CriterionDraft): string {
  if (criterion.type === "numeric") {
    const min = criterion.min ?? 0;
    const max = criterion.max ?? 10;
    return `${min}–${max}`;
  }
  if (criterion.type === "dropdown") {
    const opts = parseOptions(criterion.optionsText);
    if (!opts.length) return "No options";
    if (opts.length <= 2) return opts.map((o) => o.label).join(", ");
    return `${opts.length} options`;
  }
  const range = scaleRange({
    type: criterion.type,
    min: criterion.min,
    max: criterion.max,
  });
  if (range) return `${range.min}–${range.max}`;
  return "—";
}

function SaveButton({ canSave }: { canSave: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="primary" disabled={pending || !canSave}>
      {pending ? "Saving…" : "Save changes"}
    </Button>
  );
}


function toDraft(questions: RoundEditorCriterion[]): CriterionDraft[] {
  return questions.map((q) => ({
    id: q.id,
    label: q.label,
    type: q.type,
    weight: q.weight,
    is_required: Boolean(q.is_required),
    optionsText: optionsToText(parseOptions(q.options)),
    min: q.min,
    max: q.max,
  }));
}

export function RoundEditor({
  slug,
  planId,
  roundId,
  roundName,
  opensAt,
  closesAt,
  instructions,
  anonymize,
  showParticipants,
  visibleFields,
  cardFields,
  filterFields,
  scorecard,
  sessionFields,
}: {
  slug: string;
  planId: string;
  roundId: string;
  roundName: string;
  opensAt: string;
  closesAt: string;
  instructions: string;
  anonymize: boolean;
  showParticipants: boolean;
  visibleFields: string[];
  cardFields: string[];
  filterFields: string[];
  scorecard: RoundEditorCriterion[];
  sessionFields: RoundEditorField[];
}) {
  const [initialRound] = useState<RoundDraft>(() => ({
    name: roundName,
    opens_at: opensAt,
    closes_at: closesAt,
    instructions,
    anonymize,
    show_participants: showParticipants,
    visible_fields: visibleFields.length
      ? visibleFields
      : sessionFields.map((f) => f.key),
    card_fields: cardFields,
    filter_fields: filterFields.length ? filterFields : [...FILTERABLE_KEYS],
  }));
  const [initialCriteria] = useState(() => toDraft(scorecard));

  const [round, setRound] = useState(initialRound);
  const [criteria, setCriteria] = useState(initialCriteria);
  const [dragId, setDragId] = useState<string | null>(null);

  const dirty =
    JSON.stringify(round) !== JSON.stringify(initialRound) ||
    JSON.stringify(criteria) !== JSON.stringify(initialCriteria);

  useEffect(() => {
    function onBeforeUnload(e: BeforeUnloadEvent) {
      if (!dirty) return;
      e.preventDefault();
      e.returnValue = "";
    }
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty]);

  function patchRound(patch: Partial<RoundDraft>) {
    setRound((prev) => ({ ...prev, ...patch }));
  }

  function patchCriterion(id: string, patch: Partial<CriterionDraft>) {
    setCriteria((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  }

  function addCriterion() {
    setCriteria((prev) => [
      ...prev,
      {
        id: `new_${crypto.randomUUID()}`,
        label: "",
        type: "scale_1_5",
        weight: 1,
        is_required: true,
        optionsText: "",
        min: null,
        max: null,
      },
    ]);
  }

  function removeCriterion(id: string) {
    setCriteria((prev) => prev.filter((c) => c.id !== id));
  }

  function reorder(fromId: string, toId: string) {
    if (fromId === toId) return;
    setCriteria((prev) => {
      const next = [...prev];
      const from = next.findIndex((c) => c.id === fromId);
      const to = next.findIndex((c) => c.id === toId);
      if (from < 0 || to < 0) return prev;
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      return next;
    });
  }

  function toggleField(list: "visible_fields" | "card_fields" | "filter_fields", key: string) {
    setRound((prev) => {
      const current = prev[list];
      const on = current.includes(key);
      if (list === "card_fields" && !on && current.length >= 3) return prev;
      return {
        ...prev,
        [list]: on ? current.filter((k) => k !== key) : [...current, key],
      };
    });
  }

  function showField(key: string) {
    return round.visible_fields.includes(key);
  }

  const cardMeta = FILTERABLE_KEYS.filter(
    (key) => round.card_fields.includes(key) && showField(key),
  );
  const previewFilters = FILTERABLE_KEYS.filter((key) => round.filter_fields.includes(key));

  return (
    <div className="space-y-5 pb-24">
      {/* Scorecard ------------------------------------------------------- */}
      <Card>
        <CardHeader
          title="Scorecard"
          description="One row per criterion. Reviewers fill this in for each assigned submission. Scored options apply to dropdown and numeric types — other types ignore them but keep any saved values."
          actions={
            <Button type="button" size="sm" onClick={addCriterion}>
              Add criterion
            </Button>
          }
        />
        <div className="border-t border-rule">
          {/* Same named columns for header + every criterion — no colspan tricks. */}
          <div
            className="hidden gap-2 border-b border-rule bg-paper-2 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground md:grid md:grid-cols-[1.5rem_minmax(0,1.4fr)_minmax(8rem,0.95fr)_minmax(7rem,1fr)_4.5rem_5rem_2.5rem] md:items-end"
            role="row"
          >
            <span className="sr-only">Reorder</span>
            <span>Criterion</span>
            <span>Type</span>
            <span>
              Scored options
              <span className="mt-0.5 block font-normal normal-case tracking-normal text-muted-foreground">
                Dropdown points / numeric range
              </span>
            </span>
            <span>Weight</span>
            <span>Required</span>
            <span className="sr-only">Actions</span>
          </div>

          <ul className="divide-y divide-rule">
            {criteria.map((criterion) => (
              <li
                key={criterion.id}
                draggable
                onDragStart={() => setDragId(criterion.id)}
                onDragEnd={() => setDragId(null)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => {
                  if (dragId) reorder(dragId, criterion.id);
                  setDragId(null);
                }}
                className={cx(
                  "px-4 py-3",
                  dragId === criterion.id && "opacity-50",
                )}
              >
                <div className="grid gap-3 md:grid-cols-[1.5rem_minmax(0,1.4fr)_minmax(8rem,0.95fr)_minmax(7rem,1fr)_4.5rem_5rem_2.5rem] md:items-start md:gap-2">
                  <span
                    className="cursor-grab select-none text-muted-foreground md:pt-2"
                    title="Drag to reorder"
                    aria-hidden
                  >
                    ⠿
                  </span>

                  <label className="block min-w-0 text-xs font-medium text-ink-2">
                    <span className="mb-1 block md:sr-only">Criterion</span>
                    <Input
                      value={criterion.label}
                      onChange={(e) => patchCriterion(criterion.id, { label: e.target.value })}
                      placeholder="Originality"
                      aria-label="Criterion label"
                      className="w-full"
                    />
                  </label>

                  <label className="block text-xs font-medium text-ink-2">
                    <span className="mb-1 block md:sr-only">Type</span>
                    <Select
                      value={criterion.type}
                      onChange={(e) =>
                        patchCriterion(criterion.id, { type: e.target.value })
                      }
                      aria-label="Response type"
                      className="w-full"
                    >
                      {SCORECARD_TYPES.map((type) => (
                        <option key={type} value={type}>
                          {SCORECARD_TYPE_LABELS[type]}
                        </option>
                      ))}
                    </Select>
                  </label>

                  <div className="min-w-0 text-xs font-medium text-ink-2">
                    <span className="mb-1 block md:sr-only">Scored options</span>
                    {needsOptions(criterion.type) ? (
                      <OptionsPopover
                        criterion={criterion}
                        onChange={(patch) => patchCriterion(criterion.id, patch)}
                      />
                    ) : (
                      <p className="pt-2 text-xs font-normal text-muted-foreground">
                        Not used for {SCORECARD_TYPE_LABELS[criterion.type] ?? criterion.type}
                        {criterion.optionsText.trim() || criterion.min != null
                          ? " · saved values kept"
                          : ""}
                      </p>
                    )}
                  </div>

                  <label className="block text-xs font-medium text-ink-2">
                    <span className="mb-1 block md:sr-only">Weight</span>
                    <Input
                      type="number"
                      step="0.5"
                      min={0}
                      value={criterion.weight}
                      onChange={(e) =>
                        patchCriterion(criterion.id, { weight: Number(e.target.value) })
                      }
                      aria-label="Weight"
                      className="w-full md:w-20"
                    />
                  </label>

                  <label className="flex items-center gap-2 pt-1 text-sm text-neutral md:pt-2">
                    <input
                      type="checkbox"
                      checked={criterion.is_required}
                      onChange={(e) =>
                        patchCriterion(criterion.id, { is_required: e.target.checked })
                      }
                    />
                    <span className="md:sr-only">Required</span>
                  </label>

                  <div className="md:pt-1">
                    <details className="relative">
                      <summary className="cursor-pointer list-none rounded-md px-2 py-1 text-muted-foreground hover:bg-paper-2 [&::-webkit-details-marker]:hidden">
                        ⋯
                      </summary>
                      <div className="absolute right-0 z-20 mt-1 w-40 rounded-md border border-rule bg-paper p-1 shadow-[var(--shadow-card)]">
                        <button
                          type="button"
                          className="w-full rounded-md px-2 py-1.5 text-left text-sm text-destructive hover:bg-danger-soft"
                          onClick={() => removeCriterion(criterion.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </details>
                  </div>
                </div>
              </li>
            ))}
            {!criteria.length ? (
              <li className="px-4 py-6 text-center text-sm text-muted-foreground">
                No criteria yet — add one to start the scorecard.
              </li>
            ) : null}
          </ul>
        </div>
        {criteria.some((c) => c.weight === 0) ? (
          <p className="border-t border-rule px-4 py-2 text-xs text-muted-foreground">
            Weight 0 — collected but excluded from the aggregate score.
          </p>
        ) : null}
      </Card>

      {/* Round details --------------------------------------------------- */}
      <Card>
        <CardHeader
          title="Round details"
          description="Name, window, and the instructions reviewers see at the top of their queue."
        />
        <div className="space-y-4 p-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <Field label="Name" name="name" required>
              <Input
                id="name"
                value={round.name}
                onChange={(e) => patchRound({ name: e.target.value })}
                required
              />
            </Field>
            <Field label="Opens" name="opens_at">
              <Input
                id="opens_at"
                type="datetime-local"
                value={round.opens_at}
                onChange={(e) => patchRound({ opens_at: e.target.value })}
              />
            </Field>
            <Field label="Closes" name="closes_at">
              <Input
                id="closes_at"
                type="datetime-local"
                value={round.closes_at}
                onChange={(e) => patchRound({ closes_at: e.target.value })}
              />
            </Field>
          </div>
          <Field label="Reviewer instructions" name="instructions">
            <Textarea
              id="instructions"
              rows={3}
              value={round.instructions}
              onChange={(e) => patchRound({ instructions: e.target.value })}
            />
          </Field>
        </div>
      </Card>

      {/* Review privacy -------------------------------------------------- */}
      <Card>
        <CardHeader
          title="Review privacy"
          description="What reviewers learn about who submitted. Watch the preview when you flip these."
        />
        <div className="space-y-1 p-4">
          <label className="flex items-start gap-2 text-sm">
            <input
              type="checkbox"
              className="mt-0.5"
              checked={round.anonymize}
              onChange={(e) => patchRound({ anonymize: e.target.checked })}
            />
            <span className="min-w-0 flex-1">
              <span className="flex flex-wrap items-center gap-2">
                <span className="font-medium text-ink">Anonymous review</span>
                {round.anonymize ? <Chip tone="violet">on</Chip> : null}
              </span>
              <span className="mt-0.5 block text-xs text-muted-foreground">
                Hide author and co-author identity from reviewers in this round.
              </span>
            </span>
          </label>
          {/* Child of anonymize — preference is saved either way; preview ignores it while anon is on. */}
          <div className="ml-6 border-l border-rule pl-3">
            <label className="flex items-start gap-2 py-2 text-sm">
              <input
                type="checkbox"
                className="mt-0.5"
                checked={round.show_participants}
                onChange={(e) => patchRound({ show_participants: e.target.checked })}
              />
              <span>
                <span className="font-medium text-ink">Show participant list</span>
                <span className="mt-0.5 block text-xs text-muted-foreground">
                  Used only when anonymization is off. Speakers appear beside the submission for
                  assigned reviewers.
                </span>
              </span>
            </label>
          </div>
        </div>
      </Card>

      {/* Reviewer experience --------------------------------------------- */}
      <Card>
        <CardHeader
          title="Reviewer experience"
          description="Fields, cards, filters — and a live preview of what an assigned reviewer sees."
        />
        <div className="grid gap-0 lg:grid-cols-2">
          <div className="border-b border-slate-200 p-4 lg:border-b-0 lg:border-r">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Fields
            </p>
            <p className="mb-3 text-xs text-slate-500">
              Show = detail page. Card = queue card (max 3). Filter = queue sidebar.
            </p>
            <div className="overflow-x-auto rounded-md border border-slate-200">
              <Table className="rounded-none border-0">
                <thead>
                  <tr>
                    <Th>Field</Th>
                    <Th className="w-16 text-center">Show</Th>
                    <Th className="w-16 text-center">Card</Th>
                    <Th className="w-16 text-center">Filter</Th>
                  </tr>
                </thead>
                <tbody>
                  {sessionFields.map((field) => {
                    const filterable = (FILTERABLE_KEYS as readonly string[]).includes(field.key);
                    const cardOn = round.card_fields.includes(field.key);
                    const cardBlocked =
                      !cardOn && round.card_fields.length >= 3;
                    return (
                      <tr key={field.key}>
                        <Td className="text-sm text-slate-800">{field.label}</Td>
                        <Td className="text-center">
                          <input
                            type="checkbox"
                            checked={round.visible_fields.includes(field.key)}
                            onChange={() => toggleField("visible_fields", field.key)}
                            aria-label={`Show ${field.label}`}
                          />
                        </Td>
                        <Td className="text-center">
                          <input
                            type="checkbox"
                            checked={cardOn}
                            disabled={cardBlocked}
                            onChange={() => toggleField("card_fields", field.key)}
                            aria-label={`Card ${field.label}`}
                            title={cardBlocked ? "Max 3 card fields" : undefined}
                          />
                        </Td>
                        <Td className="text-center">
                          {filterable ? (
                            <input
                              type="checkbox"
                              checked={round.filter_fields.includes(field.key)}
                              onChange={() => toggleField("filter_fields", field.key)}
                              aria-label={`Filter ${field.label}`}
                            />
                          ) : (
                            <span className="text-slate-300">—</span>
                          )}
                        </Td>
                      </tr>
                    );
                  })}
                  {!sessionFields.length ? (
                    <tr>
                      <Td colSpan={4} className="py-4 text-center text-slate-500">
                        No session fields on this event yet.
                      </Td>
                    </tr>
                  ) : null}
                </tbody>
              </Table>
            </div>
          </div>

          <div className="p-4 lg:sticky lg:top-4 lg:self-start">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Reviewer preview
            </p>
            <p className="mb-3 text-xs text-slate-500">
              Sample submission — updates as you change privacy and fields.
            </p>
            <ReviewerPreview
              anonymize={round.anonymize}
              showParticipants={round.show_participants}
              showField={showField}
              cardMeta={cardMeta}
              previewFilters={previewFilters}
              instructions={round.instructions}
              criteria={criteria}
            />
          </div>
        </div>
      </Card>

      {/* Sticky save — one action for the whole page -------------------- */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <p className="text-xs text-slate-500">
            {dirty ? "Unsaved changes" : "All changes saved"}
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <form action={deleteRoundAction}>
              <input type="hidden" name="slug" value={slug} />
              <input type="hidden" name="round_id" value={roundId} />
              <ConfirmSubmit message={`Delete the round "${round.name}"?`} variant="ghost">
                Delete round
              </ConfirmSubmit>
            </form>
            <form action={saveRoundEditorAction}>
              <input type="hidden" name="slug" value={slug} />
              <input type="hidden" name="round_id" value={roundId} />
              <input type="hidden" name="plan_id" value={planId} />
              <input type="hidden" name="name" value={round.name} />
              <input type="hidden" name="opens_at" value={round.opens_at} />
              <input type="hidden" name="closes_at" value={round.closes_at} />
              <input type="hidden" name="instructions" value={round.instructions} />
              {round.anonymize ? <input type="hidden" name="anonymize" value="1" /> : null}
              {round.show_participants ? (
                <input type="hidden" name="show_participants" value="1" />
              ) : null}
              {round.visible_fields.map((key) => (
                <input key={`v-${key}`} type="hidden" name="visible_fields" value={key} />
              ))}
              {round.card_fields.map((key) => (
                <input key={`c-${key}`} type="hidden" name="card_fields" value={key} />
              ))}
              {round.filter_fields.map((key) => (
                <input key={`f-${key}`} type="hidden" name="filter_fields" value={key} />
              ))}
              <input
                type="hidden"
                name="scorecard_json"
                value={JSON.stringify(
                  criteria.map((c) => ({
                    id: c.id,
                    label: c.label,
                    type: c.type,
                    weight: c.weight,
                    is_required: c.is_required ? 1 : 0,
                    options_text: c.optionsText,
                    min: c.min,
                    max: c.max,
                  })),
                )}
              />
              <SaveButton canSave={Boolean(round.name.trim())} />
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

function OptionsPopover({
  criterion,
  onChange,
}: {
  criterion: CriterionDraft;
  onChange: (patch: Partial<CriterionDraft>) => void;
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(criterion.optionsText);
  const [min, setMin] = useState(String(criterion.min ?? 0));
  const [max, setMax] = useState(String(criterion.max ?? 10));

  useEffect(() => {
    if (open) {
      setDraft(criterion.optionsText);
      setMin(String(criterion.min ?? 0));
      setMax(String(criterion.max ?? 10));
    }
  }, [open, criterion.optionsText, criterion.min, criterion.max]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        type="button"
        className="text-left text-xs font-medium text-signal underline-offset-2 hover:underline"
      >
        {optionsSummary(criterion) === "No options" || optionsSummary(criterion) === "—"
          ? "Configure scored options"
          : optionsSummary(criterion)}
      </PopoverTrigger>
      <PopoverContent align="start" className="w-80 p-3">
        <PopoverHeader>
          <PopoverTitle className="text-sm">Scored options</PopoverTitle>
          <PopoverDescription className="text-xs text-muted-foreground">
            {criterion.type === "numeric"
              ? "Min and max reviewers can enter for this numeric criterion."
              : "For dropdown-with-points criteria. One option per line; optional points after a pipe — e.g. Accept | 5"}
          </PopoverDescription>
        </PopoverHeader>
        {criterion.type === "numeric" ? (
          <div className="mt-2 grid grid-cols-2 gap-2">
            <label className="text-xs font-medium text-ink-2">
              Min
              <Input
                type="number"
                value={min}
                onChange={(e) => setMin(e.target.value)}
                className="mt-1"
              />
            </label>
            <label className="text-xs font-medium text-ink-2">
              Max
              <Input
                type="number"
                value={max}
                onChange={(e) => setMax(e.target.value)}
                className="mt-1"
              />
            </label>
          </div>
        ) : (
          <Textarea
            rows={5}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={"Accept | 5\nReject | 0\nMaybe | 2"}
            className="mt-2 font-mono text-xs"
            aria-label="Scored options"
          />
        )}
        <Button
          type="button"
          size="sm"
          variant="primary"
          className="mt-2 w-full"
          onClick={() => {
            if (criterion.type === "numeric") {
              onChange({
                min: min === "" ? null : Number(min),
                max: max === "" ? null : Number(max),
              });
            } else {
              onChange({ optionsText: draft });
            }
            setOpen(false);
          }}
        >
          Done
        </Button>
      </PopoverContent>
    </Popover>
  );
}

function ReviewerPreview({
  anonymize,
  showParticipants,
  showField,
  cardMeta,
  previewFilters,
  instructions,
  criteria,
}: {
  anonymize: boolean;
  showParticipants: boolean;
  showField: (key: string) => boolean;
  cardMeta: readonly string[];
  previewFilters: readonly string[];
  instructions: string;
  criteria: CriterionDraft[];
}) {
  const metaLabel: Record<string, string> = {
    track: PREVIEW.track,
    format: PREVIEW.format,
    level: PREVIEW.level,
    language: PREVIEW.language,
  };

  return (
    <div className="space-y-3 rounded-lg border border-slate-200 bg-[var(--color-paper-2)] p-3">
      {anonymize ? (
        <div className="rounded-md border border-violet-200 bg-violet-50 px-3 py-2 text-xs text-violet-900">
          Blind round — author identity is hidden.
        </div>
      ) : null}

      {instructions.trim() ? (
        <div className="rounded-md border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600">
          {instructions}
        </div>
      ) : null}

      {/* Queue card ------------------------------------------------------ */}
      <div className="rounded-md border border-slate-200 bg-white p-3">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
          Queue card
        </p>
        <p className="mt-1 text-sm font-medium text-slate-900">{PREVIEW.title}</p>
        <div className="mt-1.5 flex flex-wrap gap-1">
          {cardMeta.map((key) => (
            <Chip key={key} tone="slate">
              {metaLabel[key] ?? key}
            </Chip>
          ))}
          {!cardMeta.length ? (
            <span className="text-xs text-slate-400">No card fields selected</span>
          ) : null}
        </div>
        {previewFilters.length ? (
          <p className="mt-2 text-[11px] text-slate-400">
            Filters: {previewFilters.join(" · ")}
          </p>
        ) : (
          <p className="mt-2 text-[11px] text-slate-400">No sidebar filters</p>
        )}
      </div>

      {/* Assignment detail ----------------------------------------------- */}
      <div className="rounded-md border border-slate-200 bg-white p-3">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
          Assignment
        </p>
        <h3 className="mt-1 text-base font-semibold tracking-tight text-slate-900">
          {PREVIEW.title}
        </h3>
        <div className="mt-1.5 flex flex-wrap gap-1">
          {showField("track") ? <Chip tone="slate">{PREVIEW.track}</Chip> : null}
          {showField("format") ? <Chip tone="slate">{PREVIEW.format}</Chip> : null}
          {showField("level") ? <Chip tone="blue">{PREVIEW.level}</Chip> : null}
          {showField("language") ? <Chip tone="slate">{PREVIEW.language}</Chip> : null}
        </div>
        {showField("description") ? (
          <p className="mt-3 text-xs leading-relaxed text-slate-700">{PREVIEW.description}</p>
        ) : null}

        {PREVIEW.answers
          .filter((a) => showField(a.key))
          .map((a) => (
            <div key={a.key} className="mt-3 border-t border-slate-100 pt-2">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                {a.label}
              </p>
              <p className="text-xs text-slate-800">{a.value}</p>
            </div>
          ))}

        <div className="mt-3 border-t border-slate-100 pt-2">
          {anonymize ? (
            <p className="text-xs text-slate-500">
              <strong className="text-slate-700">Speakers hidden.</strong> Author identity is
              not shown in this round.
            </p>
          ) : showParticipants ? (
            <ul className="space-y-1">
              <li className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                Speakers
              </li>
              {PREVIEW.speakers.map((s) => (
                <li key={s.name} className="text-xs text-slate-800">
                  <span className="font-medium">{s.name}</span>
                  <span className="ml-1.5 text-slate-500">{s.meta}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-slate-400">Participant list off — no speakers shown.</p>
          )}
        </div>
      </div>

      {/* Scorecard snippet ----------------------------------------------- */}
      <div className="rounded-md border border-slate-200 bg-white p-3">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
          Scorecard
        </p>
        <ul className="mt-2 space-y-2">
          {criteria
            .filter((c) => c.type !== "separator")
            .slice(0, 4)
            .map((c) => (
              <li key={c.id} className="text-xs text-slate-700">
                <span className="font-medium">{c.label || "Untitled"}</span>
                {c.is_required ? <span className="ml-0.5 text-red-600">*</span> : null}
                <span className="ml-2 text-slate-400">
                  {SCORECARD_TYPE_LABELS[c.type] ?? c.type}
                </span>
              </li>
            ))}
          {!criteria.length ? (
            <li className="text-xs text-slate-400">No criteria yet</li>
          ) : null}
        </ul>
      </div>
    </div>
  );
}
