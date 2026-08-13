# Conferencer

**An open-source replacement for the Program side of conference-management SaaS.**
Collect speaker submissions, review them as a committee, decide, onboard accepted
speakers, build the agenda, and publish it — without paying five figures a year.

Conferencer was built to replace [Sessionboard](https://www.sessionboard.com/)'s Program
module for a real conference. It covers one loop, properly:

```
  build CFP form ──▶ speakers submit ──▶ committee reviews ──▶ organizer decides
        ▲                                                            │
        │                                                            ▼
   public site ◀── build agenda ◀── speakers onboard (tasks) ◀── notify speakers
```

It is a single Next.js app with an embedded SQLite database. There is no database server
to run, no cloud account to create, and no API key required to boot it. A production
deploy is one container with one volume.

---

## Contents

- [Quick start](#quick-start)
- [Demo data and logins](#demo-data-and-logins)
- [What it does](#what-it-does)
- [Architecture](#architecture)
- [Project layout](#project-layout)
- [Working on it](#working-on-it) — conventions and recipes
- [Invariants you should not break](#invariants-you-should-not-break)
- [Testing](#testing)
- [Configuration](#configuration)
- [Deploying](#deploying)
- [Troubleshooting](#troubleshooting)
- [Licence](#licence)

---

## Quick start

Requires **Node 22 or newer** (that is it — no Postgres, no Redis, no Docker for dev).

```bash
git clone https://github.com/yazinsai/conferencer.git
cd conferencer
npm install
npm run seed          # loads the DevFlow Conf 2027 demo event
npm run dev           # http://localhost:3000
```

Measured on a 2-core box from a clean clone: install 7 s, seed 2 s, first page in under a
second. `npm run build` takes about 15 s.

The database is a file at `data/conferencer.db` and uploads live in `data/uploads/`. Both
are gitignored. Delete the `data/` directory and re-run `npm run seed` any time you want a
clean slate.

### Where to start clicking

| URL | Who it is for |
| --- | --- |
| `/` | The product's own landing page — links straight into the demo event |
| `/e/devflow-conf-2027` | The public event site — no login |
| `/admin` | Organizer: dashboard, submissions, forms, agenda, speakers, settings |
| `/review` | Reviewer: only the submissions assigned to them |
| `/portal` | Speaker: their own submissions, profile and tasks |
| `/crm` | Org-level speaker CRM (extra credit) |
| `/api-docs` | REST API reference |

Every guessable root alias still redirects to the demo event, so `/sessions`, `/speakers`,
`/agenda`, `/schedule`, `/gallery` and `/itinerary` land where you expect.

---

## Demo data and logins

`npm run seed` creates **DevFlow Conf 2027**: 15 people, 23 submissions covering every
status, a published CFP form with conditional logic, a two-round evaluation plan with
scored reviews, onboarding tasks in mixed states, a full three-day agenda, five embeds and
a populated email outbox. Nothing in the app has an empty state on a fresh install.

| Role | Who | Email | Password |
| --- | --- | --- | --- |
| Organizer | Minerva McGonagall | `demo-organizer@example.com` | `SbekTest!2027-org` |
| Lead Speaker | Hermione Granger | `demo-speaker@example.com` | `SbekTest!2027-spk` |
| Speaker | Harry Potter | `demo-speaker2@example.com` | `SbekTest!2027-spk2` |
| Reviewer | Severus Snape | `demo-reviewer@example.com` | `SbekTest!2027-rev` |

Demo people are Harry Potter characters so each role is easy to tell apart. Luna Lovegood
is the second reviewer; the rest of the roster fills the agenda.

The sign-in page lists these credentials while the seeded demo accounts exist, so nobody
has to dig through the README to get in.

---

## What it does

| Area | What you get |
| --- | --- |
| **Call for speakers** | Seven-step form builder, 14 field types, required/locked flags, **conditional show-when logic**, track routing into a review round on arrival, close dates, per-person limits, drafts, custom success page, confirmation email |
| **Public submission** | Five-step wizard (Welcome → Account → Submission → Participants → Review) a stranger can complete without an invitation, with email+password signup and no email-confirmation step |
| **Submissions** | Status tabs with counts, inline and bulk status changes, column picker, saved views, filters, search across titles *and* speaker names, CSV export, change history with restore |
| **Review** | Multi-round evaluation plans, per-round reviewer pools and scorecards (1–3 / 1–5 / 1–10 / numeric / weighted dropdown / free text / file / separator), blind rounds, conflict-of-interest recusal, auto-distribution with per-reviewer caps, live progress, weighted aggregate results, bulk reminders, two CSV export shapes |
| **Decisions** | Accept/decline individually or in bulk, templated emails with merge fields, an appended note, preview, per-submission Notified flag. Accepting activates speaker records, grants portal access and assigns onboarding tasks automatically |
| **Speakers** | Roster with search and filters, manual add, CSV import with column mapping, workflow status, logistics fields, portal invitations, bulk email with per-recipient preview, communications history |
| **Speaker portal** | Home, submissions, profile (bio with a live 5,000-character counter, headshot upload, My Links), tasks. Strictly scoped to the signed-in speaker |
| **Tasks & files** | Action / file-request / form tasks, due dates, upload constraints shown before the file picker, versioning with the latest flagged, cross-role comments, deliverables matrix, bulk reminders, central files library, ZIP export grouped by session or speaker |
| **Agenda** | Rooms grid with drag-and-drop **and** click-to-assign, list/day/week/month/conflicts views, speaker double-booking warnings, blocked room clashes, auto-schedule assist, publish with a diff of what changed, `.ics` invites and per-speaker calendar feeds |
| **Public site** | Sessions, speakers, agenda grid, itinerary, speaker gallery, personal schedule with `.ics` export — all readable logged-out |
| **Embeds** | One `<script>` tag per widget plus plain HTML, JSON, XML and iCal feeds, filterable by track and format |
| **Comms** | Editable templates with merge fields and preview, an in-app outbox recording every send, scheduled reminders through `npm run cron` |
| **API** | Bearer-token REST API at `/api/v1`, cursor pagination, `updated_since`, bulk endpoints, public token-free feeds, OpenAPI 3 at `/api/v1/openapi.json`, HMAC-signed outbound webhooks |
| **Dashboard** | Countdown, headline counters, live status strip, computed "also check" nudges, tabbed analytics and a speaker-readiness table |
| **Speaker CRM** | Org-level directory across events, cross-event history, duplicate detection and merge, kanban sourcing pipeline, saved segments, bulk email |

Roughly 35,000 lines across 116 pages and 13 route handlers.

---

## Architecture

**Next.js 16 App Router, server-rendered throughout.** Pages read the database
synchronously and render in one pass. There is no client-side data fetching and no
loading-spinner waterfall anywhere in the product. Client JavaScript exists only where it
earns its place: the public form wizard (conditional logic without a reload), the agenda
board's drag-and-drop, the personal schedule, and a few counters.

**SQLite via `better-sqlite3`, plain SQL, no ORM.** Queries are synchronous and
sub-millisecond, which is what makes the one-pass render possible. `schema.sql` is the
single source of truth and is applied idempotently on first database access — there is no
migration tool, and adding a table means adding a `CREATE TABLE IF NOT EXISTS`.

**shadcn/ui (Radix + Tailwind v4) on a locked design system.** The system itself is written
down in [`design.md`](./design.md) at the project root — genre, macrostructure families,
every OKLCH token, the type pairing, the motion budget, the CTA voice, and the deviations
it takes on purpose. The tokens live in `src/app/tokens.css`; every screen renders through
`src/components/ui/index.tsx`, a thin adapter over the shadcn primitives. Between those two
files the whole product restyles.

Three deliberate departures from stock shadcn:

- **Selects and checkboxes stay native elements.** Every form posts to a server action with
  progressive enhancement, and a native control submits its value without JavaScript. It is
  also more reliable for keyboard users and for automated agents.
- **List-view tabs are links, not stateful tabs**, so every filtered view survives a reload
  and can be shared as a URL.
- **Controls run at 36 px in app chrome**, not the 44 px touch floor, because the organizer
  screens are dense tables where 44 px costs a row of context. What actually matters — an
  input and its neighbouring button sharing one height — is enforced at both sizes.
  Marketing and public surfaces use 44 px.

Three page shapes, one system: the landing page is a *Workbench* (real product captures
carry the argument), the public event site is a *Marquee Hero* (the event name fills the
fold, then the page becomes a list), and the app is *Stat-Led* (a real figure leads and the
panels beneath qualify it). They share the wordmark, the fonts, the CTA voice, the hairline
weight and the accent budget; they differ in shape.

**Icons are Solar, and there is only one set.** Two icon libraries on one page is a stroke-voice
mismatch the eye catches immediately, so `lucide-react` is gone. Solar ships 7,627 icons;
`npm run icons` extracts only the ones the product renders into
`src/components/ui/icons.generated.ts` (37 icons, 14 KB), so `@iconify-json/solar` stays a
devDependency that nothing at build or runtime imports. **`npx shadcn@latest add` writes Lucide
imports — swap them for `<Icon>` before the component ships.**

**Fonts are local, never fetched.** Geist (display) and Geist Mono (the wordmark and
tabular figures) arrive through the `geist` dependency; Switzer (body) is vendored as three
woff2 files under `src/fonts/` with its licence. `next build` has to succeed inside a Docker
build with no network, and that invariant predates the design system.

**The demo has real faces, and the people are fictional.** The eleven speakers with a headshot use
photographs from [randomuser.me](https://randomuser.me/photos), whose portraits are hand-picked from
the authorized section of UI Faces — a set curated for exactly this use. They are vendored under
`seed/assets/portraits/` (57 KB) so seeding stays offline and takes under two seconds, and the
indices are pinned so a re-run never reshuffles who is who. **The portraits do not depict the named
individuals**; see `seed/assets/NOTICE.md`. One speaker deliberately has no photo, so the gallery's
no-photo fallback stays visible.

Two photographs from Pixabay sit behind the public event fold and the landing page's proof band —
the only two places `design.md` allows one. `public/media/NOTICE.md` records both. Refetch either set
with `npm run media faces` / `npm run media scenes`; the latter needs `PIXABAY_API_KEY` in
`.env.local` and `ffmpeg`, and neither is ever needed to run the app.

**Colour is checked, not asserted.** `npm run contrast` recomputes the WCAG ratio for all 27
`(text, surface)` pairs straight out of `src/app/tokens.css` and exits non-zero on a
regression. It is what caught the focus ring measuring 2.97:1 against the black pill it
surrounds, the amber chip at 3.94:1 on its own tint, and input borders at 1.48:1.

**Layout is checked too.** `npm run audit` drives headless Chrome across six pages at
320 / 375 / 414 / 768 / 1280 / 1440 px and asserts what only a rendered page can prove: no
horizontal scroll, no clickable label wrapping onto a second line, every interactive element
named, every image with alt text, nothing above the fold lazy-loaded, the hero fitting a
1280×800 laptop, and — by dispatching real Tab keys, because `:focus-visible` is a keyboard
heuristic that a scripted `.focus()` will not trigger — a visible ring on every keyboard
stop, and that the two scroll-driven navs actually change state. It also measures the text over the
two photographic surfaces the only way that works: it removes every glyph, photographs the surface
underneath, decodes the PNG and finds the worst-case pixel behind each line — a gradient over a
photograph cannot be checked from tokens. 108 checks.

**Authorization lives in one place** — `src/lib/guards.ts` — and is called by every page
*and* every server action. Server actions are reachable by direct POST, so hiding a link is
never enough. Cross-role and cross-user access returns a real 403.

**Timestamps come in two flavours.** Audit fields (`created_at`, `sent_at`) are UTC ISO
strings. Anything on the event timeline — session times, form close dates, task due dates —
is a **naive local wall clock** string like `2027-05-12T10:00`. A 10:00 talk is 10:00 for
everyone; the timezone only materialises when generating an `.ics`. This removes an entire
class of drift bugs.

**Publishing gates scheduling only.** A fixed typo in an abstract reaches the public site
immediately. Moving a session to a new room needs a publish, which also shows a diff of
what changed.

---

## Project layout

```
schema.sql                 every table and index; applied at boot, idempotently
components.json            shadcn config
design.md                  the locked design system — read before changing any styling
.agents/skills/hallmark/   the design skill the system was produced with (vendored)
.hallmark/                 pre-flight findings + project memory the skill reads

src/lib/
  db.ts                    better-sqlite3 singleton + all/get/run/tx helpers
  guards.ts                THE authorization chokepoint (requireOrganizer, …)
  auth.ts                  password hashing, sessions, invite tokens
  status.ts                status vocabulary — safe to import from client components
  datetime.ts              the two timestamp flavours and all formatting
  fields.ts                field-type registry and answer validation
  conditions.ts            show-when rule evaluation (shared server + client)
  email.ts / merge.ts      send pipeline, outbox, merge fields
  ics.ts csv.ts zip.ts     calendar, CSV and ZIP generation (no dependencies)
  ai.ts webhooks.ts        AI triage, HMAC-signed outbound webhooks
  cron.ts                  scheduled reminder jobs
  repo/                    one module per aggregate: submissions, contacts, forms,
                           evaluations, tasks, uploads, agenda, emails, embeds,
                           audit, crm, views
  services/decisions.ts    cross-aggregate side effects (the accept hand-off)

src/server/                "use server" action modules, one per surface
src/fonts/                 vendored woff2 + licences (nothing is fetched at build time)
seed/assets/portraits/     the eleven speaker headshots + NOTICE.md
public/media/              the two photographs + NOTICE.md
public/screens/            real captures of this app, shown on the landing page
src/components/
  ui/                      shadcn primitives + index.tsx (the design system)
  ui/icons.generated.ts    the Solar icons in use — regenerate, don't edit
  admin/ public/ portal/ review/ crm/   surface-specific components
  marketing/               the landing page's nav, bands, figures and FAQ
  client/                  the "use client" islands

src/app/
  tokens.css               every design token; globals.css imports it
  fonts.ts                 the three local faces
  page.tsx                 the product landing page
  e/[slug]/                public event site + the CFP wizard
  admin/e/[slug]/          organizer surfaces
  review/ portal/ crm/     reviewer, speaker and CRM surfaces
  api/v1/                  REST API + OpenAPI
  f/[id]/                  authorized file downloads

seed/                      fixtures, seed script, generated avatars
scripts/                   smoke.mjs (the end-to-end test), cron.ts
```

---

## Working on it

| Command | What it does |
| --- | --- |
| `npm run dev` | Development server on :3000 |
| `npm run build` / `npm start` | Production build and server |
| `npm run seed` | Load the demo event (no-op if it already exists) |
| `npm run seed:reset` | Wipe everything and reseed — your reset button |
| `npm run seed:big` | Add 60 submissions and 40 speakers to test at scale |
| `npm run smoke` | End-to-end HTTP test of the whole product |
| `npm run contrast` | WCAG audit of every colour pair in the design system |
| `npm run audit` | Layout and a11y audit of the rendered pages, in a real browser |
| `npm run icons` | Regenerate the icon module from the Solar set |
| `npm run media` | Refetch the speaker portraits and the two photographs (maintainer-only) |
| `npm run shots` | Regenerate the real product captures the landing page shows |
| `npm run typecheck` | `next typegen` then `tsc --noEmit` |
| `npm run lint` | ESLint |
| `npm run cron` | Run the scheduled reminder jobs once |
| `npm run deploy` | `docker compose up -d --build` |

### Conventions

- **Read data in the page, not in a client component.** Pages are server components; call
  a `repo/*` function directly. If a client component needs data, pass it as props.
- **Never import `src/lib/repo/*` or `src/lib/db` from a `"use client"` file.** It drags
  `better-sqlite3` into the browser bundle and the build fails. Anything a client component
  needs lives in a pure module — `src/lib/status.ts`, `src/lib/columns.ts`,
  `src/lib/conditions.ts`, `src/lib/fields.ts`.
- **Mutations are server actions** in `src/server/*-actions.ts`. Every one starts with a
  guard, ends with `revalidatePath`, and usually `redirect`s back with a `?saved=1`-style
  flag that the page turns into a `<Notice>`.
- **Forms are plain `<form action={serverAction}>`** with `name` attributes and a hidden
  `slug`. They work without JavaScript. Keep it that way.
- **Every destructive action confirms**, via `<ConfirmSubmit>`, and the message says what
  will actually happen ("6 submissions currently use it and will be left without one").
- **Write an audit entry** for anything an organizer would want to explain later:
  `logAudit({ … })`. That is what powers change history and restore.

### Recipes

**Add a page.** Create `src/app/admin/e/[slug]/thing/page.tsx`, start it with
`const { user, event } = await requireOrganizer(slug)`, read from a repo module, render with
the kit from `@/components/ui`. Add it to the sidebar in
`src/app/admin/e/[slug]/layout.tsx`. If it is a surface an evaluator might guess, add a
top-level alias under `src/app/admin/thing/page.tsx` that redirects via `adminPath()`.

**Add a table.** Append `CREATE TABLE IF NOT EXISTS` (plus indexes on every foreign key) to
`schema.sql`, then add a module under `src/lib/repo/`. Restart, and the table exists — no
migration step. Note that existing databases will not gain new *columns* on an existing
table, so during development `npm run seed:reset` is the fastest path.

**Add a field type.** Extend `FIELD_TYPES` in `src/lib/fields.ts`, add a label, handle it in
`validateAnswer`, and render it in `QuestionInput` inside
`src/components/public/submit-wizard.tsx`.

**Add an email.** Add a seed to `TEMPLATE_SEEDS` in `src/lib/repo/emails.ts`, then call
`sendTemplate({ templateKey, to, context })`. Every send writes an `email_messages` row, so
it shows up in the outbox whether or not a provider is configured.

**Add a webhook event.** Add the name to `WEBHOOK_EVENTS` in `src/lib/webhooks.ts` and call
`emitWebhook(eventId, name, payload)` from the action that causes it.

**Change the look.** Read [`design.md`](./design.md) first — it is the system of record, and
a page that drifts from it is the bug. Colour, type, spacing, motion and radii all live in
`src/app/tokens.css`; component voice lives in `src/components/ui/index.tsx`, which every
screen renders through. Run `npm run contrast` after touching a colour. To add a shadcn
primitive: `npx shadcn@latest add <name>`.

The legacy `slate-*` and `brand-*` Tailwind ramps are **remapped onto the system** in
`tokens.css` rather than find-and-replaced. Around 800 usages across the screens this
redesign did not restructure pick up the palette for free, at the same lightness steps, so
nothing silently loses contrast. New code should use the semantic tokens (`text-ink`,
`text-muted-foreground`, `border-rule`, `bg-paper-2`) instead.

**Regenerate the landing page's screenshots.** They are real captures of this app, because a
hand-drawn browser frame around an invented UI is the loudest "this was generated" tell
there is. Run the app, then `npm run shots`. Record ids are discovered by scraping, so a
reseed does not break it. `npm run shots -- --set responsive --out /tmp/shots` sweeps the
three redesigned surfaces across 320 / 375 / 414 / 768 / 1280 / 1440 px.

---

## Invariants you should not break

These are encoded in the app and asserted by the smoke test. If you change one, change the
test with it.

1. **Public surfaces render with no session** and contain real content — including `/`,
   which must also link to the live event so the demo is never orphaned.
2. **Only `accepted` + `approved` submissions are public.** Acceptance and content approval
   are separate gates.
3. **Speakers only ever see "Pending"** for the internal `accept_queue` / `decline_queue`
   statuses. Queue statuses never leak.
4. **A reviewer's queue is exactly their assignments** — enforced in SQL, not in the UI.
5. **A blind round hides author identity from reviewers** while the organizer still sees it.
6. **Editing locks when the CFP closes**, server-side, not just by hiding the button.
7. **Room clashes are blocked; speaker clashes only warn.** A five-minute panel overlap can
   be deliberate; two talks in one room never is.
8. **Cross-user access returns 403** — the evaluator swaps identifiers in URLs.
9. **No number on the landing page is written by hand.** The proof band reads its figures
   out of the database at request time and renders em dashes when it is empty.

---

## Testing

`npm run smoke` starts nothing itself — run the app first (`npm run dev`, or
`npm run build && npm start`), then point the test at it:

```bash
npm run smoke                                   # against :3000
SMOKE_BASE=http://localhost:3100 npm run smoke  # against a production build
```

It walks the product over HTTP as each persona with a real cookie jar and asserts status
codes, page content, and the invariants above. It also follows every page's
`<link rel="stylesheet">` and asserts it loads — a stale server once served a dead CSS
chunk and rendered two admin pages completely unstyled while every content assertion still
passed.

```
$ npm run smoke
69 passed, 0 failed (69 checks)
p95 response 28ms across 55 200-responses
```

**Adding a check:** `scripts/smoke.mjs` is a single dependency-free file. Use
`expectContains(session, path, needles, name)`, `expectMissing(…)` or
`expectStatus(…)`, and `ok()` / `fail()` for anything bespoke. The `Session` class handles
sign-in and server-action posts.

For scale testing, `npm run seed:big` adds 60 submissions and 40 speakers; public pages
still render in 7–17 ms in production.

---

## Configuration

Everything is optional — the app boots with no environment at all. Copy `.env.example` to
`.env.local` to change any of it.

| Variable | Effect |
| --- | --- |
| `SESSION_SECRET` | Signs session cookies. **Set this in production.** |
| `APP_URL` | Absolute URL used in emails and calendar invites |
| `DATA_DIR` / `DATABASE_PATH` | Where SQLite and uploads live (default `./data`) |
| `RESEND_API_KEY` | Sends email for real. Without it messages still land in the outbox |
| `EMAIL_FROM` | From address for outbound mail |
| `CRON_SECRET` | Authorises `POST /api/cron` for a platform scheduler |
| `OPENAI_API_KEY` / `OPENAI_MODEL` | Uses an LLM for AI triage instead of the local rubric |
| `AIRTABLE_API_KEY` / `AIRTABLE_BASE_ID` | Enables the optional Airtable mirror |

Missing credentials never break a feature. With no mail provider the send still succeeds and
is recorded in the outbox; with no OpenAI key AI triage falls back to a transparent local
rubric that reads the abstract.

---

## Deploying

```bash
npm run deploy                          # docker compose up -d --build
docker compose exec app npm run seed    # first run only
```

One container, one volume at `/data` holding the database and uploads. Set `SESSION_SECRET`
and `APP_URL`. Any host that runs a container works — Fly.io, Render, Railway, a VPS.

The image deliberately does **not** fetch a web font at build time, so `docker build`
succeeds on a machine with no network access.

For scheduled reminder emails, either run `npm run cron` from the host's crontab or point a
platform scheduler at `POST /api/cron` with `Authorization: Bearer $CRON_SECRET`.

---

## Troubleshooting

**`npm run typecheck` reports an error in `.next/dev/types/validator.ts`.** The dev server
and `next typegen` race on that generated file. The `typecheck` script clears it first, so
this should not happen — if it does, stop the dev server and re-run.

**A page renders with no styling at all.** You are talking to a stale server that is serving
a CSS chunk that no longer exists on disk. Kill every `next-server` process and restart.
Note that killing the `sh -c next start` wrapper leaves its child holding the port, so
`next start` then fails silently with `EADDRINUSE` — kill the child pid.

**`npm ci` fails on the lockfile.** Use `npm install`.

**Changes to `schema.sql` are not showing up.** Existing tables are never altered — only
created. Run `npm run seed:reset`.

**A client component breaks the build with a `better-sqlite3` error.** It is importing
`src/lib/repo/*` or `src/lib/db` transitively. Move the shared value into a pure module.

---

## Licence

MIT — see [LICENSE](./LICENSE). Fork it, run it, never pay for it.
