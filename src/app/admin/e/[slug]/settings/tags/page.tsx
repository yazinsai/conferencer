import { eq } from "drizzle-orm";
import { requireEventRole } from "@/lib/auth/guards";
import { getDb, schema } from "@/lib/db";
import { LookupList } from "../lookup-list";
import { SettingsNav } from "../settings-nav";

export default async function TagsSettingsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { event } = await requireEventRole(slug, ["organizer"]);
  const db = getDb();
  const items = db
    .select()
    .from(schema.tags)
    .where(eq(schema.tags.eventId, event.id))
    .orderBy(schema.tags.sortOrder)
    .all();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Tags</h1>
        <p className="text-slate-600">Session tags for filtering and display.</p>
      </div>
      <SettingsNav slug={slug} active="/tags" />
      <LookupList
        slug={slug}
        kind="tags"
        title="Tags"
        subtitle="Reorder with arrows; changes apply immediately"
        items={items}
      />
    </div>
  );
}
