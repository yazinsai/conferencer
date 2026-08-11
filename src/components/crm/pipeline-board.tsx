"use client";

import Link from "next/link";
import { useRef, useState } from "react";

import { buttonClass, cx } from "@/components/ui";

export type BoardCard = {
  id: string;
  stage: string;
  name: string;
  company: string | null;
  jobTitle: string | null;
  score: number | null;
  rationale: string | null;
  contactId: string;
};

/** Kanban with drag between stages and a select fallback for keyboards (CRM-07). */
export function PipelineBoard({
  stages,
  cards,
  moveStageAction,
  removeEntryAction,
}: {
  stages: Array<{ key: string; label: string }>;
  cards: BoardCard[];
  moveStageAction: (formData: FormData) => Promise<void>;
  removeEntryAction: (formData: FormData) => Promise<void>;
}) {
  const [dragging, setDragging] = useState<string | null>(null);
  const [over, setOver] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement | null>(null);
  const entryRef = useRef<HTMLInputElement | null>(null);
  const stageRef = useRef<HTMLInputElement | null>(null);

  function drop(stage: string) {
    if (!dragging) return;
    if (entryRef.current) entryRef.current.value = dragging;
    if (stageRef.current) stageRef.current.value = stage;
    setDragging(null);
    setOver(null);
    formRef.current?.requestSubmit();
  }

  return (
    <div>
      <form ref={formRef} action={moveStageAction} className="hidden">
        <input ref={entryRef} type="hidden" name="entry_id" />
        <input ref={stageRef} type="hidden" name="stage" />
      </form>

      <div className="grid gap-3 md:grid-cols-5">
        {stages.map((stage) => {
          const items = cards.filter((card) => card.stage === stage.key);
          return (
            <div
              key={stage.key}
              onDragOver={(e) => {
                e.preventDefault();
                setOver(stage.key);
              }}
              onDragLeave={() => setOver((s) => (s === stage.key ? null : s))}
              onDrop={(e) => {
                e.preventDefault();
                drop(stage.key);
              }}
              className={cx(
                "rounded-lg border border-slate-200 bg-slate-50 p-2",
                over === stage.key && "dropzone-active",
              )}
            >
              <div className="flex items-center justify-between px-1 pb-2">
                <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                  {stage.label}
                </h2>
                <span className="rounded-full bg-white px-1.5 text-xs text-slate-600">
                  {items.length}
                </span>
              </div>
              <ul className="space-y-2">
                {items.map((card) => (
                  <li
                    key={card.id}
                    draggable
                    onDragStart={() => setDragging(card.id)}
                    onDragEnd={() => {
                      setDragging(null);
                      setOver(null);
                    }}
                    className={cx(
                      "cursor-grab rounded-md border border-slate-200 bg-white p-2 shadow-sm",
                      dragging === card.id && "opacity-50",
                    )}
                  >
                    <Link
                      href={`/crm/pipeline?card=${card.id}`}
                      className="text-sm font-medium text-slate-900 hover:text-brand-700"
                    >
                      {card.name}
                    </Link>
                    <p className="text-xs text-slate-500">
                      {[card.jobTitle, card.company].filter(Boolean).join(", ")}
                    </p>
                    {card.score ? (
                      <p className="mt-1 text-xs text-amber-700">Score {card.score}/5</p>
                    ) : null}
                    {card.rationale ? (
                      <p className="mt-1 text-xs text-slate-500">{card.rationale}</p>
                    ) : null}
                    <div className="mt-2 flex items-center gap-1">
                      <form action={moveStageAction} className="flex items-center gap-1">
                        <input type="hidden" name="entry_id" value={card.id} />
                        <select
                          name="stage"
                          defaultValue={card.stage}
                          aria-label={`Move ${card.name} to another stage`}
                          className="rounded border border-slate-300 px-1 py-0.5 text-[11px]"
                        >
                          {stages.map((s) => (
                            <option key={s.key} value={s.key}>
                              {s.label}
                            </option>
                          ))}
                        </select>
                        <button type="submit" className={buttonClass("secondary", "sm")}>
                          Move
                        </button>
                      </form>
                      <form action={removeEntryAction}>
                        <input type="hidden" name="entry_id" value={card.id} />
                        <button
                          type="submit"
                          className="px-1 text-[11px] text-slate-400 hover:text-red-600"
                        >
                          remove
                        </button>
                      </form>
                    </div>
                  </li>
                ))}
                {!items.length ? (
                  <li className="rounded-md border border-dashed border-slate-300 px-2 py-4 text-center text-xs text-slate-400">
                    Drop here
                  </li>
                ) : null}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}
