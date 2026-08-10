import { and, desc, eq } from "drizzle-orm";
import { requireEventRole } from "@/lib/auth/guards";
import { getDb, schema } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { CreateTaskForm } from "./create-task-form";

export default async function AdminTasksPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { event } = await requireEventRole(slug, ["organizer"]);
  const db = getDb();

  const tasks = db
    .select()
    .from(schema.tasks)
    .where(eq(schema.tasks.eventId, event.id))
    .orderBy(desc(schema.tasks.createdAt))
    .all();

  const assignmentCounts = tasks.map((task) => {
    const stats = db
      .select()
      .from(schema.taskAssignments)
      .where(eq(schema.taskAssignments.taskId, task.id))
      .all();
    const complete = stats.filter(
      (a) => a.status === "complete" || a.status === "approved",
    ).length;
    return { task, total: stats.length, complete };
  });

  const speakers = db
    .select({
      contactId: schema.contacts.id,
      firstName: schema.contacts.firstName,
      lastName: schema.contacts.lastName,
      speakerStatus: schema.eventContacts.speakerStatus,
    })
    .from(schema.eventContacts)
    .innerJoin(schema.contacts, eq(schema.eventContacts.contactId, schema.contacts.id))
    .where(eq(schema.eventContacts.eventId, event.id))
    .orderBy(schema.contacts.lastName)
    .all();

  const confirmedCount = speakers.filter((s) => s.speakerStatus === "confirmed").length;

  const submissionForms = db
    .select({ id: schema.submissionForms.id, name: schema.submissionForms.name })
    .from(schema.submissionForms)
    .where(eq(schema.submissionForms.eventId, event.id))
    .orderBy(schema.submissionForms.name)
    .all();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Tasks</h1>
        <p className="text-slate-600">
          Create onboarding tasks and assign them to speakers.
        </p>
      </div>

      <Card>
        <CardHeader title="Existing tasks" subtitle={`${tasks.length} tasks`} />
        <CardBody className="space-y-4">
          {assignmentCounts.length === 0 ? (
            <p className="text-sm text-slate-500">No tasks yet.</p>
          ) : (
            assignmentCounts.map(({ task, total, complete }) => (
              <div
                key={task.id}
                className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-4 last:border-0"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{task.name}</span>
                    <Badge className="bg-slate-100 text-slate-700">{task.type}</Badge>
                  </div>
                  {task.description ? (
                    <p className="mt-1 text-sm text-slate-600">{task.description}</p>
                  ) : null}
                </div>
                <div className="text-sm text-slate-600">
                  {complete}/{total} complete
                </div>
              </div>
            ))
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Create task" />
        <CardBody>
          <CreateTaskForm
            slug={slug}
            speakers={speakers}
            confirmedCount={confirmedCount}
            submissionForms={submissionForms}
          />
        </CardBody>
      </Card>
    </div>
  );
}
