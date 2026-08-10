import { requireOrganizer } from "@/lib/guards";
import { saveRecordSettingsAction } from "@/server/settings-actions";
import { Button, Card, Field, Input, LinkButton, Notice, PageHeader } from "@/components/ui";

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
        actions={<LinkButton href={`/admin/e/${slug}/settings`}>Back to settings</LinkButton>}
      />
      {sp.saved ? <Notice tone="success" className="mb-4">Record settings saved.</Notice> : null}
      <Card className="p-5">
        <form action={saveRecordSettingsAction} className="space-y-5">
          <input type="hidden" name="slug" value={slug} />

          <label className="flex items-start gap-3">
            <input
              type="checkbox"
              name="participant_acceptance_enabled"
              defaultChecked={Boolean(event.participant_acceptance_enabled)}
              className="mt-1"
            />
            <span>
              <span className="block text-sm font-medium text-slate-800">
                Participant acceptance
              </span>
              <span className="block text-xs text-slate-500">
                Speakers must confirm each role they hold on an accepted submission.
              </span>
            </span>
          </label>

          <label className="flex items-start gap-3">
            <input
              type="checkbox"
              name="allow_withdrawal"
              defaultChecked={Boolean(event.allow_withdrawal)}
              className="mt-1"
            />
            <span>
              <span className="block text-sm font-medium text-slate-800">Allow withdrawal</span>
              <span className="block text-xs text-slate-500">
                Speakers can withdraw a submission from the portal, with a captured reason.
              </span>
            </span>
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
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

          <Button type="submit" variant="primary" size="lg">
            Save record settings
          </Button>
        </form>
      </Card>
    </div>
  );
}
