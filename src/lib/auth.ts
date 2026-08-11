import bcrypt from "bcryptjs";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { cache } from "react";

import { all, get, run } from "./db";
import { id, token } from "./ids";
import { nowIso } from "./datetime";

export const SESSION_COOKIE = "cf_session";
const SESSION_DAYS = 30;

const SECRET = process.env.SESSION_SECRET || "conferencer-dev-secret-change-me";

export type User = {
  id: string;
  email: string;
  password_hash: string | null;
  first_name: string;
  last_name: string;
  is_superadmin: number;
  created_at: string;
};

export type Membership = {
  id: string;
  event_id: string;
  user_id: string;
  role: "organizer" | "reviewer" | "participant";
  created_at: string;
};

export function fullName(user: { first_name?: string | null; last_name?: string | null; email?: string }) {
  const name = `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim();
  return name || user.email || "Unknown";
}

/* ------------------------------------------------------------- passwords -- */

export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 10);
}

export function verifyPassword(password: string, hash: string | null): boolean {
  if (!hash) return false;
  try {
    return bcrypt.compareSync(password, hash);
  } catch {
    return false;
  }
}

export function passwordProblem(password: string): string | null {
  if (!password || password.length < 8) return "Password must be at least 8 characters.";
  return null;
}

/* ---------------------------------------------------------------- users --- */

export function findUserByEmail(email: string): User | undefined {
  return get<User>("SELECT * FROM users WHERE email = ? COLLATE NOCASE", email.trim());
}

export function getUser(userId: string): User | undefined {
  return get<User>("SELECT * FROM users WHERE id = ?", userId);
}

export function createUser(input: {
  email: string;
  password?: string | null;
  firstName?: string;
  lastName?: string;
}): User {
  const userId = id();
  run(
    `INSERT INTO users (id, email, password_hash, first_name, last_name, created_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
    userId,
    input.email.trim(),
    input.password ? hashPassword(input.password) : null,
    input.firstName ?? "",
    input.lastName ?? "",
    nowIso(),
  );
  return getUser(userId)!;
}

export function setUserPassword(userId: string, password: string) {
  run("UPDATE users SET password_hash = ? WHERE id = ?", hashPassword(password), userId);
}

export function memberships(userId: string): Membership[] {
  return all<Membership>("SELECT * FROM event_memberships WHERE user_id = ?", userId);
}

export function addMembership(
  eventId: string,
  userId: string,
  role: Membership["role"],
): void {
  const existing = get(
    "SELECT id FROM event_memberships WHERE event_id = ? AND user_id = ? AND role = ?",
    eventId,
    userId,
    role,
  );
  if (existing) return;
  run(
    "INSERT INTO event_memberships (id, event_id, user_id, role, created_at) VALUES (?,?,?,?,?)",
    id(),
    eventId,
    userId,
    role,
    nowIso(),
  );
}

export const hasRole = cache(function hasRole(
  userId: string,
  eventId: string,
  role: Membership["role"],
): boolean {
  return Boolean(
    get(
      "SELECT id FROM event_memberships WHERE user_id = ? AND event_id = ? AND role = ?",
      userId,
      eventId,
      role,
    ),
  );
});

/* -------------------------------------------------------------- sessions -- */

function sign(value: string): string {
  return createHmac("sha256", SECRET).update(value).digest("base64url");
}

function pack(sessionId: string): string {
  return `${sessionId}.${sign(sessionId)}`;
}

function unpack(raw: string | undefined): string | null {
  if (!raw) return null;
  const dot = raw.lastIndexOf(".");
  if (dot < 1) return null;
  const value = raw.slice(0, dot);
  const mac = raw.slice(dot + 1);
  const expected = sign(value);
  if (mac.length !== expected.length) return null;
  try {
    if (!timingSafeEqual(Buffer.from(mac), Buffer.from(expected))) return null;
  } catch {
    return null;
  }
  return value;
}

export async function createSession(userId: string): Promise<void> {
  const sessionId = token();
  const expires = new Date(Date.now() + SESSION_DAYS * 86_400_000);
  run(
    "INSERT INTO auth_sessions (id, user_id, created_at, expires_at) VALUES (?,?,?,?)",
    sessionId,
    userId,
    nowIso(),
    expires.toISOString(),
  );
  const store = await cookies();
  store.set(SESSION_COOKIE, pack(sessionId), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires,
  });
}

export async function destroySession(): Promise<void> {
  const store = await cookies();
  const sessionId = unpack(store.get(SESSION_COOKIE)?.value);
  if (sessionId) run("DELETE FROM auth_sessions WHERE id = ?", sessionId);
  store.delete(SESSION_COOKIE);
}

/** Current signed-in user, or null. Safe to call from any server context. */
export const currentUser = cache(async function currentUser(): Promise<User | null> {
  let store;
  try {
    store = await cookies();
  } catch {
    return null;
  }
  const sessionId = unpack(store.get(SESSION_COOKIE)?.value);
  if (!sessionId) return null;
  const row = get<{ user_id: string; expires_at: string }>(
    "SELECT user_id, expires_at FROM auth_sessions WHERE id = ?",
    sessionId,
  );
  if (!row) return null;
  if (row.expires_at < nowIso()) {
    run("DELETE FROM auth_sessions WHERE id = ?", sessionId);
    return null;
  }
  return getUser(row.user_id) ?? null;
});

/* --------------------------------------------------------------- invites -- */

export type InviteToken = {
  token: string;
  email: string;
  event_id: string | null;
  role: string;
  user_id: string | null;
  contact_id: string | null;
  created_at: string;
  expires_at: string;
  used_at: string | null;
};

export function createInvite(input: {
  email: string;
  eventId: string | null;
  role: string;
  userId?: string | null;
  contactId?: string | null;
  days?: number;
}): InviteToken {
  const value = token();
  run(
    `INSERT INTO invite_tokens (token, email, event_id, role, user_id, contact_id, created_at, expires_at)
     VALUES (?,?,?,?,?,?,?,?)`,
    value,
    input.email,
    input.eventId,
    input.role,
    input.userId ?? null,
    input.contactId ?? null,
    nowIso(),
    new Date(Date.now() + (input.days ?? 60) * 86_400_000).toISOString(),
  );
  return get<InviteToken>("SELECT * FROM invite_tokens WHERE token = ?", value)!;
}

export function findInvite(value: string): InviteToken | undefined {
  return get<InviteToken>("SELECT * FROM invite_tokens WHERE token = ?", value);
}

export function consumeInvite(value: string) {
  run("UPDATE invite_tokens SET used_at = ? WHERE token = ?", nowIso(), value);
}

/**
 * Ensures a login exists for an email, creating one if needed, and returns it
 * together with an invite link the organizer can copy (R-EVL-2 / R-COM-3).
 */
export function provisionUser(input: {
  email: string;
  firstName?: string;
  lastName?: string;
  password?: string | null;
  eventId: string;
  role: Membership["role"];
  contactId?: string | null;
}): { user: User; invite: InviteToken; created: boolean } {
  let user = findUserByEmail(input.email);
  const created = !user;
  if (!user) {
    user = createUser({
      email: input.email,
      password: input.password ?? null,
      firstName: input.firstName,
      lastName: input.lastName,
    });
  } else if (input.password) {
    setUserPassword(user.id, input.password);
  }
  addMembership(input.eventId, user.id, input.role);
  const invite = createInvite({
    email: input.email,
    eventId: input.eventId,
    role: input.role,
    userId: user.id,
    contactId: input.contactId ?? null,
  });
  return { user, invite, created };
}
