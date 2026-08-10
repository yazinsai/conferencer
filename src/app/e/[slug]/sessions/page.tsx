import { notFound } from "next/navigation";
import { SessionsListWidget } from "@/components/public/sessions-list-widget";
import { getPublicSessions } from "@/lib/public/program";

export default async function PublicSessionsPage({
  params,
}: PageProps<"/e/[slug]/sessions">) {
  const { slug } = await params;
  const data = await getPublicSessions(slug);
  if (!data) notFound();

  return (
    <SessionsListWidget
      slug={slug}
      sessions={data.sessions}
      timezone={data.event.timezone}
    />
  );
}
