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
      className="flex min-h-full flex-col bg-background"
      style={{ "--event-accent": accent } as CSSProperties}
    >
      <header className="border-b bg-card">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-4">
          {event.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={event.logoUrl}
              alt=""
              className="h-10 w-10 rounded-lg object-cover"
            />
          ) : (
            <div
              className="flex h-10 w-10 items-center justify-center rounded-lg text-sm font-bold text-white"
              style={{ backgroundColor: accent }}
            >
              {event.name.slice(0, 1)}
            </div>
          )}
          <div>
            <p className="text-sm font-semibold">{event.name}</p>
            {event.location ? (
              <p className="text-xs text-muted-foreground">{event.location}</p>
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
