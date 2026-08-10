import Link from "next/link";

import { requireOrganizer } from "@/lib/guards";
import { listLookup } from "@/lib/repo/events";
import { contactName, listRoster } from "@/lib/repo/contacts";
import {
  effectiveDue,
  isComplete,
  isOverdue,
  listAssignments,
  listTasks,
} from "@/lib/repo/tasks";
import { extendDueAction, remindOutstandingAction } from "@/server/task-actions";
import { FilterSelect } from "@/components/client/basics";
import {
  Avatar,
  Button,
  Card,
  Chip,
  Input,
  LinkButton,
  Notice,
  PageHeader,
  Progress,
  Td,
  Th,
} from "@/components/ui";
import { formatDate } from "@/lib/datetime";

export const dynamic = "force-dynamic";

export default async function DeliverablesPage({
  params,
  searchParams,
}: PageProps<"/admin/e/[slug]/tasks/deliverables">) {
  const { slug } = await params;
  const sp = await searchParams;
  const { event } = await requireOrganizer(slug);
  const str = (key: string) => (typeof sp[key] === "string" ? (sp[key] as string) : "");

  const taskFilter = str("task");
  const statusFilter = str("status");
  const trackFilter = str("track");
  const overdueOnly = str("overdue") === "1";

  const tasks = listTasks(event.id);
  const tracks = listLookup("tracks", event.id);
  const roster = listRoster(event.id, { trackId: trackFilter || undefined });
  const assignments = listAssignments(event.id, {
    taskId: taskFilter || undefined,
    status: statusFilter || undefined,
    overdue: overdueOnly || undefined,
    trackId: trackFilter || undefined,
  });

  const shownTasks = taskFilter ? tasks.filter((t) => t.id === taskFilter) : tasks;
  const byKey = new Map<string, (typeof assignments)[number]>();
  for (const assignment of assignments) {
    byKey.set(`${assignment.contact_id}:${assignment.task_id}`, assignment);
  }
  const speakers = roster.filter((row) =>
    assignments.some((assignment) => assignment.contact_id === row.id),
  );

  const total = assignments.length;
  const done = assignments.filter((a) => isComplete(a.status)).length;
  const overdue = assignments.filter((a) => isOverdue(a)).length;

  return (
    <div>
      <PageHeader
        title="Deliverables"
        description="Every speaker against every task. Filter, chase, and extend deadlines from one screen."
        actions={
          <>
            <LinkButton href={`/admin/e/${slug}/tasks`} size="sm">
              Task library
            </LinkButton>
            <LinkButton href={`/admin/e/${slug}/files`} size="sm">
              Files library
            </LinkButton>
          </>
        }
      />

      {sp.reminded ? (
        <Notice tone="success" className="mb-4">
          Reminder emails sent to {String(sp.reminded)} speaker(s). Each one is in the outbox.
        </Notice>
      ) : null}

      <div className="mb-4 grid gap-3 sm:grid-cols-4">
        <Card className="p-3">
          <p className="text-xs uppercase tracking-wide text-slate-500">Assignments</p>
          <p className="text-xl font-semibold text-slate-900">{total}</p>
        </Card>
        <Card className="p-3">
          <p className="text-xs uppercase tracking-wide text-slate-500">Complete</p>
          <p className="text-xl font-semibold text-emerald-700">{done}</p>
        </Card>
        <Card className="p-3">
          <p className="text-xs uppercase tracking-wide text-slate-500">Outstanding</p>
          <p className="text-xl font-semibold text-slate-900">{total - done}</p>
        </Card>
        <Card className="p-3">
          <p className="text-xs uppercase tracking-wide text-slate-500">Overdue</p>
          <p className="text-xl font-semibold text-red-700">{overdue}</p>
        </Card>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <FilterSelect
          param="task"
          label="Task"
          allLabel="All tasks"
          options={tasks.map((task) => ({ value: task.id, label: task.name }))}
        />
        <FilterSelect
          param="status"
          label="Status"
          allLabel="Any status"
          options={[
            { value: "outstanding", label: "Outstanding" },
            { value: "complete", label: "Complete" },
          ]}
        />
        <FilterSelect
          param="track"
          label="Track"
          allLabel="Any track"
          options={tracks.map((track) => ({ value: track.id, label: track.name }))}
        />
        <FilterSelect
          param="overdue"
          label="Overdue"
          allLabel="Any"
          options={[{ value: "1", label: "Overdue only" }]}
        />
        {taskFilter || statusFilter || trackFilter || overdueOnly ? (
          <LinkButton href={`/admin/e/${slug}/tasks/deliverables`} size="sm">
            Clear filters
          </LinkButton>
        ) : null}

        <form action={remindOutstandingAction} className="ml-auto">
          <input type="hidden" name="slug" value={slug} />
          {assignments
            .filter((a) => !isComplete(a.status))
            .map((a) => (
              <input key={a.id} type="hidden" name="assignment_ids" value={a.id} />
            ))}
          <Button type="submit" variant="primary" size="sm">
            Send reminder to everyone outstanding
          </Button>
        </form>
      </div>

      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr>
              <Th className="sticky left-0 bg-slate-50">Speaker</Th>
              {shownTasks.map((task) => (
                <Th key={task.id} className="min-w-40">
                  {task.name}
                  <span className="block text-[10px] font-normal normal-case text-slate-400">
                    {task.type.replace("_", " ")}
                  </span>
                </Th>
              ))}
              <Th>Progress</Th>
            </tr>
          </thead>
          <tbody>
            {speakers.map((speaker) => {
              const row = shownTasks.map((task) => byKey.get(`${speaker.id}:${task.id}`));
              const rowDone = row.filter((a) => a && isComplete(a.status)).length;
              const rowTotal = row.filter(Boolean).length;
              return (
                <tr key={speaker.id}>
                  <Td className="sticky left-0 bg-white">
                    <div className="flex items-center gap-2">
                      <Avatar src={speaker.headshot_url} name={contactName(speaker)} size={26} />
                      <Link
                        href={`/admin/e/${slug}/speakers/${speaker.id}`}
                        className="font-medium text-slate-800 hover:text-brand-700"
                      >
                        {contactName(speaker)}
                      </Link>
                    </div>
                  </Td>
                  {shownTasks.map((task) => {
                    const assignment = byKey.get(`${speaker.id}:${task.id}`);
                    if (!assignment) {
                      return (
                        <Td key={task.id} className="text-center text-xs text-slate-300">
                          not assigned
                        </Td>
                      );
                    }
                    const complete = isComplete(assignment.status);
                    return (
                      <Td key={task.id}>
                        <Chip
                          tone={complete ? "green" : isOverdue(assignment) ? "red" : "slate"}
                        >
                          {complete
                            ? assignment.upload_count
                              ? `Uploaded (${assignment.upload_count})`
                              : "Complete"
                            : isOverdue(assignment)
                              ? "Overdue"
                              : "Outstanding"}
                        </Chip>
                        <span className="mt-1 block text-[11px] text-slate-500">
                          {effectiveDue(assignment)
                            ? `due ${formatDate(effectiveDue(assignment))}`
                            : "no due date"}
                        </span>
                        <details className="mt-1">
                          <summary className="cursor-pointer text-[11px] text-brand-700">
                            extend
                          </summary>
                          <form action={extendDueAction} className="mt-1 flex items-center gap-1">
                            <input type="hidden" name="slug" value={slug} />
                            <input type="hidden" name="assignment_id" value={assignment.id} />
                            <Input
                              name="extended_due_at"
                              type="date"
                              defaultValue={assignment.extended_due_at ?? ""}
                              className="w-32 py-1 text-xs"
                              aria-label="Extended due date"
                            />
                            <Button type="submit" size="sm">
                              Save
                            </Button>
                          </form>
                        </details>
                      </Td>
                    );
                  })}
                  <Td className="w-32">
                    <Progress value={rowDone} max={Math.max(rowTotal, 1)} />
                    <span className="text-xs text-slate-500">
                      {rowDone}/{rowTotal}
                    </span>
                  </Td>
                </tr>
              );
            })}
            {!speakers.length ? (
              <tr>
                <Td colSpan={shownTasks.length + 2} className="py-8 text-center text-slate-500">
                  Nothing matches those filters.
                </Td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
