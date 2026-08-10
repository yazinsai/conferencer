export type Condition = {
  question_id: string;
  operator: "equals" | "not_equals" | "in";
  value: string | string[];
};

export function parseCondition(raw: string | null | undefined): Condition | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Condition;
  } catch {
    return null;
  }
}

export function evaluateCondition(
  condition: Condition | null,
  answers: Record<string, unknown>,
): boolean {
  if (!condition) return true;
  const actual = answers[condition.question_id];
  const actualStr = Array.isArray(actual)
    ? actual.map(String)
    : actual == null
      ? ""
      : String(actual);

  switch (condition.operator) {
    case "equals":
      return Array.isArray(actualStr)
        ? actualStr.includes(String(condition.value))
        : actualStr === String(condition.value);
    case "not_equals":
      return Array.isArray(actualStr)
        ? !actualStr.includes(String(condition.value))
        : actualStr !== String(condition.value);
    case "in": {
      const list = Array.isArray(condition.value)
        ? condition.value.map(String)
        : String(condition.value)
            .split(",")
            .map((s) => s.trim());
      if (Array.isArray(actualStr)) {
        return actualStr.some((v) => list.includes(v));
      }
      return list.includes(actualStr);
    }
    default:
      return true;
  }
}
