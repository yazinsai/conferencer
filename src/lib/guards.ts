import { forbidden, notFound, redirect, unauthorized } from "next/navigation";
import { cache } from "react";

import { currentUser, hasRole, type Membership, type User } from "./auth";
import { get } from "./db";
import { defaultEvent, getEventBySlug, type Event } from "./repo/events";

/**
 * Single chokepoint for authorization. Every admin/reviewer/portal page and every
 * server action calls one of these first (R-ROLE-1/2, R-NFR-4). Server actions are
 * reachable by direct POST, so hiding links is never enough.
 */

export type Ctx = { user: User; event: Event };

export async function optionalUser(): Promise<User | null> {
  return currentUser();
}

export async function requireUser(returnTo?: string): Promise<User> {
  const user = await currentUser();
  if (!user) {
    if (returnTo) redirect(`/sign-in?next=${encodeURIComponent(returnTo)}`);
    unauthorized();
  }
  return user;
}

export const roleSet = cache(function roleSet(
  userId: string,
  eventId: string,
): Set<Membership["role"]> {
  const rows = get<{ roles: string }>(
    `SELECT GROUP_CONCAT(role) AS roles FROM event_memberships WHERE user_id = ? AND event_id = ?`,
    userId,
    eventId,
  );
  return new Set((rows?.roles ?? "").split(",").filter(Boolean) as Membership["role"][]);
});

export function eventBySlugOr404(slug: string): Event {
  const event = getEventBySlug(slug);
  if (!event) notFound();
  return event;
}

export function defaultEventOr404(): Event {
  const event = defaultEvent();
  if (!event) notFound();
  return event;
}

/** Organizer of the event identified by slug. 403 for everyone else. */
export async function requireOrganizer(slug: string): Promise<Ctx> {
  const event = eventBySlugOr404(slug);
  const user = await requireUser(`/admin/e/${slug}`);
  if (!user.is_superadmin && !hasRole(user.id, event.id, "organizer")) forbidden();
  return { user, event };
}

/** Any organizer membership at all — used by /admin and cross-event pages. */
export async function requireAnyOrganizer(): Promise<{ user: User; event: Event }> {
  const user = await requireUser("/admin");
  const event = defaultEventOr404();
  if (!user.is_superadmin && !hasRole(user.id, event.id, "organizer")) forbidden();
  return { user, event };
}

/** Reviewer (or organizer, who may also review — R-ROLE-3). */
export async function requireReviewer(eventId?: string): Promise<{ user: User; event: Event }> {
  const user = await requireUser("/review");
  const event = eventId
    ? (get<Event>("SELECT * FROM events WHERE id = ?", eventId) ?? defaultEventOr404())
    : defaultEventOr404();
  const roles = roleSet(user.id, event.id);
  if (!user.is_superadmin && !roles.has("reviewer") && !roles.has("organizer")) forbidden();
  return { user, event };
}

/** Speaker portal. Anyone signed in may hold a portal; scoping is per-contact. */
export async function requirePortalUser(): Promise<{ user: User; event: Event }> {
  const user = await requireUser("/portal");
  const event = defaultEventOr404();
  return { user, event };
}

export function assert(condition: unknown, mode: "403" | "404" = "403"): asserts condition {
  if (!condition) {
    if (mode === "404") notFound();
    forbidden();
  }
}

/** Where a user lands after signing in. */
export function landingFor(user: User): string {
  const rows = get<{ roles: string }>(
    "SELECT GROUP_CONCAT(role) AS roles FROM event_memberships WHERE user_id = ?",
    user.id,
  );
  const roles = new Set((rows?.roles ?? "").split(",").filter(Boolean));
  if (user.is_superadmin || roles.has("organizer")) return "/admin";
  if (roles.has("reviewer")) return "/review";
  return "/portal";
}
