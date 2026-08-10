import { requireOrganizer } from "@/lib/guards";
import { airtableStatus } from "@/lib/airtable";
import { pullAirtableAction, pushAirtableAction } from "@/server/airtable-actions";
import {
  Button,
  Card,
  CardHeader,
  Chip,
  FormError,
  LinkButton,
  Notice,
  PageHeader,
} from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function AirtablePage({
  params,
  searchParams,
}: PageProps<"/admin/e/[slug]/settings/airtable">) {
  const { slug } = await params;
  const sp = await searchParams;
  await requireOrganizer(slug);
  const status = airtableStatus();
  const error = typeof sp.error === "string" ? sp.error : null;

  return (
    <div className="max-w-2xl">
      <PageHeader
        title="Airtable sync"
        description="Optional two-way mirror of submissions and speakers. Off unless you configure it — Conferencer never depends on Airtable."
        actions={<LinkButton href={`/admin/e/${slug}/settings`}>Back to settings</LinkButton>}
      />

      {error ? <div className="mb-4"><FormError>{error}</FormError></div> : null}
      {sp.pushed ? (
        <Notice tone="success" className="mb-4">
          Pushed {String(sp.pushed)} submissions and {String(sp.speakers ?? 0)} speakers to Airtable.
        </Notice>
      ) : null}
      {sp.pulled ? (
        <Notice tone="success" className="mb-4">
          Pulled {String(sp.pulled)} submission change(s) and {String(sp.speakers ?? 0)} speaker
          record(s) from Airtable.
        </Notice>
      ) : null}

      <Card>
        <CardHeader
          title="Status"
          actions={
            <Chip tone={status.enabled ? "green" : "slate"}>
              {status.enabled ? "Configured" : "Not configured"}
            </Chip>
          }
        />
        <div className="space-y-3 p-4 text-sm text-slate-700">
          {status.enabled ? (
            <p>
              Base <code className="font-mono text-xs">{status.baseId}</code> · tables{" "}
              <code className="font-mono text-xs">{status.submissionsTable}</code> and{" "}
              <code className="font-mono text-xs">{status.speakersTable}</code>.
            </p>
          ) : (
            <>
              <p>Set these environment variables and restart to enable the mirror:</p>
              <pre className="overflow-x-auto rounded-md bg-slate-900 p-3 font-mono text-xs text-slate-100">
{`AIRTABLE_API_KEY=pat_xxx
AIRTABLE_BASE_ID=app_xxx
# optional table names, defaults shown
AIRTABLE_SUBMISSIONS_TABLE=Submissions
AIRTABLE_SPEAKERS_TABLE=Speakers`}
              </pre>
              <p className="text-xs text-slate-500">
                Create the two tables with a <code>ConferencerId</code> text column — it is how
                records are matched on both sides.
              </p>
            </>
          )}

          <div className="flex flex-wrap gap-2 pt-2">
            <form action={pushAirtableAction}>
              <input type="hidden" name="slug" value={slug} />
              <Button type="submit" variant="primary" disabled={!status.enabled}>
                Push to Airtable
              </Button>
            </form>
            <form action={pullAirtableAction}>
              <input type="hidden" name="slug" value={slug} />
              <Button type="submit" disabled={!status.enabled}>
                Pull from Airtable
              </Button>
            </form>
          </div>
        </div>
      </Card>
    </div>
  );
}
