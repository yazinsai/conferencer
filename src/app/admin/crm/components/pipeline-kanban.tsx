"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { movePipelineStageAction } from "../actions";
import {
  CRM_PIPELINE_STAGES,
  CRM_STAGE_LABELS,
  type CrmPipelineStage,
} from "@/lib/crm/types";

type Card = {
  id: string;
  stage: string;
  contactId: string;
  firstName: string;
  lastName: string;
  email: string;
  company: string | null;
  jobTitle: string | null;
};

type Note = {
  id: string;
  body: string;
  createdAt: string;
  authorName: string;
};

type HistoryEntry = {
  id: string;
  fromStage: string | null;
  toStage: string;
  createdAt: string;
  actorName: string;
};

const STAGE_COLORS: Record<CrmPipelineStage, string> = {
  researching: "border-t-violet-500",
  contacted: "border-t-blue-500",
  in_discussion: "border-t-amber-500",
  confirmed: "border-t-emerald-500",
  declined: "border-t-rose-500",
};

export function PipelineKanban({
  cardsByStage,
  notesByContact,
  historyByCard,
}: {
  cardsByStage: Record<CrmPipelineStage, Card[]>;
  notesByContact: Record<string, Note[]>;
  historyByCard: Record<string, HistoryEntry[]>;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [dragCardId, setDragCardId] = useState<string | null>(null);

  const selectedCard = selectedCardId
    ? CRM_PIPELINE_STAGES.flatMap((s) => cardsByStage[s]).find((c) => c.id === selectedCardId)
    : null;

  function moveCard(cardId: string, toStage: CrmPipelineStage) {
    startTransition(async () => {
      const fd = new FormData();
      fd.set("cardId", cardId);
      fd.set("toStage", toStage);
      await movePipelineStageAction(fd);
      router.refresh();
    });
  }

  function onDrop(stage: CrmPipelineStage) {
    if (dragCardId) {
      moveCard(dragCardId, stage);
      setDragCardId(null);
    }
  }

  return (
    <div className="flex gap-4">
      <div className="min-w-0 flex-1 overflow-x-auto">
        <div className="flex min-w-max gap-3 pb-4">
          {CRM_PIPELINE_STAGES.map((stage) => (
            <div
              key={stage}
              className="w-64 shrink-0"
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => onDrop(stage)}
            >
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-700">
                  {CRM_STAGE_LABELS[stage]}
                </h3>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                  {cardsByStage[stage].length}
                </span>
              </div>
              <div className="space-y-2 rounded-lg bg-slate-50 p-2 min-h-[200px]">
                {cardsByStage[stage].map((card) => (
                  <div
                    key={card.id}
                    draggable
                    onDragStart={() => setDragCardId(card.id)}
                    onDragEnd={() => setDragCardId(null)}
                    className={`cursor-grab rounded-lg border border-slate-200 border-t-4 bg-white p-3 shadow-sm active:cursor-grabbing ${STAGE_COLORS[stage]} ${selectedCardId === card.id ? "ring-2 ring-blue-500" : ""}`}
                  >
                    <button
                      type="button"
                      onClick={() => setSelectedCardId(card.id)}
                      className="w-full text-left"
                    >
                      <div className="font-medium text-slate-900">
                        {card.firstName} {card.lastName}
                      </div>
                      <div className="text-xs text-slate-500">{card.email}</div>
                      {card.company ? (
                        <div className="mt-1 text-xs text-slate-600">{card.company}</div>
                      ) : null}
                    </button>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {CRM_PIPELINE_STAGES.filter((s) => s !== stage).map((s) => (
                        <button
                          key={s}
                          type="button"
                          disabled={pending}
                          onClick={() => moveCard(card.id, s)}
                          className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-600 hover:bg-slate-200 disabled:opacity-50"
                          title={`Move to ${CRM_STAGE_LABELS[s]}`}
                        >
                          → {CRM_STAGE_LABELS[s]}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedCard ? (
        <aside className="w-80 shrink-0 rounded-lg border border-slate-200 bg-white p-4">
          <div className="mb-4 flex items-start justify-between gap-2">
            <div>
              <h3 className="font-semibold text-slate-900">
                {selectedCard.firstName} {selectedCard.lastName}
              </h3>
              <p className="text-sm text-slate-500">{selectedCard.email}</p>
              {selectedCard.jobTitle || selectedCard.company ? (
                <p className="mt-1 text-xs text-slate-600">
                  {[selectedCard.jobTitle, selectedCard.company].filter(Boolean).join(" · ")}
                </p>
              ) : null}
            </div>
            <button
              type="button"
              onClick={() => setSelectedCardId(null)}
              className="text-slate-400 hover:text-slate-600"
            >
              ✕
            </button>
          </div>

          <Link
            href={`/admin/crm/contacts/${selectedCard.contactId}`}
            className="mb-4 block text-sm text-blue-700 hover:underline"
          >
            View full profile →
          </Link>

          <div className="mb-4">
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Stage history
            </h4>
            <ul className="max-h-40 space-y-2 overflow-y-auto text-sm">
              {(historyByCard[selectedCard.id] ?? []).length === 0 ? (
                <li className="text-slate-500">No stage changes yet.</li>
              ) : (
                (historyByCard[selectedCard.id] ?? []).map((h) => (
                  <li key={h.id} className="rounded bg-slate-50 p-2">
                    <div className="text-xs text-slate-500">
                      {new Date(h.createdAt).toLocaleString()} · {h.actorName}
                    </div>
                    <div>
                      {h.fromStage ? CRM_STAGE_LABELS[h.fromStage as CrmPipelineStage] ?? h.fromStage : "—"}{" "}
                      → {CRM_STAGE_LABELS[h.toStage as CrmPipelineStage] ?? h.toStage}
                    </div>
                  </li>
                ))
              )}
            </ul>
          </div>

          <div>
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Notes
            </h4>
            <ul className="max-h-48 space-y-2 overflow-y-auto text-sm">
              {(notesByContact[selectedCard.contactId] ?? []).length === 0 ? (
                <li className="text-slate-500">No notes yet.</li>
              ) : (
                (notesByContact[selectedCard.contactId] ?? []).map((n) => (
                  <li key={n.id} className="rounded bg-slate-50 p-2">
                    <div className="text-xs text-slate-500">
                      {new Date(n.createdAt).toLocaleString()} · {n.authorName}
                    </div>
                    <p className="mt-1 whitespace-pre-wrap">{n.body}</p>
                  </li>
                ))
              )}
            </ul>
          </div>
        </aside>
      ) : null}
    </div>
  );
}
