import { getPublicSessions } from "@/lib/public/program";
import { jsonData, notFound } from "@/lib/api/response";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const program = await getPublicSessions(slug);
  if (!program) return notFound("Event not found");

  return jsonData({
    event: {
      id: program.event.id,
      name: program.event.name,
      slug: program.event.slug,
      startsAt: program.event.startsAt,
      endsAt: program.event.endsAt,
    },
    sessions: program.sessions,
    agendaPublished: program.agendaPublished,
  });
}
