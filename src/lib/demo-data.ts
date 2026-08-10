export type SubmissionStatus =
  | "accepted"
  | "accept_queue"
  | "pending"
  | "decline_queue"
  | "declined"
  | "withdrawn"
  | "draft";

export type Speaker = {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  initials: string;
  title: string;
  company: string;
  email: string;
  bio: string;
  status: "confirmed" | "invited" | "prospect";
  track: string;
  headshot?: string;
  tasks: number;
  tasksDone: number;
};

export type Session = {
  id: string;
  title: string;
  description: string;
  status: SubmissionStatus;
  approval: "approved" | "in_review" | "draft";
  kind: "abstract" | "session";
  track: string;
  trackColor: string;
  format: string;
  level: string;
  speakers: string[];
  date?: string;
  day?: string;
  start?: string;
  end?: string;
  room?: string;
  rating?: number;
  notified: boolean;
  form: string;
  tags: string[];
};

export const event = {
  name: "DevFlow Conf 2027",
  tagline: "The developer workflow conference",
  slug: "devflow-conf-2027",
  location: "Moscone West, San Francisco, CA",
  dates: "May 12–14, 2027",
  closes: "April 30, 2027 at 11:59 PM PDT",
  daysAway: 275,
};

export const tracks = [
  { name: "AI Engineering", color: "#6d5ce7" },
  { name: "Platform & Infra", color: "#168f70" },
  { name: "Developer Experience", color: "#e06c3a" },
];

export const speakers: Speaker[] = [
  {
    id: "priya-raman",
    name: "Priya Raman",
    firstName: "Priya",
    lastName: "Raman",
    initials: "PR",
    title: "Principal Engineer",
    company: "Latticework Systems",
    email: "sbek-speaker@example.com",
    bio: "Priya builds reliable developer platforms and studies how teams can verify AI-generated code without slowing down delivery. She writes about practical evaluation, systems thinking, and humane engineering workflows.",
    status: "confirmed",
    track: "AI Engineering",
    tasks: 6,
    tasksDone: 4,
  },
  {
    id: "marcus-okafor",
    name: "Marcus Okafor",
    firstName: "Marcus",
    lastName: "Okafor",
    initials: "MO",
    title: "Staff Developer Advocate",
    company: "Cloudreach Labs",
    email: "sbek-speaker2@example.com",
    bio: "Marcus helps engineering teams make complex infrastructure understandable. His work spans cloud platforms, documentation systems, and developer education.",
    status: "confirmed",
    track: "Developer Experience",
    tasks: 6,
    tasksDone: 3,
  },
  {
    id: "ana-torres",
    name: "Ana Torres",
    firstName: "Ana",
    lastName: "Torres",
    initials: "AT",
    title: "VP of Engineering",
    company: "Patchwork",
    email: "ana@example.com",
    bio: "Ana leads platform and product engineering teams building tools for high-growth organizations.",
    status: "invited",
    track: "Platform & Infra",
    tasks: 5,
    tasksDone: 2,
  },
  {
    id: "devon-lee",
    name: "Devon Lee",
    firstName: "Devon",
    lastName: "Lee",
    initials: "DL",
    title: "Engineering Director",
    company: "Shipyard",
    email: "devon@example.com",
    bio: "Devon works on fast feedback systems, monorepo build tooling, and sustainable engineering practices.",
    status: "confirmed",
    track: "Platform & Infra",
    tasks: 5,
    tasksDone: 5,
  },
];

export const sessions: Session[] = [
  {
    id: "ci-monorepo",
    title: "Taming 40-Minute CI: Incremental Builds at Monorepo Scale",
    description:
      "A practical guide to dependency graphs, remote caching, and test selection that brought a 40-minute pipeline below six minutes without sacrificing confidence.",
    status: "accepted",
    approval: "approved",
    kind: "abstract",
    track: "Platform & Infra",
    trackColor: "#168f70",
    format: "Talk (30 min)",
    level: "Intermediate",
    speakers: ["Devon Lee"],
    date: "2027-05-12",
    day: "Wednesday, May 12",
    start: "10:00 AM",
    end: "10:30 AM",
    room: "Room 2A",
    rating: 4.6,
    notified: true,
    form: "DevFlow 2027 Call for Speakers",
    tags: ["CI/CD", "Monorepos"],
  },
  {
    id: "ai-pair-programmer",
    title: "Your AI Pair Programmer Is Lying to You: Verification Patterns That Scale",
    description:
      "AI coding tools are fast, plausible, and often wrong. Learn a layered verification model that combines constraints, executable checks, review heuristics, and production feedback.",
    status: "accepted",
    approval: "approved",
    kind: "abstract",
    track: "AI Engineering",
    trackColor: "#6d5ce7",
    format: "Talk (30 min)",
    level: "Advanced",
    speakers: ["Priya Raman"],
    date: "2027-05-12",
    day: "Wednesday, May 12",
    start: "11:00 AM",
    end: "11:30 AM",
    room: "Main Stage",
    rating: 4.8,
    notified: true,
    form: "DevFlow 2027 Call for Speakers",
    tags: ["AI", "Testing"],
  },
  {
    id: "docs-answer-back",
    title: "Docs That Answer Back: Retrieval-Grounded Documentation Sites",
    description:
      "Turn static docs into an accurate conversational interface by combining semantic retrieval, source citations, and a feedback loop your documentation team can actually maintain.",
    status: "accepted",
    approval: "approved",
    kind: "abstract",
    track: "Developer Experience",
    trackColor: "#e06c3a",
    format: "Lightning Talk (10 min)",
    level: "Beginner",
    speakers: ["Marcus Okafor"],
    date: "2027-05-12",
    day: "Wednesday, May 12",
    start: "1:30 PM",
    end: "1:40 PM",
    room: "Room 2B",
    rating: 4,
    notified: true,
    form: "DevFlow 2027 Call for Speakers",
    tags: ["Docs", "RAG"],
  },
  {
    id: "opening-keynote",
    title: "The Next Decade of Developer Flow",
    description:
      "An opening keynote on designing engineering organizations around focus, fast feedback, and sustainable momentum.",
    status: "accepted",
    approval: "approved",
    kind: "session",
    track: "Developer Experience",
    trackColor: "#e06c3a",
    format: "Keynote (45 min)",
    level: "All levels",
    speakers: ["Ana Torres"],
    date: "2027-05-12",
    day: "Wednesday, May 12",
    start: "9:00 AM",
    end: "9:45 AM",
    room: "Main Stage",
    rating: 4.5,
    notified: true,
    form: "Added manually",
    tags: ["Leadership"],
  },
  {
    id: "platform-golden-paths",
    title: "Golden Paths Without Guardrails",
    description:
      "How to create paved roads that teams choose because they are faster—not because policy forces them to.",
    status: "pending",
    approval: "in_review",
    kind: "abstract",
    track: "Platform & Infra",
    trackColor: "#168f70",
    format: "Talk (30 min)",
    level: "Intermediate",
    speakers: ["Ana Torres"],
    rating: 3.8,
    notified: false,
    form: "DevFlow 2027 Call for Speakers",
    tags: ["Platform"],
  },
  {
    id: "observability-workshop",
    title: "Hands-on Observability for Developer Platforms",
    description:
      "A workshop for building useful service-level telemetry and turning it into fast feedback for platform teams.",
    status: "accept_queue",
    approval: "draft",
    kind: "abstract",
    track: "Platform & Infra",
    trackColor: "#168f70",
    format: "Workshop (120 min)",
    level: "Advanced",
    speakers: ["Priya Raman", "Marcus Okafor"],
    rating: 4.2,
    notified: false,
    form: "DevFlow 2027 Call for Speakers",
    tags: ["Observability", "Workshop"],
  },
  {
    id: "prompt-patterns",
    title: "Prompt Patterns Are Not a Programming Language",
    description:
      "A critical look at where prompt patterns help, where they fail, and what robust abstractions should replace them.",
    status: "declined",
    approval: "draft",
    kind: "abstract",
    track: "AI Engineering",
    trackColor: "#6d5ce7",
    format: "Talk (30 min)",
    level: "Intermediate",
    speakers: ["Marcus Okafor"],
    rating: 2.7,
    notified: true,
    form: "DevFlow 2027 Call for Speakers",
    tags: ["AI"],
  },
  {
    id: "draft-session",
    title: "Measuring Developer Joy",
    description: "Draft proposal about pragmatic developer experience metrics.",
    status: "draft",
    approval: "draft",
    kind: "abstract",
    track: "Developer Experience",
    trackColor: "#e06c3a",
    format: "Talk (30 min)",
    level: "Beginner",
    speakers: ["Priya Raman"],
    notified: false,
    form: "DevFlow 2027 Call for Speakers",
    tags: ["DX"],
  },
];

export const taskNames = [
  "Confirm participation",
  "Upload headshot",
  "Complete bio and profile",
  "Upload final slides",
  "Sign speaker release form",
  "Hotel and travel reservations",
  "Flight reimbursement form",
  "Announce your participation",
  "Invite colleagues with your speaker discount",
];

export const emails = [
  {
    to: "sbek-speaker@example.com",
    subject: "You're speaking at DevFlow Conf 2027",
    template: "decision_accepted",
    status: "Sent",
    time: "Aug 10, 2026 · 9:18 AM",
  },
  {
    to: "sbek-speaker2@example.com",
    subject: "Complete your DevFlow speaker profile",
    template: "task_reminder",
    status: "Sent",
    time: "Aug 10, 2026 · 8:45 AM",
  },
  {
    to: "sbek-organizer@example.com",
    subject: "New submission: Golden Paths Without Guardrails",
    template: "submission_admin_alert",
    status: "Sent",
    time: "Aug 9, 2026 · 4:12 PM",
  },
  {
    to: "sbek-speaker@example.com",
    subject: "We received your DevFlow Conf 2027 proposal",
    template: "submission_confirmation",
    status: "Sent",
    time: "Aug 9, 2026 · 4:11 PM",
  },
];

export const reviewAssignments = sessions.slice(0, 5);

