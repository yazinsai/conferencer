# Contributing

Thanks for helping out. Bug reports, fixes and focused features are all welcome.

## Setup

```bash
npm install
npm run seed   # demo event; logins are in the README
npm run dev    # http://localhost:3000
```

No environment variables are required. Copy `.env.example` to `.env.local` only if you
need real email delivery or the cron endpoint.

## Before opening a PR

```bash
npm run lint
npm run typecheck
npm run build
npm run smoke   # end-to-end HTTP test, against a running server
```

If you touch styling, read `design.md` first and run `npm run contrast`.

## Guidelines

- Keep PRs small and about one thing. Open an issue first for anything large.
- All authorization goes through `src/lib/guards.ts` — don't check roles ad hoc.
- Schema changes go in `schema.sql` and must stay idempotent (it is applied at every boot).
- Never commit `.env*`, the `data/` directory, or real attendee/speaker data.

By contributing you agree your work is released under the [MIT License](LICENSE).
