import Link from "next/link";

import { requireOrganizer } from "@/lib/guards";
import { all } from "@/lib/db";
import { listPlans } from "@/lib/repo/evaluations";
import { statusCounts } from "@/lib/repo/submissions";
import { Card, CardHeader, LinkButton, PageHeader, Table, Td, Th } from "@/components/ui";

export const dynamic = "force-dynamic";

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

  return (
    <div className="max-w-4xl">
      <PageHeader
        title="Reports"
        description="Programme summaries and every export in one place."
      />

      <Card className="mb-5">
        <CardHeader title="Exports" />
        <ul className="grid gap-2 p-4 sm:grid-cols-2">
          <li>
            <LinkButton href={`/admin/e/${slug}/submissions/export.csv`} size="sm">
              Submissions CSV
            </LinkButton>
          </li>
          <li>
            <LinkButton href={`/admin/e/${slug}/speakers/export.csv`} size="sm">
              Speakers CSV
            </LinkButton>
          </li>
          <li>
            <LinkButton href={`/admin/e/${slug}/tasks/export.csv`} size="sm">
              Task completion CSV
            </LinkButton>
          </li>
          <li>
            <LinkButton href={`/admin/e/${slug}/files/export.zip`} size="sm">
              All deliverables (ZIP)
            </LinkButton>
          </li>
          {plans.map((plan) => (
            <li key={plan.id}>
              <LinkButton href={`/admin/e/${slug}/evaluation/${plan.id}/export.csv`} size="sm">
                {plan.name} — scores CSV
              </LinkButton>
            </li>
          ))}
        </ul>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader title="Submissions by status" />
          <Table className="rounded-none border-0">
            <thead>
              <tr>
                <Th>Status</Th>
                <Th>Count</Th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(counts)
                .filter(([key]) => key !== "all")
                .map(([status, n]) => (
                  <tr key={status}>
                    <Td className="capitalize">{status.replace("_", " ")}</Td>
                    <Td>
                      <Link
                        href={`/admin/e/${slug}/submissions?status=${status}`}
                        className="font-medium text-brand-700 hover:underline"
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
          <Table className="rounded-none border-0">
            <thead>
              <tr>
                <Th>Track</Th>
                <Th>Submissions</Th>
                <Th>Accepted</Th>
              </tr>
            </thead>
            <tbody>
              {byTrack.map((row) => (
                <tr key={row.name}>
                  <Td>{row.name}</Td>
                  <Td>{row.n}</Td>
                  <Td>{row.accepted}</Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>

        <Card>
          <CardHeader title="By format" />
          <Table className="rounded-none border-0">
            <thead>
              <tr>
                <Th>Format</Th>
                <Th>Submissions</Th>
              </tr>
            </thead>
            <tbody>
              {byFormat.map((row) => (
                <tr key={row.name}>
                  <Td>{row.name}</Td>
                  <Td>{row.n}</Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>
      </div>
    </div>
  );
}
