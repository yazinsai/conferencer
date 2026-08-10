import { eq } from "drizzle-orm";
import { requireEventRole } from "@/lib/auth/guards";
import { getDb, schema } from "@/lib/db";
import { LookupList } from "../lookup-list";
import { SettingsNav } from "../settings-nav";

export default async function LevelsSettingsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { event } = await requireEventRole(slug, ["organizer"]);
  const db = getDb();
  const items = db
    .select()
    .from(schema.levels)
    .where(eq(schema.levels.eventId, event.id))
    .orderBy(schema.levels.sortOrder)
    .all();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Levels</h1>
        <p className="text-slate-600">Audience levels for sessions and submissions.</p>
      </div>
      <SettingsNav slug={slug} active="/levels" />
      <LookupList
        slug={slug}
        kind="levels"
        title="Levels"
        subtitle="Reorder with arrows; changes apply immediately"
        items={items}
      />
    </div>
  );
}
