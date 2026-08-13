import Link from "next/link";
import type { Metadata } from "next";

import { defaultEvent } from "@/lib/repo/events";
import { defaultForm } from "@/lib/repo/forms";
import { publicSessions, publicSpeakers, statusCounts } from "@/lib/repo/submissions";
import { daysUntil, formatEventDates } from "@/lib/datetime";
import { COMPARISONS_READ_DATE } from "@/lib/compare";
import { LinkButton } from "@/components/ui";
import { MarketingNav } from "@/components/marketing/nav";
import { MarketingFooter } from "@/components/marketing/footer";
import { Icon, type IconName } from "@/components/ui/icon";
import { Band, Faq, Shot } from "@/components/marketing/pieces";

/* Hallmark · genre: modern-minimal · macrostructure: 05 Workbench ·
 * design-system: design.md · designed-as-app
 * hero: H8 split — plain copy left, real product capture right (rule 8, dev. 5) ·
 * figures: T4 4-up display-weight · loop: F4 hairline lattice ·
 * simple: two-up typographic grid · tour: full-width captures ·
 * inside: F3 two-up · price: F3 ledger with inverted final row ·
 * nav: N1b (locked) · footer: Ft5 statement over photography (rule 8.4, locked)
 *
 * The page's argument: simplicity first — the whole job in three verbs and one
 * loop, easy for every role it touches — and then the proof that simple does
 * not mean small (the spec sheet), nor rented (the price ledger).
 */

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Conferencer — the simple way to run a conference programme",
  description:
    "One intuitive tool for the whole conference programme: the call for speakers, committee review, accept and decline emails, speaker onboarding, the agenda and the public schedule site. Simple to run, full-featured where it counts — free, open source, self-hosted in one container.",
};

/**
 * Macrostructure 05 · Workbench (see design.md § Macrostructure families).
 *
 * The product is the pitch, so every image on this page is a real screenshot of
 * this repository's own UI, and the copy beside each one describes what is
 * actually visible in it. Deliberately absent: a logo cloud, testimonials,
 * percentage claims, and any photograph or footage of a conference that did not
 * happen. Conferencer has no customers to name, and a fabricated proof bar is
 * worse than no proof bar. What stands in their place is checkable: real
 * captures, real repository facts, and counts read out of the database on this
 * instance at request time.
 *
 * Clarity comes first in the copy: the fold names the job in three plain verbs
 * and the category in one sentence, before the page argues anything. The first
 * argument it makes is simplicity — one loop, a screen per job, easy for the
 * speaker, the reviewer and whoever runs the box — and the second is that
 * simple does not mean small: the spec sheet is the whole list. The closing
 * argument is ownership, so § the price names competitors and quotes what they
 * charge. That section carries its own evidence rule: every figure comes from
 * the vendor's own public pricing page, is linked, is dated in the footnote,
 * and describes only cost. No claim about a rival's product quality appears
 * here, because we cannot check one and do not need to. The line-by-line
 * comparisons live on /compare under the same rule.
 */

const NAV_LINKS = [
  { href: "#loop", label: "How it works" },
  { href: "#tour", label: "The product" },
  { href: "#inside", label: "Features" },
  { href: "#price", label: "What it costs" },
  { href: "/vs", label: "Compare" },
  { href: "/api-docs", label: "API" },
];

const LOOP = [
  {
    n: "01",
    title: "You build the call for speakers",
    body: "Write your questions in the form builder: 14 field types, required and locked flags, and show-when rules that hide a question until it matters.",
  },
  {
    n: "02",
    title: "Speakers submit",
    body: "A public form anyone can fill in, no invitation needed. It creates their account along the way, and saves a draft they can come back to.",
  },
  {
    n: "03",
    title: "The committee reviews",
    body: "Reviewers score submissions against your scorecard, in one round or several. An anonymized round hides the author from them.",
  },
  {
    n: "04",
    title: "You accept or decline",
    body: "One at a time or in bulk, with a templated email you can preview per recipient before it sends.",
  },
  {
    n: "05",
    title: "Speakers onboard",
    body: "Accepting opens each speaker their own portal and assigns their tasks — bio, headshot, slides — so you can chase the deliverables in one place.",
  },
  {
    n: "06",
    title: "You publish the agenda",
    body: "Drag sessions into rooms and days. Room clashes are blocked, speaker clashes are flagged, and publishing shows you what changed.",
  },
];

/**
 * Simple by design. Four roles, four concrete ease facts — each one checkable
 * in this repository. No icons here: the design system rations them to the
 * spec sheet and the ownership guarantees (design.md § Iconography).
 */
const SIMPLE = [
  {
    role: "The organizer",
    title: "Three screens do most of the work",
    body: "The submissions table, the review results and the agenda board. Every page renders in one server pass — there is no loading-spinner waterfall to wait on — and the seeded demo conference means you learn on real data, not an empty trial.",
  },
  {
    role: "The speaker",
    title: "No invitation, no account maze",
    body: "The public form creates their account as they go — an email and a password, no confirmation step in the way — and saves a draft they can come back to. Later, their portal lists exactly what is left: bio, headshot, slides, with the deadlines attached.",
  },
  {
    role: "The reviewer",
    title: "A queue, and nothing else",
    body: "Reviewers see only the submissions assigned to them, one scorecard at a time, with a progress bar and nothing else on the screen. In an anonymized round the author is hidden from them automatically.",
  },
  {
    role: "Whoever runs it",
    title: "One command, no moving parts",
    body: "Node 22, or one docker compose up. No Postgres, no Redis, no queue, and no API keys required: email lands in a built-in outbox until you set a provider, and the database is a single file you can back up with cp.",
  },
] as const;

/**
 * The price row. Every figure is quoted from the vendor's own public pricing page
 * and linked so a reader can check it in one click. Where a vendor publishes no
 * number, the row says exactly that rather than inventing one, and no row
 * characterises a competitor's product — only what it costs to use. The
 * line-by-line comparisons live on /compare under the same rule.
 */
const ELSEWHERE = [
  {
    name: "Sessionboard",
    slug: "sessionboard",
    href: "https://www.sessionboard.com/pricing",
    price: "From $249 / mo",
    note: "The suite whose Program module this was written to replace. Every plan — Professional, Enterprise, Tailored — ends in the same button: request a demo.",
  },
  {
    name: "Sessionize",
    slug: "sessionize",
    href: "https://sessionize.com/pricing",
    price: "$499 / event",
    note: "Per event occurrence, plus tax. The free tier is for free community events only, not for commercial, private or internal ones.",
  },
  {
    name: "Oxford Abstracts",
    slug: "oxford-abstracts",
    href: "https://oxfordabstracts.com/pricing/",
    price: "$890–$3,450 / event",
    note: "Add-ons cost $150 to $850 each — a second submission stream is $850. Registration takes 2.5% of your ticket revenue, capped at $5,000.",
  },
  {
    name: "Ex Ordo",
    slug: "ex-ordo",
    href: "https://www.exordo.com/pricing/",
    price: "Ask us",
    note: "The pricing page is a contact form. It asks how many submissions you expect, and then a person sends you a number.",
  },
  {
    name: "PaperCall",
    slug: "papercall",
    href: "https://www.papercall.io",
    price: "$0, until August",
    note: "Free, well liked, and closing on 31 August 2026. New events can no longer be created.",
  },
  {
    name: "pretalx",
    slug: "pretalx",
    href: "https://pretalx.com/p/pricing/",
    price: "From €199 / event",
    note: "Open source and genuinely good, hosted or self-run. Self-hosting wants Python, PostgreSQL, Redis, a cron runner and a reverse proxy.",
  },
] as const;

/**
 * The spec sheet. Each row carries the glyph the organizer sidebar uses for that
 * module, so the icon is wayfinding a reader will meet again inside the product
 * rather than an ornament per feature card (design.md § Iconography).
 */
const INSIDE = [
  {
    icon: "forms",
    area: "Call for speakers",
    detail:
      "A form builder with 14 field types, show-when logic, track routing, close dates, per-person limits, saved drafts and your own success page.",
  },
  {
    icon: "submissions",
    area: "Submissions",
    detail:
      "Status tabs with counts, inline and bulk edits, a column picker, saved views, search, CSV export, and a change history you can restore from.",
  },
  {
    icon: "evaluation",
    area: "Review",
    detail:
      "Multi-round plans, eight scorecard types, anonymized rounds, conflict-of-interest recusal, auto-distribution with per-reviewer caps, weighted results.",
  },
  {
    icon: "decision",
    area: "Decisions",
    detail:
      "Accept and decline in bulk, with templated email, merge fields and a per-recipient preview. Acceptance hands off to onboarding on its own.",
  },
  {
    icon: "portals",
    area: "Speaker portal",
    detail:
      "Each speaker's own submissions, profile and tasks, scoped in SQL rather than by hiding links. Another speaker's page returns a real 403.",
  },
  {
    icon: "crm",
    area: "Speaker CRM",
    detail:
      "An organization-level directory that outlives one event: cross-event history, duplicate merge, a sourcing pipeline, saved segments, bulk email.",
  },
  {
    icon: "tasks",
    area: "Tasks and files",
    detail:
      "Action, file-request and form tasks. Versioned uploads with the latest flagged, comments across roles, a deliverables matrix, ZIP export.",
  },
  {
    icon: "agenda",
    area: "Agenda",
    detail:
      "A rooms grid you drag sessions onto; list, day, week, month and conflict views; auto-schedule assist; .ics invites and per-speaker calendar feeds.",
  },
  {
    icon: "globe",
    area: "Public site",
    detail:
      "Sessions, speakers, agenda, itinerary, gallery and a personal schedule with .ics export — all of it readable without signing in.",
  },
  {
    icon: "embeds",
    area: "Embeds and API",
    detail:
      "One script tag per widget, plus HTML, JSON, XML and iCal feeds. A bearer-token REST API with cursor pagination, OpenAPI 3 and signed webhooks.",
  },
] as const satisfies ReadonlyArray<{ icon: IconName; area: string; detail: string }>;

/** The three guarantees behind § the price. Prose until now; the glyphs make
    them scannable, and each one carries the claim rather than decorating it. */
const OWNERSHIP = [
  {
    icon: "unlocked",
    title: "No licence check",
    body: (
      <>
        Nothing to phone home to, no key that expires, no seat count. It runs with the network
        unplugged.
      </>
    ),
  },
  {
    icon: "database",
    title: "One file, on your disk",
    body: (
      <>
        Every submission, review score, decision and uploaded slide deck lives in{" "}
        <Code>data/conferencer.db</Code>, which any tool that speaks SQL can read.
      </>
    ),
  },
  {
    icon: "copy",
    title: "Leaving is a copy",
    body: (
      <>
        Back the whole conference up with <Code>cp</Code>. If this repository went quiet tomorrow,
        yours would not notice.
      </>
    ),
  },
] as const satisfies ReadonlyArray<{ icon: IconName; title: string; body: React.ReactNode }>;

const FAQ = [
  {
    q: "How long does it take to get started?",
    a: (
      <>
        Measured on a 2-core box from a clean clone: install 7 seconds, seed 2 seconds, first page
        in under a second. The seed loads a full demo conference — 23 submissions, a two-round
        review, a three-day agenda — so every screen has real data in it from the first click. In
        production, <Code>npm run deploy</Code> is one <Code>docker compose up</Code> with one
        volume.
      </>
    ),
  },
  {
    q: "It's free. What's the catch?",
    a: (
      <>
        There is no paid tier, no seat limit and no feature held back for an enterprise plan. One
        repository, MIT licensed, all of it. It was written to replace the programme module of a
        suite that cost one conference about forty thousand dollars a year, and publishing the
        result cost nothing extra.
      </>
    ),
  },
  {
    q: "What happens to my conference if this project stops?",
    a: (
      <>
        Nothing. It is already on your machine: no licence server to check in with, no phone-home,
        no key that expires. An abandoned repository still boots, and you can fork it. Compare a
        hosted tool: PaperCall is free and well liked, and it closes on 31 August 2026.
      </>
    ),
  },
  {
    q: "Isn't pretalx open source already?",
    a: (
      <>
        It is, it is excellent, and if it fits your conference you should use it. Two differences.
        Conferencer keeps going after the schedule is released — decisions, onboarding tasks,
        versioned deliverables, a speaker CRM across events. And it installs with Node 22, or one{" "}
        <Code>docker compose up</Code>, where pretalx wants Python, PostgreSQL, Redis, a cron runner
        and a reverse proxy. The full comparison is on{" "}
        <Link href="/vs/pretalx" className="underline underline-offset-4 hover:text-ink">
          the pretalx page
        </Link>
        .
      </>
    ),
  },
  {
    q: "How do I get my data out?",
    a: (
      <>
        The database is the export: <Code>data/conferencer.db</Code> is one SQLite file you can
        copy, open in any tool and query with plain SQL, with the uploads beside it in{" "}
        <Code>data/uploads/</Code>. There is also CSV for submissions, speakers, tasks and scores, a
        ZIP of every uploaded file, iCal feeds, and a REST API with an OpenAPI 3 document.
      </>
    ),
  },
  {
    q: "Do I need Postgres, Redis or a queue?",
    a: (
      <>
        No — Node 22 and nothing else. Queries are synchronous and sub-millisecond, which is what
        lets every page render in one server pass. There is no client-side data fetching and no
        loading-spinner waterfall anywhere in the product.
      </>
    ),
  },
  {
    q: "Can a stranger submit a talk without an invitation?",
    a: (
      <>
        Yes. The public form creates the account as it goes — an email address and a password, with
        no confirmation step in the way — then walks through the submission, the participants and a
        review screen before it posts.
      </>
    ),
  },
  {
    q: "What happens if I never configure a mail provider?",
    a: (
      <>
        The send still succeeds and lands in the in-app outbox, so you can see exactly what would
        have gone out. Set <Code>RESEND_API_KEY</Code> when you want it to leave the building.
        Missing credentials never break a feature: with no OpenAI key, AI triage falls back to a
        local rubric that reads the abstract.
      </>
    ),
  },
  {
    q: "How do I deploy it?",
    a: (
      <>
        <Code>npm run deploy</Code> is <Code>docker compose up -d --build</Code>. One container, one
        volume at <Code>/data</Code> holding the database and the uploads. Set{" "}
        <Code>SESSION_SECRET</Code> and <Code>APP_URL</Code> and you are done.
      </>
    ),
  },
  {
    q: "Who is behind it, and can I change it?",
    a: (
      <>
        It was built for one real conference and opened up because there was no reason not to. Read
        it before you trust it with a call for speakers: plain SQL, no ORM, the schema in one{" "}
        <Code>schema.sql</Code> file. Changing a review rule, adding a field type or deleting a
        module you do not want is a pull request against your own fork, not a feature request in
        someone else&rsquo;s backlog.
      </>
    ),
  },
];

function Code({ children }: { children: React.ReactNode }) {
  return (
    <code className="wordmark rounded-md bg-paper-3 px-1.5 py-0.5 text-[0.85em] text-ink-2">
      {children}
    </code>
  );
}

/** Section eyebrow — body face, tracked uppercase. The outlier face is rationed
    to the wordmark and tabular figures (design.md § Typography), so labels set
    in Switzer instead. */
function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
      {children}
    </p>
  );
}

export default function HomePage() {
  const event = defaultEvent();
  const form = event ? defaultForm(event.id) : undefined;

  // Every figure on this page is read out of the database at request time. When
  // the database is empty they render as em dashes with the same label — a
  // number-shaped hole is honest, an invented number is not.
  const live = event
    ? {
        sessions: String(publicSessions(event.id).length),
        speakers: String(publicSpeakers(event.id).length),
        submissions: String(statusCounts(event.id).all),
        countdown: (() => {
          const d = daysUntil(event.starts_at);
          return d !== null && d > 0 ? String(d) : "—";
        })(),
      }
    : { sessions: "—", speakers: "—", submissions: "—", countdown: "—" };

  const ctaHref = event ? `/e/${event.slug}` : "/sign-up";
  const ctaLabel = event ? "Open the demo" : "Create an account";

  return (
    <>
      <MarketingNav links={NAV_LINKS} ctaHref={ctaHref} ctaLabel={ctaLabel} />

      {/* ------------------------------------------- hero · H8 split -------
          The fold's job is to say what this is. Three plain verbs name the
          job — the whole of it, which is the first simplicity claim — and one
          sentence names the category. The image beside them is the actual
          organizer dashboard, not a photograph of a conference, which is the
          one thing on this page a reader could not check. */}
      <section className="border-b border-rule bg-paper">
        <div className="mx-auto grid w-full max-w-6xl items-center gap-12 px-4 pb-16 pt-[calc(var(--nav-height)+3rem)] sm:px-6 sm:pb-20 sm:pt-[calc(var(--nav-height)+4.5rem)] lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-16">
          <div className="min-w-0">
            <h1 className="reveal display text-display-m text-ink" style={{ ["--i" as string]: 0 }}>
              <span className="block">Collect talks.</span>
              <span className="block">Review them.</span>
              <span className="block">Publish the agenda.</span>
            </h1>

            <p
              className="reveal mt-6 max-w-[46ch] text-lg leading-relaxed text-neutral"
              style={{ ["--i" as string]: 1 }}
            >
              Conferencer is the simple way to run a conference programme: the call for speakers,
              committee review, accept and decline emails, speaker onboarding, the agenda and the
              public schedule site — in one place, with nothing to integrate.
            </p>
            <p
              className="reveal mt-4 max-w-[46ch] text-[0.9375rem] leading-relaxed text-neutral"
              style={{ ["--i" as string]: 2 }}
            >
              Simple to run does not mean small: it is free, open source and full-featured — one
              container, one SQLite file, no database server, no per-event fee, no cut of your
              ticket sales, and no demo to sit through.
            </p>

            <div
              className="reveal mt-8 flex flex-wrap items-center gap-3"
              style={{ ["--i" as string]: 3 }}
            >
              <LinkButton href={ctaHref} variant="primary" size="lg" className="nowrap-affordance">
                {event ? "Open the live demo" : "Create an account"}
              </LinkButton>
              <LinkButton href="/sign-in" size="lg" className="nowrap-affordance">
                Sign in as an organizer
              </LinkButton>
            </div>

            {event ? (
              <p
                className="reveal wordmark mt-6 text-xs leading-relaxed text-muted-foreground"
                style={{ ["--i" as string]: 4 }}
              >
                Organizer Minerva McGonagall · sbek-organizer@example.com · SbekTest!2027-org
              </p>
            ) : (
              <p
                className="reveal mt-6 text-xs text-muted-foreground"
                style={{ ["--i" as string]: 4 }}
              >
                No event on this instance yet — run <Code>npm run seed</Code> to load the demo
                conference.
              </p>
            )}
          </div>

          <div className="reveal min-w-0" style={{ ["--i" as string]: 2 }}>
            <Shot
              src="/screens/dashboard.webp"
              alt="The organizer dashboard: 274 days until the event opens, then counts for submissions, accepted speakers, sessions scheduled and outstanding tasks."
              caption="The organizer's view of the demo conference, on the day this was captured."
              priority
              width={1040}
              height={680}
            />
          </div>
        </div>
      </section>

      {/* ------------------------------------------- T4 · live figures ----- */}
      <Band
        band="ink"
        bordered={false}
        photo={{ src: "/media/audience.webp", width: 2000, height: 1125 }}
      >
        <div className="py-14 sm:py-16">
          <dl className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-4">
            {[
              { label: "Sessions published", value: live.sessions },
              { label: "Speakers listed", value: live.speakers },
              { label: "Submissions received", value: live.submissions },
              { label: "Days until it opens", value: live.countdown },
            ].map((fact) => (
              <div key={fact.label}>
                <dd className="wordmark tnum text-4xl font-medium tracking-[-0.02em] text-paper sm:text-5xl">
                  {fact.value}
                </dd>
                <dt className="mt-2 text-sm text-paper/65">{fact.label}</dt>
              </div>
            ))}
          </dl>
          <p className="mt-10 max-w-[60ch] border-t border-paper/20 pt-6 text-sm leading-relaxed text-paper/65">
            Counted when you loaded this page, in the demo conference this instance is running
            {event ? (
              <>
                {" "}
                — <span className="text-paper">{event.name}</span>,{" "}
                {formatEventDates(event.starts_at, event.ends_at)}
              </>
            ) : null}
            . They come out of its SQLite file, not a marketing deck.
          </p>
        </div>
      </Band>

      {/* ------------------------------------------- F4 · the loop --------- */}
      <Band id="loop" band="paper" bordered={false}>
        <div className="py-20 sm:py-28">
          <Eyebrow>How it works</Eyebrow>
          <h2 className="display mt-3 max-w-[24ch] text-2xl text-ink sm:text-3xl">
            From an open call to a published agenda.
          </h2>
          <p className="mt-4 max-w-[58ch] text-[0.9375rem] leading-relaxed text-neutral">
            One loop, learned in minutes — and anything that does not sit on it was left out. The
            half after step four, onboarding accepted speakers and chasing their bios and slides,
            is the part free tools hand back to you and paid ones charge for.
          </p>

          {/* A hairline lattice: gap-px over a rule-coloured track draws the
              grid lines, and the cells stay paper. The numerals are the only
              ornament — genuinely ordinal content is the one place a numeral
              earns its keep. */}
          <ol className="mt-14 grid grid-cols-1 gap-px overflow-hidden rounded-card border border-rule bg-rule sm:grid-cols-2 lg:grid-cols-3">
            {LOOP.map((step) => (
              <li key={step.n} className="min-w-0 bg-paper p-6 sm:p-8">
                <p className="wordmark tnum text-xs tracking-[0.14em] text-muted-foreground">
                  {step.n}
                </p>
                <h3 className="display mt-4 text-lg text-ink">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-neutral">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </Band>

      {/* ------------------------------------------- simple by design ------
          The page's first argument. Four roles, four concrete ease facts,
          each checkable in the repository. Typographic only — no icon budget
          here (design.md § Iconography). */}
      <Band id="simple" band="paper-2">
        <div className="py-20 sm:py-28">
          <Eyebrow>Simple by design</Eyebrow>
          <h2 className="display mt-3 max-w-[22ch] text-2xl text-ink sm:text-3xl">
            Easy for everyone it touches.
          </h2>
          <p className="mt-4 max-w-[58ch] text-[0.9375rem] leading-relaxed text-neutral">
            Most programme tools are designed for the buyer and endured by everyone else.
            Conferencer is one loop with a screen per job — each role sees only what is theirs.
          </p>

          <dl className="mt-14 grid grid-cols-1 gap-x-12 gap-y-10 md:grid-cols-2">
            {SIMPLE.map((item) => (
              <div key={item.role} className="border-t border-rule pt-6">
                <dt className="display text-lg text-ink">
                  <span className="wordmark mb-3 block text-xs font-medium tracking-[0.14em] text-muted-foreground">
                    {item.role}
                  </span>
                  {item.title}
                </dt>
                <dd className="mt-2 max-w-[52ch] text-sm leading-relaxed text-neutral">
                  {item.body}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </Band>

      {/* ------------------------------ F5 · the workbench tour ------------
          Captures at full measure. The dead half-column the alternating
          layout left beside every screenshot is gone; each stop is a head
          row and then the widest honest image the page can show. */}
      <Band id="tour" band="paper">
        <div className="py-20 sm:py-28">
          <Eyebrow>The product</Eyebrow>
          <h2 className="display mt-3 max-w-[20ch] text-2xl text-ink sm:text-3xl">
            Three screens do most of the work.
          </h2>
          <p className="mt-4 max-w-[58ch] text-[0.9375rem] leading-relaxed text-neutral">
            Real screenshots of this repository, running the demo conference. Nothing below was
            drawn for the page.
          </p>

          <div className="mt-16 space-y-20 sm:space-y-24">
            <TourStep
              n="01"
              src="/screens/cfp-builder.webp"
              alt="Step 3 of 7 of the call-for-speakers builder: a section heading, then questions tagged Short text, Long text, Required, Locked and a 4000-character limit."
              title="The form builder"
              body="You write the call for speakers question by question: 14 field types, required and locked flags, character limits, and a show-when rule that hides a question until an earlier answer calls for it."
            />
            <TourStep
              n="02"
              src="/screens/review.webp"
              alt="An evaluation plan with two rounds: the first anonymized, each with its own scorecard of scales, weights and free text, and its own named reviewers."
              title="The review committee"
              body="Every round has its own reviewers and its own scorecard — scales, weighted questions, free text. An anonymized round hides the author from reviewers while you still see everything."
            />
            <TourStep
              n="03"
              src="/screens/agenda.webp"
              alt="The agenda board: two unscheduled sessions on the left, a rooms-by-time grid for day one on the right, and a Conflicts tab reading zero."
              title="The agenda board"
              body="Accepted sessions wait on the left until you drag one onto the grid, or click Place to pick a slot. Two talks in one room is never right, so it is blocked; a short overlap between rooms can be deliberate, so it is only flagged."
            />
          </div>
        </div>
      </Band>

      {/* ------------------------------ F3 · the spec sheet ----------------
          The second argument: simple does not mean small. The whole list,
          checkable line by line. */}
      <Band id="inside" band="paper-2">
        <div className="py-20 sm:py-28">
          <Eyebrow>Features</Eyebrow>
          <h2 className="display mt-3 max-w-[22ch] text-2xl text-ink sm:text-3xl">
            Simple does not mean small.
          </h2>
          <p className="mt-4 max-w-[58ch] text-[0.9375rem] leading-relaxed text-neutral">
            The whole list, not a highlight reel — ten areas across 116 screens. Unusually for a
            feature list, you can go and check it line by line.
          </p>

          <dl className="mt-14 grid grid-cols-1 gap-x-12 border-t border-rule md:grid-cols-2">
            {INSIDE.map((row) => (
              <div
                key={row.area}
                className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 border-b border-rule py-6"
              >
                {/* 17px muted is the organizer sidebar's exact treatment. */}
                <Icon name={row.icon} size={17} className="mt-0.5 text-muted-foreground" />
                <dt className="display text-[0.9375rem] text-ink">{row.area}</dt>
                <dd className="col-start-2 mt-2 text-sm leading-relaxed text-neutral">
                  {row.detail}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </Band>

      {/* ------------------------------ the price ------------------------- */}
      <Band id="price" band="paper">
        <div className="py-20 sm:py-28">
          <Eyebrow>What it costs</Eyebrow>
          <h2 className="display mt-3 max-w-[22ch] text-2xl text-ink sm:text-3xl">
            Nothing. Here is what the same work costs elsewhere.
          </h2>
          <p className="mt-4 max-w-[58ch] text-[0.9375rem] leading-relaxed text-neutral">
            Every figure is quoted from that vendor&rsquo;s own pricing page and linked so you can
            check it. Watch the shapes as much as the numbers: per event, per submission band, per
            month, or a slice of the tickets you sold.
          </p>

          <dl className="mt-14 border-t border-rule">
            {ELSEWHERE.map((row) => (
              <div
                key={row.name}
                className="grid gap-x-8 gap-y-1.5 border-b border-rule py-6 md:grid-cols-[minmax(0,10rem)_minmax(0,12rem)_minmax(0,1fr)]"
              >
                <dt className="display text-[0.9375rem] text-ink">
                  <a
                    href={row.href}
                    className="nowrap-affordance underline-offset-4 hover:underline"
                  >
                    {row.name}
                  </a>
                </dt>
                <dd className="wordmark tnum text-[0.9375rem] text-ink-2">{row.price}</dd>
                <dd className="text-sm leading-relaxed text-neutral">{row.note}</dd>
              </div>
            ))}
          </dl>

          {/* The last row is the argument, so it leaves the ledger entirely:
              the page's one inverted card. */}
          <div className="mt-8 grid gap-x-8 gap-y-2 rounded-card bg-ink p-6 text-paper sm:p-8 md:grid-cols-[minmax(0,10rem)_minmax(0,12rem)_minmax(0,1fr)]">
            <p className="display text-md">Conferencer</p>
            <p className="wordmark tnum text-md">$0, always</p>
            <p className="text-sm leading-relaxed text-paper/75">
              No plan, no per-event fee, no limit on submissions, no share of your revenue, no
              account to create. Your only bill is the box it runs on, and a $5 VPS covers it.
            </p>
          </div>

          <p className="mt-6 max-w-[68ch] text-xs leading-relaxed text-muted-foreground">
            Public pricing pages, read on {COMPARISONS_READ_DATE}; follow the links and check us.
            Ours is the{" "}
            <a
              href="https://github.com/yazinsai/conferencer/blob/main/LICENSE"
              className="underline underline-offset-4 hover:text-ink"
            >
              LICENSE
            </a>{" "}
            file, which is twenty-one lines and has no pricing table in it.
          </p>

          <p className="mt-4 max-w-[68ch] text-xs leading-relaxed text-muted-foreground">
            Line by line:{" "}
            {ELSEWHERE.map((row, i) => (
              <span key={row.slug}>
                {i > 0 ? " · " : ""}
                <Link
                  href={`/vs/${row.slug}`}
                  className="underline underline-offset-4 hover:text-ink"
                >
                  Conferencer vs {row.name}
                </Link>
              </span>
            ))}
            {" · "}
            <Link href="/vs" className="underline underline-offset-4 hover:text-ink">
              all comparisons
            </Link>
          </p>

          <div className="mt-16 border-t border-rule pt-12 lg:grid lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1fr)] lg:gap-14">
            <h3 className="display max-w-[16ch] text-xl text-ink sm:text-2xl">
              And nobody can switch it off.
            </h3>
            <div className="mt-4 lg:mt-0">
              <p className="max-w-[56ch] text-[0.9375rem] leading-relaxed text-neutral">
                A hosted programme tool is a tenancy: it can be repriced at renewal, acquired,
                moved upmarket, or shut down. PaperCall is free and widely used, and it closes on
                31 August 2026 — no new events, and the existing ones are guaranteed only to that
                date. Conferencer cannot do that to you.
              </p>

              <dl className="mt-8 space-y-5">
                {OWNERSHIP.map((item) => (
                  <div
                    key={item.title}
                    className="grid grid-cols-[auto_minmax(0,1fr)] items-start gap-x-3"
                  >
                    <Icon name={item.icon} size={20} className="mt-px text-ink-2" />
                    <dt className="display text-[0.9375rem] text-ink">{item.title}</dt>
                    <dd className="col-start-2 mt-1 max-w-[52ch] text-sm leading-relaxed text-neutral">
                      {item.body}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>
      </Band>

      {/* ------------------------------ the published result --------------- */}
      <Band band="paper-2">
        <div className="py-20 sm:py-28">
          <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:gap-16">
            <div className="min-w-0">
              <Eyebrow>What attendees see</Eyebrow>
              <h2 className="display mt-3 max-w-[16ch] text-2xl text-ink sm:text-3xl">
                And then it is just a website.
              </h2>
              <p className="mt-4 max-w-[52ch] text-[0.9375rem] leading-relaxed text-neutral">
                Publishing gives your conference a public site nobody has to sign in to read:
                sessions, speakers, the agenda grid, an itinerary, a speaker gallery, and a
                personal schedule that exports to <Code>.ics</Code>. A session appears only once you
                have both accepted it and approved its content — two separate gates.
              </p>
              {event ? (
                <div className="mt-8 flex flex-wrap gap-3">
                  <LinkButton
                    href={`/e/${event.slug}/agenda`}
                    variant="primary"
                    size="lg"
                    className="nowrap-affordance"
                  >
                    See the published agenda
                  </LinkButton>
                  {form ? (
                    <LinkButton
                      href={`/e/${event.slug}/submit/${form.id}`}
                      size="lg"
                      className="nowrap-affordance"
                    >
                      Try the submission form
                    </LinkButton>
                  ) : null}
                </div>
              ) : null}
            </div>
            <Shot
              src="/screens/public-agenda.webp"
              alt="The public agenda for day one: four rooms across the top, times down the side, each session card showing its title, time and track."
              caption="The same agenda, published — no login, and a banner carrying the open call."
            />
          </div>
        </div>
      </Band>

      {/* ------------------------------ conversational FAQ ----------------- */}
      <Band band="paper">
        <div className="py-20 sm:py-24">
          <Eyebrow>Before you ask</Eyebrow>
          <h2 className="display mt-3 text-2xl text-ink sm:text-3xl">Reasonable questions</h2>
          <div className="mt-12">
            <Faq items={FAQ} />
          </div>
        </div>
      </Band>

      <MarketingFooter
        ctaHref={ctaHref}
        ctaLabel={ctaLabel}
        eventName={event?.name}
        eventHref={event ? `/e/${event.slug}` : undefined}
        showCompareLinks
      />
    </>
  );
}

/** One stop on the Workbench tour: a head row, then the capture at full
    measure. The number and the title share a baseline; the body sits in the
    right column, where a reader's eye already is after the last capture. */
function TourStep({
  n,
  src,
  alt,
  title,
  body,
}: {
  n: string;
  src: string;
  alt: string;
  title: string;
  body: string;
}) {
  return (
    <div>
      <div className="grid gap-x-10 gap-y-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:items-end">
        <h3 className="display min-w-0 text-xl text-ink sm:text-2xl">
          <span className="wordmark tnum mr-4 align-middle text-xs tracking-[0.14em] text-muted-foreground">
            {n}
          </span>
          {title}
        </h3>
        <p className="max-w-[52ch] text-sm leading-relaxed text-neutral md:justify-self-end">
          {body}
        </p>
      </div>
      <Shot src={src} alt={alt} className="mt-8" width={1440} height={900} />
    </div>
  );
}
