import { requireOrganizer } from "@/lib/guards";
import { listLookup } from "@/lib/repo/events";
import { LookupEditor } from "@/components/admin/lookup-editor";
import { PageHeader } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function Page({ params }: PageProps<"/admin/e/[slug]/settings/levels">) {
  const { slug } = await params;
  const { event } = await requireOrganizer(slug);
  const rows = listLookup("levels", event.id);
  return (
    <div className="max-w-4xl">
      <PageHeader
        title="Levels"
        description="Audience levels offered on the submission form."
        breadcrumb={<a href={`/admin/e/${slug}/settings`}>Settings</a>}
      />
      <LookupEditor
        slug={slug}
        table="levels"
        title="Levels"
        description="Audience levels offered on the submission form."
        rows={rows}
        cardHeader={`${rows.length} level${rows.length === 1 ? "" : "s"}`}
      />
    </div>
  );
}
