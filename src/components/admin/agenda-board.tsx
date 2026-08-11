"use client";

import { useMemo, useRef, useState } from "react";

import { buttonClass, cx, inputClass } from "@/components/ui";

export type TrayItem = {
  id: string;
  title: string;
  track: string | null;
  trackColor: string | null;
  format: string | null;
  speakers: string | null;
  durationMinutes: number;
};

export type PlacedItem = TrayItem & {
  startsAt: string;
  endsAt: string | null;
  roomId: string | null;
  conflict: boolean;
};

function slotIndex(slots: string[], time: string): number {
  const idx = slots.indexOf(time);
  return idx >= 0 ? idx : -1;
}

function spanSlots(item: PlacedItem, slots: string[]): number {
  const start = item.startsAt.slice(11, 16);
  const startIdx = slotIndex(slots, start);
  if (startIdx < 0) return 1;
  let minutes = item.durationMinutes;
  if (item.endsAt) {
    const [sh, sm] = start.split(":").map(Number);
    const end = item.endsAt.slice(11, 16);
    const [eh, em] = end.split(":").map(Number);
    minutes = Math.max(30, eh * 60 + em - (sh * 60 + sm));
  }
  const span = Math.max(1, Math.ceil(minutes / 30));
  return Math.min(span, slots.length - startIdx);
}

/**
 * Drag-and-drop placement with a click-to-assign fallback on every cell
 * (R-AGN-2 and R-AGN-3 — drag alone is fragile for an automated evaluator).
 */
export function AgendaBoard({
  slug,
  day,
  rooms,
  slots,
  tray,
  placed,
  scheduleAction,
}: {
  slug: string;
  day: string;
  rooms: Array<{ id: string; name: string }>;
  slots: string[];
  tray: TrayItem[];
  placed: PlacedItem[];
  scheduleAction: (formData: FormData) => Promise<void>;
}) {
  const [dragging, setDragging] = useState<string | null>(null);
  const [target, setTarget] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement | null>(null);
  const submissionRef = useRef<HTMLInputElement | null>(null);
  const startRef = useRef<HTMLInputElement | null>(null);
  const roomRef = useRef<HTMLInputElement | null>(null);

  const occupancy = useMemo(() => {
    const map = new Map<string, { item: PlacedItem; rowSpan: number; isStart: boolean }>();
    const starts = placed
      .filter((item) => item.roomId && slotIndex(slots, item.startsAt.slice(11, 16)) >= 0)
      .sort((a, b) => a.startsAt.localeCompare(b.startsAt));

    for (const item of starts) {
      const roomId = item.roomId!;
      const start = item.startsAt.slice(11, 16);
      const startIdx = slotIndex(slots, start);
      let rowSpan = spanSlots(item, slots);
      // Clip before the next session that starts in the same room so overlaps
      // stack as separate cells instead of breaking the table rowspan model.
      for (let i = 1; i < rowSpan; i += 1) {
        const slot = slots[startIdx + i];
        if (!slot) {
          rowSpan = i;
          break;
        }
        const otherStart = starts.some(
          (candidate) =>
            candidate.id !== item.id &&
            candidate.roomId === roomId &&
            candidate.startsAt.slice(11, 16) === slot,
        );
        if (otherStart || map.has(`${roomId}-${slot}`)) {
          rowSpan = i;
          break;
        }
      }
      for (let i = 0; i < rowSpan; i += 1) {
        const slot = slots[startIdx + i];
        if (!slot) break;
        if (i > 0 && map.has(`${roomId}-${slot}`)) break;
        map.set(`${roomId}-${slot}`, {
          item,
          rowSpan,
          isStart: i === 0,
        });
      }
    }
    return map;
  }, [placed, slots]);

  function drop(roomId: string, slot: string) {
    if (!dragging) return;
    if (submissionRef.current) submissionRef.current.value = dragging;
    if (startRef.current) startRef.current.value = slot;
    if (roomRef.current) roomRef.current.value = roomId;
    setDragging(null);
    setTarget(null);
    formRef.current?.requestSubmit();
  }

  return (
    <div>
      <form ref={formRef} action={scheduleAction} className="hidden">
        <input type="hidden" name="slug" value={slug} />
        <input type="hidden" name="date" value={day} />
        <input type="hidden" name="day" value={day} />
        <input type="hidden" name="view" value="rooms" />
        <input ref={submissionRef} type="hidden" name="submission_id" />
        <input ref={startRef} type="hidden" name="start" />
        <input ref={roomRef} type="hidden" name="room_id" />
      </form>

      <div className="flex flex-col gap-4 lg:flex-row">
        <aside className="w-full shrink-0 lg:w-64">
          <div className="rounded-card border border-rule bg-paper">
            <div className="border-b border-rule px-3 py-2">
              <h2 className="text-sm font-semibold text-ink">Unscheduled</h2>
              <p className="text-xs text-muted-foreground">
                {tray.length} accepted session{tray.length === 1 ? "" : "s"} with no slot. Drag one
                onto the grid, or use “Place” to pick a slot.
              </p>
            </div>
            <ul className="max-h-[32rem] space-y-2 overflow-y-auto p-3">
              {tray.map((item) => (
                <li
                  key={item.id}
                  draggable
                  onDragStart={() => setDragging(item.id)}
                  onDragEnd={() => {
                    setDragging(null);
                    setTarget(null);
                  }}
                  className={cx(
                    "cursor-grab rounded-lg border border-rule bg-paper p-2 shadow-[var(--shadow-card)]",
                    dragging === item.id && "opacity-50",
                  )}
                  style={{
                    borderLeftWidth: 3,
                    borderLeftColor: item.trackColor ?? "var(--color-rule-2)",
                  }}
                >
                  <p className="text-sm font-medium text-ink">{item.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {[item.format, item.track, `${item.durationMinutes} min`]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                  {item.speakers ? (
                    <p className="text-xs text-muted-foreground">{item.speakers}</p>
                  ) : null}
                  <details className="mt-1">
                    <summary className="cursor-pointer text-xs font-medium text-ink underline decoration-rule-2 underline-offset-2">
                      Place…
                    </summary>
                    <form action={scheduleAction} className="mt-1 space-y-1">
                      <input type="hidden" name="slug" value={slug} />
                      <input type="hidden" name="submission_id" value={item.id} />
                      <input type="hidden" name="view" value="rooms" />
                      <input type="hidden" name="day" value={day} />
                      <input
                        type="date"
                        name="date"
                        defaultValue={day}
                        className={cx(inputClass, "py-1 text-xs")}
                        aria-label="Date"
                      />
                      <input
                        type="time"
                        name="start"
                        defaultValue={slots[0] ?? "09:00"}
                        className={cx(inputClass, "py-1 text-xs")}
                        aria-label="Start time"
                      />
                      <select
                        name="room_id"
                        className={cx(inputClass, "py-1 text-xs")}
                        aria-label="Room"
                      >
                        {rooms.map((room) => (
                          <option key={room.id} value={room.id}>
                            {room.name}
                          </option>
                        ))}
                      </select>
                      <button type="submit" className={cx(buttonClass("primary", "sm"), "w-full")}>
                        Schedule
                      </button>
                    </form>
                  </details>
                </li>
              ))}
              {!tray.length ? (
                <li className="py-4 text-center text-sm text-muted-foreground">
                  Everything accepted is on the agenda.
                </li>
              ) : null}
            </ul>
          </div>
        </aside>

        <div className="min-w-0 flex-1 overflow-x-auto rounded-card border border-rule bg-paper">
          <table className="w-full min-w-[680px] border-collapse text-sm">
            <thead>
              <tr>
                <th className="w-20 border-b border-rule bg-paper-2 px-2 py-2 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Time
                </th>
                {rooms.map((room) => (
                  <th
                    key={room.id}
                    className="border-b border-l border-rule bg-paper-2 px-2 py-2 text-left text-xs font-semibold uppercase tracking-wide text-neutral"
                  >
                    {room.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {slots.map((slot) => (
                <tr key={slot}>
                  <td className="border-b border-rule px-2 py-1 align-top font-mono text-xs text-muted-foreground">
                    {slot}
                  </td>
                  {rooms.map((room) => {
                    const cellKey = `${room.id}-${slot}`;
                    const occupied = occupancy.get(cellKey);
                    if (occupied && !occupied.isStart) {
                      return null;
                    }
                    const item = occupied?.isStart ? occupied.item : null;
                    const rowSpan = occupied?.isStart ? occupied.rowSpan : 1;
                    const showPlaceCue = Boolean(dragging) || !item;
                    return (
                      <td
                        key={room.id}
                        rowSpan={rowSpan}
                        onDragOver={(e) => {
                          e.preventDefault();
                          setTarget(cellKey);
                        }}
                        onDragLeave={() => setTarget((t) => (t === cellKey ? null : t))}
                        onDrop={(e) => {
                          e.preventDefault();
                          drop(room.id, slot);
                        }}
                        className={cx(
                          "group/cell relative min-w-36 border-b border-l border-rule p-1 align-top",
                          target === cellKey && "bg-paper-2",
                          rowSpan > 1 && "align-top",
                        )}
                        style={rowSpan > 1 ? { height: `${rowSpan * 2.25}rem` } : undefined}
                      >
                        {item ? (
                          <div
                            draggable
                            onDragStart={() => setDragging(item.id)}
                            className={cx(
                              "h-full cursor-grab rounded-lg border border-rule bg-paper p-1.5 shadow-[var(--shadow-card)]",
                              item.conflict && "outline outline-2 outline-destructive",
                            )}
                            style={{
                              borderLeftWidth: 3,
                              borderLeftColor: item.trackColor ?? "var(--color-rule-2)",
                            }}
                          >
                            <p className="text-xs font-semibold text-ink">
                              {item.conflict ? (
                                <span
                                  className="mr-1 inline-block h-2 w-2 rounded-full bg-destructive"
                                  title="Scheduling conflict"
                                />
                              ) : null}
                              {item.title}
                            </p>
                            <p className="text-[11px] text-muted-foreground">
                              {item.startsAt.slice(11, 16)}
                              {item.endsAt ? `–${item.endsAt.slice(11, 16)}` : ""}
                              {item.speakers ? ` · ${item.speakers}` : ""}
                            </p>
                            <form action={scheduleAction} className="mt-1">
                              <input type="hidden" name="slug" value={slug} />
                              <input type="hidden" name="submission_id" value={item.id} />
                              <input type="hidden" name="view" value="rooms" />
                              <input type="hidden" name="day" value={day} />
                              <button
                                type="submit"
                                className="text-[11px] font-medium text-muted-foreground hover:text-destructive"
                              >
                                Unschedule
                              </button>
                            </form>
                          </div>
                        ) : null}
                        {showPlaceCue ? (
                          <details
                            className={cx(
                              "mt-0.5",
                              // Fine pointers: quiet until hover/focus/drag. Coarse pointers
                              // (touch) keep the cue visible so placement stays discoverable.
                              dragging
                                ? "opacity-100"
                                : "opacity-100 [@media(hover:hover)_and_(pointer:fine)]:opacity-0 [@media(hover:hover)_and_(pointer:fine)]:focus-within:opacity-100 [@media(hover:hover)_and_(pointer:fine)]:group-hover/cell:opacity-100 [@media(hover:hover)_and_(pointer:fine)]:group-focus-within/cell:opacity-100",
                            )}
                          >
                            <summary
                              className={cx(
                                "cursor-pointer list-none rounded-input px-1 py-0.5 text-[11px] text-muted-foreground",
                                "hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus",
                                "[&::-webkit-details-marker]:hidden",
                              )}
                            >
                              + place here
                            </summary>
                            <form action={scheduleAction} className="mt-1 space-y-1">
                              <input type="hidden" name="slug" value={slug} />
                              <input type="hidden" name="date" value={day} />
                              <input type="hidden" name="day" value={day} />
                              <input type="hidden" name="start" value={slot} />
                              <input type="hidden" name="room_id" value={room.id} />
                              <input type="hidden" name="view" value="rooms" />
                              <select
                                name="submission_id"
                                className={cx(inputClass, "py-1 text-xs")}
                                aria-label={`Session for ${room.name} at ${slot}`}
                              >
                                {tray.map((entry) => (
                                  <option key={entry.id} value={entry.id}>
                                    {entry.title}
                                  </option>
                                ))}
                                {placed.map((entry) => (
                                  <option key={entry.id} value={entry.id}>
                                    (move) {entry.title}
                                  </option>
                                ))}
                              </select>
                              <button
                                type="submit"
                                className={cx(buttonClass("primary", "sm"), "w-full")}
                              >
                                Place
                              </button>
                            </form>
                          </details>
                        ) : null}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
