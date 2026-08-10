import Link from "next/link";

import { requireOrganizer } from "@/lib/guards";
import { fullName } from "@/lib/auth";
import { all, get } from "@/lib/db";
import { countRoster } from "@/lib/repo/contacts";
import { listPlans, reviewerProgress } from "@/lib/repo/evaluations";
import { listAssignments } from "@/lib/repo/tasks";
import { statusCounts } from "@/lib/repo/submissions";
import { recentActivity } from "@/lib/repo/audit";
import { Card, CardHeader, Chip, LinkButton, Progress, Stat, Td, Th, Table } from "@/components/ui";
import {
  daysUntil,
  formatDate,
  formatEventDates,
  localToday,
  relativeStamp,
} from "@/lib/datetime";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps<"/admin/e/[slug]">) {
  const { slug } = await params;
  const { event } = await requireOrganizer(slug);
  return { title: `Dashboard · ${event.name}` };
}

export default async function DashboardPage({ params }: PageProps<"/admin/e/[slug]">) {
  const { slug } = await params;
  const { user, event } = await requireOrganizer(slug);
  const base = `/admin/e/${event.slug}`;

  const counts = statusCounts(event.id);
  const speakers = countRoster(event.id);
  const scheduled =
    get<{ n: number }>(
      "SELECT COUNT(*) AS n FROM submissions WHERE event_id = ? AND status = 'accepted' AND starts_at IS NOT NULL",
      event.id,
    )?.n ?? 0;
  const acceptedTotal =
    get<{ n: number }>(
      "SELECT COUNT(*) AS n FROM submissions WHERE event_id = ? AND status = 'accepted'",
      event.id,
    )?.n ?? 0;
  const outstandingTasks = listAssignments(event.id, { status: "outstanding" });
  const overdueTasks = listAssignments(event.id, { overdue: true });

  const needSlot = acceptedTotal - scheduled;
  const awaitingDecision = counts.pending + counts.accept_queue + counts.decline_queue;
  const missingProfile =
    get<{ n: number }>(
      `SELECT COUNT(DISTINCT c.id) AS n
         FROM contacts c
         JOIN submission_participants sp ON sp.contact_id = c.id
         JOIN submissions s ON s.id = sp.submission_id
        WHERE s.event_id = ? AND s.status = 'accepted'
          AND (c.biography IS NULL OR c.biography = '' OR c.headshot_url IS NULL)`,
      event.id,
    )?.n ?? 0;
  const overdueSpeakers = new Set(overdueTasks.map((t) => t.contact_id)).size;
  const plans = listPlans(event.id);
  const laggingReviewers = plans
    .flatMap((plan) => reviewerProgress(plan.id))
    .filter((row) => row.assigned > row.complete);

  const countdown = daysUntil(event.starts_at);
  const nudges = [
    needSlot > 0 && {
      text: `${needSlot} accepted ${needSlot === 1 ? "session still needs" : "sessions still need"} a time slot on the agenda`,
      href: `${base}/agenda`,
      tone: "amber" as const,
    },
    awaitingDecision > 0 && {
      text: `${awaitingDecision} submissions are awaiting a decision`,
      href: `${base}/submissions?status=pending`,
      tone: "blue" as const,
    },
    missingProfile > 0 && {
      text: `${missingProfile} accepted speakers are missing a bio or headshot`,
      href: `${base}/speakers`,
      tone: "amber" as const,
    },
    overdueSpeakers > 0 && {
      text: `${overdueSpeakers} speakers have overdue onboarding tasks`,
      href: `${base}/tasks/deliverables?overdue=1`,
      tone: "red" as const,
    },
    laggingReviewers.length > 0 && {
      text: `${laggingReviewers.length} reviewers have not finished their assigned reviews`,
      href: `${base}/evaluation`,
      tone: "violet" as const,
    },
  ].filter(Boolean) as Array<{ text: string; href: string; tone: "amber" | "blue" | "red" | "violet" }>;

  const pacing = all<{ day: string; n: number }>(
    `SELECT substr(created_at, 1, 10) AS day, COUNT(*) AS n
       FROM submissions WHERE event_id = ?
      GROUP BY day ORDER BY day DESC LIMIT 14`,
    event.id,
  ).reverse();
  const maxPacing = Math.max(1, ...pacing.map((p) => p.n));

  const readiness = all<{
    contact_id: string;
    name: string;
    total: number;
    done: number;
    overdue: number;
  }>(
    `SELECT c.id AS contact_id, c.first_name || ' ' || c.last_name AS name,
            COUNT(ta.id) AS total,
            SUM(CASE WHEN ta.status IN ('complete','approved') THEN 1 ELSE 0 END) AS done,
            SUM(CASE WHEN ta.status NOT IN ('complete','approved')
                      AND COALESCE(ta.extended_due_at, ta.due_at) < ? THEN 1 ELSE 0 END) AS overdue
       FROM task_assignments ta
       JOIN contacts c ON c.id = ta.contact_id
      WHERE ta.event_id = ?
      GROUP BY c.id
      ORDER BY (CAST(SUM(CASE WHEN ta.status IN ('complete','approved') THEN 1 ELSE 0 END) AS REAL) /
                MAX(COUNT(ta.id),1)) ASC
      LIMIT 8`,
    localToday(),
    event.id,
  );

  const activity = recentActivity(event.id, 6);

  return (
    <div>
      <div className="mb-6">
        <p className="text-sm text-slate-500">{formatDate(localToday(), { weekday: true })}</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
          Good to see you, {fullName(user).split(" ")[0]}
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          {event.name} · {formatEventDates(event.starts_at, event.ends_at)}
          {countdown !== null ? (
            <>
              {" · "}
              <strong className="text-slate-800">
                {countdown > 0 ? `${countdown} days to go` : countdown === 0 ? "Today!" : "Wrapped"}
              </strong>
            </>
          ) : null}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Submissions" value={counts.all} href={`${base}/submissions`} />
        <Stat
          label="Accepted speakers"
          value={speakers}
          href={`${base}/speakers`}
          tone="green"
        />
        <Stat
          label="Sessions scheduled"
          value={`${scheduled}/${acceptedTotal}`}
          href={`${base}/agenda`}
        />
        <Stat
          label="Tasks outstanding"
          value={outstandingTasks.length}
          hint={overdueTasks.length ? `${overdueTasks.length} overdue` : "nothing overdue"}
          href={`${base}/tasks/deliverables`}
          tone={overdueTasks.length ? "red" : undefined}
        />
      </div>

      <section className="mt-6">
        <h2 className="mb-2 text-sm font-semibold text-slate-900">Submission status</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          {[
            { label: "Accepted", key: "accepted", tone: "green" as const },
            { label: "Pending", key: "pending", tone: "violet" as const },
            { label: "Declined", key: "declined", tone: "red" as const },
            { label: "Drafts", key: "draft", tone: "slate" as const },
            { label: "Withdrawn", key: "withdrawn", tone: "slate" as const },
          ].map((item) => (
            <Link
              key={item.key}
              href={`${base}/submissions?status=${item.key}`}
              className="rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm hover:border-brand-300"
            >
              <Chip tone={item.tone}>{item.label}</Chip>
              <p className="mt-2 text-xl font-semibold text-slate-900">{counts[item.key] ?? 0}</p>
            </Link>
          ))}
        </div>
      </section>

      {nudges.length ? (
        <section className="mt-6">
          <h2 className="mb-2 text-sm font-semibold text-slate-900">Also check</h2>
          <ul className="grid gap-2 md:grid-cols-2">
            {nudges.map((nudge) => (
              <li key={nudge.href + nudge.text}>
                <Link
                  href={nudge.href}
                  className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm hover:border-brand-300"
                >
                  <span className="text-slate-700">{nudge.text}</span>
                  <Chip tone={nudge.tone}>Resolve →</Chip>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader
            title="Submission pacing"
            description="Submissions received per day"
            actions={<LinkButton href={`${base}/submissions`} size="sm">View all</LinkButton>}
          />
          <div className="flex h-40 items-end gap-1 px-4 py-4">
            {pacing.length ? (
              pacing.map((point) => (
                <div key={point.day} className="flex flex-1 flex-col items-center gap-1">
                  <div
                    className="w-full rounded-t bg-brand-500"
                    style={{ height: `${(point.n / maxPacing) * 100}%`, minHeight: 4 }}
                    title={`${point.n} on ${point.day}`}
                  />
                  <span className="text-[10px] text-slate-400">{point.day.slice(8)}</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500">No submissions yet.</p>
            )}
          </div>
        </Card>

        <Card>
          <CardHeader
            title="Reviewer progress"
            description="Assigned versus completed reviews"
            actions={<LinkButton href={`${base}/evaluation`} size="sm">Evaluation</LinkButton>}
          />
          <div className="space-y-3 px-4 py-4">
            {plans.flatMap((plan) => reviewerProgress(plan.id)).length ? (
              plans
                .flatMap((plan) => reviewerProgress(plan.id))
                .slice(0, 6)
                .map((row) => (
                  <div key={`${row.round_id}-${row.user_id}`}>
                    <div className="flex justify-between text-xs text-slate-600">
                      <span>
                        {row.first_name} {row.last_name}{" "}
                        <span className="text-slate-400">· {row.round_name}</span>
                      </span>
                      <span>
                        {row.complete}/{row.assigned}
                      </span>
                    </div>
                    <div className="mt-1">
                      <Progress value={row.complete} max={Math.max(row.assigned, 1)} />
                    </div>
                  </div>
                ))
            ) : (
              <p className="text-sm text-slate-500">No reviewers assigned yet.</p>
            )}
          </div>
        </Card>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader
            title="Speaker readiness"
            description="Onboarding completion, least complete first"
            actions={
              <LinkButton href={`${base}/tasks/deliverables`} size="sm">
                Deliverables
              </LinkButton>
            }
          />
          {readiness.length ? (
            <Table className="rounded-none border-0">
              <thead>
                <tr>
                  <Th>Speaker</Th>
                  <Th>Complete</Th>
                  <Th>Progress</Th>
                  <Th>Overdue</Th>
                </tr>
              </thead>
              <tbody>
                {readiness.map((row) => (
                  <tr key={row.contact_id}>
                    <Td>
                      <Link
                        href={`${base}/speakers/${row.contact_id}`}
                        className="font-medium text-slate-800 hover:text-brand-700"
                      >
                        {row.name}
                      </Link>
                    </Td>
                    <Td>
                      {row.done}/{row.total}
                    </Td>
                    <Td className="w-40">
                      <Progress value={row.done} max={Math.max(row.total, 1)} />
                    </Td>
                    <Td>
                      {row.overdue ? (
                        <Chip tone="red">{row.overdue} overdue</Chip>
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <p className="px-4 py-6 text-sm text-slate-500">No onboarding tasks assigned yet.</p>
          )}
        </Card>

        <Card>
          <CardHeader title="Recent activity" />
          <ul className="divide-y divide-slate-100">
            {activity.length ? (
              activity.map((entry) => (
                <li key={entry.id} className="px-4 py-2.5 text-sm">
                  <p className="text-slate-700">{entry.summary ?? entry.action}</p>
                  <p className="text-xs text-slate-400">
                    {entry.actor_name} · {relativeStamp(entry.created_at)}
                  </p>
                </li>
              ))
            ) : (
              <li className="px-4 py-6 text-sm text-slate-500">Nothing yet.</li>
            )}
          </ul>
        </Card>
      </div>
    </div>
  );
}
