import Link from "next/link";
import { and, desc, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { requireCrmAccess } from "@/lib/auth/crm-guards";
import { getContactEventHistory, getContactTags } from "@/lib/crm/queries";
import { CRM_STAGE_LABELS } from "@/lib/crm/types";
import { getDb, schema } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import {
  addCrmNoteAction,
  addToPipelineAction,
  createCrmTagAction,
  pushToEventAction,
  saveCrmContactAction,
  toggleContactTagAction,
} from "../../actions";

export default async function CrmContactDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: contactId } = await params;
  const { orgId, orgEvents } = await requireCrmAccess();
  const db = getDb();

  const contact = db
    .select()
    .from(schema.contacts)
    .where(and(eq(schema.contacts.id, contactId), eq(schema.contacts.orgId, orgId)))
    .get();

  if (!contact) notFound();

  const notes = db
    .select({
      note: schema.crmNotes,
      author: schema.users,
    })
    .from(schema.crmNotes)
    .innerJoin(schema.users, eq(schema.crmNotes.authorUserId, schema.users.id))
    .where(eq(schema.crmNotes.contactId, contactId))
    .orderBy(desc(schema.crmNotes.createdAt))
    .all();

  const allTags = db
    .select()
    .from(schema.crmTags)
    .where(eq(schema.crmTags.orgId, orgId))
    .orderBy(schema.crmTags.name)
    .all();

  const contactTags = getContactTags([contactId]).get(contactId) ?? [];
  const contactTagIds = new Set(contactTags.map((t) => t.id));

  const pipelineCard = db
    .select()
    .from(schema.crmPipelineCards)
    .where(
      and(
        eq(schema.crmPipelineCards.orgId, orgId),
        eq(schema.crmPipelineCards.contactId, contactId),
      ),
    )
    .get();

  const stageHistory = pipelineCard
    ? db
        .select({
          entry: schema.crmStageHistory,
          actor: schema.users,
        })
        .from(schema.crmStageHistory)
        .innerJoin(schema.users, eq(schema.crmStageHistory.actorUserId, schema.users.id))
        .where(eq(schema.crmStageHistory.cardId, pipelineCard.id))
        .orderBy(desc(schema.crmStageHistory.createdAt))
        .all()
    : [];

  const { eventLinks, submissions } = getContactEventHistory(contactId);

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/crm/contacts" className="text-sm text-blue-700 hover:underline">
          ← Contacts
        </Link>
        <h1 className="mt-1 text-2xl font-semibold">
          {contact.firstName} {contact.lastName}
        </h1>
        <p className="text-slate-600">{contact.email}</p>
        {pipelineCard ? (
          <p className="mt-1 text-sm text-slate-500">
            Pipeline:{" "}
            <Badge>
              {CRM_STAGE_LABELS[pipelineCard.stage as keyof typeof CRM_STAGE_LABELS] ??
                pipelineCard.stage}
            </Badge>
          </p>
        ) : null}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Profile" />
          <CardBody>
            <form action={saveCrmContactAction} className="space-y-3">
              <input type="hidden" name="contactId" value={contactId} />
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <Label htmlFor="firstName">First name</Label>
                  <Input id="firstName" name="firstName" defaultValue={contact.firstName} required />
                </div>
                <div>
                  <Label htmlFor="lastName">Last name</Label>
                  <Input id="lastName" name="lastName" defaultValue={contact.lastName} required />
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" type="email" defaultValue={contact.email} required />
                </div>
                <div>
                  <Label htmlFor="jobTitle">Job title</Label>
                  <Input id="jobTitle" name="jobTitle" defaultValue={contact.jobTitle ?? ""} />
                </div>
                <div>
                  <Label htmlFor="company">Company</Label>
                  <Input id="company" name="company" defaultValue={contact.company ?? ""} />
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="biography">Biography</Label>
                  <Textarea
                    id="biography"
                    name="biography"
                    rows={4}
                    defaultValue={contact.biography ?? ""}
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" name="phone" defaultValue={contact.phone ?? ""} />
                </div>
                <div>
                  <Label htmlFor="headshotUrl">Headshot URL</Label>
                  <Input id="headshotUrl" name="headshotUrl" defaultValue={contact.headshotUrl ?? ""} />
                </div>
              </div>
              <Button type="submit">Save profile</Button>
            </form>
          </CardBody>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader title="Tags" />
            <CardBody className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {allTags.map((tag) => {
                  const assigned = contactTagIds.has(tag.id);
                  return (
                    <form key={tag.id} action={toggleContactTagAction}>
                      <input type="hidden" name="contactId" value={contactId} />
                      <input type="hidden" name="tagId" value={tag.id} />
                      <input type="hidden" name="action" value={assigned ? "remove" : "add"} />
                      <button
                        type="submit"
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          assigned
                            ? "text-white"
                            : "border border-slate-200 text-slate-600 hover:bg-slate-50"
                        }`}
                        style={assigned ? { backgroundColor: tag.color } : undefined}
                      >
                        {tag.name} {assigned ? "✕" : "+"}
                      </button>
                    </form>
                  );
                })}
              </div>
              <form action={createCrmTagAction} className="flex items-end gap-2">
                <div>
                  <Label htmlFor="tagName">New tag</Label>
                  <Input id="tagName" name="name" placeholder="Tag name" required />
                </div>
                <div>
                  <Label htmlFor="tagColor">Color</Label>
                  <Input id="tagColor" name="color" type="color" defaultValue="#94a3b8" className="h-10 w-14" />
                </div>
                <Button type="submit" variant="secondary">
                  Add tag
                </Button>
              </form>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Push to event" />
            <CardBody>
              <form action={pushToEventAction} className="flex items-end gap-2">
                <input type="hidden" name="contactId" value={contactId} />
                <div className="flex-1">
                  <Label htmlFor="eventId">Event</Label>
                  <Select id="eventId" name="eventId" required defaultValue={orgEvents[0]?.id ?? ""}>
                    {orgEvents.map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.name}
                      </option>
                    ))}
                  </Select>
                </div>
                <Button type="submit">Push to event</Button>
              </form>
              {!pipelineCard ? (
                <form action={addToPipelineAction} className="mt-3">
                  <input type="hidden" name="contactId" value={contactId} />
                  <Button type="submit" variant="secondary">
                    Add to pipeline
                  </Button>
                </form>
              ) : null}
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Notes" subtitle={`${notes.length} note${notes.length === 1 ? "" : "s"}`} />
            <CardBody className="space-y-4">
              <form action={addCrmNoteAction} className="space-y-2">
                <input type="hidden" name="contactId" value={contactId} />
                <Label htmlFor="noteBody">Add note</Label>
                <Textarea id="noteBody" name="body" rows={3} required placeholder="Internal note…" />
                <Button type="submit" variant="secondary">
                  Save note
                </Button>
              </form>
              {notes.length === 0 ? (
                <p className="text-sm text-slate-500">No notes yet.</p>
              ) : (
                <ul className="space-y-3">
                  {notes.map(({ note, author }) => (
                    <li key={note.id} className="rounded-lg border border-slate-200 p-3">
                      <div className="text-xs text-slate-500">
                        {author.firstName} {author.lastName} ·{" "}
                        {new Date(note.createdAt).toLocaleString()}
                      </div>
                      <p className="mt-1 whitespace-pre-wrap text-sm">{note.body}</p>
                    </li>
                  ))}
                </ul>
              )}
            </CardBody>
          </Card>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Event history" subtitle={`${eventLinks.length} event${eventLinks.length === 1 ? "" : "s"}`} />
          <CardBody className="space-y-3">
            {eventLinks.length === 0 ? (
              <p className="text-sm text-slate-500">Not linked to any events yet.</p>
            ) : (
              eventLinks.map(({ event, eventContact }) => (
                <div
                  key={eventContact.id}
                  className="flex items-center justify-between border-b border-slate-100 pb-3 last:border-0"
                >
                  <div>
                    <Link
                      href={`/admin/e/${event.slug}/speakers/${contactId}`}
                      className="font-medium text-blue-700 hover:underline"
                    >
                      {event.name}
                    </Link>
                    <div className="text-xs text-slate-500 capitalize">
                      {eventContact.speakerStatus}
                    </div>
                  </div>
                  <Badge>{eventContact.status}</Badge>
                </div>
              ))
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Submissions" subtitle={`${submissions.length} linked`} />
          <CardBody className="space-y-3">
            {submissions.length === 0 ? (
              <p className="text-sm text-slate-500">No submissions linked.</p>
            ) : (
              submissions.map(({ submission, event, role }) => (
                <div
                  key={`${submission.id}-${role}`}
                  className="border-b border-slate-100 pb-3 last:border-0"
                >
                  <Link
                    href={`/admin/e/${event.slug}/submissions/${submission.id}`}
                    className="font-medium text-blue-700 hover:underline"
                  >
                    {submission.title}
                  </Link>
                  <div className="text-xs text-slate-500">
                    {event.name} · {role} · {submission.status}
                  </div>
                </div>
              ))
            )}
          </CardBody>
        </Card>
      </div>

      {stageHistory.length > 0 ? (
        <Card>
          <CardHeader title="Pipeline stage history" />
          <CardBody>
            <ul className="space-y-2 text-sm">
              {stageHistory.map(({ entry, actor }) => (
                <li key={entry.id} className="rounded bg-slate-50 p-2">
                  <div className="text-xs text-slate-500">
                    {new Date(entry.createdAt).toLocaleString()} · {actor.firstName}{" "}
                    {actor.lastName}
                  </div>
                  <div>
                    {entry.fromStage ?? "—"} → {entry.toStage}
                  </div>
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>
      ) : null}
    </div>
  );
}
