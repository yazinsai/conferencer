import Link from "next/link";

import { requireOrganizer } from "@/lib/guards";
import { listLookup } from "@/lib/repo/events";
import { listFields } from "@/lib/repo/forms";
import { Card, PageHeader } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function SettingsPage({ params }: PageProps<"/admin/e/[slug]/settings">) {
  const { slug } = await params;
  const { event } = await requireOrganizer(slug);
  const base = `/admin/e/${slug}/settings`;

  const groups = [
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
          hint: `${listLookup("tracks", event.id).length} tracks`,
        },
        {
          href: `${base}/formats`,
          label: "Session formats",
          hint: `${listLookup("formats", event.id).length} formats`,
        },
        {
          href: `${base}/rooms`,
          label: "Rooms",
          hint: `${listLookup("rooms", event.id).length} rooms`,
        },
        {
          href: `${base}/tags`,
          label: "Tags",
          hint: `${listLookup("tags", event.id).length} tags`,
        },
        {
          href: `${base}/levels`,
          label: "Levels",
          hint: `${listLookup("levels", event.id).length} levels`,
        },
        {
          href: `${base}/fields`,
          label: "Fields",
          hint: `${listFields(event.id).length} standard and custom fields`,
        },
      ],
    },
    {
      title: "Communications",
      items: [
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
        { href: `/admin/e/${slug}/portals`, label: "Portals", hint: "Speaker portal configuration" },
        { href: `/admin/e/${slug}/team`, label: "Event team", hint: "Organizers and reviewers" },
      ],
    },
  ];

  return (
    <div>
      <PageHeader
        title="Settings"
        description={`Everything that configures ${event.name}.`}
      />
      <div className="grid gap-4 md:grid-cols-2">
        {groups.map((group) => (
          <Card key={group.title} className="p-4">
            <h2 className="text-sm font-semibold text-slate-900">{group.title}</h2>
            <ul className="mt-3 space-y-1">
              {group.items.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="flex items-center justify-between rounded-md px-2 py-2 hover:bg-slate-50"
                  >
                    <span>
                      <span className="block text-sm font-medium text-slate-800">{item.label}</span>
                      <span className="block text-xs text-slate-500">{item.hint}</span>
                    </span>
                    <span aria-hidden className="text-slate-400">
                      →
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </div>
    </div>
  );
}
