import { requireOrganizer } from "@/lib/guards";
import { effectiveDue, isComplete, isOverdue, listAssignments } from "@/lib/repo/tasks";
import { toCsv } from "@/lib/csv";

export const dynamic = "force-dynamic";

export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { event } = await requireOrganizer(slug);
  const url = new URL(request.url);

  const rows = listAssignments(event.id, {
    taskId: url.searchParams.get("task") ?? undefined,
    status: url.searchParams.get("status") ?? undefined,
  }).map((assignment) => ({
    speaker: `${assignment.contact_first} ${assignment.contact_last}`.trim(),
    email: assignment.contact_email,
    task: assignment.task_name,
    type: assignment.task_type,
    session: assignment.submission_title ?? "",
    due: effectiveDue(assignment) ?? "",
    status: assignment.status,
    complete: isComplete(assignment.status) ? "yes" : "no",
    overdue: isOverdue(assignment) ? "yes" : "no",
    uploads: assignment.upload_count,
    completed_at: assignment.completed_at ?? "",
  }));

  return new Response(toCsv(rows), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${event.slug}-tasks.csv"`,
    },
  });
}
