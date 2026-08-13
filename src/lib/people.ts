/**
 * Client-safe helpers for the joined speaker-name strings the submission queries
 * return (`"Priya Raman, Marcus Okafor"`).
 *
 * This lives outside `repo/` and outside `demo-conference.ts` on purpose: both of
 * those reach the database, so importing a helper from them into a client component
 * would pull `better-sqlite3` toward the browser bundle. Same reason
 * `lib/scorecard.ts` exists beside `repo/evaluations.ts`.
 */

/** The individual people on a session. */
export function speakerSet(speakers: string | null | undefined): string[] {
  return (speakers ?? "")
    .split(/,\s*/)
    .map((name) => name.trim())
    .filter(Boolean);
}

/** The first person both sessions have in common, if any. */
export function sharedSpeaker(
  a: string | null | undefined,
  b: string | null | undefined,
): string | undefined {
  const left = speakerSet(a);
  return speakerSet(b).find((name) => left.includes(name));
}
