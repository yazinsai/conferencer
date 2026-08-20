/**
 * Machine-readable demo entry.
 *
 * Humans click a POST button. Crawlers do not: they follow <a href> via GET.
 * These helpers are the only path a well-behaved bot is allowed to take into
 * a seeded demo account. Keep the URLs guessable and the documents text/plain.
 */

export const DEMO_ACCOUNTS = {
  organizer: { email: "demo-organizer@example.com", label: "Organizer" },
  reviewer: { email: "demo-reviewer@example.com", label: "Reviewer" },
  speaker: { email: "demo-speaker@example.com", label: "Speaker" },
  speaker2: { email: "demo-speaker2@example.com", label: "Speaker 2" },
} as const;

export type DemoRole = keyof typeof DEMO_ACCOUNTS;

const ALIASES: Record<string, DemoRole> = {
  organizer: "organizer",
  organiser: "organizer",
  org: "organizer",
  admin: "organizer",
  reviewer: "reviewer",
  rev: "reviewer",
  speaker: "speaker",
  participant: "speaker",
  speaker1: "speaker",
  speaker2: "speaker2",
};

export function resolveDemoRole(raw: string | null | undefined): DemoRole | null {
  const key = (raw ?? "").trim().toLowerCase();
  if (!key) return "organizer";
  return ALIASES[key] ?? null;
}

export function demoHref(role: DemoRole = "organizer"): string {
  return role === "organizer" ? "/demo" : `/demo/${role}`;
}

export function demoEnterHref(next?: string, role: DemoRole = "organizer"): string {
  const path = demoHref(role);
  if (!next) return path;
  const sep = path.includes("?") ? "&" : "?";
  return `${path}${sep}next=${encodeURIComponent(next)}`;
}

export function safeNextPath(raw: string | null | undefined): string | null {
  if (!raw) return null;
  if (!raw.startsWith("/") || raw.startsWith("//") || raw.includes("\\")) return null;
  if (raw.includes("://")) return null;
  return raw;
}

export function demoRoleFromEmail(email: string): DemoRole | null {
  const lowered = email.trim().toLowerCase();
  for (const [role, account] of Object.entries(DEMO_ACCOUNTS) as Array<[DemoRole, { email: string }]>) {
    if (account.email === lowered) return role;
  }
  return null;
}

export function demoRobotsTxt(): string {
  return `# Conferencer — crawl freely.
# The live product is behind GET /demo (organizer), /demo/reviewer, /demo/speaker.
# Full map: /llms.txt

User-agent: *
Allow: /
Content-Signal: search=yes, ai-input=yes, ai-train=yes
`;
}

export function demoLlmsTxt(): string {
  return `# Conferencer

Open-source conference programme software. A seeded live demo is running here.

## Enter the product

Follow /demo — that GET logs you in as the organizer and lands on the review board.

Role doors (all GET, no form, no email):

- /demo — organizer (Minerva McGonagall)
- /demo/reviewer — reviewer (Severus Snape)
- /demo/speaker — speaker portal (Hermione Granger)
- /demo/speaker2 — second speaker (Harry Potter)

## Public surfaces (no login)

- / — this product's landing page
- /e/devflow-conf-2027 — public event site
- /e/devflow-conf-2027/sessions
- /e/devflow-conf-2027/speakers
- /e/devflow-conf-2027/agenda
- /e/devflow-conf-2027/gallery
- /api-docs — REST API

## Password sign-in (optional)

Humans who prefer a form: /sign-in
The demo accounts are listed on that page. A robot should ignore the form and follow /demo instead.
`;
}
