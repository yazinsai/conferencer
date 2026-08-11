import Link from "next/link";

import { requireOrganizer } from "@/lib/guards";
import { listPlans, listRounds, planProgress } from "@/lib/repo/evaluations";
import { listSubmissions } from "@/lib/repo/submissions";
import { aiScoreAction, createPlanAction } from "@/server/evaluation-actions";
import {
  Button,
  Card,
  CardHeader,
  Chip,
  Field,
  Input,
  PageHeader,
  Notice,
  Progress,
  Select,
  Textarea,
} from "@/components/ui";
import { formatDate } from "@/lib/datetime";

export const dynamic = "force-dynamic";

export default async function EvaluationIndex({
  params,
  searchParams,
}: PageProps<"/admin/e/[slug]/evaluation">) {
  const { slug } = await params;
  const sp = await searchParams;
  const { event } = await requireOrganizer(slug);
  const plans = listPlans(event.id);
  const aiScored = listSubmissions(event.id, { limit: 500 }).filter(
    (row) => row.ai_score !== null && row.ai_score !== undefined,
  );

  // Prefer an open plan with the most remaining work; fall back to the first plan.
  const leadPlan =
    [...plans]
      .map((plan) => ({ plan, progress: planProgress(plan.id) }))
      .sort((a, b) => {
        const aOpen = a.plan.is_open ? 1 : 0;
        const bOpen = b.plan.is_open ? 1 : 0;
        if (aOpen !== bOpen) return bOpen - aOpen;
        const aLeft = a.progress.assigned - a.progress.complete;
        const bLeft = b.progress.assigned - b.progress.complete;
        return bLeft - aLeft;
      })[0] ?? null;

  return (
    <div>
      <PageHeader
        title="Evaluation"
        description="Plans, rounds, scorecards and reviewer assignments. Reviewers only ever see the submissions you assign them."
      />

      {sp.ai ? (
        <Notice tone="success" className="mb-4">
          AI triage scored {String(sp.ai)} submission(s). Scores are labelled as AI and can be
          overridden by a human on each submission.
        </Notice>
      ) : null}

      {leadPlan ? (
        <section className="mb-5 rounded-card border border-rule bg-paper px-4 py-4 shadow-[var(--shadow-card)]">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="wordmark text-[0.6875rem] uppercase tracking-[0.12em] text-muted-foreground">
                {plans.length > 1 ? `Focus · ${leadPlan.plan.name}` : "Review progress"}
              </p>
              <p className="mt-1 flex items-baseline gap-2">
                <span className="wordmark tnum display text-3xl text-ink">
                  {leadPlan.progress.complete}
                </span>
                <span className="text-sm text-muted-foreground">
                  of {leadPlan.progress.assigned} reviews complete
                </span>
              </p>
            </div>
            <p className="text-xs text-muted-foreground">
              {leadPlan.plan.opens_at ? formatDate(leadPlan.plan.opens_at) : "—"} →{" "}
              {leadPlan.plan.closes_at ? formatDate(leadPlan.plan.closes_at) : "—"}
            </p>
          </div>
          <div className="mt-2 max-w-md">
            <Progress
              value={leadPlan.progress.complete}
              max={Math.max(leadPlan.progress.assigned, 1)}
            />
          </div>
        </section>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {plans.map((plan) => {
            const rounds = listRounds(plan.id);
            const progress = planProgress(plan.id);
            return (
              <Card key={plan.id}>
                <CardHeader
                  title={plan.name}
                  description={`${rounds.length} round${rounds.length === 1 ? "" : "s"} · ${
                    progress.reviewers
                  } reviewers · ${progress.submissions} submissions`}
                  actions={
                    <>
                      <Chip tone={plan.is_open ? "green" : "slate"}>
                        {plan.is_open ? "Open" : "Closed"}
                      </Chip>
                      <Chip tone="slate">{plan.mode}</Chip>
                      {plan.anonymize ? <Chip tone="violet">Blind</Chip> : null}
                      <Link
                        href={`/admin/e/${slug}/evaluation/${plan.id}`}
                        className="text-sm font-medium text-ink underline decoration-rule-2 underline-offset-2 hover:decoration-ink"
                      >
                        Open plan →
                      </Link>
                    </>
                  }
                />
                <div className="px-4 py-3">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>
                      {progress.complete} of {progress.assigned} reviews complete
                    </span>
                    <span>
                      {plan.opens_at ? formatDate(plan.opens_at) : "—"} →{" "}
                      {plan.closes_at ? formatDate(plan.closes_at) : "—"}
                    </span>
                  </div>
                  <div className="mt-1">
                    <Progress value={progress.complete} max={Math.max(progress.assigned, 1)} />
                  </div>
                  <ul className="mt-3 divide-y divide-rule border-t border-rule">
                    {rounds.map((round) => (
                      <li key={round.id}>
                        <Link
                          href={`/admin/e/${slug}/evaluation/${plan.id}/rounds/${round.id}`}
                          className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-1 py-2 text-sm text-ink-2 hover:bg-paper-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
                        >
                          <span className="font-medium">{round.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {round.opens_at ? formatDate(round.opens_at) : "—"} –{" "}
                            {round.closes_at ? formatDate(round.closes_at) : "—"}
                            {round.anonymize ? " · anonymized" : ""}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </Card>
            );
          })}
          {!plans.length ? (
            <Card className="p-8 text-center text-sm text-muted-foreground">
              No evaluation plans yet. Create one on the right to start reviewing.
            </Card>
          ) : null}
        </div>

        <div className="space-y-4">
          <Card className="h-fit">
            <CardHeader
              title="AI first-pass triage"
              description="Scores pending abstracts 1–5 with written reasoning, so the committee can start from a shortlist. Human scores always win."
            />
            <form action={aiScoreAction} className="space-y-2 p-4">
              <input type="hidden" name="slug" value={slug} />
              <p className="text-xs text-muted-foreground">
                {aiScored.length
                  ? `${aiScored.length} submission(s) already carry an AI score.`
                  : "No AI scores yet."}{" "}
                Uses OpenAI when OPENAI_API_KEY is set, otherwise a transparent local rubric that
                reads the abstract.
              </p>
              <Button type="submit" variant="secondary" className="w-full">
                Run AI triage on pending submissions
              </Button>
            </form>
            {aiScored.length ? (
              <ul className="max-h-64 divide-y divide-rule overflow-y-auto">
                {aiScored.slice(0, 8).map((row) => (
                  <li key={row.id} className="px-4 py-2 text-sm">
                    <Link
                      href={`/admin/e/${slug}/submissions/${row.id}`}
                      className="font-medium text-ink hover:underline"
                    >
                      {row.title}
                    </Link>
                    <span className="ml-2">
                      <Chip tone="violet">AI {row.ai_score?.toFixed(1)}</Chip>
                      {row.ai_override_score !== null && row.ai_override_score !== undefined ? (
                        <Chip tone="green" className="ml-1">
                          Human {row.ai_override_score.toFixed(1)}
                        </Chip>
                      ) : null}
                    </span>
                  </li>
                ))}
              </ul>
            ) : null}
          </Card>

          <details
            className="rounded-card border border-rule bg-paper shadow-[var(--shadow-card)] open:pb-0"
            open={!plans.length}
          >
            <summary className="cursor-pointer list-none px-4 py-3 text-sm font-medium text-ink marker:content-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus [&::-webkit-details-marker]:hidden">
              Create evaluation plan
            </summary>
            <form action={createPlanAction} className="space-y-3 border-t border-rule p-4">
              <input type="hidden" name="slug" value={slug} />
              <Field label="Name" name="name" required>
                <Input id="name" name="name" defaultValue="Program Committee Review" required />
              </Field>
              <Field label="Instructions for reviewers" name="instructions">
                <Textarea id="instructions" name="instructions" rows={3} />
              </Field>
              <div className="grid grid-cols-2 gap-2">
                <Field label="Opens" name="opens_at">
                  <Input id="opens_at" name="opens_at" type="datetime-local" />
                </Field>
                <Field label="Closes" name="closes_at">
                  <Input id="closes_at" name="closes_at" type="datetime-local" />
                </Field>
              </div>
              <Field
                label="Mode"
                name="mode"
                hint="Funnel promotes between rounds; parallel reviews everything."
              >
                <Select id="mode" name="mode" defaultValue="parallel">
                  <option value="parallel">Parallel</option>
                  <option value="funnel">Funnel</option>
                </Select>
              </Field>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="anonymize" /> Anonymize submissions for reviewers
              </label>
              <Button type="submit" variant="primary" className="w-full">
                Create plan
              </Button>
            </form>
          </details>
        </div>
      </div>
    </div>
  );
}
