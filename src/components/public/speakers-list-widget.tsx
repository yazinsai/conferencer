"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ExpandableText } from "@/components/public/expandable-text";
import { SpeakerAvatar } from "@/components/public/speaker-avatar";
import { speakerDisplayName } from "@/lib/public/format";
import type { PublicSpeakerWithSessions } from "@/lib/public/program";
import { Input } from "@/components/ui/input";

export function SpeakersListWidget({
  slug,
  speakers,
}: {
  slug: string;
  speakers: PublicSpeakerWithSessions[];
}) {
  const [query, setQuery] = useState("");

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
        <h1 className="text-2xl font-semibold text-slate-900">Speakers</h1>
        <p className="mt-1 text-sm text-slate-600">
          Meet the people behind the sessions.
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <Input
          type="search"
          placeholder="Search speakers…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search speakers"
        />
        <p className="mt-2 text-sm text-slate-500">
          {filtered.length} speaker{filtered.length === 1 ? "" : "s"}
        </p>
      </div>

      <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white shadow-sm">
        {filtered.map((speaker) => (
          <li key={speaker.id}>
            <Link
              href={`/e/${slug}/speakers/${speaker.id}`}
              className="flex items-start gap-4 p-4 transition hover:bg-slate-50"
            >
              <SpeakerAvatar
                firstName={speaker.firstName}
                lastName={speaker.lastName}
                headshotUrl={speaker.headshotUrl}
              />
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-slate-900">
                  {speakerDisplayName(speaker.firstName, speaker.lastName)}
                </p>
                {speaker.jobTitle ? (
                  <p className="text-sm text-slate-700">{speaker.jobTitle}</p>
                ) : null}
                {speaker.company ? (
                  <p className="text-sm text-slate-500">{speaker.company}</p>
                ) : null}
                {speaker.biography ? (
                  <p className="mt-2 line-clamp-2 text-sm text-slate-600">
                    {speaker.biography}
                  </p>
                ) : null}
                <p className="mt-1 text-xs text-slate-400">
                  {speaker.sessions.length} session
                  {speaker.sessions.length === 1 ? "" : "s"}
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function SpeakerSessionsList({
  slug,
  speaker,
  timezone,
}: {
  slug: string;
  speaker: PublicSpeakerWithSessions;
  timezone: string;
}) {
  return (
    <section>
      <h2 className="text-lg font-semibold text-slate-900">
        Sessions ({speaker.sessions.length})
      </h2>
      <ul className="mt-3 space-y-3">
        {speaker.sessions.map((session) => (
          <li
            key={session.id}
            className="rounded-lg border border-slate-100 bg-slate-50 p-3"
          >
            <p className="font-medium text-slate-900">{session.title}</p>
            {session.schedulePublished && session.startsAt ? (
              <p className="mt-1 text-sm text-slate-600">
                {new Intl.DateTimeFormat("en-US", {
                  timeZone: timezone,
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                }).format(new Date(session.startsAt))}
                {session.endsAt
                  ? ` – ${new Intl.DateTimeFormat("en-US", {
                      timeZone: timezone,
                      hour: "numeric",
                      minute: "2-digit",
                    }).format(new Date(session.endsAt))}`
                  : ""}
                {session.room ? ` · ${session.room.name}` : ""}
              </p>
            ) : (
              <p className="mt-1 text-sm italic text-slate-500">
                Schedule to be announced
              </p>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

export function SpeakerDetailHeader({
  speaker,
}: {
  speaker: PublicSpeakerWithSessions;
}) {
  return (
    <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
      <SpeakerAvatar
        firstName={speaker.firstName}
        lastName={speaker.lastName}
        headshotUrl={speaker.headshotUrl}
        size="xl"
      />
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">
          {speakerDisplayName(speaker.firstName, speaker.lastName)}
        </h1>
        {speaker.jobTitle ? (
          <p className="mt-1 text-slate-700">{speaker.jobTitle}</p>
        ) : null}
        {speaker.company ? (
          <p className="text-slate-500">{speaker.company}</p>
        ) : null}
      </div>
    </div>
  );
}

export function SpeakerBio({ biography }: { biography: string | null }) {
  if (!biography) return null;
  return (
    <section>
      <h2 className="text-lg font-semibold text-slate-900">Bio</h2>
      <ExpandableText text={biography} className="mt-2" maxLength={280} />
    </section>
  );
}
