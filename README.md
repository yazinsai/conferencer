# Conferencer

Open-source conference **program** management — an alternative to Sessionboard’s Program module.

CFP forms → submissions → committee review → decisions → speaker portal & tasks → agenda → public widgets.

## Quick start (< 5 minutes)

```bash
npm install
npm run setup    # drizzle push + seed DevFlow Conf 2027
npm run dev      # http://localhost:3000
```

Production:

```bash
npm run setup
npm run build
npm start
```

Optional env (see `.env.example`):

| Variable | Purpose |
| --- | --- |
| `DATABASE_PATH` | SQLite file (default `./data/conferencer.db`) |
| `SESSION_SECRET` | Cookie signing secret |
| `UPLOAD_DIR` | Local upload directory |
| `RESEND_API_KEY` | Real email delivery (optional — outbox always works) |
| `NEXT_PUBLIC_APP_URL` | Absolute links in emails |

## Demo accounts (seeded)

| Role | Email | Password |
| --- | --- | --- |
| Organizer | `sbek-organizer@example.com` | `SbekTest!2027-org` |
| Speaker | `sbek-speaker@example.com` | `SbekTest!2027-spk` |
| Speaker 2 | `sbek-speaker2@example.com` | `SbekTest!2027-spk2` |
| Reviewer | `sbek-reviewer@example.com` | `SbekTest!2027-rev` |

Event slug: **`devflow-conf-2027`**

## Key routes

| Surface | Path |
| --- | --- |
| Landing | `/` |
| Sign in / up | `/sign-in`, `/sign-up` |
| Admin dashboard | `/admin` → `/admin/e/devflow-conf-2027` |
| Submissions | `/admin/e/:slug/submissions` |
| Forms | `/admin/e/:slug/forms` |
| Evaluations | `/admin/e/:slug/evaluation` |
| Agenda | `/admin/e/:slug/agenda` |
| Speakers / Tasks / Deliverables | `/admin/e/:slug/speakers`, `/tasks`, `/deliverables` |
| Email outbox | `/admin/e/:slug/emails` |
| Speaker portal | `/portal` |
| Reviewer | `/review` |
| Public CFP | `/e/:slug/submit/:formId` |
| Public widgets | `/e/:slug/sessions` · `speakers` · `agenda` · `itinerary` · `gallery` |
| Speaker CRM | `/admin/crm` |
| API tokens | `/admin/e/:slug/settings/api` |
| Event assistant (keyword chat) | `/admin/e/:slug/agent` |
| OpenAPI | `/api/v1/openapi.json` |

## REST API

Issue a bearer token under **Settings → API**. Authenticate with:

```bash
curl -H "Authorization: Bearer cnf_…" http://localhost:3000/api/v1/events
curl -H "Authorization: Bearer cnf_…" http://localhost:3000/api/v1/submissions?limit=25
```

Public (no token):

```bash
curl http://localhost:3000/api/v1/public/devflow-conf-2027/sessions
curl http://localhost:3000/api/v1/public/devflow-conf-2027/speakers
```

Full catalog: `/api/v1/openapi.json` or Settings → API → Docs.

## MCP server

A stdio MCP server wraps the REST API for Claude Desktop, Cursor, and other MCP clients.

1. Start Conferencer (`npm run dev` or production).
2. Create an API token under **Settings → API**.
3. Set env vars (or export inline):

```bash
export CONFERENCER_API_URL=http://localhost:3000
export CONFERENCER_API_TOKEN=cnf_your_token_here
npm run mcp
```

**Tools:** `list_submissions`, `get_submission`, `update_submission_status`, `list_contacts`, `list_sessions`, `list_tasks`.

### Cursor / Claude Desktop config

Add to `~/.cursor/mcp.json` or Claude Desktop MCP settings (adjust paths):

```json
{
  "mcpServers": {
    "conferencer": {
      "command": "npx",
      "args": ["tsx", "/absolute/path/to/conferencer/src/mcp/server.ts"],
      "env": {
        "CONFERENCER_API_URL": "http://localhost:3000",
        "CONFERENCER_API_TOKEN": "cnf_your_token_here"
      }
    }
  }
}
```

Use `npm run mcp` from the project root if `tsx` is on your PATH via `node_modules/.bin`.

## Deploy (Docker / Cloudflare)

Conferencer uses **SQLite + better-sqlite3** and runs as a Node container — not on vanilla Workers.

```bash
npm run deploy:docker    # build image
docker compose up -d     # one-command deploy with persistent volumes
```

See [deploy/cloudflare.md](./deploy/cloudflare.md) for Cloudflare Containers, Fly, Railway, and why D1/OpenNext is out of scope.

## Scripts

| Script | What it does |
| --- | --- |
| `npm run setup` | Migrate schema + seed |
| `npm run seed` | Seed if empty |
| `npm run seed:reset` | Wipe DB and reseed |
| `npm run seed:big` | +60 submissions / +40 speakers for perf demos |
| `npm run jobs:reminders` | Draft-deadline + task reminder emails |
| `npm run mcp` | Stdio MCP server for REST API |
| `npm run deploy:docker` | Build Docker image `conferencer` |

## Stack

- Next.js 16 (App Router, SSR) + React 19 + Tailwind 4
- Drizzle ORM + SQLite (`better-sqlite3`)
- Password auth (bcrypt) + signed httpOnly cookies
- Resend optional; every send lands in the in-app outbox
- Local file uploads (20 MB, MIME allowlist)
- Optional Airtable (`AIRTABLE_API_KEY` + `AIRTABLE_BASE_ID`) — off by default

## License

MIT — see [LICENSE](./LICENSE).
