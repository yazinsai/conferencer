import Image from "next/image";
import Link from "next/link";
import { and, desc, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { requireEventRole } from "@/lib/auth/guards";
import { getDb, schema } from "@/lib/db";
import { speakerFacingStatus, statusBadgeClass } from "@/lib/domain/status";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import {
  saveSpeakerProfileAction,
  updateSpeakerStatusAction,
} from "../actions";

const SPEAKER_STATUSES = [
  "prospect",
  "invited",
  "confirmed",
  "declined",
  "cancelled",
] as const;

function taskStatusClass(status: string) {
  switch (status) {
    case "complete":
    case "approved":
      return "bg-emerald-100 text-emerald-800";
    case "in_progress":
      return "bg-blue-100 text-blue-800";
    case "rejected":
      return "bg-rose-100 text-rose-800";
    default:
      return "bg-slate-100 text-slate-700";
  }
}

export default async function SpeakerDetailPage({
  params,
}: {
  params: Promise<{ slug: string; contactId: string }>;
}) {
  const { slug, contactId } = await params;
  const { event } = await requireEventRole(slug, ["organizer"]);
  const db = getDb();

  const row = db
    .select({
      contact: schema.contacts,
      eventContact: schema.eventContacts,
    })
    .from(schema.eventContacts)
    .innerJoin(schema.contacts, eq(schema.eventContacts.contactId, schema.contacts.id))
    .where(
      and(
        eq(schema.eventContacts.eventId, event.id),
        eq(schema.eventContacts.contactId, contactId),
      ),
    )
    .get();

  if (!row) notFound();

  const sessions = db
    .select({
      id: schema.submissions.id,
      title: schema.submissions.title,
      status: schema.submissions.status,
      role: schema.submissionParticipants.role,
    })
    .from(schema.submissionParticipants)
    .innerJoin(
      schema.submissions,
      eq(schema.submissionParticipants.submissionId, schema.submissions.id),
    )
    .where(
      and(
        eq(schema.submissionParticipants.contactId, contactId),
        eq(schema.submissions.eventId, event.id),
      ),
    )
    .orderBy(desc(schema.submissions.updatedAt))
    .all();

  const tasks = db
    .select({
      assignment: schema.taskAssignments,
      task: schema.tasks,
    })
    .from(schema.taskAssignments)
    .innerJoin(schema.tasks, eq(schema.taskAssignments.taskId, schema.tasks.id))
    .where(
      and(
        eq(schema.taskAssignments.eventId, event.id),
        eq(schema.taskAssignments.contactId, contactId),
      ),
    )
    .all();

  const c = row.contact;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link
            href={`/admin/e/${slug}/speakers`}
            className="text-sm text-blue-700 hover:underline"
          >
            ← Speakers
          </Link>
          <h1 className="mt-1 text-2xl font-semibold">
            {c.firstName} {c.lastName}
          </h1>
          <p className="text-slate-600">{c.email}</p>
        </div>
        <form action={updateSpeakerStatusAction} className="flex items-end gap-2">
          <input type="hidden" name="slug" value={slug} />
          <input type="hidden" name="contactId" value={contactId} />
          <div>
            <Label htmlFor="speakerStatus">Speaker status</Label>
            <Select
              id="speakerStatus"
              name="speakerStatus"
              defaultValue={row.eventContact.speakerStatus}
            >
              {SPEAKER_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </Select>
          </div>
          <Button type="submit" variant="secondary">
            Update status
          </Button>
        </form>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Profile" />
          <CardBody>
            {c.headshotUrl ? (
              <Image
                src={c.headshotUrl}
                alt=""
                width={80}
                height={80}
                className="mb-4 h-20 w-20 rounded-full object-cover"
                unoptimized
              />
            ) : null}
            <form action={saveSpeakerProfileAction} className="space-y-3">
              <input type="hidden" name="slug" value={slug} />
              <input type="hidden" name="contactId" value={contactId} />
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <Label htmlFor="firstName">First name</Label>
                  <Input id="firstName" name="firstName" defaultValue={c.firstName} required />
                </div>
                <div>
                  <Label htmlFor="lastName">Last name</Label>
                  <Input id="lastName" name="lastName" defaultValue={c.lastName} required />
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" type="email" defaultValue={c.email} required />
                </div>
                <div>
                  <Label htmlFor="jobTitle">Job title</Label>
                  <Input id="jobTitle" name="jobTitle" defaultValue={c.jobTitle ?? ""} />
                </div>
                <div>
                  <Label htmlFor="company">Company</Label>
                  <Input id="company" name="company" defaultValue={c.company ?? ""} />
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="biography">Biography</Label>
                  <Textarea
                    id="biography"
                    name="biography"
                    rows={4}
                    defaultValue={c.biography ?? ""}
                  />
                </div>
                <div>
                  <Label htmlFor="headshotUrl">Headshot URL</Label>
                  <Input id="headshotUrl" name="headshotUrl" defaultValue={c.headshotUrl ?? ""} />
                </div>
                <div>
                  <Label htmlFor="pronouns">Pronouns</Label>
                  <Input id="pronouns" name="pronouns" defaultValue={c.pronouns ?? ""} />
                </div>
              </div>
              <Button type="submit">Save profile</Button>
            </form>
          </CardBody>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader title="Sessions" subtitle={`${sessions.length} linked`} />
            <CardBody className="space-y-3">
              {sessions.length === 0 ? (
                <p className="text-sm text-slate-500">No sessions linked.</p>
              ) : (
                sessions.map((s) => (
                  <div
                    key={s.id}
                    className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3 last:border-0"
                  >
                    <div>
                      <Link
                        href={`/admin/e/${slug}/submissions/${s.id}`}
                        className="font-medium text-blue-700 hover:underline"
                      >
                        {s.title}
                      </Link>
                      <div className="text-xs text-slate-500 capitalize">{s.role}</div>
                    </div>
                    <Badge className={statusBadgeClass(s.status)}>
                      {speakerFacingStatus(s.status)}
                    </Badge>
                  </div>
                ))
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Tasks" subtitle={`${tasks.length} assigned`} />
            <CardBody className="space-y-3">
              {tasks.length === 0 ? (
                <p className="text-sm text-slate-500">No tasks assigned.</p>
              ) : (
                tasks.map(({ assignment, task }) => (
                  <div
                    key={assignment.id}
                    className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3 last:border-0"
                  >
                    <div>
                      <div className="font-medium">{task.name}</div>
                      {assignment.dueAt ? (
                        <div className="text-xs text-slate-500">
                          Due {new Date(assignment.dueAt).toLocaleDateString()}
                        </div>
                      ) : null}
                    </div>
                    <Badge className={taskStatusClass(assignment.status)}>
                      {assignment.status.replace(/_/g, " ")}
                    </Badge>
                  </div>
                ))
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
