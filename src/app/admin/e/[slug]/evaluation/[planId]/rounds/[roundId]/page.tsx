import Link from "next/link";
import { notFound } from "next/navigation";

import { requireOrganizer } from "@/lib/guards";
import { readJson } from "@/lib/db";
import { listFields } from "@/lib/repo/forms";
import { getPlan, getRound, listScorecard } from "@/lib/repo/evaluations";
import { RoundEditor } from "@/components/admin/round-editor";
import { LinkButton, Notice, PageHeader } from "@/components/ui";

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
    <div className="max-w-6xl">
      <PageHeader
        breadcrumb={
          <Link href={`/admin/e/${slug}/evaluation/${plan.id}`} className="hover:underline">
            {plan.name}
          </Link>
        }
        title={round.name}
        description="Scorecard, privacy, and the exact reviewer experience for this round."
        actions={
          <LinkButton href={`/admin/e/${slug}/evaluation/${plan.id}`}>Back to plan</LinkButton>
        }
      />

      {sp.saved ? (
        <Notice tone="success" className="mb-4">
          Changes saved.
        </Notice>
      ) : null}

      <RoundEditor
        slug={slug}
        planId={plan.id}
        roundId={round.id}
        roundName={round.name}
        opensAt={round.opens_at ?? ""}
        closesAt={round.closes_at ?? ""}
        instructions={round.instructions ?? ""}
        anonymize={Boolean(round.anonymize)}
        showParticipants={Boolean(round.show_participants)}
        visibleFields={visibleFields}
        cardFields={cardFields}
        filterFields={filterFields}
        scorecard={card.map((q) => ({
          id: q.id,
          label: q.label,
          type: q.type,
          weight: q.weight,
          is_required: q.is_required,
          options: q.options,
          min: q.min,
          max: q.max,
        }))}
        sessionFields={sessionFields.map((f) => ({ key: f.key, label: f.label }))}
      />
    </div>
  );
}
