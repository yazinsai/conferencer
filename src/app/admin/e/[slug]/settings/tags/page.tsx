import { requireOrganizer } from "@/lib/guards";
import { listLookup } from "@/lib/repo/events";
import { LookupEditor } from "@/components/admin/lookup-editor";
import { PageHeader } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function Page({ params }: PageProps<"/admin/e/[slug]/settings/tags">) {
  const { slug } = await params;
  const { event } = await requireOrganizer(slug);
  return (
    <div className="max-w-4xl">
      <PageHeader
        title="Tags"
        description="Free-form labels you can filter submissions by."
        breadcrumb={<a href={`/admin/e/${slug}/settings`}>Settings</a>}
      />
      <LookupEditor
        slug={slug}
        table="tags"
        title="Tags"
        description="Free-form labels you can filter submissions by."
        rows={listLookup("tags", event.id)}
        cardHeader="Manage tags"
      />
    </div>
  );
}
