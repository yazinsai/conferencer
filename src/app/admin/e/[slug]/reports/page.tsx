import Link from "next/link";

import { requireOrganizer } from "@/lib/guards";
import { all } from "@/lib/db";
import { listPlans } from "@/lib/repo/evaluations";
import { statusCounts } from "@/lib/repo/submissions";
import { STATUS_LABELS } from "@/lib/status";
import { Card, CardHeader, PageHeader, Table, Td, Th } from "@/components/ui";

export const dynamic = "force-dynamic";

type ExportRow = {
  name: string;
  kind: "CSV" | "ZIP";
  href: string;
};

export default async function ReportsPage({ params }: PageProps<"/admin/e/[slug]/reports">) {
  const { slug } = await params;
  const { event } = await requireOrganizer(slug);
  const counts = statusCounts(event.id);
  const plans = listPlans(event.id);

  const byTrack = all<{ name: string; n: number; accepted: number }>(
    `SELECT COALESCE(t.name, 'No track') AS name, COUNT(*) AS n,
            SUM(CASE WHEN s.status = 'accepted' THEN 1 ELSE 0 END) AS accepted
       FROM submissions s LEFT JOIN tracks t ON t.id = s.track_id
      WHERE s.event_id = ? GROUP BY t.id ORDER BY n DESC`,
    event.id,
  );
  const byFormat = all<{ name: string; n: number }>(
    `SELECT COALESCE(f.name, 'No format') AS name, COUNT(*) AS n
       FROM submissions s LEFT JOIN formats f ON f.id = s.format_id
      WHERE s.event_id = ? GROUP BY f.id ORDER BY n DESC`,
    event.id,
  );

  const exports: ExportRow[] = [
    {
      name: "Submissions",
      kind: "CSV",
      href: `/admin/e/${slug}/submissions/export.csv`,
    },
    {
      name: "Speakers",
      kind: "CSV",
      href: `/admin/e/${slug}/speakers/export.csv`,
    },
    {
      name: "Task completion",
      kind: "CSV",
      href: `/admin/e/${slug}/tasks/export.csv`,
    },
    {
      name: "All deliverables",
      kind: "ZIP",
      href: `/admin/e/${slug}/files/export.zip`,
    },
    ...plans.map((plan) => ({
      name: `${plan.name} — scores`,
      kind: "CSV" as const,
      href: `/admin/e/${slug}/evaluation/${plan.id}/export.csv`,
    })),
  ];

  const summary = [
    {
      label: "Total submissions",
      value: counts.all ?? 0,
      href: `/admin/e/${slug}/submissions`,
    },
    {
      label: "Accepted",
      value: counts.accepted ?? 0,
      href: `/admin/e/${slug}/submissions?status=accepted`,
    },
    {
      label: "Pending review",
      value: counts.pending ?? 0,
      href: `/admin/e/${slug}/submissions?status=pending`,
    },
  ];

  return (
    <div className="max-w-4xl">
      <PageHeader
        title="Reports"
        description="Programme summaries and every export in one place."
      />

      <div className="mb-5 grid grid-cols-1 gap-px overflow-hidden rounded-card border border-rule bg-rule sm:grid-cols-3">
        {summary.map((cell) => (
          <Link
            key={cell.label}
            href={cell.href}
            className="bg-paper px-4 py-4 transition-colors duration-[120ms] ease-out hover:bg-paper-2 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-ring"
          >
            <span className="wordmark block text-[0.6875rem] uppercase tracking-[0.12em] text-muted-foreground">
              {cell.label}
            </span>
            <span className="wordmark tnum mt-2 block text-3xl font-medium tracking-[-0.02em] text-ink">
              {cell.value}
            </span>
          </Link>
        ))}
      </div>

      <Card className="mb-5">
        <CardHeader title="Exports" description="Download programme datasets as CSV or ZIP." />
        <ul className="divide-y divide-rule">
          {exports.map((item) => (
            <li key={item.href}>
              <div className="flex flex-wrap items-center gap-3 px-4 py-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-ink break-words">{item.name}</p>
                </div>
                <span className="wordmark shrink-0 rounded-md border border-rule bg-paper-3 px-1.5 py-0.5 text-[0.625rem] uppercase tracking-[0.08em] text-muted-foreground">
                  {item.kind}
                </span>
                <Link
                  href={item.href}
                  className="shrink-0 text-sm font-medium text-signal underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                >
                  Download
                </Link>
              </div>
            </li>
          ))}
        </ul>
      </Card>

      <div className="grid items-start gap-4 md:grid-cols-2">
        <Card>
          <CardHeader title="Submissions by status" />
          <Table className="rounded-none border-0 shadow-none">
            <thead>
              <tr>
                <Th>Status</Th>
                <Th className="text-right">Count</Th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(counts)
                .filter(([key]) => key !== "all")
                .map(([status, n]) => (
                  <tr key={status}>
                    <Td>
                      {STATUS_LABELS[status as keyof typeof STATUS_LABELS] ??
                        status.replace("_", " ")}
                    </Td>
                    <Td className="text-right">
                      <Link
                        href={`/admin/e/${slug}/submissions?status=${status}`}
                        className="wordmark tnum font-medium text-signal hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                      >
                        {n}
                      </Link>
                    </Td>
                  </tr>
                ))}
            </tbody>
          </Table>
        </Card>

        <Card>
          <CardHeader title="By track" />
          <Table className="rounded-none border-0 shadow-none">
            <thead>
              <tr>
                <Th>Track</Th>
                <Th className="text-right">Submissions</Th>
                <Th className="text-right">Accepted</Th>
              </tr>
            </thead>
            <tbody>
              {byTrack.map((row) => (
                <tr key={row.name}>
                  <Td>{row.name}</Td>
                  <Td className="wordmark tnum text-right text-ink-2">{row.n}</Td>
                  <Td className="wordmark tnum text-right text-ink-2">{row.accepted}</Td>
                </tr>
              ))}
              {!byTrack.length ? (
                <tr>
                  <Td colSpan={3} className="text-muted-foreground">
                    No submissions yet.
                  </Td>
                </tr>
              ) : null}
            </tbody>
          </Table>
        </Card>

        <Card>
          <CardHeader title="By format" />
          <Table className="rounded-none border-0 shadow-none">
            <thead>
              <tr>
                <Th>Format</Th>
                <Th className="text-right">Submissions</Th>
              </tr>
            </thead>
            <tbody>
              {byFormat.map((row) => (
                <tr key={row.name}>
                  <Td>{row.name}</Td>
                  <Td className="wordmark tnum text-right text-ink-2">{row.n}</Td>
                </tr>
              ))}
              {!byFormat.length ? (
                <tr>
                  <Td colSpan={2} className="text-muted-foreground">
                    No submissions yet.
                  </Td>
                </tr>
              ) : null}
            </tbody>
          </Table>
        </Card>
      </div>
    </div>
  );
}
