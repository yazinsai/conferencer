"use server";

import { redirect } from "next/navigation";

import {
  consumeInvite,
  createSession,
  createUser,
  destroySession,
  findInvite,
  findUserByEmail,
  hashPassword,
  passwordProblem,
  setUserPassword,
  verifyPassword,
  addMembership,
} from "@/lib/auth";
import { get, run } from "@/lib/db";
import { landingFor } from "@/lib/guards";
import { nowIso } from "@/lib/datetime";
import { id } from "@/lib/ids";
import { defaultEvent } from "@/lib/repo/events";
import { linkContactToUser } from "@/lib/repo/contacts";

function backTo(path: string, params: Record<string, string | undefined>) {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) if (v) sp.set(k, v);
  const qs = sp.toString();
  return qs ? `${path}?${qs}` : path;
}

export async function signInAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "");

  const user = findUserByEmail(email);
  if (!user || !verifyPassword(password, user.password_hash)) {
    redirect(
      backTo("/sign-in", {
        error: "That email and password combination did not match an account.",
        email,
        next,
      }),
    );
  }
  await createSession(user.id);
  redirect(next || landingFor(user));
}

export async function signUpAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const firstName = String(formData.get("first_name") ?? "").trim();
  const lastName = String(formData.get("last_name") ?? "").trim();
  const next = String(formData.get("next") ?? "");

  const fail = (error: string) =>
    redirect(
      backTo("/sign-up", { error, email, first_name: firstName, last_name: lastName, next }),
    );

  if (!email || !email.includes("@")) fail("Enter a valid email address.");
  const pwProblem = passwordProblem(password);
  if (pwProblem) fail(pwProblem);
  if (findUserByEmail(email)) {
    fail("An account with that email already exists — sign in instead.");
  }

  const user = createUser({ email, password, firstName, lastName });

  // Everyone who signs up gets a participant membership on the default event so
  // their portal works immediately (no email confirmation step — R-PUB-3).
  const event = defaultEvent();
  if (event) {
    addMembership(event.id, user.id, "participant");
    linkContactToUser(event, user);
  }

  await createSession(user.id);
  redirect(next || landingFor(user));
}

export async function signOutAction() {
  await destroySession();
  redirect("/");
}

export async function setPasswordAction(formData: FormData) {
  const tokenValue = String(formData.get("token") ?? "");
  const password = String(formData.get("password") ?? "");
  const firstName = String(formData.get("first_name") ?? "").trim();
  const lastName = String(formData.get("last_name") ?? "").trim();

  const invite = findInvite(tokenValue);
  if (!invite) {
    redirect(backTo("/sign-in", { error: "That invitation link is not valid." }));
  }
  const problem = passwordProblem(password);
  if (problem) {
    redirect(backTo(`/set-password/${tokenValue}`, { error: problem }));
  }

  let user = invite.user_id
    ? get<{ id: string }>("SELECT id FROM users WHERE id = ?", invite.user_id)
    : undefined;
  if (!user) {
    const existing = findUserByEmail(invite.email);
    if (existing) {
      user = { id: existing.id };
    } else {
      const created = id();
      run(
        `INSERT INTO users (id, email, password_hash, first_name, last_name, created_at)
         VALUES (?,?,?,?,?,?)`,
        created,
        invite.email,
        hashPassword(password),
        firstName,
        lastName,
        nowIso(),
      );
      user = { id: created };
    }
  }
  setUserPassword(user.id, password);
  if (firstName || lastName) {
    run(
      "UPDATE users SET first_name = COALESCE(NULLIF(?, ''), first_name), last_name = COALESCE(NULLIF(?, ''), last_name) WHERE id = ?",
      firstName,
      lastName,
      user.id,
    );
  }
  if (invite.event_id) {
    addMembership(invite.event_id, user.id, invite.role as "organizer" | "reviewer" | "participant");
  }
  if (invite.contact_id) {
    run("UPDATE contacts SET user_id = ? WHERE id = ?", user.id, invite.contact_id);
  }
  consumeInvite(tokenValue);

  await createSession(user.id);
  const full = get<{ id: string; email: string; is_superadmin: number }>(
    "SELECT id, email, is_superadmin FROM users WHERE id = ?",
    user.id,
  )!;
  redirect(landingFor({ ...full, password_hash: null, first_name: "", last_name: "", created_at: "" }));
}
