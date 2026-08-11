import Link from "next/link";
import { notFound } from "next/navigation";

import { getEventBySlug } from "@/lib/repo/events";
import { formatDate, formatEventDates } from "@/lib/datetime";
import { currentUser } from "@/lib/auth";
import { landingFor } from "@/lib/guards";
import { defaultForm, formIsOpen } from "@/lib/repo/forms";
import { PublicNav } from "@/components/public/nav";
import { EventNavShell } from "@/components/client/event-nav";
import { buttonClass } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function PublicEventLayout({
  children,
  params,
}: LayoutProps<"/e/[slug]">) {
  const { slug } = await params;
  const event = getEventBySlug(slug);
  if (!event) notFound();
  const user = await currentUser();
  const form = defaultForm(event.id);
  const open = form ? formIsOpen(form) : false;

  /**
   * The banner carries the deadline, not a promotion. A conference site has
   * exactly one time-sensitive fact, and this is it. When there is no call for
   * speakers at all the banner does not render and the bar docks on its own.
   */
  const banner = form ? (
    open ? (
      <>
        <span className="hidden sm:inline">Call for speakers is open</span>
        <span className="sm:hidden">CFP open</span>
        {form.closes_at ? (
          <span className="hidden md:inline"> · closes {formatDate(form.closes_at)}</span>
        ) : null}{" "}
        <Link
          href={`/e/${event.slug}/submit/${form.id}`}
          className="nowrap-affordance font-medium underline underline-offset-4"
        >
          Submit a talk →
        </Link>
      </>
    ) : (
      <>
        The call for speakers has closed{" "}
        <Link
          href={`/e/${event.slug}/agenda`}
          className="nowrap-affordance font-medium underline underline-offset-4"
        >
          See the agenda →
        </Link>
      </>
    )
  ) : null;

  const bar = (
    <div className="mx-auto flex h-[var(--nav-height)] w-full max-w-6xl items-center gap-4 px-4 sm:px-6">
      <Link href={`/e/${event.slug}`} className="min-w-0 shrink-0">
        <span
          className="wordmark nowrap-affordance block truncate text-[0.9375rem]"
          style={{ color: event.accent_color }}
        >
          {event.name}
        </span>
      </Link>
      <div className="hidden min-w-0 flex-1 lg:block">
        <PublicNav slug={event.slug} />
      </div>
      <div className="ml-auto flex shrink-0 items-center gap-2">
        {user ? (
          <Link href={landingFor(user)} className={`${buttonClass("ghost", "sm")} nowrap-affordance`}>
            My account
          </Link>
        ) : (
          <Link href="/sign-in" className={`${buttonClass("ghost", "sm")} nowrap-affordance hidden sm:inline-flex`}>
            Sign in
          </Link>
        )}
        {form ? (
          <Link
            href={`/e/${event.slug}/submit/${form.id}`}
            className={`${buttonClass("primary", "sm")} nowrap-affordance`}
          >
            {open ? "Submit a talk" : "Call for speakers"}
          </Link>
        ) : null}
      </div>
    </div>
  );

  return (
    <div
      className="flex min-h-screen flex-col bg-paper"
      style={{ ["--event-accent" as string]: event.accent_color }}
    >
      <EventNavShell banner={banner} bar={bar} />

      {/* The link row lives under the bar below the desktop breakpoint, where the
          bar itself only has room for the wordmark and the primary action. */}
      <div className="border-b border-rule bg-paper px-4 py-2 lg:hidden">
        <div className="mx-auto w-full max-w-6xl">
          <PublicNav slug={event.slug} />
        </div>
      </div>

      <main className="flex-1">{children}</main>

      {/* Ft1 Mast-headed — a wordmark, a line about the event, and the credit. */}
      <footer className="border-t border-rule bg-paper-2">
        <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
          <p className="wordmark text-lg text-ink">{event.name}</p>
          <p className="mt-1 text-sm text-neutral">
            {formatEventDates(event.starts_at, event.ends_at)}
            {event.location ? ` · ${event.location}` : ""}
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-t border-rule pt-5 text-xs text-muted-foreground">
            <p>
              {event.website_url ? (
                <a
                  href={event.website_url}
                  className="nowrap-affordance underline-offset-4 hover:text-ink hover:underline"
                >
                  {event.website_url.replace(/^https?:\/\//, "")}
                </a>
              ) : (
                "Programme and schedule"
              )}
            </p>
            <p>
              Programme run on{" "}
              <Link
                href="/"
                className="nowrap-affordance font-medium text-ink underline-offset-4 hover:underline"
              >
                Conferencer
              </Link>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
