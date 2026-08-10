import Link from "next/link";
import { notFound } from "next/navigation";

import { requireAnyOrganizer } from "@/lib/guards";
import { readJson } from "@/lib/db";
import { contactName, getContact } from "@/lib/repo/contacts";
import { contactEvents, listEvents as listPipelineEvents, listPipeline } from "@/lib/repo/crm";
import { listEvents } from "@/lib/repo/events";
import { listMessages } from "@/lib/repo/emails";
import { saveContactAction, enrollAction, pushToEventAction } from "@/server/crm-actions";
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
  Textarea,
} from "@/components/ui";
import { formatStamp } from "@/lib/datetime";
import { PIPELINE_STAGES } from "@/lib/repo/crm";

export const dynamic = "force-dynamic";

export default async function CrmContactPage({
  params,
  searchParams,
}: PageProps<"/crm/contacts/[id]">) {
  const { id } = await params;
  const sp = await searchParams;
  const { event } = await requireAnyOrganizer();
  const contact = getContact(id);
  if (!contact || contact.org_id !== event.org_id) notFound();

  const tags = readJson<string[]>(contact.tags, []);
  const custom = readJson<Record<string, string>>(contact.custom, {});
  const events = contactEvents(contact.id);
  const orgEvents = listEvents().filter((e) => e.org_id === event.org_id);
  const entry = listPipeline(event.org_id).find((row) => row.contact_id === contact.id);
  const timeline = entry ? listPipelineEvents(entry.id) : [];
  const messages = listMessages(event.id, { contactId: contact.id });

  return (
    <div>
      <PageHeader
        breadcrumb={
          <Link href="/crm/contacts" className="hover:underline">
            Directory
          </Link>
        }
        title={
          <span className="flex items-center gap-3">
            <Avatar src={contact.headshot_url} name={contactName(contact)} size={40} />
            {contactName(contact)}
          </span>
        }
        description={[contact.job_title, contact.company].filter(Boolean).join(", ")}
        actions={
          entry ? (
            <Chip tone="blue">In pipeline · {entry.stage.replace("_", " ")}</Chip>
          ) : (
            <form action={enrollAction}>
              <input type="hidden" name="contact_id" value={contact.id} />
              <input type="hidden" name="stage" value="researching" />
              <Button type="submit" size="sm" variant="primary">
                Add to sourcing pipeline
              </Button>
            </form>
          )
        }
      />

      {sp.saved ? <Notice tone="success" className="mb-4">Contact saved.</Notice> : null}
      {sp.merged ? (
        <Notice tone="success" className="mb-4">
          Merged {String(sp.merged)} duplicate record(s) into this contact.
        </Notice>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Card>
            <CardHeader title="Profile" />
            <form action={saveContactAction} className="grid gap-3 p-4 sm:grid-cols-2">
              <input type="hidden" name="contact_id" value={contact.id} />
              <Field label="First name" name="first_name">
                <Input id="first_name" name="first_name" defaultValue={contact.first_name} />
              </Field>
              <Field label="Last name" name="last_name">
                <Input id="last_name" name="last_name" defaultValue={contact.last_name} />
              </Field>
              <Field label="Email" name="email" required>
                <Input id="email" name="email" type="email" defaultValue={contact.email} required />
              </Field>
              <Field label="Job title" name="job_title">
                <Input id="job_title" name="job_title" defaultValue={contact.job_title ?? ""} />
              </Field>
              <Field label="Company" name="company">
                <Input id="company" name="company" defaultValue={contact.company ?? ""} />
              </Field>
              <Field label="Tags" name="tags" hint="Comma separated.">
                <Input id="tags" name="tags" defaultValue={tags.join(", ")} />
              </Field>
              <Field label="Speaker type" name="custom_speaker_type" hint="Custom field.">
                <Select
                  id="custom_speaker_type"
                  name="custom_speaker_type"
                  defaultValue={custom.speaker_type ?? ""}
                >
                  <option value="">—</option>
                  <option value="Internal">Internal</option>
                  <option value="External">External</option>
                  <option value="Sponsor">Sponsor</option>
                </Select>
              </Field>
              <Field label="Area of focus" name="custom_focus_area" hint="Custom field.">
                <Input
                  id="custom_focus_area"
                  name="custom_focus_area"
                  defaultValue={custom.focus_area ?? ""}
                />
              </Field>
              <Field label="LinkedIn" name="linkedin_url">
                <Input id="linkedin_url" name="linkedin_url" defaultValue={contact.linkedin_url ?? ""} />
              </Field>
              <Field label="X" name="twitter_url">
                <Input id="twitter_url" name="twitter_url" defaultValue={contact.twitter_url ?? ""} />
              </Field>
              <div className="sm:col-span-2">
                <Field label="Biography" name="biography">
                  <Textarea
                    id="biography"
                    name="biography"
                    rows={5}
                    defaultValue={contact.biography ?? ""}
                  />
                </Field>
              </div>
              <div className="sm:col-span-2">
                <Field
                  label="Internal notes"
                  name="notes"
                  hint="Only the organising team sees this."
                >
                  <Textarea id="notes" name="notes" rows={4} defaultValue={contact.notes ?? ""} />
                </Field>
              </div>
              <div className="sm:col-span-2">
                <Button type="submit" variant="primary">
                  Save contact
                </Button>
              </div>
            </form>
          </Card>

          <Card>
            <CardHeader
              title="Cross-event history"
              description="Every event this person has been connected to."
            />
            <ul className="divide-y divide-slate-100">
              {events.map((row) => (
                <li key={row.event_id} className="flex items-center justify-between px-4 py-2.5 text-sm">
                  <Link
                    href={`/admin/e/${row.slug}/speakers`}
                    className="font-medium text-slate-800 hover:text-brand-700"
                  >
                    {row.event_name}
                  </Link>
                  <span className="text-xs text-slate-500">
                    {row.sessions} session{row.sessions === 1 ? "" : "s"} · {row.speaker_status}
                  </span>
                </li>
              ))}
              {!events.length ? (
                <li className="px-4 py-4 text-sm text-slate-500">
                  Not connected to any event yet.
                </li>
              ) : null}
            </ul>
            <form action={pushToEventAction} className="flex flex-wrap items-end gap-2 border-t border-slate-200 p-4">
              <input type="hidden" name="contact_id" value={contact.id} />
              <Field label="Add to an event" name="event_id">
                <Select id="event_id" name="event_id" className="w-64">
                  {orgEvents.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.name}
                    </option>
                  ))}
                </Select>
              </Field>
              <Button type="submit" variant="primary">
                Add to event
              </Button>
            </form>
          </Card>
        </div>

        <div className="space-y-4">
          {entry ? (
            <Card>
              <CardHeader title="Pipeline" description={`Stage: ${entry.stage.replace("_", " ")}`} />
              <div className="p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Stage history
                </p>
                <ul className="mt-2 space-y-2 text-sm">
                  {timeline.map((item) => (
                    <li key={item.id}>
                      {item.kind === "note" ? (
                        <p className="text-slate-700">{item.body}</p>
                      ) : (
                        <p className="text-slate-700">
                          {item.from_stage ? `${item.from_stage} → ` : "enrolled at "}
                          <strong>{item.to_stage}</strong>
                        </p>
                      )}
                      <p className="text-xs text-slate-400">
                        {item.actor_name} · {formatStamp(item.created_at)}
                      </p>
                    </li>
                  ))}
                </ul>
                <LinkButton href="/crm/pipeline" size="sm" className="mt-3">
                  Open the board
                </LinkButton>
              </div>
            </Card>
          ) : null}

          <Card>
            <CardHeader title="Communications" description={`${messages.length} messages`} />
            <ul className="divide-y divide-slate-100">
              {messages.slice(0, 8).map((message) => (
                <li key={message.id} className="px-4 py-2 text-sm">
                  <p className="font-medium text-slate-800">{message.subject}</p>
                  <p className="text-xs text-slate-500">{formatStamp(message.created_at)}</p>
                </li>
              ))}
              {!messages.length ? (
                <li className="px-4 py-4 text-sm text-slate-500">Nothing sent yet.</li>
              ) : null}
            </ul>
          </Card>

          {!entry ? (
            <Card>
              <CardHeader title="Sourcing" />
              <form action={enrollAction} className="space-y-2 p-4">
                <input type="hidden" name="contact_id" value={contact.id} />
                <Select name="stage" defaultValue="researching" aria-label="Stage">
                  {PIPELINE_STAGES.map((stage) => (
                    <option key={stage.key} value={stage.key}>
                      {stage.label}
                    </option>
                  ))}
                </Select>
                <Input name="score" type="number" min={1} max={5} placeholder="Score 1–5" />
                <Input name="rationale" placeholder="Why them?" />
                <Button type="submit" variant="primary" className="w-full">
                  Enrol in pipeline
                </Button>
              </form>
            </Card>
          ) : null}
        </div>
      </div>
    </div>
  );
}
