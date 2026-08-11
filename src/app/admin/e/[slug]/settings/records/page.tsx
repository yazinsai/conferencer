import { requireOrganizer } from "@/lib/guards";
import { saveRecordSettingsAction } from "@/server/settings-actions";
import { Button, Card, Field, Input, Notice, PageHeader } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function RecordSettingsPage({
  params,
  searchParams,
}: PageProps<"/admin/e/[slug]/settings/records">) {
  const { slug } = await params;
  const sp = await searchParams;
  const { event } = await requireOrganizer(slug);

  return (
    <div className="max-w-2xl">
      <PageHeader
        title="Record settings"
        description="How participants confirm, withdraw, and what the portal calls each status."
        breadcrumb={<a href={`/admin/e/${slug}/settings`}>Settings</a>}
      />
      {sp.saved ? <Notice tone="success" className="mb-4">Record settings saved.</Notice> : null}
      <Card className="overflow-hidden p-0">
        <form action={saveRecordSettingsAction}>
          <input type="hidden" name="slug" value={slug} />

          <fieldset>
            <legend className="border-b border-rule px-5 py-3 text-sm font-semibold text-ink">
              Participant actions
            </legend>
            <div className="divide-y divide-rule">
              <label className="flex cursor-pointer items-start gap-3 px-5 py-4 transition-colors duration-[120ms] ease-out hover:bg-paper-2 focus-within:bg-paper-2">
                <input
                  type="checkbox"
                  name="participant_acceptance_enabled"
                  defaultChecked={Boolean(event.participant_acceptance_enabled)}
                  className="mt-1 size-4 shrink-0 accent-ink"
                />
                <span className="min-w-0 max-w-[65ch]">
                  <span className="block text-sm font-medium text-ink">
                    Participant acceptance
                  </span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">
                    Speakers must confirm each role they hold on an accepted submission.
                  </span>
                </span>
              </label>

              <label className="flex cursor-pointer items-start gap-3 px-5 py-4 transition-colors duration-[120ms] ease-out hover:bg-paper-2 focus-within:bg-paper-2">
                <input
                  type="checkbox"
                  name="allow_withdrawal"
                  defaultChecked={Boolean(event.allow_withdrawal)}
                  className="mt-1 size-4 shrink-0 accent-ink"
                />
                <span className="min-w-0 max-w-[65ch]">
                  <span className="block text-sm font-medium text-ink">Allow withdrawal</span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">
                    Speakers can withdraw a submission from the portal, with a captured reason.
                  </span>
                </span>
              </label>
            </div>
          </fieldset>

          <fieldset className="border-t border-rule">
            <legend className="border-b border-rule px-5 py-3 text-sm font-semibold text-ink">
              Portal labels
            </legend>
            <div className="grid max-w-[65ch] gap-4 px-5 py-5">
              <Field
                label="Label for accepted"
                name="label_accepted"
                hint="What the speaker portal calls an accepted submission."
              >
                <Input
                  id="label_accepted"
                  name="label_accepted"
                  defaultValue={event.label_accepted}
                />
              </Field>
              <Field
                label="Label for pending"
                name="label_pending"
                hint="Queue statuses are always shown to speakers using this label."
              >
                <Input id="label_pending" name="label_pending" defaultValue={event.label_pending} />
              </Field>
            </div>
          </fieldset>

          <div className="border-t border-rule bg-paper-2 px-5 py-4">
            <Button type="submit" variant="primary" size="lg">
              Save record settings
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
