import { requireOrganizer } from "@/lib/guards";
import { SubmissionsView } from "@/components/admin/submissions-view";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps<"/admin/e/[slug]/submissions">) {
  const { slug } = await params;
  const { event } = await requireOrganizer(slug);
  return { title: `Submissions · ${event.name}` };
}

export default async function SubmissionsPage({
  params,
  searchParams,
}: PageProps<"/admin/e/[slug]/submissions">) {
  const { slug } = await params;
  const sp = await searchParams;
  const { event } = await requireOrganizer(slug);
  return (
    <SubmissionsView
      slug={slug}
      eventId={event.id}
      searchParams={sp}
      kind="all"
      title="Submissions"
      description="Every abstract and session for this event. Change a status inline, or select several rows for a bulk decision."
    />
  );
}
