import Link from "next/link";

import { eventBySlugOr404 } from "@/lib/guards";
import { defaultForm, formIsOpen } from "@/lib/repo/forms";
import { publicSessions, publicSpeakers, speakersForSubmissions } from "@/lib/repo/submissions";
import { SpeakerLine } from "@/components/public/pieces";
import { Avatar, LinkButton } from "@/components/ui";
import { formatDate, formatEventDates, formatRange, daysUntil } from "@/lib/datetime";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps<"/e/[slug]">) {
  const { slug } = await params;
  const event = eventBySlugOr404(slug);
  return { title: event.name, description: event.theme ?? event.tagline ?? undefined };
}

/**
 * Macrostructure 03 · Marquee Hero (see design.md § Macrostructure families).
 *
 * A conference home page has one job above the fold: say which conference, when,
 * and where, at poster scale. The fold is typographic — no card, no image, no
 * three-up grid. A rule closes it, and below the rule the page becomes a list.
 *
 * The primary action lives in the N12 banner the layout renders, which is why
 * this fold can afford to be quiet.
 */
export default async function EventHomePage({ params }: PageProps<"/e/[slug]">) {
  const { slug } = await params;
  const event = eventBySlugOr404(slug);
  const form = defaultForm(event.id);
  const open = form ? formIsOpen(form) : false;
  const sessions = publicSessions(event.id);
  const speakers = publicSpeakers(event.id);
  const featured = sessions.slice(0, 5);
  const speakerMap = speakersForSubmissions(featured.map((s) => s.id));
  const countdown = daysUntil(event.starts_at);

  const facts = [
    { label: "Sessions", value: sessions.length, href: `/e/${event.slug}/sessions` },
    { label: "Speakers", value: speakers.length, href: `/e/${event.slug}/speakers` },
    countdown !== null && countdown > 0
      ? { label: "Days to go", value: countdown, href: `/e/${event.slug}/agenda` }
      : { label: "Opens", value: formatDate(event.starts_at), href: `/e/${event.slug}/agenda` },
  ];

  return (
    <div>
      {/* ---------------------------------------------------------- the fold -- */}
      <section className="border-b-2 border-ink">
        <div className="mx-auto w-full max-w-6xl px-4 pb-16 pt-12 sm:px-6 sm:pb-24 sm:pt-16">
          <p
            className="wordmark text-xs uppercase tracking-[0.16em]"
            style={{ color: event.accent_color }}
          >
            {formatEventDates(event.starts_at, event.ends_at)}
            {event.location ? ` · ${event.location}` : ""}
          </p>

          <h1 className="display mt-5 max-w-[16ch] text-display text-ink">{event.name}</h1>

          {event.tagline ? (
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-neutral">{event.tagline}</p>
          ) : null}
        </div>
      </section>

      {/* ------------------------------------------------- below the fold -- */}
      <section className="border-b border-rule bg-paper">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-x-8 gap-y-5 px-4 py-6 sm:px-6">
          <div className="flex flex-wrap gap-2">
            {form ? (
              <LinkButton
                href={`/e/${event.slug}/submit/${form.id}`}
                variant="primary"
                size="lg"
                className="nowrap-affordance"
              >
                {open ? "Submit a talk" : "Call for speakers"}
              </LinkButton>
            ) : null}
            <LinkButton href={`/e/${event.slug}/agenda`} size="lg" className="nowrap-affordance">
              View the agenda
            </LinkButton>
            <LinkButton href={`/e/${event.slug}/speakers`} size="lg" className="nowrap-affordance">
              Meet the speakers
            </LinkButton>
          </div>

          <dl className="flex flex-wrap items-baseline gap-x-8 gap-y-3">
            {facts.map((fact) => (
              <div key={fact.label}>
                <dt className="wordmark text-[0.6875rem] uppercase tracking-[0.12em] text-muted-foreground">
                  {fact.label}
                </dt>
                <dd className="wordmark tnum mt-0.5 text-xl font-medium text-ink">
                  <Link href={fact.href} className="underline-offset-4 hover:underline">
                    {fact.value}
                  </Link>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {event.theme ? (
        <section className="bg-paper-2">
          <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
            <p className="max-w-[62ch] text-lg leading-relaxed text-ink-2">{event.theme}</p>
            {form?.closes_at ? (
              <p className="mt-5 text-sm text-muted-foreground">
                {open ? (
                  <>
                    Submissions close on{" "}
                    <strong className="font-medium text-ink">{formatDate(form.closes_at)}</strong>.
                  </>
                ) : (
                  <>Submissions closed on {formatDate(form.closes_at)}.</>
                )}
              </p>
            ) : null}
          </div>
        </section>
      ) : null}

      {featured.length ? (
        <section className="border-t border-rule">
          <div className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6">
            <div className="mb-2 flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
              <h2 className="display text-2xl text-ink">On the programme</h2>
              <Link
                href={`/e/${event.slug}/sessions`}
                className="nowrap-affordance group text-sm font-medium text-ink underline-offset-4 hover:underline"
              >
                All {sessions.length} sessions{" "}
                <span
                  aria-hidden
                  className="inline-block transition-transform duration-[120ms] ease-out group-hover:translate-x-0.5"
                >
                  →
                </span>
              </Link>
            </div>

            {/* Ruled rows rather than a card grid: the sessions list is the page's
                spine, and rows read faster than boxes at this density. */}
            <ul className="border-t border-rule">
              {featured.map((session) => (
                <li key={session.id} className="border-b border-rule">
                  <Link
                    href={`/e/${event.slug}/sessions/${session.id}`}
                    className="group grid gap-x-8 gap-y-2 py-5 md:grid-cols-[minmax(0,11rem)_minmax(0,1fr)]"
                  >
                    <p className="wordmark tnum text-xs text-muted-foreground md:pt-1">
                      {session.pub_starts_at
                        ? formatRange(session.pub_starts_at, session.pub_ends_at)
                        : "Time to be announced"}
                      {session.room_name ? (
                        <span className="block md:mt-0.5">{session.room_name}</span>
                      ) : null}
                    </p>
                    <div className="min-w-0">
                      <h3 className="display text-lg text-ink underline-offset-4 group-hover:underline">
                        {session.title}
                      </h3>
                      <SpeakerLine speakers={speakerMap.get(session.id) ?? []} />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      {speakers.length ? (
        <section className="border-t border-rule bg-paper-2">
          <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
            <div className="mb-6 flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
              <h2 className="display text-2xl text-ink">Speaking</h2>
              <Link
                href={`/e/${event.slug}/gallery`}
                className="nowrap-affordance text-sm font-medium text-ink underline-offset-4 hover:underline"
              >
                Speaker gallery →
              </Link>
            </div>
            <ul className="grid grid-cols-3 gap-x-4 gap-y-6 sm:grid-cols-4 md:grid-cols-6">
              {speakers.slice(0, 12).map((speaker) => (
                <li key={speaker.id}>
                  <Link
                    href={`/e/${event.slug}/speakers/${speaker.id}`}
                    className="group block text-center"
                  >
                    <Avatar
                      src={speaker.headshot_url}
                      name={`${speaker.first_name} ${speaker.last_name}`}
                      size={72}
                      className="mx-auto"
                    />
                    <p className="mt-2.5 text-xs font-medium text-ink-2 underline-offset-4 group-hover:underline">
                      {speaker.first_name} {speaker.last_name}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}
    </div>
  );
}
