import { eq } from "drizzle-orm";
import { requireEventRole } from "@/lib/auth/guards";
import { getDb, schema } from "@/lib/db";
import {
  getSubmissionParticipants,
  listSubmissions,
} from "@/lib/db/queries";

function csvEscape(value: string | number | null | undefined): string {
  if (value == null || value === "") return "";
  const s = String(value);
  if (/[",\n\r]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export async function GET(
  request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  const { slug } = await context.params;
  const { event } = await requireEventRole(slug, ["organizer"]);
  const url = new URL(request.url);
  const status = url.searchParams.get("status") ?? undefined;
  const kind = url.searchParams.get("kind") ?? undefined;
  const q = url.searchParams.get("q") ?? undefined;

  const db = getDb();
  const tracks = db
    .select()
    .from(schema.tracks)
    .where(eq(schema.tracks.eventId, event.id))
    .all();
  const formats = db
    .select()
    .from(schema.formats)
    .where(eq(schema.formats.eventId, event.id))
    .all();
  const trackMap = Object.fromEntries(tracks.map((t) => [t.id, t.name]));
  const formatMap = Object.fromEntries(formats.map((f) => [f.id, f.name]));

  const rows = listSubmissions({
    eventId: event.id,
    status,
    kind,
    q,
    limit: 10000,
  });

  const headers = [
    "id",
    "status",
    "title",
    "description",
    "track",
    "format",
    "speakers",
    "level",
    "rating",
    "notified",
  ];

  const lines = [headers.join(",")];

  for (const r of rows) {
    const speakers = getSubmissionParticipants(r.id)
      .map((p) => `${p.firstName} ${p.lastName}`)
      .join("; ");
    lines.push(
      [
        csvEscape(r.id),
        csvEscape(r.status),
        csvEscape(r.title),
        csvEscape(r.description),
        csvEscape(r.trackId ? trackMap[r.trackId] : ""),
        csvEscape(r.formatId ? formatMap[r.formatId] : ""),
        csvEscape(speakers),
        csvEscape(r.level),
        csvEscape(r.averageScore),
        csvEscape(r.notifiedAt ? "Yes" : "No"),
      ].join(","),
    );
  }

  const body = lines.join("\n");
  const filename = `${event.slug}-submissions.csv`;

  return new Response(body, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
