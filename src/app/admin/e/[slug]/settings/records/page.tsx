import { requireEventRole } from "@/lib/auth/guards";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";
import { saveRecordSettingsAction } from "../actions";
import { SettingsNav } from "../settings-nav";

export default async function RecordsSettingsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { event } = await requireEventRole(slug, ["organizer"]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Records</h1>
        <p className="text-slate-600">
          Acceptance workflow and portal labels for submission records.
        </p>
      </div>
      <SettingsNav slug={slug} active="/records" />

      <Card>
        <CardHeader
          title="Acceptance & portal labels"
          subtitle="Control how speakers see acceptance status in the portal"
        />
        <CardBody>
          <form action={saveRecordSettingsAction} className="max-w-lg space-y-4">
            <input type="hidden" name="slug" value={slug} />
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="enableAcceptance"
                defaultChecked={event.enableAcceptance}
                className="rounded border-slate-300"
              />
              Enable acceptance workflow
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="allowWithdrawal"
                defaultChecked={event.allowWithdrawal}
                className="rounded border-slate-300"
              />
              Allow withdrawal from portal
            </label>
            <div>
              <Label htmlFor="portalPendingLabel">Portal pending label</Label>
              <Input
                id="portalPendingLabel"
                name="portalPendingLabel"
                defaultValue={event.portalPendingLabel ?? "Pending"}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="portalAcceptedLabel">Portal accepted label</Label>
              <Input
                id="portalAcceptedLabel"
                name="portalAcceptedLabel"
                defaultValue={event.portalAcceptedLabel ?? "Accepted"}
                className="mt-1"
              />
            </div>
            <Button type="submit">Save record settings</Button>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
