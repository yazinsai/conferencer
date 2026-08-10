import { describe, expect, it } from "vitest";
import { evaluateCondition, parseCondition } from "./conditions";

describe("parseCondition", () => {
  it("returns null for empty", () => {
    expect(parseCondition(null)).toBeNull();
    expect(parseCondition("")).toBeNull();
  });

  it("parses JSON", () => {
    expect(
      parseCondition(
        JSON.stringify({
          question_id: "q1",
          operator: "equals",
          value: "Workshop",
        }),
      ),
    ).toEqual({
      question_id: "q1",
      operator: "equals",
      value: "Workshop",
    });
  });
});

describe("evaluateCondition", () => {
  it("shows when no condition", () => {
    expect(evaluateCondition(null, {})).toBe(true);
  });

  it("equals / not_equals", () => {
    const cond = {
      question_id: "format",
      operator: "equals" as const,
      value: "Workshop (120 min)",
    };
    expect(
      evaluateCondition(cond, { format: "Workshop (120 min)" }),
    ).toBe(true);
    expect(evaluateCondition(cond, { format: "Talk (30 min)" })).toBe(false);
    expect(
      evaluateCondition(
        { ...cond, operator: "not_equals" },
        { format: "Talk (30 min)" },
      ),
    ).toBe(true);
  });

  it("in operator with csv value", () => {
    const cond = {
      question_id: "level",
      operator: "in" as const,
      value: "Beginner,Intermediate",
    };
    expect(evaluateCondition(cond, { level: "Beginner" })).toBe(true);
    expect(evaluateCondition(cond, { level: "Advanced" })).toBe(false);
  });
});
