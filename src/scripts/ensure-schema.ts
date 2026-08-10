import { getSqlite } from "../lib/db";

/**
 * Idempotent bootstrap: create tables if missing by applying drizzle push-style DDL.
 * Prefer `npx drizzle-kit push` in setup; this covers first-boot seed.
 */
export function ensureSchema() {
  const sqlite = getSqlite();
  // Trigger module load of schema + let drizzle-kit push handle real DDL in setup.
  // For seed-without-push, create a marker check and run push via child if needed.
  const row = sqlite
    .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='events'")
    .get() as { name?: string } | undefined;
  if (row?.name) return;

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { execSync } = require("node:child_process") as typeof import("node:child_process");
  execSync("npx drizzle-kit push --force", {
    stdio: "inherit",
    cwd: process.cwd(),
    env: process.env,
  });
}
