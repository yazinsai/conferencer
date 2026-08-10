import { notFound } from "next/navigation";
import type { CSSProperties } from "react";
import { PublicNav } from "@/components/public/public-nav";
import { getEventBySlug } from "@/lib/auth/guards";

export default async function PublicEventLayout({
  children,
  params,
}: LayoutProps<"/e/[slug]">) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  if (!event) notFound();

  const accent = event.accentColor ?? "#2563eb";

  return (
    <div
      className="min-h-full flex flex-col"
      style={{ "--event-accent": accent } as CSSProperties}
    >
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-4">
          {event.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={event.logoUrl}
              alt=""
              className="h-10 w-10 rounded-md object-cover"
            />
          ) : (
            <div
              className="flex h-10 w-10 items-center justify-center rounded-md text-sm font-bold text-white"
              style={{ backgroundColor: accent }}
            >
              {event.name.slice(0, 1)}
            </div>
          )}
          <div>
            <p className="text-sm font-semibold text-slate-900">{event.name}</p>
            {event.location ? (
              <p className="text-xs text-slate-500">{event.location}</p>
            ) : null}
          </div>
        </div>
        <div className="mx-auto max-w-5xl">
          <PublicNav slug={slug} />
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">{children}</main>
    </div>
  );
}
