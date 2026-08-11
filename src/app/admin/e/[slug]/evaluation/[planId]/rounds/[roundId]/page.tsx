import Link from "next/link";
import { notFound } from "next/navigation";

import { requireOrganizer } from "@/lib/guards";
import { readJson } from "@/lib/db";
import { listFields } from "@/lib/repo/forms";
import {
  getPlan,
  getRound,
  listScorecard,
  SCORECARD_TYPE_LABELS,
  SCORECARD_TYPES,
} from "@/lib/repo/evaluations";
import {
  addScorecardQuestionAction,
  deleteRoundAction,
  deleteScorecardQuestionAction,
  updateRoundAction,
  updateScorecardQuestionAction,
} from "@/server/evaluation-actions";
import {
  Button,
  Card,
  CardHeader,
  Chip,
  Field,
  Input,
  LinkButton,
  Notice,
  PageHeader,
  Select,
  Textarea,
} from "@/components/ui";
import { ConfirmSubmit } from "@/components/client/basics";
import { optionsToText, parseOptions } from "@/lib/fields";

export const dynamic = "force-dynamic";

export default async function RoundPage({
  params,
  searchParams,
}: PageProps<"/admin/e/[slug]/evaluation/[planId]/rounds/[roundId]">) {
  const { slug, planId, roundId } = await params;
  const sp = await searchParams;
  const { event } = await requireOrganizer(slug);
  const plan = getPlan(planId);
  const round = getRound(roundId);
  if (!plan || plan.event_id !== event.id || !round || round.plan_id !== plan.id) notFound();

  const card = listScorecard(round.id);
  const sessionFields = listFields(event.id, "session");
  const visibleFields = readJson<string[]>(round.visible_fields, []);
  const cardFields = readJson<string[]>(round.card_fields, []);
  const filterFields = readJson<string[]>(round.filter_fields, []);

  return (
    <div className="max-w-4xl">
      <PageHeader
        breadcrumb={
          <Link href={`/admin/e/${slug}/evaluation/${plan.id}`} className="hover:underline">
            {plan.name}
          </Link>
        }
        title={round.name}
        description="Scorecard, reviewer view configuration and anonymization for this round."
        actions={
          <LinkButton href={`/admin/e/${slug}/evaluation/${plan.id}`}>Back to plan</LinkButton>
        }
      />

      {sp.saved ? <Notice tone="success" className="mb-4">Round saved.</Notice> : null}

      <Card className="mb-5">
        <CardHeader title="Scorecard" description="Reviewers fill this in for each assigned submission." />
        <div className="border-t border-rule">
          <div className="hidden gap-2 border-b border-rule bg-paper-2 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground md:grid md:grid-cols-[minmax(0,1.4fr)_minmax(8rem,0.9fr)_4.5rem_5rem_minmax(0,1.1fr)_auto]">
            <span>Criterion</span>
            <span>Type</span>
            <span>Weight</span>
            <span>Required</span>
            <span>Scored options</span>
            <span className="sr-only">Actions</span>
          </div>

          <ul className="divide-y divide-rule">
            {card.map((question) => (
              <li key={question.id} className="px-4 py-3">
                <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-start">
                  <form
                    action={updateScorecardQuestionAction}
                    className="grid gap-3 md:grid-cols-[minmax(0,1.4fr)_minmax(8rem,0.9fr)_4.5rem_5rem_minmax(0,1.1fr)] md:items-start md:gap-2"
                  >
                    <input type="hidden" name="slug" value={slug} />
                    <input type="hidden" name="question_id" value={question.id} />
                    <label className="block text-xs font-medium text-ink-2">
                      <span className="mb-1 block md:sr-only">Criterion</span>
                      <Input
                        name="label"
                        defaultValue={question.label}
                        className="w-full"
                        aria-label="Criterion label"
                      />
                    </label>
                    <label className="block text-xs font-medium text-ink-2">
                      <span className="mb-1 block md:sr-only">Type</span>
                      <Select
                        name="type"
                        defaultValue={question.type}
                        className="w-full"
                        aria-label="Type"
                      >
                        {SCORECARD_TYPES.map((type) => (
                          <option key={type} value={type}>
                            {SCORECARD_TYPE_LABELS[type]}
                          </option>
                        ))}
                      </Select>
                    </label>
                    <label className="block text-xs font-medium text-ink-2">
                      <span className="mb-1 block md:sr-only">Weight</span>
                      <Input
                        name="weight"
                        type="number"
                        step="0.5"
                        min={0}
                        defaultValue={question.weight}
                        className="w-full"
                        aria-label="Weight"
                      />
                    </label>
                    <label className="flex items-center gap-2 text-sm text-ink md:pt-2">
                      <input
                        type="checkbox"
                        name="is_required"
                        defaultChecked={Boolean(question.is_required)}
                      />
                      Required
                    </label>
                    <div className="md:col-span-2">
                      <label
                        htmlFor={`options-${question.id}`}
                        className="mb-1 block text-xs font-medium text-ink-2"
                      >
                        Scored options
                      </label>
                      <Input
                        id={`options-${question.id}`}
                        name="options"
                        defaultValue={optionsToText(parseOptions(question.options)).replace(
                          /\n/g,
                          " | ",
                        )}
                        placeholder="Accept | 5"
                        className="w-full"
                      />
                      <p className="mt-1 text-[11px] text-muted-foreground">
                        For scored dropdown criteria. Label | points, separated by pipes.
                      </p>
                    </div>
                    <div className="md:col-span-3">
                      <Button type="submit" size="sm">
                        Save
                      </Button>
                    </div>
                  </form>
                  <form action={deleteScorecardQuestionAction} className="md:pt-1">
                    <input type="hidden" name="slug" value={slug} />
                    <input type="hidden" name="question_id" value={question.id} />
                    <ConfirmSubmit message={`Delete "${question.label}"?`} variant="danger">
                      Delete
                    </ConfirmSubmit>
                  </form>
                </div>
                {question.weight === 0 ? (
                  <p className="mt-2 text-xs text-muted-foreground">
                    Weight 0 — collected but excluded from the aggregate score.
                  </p>
                ) : null}
              </li>
            ))}
            {!card.length ? (
              <li className="px-4 py-4 text-center text-sm text-muted-foreground">
                No criteria yet.
              </li>
            ) : null}
          </ul>
        </div>

        <form
          action={addScorecardQuestionAction}
          className="grid gap-3 border-t border-rule p-4 md:grid-cols-[minmax(0,1.4fr)_minmax(8rem,0.9fr)_4.5rem_5rem_minmax(0,1.1fr)_auto] md:items-end"
        >
          <input type="hidden" name="slug" value={slug} />
          <input type="hidden" name="round_id" value={round.id} />
          <div>
            <label htmlFor="label" className="block text-xs font-medium text-ink-2">
              Add criterion
            </label>
            <Input id="label" name="label" placeholder="Originality" className="w-full" required />
          </div>
          <div>
            <label htmlFor="add-type" className="block text-xs font-medium text-ink-2">
              Type
            </label>
            <Select id="add-type" name="type" defaultValue="scale_1_5" className="w-full">
              {SCORECARD_TYPES.map((type) => (
                <option key={type} value={type}>
                  {SCORECARD_TYPE_LABELS[type]}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <label htmlFor="add-weight" className="block text-xs font-medium text-ink-2">
              Weight
            </label>
            <Input
              id="add-weight"
              name="weight"
              type="number"
              step="0.5"
              min={0}
              defaultValue={1}
              className="w-full"
            />
          </div>
          <label className="flex items-center gap-2 pb-2 text-sm text-ink">
            <input type="checkbox" name="is_required" defaultChecked /> Required
          </label>
          <div>
            <label htmlFor="add-options" className="block text-xs font-medium text-ink-2">
              Scored options
            </label>
            <Input
              id="add-options"
              name="options"
              placeholder="Accept | 5"
              className="w-full"
            />
            <p className="mt-1 text-[11px] text-muted-foreground">
              For scored dropdown criteria.
            </p>
          </div>
          <Button type="submit" variant="primary">
            Add
          </Button>
        </form>
      </Card>

      <Card>
        <CardHeader
          title="Round settings and reviewer view"
          description="Control the window, anonymization, and exactly which submission fields reviewers can see."
        />
        <form action={updateRoundAction} className="space-y-4 p-4">
          <input type="hidden" name="slug" value={slug} />
          <input type="hidden" name="round_id" value={round.id} />
          <div className="grid gap-3 sm:grid-cols-3">
            <Field label="Name" name="name" required>
              <Input id="name" name="name" defaultValue={round.name} required />
            </Field>
            <Field label="Opens" name="opens_at">
              <Input
                id="opens_at"
                name="opens_at"
                type="datetime-local"
                defaultValue={round.opens_at ?? ""}
              />
            </Field>
            <Field label="Closes" name="closes_at">
              <Input
                id="closes_at"
                name="closes_at"
                type="datetime-local"
                defaultValue={round.closes_at ?? ""}
              />
            </Field>
          </div>
          <Field label="Instructions" name="instructions">
            <Textarea
              id="instructions"
              name="instructions"
              rows={3}
              defaultValue={round.instructions ?? ""}
            />
          </Field>

          <fieldset className="space-y-2 rounded-input border border-rule p-3">
            <legend className="px-1 text-sm font-medium text-ink">Anonymization</legend>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="anonymize" defaultChecked={Boolean(round.anonymize)} />
              Anonymize — hide author and co-author identity from reviewers in this round
              {round.anonymize ? <Chip tone="violet">on</Chip> : null}
            </label>
            <div className="ml-6 border-l border-rule pl-3">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  name="show_participants"
                  defaultChecked={Boolean(round.show_participants)}
                />
                Show the participant list
              </label>
              <p className="mt-1 text-xs text-muted-foreground">
                Used only when anonymization is off. The preference is kept while anonymization is
                enabled.
              </p>
            </div>
          </fieldset>

          <fieldset className="rounded-input border border-rule p-3">
            <legend className="px-1 text-sm font-medium text-ink">Reviewer view</legend>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Visible fields
                </p>
                <div className="max-h-48 space-y-1 overflow-y-auto">
                  {sessionFields.map((field) => (
                    <label key={field.id} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        name="visible_fields"
                        value={field.key}
                        defaultChecked={!visibleFields.length || visibleFields.includes(field.key)}
                      />
                      {field.label}
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Card fields (max 3)
                </p>
                <div className="max-h-48 space-y-1 overflow-y-auto">
                  {sessionFields.map((field) => (
                    <label key={field.id} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        name="card_fields"
                        value={field.key}
                        defaultChecked={cardFields.includes(field.key)}
                      />
                      {field.label}
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Filterable
                </p>
                <div className="max-h-48 space-y-1 overflow-y-auto">
                  {["track", "format", "level", "language"].map((key) => (
                    <label key={key} className="flex items-center gap-2 text-sm capitalize">
                      <input
                        type="checkbox"
                        name="filter_fields"
                        value={key}
                        defaultChecked={!filterFields.length || filterFields.includes(key)}
                      />
                      {key}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </fieldset>

          <Button type="submit" variant="primary">
            Save round
          </Button>
        </form>
        <form action={deleteRoundAction} className="border-t border-rule p-4">
          <input type="hidden" name="slug" value={slug} />
          <input type="hidden" name="round_id" value={round.id} />
          <ConfirmSubmit message={`Delete the round "${round.name}"?`}>Delete round</ConfirmSubmit>
        </form>
      </Card>
    </div>
  );
}
