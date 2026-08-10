# Deploying Conferencer to Cloudflare (and alternatives)

Conferencer is a **Next.js App Router** app with a **local SQLite** database (`better-sqlite3`). That stack assumes a long-lived Node process with a writable filesystem — which is why it does **not** run on vanilla Cloudflare Workers or Pages Functions without substantial changes.

## Recommended: Docker

The supported production path is the existing `Dockerfile`:

```bash
npm run deploy:docker          # builds image tag conferencer:latest
docker compose up -d           # one-command local / VPS deploy
```

Persistent state lives in Docker volumes (`conferencer-data`, `conferencer-uploads`). Set `SESSION_SECRET` and `NEXT_PUBLIC_APP_URL` in your environment or `.env` before `docker compose up`.

### Where to run the image

| Platform | Notes |
| --- | --- |
| **Cloudflare Containers** | Run the same Docker image on CF's container platform. See `wrangler.toml` stub and [Cloudflare Containers docs](https://developers.cloudflare.com/containers/). |
| **Fly.io** | `fly launch` + attach a volume for `/app/data`. |
| **Railway / Render / any VPS** | `docker compose up` or push the image to your registry. |

## Why not Workers / D1 / Pages-only?

| Approach | Blocker |
| --- | --- |
| **Workers** | No native `better-sqlite3`; no persistent local disk for uploads/DB. |
| **D1** | Would require replacing Drizzle SQLite schema + queries with D1 bindings and migration tooling. |
| **Pages (static)** | App needs SSR, API routes, and server actions. |
| **OpenNext on Workers** | Theoretically possible with an external DB (Postgres/D1) and object storage for uploads, but **out of scope** for this repo's sqlite-first design. An OpenNext stub is intentionally **not** included — it would be misleading without a full database migration. |

If you need edge deployment later, plan for:

1. Postgres or D1 as the database (schema + query port).
2. R2 (or S3) for `UPLOAD_DIR`.
3. OpenNext or a split architecture (API container + static assets).

## Cloudflare Containers (experimental path)

1. Build and test locally: `docker compose up --build`.
2. Install Wrangler 4+: `npm i -g wrangler`.
3. Edit `wrangler.toml` — uncomment the `[[containers]]` block and set `NEXT_PUBLIC_APP_URL`.
4. Deploy per current Cloudflare Containers workflow (`wrangler deploy` once containers are GA in your account).

Mount or sync persistent storage for `/app/data` and `/app/uploads` according to Cloudflare's volume guidance when available.

## Environment checklist

| Variable | Required | Purpose |
| --- | --- | --- |
| `SESSION_SECRET` | Yes (prod) | Cookie signing |
| `DATABASE_PATH` | Default OK in Docker | SQLite file path |
| `UPLOAD_DIR` | Default OK in Docker | Local uploads |
| `NEXT_PUBLIC_APP_URL` | Yes (prod) | Links in emails |
| `RESEND_API_KEY` | Optional | Real email delivery |

## MCP server (local / sidecar)

The stdio MCP server (`npm run mcp`) talks to a **running** Conferencer instance via REST. Deploy the web app first, then point `CONFERENCER_API_URL` at its public URL and set `CONFERENCER_API_TOKEN` to an event-scoped bearer token.
