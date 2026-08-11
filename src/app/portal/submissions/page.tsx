import Link from "next/link";

import { requirePortalUser } from "@/lib/guards";
import { linkContactToUser, portalContact } from "@/lib/repo/contacts";
import { listParticipants, submissionsForContact } from "@/lib/repo/submissions";
import { speakerFacingStatus, statusTone } from "@/lib/status";
import { defaultForm, formIsOpen, getForm } from "@/lib/repo/forms";
import { Chip, EmptyState, LinkButton, Notice, PageHeader } from "@/components/ui";
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
      title: event.label_accepted === "Accepted" ? "Confirmed participation" : event.label_accepted,
      rows: submissions.filter((s) => s.status === "accepted"),
    },
    {
      key: "mine",
      title: "My submissions",
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
        <EmptyState
          title="Nothing here yet"
          description="When you submit a proposal — or an organizer adds you to a session — it appears here."
          action={
            cfp && formIsOpen(cfp) ? (
              <LinkButton href={`/e/${event.slug}/submit/${cfp.id}`} variant="primary">
                Submit a talk
              </LinkButton>
            ) : null
          }
        />
      ) : null}

      <div className="space-y-8">
        {groups.map((group) => (
          <section key={group.key}>
            <h2 className="mb-2 text-sm font-semibold text-ink">{group.title}</h2>
            <ul className="overflow-hidden rounded-card border border-rule bg-paper shadow-[var(--shadow-card)]">
              {group.rows.map((submission, index) => {
                const form = submission.form_id ? getForm(submission.form_id) : undefined;
                const editable = form ? formIsOpen(form) : false;
                const mine = listParticipants(submission.id).filter(
                  (p) => p.contact_id === contact.id,
                );
                return (
                  <li
                    key={submission.id}
                    className={
                      index > 0 ? "border-t border-rule" : undefined
                    }
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3 px-4 py-3.5">
                      <div className="min-w-0 flex-1">
                        <Link
                          href={`/portal/submissions/${submission.id}`}
                          className="block rounded-sm text-base font-semibold text-ink outline-2 outline-offset-2 outline-transparent hover:text-signal focus-visible:outline-focus"
                        >
                          {submission.title}
                        </Link>
                        <p className="mt-0.5 text-sm text-muted-foreground">
                          {submission.format_name ?? "Format to be confirmed"}
                          {submission.track_name ? ` · ${submission.track_name}` : ""}
                        </p>
                        {submission.pub_starts_at ? (
                          <p className="tnum text-sm text-muted-foreground">
                            {formatRange(submission.pub_starts_at, submission.pub_ends_at)}
                            {submission.room_name ? ` · ${submission.room_name}` : ""}
                          </p>
                        ) : null}
                        <p className="mt-1 text-xs text-muted-foreground">
                          Submitted {formatDate(submission.created_at.slice(0, 10))}
                          {mine.length
                            ? ` · your role: ${mine.map((p) => p.role).join(", ")}`
                            : ""}
                        </p>
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-2">
                        <Chip tone={statusTone(submission.status)}>
                          {speakerFacingStatus(submission.status)}
                        </Chip>
                        {editable && submission.status !== "withdrawn" ? (
                          <LinkButton
                            href={`/e/${event.slug}/submit/${submission.form_id}?submission=${submission.id}`}
                            size="sm"
                            variant="primary"
                          >
                            Edit
                          </LinkButton>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            {submission.status === "withdrawn" ? "Withdrawn" : "Editing closed"}
                          </span>
                        )}
                      </div>
                    </div>
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
