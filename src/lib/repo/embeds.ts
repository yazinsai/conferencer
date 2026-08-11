import { all, get, run } from "../db";
import { id, token as newToken } from "../ids";
import { nowIso } from "../datetime";

export type Embed = {
  id: string;
  event_id: string;
  name: string;
  type: "sessions" | "speakers" | "agenda" | "itinerary" | "gallery";
  format: "styled_html" | "html" | "json" | "xml" | "ical";
  config: string;
  token: string;
  created_at: string;
  updated_at: string;
};

export const EMBED_TYPES: Array<{ value: Embed["type"]; label: string; description: string }> = [
  { value: "sessions", label: "List of Sessions", description: "Searchable, filterable session cards." },
  { value: "speakers", label: "List of Speakers", description: "Directory with each speaker's sessions." },
  { value: "agenda", label: "Agenda", description: "Room-by-time grid, one day at a time." },
  { value: "itinerary", label: "Schedule Itinerary", description: "Chronological day-by-day list." },
  { value: "gallery", label: "Speaker Gallery", description: "Photo grid of the line-up." },
];

export const EMBED_FORMATS: Array<{ value: Embed["format"]; label: string }> = [
  { value: "styled_html", label: "Styled HTML (script tag)" },
  { value: "html", label: "Plain HTML" },
  { value: "json", label: "JSON" },
  { value: "xml", label: "XML" },
  { value: "ical", label: "iCal (.ics)" },
];

export function listEmbeds(eventId: string): Embed[] {
  return all<Embed>("SELECT * FROM embeds WHERE event_id = ? ORDER BY created_at", eventId);
}

export function getEmbed(embedId: string): Embed | undefined {
  return get<Embed>("SELECT * FROM embeds WHERE id = ?", embedId);
}

export function getEmbedByToken(token: string): Embed | undefined {
  return get<Embed>("SELECT * FROM embeds WHERE token = ?", token);
}

export function createEmbed(
  eventId: string,
  input: { name: string; type: Embed["type"]; format: Embed["format"]; config?: unknown },
): Embed {
  const embedId = id();
  run(
    `INSERT INTO embeds (id, event_id, name, type, format, config, token, created_at, updated_at)
     VALUES (?,?,?,?,?,?,?,?,?)`,
    embedId,
    eventId,
    input.name,
    input.type,
    input.format,
    JSON.stringify(input.config ?? {}),
    newToken().slice(0, 24),
    nowIso(),
    nowIso(),
  );
  return getEmbed(embedId)!;
}

export function updateEmbed(
  embedId: string,
  patch: { name?: string; type?: string; format?: string; config?: unknown },
) {
  const sets: string[] = [];
  const params: unknown[] = [];
  if (patch.name !== undefined) {
    sets.push("name = ?");
    params.push(patch.name);
  }
  if (patch.type !== undefined) {
    sets.push("type = ?");
    params.push(patch.type);
  }
  if (patch.format !== undefined) {
    sets.push("format = ?");
    params.push(patch.format);
  }
  if (patch.config !== undefined) {
    sets.push("config = ?");
    params.push(JSON.stringify(patch.config));
  }
  if (!sets.length) return;
  sets.push("updated_at = ?");
  params.push(nowIso(), embedId);
  run(`UPDATE embeds SET ${sets.join(", ")} WHERE id = ?`, ...params);
}

export function deleteEmbed(embedId: string) {
  run("DELETE FROM embeds WHERE id = ?", embedId);
}

export function rotateToken(embedId: string) {
  run("UPDATE embeds SET token = ?, updated_at = ? WHERE id = ?", newToken().slice(0, 24), nowIso(), embedId);
}
