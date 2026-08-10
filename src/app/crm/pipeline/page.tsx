import { requireAnyOrganizer } from "@/lib/guards";
import { listPipeline, listEvents as listPipelineEvents, PIPELINE_STAGES } from "@/lib/repo/crm";
import {
  addPipelineNoteAction,
  moveStageAction,
  removeEntryAction,
} from "@/server/crm-actions";
import { PipelineBoard } from "@/components/crm/pipeline-board";
import { Card, CardHeader, LinkButton, Notice, PageHeader, Textarea, Button } from "@/components/ui";
import { formatStamp } from "@/lib/datetime";

export const dynamic = "force-dynamic";

export default async function PipelinePage({ searchParams }: PageProps<"/crm/pipeline">) {
  const sp = await searchParams;
  const { event } = await requireAnyOrganizer();
  const cards = listPipeline(event.org_id);
  const openId = typeof sp.card === "string" ? sp.card : null;
  const open = openId ? cards.find((card) => card.id === openId) : null;
  const timeline = open ? listPipelineEvents(open.id) : [];

  return (
    <div>
      <PageHeader
        title="Sourcing pipeline"
        description="Who you are chasing for the next event. Drag a card between stages — every move is timestamped."
        actions={<LinkButton href="/crm/contacts">Directory</LinkButton>}
      />

      {sp.enrolled ? (
        <Notice tone="success" className="mb-4">
          Contacts enrolled in the pipeline.
        </Notice>
      ) : null}

      <PipelineBoard
        stages={PIPELINE_STAGES.map((stage) => ({ key: stage.key, label: stage.label }))}
        cards={cards.map((card) => ({
          id: card.id,
          stage: card.stage,
          name: `${card.first_name} ${card.last_name}`,
          company: card.company,
          jobTitle: card.job_title,
          score: card.score,
          rationale: card.rationale,
          contactId: card.contact_id,
        }))}
        moveStageAction={moveStageAction}
        removeEntryAction={removeEntryAction}
      />

      {open ? (
        <Card className="mt-6">
          <CardHeader
            title={`${open.first_name} ${open.last_name}`}
            description={[open.job_title, open.company].filter(Boolean).join(", ")}
            actions={<LinkButton href="/crm/pipeline" size="sm">Close</LinkButton>}
          />
          <div className="grid gap-4 p-4 md:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Stage history
              </p>
              <ul className="mt-2 space-y-2 text-sm">
                {timeline.map((item) => (
                  <li key={item.id}>
                    {item.kind === "note" ? (
                      <p className="rounded-md bg-slate-50 px-2 py-1.5 text-slate-800">{item.body}</p>
                    ) : (
                      <p className="text-slate-700">
                        {item.from_stage ? `${item.from_stage} → ` : "enrolled at "}
                        <strong>{item.to_stage}</strong>
                      </p>
                    )}
                    <p className="text-xs text-slate-400">
                      {item.actor_name} · {formatStamp(item.created_at)}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <form action={addPipelineNoteAction} className="space-y-2">
                <input type="hidden" name="entry_id" value={open.id} />
                <label htmlFor="body" className="block text-xs font-medium text-slate-600">
                  Add an internal note
                </label>
                <Textarea id="body" name="body" rows={3} required />
                <Button type="submit" size="sm" variant="primary">
                  Save note
                </Button>
              </form>
              <LinkButton href={`/crm/contacts/${open.contact_id}`} size="sm" className="mt-3">
                Open full profile
              </LinkButton>
            </div>
          </div>
        </Card>
      ) : null}
    </div>
  );
}
