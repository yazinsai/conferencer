/** Field type registry shared by the field library, form builder and public form. */

export const FIELD_TYPES = [
  "text",
  "textarea",
  "wysiwyg",
  "dropdown",
  "multiselect",
  "checkbox",
  "number",
  "date",
  "datetime",
  "email",
  "phone",
  "url",
  "file",
  "currency",
] as const;

export type FieldType = (typeof FIELD_TYPES)[number];

export const FIELD_TYPE_LABELS: Record<FieldType, string> = {
  text: "Short text",
  textarea: "Long text",
  wysiwyg: "Rich text",
  dropdown: "Dropdown",
  multiselect: "Multi-select",
  checkbox: "Checkbox",
  number: "Number",
  date: "Date",
  datetime: "Date & time",
  email: "Email",
  phone: "Phone",
  url: "URL",
  file: "File upload",
  currency: "Currency",
};

export function isChoiceType(type: string): boolean {
  return type === "dropdown" || type === "multiselect";
}

export type FieldOption = { value: string; label: string; points?: number };

export function parseOptions(raw: unknown): FieldOption[] {
  if (!raw) return [];
  let value = raw;
  if (typeof raw === "string") {
    const trimmed = raw.trim();
    if (!trimmed) return [];
    if (trimmed.startsWith("[")) {
      try {
        value = JSON.parse(trimmed);
      } catch {
        value = trimmed.split("\n");
      }
    } else {
      value = trimmed.split("\n");
    }
  }
  if (!Array.isArray(value)) return [];
  return value
    .map((entry) => {
      if (typeof entry === "string") {
        const label = entry.trim();
        return label ? { value: label, label } : null;
      }
      if (entry && typeof entry === "object") {
        const o = entry as Record<string, unknown>;
        const label = String(o.label ?? o.value ?? "").trim();
        if (!label) return null;
        return {
          value: String(o.value ?? label),
          label,
          points: o.points === undefined || o.points === null ? undefined : Number(o.points),
        };
      }
      return null;
    })
    .filter(Boolean) as FieldOption[];
}

export function optionsToText(options: FieldOption[]): string {
  return options
    .map((o) => (o.points === undefined ? o.label : `${o.label} | ${o.points}`))
    .join("\n");
}

export function textToOptions(text: string): FieldOption[] {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [label, points] = line.split("|").map((s) => s.trim());
      return {
        value: label,
        label,
        points: points === undefined || points === "" ? undefined : Number(points),
      };
    });
}

/** Standard field keys that map onto real submission/contact columns. */
export const STANDARD_SESSION_FIELDS: Array<{
  key: string;
  label: string;
  type: FieldType;
  column?: string;
}> = [
  { key: "title", label: "Title", type: "text", column: "title" },
  { key: "description", label: "Description", type: "textarea", column: "description" },
  { key: "format", label: "Format", type: "dropdown", column: "format_id" },
  { key: "track", label: "Track", type: "dropdown", column: "track_id" },
  { key: "tags", label: "Tags", type: "multiselect", column: "tags" },
  { key: "level", label: "Level", type: "dropdown", column: "level" },
  { key: "language", label: "Language", type: "dropdown", column: "language" },
  { key: "location", label: "Location", type: "dropdown", column: "location_id" },
  { key: "starts_at", label: "Starts At", type: "datetime", column: "starts_at" },
  { key: "ends_at", label: "Ends At", type: "datetime", column: "ends_at" },
  { key: "capacity", label: "Capacity", type: "number", column: "capacity" },
  { key: "client_session_id", label: "Client Session ID", type: "text", column: "client_session_id" },
];

export const STANDARD_CONTACT_FIELDS: Array<{
  key: string;
  label: string;
  type: FieldType;
  column?: string;
}> = [
  { key: "first_name", label: "First Name", type: "text", column: "first_name" },
  { key: "last_name", label: "Last Name", type: "text", column: "last_name" },
  { key: "email", label: "Email", type: "email", column: "email" },
  { key: "biography", label: "Biography", type: "wysiwyg", column: "biography" },
  { key: "headshot", label: "Headshot", type: "file", column: "headshot_url" },
  { key: "job_title", label: "Job Title", type: "text", column: "job_title" },
  { key: "company", label: "Company", type: "text", column: "company" },
  { key: "pronouns", label: "Pronouns", type: "text", column: "pronouns" },
  { key: "phone", label: "Mobile Phone", type: "phone", column: "phone" },
  { key: "linkedin_url", label: "LinkedIn URL", type: "url", column: "linkedin_url" },
  { key: "twitter_url", label: "X URL", type: "url", column: "twitter_url" },
  { key: "website_url", label: "Website", type: "url", column: "website_url" },
  { key: "dietary", label: "Dietary Requirements", type: "text", column: "dietary" },
  { key: "tshirt_size", label: "T-Shirt Size", type: "dropdown", column: "tshirt_size" },
  { key: "travel_notes", label: "Travel Preferences", type: "textarea", column: "travel_notes" },
];

export function columnForKey(scope: "session" | "contact", key: string): string | undefined {
  const table = scope === "session" ? STANDARD_SESSION_FIELDS : STANDARD_CONTACT_FIELDS;
  return table.find((f) => f.key === key)?.column;
}

/** Validate one answer. Returns an error message or null. */
export function validateAnswer(
  field: { label: string; type: string; max_length?: number | null; options?: unknown },
  value: unknown,
  required: boolean,
): string | null {
  const isEmpty =
    value === undefined ||
    value === null ||
    value === "" ||
    (Array.isArray(value) && value.length === 0);

  if (required && isEmpty) return `${field.label} is required.`;
  if (isEmpty) return null;

  const text = Array.isArray(value) ? value.join(", ") : String(value);

  if (field.max_length && stripHtml(text).length > field.max_length) {
    return `${field.label} must be ${field.max_length} characters or fewer.`;
  }

  switch (field.type) {
    case "email":
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text)) return `${field.label} must be a valid email address.`;
      break;
    case "url":
      if (!/^https?:\/\/.+/i.test(text)) return `${field.label} must start with http:// or https://`;
      break;
    case "number":
    case "currency":
      if (Number.isNaN(Number(text))) return `${field.label} must be a number.`;
      break;
    case "date":
      if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) return `${field.label} must be a date.`;
      break;
    case "datetime":
      if (!/^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}/.test(text)) return `${field.label} must be a date and time.`;
      break;
    default:
      break;
  }
  return null;
}

export function stripHtml(html: string): string {
  return String(html ?? "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}
