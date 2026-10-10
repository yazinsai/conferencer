# Security

Please don't report vulnerabilities in public issues.

Use GitHub's private reporting instead: **Security → Report a vulnerability** on this
repository. Include steps to reproduce and the impact you expect. You'll get an
acknowledgement within a few days, and a fix or a plan shortly after.

## Deploying safely

- Set `SESSION_SECRET` to a long random value. The default in `.env.example` and
  `docker-compose.yml` is for local development only.
- Set `CRON_SECRET` if you expose `POST /api/cron`.
- `data/` holds the SQLite database and uploaded files (headshots, slides). Back it up and
  keep it off public storage.
