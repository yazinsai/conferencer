import Image from "next/image";
import Link from "next/link";
import { and, count, eq, like, or, sql } from "drizzle-orm";
import { requireEventRole } from "@/lib/auth/guards";
import { getDb, schema } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Input, Label, Select } from "@/components/ui/input";
import { addSpeakerAction, sendBulkSpeakerEmailAction } from "./actions";
import { SpeakersBulkEmailFields } from "./speakers-bulk-email";
import { SpeakersImportForm } from "./speakers-import-form";
import { SpeakerStatusSelect } from "./speaker-status-select";

const STATUSES = [
  { key: "all", label: "All" },
  { key: "prospect", label: "Prospect" },
  { key: "invited", label: "Invited" },
  { key: "confirmed", label: "Confirmed" },
  { key: "declined", label: "Declined" },
  { key: "cancelled", label: "Cancelled" },
] as const;

export default async function SpeakersPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  const { slug } = await params;
  const sp = await searchParams;
  const { event } = await requireEventRole(slug, ["organizer"]);
  const db = getDb();

  const filters = [eq(schema.eventContacts.eventId, event.id)];
  if (sp.status && sp.status !== "all") {
    filters.push(eq(schema.eventContacts.speakerStatus, sp.status));
  }
  if (sp.q) {
    const q = `%${sp.q}%`;
    filters.push(
      or(
        like(schema.contacts.firstName, q),
        like(schema.contacts.lastName, q),
        like(schema.contacts.email, q),
        like(schema.contacts.company, q),
        like(schema.contacts.jobTitle, q),
      )!,
    );
  }

  const speakers = db
    .select({
      contact: schema.contacts,
      eventContact: schema.eventContacts,
    })
    .from(schema.eventContacts)
    .innerJoin(schema.contacts, eq(schema.eventContacts.contactId, schema.contacts.id))
    .where(and(...filters))
    .orderBy(schema.contacts.lastName, schema.contacts.firstName)
    .all();

  const enriched = speakers.map(({ contact, eventContact }) => {
    const sessionCount = db
      .select({ c: count() })
      .from(schema.submissionParticipants)
      .innerJoin(
        schema.submissions,
        eq(schema.submissionParticipants.submissionId, schema.submissions.id),
      )
      .where(
        and(
          eq(schema.submissionParticipants.contactId, contact.id),
          eq(schema.submissions.eventId, event.id),
        ),
      )
      .get()?.c;

    const taskStats = db
      .select({
        total: count(),
        complete: sql<number>`sum(case when ${schema.taskAssignments.status} in ('complete','approved') then 1 else 0 end)`,
      })
      .from(schema.taskAssignments)
      .where(
        and(
          eq(schema.taskAssignments.eventId, event.id),
          eq(schema.taskAssignments.contactId, contact.id),
        ),
      )
      .get();

    return {
      contact,
      eventContact,
      sessionCount: Number(sessionCount ?? 0),
      tasksTotal: Number(taskStats?.total ?? 0),
      tasksComplete: Number(taskStats?.complete ?? 0),
    };
  });

  const allEventContacts = db
    .select({ speakerStatus: schema.eventContacts.speakerStatus })
    .from(schema.eventContacts)
    .where(eq(schema.eventContacts.eventId, event.id))
    .all();
  const counts: Record<string, number> = { all: allEventContacts.length };
  for (const ec of allEventContacts) {
    counts[ec.speakerStatus] = (counts[ec.speakerStatus] ?? 0) + 1;
  }

  const emailTemplates = db
    .select({
      key: schema.emailTemplates.key,
      subject: schema.emailTemplates.subject,
      bodyHtml: schema.emailTemplates.bodyHtml,
    })
    .from(schema.emailTemplates)
    .where(eq(schema.emailTemplates.eventId, event.id))
    .all();

  const sampleSpeaker = enriched[0]?.contact ?? {
    firstName: "Alex",
    lastName: "Speaker",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Speakers</h1>
        <p className="text-slate-600">
          Speaker roster, profiles, and onboarding progress.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {STATUSES.map((s) => (
          <Link
            key={s.key}
            href={`/admin/e/${slug}/speakers?status=${s.key}${sp.q ? `&q=${encodeURIComponent(sp.q)}` : ""}`}
            className={`rounded-full px-3 py-1.5 text-sm ${
              (sp.status ?? "all") === s.key
                ? "bg-blue-600 text-white"
                : "border border-slate-200 bg-white text-slate-700"
            }`}
          >
            {s.label} ({counts[s.key] ?? 0})
          </Link>
        ))}
      </div>

      <form className="flex gap-2">
        <input type="hidden" name="status" value={sp.status ?? "all"} />
        <Input
          name="q"
          defaultValue={sp.q ?? ""}
          placeholder="Search name, email, company…"
          className="max-w-md"
        />
        <Button type="submit" variant="secondary">
          Search
        </Button>
      </form>

      <SpeakersImportForm slug={slug} />

      <Card>
        <CardHeader title={`${enriched.length} speakers`} />
        <CardBody className="overflow-x-auto p-0">
          <form id="bulk-speaker-email" action={sendBulkSpeakerEmailAction}>
            <input type="hidden" name="slug" value={slug} />
            <SpeakersBulkEmailFields
              templates={emailTemplates}
              eventName={event.name}
              sampleSpeaker={sampleSpeaker}
            />
            <div className="flex items-center gap-2 border-b border-slate-100 px-4 py-2">
              <Button type="submit">Send email</Button>
              <span className="text-xs text-slate-500">
                Select speakers below, then send
              </span>
            </div>
          </form>
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-3 py-2"> </th>
                <th className="px-3 py-2">Speaker</th>
                <th className="px-3 py-2">Title / Company</th>
                <th className="px-3 py-2">Email</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Logistics</th>
                <th className="px-3 py-2">Sessions</th>
                <th className="px-3 py-2">Tasks</th>
              </tr>
            </thead>
            <tbody>
              {enriched.map((s) => (
                <tr
                  key={s.contact.id}
                  className="border-t border-slate-100 hover:bg-slate-50"
                >
                  <td className="px-3 py-2">
                    <input
                      type="checkbox"
                      name="contactIds"
                      value={s.contact.id}
                      form="bulk-speaker-email"
                      className="rounded"
                    />
                  </td>
                    <td className="px-3 py-2">
                      <Link
                        href={`/admin/e/${slug}/speakers/${s.contact.id}`}
                        className="flex items-center gap-3"
                      >
                        {s.contact.headshotUrl ? (
                          <Image
                            src={s.contact.headshotUrl}
                            alt=""
                            width={36}
                            height={36}
                            className="h-9 w-9 rounded-full object-cover"
                            unoptimized
                          />
                        ) : (
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-200 text-xs font-medium text-slate-600">
                            {s.contact.firstName[0]}
                            {s.contact.lastName[0]}
                          </div>
                        )}
                        <span className="font-medium text-blue-700 hover:underline">
                          {s.contact.firstName} {s.contact.lastName}
                        </span>
                      </Link>
                    </td>
                    <td className="px-3 py-2">
                      <div>{s.contact.jobTitle || "—"}</div>
                      <div className="text-xs text-slate-500">
                        {s.contact.company || ""}
                      </div>
                    </td>
                    <td className="px-3 py-2">{s.contact.email}</td>
                    <td className="px-3 py-2">
                      <SpeakerStatusSelect
                        slug={slug}
                        contactId={s.contact.id}
                        current={s.eventContact.speakerStatus}
                      />
                    </td>
                    <td className="px-3 py-2 text-xs text-slate-600">
                      {s.contact.dietary || s.contact.tshirtSize ? (
                        <div className="space-y-0.5">
                          {s.contact.dietary ? <div>Diet: {s.contact.dietary}</div> : null}
                          {s.contact.tshirtSize ? (
                            <div>Shirt: {s.contact.tshirtSize}</div>
                          ) : null}
                        </div>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-3 py-2">{s.sessionCount}</td>
                    <td className="px-3 py-2">
                      {s.tasksTotal > 0
                        ? `${s.tasksComplete}/${s.tasksTotal}`
                        : "—"}
                    </td>
                  </tr>
              ))}
            </tbody>
          </table>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Add speaker" />
        <CardBody>
          <form action={addSpeakerAction} className="grid gap-3 md:grid-cols-2">
            <input type="hidden" name="slug" value={slug} />
            <div>
              <Label htmlFor="firstName">First name</Label>
              <Input id="firstName" name="firstName" required />
            </div>
            <div>
              <Label htmlFor="lastName">Last name</Label>
              <Input id="lastName" name="lastName" required />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" required />
            </div>
            <div>
              <Label htmlFor="speakerStatus">Status</Label>
              <Select id="speakerStatus" name="speakerStatus" defaultValue="prospect">
                {STATUSES.filter((s) => s.key !== "all").map((s) => (
                  <option key={s.key} value={s.key}>
                    {s.label}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Button type="submit">Add speaker</Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
