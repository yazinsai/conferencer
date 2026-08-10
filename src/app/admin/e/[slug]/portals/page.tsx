import { eq } from "drizzle-orm";
import { requireEventRole } from "@/lib/auth/guards";
import { getDb, schema } from "@/lib/db";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { ButtonLink } from "@/components/ui/button";

export default async function PortalsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { event } = await requireEventRole(slug, ["organizer"]);
  const portals = getDb()
    .select()
    .from(schema.portals)
    .where(eq(schema.portals.eventId, event.id))
    .all();

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Portals</h1>
          <p className="text-slate-600">Speaker-facing portal configuration.</p>
        </div>
        <ButtonLink href="/portal" variant="secondary">
          View Portal
        </ButtonLink>
      </div>
      {portals.map((p) => (
        <Card key={p.id}>
          <CardHeader title={p.name} subtitle={p.isDefault ? "Default" : undefined} />
          <CardBody className="space-y-2 text-sm">
            <div>
              Accent: <code>{p.accentColor}</code>
            </div>
            <div
              className="prose-compact rounded-md bg-slate-50 p-3"
              dangerouslySetInnerHTML={{
                __html: p.welcomeMessage || "<p>No welcome message.</p>",
              }}
            />
            <ul className="list-disc pl-5 text-slate-600">
              <li>Show tasks always: {p.showTasksAlways ? "yes" : "no"}</li>
              <li>Allow manage profile: {p.allowManageProfile ? "yes" : "no"}</li>
              <li>Weekly digest: {p.sendWeeklyDigest ? "on" : "off"}</li>
            </ul>
          </CardBody>
        </Card>
      ))}
    </div>
  );
}
