import { eq } from "drizzle-orm";
import { requireEventRole } from "@/lib/auth/guards";
import { getDb, schema } from "@/lib/db";
import { LookupList } from "../lookup-list";
import { SettingsNav } from "../settings-nav";

export default async function FormatsSettingsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { event } = await requireEventRole(slug, ["organizer"]);
  const db = getDb();
  const items = db
    .select()
    .from(schema.formats)
    .where(eq(schema.formats.eventId, event.id))
    .orderBy(schema.formats.sortOrder)
    .all();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Formats</h1>
        <p className="text-slate-600">Session formats for submissions and scheduling.</p>
      </div>
      <SettingsNav slug={slug} active="/formats" />
      <LookupList
        slug={slug}
        kind="formats"
        title="Formats"
        subtitle="Reorder with arrows; changes apply immediately"
        items={items}
      />
    </div>
  );
}
