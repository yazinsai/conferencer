import Link from "next/link";
import type { Metadata } from "next";

import { defaultEvent } from "@/lib/repo/events";
import { defaultForm } from "@/lib/repo/forms";
import { publicSessions, publicSpeakers, statusCounts } from "@/lib/repo/submissions";
import { daysUntil, formatEventDates } from "@/lib/datetime";
import { LinkButton } from "@/components/ui";
import { MarketingNav } from "@/components/marketing/nav";
import { LogoMark } from "@/components/ui/logo";
import { HeroVideo } from "@/components/marketing/hero-video";
import { Band, Faq, Shot } from "@/components/marketing/pieces";

/* Hallmark · genre: modern-minimal · macrostructure: 05 Workbench ·
 * design-system: design.md · designed-as-app
 * hero: full-bleed outcome video + left copy over ink scrim ·
 * figures: T4 4-up display-weight · loop: F4 hairline lattice ·
 * price: F3 ledger with inverted final row · tour: full-width captures ·
 * inside: F3 two-up · footer: Ft5 statement over photography (rule 8.4) ·
 * nav: N1b (locked) · footer archetype: Ft5 (locked)
 */

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Conferencer — the conference programme you own",
  description:
    "MIT-licensed conference programme management: call for speakers, committee review, decisions, speaker onboarding, agenda and a public schedule. One container, one SQLite file, no per-event fee, no cut of your ticket sales, and no vendor who can switch it off.",
};

/**
 * Macrostructure 05 · Workbench (see design.md § Macrostructure families).
 *
 * The product is the pitch, so the page is a guided tour of real screenshots of
 * this repository's own UI. Deliberately absent: a logo cloud, testimonials and
 * percentage claims. Conferencer has no customers to name, and a fabricated
 * proof bar is worse than no proof bar. What stands in their place is checkable:
 * real captures, real repository facts, and counts read out of the database on
 * this instance at request time.
 *
 * The argument the page is built to make is ownership — MIT source, one file, no
 * vendor who can reprice or close it — so § the price names competitors and
 * quotes what they charge. That section carries its own evidence rule: every
 * figure comes from the vendor's own public pricing page, is linked, is dated in
 * the footnote, and describes only cost. No claim about a rival's product
 * quality appears here, because we cannot check one and do not need to.
 */

const NAV_LINKS = [
  { href: "#loop", label: "The loop" },
  { href: "#price", label: "The price" },
  { href: "#tour", label: "The product" },
  { href: "#inside", label: "What's inside" },
  { href: "/api-docs", label: "API" },
];

const LOOP = [
  {
    n: "01",
    title: "Build the call",
    body: "Seven steps, thirteen field types, and show-when rules that keep a question hidden until it matters. Route a track straight into a review round on arrival.",
  },
  {
    n: "02",
    title: "Speakers submit",
    body: "A five-step public wizard a stranger can finish without an invitation: account, submission, participants, review. Drafts save and resume.",
  },
  {
    n: "03",
    title: "The committee reviews",
    body: "Multi-round plans, each with its own reviewer pool and scorecard. Blind rounds hide the author. Conflicts recuse themselves.",
  },
  {
    n: "04",
    title: "You decide",
    body: "Accept or decline individually or in bulk, with a templated email, merge fields and a per-recipient preview of what actually goes out.",
  },
  {
    n: "05",
    title: "Speakers onboard",
    body: "Accepting activates the speaker record, grants portal access and assigns the onboarding tasks — bio, headshot, slides — in one hand-off.",
  },
  {
    n: "06",
    title: "The agenda publishes",
    body: "Drag sessions into rooms. Room clashes are blocked, speaker clashes are flagged, and publishing shows you a diff of what changed.",
  },
];

/**
 * The price row. Every figure is quoted from the vendor's own public pricing page
 * and linked so a reader can check it in one click. Where a vendor publishes no
 * number, the row says exactly that rather than inventing one, and no row
 * characterises a competitor's product — only what it costs to use.
 */
const ELSEWHERE = [
  {
    name: "Sessionboard",
    href: "https://www.sessionboard.com/pricing",
    price: "From $249 / mo",
    note: "The suite whose Program module this was written to replace. Every plan on the pricing page — Professional, Enterprise, Tailored — ends in the same button: request a demo.",
  },
  {
    name: "Sessionize",
    href: "https://sessionize.com/pricing",
    price: "$499 / event",
    note: "Per event occurrence, plus tax. The free tier is for free community events only, and is explicitly not valid for internal, private, promotional, marketing or commercial ones.",
  },
  {
    name: "Oxford Abstracts",
    href: "https://oxfordabstracts.com/pricing/",
    price: "$890–$3,450 / event",
    note: "Add-ons on top at $150 to $850 each — a second submission stream is $850, grouping abstracts into panels is another $850. Registration costs 2.5% of your ticket revenue, capped at $5,000.",
  },
  {
    name: "Ex Ordo",
    href: "https://www.exordo.com/pricing/",
    price: "Ask us",
    note: "The pricing page is a contact form. It asks how many submissions you expect — 125, 250, 500, up to 2,000+ — and then a person sends you a number.",
  },
  {
    name: "PaperCall",
    href: "https://www.papercall.io",
    price: "$0, until August",
    note: "Free, well liked, and closing on 31 August 2026. New events can no longer be created. This is the risk that every hosted option carries and none of them price in.",
  },
  {
    name: "pretalx",
    href: "https://pretalx.com/p/pricing",
    price: "From €199 / event",
    note: "Open source and genuinely good, hosted or self-run. Self-hosting wants Python, PostgreSQL, Redis, a cron runner and a reverse proxy, and it hands off after the schedule is released.",
  },
] as const;

const INSIDE = [
  [
    "Call for speakers",
    "Seven-step builder, 13 field types, conditional show-when logic, track routing, close dates, per-person limits, drafts, a custom success page.",
  ],
  [
    "Submissions",
    "Status tabs with counts, inline and bulk changes, a column picker, saved views, search across titles and speaker names, CSV export, change history with restore.",
  ],
  [
    "Review",
    "Multi-round evaluation plans, eight scorecard field types, blind rounds, conflict-of-interest recusal, auto-distribution with per-reviewer caps, weighted results.",
  ],
  [
    "Decisions",
    "Bulk accept and decline, templated mail with merge fields and preview, a per-submission notified flag. Acceptance hands off to onboarding automatically.",
  ],
  [
    "Speaker portal",
    "Submissions, profile and tasks, scoped to the signed-in speaker in SQL rather than by hiding links. Cross-user access returns a real 403.",
  ],
  [
    "Speaker CRM",
    "An org-level directory that outlives a single event: cross-event history, duplicate detection and merge, a kanban sourcing pipeline, saved segments and bulk email.",
  ],
  [
    "Tasks and files",
    "Action, file-request and form tasks. Versioned uploads with the latest flagged, cross-role comments, a deliverables matrix, ZIP export by session or speaker.",
  ],
  [
    "Agenda",
    "Rooms grid with drag-and-drop and click-to-assign, list, day, week, month and conflict views, auto-schedule assist, .ics invites and per-speaker calendar feeds.",
  ],
  [
    "Public site",
    "Sessions, speakers, agenda, itinerary, gallery and a personal schedule with .ics export — every one of them readable logged out.",
  ],
  [
    "Embeds and API",
    "One script tag per widget plus HTML, JSON, XML and iCal feeds. A bearer-token REST API with cursor pagination, OpenAPI 3, and HMAC-signed outbound webhooks.",
  ],
] as const;

const FAQ = [
  {
    q: "It's free. What's the catch?",
    a: (
      <>
        There is no paid tier, no seat limit, no feature held back for an enterprise plan and no
        licence clause that turns commercial use into a phone call. One repository, MIT, all of it.
        It was written to replace the programme module of a suite that costs a real conference about
        forty thousand dollars a year — publishing the result costs nothing extra.
      </>
    ),
  },
  {
    q: "What happens to my conference if this project stops?",
    a: (
      <>
        Nothing. It is already on your machine: no licence server to check in with, no phone-home,
        no key that expires, and it runs with the network unplugged. An abandoned repository still
        boots, and you can fork it. Compare the failure mode of a hosted tool — PaperCall was free
        and well liked, and it closes on 31 August 2026, taking new events with it.
      </>
    ),
  },
  {
    q: "Isn't pretalx open source already?",
    a: (
      <>
        It is, it is excellent, and if it fits your conference you should use it. Two differences.
        It hands off once the schedule is released, where this carries on through decisions, speaker
        onboarding tasks, versioned file deliverables and a cross-event speaker CRM. And its install
        wants Python, PostgreSQL, Redis, a cron runner and a reverse proxy in front; this wants Node
        22, or one <Code>docker compose up</Code>.
      </>
    ),
  },
  {
    q: "How do I get my data out?",
    a: (
      <>
        The database is the export: <Code>data/conferencer.db</Code> is a single SQLite file you can
        copy, open in any tool and query with plain SQL. On top of that there is CSV for
        submissions, speakers, tasks and evaluation scores, a ZIP of every uploaded file by session
        or speaker, iCal feeds, and a bearer-token REST API with an OpenAPI 3 document. Leaving is a{" "}
        <Code>cp</Code>.
      </>
    ),
  },
  {
    q: "Where does the data live?",
    a: (
      <>
        In <Code>data/conferencer.db</Code>, a SQLite file sitting next to the app, with uploads in{" "}
        <Code>data/uploads/</Code>. Both are gitignored. Delete the directory and re-run{" "}
        <Code>npm run seed</Code> whenever you want a clean slate.
      </>
    ),
  },
  {
    q: "Do I need Postgres, Redis or a queue?",
    a: (
      <>
        No — Node 22 and nothing else. That is the whole dependency list, and it is the difference
        between an afternoon and a weekend when you self-host. Queries are synchronous and
        sub-millisecond, which is exactly what lets every page render in one server pass. There is
        no client-side data fetching and no loading-spinner waterfall anywhere in the product.
      </>
    ),
  },
  {
    q: "Can a stranger submit a talk without an invitation?",
    a: (
      <>
        Yes. The public wizard creates the account inline — an email address and a password, with no
        confirmation step in the way — then walks through the submission, the participants and a
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
        transparent local rubric that reads the abstract.
      </>
    ),
  },
  {
    q: "How do I deploy it?",
    a: (
      <>
        <Code>npm run deploy</Code> is <Code>docker compose up -d --build</Code>. One container, one
        volume at <Code>/data</Code> holding the database and the uploads. Set{" "}
        <Code>SESSION_SECRET</Code> and <Code>APP_URL</Code> and you are done. The image
        deliberately fetches no web font at build time, so it builds on a machine with no network.
      </>
    ),
  },
  {
    q: "Who is behind it, and can I change it?",
    a: (
      <>
        It was built for one real conference and opened up because there was no reason not to. Read
        every line before you trust it with a call for speakers — roughly thirty-five thousand of
        them, plain SQL and no ORM, a schema in one <Code>schema.sql</Code> file. Change a review
        rule, add a field type, rip out a module you do not want: that is a pull request against
        your own fork, not a feature request in someone else&rsquo;s backlog.
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
      <MarketingNav
        links={NAV_LINKS}
        ctaHref={ctaHref}
        ctaLabel={ctaLabel}
        overMedia
      />

      {/* ------------------------------------------- hero · outcome video --
          Full-bleed loop of the conference people came for. Copy sits on an
          ink scrim so the type stays readable; product captures live lower. */}
      <section
        data-scrim
        className="relative isolate min-h-[min(92svh,56rem)] overflow-hidden bg-ink text-paper"
      >
        <HeroVideo
          src="/media/hero-conference-v3.mp4"
          poster="/media/hero-conference-v3.webp"
        />
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-[linear-gradient(105deg,var(--color-ink)_0%,color-mix(in_oklch,var(--color-ink)_88%,transparent)_42%,color-mix(in_oklch,var(--color-ink)_55%,transparent)_72%,color-mix(in_oklch,var(--color-ink)_35%,transparent)_100%)]"
        />

        <div className="relative mx-auto flex w-full max-w-6xl flex-col justify-end px-4 pb-20 pt-[calc(var(--nav-height)+4.5rem)] sm:px-6 sm:pb-24 sm:pt-[calc(var(--nav-height)+6rem)]">
          <div className="min-w-0 max-w-[38rem]">
            <h1 className="reveal display text-display-m text-paper" style={{ ["--i" as string]: 0 }}>
              <span className="block">Open the call.</span>
              <span className="block">Ship the agenda.</span>
              <span className="block">Own every line.</span>
            </h1>

            <p
              className="reveal mt-6 max-w-[52ch] text-lg leading-relaxed text-paper/75"
              style={{ ["--i" as string]: 1 }}
            >
              Conferencer runs the entire programme — call for speakers, committee review,
              decisions, speaker onboarding, agenda, public site — and every line of it is MIT.
              No per-event licence, no per-submission tier, no percentage of your ticket sales,
              no demo to sit through. One container, one file, and a copy of the source nobody
              can take back.
            </p>

            <div
              className="reveal mt-8 flex flex-wrap items-center gap-3"
              style={{ ["--i" as string]: 2 }}
            >
              <Link
                href={ctaHref}
                className="nowrap-affordance inline-flex h-11 items-center rounded-pill bg-paper px-6 text-[0.9375rem] font-medium text-ink transition-colors duration-[120ms] ease-out hover:bg-paper-3 active:translate-y-px"
              >
                {event ? "Open the live demo" : "Create an account"}
              </Link>
              <Link
                href="/sign-in"
                className="nowrap-affordance inline-flex h-11 items-center rounded-pill border border-paper/35 bg-transparent px-6 text-[0.9375rem] font-medium text-paper transition-colors duration-[120ms] ease-out hover:bg-paper/10 active:translate-y-px"
              >
                Sign in as an organizer
              </Link>
            </div>

            {event ? (
              <p
                className="reveal wordmark mt-6 text-xs leading-relaxed text-paper/55"
                style={{ ["--i" as string]: 3 }}
              >
                Demo organizer · sbek-organizer@example.com · SbekTest!2027-org
              </p>
            ) : (
              <p
                className="reveal mt-6 text-xs text-paper/55"
                style={{ ["--i" as string]: 3 }}
              >
                No event on this instance yet — run <Code>npm run seed</Code> to load the demo
                conference.
              </p>
            )}
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
            Read out of the database on this instance at request time
            {event ? (
              <>
                {" "}
                for <span className="text-paper">{event.name}</span>,{" "}
                {formatEventDates(event.starts_at, event.ends_at)}
              </>
            ) : null}
            , out of the one SQLite file this instance runs on. Nothing on this page is a marketing
            number, and there is no logo cloud under it because there is nobody to name yet.
          </p>
        </div>
      </Band>

      {/* ------------------------------------------- F4 · the loop --------- */}
      <Band id="loop" band="paper" bordered={false}>
        <div className="py-20 sm:py-28">
          <Eyebrow>The loop</Eyebrow>
          <h2 className="display mt-3 max-w-[18ch] text-2xl text-ink sm:text-3xl">
            One loop, covered properly.
          </h2>
          <p className="mt-4 max-w-[58ch] text-[0.9375rem] leading-relaxed text-neutral">
            Everything in the product serves the same circuit, and anything that does not sit on it
            was left out. Note where the loop keeps going after step four: the accepted-speaker
            half — onboarding, chasing slides, versioned deliverables — is the part free tools hand
            back to you and paid ones charge for.
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

      {/* ------------------------------ the price ------------------------- */}
      <Band id="price" band="paper-2">
        <div className="py-20 sm:py-28">
          <Eyebrow>The price</Eyebrow>
          <h2 className="display mt-3 max-w-[22ch] text-2xl text-ink sm:text-3xl">
            What the same loop costs everywhere else.
          </h2>
          <p className="mt-4 max-w-[58ch] text-[0.9375rem] leading-relaxed text-neutral">
            Quoted from each vendor&rsquo;s own pricing page, linked so you can check it. Notice
            the shapes as much as the numbers: per event, per submission band, per month, or a
            slice of the registrations you sold.
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
              No plan, no per-event fee, no submission ceiling, no share of your revenue, no
              account to create. Your only bill is the box it runs on, and a $5 VPS clears it.
            </p>
          </div>

          <p className="mt-6 max-w-[68ch] text-xs leading-relaxed text-muted-foreground">
            Public pricing pages, read on 11 August 2026; follow the links and check us. Ours is
            the{" "}
            <a
              href="https://github.com/yazinsai/conferencer/blob/main/LICENSE"
              className="underline underline-offset-4 hover:text-ink"
            >
              LICENSE
            </a>{" "}
            file, which is twenty-one lines and has no pricing table in it.
          </p>

          <div className="mt-16 border-t border-rule pt-12 lg:grid lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1fr)] lg:gap-14">
            <h3 className="display max-w-[16ch] text-xl text-ink sm:text-2xl">
              And nobody can switch it off.
            </h3>
            <div className="mt-4 lg:mt-0">
              <p className="max-w-[56ch] text-[0.9375rem] leading-relaxed text-neutral">
                A price you can plan around is the small half of this. The other half is that a
                hosted programme tool is a tenancy: it can be repriced at renewal, acquired,
                repositioned upmarket, or closed. PaperCall is free and widely used, and it shuts
                down on 31 August 2026 — new events can no longer be created, and the existing ones
                are guaranteed only until that date.
              </p>
              <p className="mt-4 max-w-[56ch] text-[0.9375rem] leading-relaxed text-neutral">
                Conferencer cannot do that to you. There is no licence check, no phone-home and no
                key with an expiry; it runs with the network unplugged. Every submission, review
                score, decision and uploaded slide deck sits in one SQLite file on a disk you
                control, which you can back up with <Code>cp</Code> and read with any tool that
                speaks SQL. If this repository went quiet tomorrow, your conference would not
                notice.
              </p>
            </div>
          </div>
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

          <div className="mt-16 space-y-20 sm:space-y-24">
            <TourStep
              n="01"
              src="/screens/cfp-builder.webp"
              alt="The call-for-speakers builder, on its question-list step: fields with types, required and locked flags."
              title="The call for speakers"
              body="Thirteen field types, required and locked flags, character limits, and show-when rules that keep a question hidden until an earlier answer calls for it. A track can route a submission into a review round the moment it lands."
            />
            <TourStep
              n="02"
              src="/screens/review.webp"
              alt="An evaluation plan: two rounds, reviewer progress, scorecards and blind-round settings."
              title="The committee"
              body="Rounds carry their own reviewer pool and their own scorecard. A blind round hides the author from reviewers while the organizer still sees everything. Distribution respects per-reviewer caps and conflicts of interest."
            />
            <TourStep
              n="03"
              src="/screens/agenda.webp"
              alt="The agenda board: unscheduled sessions on the left, a rooms-by-time grid on the right."
              title="The agenda"
              body="Drag a session into a room, or click to place it. Two talks in one room is never right, so it is blocked; a five-minute panel overlap can be deliberate, so it only warns. Publishing shows a diff of what moved."
            />
          </div>
        </div>
      </Band>

      {/* ------------------------------ F3 · the spec sheet ---------------- */}
      <Band id="inside" band="paper-2">
        <div className="py-20 sm:py-28">
          <Eyebrow>The spec sheet</Eyebrow>
          <h2 className="display mt-3 text-2xl text-ink sm:text-3xl">What is in the box</h2>
          <p className="mt-4 max-w-[58ch] text-[0.9375rem] leading-relaxed text-neutral">
            Roughly thirty-five thousand lines across a hundred and sixteen pages. The list below
            is the whole of it, not a highlight reel — and unusually for a feature list, you can
            go and check it line by line.
          </p>

          <dl className="mt-14 grid grid-cols-1 gap-x-12 border-t border-rule md:grid-cols-2">
            {INSIDE.map(([area, detail]) => (
              <div key={area} className="border-b border-rule py-6">
                <dt className="display text-[0.9375rem] text-ink">{area}</dt>
                <dd className="mt-2 text-sm leading-relaxed text-neutral">{detail}</dd>
              </div>
            ))}
          </dl>
        </div>
      </Band>

      {/* ------------------------------ the published result --------------- */}
      <Band band="paper">
        <div className="py-20 sm:py-28">
          <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:gap-16">
            <div className="min-w-0">
              <Eyebrow>The result</Eyebrow>
              <h2 className="display mt-3 max-w-[16ch] text-2xl text-ink sm:text-3xl">
                And then it is just a website.
              </h2>
              <p className="mt-4 max-w-[52ch] text-[0.9375rem] leading-relaxed text-neutral">
                The public side is server-rendered and readable logged out: sessions, speakers,
                the agenda grid, an itinerary, a speaker gallery and a personal schedule that
                exports to <Code>.ics</Code>. Only accepted and approved submissions ever appear —
                acceptance and content approval are separate gates.
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
              alt="The public agenda grid: three days, four rooms, sessions coloured by track."
              caption="The same programme, published."
            />
          </div>
        </div>
      </Band>

      {/* ------------------------------ conversational FAQ ----------------- */}
      <Band band="paper-2">
        <div className="py-20 sm:py-24">
          <Eyebrow>Before you ask</Eyebrow>
          <h2 className="display mt-3 text-2xl text-ink sm:text-3xl">Reasonable questions</h2>
          <div className="mt-12">
            <Faq items={FAQ} />
          </div>
        </div>
      </Band>

      {/* ------------------------------ Ft5 · statement footer -------------
          The fourth sanctioned photograph (design.md rule 8): an empty hall,
          because the closing argument is permanence. The scrim contract holds —
          the gradient lives on the background and the surface flips its text in
          the same rule. */}
      <footer
        data-scrim
        className="relative isolate overflow-hidden border-t border-rule bg-ink text-paper"
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- see Shot in
            components/marketing/pieces.tsx; a fixed local asset, eager because
            it is the closing surface. */}
        <img
          src="/media/hall.webp"
          alt=""
          width={2000}
          height={1125}
          loading="eager"
          decoding="async"
          className="absolute inset-0 -z-10 size-full object-cover"
        />
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-[linear-gradient(100deg,var(--color-ink)_0%,color-mix(in_oklch,var(--color-ink)_92%,transparent)_55%,color-mix(in_oklch,var(--color-ink)_72%,transparent)_100%)]"
        />

        <div className="mx-auto w-full max-w-6xl px-4 py-24 sm:px-6 sm:py-32">
          <p className="display max-w-[16ch] text-display-s">Rent nothing. Own the programme.</p>
          <p className="mt-5 max-w-[46ch] text-[0.9375rem] leading-relaxed text-paper/75">
            Clone it, run it, fork it, never pay for it. One container, one volume, and a
            conference you can back up with <Code>cp</Code>.
          </p>

          <div className="mt-10 flex flex-wrap gap-3">
            {/* On ink, the primary's own fill disappears, so the pair inverts:
                paper fill for the verb, a paper hairline for the alternative. */}
            <Link
              href={ctaHref}
              className="nowrap-affordance inline-flex h-11 items-center rounded-pill bg-paper px-6 text-[0.9375rem] font-medium text-ink transition-colors duration-[120ms] ease-out hover:bg-paper-3 active:translate-y-px"
            >
              {ctaLabel}
            </Link>
            <Link
              href="https://github.com/yazinsai/conferencer"
              className="nowrap-affordance inline-flex h-11 items-center rounded-pill border border-paper/30 px-6 text-[0.9375rem] font-medium text-paper transition-colors duration-[120ms] ease-out hover:border-paper/60 active:translate-y-px"
            >
              Read the source
            </Link>
          </div>

          <div className="mt-16 flex flex-wrap items-center justify-between gap-x-8 gap-y-3 border-t border-paper/20 pt-6 text-xs text-paper/65">
            <p className="wordmark flex items-center gap-2 text-paper">
              <LogoMark size={18} />
              Conferencer
            </p>
            <nav aria-label="Footer" className="flex flex-wrap items-center gap-x-5 gap-y-2">
              <Link
                href="/api-docs"
                className="nowrap-affordance underline-offset-4 hover:text-paper hover:underline"
              >
                API reference
              </Link>
              <a
                href="https://github.com/yazinsai/conferencer"
                className="nowrap-affordance underline-offset-4 hover:text-paper hover:underline"
              >
                Source
              </a>
              {event ? (
                <Link
                  href={`/e/${event.slug}`}
                  className="nowrap-affordance underline-offset-4 hover:text-paper hover:underline"
                >
                  {event.name}
                </Link>
              ) : null}
              <span>MIT</span>
            </nav>
          </div>
        </div>
      </footer>
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
