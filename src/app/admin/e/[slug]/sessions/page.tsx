import { requireOrganizer } from "@/lib/guards";
import { SubmissionsView } from "@/components/admin/submissions-view";

export const dynamic = "force-dynamic";

export default async function Page({
  params,
  searchParams,
}: PageProps<"/admin/e/[slug]/sessions">) {
  const { slug } = await params;
  const sp = await searchParams;
  const { event } = await requireOrganizer(slug);
  return (
    <SubmissionsView
      slug={slug}
      eventId={event.id}
      searchParams={sp}
      kind="session"
      title="Sessions"
      description="Confirmed programme items — sponsor slots, keynotes and accepted talks."
    />
  );
}
