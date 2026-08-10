import Link from "next/link";

import { requireOrganizer } from "@/lib/guards";
import { listPlans, listRounds, planProgress } from "@/lib/repo/evaluations";
import { createPlanAction } from "@/server/evaluation-actions";
import {
  Button,
  Card,
  CardHeader,
  Chip,
  Field,
  Input,
  PageHeader,
  Progress,
  Select,
  Textarea,
} from "@/components/ui";
import { formatDate } from "@/lib/datetime";

export const dynamic = "force-dynamic";

export default async function EvaluationIndex({ params }: PageProps<"/admin/e/[slug]/evaluation">) {
  const { slug } = await params;
  const { event } = await requireOrganizer(slug);
  const plans = listPlans(event.id);

  return (
    <div>
      <PageHeader
        title="Evaluation"
        description="Plans, rounds, scorecards and reviewer assignments. Reviewers only ever see the submissions you assign them."
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {plans.map((plan) => {
            const rounds = listRounds(plan.id);
            const progress = planProgress(plan.id);
            return (
              <Card key={plan.id}>
                <CardHeader
                  title={
                    <Link
                      href={`/admin/e/${slug}/evaluation/${plan.id}`}
                      className="hover:text-brand-700"
                    >
                      {plan.name}
                    </Link>
                  }
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
                    </>
                  }
                />
                <div className="px-4 py-3">
                  <div className="flex items-center justify-between text-xs text-slate-500">
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
                  <ul className="mt-3 space-y-1">
                    {rounds.map((round) => (
                      <li key={round.id} className="flex items-center justify-between text-sm">
                        <Link
                          href={`/admin/e/${slug}/evaluation/${plan.id}/rounds/${round.id}`}
                          className="text-slate-700 hover:text-brand-700"
                        >
                          {round.name}
                        </Link>
                        <span className="text-xs text-slate-500">
                          {round.opens_at ? formatDate(round.opens_at) : "—"} –{" "}
                          {round.closes_at ? formatDate(round.closes_at) : "—"}
                          {round.anonymize ? " · anonymized" : ""}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Card>
            );
          })}
          {!plans.length ? (
            <Card className="p-8 text-center text-sm text-slate-500">
              No evaluation plans yet. Create one on the right to start reviewing.
            </Card>
          ) : null}
        </div>

        <Card className="h-fit">
          <CardHeader title="New evaluation plan" />
          <form action={createPlanAction} className="space-y-3 p-4">
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
            <Field label="Mode" name="mode" hint="Funnel promotes between rounds; parallel reviews everything.">
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
        </Card>
      </div>
    </div>
  );
}
