/** Client-safe scorecard types and helpers (no DB imports). */

import { parseOptions } from "./fields";

export type ScorecardQuestion = {
  id: string;
  round_id: string;
  type: string;
  label: string;
  options: string;
  weight: number;
  min: number | null;
  max: number | null;
  is_required: number;
  sort_order: number;
};

export const SCORECARD_TYPES = [
  "scale_1_3",
  "scale_1_5",
  "scale_1_10",
  "numeric",
  "dropdown",
  "free_text",
  "file",
  "separator",
] as const;

export type ScorecardType = (typeof SCORECARD_TYPES)[number];

export const SCORECARD_TYPE_LABELS: Record<string, string> = {
  scale_1_3: "1–3 scale",
  scale_1_5: "1–5 scale",
  scale_1_10: "1–10 scale",
  numeric: "Numeric (min/max)",
  dropdown: "Dropdown with points",
  free_text: "Free text",
  file: "File upload",
  separator: "Section separator",
};

export type Scaleable = {
  type: string;
  min?: number | null;
  max?: number | null;
};

export function scaleRange(question: Scaleable): { min: number; max: number } | null {
  switch (question.type) {
    case "scale_1_3":
      return { min: 1, max: 3 };
    case "scale_1_5":
      return { min: 1, max: 5 };
    case "scale_1_10":
      return { min: 1, max: 10 };
    case "numeric":
      return { min: question.min ?? 0, max: question.max ?? 10 };
    default:
      return null;
  }
}

export function isScored(question: { type: string }): boolean {
  return (
    question.type.startsWith("scale_") ||
    question.type === "numeric" ||
    question.type === "dropdown"
  );
}

/**
 * The weighted score for one review.
 *
 * Lives here rather than in `repo/evaluations.ts` (which re-exports it) because it
 * is a pure function of questions and answers, and both the server action that
 * saves a review and the landing page's scorecard playable need it. The playable
 * running the product's own arithmetic is the difference between a demo and a
 * mock-up (design.md § Live product tiles, rule 1).
 */
export function computeScore(
  questions: ScorecardQuestion[],
  answers: Record<string, unknown>,
): { score: number | null; raw: number | null; weighted: boolean } {
  let weightedSum = 0;
  let weightTotal = 0;
  let rawSum = 0;
  let rawCount = 0;
  let anyWeighted = false;

  for (const question of questions) {
    if (!isScored(question)) continue;
    // Weight 0 means "collect it, but keep it out of the aggregate" — the default
    // for dropdown criteria such as Accept/Maybe/Reject recommendations.
    const weight = Number(question.weight ?? 1);
    if (!weight || weight <= 0) continue;
    const raw = answers[question.id];
    if (raw === undefined || raw === null || raw === "") continue;

    let value: number | null = null;
    let max = 5;
    if (question.type === "dropdown") {
      const options = parseOptions(question.options);
      const chosen = options.find((o) => o.value === String(raw) || o.label === String(raw));
      if (!chosen || chosen.points === undefined || Number.isNaN(chosen.points)) continue;
      value = Number(chosen.points);
      max = Math.max(...options.map((o) => Number(o.points ?? 0)), 1);
    } else {
      const range = scaleRange(question);
      if (!range) continue;
      value = Number(raw);
      if (Number.isNaN(value)) continue;
      max = range.max;
    }
    if (weight !== 1) anyWeighted = true;
    // Normalise onto a 1..5-style comparable scale then weight it.
    weightedSum += (value / max) * weight;
    weightTotal += weight;
    rawSum += value;
    rawCount += 1;
  }

  if (!weightTotal) return { score: null, raw: null, weighted: false };
  const maxScale = Math.max(
    ...questions
      .filter((q) => isScored(q) && Number(q.weight ?? 1) > 0)
      .map((q) => scaleRange(q)?.max ?? 5),
    1,
  );
  const score = Number(((weightedSum / weightTotal) * maxScale).toFixed(2));
  const raw = rawCount ? Number((rawSum / rawCount).toFixed(2)) : null;
  return { score, raw, weighted: anyWeighted };
}
