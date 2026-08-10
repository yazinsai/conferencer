import { notFound } from "next/navigation";
import { AgendaWidget } from "@/components/public/agenda-widget";
import { getPublicSessions } from "@/lib/public/program";

export default async function PublicAgendaPage({
  params,
}: PageProps<"/e/[slug]/agenda">) {
  const { slug } = await params;
  const data = await getPublicSessions(slug);
  if (!data) notFound();

  return (
    <AgendaWidget
      sessions={data.sessions}
      timezone={data.event.timezone}
      schedulePublished={data.agendaPublished}
    />
  );
}
