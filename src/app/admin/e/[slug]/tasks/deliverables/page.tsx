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
import { ConfirmSubmit, FilterSelect } from "@/components/client/basics";
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
  const outstanding = assignments.filter((a) => !isComplete(a.status));
  const uniqueRecipients = new Set(outstanding.map((a) => a.contact_id)).size;
  const filterScope = [
    taskFilter ? `task “${tasks.find((t) => t.id === taskFilter)?.name ?? "selected"}”` : null,
    statusFilter ? `status “${statusFilter}”` : null,
    trackFilter ? `track “${tracks.find((t) => t.id === trackFilter)?.name ?? "selected"}”` : null,
    overdueOnly ? "overdue only" : null,
  ]
    .filter(Boolean)
    .join(", ");

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
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Assignments</p>
          <p className="tnum text-xl font-semibold text-ink">{total}</p>
        </Card>
        <Card className="p-3">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Complete</p>
          <p className="tnum text-xl font-semibold text-positive">{done}</p>
        </Card>
        <Card className="p-3">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Outstanding</p>
          <p className="tnum text-xl font-semibold text-ink">{total - done}</p>
        </Card>
        <Card className="p-3">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Overdue</p>
          <p className="tnum text-xl font-semibold text-destructive">{overdue}</p>
        </Card>
      </div>

      <div className="mb-4 flex flex-wrap items-end gap-3">
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

        <form action={remindOutstandingAction} className="ml-auto space-y-1 text-right">
          <input type="hidden" name="slug" value={slug} />
          {outstanding.map((a) => (
            <input key={a.id} type="hidden" name="assignment_ids" value={a.id} />
          ))}
          <p className="text-xs text-muted-foreground">
            {uniqueRecipients === 0
              ? "No outstanding recipients in the current filters."
              : `Will email ${uniqueRecipients} speaker${uniqueRecipients === 1 ? "" : "s"}${
                  filterScope ? ` (${filterScope})` : " matching the current filters"
                }.`}
          </p>
          {uniqueRecipients === 0 ? (
            <Button type="submit" variant="primary" size="sm" disabled>
              Send reminder to everyone outstanding
            </Button>
          ) : (
            <ConfirmSubmit
              message={`Send reminder emails to ${uniqueRecipients} speaker${
                uniqueRecipients === 1 ? "" : "s"
              } with outstanding work${filterScope ? ` under ${filterScope}` : ""}?`}
              variant="primary"
              size="sm"
            >
              Send reminder to everyone outstanding
            </ConfirmSubmit>
          )}
        </form>
      </div>

      <div
        className="overflow-auto rounded-card border border-rule bg-paper"
        role="region"
        aria-label="Deliverables matrix"
        tabIndex={0}
      >
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr>
              <Th className="sticky left-0 top-0 z-30 border-b border-r border-rule bg-paper-2 shadow-[2px_0_0_0_var(--color-rule)]">
                Speaker
              </Th>
              {shownTasks.map((task) => (
                <Th
                  key={task.id}
                  className="sticky top-0 z-20 min-w-40 border-b border-rule bg-paper-2 shadow-[0_2px_0_0_var(--color-rule)]"
                >
                  {task.name}
                  <span className="block text-[10px] font-normal normal-case text-muted-foreground">
                    {task.type.replace("_", " ")}
                  </span>
                </Th>
              ))}
              <Th className="sticky top-0 z-20 border-b border-rule bg-paper-2 shadow-[0_2px_0_0_var(--color-rule)]">
                Progress
              </Th>
            </tr>
          </thead>
          <tbody>
            {speakers.map((speaker) => {
              const row = shownTasks.map((task) => byKey.get(`${speaker.id}:${task.id}`));
              const rowDone = row.filter((a) => a && isComplete(a.status)).length;
              const rowTotal = row.filter(Boolean).length;
              return (
                <tr key={speaker.id} className="group/row">
                  <Td className="sticky left-0 z-10 border-r border-rule bg-paper shadow-[2px_0_0_0_var(--color-rule)] group-hover/row:bg-paper-2">
                    <div className="flex items-center gap-2">
                      <Avatar src={speaker.headshot_url} name={contactName(speaker)} size={26} />
                      <Link
                        href={`/admin/e/${slug}/speakers/${speaker.id}`}
                        className="font-medium text-ink hover:underline"
                      >
                        {contactName(speaker)}
                      </Link>
                    </div>
                  </Td>
                  {shownTasks.map((task) => {
                    const assignment = byKey.get(`${speaker.id}:${task.id}`);
                    if (!assignment) {
                      return (
                        <Td key={task.id} className="text-center text-xs text-muted-foreground">
                          not assigned
                        </Td>
                      );
                    }
                    const complete = isComplete(assignment.status);
                    const overdueCell = isOverdue(assignment);
                    return (
                      <Td key={task.id} className="align-top focus-within:bg-paper-2">
                        <Chip
                          tone={complete ? "green" : overdueCell ? "red" : "slate"}
                        >
                          {complete
                            ? assignment.upload_count
                              ? `Uploaded (${assignment.upload_count})`
                              : "Complete"
                            : overdueCell
                              ? "Overdue"
                              : "Outstanding"}
                        </Chip>
                        <span className="mt-1 block text-[11px] text-muted-foreground">
                          {effectiveDue(assignment)
                            ? `due ${formatDate(effectiveDue(assignment))}`
                            : "no due date"}
                        </span>
                        <details className="mt-1">
                          <summary
                            className={
                              overdueCell
                                ? "cursor-pointer text-[11px] font-medium text-ink underline decoration-rule-2 underline-offset-2"
                                : "cursor-pointer text-[11px] text-muted-foreground underline decoration-transparent underline-offset-2 hover:text-ink hover:decoration-rule-2 focus-visible:text-ink focus-visible:decoration-rule-2 group-focus-within/row:text-ink group-hover/row:text-ink"
                            }
                          >
                            Extend deadline
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
                    <span className="text-xs text-muted-foreground">
                      {rowDone}/{rowTotal}
                    </span>
                  </Td>
                </tr>
              );
            })}
            {!speakers.length ? (
              <tr>
                <Td colSpan={shownTasks.length + 2} className="py-8 text-center text-muted-foreground">
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
