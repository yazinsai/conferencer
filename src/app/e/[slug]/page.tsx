import Link from "next/link";

import { eventBySlugOr404 } from "@/lib/guards";
import { defaultForm, formIsOpen } from "@/lib/repo/forms";
import { publicSessions, publicSpeakers, speakersForSubmissions } from "@/lib/repo/submissions";
import { SessionCard } from "@/components/public/pieces";
import { Avatar, Card, LinkButton } from "@/components/ui";
import { formatDate, formatEventDates, daysUntil } from "@/lib/datetime";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps<"/e/[slug]">) {
  const { slug } = await params;
  const event = eventBySlugOr404(slug);
  return { title: event.name, description: event.theme ?? event.tagline ?? undefined };
}

export default async function EventHomePage({ params }: PageProps<"/e/[slug]">) {
  const { slug } = await params;
  const event = eventBySlugOr404(slug);
  const form = defaultForm(event.id);
  const open = form ? formIsOpen(form) : false;
  const sessions = publicSessions(event.id);
  const speakers = publicSpeakers(event.id);
  const featured = sessions.slice(0, 4);
  const speakerMap = speakersForSubmissions(featured.map((s) => s.id));
  const countdown = daysUntil(event.starts_at);

  return (
    <div>
      <section
        className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm"
        style={{ borderTopColor: event.accent_color, borderTopWidth: 4 }}
      >
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
          {formatEventDates(event.starts_at, event.ends_at)}
          {event.location ? ` · ${event.location}` : ""}
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">{event.name}</h1>
        {event.tagline ? (
          <p className="mt-1 text-lg text-slate-600">{event.tagline}</p>
        ) : null}
        {event.theme ? (
          <p className="mt-3 max-w-2xl text-sm text-slate-600">{event.theme}</p>
        ) : null}
        <div className="mt-5 flex flex-wrap gap-2">
          {form ? (
            <LinkButton href={`/e/${event.slug}/submit/${form.id}`} variant="primary" size="lg">
              {open ? "Submit a talk" : "Call for speakers"}
            </LinkButton>
          ) : null}
          <LinkButton href={`/e/${event.slug}/agenda`} size="lg">
            View the agenda
          </LinkButton>
          <LinkButton href={`/e/${event.slug}/speakers`} size="lg">
            Meet the speakers
          </LinkButton>
        </div>
        {form?.closes_at ? (
          <p className="mt-3 text-sm text-slate-500">
            {open ? (
              <>
                Submissions close <strong>{formatDate(form.closes_at)}</strong>.
              </>
            ) : (
              <>Submissions are closed.</>
            )}
          </p>
        ) : null}
      </section>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <Card className="p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Sessions</p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">{sessions.length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Speakers</p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">{speakers.length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            {countdown !== null && countdown > 0 ? "Days to go" : "Event"}
          </p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">
            {countdown !== null && countdown > 0 ? countdown : formatDate(event.starts_at)}
          </p>
        </Card>
      </div>

      {featured.length ? (
        <section className="mt-10">
          <div className="mb-3 flex items-end justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Featured sessions</h2>
            <Link
              href={`/e/${event.slug}/sessions`}
              className="text-sm font-medium text-brand-700 hover:underline"
            >
              All {sessions.length} sessions →
            </Link>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {featured.map((session) => (
              <SessionCard
                key={session.id}
                session={session}
                speakers={speakerMap.get(session.id) ?? []}
                href={`/e/${event.slug}/sessions/${session.id}`}
              />
            ))}
          </div>
        </section>
      ) : null}

      {speakers.length ? (
        <section className="mt-10">
          <div className="mb-3 flex items-end justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Speakers</h2>
            <Link
              href={`/e/${event.slug}/gallery`}
              className="text-sm font-medium text-brand-700 hover:underline"
            >
              Speaker gallery →
            </Link>
          </div>
          <ul className="flex flex-wrap gap-4">
            {speakers.slice(0, 12).map((speaker) => (
              <li key={speaker.id} className="w-28 text-center">
                <Link href={`/e/${event.slug}/speakers/${speaker.id}`} className="group block">
                  <Avatar
                    src={speaker.headshot_url}
                    name={`${speaker.first_name} ${speaker.last_name}`}
                    size={80}
                    className="mx-auto"
                  />
                  <p className="mt-2 text-xs font-medium text-slate-800 group-hover:text-brand-700">
                    {speaker.first_name} {speaker.last_name}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
