import { describe, expect, it } from "vitest";
import { applyMergeFields } from "./merge";

describe("applyMergeFields", () => {
  it("replaces known fields", () => {
    expect(
      applyMergeFields("Hi {speaker_name} — {talk_title}", {
        speaker_name: "Priya Raman",
        talk_title: "Taming CI",
      }),
    ).toBe("Hi Priya Raman — Taming CI");
  });

  it("blanks missing fields", () => {
    expect(applyMergeFields("X {missing} Y", {})).toBe("X  Y");
  });
});
