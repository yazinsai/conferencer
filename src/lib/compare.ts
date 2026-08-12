/**
 * Data for the /vs pages.
 *
 * The evidence rule (design.md § Honest copy): every claim about another
 * product — a price, a feature, a limit — is sourced from that vendor's own
 * public pages, linked in `sources`, and dated. Where a vendor publishes
 * nothing, the page says so instead of estimating. No row characterises a
 * competitor's product quality; `theirStrengths` exists because a comparison
 * that only lists our wins is marketing, not information.
 *
 * Conferencer-side claims are checkable in this repository: 14 field types
 * (src/lib/fields.ts), eight scorecard types, one container, one SQLite file.
 *
 * All vendor pages read on 12 August 2026 (scrapes in .firecrawl/compare/).
 */

export type ComparisonRow = {
  aspect: string;
  us: string;
  them: string;
};

export type ComparisonPoint = {
  title: string;
  body: string;
};

export type Comparison = {
  slug: string;
  name: string;
  /** The vendor's own positioning, in a few words. */
  tagline: string;
  /** What the product is, paraphrased from the vendor's own site. */
  whatItIs: string;
  /** Who the product is aimed at. */
  audience: string;
  /** The short price fact, as published. */
  price: string;
  /** The longer pricing story, quoted from the pricing page. */
  priceDetail: string;
  url: string;
  pricingUrl: string;
  rows: ComparisonRow[];
  /** Where the competitor is genuinely better. Required on every page. */
  theirStrengths: ComparisonPoint[];
  /** Where Conferencer differs. */
  differences: ComparisonPoint[];
  sources: Array<{ label: string; href: string }>;
};

/** The Conferencer column, worded once so every page states it identically. */
export const US = {
  price: "$0 — MIT licensed, no plans, no per-event fee",
  selfHosted: "Yes — one container, one SQLite file, Node 22+",
  cfp: "14 field types, show-when logic, saved drafts, per-person limits, close dates",
  review:
    "Multi-round plans, anonymized rounds, 8 scorecard types, conflict-of-interest recusal, auto-distribution with caps",
  decisions: "Bulk accept/decline with templated email and per-recipient preview",
  onboarding: "Onboarding tasks, versioned file requests, a deliverables matrix, a speaker portal",
  agenda: "Rooms grid with drag-and-drop, blocked room clashes, speaker-clash warnings, publish diff",
  publicSite:
    "A full public site — sessions, speakers, agenda, itinerary, gallery, personal .ics schedule — no login",
  crm: "An org-level speaker CRM across events, with merge, segments and a sourcing pipeline",
  api: "REST API with OpenAPI 3, HMAC-signed webhooks, embeds, HTML/JSON/XML/iCal feeds",
  start: "Clone, npm run seed, and click around a real demo conference",
} as const;

export const COMPARISONS: Comparison[] = [
  {
    slug: "sessionboard",
    name: "Sessionboard",
    tagline: "Speaker and content management for event teams",
    whatItIs:
      "Sessionboard is a hosted speaker- and content-management platform for event teams: submissions, evaluations, speaker communication, agenda planning and a speaker CRM, with AI tools and integrations into event suites such as Cvent and Bizzabo. It is the product whose Program module Conferencer was written to replace.",
    audience: "Event teams at companies and associations running one or many conferences.",
    price: "From $249 / mo",
    priceDetail:
      "The pricing page lists three plans — Professional, Enterprise and Tailored — each shown at $249 per month, and every one ends in the same button: Request a Demo or Talk to Sales. There is no self-serve signup and no free tier on the page.",
    url: "https://www.sessionboard.com/",
    pricingUrl: "https://www.sessionboard.com/pricing",
    rows: [
      { aspect: "Published price", us: US.price, them: "From $249 / mo; every plan is demo-gated" },
      { aspect: "Self-hosted", us: US.selfHosted, them: "No — hosted only; no self-hosted plan is offered" },
      { aspect: "Call for speakers", us: US.cfp, them: "Up to 25 forms per event, conditional logic, draft submissions" },
      { aspect: "Committee review", us: US.review, them: "Multi-round evaluation plans, rubric scoring, per-evaluator caps" },
      { aspect: "Speaker onboarding", us: US.onboarding, them: "Speaker portals, file requests, automated reminders" },
      { aspect: "Agenda", us: US.agenda, them: "Drag-and-drop builder, conflict flagging, agenda versioning" },
      { aspect: "Public site", us: US.publicSite, them: "Publishable embeds and a public API for your own site" },
      { aspect: "Speaker CRM", us: US.crm, them: "Speaker CRM with dynamic lists, notes and source tracking" },
      { aspect: "Messaging", us: "Templated email with per-recipient preview and an in-app outbox", them: "Email and SMS with templates and tracking" },
      { aspect: "Getting started", us: US.start, them: "Request a demo" },
    ],
    theirStrengths: [
      {
        title: "SMS messaging",
        body: "Sessionboard sends texts as well as emails, with delivery tracking. Conferencer is email only.",
      },
      {
        title: "Fifteen-plus native integrations",
        body: "Cvent, Bizzabo, Swoogo, Zapier and more sync speakers and sessions both ways. Conferencer offers an API, signed webhooks and feeds instead of pre-built connectors.",
      },
      {
        title: "Sponsors and exhibitors",
        body: "Sessionboard manages sponsor and exhibitor workflows alongside speakers. Conferencer covers the programme and its speakers only.",
      },
      {
        title: "Enterprise SSO",
        body: "Admin and portal SSO ship on the Enterprise plan. Conferencer has email-and-password accounts only.",
      },
    ],
    differences: [
      {
        title: "No demo call required",
        body: "Two minutes after cloning you are clicking around a seeded demo conference with real data in every screen. Nothing is gated behind a sales conversation.",
      },
      {
        title: "You keep the database",
        body: "Every submission, score and uploaded deck lives in one SQLite file on your disk. Leaving is a copy; there is no export request to make.",
      },
      {
        title: "The price is the LICENSE file",
        body: "MIT, twenty-one lines, no pricing table in it. No plan to outgrow and no renewal to renegotiate.",
      },
    ],
    sources: [
      { label: "sessionboard.com/pricing", href: "https://www.sessionboard.com/pricing" },
      { label: "sessionboard.com", href: "https://www.sessionboard.com/" },
    ],
  },
  {
    slug: "sessionize",
    name: "Sessionize",
    tagline: "Call for papers, schedule and speaker management",
    whatItIs:
      "Sessionize is a hosted call-for-papers and speaker-management tool built around a large public speaker directory: speakers keep a profile on Sessionize and reuse it to submit to any event on the platform. It also builds the schedule and ships a mobile and web app for attendees.",
    audience: "Community and professional tech conferences, and agencies running many events.",
    price: "$499 / event",
    priceDetail:
      "A Professional event is $499 plus tax, valid for one event occurrence, with a fully functional test mode and no credit card required. Community events with no participation fee use it free — but the free licence is not valid for internal, private, promotional, marketing, profit or commercial events. Five or more events a year is a custom bulk conversation.",
    url: "https://sessionize.com/",
    pricingUrl: "https://sessionize.com/pricing",
    rows: [
      { aspect: "Published price", us: US.price, them: "$499 + tax per event occurrence; free for eligible community events" },
      { aspect: "Free for commercial events", us: "Yes — any event, any size", them: "No — the free tier excludes commercial, private and internal events" },
      { aspect: "Self-hosted", us: US.selfHosted, them: "No — hosted only" },
      { aspect: "Call for speakers", us: US.cfp, them: "Customizable submission page, session and speaker tagging" },
      { aspect: "Committee review", us: US.review, them: "Submission evaluation tools for the content team" },
      { aspect: "Speaker onboarding", us: US.onboarding, them: "A smart task list and unlimited mailings to accepted speakers" },
      { aspect: "Agenda", us: US.agenda, them: "Drag-and-drop schedule builder with session coloring" },
      { aspect: "Public site", us: US.publicSite, them: "An event web and mobile app, plus a copy-paste embed" },
      { aspect: "Speaker network", us: "Your own CRM across your own events", them: "A public directory of speakers across all Sessionize events" },
      { aspect: "Getting started", us: US.start, them: "Log in and try every feature in test mode" },
    ],
    theirStrengths: [
      {
        title: "The speaker network",
        body: "Speakers already have Sessionize profiles and can submit with a click, and the public directory helps you discover speakers you did not know. Conferencer has no cross-event public network.",
      },
      {
        title: "A real free tier",
        body: "For free community events Sessionize genuinely costs nothing, and it is hosted for you. If your event qualifies, it is a good deal.",
      },
      {
        title: "An attendee app",
        body: "The published schedule ships as a mobile and web app for attendees. Conferencer publishes a website and .ics feeds, not an app.",
      },
      {
        title: "Zero setup",
        body: "Nothing to run: log in and every feature is there to test. Conferencer asks you to run one container.",
      },
    ],
    differences: [
      {
        title: "Free means free for everyone",
        body: "Commercial, private and internal events included — the licence does not ask what kind of event you are running.",
      },
      {
        title: "The work continues after the decision",
        body: "Accepting a talk opens the speaker's portal and assigns their onboarding tasks — bio, headshot, slides — with versioned deliverables you can chase in one matrix.",
      },
      {
        title: "Your speaker data is yours",
        body: "A CRM across your own events, in your own database — not profiles on someone else's platform.",
      },
    ],
    sources: [
      { label: "sessionize.com/pricing", href: "https://sessionize.com/pricing" },
      { label: "sessionize.com", href: "https://sessionize.com/" },
    ],
  },
  {
    slug: "oxford-abstracts",
    name: "Oxford Abstracts",
    tagline: "Abstract management and conference platform for academic events",
    whatItIs:
      "Oxford Abstracts is a hosted abstract-management and conference platform aimed at academic and research events: submission forms, reviewing, decisions, a program builder, a poster gallery, delegate registration and a conference website builder.",
    audience: "Academic, scientific and research conferences collecting abstracts.",
    price: "$890–$3,450 / event",
    priceDetail:
      "The three paid tiers are one-off costs per event: $890 for abstract management, $2,290 for the standard conference platform, $3,450 for professional. Add-ons run $150 to $850 each — a second submission stream is $850, certificates $150, the website builder $200. Delegate registration takes 2.5% of ticket revenue, capped at $5,000 per event. A limited free package handles basic collection.",
    url: "https://oxfordabstracts.com/",
    pricingUrl: "https://oxfordabstracts.com/pricing/",
    rows: [
      { aspect: "Published price", us: US.price, them: "$890–$3,450 per event, plus add-ons and 2.5% of registration revenue" },
      { aspect: "Self-hosted", us: US.selfHosted, them: "No — hosted only" },
      { aspect: "Submissions", us: US.cfp, them: "Fully customisable forms, unlimited submissions on every package" },
      { aspect: "Committee review", us: US.review, them: "Custom review forms, reviewer assignment, abstract concealment on higher tiers" },
      { aspect: "Speaker onboarding", us: US.onboarding, them: "Certificates and a poster gallery on the top tier" },
      { aspect: "Program builder", us: US.agenda, them: "Program builder from the Standard tier up" },
      { aspect: "Registration", us: "Not included — Conferencer runs the programme, not ticketing", them: "Built in, at 2.5% of revenue capped at $5,000" },
      { aspect: "Public site", us: US.publicSite, them: "A conference website builder, as a $200 add-on or on the top tier" },
      { aspect: "Getting started", us: US.start, them: "Their team sets the event up with you, in under an hour" },
    ],
    theirStrengths: [
      {
        title: "Academic fixtures",
        body: "Poster gallery, certificates, abstract concealment and multi-stage streams — abstracts first, full papers after — are built for research meetings.",
      },
      {
        title: "Registration built in",
        body: "Ticketing and delegate management live in the same tool. Conferencer deliberately does not touch ticketing.",
      },
      {
        title: "White-glove setup",
        body: "Their team sets the event up with you and guides you through the stages. Conferencer hands you a seeded demo and good defaults instead.",
      },
      {
        title: "A free package",
        body: "Basic collection for small events at no cost, with unlimited submissions.",
      },
    ],
    differences: [
      {
        title: "No meter running",
        body: "No per-event fee, no add-on grid, no percentage of your ticket revenue. The price does not move when your conference does well.",
      },
      {
        title: "Onboarding after the decision",
        body: "Accepting opens each speaker a portal and assigns their tasks — bio, headshot, slides — with versioned files and a deliverables matrix.",
      },
      {
        title: "You can read the source",
        body: "MIT licensed, plain SQL, the schema in one file. Changing a review rule is a pull request against your own fork.",
      },
    ],
    sources: [
      { label: "oxfordabstracts.com/pricing", href: "https://oxfordabstracts.com/pricing/" },
      { label: "oxfordabstracts.com", href: "https://oxfordabstracts.com/" },
    ],
  },
  {
    slug: "ex-ordo",
    name: "Ex Ordo",
    tagline: "Peer review and conference management for research events",
    whatItIs:
      "Ex Ordo is a hosted conference-management platform for scientific, medical and technical events, built around peer review of abstracts and papers. The counters on its homepage read 2,905 conferences, 799,187 researchers and professionals, and 887,746 reviews completed.",
    audience: "Large academic and professional research conferences.",
    price: "Not published",
    priceDetail:
      "There is no public price. The pricing page is a form that asks for your contact details, the number of submissions you expect — 125 to 2000+ — and your currency, and then a person sends you a number.",
    url: "https://www.exordo.com/",
    pricingUrl: "https://www.exordo.com/pricing/",
    rows: [
      { aspect: "Published price", us: US.price, them: "None — a quote form priced by expected submissions" },
      { aspect: "Before you can try", us: US.start, them: "Fill in a contact form and wait for a reply" },
      { aspect: "Self-hosted", us: US.selfHosted, them: "No — hosted only" },
      { aspect: "Committee review", us: US.review, them: "Peer-review software is their flagship product" },
      { aspect: "Scale", us: "Built to run one conference programme properly", them: "Published counters show conferences past 1,000 presentations" },
      { aspect: "Speaker onboarding", us: US.onboarding, them: "Not listed on their public pages" },
      { aspect: "Public site", us: US.publicSite, them: "A conference platform and virtual event space" },
    ],
    theirStrengths: [
      {
        title: "Serious peer-review depth",
        body: "Peer review is the core of their product, with the workflows large research meetings expect — not a module alongside ten others.",
      },
      {
        title: "Proven at scale",
        body: "Their published counters: 2,905 conferences and 887,746 reviews completed. Conferencer was built for one real conference and makes no scale claim.",
      },
      {
        title: "Human support",
        body: "\"Backed by humans, not bots\" is their own promise, and for a 1,000-abstract meeting that matters.",
      },
    ],
    differences: [
      {
        title: "The price is public: $0",
        body: "No form, no sales call, no per-submission bands. The LICENSE file is twenty-one lines and has no pricing table in it.",
      },
      {
        title: "You can start today",
        body: "Clone, seed, and you are clicking around a real demo conference — no demo gate between you and the product.",
      },
      {
        title: "The whole loop after review",
        body: "Decisions with templated emails, speaker onboarding tasks, the agenda grid and the public site, in the same tool as the review.",
      },
    ],
    sources: [
      { label: "exordo.com/pricing", href: "https://www.exordo.com/pricing/" },
      { label: "exordo.com", href: "https://www.exordo.com/" },
    ],
  },
  {
    slug: "pretalx",
    name: "pretalx",
    tagline: "Open-source conference management, from call for papers to schedule",
    whatItIs:
      "pretalx is open-source conference-management software covering the call for papers, review and talk selection, speaker communication and scheduling. You can self-host it free, or pay for hosting at pretalx.com. It is genuinely good at what it does, and if it fits your conference you should use it.",
    audience: "Community and free-software conferences, and teams comfortable running a Python stack.",
    price: "Self-hosting free; hosted from €199 / event",
    priceDetail:
      "Hosted events are priced dynamically by expected attendees and ticket price, starting at €199 per event, with discounts of up to 25% for community events. Self-hosting costs nothing but the server — and, per the administrator documentation, wants Python, PostgreSQL, Redis, a cron runner and a reverse proxy.",
    url: "https://pretalx.com/",
    pricingUrl: "https://pretalx.com/p/pricing/",
    rows: [
      { aspect: "Licence", us: "MIT, self-hosted", them: "Open source, self-hosted or hosted for you" },
      { aspect: "Published price", us: US.price, them: "Self-hosting free; hosted from €199 per event, dynamic by size" },
      { aspect: "Self-hosted stack", us: "Node 22, or one container with one volume", them: "Python, PostgreSQL, Redis, a cron runner and a reverse proxy" },
      { aspect: "Committee review", us: US.review, them: "Anonymous or open review with a customizable rating process" },
      { aspect: "After the schedule", us: "Decisions, onboarding tasks, versioned deliverables, a speaker CRM", them: "Their feature list runs from call for papers to schedule release" },
      { aspect: "Public site", us: US.publicSite, them: "Schedule and event pages, kept online after the event" },
      { aspect: "API", us: US.api, them: "Full API access" },
    ],
    theirStrengths: [
      {
        title: "A hosted option",
        body: "If you do not want to run anything, pretalx.com hosts it for you from €199 per event. Conferencer is self-host only.",
      },
      {
        title: "Battle-tested",
        body: "PyCon, JuliaCon, MozFest and Write the Docs run on it, per their site. It has years of real conferences behind it.",
      },
      {
        title: "Plugins and settings",
        body: "\"Everything can be changed\", in their words — settings, plugins and a mature ecosystem around them.",
      },
    ],
    differences: [
      {
        title: "The loop continues after the schedule",
        body: "Decisions hand off to onboarding: each accepted speaker gets a portal and tasks — bio, headshot, slides — with versioned deliverables and a matrix to chase them in. Then a speaker CRM carries the relationship into your next event.",
      },
      {
        title: "Self-hosting is one container",
        body: "Node 22 and nothing else, or docker compose up with one volume. No Python, PostgreSQL, Redis, cron runner or reverse proxy to assemble.",
      },
      {
        title: "The database is a file",
        body: "One SQLite file holds every submission, score and decision; backups are a copy. No database server to run or migrate.",
      },
    ],
    sources: [
      { label: "pretalx.com/p/pricing", href: "https://pretalx.com/p/pricing/" },
      { label: "pretalx.com", href: "https://pretalx.com/" },
    ],
  },
  {
    slug: "papercall",
    name: "PaperCall",
    tagline: "The easy way to manage your call for papers",
    whatItIs:
      "PaperCall is — was — a free, well-liked hosted tool for running a call for papers: customizable event pages, automatic opening and closing of calls, optional anonymous submissions and a centralized speaker database. Its homepage now carries a shutdown notice: it closes on 31 August 2026, and new events can no longer be created.",
    audience: "Community conferences and meetups running an open call — now looking for somewhere to go.",
    price: "$0 — until 31 August 2026",
    priceDetail:
      "PaperCall was free for everyone. The homepage notice: existing events and submissions remain available until 31 August 2026, and new events can no longer be created.",
    url: "https://www.papercall.io/",
    pricingUrl: "https://www.papercall.io/",
    rows: [
      { aspect: "Price", us: "$0, always", them: "$0, until 31 August 2026" },
      { aspect: "Still available", us: "Yes — and it cannot be sunset on you", them: "Existing events only; new events can no longer be created" },
      { aspect: "Who controls the shutdown date", us: "You do — it runs on your machine", them: "The vendor" },
      { aspect: "Call for speakers", us: US.cfp, them: "Customizable event pages, automatic open and close, anonymous submissions" },
      { aspect: "After the call", us: "Review, decisions, onboarding, agenda and the public site", them: "CFP management was the product" },
      { aspect: "Speaker database", us: "Your own CRM across your own events", them: "A centralized speaker database on their platform" },
    ],
    theirStrengths: [
      {
        title: "It was free and genuinely easy",
        body: "Credit where due: PaperCall proved a call for papers could be simple and cost nothing, and a lot of community conferences ran on it for years.",
      },
      {
        title: "Zero setup",
        body: "Hosted, nothing to install, a call live in minutes.",
      },
      {
        title: "Speaker-side reach",
        body: "Speakers used one account across many events' calls, and the WeeklyCFP list gave calls extra exposure.",
      },
    ],
    differences: [
      {
        title: "It cannot be switched off",
        body: "Self-hosted and MIT licensed: no vendor date on the calendar, no licence server, nothing to phone home to. An abandoned repository still boots, and you can fork it.",
      },
      {
        title: "The whole programme, not just the call",
        body: "Committee review, decisions with templated emails, speaker onboarding, the agenda grid and the public site — the loop PaperCall started, finished.",
      },
      {
        title: "Your data is a file you already have",
        body: "No export deadline. The database sits on your disk from the first day.",
      },
    ],
    sources: [{ label: "papercall.io", href: "https://www.papercall.io/" }],
  },
  {
    slug: "sched",
    name: "Sched",
    tagline: "Event scheduling and management platform",
    whatItIs:
      "Sched is a hosted event platform built around the published schedule: registration and ticketing, attendee apps and session planning, with a call-for-papers module on the paid tiers. Its pricing scales with how many attendees you expect.",
    audience: "Conferences, festivals and professional-development events wanting scheduling, registration and an attendee app in one.",
    price: "From $200 / event",
    priceDetail:
      "At 250 attendees the tiers list at $600 (Launch), $1,500 (Boost) and $2,250 (Ultra) per event, or $50–$188 per month billed annually — a sale at the time of reading brought the entry point to $200 per event. A basic call for papers starts at Launch; the advanced call for papers needs Boost. Events under 50 attendees are free.",
    url: "https://sched.com/",
    pricingUrl: "https://sched.com/pricing",
    rows: [
      { aspect: "Published price", us: US.price, them: "From $200 per event at 250 attendees; free under 50 attendees" },
      { aspect: "Call for papers", us: "The whole product: 14 field types, show-when logic, drafts", them: "A module — basic at $600 per event, advanced at $1,500" },
      { aspect: "Committee review", us: US.review, them: "Not listed among the plan features" },
      { aspect: "Agenda", us: "The organizer's planning grid, then the public site", them: "Their core product — attendee-facing schedules and apps" },
      { aspect: "Registration", us: "Not included — Conferencer runs the programme, not ticketing", them: "Built in, with ticketing and check-in" },
      { aspect: "Speaker onboarding", us: US.onboarding, them: "Speaker profiles and communication tools" },
      { aspect: "Self-hosted", us: US.selfHosted, them: "No — hosted only" },
    ],
    theirStrengths: [
      {
        title: "The attendee side",
        body: "Personal schedules, mobile apps, check-in and networking — the half of the event Conferencer deliberately does not do.",
      },
      {
        title: "Registration and ticketing",
        body: "Built in rather than integrated, with attendance tracking and badges on the higher tiers.",
      },
      {
        title: "Free for small events",
        body: "Under 50 attendees it costs nothing, and there is a 60-day money-back guarantee.",
      },
      {
        title: "Track record",
        body: "Over 30,000 events, per their site.",
      },
    ],
    differences: [
      {
        title: "The programme is the product",
        body: "Not a module tiered behind a schedule tool: the call, the review, the decisions, the onboarding and the agenda are the whole thing, and all of it is free.",
      },
      {
        title: "No per-attendee meter",
        body: "The price does not move when your event does well. $0 at 50 attendees, $0 at 5,000.",
      },
      {
        title: "Committee review is real",
        body: "Multi-round plans, anonymized rounds, eight scorecard types, conflict-of-interest recusal and weighted results.",
      },
    ],
    sources: [
      { label: "sched.com/pricing", href: "https://sched.com/pricing" },
      { label: "sched.com", href: "https://sched.com/" },
    ],
  },
  {
    slug: "whova",
    name: "Whova",
    tagline: "All-in-one event management platform",
    whatItIs:
      "Whova is a hosted all-in-one event platform: registration, an attendee app, networking, sponsors and speakers, with call-for-speakers and speaker-management modules inside the suite. Its banner counts 15 million users, 50,000+ events and 170+ countries.",
    audience: "Corporate and association events that want one suite for everything.",
    price: "Not published",
    priceDetail:
      "Whova publishes no prices. The pricing page is a quote form — you describe the event and they send a number.",
    url: "https://whova.com/",
    pricingUrl: "https://whova.com/pricing/",
    rows: [
      { aspect: "Published price", us: US.price, them: "None — a quote form" },
      { aspect: "Scope", us: "The programme: call, review, decisions, onboarding, agenda, public site", them: "The whole event: registration, app, networking, sponsors, speakers" },
      { aspect: "Call for speakers", us: US.cfp, them: "A call-for-speakers module inside the suite" },
      { aspect: "Committee review", us: US.review, them: "Not listed among the call-for-speakers features" },
      { aspect: "Speaker onboarding", us: US.onboarding, them: "Speaker information collection and reminders" },
      { aspect: "Public site", us: US.publicSite, them: "Event web pages plus the attendee app" },
      { aspect: "Self-hosted", us: US.selfHosted, them: "No — hosted only" },
    ],
    theirStrengths: [
      {
        title: "The attendee app",
        body: "An award-winning mobile app, in their words, with networking and engagement tools. Conferencer publishes a website, not an app.",
      },
      {
        title: "One suite for everything",
        body: "Registration, badges, sponsors, exhibitors and attendee engagement alongside the speakers.",
      },
      {
        title: "Scale and recognition",
        body: "15 million users, 50,000+ events, 170+ countries, per their site.",
      },
    ],
    differences: [
      {
        title: "You can see the price: $0",
        body: "No quote call, no per-event negotiation. The LICENSE file is the whole pricing page.",
      },
      {
        title: "Programme depth over suite breadth",
        body: "Multi-round blind review, versioned deliverables and agenda clash detection — the programme half of the event, done properly.",
      },
      {
        title: "You own the database",
        body: "One SQLite file on your disk, readable by any tool that speaks SQL. Leaving is a copy.",
      },
    ],
    sources: [
      { label: "whova.com/pricing", href: "https://whova.com/pricing/" },
      { label: "whova.com/call-for-speakers", href: "https://whova.com/call-for-speakers/" },
    ],
  },
];

export const COMPARISONS_READ_DATE = "12 August 2026";

export function comparisonBySlug(slug: string): Comparison | undefined {
  return COMPARISONS.find((c) => c.slug === slug);
}
