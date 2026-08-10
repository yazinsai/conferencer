import { requireOrganizer } from "@/lib/guards";
import { listSubmissions, STATUS_LABELS, type SubmissionFilters } from "@/lib/repo/submissions";
import { toCsv } from "@/lib/csv";
import { readJson } from "@/lib/db";
import { stripHtml } from "@/lib/fields";

export const dynamic = "force-dynamic";

export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { event } = await requireOrganizer(slug);
  const url = new URL(request.url);
  const only = (url.searchParams.get("ids") ?? "").split(",").filter(Boolean);

  const filters: SubmissionFilters = {
    status: url.searchParams.get("status") ?? "all",
    kind: url.searchParams.get("kind") ?? "all",
    q: url.searchParams.get("q") ?? undefined,
    trackId: url.searchParams.get("track") ?? undefined,
    formatId: url.searchParams.get("format") ?? undefined,
    approval: url.searchParams.get("approval") ?? undefined,
    sort: url.searchParams.get("sort") ?? "recent",
    limit: 5000,
  };

  const rows = listSubmissions(event.id, filters).filter(
    (row) => !only.length || only.includes(row.id),
  );

  const csv = toCsv(
    rows.map((row) => {
      const answers = readJson<Record<string, unknown>>(row.answers, {});
      return {
        id: row.id,
        title: row.title,
        kind: row.kind,
        status: STATUS_LABELS[row.status] ?? row.status,
        approval_status: row.approval_status,
        track: row.track_name ?? "",
        format: row.format_name ?? "",
        level: row.level ?? "",
        language: row.language ?? "",
        speakers: row.speakers ?? "",
        submitter: row.submitter_name ?? "",
        average_score: row.avg_score ?? "",
        reviews: row.review_count,
        scheduled_at: row.starts_at ?? "",
        room: row.room_name ?? "",
        notified_at: row.notified_at ?? "",
        created_at: row.created_at,
        abstract: stripHtml(row.description ?? ""),
        ...Object.fromEntries(
          Object.entries(answers).map(([k, v]) => [
            `answer_${k}`,
            typeof v === "string" ? stripHtml(v) : JSON.stringify(v),
          ]),
        ),
      };
    }),
  );

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${event.slug}-submissions.csv"`,
    },
  });
}
