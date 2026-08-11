import { requireOrganizer } from "@/lib/guards";
import { readJson } from "@/lib/db";
import { contactName, listRoster } from "@/lib/repo/contacts";
import { listAssignments, listTasks } from "@/lib/repo/tasks";
import {
  assignTaskAction,
  deleteTaskAction,
  saveTaskAction,
} from "@/server/task-actions";
import {
  AssignAudienceFields,
  TaskTypeFields,
} from "@/components/admin/task-form-fields";
import {
  Button,
  Card,
  CardHeader,
  Chip,
  Field,
  FormError,
  Input,
  LinkButton,
  Notice,
  PageHeader,
  Progress,
  Select,
  Table,
  Td,
  Textarea,
  Th,
} from "@/components/ui";
import { ConfirmSubmit } from "@/components/client/basics";

export const dynamic = "force-dynamic";

type FormFieldSpec = { label: string; type?: string; required?: boolean; options?: string[] };

export default async function TasksPage({
  params,
  searchParams,
}: PageProps<"/admin/e/[slug]/tasks">) {
  const { slug } = await params;
  const sp = await searchParams;
  const { event } = await requireOrganizer(slug);
  const tasks = listTasks(event.id);
  const roster = listRoster(event.id);
  const assignments = listAssignments(event.id);
  const error = typeof sp.error === "string" ? sp.error : null;
  const editing = typeof sp.edit === "string" ? tasks.find((t) => t.id === sp.edit) : undefined;

  const counts = new Map<string, { total: number; done: number }>();
  for (const assignment of assignments) {
    const entry = counts.get(assignment.task_id) ?? { total: 0, done: 0 };
    entry.total += 1;
    if (["complete", "approved"].includes(assignment.status)) entry.done += 1;
    counts.set(assignment.task_id, entry);
  }

  const formSchemaDefault = readJson<FormFieldSpec[]>(editing?.form_schema, [])
    .map(
      (field) =>
        `${field.label} | ${field.type ?? "text"}${field.required ? " | required" : ""}${
          field.options?.length ? ` | ${field.options.join(";")}` : ""
        }`,
    )
    .join("\n");

  return (
    <div>
      <PageHeader
        title="Tasks"
        description="The onboarding checklist. Action tasks are ticked off, file requests collect uploads, and form tasks capture structured answers such as hotel or flight details."
        actions={
          <LinkButton href={`/admin/e/${slug}/tasks/deliverables`} variant="primary" size="sm">
            Deliverables dashboard
          </LinkButton>
        }
      />

      {error ? (
        <div className="mb-4">
          <FormError>{error}</FormError>
        </div>
      ) : null}
      {sp.saved ? <Notice tone="success" className="mb-4">Task saved.</Notice> : null}
      {sp.assigned ? (
        <Notice tone="success" className="mb-4">
          Assigned to {String(sp.assigned)} speaker(s).
        </Notice>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Card>
            <CardHeader title="Task library" description={`${tasks.length} tasks`} />
            <Table className="rounded-none border-0">
              <thead>
                <tr>
                  <Th>Task</Th>
                  <Th>Completion</Th>
                  <Th />
                </tr>
              </thead>
              <tbody>
                {tasks.map((task) => {
                  const count = counts.get(task.id) ?? { total: 0, done: 0 };
                  return (
                    <tr key={task.id}>
                      <Td>
                        <span className="font-medium text-ink">{task.name}</span>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {task.type.replace("_", " ")} · {task.target}
                          {task.is_default ? " · default on accept" : ""}
                        </p>
                        {task.description ? (
                          <p className="mt-1 text-xs text-muted-foreground">{task.description}</p>
                        ) : null}
                        {task.is_default ? (
                          <Chip tone="blue" className="mt-1">
                            Default on accept
                          </Chip>
                        ) : null}
                      </Td>
                      <Td className="min-w-40">
                        <p className="text-xs text-ink">
                          {count.done} of {count.total} complete
                        </p>
                        <div className="mt-1">
                          <Progress value={count.done} max={Math.max(count.total, 1)} />
                        </div>
                      </Td>
                      <Td>
                        <div className="flex gap-1">
                          <LinkButton href={`/admin/e/${slug}/tasks?edit=${task.id}`} size="sm">
                            Edit
                          </LinkButton>
                          <form action={deleteTaskAction}>
                            <input type="hidden" name="slug" value={slug} />
                            <input type="hidden" name="task_id" value={task.id} />
                            <ConfirmSubmit
                              message={`Delete "${task.name}" and every assignment of it?`}
                              variant="danger"
                            >
                              Delete
                            </ConfirmSubmit>
                          </form>
                        </div>
                      </Td>
                    </tr>
                  );
                })}
                {!tasks.length ? (
                  <tr>
                    <Td colSpan={3} className="py-6 text-center text-muted-foreground">
                      No tasks yet.
                    </Td>
                  </tr>
                ) : null}
              </tbody>
            </Table>
          </Card>

          <Card>
            <CardHeader
              title="Assign a task"
              description="Pick who it goes to, when it is due, and whether to email them."
            />
            <form action={assignTaskAction} className="space-y-3 p-4">
              <input type="hidden" name="slug" value={slug} />
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Task" name="task_id" required>
                  <Select id="task_id" name="task_id" required>
                    {tasks.map((task) => (
                      <option key={task.id} value={task.id}>
                        {task.name}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label="Due date" name="due_at">
                  <Input id="due_at" name="due_at" type="date" />
                </Field>
              </div>
              <AssignAudienceFields
                roster={roster.map((row) => ({
                  id: row.id,
                  name: contactName(row),
                  email: row.email,
                }))}
              />
              <div className="flex flex-wrap gap-4">
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" name="is_required" defaultChecked /> Required
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" name="notify" defaultChecked /> Email the speaker
                </label>
              </div>
              <Button type="submit" variant="primary">
                Assign task
              </Button>
            </form>
          </Card>
        </div>

        <Card className="h-fit">
          <CardHeader title={editing ? `Edit “${editing.name}”` : "Create a task"} />
          <form action={saveTaskAction} className="space-y-3 p-4">
            <input type="hidden" name="slug" value={slug} />
            {editing ? <input type="hidden" name="task_id" value={editing.id} /> : null}
            <Field label="Name" name="name" required>
              <Input id="name" name="name" defaultValue={editing?.name ?? ""} required />
            </Field>
            <Field label="Description" name="description">
              <Textarea
                id="description"
                name="description"
                rows={3}
                defaultValue={editing?.description ?? ""}
              />
            </Field>
            <TaskTypeFields
              defaultType={editing?.type ?? "action"}
              linkUrl={editing?.link_url ?? ""}
              acceptedTypes={editing?.accepted_types ?? ""}
              maxSizeMb={editing?.max_size_mb ?? 20}
              formSchema={formSchemaDefault}
            />
            <Field label="Target" name="target">
              <Select id="target" name="target" defaultValue={editing?.target ?? "contact"}>
                <option value="contact">The speaker</option>
                <option value="submission">Their session</option>
              </Select>
            </Field>
            <div className="flex gap-2">
              <Button type="submit" variant="primary">
                {editing ? "Save task" : "Create task"}
              </Button>
              {editing ? (
                <LinkButton href={`/admin/e/${slug}/tasks`}>Cancel</LinkButton>
              ) : null}
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
