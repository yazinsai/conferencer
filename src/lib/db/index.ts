import Database from "better-sqlite3";
import { drizzle, type BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import * as schema from "./schema";

export type Db = BetterSQLite3Database<typeof schema>;

declare global {
  // eslint-disable-next-line no-var
  var __conferencerDb: Db | undefined;
  // eslint-disable-next-line no-var
  var __conferencerSqlite: Database.Database | undefined;
}

function resolveDbPath() {
  const configured = process.env.DATABASE_PATH ?? "./data/conferencer.db";
  return path.isAbsolute(configured)
    ? configured
    : path.join(/*turbopackIgnore: true*/ process.cwd(), "data", path.basename(configured));
}

export function getSqlite() {
  if (global.__conferencerSqlite) return global.__conferencerSqlite;
  const dbPath = resolveDbPath();
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });
  const sqlite = new Database(dbPath);
  sqlite.pragma("journal_mode = WAL");
  sqlite.pragma("foreign_keys = ON");
  global.__conferencerSqlite = sqlite;
  return sqlite;
}

export function getDb() {
  if (global.__conferencerDb) return global.__conferencerDb;
  const db = drizzle(getSqlite(), { schema });
  global.__conferencerDb = db;
  return db;
}

export { schema };
