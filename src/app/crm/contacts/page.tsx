import Link from "next/link";

import { requireAnyOrganizer } from "@/lib/guards";
import { readJson } from "@/lib/db";
import { contactName, listContactsForOrg } from "@/lib/repo/contacts";
import { findDuplicates, listSegments, PIPELINE_STAGES } from "@/lib/repo/crm";
import { listEvents } from "@/lib/repo/events";
import {
  crmBulkEmailAction,
  enrollAction,
  importContactsAction,
  mergeContactsAction,
  pushToEventAction,
  saveContactAction,
  saveSegmentAction,
} from "@/server/crm-actions";
import { CsvImporter } from "@/components/admin/csv-importer";
import { FilterSelect, SearchBox } from "@/components/client/basics";
import {
  Avatar,
  Button,
  Card,
  CardHeader,
  Chip,
  Field,
  Input,
  LinkButton,
  Notice,
  PageHeader,
  Select,
  Table,
  Td,
  Textarea,
  Th,
} from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function CrmDirectory({ searchParams }: PageProps<"/crm/contacts">) {
  const sp = await searchParams;
  const { event } = await requireAnyOrganizer();
  const orgId = event.org_id;
  const str = (key: string) => (typeof sp[key] === "string" ? (sp[key] as string) : "");

  const q = str("q");
  const company = str("company");
  const jobTitle = str("job_title");
  const tag = str("tag");
  const showDuplicates = str("duplicates") === "1";

  const all = listContactsForOrg(orgId);
  const contacts = listContactsForOrg(orgId, { q, company, jobTitle, tag });
  const companies = [...new Set(all.map((c) => c.company).filter(Boolean))] as string[];
  const tags = [...new Set(all.flatMap((c) => readJson<string[]>(c.tags, [])))];
  const duplicates = findDuplicates(orgId);
  const segments = listSegments(orgId);
  const events = listEvents().filter((e) => e.org_id === orgId);

  return (
    <div>
      <PageHeader
        title="Contact directory"
        description="Every speaker your organisation has ever worked with, across all events."
        actions={
          <>
            <LinkButton href="/crm/segments" size="sm">
              Segments ({segments.length})
            </LinkButton>
            <LinkButton href="/crm/pipeline" size="sm" variant="primary">
              Pipeline
            </LinkButton>
          </>
        }
      />

      {sp.created || sp.updated ? (
        <Notice tone="success" className="mb-4">
          Import complete: {String(sp.created ?? 0)} created, {String(sp.updated ?? 0)} updated.
        </Notice>
      ) : null}
      {sp.pushed ? (
        <Notice tone="success" className="mb-4">
          Added {String(sp.pushed)} contact(s) to {String(sp.event ?? "the event")} with their
          profile intact.
        </Notice>
      ) : null}
      {sp.sent ? (
        <Notice tone="success" className="mb-4">
          Sent {String(sp.sent)} message(s) — each one is in the event outbox.
        </Notice>
      ) : null}

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <SearchBox
          param="q"
          label="Search contacts"
          placeholder="Search name, email or company…"
          className="w-full sm:w-72"
        />
        <FilterSelect
          param="company"
          label="Company"
          allLabel="Any company"
          options={companies.map((c) => ({ value: c, label: c }))}
        />
        <FilterSelect
          param="job_title"
          label="Job title"
          allLabel="Any title"
          options={[...new Set(all.map((c) => c.job_title).filter(Boolean) as string[])].map((t) => ({
            value: t,
            label: t,
          }))}
        />
        {tags.length ? (
          <FilterSelect
            param="tag"
            label="Tag"
            allLabel="Any tag"
            options={tags.map((t) => ({ value: t, label: t }))}
          />
        ) : null}
        {q || company || jobTitle || tag ? (
          <LinkButton href="/crm/contacts" size="sm">
            Clear filters
          </LinkButton>
        ) : null}
        <span className="text-sm text-slate-500" role="status">
          {contacts.length} of {all.length} contacts
        </span>
      </div>

      {q || company || jobTitle || tag ? (
        <Card className="mb-4">
          <form action={saveSegmentAction} className="flex flex-wrap items-end gap-2 p-3">
            <input type="hidden" name="q" value={q} />
            <input type="hidden" name="company" value={company} />
            <input type="hidden" name="job_title" value={jobTitle} />
            <input type="hidden" name="tag" value={tag} />
            <Field label="Save this filter as a segment" name="name">
              <Input id="name" name="name" placeholder="AI Experts" className="w-56" required />
            </Field>
            <Field label="Type" name="kind">
              <Select id="kind" name="kind" defaultValue="dynamic">
                <option value="dynamic">Dynamic — updates itself</option>
                <option value="curated">Curated — snapshot</option>
              </Select>
            </Field>
            <Button type="submit" variant="secondary">
              Save segment
            </Button>
          </form>
        </Card>
      ) : null}

      {showDuplicates || duplicates.length ? (
        <Card className="mb-4">
          <CardHeader
            title="Possible duplicates"
            description="Same name, different email address. Merge keeps one record and repoints every session, task and message."
          />
          {duplicates.length ? (
            <ul className="divide-y divide-slate-100">
              {duplicates.map((group) => (
                <li key={group.name} className="px-4 py-3">
                  <form action={mergeContactsAction} className="flex flex-wrap items-end gap-3">
                    <div>
                      <p className="text-sm font-medium text-slate-900">{group.name}</p>
                      <p className="text-xs text-slate-500">
                        {group.contacts.map((c) => c.email).join(" · ")}
                      </p>
                    </div>
                    <Field label="Keep as primary" name="primary_id">
                      <Select id="primary_id" name="primary_id" className="w-64">
                        {group.contacts.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.email}
                          </option>
                        ))}
                      </Select>
                    </Field>
                    {group.contacts.map((c) => (
                      <input key={c.id} type="hidden" name="duplicate_ids" value={c.id} />
                    ))}
                    <Button type="submit" variant="secondary">
                      Merge into primary
                    </Button>
                  </form>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-4 py-4 text-sm text-slate-500">No duplicates detected.</p>
          )}
        </Card>
      ) : null}

      <form>
        <Table>
          <thead>
            <tr>
              <Th className="w-8" />
              <Th>Contact</Th>
              <Th>Job title</Th>
              <Th>Company</Th>
              <Th>Email</Th>
              <Th>Tags</Th>
              <Th />
            </tr>
          </thead>
          <tbody>
            {contacts.map((contact) => (
              <tr key={contact.id}>
                <Td>
                  <input
                    type="checkbox"
                    name="contact_ids"
                    value={contact.id}
                    aria-label={`Select ${contactName(contact)}`}
                  />
                </Td>
                <Td>
                  <div className="flex items-center gap-2">
                    <Avatar src={contact.headshot_url} name={contactName(contact)} size={28} />
                    <Link
                      href={`/crm/contacts/${contact.id}`}
                      className="font-medium text-slate-900 hover:text-brand-700"
                    >
                      {contactName(contact)}
                    </Link>
                  </div>
                </Td>
                <Td className="text-sm">{contact.job_title ?? "—"}</Td>
                <Td className="text-sm">{contact.company ?? "—"}</Td>
                <Td className="text-xs">{contact.email}</Td>
                <Td className="text-xs">
                  {readJson<string[]>(contact.tags, []).map((t) => (
                    <Chip key={t} tone="violet" className="mr-1">
                      {t}
                    </Chip>
                  ))}
                </Td>
                <Td>
                  <Link
                    href={`/crm/contacts/${contact.id}`}
                    className="text-xs font-medium text-brand-700 hover:underline"
                  >
                    Open
                  </Link>
                </Td>
              </tr>
            ))}
            {!contacts.length ? (
              <tr>
                <Td colSpan={7} className="py-8 text-center text-slate-500">
                  No contacts match those filters.
                </Td>
              </tr>
            ) : null}
          </tbody>
        </Table>

        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          <Card>
            <CardHeader title="Enrol selected in the pipeline" />
            <div className="space-y-2 p-3">
              <Select name="stage" defaultValue="researching" aria-label="Stage">
                {PIPELINE_STAGES.map((stage) => (
                  <option key={stage.key} value={stage.key}>
                    {stage.label}
                  </option>
                ))}
              </Select>
              <Input name="score" type="number" min={1} max={5} placeholder="Score 1–5 (optional)" />
              <Input name="rationale" placeholder="Why them? (optional)" />
              <Button type="submit" formAction={enrollAction} variant="primary" className="w-full">
                Enrol in pipeline
              </Button>
            </div>
          </Card>

          <Card>
            <CardHeader title="Add selected to an event" />
            <div className="space-y-2 p-3">
              <Select name="event_id" aria-label="Event">
                {events.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.name}
                  </option>
                ))}
              </Select>
              <Button type="submit" formAction={pushToEventAction} variant="primary" className="w-full">
                Add to event speakers
              </Button>
              <p className="text-xs text-slate-500">
                Name, email, title, company and bio carry across — nothing to re-type.
              </p>
            </div>
          </Card>

          <Card>
            <CardHeader title="Email selected" />
            <div className="space-y-2 p-3">
              <Input name="subject" defaultValue="Speak at DevFlow Conf 2027?" aria-label="Subject" />
              <Textarea
                name="body"
                rows={4}
                aria-label="Body"
                defaultValue={"<p>Hi {first_name},</p><p>We are putting together the {event_name} programme and would love a proposal from you.</p>"}
              />
              <Button type="submit" formAction={crmBulkEmailAction} variant="primary" className="w-full">
                Send email
              </Button>
              <p className="text-xs text-slate-500">
                Merge fields: {"{first_name} {speaker_name} {event_name}"}
              </p>
            </div>
          </Card>
        </div>
      </form>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div>
          <h2 className="mb-2 text-sm font-semibold text-slate-900">Import contacts</h2>
          <CsvImporter slug="crm" action={importContactsAction} />
        </div>
        <Card>
          <CardHeader title="Add a contact" />
          <form action={saveContactAction} className="grid gap-3 p-4 sm:grid-cols-2">
            <Field label="First name" name="first_name">
              <Input id="first_name" name="first_name" />
            </Field>
            <Field label="Last name" name="last_name">
              <Input id="last_name" name="last_name" />
            </Field>
            <Field label="Email" name="email" required>
              <Input id="email" name="email" type="email" required />
            </Field>
            <Field label="Job title" name="job_title">
              <Input id="job_title" name="job_title" />
            </Field>
            <Field label="Company" name="company">
              <Input id="company" name="company" />
            </Field>
            <Field label="Tags" name="tags" hint="Comma separated.">
              <Input id="tags" name="tags" placeholder="AI, keynote" />
            </Field>
            <div className="sm:col-span-2">
              <Button type="submit" variant="primary">
                Add contact
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
