import { describe, expect, it } from "vitest";
import { detectConflicts, hasRoomConflict } from "./conflicts";

const base = {
  startsAt: "2027-05-12T10:00:00-07:00",
  endsAt: "2027-05-12T10:30:00-07:00",
  locationId: "room-a",
  participantContactIds: ["c1"],
};

describe("detectConflicts", () => {
  it("flags room overlap", () => {
    const conflicts = detectConflicts([
      { id: "a", title: "A", ...base },
      {
        id: "b",
        title: "B",
        ...base,
        startsAt: "2027-05-12T10:15:00-07:00",
        endsAt: "2027-05-12T10:45:00-07:00",
        participantContactIds: ["c2"],
      },
    ]);
    expect(conflicts.some((c) => c.type === "room")).toBe(true);
  });

  it("flags speaker double-booking", () => {
    const conflicts = detectConflicts([
      { id: "a", title: "A", ...base },
      {
        id: "b",
        title: "B",
        ...base,
        locationId: "room-b",
        startsAt: "2027-05-12T10:15:00-07:00",
        endsAt: "2027-05-12T10:45:00-07:00",
        participantContactIds: ["c1"],
      },
    ]);
    expect(conflicts.some((c) => c.type === "speaker")).toBe(true);
  });

  it("no conflict when non-overlapping", () => {
    const conflicts = detectConflicts([
      { id: "a", title: "A", ...base },
      {
        id: "b",
        title: "B",
        ...base,
        startsAt: "2027-05-12T11:00:00-07:00",
        endsAt: "2027-05-12T11:30:00-07:00",
      },
    ]);
    expect(conflicts).toHaveLength(0);
  });
});

describe("hasRoomConflict", () => {
  it("blocks same room overlap for candidate", () => {
    expect(
      hasRoomConflict(
        [{ id: "a", title: "A", ...base, participantContactIds: [] }],
        {
          id: "b",
          title: "B",
          startsAt: "2027-05-12T10:15:00-07:00",
          endsAt: "2027-05-12T10:45:00-07:00",
          locationId: "room-a",
          participantContactIds: [],
        },
      ),
    ).toBe(true);
  });
});
