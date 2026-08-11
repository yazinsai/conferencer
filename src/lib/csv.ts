/** Tiny RFC4180-ish CSV helpers used by exports and the speaker importer. */

export function toCsv(rows: Array<Record<string, unknown>>, headers?: string[]): string {
  const cols = headers ?? Array.from(new Set(rows.flatMap((r) => Object.keys(r))));
  const escape = (value: unknown) => {
    const s = value === null || value === undefined ? "" : String(value);
    return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = [cols.join(",")];
  for (const row of rows) lines.push(cols.map((c) => escape(row[c])).join(","));
  return `${lines.join("\r\n")}\r\n`;
}

export function parseCsv(text: string): { headers: string[]; rows: string[][] } {
  const clean = text.replace(/^\uFEFF/, "");
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;

  for (let i = 0; i < clean.length; i += 1) {
    const ch = clean[i];
    if (quoted) {
      if (ch === '"') {
        if (clean[i + 1] === '"') {
          field += '"';
          i += 1;
        } else {
          quoted = false;
        }
      } else {
        field += ch;
      }
      continue;
    }
    if (ch === '"') {
      quoted = true;
    } else if (ch === ",") {
      row.push(field);
      field = "";
    } else if (ch === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else if (ch !== "\r") {
      field += ch;
    }
  }
  if (field.length || row.length) {
    row.push(field);
    rows.push(row);
  }
  const nonEmpty = rows.filter((r) => r.some((c) => c.trim() !== ""));
  const headers = (nonEmpty.shift() ?? []).map((h) => h.trim());
  return { headers, rows: nonEmpty };
}

/** Field keys the speaker importer understands. */
export const IMPORT_FIELDS = [
  { key: "first_name", label: "First name", aliases: ["first", "firstname", "given name", "given"] },
  { key: "last_name", label: "Last name", aliases: ["last", "lastname", "surname", "family name"] },
  { key: "full_name", label: "Full name", aliases: ["name", "speaker", "speaker name", "full"] },
  { key: "email", label: "Email", aliases: ["e-mail", "email address", "mail"] },
  { key: "job_title", label: "Job title", aliases: ["title", "role", "position"] },
  { key: "company", label: "Company", aliases: ["organisation", "organization", "org", "employer"] },
  { key: "biography", label: "Biography", aliases: ["bio", "about", "profile"] },
  { key: "pronouns", label: "Pronouns", aliases: [] },
  { key: "phone", label: "Phone", aliases: ["mobile", "telephone", "mobile phone"] },
  { key: "linkedin_url", label: "LinkedIn", aliases: ["linkedin", "linked in"] },
  { key: "twitter_url", label: "X / Twitter", aliases: ["twitter", "x", "x url"] },
  { key: "website_url", label: "Website", aliases: ["site", "url", "homepage"] },
  { key: "dietary", label: "Dietary", aliases: ["dietary requirements", "diet"] },
  { key: "tshirt_size", label: "T-shirt size", aliases: ["tshirt", "t-shirt", "shirt size"] },
  { key: "travel_notes", label: "Travel notes", aliases: ["travel", "logistics", "travel preferences"] },
  { key: "speaker_status", label: "Speaker status", aliases: ["status"] },
] as const;

/** Best-guess mapping from arbitrary CSV headers to our fields (SPK-03). */
export function autoMap(headers: string[]): Record<number, string> {
  const mapping: Record<number, string> = {};
  headers.forEach((header, index) => {
    const norm = header.trim().toLowerCase().replace(/[_-]+/g, " ");
    const match = IMPORT_FIELDS.find(
      (f) =>
        f.key.replace(/_/g, " ") === norm ||
        f.label.toLowerCase() === norm ||
        (f.aliases as readonly string[]).includes(norm),
    );
    if (match) mapping[index] = match.key;
  });
  return mapping;
}
