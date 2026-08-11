import Link from "next/link";
import { notFound } from "next/navigation";

import { eventBySlugOr404 } from "@/lib/guards";
import { publicSession, speakersForSubmissions } from "@/lib/repo/submissions";
import { PublicPage, SessionMeta, SessionTags } from "@/components/public/pieces";
import { Avatar, Card } from "@/components/ui";
import { stripHtml } from "@/lib/fields";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps<"/e/[slug]/sessions/[id]">) {
  const { slug, id } = await params;
  const event = eventBySlugOr404(slug);
  const session = publicSession(event.id, id);
  return { title: session ? `${session.title} · ${event.name}` : "Session" };
}

export default async function SessionDetailPage({ params }: PageProps<"/e/[slug]/sessions/[id]">) {
  const { slug, id } = await params;
  const event = eventBySlugOr404(slug);
  const session = publicSession(event.id, id);
  if (!session) notFound();
  const speakers = speakersForSubmissions([session.id]).get(session.id) ?? [];

  return (
    <PublicPage width="prose">
      <Link
        href={`/e/${event.slug}/sessions`}
        className="text-sm font-medium text-signal hover:underline"
      >
        ← Back to sessions
      </Link>
      <h1 className="mt-3 text-2xl font-semibold tracking-tight text-ink">
        {session.title}
      </h1>
      <SessionMeta session={session} />
      <SessionTags session={session} />

      {session.description ? (
        <div className="prose-cf mt-5 text-neutral">
          {stripHtml(session.description)
            .split("\n")
            .filter(Boolean)
            .map((para, index) => (
              <p key={index}>{para}</p>
            ))}
        </div>
      ) : null}

      {speakers.length ? (
        <Card className="mt-6 p-4">
          <h2 className="text-sm font-semibold text-ink">
            {speakers.length === 1 ? "Speaker" : "Speakers"}
          </h2>
          <ul className="mt-3 space-y-4">
            {speakers.map((s) => (
              <li key={s.contact_id} className="flex gap-3">
                <Avatar src={s.headshot_url} name={`${s.first_name} ${s.last_name}`} size={48} />
                <div>
                  <Link
                    href={`/e/${event.slug}/speakers/${s.contact_id}`}
                    className="font-medium text-ink hover:text-signal"
                  >
                    {s.first_name} {s.last_name}
                  </Link>
                  <p className="text-sm text-muted-foreground">
                    {[s.job_title, s.company].filter(Boolean).join(", ")}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      ) : null}
    </PublicPage>
  );
}
