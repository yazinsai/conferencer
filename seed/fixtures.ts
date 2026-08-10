/**
 * Demo data for DevFlow Conf 2027 (REQUIREMENTS §15 / research/evals/sample-data.json).
 *
 * Every persona is seeded twice — once with the address in sample-data.json and once
 * with the address the evaluation scenarios use — both pointing at the same contact,
 * so whichever credential the evaluator has works.
 */

export const ORG = { name: "Latent Space Events", slug: "latent-space-events" };

export const EVENT = {
  name: "DevFlow Conf 2027",
  slug: "devflow-conf-2027",
  tagline: "The developer workflow conference",
  theme:
    "A three-day, three-track conference on developer tooling, AI-assisted engineering, and platform infrastructure.",
  location: "Moscone West, San Francisco, CA",
  website_url: "https://devflowconf.example.com",
  timezone: "America/Los_Angeles",
  starts_at: "2027-05-12T09:00",
  ends_at: "2027-05-14T17:00",
  accent_color: "#4f46e5",
  type: "conference",
};

export const TRACKS = [
  { name: "AI Engineering", color: "#7c3aed" },
  { name: "Platform & Infra", color: "#0ea5e9" },
  { name: "Developer Experience", color: "#059669" },
];

export const FORMATS = [
  { name: "Keynote (45 min)", duration: 45, color: "#f43f5e" },
  { name: "Talk (30 min)", duration: 30, color: "#4f46e5" },
  { name: "Lightning Talk (10 min)", duration: 10, color: "#f59e0b" },
  { name: "Workshop (120 min)", duration: 120, color: "#0d9488" },
  { name: "Panel (45 min)", duration: 45, color: "#8b5cf6" },
];

export const ROOMS = [
  { name: "Main Stage", capacity: 900 },
  { name: "Room 2A", capacity: 220 },
  { name: "Room 2B", capacity: 180 },
  { name: "Workshop Lab", capacity: 60 },
];

export const TAGS = ["CI/CD", "Testing", "LLMs", "Observability", "Culture", "Open Source"];
export const LEVELS = ["Beginner", "Intermediate", "Advanced"];

export type PersonSeed = {
  key: string;
  first: string;
  last: string;
  email: string;
  altEmail?: string;
  password?: string;
  role: "organizer" | "reviewer" | "speaker";
  title?: string;
  company?: string;
  bio?: string;
  twitter?: string;
  linkedin?: string;
  website?: string;
  pronouns?: string;
  dietary?: string;
  tshirt?: string;
  travel?: string;
  speakerStatus?: string;
};

export const PEOPLE: PersonSeed[] = [
  {
    key: "jordan",
    first: "Jordan",
    last: "Alvarez",
    email: "sbek-organizer@example.com",
    altEmail: "jordan.organizer@sbek-test.example.com",
    password: "SbekTest!2027-org",
    role: "organizer",
    title: "Program Director",
    company: "DevFlow Conf",
    bio: "Jordan runs the DevFlow Conf programme and has been producing developer events for a decade.",
  },
  {
    key: "priya",
    first: "Priya",
    last: "Raman",
    email: "sbek-speaker@example.com",
    altEmail: "priya.speaker@sbek-test.example.com",
    password: "SbekTest!2027-spk",
    role: "speaker",
    title: "Principal Engineer",
    company: "Latticework Systems",
    bio: "Priya Raman is a Principal Engineer at Latticework Systems where she leads the build-tooling platform team. She previously maintained the open-source task runner 'gantry' and has spoken at over a dozen developer conferences on build systems, CI reliability, and developer productivity metrics.",
    twitter: "https://x.com/priyabuilds",
    linkedin: "https://www.linkedin.com/in/priya-raman-example",
    pronouns: "she/her",
    dietary: "Vegetarian",
    tshirt: "M",
    speakerStatus: "confirmed",
  },
  {
    key: "marcus",
    first: "Marcus",
    last: "Okafor",
    email: "sbek-speaker2@example.com",
    altEmail: "marcus.speaker@sbek-test.example.com",
    password: "SbekTest!2027-spk2",
    role: "speaker",
    title: "Staff Developer Advocate",
    company: "Cloudreach Labs",
    bio: "Marcus Okafor is a Staff Developer Advocate at Cloudreach Labs focused on AI agents in production. He writes the newsletter 'Agents Weekly' and co-organizes the SF AI Tinkerers meetup.",
    linkedin: "https://www.linkedin.com/in/marcus-okafor-example",
    pronouns: "he/him",
    speakerStatus: "confirmed",
  },
  {
    key: "sam",
    first: "Sam",
    last: "Whitfield",
    email: "sbek-reviewer@example.com",
    altEmail: "sam.reviewer@sbek-test.example.com",
    password: "SbekTest!2027-rev",
    role: "reviewer",
    title: "Program Committee Reviewer",
    company: "Northgate Software",
  },
  {
    key: "robin",
    first: "Robin",
    last: "Chase",
    email: "robin.reviewer@example.com",
    password: "SbekTest!2027-rev2",
    role: "reviewer",
    title: "Head of Engineering",
    company: "Fernwood Labs",
  },
  {
    key: "grace",
    first: "Grace",
    last: "Nakamura",
    email: "grace.nakamura@example.com",
    role: "speaker",
    title: "Chief Technology Officer",
    company: "Tessellate",
    bio: "Grace Nakamura is CTO at Tessellate, where she has spent five years shrinking the distance between an idea and production. She writes about feedback loops and organisational design.",
    speakerStatus: "confirmed",
    tshirt: "S",
  },
  {
    key: "hugo",
    first: "Hugo",
    last: "Martins",
    email: "hugo.martins@example.com",
    role: "speaker",
    title: "Senior Site Reliability Engineer",
    company: "Vantage Point",
    bio: "Hugo Martins keeps large fleets boring. He works on progressive delivery, rollback safety and the unglamorous parts of reliability.",
    speakerStatus: "confirmed",
  },
  {
    key: "elena",
    first: "Elena",
    last: "Fischer",
    email: "elena.fischer@example.com",
    role: "speaker",
    title: "Head of Platform",
    company: "Brightline",
    bio: "Elena Fischer builds internal developer platforms that engineers actually want to use. She has led platform teams at three scale-ups.",
    speakerStatus: "confirmed",
    dietary: "Gluten free",
  },
  {
    key: "ana",
    first: "Ana",
    last: "Beltrán",
    email: "ana.beltran@example.com",
    role: "speaker",
    title: "VP of Engineering",
    company: "Northwind Data",
    bio: "Ana Beltrán has scaled engineering organisations from 12 to 300 people and is unreasonably interested in how teams measure themselves.",
    speakerStatus: "confirmed",
  },
  {
    key: "keiko",
    first: "Keiko",
    last: "Tanaka",
    email: "keiko.tanaka@example.com",
    role: "speaker",
    title: "Engineering Manager",
    company: "Lumen Works",
    bio: "Keiko Tanaka runs the developer productivity group at Lumen Works and has shipped three large-scale codemod migrations.",
    speakerStatus: "invited",
  },
  {
    key: "farid",
    first: "Farid",
    last: "Haddad",
    email: "farid.haddad@example.com",
    role: "speaker",
    title: "Principal Architect",
    company: "Meridian Systems",
    bio: "Farid Haddad works on observability for distributed systems and, lately, for agent workflows that refuse to stay deterministic.",
    speakerStatus: "confirmed",
  },
  {
    key: "iris",
    first: "Iris",
    last: "Oyelaran",
    email: "iris.oyelaran@example.com",
    role: "speaker",
    title: "Staff Machine Learning Engineer",
    company: "Corvid AI",
    bio: "Iris Oyelaran evaluates language-model systems for a living and is convinced most benchmarks are lying to you.",
    speakerStatus: "confirmed",
  },
  {
    key: "chen",
    first: "Chen",
    last: "Wei",
    email: "chen.wei@example.com",
    role: "speaker",
    title: "Staff Engineer",
    company: "Foldspace",
    bio: "Chen Wei works on retrieval infrastructure and has opinions about vector database benchmarks.",
    speakerStatus: "invited",
  },
  {
    key: "jonas",
    first: "Jonas",
    last: "Lindqvist",
    email: "jonas.lindqvist@example.com",
    role: "speaker",
    title: "Developer Advocate",
    company: "Blueshift",
    bio: "Jonas Lindqvist designs SDKs and developer onboarding flows, and collects release rituals from teams that ship on Fridays.",
    speakerStatus: "prospect",
  },
  {
    key: "dana",
    first: "Dana",
    last: "Kowalski",
    email: "dana.kowalski@example.com",
    role: "speaker",
    title: "Developer Experience Lead",
    company: "Kestrel Cloud",
    bio: "Dana Kowalski treats platform teams as product teams, complete with users, roadmaps and the occasional churn problem.",
    speakerStatus: "confirmed",
  },
];

export const FIXTURE_ABSTRACTS = {
  taming: {
    title: "Taming 40-Minute CI: Incremental Builds at Monorepo Scale",
    track: "Platform & Infra",
    format: "Talk (30 min)",
    level: "Intermediate",
    abstract:
      "Our monorepo CI took 40 minutes on a good day. This talk walks through how we cut it to 6 minutes with content-addressed caching, remote execution, and a test-selection model — including the two migrations that failed first. You'll leave with a decision framework for which incremental-build investments pay off at which repo sizes, and the graphs to convince your platform team.",
    takeaway: "A decision framework for which incremental-build investments pay off",
    notes:
      "Previously presented a 10-minute version at PlatformCon; this is the expanded version with new data.",
  },
  aiPair: {
    title: "Your AI Pair Programmer Is Lying to You: Verification Patterns That Scale",
    track: "AI Engineering",
    format: "Talk (30 min)",
    level: "Advanced",
    abstract:
      "Code generation is easy; trusting it is hard. This session covers verification patterns for AI-generated code — property tests, mutation coverage, snapshot judges, and CI gates — with data from 18 months of running them on a 200-engineer codebase. Includes what we stopped doing because it didn't catch anything.",
    takeaway: "Verification patterns that scale beyond code review",
    notes: "Can also be delivered as a 120-minute hands-on workshop if the committee prefers.",
  },
  docs: {
    title: "Docs That Answer Back: Retrieval-Grounded Documentation Sites",
    track: "Developer Experience",
    format: "Lightning Talk (10 min)",
    level: "Beginner",
    abstract:
      "A 10-minute tour of turning a static docs site into one that answers questions with citations, stays honest when it doesn't know, and costs under $50/month to run. Live demo, real failure cases, and a checklist you can apply to your own docs this week.",
    takeaway: "A checklist for grounding your docs in real answers",
    notes: "",
  },
};

export const REVIEW_COMMENT =
  "Strong practical content and a clear narrative arc; abstract could name the specific tooling used. Recommend accept for the Platform track.";

type SessionSeed = {
  title: string;
  track: string;
  format: string;
  level: string;
  abstract: string;
  takeaway: string;
  speakers: string[];
  day?: number;
  start?: string;
  end?: string;
  room?: string;
  tags?: string[];
};

/** Accepted, approved and scheduled — these fill the agenda and every widget. */
export const SCHEDULED_SESSIONS: SessionSeed[] = [
  {
    title: "Opening Keynote: The Ten-Minute Feedback Loop",
    track: "Developer Experience",
    format: "Keynote (45 min)",
    level: "Beginner",
    abstract:
      "Every engineering organisation is really a machine for shortening the distance between a question and its answer. This keynote looks at what changes structurally when that loop drops under ten minutes — in tooling, in team shape, and in what people are willing to attempt.",
    takeaway: "Why feedback-loop latency is the metric that moves every other metric",
    speakers: ["grace"],
    day: 0,
    start: "09:00",
    end: "09:45",
    room: "Main Stage",
    tags: ["Culture"],
  },
  {
    title: "Progressive Delivery Without the Drama",
    track: "Platform & Infra",
    format: "Talk (30 min)",
    level: "Intermediate",
    abstract:
      "Canaries, feature flags and automated rollback sound great until the first incident where all three disagree. Here is the decision tree we use, the four metrics that actually gate a rollout, and the postmortem that made us delete half our tooling.",
    takeaway: "A rollout gate that fails safe instead of failing loudly",
    speakers: ["hugo"],
    day: 0,
    start: "10:00",
    end: "10:30",
    room: "Room 2B",
    tags: ["Observability"],
  },
  {
    title: "Workshop: Building an Internal Developer Platform in a Day",
    track: "Platform & Infra",
    format: "Workshop (120 min)",
    level: "Intermediate",
    abstract:
      "A hands-on session where we build a working internal developer platform from an empty repository: golden paths, a service catalogue, a paved-road CI template and a self-service environment. Bring a laptop with Docker installed.",
    takeaway: "A running paved road you can take back to your team",
    speakers: ["elena"],
    day: 0,
    start: "11:00",
    end: "13:00",
    room: "Workshop Lab",
  },
  {
    title: "Panel: Who Owns Developer Productivity?",
    track: "Developer Experience",
    format: "Panel (45 min)",
    level: "Beginner",
    abstract:
      "Three engineering leaders argue about where developer productivity should live: in a platform team, in every team, or nowhere at all. Expect disagreement about metrics and at least one strong opinion about DORA.",
    takeaway: "Three org designs and the failure mode of each",
    speakers: ["ana", "keiko", "farid"],
    day: 0,
    start: "14:00",
    end: "14:45",
    room: "Main Stage",
    tags: ["Culture"],
  },
  {
    title: "Evaluating LLM Agents in CI",
    track: "AI Engineering",
    format: "Talk (30 min)",
    level: "Advanced",
    abstract:
      "Agent evaluations are flaky, expensive and easy to fool. This talk covers the harness we run on every pull request: deterministic seeds, judge calibration, cost budgets, and the tripwires that catch a regression before it reaches a customer.",
    takeaway: "An evaluation harness that survives contact with a real CI budget",
    speakers: ["iris"],
    day: 1,
    start: "09:30",
    end: "10:00",
    room: "Main Stage",
    tags: ["LLMs", "Testing"],
  },
  {
    title: "Ship It Friday: A Release Ritual That Works",
    track: "Developer Experience",
    format: "Lightning Talk (10 min)",
    level: "Beginner",
    abstract:
      "Ten minutes on the release ritual that took us from monthly, terrifying deployments to Friday afternoon shrugs — and the three rules we never break.",
    takeaway: "A release ritual you can adopt on Monday",
    speakers: ["jonas"],
    day: 1,
    start: "10:15",
    end: "10:25",
    room: "Room 2A",
    tags: ["Culture"],
  },
  {
    title: "Vector Databases in Production: What the Benchmarks Miss",
    track: "AI Engineering",
    format: "Talk (30 min)",
    level: "Intermediate",
    abstract:
      "Recall@10 on a static corpus tells you almost nothing about a retrieval system that ingests two million documents a day. We cover index rebuild strategies, hybrid search tuning and the operational costs nobody puts in the benchmark table.",
    takeaway: "The operational numbers to ask a vendor for",
    speakers: ["chen"],
    day: 1,
    start: "11:00",
    end: "11:30",
    room: "Room 2B",
    tags: ["LLMs"],
  },
  {
    title: "Prompt Regression Testing for Real Products",
    track: "AI Engineering",
    format: "Talk (30 min)",
    level: "Intermediate",
    abstract:
      "Prompts are code with none of the safety. This session shows how we version prompts, snapshot their outputs, score drift with a cheap judge, and gate deploys on the result — plus what happened the week we turned the gate off.",
    takeaway: "A prompt CI gate that costs less than a coffee per run",
    speakers: ["marcus"],
    day: 1,
    start: "14:00",
    end: "14:30",
    room: "Room 2A",
    tags: ["LLMs", "Testing"],
  },
  {
    title: "Platform Teams as Product Teams",
    track: "Platform & Infra",
    format: "Talk (30 min)",
    level: "Intermediate",
    abstract:
      "If your platform has users, it has churn, onboarding and a roadmap. We ran our platform group as a product team for two years: here is the research cadence, the adoption metric we settled on, and the two features we deleted.",
    takeaway: "An adoption metric that survives an exec review",
    speakers: ["dana"],
    day: 2,
    start: "10:00",
    end: "10:30",
    room: "Main Stage",
  },
  {
    title: "Observability for AI Agents",
    track: "AI Engineering",
    format: "Talk (30 min)",
    level: "Advanced",
    abstract:
      "Traces for agent runs look nothing like traces for request/response services: they branch, retry and argue with themselves. This talk covers the span model we settled on, cost attribution per step, and how to debug a run that took forty tool calls.",
    takeaway: "A span model for non-deterministic workflows",
    speakers: ["farid"],
    day: 2,
    start: "11:00",
    end: "11:30",
    room: "Room 2B",
    tags: ["Observability", "LLMs"],
  },
];

/** Accepted but deliberately unscheduled — the agenda tray and auto-place assist. */
export const UNSCHEDULED_SESSIONS: SessionSeed[] = [
  {
    title: "Lightning: Agents in Production Q&A",
    track: "AI Engineering",
    format: "Lightning Talk (10 min)",
    level: "Beginner",
    abstract:
      "An open Q&A on running agents in production: cost control, guardrails, evaluation and the failure modes that only show up at scale.",
    takeaway: "Answers to the questions you cannot ask a vendor",
    speakers: ["marcus"],
  },
  {
    title: "Refactoring at Scale with Codemods",
    track: "Developer Experience",
    format: "Talk (30 min)",
    level: "Advanced",
    abstract:
      "Three large migrations, two of which went badly. What we learned about writing codemods that reviewers trust, rolling them out incrementally, and knowing when to give up and do it by hand.",
    takeaway: "A migration playbook with an escape hatch",
    speakers: ["keiko"],
  },
];

/** Everything else, so every status tab is populated. */
export const OTHER_SUBMISSIONS: Array<SessionSeed & { status: string }> = [
  {
    title: "Zero-Downtime Postgres Migrations",
    track: "Platform & Infra",
    format: "Talk (30 min)",
    level: "Intermediate",
    abstract:
      "Expand-contract, backfills that do not melt the primary, and the lock that took us down for nine minutes. A practical guide to changing schemas while people are using them.",
    takeaway: "A migration checklist that respects your primary",
    speakers: ["hugo"],
    status: "pending",
  },
  {
    title: "Designing SDKs Developers Actually Love",
    track: "Developer Experience",
    format: "Talk (30 min)",
    level: "Beginner",
    abstract:
      "What we changed after watching forty developers try our SDK for the first time: naming, defaults, errors that teach, and the quickstart that stopped being a lie.",
    takeaway: "Five SDK design rules backed by usability testing",
    speakers: ["jonas"],
    status: "pending",
  },
  {
    title: "Provenance for CI Artifacts",
    track: "Platform & Infra",
    format: "Talk (30 min)",
    level: "Advanced",
    abstract:
      "Supply-chain attestation without turning your build pipeline into a compliance project. What SLSA actually requires, and the 80% you can get in an afternoon.",
    takeaway: "The minimum viable attestation setup",
    speakers: ["chen"],
    status: "decline_queue",
  },
  {
    title: "Ten Rust Tricks for Faster Build Tools",
    track: "Platform & Infra",
    format: "Lightning Talk (10 min)",
    level: "Advanced",
    abstract:
      "A rapid tour of the profiling wins that made our build tool three times faster, most of which were not about Rust at all.",
    takeaway: "Profiling habits that beat micro-optimisation",
    speakers: ["ana"],
    status: "declined",
  },
  {
    title: "Why We Rewrote Everything in Go (And What It Cost)",
    track: "Platform & Infra",
    format: "Talk (30 min)",
    level: "Intermediate",
    abstract:
      "An honest accounting of an eighteen-month rewrite: what got better, what got worse, and the six months nobody budgeted for.",
    takeaway: "A rewrite decision framework with real numbers",
    speakers: ["farid"],
    status: "declined",
  },
  {
    title: "The Case for Monoliths in 2027",
    track: "Platform & Infra",
    format: "Talk (30 min)",
    level: "Beginner",
    abstract: "A contrarian look at what teams gave up when they split the monolith.",
    takeaway: "When not to distribute your system",
    speakers: ["iris"],
    status: "withdrawn",
  },
];

export const SPEAKERS_CSV = `First Name,Last Name,Email,Job Title,Company,Biography,Speaker Status
Priya,Raman,sbek-speaker@example.com,Principal Engineer,Latticework Systems,"Priya Raman is a Principal Engineer at Latticework Systems where she leads the build-tooling platform team.",Confirmed
Marcus,Okafor,sbek-speaker2@example.com,Staff Developer Advocate,Cloudreach Labs,"Marcus Okafor is a Staff Developer Advocate at Cloudreach Labs focused on AI agents in production.",Confirmed
Dana,Kowalski,dana.kowalski@example.com,Developer Experience Lead,Kestrel Cloud,"Dana Kowalski treats platform teams as product teams.",Invited
`;
