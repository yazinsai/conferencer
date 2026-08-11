import Link from "next/link";
import { notFound } from "next/navigation";

import { requireOrganizer } from "@/lib/guards";
import { contactName, getContact, getEventContact } from "@/lib/repo/contacts";
import { submissionsForContact } from "@/lib/repo/submissions";
import { speakerFacingStatus, statusTone, speakerStatusTone } from "@/lib/status";
import { effectiveDue, isComplete, isOverdue, listAssignments } from "@/lib/repo/tasks";
import { listMessages } from "@/lib/repo/emails";
import { listUploads } from "@/lib/repo/uploads";
import { historyFor } from "@/lib/repo/audit";
import { SpeakerForm } from "@/components/admin/speaker-form";
import { invitePortalAction } from "@/server/speaker-actions";
import {
  Avatar,
  Button,
  Card,
  CardHeader,
  Chip,
  LinkButton,
  Notice,
  PageHeader,
  Progress,
  SubNav,
  Table,
  Td,
  Th,
} from "@/components/ui";
import { formatDate, formatRange, formatStamp } from "@/lib/datetime";
import { humanSize } from "@/lib/repo/uploads";

export const dynamic = "force-dynamic";

export default async function SpeakerDetail({
  params,
  searchParams,
}: PageProps<"/admin/e/[slug]/speakers/[contactId]">) {
  const { slug, contactId } = await params;
  const sp = await searchParams;
  const { event } = await requireOrganizer(slug);
  const contact = getContact(contactId);
  const eventContact = getEventContact(event.id, contactId);
  if (!contact || !eventContact) notFound();

  const tab = typeof sp.tab === "string" ? sp.tab : "profile";
  const base = `/admin/e/${slug}/speakers/${contact.id}`;
  const sessions = submissionsForContact(event.id, contact.id);
  const assignments = listAssignments(event.id, { contactId: contact.id });
  const done = assignments.filter((a) => isComplete(a.status)).length;
  const messages = listMessages(event.id, { contactId: contact.id });
  const uploads = listUploads(event.id, { contactId: contact.id });
  const history = historyFor("contact", contact.id);

  return (
    <div>
      <PageHeader
        breadcrumb={
          <Link href={`/admin/e/${slug}/speakers`} className="hover:underline">
            Speakers
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
          <>
            <Chip tone={speakerStatusTone(eventContact.speaker_status)}>
              {eventContact.speaker_status}
            </Chip>
            <form action={invitePortalAction}>
              <input type="hidden" name="slug" value={slug} />
              <input type="hidden" name="contact_id" value={contact.id} />
              <Button type="submit" size="sm">
                Send portal invite
              </Button>
            </form>
            <LinkButton
              href={`/admin/e/${slug}/emails/compose?contact=${contact.id}`}
              size="sm"
            >
              Email
            </LinkButton>
          </>
        }
      />

      {sp.saved ? <Notice tone="success" className="mb-4">Speaker saved.</Notice> : null}

      <SubNav
        current={tab === "profile" ? base : `${base}?tab=${tab}`}
        items={[
          { href: base, label: "Profile" },
          { href: `${base}?tab=sessions`, label: "Sessions", count: sessions.length },
          { href: `${base}?tab=tasks`, label: "Tasks", count: assignments.length },
          { href: `${base}?tab=files`, label: "Files", count: uploads.length },
          { href: `${base}?tab=comms`, label: "Communications", count: messages.length },
        ]}
      />

      {tab === "profile" ? (
        <div className="max-w-3xl">
          <SpeakerForm
            slug={slug}
            contact={contact}
            speakerStatus={eventContact.speaker_status}
          />
          {history.length ? (
            <Card className="mt-4">
              <CardHeader title="Change history" />
              <ul className="divide-y divide-slate-100">
                {history.slice(0, 10).map((entry) => (
                  <li key={entry.id} className="px-4 py-2 text-sm">
                    <p className="text-slate-700">{entry.summary ?? entry.action}</p>
                    <p className="text-xs text-slate-500">
                      {entry.actor_name} · {formatStamp(entry.created_at)}
                    </p>
                  </li>
                ))}
              </ul>
            </Card>
          ) : null}
        </div>
      ) : null}

      {tab === "sessions" ? (
        <Card>
          <CardHeader title="Sessions" description="Everything this speaker is attached to." />
          <Table className="rounded-none border-0">
            <thead>
              <tr>
                <Th>Title</Th>
                <Th>Status</Th>
                <Th>Track</Th>
                <Th>Format</Th>
                <Th>Scheduled</Th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((session) => (
                <tr key={session.id}>
                  <Td>
                    <Link
                      href={`/admin/e/${slug}/submissions/${session.id}`}
                      className="font-medium text-slate-900 hover:text-brand-700"
                    >
                      {session.title}
                    </Link>
                  </Td>
                  <Td>
                    <Chip tone={statusTone(session.status)}>
                      {speakerFacingStatus(session.status)}
                    </Chip>
                  </Td>
                  <Td className="text-sm">{session.track_name ?? "—"}</Td>
                  <Td className="text-sm">{session.format_name ?? "—"}</Td>
                  <Td className="text-xs">
                    {session.starts_at
                      ? `${formatRange(session.starts_at, session.ends_at)}${
                          session.room_name ? ` · ${session.room_name}` : ""
                        }`
                      : "Unscheduled"}
                  </Td>
                </tr>
              ))}
              {!sessions.length ? (
                <tr>
                  <Td colSpan={5} className="py-6 text-center text-slate-500">
                    No sessions yet.
                  </Td>
                </tr>
              ) : null}
            </tbody>
          </Table>
        </Card>
      ) : null}

      {tab === "tasks" ? (
        <Card>
          <CardHeader
            title="Onboarding tasks"
            description={`${done} of ${assignments.length} complete`}
            actions={
              <LinkButton href={`/admin/e/${slug}/tasks/deliverables`} size="sm">
                Deliverables dashboard
              </LinkButton>
            }
          />
          <div className="px-4 pt-3">
            <Progress value={done} max={Math.max(assignments.length, 1)} />
          </div>
          <Table className="rounded-none border-0">
            <thead>
              <tr>
                <Th>Task</Th>
                <Th>Type</Th>
                <Th>Due</Th>
                <Th>Status</Th>
                <Th>Files</Th>
              </tr>
            </thead>
            <tbody>
              {assignments.map((assignment) => (
                <tr key={assignment.id}>
                  <Td className="font-medium">{assignment.task_name}</Td>
                  <Td className="text-xs">{assignment.task_type}</Td>
                  <Td className="text-xs">
                    {effectiveDue(assignment) ? formatDate(effectiveDue(assignment)) : "—"}
                  </Td>
                  <Td>
                    <Chip
                      tone={
                        isComplete(assignment.status)
                          ? "green"
                          : isOverdue(assignment)
                            ? "red"
                            : "slate"
                      }
                    >
                      {isComplete(assignment.status)
                        ? "Complete"
                        : isOverdue(assignment)
                          ? "Overdue"
                          : "Outstanding"}
                    </Chip>
                  </Td>
                  <Td className="text-xs">{assignment.upload_count || "—"}</Td>
                </tr>
              ))}
              {!assignments.length ? (
                <tr>
                  <Td colSpan={5} className="py-6 text-center text-slate-500">
                    No tasks assigned.
                  </Td>
                </tr>
              ) : null}
            </tbody>
          </Table>
        </Card>
      ) : null}

      {tab === "files" ? (
        <Card>
          <CardHeader title="Files" description="Everything this speaker has uploaded." />
          <Table className="rounded-none border-0">
            <thead>
              <tr>
                <Th>File</Th>
                <Th>Kind</Th>
                <Th>Task</Th>
                <Th>Size</Th>
                <Th>Version</Th>
                <Th>Uploaded</Th>
                <Th />
              </tr>
            </thead>
            <tbody>
              {uploads.map((upload) => (
                <tr key={upload.id}>
                  <Td className="font-medium">{upload.filename}</Td>
                  <Td className="text-xs">{upload.kind}</Td>
                  <Td className="text-xs">{upload.task_name ?? "—"}</Td>
                  <Td className="text-xs">{humanSize(upload.size)}</Td>
                  <Td className="text-xs">v{upload.version}</Td>
                  <Td className="text-xs">{formatStamp(upload.created_at)}</Td>
                  <Td>
                    <a
                      href={`/f/${upload.id}?download=1`}
                      className="text-sm font-medium text-brand-700 hover:underline"
                    >
                      Download
                    </a>
                  </Td>
                </tr>
              ))}
              {!uploads.length ? (
                <tr>
                  <Td colSpan={7} className="py-6 text-center text-slate-500">
                    Nothing uploaded yet.
                  </Td>
                </tr>
              ) : null}
            </tbody>
          </Table>
        </Card>
      ) : null}

      {tab === "comms" ? (
        <Card>
          <CardHeader title="Communications history" description="Every message sent to this speaker." />
          <ul className="divide-y divide-slate-100">
            {messages.map((message) => (
              <li key={message.id} className="px-4 py-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <Link
                    href={`/admin/e/${slug}/emails?message=${message.id}`}
                    className="text-sm font-medium text-slate-900 hover:text-brand-700"
                  >
                    {message.subject}
                  </Link>
                  <span className="text-xs text-slate-500">
                    {message.template_key ?? "custom"} · {formatStamp(message.created_at)}
                  </span>
                </div>
              </li>
            ))}
            {!messages.length ? (
              <li className="px-4 py-6 text-sm text-slate-500">No messages yet.</li>
            ) : null}
          </ul>
        </Card>
      ) : null}
    </div>
  );
}
