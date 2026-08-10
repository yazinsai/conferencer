"use client";

import { useCallback, useSyncExternalStore } from "react";

import { buttonClass, cx } from "@/components/ui";

export type StarSession = {
  id: string;
  title: string;
  start: string | null;
  end: string | null;
  room: string | null;
  track: string | null;
  trackColor: string | null;
  speakers: string;
  href: string;
  when: string;
};

function storageKey(slug: string) {
  return `conferencer:my-schedule:${slug}`;
}

function read(slug: string): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(storageKey(slug));
    const parsed = raw ? (JSON.parse(raw) as unknown) : [];
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

function write(slug: string, ids: string[]) {
  window.localStorage.setItem(storageKey(slug), JSON.stringify(ids));
  window.dispatchEvent(new CustomEvent("conferencer:schedule-changed"));
}

function subscribe(callback: () => void) {
  window.addEventListener("conferencer:schedule-changed", callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener("conferencer:schedule-changed", callback);
    window.removeEventListener("storage", callback);
  };
}

const EMPTY = "[]";
const snapshots = new Map<string, { raw: string; value: string[] }>();

function snapshotFor(slug: string): string[] {
  const raw = window.localStorage.getItem(storageKey(slug)) ?? EMPTY;
  const cached = snapshots.get(slug);
  if (cached && cached.raw === raw) return cached.value;
  const value = read(slug);
  snapshots.set(slug, { raw, value });
  return value;
}

const SERVER_SNAPSHOT: string[] = [];

export function useStarred(slug: string) {
  const ids = useSyncExternalStore(
    subscribe,
    () => snapshotFor(slug),
    () => SERVER_SNAPSHOT,
  );
  const ready = useHydrated();

  const toggle = useCallback(
    (id: string) => {
      const current = read(slug);
      write(slug, current.includes(id) ? current.filter((x) => x !== id) : [...current, id]);
    },
    [slug],
  );

  return { ids, toggle, ready };
}

/** Avoids a hydration mismatch on controls whose label depends on localStorage. */
function useHydrated() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

export function StarButton({
  slug,
  sessionId,
  title,
}: {
  slug: string;
  sessionId: string;
  title: string;
}) {
  const { ids, toggle, ready } = useStarred(slug);
  const active = ids.includes(sessionId);
  return (
    <button
      type="button"
      onClick={() => toggle(sessionId)}
      aria-pressed={active}
      aria-label={active ? `Remove ${title} from my schedule` : `Add ${title} to my schedule`}
      className={cx(
        "inline-flex items-center gap-1 rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors",
        active
          ? "border-amber-300 bg-amber-50 text-amber-800"
          : "border-slate-300 bg-white text-slate-600 hover:bg-slate-50",
      )}
      suppressHydrationWarning
    >
      <span aria-hidden>{ready && active ? "★" : "☆"}</span>
      {active ? "In my schedule" : "Add to my schedule"}
    </button>
  );
}

export function MySchedule({
  slug,
  sessions,
  eventName,
}: {
  slug: string;
  sessions: StarSession[];
  eventName: string;
}) {
  const { ids, toggle, ready } = useStarred(slug);
  const chosen = sessions
    .filter((s) => ids.includes(s.id))
    .sort((a, b) => (a.start ?? "").localeCompare(b.start ?? ""));

  if (!ready) {
    return <p className="text-sm text-slate-500">Loading your schedule…</p>;
  }

  if (!chosen.length) {
    return (
      <div className="rounded-lg border border-dashed border-slate-300 bg-white px-6 py-10 text-center">
        <p className="text-sm font-semibold text-slate-800">Your schedule is empty</p>
        <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">
          Star sessions from the itinerary or the sessions list and they will appear here. Your
          picks are stored in this browser.
        </p>
        <a href={`/e/${slug}/itinerary`} className={cx(buttonClass("primary", "md"), "mt-4")}>
          Browse the itinerary
        </a>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <p className="text-sm text-slate-600">
          <strong className="text-slate-900">{chosen.length}</strong>{" "}
          {chosen.length === 1 ? "session" : "sessions"} in your personal schedule for {eventName}.
        </p>
        <a
          className={buttonClass("secondary", "sm")}
          href={`/e/${slug}/my-schedule.ics?ids=${chosen.map((s) => s.id).join(",")}`}
        >
          Add to calendar (.ics)
        </a>
      </div>
      <ul className="space-y-3">
        {chosen.map((session) => (
          <li
            key={session.id}
            className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <a
                  href={session.href}
                  className="text-base font-semibold text-slate-900 hover:text-brand-700"
                >
                  {session.title}
                </a>
                <p className="mt-0.5 text-sm text-slate-500">
                  {session.when}
                  {session.room ? ` · ${session.room}` : ""}
                </p>
                {session.speakers ? (
                  <p className="mt-0.5 text-sm text-slate-600">{session.speakers}</p>
                ) : null}
                {session.track ? (
                  <span
                    className="mt-2 inline-block rounded-full px-2 py-0.5 text-xs font-medium"
                    style={{
                      backgroundColor: `${session.trackColor ?? "#64748b"}18`,
                      color: session.trackColor ?? "#334155",
                    }}
                  >
                    {session.track}
                  </span>
                ) : null}
              </div>
              <button
                type="button"
                onClick={() => toggle(session.id)}
                className={buttonClass("secondary", "sm")}
              >
                Remove
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
