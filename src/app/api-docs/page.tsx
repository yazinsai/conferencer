import Link from "next/link";

import { Card, CardHeader } from "@/components/ui";

export const metadata = { title: "API reference" };
export const dynamic = "force-dynamic";

const RESOURCES: Array<{ path: string; methods: string; note: string }> = [
  { path: "/api/v1/events", methods: "GET", note: "The event this token is scoped to." },
  {
    path: "/api/v1/submissions",
    methods: "GET · POST · PATCH · DELETE",
    note: "Abstracts and sessions. Filter with ?status= &kind= &track_id= &q=.",
  },
  { path: "/api/v1/submissions/{id}/participants", methods: "GET", note: "Speakers on a submission." },
  {
    path: "/api/v1/submissions/bulk-status",
    methods: "POST",
    note: "Change many statuses at once. Accepting runs the full hand-off.",
  },
  { path: "/api/v1/sessions", methods: "GET · POST", note: "Submissions filtered to kind=session." },
  { path: "/api/v1/contacts", methods: "GET · POST", note: "People, org-scoped, matched by email." },
  { path: "/api/v1/contacts/bulk-upsert", methods: "POST", note: "Upsert many contacts in one call." },
  { path: "/api/v1/speakers", methods: "GET", note: "The event roster with speaker status." },
  { path: "/api/v1/participants", methods: "GET · POST", note: "Submission ↔ contact links with roles." },
  { path: "/api/v1/forms", methods: "GET", note: "Submission forms and their windows." },
  { path: "/api/v1/tracks", methods: "GET · POST", note: "Programme tracks." },
  { path: "/api/v1/formats", methods: "GET · POST", note: "Session formats and durations." },
  { path: "/api/v1/rooms", methods: "GET · POST", note: "Rooms available for scheduling." },
  { path: "/api/v1/tasks", methods: "GET", note: "The onboarding task library." },
  {
    path: "/api/v1/task-assignments",
    methods: "GET · POST",
    note: "Who owes what. ?contact_id= filters to one speaker.",
  },
  { path: "/api/v1/task-assignments/bulk", methods: "POST", note: "Assign many tasks in one call." },
  { path: "/api/v1/evaluation-plans", methods: "GET", note: "Review plans and rounds." },
  { path: "/api/v1/reviews", methods: "GET", note: "Aggregate scores per submission." },
  { path: "/api/v1/uploads", methods: "GET", note: "Every uploaded deliverable with metadata." },
  { path: "/api/v1/emails", methods: "GET", note: "The outbox." },
  {
    path: "/api/v1/public/sessions",
    methods: "GET",
    note: "No token needed. Approved, accepted, published sessions.",
  },
  { path: "/api/v1/public/speakers", methods: "GET", note: "No token needed. Public speaker list." },
];

export default function ApiDocsPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Conferencer API</h1>
      <p className="mt-2 text-sm text-slate-600">
        A read/write REST API over one event&apos;s programme. Machine-readable spec:{" "}
        <a href="/api/v1/openapi.json" className="font-medium text-brand-700 hover:underline">
          /api/v1/openapi.json
        </a>
        .
      </p>

      <Card className="mt-6">
        <CardHeader title="Authentication" />
        <div className="space-y-3 p-4 text-sm text-slate-700">
          <p>
            Create a token in <strong>Settings → API tokens</strong>, then send it as a bearer
            token. Tokens are scoped to a single event.
          </p>
          <pre className="overflow-x-auto rounded-md bg-slate-900 p-3 font-mono text-xs text-slate-100">
{`curl -H "Authorization: Bearer cft_xxx" \\
  "$APP_URL/api/v1/submissions?status=accepted&limit=25"`}
          </pre>
          <p>
            Every list endpoint accepts <code>limit</code>, <code>cursor</code>,{" "}
            <code>updated_since</code> and resource-specific filters, and replies with{" "}
            <code>{`{ data, meta: { count, limit, next_cursor } }`}</code>.
          </p>
        </div>
      </Card>

      <Card className="mt-4">
        <CardHeader title="Resources" />
        <ul className="divide-y divide-slate-100">
          {RESOURCES.map((resource) => (
            <li key={resource.path} className="px-4 py-2.5">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <code className="font-mono text-sm text-slate-900">{resource.path}</code>
                <span className="text-xs font-medium text-brand-700">{resource.methods}</span>
              </div>
              <p className="text-xs text-slate-500">{resource.note}</p>
            </li>
          ))}
        </ul>
      </Card>

      <Card className="mt-4">
        <CardHeader title="Public feeds without a token" />
        <div className="space-y-2 p-4 text-sm text-slate-700">
          <p>
            Every embed also exposes JSON, XML and iCal at{" "}
            <code>/e/:slug/embed/:token.json</code>, <code>?format=xml</code> and{" "}
            <code>.ics</code>. Generate one in{" "}
            <Link href="/admin" className="font-medium text-brand-700 hover:underline">
              Site &amp; embeds
            </Link>
            .
          </p>
        </div>
      </Card>
    </div>
  );
}
