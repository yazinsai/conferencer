import { eq } from "drizzle-orm";
import { requireEventRole } from "@/lib/auth/guards";
import { getDb, schema } from "@/lib/db";
import { LookupList } from "../lookup-list";
import { SettingsNav } from "../settings-nav";

export default async function RoomsSettingsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { event } = await requireEventRole(slug, ["organizer"]);
  const db = getDb();
  const items = db
    .select()
    .from(schema.rooms)
    .where(eq(schema.rooms.eventId, event.id))
    .orderBy(schema.rooms.sortOrder)
    .all();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Rooms</h1>
        <p className="text-slate-600">Venue rooms for agenda scheduling.</p>
      </div>
      <SettingsNav slug={slug} active="/rooms" />
      <LookupList
        slug={slug}
        kind="rooms"
        title="Rooms"
        subtitle="Reorder with arrows; changes apply immediately"
        items={items}
      />
    </div>
  );
}
