# Conferencer

**An open-source replacement for Sessionboard's Program module.** Call for speakers →
committee review → decisions → speaker portal → agenda → public schedule. MIT licensed,
runs from a single container, and fast enough that nobody complains about it.

```bash
git clone <this repo> && cd conferencer
npm install
npm run seed          # loads the DevFlow Conf 2027 demo event
npm run dev           # http://localhost:3000
```

That is the whole setup. No database server, no cloud account, no API keys.

---

## What it does

| Area | What you get |
| --- | --- |
| **Call for speakers** | Seven-step form builder, 13 field types, required/locked flags, **conditional show-when logic**, close dates, per-person limits, drafts, custom success page, confirmation email |
| **Public submission** | Five-step wizard (Welcome → Account → Submission → Participants → Review) that a stranger can complete without an invitation, with email+password signup and no email confirmation step |
| **Submissions** | Status tabs with counts, inline and bulk status changes, column picker, filters, search across titles *and* speaker names, CSV export, change history with restore |
| **Review** | Multi-round evaluation plans, per-round reviewer pools and scorecards (1–3 / 1–5 / 1–10 / numeric / weighted dropdown / free text / file / separator), blind rounds, conflict-of-interest recusal, auto-distribution with per-reviewer caps, live progress, weighted aggregate results, bulk reminders, two CSV export shapes |
| **Decisions** | Accept/decline individually or in bulk, templated decision emails with merge fields, a free-text note, preview, per-submission Notified flag |
| **Speakers** | Roster with search and filters, manual add, CSV import with column mapping, workflow status, logistics fields, portal invitations, bulk email with per-recipient preview, communications history |
| **Speaker portal** | Home, submissions, profile (rich bio with a live 5,000-character counter, headshot upload, My Links), tasks. Strictly scoped to the signed-in speaker |
| **Tasks & files** | Action / file-request / form tasks, due dates, upload constraints shown before the file picker, versioning with the latest flagged, cross-role comments, deliverables matrix, bulk reminders, central files library, ZIP export grouped by session or speaker |
| **Agenda** | Rooms grid with drag-and-drop **and** click-to-assign, list/day/week/month/conflicts views, speaker double-booking warnings, blocked room clashes, auto-schedule assist, publish with a diff of what changed |
| **Public site** | Sessions, speakers, agenda grid, itinerary, speaker gallery, personal schedule with `.ics` export — all readable logged-out |
| **Embeds** | One `<script>` tag per widget plus plain HTML, JSON, XML and iCal feeds, filterable by track and format |
| **Comms** | Editable templates with merge fields and preview, an in-app outbox recording every send, scheduled reminders through `npm run cron` |
| **API** | Bearer-token REST API at `/api/v1`, cursor pagination, `updated_since`, bulk endpoints, public token-free feeds, OpenAPI 3 at `/api/v1/openapi.json`, reference at `/api-docs` |

---

## Demo accounts

`npm run seed` creates **DevFlow Conf 2027** with 15 people, 24 submissions across every
status, a two-round evaluation plan, onboarding tasks in mixed states, a full three-day
agenda and a populated outbox.

| Role | Email | Password |
| --- | --- | --- |
| Organizer | `sbek-organizer@example.com` | `SbekTest!2027-org` |
| Speaker | `sbek-speaker@example.com` | `SbekTest!2027-spk` |
| Speaker | `sbek-speaker2@example.com` | `SbekTest!2027-spk2` |
| Reviewer | `sbek-reviewer@example.com` | `SbekTest!2027-rev` |

Each persona also has a second login at `@sbek-test.example.com`
(`jordan.organizer@`, `priya.speaker@`, `marcus.speaker@`, `sam.reviewer@`) with the same
password, pointing at the same person.

### Where to start

- `/` — the public event site (no login)
- `/admin` — organizer dashboard
- `/review` — reviewer queue
- `/portal` — speaker portal
- `/api-docs` — REST API reference

---

## Architecture

- **Next.js 16 App Router**, server-rendered throughout. Client JavaScript exists only
  where it earns its place: the public form wizard (conditional logic without a reload),
  the agenda board's drag-and-drop, the personal schedule, and a handful of counters.
- **SQLite** through `better-sqlite3` with plain SQL in `src/lib/repo/*`. Queries are
  synchronous and sub-millisecond, so pages render in one pass with no loading spinners.
  `schema.sql` is the single source of truth and is applied idempotently at boot.
- **Authorization** lives in `src/lib/guards.ts` and is called by every page *and* every
  server action — server actions are reachable by direct POST, so hiding links is not
  enough. Cross-role and cross-user access returns a real 403.
- **Timestamps**: anything on the event timeline (session times, close dates, due dates)
  is stored as naive local wall clock (`2027-05-12T10:00`). The timezone only materialises
  when an `.ics` file is generated. This removes a whole class of drift bugs.
- **Publishing** gates *scheduling* only. Content edits (a fixed typo in an abstract)
  appear on the public site immediately; moving a session to a new room needs a publish.
- **Approval gate**: only `accepted` + `approved` submissions appear publicly, so an
  organizer can accept a talk before its content is signed off.

```
schema.sql            all tables and indexes
src/lib/              db, auth, guards, datetime, ics, csv, zip, email, cron
src/lib/repo/         one module per aggregate (submissions, contacts, tasks, …)
src/server/           "use server" action modules
src/app/              routes: public /e/:slug, /admin, /review, /portal, /api
seed/                 fixtures + seed script
scripts/              smoke test and cron entry points
```

---

## Commands

| Command | What it does |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` / `npm start` | Production build and server |
| `npm run seed` | Load the demo event (skips if it already exists) |
| `npm run seed:reset` | Wipe everything and reseed |
| `npm run seed:big` | Add 60 submissions and 40 speakers to prove the performance claims |
| `npm run cron` | Run the scheduled reminder jobs once |
| `npm run smoke` | End-to-end HTTP test of the whole product, including role scoping |
| `npm run typecheck` / `npm run lint` | Types and lint |
| `npm run deploy` | `docker compose up -d --build` |

### Deploying

```bash
npm run deploy                      # builds the image and starts it on :3000
docker compose exec app npm run seed   # first run only
```

The container keeps the database and uploads in the `/data` volume. Set `SESSION_SECRET`
and `APP_URL` in production. Everything else is optional:

| Variable | Effect |
| --- | --- |
| `RESEND_API_KEY` | Sends email for real. Without it, messages still appear in the outbox |
| `EMAIL_FROM` | From address for outbound mail |
| `CRON_SECRET` | Allows `POST /api/cron` from a platform scheduler |
| `DATA_DIR` / `DATABASE_PATH` | Where SQLite and uploads live |

Any host that runs a container works — Fly.io, Render, Railway, a VPS. Attach a volume at
`/data` and you are done.

---

## Testing

`npm run smoke` walks the product over HTTP as each persona and asserts the things that
actually matter:

- every public surface renders logged-out and contains real content
- an unapproved session is absent from the public site but present in admin
- all eight seeded logins work
- a reviewer gets a 403 on `/admin`, a speaker gets a 403 on `/admin` and `/review`
- a speaker cannot open another speaker's submission by guessing its id
- the CFP form renders its custom and conditional fields without a session
- response times, printed as a p95

```
$ npm run smoke
44 passed, 0 failed (44 checks)
```

---

## Licence

MIT — see [LICENSE](./LICENSE). Fork it, run it, never pay for it.
