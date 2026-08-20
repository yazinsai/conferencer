import Link from "next/link";
import type { Metadata } from "next";

import { defaultEvent } from "@/lib/repo/events";
import { defaultForm } from "@/lib/repo/forms";
import { publicSessions, publicSpeakers, statusCounts } from "@/lib/repo/submissions";
import { daysUntil, formatEventDates } from "@/lib/datetime";
import { COMPARISONS_READ_DATE } from "@/lib/compare";
import { landingDemo } from "@/lib/demo-conference";
import { demoEnterHref } from "@/lib/demo-login";
import { LinkButton } from "@/components/ui";
import { MarketingNav } from "@/components/marketing/nav";
import { MarketingFooter } from "@/components/marketing/footer";
import { RevealOnce } from "@/components/marketing/reveal";
import { Icon, type IconName } from "@/components/ui/icon";
import { Band, FactStrip, Faq, Head, Playable, Tile } from "@/components/marketing/pieces";
import { AgendaPlayground } from "@/components/marketing/demo/agenda-playground";
import { CountUp } from "@/components/marketing/demo/count-up";
import { CopyEmbed } from "@/components/marketing/demo/copy-embed";
import { DecisionsDemo } from "@/components/marketing/demo/decisions-demo";
import { FormBuilderDemo } from "@/components/marketing/demo/form-builder-demo";
import { PortalTasksDemo } from "@/components/marketing/demo/portal-tasks-demo";
import { ScheduleToggle } from "@/components/marketing/demo/schedule-toggle";
import { ScorecardDemo } from "@/components/marketing/demo/scorecard-demo";
import { SearchDemo, type SearchRow } from "@/components/marketing/demo/search-demo";
import { Steps, type Step } from "@/components/marketing/demo/steps";
import { SubmitDemo } from "@/components/marketing/demo/submit-demo";

/* Hallmark · genre: modern-minimal · macrostructure: 01 Bento Grid — live product tiles ·
 * design-system: design.md · designed-as-app
 * hero: centred display + one-sentence lede, then the agenda board itself, playable ·
 * proof: FactStrip (the honest occupant of the logo-strip slot) ·
 * steps: three cards that are a tablist over one crossfading live panel ·
 * bento: five tiles of mixed span, each one a running screen ·
 * more: the spec sheet as a tight two-column index, sidebar glyphs as wayfinding ·
 * figures: live counts on an ink surface flip, counted up once on first view ·
 * price: the sourced ledger with an inverted final row ·
 * nav: N1b (locked) · footer: Ft5 statement over photography (locked)
 *
 * The page's argument, in one line: this is the product, and you can touch it.
 * Every panel is a real screen of this repository running on the demo
 * conference's own rows (design.md § Live product tiles), which is why there is
 * not a single screenshot left on this page.
 */

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Conferencer — the better way to run your conference programme",
  description:
    "Collect talks, review them with your committee, and publish the agenda. Free, open source, self-hosted in one container — and playable on the landing page before you install anything.",
};

/**
 * Macrostructure 01 · Bento Grid with live product tiles (design.md § Macrostructure
 * families). The page used to be 05 Workbench, arguing from five screenshots of the
 * organizer UI. Screenshots are a claim a reader has to take on trust, and at the
 * width a landing page can give one, a dense admin screen reads as grey texture.
 * So the captures are gone and the software is here instead: drag a talk onto the
 * agenda, watch the room double-booking get refused, publish it, score a
 * submission, accept three at once and read the letters they generate.
 *
 * Deliberately absent, and it must stay absent: a logo cloud, a testimonial wall,
 * a percentage claim, a photograph of a conference that did not happen. Conferencer
 * has no customers to name, and one invented logo would make every checkable claim
 * beside it stop being believed. In their place: repository facts, counts read out
 * of this instance's database at request time, and competitor pricing quoted from
 * each vendor's own page.
 */

const NAV_LINKS = [
  { href: "#how", label: "How it works" },
  { href: "#tools", label: "Product" },
  { href: "#everything", label: "Features" },
  { href: "#price", label: "Pricing" },
  { href: "/vs", label: "Compare" },
  { href: "/api-docs", label: "API" },
];

/** The honest occupant of the reference's logo-strip slot: checkable facts. */
const FACTS = [
  "MIT licensed",
  "One container",
  "One SQLite file",
  "No per-event fee",
  "No cut of your tickets",
] as const;

/**
 * The price row. Every figure is quoted from the vendor's own public pricing page
 * and linked so a reader can check it in one click. Where a vendor publishes no
 * number, the row says exactly that rather than inventing one, and no row
 * characterises a competitor's product — only what it costs to use.
 */
const ELSEWHERE = [
  {
    name: "Sessionboard",
    slug: "sessionboard",
    href: "https://www.sessionboard.com/pricing",
    price: "From $249 / mo",
    note: "Every plan ends in the same button: request a demo.",
  },
  {
    name: "Sessionize",
    slug: "sessionize",
    href: "https://sessionize.com/pricing",
    price: "$499 / event",
    note: "Per event occurrence, plus tax. The free tier is for free community events only.",
  },
  {
    name: "Oxford Abstracts",
    slug: "oxford-abstracts",
    href: "https://oxfordabstracts.com/pricing/",
    price: "$890–$3,450 / event",
    note: "Add-ons are $150–$850 each. Registration takes 2.5% of ticket revenue, capped at $5,000.",
  },
  {
    name: "Ex Ordo",
    slug: "ex-ordo",
    href: "https://www.exordo.com/pricing/",
    price: "Ask us",
    note: "The pricing page is a contact form.",
  },
  {
    name: "PaperCall",
    slug: "papercall",
    href: "https://www.papercall.io",
    price: "$0, until August",
    note: "Free, well liked, and closing on 31 August 2026.",
  },
  {
    name: "pretalx",
    slug: "pretalx",
    href: "https://pretalx.com/p/pricing/",
    price: "From €199 / event",
    note: "Open source and genuinely good. Self-hosting wants Python, PostgreSQL, Redis and a cron runner.",
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
    detail: "14 field types, show-when logic, track routing, close dates, drafts.",
  },
  {
    icon: "submissions",
    area: "Submissions",
    detail: "Status tabs, bulk edits, saved views, CSV export, restorable history.",
  },
  {
    icon: "evaluation",
    area: "Review",
    detail: "Multi-round plans, eight scorecard types, anonymized rounds, weighted results.",
  },
  {
    icon: "decision",
    area: "Decisions",
    detail: "Accept and decline in bulk, with a per-recipient email preview.",
  },
  {
    icon: "portals",
    area: "Speaker portal",
    detail: "Each speaker's own tasks and profile, scoped in SQL rather than by hiding links.",
  },
  {
    icon: "crm",
    area: "Speaker CRM",
    detail: "A directory that outlives one event: history, merge, pipeline, segments.",
  },
  {
    icon: "tasks",
    area: "Tasks and files",
    detail: "Versioned uploads, cross-role comments, a deliverables matrix, ZIP export.",
  },
  {
    icon: "agenda",
    area: "Agenda",
    detail: "A rooms grid you drag onto, conflict views, .ics invites, calendar feeds.",
  },
  {
    icon: "globe",
    area: "Public site",
    detail: "Sessions, speakers, agenda, itinerary and a personal schedule. No login.",
  },
  {
    icon: "embeds",
    area: "Embeds and API",
    detail: "One script tag per widget, plus a REST API with OpenAPI 3 and signed webhooks.",
  },
] as const satisfies ReadonlyArray<{ icon: IconName; area: string; detail: string }>;

/** The three guarantees behind § the price. */
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
        Every submission, score, decision and slide deck lives in <Code>data/conferencer.db</Code>,
        which any tool that speaks SQL can read.
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
        Measured on a 2-core box from a clean clone: install 7 seconds, seed 2 seconds, first page in
        under a second. The seed loads a full demo conference, so every screen has real data in it
        from the first click. In production, <Code>npm run deploy</Code> is one{" "}
        <Code>docker compose up</Code>.
      </>
    ),
  },
  {
    q: "It's free. What's the catch?",
    a: (
      <>
        There is no paid tier, no seat limit and no feature held back for an enterprise plan. One
        repository, MIT licensed, all of it. It was written to replace the programme module of a
        suite that cost one conference about forty thousand dollars a year.
      </>
    ),
  },
  {
    q: "What happens to my conference if this project stops?",
    a: (
      <>
        Nothing. It is already on your machine: no licence server, no phone-home, no key that
        expires. An abandoned repository still boots, and you can fork it. Compare a hosted tool:
        PaperCall is free and well liked, and it closes on 31 August 2026.
      </>
    ),
  },
  {
    q: "Isn't pretalx open source already?",
    a: (
      <>
        It is, it is excellent, and if it fits your conference you should use it. Conferencer keeps
        going after the schedule is released — decisions, onboarding tasks, versioned deliverables, a
        speaker CRM across events — and it installs with Node 22 or one <Code>docker compose up</Code>
        , where pretalx wants Python, PostgreSQL, Redis and a cron runner. The full comparison is on{" "}
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
        The database is the export: <Code>data/conferencer.db</Code> is one SQLite file you can copy
        and query with plain SQL, with the uploads beside it. There is also CSV for submissions,
        speakers, tasks and scores, a ZIP of every file, iCal feeds, and a REST API with an OpenAPI 3
        document.
      </>
    ),
  },
  {
    q: "Do I need Postgres, Redis or a queue?",
    a: (
      <>
        No — Node 22 and nothing else. Queries are synchronous and sub-millisecond, which is what
        lets every page render in one server pass. There is no loading-spinner waterfall anywhere in
        the product.
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
        have gone out. Set <Code>RESEND_API_KEY</Code> when you want it to leave the building. With
        no OpenAI key, AI triage falls back to a local rubric that reads the abstract.
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

  // The rows every playable runs on: this instance's demo conference when it is
  // seeded, and the checked-in slice of seed/fixtures.ts when it is not.
  const demo = landingDemo();

  // Every figure in the counts band is read out of the database at request time.
  // When the database is empty they render as em dashes with the same label — a
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

  const ctaHref = event ? demoEnterHref() : "/sign-up";
  const ctaLabel = event ? "Enter the live product" : "Create an account";
  const adminHref = demo.slug ? `/admin/e/${demo.slug}` : "/sign-in";
  const enter = (path: string) => demoEnterHref(path);

  const steps: Step[] = [
    {
      id: "build",
      n: "01",
      title: "You build the call",
      body: "Write the questions. Hide one until an earlier answer calls for it.",
      panel: (
        <Playable
          hint="Reorder a question, make it required, or switch its show-when rule off."
          note="The real builder saves to SQLite and versions the form; this panel keeps its changes in the browser."
          href={enter(`${adminHref}/forms`)}
          hrefLabel="Open the real builder"
        >
          <FormBuilderDemo questions={demo.questions} longFormat={demo.longFormat} />
        </Playable>
      ),
    },
    {
      id: "submit",
      n: "02",
      title: "Speakers submit",
      body: "A public form anyone can fill in. It creates their account as they go.",
      panel: (
        <Playable
          hint={`Pick ${demo.longFormat} and watch a question arrive.`}
          note="The real form posts to a server action, saves a resumable draft and emails a receipt."
          href={demo.slug && form ? `/e/${demo.slug}/submit/${form.id}` : "/sign-up"}
          hrefLabel="Open the real form"
        >
          <SubmitDemo
            questions={demo.questions}
            longFormat={demo.longFormat}
            eventName={demo.eventName}
          />
        </Playable>
      ),
    },
    {
      id: "review",
      n: "03",
      title: "The committee scores",
      body: "One scorecard at a time, weighted, and blind if you want it blind.",
      panel: (
        <Playable
          hint="Score it. The weighted total is computed by the product's own function."
          note="The real scorecard writes each review to the database and moves you to the next assignment."
          href={demoEnterHref("/review", "reviewer")}
          hrefLabel="Open the real queue"
        >
          <ScorecardDemo
            questions={demo.scorecard}
            reviewOf={demo.reviewOf}
            queue={demo.queue}
          />
        </Playable>
      ),
    },
  ];

  // The search tile's corpus: the same rows the rest of the page shows.
  const searchRows: SearchRow[] = [
    ...demo.submissions.map((row) => ({
      id: row.id,
      label: row.title,
      meta: [row.speakers, row.track].filter(Boolean).join(" · "),
      kind: "submission",
    })),
    ...demo.tray.map((row) => ({
      id: `t-${row.id}`,
      label: row.title,
      meta: [row.format, row.track].filter(Boolean).join(" · "),
      kind: "session",
    })),
    ...[...new Set(demo.submissions.map((row) => row.speakers).filter(Boolean))].map((name) => ({
      id: `s-${name}`,
      label: name,
      meta: "Speaker · DevFlow Conf 2027",
      kind: "speaker",
    })),
  ];

  return (
    <>
      <MarketingNav links={NAV_LINKS} ctaHref={ctaHref} ctaLabel={ctaLabel} />
      <RevealOnce />

      {/* ================================================= hero · the product
          Centred display, one sentence, two pills — then the agenda board
          itself, at full measure and deliberately clipped by the fold. The
          reference's hero puts a picture of software here; this one puts the
          software. */}
      <section className="border-b border-rule bg-paper">
        <div className="mx-auto w-full max-w-6xl px-4 pb-14 pt-[calc(var(--nav-height)+3rem)] sm:px-6 sm:pb-20 sm:pt-[calc(var(--nav-height)+4.5rem)]">
          <div className="mx-auto max-w-3xl text-center">
            <h1
              className="reveal display text-balance text-display-m text-ink"
              style={{ ["--i" as string]: 0 }}
            >
              The better way to run your conference programme
            </h1>

            <p
              className="reveal mx-auto mt-5 max-w-[46ch] text-pretty text-md leading-relaxed text-neutral sm:text-lg"
              style={{ ["--i" as string]: 1 }}
            >
              Collect talks, review them with your committee, and publish the agenda. Free, open
              source, and yours forever.
            </p>

            <div
              className="reveal mt-8 flex flex-wrap items-center justify-center gap-3"
              style={{ ["--i" as string]: 2 }}
            >
              <LinkButton href={ctaHref} variant="primary" size="lg" className="nowrap-affordance">
                {event ? "Enter the live product" : "Create an account"}
              </LinkButton>
              <LinkButton
                href={event ? `/e/${event.slug}` : "/sign-in"}
                size="lg"
                className="nowrap-affordance"
              >
                {event ? "Public event site" : "Sign in"}
              </LinkButton>
            </div>

            <p
              className="reveal mt-5 text-sm text-muted-foreground"
              style={{ ["--i" as string]: 3 }}
            >
              No demo call. No credit card. No seat limits.
            </p>

            {/* Demo credentials stay under the fold — main renamed the personas to
                Harry Potter roles and the landing page is still the place a visitor
                finds the organizer login. */}
            {event ? (
              <p
                className="reveal wordmark mt-3 text-xs leading-relaxed text-muted-foreground"
                style={{ ["--i" as string]: 4 }}
              >
                Follow{" "}
                <Link href="/demo" className="underline decoration-rule-2 underline-offset-4">
                  /demo
                </Link>{" "}
                to enter as organizer Minerva McGonagall.
              </p>
            ) : (
              <p
                className="reveal mt-3 text-xs text-muted-foreground"
                style={{ ["--i" as string]: 4 }}
              >
                No event on this instance yet — run <Code>npm run seed</Code> to load the demo
                conference.
              </p>
            )}
          </div>

          {/* The fold's proof: not a capture of the agenda board, the board. */}
          <div className="reveal mt-14 sm:mt-16" style={{ ["--i" as string]: 4 }}>
            <Playable
              hint="Drag a talk onto the grid, then try dropping one on top of another."
              note="The real board posts to a server action and recomputes conflicts in lib/repo/agenda.ts."
              href={enter(`${adminHref}/agenda`)}
              hrefLabel="Open the real board"
            >
              <AgendaPlayground
                talks={demo.tray}
                rooms={demo.rooms}
                slots={demo.slots}
                day={demo.day}
              />
            </Playable>
          </div>
        </div>
      </section>

      {/* ================================================= the fact strip ---- */}
      <Band band="paper" bordered={false}>
        <div className="py-10 sm:py-12">
          <FactStrip items={FACTS} />
        </div>
      </Band>

      {/* ================================================= how it works ------ */}
      <Band id="how" band="paper-2" pad="xl">
        <Head
          title="Running a call for speakers is easy"
          lede="Build the form, review what arrives, publish the agenda. Every panel below is the real screen."
        />
        <div className="mt-12 sm:mt-14">
          <Steps steps={steps} />
        </div>
      </Band>

      {/* ================================================= the bento --------- */}
      <Band id="tools" band="paper" pad="2xl">
        <Head
          title="Your all-purpose programme tool"
          lede="Decisions, speaker onboarding, the public site, embeds, search. One tool, nothing to integrate."
        />

        <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
          <Tile
            wide
            title="Accept in bulk, without accidents"
            body="Pick the winners, then read the letter each speaker actually gets — merge fields filled in per recipient."
          >
            <Playable
              note="The real screen writes the decision, queues the email and opens each speaker's portal."
              href={enter(`${adminHref}/submissions`)}
              hrefLabel="Open the real table"
            >
              <DecisionsDemo submissions={demo.submissions} />
            </Playable>
          </Tile>

          <Tile
            title="Onboarding, both sides"
            body="A speaker ticks a task; the cell you were chasing turns green."
          >
            <Playable
              note="The real portal versions each upload and notifies the organizer."
              href={enter(`${adminHref}/tasks/deliverables`)}
              hrefLabel="Open the real matrix"
            >
              <PortalTasksDemo tasks={demo.tasks} speaker={demo.speakerName} />
            </Playable>
          </Tile>

          <Tile
            title="Put it on any site"
            body="One token per widget. The same token serves HTML, JSON, XML or iCal."
          >
            <Playable
              note="The real embed is signed and cacheable, and the API is bearer-token REST with OpenAPI 3."
              href={enter(`${adminHref}/embeds`)}
              hrefLabel="Open the real embeds"
            >
              <CopyEmbed slug={demo.slug} />
            </Playable>
          </Tile>

          <Tile
            title="Attendees get a website, not a PDF"
            body="Sessions, speakers, the agenda grid, and a personal schedule that exports to .ics. Nobody signs in to read it."
          >
            <Playable
              note="The real site is public, per-event branded, and renders in one server pass."
              href={demo.slug ? `/e/${demo.slug}/agenda` : "/sign-up"}
              hrefLabel="Open the real site"
            >
              <ScheduleToggle talks={demo.tray} rooms={demo.rooms} slots={demo.slots} />
            </Playable>
          </Tile>

          <Tile
            title="One box, everything"
            body="Submissions, speakers and sessions, together."
          >
            <Playable
              note="The real search queries SQLite, so it reaches abstracts and answers as well as titles."
              href={enter(`${adminHref}/search`)}
              hrefLabel="Open the real search"
            >
              <SearchDemo rows={searchRows} />
            </Playable>
          </Tile>
        </div>
      </Band>

      {/* ================================================= the spec sheet ---- */}
      <Band id="everything" band="paper-2" pad="xl">
        <Head
          title="…and so much more"
          lede="Ten areas, 116 screens. The whole list, not a highlight reel — and you can go and check it line by line."
        />

        <dl className="mt-12 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
          {INSIDE.map((row) => (
            <div
              key={row.area}
              className="hm-reveal hm-lift grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 rounded-tile border border-rule bg-paper p-4"
            >
              {/* 17px muted is the organizer sidebar's exact treatment. */}
              <Icon name={row.icon} size={17} className="mt-0.5 text-muted-foreground" />
              <dt className="display text-[0.9375rem] text-ink">{row.area}</dt>
              <dd className="col-start-2 mt-1 text-sm leading-relaxed text-neutral">{row.detail}</dd>
            </div>
          ))}
        </dl>
      </Band>

      {/* ================================================= live figures ------
          The reference puts a testimonial wall here. These four numbers were
          counted in this instance's database when the page was requested. */}
      <Band
        band="ink"
        bordered={false}
        photo={{ src: "/media/audience.webp", width: 2000, height: 1125 }}
      >
        <div className="py-20 sm:py-24">
          <div className="hm-reveal mx-auto max-w-3xl text-center">
            <h2 className="display text-balance text-2xl text-paper sm:text-3xl">
              Everything on this page is real
            </h2>
            <p className="mx-auto mt-4 max-w-[54ch] text-pretty text-md leading-relaxed text-paper/75">
              These four were counted in this instance&rsquo;s database when you loaded the page
              {event ? (
                <>
                  {" "}
                  — <span className="text-paper">{event.name}</span>,{" "}
                  {formatEventDates(event.starts_at, event.ends_at)}
                </>
              ) : null}
              .
            </p>
          </div>

          <dl className="mt-14 grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-4">
            {[
              { label: "Sessions published", value: live.sessions },
              { label: "Speakers listed", value: live.speakers },
              { label: "Submissions received", value: live.submissions },
              { label: "Days until it opens", value: live.countdown },
            ].map((fact) => (
              <div key={fact.label} className="hm-reveal text-center">
                <dd className="wordmark tnum text-4xl font-medium tracking-[-0.02em] text-paper sm:text-5xl">
                  <CountUp value={fact.value} />
                </dd>
                <dt className="mt-2 text-sm text-paper/65">{fact.label}</dt>
              </div>
            ))}
          </dl>
        </div>
      </Band>

      {/* ================================================= the price --------- */}
      <Band id="price" band="paper" pad="2xl">
        <Head
          title="Free. Not freemium."
          lede="Here is what the same job costs elsewhere. Every figure is quoted from that vendor's own pricing page and linked, so you can check it."
        />

        <dl className="mx-auto mt-12 max-w-4xl border-t border-rule">
          {ELSEWHERE.map((row) => (
            <div
              key={row.name}
              className="hm-reveal grid gap-x-8 gap-y-1 border-b border-rule py-5 md:grid-cols-[minmax(0,9rem)_minmax(0,11rem)_minmax(0,1fr)]"
            >
              <dt className="display text-[0.9375rem] text-ink">
                <a href={row.href} className="nowrap-affordance underline-offset-4 hover:underline">
                  {row.name}
                </a>
              </dt>
              <dd className="wordmark tnum text-[0.9375rem] text-ink-2">{row.price}</dd>
              <dd className="text-sm leading-relaxed text-neutral">{row.note}</dd>
            </div>
          ))}
        </dl>

        {/* The last row is the argument, so it leaves the ledger entirely. */}
        <div className="hm-reveal mx-auto mt-7 grid max-w-4xl gap-x-8 gap-y-2 rounded-tile bg-ink p-6 text-paper sm:p-7 md:grid-cols-[minmax(0,9rem)_minmax(0,11rem)_minmax(0,1fr)]">
          <p className="display text-md">Conferencer</p>
          <p className="wordmark tnum text-md">$0, always</p>
          <p className="text-sm leading-relaxed text-paper/75">
            No plan, no per-event fee, no limit on submissions, no share of your revenue. Your only
            bill is the box it runs on, and a $5 VPS covers it.
          </p>
        </div>

        <p className="mx-auto mt-5 max-w-4xl text-xs leading-relaxed text-muted-foreground">
          Public pricing pages, read on {COMPARISONS_READ_DATE}; follow the links and check us. Ours
          is the{" "}
          <a
            href="https://github.com/yazinsai/conferencer/blob/main/LICENSE"
            className="underline underline-offset-4 hover:text-ink"
          >
            LICENSE
          </a>{" "}
          file, which is twenty-one lines and has no pricing table in it. Line by line:{" "}
          {ELSEWHERE.map((row, i) => (
            <span key={row.slug}>
              {i > 0 ? " · " : ""}
              <Link href={`/vs/${row.slug}`} className="underline underline-offset-4 hover:text-ink">
                vs {row.name}
              </Link>
            </span>
          ))}
          {" · "}
          <Link href="/vs" className="underline underline-offset-4 hover:text-ink">
            all comparisons
          </Link>
        </p>

        {/* --------------------------------------------- and nobody can switch it off */}
        <div className="mx-auto mt-16 max-w-4xl border-t border-rule pt-14">
          <div className="hm-reveal mx-auto max-w-2xl text-center">
            <h3 className="display text-balance text-xl text-ink sm:text-2xl">
              And nobody can switch it off
            </h3>
            <p className="mx-auto mt-3 max-w-[54ch] text-pretty text-[0.9375rem] leading-relaxed text-neutral">
              A hosted programme tool is a tenancy: it can be repriced at renewal, acquired, moved
              upmarket, or shut down. Conferencer cannot do that to you.
            </p>
          </div>

          <dl className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-3 sm:gap-8">
            {OWNERSHIP.map((item) => (
              <div key={item.title} className="hm-reveal min-w-0">
                <Icon name={item.icon} size={20} className="text-ink-2" />
                <dt className="display mt-3 text-[0.9375rem] text-ink">{item.title}</dt>
                <dd className="mt-1.5 text-sm leading-relaxed text-neutral">{item.body}</dd>
              </div>
            ))}
          </dl>
        </div>
      </Band>

      {/* ================================================= FAQ --------------- */}
      <Band band="paper-2" pad="xl">
        <Head title="Frequently asked questions" />
        <div className="mx-auto mt-12 max-w-3xl">
          <Faq items={FAQ} />
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
