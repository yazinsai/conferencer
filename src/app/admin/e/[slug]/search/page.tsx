import Link from "next/link";

import { requireOrganizer } from "@/lib/guards";
import { contactName, listRoster } from "@/lib/repo/contacts";
import { listSubmissions } from "@/lib/repo/submissions";
import { STATUS_LABELS, statusTone } from "@/lib/status";
import { listMessages } from "@/lib/repo/emails";
import { Card, CardHeader, Chip, EmptyState, PageHeader } from "@/components/ui";
import { SearchBox } from "@/components/client/basics";
import { formatStamp } from "@/lib/datetime";

export const dynamic = "force-dynamic";

export default async function AdminSearchPage({
  params,
  searchParams,
}: PageProps<"/admin/e/[slug]/search">) {
  const { slug } = await params;
  const sp = await searchParams;
  const { event } = await requireOrganizer(slug);
  const q = typeof sp.q === "string" ? sp.q.trim() : "";

  const submissions = q ? listSubmissions(event.id, { q, limit: 25 }) : [];
  const speakers = q ? listRoster(event.id, { q, limit: 25 }) : [];
  const emails = q ? listMessages(event.id, { q, limit: 15 }) : [];

  return (
    <div>
      <PageHeader
        title={q ? `Search: “${q}”` : "Search"}
        description="Submissions, speakers and sent emails across this event."
      />
      <div className="mb-5 max-w-lg">
        <SearchBox param="q" label="Search" placeholder="Search everything…" autoFocus />
      </div>

      {!q ? (
        <EmptyState
          title="Type something to search"
          description="Try a talk title or a speaker name."
        />
      ) : null}

      {q ? (
        <div className="space-y-4">
          <Card>
            <CardHeader
              title="Submissions"
              description={`${submissions.length} results shown`}
            />
            <ul className="divide-y divide-rule">
              {submissions.map((submission) => {
                const meta = [submission.speakers, submission.track_name]
                  .filter(Boolean)
                  .join(" · ");
                return (
                  <li key={submission.id} className="relative">
                    <Link
                      href={`/admin/e/${slug}/submissions/${submission.id}`}
                      className="flex items-center justify-between gap-3 px-4 py-2.5 text-ink outline-offset-[-2px] transition-colors duration-[120ms] ease-out hover:bg-paper-2 focus-visible:outline-2 focus-visible:outline-ring"
                    >
                      <span className="min-w-0">
                        <span className="block text-sm font-medium">{submission.title}</span>
                        {meta ? (
                          <span className="mt-0.5 block text-xs text-muted-foreground">{meta}</span>
                        ) : null}
                      </span>
                      <Chip tone={statusTone(submission.status)} className="pointer-events-none">
                        {STATUS_LABELS[submission.status]}
                      </Chip>
                    </Link>
                  </li>
                );
              })}
              {!submissions.length ? (
                <li className="px-4 py-4 text-sm text-muted-foreground">No submissions match.</li>
              ) : null}
            </ul>
          </Card>

          <Card>
            <CardHeader title="Speakers" description={`${speakers.length} results shown`} />
            <ul className="divide-y divide-rule">
              {speakers.map((speaker) => {
                const meta = [speaker.job_title, speaker.company].filter(Boolean).join(", ");
                return (
                  <li key={speaker.id} className="relative">
                    <Link
                      href={`/admin/e/${slug}/speakers/${speaker.id}`}
                      className="block px-4 py-2.5 text-ink outline-offset-[-2px] transition-colors duration-[120ms] ease-out hover:bg-paper-2 focus-visible:outline-2 focus-visible:outline-ring"
                    >
                      <span className="block text-sm font-medium">{contactName(speaker)}</span>
                      {meta ? (
                        <span className="mt-0.5 block text-xs text-muted-foreground">{meta}</span>
                      ) : null}
                    </Link>
                  </li>
                );
              })}
              {!speakers.length ? (
                <li className="px-4 py-4 text-sm text-muted-foreground">No speakers match.</li>
              ) : null}
            </ul>
          </Card>

          <Card>
            <CardHeader title="Emails" description={`${emails.length} results shown`} />
            <ul className="divide-y divide-rule">
              {emails.map((message) => (
                <li key={message.id} className="relative">
                  <Link
                    href={`/admin/e/${slug}/emails?message=${message.id}`}
                    className="block px-4 py-2.5 text-ink outline-offset-[-2px] transition-colors duration-[120ms] ease-out hover:bg-paper-2 focus-visible:outline-2 focus-visible:outline-ring"
                  >
                    <span className="block text-sm font-medium">{message.subject}</span>
                    <span className="mt-0.5 block text-xs text-muted-foreground">
                      {message.to_email} · {formatStamp(message.created_at)}
                    </span>
                  </Link>
                </li>
              ))}
              {!emails.length ? (
                <li className="px-4 py-4 text-sm text-muted-foreground">No emails match.</li>
              ) : null}
            </ul>
          </Card>
        </div>
      ) : null}
    </div>
  );
}
