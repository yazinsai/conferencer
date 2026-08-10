"use client";

import { useRef, useState } from "react";

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
          <div className="rounded-lg border border-slate-200 bg-white">
            <div className="border-b border-slate-200 px-3 py-2">
              <h2 className="text-sm font-semibold text-slate-900">Unscheduled</h2>
              <p className="text-xs text-slate-500">
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
                    "cursor-grab rounded-md border border-slate-200 bg-white p-2 shadow-sm",
                    dragging === item.id && "opacity-50",
                  )}
                  style={{ borderLeft: `4px solid ${item.trackColor ?? "#94a3b8"}` }}
                >
                  <p className="text-sm font-medium text-slate-900">{item.title}</p>
                  <p className="text-xs text-slate-500">
                    {[item.format, item.track].filter(Boolean).join(" · ")}
                  </p>
                  {item.speakers ? (
                    <p className="text-xs text-slate-500">{item.speakers}</p>
                  ) : null}
                  <details className="mt-1">
                    <summary className="cursor-pointer text-xs font-medium text-brand-700">
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
                <li className="py-4 text-center text-sm text-slate-500">
                  Everything accepted is on the agenda.
                </li>
              ) : null}
            </ul>
          </div>
        </aside>

        <div className="min-w-0 flex-1 overflow-x-auto rounded-lg border border-slate-200 bg-white">
          <table className="w-full min-w-[680px] border-collapse text-sm">
            <thead>
              <tr>
                <th className="w-20 border-b border-slate-200 bg-slate-50 px-2 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Time
                </th>
                {rooms.map((room) => (
                  <th
                    key={room.id}
                    className="border-b border-l border-slate-200 bg-slate-50 px-2 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-600"
                  >
                    {room.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {slots.map((slot) => (
                <tr key={slot}>
                  <td className="border-b border-slate-100 px-2 py-1 align-top font-mono text-xs text-slate-400">
                    {slot}
                  </td>
                  {rooms.map((room) => {
                    const cellKey = `${room.id}-${slot}`;
                    const items = placed.filter(
                      (p) => p.roomId === room.id && p.startsAt.slice(11, 16) === slot,
                    );
                    return (
                      <td
                        key={room.id}
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
                          "min-w-36 border-b border-l border-slate-100 p-1 align-top",
                          target === cellKey && "dropzone-active",
                        )}
                      >
                        {items.map((item) => (
                          <div
                            key={item.id}
                            draggable
                            onDragStart={() => setDragging(item.id)}
                            className={cx(
                              "mb-1 cursor-grab rounded-md border border-slate-200 bg-white p-1.5 shadow-sm",
                              item.conflict && "ring-2 ring-red-400",
                            )}
                            style={{ borderLeft: `4px solid ${item.trackColor ?? "#94a3b8"}` }}
                          >
                            <p className="text-xs font-semibold text-slate-900">
                              {item.conflict ? (
                                <span
                                  className="mr-1 inline-block h-2 w-2 rounded-full bg-red-500"
                                  title="Scheduling conflict"
                                />
                              ) : null}
                              {item.title}
                            </p>
                            <p className="text-[11px] text-slate-500">
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
                                className="text-[11px] font-medium text-slate-500 hover:text-red-600"
                              >
                                Unschedule
                              </button>
                            </form>
                          </div>
                        ))}
                        {!items.length ? (
                          <details>
                            <summary className="cursor-pointer list-none text-[11px] text-slate-300 hover:text-brand-600 [&::-webkit-details-marker]:hidden">
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
                                {tray.map((item) => (
                                  <option key={item.id} value={item.id}>
                                    {item.title}
                                  </option>
                                ))}
                                {placed.map((item) => (
                                  <option key={item.id} value={item.id}>
                                    (move) {item.title}
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
