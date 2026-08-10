import Link from "next/link";
import { notFound } from "next/navigation";
import {
  SpeakerBio,
  SpeakerDetailHeader,
  SpeakerSessionsList,
} from "@/components/public/speakers-list-widget";
import { getPublicSpeaker } from "@/lib/public/program";

export default async function PublicSpeakerDetailPage({
  params,
}: PageProps<"/e/[slug]/speakers/[contactId]">) {
  const { slug, contactId } = await params;
  const data = await getPublicSpeaker(slug, contactId);
  if (!data) notFound();

  return (
    <div className="space-y-8">
      <Link
        href={`/e/${slug}/speakers`}
        className="text-sm font-medium text-[var(--event-accent,#2563eb)] hover:underline"
      >
        ← All speakers
      </Link>
      <SpeakerDetailHeader speaker={data.speaker} />
      <SpeakerBio biography={data.speaker.biography} />
      <SpeakerSessionsList
        slug={slug}
        speaker={data.speaker}
        timezone={data.event.timezone}
      />
    </div>
  );
}
