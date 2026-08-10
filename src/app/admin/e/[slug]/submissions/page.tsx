import Link from "next/link";
import { eq } from "drizzle-orm";
import { requireEventRole } from "@/lib/auth/guards";
import { getDb, schema } from "@/lib/db";
import {
  getSubmissionParticipants,
  listSubmissions,
  submissionStatusCounts,
} from "@/lib/db/queries";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import {
  bulkUpdateStatusAction,
  createManualSubmissionAction,
  sendDecisionsAction,
} from "./actions";
import { InlineStatus } from "./inline-status";

const TABS = [
  { key: "all", label: "All" },
  { key: "accepted", label: "Accepted" },
  { key: "accept_queue", label: "Accept Queue" },
  { key: "pending", label: "Pending" },
  { key: "decline_queue", label: "Decline Queue" },
  { key: "declined", label: "Declined" },
  { key: "withdrawn", label: "Withdrawn" },
  { key: "draft", label: "Drafts" },
] as const;

export default async function SubmissionsPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ status?: string; kind?: string; q?: string }>;
}) {
  const { slug } = await params;
  const sp = await searchParams;
  const { event } = await requireEventRole(slug, ["organizer"]);
  const counts = submissionStatusCounts(event.id);
  const rows = listSubmissions({
    eventId: event.id,
    status: sp.status,
    kind: sp.kind,
    q: sp.q,
  });
  const db = getDb();
  const tracks = db
    .select()
    .from(schema.tracks)
    .where(eq(schema.tracks.eventId, event.id))
    .all();
  const formats = db
    .select()
    .from(schema.formats)
    .where(eq(schema.formats.eventId, event.id))
    .all();
  const forms = db
    .select()
    .from(schema.submissionForms)
    .where(eq(schema.submissionForms.eventId, event.id))
    .all();
  const trackMap = Object.fromEntries(tracks.map((t) => [t.id, t.name]));
  const formatMap = Object.fromEntries(formats.map((f) => [f.id, f.name]));
  const formMap = Object.fromEntries(forms.map((f) => [f.id, f.name]));

  const enriched = rows.map((r) => {
    const speakers = getSubmissionParticipants(r.id)
      .map((p) => `${p.firstName} ${p.lastName}`)
      .join(", ");
    return { ...r, speakers };
  });

  const totalAll = Object.values(counts).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Submissions</h1>
          <p className="text-slate-600">Review, decide, and hand off to the agenda.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/admin/e/${slug}/submissions/export?status=${sp.status ?? "all"}${sp.kind ? `&kind=${sp.kind}` : ""}${sp.q ? `&q=${encodeURIComponent(sp.q)}` : ""}`}
            className="inline-flex items-center rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
          >
            Export CSV
          </Link>
          <form action={sendDecisionsAction} className="flex gap-2">
            <input type="hidden" name="slug" value={slug} />
            <input type="hidden" name="mode" value="accepted" />
            <Button type="submit" variant="secondary">
              Send Decisions (Accepted)
            </Button>
          </form>
          <form action={sendDecisionsAction}>
            <input type="hidden" name="slug" value={slug} />
            <input type="hidden" name="mode" value="declined" />
            <Button type="submit" variant="secondary">
              Send Decisions (Declined)
            </Button>
          </form>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => {
          const c = t.key === "all" ? totalAll : counts[t.key] ?? 0;
          const active = (sp.status ?? "all") === t.key;
          return (
            <Link
              key={t.key}
              href={`/admin/e/${slug}/submissions?status=${t.key}${sp.kind ? `&kind=${sp.kind}` : ""}`}
              className={`rounded-full px-3 py-1.5 text-sm ${active ? "bg-blue-600 text-white" : "bg-white border border-slate-200 text-slate-700"}`}
            >
              {t.label} ({c})
            </Link>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-2 text-sm">
        <Link href={`/admin/e/${slug}/submissions`} className={!sp.kind ? "font-semibold text-blue-700" : "text-slate-600"}>
          View All
        </Link>
        <Link
          href={`/admin/e/${slug}/submissions?kind=abstract`}
          className={sp.kind === "abstract" ? "font-semibold text-blue-700" : "text-slate-600"}
        >
          Abstracts
        </Link>
        <Link
          href={`/admin/e/${slug}/submissions?kind=session`}
          className={sp.kind === "session" ? "font-semibold text-blue-700" : "text-slate-600"}
        >
          Sessions
        </Link>
      </div>

      <form className="flex gap-2">
        <input type="hidden" name="status" value={sp.status ?? "all"} />
        {sp.kind ? <input type="hidden" name="kind" value={sp.kind} /> : null}
        <input
          name="q"
          defaultValue={sp.q ?? ""}
          placeholder="Search title, description, speakers…"
          className="w-full max-w-md rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
        <Button type="submit" variant="secondary">
          Search
        </Button>
      </form>

      <Card>
        <CardHeader title={`${enriched.length} results`} />
        <CardBody className="overflow-x-auto p-0">
          <form action={bulkUpdateStatusAction}>
            <input type="hidden" name="slug" value={slug} />
            <div className="flex items-center gap-2 border-b border-slate-100 px-4 py-2">
              <select name="status" className="rounded-md border border-slate-300 px-2 py-1 text-sm">
                {TABS.filter((t) => t.key !== "all").map((t) => (
                  <option key={t.key} value={t.key}>
                    {t.label}
                  </option>
                ))}
              </select>
              <Button type="submit" variant="secondary">
                Bulk status change
              </Button>
            </div>
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-3 py-2"> </th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Title</th>
                  <th className="px-3 py-2">Speakers</th>
                  <th className="px-3 py-2">Track</th>
                  <th className="px-3 py-2">Format</th>
                  <th className="px-3 py-2">Source</th>
                  <th className="px-3 py-2">Rating</th>
                  <th className="px-3 py-2">Notified</th>
                </tr>
              </thead>
              <tbody>
                {enriched.map((r) => (
                  <tr key={r.id} className="border-t border-slate-100 hover:bg-slate-50">
                    <td className="px-3 py-2">
                      <input type="checkbox" name="ids" value={r.id} />
                    </td>
                    <td className="px-3 py-2">
                      <InlineStatus
                        slug={slug}
                        submissionId={r.id}
                        status={r.status}
                      />
                    </td>
                    <td className="px-3 py-2">
                      <Link
                        href={`/admin/e/${slug}/submissions/${r.id}`}
                        className="font-medium text-blue-700 hover:underline"
                      >
                        {r.title}
                      </Link>
                      <div className="line-clamp-1 max-w-xs text-xs text-slate-500">
                        {r.description}
                      </div>
                    </td>
                    <td className="px-3 py-2">{r.speakers || "—"}</td>
                    <td className="px-3 py-2">{r.trackId ? trackMap[r.trackId] : "—"}</td>
                    <td className="px-3 py-2">{r.formatId ? formatMap[r.formatId] : "—"}</td>
                    <td className="px-3 py-2">{r.formId ? formMap[r.formId] : "Manual"}</td>
                    <td className="px-3 py-2">{r.averageScore ?? "—"}</td>
                    <td className="px-3 py-2">{r.notifiedAt ? "Yes" : "No"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </form>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Add Abstract / Session" />
        <CardBody>
          <form action={createManualSubmissionAction} className="grid gap-3 md:grid-cols-2">
            <input type="hidden" name="slug" value={slug} />
            <label className="text-sm">
              Kind
              <select name="kind" className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2">
                <option value="abstract">Abstract</option>
                <option value="session">Session</option>
              </select>
            </label>
            <label className="text-sm">
              Title
              <input name="title" required className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" />
            </label>
            <label className="text-sm md:col-span-2">
              Description
              <textarea name="description" rows={3} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" />
            </label>
            <label className="text-sm">
              Track
              <select name="trackId" className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2">
                <option value="">—</option>
                {tracks.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm">
              Format
              <select name="formatId" className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2">
                <option value="">—</option>
                {formats.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>
            </label>
            <div>
              <Button type="submit">Create</Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
