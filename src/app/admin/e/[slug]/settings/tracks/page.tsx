import { eq } from "drizzle-orm";
import { requireEventRole } from "@/lib/auth/guards";
import { getDb, schema } from "@/lib/db";
import { LookupList } from "../lookup-list";
import { SettingsNav } from "../settings-nav";

export default async function TracksSettingsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { event } = await requireEventRole(slug, ["organizer"]);
  const db = getDb();
  const items = db
    .select()
    .from(schema.tracks)
    .where(eq(schema.tracks.eventId, event.id))
    .orderBy(schema.tracks.sortOrder)
    .all();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Tracks</h1>
        <p className="text-slate-600">Program tracks available in forms and the agenda.</p>
      </div>
      <SettingsNav slug={slug} active="/tracks" />
      <LookupList
        slug={slug}
        kind="tracks"
        title="Tracks"
        subtitle="Reorder with arrows; changes apply immediately"
        items={items}
      />
    </div>
  );
}
