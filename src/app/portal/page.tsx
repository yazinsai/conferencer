import Link from "next/link";

import { requirePortalUser } from "@/lib/guards";
import { get } from "@/lib/db";
import { contactName, linkContactToUser, portalContact } from "@/lib/repo/contacts";
import { submissionsForContact } from "@/lib/repo/submissions";
import { speakerFacingStatus, statusTone } from "@/lib/status";
import { effectiveDue, isComplete, isOverdue, listAssignments } from "@/lib/repo/tasks";
import { Avatar, Card, CardHeader, Chip, LinkButton, Progress } from "@/components/ui";
import { formatDate, formatRange } from "@/lib/datetime";

export const metadata = { title: "Speaker portal" };
export const dynamic = "force-dynamic";

export default async function PortalHome() {
  const { user, event } = await requirePortalUser();
  const contact = portalContact(event, user) ?? linkContactToUser(event, user);
  const submissions = submissionsForContact(event.id, contact.id);
  const assignments = listAssignments(event.id, { contactId: contact.id });
  const done = assignments.filter((a) => isComplete(a.status)).length;
  const portal = get<{ welcome_message: string | null }>(
    "SELECT welcome_message FROM portals WHERE event_id = ? ORDER BY is_default DESC LIMIT 1",
    event.id,
  );

  const accepted = submissions.filter((s) => s.status === "accepted");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          Welcome, {contact.first_name || contactName(contact)}
        </h1>
        {portal?.welcome_message ? (
          <div
            className="prose-cf mt-2 text-sm text-slate-600"
            dangerouslySetInnerHTML={{ __html: portal.welcome_message }}
          />
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            My submissions
          </p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">{submissions.length}</p>
          <p className="text-xs text-slate-500">{accepted.length} accepted</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Tasks</p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">
            {done}/{assignments.length}
          </p>
          <div className="mt-2">
            <Progress value={done} max={Math.max(assignments.length, 1)} />
          </div>
        </Card>
        <Card className="p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Event</p>
          <p className="mt-1 text-sm font-semibold text-slate-900">{event.name}</p>
          <p className="text-xs text-slate-500">
            {formatDate(event.starts_at)} · {event.location}
          </p>
        </Card>
      </div>

      <Card>
        <CardHeader
          title="My Submissions"
          description="Everything you have submitted or been added to."
          actions={
            <LinkButton href="/portal/submissions" size="sm">
              View all
            </LinkButton>
          }
        />
        <ul className="divide-y divide-slate-100">
          {submissions.length ? (
            submissions.map((submission) => (
              <li key={submission.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                <div className="min-w-0">
                  <Link
                    href={`/portal/submissions/${submission.id}`}
                    className="font-medium text-slate-900 hover:text-brand-700"
                  >
                    {submission.title}
                  </Link>
                  <p className="text-xs text-slate-500">
                    {submission.format_name ?? "—"}
                    {submission.track_name ? ` · ${submission.track_name}` : ""}
                    {submission.pub_starts_at
                      ? ` · ${formatRange(submission.pub_starts_at, submission.pub_ends_at)}`
                      : ""}
                  </p>
                </div>
                <Chip tone={statusTone(submission.status)}>
                  {speakerFacingStatus(submission.status)}
                </Chip>
              </li>
            ))
          ) : (
            <li className="px-4 py-6 text-sm text-slate-500">
              You have not submitted anything yet.{" "}
              <Link href={`/e/${event.slug}/submit`} className="font-medium text-brand-700 hover:underline">
                Submit a talk
              </Link>
            </li>
          )}
        </ul>
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader
            title="My tasks"
            description="Your onboarding checklist."
            actions={
              <LinkButton href="/portal/tasks" size="sm">
                All tasks
              </LinkButton>
            }
          />
          <ul className="divide-y divide-slate-100">
            {assignments.slice(0, 6).map((assignment) => (
              <li key={assignment.id} className="flex items-center justify-between gap-3 px-4 py-2.5">
                <div>
                  <Link
                    href={`/portal/tasks/${assignment.id}`}
                    className="text-sm font-medium text-slate-800 hover:text-brand-700"
                  >
                    {assignment.task_name}
                  </Link>
                  <p className="text-xs text-slate-500">
                    {effectiveDue(assignment) ? `Due ${formatDate(effectiveDue(assignment))}` : "No due date"}
                    {assignment.is_required ? " · Required" : ""}
                  </p>
                </div>
                <Chip
                  tone={
                    isComplete(assignment.status)
                      ? "green"
                      : isOverdue(assignment)
                        ? "red"
                        : "slate"
                  }
                >
                  {isComplete(assignment.status)
                    ? "Complete"
                    : isOverdue(assignment)
                      ? "Overdue"
                      : "To do"}
                </Chip>
              </li>
            ))}
            {!assignments.length ? (
              <li className="px-4 py-6 text-sm text-slate-500">
                No tasks assigned yet. They appear here once a submission is accepted.
              </li>
            ) : null}
          </ul>
        </Card>

        <Card>
          <CardHeader
            title="My profile"
            actions={
              <LinkButton href="/portal/profile" size="sm">
                Edit
              </LinkButton>
            }
          />
          <div className="p-4">
            <div className="flex items-center gap-3">
              <Avatar src={contact.headshot_url} name={contactName(contact)} size={56} />
              <div>
                <p className="font-medium text-slate-900">{contactName(contact)}</p>
                <p className="text-xs text-slate-500">
                  {[contact.job_title, contact.company].filter(Boolean).join(", ") || "Add your title"}
                </p>
              </div>
            </div>
            <p className="mt-3 line-clamp-4 text-sm text-slate-600">
              {contact.biography
                ? contact.biography.replace(/<[^>]*>/g, " ").slice(0, 220)
                : "Add a biography so attendees know who you are."}
            </p>
            {!contact.headshot_url || !contact.biography ? (
              <p className="mt-3 rounded-md bg-amber-50 px-2 py-1.5 text-xs text-amber-800">
                Your profile is incomplete — add {(!contact.headshot_url ? "a headshot" : "")}
                {!contact.headshot_url && !contact.biography ? " and " : ""}
                {(!contact.biography ? "a biography" : "")}.
              </p>
            ) : null}
          </div>
        </Card>
      </div>
    </div>
  );
}
