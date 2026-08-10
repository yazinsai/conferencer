import { getPublicSpeakers } from "@/lib/public/program";
import { jsonData, notFound } from "@/lib/api/response";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const data = await getPublicSpeakers(slug);
  if (!data) return notFound("Event not found");

  return jsonData({
    event: {
      id: data.event.id,
      name: data.event.name,
      slug: data.event.slug,
      startsAt: data.event.startsAt,
      endsAt: data.event.endsAt,
    },
    speakers: data.speakers,
    agendaPublished: data.agendaPublished,
  });
}
