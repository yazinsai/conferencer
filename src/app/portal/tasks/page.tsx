import Link from "next/link";

import { requirePortalUser } from "@/lib/guards";
import { linkContactToUser, portalContact } from "@/lib/repo/contacts";
import {
  effectiveDue,
  isComplete,
  isOverdue,
  listAssignments,
  type AssignmentRow,
} from "@/lib/repo/tasks";
import { completeTaskAction } from "@/server/portal-actions";
import { Button, Card, Chip, LinkButton, PageHeader, Progress } from "@/components/ui";
import { formatDate } from "@/lib/datetime";

export const metadata = { title: "My tasks" };
export const dynamic = "force-dynamic";

function sortTaskRows(rows: AssignmentRow[]) {
  return [...rows].sort((a, b) => {
    const aDone = isComplete(a.status) ? 1 : 0;
    const bDone = isComplete(b.status) ? 1 : 0;
    if (aDone !== bDone) return aDone - bDone;
    const aOver = isOverdue(a) ? 0 : 1;
    const bOver = isOverdue(b) ? 0 : 1;
    if (aOver !== bOver) return aOver - bOver;
    const aDue = effectiveDue(a) ?? "9999-12-31";
    const bDue = effectiveDue(b) ?? "9999-12-31";
    return aDue.localeCompare(bDue);
  });
}

export default async function PortalTasks() {
  const { user, event } = await requirePortalUser();
  const contact = portalContact(event, user) ?? linkContactToUser(event, user);
  const assignments = listAssignments(event.id, { contactId: contact.id });
  const done = assignments.filter((a) => isComplete(a.status)).length;
  const overdueCount = assignments.filter((a) => isOverdue(a)).length;

  const groups = [
    {
      key: "submission",
      title: "Submission tasks",
      rows: sortTaskRows(assignments.filter((a) => a.submission_id)),
    },
    {
      key: "mine",
      title: "My tasks",
      rows: sortTaskRows(assignments.filter((a) => !a.submission_id)),
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
          <span className="tnum font-medium text-ink">
            {done} of {assignments.length} complete
          </span>
          <span className="tnum text-muted-foreground">
            {overdueCount} overdue
          </span>
        </div>
        <div className="mt-2">
          <Progress value={done} max={Math.max(assignments.length, 1)} />
        </div>
      </Card>

      {!assignments.length ? (
        <Card className="p-8 text-center text-sm text-muted-foreground">
          No tasks yet. Once a submission is accepted your onboarding checklist appears here.
        </Card>
      ) : null}

      <div className="space-y-6">
        {groups.map((group) => {
          const firstCompleteIndex = group.rows.findIndex((a) => isComplete(a.status));
          return (
            <section key={group.key}>
              <h2 className="mb-2 text-sm font-semibold text-ink">{group.title}</h2>
              <Card>
                <ul>
                  {group.rows.map((assignment, index) => {
                    const complete = isComplete(assignment.status);
                    const showCompletedDivider =
                      firstCompleteIndex > 0 && index === firstCompleteIndex;
                    return (
                      <li key={assignment.id}>
                        {showCompletedDivider ? (
                          <div className="border-t border-rule px-4 py-2">
                            <p className="wordmark text-[0.625rem] uppercase tracking-[0.14em] text-muted-foreground">
                              Completed
                            </p>
                          </div>
                        ) : index > 0 ? (
                          <div className="border-t border-rule" />
                        ) : null}
                        <div className="grid gap-3 px-4 py-3 sm:grid-cols-[minmax(0,1.5fr)_minmax(0,0.9fr)_auto] sm:items-center">
                          <div className="min-w-0">
                            <Link
                              href={`/portal/tasks/${assignment.id}`}
                              className="font-medium text-ink hover:text-signal"
                            >
                              {assignment.task_name}
                            </Link>
                            {assignment.task_description ? (
                              <p className="mt-0.5 line-clamp-1 text-sm text-neutral">
                                {assignment.task_description}
                              </p>
                            ) : null}
                          </div>
                          <div className="tnum text-xs text-muted-foreground">
                            <p>
                              {effectiveDue(assignment)
                                ? `Due ${formatDate(effectiveDue(assignment))}`
                                : "No due date"}
                            </p>
                            <p>
                              {assignment.is_required ? "Required" : "Optional"}
                              {assignment.task_type !== "action"
                                ? ` · ${assignment.task_type === "file_request" ? "File upload" : "Form"}`
                                : ""}
                              {assignment.submission_title
                                ? ` · ${assignment.submission_title}`
                                : ""}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 sm:justify-end">
                            <Chip
                              tone={
                                complete ? "green" : isOverdue(assignment) ? "red" : "slate"
                              }
                            >
                              {complete
                                ? "Complete"
                                : isOverdue(assignment)
                                  ? "Overdue"
                                  : "To do"}
                            </Chip>
                            {assignment.task_type === "action" ? (
                              <form action={completeTaskAction}>
                                <input
                                  type="hidden"
                                  name="assignment_id"
                                  value={assignment.id}
                                />
                                <input
                                  type="hidden"
                                  name="status"
                                  value={complete ? "not_started" : "complete"}
                                />
                                <Button
                                  type="submit"
                                  size="sm"
                                  variant={complete ? "secondary" : "primary"}
                                >
                                  {complete ? "Mark incomplete" : "Mark as complete"}
                                </Button>
                              </form>
                            ) : (
                              <LinkButton
                                href={`/portal/tasks/${assignment.id}`}
                                size="sm"
                                variant="primary"
                              >
                                {assignment.task_type === "file_request"
                                  ? "Upload"
                                  : "Open form"}
                              </LinkButton>
                            )}
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </Card>
            </section>
          );
        })}
      </div>
    </div>
  );
}
