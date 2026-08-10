import { and, desc, eq } from "drizzle-orm";
import { requireEventRole } from "@/lib/auth/guards";
import { getDb, schema } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { createTaskAction } from "./actions";

const TASK_TYPES = [
  { value: "action", label: "Action (mark complete)" },
  { value: "file_request", label: "File request" },
  { value: "form", label: "Form (free text)" },
] as const;

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
          <form action={createTaskAction} className="space-y-4">
            <input type="hidden" name="slug" value={slug} />
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input id="name" name="name" required />
              </div>
              <div>
                <Label htmlFor="type">Type</Label>
                <Select id="type" name="type" defaultValue="action">
                  {TASK_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" name="description" rows={2} />
              </div>
              <div>
                <Label htmlFor="linkUrl">Link URL (action tasks)</Label>
                <Input id="linkUrl" name="linkUrl" type="url" placeholder="https://…" />
              </div>
              <div>
                <Label htmlFor="dueAt">Due date</Label>
                <Input id="dueAt" name="dueAt" type="date" />
              </div>
              <div>
                <Label htmlFor="acceptedTypes">Accepted file types</Label>
                <Input
                  id="acceptedTypes"
                  name="acceptedTypes"
                  defaultValue="application/pdf,image/png,image/jpeg"
                />
              </div>
              <div>
                <Label htmlFor="maxSizeMb">Max file size (MB)</Label>
                <Input
                  id="maxSizeMb"
                  name="maxSizeMb"
                  type="number"
                  min={1}
                  max={100}
                  defaultValue={20}
                />
              </div>
            </div>

            <div className="border-t border-slate-100 pt-4">
              <Label>Assign to</Label>
              <div className="mt-2 space-y-2">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="assignMode"
                    value="all_confirmed"
                    defaultChecked
                  />
                  All confirmed speakers ({confirmedCount})
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="radio" name="assignMode" value="selected" />
                  Selected speakers
                </label>
              </div>
              <div className="mt-3 max-h-48 overflow-y-auto rounded-md border border-slate-200 p-3">
                {speakers.map((s) => (
                  <label
                    key={s.contactId}
                    className="flex items-center gap-2 py-1 text-sm"
                  >
                    <input type="checkbox" name="contactIds" value={s.contactId} />
                    {s.firstName} {s.lastName}
                    <span className="text-slate-400">({s.speakerStatus})</span>
                  </label>
                ))}
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="isRequired" defaultChecked />
              Required task
            </label>

            <Button type="submit">Create task</Button>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
