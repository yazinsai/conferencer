type SubmissionInput = {
  title: string;
  description: string | null;
  level: string | null;
};

const POSITIVE_KEYWORDS = [
  "innovation",
  "innovative",
  "research",
  "case study",
  "practical",
  "hands-on",
  "implementation",
  "results",
  "impact",
  "scalable",
  "architecture",
  "best practice",
  "lessons learned",
  "data",
  "analysis",
  "framework",
  "methodology",
  "novel",
  "solution",
];

const LEVEL_SCORES: Record<string, number> = {
  beginner: 1,
  introductory: 1,
  intermediate: 2,
  advanced: 3,
  expert: 3,
};

export type AiScoreResult = {
  score: number;
  reasoning: string;
};

export function computeAiFirstPassScore(submission: SubmissionInput): AiScoreResult {
  const plainDescription = (submission.description ?? "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const title = submission.title.trim();
  const combined = `${title} ${plainDescription}`.toLowerCase();

  let points = 0;
  const factors: string[] = [];

  const descLen = plainDescription.length;
  if (descLen >= 800) {
    points += 3;
    factors.push("detailed description (800+ characters)");
  } else if (descLen >= 400) {
    points += 2;
    factors.push("solid description length (400+ characters)");
  } else if (descLen >= 150) {
    points += 1;
    factors.push("brief but adequate description");
  } else {
    factors.push("description is very short");
  }

  const matchedKeywords = POSITIVE_KEYWORDS.filter((kw) => combined.includes(kw));
  if (matchedKeywords.length >= 4) {
    points += 3;
    factors.push(`strong topical keywords (${matchedKeywords.slice(0, 4).join(", ")})`);
  } else if (matchedKeywords.length >= 2) {
    points += 2;
    factors.push(`relevant keywords (${matchedKeywords.join(", ")})`);
  } else if (matchedKeywords.length === 1) {
    points += 1;
    factors.push(`keyword match: ${matchedKeywords[0]}`);
  } else {
    factors.push("few topical keywords detected");
  }

  const levelKey = (submission.level ?? "").toLowerCase();
  const levelPoints =
    Object.entries(LEVEL_SCORES).find(([key]) => levelKey.includes(key))?.[1] ?? 1;
  points += levelPoints;
  if (submission.level) {
    factors.push(`audience level: ${submission.level}`);
  } else {
    factors.push("no audience level specified");
  }

  if (title.length >= 20) {
    points += 1;
    factors.push("descriptive title");
  }

  const score = Math.min(10, Math.max(1, Math.round(points)));
  const reasoning = `AI first-pass (heuristic): score ${score}/10 based on ${factors.join("; ")}. This is not a human review — use as a starting point only.`;

  return { score, reasoning };
}
