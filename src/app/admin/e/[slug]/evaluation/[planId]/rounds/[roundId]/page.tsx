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
  Table,
  Td,
  Textarea,
  Th,
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
        <Table className="rounded-none border-0">
          <thead>
            <tr>
              <Th>Criterion</Th>
              <Th>Type</Th>
              <Th>Weight</Th>
              <Th>Required</Th>
              <Th>Options</Th>
              <Th />
            </tr>
          </thead>
          <tbody>
            {card.map((question) => (
              <tr key={question.id}>
                <Td colSpan={5}>
                  <form
                    action={updateScorecardQuestionAction}
                    className="flex flex-wrap items-center gap-2"
                  >
                    <input type="hidden" name="slug" value={slug} />
                    <input type="hidden" name="question_id" value={question.id} />
                    <Input
                      name="label"
                      defaultValue={question.label}
                      className="w-52"
                      aria-label="Criterion label"
                    />
                    <Select
                      name="type"
                      defaultValue={question.type}
                      className="w-44"
                      aria-label="Type"
                    >
                      {SCORECARD_TYPES.map((type) => (
                        <option key={type} value={type}>
                          {SCORECARD_TYPE_LABELS[type]}
                        </option>
                      ))}
                    </Select>
                    <label className="flex items-center gap-1 text-xs text-slate-600">
                      Weight
                      <Input
                        name="weight"
                        type="number"
                        step="0.5"
                        min={0}
                        defaultValue={question.weight}
                        className="w-20"
                        aria-label="Weight"
                      />
                    </label>
                    <label className="flex items-center gap-1 text-xs text-slate-600">
                      <input
                        type="checkbox"
                        name="is_required"
                        defaultChecked={Boolean(question.is_required)}
                      />
                      required
                    </label>
                    <Input
                      name="options"
                      defaultValue={optionsToText(parseOptions(question.options)).replace(/\n/g, " | ")}
                      placeholder="Accept | 5"
                      className="w-52"
                      aria-label="Options"
                    />
                    <Button type="submit" size="sm">
                      Save
                    </Button>
                  </form>
                  {question.weight === 0 ? (
                    <p className="mt-1 text-xs text-slate-400">
                      Weight 0 — collected but excluded from the aggregate score.
                    </p>
                  ) : null}
                </Td>
                <Td>
                  <form action={deleteScorecardQuestionAction}>
                    <input type="hidden" name="slug" value={slug} />
                    <input type="hidden" name="question_id" value={question.id} />
                    <ConfirmSubmit message={`Delete "${question.label}"?`} variant="ghost">
                      Delete
                    </ConfirmSubmit>
                  </form>
                </Td>
              </tr>
            ))}
            {!card.length ? (
              <tr>
                <Td colSpan={6} className="py-4 text-center text-slate-500">
                  No criteria yet.
                </Td>
              </tr>
            ) : null}
          </tbody>
        </Table>
        <form
          action={addScorecardQuestionAction}
          className="flex flex-wrap items-end gap-2 border-t border-slate-200 p-4"
        >
          <input type="hidden" name="slug" value={slug} />
          <input type="hidden" name="round_id" value={round.id} />
          <div>
            <label htmlFor="label" className="block text-xs font-medium text-slate-600">
              Add criterion
            </label>
            <Input id="label" name="label" placeholder="Originality" className="w-52" required />
          </div>
          <Select name="type" defaultValue="scale_1_5" className="w-44" aria-label="Type">
            {SCORECARD_TYPES.map((type) => (
              <option key={type} value={type}>
                {SCORECARD_TYPE_LABELS[type]}
              </option>
            ))}
          </Select>
          <Input
            name="weight"
            type="number"
            step="0.5"
            min={0}
            defaultValue={1}
            className="w-20"
            aria-label="Weight"
          />
          <Input
            name="options"
            placeholder="Accept | 5"
            className="w-52"
            aria-label="Options with points"
          />
          <label className="flex items-center gap-1 pb-2 text-xs text-slate-600">
            <input type="checkbox" name="is_required" defaultChecked /> required
          </label>
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
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="anonymize" defaultChecked={Boolean(round.anonymize)} />
            Anonymize — hide author and co-author identity from reviewers in this round
            {round.anonymize ? <Chip tone="violet">on</Chip> : null}
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="show_participants"
              defaultChecked={Boolean(round.show_participants)}
            />
            Show the participant list (ignored while anonymization is on)
          </label>

          <fieldset className="rounded-md border border-slate-200 p-3">
            <legend className="px-1 text-sm font-medium text-slate-700">Reviewer view</legend>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
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
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
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
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
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
        <form action={deleteRoundAction} className="border-t border-slate-200 p-4">
          <input type="hidden" name="slug" value={slug} />
          <input type="hidden" name="round_id" value={round.id} />
          <ConfirmSubmit message={`Delete the round "${round.name}"?`}>Delete round</ConfirmSubmit>
        </form>
      </Card>
    </div>
  );
}
