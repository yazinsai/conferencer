export type TimedSession = {
  id: string;
  title: string;
  startsAt: string | null;
  endsAt: string | null;
  locationId: string | null;
  participantContactIds: string[];
};

function overlaps(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date) {
  return aStart < bEnd && bStart < aEnd;
}

export type Conflict = {
  type: "speaker" | "room";
  sessionAId: string;
  sessionBId: string;
  sessionATitle: string;
  sessionBTitle: string;
  detail: string;
};

export function detectConflicts(sessions: TimedSession[]): Conflict[] {
  const conflicts: Conflict[] = [];
  const scheduled = sessions.filter((s) => s.startsAt && s.endsAt);
  for (let i = 0; i < scheduled.length; i++) {
    for (let j = i + 1; j < scheduled.length; j++) {
      const a = scheduled[i];
      const b = scheduled[j];
      const aStart = new Date(a.startsAt!);
      const aEnd = new Date(a.endsAt!);
      const bStart = new Date(b.startsAt!);
      const bEnd = new Date(b.endsAt!);
      if (!overlaps(aStart, aEnd, bStart, bEnd)) continue;

      if (a.locationId && a.locationId === b.locationId) {
        conflicts.push({
          type: "room",
          sessionAId: a.id,
          sessionBId: b.id,
          sessionATitle: a.title,
          sessionBTitle: b.title,
          detail: "Same room at overlapping times",
        });
      }

      const shared = a.participantContactIds.filter((id) =>
        b.participantContactIds.includes(id),
      );
      if (shared.length) {
        conflicts.push({
          type: "speaker",
          sessionAId: a.id,
          sessionBId: b.id,
          sessionATitle: a.title,
          sessionBTitle: b.title,
          detail: `Speaker double-booked (${shared.length} shared)`,
        });
      }
    }
  }
  return conflicts;
}

export function hasRoomConflict(
  sessions: TimedSession[],
  candidate: TimedSession,
): boolean {
  if (!candidate.startsAt || !candidate.endsAt || !candidate.locationId) {
    return false;
  }
  const cStart = new Date(candidate.startsAt);
  const cEnd = new Date(candidate.endsAt);
  return sessions.some((s) => {
    if (s.id === candidate.id) return false;
    if (!s.startsAt || !s.endsAt || !s.locationId) return false;
    if (s.locationId !== candidate.locationId) return false;
    return overlaps(cStart, cEnd, new Date(s.startsAt), new Date(s.endsAt));
  });
}
