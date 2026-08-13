"use client";

import { startTransition, useMemo, useState } from "react";
import { flushSync } from "react-dom";

import { Chip, buttonClass, cx } from "@/components/ui";
import { Icon } from "@/components/ui/icon";
import { formatDate } from "@/lib/datetime";
import type { DemoRoom, DemoTalk } from "@/lib/demo-conference";
import { sharedSpeaker } from "@/lib/people";

import { ViewTransition } from "./view-transition";

/**
 * The landing page's hero playable: the organizer's agenda board, in the page.
 *
 * Mirrors `/admin/e/[slug]/agenda` (design.md § Live product tiles, rule 1). The
 * two rules it exists to demonstrate are the ones no screenshot can show, and they
 * are the real product's rules, not approximations of them:
 *
 *   · **two talks in one room is blocked** — that is never right, so the drop is
 *     refused and the cell flashes;
 *   · **one speaker in two rooms at once is flagged, not blocked** — a short
 *     overlap between rooms can be deliberate, so the board warns and lets you.
 *
 * Nothing here writes. `Publish agenda` crossfades the panel into the attendee's
 * view of the same rows, which is the whole product's loop in one gesture.
 */

type Placement = { roomId: string; slot: string };

/** How many half-hour rows a talk covers, the way the real rooms grid spans them. */
const spanOf = (talk: DemoTalk) =>
  Math.max(1, Math.ceil(talk.durationMinutes / 30));

type WithViewTransition = Document & {
  startViewTransition?: (callback: () => void | Promise<void>) => {
    finished: Promise<void>;
  };
};

/**
 * Run a state update as a **shared-element morph**: the card the reader dropped
 * travels from the tray to its slot instead of vanishing from one and appearing in
 * the other.
 *
 * This uses the browser's View Transition API directly rather than React's
 * `<ViewTransition name>`, which drives the tab crossfade and the publish flip
 * elsewhere on this page. Three reasons to be explicit here: the pairing is between
 * two different subtrees rather than one keyed boundary, so it wants a name on the
 * element rather than a React boundary around it; reduced motion has to opt out of
 * the transition itself, not just shorten it; and it keeps the one animation that
 * carries meaning off an experimental API. `flushSync` inside the callback is what
 * makes React's DOM write land inside the transition's capture.
 *
 * Verified by counting `document.startViewTransition` calls: placing a talk fires
 * exactly one, and a refused drop fires none — which is right, because nothing moved.
 *
 * The names live on the cards themselves (`view-transition-name`), so the browser
 * pairs the old and new position by name and interpolates between them. Degrades to
 * a plain update where the API is missing or motion is reduced.
 */
function morph(update: () => void) {
  const doc = document as WithViewTransition;
  if (
    typeof doc.startViewTransition !== "function" ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ) {
    startTransition(update);
    return;
  }
  doc.startViewTransition(() => {
    flushSync(update);
  });
}

export function AgendaPlayground({
  talks,
  rooms,
  slots,
  day,
}: {
  talks: DemoTalk[];
  rooms: DemoRoom[];
  slots: string[];
  day: string;
}) {
  // The board opens with the first talk already placed: an empty grid reads as a
  // page that has not loaded, and a reader should see what a placed talk looks
  // like before they have to make one themselves.
  const [placed, setPlaced] = useState<Record<string, Placement>>(() =>
    talks[0]
      ? {
          [talks[0].id]: {
            roomId: rooms[0]?.id ?? "",
            slot: slots[0] ?? "09:00",
          },
        }
      : {},
  );
  const [dragging, setDragging] = useState<string | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  /** The cell that just refused a drop, for a short flash. */
  const [flash, setFlash] = useState<string | null>(null);
  /**
   * The refusal itself sticks around until the reader does something else. A
   * message that explains why the product said no has to outlive the animation
   * that drew attention to it.
   */
  const [refusedTalk, setRefusedTalk] = useState<string | null>(null);
  const [published, setPublished] = useState(false);

  const byId = useMemo(
    () => new Map(talks.map((talk) => [talk.id, talk])),
    [talks],
  );
  const tray = talks.filter((talk) => !placed[talk.id]);
  const placedList = talks
    .filter((talk) => placed[talk.id])
    .map((talk) => ({ talk, at: placed[talk.id] }))
    .sort((a, b) => a.at.slot.localeCompare(b.at.slot));

  /** Every (room, slot) a placed talk covers, so occupancy is span-aware. */
  const occupied = useMemo(() => {
    const map = new Map<string, string>();
    for (const [talkId, at] of Object.entries(placed)) {
      const talk = byId.get(talkId);
      if (!talk) continue;
      const start = slots.indexOf(at.slot);
      if (start < 0) continue;
      for (let i = 0; i < spanOf(talk) && start + i < slots.length; i += 1) {
        map.set(`${at.roomId}-${slots[start + i]}`, talkId);
      }
    }
    return map;
  }, [placed, byId, slots]);

  /**
   * A speaker in two rooms in the same slot. The real board flags this rather than
   * refusing it, so this one is a warning and the talk stays where it was put.
   */
  const clashing = useMemo(() => {
    const flagged = new Map<string, string>();
    for (const a of placedList) {
      for (const b of placedList) {
        if (a.talk.id === b.talk.id) continue;
        if (a.at.slot !== b.at.slot || a.at.roomId === b.at.roomId) continue;
        // Per person, not per session: a co-authored talk and a solo talk clash if
        // they share one speaker, which is how the real conflict check reads it.
        const shared = sharedSpeaker(a.talk.speakers, b.talk.speakers);
        if (shared) flagged.set(a.talk.id, shared);
      }
    }
    return flagged;
  }, [placedList]);

  function place(talkId: string, roomId: string, slot: string) {
    const talk = byId.get(talkId);
    if (!talk) return;
    const start = slots.indexOf(slot);
    // Refuse if any row this talk would cover is taken by a different talk.
    for (
      let i = 0;
      i < spanOf(talk) && start + i >= 0 && start + i < slots.length;
      i += 1
    ) {
      const holder = occupied.get(`${roomId}-${slots[start + i]}`);
      if (holder && holder !== talkId) {
        const clashedWith = byId.get(holder);
        setRefusedTalk(clashedWith?.title ?? null);
        setFlash(`${roomId}-${slot}`);
        window.setTimeout(() => setFlash(null), 1200);
        return;
      }
    }
    setRefusedTalk(null);
    morph(() => {
      setPlaced((current) => ({ ...current, [talkId]: { roomId, slot } }));
    });
  }

  function unplace(talkId: string) {
    setRefusedTalk(null);
    morph(() => {
      setPlaced((current) => {
        const next = { ...current };
        delete next[talkId];
        return next;
      });
    });
  }

  /**
   * The first slot a talk would actually fit in. The place menu opens on this
   * rather than on the first room and the first time, because the board starts with
   * a talk on Main Stage at 09:00 and a menu whose default action is refused is a
   * menu that looks broken.
   */
  function freeSlotFor(talk: DemoTalk): Placement {
    for (const slot of slots) {
      for (const room of rooms) {
        const start = slots.indexOf(slot);
        let fits = true;
        for (let i = 0; i < spanOf(talk) && start + i < slots.length; i += 1) {
          if (occupied.has(`${room.id}-${slots[start + i]}`)) fits = false;
        }
        if (fits) return { roomId: room.id, slot };
      }
    }
    return { roomId: rooms[0]?.id ?? "", slot: slots[0] ?? "09:00" };
  }

  const conflictCount = clashing.size;
  const clashName = [...clashing.values()][0];

  return (
    <ViewTransition
      key={published ? "published" : "board"}
      name="agenda-panel"
      share="auto"
      enter="auto"
      default="none"
    >
      <div className="min-w-0 overflow-hidden rounded-tile border border-rule bg-paper shadow-[var(--shadow-tile)]">
        {published ? (
          <PublishedView
            placed={placedList}
            rooms={rooms}
            day={day}
            onReset={() => startTransition(() => setPublished(false))}
          />
        ) : (
          <>
            {/* ------------------------------------------------ board header -- */}
            <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-rule bg-paper-2 px-4 py-3">
              <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1.5">
                <h3 className="display text-sm text-ink">
                  Agenda · {formatDate(day)}
                </h3>
                {refusedTalk ? (
                  <Chip tone="red" title="Two talks cannot share one room">
                    <span className="inline-flex items-center gap-1">
                      <Icon name="error" size={12} />
                      Room double-booked
                    </span>
                  </Chip>
                ) : conflictCount ? (
                  <Chip
                    tone="amber"
                    title="A speaker is in two rooms at the same time"
                  >
                    <span className="inline-flex items-center gap-1">
                      <Icon name="warning" size={12} />
                      {conflictCount} speaker clash
                      {conflictCount === 1 ? "" : "es"}
                    </span>
                  </Chip>
                ) : (
                  <Chip tone="slate">No conflicts</Chip>
                )}
              </div>
              <button
                type="button"
                disabled={!placedList.length}
                onClick={() => startTransition(() => setPublished(true))}
                className={cx(
                  buttonClass("primary", "sm"),
                  "nowrap-affordance",
                )}
              >
                Publish agenda
              </button>
            </div>

            <div className="flex flex-col lg:flex-row">
              {/* ----------------------------------------------------- tray -- */}
              <div className="shrink-0 border-b border-rule p-3 lg:w-60 lg:border-b-0 lg:border-r">
                <p className="text-xs font-medium text-ink">Unscheduled</p>
                <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                  {tray.length} accepted session{tray.length === 1 ? "" : "s"}{" "}
                  with no slot. Drag one onto the grid.
                </p>
                <ul className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
                  {tray.map((talk) => (
                    <li key={talk.id} className="min-w-0">
                      <div
                        draggable
                        onDragStart={() => setDragging(talk.id)}
                        onDragEnd={() => {
                          setDragging(null);
                          setHovered(null);
                        }}
                        className={cx(
                          "hm-grab rounded-lg border border-rule bg-paper p-2 shadow-[var(--shadow-card)]",
                          dragging === talk.id && "hm-dragging",
                        )}
                        style={{
                          borderLeftWidth: 3,
                          borderLeftColor:
                            talk.trackColor ?? "var(--color-rule-2)",
                          viewTransitionName: `talk-${talk.id}`,
                        }}
                      >
                        <p className="line-clamp-2 text-xs font-medium text-ink">
                          {talk.title}
                        </p>
                        <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                          {[talk.format, `${talk.durationMinutes} min`]
                            .filter(Boolean)
                            .join(" · ")}
                        </p>

                        {/* The pointer-free path, and the one the real board also
                              ships (R-AGN-3): a native disclosure, two selects. */}
                        <PlaceMenu
                          talk={talk}
                          rooms={rooms}
                          slots={slots}
                          onPlace={place}
                          preset={freeSlotFor(talk)}
                        />
                      </div>
                    </li>
                  ))}
                  {!tray.length ? (
                    <li className="py-3 text-center text-xs text-muted-foreground">
                      Everything accepted is on the agenda.
                    </li>
                  ) : null}
                </ul>
              </div>

              {/* ----------------------------------------------------- grid -- */}
              <div className="min-w-0 flex-1 overflow-x-auto p-3">
                <div
                  className="grid min-w-[30rem] gap-px"
                  style={{
                    gridTemplateColumns: `3.25rem repeat(${rooms.length}, minmax(0, 1fr))`,
                    // 3rem a slot: a 30-minute talk's card has to hold a clamped
                    // title and its time line without either being cut off.
                    gridTemplateRows: `auto repeat(${slots.length}, 3rem)`,
                  }}
                >
                  <div aria-hidden />
                  {rooms.map((room) => (
                    <div
                      key={room.id}
                      className="truncate pb-1.5 text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground"
                    >
                      {room.name}
                    </div>
                  ))}

                  {slots.map((slot, slotIndex) => (
                    <div
                      key={`t-${slot}`}
                      className="wordmark tnum pr-2 text-right text-[11px] leading-[3rem] text-muted-foreground"
                      style={{ gridColumn: 1, gridRow: slotIndex + 2 }}
                    >
                      {slot}
                    </div>
                  ))}

                  {/* Drop targets: one per cell, painted under the cards. */}
                  {slots.map((slot, slotIndex) =>
                    rooms.map((room, roomIndex) => {
                      const key = `${room.id}-${slot}`;
                      const taken = occupied.has(key);
                      return (
                        <div
                          key={key}
                          onDragOver={(event) => {
                            event.preventDefault();
                            setHovered(key);
                          }}
                          onDragLeave={() =>
                            setHovered((current) =>
                              current === key ? null : current,
                            )
                          }
                          onDrop={(event) => {
                            event.preventDefault();
                            setHovered(null);
                            if (dragging) place(dragging, room.id, slot);
                            setDragging(null);
                          }}
                          style={{
                            gridColumn: roomIndex + 2,
                            gridRow: slotIndex + 2,
                          }}
                          className={cx(
                            "rounded-md border border-dashed border-transparent bg-paper-2/60 transition-colors duration-[120ms] ease-out",
                            !taken && hovered === key && "dropzone-active",
                            flash === key &&
                              "border-destructive bg-danger-soft",
                          )}
                        />
                      );
                    }),
                  )}

                  {/* Placed talks, laid over their cells with a real row span. */}
                  {placedList.map(({ talk, at }) => {
                    const roomIndex = rooms.findIndex(
                      (room) => room.id === at.roomId,
                    );
                    const slotIndex = slots.indexOf(at.slot);
                    if (roomIndex < 0 || slotIndex < 0) return null;
                    const clash = clashing.has(talk.id);
                    const rows = Math.min(
                      spanOf(talk),
                      slots.length - slotIndex,
                    );
                    return (
                      <div
                        key={talk.id}
                        style={{
                          gridColumn: roomIndex + 2,
                          gridRow: `${slotIndex + 2} / span ${rows}`,
                        }}
                        // A placed card is painted over the drop cell beneath it, so
                        // without these the browser never fires a drop on an
                        // occupied slot: HTML5 drag needs preventDefault on dragover
                        // to allow one at all. The refusal is the most important
                        // thing this panel demonstrates, and it was silently
                        // unreachable by pointer — the card simply stayed put with
                        // no explanation.
                        onDragOver={(event) => {
                          if (!dragging || dragging === talk.id) return;
                          event.preventDefault();
                          setHovered(`${at.roomId}-${at.slot}`);
                        }}
                        onDrop={(event) => {
                          event.preventDefault();
                          setHovered(null);
                          if (dragging && dragging !== talk.id)
                            place(dragging, at.roomId, at.slot);
                          setDragging(null);
                        }}
                        className="min-w-0 p-px"
                      >
                        <div
                          draggable
                          onDragStart={() => setDragging(talk.id)}
                          onDragEnd={() => setDragging(null)}
                          className={cx(
                            "hm-grab group/card relative flex h-full min-w-0 flex-col overflow-hidden rounded-md border bg-paper px-1.5 py-1 shadow-[var(--shadow-card)]",
                            clash ? "border-warn/50" : "border-rule",
                            dragging === talk.id && "hm-dragging",
                            // Refusal is signalled before the drop, not only after
                            // it: hovering a foreign card over this slot marks it.
                            dragging &&
                              dragging !== talk.id &&
                              hovered === `${at.roomId}-${at.slot}` &&
                              "outline outline-2 outline-offset-1 outline-destructive",
                          )}
                          style={{
                            borderLeftWidth: 3,
                            borderLeftColor:
                              talk.trackColor ?? "var(--color-rule-2)",
                            viewTransitionName: `talk-${talk.id}`,
                          }}
                        >
                          {/* A one-slot card has room for one line of title and
                                its time; a longer talk gets its whole span. */}
                          <p
                            className={cx(
                              "text-[11px] font-semibold leading-tight text-ink",
                              rows > 1 ? "line-clamp-2" : "truncate",
                            )}
                          >
                            {clash ? (
                              <span
                                aria-hidden
                                className="mr-1 inline-block size-1.5 rounded-full bg-warn align-middle"
                              />
                            ) : null}
                            {talk.title}
                          </p>
                          <p className="wordmark tnum mt-auto truncate text-[10px] leading-tight text-muted-foreground">
                            {at.slot} · {talk.speakers}
                          </p>
                          <button
                            type="button"
                            onClick={() => unplace(talk.id)}
                            aria-label={`Unschedule ${talk.title}`}
                            className="absolute right-0.5 top-0.5 grid size-5 place-items-center rounded-md text-muted-foreground opacity-0 transition-opacity duration-[120ms] ease-out hover:bg-paper-3 hover:text-ink focus-visible:opacity-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-focus group-hover/card:opacity-100"
                          >
                            <Icon name="close" size={12} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* The board's own voice. Refusals persist until the reader does
                    something else; a message that explains a refusal must outlive
                    the flash that drew attention to it. */}
                <p
                  aria-live="polite"
                  className="mt-2.5 flex min-h-[2.25rem] items-start gap-1.5 text-[11px] leading-relaxed"
                >
                  {refusedTalk ? (
                    <>
                      <Icon
                        name="error"
                        size={13}
                        className="mt-px shrink-0 text-destructive"
                      />
                      <span className="text-destructive">
                        <span className="font-medium">Blocked.</span> “
                        {refusedTalk}” already has that room. Two talks in one
                        room is never right, so the board refuses it instead of
                        warning you.
                      </span>
                    </>
                  ) : conflictCount ? (
                    <>
                      <Icon
                        name="warning"
                        size={13}
                        className="mt-px shrink-0 text-warn"
                      />
                      <span className="text-warn">
                        <span className="font-medium">Flagged.</span>{" "}
                        {clashName} is now in two rooms at once. A short overlap
                        between rooms can be deliberate, so this one is flagged
                        rather than blocked.
                      </span>
                    </>
                  ) : (
                    <span className="text-muted-foreground">
                      Drag a talk into a slot — then try dropping one on top of
                      another, or putting the same speaker in two rooms at once.
                    </span>
                  )}
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </ViewTransition>
  );
}

/** The keyboard and touch path for placing a talk. Native disclosure, no JS to open. */
function PlaceMenu({
  talk,
  rooms,
  slots,
  onPlace,
  preset,
}: {
  talk: DemoTalk;
  rooms: DemoRoom[];
  slots: string[];
  onPlace: (talkId: string, roomId: string, slot: string) => void;
  /** Where this talk would fit right now. */
  preset: { roomId: string; slot: string };
}) {
  const [roomId, setRoomId] = useState(preset.roomId);
  const [slot, setSlot] = useState(preset.slot);
  const selectClass =
    "h-8 w-full min-w-0 rounded-input border border-input bg-paper px-2 text-[11px] text-ink";

  return (
    <details className="mt-1.5 border-t border-rule pt-1.5">
      <summary className="nowrap-affordance cursor-pointer list-none text-[11px] font-medium text-neutral underline decoration-rule-2 underline-offset-2 hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus [&::-webkit-details-marker]:hidden">
        Place…
      </summary>
      <div className="mt-1.5 grid gap-1.5">
        <select
          value={roomId}
          onChange={(event) => setRoomId(event.target.value)}
          aria-label={`Room for ${talk.title}`}
          className={selectClass}
        >
          {rooms.map((room) => (
            <option key={room.id} value={room.id}>
              {room.name}
            </option>
          ))}
        </select>
        <select
          value={slot}
          onChange={(event) => setSlot(event.target.value)}
          aria-label={`Start time for ${talk.title}`}
          className={selectClass}
        >
          {slots.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => onPlace(talk.id, roomId, slot)}
          className={cx(
            buttonClass("secondary", "sm"),
            "nowrap-affordance w-full",
          )}
        >
          Place
        </button>
      </div>
    </details>
  );
}

/**
 * What the attendee sees once the agenda is published: the same rows, no login.
 * The check draws on once (design.md § Motion · marketing, item 8).
 */
function PublishedView({
  placed,
  rooms,
  day,
  onReset,
}: {
  placed: Array<{ talk: DemoTalk; at: Placement }>;
  rooms: DemoRoom[];
  day: string;
  onReset: () => void;
}) {
  const roomName = (id: string) =>
    rooms.find((room) => room.id === id)?.name ?? "";
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-rule bg-paper-2 px-4 py-3">
        <div className="flex min-w-0 items-center gap-2">
          <svg
            viewBox="0 0 24 24"
            aria-hidden
            className="hm-check size-4 shrink-0 text-positive"
            style={{ ["--hm-draw-length" as string]: 22 }}
          >
            <path
              d="M4 12.5 9 17.5 20 6.5"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <h3 className="display text-sm text-ink">
            Published · {placed.length} session{placed.length === 1 ? "" : "s"}
          </h3>
        </div>
        <button
          type="button"
          onClick={onReset}
          className={cx(buttonClass("secondary", "sm"), "nowrap-affordance")}
        >
          Back to the board
        </button>
      </div>

      <ol className="divide-y divide-rule">
        {placed.map(({ talk, at }) => (
          <li
            key={talk.id}
            className="flex min-w-0 items-start gap-3 px-4 py-3"
          >
            <span className="wordmark tnum w-12 shrink-0 pt-0.5 text-xs text-muted-foreground">
              {at.slot}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-medium text-ink">
                {talk.title}
              </span>
              <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                {[roomName(at.roomId), talk.speakers, talk.track]
                  .filter(Boolean)
                  .join(" · ")}
              </span>
            </span>
          </li>
        ))}
      </ol>

      <p className="border-t border-rule px-4 py-3 text-xs leading-relaxed text-muted-foreground">
        This is the attendee&rsquo;s view of {formatDate(day)} — no login, an{" "}
        <code>.ics</code> feed per speaker, and a personal schedule anyone can
        export.
      </p>
    </div>
  );
}
