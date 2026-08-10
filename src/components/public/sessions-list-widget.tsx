"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ExpandableText } from "@/components/public/expandable-text";
import { ScheduleLabel } from "@/components/public/schedule-label";
import { SessionTags } from "@/components/public/session-tags";
import { SpeakerAvatar } from "@/components/public/speaker-avatar";
import {
  speakerDisplayName,
  speakerTitleLine,
} from "@/lib/public/format";
import type { PublicSession } from "@/lib/public/program";
import { Input, Select } from "@/components/ui/input";

export function SessionsListWidget({
  slug,
  sessions,
  timezone,
}: {
  slug: string;
  sessions: PublicSession[];
  timezone: string;
}) {
  const [query, setQuery] = useState("");
  const [trackId, setTrackId] = useState("");
  const [formatId, setFormatId] = useState("");

  const tracks = useMemo(() => {
    const map = new Map<string, string>();
    for (const s of sessions) {
      if (s.track) map.set(s.track.id, s.track.name);
    }
    return Array.from(map.entries())
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [sessions]);

  const formats = useMemo(() => {
    const map = new Map<string, string>();
    for (const s of sessions) {
      if (s.format) map.set(s.format.id, s.format.name);
    }
    return Array.from(map.entries())
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [sessions]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return sessions.filter((session) => {
      if (trackId && session.track?.id !== trackId) return false;
      if (formatId && session.format?.id !== formatId) return false;
      if (!q) return true;
      if (session.title.toLowerCase().includes(q)) return true;
      return session.speakers.some((sp) =>
        speakerDisplayName(sp.firstName, sp.lastName).toLowerCase().includes(q),
      );
    });
  }, [sessions, query, trackId, formatId]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Sessions</h1>
        <p className="mt-1 text-sm text-slate-600">
          Browse the conference program.
        </p>
      </div>

      <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <Input
          type="search"
          placeholder="Search sessions or speakers…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search sessions"
        />
        <div className="flex flex-wrap gap-2">
          {tracks.length > 0 ? (
            <Select
              value={trackId}
              onChange={(e) => setTrackId(e.target.value)}
              className="w-auto min-w-[10rem]"
              aria-label="Filter by track"
            >
              <option value="">All tracks</option>
              {tracks.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </Select>
          ) : null}
          {formats.length > 0 ? (
            <Select
              value={formatId}
              onChange={(e) => setFormatId(e.target.value)}
              className="w-auto min-w-[10rem]"
              aria-label="Filter by format"
            >
              <option value="">All formats</option>
              {formats.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </Select>
          ) : null}
        </div>
        <p className="text-sm text-slate-500">
          {filtered.length === 0
            ? "No sessions match your filters"
            : `Showing ${filtered.length} of ${sessions.length} session${sessions.length === 1 ? "" : "s"}`}
        </p>
      </div>

      <div className="space-y-4">
        {filtered.map((session) => (
          <article
            key={session.id}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <SessionTags track={session.track} format={session.format} />
            <h2 className="mt-2 text-lg font-semibold text-slate-900">
              {session.title}
            </h2>
            <ExpandableText text={session.description} className="mt-2" />
            <ScheduleLabel
              className="mt-3"
              startsAt={session.startsAt}
              endsAt={session.endsAt}
              roomName={session.room?.name ?? null}
              timezone={timezone}
              schedulePublished={session.schedulePublished}
            />
            {session.speakers.length > 0 ? (
              <ul className="mt-4 space-y-2">
                {session.speakers.map((speaker) => (
                  <li key={speaker.id}>
                    <Link
                      href={`/e/${slug}/speakers/${speaker.id}`}
                      className="flex items-center gap-3 rounded-lg p-1 -ml-1 hover:bg-slate-50"
                    >
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
                    </Link>
                  </li>
                ))}
              </ul>
            ) : null}
          </article>
        ))}
      </div>
    </div>
  );
}
