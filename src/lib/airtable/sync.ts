/**
 * Optional one-way Airtable sync (R-NFR-7).
 * Off by default — product runs fully without these env vars.
 *
 * AIRTABLE_API_KEY + AIRTABLE_BASE_ID enable push of submissions/speakers/sessions
 * on write. Read-back is intentionally not wired for v1.
 */

export function airtableEnabled() {
  return Boolean(process.env.AIRTABLE_API_KEY && process.env.AIRTABLE_BASE_ID);
}

export async function pushRecordToAirtable(opts: {
  table: string;
  fields: Record<string, unknown>;
}): Promise<{ ok: boolean; skipped?: boolean; error?: string }> {
  if (!airtableEnabled()) {
    return { ok: true, skipped: true };
  }
  const base = process.env.AIRTABLE_BASE_ID!;
  const key = process.env.AIRTABLE_API_KEY!;
  try {
    const res = await fetch(
      `https://api.airtable.com/v0/${base}/${encodeURIComponent(opts.table)}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${key}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ records: [{ fields: opts.fields }] }),
      },
    );
    if (!res.ok) {
      return { ok: false, error: await res.text() };
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "airtable failed" };
  }
}
