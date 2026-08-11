import Link from "next/link";

import { requirePortalUser } from "@/lib/guards";
import { get } from "@/lib/db";
import { contactName, linkContactToUser, portalContact } from "@/lib/repo/contacts";
import { submissionsForContact } from "@/lib/repo/submissions";
import { speakerFacingStatus, statusTone } from "@/lib/status";
import { effectiveDue, isComplete, isOverdue, listAssignments } from "@/lib/repo/tasks";
import { Avatar, Card, CardHeader, Chip, LinkButton, Progress, Stat } from "@/components/ui";
import { formatDate, formatRange } from "@/lib/datetime";

export const metadata = { title: "Speaker portal" };
export const dynamic = "force-dynamic";

export default async function PortalHome() {
  const { user, event } = await requirePortalUser();
  const contact = portalContact(event, user) ?? linkContactToUser(event, user);
  const submissions = submissionsForContact(event.id, contact.id);
  const assignments = listAssignments(event.id, { contactId: contact.id });
  const done = assignments.filter((a) => isComplete(a.status)).length;
  const overdue = assignments.filter((a) => isOverdue(a)).length;
  const portal = get<{ welcome_message: string | null }>(
    "SELECT welcome_message FROM portals WHERE event_id = ? ORDER BY is_default DESC LIMIT 1",
    event.id,
  );

  const accepted = submissions.filter((s) => s.status === "accepted");
  const openTasks = assignments
    .filter((a) => !isComplete(a.status))
    .sort((a, b) => {
      const aOver = isOverdue(a) ? 0 : 1;
      const bOver = isOverdue(b) ? 0 : 1;
      if (aOver !== bOver) return aOver - bOver;
      const aDue = effectiveDue(a) ?? "9999";
      const bDue = effectiveDue(b) ?? "9999";
      return aDue.localeCompare(bDue);
    });
  const taskPreview = [...openTasks, ...assignments.filter((a) => isComplete(a.status))].slice(
    0,
    6,
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="display text-xl text-ink sm:text-2xl">
          Welcome, {contact.first_name || contactName(contact)}
        </h1>
        {portal?.welcome_message ? (
          <div
            className="prose-cf mt-2 max-w-2xl text-sm text-neutral"
            dangerouslySetInnerHTML={{ __html: portal.welcome_message }}
          />
        ) : null}
      </div>

      {/* Stat-Led: task progress owns the fold; submissions and event qualify it. */}
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)]">
        <div className="rounded-card border border-rule bg-card p-5 shadow-[var(--shadow-card)]">
          <p className="wordmark text-[0.6875rem] uppercase tracking-[0.1em] text-muted-foreground">
            Tasks complete
          </p>
          <p className="wordmark tnum mt-2 text-3xl font-medium tracking-[-0.02em] text-ink">
            {assignments.length ? (
              <>
                {done}
                <span className="text-muted-foreground">/{assignments.length}</span>
              </>
            ) : (
              "—"
            )}
          </p>
          <div className="mt-3">
            <Progress value={done} max={Math.max(assignments.length, 1)} />
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            {assignments.length
              ? overdue
                ? `${overdue} overdue · finish these before the event`
                : done === assignments.length
                  ? "All assigned tasks are complete"
                  : `${assignments.length - done} still open`
              : "No tasks assigned yet — they appear once a submission is accepted"}
          </p>
        </div>
        <Stat
          label="My submissions"
          value={submissions.length}
          hint={`${accepted.length} accepted`}
          href="/portal/submissions"
        />
        <Stat
          label="Event"
          value={formatDate(event.starts_at)}
          hint={event.location || event.name}
        />
      </div>

      <Card>
        <CardHeader
          title="My tasks"
          description="Your onboarding checklist — complete these first."
          actions={
            <LinkButton href="/portal/tasks" size="sm">
              All tasks
            </LinkButton>
          }
        />
        <ul className="divide-y divide-rule">
          {taskPreview.map((assignment) => (
            <li key={assignment.id} className="flex items-center justify-between gap-3 px-4 py-2.5">
              <div className="min-w-0">
                <Link
                  href={`/portal/tasks/${assignment.id}`}
                  className="text-sm font-medium text-ink hover:text-signal"
                >
                  {assignment.task_name}
                </Link>
                <p className="tnum text-xs text-muted-foreground">
                  {effectiveDue(assignment)
                    ? `Due ${formatDate(effectiveDue(assignment))}`
                    : "No due date"}
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
            <li className="px-4 py-6 text-sm text-muted-foreground">
              No tasks assigned yet. They appear here once a submission is accepted.
            </li>
          ) : null}
        </ul>
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader
            title="My submissions"
            description="Everything you have submitted or been added to."
            actions={
              <LinkButton href="/portal/submissions" size="sm">
                View all
              </LinkButton>
            }
          />
          <ul className="divide-y divide-rule">
            {submissions.length ? (
              submissions.map((submission) => (
                <li
                  key={submission.id}
                  className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
                >
                  <div className="min-w-0">
                    <Link
                      href={`/portal/submissions/${submission.id}`}
                      className="font-medium text-ink hover:text-signal"
                    >
                      {submission.title}
                    </Link>
                    <p className="text-xs text-muted-foreground">
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
              <li className="px-4 py-6 text-sm text-muted-foreground">
                You have not submitted anything yet.{" "}
                <Link
                  href={`/e/${event.slug}/submit`}
                  className="font-medium text-signal hover:underline"
                >
                  Submit a talk
                </Link>
              </li>
            )}
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
                <p className="font-medium text-ink">{contactName(contact)}</p>
                <p className="text-xs text-muted-foreground">
                  {[contact.job_title, contact.company].filter(Boolean).join(", ") ||
                    "Add your title"}
                </p>
              </div>
            </div>
            <p className="mt-3 line-clamp-4 text-sm text-neutral">
              {contact.biography
                ? contact.biography.replace(/<[^>]*>/g, " ").slice(0, 220)
                : "Add a biography so attendees know who you are."}
            </p>
            {!contact.headshot_url || !contact.biography ? (
              <p className="mt-3 rounded-input bg-warn-soft px-2 py-1.5 text-xs text-warn">
                Your profile is incomplete — add {!contact.headshot_url ? "a headshot" : ""}
                {!contact.headshot_url && !contact.biography ? " and " : ""}
                {!contact.biography ? "a biography" : ""}.
              </p>
            ) : null}
          </div>
        </Card>
      </div>
    </div>
  );
}
