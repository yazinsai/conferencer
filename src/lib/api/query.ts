import { and, eq, gt, gte, SQL } from "drizzle-orm";
import type { SQLiteColumn } from "drizzle-orm/sqlite-core";

export type ListParams = {
  limit: number;
  cursor?: string;
  updatedSince?: string;
  filters: Record<string, string>;
};

const RESERVED = new Set(["limit", "cursor", "updated_since"]);

export function parseListParams(
  url: URL,
  opts?: { defaultLimit?: number; maxLimit?: number },
): ListParams {
  const defaultLimit = opts?.defaultLimit ?? 50;
  const maxLimit = opts?.maxLimit ?? 100;

  let limit = Number.parseInt(url.searchParams.get("limit") ?? "", 10);
  if (!Number.isFinite(limit) || limit < 1) limit = defaultLimit;
  if (limit > maxLimit) limit = maxLimit;

  const cursor = url.searchParams.get("cursor")?.trim() || undefined;
  const updatedSince =
    url.searchParams.get("updated_since")?.trim() || undefined;

  const filters: Record<string, string> = {};
  for (const [key, value] of url.searchParams.entries()) {
    if (!RESERVED.has(key) && value !== "") {
      filters[key] = value;
    }
  }

  return { limit, cursor, updatedSince, filters };
}

export function buildListConditions<T extends { id: SQLiteColumn }>(
  table: T,
  base: SQL[],
  params: ListParams,
  opts?: {
    updatedAtColumn?: SQLiteColumn;
    filterMap?: Record<string, SQLiteColumn>;
  },
): SQL[] {
  const conditions = [...base];

  if (params.cursor) {
    conditions.push(gt(table.id, params.cursor));
  }

  if (params.updatedSince && opts?.updatedAtColumn) {
    conditions.push(gte(opts.updatedAtColumn, params.updatedSince));
  }

  if (opts?.filterMap) {
    for (const [key, value] of Object.entries(params.filters)) {
      const column = opts.filterMap[key];
      if (column) {
        conditions.push(eq(column, value));
      }
    }
  }

  return conditions;
}

export function paginate<T extends { id: string }>(
  rows: T[],
  limit: number,
): { items: T[]; nextCursor?: string } {
  const hasMore = rows.length > limit;
  const items = hasMore ? rows.slice(0, limit) : rows;
  const nextCursor = hasMore ? items[items.length - 1]?.id : undefined;
  return { items, nextCursor };
}
