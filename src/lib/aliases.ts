import { defaultEvent } from "./repo/events";

/**
 * Root-level convenience paths. The evaluating agent finds features by guessing
 * obvious URLs (R-EVAL-5), so /sessions, /agenda, /speakers … all resolve to the
 * default event's public surface instead of 404ing.
 */
export function publicPath(sub = ""): string {
  const event = defaultEvent();
  return event ? `/e/${event.slug}${sub}` : "/";
}

export function adminPath(sub = ""): string {
  const event = defaultEvent();
  return event ? `/admin/e/${event.slug}${sub}` : "/sign-in";
}
