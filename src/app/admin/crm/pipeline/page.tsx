import { desc, eq, inArray } from "drizzle-orm";
import { requireCrmAccess } from "@/lib/auth/crm-guards";
import { listPipelineCards } from "@/lib/crm/queries";
import { CRM_PIPELINE_STAGES, type CrmPipelineStage } from "@/lib/crm/types";
import { getDb, schema } from "@/lib/db";
import { PipelineKanban } from "../components/pipeline-kanban";

export default async function CrmPipelinePage() {
  const { orgId } = await requireCrmAccess();
  const db = getDb();

  const allCards = listPipelineCards(orgId);
  const cardsByStage = Object.fromEntries(
    CRM_PIPELINE_STAGES.map((stage) => [stage, [] as typeof allCards]),
  ) as Record<CrmPipelineStage, typeof allCards>;

  for (const row of allCards) {
    const stage = row.card.stage as CrmPipelineStage;
    if (cardsByStage[stage]) {
      cardsByStage[stage].push(row);
    }
  }

  const kanbanCards = Object.fromEntries(
    CRM_PIPELINE_STAGES.map((stage) => [
      stage,
      cardsByStage[stage].map(({ card, contact }) => ({
        id: card.id,
        stage: card.stage,
        contactId: contact.id,
        firstName: contact.firstName,
        lastName: contact.lastName,
        email: contact.email,
        company: contact.company,
        jobTitle: contact.jobTitle,
      })),
    ]),
  ) as Record<
    CrmPipelineStage,
    Array<{
      id: string;
      stage: string;
      contactId: string;
      firstName: string;
      lastName: string;
      email: string;
      company: string | null;
      jobTitle: string | null;
    }>
  >;

  const contactIds = allCards.map((r) => r.contact.id);
  const cardIds = allCards.map((r) => r.card.id);

  const notes =
    contactIds.length > 0
      ? db
          .select({
            note: schema.crmNotes,
            author: schema.users,
          })
          .from(schema.crmNotes)
          .innerJoin(schema.users, eq(schema.crmNotes.authorUserId, schema.users.id))
          .where(inArray(schema.crmNotes.contactId, contactIds))
          .orderBy(desc(schema.crmNotes.createdAt))
          .all()
      : [];

  const history =
    cardIds.length > 0
      ? db
          .select({
            entry: schema.crmStageHistory,
            actor: schema.users,
          })
          .from(schema.crmStageHistory)
          .innerJoin(schema.users, eq(schema.crmStageHistory.actorUserId, schema.users.id))
          .where(inArray(schema.crmStageHistory.cardId, cardIds))
          .orderBy(desc(schema.crmStageHistory.createdAt))
          .all()
      : [];

  const notesByContact: Record<
    string,
    Array<{ id: string; body: string; createdAt: string; authorName: string }>
  > = {};
  for (const { note, author } of notes) {
    const list = notesByContact[note.contactId] ?? [];
    list.push({
      id: note.id,
      body: note.body,
      createdAt: note.createdAt,
      authorName: `${author.firstName} ${author.lastName}`,
    });
    notesByContact[note.contactId] = list;
  }

  const historyByCard: Record<
    string,
    Array<{
      id: string;
      fromStage: string | null;
      toStage: string;
      createdAt: string;
      actorName: string;
    }>
  > = {};
  for (const { entry, actor } of history) {
    const list = historyByCard[entry.cardId] ?? [];
    list.push({
      id: entry.id,
      fromStage: entry.fromStage,
      toStage: entry.toStage,
      createdAt: entry.createdAt,
      actorName: `${actor.firstName} ${actor.lastName}`,
    });
    historyByCard[entry.cardId] = list;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Pipeline</h1>
        <p className="text-slate-600">
          Drag cards between stages or use quick-move buttons. Click a card for notes and history.
        </p>
      </div>

      <PipelineKanban
        cardsByStage={kanbanCards}
        notesByContact={notesByContact}
        historyByCard={historyByCard}
      />
    </div>
  );
}
