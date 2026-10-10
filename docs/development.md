# Developing Conferencer

Everything you need to change the code with confidence: how it is built, where things
live, the conventions every surface follows, and the invariants the test suite holds you to.

For setup, start with the [README](../README.md#quick-start).

- [Architecture](#architecture)
- [Project layout](#project-layout)
- [Commands](#commands)
- [Conventions](#conventions)
- [Recipes](#recipes)
- [Invariants you should not break](#invariants-you-should-not-break)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)

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

### Design system

**shadcn/ui (Radix + Tailwind v4) on a locked design system.** The system is written down
in [`design.md`](../design.md) — genre, page shapes, every OKLCH token, the type pairing,
the motion budget, the CTA voice, and the deviations it takes on purpose. The tokens live
in `src/app/tokens.css`; every screen renders through `src/components/ui/index.tsx`, a thin
adapter over the shadcn primitives. Between those two files the whole product restyles.

Three deliberate departures from stock shadcn:

- **Selects and checkboxes stay native elements.** Every form posts to a server action with
  progressive enhancement, and a native control submits its value without JavaScript. It is
  also more reliable for keyboard users and for automated browsers.
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

**Icons are Solar, and there is only one set.** Two icon libraries on one page is a
stroke-voice mismatch the eye catches immediately. Solar ships 7,627 icons; `npm run icons`
extracts only the ones the product renders into `src/components/ui/icons.generated.ts`
(37 icons, 14 KB), so `@iconify-json/solar` stays a devDependency that nothing at build or
runtime imports. **`npx shadcn@latest add` writes Lucide imports — swap them for `<Icon>`
before the component ships.**

**Fonts are local, never fetched.** Geist (display) and Geist Mono (the wordmark and
tabular figures) arrive through the `geist` dependency; Switzer (body) is vendored as three
woff2 files under `src/fonts/` with its licence. `next build` has to succeed inside a Docker
build with no network.

**Colour is checked, not asserted.** `npm run contrast` recomputes the WCAG ratio for all 27
`(text, surface)` pairs straight out of `src/app/tokens.css` and exits non-zero on a
regression.

**Layout is checked too.** `npm run audit` drives headless Chrome across six pages at
320 / 375 / 414 / 768 / 1280 / 1440 px and asserts what only a rendered page can prove: no
horizontal scroll, no clickable label wrapping onto a second line, every interactive element
named, every image with alt text, nothing above the fold lazy-loaded, the hero fitting a
1280×800 laptop, and a visible focus ring on every keyboard stop (checked by dispatching
real Tab keys, because a scripted `.focus()` does not trigger `:focus-visible`). It also
measures text contrast over the two photographic surfaces pixel by pixel. 108 checks.

### Demo media

**The demo has real faces, and the people are fictional.** The eleven speakers with a
headshot use photographs from [randomuser.me](https://randomuser.me/photos), vendored under
`seed/assets/portraits/` (57 KB) so seeding stays offline. The indices are pinned so a
re-run never reshuffles who is who. **The portraits do not depict the named individuals**;
see `seed/assets/NOTICE.md`. One speaker deliberately has no photo, so the gallery's
no-photo fallback stays visible.

Two photographs from Pixabay sit behind the public event fold and the landing page's proof
band. `public/media/NOTICE.md` records both. Refetch either set with `npm run media faces` /
`npm run media scenes`; the latter needs `PIXABAY_API_KEY` in `.env.local` and `ffmpeg`, and
neither is ever needed to run the app.

---

## Project layout

```
schema.sql                 every table and index; applied at boot, idempotently
design.md                  the locked design system — read before changing any styling
components.json            shadcn config

src/app/
  page.tsx                 the product landing page
  e/[slug]/                public event site + the CFP wizard
  admin/e/[slug]/          organizer surfaces
  review/ portal/ crm/     reviewer, speaker and CRM surfaces
  api/v1/                  REST API + OpenAPI
  demo/                    one-click demo sign-in (/demo/organizer, …)
  f/[id]/                  authorized file downloads
  tokens.css               every design token; globals.css imports it
  fonts.ts                 the three local faces

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
src/components/
  ui/                      shadcn primitives + index.tsx (the design system)
  ui/icons.generated.ts    the Solar icons in use — regenerate, don't edit
  admin/ public/ portal/ review/ crm/   surface-specific components
  marketing/               the landing page's nav, bands, figures and FAQ
  client/                  the "use client" islands
src/fonts/                 vendored woff2 + licences

seed/                      fixtures, seed script, vendored portraits
scripts/                   smoke test, screenshots, audits, cron runner
public/screens/            real captures of this app, shown on the landing page
public/media/              the two photographs + NOTICE.md
```

---

## Commands

| Command | What it does |
| --- | --- |
| `npm run dev` | Development server on :3000 |
| `npm run build` / `npm start` | Production build and server |
| `npm run seed` | Load the demo event (no-op if it already exists) |
| `npm run seed:reset` | Wipe everything and reseed — your reset button |
| `npm run seed:big` | Add 60 submissions and 40 speakers to test at scale |
| `npm run smoke` | End-to-end HTTP test of the whole product |
| `npm run typecheck` | `next typegen` then `tsc --noEmit` |
| `npm run lint` | ESLint |
| `npm run contrast` | WCAG audit of every colour pair in the design system |
| `npm run audit` | Layout and a11y audit of the rendered pages, in a real browser |
| `npm run shots` | Regenerate the product captures in `public/screens/` |
| `npm run icons` | Regenerate the icon module from the Solar set |
| `npm run media` | Refetch the speaker portraits and the two photographs (maintainer-only) |
| `npm run cron` | Run the scheduled reminder jobs once |
| `npm run deploy` | `docker compose up -d --build` |

`shots` and `audit` drive a local Chrome, found at the usual Linux and macOS paths. Set
`CHROME_BIN` to use a different binary.

---

## Conventions

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

---

## Recipes

**Add a page.** Create `src/app/admin/e/[slug]/thing/page.tsx`, start it with
`const { user, event } = await requireOrganizer(slug)`, read from a repo module, and render
with the kit from `@/components/ui`. Add it to the sidebar in
`src/app/admin/e/[slug]/layout.tsx`. For a short URL, add a top-level alias under
`src/app/admin/thing/page.tsx` that redirects via `adminPath()`.

**Add a table.** Append `CREATE TABLE IF NOT EXISTS` (plus indexes on every foreign key) to
`schema.sql`, then add a module under `src/lib/repo/`. Restart, and the table exists — no
migration step. Existing databases will not gain new *columns* on an existing table, so
during development `npm run seed:reset` is the fastest path.

**Add a field type.** Extend `FIELD_TYPES` in `src/lib/fields.ts`, add a label, handle it in
`validateAnswer`, and render it in `QuestionInput` inside
`src/components/public/submit-wizard.tsx`.

**Add an email.** Add a seed to `TEMPLATE_SEEDS` in `src/lib/repo/emails.ts`, then call
`sendTemplate({ templateKey, to, context })`. Every send writes an `email_messages` row, so
it shows up in the outbox whether or not a provider is configured.

**Add a webhook event.** Add the name to `WEBHOOK_EVENTS` in `src/lib/webhooks.ts` and call
`emitWebhook(eventId, name, payload)` from the action that causes it.

**Change the look.** Read [`design.md`](../design.md) first — it is the system of record, and
a page that drifts from it is the bug. Colour, type, spacing, motion and radii all live in
`src/app/tokens.css`; component voice lives in `src/components/ui/index.tsx`. Run
`npm run contrast` after touching a colour. To add a shadcn primitive:
`npx shadcn@latest add <name>`.

The legacy `slate-*` and `brand-*` Tailwind ramps are **remapped onto the system** in
`tokens.css`, so older screens pick up the palette at the same lightness steps. New code
should use the semantic tokens (`text-ink`, `text-muted-foreground`, `border-rule`,
`bg-paper-2`) instead.

**Regenerate the screenshots.** They are real captures of this app, never mock-ups. Run the
app with the demo seeded, then `npm run shots`. Record ids are discovered by scraping, so a
reseed does not break it. `npm run shots -- --set responsive --out /tmp/shots` sweeps the
main surfaces across 320 / 375 / 414 / 768 / 1280 / 1440 px.

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
8. **Cross-user access returns 403**, including when someone swaps identifiers in a URL.
9. **No number on the landing page is written by hand.** The proof band reads its figures
   out of the database at request time and renders em dashes when it is empty.

---

## Testing

`npm run smoke` starts nothing itself — run the app first (`npm run dev`, or
`npm run build && npm start`), then point the test at it:

```bash
npm run smoke                                   # against :3000
SMOKE_BASE=http://localhost:3100 npm run smoke  # against another port
```

It walks the product over HTTP as each persona with a real cookie jar and asserts status
codes, page content, and the invariants above. It also follows every page's
`<link rel="stylesheet">` and asserts it loads, because a stale server can serve a dead CSS
chunk while every content assertion still passes.

```
$ npm run smoke
69 passed, 0 failed (69 checks)
p95 response 28ms across 55 200-responses
```

**Adding a check:** `scripts/smoke.mjs` is a single dependency-free file. Use
`expectContains(session, path, needles, name)`, `expectMissing(…)` or `expectStatus(…)`,
and `ok()` / `fail()` for anything bespoke. The `Session` class handles sign-in and
server-action posts.

For scale testing, `npm run seed:big` adds 60 submissions and 40 speakers; public pages
still render in 7–17 ms in production.

---

## Troubleshooting

**`npm run typecheck` reports an error in `.next/dev/types/validator.ts`.** The dev server
and `next typegen` race on that generated file. The `typecheck` script clears it first, so
this should not happen — if it does, stop the dev server and re-run.

**A page renders with no styling at all.** You are talking to a stale server that is serving
a CSS chunk that no longer exists on disk. Kill every `next-server` process and restart.
Killing the `sh -c next start` wrapper leaves its child holding the port, so `next start`
then fails silently with `EADDRINUSE` — kill the child pid.

**`npm ci` fails on the lockfile.** Use `npm install`.

**Changes to `schema.sql` are not showing up.** Existing tables are never altered — only
created. Run `npm run seed:reset`.

**A client component breaks the build with a `better-sqlite3` error.** It is importing
`src/lib/repo/*` or `src/lib/db` transitively. Move the shared value into a pure module.

**`npm install` fails building `better-sqlite3`.** It ships prebuilt binaries for current
Node versions; if your platform has none, install a C++ toolchain (`xcode-select --install`
on macOS, `build-essential` and `python3` on Debian/Ubuntu) and retry.
