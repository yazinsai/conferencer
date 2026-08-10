import { createHash } from "node:crypto";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { getDb, schema } from "@/lib/db";
import { nowIso } from "@/lib/dates";
import { id } from "@/lib/id";
import { unauthorized } from "@/lib/api/response";

export type ApiAuthContext = {
  event: typeof schema.events.$inferSelect;
  token: typeof schema.apiTokens.$inferSelect;
};

export function hashApiToken(raw: string) {
  return createHash("sha256").update(raw).digest("hex");
}

export function generateApiTokenValue() {
  const raw = `cnf_${nanoid(32)}`;
  return {
    raw,
    tokenHash: hashApiToken(raw),
    tokenPrefix: raw.slice(0, 12),
  };
}

export async function createApiTokenRecord(eventId: string, name: string) {
  const db = getDb();
  const { raw, tokenHash, tokenPrefix } = generateApiTokenValue();
  const tokenId = id("apt");
  const createdAt = nowIso();

  db.insert(schema.apiTokens)
    .values({
      id: tokenId,
      eventId,
      name,
      tokenHash,
      tokenPrefix,
      createdAt,
    })
    .run();

  return { id: tokenId, name, raw, tokenPrefix, createdAt };
}

export async function authenticateApiRequest(
  req: Request,
): Promise<ApiAuthContext | Response> {
  const header = req.headers.get("Authorization");
  if (!header?.startsWith("Bearer ")) {
    return unauthorized("Missing or invalid Authorization header");
  }

  const raw = header.slice(7).trim();
  if (!raw.startsWith("cnf_")) {
    return unauthorized("Invalid API token");
  }

  const tokenHash = hashApiToken(raw);
  const db = getDb();
  const token = db
    .select()
    .from(schema.apiTokens)
    .where(eq(schema.apiTokens.tokenHash, tokenHash))
    .get();

  if (!token) {
    return unauthorized("Invalid API token");
  }

  const event = db
    .select()
    .from(schema.events)
    .where(eq(schema.events.id, token.eventId))
    .get();

  if (!event) {
    return unauthorized("Event not found for token");
  }

  db.update(schema.apiTokens)
    .set({ lastUsedAt: nowIso() })
    .where(eq(schema.apiTokens.id, token.id))
    .run();

  return { event, token };
}
