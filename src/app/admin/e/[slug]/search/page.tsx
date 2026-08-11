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
        <EmptyState title="Type something to search" description="Try a talk title or a speaker name." />
      ) : null}

      {q ? (
        <div className="space-y-4">
          <Card>
            <CardHeader title="Submissions" description={`${submissions.length} matches`} />
            <ul className="divide-y divide-slate-100">
              {submissions.map((submission) => (
                <li key={submission.id} className="flex items-center justify-between gap-3 px-4 py-2.5">
                  <Link
                    href={`/admin/e/${slug}/submissions/${submission.id}`}
                    className="text-sm font-medium text-slate-900 hover:text-brand-700"
                  >
                    {submission.title}
                  </Link>
                  <Chip tone={statusTone(submission.status)}>
                    {STATUS_LABELS[submission.status]}
                  </Chip>
                </li>
              ))}
              {!submissions.length ? (
                <li className="px-4 py-4 text-sm text-slate-500">No submissions match.</li>
              ) : null}
            </ul>
          </Card>

          <Card>
            <CardHeader title="Speakers" description={`${speakers.length} matches`} />
            <ul className="divide-y divide-slate-100">
              {speakers.map((speaker) => (
                <li key={speaker.id} className="px-4 py-2.5">
                  <Link
                    href={`/admin/e/${slug}/speakers/${speaker.id}`}
                    className="text-sm font-medium text-slate-900 hover:text-brand-700"
                  >
                    {contactName(speaker)}
                  </Link>
                  <span className="ml-2 text-xs text-slate-500">
                    {[speaker.job_title, speaker.company].filter(Boolean).join(", ")}
                  </span>
                </li>
              ))}
              {!speakers.length ? (
                <li className="px-4 py-4 text-sm text-slate-500">No speakers match.</li>
              ) : null}
            </ul>
          </Card>

          <Card>
            <CardHeader title="Emails" description={`${emails.length} matches`} />
            <ul className="divide-y divide-slate-100">
              {emails.map((message) => (
                <li key={message.id} className="px-4 py-2.5 text-sm">
                  <Link
                    href={`/admin/e/${slug}/emails?message=${message.id}`}
                    className="font-medium text-slate-900 hover:text-brand-700"
                  >
                    {message.subject}
                  </Link>
                  <span className="ml-2 text-xs text-slate-500">
                    {message.to_email} · {formatStamp(message.created_at)}
                  </span>
                </li>
              ))}
              {!emails.length ? (
                <li className="px-4 py-4 text-sm text-slate-500">No emails match.</li>
              ) : null}
            </ul>
          </Card>
        </div>
      ) : null}
    </div>
  );
}
