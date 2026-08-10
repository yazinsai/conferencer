"use server";

import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { getDb, schema } from "@/lib/db";
import { id } from "@/lib/id";
import { nowIso } from "@/lib/dates";
import { hashPassword, verifyPassword } from "./password";
import { clearSessionCookie, setSessionCookie } from "./session";

function splitName(full: string) {
  const parts = full.trim().split(/\s+/);
  const firstName = parts[0] || "User";
  const lastName = parts.slice(1).join(" ") || "Account";
  return { firstName, lastName };
}

export async function signUpAction(formData: FormData) {
  const email = String(formData.get("email") || "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") || "");
  const firstName = String(formData.get("firstName") || "").trim();
  const lastName = String(formData.get("lastName") || "").trim();
  const next = String(formData.get("next") || "");

  if (!email || !password || password.length < 8) {
    redirect(
      `/sign-up?error=${encodeURIComponent("Email and password (8+ chars) required")}${next ? `&next=${encodeURIComponent(next)}` : ""}`,
    );
  }

  const db = getDb();
  const existing = db
    .select()
    .from(schema.users)
    .where(eq(schema.users.email, email))
    .get();
  if (existing) {
    redirect(
      `/sign-up?error=${encodeURIComponent("Account already exists — sign in instead")}${next ? `&next=${encodeURIComponent(next)}` : ""}`,
    );
  }

  const userId = id("usr");
  db.insert(schema.users)
    .values({
      id: userId,
      email,
      passwordHash: await hashPassword(password),
      firstName: firstName || splitName(email).firstName,
      lastName: lastName || "Speaker",
      createdAt: nowIso(),
    })
    .run();

  await setSessionCookie(userId);
  redirect(next || "/portal");
}

export async function signInAction(formData: FormData) {
  const email = String(formData.get("email") || "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") || "");
  const next = String(formData.get("next") || "");

  const db = getDb();
  const user = db
    .select()
    .from(schema.users)
    .where(eq(schema.users.email, email))
    .get();
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    redirect(
      `/sign-in?error=${encodeURIComponent("Invalid email or password")}${next ? `&next=${encodeURIComponent(next)}` : ""}`,
    );
  }

  await setSessionCookie(user.id);

  if (next) redirect(next);

  const memberships = db
    .select()
    .from(schema.eventMemberships)
    .where(eq(schema.eventMemberships.userId, user.id))
    .all();
  const roles = new Set(memberships.map((m) => m.role));
  if (roles.has("organizer")) redirect("/admin");
  if (roles.has("reviewer")) redirect("/review");
  if (roles.has("participant")) redirect("/portal");
  redirect("/");
}

export async function signOutAction() {
  await clearSessionCookie();
  redirect("/");
}

export async function setPasswordAction(formData: FormData) {
  const token = String(formData.get("token") || "");
  const password = String(formData.get("password") || "");
  if (!token || password.length < 8) {
    redirect(`/set-password?token=${encodeURIComponent(token)}&error=Password+must+be+8%2B+chars`);
  }
  const db = getDb();
  const invite = db
    .select()
    .from(schema.inviteTokens)
    .where(eq(schema.inviteTokens.token, token))
    .get();
  if (!invite || invite.usedAt || new Date(invite.expiresAt) < new Date()) {
    redirect(`/set-password?token=${encodeURIComponent(token)}&error=Invalid+or+expired+link`);
  }
  db.update(schema.users)
    .set({ passwordHash: await hashPassword(password) })
    .where(eq(schema.users.id, invite.userId))
    .run();
  db.update(schema.inviteTokens)
    .set({ usedAt: nowIso() })
    .where(eq(schema.inviteTokens.id, invite.id))
    .run();
  await setSessionCookie(invite.userId);
  redirect("/review");
}
