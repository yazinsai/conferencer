/** Client-safe scorecard types and helpers (no DB imports). */

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
