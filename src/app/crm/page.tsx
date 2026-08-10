import Link from "next/link";

import { requireAnyOrganizer } from "@/lib/guards";
import { crmStats, findDuplicates, stageCounts, topCompanies } from "@/lib/repo/crm";
import { Card, CardHeader, Chip, LinkButton, PageHeader, Stat } from "@/components/ui";

export const metadata = { title: "Speaker CRM" };
export const dynamic = "force-dynamic";

export default async function CrmOverview() {
  const { event } = await requireAnyOrganizer();
  const orgId = event.org_id;
  const stats = crmStats(orgId);
  const companies = topCompanies(orgId);
  const stages = stageCounts(orgId);
  const duplicates = findDuplicates(orgId);
  const maxCompany = Math.max(1, ...companies.map((c) => c.n));

  return (
    <div>
      <PageHeader
        title="Speaker CRM"
        description="Your organisation's speaker database across every event, with a sourcing pipeline for the people you want next time."
        actions={
          <>
            <LinkButton href="/crm/contacts">Directory</LinkButton>
            <LinkButton href="/crm/pipeline" variant="primary">
              Sourcing pipeline
            </LinkButton>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Contacts" value={stats.contacts} href="/crm/contacts" />
        <Stat label="Events" value={stats.events} />
        <Stat label="Returning speakers" value={stats.returning} tone="green" />
        <Stat label="In the pipeline" value={stats.pipeline} href="/crm/pipeline" />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="Top companies" description="Where your speakers come from" />
          <ul className="space-y-2 p-4">
            {companies.map((row) => (
              <li key={row.company}>
                <div className="flex items-center justify-between text-sm">
                  <Link
                    href={`/crm/contacts?company=${encodeURIComponent(row.company)}`}
                    className="text-slate-700 hover:text-brand-700"
                  >
                    {row.company}
                  </Link>
                  <span className="text-slate-500">{row.n}</span>
                </div>
                <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-brand-500"
                    style={{ width: `${(row.n / maxCompany) * 100}%` }}
                  />
                </div>
              </li>
            ))}
            {!companies.length ? (
              <li className="text-sm text-slate-500">No contacts yet.</li>
            ) : null}
          </ul>
        </Card>

        <Card>
          <CardHeader title="Pipeline by stage" description="Sourcing progress" />
          <ul className="space-y-2 p-4">
            {stages.map((stage) => (
              <li key={stage.key} className="flex items-center justify-between text-sm">
                <Link href="/crm/pipeline" className="text-slate-700 hover:text-brand-700">
                  {stage.label}
                </Link>
                <Chip tone={stage.key === "confirmed" ? "green" : stage.key === "declined" ? "red" : "slate"}>
                  {stage.count}
                </Chip>
              </li>
            ))}
          </ul>
          <div className="border-t border-slate-200 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Data quality
            </p>
            <ul className="mt-1 space-y-1 text-sm text-slate-600">
              <li>
                {stats.withBio} of {stats.contacts} contacts have a biography
              </li>
              <li>
                {duplicates.length} possible duplicate{duplicates.length === 1 ? "" : "s"} (same
                name, different email){" "}
                {duplicates.length ? (
                  <Link href="/crm/contacts?duplicates=1" className="font-medium text-brand-700 hover:underline">
                    review
                  </Link>
                ) : null}
              </li>
            </ul>
          </div>
        </Card>
      </div>
    </div>
  );
}
