import Link from "next/link";
import { notFound } from "next/navigation";

import { getEventBySlug } from "@/lib/repo/events";
import { formatEventDates } from "@/lib/datetime";
import { currentUser } from "@/lib/auth";
import { landingFor } from "@/lib/guards";
import { defaultForm } from "@/lib/repo/forms";
import { PublicNav } from "@/components/public/nav";

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

  return (
    <div className="flex min-h-screen flex-col" style={{ ["--event-accent" as string]: event.accent_color }}>
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0">
              <Link href={`/e/${event.slug}`} className="block">
                <span
                  className="text-lg font-semibold tracking-tight"
                  style={{ color: event.accent_color }}
                >
                  {event.name}
                </span>
              </Link>
              <p className="text-xs text-slate-500">
                {formatEventDates(event.starts_at, event.ends_at)}
                {event.location ? ` · ${event.location}` : ""}
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm">
              {form ? (
                <Link
                  href={`/e/${event.slug}/submit/${form.id}`}
                  className="rounded-md px-3 py-2 font-medium text-white"
                  style={{ backgroundColor: event.accent_color }}
                >
                  Submit a talk
                </Link>
              ) : null}
              {user ? (
                <Link
                  href={landingFor(user)}
                  className="rounded-md border border-slate-300 px-3 py-2 font-medium text-slate-700 hover:bg-slate-50"
                >
                  My account
                </Link>
              ) : (
                <Link
                  href="/sign-in"
                  className="rounded-md border border-slate-300 px-3 py-2 font-medium text-slate-700 hover:bg-slate-50"
                >
                  Sign in
                </Link>
              )}
            </div>
          </div>
          <PublicNav slug={event.slug} />
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">{children}</main>
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-6 text-xs text-slate-500">
          <p>
            {event.name}
            {event.website_url ? (
              <>
                {" · "}
                <a href={event.website_url} className="hover:text-slate-800">
                  {event.website_url.replace(/^https?:\/\//, "")}
                </a>
              </>
            ) : null}
          </p>
          <p>
            Programme powered by{" "}
            <Link href="/" className="font-medium text-slate-700 hover:text-slate-900">
              Conferencer
            </Link>
          </p>
        </div>
      </footer>
    </div>
  );
}
