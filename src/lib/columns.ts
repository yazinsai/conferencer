/** Submission table column catalogue — shared by the server page and the client table. */
export type Column = { key: string; label: string };

export const ALL_COLUMNS: Column[] = [
  { key: "status", label: "Status" },
  { key: "form", label: "Source form" },
  { key: "title", label: "Title" },
  { key: "description", label: "Description" },
  { key: "speakers", label: "Speakers" },
  { key: "track", label: "Track" },
  { key: "tags", label: "Tags" },
  { key: "format", label: "Format" },
  { key: "level", label: "Level" },
  { key: "files", label: "Files" },
  { key: "rating", label: "Rating" },
  { key: "approval", label: "Approval" },
  { key: "schedule", label: "Scheduled" },
  { key: "notified", label: "Notified" },
  { key: "created", label: "Submitted" },
];

export const DEFAULT_COLUMNS = [
  "status",
  "title",
  "speakers",
  "track",
  "format",
  "files",
  "rating",
  "approval",
  "notified",
];
