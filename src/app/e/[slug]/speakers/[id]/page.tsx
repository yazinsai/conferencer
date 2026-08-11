import Link from "next/link";
import { notFound } from "next/navigation";

import { eventBySlugOr404 } from "@/lib/guards";
import { getContact } from "@/lib/repo/contacts";
import { publicSessionsForSpeaker } from "@/lib/repo/submissions";
import { Avatar, Card, Chip } from "@/components/ui";
import { formatRange } from "@/lib/datetime";
import { stripHtml } from "@/lib/fields";
import { PublicPage } from "@/components/public/pieces";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps<"/e/[slug]/speakers/[id]">) {
  const { slug, id } = await params;
  const event = eventBySlugOr404(slug);
  const contact = getContact(id);
  return {
    title: contact ? `${contact.first_name} ${contact.last_name} · ${event.name}` : "Speaker",
  };
}

export default async function SpeakerDetailPage({ params }: PageProps<"/e/[slug]/speakers/[id]">) {
  const { slug, id } = await params;
  const event = eventBySlugOr404(slug);
  const contact = getContact(id);
  if (!contact) notFound();
  const sessions = publicSessionsForSpeaker(event.id, contact.id);
  if (!sessions.length) notFound(); // only speakers with public sessions are public

  const links = [
    { label: "LinkedIn", href: contact.linkedin_url },
    { label: "X", href: contact.twitter_url },
    { label: "Website", href: contact.website_url },
  ].filter((l) => l.href);

  return (
    <PublicPage width="prose">
      <Link
        href={`/e/${event.slug}/speakers`}
        className="text-sm font-medium text-signal hover:underline"
      >
        ← Back to speakers
      </Link>

      <div className="mt-4 flex flex-wrap items-start gap-5">
        <Avatar
          src={contact.headshot_url}
          name={`${contact.first_name} ${contact.last_name}`}
          size={112}
        />
        <div className="min-w-0 flex-1">
          <h1 className="display text-2xl text-ink sm:text-3xl">
            {contact.first_name} {contact.last_name}
          </h1>
          <p className="mt-0.5 text-neutral">
            {[contact.job_title, contact.company].filter(Boolean).join(", ")}
          </p>
          {contact.pronouns ? (
            <p className="mt-1 text-xs text-muted-foreground">{contact.pronouns}</p>
          ) : null}
          {links.length ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {links.map((link) => (
                <a
                  key={link.label}
                  href={link.href as string}
                  className="rounded-md border border-rule-2 px-2.5 py-1 text-xs font-medium text-neutral hover:bg-paper-2"
                  rel="noreferrer noopener"
                  target="_blank"
                >
                  {link.label}
                </a>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      {contact.biography ? (
        <div className="prose-cf mt-6 text-neutral">
          <p>{stripHtml(contact.biography)}</p>
        </div>
      ) : null}

      <Card className="mt-6 p-4">
        <h2 className="text-sm font-semibold text-ink">
          Sessions ({sessions.length})
        </h2>
        <ul className="mt-3 space-y-3">
          {sessions.map((session) => (
            <li key={session.id} className="border-l-2 border-rule pl-3">
              <Link
                href={`/e/${event.slug}/sessions/${session.id}`}
                className="font-medium text-ink hover:text-signal"
              >
                {session.title}
              </Link>
              <p className="text-sm text-muted-foreground">
                {session.pub_starts_at
                  ? formatRange(session.pub_starts_at, session.pub_ends_at)
                  : "Time to be announced"}
                {session.room_name ? ` · ${session.room_name}` : ""}
              </p>
              {session.track_name ? (
                <div className="mt-1">
                  <Chip color={session.track_color}>{session.track_name}</Chip>
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      </Card>
    </PublicPage>
  );
}
