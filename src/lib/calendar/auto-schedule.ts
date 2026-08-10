import {
  combineDateAndTime,
  eventDayKeys,
} from "@/lib/calendar/agenda-dates";
import {
  detectConflicts,
  hasRoomConflict,
  type TimedSession,
} from "@/lib/domain/conflicts";

export type AutoScheduleInput = {
  eventStartsAt: string;
  eventEndsAt: string;
  rooms: Array<{ id: string; name: string }>;
  scheduled: TimedSession[];
  unscheduled: Array<{
    id: string;
    title: string;
    participantContactIds: string[];
    durationMinutes: number;
  }>;
  workingHours?: { start: string; end: string };
  gridStepMinutes?: number;
};

export type DraftPlacement = {
  submissionId: string;
  title: string;
  startsAt: string;
  endsAt: string;
  locationId: string;
  roomName: string;
  speakerWarning?: boolean;
};

export type AutoScheduleResult = {
  placements: DraftPlacement[];
  unplaced: Array<{ submissionId: string; title: string; reason: string }>;
  speakerWarnings: number;
};

const DEFAULT_WORKING_HOURS = { start: "09:00", end: "17:00" };
const DEFAULT_GRID_STEP = 30;
const DEFAULT_DURATION = 30;

function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function speakerConflictAt(
  sessions: TimedSession[],
  candidate: TimedSession,
): boolean {
  const combined = [...sessions, candidate];
  return detectConflicts(combined).some((c) => c.type === "speaker");
}

export function computeAutoScheduleDraft(
  input: AutoScheduleInput,
): AutoScheduleResult {
  const {
    eventStartsAt,
    eventEndsAt,
    rooms,
    scheduled,
    unscheduled,
    workingHours = DEFAULT_WORKING_HOURS,
    gridStepMinutes = DEFAULT_GRID_STEP,
  } = input;

  if (!rooms.length) {
    return {
      placements: [],
      unplaced: unscheduled.map((s) => ({
        submissionId: s.id,
        title: s.title,
        reason: "No rooms configured",
      })),
      speakerWarnings: 0,
    };
  }

  const days = eventDayKeys(eventStartsAt, eventEndsAt);
  const workStart = timeToMinutes(workingHours.start);
  const workEnd = timeToMinutes(workingHours.end);
  const occupied: TimedSession[] = [...scheduled];
  const placements: DraftPlacement[] = [];
  const unplaced: AutoScheduleResult["unplaced"] = [];
  let speakerWarnings = 0;

  const sorted = [...unscheduled].sort((a, b) =>
    a.title.localeCompare(b.title),
  );

  for (const session of sorted) {
    const duration = session.durationMinutes || DEFAULT_DURATION;
    let placed = false;

    outer: for (const day of days) {
      for (const room of rooms) {
        for (
          let startMin = workStart;
          startMin + duration <= workEnd;
          startMin += gridStepMinutes
        ) {
          const startTime = minutesToTime(startMin);
          const endTime = minutesToTime(startMin + duration);
          const startsAt = combineDateAndTime(day, startTime, eventStartsAt);
          const endsAt = combineDateAndTime(day, endTime, eventStartsAt);

          const candidate: TimedSession = {
            id: session.id,
            title: session.title,
            startsAt,
            endsAt,
            locationId: room.id,
            participantContactIds: session.participantContactIds,
          };

          if (hasRoomConflict(occupied, candidate)) continue;

          const speakerWarn = speakerConflictAt(occupied, candidate);
          if (speakerWarn) continue;

          occupied.push(candidate);
          placements.push({
            submissionId: session.id,
            title: session.title,
            startsAt,
            endsAt,
            locationId: room.id,
            roomName: room.name,
          });
          placed = true;
          break outer;
        }
      }
    }

    if (!placed) {
      // Second pass: allow speaker conflicts with warning
      outerWarn: for (const day of days) {
        for (const room of rooms) {
          for (
            let startMin = workStart;
            startMin + duration <= workEnd;
            startMin += gridStepMinutes
          ) {
            const startTime = minutesToTime(startMin);
            const endTime = minutesToTime(startMin + duration);
            const startsAt = combineDateAndTime(day, startTime, eventStartsAt);
            const endsAt = combineDateAndTime(day, endTime, eventStartsAt);

            const candidate: TimedSession = {
              id: session.id,
              title: session.title,
              startsAt,
              endsAt,
              locationId: room.id,
              participantContactIds: session.participantContactIds,
            };

            if (hasRoomConflict(occupied, candidate)) continue;

            const speakerWarn = speakerConflictAt(occupied, candidate);
            occupied.push(candidate);
            placements.push({
              submissionId: session.id,
              title: session.title,
              startsAt,
              endsAt,
              locationId: room.id,
              roomName: room.name,
              speakerWarning: speakerWarn,
            });
            if (speakerWarn) speakerWarnings++;
            placed = true;
            break outerWarn;
          }
        }
      }
    }

    if (!placed) {
      unplaced.push({
        submissionId: session.id,
        title: session.title,
        reason: "No conflict-free slot available within working hours",
      });
    }
  }

  return { placements, unplaced, speakerWarnings };
}
