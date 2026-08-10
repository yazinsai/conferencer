import { notFound } from "next/navigation";
import { SpeakersListWidget } from "@/components/public/speakers-list-widget";
import { getPublicSpeakers } from "@/lib/public/program";

export default async function PublicSpeakersPage({
  params,
}: PageProps<"/e/[slug]/speakers">) {
  const { slug } = await params;
  const data = await getPublicSpeakers(slug);
  if (!data) notFound();

  return <SpeakersListWidget slug={slug} speakers={data.speakers} />;
}
