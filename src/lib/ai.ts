import { stripHtml } from "./fields";

export type AiVerdict = { score: number; rationale: string; model: string };

/**
 * First-pass triage score (R-EVL-15 / ABS-14).
 *
 * Uses an LLM when OPENAI_API_KEY is set; otherwise falls back to a transparent
 * rubric that reads the actual abstract — specificity, evidence, takeaway,
 * structure and length — so the rationale still quotes the submission rather
 * than emitting boilerplate. The UI always labels which one produced the score.
 */
export async function scoreSubmission(input: {
  title: string;
  abstract: string;
  track?: string | null;
  format?: string | null;
  takeaway?: string | null;
}): Promise<AiVerdict> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (apiKey) {
    try {
      return await scoreWithLlm(input, apiKey);
    } catch {
      // fall through to the local rubric
    }
  }
  return scoreLocally(input);
}

async function scoreWithLlm(
  input: { title: string; abstract: string; track?: string | null; format?: string | null },
  apiKey: string,
): Promise<AiVerdict> {
  const model = process.env.OPENAI_MODEL ?? "gpt-4o-mini";
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You are a conference programme committee member. Score the proposal from 1 to 5 and justify it in two sentences that quote specifics from the abstract. Reply as JSON: {\"score\": number, \"rationale\": string}.",
        },
        {
          role: "user",
          content: `Title: ${input.title}\nTrack: ${input.track ?? "unknown"}\nFormat: ${
            input.format ?? "unknown"
          }\nAbstract: ${stripHtml(input.abstract)}`,
        },
      ],
    }),
  });
  if (!response.ok) throw new Error(`OpenAI responded ${response.status}`);
  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const parsed = JSON.parse(data.choices?.[0]?.message?.content ?? "{}") as {
    score?: number;
    rationale?: string;
  };
  return {
    score: Math.max(1, Math.min(5, Number(parsed.score ?? 3))),
    rationale: String(parsed.rationale ?? "No rationale returned."),
    model,
  };
}

const NUMBER = /\b\d+([.,]\d+)?\s*(%|x|×|minutes?|mins?|hours?|engineers?|teams?|k|m)\b/gi;
const VAGUE = ["synergy", "leverage", "revolutionary", "game-changing", "best practices", "deep dive"];

function scoreLocally(input: {
  title: string;
  abstract: string;
  track?: string | null;
  takeaway?: string | null;
}): AiVerdict {
  const text = stripHtml(input.abstract);
  const words = text.split(/\s+/).filter(Boolean);
  const notes: string[] = [];
  let score = 3;

  const numbers = text.match(NUMBER) ?? [];
  if (numbers.length >= 2) {
    score += 1;
    notes.push(`cites concrete figures (${numbers.slice(0, 3).join(", ")})`);
  } else if (numbers.length === 0) {
    score -= 0.5;
    notes.push("no measurable outcomes are quoted");
  }

  const failure = /(fail|failed|mistake|went wrong|postmortem|regret|did not work)/i.test(text);
  if (failure) {
    score += 0.5;
    notes.push("includes what did not work, which usually reads as an honest talk");
  }

  if (words.length < 60) {
    score -= 1;
    notes.push(`the abstract is only ${words.length} words, too thin to judge properly`);
  } else if (words.length > 90) {
    notes.push(`the abstract is substantive at ${words.length} words`);
  }

  const takeaway = (input.takeaway ?? "").trim();
  if (takeaway) {
    score += 0.5;
    notes.push(`states a takeaway: “${takeaway.slice(0, 80)}”`);
  } else {
    notes.push("no explicit audience takeaway");
  }

  const vague = VAGUE.filter((phrase) => text.toLowerCase().includes(phrase));
  if (vague.length) {
    score -= 0.5;
    notes.push(`leans on filler phrasing (${vague.join(", ")})`);
  }

  const topicWords = topicsIn(`${input.title} ${text}`);
  if (topicWords.length) {
    notes.push(`covers ${topicWords.slice(0, 4).join(", ")}`);
  }

  const clamped = Math.max(1, Math.min(5, Math.round(score * 2) / 2));
  return {
    score: clamped,
    rationale: `${input.title}: ${notes.join("; ")}.`,
    model: "conferencer-rubric-v1",
  };
}

const TOPIC_TERMS = [
  "ci", "continuous integration", "monorepo", "build", "cache", "caching", "remote execution",
  "test selection", "kubernetes", "platform", "observability", "tracing", "llm", "agent",
  "prompt", "retrieval", "rag", "vector", "postgres", "database", "migration", "sdk",
  "documentation", "docs", "release", "deployment", "rollback", "feature flag", "codemod",
  "developer experience", "productivity", "evaluation", "benchmark",
];

function topicsIn(text: string): string[] {
  const lower = text.toLowerCase();
  return TOPIC_TERMS.filter((term) => lower.includes(term));
}
