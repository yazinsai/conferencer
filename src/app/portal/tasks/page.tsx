import Link from "next/link";

import { requirePortalUser } from "@/lib/guards";
import { linkContactToUser, portalContact } from "@/lib/repo/contacts";
import { effectiveDue, isComplete, isOverdue, listAssignments } from "@/lib/repo/tasks";
import { completeTaskAction } from "@/server/portal-actions";
import { Button, Card, Chip, PageHeader, Progress } from "@/components/ui";
import { formatDate } from "@/lib/datetime";

export const metadata = { title: "My tasks" };
export const dynamic = "force-dynamic";

export default async function PortalTasks() {
  const { user, event } = await requirePortalUser();
  const contact = portalContact(event, user) ?? linkContactToUser(event, user);
  const assignments = listAssignments(event.id, { contactId: contact.id });
  const done = assignments.filter((a) => isComplete(a.status)).length;

  const groups = [
    {
      key: "submission",
      title: "Submission Tasks",
      rows: assignments.filter((a) => a.submission_id),
    },
    {
      key: "mine",
      title: "My Tasks",
      rows: assignments.filter((a) => !a.submission_id),
    },
  ].filter((group) => group.rows.length);

  return (
    <div>
      <PageHeader
        title="My tasks"
        description="Everything the organizers need from you before the event."
      />

      <Card className="mb-5 p-4">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-slate-800">
            {done} of {assignments.length} complete
          </span>
          <span className="text-slate-500">
            {assignments.filter((a) => isOverdue(a)).length} overdue
          </span>
        </div>
        <div className="mt-2">
          <Progress value={done} max={Math.max(assignments.length, 1)} />
        </div>
      </Card>

      {!assignments.length ? (
        <Card className="p-8 text-center text-sm text-slate-500">
          No tasks yet. Once a submission is accepted your onboarding checklist appears here.
        </Card>
      ) : null}

      <div className="space-y-6">
        {groups.map((group) => (
          <section key={group.key}>
            <h2 className="mb-2 text-sm font-semibold text-slate-900">{group.title}</h2>
            <Card>
              <ul className="divide-y divide-slate-100">
                {group.rows.map((assignment) => {
                  const complete = isComplete(assignment.status);
                  return (
                    <li key={assignment.id} className="px-4 py-3">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0">
                          <Link
                            href={`/portal/tasks/${assignment.id}`}
                            className="font-medium text-slate-900 hover:text-brand-700"
                          >
                            {assignment.task_name}
                          </Link>
                          {assignment.task_description ? (
                            <p className="mt-0.5 text-sm text-slate-600">
                              {assignment.task_description}
                            </p>
                          ) : null}
                          <p className="mt-1 text-xs text-slate-500">
                            {effectiveDue(assignment)
                              ? `Due ${formatDate(effectiveDue(assignment))}`
                              : "No due date"}
                            {assignment.is_required ? " · Required" : " · Optional"}
                            {assignment.submission_title
                              ? ` · ${assignment.submission_title}`
                              : ""}
                            {assignment.task_type !== "action"
                              ? ` · ${assignment.task_type === "file_request" ? "File upload" : "Form"}`
                              : ""}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Chip
                            tone={complete ? "green" : isOverdue(assignment) ? "red" : "slate"}
                          >
                            {complete ? "Complete" : isOverdue(assignment) ? "Overdue" : "To do"}
                          </Chip>
                          {assignment.task_type === "action" ? (
                            <form action={completeTaskAction}>
                              <input type="hidden" name="assignment_id" value={assignment.id} />
                              <input
                                type="hidden"
                                name="status"
                                value={complete ? "not_started" : "complete"}
                              />
                              <Button
                                type="submit"
                                size="sm"
                                variant={complete ? "secondary" : "success"}
                              >
                                {complete ? "Mark incomplete" : "Mark as complete"}
                              </Button>
                            </form>
                          ) : (
                            <Link
                              href={`/portal/tasks/${assignment.id}`}
                              className="rounded-md border border-brand-600 bg-brand-600 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-brand-700"
                            >
                              {assignment.task_type === "file_request" ? "Upload" : "Open form"}
                            </Link>
                          )}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </Card>
          </section>
        ))}
      </div>
    </div>
  );
}
