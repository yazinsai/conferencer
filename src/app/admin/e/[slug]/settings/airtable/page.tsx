import { requireOrganizer } from "@/lib/guards";
import { airtableStatus } from "@/lib/airtable";
import { pullAirtableAction, pushAirtableAction } from "@/server/airtable-actions";
import {
  Button,
  Card,
  CardHeader,
  Chip,
  FormError,
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
        breadcrumb={<a href={`/admin/e/${slug}/settings`}>Settings</a>}
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
        <div className="space-y-4 p-4 text-sm text-neutral">
          <div>
            <p className="text-base font-medium text-ink">
              {status.enabled ? "Airtable sync is on." : "Airtable sync is off."}
            </p>
            {status.enabled ? (
              <p className="mt-1">
                Base <code className="wordmark text-xs text-ink-2">{status.baseId}</code> · tables{" "}
                <code className="wordmark text-xs text-ink-2">{status.submissionsTable}</code> and{" "}
                <code className="wordmark text-xs text-ink-2">{status.speakersTable}</code>.
              </p>
            ) : (
              <p className="mt-1">
                Set these environment variables and restart the app to enable the mirror. Configuration
                is not changed from this screen.
              </p>
            )}
          </div>

          {!status.enabled ? (
            <>
              <pre className="overflow-x-auto rounded-card border border-rule bg-paper-3 p-3 font-mono text-xs text-ink-2">
{`AIRTABLE_API_KEY=pat_xxx
AIRTABLE_BASE_ID=app_xxx
# optional table names, defaults shown
AIRTABLE_SUBMISSIONS_TABLE=Submissions
AIRTABLE_SPEAKERS_TABLE=Speakers`}
              </pre>
              <p className="text-xs text-muted-foreground">
                Create the two tables with a <code className="wordmark">ConferencerId</code> text
                column — it is how records are matched on both sides.
              </p>
            </>
          ) : null}

          <div className="border-t border-rule pt-4">
            <p className="mb-3 text-sm text-neutral">
              <span className="font-medium text-ink">Push</span> sends Conferencer submissions and
              speakers to Airtable. <span className="font-medium text-ink">Pull</span> brings Airtable
              changes back into Conferencer. Matching uses the ConferencerId column on both sides.
            </p>
            <div className="flex flex-wrap gap-2">
              <form action={pushAirtableAction}>
                <input type="hidden" name="slug" value={slug} />
                <Button
                  type="submit"
                  variant={status.enabled ? "primary" : "secondary"}
                  disabled={!status.enabled}
                >
                  Push to Airtable
                </Button>
              </form>
              <form action={pullAirtableAction}>
                <input type="hidden" name="slug" value={slug} />
                <Button type="submit" variant="secondary" disabled={!status.enabled}>
                  Pull from Airtable
                </Button>
              </form>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
