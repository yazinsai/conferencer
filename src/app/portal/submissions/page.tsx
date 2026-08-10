import Link from "next/link";

import { requirePortalUser } from "@/lib/guards";
import { linkContactToUser, portalContact } from "@/lib/repo/contacts";
import { listParticipants, submissionsForContact } from "@/lib/repo/submissions";
import { speakerFacingStatus, statusTone } from "@/lib/status";
import { defaultForm, formIsOpen, getForm } from "@/lib/repo/forms";
import { Card, Chip, LinkButton, Notice, PageHeader } from "@/components/ui";
import { formatDate, formatRange } from "@/lib/datetime";

export const metadata = { title: "My submissions" };
export const dynamic = "force-dynamic";

export default async function PortalSubmissions({
  searchParams,
}: PageProps<"/portal/submissions">) {
  const sp = await searchParams;
  const { user, event } = await requirePortalUser();
  const contact = portalContact(event, user) ?? linkContactToUser(event, user);
  const submissions = submissionsForContact(event.id, contact.id);
  const cfp = defaultForm(event.id);

  const groups = [
    {
      key: "confirmed",
      title: event.label_accepted === "Accepted" ? "Confirmed Participation" : event.label_accepted,
      rows: submissions.filter((s) => s.status === "accepted"),
    },
    {
      key: "mine",
      title: "My Submissions",
      rows: submissions.filter((s) => !["accepted", "withdrawn"].includes(s.status)),
    },
    {
      key: "closed",
      title: "Withdrawn and past",
      rows: submissions.filter((s) => s.status === "withdrawn"),
    },
  ].filter((group) => group.rows.length);

  return (
    <div>
      <PageHeader
        title="My submissions"
        description="Track the status of everything you have proposed."
        actions={
          cfp && formIsOpen(cfp) ? (
            <LinkButton href={`/e/${event.slug}/submit/${cfp.id}`} variant="primary">
              Submit another talk
            </LinkButton>
          ) : null
        }
      />

      {sp.withdrawn ? (
        <Notice tone="warning" className="mb-4">
          Your submission has been withdrawn and the organizers have been notified.
        </Notice>
      ) : null}

      {!submissions.length ? (
        <Card className="p-8 text-center">
          <p className="text-sm font-semibold text-slate-800">Nothing here yet</p>
          <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">
            When you submit a proposal — or an organizer adds you to a session — it appears here.
          </p>
          {cfp && formIsOpen(cfp) ? (
            <LinkButton
              href={`/e/${event.slug}/submit/${cfp.id}`}
              variant="primary"
              className="mt-4"
            >
              Submit a talk
            </LinkButton>
          ) : null}
        </Card>
      ) : null}

      <div className="space-y-6">
        {groups.map((group) => (
          <section key={group.key}>
            <h2 className="mb-2 text-sm font-semibold text-slate-900">{group.title}</h2>
            <ul className="space-y-3">
              {group.rows.map((submission) => {
                const form = submission.form_id ? getForm(submission.form_id) : undefined;
                const editable = form ? formIsOpen(form) : false;
                const mine = listParticipants(submission.id).filter(
                  (p) => p.contact_id === contact.id,
                );
                return (
                  <li key={submission.id}>
                    <Card className="p-4">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0">
                          <Link
                            href={`/portal/submissions/${submission.id}`}
                            className="text-base font-semibold text-slate-900 hover:text-brand-700"
                          >
                            {submission.title}
                          </Link>
                          <p className="mt-0.5 text-sm text-slate-500">
                            {submission.format_name ?? "Format to be confirmed"}
                            {submission.track_name ? ` · ${submission.track_name}` : ""}
                          </p>
                          {submission.pub_starts_at ? (
                            <p className="text-sm text-slate-500">
                              {formatRange(submission.pub_starts_at, submission.pub_ends_at)}
                              {submission.room_name ? ` · ${submission.room_name}` : ""}
                            </p>
                          ) : null}
                          <p className="mt-1 text-xs text-slate-400">
                            Submitted {formatDate(submission.created_at.slice(0, 10))}
                            {mine.length
                              ? ` · your role: ${mine.map((p) => p.role).join(", ")}`
                              : ""}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <Chip tone={statusTone(submission.status)}>
                            {speakerFacingStatus(submission.status)}
                          </Chip>
                          <div className="flex gap-2">
                            <LinkButton href={`/portal/submissions/${submission.id}`} size="sm">
                              View
                            </LinkButton>
                            {editable && submission.status !== "withdrawn" ? (
                              <LinkButton
                                href={`/e/${event.slug}/submit/${submission.form_id}?submission=${submission.id}`}
                                size="sm"
                                variant="primary"
                              >
                                Edit
                              </LinkButton>
                            ) : (
                              <span className="text-xs text-slate-400">
                                {submission.status === "withdrawn" ? "Withdrawn" : "Editing closed"}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </Card>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
