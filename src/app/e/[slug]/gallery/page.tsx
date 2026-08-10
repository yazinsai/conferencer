import { notFound } from "next/navigation";
import { GalleryWidget } from "@/components/public/gallery-widget";
import { getPublicSpeakers } from "@/lib/public/program";

export default async function PublicGalleryPage({
  params,
}: PageProps<"/e/[slug]/gallery">) {
  const { slug } = await params;
  const data = await getPublicSpeakers(slug);
  if (!data) notFound();

  return (
    <GalleryWidget speakers={data.speakers} timezone={data.event.timezone} />
  );
}
