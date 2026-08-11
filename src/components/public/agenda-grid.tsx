import Link from "next/link";

import { formatTime, minutesOfDay } from "@/lib/datetime";
import type { Lookup } from "@/lib/repo/events";
import { cx } from "@/components/ui";

export type GridBlock = {
  id: string;
  title: string;
  roomId: string | null;
  startsAt: string | null;
  endsAt: string | null;
  trackName?: string | null;
  trackColor?: string | null;
  formatName?: string | null;
  speakers?: string | null;
  conflict?: boolean;
  href?: string;
};

const PX_PER_MIN = 1.6;
const MIN_BLOCK_MIN = 20;

/**
 * Room-columns × time-gutter grid, server rendered. Shared by the public agenda
 * (EMB-06) and the organizer's Rooms view (R-AGN-7).
 */
export function AgendaGrid({
  rooms,
  blocks,
  emptyLabel = "Nothing scheduled on this day yet.",
  zoom = 1,
  renderCell,
}: {
  rooms: Lookup[];
  blocks: GridBlock[];
  emptyLabel?: string;
  zoom?: number;
  renderCell?: (room: Lookup, minute: number) => React.ReactNode;
}) {
  const times = blocks
    .map((b) => minutesOfDay(b.startsAt))
    .filter((n): n is number => n !== null);
  const ends = blocks
    .map((b) => minutesOfDay(b.endsAt) ?? (minutesOfDay(b.startsAt) ?? 0) + 30)
    .filter((n): n is number => n !== null);

  if (!blocks.length) {
    return (
      <div className="rounded-lg border border-dashed border-rule-2 bg-paper px-6 py-10 text-center text-sm text-muted-foreground">
        {emptyLabel}
      </div>
    );
  }

  const startMin = Math.max(0, Math.floor((Math.min(...times) - 30) / 60) * 60);
  const endMin = Math.min(24 * 60, Math.ceil((Math.max(...ends) + 30) / 60) * 60);
  const scale = PX_PER_MIN * zoom;
  const height = (endMin - startMin) * scale;
  const hours: number[] = [];
  for (let m = startMin; m <= endMin; m += 60) hours.push(m);

  return (
    <div className="overflow-x-auto rounded-card border border-rule bg-paper">
      <div className="min-w-[720px]">
        <div
          className="grid border-b border-rule bg-paper-2 wordmark text-[0.6875rem] uppercase tracking-[0.12em] text-muted-foreground"
          style={{ gridTemplateColumns: `72px repeat(${rooms.length}, minmax(150px, 1fr))` }}
        >
          <div className="px-2 py-2">Time</div>
          {rooms.map((room) => (
            <div key={room.id} className="border-l border-rule px-2 py-2 text-neutral">
              {room.name}
            </div>
          ))}
        </div>
        <div
          className="relative grid"
          style={{
            gridTemplateColumns: `72px repeat(${rooms.length}, minmax(150px, 1fr))`,
            height,
          }}
        >
          <div className="relative border-r border-rule">
            {hours.map((m) => (
              <div
                key={m}
                className="absolute left-0 w-full pr-2 text-right font-mono text-[11px] text-muted-foreground"
                style={{ top: (m - startMin) * scale - 6 }}
              >
                {formatTime(`2000-01-01T${String(Math.floor(m / 60)).padStart(2, "0")}:00`)}
              </div>
            ))}
          </div>
          {rooms.map((room) => (
            <div key={room.id} className="relative border-l border-rule">
              {hours.map((m) => (
                <div
                  key={m}
                  className="absolute left-0 w-full border-t border-rule"
                  style={{ top: (m - startMin) * scale }}
                />
              ))}
              {renderCell
                ? hours.flatMap((m) => [m, m + 30]).map((m) =>
                    m < endMin ? (
                      <div
                        key={`cell-${m}`}
                        className="absolute left-0 w-full"
                        style={{ top: (m - startMin) * scale, height: 30 * scale }}
                      >
                        {renderCell(room, m)}
                      </div>
                    ) : null,
                  )
                : null}
              {blocks
                .filter((b) => b.roomId === room.id)
                .map((block) => {
                  const s = minutesOfDay(block.startsAt) ?? startMin;
                  const e = Math.max(
                    (minutesOfDay(block.endsAt) ?? s + 30),
                    s + MIN_BLOCK_MIN,
                  );
                  const body = (
                    <>
                      <p className="truncate text-xs font-semibold text-ink">
                        {block.title}
                      </p>
                      <p className="truncate text-[11px] text-muted-foreground">
                        {formatTime(block.startsAt)}
                        {block.endsAt ? ` – ${formatTime(block.endsAt)}` : ""}
                      </p>
                      {block.trackName ? (
                        <p className="truncate text-[11px] font-medium" style={{ color: block.trackColor ?? undefined }}>
                          {block.trackName}
                        </p>
                      ) : null}
                      {block.speakers ? (
                        <p className="truncate text-[11px] text-muted-foreground">{block.speakers}</p>
                      ) : null}
                    </>
                  );
                  const style = {
                    top: (s - startMin) * scale + 2,
                    height: (e - s) * scale - 4,
                    borderLeftColor: block.trackColor ?? "var(--color-rule-2)",
                  };
                  const className = cx(
                    "absolute left-1 right-1 overflow-hidden rounded-lg border border-rule border-l-[3px] bg-paper p-1.5 shadow-[var(--shadow-card)]",
                    block.conflict && "ring-2 ring-red-400",
                  );
                  return block.href ? (
                    <Link
                      key={block.id}
                      href={block.href}
                      className={cx(className, "hover:shadow-md")}
                      style={style}
                    >
                      {block.conflict ? (
                        <span
                          className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500"
                          aria-label="Scheduling conflict"
                        />
                      ) : null}
                      {body}
                    </Link>
                  ) : (
                    <div key={block.id} className={className} style={style}>
                      {body}
                    </div>
                  );
                })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
