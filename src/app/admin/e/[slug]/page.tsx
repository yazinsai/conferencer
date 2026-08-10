import Link from "next/link";
import { and, count, eq, sql } from "drizzle-orm";
import { requireEventRole } from "@/lib/auth/guards";
import { getDb, schema } from "@/lib/db";
import { dashboardStats, submissionStatusCounts } from "@/lib/db/queries";
import { daysUntil } from "@/lib/dates";
import { Card, CardBody, CardHeader } from "@/components/ui/card";

export default async function AdminDashboardPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { user, event } = await requireEventRole(slug, ["organizer"]);
  const stats = dashboardStats(event.id);
  const statusCounts = submissionStatusCounts(event.id);
  const db = getDb();

  const unscheduled = db
    .select({ c: count() })
    .from(schema.submissions)
    .where(
      and(
        eq(schema.submissions.eventId, event.id),
        eq(schema.submissions.status, "accepted"),
        sql`${schema.submissions.startsAt} is null`,
      ),
    )
    .get()?.c;
  const awaitingDecision = db
    .select({ c: count() })
    .from(schema.submissions)
    .where(
      and(
        eq(schema.submissions.eventId, event.id),
        eq(schema.submissions.status, "pending"),
      ),
    )
    .get()?.c;
  const missingBio = db
    .select({ c: count() })
    .from(schema.contacts)
    .innerJoin(
      schema.eventContacts,
      eq(schema.eventContacts.contactId, schema.contacts.id),
    )
    .where(
      and(
        eq(schema.eventContacts.eventId, event.id),
        eq(schema.eventContacts.speakerStatus, "confirmed"),
        sql`(${schema.contacts.biography} is null or ${schema.contacts.biography} = '' or ${schema.contacts.headshotUrl} is null)`,
      ),
    )
    .get()?.c;
  const overdueTasks = db
    .select({ c: count() })
    .from(schema.taskAssignments)
    .where(
      and(
        eq(schema.taskAssignments.eventId, event.id),
        sql`${schema.taskAssignments.status} != 'complete'`,
        sql`${schema.taskAssignments.dueAt} < datetime('now')`,
      ),
    )
    .get()?.c;
  const unfinishedReviews = db
    .select({ c: count() })
    .from(schema.evaluationAssignments)
    .innerJoin(
      schema.evaluationRounds,
      eq(schema.evaluationAssignments.roundId, schema.evaluationRounds.id),
    )
    .innerJoin(
      schema.evaluationPlans,
      eq(schema.evaluationRounds.planId, schema.evaluationPlans.id),
    )
    .where(
      and(
        eq(schema.evaluationPlans.eventId, event.id),
        eq(schema.evaluationAssignments.status, "pending"),
      ),
    )
    .get()?.c;

  const nudges = [
    {
      text: `${Number(unscheduled ?? 0)} accepted sessions still need a time slot on the agenda`,
      href: `/admin/e/${slug}/agenda`,
      show: Number(unscheduled ?? 0) > 0,
    },
    {
      text: `${Number(awaitingDecision ?? 0)} session submissions are awaiting a decision`,
      href: `/admin/e/${slug}/submissions?status=pending`,
      show: Number(awaitingDecision ?? 0) > 0,
    },
    {
      text: `${Number(missingBio ?? 0)} accepted speakers are missing a bio or headshot`,
      href: `/admin/e/${slug}/speakers`,
      show: Number(missingBio ?? 0) > 0,
    },
    {
      text: `${Number(overdueTasks ?? 0)} speakers have overdue onboarding tasks`,
      href: `/admin/e/${slug}/deliverables`,
      show: Number(overdueTasks ?? 0) > 0,
    },
    {
      text: `${Number(unfinishedReviews ?? 0)} reviewers have not finished their assigned reviews`,
      href: `/admin/e/${slug}/evaluation`,
      show: Number(unfinishedReviews ?? 0) > 0,
    },
  ].filter((n) => n.show);

  const countdown = daysUntil(event.startsAt);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-slate-500">
          {new Date(event.startsAt).toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
            year: "numeric",
          })}{" "}
          · {event.location}
        </p>
        <h1 className="mt-1 text-2xl font-semibold">
          Good {greeting()}, {user.firstName}
        </h1>
        <p className="mt-1 text-slate-600">
          {countdown > 0
            ? `${countdown} days until ${event.name}`
            : countdown === 0
              ? `${event.name} is today`
              : `${event.name} has started`}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Submissions" value={stats.submissions} href={`/admin/e/${slug}/submissions`} />
        <Stat
          label="Accepted Speakers"
          value={stats.acceptedSpeakers}
          href={`/admin/e/${slug}/speakers`}
        />
        <Stat
          label="Sessions Scheduled"
          value={stats.sessionsScheduled}
          href={`/admin/e/${slug}/agenda`}
        />
        <Stat
          label="Tasks Outstanding"
          value={stats.tasksOutstanding}
          href={`/admin/e/${slug}/deliverables`}
        />
      </div>

      <Card>
        <CardHeader title="Submission Status" subtitle="Live counts" />
        <CardBody className="flex flex-wrap gap-2">
          {(
            [
              ["accepted", "Accepted"],
              ["pending", "Pending"],
              ["declined", "Declined"],
              ["draft", "Drafts"],
              ["withdrawn", "Withdrawn"],
              ["accept_queue", "Accept Queue"],
              ["decline_queue", "Decline Queue"],
            ] as const
          ).map(([key, label]) => (
            <Link
              key={key}
              href={`/admin/e/${slug}/submissions?status=${key}`}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm hover:bg-slate-50"
            >
              <span className="font-semibold">{statusCounts[key] ?? 0}</span>{" "}
              <span className="text-slate-600">{label}</span>
            </Link>
          ))}
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Also check" subtitle="Actionable prompts from live data" />
        <CardBody>
          {nudges.length === 0 ? (
            <p className="text-sm text-slate-600">You&apos;re caught up.</p>
          ) : (
            <ul className="space-y-2">
              {nudges.map((n) => (
                <li key={n.href + n.text}>
                  <Link href={n.href} className="text-sm font-medium text-blue-700 hover:underline">
                    {n.text} →
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </CardBody>
      </Card>
    </div>
  );
}

function Stat({
  label,
  value,
  href,
}: {
  label: string;
  value: number;
  href: string;
}) {
  return (
    <Link href={href} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:border-blue-300">
      <div className="text-sm text-slate-500">{label}</div>
      <div className="mt-1 text-3xl font-semibold">{value}</div>
    </Link>
  );
}

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 18) return "afternoon";
  return "evening";
}
