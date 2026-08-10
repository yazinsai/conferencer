"use client";

import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { scheduleFromDropAction } from "./actions";

type UnscheduledItem = {
  id: string;
  title: string;
  meta: string;
};

type DropSlot = {
  id: string;
  day: string;
  time: string;
  roomId: string;
  roomName: string;
};

function DraggableSession({ item }: { item: UnscheduledItem }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `session-${item.id}`,
    data: { submissionId: item.id, title: item.title },
  });
  return (
    <li
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`cursor-grab rounded-md border border-slate-200 bg-white px-3 py-2 active:cursor-grabbing ${
        isDragging ? "opacity-40" : ""
      }`}
    >
      <div className="text-sm font-medium">{item.title}</div>
      <div className="text-xs text-slate-500">{item.meta}</div>
      <div className="mt-1 text-[10px] uppercase tracking-wide text-slate-400">
        Drag onto a slot · or use Schedule…
      </div>
    </li>
  );
}

function DropCell({
  slot,
  children,
}: {
  slot: DropSlot;
  children?: React.ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: slot.id,
    data: slot,
  });
  return (
    <div
      ref={setNodeRef}
      className={`min-h-[52px] rounded border border-dashed px-1 py-1 text-xs ${
        isOver
          ? "border-blue-500 bg-blue-50"
          : "border-slate-200 bg-slate-50/50"
      }`}
    >
      {children}
      {!children ? (
        <span className="text-[10px] text-slate-400">
          {slot.time} · {slot.roomName}
        </span>
      ) : null}
    </div>
  );
}

export function UnscheduledDnd({
  slug,
  view,
  day,
  items,
  rooms,
  times,
}: {
  slug: string;
  view: string;
  day: string;
  items: UnscheduledItem[];
  rooms: Array<{ id: string; name: string }>;
  times: string[];
}) {
  const router = useRouter();
  const [activeTitle, setActiveTitle] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  const slots: DropSlot[] = [];
  for (const time of times) {
    for (const room of rooms) {
      slots.push({
        id: `slot-${day}-${time}-${room.id}`,
        day,
        time,
        roomId: room.id,
        roomName: room.name,
      });
    }
  }

  function onDragStart(e: DragStartEvent) {
    setActiveTitle(String(e.active.data.current?.title ?? ""));
    setError(null);
  }

  function onDragEnd(e: DragEndEvent) {
    setActiveTitle(null);
    const submissionId = e.active.data.current?.submissionId as string | undefined;
    const slot = e.over?.data.current as DropSlot | undefined;
    if (!submissionId || !slot?.roomId) return;

    const [hh, mm] = slot.time.split(":").map(Number);
    const endH = hh + (mm >= 30 ? 1 : 0);
    const endM = mm >= 30 ? mm - 30 : mm + 30;
    const endTime = `${String(endH).padStart(2, "0")}:${String(endM).padStart(2, "0")}`;

    startTransition(async () => {
      const result = await scheduleFromDropAction({
        slug,
        submissionId,
        date: slot.day,
        startTime: slot.time,
        endTime,
        roomId: slot.roomId,
        view,
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      if (result.warn === "speaker_conflict") {
        setError(
          "Scheduled with a speaker conflict warning — check the Conflicts tab.",
        );
      }
      router.refresh();
    });
  }

  if (!items.length) return null;

  return (
    <DndContext sensors={sensors} onDragStart={onDragStart} onDragEnd={onDragEnd}>
      {error ? (
        <p className="mb-3 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">
          {error}
        </p>
      ) : null}
      {pending ? (
        <p className="mb-2 text-xs text-slate-500">Scheduling…</p>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <ul className="space-y-2">
          {items.map((item) => (
            <DraggableSession key={item.id} item={item} />
          ))}
        </ul>
        <div>
          <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Drop targets for {day}
          </div>
          <div
            className="grid gap-1"
            style={{
              gridTemplateColumns: `repeat(${Math.max(rooms.length, 1)}, minmax(0, 1fr))`,
            }}
          >
            {slots.map((slot) => (
              <DropCell key={slot.id} slot={slot} />
            ))}
          </div>
        </div>
      </div>

      <DragOverlay>
        {activeTitle ? (
          <div className="rounded-md border border-blue-300 bg-white px-3 py-2 text-sm shadow-lg">
            {activeTitle}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
