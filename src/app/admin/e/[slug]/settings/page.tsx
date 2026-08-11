import Link from "next/link";

import { requireOrganizer } from "@/lib/guards";
import { listLookup } from "@/lib/repo/events";
import { listFields } from "@/lib/repo/forms";
import { PageHeader } from "@/components/ui";

export const dynamic = "force-dynamic";

type SettingsItem = {
  href: string;
  label: string;
  hint: string;
  count?: string;
};

export default async function SettingsPage({ params }: PageProps<"/admin/e/[slug]/settings">) {
  const { slug } = await params;
  const { event } = await requireOrganizer(slug);
  const base = `/admin/e/${slug}/settings`;

  const groups: { title: string; items: SettingsItem[] }[] = [
    {
      title: "Event setup",
      items: [
        { href: `${base}/event`, label: "Event details", hint: "Name, dates, venue, branding" },
        {
          href: `${base}/records`,
          label: "Record settings",
          hint: "Participant acceptance, withdrawal, portal status labels",
        },
      ],
    },
    {
      title: "Library",
      items: [
        {
          href: `${base}/tracks`,
          label: "Tracks",
          hint: "Selectable in forms and the agenda",
          count: `${listLookup("tracks", event.id).length}`,
        },
        {
          href: `${base}/formats`,
          label: "Session formats",
          hint: "Default session lengths",
          count: `${listLookup("formats", event.id).length}`,
        },
        {
          href: `${base}/rooms`,
          label: "Rooms",
          hint: "Schedulable agenda locations",
          count: `${listLookup("rooms", event.id).length}`,
        },
        {
          href: `${base}/tags`,
          label: "Tags",
          hint: "Free-form submission labels",
          count: `${listLookup("tags", event.id).length}`,
        },
        {
          href: `${base}/levels`,
          label: "Levels",
          hint: "Audience levels on the form",
          count: `${listLookup("levels", event.id).length}`,
        },
        {
          href: `${base}/fields`,
          label: "Fields",
          hint: "Standard and custom field library",
          count: `${listFields(event.id).length}`,
        },
      ],
    },
    {
      title: "Configuration",
      items: [
        { href: `${base}/api`, label: "API tokens", hint: "Bearer tokens for /api/v1" },
        {
          href: `${base}/airtable`,
          label: "Airtable sync",
          hint: "Optional mirror of submissions and speakers",
        },
        {
          href: `${base}/webhooks`,
          label: "Webhooks",
          hint: "Push submission, task and schedule events to your systems",
        },
      ],
    },
  ];

  const related: SettingsItem[] = [
    {
      href: `/admin/e/${slug}/portals`,
      label: "Portals",
      hint: "Speaker portal configuration",
    },
    {
      href: `/admin/e/${slug}/team`,
      label: "Event team",
      hint: "Organizers and reviewers",
    },
    {
      href: `/admin/e/${slug}/emails/templates`,
      label: "Email templates",
      hint: "Subjects, bodies and merge fields",
    },
    {
      href: `/admin/e/${slug}/emails`,
      label: "Communications history",
      hint: "Every message this event has sent",
    },
  ];

  return (
    <div>
      <PageHeader
        title="Settings"
        description={`Everything that configures ${event.name}.`}
      />
      {/* Independent columns so short groups keep their natural height. */}
      <div className="columns-1 gap-4 md:columns-2">
        {groups.map((group) => (
          <section
            key={group.title}
            className="mb-4 break-inside-avoid rounded-card border border-rule bg-card shadow-[var(--shadow-card)]"
          >
            <h2 className="border-b border-rule px-4 py-3 text-sm font-semibold text-ink">
              {group.title}
            </h2>
            <ul className="divide-y divide-rule">
              {group.items.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="group flex items-center gap-3 px-4 py-3 outline-2 outline-offset-[-2px] outline-transparent transition-colors duration-[120ms] ease-out hover:bg-paper-2 focus-visible:outline-ring"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-medium text-ink">{item.label}</span>
                      <span className="mt-0.5 block text-xs text-muted-foreground">{item.hint}</span>
                    </span>
                    {item.count != null ? (
                      <span className="wordmark tnum shrink-0 rounded-md border border-rule bg-paper-3 px-1.5 py-0.5 text-[0.6875rem] text-neutral">
                        {item.count}
                      </span>
                    ) : null}
                    <span
                      aria-hidden
                      className="shrink-0 text-muted-foreground transition-transform duration-[120ms] ease-out group-hover:translate-x-0.5 group-hover:text-ink"
                    >
                      →
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <section className="mt-6 border-t border-rule pt-5">
        <h2 className="wordmark text-[0.6875rem] uppercase tracking-[0.14em] text-muted-foreground">
          Related areas
        </h2>
        <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
          {related.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="text-sm text-ink underline decoration-rule-2 underline-offset-2 outline-2 outline-offset-2 outline-transparent hover:decoration-ink focus-visible:outline-ring"
              >
                {item.label}
                <span className="ml-1 text-muted-foreground" aria-hidden>
                  →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
