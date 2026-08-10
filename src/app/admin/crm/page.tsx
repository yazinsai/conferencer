import Link from "next/link";
import { requireCrmAccess } from "@/lib/auth/crm-guards";
import { getCrmOverviewMetrics } from "@/lib/crm/queries";
import { CRM_PIPELINE_STAGES, CRM_STAGE_LABELS } from "@/lib/crm/types";
import { Card, CardBody, CardHeader } from "@/components/ui/card";

const STAGE_BAR_COLORS: Record<string, string> = {
  researching: "bg-violet-500",
  contacted: "bg-blue-500",
  in_discussion: "bg-amber-500",
  confirmed: "bg-emerald-500",
  declined: "bg-rose-500",
};

export default async function CrmOverviewPage() {
  const { orgId } = await requireCrmAccess();
  const metrics = getCrmOverviewMetrics(orgId);
  const maxStage = Math.max(...CRM_PIPELINE_STAGES.map((s) => metrics.stageCounts[s] ?? 0), 1);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Speaker CRM</h1>
        <p className="text-slate-600">
          Organization-wide contact directory, pipeline, and outreach.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardBody className="py-4">
            <div className="text-3xl font-semibold text-slate-900">
              {metrics.totalContacts}
            </div>
            <div className="text-sm text-slate-600">Total contacts</div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="py-4">
            <div className="text-3xl font-semibold text-slate-900">
              {metrics.inPipeline}
            </div>
            <div className="text-sm text-slate-600">In pipeline</div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="py-4">
            <div className="text-3xl font-semibold text-emerald-700">
              {metrics.stageCounts.confirmed ?? 0}
            </div>
            <div className="text-sm text-slate-600">Confirmed</div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="py-4">
            <div className="text-3xl font-semibold text-slate-900">
              {metrics.notInPipeline}
            </div>
            <div className="text-sm text-slate-600">Not in pipeline</div>
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader title="Pipeline by stage" subtitle="Contacts in each pipeline stage" />
        <CardBody className="space-y-4">
          {CRM_PIPELINE_STAGES.map((stage) => {
            const count = metrics.stageCounts[stage] ?? 0;
            const pct = Math.round((count / maxStage) * 100);
            return (
              <div key={stage}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="font-medium text-slate-700">
                    {CRM_STAGE_LABELS[stage]}
                  </span>
                  <span className="text-slate-600">{count}</span>
                </div>
                <div className="h-6 overflow-hidden rounded-md bg-slate-100">
                  <div
                    className={`h-full rounded-md transition-all ${STAGE_BAR_COLORS[stage]}`}
                    style={{ width: `${pct}%`, minWidth: count > 0 ? "2rem" : "0" }}
                  />
                </div>
              </div>
            );
          })}
        </CardBody>
      </Card>

      <div className="flex flex-wrap gap-3">
        <Link
          href="/admin/crm/contacts"
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Browse contacts
        </Link>
        <Link
          href="/admin/crm/pipeline"
          className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Open pipeline
        </Link>
        <Link
          href="/admin/crm/duplicates"
          className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Review duplicates
        </Link>
      </div>
    </div>
  );
}
