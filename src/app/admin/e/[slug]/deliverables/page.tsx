import Link from "next/link";
import { and, asc, eq } from "drizzle-orm";
import { requireEventRole } from "@/lib/auth/guards";
import { getDb, schema } from "@/lib/db";
import { Card, CardBody, CardHeader } from "@/components/ui/card";

function effectiveDue(assignment: {
  dueAt: string | null;
  extendedDueAt: string | null;
}) {
  return assignment.extendedDueAt ?? assignment.dueAt;
}

function cellStatus(assignment: {
  dueAt: string | null;
  extendedDueAt: string | null;
  status: string;
}) {
  const due = effectiveDue(assignment);
  const overdue =
    assignment.status !== "complete" &&
    assignment.status !== "approved" &&
    due &&
    new Date(due) < new Date();

  if (assignment.status === "complete" || assignment.status === "approved") {
    return { label: "✓", className: "bg-emerald-50 text-emerald-700", title: "Complete" };
  }
  if (overdue) {
    return { label: "!", className: "bg-rose-50 text-rose-700", title: "Overdue" };
  }
  if (assignment.status === "in_progress") {
    return { label: "…", className: "bg-blue-50 text-blue-700", title: "In progress" };
  }
  return { label: "—", className: "bg-slate-50 text-slate-500", title: "Not started" };
}

export default async function DeliverablesPage({
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
    .orderBy(asc(schema.tasks.name))
    .all();

  const speakers = db
    .select({
      contact: schema.contacts,
      eventContact: schema.eventContacts,
    })
    .from(schema.eventContacts)
    .innerJoin(schema.contacts, eq(schema.eventContacts.contactId, schema.contacts.id))
    .where(eq(schema.eventContacts.eventId, event.id))
    .orderBy(schema.contacts.lastName, schema.contacts.firstName)
    .all();

  const assignments = db
    .select()
    .from(schema.taskAssignments)
    .where(eq(schema.taskAssignments.eventId, event.id))
    .all();

  const assignmentMap = new Map<string, (typeof assignments)[0]>();
  for (const a of assignments) {
    if (a.contactId) {
      assignmentMap.set(`${a.contactId}:${a.taskId}`, a);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Deliverables</h1>
        <p className="text-slate-600">
          Speaker × task matrix — completion status and overdue items.
        </p>
      </div>

      <div className="flex flex-wrap gap-4 text-xs text-slate-600">
        <span className="flex items-center gap-1">
          <span className="inline-flex h-5 w-5 items-center justify-center rounded bg-emerald-50 text-emerald-700">
            ✓
          </span>
          Complete
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-flex h-5 w-5 items-center justify-center rounded bg-rose-50 text-rose-700">
            !
          </span>
          Overdue
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-flex h-5 w-5 items-center justify-center rounded bg-blue-50 text-blue-700">
            …
          </span>
          In progress
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-flex h-5 w-5 items-center justify-center rounded bg-slate-50 text-slate-500">
            —
          </span>
          Not started / not assigned
        </span>
      </div>

      <Card>
        <CardHeader
          title="Matrix"
          subtitle={`${speakers.length} speakers × ${tasks.length} tasks`}
        />
        <CardBody className="overflow-x-auto p-0">
          {tasks.length === 0 || speakers.length === 0 ? (
            <p className="p-5 text-sm text-slate-500">
              Add speakers and tasks to see the deliverables matrix.
            </p>
          ) : (
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="sticky left-0 z-10 bg-slate-50 px-3 py-2">Speaker</th>
                  {tasks.map((t) => (
                    <th
                      key={t.id}
                      className="max-w-[8rem] truncate px-2 py-2"
                      title={t.name}
                    >
                      {t.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {speakers.map(({ contact, eventContact }) => (
                  <tr key={contact.id} className="border-t border-slate-100">
                    <td className="sticky left-0 z-10 bg-white px-3 py-2">
                      <Link
                        href={`/admin/e/${slug}/speakers/${contact.id}`}
                        className="font-medium text-blue-700 hover:underline"
                      >
                        {contact.firstName} {contact.lastName}
                      </Link>
                      <div className="text-xs text-slate-500">
                        {eventContact.speakerStatus}
                      </div>
                    </td>
                    {tasks.map((task) => {
                      const assignment = assignmentMap.get(`${contact.id}:${task.id}`);
                      if (!assignment) {
                        return (
                          <td key={task.id} className="px-2 py-2 text-center">
                            <span
                              className="inline-flex h-6 w-6 items-center justify-center rounded text-xs text-slate-300"
                              title="Not assigned"
                            >
                              ·
                            </span>
                          </td>
                        );
                      }
                      const cell = cellStatus(assignment);
                      const due = effectiveDue(assignment);
                      return (
                        <td key={task.id} className="px-2 py-2 text-center">
                          <span
                            className={`inline-flex h-6 w-6 items-center justify-center rounded text-xs font-medium ${cell.className}`}
                            title={`${cell.title}${due ? ` · Due ${new Date(due).toLocaleDateString()}` : ""}`}
                          >
                            {cell.label}
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
