import { Suspense } from "react";
import Link from "next/link";

import { requireOrganizer } from "@/lib/guards";
import { fullName } from "@/lib/auth";
import { all, get } from "@/lib/db";
import { countRoster } from "@/lib/repo/contacts";
import { listPlans, reviewerProgress } from "@/lib/repo/evaluations";
import { listAssignments } from "@/lib/repo/tasks";
import { statusCounts } from "@/lib/repo/submissions";
import { recentActivity } from "@/lib/repo/audit";
import { DashboardPanels } from "@/components/admin/dashboard-panels";
import {
  DashboardPanelsSkeleton,
  RecentActivitySkeleton,
  SpeakerReadinessSkeleton,
} from "@/components/admin/loading-skeletons";
import {
  Card,
  CardHeader,
  Chip,
  cx,
  LinkButton,
  Progress,
  Td,
  Th,
  Table,
} from "@/components/ui";
import { Icon, type IconName } from "@/components/ui/icon";
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

export default async function DashboardPage({
  params,
  searchParams,
}: PageProps<"/admin/e/[slug]">) {
  const { slug } = await params;
  const sp = await searchParams;
  const panel = typeof sp.panel === "string" ? sp.panel : "forms";
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
  // Urgency first: overdue and decision-blocking, then quieter follow-ups.
  // The icon names the *kind* of thing needing attention; only actionable
  // exceptions keep semantic colour (design.md accent budget).
  const nudges = [
    overdueSpeakers > 0 && {
      text: `${overdueSpeakers} speakers have overdue onboarding tasks`,
      href: `${base}/tasks/deliverables?overdue=1`,
      tone: "red" as const,
      icon: "clock" as const,
      urgent: true,
    },
    awaitingDecision > 0 && {
      text: `${awaitingDecision} submissions are awaiting a decision`,
      href: `${base}/submissions?status=pending`,
      tone: "blue" as const,
      icon: "decision" as const,
      urgent: true,
    },
    needSlot > 0 && {
      text: `${needSlot} accepted ${needSlot === 1 ? "session still needs" : "sessions still need"} a time slot on the agenda`,
      href: `${base}/agenda`,
      tone: "amber" as const,
      icon: "agenda" as const,
      urgent: false,
    },
    missingProfile > 0 && {
      text: `${missingProfile} accepted speakers are missing a bio or headshot`,
      href: `${base}/speakers`,
      tone: "amber" as const,
      icon: "person" as const,
      urgent: false,
    },
    laggingReviewers.length > 0 && {
      text: `${laggingReviewers.length} reviewers have not finished their assigned reviews`,
      href: `${base}/evaluation`,
      tone: "violet" as const,
      icon: "evaluation" as const,
      urgent: false,
    },
  ].filter(Boolean) as Array<{
    text: string;
    href: string;
    tone: "amber" | "blue" | "red" | "violet";
    icon: IconName;
    urgent: boolean;
  }>;

  // Stat-Led hero: a real figure, never standing alone — the words beside it say
  // what the number means (see design.md § Macrostructure families).
  const lead =
    countdown === null
      ? { figure: String(counts.all), unit: counts.all === 1 ? "submission" : "submissions", line: `In the programme for ${event.name}.` }
      : countdown > 0
        ? {
            figure: String(countdown),
            unit: countdown === 1 ? "day" : "days",
            // The location already sits on the meta line below; repeating it here
            // pushes the headline onto three lines at 1280px.
            line: `Until ${event.name} opens.`,
          }
        : countdown === 0
          ? { figure: "Today", unit: "", line: `${event.name} starts this morning.` }
          : { figure: "Wrapped", unit: "", line: `${event.name} is over. The programme stays readable.` };

  return (
    <div>
      <section className="mb-9 grid gap-6 border-b border-rule pb-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] lg:items-end">
        <div className="min-w-0">
          <p className="flex items-baseline gap-3">
            <span className="wordmark tnum display text-display text-ink">{lead.figure}</span>
            {lead.unit ? (
              <span className="text-lg font-medium text-muted-foreground">{lead.unit}</span>
            ) : null}
          </p>
          <h1 className="display mt-2 max-w-xl text-xl text-ink-2 sm:text-2xl">{lead.line}</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            {formatEventDates(event.starts_at, event.ends_at)}
            {event.location ? ` · ${event.location}` : ""}
          </p>
        </div>

        <div className="min-w-0 lg:text-right">
          <p className="text-sm text-neutral">
            Good to see you, {fullName(user).split(" ")[0]}.
          </p>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {formatDate(localToday(), { weekday: true })}
          </p>
          <div className="mt-4 flex flex-wrap gap-2 lg:justify-end">
            <LinkButton href={`${base}/submissions`} variant="primary">
              Review submissions
            </LinkButton>
            <LinkButton href={`${base}/agenda`}>Open the agenda</LinkButton>
          </div>
        </div>
      </section>

      {/* T4 numbered stat strip — hairline-divided, tabular, every cell a link. */}
      <section aria-label="Programme at a glance">
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-card border border-rule bg-rule sm:grid-cols-4">
          {[
            { label: "Submissions", value: counts.all, hint: `${counts.pending} awaiting a decision`, href: `${base}/submissions`, tone: undefined },
            { label: "Accepted speakers", value: speakers, hint: `${acceptedTotal} accepted sessions`, href: `${base}/speakers`, tone: "green" as const },
            { label: "Sessions scheduled", value: `${scheduled}/${acceptedTotal}`, hint: needSlot > 0 ? `${needSlot} still need a slot` : "all placed", href: `${base}/agenda`, tone: undefined },
            {
              label: "Tasks outstanding",
              value: outstandingTasks.length,
              hint: overdueTasks.length ? `${overdueTasks.length} overdue` : "nothing overdue",
              href: `${base}/tasks/deliverables`,
              tone: overdueTasks.length ? ("red" as const) : undefined,
            },
          ].map((cell) => (
            <Link
              key={cell.label}
              href={cell.href}
              className="group bg-paper px-4 py-4 transition-colors duration-[120ms] ease-out hover:bg-paper-2"
            >
              <span className="wordmark block text-[0.6875rem] uppercase tracking-[0.12em] text-muted-foreground">
                {cell.label}
              </span>
              <span
                className={cx(
                  "wordmark tnum mt-2 block text-3xl font-medium tracking-[-0.02em]",
                  cell.tone === "green" && "text-positive",
                  cell.tone === "red" && "text-destructive",
                  !cell.tone && "text-ink",
                )}
              >
                {cell.value}
              </span>
              <span className="mt-1 block text-xs text-muted-foreground">{cell.hint}</span>
            </Link>
          ))}
        </div>
      </section>

      {nudges.length ? (
        <section className="mt-8" aria-label="Action queue">
          <h2 className="wordmark mb-1 text-[0.6875rem] uppercase tracking-[0.14em] text-muted-foreground">
            Also check
          </h2>
          <ul className="grid border-t border-rule md:grid-cols-2 md:gap-x-8">
            {nudges.map((nudge) => (
              <li key={nudge.href + nudge.text} className="border-b border-rule">
                <Link
                  href={nudge.href}
                  className="group flex items-center justify-between gap-4 py-3 text-sm transition-colors duration-[120ms] ease-out"
                >
                  <span className="flex min-w-0 items-center gap-2.5">
                    <Icon
                      name={nudge.icon}
                      size={17}
                      className={cx(
                        nudge.urgent && nudge.tone === "red" && "text-destructive",
                        nudge.urgent && nudge.tone === "blue" && "text-signal",
                        !nudge.urgent && "text-muted-foreground",
                      )}
                    />
                    <span
                      className={cx(
                        "group-hover:text-ink",
                        nudge.urgent ? "font-medium text-ink" : "text-neutral",
                      )}
                    >
                      {nudge.text}
                    </span>
                  </span>
                  <Icon
                    name="arrowRight"
                    size={15}
                    className="text-muted-foreground transition-transform duration-[120ms] ease-out group-hover:translate-x-0.5 group-hover:text-ink"
                  />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="mt-10">
        <h2 className="wordmark mb-3 text-[0.6875rem] uppercase tracking-[0.14em] text-muted-foreground">
          Submission status
        </h2>
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-card border border-rule bg-rule sm:grid-cols-5 [&>*:last-child]:col-span-2 sm:[&>*:last-child]:col-span-1">
          {[
            { label: "Accepted", key: "accepted", tone: "green" as const },
            { label: "Pending", key: "pending", tone: "blue" as const },
            { label: "Declined", key: "declined", tone: "red" as const },
            { label: "Drafts", key: "draft", tone: "slate" as const },
            { label: "Withdrawn", key: "withdrawn", tone: "slate" as const },
          ].map((item) => (
            <Link
              key={item.key}
              href={`${base}/submissions?status=${item.key}`}
              className="flex items-center justify-between gap-2 bg-paper px-4 py-3 transition-colors duration-[120ms] ease-out hover:bg-paper-2"
            >
              <Chip tone={item.tone}>{item.label}</Chip>
              <span className="wordmark tnum text-lg font-medium text-ink">
                {counts[item.key] ?? 0}
              </span>
            </Link>
          ))}
        </div>
      </section>

      <Suspense fallback={<DashboardPanelsSkeleton />}>
        <DashboardPanelsSlot
          slug={slug}
          eventId={event.id}
          tab={panel}
          eventStart={event.starts_at}
          eventEnd={event.ends_at}
        />
      </Suspense>

      {/* items-start: keep sparse Recent activity from stretching to match readiness */}
      <div className="mt-8 grid items-start gap-5 lg:grid-cols-3">
        <Suspense fallback={<SpeakerReadinessSkeleton />}>
          <SpeakerReadiness eventId={event.id} base={base} />
        </Suspense>
        <Suspense fallback={<RecentActivitySkeleton />}>
          <RecentActivity eventId={event.id} />
        </Suspense>
      </div>
    </div>
  );
}

async function DashboardPanelsSlot(props: {
  slug: string;
  eventId: string;
  tab: string;
  eventStart: string | null;
  eventEnd: string | null;
}) {
  return <DashboardPanels {...props} />;
}

async function SpeakerReadiness({ eventId, base }: { eventId: string; base: string }) {
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
    eventId,
  );

  return (
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
                    className="font-medium text-ink hover:text-signal"
                  >
                    {row.name}
                  </Link>
                </Td>
                <Td className="wordmark tnum text-ink-2">
                  {row.done}/{row.total}
                </Td>
                <Td className="w-40">
                  <Progress value={row.done} max={Math.max(row.total, 1)} />
                </Td>
                <Td>
                  {row.overdue ? (
                    <Chip tone="red">{row.overdue} overdue</Chip>
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      ) : (
        <p className="px-4 py-6 text-sm text-muted-foreground">No onboarding tasks assigned yet.</p>
      )}
    </Card>
  );
}

async function RecentActivity({ eventId }: { eventId: string }) {
  const activity = recentActivity(eventId, 6);

  return (
    <Card>
      <CardHeader title="Recent activity" />
      <ul className="divide-y divide-rule">
        {activity.length ? (
          activity.map((entry) => (
            <li key={entry.id} className="px-4 py-3 text-sm">
              <p className="text-neutral">{entry.summary ?? entry.action}</p>
              <p className="wordmark mt-0.5 text-xs text-muted-foreground">
                {entry.actor_name} · {relativeStamp(entry.created_at)}
              </p>
            </li>
          ))
        ) : (
          <li className="px-4 py-6 text-sm text-muted-foreground">Nothing yet.</li>
        )}
      </ul>
    </Card>
  );
}
