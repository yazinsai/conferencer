import { requireOrganizer } from "@/lib/guards";
import { listLookup } from "@/lib/repo/events";
import { LookupEditor } from "@/components/admin/lookup-editor";
import { LinkButton, PageHeader } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function Page({ params }: PageProps<"/admin/e/[slug]/settings/rooms">) {
  const { slug } = await params;
  const { event } = await requireOrganizer(slug);
  return (
    <div className="max-w-4xl">
      <PageHeader
        title="Rooms"
        description="Rooms become schedulable locations in the agenda builder immediately."
        breadcrumb={<a href={`/admin/e/${slug}/settings`}>Settings</a>}
        actions={<LinkButton href={`/admin/e/${slug}/settings`}>Back to settings</LinkButton>}
      />
      <LookupEditor
        slug={slug}
        table="rooms"
        title="Rooms"
        description="Rooms become schedulable locations in the agenda builder immediately."
        rows={listLookup("rooms", event.id)}
      extra="capacity"
      />
    </div>
  );
}
