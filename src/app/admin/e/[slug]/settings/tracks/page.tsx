import { requireOrganizer } from "@/lib/guards";
import { listLookup } from "@/lib/repo/events";
import { LookupEditor } from "@/components/admin/lookup-editor";
import { PageHeader } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function Page({ params }: PageProps<"/admin/e/[slug]/settings/tracks">) {
  const { slug } = await params;
  const { event } = await requireOrganizer(slug);
  return (
    <div className="max-w-4xl">
      <PageHeader
        title="Tracks"
        description="Tracks are selectable in the form builder and the agenda the moment you add them."
        breadcrumb={<a href={`/admin/e/${slug}/settings`}>Settings</a>}
      />
      <LookupEditor
        slug={slug}
        table="tracks"
        title="Tracks"
        description="Tracks are selectable in the form builder and the agenda the moment you add them."
        rows={listLookup("tracks", event.id)}
        cardHeader="Manage tracks"
      />
    </div>
  );
}
