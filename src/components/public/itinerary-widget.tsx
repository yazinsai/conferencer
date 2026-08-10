"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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
import type { PublicSession } from "@/lib/public/program";
import { Input, Select } from "@/components/ui/input";

function storageKey(slug: string) {
  return `conferencer-itinerary-${slug}`;
}

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

  return {
    sortedDays: Array.from(days.entries()).sort(([a], [b]) => a.localeCompare(b)),
    unscheduled,
  };
}

export function ItineraryWidget({
  slug,
  sessions,
  timezone,
  schedulePublished,
}: {
  slug: string;
  sessions: PublicSession[];
  timezone: string;
  schedulePublished: boolean;
}) {
  const [query, setQuery] = useState("");
  const [trackId, setTrackId] = useState("");
  const [dayIndex, setDayIndex] = useState(0);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [showMine, setShowMine] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey(slug));
      if (raw) setSavedIds(new Set(JSON.parse(raw) as string[]));
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, [slug]);

  const persist = useCallback(
    (ids: Set<string>) => {
      setSavedIds(ids);
      try {
        localStorage.setItem(storageKey(slug), JSON.stringify([...ids]));
      } catch {
        /* ignore */
      }
    },
    [slug],
  );

  const toggleSave = (id: string) => {
    const next = new Set(savedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    persist(next);
  };

  const tracks = useMemo(() => {
    const map = new Map<string, string>();
    for (const s of sessions) {
      if (s.track) map.set(s.track.id, s.track.name);
    }
    return Array.from(map.entries())
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [sessions]);

  const filteredSessions = useMemo(() => {
    const q = query.trim().toLowerCase();
    return sessions.filter((session) => {
      if (showMine && !savedIds.has(session.id)) return false;
      if (trackId && session.track?.id !== trackId) return false;
      if (!q) return true;
      if (session.title.toLowerCase().includes(q)) return true;
      return session.speakers.some((sp) =>
        speakerDisplayName(sp.firstName, sp.lastName).toLowerCase().includes(q),
      );
    });
  }, [sessions, query, trackId, showMine, savedIds]);

  const { sortedDays, unscheduled } = useMemo(
    () => groupByDay(filteredSessions, timezone),
    [filteredSessions, timezone],
  );

  const currentDay = sortedDays[dayIndex];
  const daySessions = currentDay?.[1] ?? [];

  const savedSessions = useMemo(
    () =>
      sessions
        .filter((s) => savedIds.has(s.id))
        .sort((a, b) => (a.startsAt ?? "").localeCompare(b.startsAt ?? "")),
    [sessions, savedIds],
  );

  const exportIcs = () => {
    const lines = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Conferencer//Itinerary//EN",
    ];
    for (const session of savedSessions) {
      if (!session.startsAt) continue;
      const start = new Date(session.startsAt).toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
      const end = session.endsAt
        ? new Date(session.endsAt).toISOString().replace(/[-:]/g, "").split(".")[0] + "Z"
        : start;
      lines.push(
        "BEGIN:VEVENT",
        `UID:${session.id}@conferencer`,
        `DTSTART:${start}`,
        `DTEND:${end}`,
        `SUMMARY:${session.title.replace(/[,;\\]/g, "")}`,
        session.room ? `LOCATION:${session.room.name}` : "",
        "END:VEVENT",
      );
    }
    lines.push("END:VCALENDAR");
    const blob = new Blob([lines.filter(Boolean).join("\r\n")], {
      type: "text/calendar",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${slug}-my-schedule.ics`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Itinerary</h1>
        <p className="mt-1 text-sm text-slate-600">
          Browse the program day by day. Star sessions to build your personal schedule.
        </p>
      </div>

      <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <Input
          type="search"
          placeholder="Search sessions…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div className="flex flex-wrap gap-2">
          {tracks.length > 0 ? (
            <Select
              value={trackId}
              onChange={(e) => setTrackId(e.target.value)}
              className="w-auto min-w-[10rem]"
            >
              <option value="">All tracks</option>
              {tracks.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </Select>
          ) : null}
          <button
            type="button"
            onClick={() => setShowMine((v) => !v)}
            className={`rounded-md px-3 py-2 text-sm font-medium ${
              showMine
                ? "bg-[var(--event-accent,#2563eb)] text-white"
                : "border border-slate-200 text-slate-700"
            }`}
          >
            My schedule ({savedIds.size})
          </button>
          {savedIds.size > 0 ? (
            <button
              type="button"
              onClick={exportIcs}
              className="rounded-md border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Export .ics
            </button>
          ) : null}
        </div>
      </div>

      {showMine ? (
        <section className="rounded-xl border border-blue-200 bg-blue-50 p-4">
          <h2 className="font-semibold text-slate-900">My schedule</h2>
          {!hydrated ? (
            <p className="mt-2 text-sm text-slate-500">Loading…</p>
          ) : savedSessions.length === 0 ? (
            <p className="mt-2 text-sm text-slate-600">
              Star sessions below to add them here.
            </p>
          ) : (
            <ul className="mt-3 space-y-2">
              {savedSessions.map((session) => (
                <li
                  key={session.id}
                  className="rounded-lg bg-white p-3 text-sm shadow-sm"
                >
                  <p className="font-medium">{session.title}</p>
                  <ScheduleLabel
                    className="mt-1"
                    startsAt={session.startsAt}
                    endsAt={session.endsAt}
                    roomName={session.room?.name ?? null}
                    timezone={timezone}
                    schedulePublished={session.schedulePublished}
                  />
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : null}

      {sortedDays.length > 0 ? (
        <>
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              disabled={dayIndex === 0}
              onClick={() => setDayIndex((i) => i - 1)}
              className="rounded-md border border-slate-200 px-3 py-1.5 text-sm disabled:opacity-40"
            >
              ←
            </button>
            <p className="text-center text-sm font-semibold">
              {currentDay
                ? formatDayLabel(currentDay[1][0]!.startsAt!, timezone)
                : ""}
            </p>
            <button
              type="button"
              disabled={dayIndex >= sortedDays.length - 1}
              onClick={() => setDayIndex((i) => i + 1)}
              className="rounded-md border border-slate-200 px-3 py-1.5 text-sm disabled:opacity-40"
            >
              →
            </button>
          </div>

          <div className="space-y-4">
            {daySessions.map((session) => (
              <ItineraryCard
                key={session.id}
                session={session}
                timezone={timezone}
                saved={savedIds.has(session.id)}
                onToggleSave={() => toggleSave(session.id)}
              />
            ))}
          </div>
        </>
      ) : null}

      {!schedulePublished && unscheduled.length > 0 ? (
        <section>
          <h2 className="text-lg font-semibold">Sessions</h2>
          <div className="mt-3 space-y-4">
            {unscheduled.map((session) => (
              <ItineraryCard
                key={session.id}
                session={session}
                timezone={timezone}
                saved={savedIds.has(session.id)}
                onToggleSave={() => toggleSave(session.id)}
              />
            ))}
          </div>
        </section>
      ) : null}

      {sortedDays.length === 0 && unscheduled.length === 0 ? (
        <p className="text-sm text-slate-500">No sessions to show.</p>
      ) : null}
    </div>
  );
}

function ItineraryCard({
  session,
  timezone,
  saved,
  onToggleSave,
}: {
  session: PublicSession;
  timezone: string;
  saved: boolean;
  onToggleSave: () => void;
}) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <SessionTags track={session.track} format={session.format} />
        <button
          type="button"
          onClick={onToggleSave}
          className={`shrink-0 text-xl leading-none ${
            saved ? "text-amber-500" : "text-slate-300 hover:text-amber-400"
          }`}
          aria-label={saved ? "Remove from my schedule" : "Add to my schedule"}
          title={saved ? "Remove from my schedule" : "Add to my schedule"}
        >
          ★
        </button>
      </div>
      <h2 className="mt-2 text-lg font-semibold text-slate-900">{session.title}</h2>
      <ExpandableText text={session.description} className="mt-2" />
      <ScheduleLabel
        className="mt-3"
        startsAt={session.startsAt}
        endsAt={session.endsAt}
        roomName={session.room?.name ?? null}
        timezone={timezone}
        schedulePublished={session.schedulePublished}
      />
      {session.startsAt && session.schedulePublished ? (
        <p className="mt-1 text-xs text-slate-500">
          {formatSessionTime(session.startsAt, timezone)}
          {session.endsAt
            ? ` – ${formatSessionTime(session.endsAt, timezone)}`
            : ""}
        </p>
      ) : null}
      {session.speakers.length > 0 ? (
        <ul className="mt-4 space-y-2 border-t border-slate-100 pt-4">
          {session.speakers.map((speaker) => (
            <li key={speaker.id} className="flex items-center gap-3">
              <SpeakerAvatar
                firstName={speaker.firstName}
                lastName={speaker.lastName}
                headshotUrl={speaker.headshotUrl}
                size="sm"
              />
              <div>
                <p className="text-sm font-medium text-slate-900">
                  {speakerDisplayName(speaker.firstName, speaker.lastName)}
                </p>
                {speakerTitleLine(speaker.jobTitle, speaker.company) ? (
                  <p className="text-xs text-slate-500">
                    {speakerTitleLine(speaker.jobTitle, speaker.company)}
                  </p>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      ) : null}
    </article>
  );
}
