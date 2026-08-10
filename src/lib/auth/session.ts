import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "node:crypto";
import { eq } from "drizzle-orm";
import { getDb, schema } from "@/lib/db";

const COOKIE = "cnf_session";
const MAX_AGE_SEC = 60 * 60 * 24 * 14;

type SessionPayload = {
  userId: string;
  exp: number;
};

function secret() {
  return process.env.SESSION_SECRET || "dev-insecure-session-secret";
}

function sign(data: string) {
  return createHmac("sha256", secret()).update(data).digest("base64url");
}

export function encodeSession(payload: SessionPayload) {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${body}.${sign(body)}`;
}

export function decodeSession(token: string | undefined): SessionPayload | null {
  if (!token) return null;
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  const expected = sign(body);
  try {
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  } catch {
    return null;
  }
  try {
    const payload = JSON.parse(
      Buffer.from(body, "base64url").toString("utf8"),
    ) as SessionPayload;
    if (!payload.userId || !payload.exp || payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

export async function setSessionCookie(userId: string) {
  const token = encodeSession({
    userId,
    exp: Date.now() + MAX_AGE_SEC * 1000,
  });
  const jar = await cookies();
  jar.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE_SEC,
  });
}

export async function clearSessionCookie() {
  const jar = await cookies();
  jar.delete(COOKIE);
}

export async function getSessionUser() {
  const jar = await cookies();
  const payload = decodeSession(jar.get(COOKIE)?.value);
  if (!payload) return null;
  const db = getDb();
  const user = db
    .select()
    .from(schema.users)
    .where(eq(schema.users.id, payload.userId))
    .get();
  return user ?? null;
}

export async function requireUser() {
  const user = await getSessionUser();
  if (!user) {
    throw new Response("Unauthorized", { status: 401 });
  }
  return user;
}
