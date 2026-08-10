import Link from "next/link";

import { requireAnyOrganizer } from "@/lib/guards";
import { readJson } from "@/lib/db";
import { contactName, listContactsForOrg } from "@/lib/repo/contacts";
import { listSegments } from "@/lib/repo/crm";
import { deleteSegmentAction } from "@/server/crm-actions";
import { Card, CardHeader, Chip, LinkButton, Notice, PageHeader } from "@/components/ui";
import { ConfirmSubmit } from "@/components/client/basics";
import { formatStamp } from "@/lib/datetime";

export const dynamic = "force-dynamic";

type Config = { q?: string; company?: string; jobTitle?: string; tag?: string };

export default async function SegmentsPage({ searchParams }: PageProps<"/crm/segments">) {
  const sp = await searchParams;
  const { event } = await requireAnyOrganizer();
  const segments = listSegments(event.org_id);

  return (
    <div>
      <PageHeader
        title="Segments"
        description="Saved, reusable views of the directory. Dynamic segments re-evaluate every time you open them."
        actions={<LinkButton href="/crm/contacts">Directory</LinkButton>}
      />
      {sp.saved ? <Notice tone="success" className="mb-4">Segment saved.</Notice> : null}

      <div className="space-y-4">
        {segments.map((segment) => {
          const config = readJson<Config>(segment.config, {});
          const members = listContactsForOrg(event.org_id, {
            q: config.q || undefined,
            company: config.company || undefined,
            jobTitle: config.jobTitle || undefined,
            tag: config.tag || undefined,
          });
          const query = new URLSearchParams(
            Object.entries({
              q: config.q ?? "",
              company: config.company ?? "",
              job_title: config.jobTitle ?? "",
              tag: config.tag ?? "",
            }).filter(([, value]) => value),
          ).toString();
          return (
            <Card key={segment.id}>
              <CardHeader
                title={segment.name}
                description={
                  <>
                    <Chip tone={segment.kind === "dynamic" ? "green" : "slate"}>{segment.kind}</Chip>{" "}
                    <span className="text-xs">
                      {members.length} member{members.length === 1 ? "" : "s"} · saved{" "}
                      {formatStamp(segment.created_at)}
                    </span>
                  </>
                }
                actions={
                  <>
                    <LinkButton href={`/crm/contacts?${query}`} size="sm" variant="primary">
                      Open in directory
                    </LinkButton>
                    <form action={deleteSegmentAction}>
                      <input type="hidden" name="segment_id" value={segment.id} />
                      <ConfirmSubmit message={`Delete the segment "${segment.name}"?`} variant="ghost">
                        Delete
                      </ConfirmSubmit>
                    </form>
                  </>
                }
              />
              <ul className="divide-y divide-slate-100">
                {members.slice(0, 10).map((contact) => (
                  <li key={contact.id} className="px-4 py-2 text-sm">
                    <Link
                      href={`/crm/contacts/${contact.id}`}
                      className="font-medium text-slate-800 hover:text-brand-700"
                    >
                      {contactName(contact)}
                    </Link>
                    <span className="ml-2 text-xs text-slate-500">
                      {[contact.job_title, contact.company].filter(Boolean).join(", ")}
                    </span>
                  </li>
                ))}
                {!members.length ? (
                  <li className="px-4 py-4 text-sm text-slate-500">
                    No contacts match this segment right now.
                  </li>
                ) : null}
              </ul>
            </Card>
          );
        })}
        {!segments.length ? (
          <Card className="p-8 text-center text-sm text-slate-500">
            No segments yet. Filter the directory and use “Save this filter as a segment”.
          </Card>
        ) : null}
      </div>
    </div>
  );
}
