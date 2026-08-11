import { requireOrganizer } from "@/lib/guards";
import { SpeakerForm } from "@/components/admin/speaker-form";
import { FormError, LinkButton, PageHeader } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function NewSpeakerPage({
  params,
  searchParams,
}: PageProps<"/admin/e/[slug]/speakers/new">) {
  const { slug } = await params;
  const sp = await searchParams;
  await requireOrganizer(slug);
  const error = typeof sp.error === "string" ? sp.error : null;

  return (
    <div className="max-w-3xl">
      <PageHeader
        title="Add speaker"
        description="Create a speaker record by hand. They can claim their portal later with an invitation."
        actions={<LinkButton href={`/admin/e/${slug}/speakers`}>Cancel</LinkButton>}
      />
      {error ? <div className="mb-4"><FormError>{error}</FormError></div> : null}
      <SpeakerForm slug={slug} />
    </div>
  );
}
