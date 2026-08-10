"use client";

import { useMemo, useState } from "react";
import { ExpandableText } from "@/components/public/expandable-text";
import { ScheduleLabel } from "@/components/public/schedule-label";
import { SpeakerAvatar } from "@/components/public/speaker-avatar";
import {
  speakerDisplayName,
  speakerTitleLine,
} from "@/lib/public/format";
import type { PublicSpeakerWithSessions } from "@/lib/public/program";
import { Input } from "@/components/ui/input";

function GalleryDetailModal({
  speaker,
  timezone,
  onClose,
}: {
  speaker: PublicSpeakerWithSessions;
  timezone: string;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
      <div
        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-xl bg-white shadow-xl"
        role="dialog"
        aria-modal="true"
      >
        <div className="sticky top-0 flex justify-end border-b border-slate-100 bg-white p-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100"
          >
            Close
          </button>
        </div>
        <div className="flex flex-col items-center p-6 text-center">
          <SpeakerAvatar
            firstName={speaker.firstName}
            lastName={speaker.lastName}
            headshotUrl={speaker.headshotUrl}
            size="xl"
          />
          <h2 className="mt-4 text-xl font-semibold text-slate-900">
            {speakerDisplayName(speaker.firstName, speaker.lastName)}
          </h2>
          {speaker.jobTitle ? (
            <p className="mt-1 text-slate-700">{speaker.jobTitle}</p>
          ) : (
            <p className="mt-1 text-sm italic text-slate-400">Title TBD</p>
          )}
          {speaker.company ? (
            <p className="text-slate-500">{speaker.company}</p>
          ) : null}
        </div>
        <div className="space-y-4 border-t border-slate-100 px-6 pb-6">
          {speaker.biography ? (
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Bio</h3>
              <ExpandableText text={speaker.biography} className="mt-2" maxLength={200} />
            </div>
          ) : null}
          <div>
            <h3 className="text-sm font-semibold text-slate-900">
              Sessions ({speaker.sessions.length})
            </h3>
            <ul className="mt-2 space-y-2">
              {speaker.sessions.map((session) => (
                <li
                  key={session.id}
                  className="rounded-lg border border-slate-100 bg-slate-50 p-3 text-left"
                >
                  <p className="text-sm font-medium text-slate-900">{session.title}</p>
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
          </div>
        </div>
      </div>
    </div>
  );
}

export function GalleryWidget({
  speakers,
  timezone,
}: {
  speakers: PublicSpeakerWithSessions[];
  timezone: string;
}) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<PublicSpeakerWithSessions | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return speakers;
    return speakers.filter((s) =>
      speakerDisplayName(s.firstName, s.lastName).toLowerCase().includes(q),
    );
  }, [speakers, query]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Speaker gallery</h1>
        <p className="mt-1 text-sm text-slate-600">
          A visual directory of conference speakers.
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <Input
          type="search"
          placeholder="Search by name…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search speakers"
        />
        <p className="mt-2 text-sm text-slate-500">
          {filtered.length} speaker{filtered.length === 1 ? "" : "s"}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {filtered.map((speaker) => (
          <button
            key={speaker.id}
            type="button"
            onClick={() => setSelected(speaker)}
            className="flex flex-col items-center rounded-xl border border-slate-200 bg-white p-4 text-center shadow-sm transition hover:shadow-md"
          >
            <SpeakerAvatar
              firstName={speaker.firstName}
              lastName={speaker.lastName}
              headshotUrl={speaker.headshotUrl}
              size="lg"
            />
            <p className="mt-3 text-sm font-semibold text-slate-900 line-clamp-2">
              {speakerDisplayName(speaker.firstName, speaker.lastName)}
            </p>
            {speaker.jobTitle ? (
              <p className="mt-1 text-xs text-slate-600 line-clamp-2">
                {speaker.jobTitle}
              </p>
            ) : (
              <p className="mt-1 text-xs italic text-slate-400">Title TBD</p>
            )}
            {speaker.company ? (
              <p className="text-xs text-slate-500 line-clamp-1">{speaker.company}</p>
            ) : null}
          </button>
        ))}
      </div>

      {selected ? (
        <GalleryDetailModal
          speaker={selected}
          timezone={timezone}
          onClose={() => setSelected(null)}
        />
      ) : null}
    </div>
  );
}
