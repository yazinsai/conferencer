import Image from "next/image";
import Link from "next/link";
import { eq } from "drizzle-orm";
import { requireCrmAccess } from "@/lib/auth/crm-guards";
import {
  filterContactsByStage,
  getContactTags,
  listOrgContacts,
  parseSegmentFilter,
} from "@/lib/crm/queries";
import { CRM_PIPELINE_STAGES, CRM_STAGE_LABELS } from "@/lib/crm/types";
import { getDb, schema } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Input, Label, Select } from "@/components/ui/input";
import {
  bulkAddToPipelineAction,
  deleteCrmSegmentAction,
  saveCrmSegmentAction,
  sendBulkCrmEmailAction,
} from "../actions";
import { CrmBulkEmailFields } from "../components/crm-bulk-email";
import { CrmImportForm } from "../components/crm-import-form";

export default async function CrmContactsPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    company?: string;
    jobTitle?: string;
    tagId?: string;
    stage?: string;
    segment?: string;
  }>;
}) {
  const sp = await searchParams;
  const { orgId, event } = await requireCrmAccess();
  const db = getDb();

  let filters = {
    orgId,
    q: sp.q,
    company: sp.company,
    jobTitle: sp.jobTitle,
    tagId: sp.tagId,
  };

  if (sp.segment) {
    const segment = db
      .select()
      .from(schema.crmSegments)
      .where(eq(schema.crmSegments.id, sp.segment))
      .get();
    if (segment) {
      const segFilter = parseSegmentFilter(segment.filter);
      filters = {
        orgId,
        q: segFilter.q ?? filters.q,
        company: segFilter.company ?? filters.company,
        jobTitle: segFilter.jobTitle ?? filters.jobTitle,
        tagId: segFilter.tagId ?? filters.tagId,
      };
    }
  }

  let contacts = listOrgContacts(filters);
  contacts = filterContactsByStage(
    contacts,
    orgId,
    sp.stage as (typeof CRM_PIPELINE_STAGES)[number] | "all" | undefined,
  );

  const tagsByContact = getContactTags(contacts.map((c) => c.id));
  const allTags = db
    .select()
    .from(schema.crmTags)
    .where(eq(schema.crmTags.orgId, orgId))
    .orderBy(schema.crmTags.name)
    .all();

  const segments = db
    .select()
    .from(schema.crmSegments)
    .where(eq(schema.crmSegments.orgId, orgId))
    .orderBy(schema.crmSegments.createdAt)
    .all();

  const emailTemplates = db
    .select({
      key: schema.emailTemplates.key,
      subject: schema.emailTemplates.subject,
      bodyHtml: schema.emailTemplates.bodyHtml,
    })
    .from(schema.emailTemplates)
    .where(eq(schema.emailTemplates.eventId, event.id))
    .all();

  const sampleContact = contacts[0] ?? {
    firstName: "Alex",
    lastName: "Speaker",
    company: "Acme Corp",
    jobTitle: "Engineer",
  };

  const currentFilter = JSON.stringify({
    q: sp.q ?? "",
    company: sp.company ?? "",
    jobTitle: sp.jobTitle ?? "",
    tagId: sp.tagId ?? "",
    stage: sp.stage ?? "",
  });

  const hasFilters = Boolean(sp.q || sp.company || sp.jobTitle || sp.tagId || sp.stage);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Contacts</h1>
        <p className="text-slate-600">
          Search and filter your organization contact directory.
        </p>
      </div>

      <CrmImportForm orgId={orgId} />

      <Card>
        <CardHeader title="Filters" />
        <CardBody>
          <form method="get" className="grid gap-3 md:grid-cols-3 lg:grid-cols-5">
            <div>
              <Label htmlFor="q">Search</Label>
              <Input id="q" name="q" defaultValue={sp.q ?? ""} placeholder="Name, email…" />
            </div>
            <div>
              <Label htmlFor="company">Company</Label>
              <Input id="company" name="company" defaultValue={sp.company ?? ""} />
            </div>
            <div>
              <Label htmlFor="jobTitle">Job title</Label>
              <Input id="jobTitle" name="jobTitle" defaultValue={sp.jobTitle ?? ""} />
            </div>
            <div>
              <Label htmlFor="tagId">Tag</Label>
              <Select id="tagId" name="tagId" defaultValue={sp.tagId ?? ""}>
                <option value="">All tags</option>
                {allTags.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="stage">Pipeline stage</Label>
              <Select id="stage" name="stage" defaultValue={sp.stage ?? ""}>
                <option value="">All stages</option>
                {CRM_PIPELINE_STAGES.map((s) => (
                  <option key={s} value={s}>
                    {CRM_STAGE_LABELS[s]}
                  </option>
                ))}
              </Select>
            </div>
            <div className="flex items-end gap-2 md:col-span-3">
              <Button type="submit">Apply filters</Button>
              {hasFilters ? (
                <Link
                  href="/admin/crm/contacts"
                  className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                >
                  Clear filters
                </Link>
              ) : null}
            </div>
          </form>

          {segments.length > 0 ? (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="text-sm text-slate-600">Saved segments:</span>
              {segments.map((seg) => (
                <span key={seg.id} className="inline-flex items-center gap-1">
                  <Link
                    href={`/admin/crm/contacts?segment=${seg.id}`}
                    className="rounded-full border border-slate-200 px-3 py-1 text-sm hover:bg-slate-50"
                  >
                    {seg.name}
                  </Link>
                  <form action={deleteCrmSegmentAction} className="inline">
                    <input type="hidden" name="segmentId" value={seg.id} />
                    <button
                      type="submit"
                      className="text-xs text-slate-400 hover:text-rose-600"
                      title="Delete segment"
                    >
                      ✕
                    </button>
                  </form>
                </span>
              ))}
            </div>
          ) : null}

          {hasFilters ? (
            <form action={saveCrmSegmentAction} className="mt-4 flex items-end gap-2">
              <input type="hidden" name="filter" value={currentFilter} />
              <div>
                <Label htmlFor="segmentName">Save as segment</Label>
                <Input id="segmentName" name="name" placeholder="Segment name" required />
              </div>
              <Button type="submit" variant="secondary">
                Save segment
              </Button>
            </form>
          ) : null}
        </CardBody>
      </Card>

      <Card>
        <CardHeader title={`${contacts.length} contacts`} />
        <CardBody className="overflow-x-auto p-0">
          <form id="bulk-crm-email" action={sendBulkCrmEmailAction}>
            <CrmBulkEmailFields
              templates={emailTemplates}
              eventName={event.name}
              sampleContact={sampleContact}
            />
            <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 px-4 py-2">
              <Button type="submit">Send email</Button>
              <Button formAction={bulkAddToPipelineAction} variant="secondary">
                Add to pipeline
              </Button>
              <span className="text-xs text-slate-500">
                Select contacts below, then choose an action
              </span>
            </div>
          </form>
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-3 py-2"> </th>
                <th className="px-3 py-2">Contact</th>
                <th className="px-3 py-2">Title / Company</th>
                <th className="px-3 py-2">Email</th>
                <th className="px-3 py-2">Tags</th>
              </tr>
            </thead>
            <tbody>
              {contacts.map((c) => (
                <tr key={c.id} className="border-t border-slate-100 hover:bg-slate-50">
                  <td className="px-3 py-2">
                    <input
                      type="checkbox"
                      name="contactIds"
                      value={c.id}
                      form="bulk-crm-email"
                      className="rounded"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <Link
                      href={`/admin/crm/contacts/${c.id}`}
                      className="flex items-center gap-3"
                    >
                      {c.headshotUrl ? (
                        <Image
                          src={c.headshotUrl}
                          alt=""
                          width={36}
                          height={36}
                          className="h-9 w-9 rounded-full object-cover"
                          unoptimized
                        />
                      ) : (
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-200 text-xs font-medium text-slate-600">
                          {c.firstName[0]}
                          {c.lastName[0]}
                        </div>
                      )}
                      <span className="font-medium text-blue-700 hover:underline">
                        {c.firstName} {c.lastName}
                      </span>
                    </Link>
                  </td>
                  <td className="px-3 py-2">
                    <div>{c.jobTitle || "—"}</div>
                    <div className="text-xs text-slate-500">{c.company || ""}</div>
                  </td>
                  <td className="px-3 py-2">{c.email}</td>
                  <td className="px-3 py-2">
                    <div className="flex flex-wrap gap-1">
                      {(tagsByContact.get(c.id) ?? []).map((t) => (
                        <span
                          key={t.id}
                          className="rounded-full px-2 py-0.5 text-xs text-white"
                          style={{ backgroundColor: t.color }}
                        >
                          {t.name}
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardBody>
      </Card>
    </div>
  );
}
