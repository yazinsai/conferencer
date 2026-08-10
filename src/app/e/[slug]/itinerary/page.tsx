import { notFound } from "next/navigation";
import { ItineraryWidget } from "@/components/public/itinerary-widget";
import { getPublicSessions } from "@/lib/public/program";

export default async function PublicItineraryPage({
  params,
}: PageProps<"/e/[slug]/itinerary">) {
  const { slug } = await params;
  const data = await getPublicSessions(slug);
  if (!data) notFound();

  return (
    <ItineraryWidget
      slug={slug}
      sessions={data.sessions}
      timezone={data.event.timezone}
      schedulePublished={data.agendaPublished}
    />
  );
}
