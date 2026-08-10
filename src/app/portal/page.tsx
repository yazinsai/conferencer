import Link from "next/link";
import { and, eq } from "drizzle-orm";
import { getSessionUser } from "@/lib/auth/session";
import { getDb, schema } from "@/lib/db";
import { getContactForUser, getDefaultEvent } from "@/lib/db/queries";
import { speakerFacingStatus, statusBadgeClass } from "@/lib/domain/status";
import { Badge } from "@/components/ui/badge";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { redirect } from "next/navigation";

export default async function PortalHomePage() {
  const user = await getSessionUser();
  if (!user) redirect("/sign-in?next=/portal");
  const event = getDefaultEvent();
  if (!event) redirect("/");
  const row = getContactForUser(event.id, user.id);
  const db = getDb();

  const submissions = row
    ? db
        .select({
          id: schema.submissions.id,
          title: schema.submissions.title,
          status: schema.submissions.status,
          formatId: schema.submissions.formatId,
        })
        .from(schema.submissions)
        .innerJoin(
          schema.submissionParticipants,
          eq(schema.submissionParticipants.submissionId, schema.submissions.id),
        )
        .where(
          and(
            eq(schema.submissions.eventId, event.id),
            eq(schema.submissionParticipants.contactId, row.contact.id),
          ),
        )
        .all()
    : [];

  const formats = db
    .select()
    .from(schema.formats)
    .where(eq(schema.formats.eventId, event.id))
    .all();
  const formatMap = Object.fromEntries(formats.map((f) => [f.id, f.name]));

  const tasks = row
    ? db
        .select({
          id: schema.taskAssignments.id,
          status: schema.taskAssignments.status,
          dueAt: schema.taskAssignments.dueAt,
          name: schema.tasks.name,
        })
        .from(schema.taskAssignments)
        .innerJoin(schema.tasks, eq(schema.taskAssignments.taskId, schema.tasks.id))
        .where(
          and(
            eq(schema.taskAssignments.eventId, event.id),
            eq(schema.taskAssignments.contactId, row.contact.id),
          ),
        )
        .all()
    : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Home</h1>
        <p className="text-slate-600">Your submissions, profile, and tasks.</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader
            title="My Submissions"
            actions={
              <Link href="/portal/submissions" className="text-sm text-blue-700">
                View all
              </Link>
            }
          />
          <CardBody className="space-y-3">
            {submissions.length === 0 ? (
              <p className="text-sm text-slate-500">No submissions yet.</p>
            ) : (
              submissions.map((s) => (
                <div key={s.id} className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-medium">{s.title}</div>
                    <div className="text-xs text-slate-500">
                      {s.formatId ? formatMap[s.formatId] : "—"}
                    </div>
                  </div>
                  <Badge className={statusBadgeClass(s.status)}>
                    {speakerFacingStatus(s.status)}
                  </Badge>
                </div>
              ))
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            title="My Profile"
            actions={
              <Link href="/portal/profile" className="text-sm text-blue-700">
                Edit
              </Link>
            }
          />
          <CardBody>
            {row ? (
              <div className="text-sm">
                <div className="font-medium">
                  {row.contact.firstName} {row.contact.lastName}
                </div>
                <div className="text-slate-600">
                  {[row.contact.jobTitle, row.contact.company].filter(Boolean).join(" · ")}
                </div>
                <p className="mt-2 line-clamp-3 text-slate-600">
                  {row.contact.biography || "No bio yet."}
                </p>
              </div>
            ) : (
              <p className="text-sm text-slate-500">
                Profile will be created when you submit or are invited.
              </p>
            )}
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader
          title="Tasks"
          actions={
            <Link href="/portal/tasks" className="text-sm text-blue-700">
              Open tasks
            </Link>
          }
        />
        <CardBody className="space-y-2">
          {tasks.slice(0, 6).map((t) => (
            <div key={t.id} className="flex items-center justify-between text-sm">
              <span>{t.name}</span>
              <span className="text-slate-500">{t.status.replace("_", " ")}</span>
            </div>
          ))}
          {tasks.length === 0 ? (
            <p className="text-sm text-slate-500">No tasks assigned.</p>
          ) : null}
        </CardBody>
      </Card>
    </div>
  );
}
