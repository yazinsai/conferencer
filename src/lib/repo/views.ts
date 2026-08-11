import { all, get, run } from "../db";
import { id } from "../ids";
import { nowIso } from "../datetime";

export type SavedView = {
  id: string;
  event_id: string;
  user_id: string | null;
  surface: string;
  name: string;
  config: string;
  created_at: string;
};

/** Named column + filter + sort combinations for a list view (R-SUB-4). */
export function listViews(eventId: string, surface = "submissions"): SavedView[] {
  return all<SavedView>(
    "SELECT * FROM saved_views WHERE event_id = ? AND surface = ? ORDER BY name",
    eventId,
    surface,
  );
}

export function getView(viewId: string): SavedView | undefined {
  return get<SavedView>("SELECT * FROM saved_views WHERE id = ?", viewId);
}

export function createView(input: {
  eventId: string;
  userId: string | null;
  surface?: string;
  name: string;
  config: Record<string, string>;
}): SavedView {
  const viewId = id();
  run(
    "INSERT INTO saved_views (id, event_id, user_id, surface, name, config, created_at) VALUES (?,?,?,?,?,?,?)",
    viewId,
    input.eventId,
    input.userId,
    input.surface ?? "submissions",
    input.name,
    JSON.stringify(input.config),
    nowIso(),
  );
  return getView(viewId)!;
}

export function deleteView(viewId: string) {
  run("DELETE FROM saved_views WHERE id = ?", viewId);
}

/** Turns a saved config back into a query string for the list URL. */
export function viewQuery(config: Record<string, string>): string {
  const sp = new URLSearchParams();
  for (const [key, value] of Object.entries(config)) {
    if (value) sp.set(key, value);
  }
  return sp.toString();
}
