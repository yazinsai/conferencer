import { requireOrganizer } from "@/lib/guards";
import { contactName, listRoster } from "@/lib/repo/contacts";
import { submissionsForContact } from "@/lib/repo/submissions";
import { taskProgress } from "@/lib/repo/tasks";
import { toCsv } from "@/lib/csv";
import { stripHtml } from "@/lib/fields";

export const dynamic = "force-dynamic";

export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { event } = await requireOrganizer(slug);
  const url = new URL(request.url);

  const rows = listRoster(event.id, {
    q: url.searchParams.get("q") ?? undefined,
    status: url.searchParams.get("status") ?? undefined,
  }).map((row) => {
    const progress = taskProgress(event.id, row.id);
    return {
      name: contactName(row),
      first_name: row.first_name,
      last_name: row.last_name,
      email: row.email,
      job_title: row.job_title ?? "",
      company: row.company ?? "",
      speaker_status: row.speaker_status,
      pronouns: row.pronouns ?? "",
      dietary: row.dietary ?? "",
      tshirt_size: row.tshirt_size ?? "",
      travel_notes: row.travel_notes ?? "",
      linkedin: row.linkedin_url ?? "",
      twitter: row.twitter_url ?? "",
      website: row.website_url ?? "",
      sessions: submissionsForContact(event.id, row.id)
        .map((s) => s.title)
        .join("; "),
      tasks_complete: progress.done,
      tasks_total: progress.total,
      tasks_overdue: progress.overdue,
      biography: stripHtml(row.biography ?? ""),
    };
  });

  return new Response(toCsv(rows), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${event.slug}-speakers.csv"`,
    },
  });
}
