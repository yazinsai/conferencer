import Link from "next/link";
import { eq } from "drizzle-orm";
import { getDb, schema } from "@/lib/db";
import { getSessionUser } from "@/lib/auth/session";
import { ButtonLink } from "@/components/ui/button";

export default async function HomePage() {
  const user = await getSessionUser();
  const db = getDb();
  const event = db
    .select()
    .from(schema.events)
    .where(eq(schema.events.slug, "devflow-conf-2027"))
    .get();
  const form = event
    ? db
        .select()
        .from(schema.submissionForms)
        .where(eq(schema.submissionForms.eventId, event.id))
        .get()
    : null;

  return (
    <div className="min-h-full">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="text-lg font-semibold tracking-tight">Conferencer</div>
          <div className="flex items-center gap-2">
            {user ? (
              <>
                <ButtonLink href="/admin" variant="secondary">
                  Dashboard
                </ButtonLink>
                <ButtonLink href="/portal" variant="ghost">
                  Portal
                </ButtonLink>
                <ButtonLink href="/review" variant="ghost">
                  Reviews
                </ButtonLink>
              </>
            ) : (
              <>
                <ButtonLink href="/sign-in" variant="secondary">
                  Sign in
                </ButtonLink>
                <ButtonLink href="/sign-up">Sign up</ButtonLink>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-16">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
            Open-source program module
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-900">
            Collect talks. Review them. Build the agenda.
          </h1>
          <p className="mt-4 text-lg text-slate-600">
            Conferencer is a Sessionboard Program replacement: CFP forms, evaluations,
            speaker portal, tasks, agenda builder, and embeddable public widgets —
            fast and self-hosted.
          </p>
        </div>

        {event ? (
          <section className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <DemoCard
              title={event.name}
              body={event.theme ?? "Demo conference"}
              links={[
                form
                  ? { href: `/e/${event.slug}/submit/${form.id}`, label: "Submit a talk" }
                  : null,
                { href: `/e/${event.slug}/sessions`, label: "Sessions" },
                { href: `/e/${event.slug}/speakers`, label: "Speakers" },
                { href: `/e/${event.slug}/agenda`, label: "Agenda" },
                { href: `/e/${event.slug}/itinerary`, label: "Itinerary" },
                { href: `/e/${event.slug}/gallery`, label: "Gallery" },
                { href: "/admin", label: "Admin" },
                { href: "/portal", label: "Speaker portal" },
                { href: "/review", label: "Reviewer" },
              ].filter(Boolean) as Array<{ href: string; label: string }>}
            />
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="font-semibold">Demo accounts</h2>
              <ul className="mt-3 space-y-2 text-sm text-slate-600">
                <li>
                  <strong>Organizer</strong> · sbek-organizer@example.com · SbekTest!2027-org
                </li>
                <li>
                  <strong>Speaker</strong> · sbek-speaker@example.com · SbekTest!2027-spk
                </li>
                <li>
                  <strong>Reviewer</strong> · sbek-reviewer@example.com · SbekTest!2027-rev
                </li>
              </ul>
              <Link href="/sign-in" className="mt-4 inline-block text-sm font-medium text-blue-600">
                Sign in →
              </Link>
            </div>
          </section>
        ) : (
          <p className="mt-8 rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-900">
            No seed data yet. Run <code>npm run setup</code>.
          </p>
        )}
      </main>
    </div>
  );
}

function DemoCard({
  title,
  body,
  links,
}: {
  title: string;
  body: string;
  links: Array<{ href: string; label: string }>;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm md:col-span-1 lg:col-span-2">
      <h2 className="text-xl font-semibold">{title}</h2>
      <p className="mt-2 text-sm text-slate-600">{body}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700 hover:bg-slate-200"
          >
            {l.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
