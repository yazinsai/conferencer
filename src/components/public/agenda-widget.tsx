"use client";

import { useMemo, useState } from "react";
import { ExpandableText } from "@/components/public/expandable-text";
import { ScheduleLabel } from "@/components/public/schedule-label";
import { SessionTags } from "@/components/public/session-tags";
import { SpeakerAvatar } from "@/components/public/speaker-avatar";
import {
  dayKey,
  formatDayLabel,
  formatSessionTime,
  speakerDisplayName,
  speakerTitleLine,
} from "@/lib/public/format";
import type { PublicRoom, PublicSession } from "@/lib/public/program";

function groupByDay(sessions: PublicSession[], timezone: string) {
  const scheduled = sessions.filter((s) => s.startsAt);
  const unscheduled = sessions.filter((s) => !s.startsAt);
  const days = new Map<string, PublicSession[]>();

  for (const session of scheduled) {
    const key = dayKey(session.startsAt!, timezone);
    const list = days.get(key) ?? [];
    list.push(session);
    days.set(key, list);
  }

  for (const [, list] of days) {
    list.sort((a, b) => (a.startsAt ?? "").localeCompare(b.startsAt ?? ""));
  }

  const sortedDays = Array.from(days.entries()).sort(([a], [b]) =>
    a.localeCompare(b),
  );

  return { sortedDays, unscheduled };
}

function SessionDetailPanel({
  session,
  timezone,
  onClose,
}: {
  session: PublicSession;
  timezone: string;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
      <div
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="session-detail-title"
      >
        <div className="sticky top-0 flex items-center justify-between border-b border-slate-100 bg-white px-5 py-4">
          <h2 id="session-detail-title" className="text-lg font-semibold">
            Session details
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100"
          >
            Back
          </button>
        </div>
        <div className="space-y-4 p-5">
          <SessionTags track={session.track} format={session.format} />
          <h3 className="text-xl font-semibold text-slate-900">{session.title}</h3>
          {session.schedulePublished && session.startsAt ? (
            <p className="text-sm text-slate-600">
              {formatDayLabel(session.startsAt, timezone)}
              {" · "}
              {formatSessionTime(session.startsAt, timezone)}
              {session.endsAt
                ? ` – ${formatSessionTime(session.endsAt, timezone)}`
                : ""}
              {session.room ? ` · ${session.room.name}` : ""}
            </p>
          ) : (
            <p className="text-sm italic text-slate-500">Schedule to be announced</p>
          )}
          <ExpandableText text={session.description} />
          {session.speakers.length > 0 ? (
            <div>
              <h4 className="text-sm font-semibold text-slate-900">Speakers</h4>
              <ul className="mt-2 space-y-2">
                {session.speakers.map((sp) => (
                  <li key={sp.id} className="flex items-center gap-2">
                    <SpeakerAvatar
                      firstName={sp.firstName}
                      lastName={sp.lastName}
                      headshotUrl={sp.headshotUrl}
                      size="sm"
                    />
                    <div>
                      <p className="text-sm font-medium">
                        {speakerDisplayName(sp.firstName, sp.lastName)}
                      </p>
                      {speakerTitleLine(sp.jobTitle, sp.company) ? (
                        <p className="text-xs text-slate-500">
                          {speakerTitleLine(sp.jobTitle, sp.company)}
                        </p>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function AgendaGrid({
  sessions,
  rooms,
  timezone,
  onSelect,
}: {
  sessions: PublicSession[];
  rooms: PublicRoom[];
  timezone: string;
  onSelect: (session: PublicSession) => void;
}) {
  const minHour = 8;
  const maxHour = 18;
  const pxPerMinute = 1.2;

  const blocks = sessions
    .filter((s) => s.startsAt)
    .map((session) => {
      const start = new Date(session.startsAt!);
      const end = session.endsAt ? new Date(session.endsAt) : new Date(start.getTime() + 30 * 60000);
      const startParts = new Intl.DateTimeFormat("en-US", {
        timeZone: timezone,
        hour: "numeric",
        minute: "numeric",
        hour12: false,
      }).formatToParts(start);
      const hour = Number(startParts.find((p) => p.type === "hour")?.value ?? 9);
      const minute = Number(startParts.find((p) => p.type === "minute")?.value ?? 0);
      const top = (hour - minHour) * 60 * pxPerMinute + minute * pxPerMinute;
      const durationMin = Math.max(15, (end.getTime() - start.getTime()) / 60000);
      const roomIndex = rooms.findIndex((r) => r.id === session.room?.id);
      return { session, top, height: durationMin * pxPerMinute, roomIndex };
    });

  const hours = Array.from({ length: maxHour - minHour + 1 }, (_, i) => minHour + i);

  return (
    <div className="overflow-x-auto">
      <div
        className="grid min-w-[640px] gap-0"
        style={{
          gridTemplateColumns: `4rem repeat(${Math.max(rooms.length, 1)}, minmax(8rem, 1fr))`,
        }}
      >
        <div className="border-r border-slate-200 bg-slate-50">
          {hours.map((h) => (
            <div
              key={h}
              className="border-b border-slate-100 pr-2 text-right text-xs text-slate-500"
              style={{ height: 60 * pxPerMinute }}
            >
              {h === 12 ? "12 PM" : h > 12 ? `${h - 12} PM` : `${h} AM`}
            </div>
          ))}
        </div>
        {rooms.map((room) => (
          <div
            key={room.id}
            className="relative border-r border-slate-100"
            style={{ height: (maxHour - minHour) * 60 * pxPerMinute }}
          >
            <div
              className="sticky top-0 z-10 border-b border-slate-200 bg-white px-2 py-2 text-center text-xs font-semibold text-slate-700"
              style={{ borderTopColor: room.color, borderTopWidth: 3 }}
            >
              {room.name}
            </div>
            {blocks
              .filter((b) => b.session.room?.id === room.id)
              .map(({ session, top, height }) => (
                <button
                  key={session.id}
                  type="button"
                  onClick={() => onSelect(session)}
                  className="absolute left-1 right-1 overflow-hidden rounded-md border border-slate-200 bg-white p-1.5 text-left text-xs shadow-sm transition hover:shadow-md"
                  style={{
                    top: top + 28,
                    height: Math.max(height, 36),
                    borderLeftColor: session.track?.color ?? "#2563eb",
                    borderLeftWidth: 3,
                  }}
                >
                  <p className="font-semibold leading-tight text-slate-900 line-clamp-2">
                    {session.title}
                  </p>
                  {session.startsAt ? (
                    <p className="mt-0.5 text-[10px] text-slate-500">
                      {formatSessionTime(session.startsAt, timezone)}
                    </p>
                  ) : null}
                  {session.track ? (
                    <p className="mt-0.5 truncate text-[10px] text-slate-500">
                      {session.track.name}
                    </p>
                  ) : null}
                </button>
              ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function AgendaList({
  sessions,
  timezone,
  onSelect,
}: {
  sessions: PublicSession[];
  timezone: string;
  onSelect: (session: PublicSession) => void;
}) {
  return (
    <div className="space-y-2 md:hidden">
      {sessions.map((session) => (
        <button
          key={session.id}
          type="button"
          onClick={() => onSelect(session)}
          className="w-full rounded-lg border border-slate-200 bg-white p-3 text-left shadow-sm"
          style={{
            borderLeftColor: session.track?.color ?? "#2563eb",
            borderLeftWidth: 4,
          }}
        >
          <p className="text-xs text-slate-500">
            {session.startsAt
              ? formatSessionTime(session.startsAt, timezone)
              : "TBD"}
            {session.room ? ` · ${session.room.name}` : ""}
          </p>
          <p className="mt-1 font-medium text-slate-900">{session.title}</p>
          {session.track ? (
            <p className="mt-1 text-xs text-slate-500">{session.track.name}</p>
          ) : null}
        </button>
      ))}
    </div>
  );
}

export function AgendaWidget({
  sessions,
  timezone,
  schedulePublished,
}: {
  sessions: PublicSession[];
  timezone: string;
  schedulePublished: boolean;
}) {
  const { sortedDays, unscheduled } = useMemo(
    () => groupByDay(sessions, timezone),
    [sessions, timezone],
  );
  const [dayIndex, setDayIndex] = useState(0);
  const [selected, setSelected] = useState<PublicSession | null>(null);

  const currentDay = sortedDays[dayIndex];
  const daySessions = currentDay?.[1] ?? [];

  const rooms = useMemo(() => {
    const map = new Map<string, PublicRoom>();
    for (const s of daySessions) {
      if (s.room) map.set(s.room.id, s.room);
    }
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [daySessions]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Agenda</h1>
        <p className="mt-1 text-sm text-slate-600">
          Day-by-day schedule{schedulePublished ? "" : " (times coming soon)"}.
        </p>
      </div>

      {!schedulePublished ? (
        <p className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          The agenda schedule has not been published yet. Sessions are listed
          below without times.
        </p>
      ) : null}

      {sortedDays.length > 0 ? (
        <>
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              disabled={dayIndex === 0}
              onClick={() => setDayIndex((i) => i - 1)}
              className="rounded-md border border-slate-200 px-3 py-1.5 text-sm disabled:opacity-40"
              aria-label="Previous day"
            >
              ←
            </button>
            <p className="text-center text-sm font-semibold text-slate-900">
              {currentDay
                ? formatDayLabel(currentDay[1][0]!.startsAt!, timezone)
                : ""}
            </p>
            <button
              type="button"
              disabled={dayIndex >= sortedDays.length - 1}
              onClick={() => setDayIndex((i) => i + 1)}
              className="rounded-md border border-slate-200 px-3 py-1.5 text-sm disabled:opacity-40"
              aria-label="Next day"
            >
              →
            </button>
          </div>

          <div className="hidden md:block">
            <AgendaGrid
              sessions={daySessions}
              rooms={rooms}
              timezone={timezone}
              onSelect={setSelected}
            />
          </div>
          <div className="md:hidden">
            <AgendaList
              sessions={daySessions}
              timezone={timezone}
              onSelect={setSelected}
            />
          </div>
        </>
      ) : null}

      {unscheduled.length > 0 ? (
        <section>
          <h2 className="text-lg font-semibold text-slate-900">Unscheduled</h2>
          <ul className="mt-3 space-y-2">
            {unscheduled.map((session) => (
              <li key={session.id}>
                <button
                  type="button"
                  onClick={() => setSelected(session)}
                  className="w-full rounded-lg border border-slate-200 bg-white p-3 text-left text-sm hover:bg-slate-50"
                >
                  {session.title}
                </button>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {sortedDays.length === 0 && unscheduled.length === 0 ? (
        <p className="text-sm text-slate-500">No sessions scheduled yet.</p>
      ) : null}

      {selected ? (
        <SessionDetailPanel
          session={selected}
          timezone={timezone}
          onClose={() => setSelected(null)}
        />
      ) : null}
    </div>
  );
}
