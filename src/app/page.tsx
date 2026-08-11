import Link from "next/link";
import type { Metadata } from "next";

import { defaultEvent } from "@/lib/repo/events";
import { defaultForm } from "@/lib/repo/forms";
import { publicSessions, publicSpeakers, statusCounts } from "@/lib/repo/submissions";
import { daysUntil, formatEventDates } from "@/lib/datetime";
import { LinkButton } from "@/components/ui";
import { MarketingNav } from "@/components/marketing/nav";
import { Band, Faq, Shot } from "@/components/marketing/pieces";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Conferencer — run your conference programme",
  description:
    "Open-source conference programme management. Call for speakers, committee review, speaker onboarding, agenda building and a public schedule — one app, one SQLite file, MIT licensed.",
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
 */

const NAV_LINKS = [
  { href: "#loop", label: "The loop" },
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
        No — Node 22 and nothing else. Queries are synchronous and sub-millisecond, which is exactly
        what lets every page render in one server pass. There is no client-side data fetching and no
        loading-spinner waterfall anywhere in the product.
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
    q: "Is it really MIT?",
    a: (
      <>
        Yes. Fork it, run it, never pay for it. It was built to replace the programme module of a
        conference suite that costs about forty thousand dollars a year, for one real conference.
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

      {/* --------------------------------------------------- H8 · hero ----- */}
      <section className="bg-paper pt-[calc(var(--nav-height)+2.5rem)] sm:pt-[calc(var(--nav-height)+3.5rem)]">
        <div className="mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-10 px-4 pb-24 sm:px-6 sm:pb-32 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:gap-14">
          <div className="min-w-0">
            {/* Three sentences, three lines. The break is the design, not the
                consequence of a max-width guessing where to wrap. */}
            <h1 className="reveal display text-display-m text-ink" style={{ ["--i" as string]: 0 }}>
              <span className="block">Open the call.</span>
              <span className="block">Review the talks.</span>
              <span className="block">Ship the agenda.</span>
            </h1>

            <p
              className="reveal mt-6 max-w-[52ch] text-lg leading-relaxed text-neutral"
              style={{ ["--i" as string]: 1 }}
            >
              Conferencer is the programme half of a conference-management suite, as one app with
              one file. No database server, no cloud account, and no API key required to boot it.
            </p>

            <div
              className="reveal mt-8 flex flex-wrap items-center gap-3"
              style={{ ["--i" as string]: 2 }}
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
                style={{ ["--i" as string]: 3 }}
              >
                Demo organizer · sbek-organizer@example.com · SbekTest!2027-org
              </p>
            ) : (
              <p
                className="reveal mt-6 text-xs text-muted-foreground"
                style={{ ["--i" as string]: 3 }}
              >
                No event on this instance yet — run <Code>npm run seed</Code> to load the demo
                conference.
              </p>
            )}
          </div>

          <Shot
            className="reveal"
            src="/screens/dashboard.webp"
            alt="The organizer dashboard: days until the event, submission counts, submission status and a speaker-readiness table."
            priority
            width={1440}
            height={900}
            caption="The organizer dashboard, rendered from this repository."
          />
        </div>
      </section>

      {/* ------------------------------------------- T4 · live figures ----- */}
      <Band band="ink" bordered={false}>
        <div className="py-10">
          <dl className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-4">
            {[
              { label: "Sessions published", value: live.sessions },
              { label: "Speakers listed", value: live.speakers },
              { label: "Submissions received", value: live.submissions },
              { label: "Days until it opens", value: live.countdown },
            ].map((fact) => (
              <div key={fact.label}>
                <dd className="wordmark tnum text-3xl font-medium tracking-[-0.02em] text-paper sm:text-4xl">
                  {fact.value}
                </dd>
                <dt className="mt-1.5 text-sm text-paper/65">{fact.label}</dt>
              </div>
            ))}
          </dl>
          <p className="mt-8 max-w-[60ch] text-sm leading-relaxed text-paper/65">
            Read out of the database on this instance at request time
            {event ? (
              <>
                {" "}
                for <span className="text-paper">{event.name}</span>,{" "}
                {formatEventDates(event.starts_at, event.ends_at)}
              </>
            ) : null}
            . Nothing on this page is a marketing number.
          </p>
        </div>
      </Band>

      {/* ------------------------------------------- F4 · the loop --------- */}
      <Band id="loop" band="paper" bordered={false}>
        <div className="py-20 sm:py-24">
          <h2 className="display max-w-[18ch] text-2xl text-ink sm:text-3xl">
            One loop, covered properly.
          </h2>
          <p className="mt-4 max-w-[58ch] text-[0.9375rem] leading-relaxed text-neutral">
            Everything in the product serves the same circuit. Anything that does not sit on it was
            left out.
          </p>

          <ol className="mt-12 grid gap-x-10 gap-y-10 border-t border-rule pt-10 sm:grid-cols-2 lg:grid-cols-3">
            {LOOP.map((step) => (
              <li key={step.n} className="min-w-0">
                {/* Numeral above the heading, same column. Genuinely ordinal
                    content is the one place a numeral earns its keep. */}
                <p className="wordmark tnum text-xs tracking-[0.14em] text-muted-foreground">
                  {step.n}
                </p>
                <h3 className="display mt-2 text-lg text-ink">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-neutral">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </Band>

      {/* ------------------------------ F5 · the workbench tour ------------ */}
      <Band id="tour" band="paper-2">
        <div className="py-20 sm:py-24">
          <h2 className="display max-w-[20ch] text-2xl text-ink sm:text-3xl">
            Three screens do most of the work.
          </h2>

          <div className="mt-14 space-y-20">
            <TourStep
              src="/screens/cfp-builder.webp"
              alt="The call-for-speakers builder, on its question-list step: fields with types, required and locked flags."
              title="The call for speakers"
              body="Thirteen field types, required and locked flags, character limits, and show-when rules that keep a question hidden until an earlier answer calls for it. A track can route a submission into a review round the moment it lands."
              side="left"
            />
            <TourStep
              src="/screens/review.webp"
              alt="An evaluation plan: two rounds, reviewer progress, scorecards and blind-round settings."
              title="The committee"
              body="Rounds carry their own reviewer pool and their own scorecard. A blind round hides the author from reviewers while the organizer still sees everything. Distribution respects per-reviewer caps and conflicts of interest."
              side="right"
            />
            <TourStep
              src="/screens/agenda.webp"
              alt="The agenda board: unscheduled sessions on the left, a rooms-by-time grid on the right."
              title="The agenda"
              body="Drag a session into a room, or click to place it. Two talks in one room is never right, so it is blocked; a five-minute panel overlap can be deliberate, so it only warns. Publishing shows a diff of what moved."
              side="left"
            />
          </div>
        </div>
      </Band>

      {/* ------------------------------ F3 · the spec sheet ---------------- */}
      <Band id="inside" band="paper">
        <div className="py-20 sm:py-24">
          <h2 className="display text-2xl text-ink sm:text-3xl">What is in the box</h2>
          <p className="mt-4 max-w-[58ch] text-[0.9375rem] leading-relaxed text-neutral">
            Roughly thirty-five thousand lines across a hundred and sixteen pages. The list below is
            the whole of it, not a highlight reel.
          </p>

          <dl className="mt-12 border-t border-rule">
            {INSIDE.map(([area, detail]) => (
              <div
                key={area}
                className="grid gap-x-10 gap-y-1 border-b border-rule py-5 md:grid-cols-[minmax(0,13rem)_minmax(0,1fr)]"
              >
                <dt className="display text-[0.9375rem] text-ink">{area}</dt>
                <dd className="max-w-[70ch] text-sm leading-relaxed text-neutral">{detail}</dd>
              </div>
            ))}
          </dl>
        </div>
      </Band>

      {/* ------------------------------ the published result --------------- */}
      <Band band="paper-2">
        <div className="grid items-center gap-10 py-20 sm:py-24 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:gap-14">
          <div className="min-w-0">
            <h2 className="display max-w-[16ch] text-2xl text-ink sm:text-3xl">
              And then it is just a website.
            </h2>
            <p className="mt-4 max-w-[52ch] text-[0.9375rem] leading-relaxed text-neutral">
              The public side is server-rendered and readable logged out: sessions, speakers, the
              agenda grid, an itinerary, a speaker gallery and a personal schedule that exports to{" "}
              <Code>.ics</Code>. Only accepted and approved submissions ever appear — acceptance and
              content approval are separate gates.
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
      </Band>

      {/* ------------------------------ conversational FAQ ----------------- */}
      <Band band="paper">
        <div className="py-20 sm:py-24">
          <h2 className="display text-2xl text-ink sm:text-3xl">Reasonable questions</h2>
          <div className="mt-10">
            <Faq items={FAQ} />
          </div>
        </div>
      </Band>

      {/* ------------------------------ Ft5 · statement footer ------------- */}
      <footer className="border-t border-rule bg-paper-2">
        <div className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6 sm:py-24">
          <p className="display max-w-[16ch] text-display-s text-ink">Own your programme.</p>
          <p className="mt-5 max-w-[46ch] text-[0.9375rem] leading-relaxed text-neutral">
            Clone it, run it, never pay for it. One container, one volume, and a database you can
            copy with <Code>cp</Code>.
          </p>

          <div className="mt-10 flex flex-wrap gap-3">
            <LinkButton href={ctaHref} variant="primary" size="lg" className="nowrap-affordance">
              {ctaLabel}
            </LinkButton>
          </div>

          <div className="mt-14 flex flex-wrap items-center justify-between gap-x-8 gap-y-3 border-t border-rule pt-6 text-xs text-muted-foreground">
            <p className="wordmark text-ink">Conferencer</p>
            <nav aria-label="Footer" className="flex flex-wrap items-center gap-x-5 gap-y-2">
              <Link href="/api-docs" className="nowrap-affordance underline-offset-4 hover:text-ink hover:underline">
                API reference
              </Link>
              <a
                href="https://github.com/yazinsai/conferencer"
                className="nowrap-affordance underline-offset-4 hover:text-ink hover:underline"
              >
                Source
              </a>
              {event ? (
                <Link
                  href={`/e/${event.slug}`}
                  className="nowrap-affordance underline-offset-4 hover:text-ink hover:underline"
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

/** One stop on the Workbench tour: a real capture and the claim it backs. */
function TourStep({
  src,
  alt,
  title,
  body,
  side,
}: {
  src: string;
  alt: string;
  title: string;
  body: string;
  side: "left" | "right";
}) {
  // The wide track has to follow the image, not the DOM order, or the reversed
  // row hands the screenshot the narrow column and the caption the wide one.
  const columns =
    side === "left"
      ? "lg:grid-cols-[minmax(0,1fr)_minmax(0,1.45fr)]"
      : "lg:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)]";

  return (
    <div className={`grid items-center gap-8 lg:gap-14 ${columns}`}>
      <div className={side === "right" ? "min-w-0 lg:order-2" : "min-w-0"}>
        <h3 className="display text-xl text-ink">{title}</h3>
        <p className="mt-3 max-w-[46ch] text-sm leading-relaxed text-neutral">{body}</p>
      </div>
      <Shot src={src} alt={alt} className={side === "right" ? "lg:order-1" : undefined} />
    </div>
  );
}
