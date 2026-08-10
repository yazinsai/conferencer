import { and, asc, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session";
import { getDb, schema } from "@/lib/db";
import { getContactForUser, getDefaultEvent } from "@/lib/db/queries";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Input, Label, Textarea } from "@/components/ui/input";
import {
  completeActionTaskAction,
  submitFormTaskAction,
  uploadFileTaskAction,
} from "./actions";

function effectiveDue(assignment: {
  dueAt: string | null;
  extendedDueAt: string | null;
}) {
  return assignment.extendedDueAt ?? assignment.dueAt;
}

function isOverdue(assignment: {
  dueAt: string | null;
  extendedDueAt: string | null;
  status: string;
}) {
  if (assignment.status === "complete") return false;
  const due = effectiveDue(assignment);
  if (!due) return false;
  return new Date(due) < new Date();
}

function taskStatusClass(status: string) {
  switch (status) {
    case "complete":
    case "approved":
      return "bg-emerald-100 text-emerald-800";
    case "in_progress":
      return "bg-blue-100 text-blue-800";
    case "rejected":
      return "bg-rose-100 text-rose-800";
    default:
      return "bg-slate-100 text-slate-700";
  }
}

function formatDue(iso: string | null) {
  if (!iso) return "No due date";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default async function PortalTasksPage() {
  const user = await getSessionUser();
  if (!user) redirect("/sign-in?next=/portal/tasks");
  const event = getDefaultEvent();
  if (!event) redirect("/");
  const row = getContactForUser(event.id, user.id);
  const db = getDb();

  const items = row
    ? db
        .select({
          assignment: schema.taskAssignments,
          task: schema.tasks,
        })
        .from(schema.taskAssignments)
        .innerJoin(schema.tasks, eq(schema.taskAssignments.taskId, schema.tasks.id))
        .where(
          and(
            eq(schema.taskAssignments.eventId, event.id),
            eq(schema.taskAssignments.contactId, row.contact.id),
          ),
        )
        .orderBy(asc(schema.taskAssignments.dueAt))
        .all()
    : [];

  const complete = items.filter(
    (i) => i.assignment.status === "complete" || i.assignment.status === "approved",
  );
  const pending = items.filter(
    (i) => i.assignment.status !== "complete" && i.assignment.status !== "approved",
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">My Tasks</h1>
        <p className="text-slate-600">
          Onboarding and deliverables assigned to you for {event.name}.
        </p>
      </div>

      {items.length === 0 ? (
        <Card>
          <CardBody>
            <p className="text-sm text-slate-500">No tasks assigned yet.</p>
          </CardBody>
        </Card>
      ) : (
        <>
          {pending.length > 0 ? (
            <TaskGroup title="Outstanding" items={pending} />
          ) : null}
          {complete.length > 0 ? (
            <TaskGroup title="Completed" items={complete} />
          ) : null}
        </>
      )}
    </div>
  );
}

function TaskGroup({
  title,
  items,
}: {
  title: string;
  items: Array<{
    assignment: typeof schema.taskAssignments.$inferSelect;
    task: typeof schema.tasks.$inferSelect;
  }>;
}) {
  return (
    <Card>
      <CardHeader title={title} subtitle={`${items.length} task${items.length === 1 ? "" : "s"}`} />
      <CardBody className="space-y-6">
        {items.map(({ assignment, task }) => {
          const due = effectiveDue(assignment);
          const overdue = isOverdue(assignment);
          const locked =
            assignment.status === "complete" && assignment.lockOnComplete;
          const formAnswer =
            task.type === "form" && assignment.formAnswers
              ? (JSON.parse(assignment.formAnswers) as { answer?: string })
              : null;

          return (
            <div
              key={assignment.id}
              className="rounded-lg border border-slate-200 p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold">{task.name}</h3>
                    {assignment.isRequired ? (
                      <Badge className="bg-amber-100 text-amber-800">
                        Required
                      </Badge>
                    ) : null}
                  </div>
                  {task.description ? (
                    <p className="mt-1 text-sm text-slate-600">{task.description}</p>
                  ) : null}
                  <p className="mt-2 text-xs text-slate-500">
                    Due:{" "}
                    <span className={overdue ? "font-medium text-rose-600" : ""}>
                      {formatDue(due)}
                      {overdue ? " (overdue)" : ""}
                    </span>
                  </p>
                </div>
                <Badge className={taskStatusClass(assignment.status)}>
                  {assignment.status.replace(/_/g, " ")}
                </Badge>
              </div>

              {!locked && assignment.status !== "complete" && assignment.status !== "approved" ? (
                <div className="mt-4 border-t border-slate-100 pt-4">
                  {task.type === "action" ? (
                    <form action={completeActionTaskAction}>
                      <input type="hidden" name="assignmentId" value={assignment.id} />
                      {task.linkUrl ? (
                        <p className="mb-2 text-sm">
                          <a
                            href={task.linkUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium text-blue-700 hover:underline"
                          >
                            Open link
                          </a>
                          {" · "}
                          Mark complete when done.
                        </p>
                      ) : null}
                      <Button type="submit" variant="secondary">
                        Mark complete
                      </Button>
                    </form>
                  ) : null}

                  {task.type === "file_request" ? (
                    <form action={uploadFileTaskAction} className="space-y-3">
                      <input type="hidden" name="assignmentId" value={assignment.id} />
                      <p className="text-xs text-slate-500">
                        Accepted types: {task.acceptedTypes ?? "any"} · Max size:{" "}
                        {task.maxSizeMb ?? 20} MB
                      </p>
                      <div>
                        <Label htmlFor={`file-${assignment.id}`}>Upload file</Label>
                        <Input
                          id={`file-${assignment.id}`}
                          name="file"
                          type="file"
                          accept={task.acceptedTypes ?? undefined}
                          required
                        />
                      </div>
                      <Button type="submit">Upload and complete</Button>
                    </form>
                  ) : null}

                  {task.type === "form" ? (
                    <form action={submitFormTaskAction} className="space-y-3">
                      <input type="hidden" name="assignmentId" value={assignment.id} />
                      <div>
                        <Label htmlFor={`answer-${assignment.id}`}>Your response</Label>
                        <Textarea
                          id={`answer-${assignment.id}`}
                          name="answer"
                          rows={4}
                          required
                          placeholder="Enter your answer…"
                        />
                      </div>
                      <Button type="submit">Submit</Button>
                    </form>
                  ) : null}
                </div>
              ) : null}

              {formAnswer?.answer ? (
                <div className="mt-3 rounded-md bg-slate-50 p-3 text-sm text-slate-700">
                  <div className="text-xs font-medium uppercase text-slate-500">
                    Your response
                  </div>
                  <p className="mt-1 whitespace-pre-wrap">{formAnswer.answer}</p>
                </div>
              ) : null}
            </div>
          );
        })}
      </CardBody>
    </Card>
  );
}
