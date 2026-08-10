/**
 * Show-when rules (R-FORM-6). Evaluated on the server when validating/storing and
 * in the browser as the submitter types, so a hidden question is never required
 * and never stored.
 */

export type Condition = {
  question_id: string;
  operator: "equals" | "not_equals" | "in" | "contains" | "is_empty" | "is_not_empty";
  value: string;
};

export type AnswerMap = Record<string, unknown>;

export function parseCondition(raw: unknown): Condition | null {
  if (!raw) return null;
  let value = raw;
  if (typeof raw === "string") {
    const trimmed = raw.trim();
    if (!trimmed || trimmed === "null") return null;
    try {
      value = JSON.parse(trimmed);
    } catch {
      return null;
    }
  }
  if (!value || typeof value !== "object") return null;
  const c = value as Record<string, unknown>;
  if (!c.question_id) return null;
  return {
    question_id: String(c.question_id),
    operator: (String(c.operator ?? "equals") as Condition["operator"]) ?? "equals",
    value: c.value === undefined || c.value === null ? "" : String(c.value),
  };
}

function normalize(value: unknown): string[] {
  if (value === undefined || value === null) return [];
  if (Array.isArray(value)) return value.map((v) => String(v).trim()).filter(Boolean);
  const s = String(value).trim();
  return s ? [s] : [];
}

export function conditionMet(condition: Condition | null, answers: AnswerMap): boolean {
  if (!condition) return true;
  const actual = normalize(answers[condition.question_id]);
  const expected = condition.value
    .split("|")
    .map((v) => v.trim())
    .filter(Boolean);

  switch (condition.operator) {
    case "is_empty":
      return actual.length === 0;
    case "is_not_empty":
      return actual.length > 0;
    case "not_equals":
      return !actual.some((a) => expected.includes(a));
    case "in":
      return actual.some((a) => expected.includes(a));
    case "contains":
      return actual.some((a) =>
        expected.some((e) => a.toLowerCase().includes(e.toLowerCase())),
      );
    case "equals":
    default:
      return actual.some((a) => expected.includes(a));
  }
}

export const OPERATOR_LABELS: Record<Condition["operator"], string> = {
  equals: "is",
  not_equals: "is not",
  in: "is any of",
  contains: "contains",
  is_empty: "is empty",
  is_not_empty: "is not empty",
};

/**
 * Visible question ids given the current answers. Conditions may only reference
 * earlier questions, so a single pass in sort order is enough.
 */
export function visibleQuestionIds(
  questions: Array<{ id: string; condition?: unknown }>,
  answers: AnswerMap,
): Set<string> {
  const visible = new Set<string>();
  for (const q of questions) {
    const condition = parseCondition(q.condition);
    if (!condition) {
      visible.add(q.id);
      continue;
    }
    // A question whose controller is itself hidden stays hidden.
    if (!visible.has(condition.question_id) && questions.some((x) => x.id === condition.question_id)) {
      continue;
    }
    if (conditionMet(condition, answers)) visible.add(q.id);
  }
  return visible;
}
