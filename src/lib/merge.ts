/** Merge fields used by every template and compose screen (R-COM-2). */

export const MERGE_FIELDS = [
  "{speaker_name}",
  "{first_name}",
  "{last_name}",
  "{talk_title}",
  "{event_name}",
  "{event_dates}",
  "{event_location}",
  "{track}",
  "{format}",
  "{room}",
  "{session_time}",
  "{portal_link}",
  "{due_date}",
  "{task_name}",
  "{decision}",
  "{organizer_name}",
] as const;

export type MergeContext = Partial<Record<string, string | null | undefined>>;

export function renderMerge(template: string, context: MergeContext): string {
  if (!template) return "";
  return template.replace(/\{\{?\s*([a-z_]+)\s*\}?\}/gi, (match, key: string) => {
    const value = context[key.toLowerCase()];
    if (value === undefined || value === null) return match;
    return String(value);
  });
}

export const SAMPLE_CONTEXT: MergeContext = {
  speaker_name: "Priya Raman",
  first_name: "Priya",
  last_name: "Raman",
  talk_title: "Taming 40-Minute CI: Incremental Builds at Monorepo Scale",
  event_name: "DevFlow Conf 2027",
  event_dates: "May 12–14, 2027",
  event_location: "Moscone West, San Francisco, CA",
  track: "Platform & Infra",
  format: "Talk (30 min)",
  room: "Room 2A",
  session_time: "Wednesday, May 12, 2027 · 10:00 AM – 10:30 AM",
  portal_link: "https://example.com/portal",
  due_date: "April 1, 2027",
  task_name: "Upload final slides",
  decision: "Accepted",
  organizer_name: "Jordan Alvarez",
};
