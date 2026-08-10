import { requireOrganizer } from "@/lib/guards";
import { SubmissionsView } from "@/components/admin/submissions-view";

export const dynamic = "force-dynamic";

export default async function Page({
  params,
  searchParams,
}: PageProps<"/admin/e/[slug]/abstracts">) {
  const { slug } = await params;
  const sp = await searchParams;
  const { event } = await requireOrganizer(slug);
  return (
    <SubmissionsView
      slug={slug}
      eventId={event.id}
      searchParams={sp}
      kind="abstract"
      title="Abstracts"
      description="Proposals submitted through the call for speakers."
    />
  );
}
