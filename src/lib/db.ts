import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";

declare global {
  // eslint-disable-next-line no-var
  var __conferencerDb: Database.Database | undefined;
}

export const DATA_DIR = process.env.DATA_DIR
  ? path.resolve(process.env.DATA_DIR)
  : path.join(process.cwd(), "data");

export const UPLOAD_DIR = path.join(DATA_DIR, "uploads");

export const DATABASE_PATH = process.env.DATABASE_PATH
  ? path.resolve(process.env.DATABASE_PATH)
  : path.join(DATA_DIR, "conferencer.db");

function schemaSql(): string {
  const candidates = [
    path.join(process.cwd(), "schema.sql"),
    path.join(process.cwd(), "..", "schema.sql"),
  ];
  for (const file of candidates) {
    if (fs.existsSync(file)) return fs.readFileSync(file, "utf8");
  }
  throw new Error("schema.sql not found (looked in " + candidates.join(", ") + ")");
}

function open(): Database.Database {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  const database = new Database(DATABASE_PATH);
  database.pragma("journal_mode = WAL");
  database.pragma("synchronous = NORMAL");
  database.pragma("foreign_keys = ON");
  database.exec(schemaSql());
  return database;
}

/** Singleton connection. Survives Next.js dev hot reloads via globalThis. */
export const db: Database.Database = globalThis.__conferencerDb ?? open();
if (process.env.NODE_ENV !== "production") globalThis.__conferencerDb = db;

/* ------------------------------------------------------------------ helpers */

export function all<T = Record<string, unknown>>(sql: string, ...params: unknown[]): T[] {
  return db.prepare(sql).all(...(params as never[])) as T[];
}

export function get<T = Record<string, unknown>>(
  sql: string,
  ...params: unknown[]
): T | undefined {
  return db.prepare(sql).get(...(params as never[])) as T | undefined;
}

export function run(sql: string, ...params: unknown[]) {
  return db.prepare(sql).run(...(params as never[]));
}

export function count(sql: string, ...params: unknown[]): number {
  const row = get<{ n: number }>(sql, ...params);
  return row?.n ?? 0;
}

export function tx<T>(fn: () => T): T {
  return db.transaction(fn)();
}

export function readJson<T>(value: unknown, fallback: T): T {
  if (value === null || value === undefined || value === "") return fallback;
  if (typeof value !== "string") return value as T;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export function writeJson(value: unknown): string {
  return JSON.stringify(value ?? null);
}

/** SQLite has no booleans. */
export function bool(value: unknown): boolean {
  return value === 1 || value === true || value === "1";
}

export function int(value: boolean | undefined | null): number {
  return value ? 1 : 0;
}
