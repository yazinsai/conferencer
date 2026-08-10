import Link from "next/link";
import { and, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { requireEventRole } from "@/lib/auth/guards";
import { getDb, schema } from "@/lib/db";
import { getSubmissionParticipants } from "@/lib/db/queries";
import { statusBadgeClass, statusLabel } from "@/lib/domain/status";
import { Badge } from "@/components/ui/badge";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import {
  setApprovalStatusAction,
  updateSubmissionStatusAction,
} from "../actions";

export default async function SubmissionDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string; id: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { slug, id } = await params;
  const sp = await searchParams;
  const { event } = await requireEventRole(slug, ["organizer"]);
  const db = getDb();
  const sub = db
    .select()
    .from(schema.submissions)
    .where(
      and(eq(schema.submissions.id, id), eq(schema.submissions.eventId, event.id)),
    )
    .get();
  if (!sub) notFound();

  const participants = getSubmissionParticipants(sub.id);
  const track = sub.trackId
    ? db.select().from(schema.tracks).where(eq(schema.tracks.id, sub.trackId)).get()
    : null;
  const format = sub.formatId
    ? db.select().from(schema.formats).where(eq(schema.formats.id, sub.formatId)).get()
    : null;
  const form = sub.formId
    ? db
        .select()
        .from(schema.submissionForms)
        .where(eq(schema.submissionForms.id, sub.formId))
        .get()
    : null;
  const room = sub.locationId
    ? db.select().from(schema.rooms).where(eq(schema.rooms.id, sub.locationId)).get()
    : null;

  const assignments = db
    .select({
      assignment: schema.evaluationAssignments,
      review: schema.reviews,
      reviewer: schema.users,
    })
    .from(schema.evaluationAssignments)
    .leftJoin(
      schema.reviews,
      eq(schema.reviews.assignmentId, schema.evaluationAssignments.id),
    )
    .innerJoin(
      schema.users,
      eq(schema.evaluationAssignments.reviewerUserId, schema.users.id),
    )
    .where(eq(schema.evaluationAssignments.submissionId, sub.id))
    .all();

  const uploads = db
    .select()
    .from(schema.uploads)
    .where(eq(schema.uploads.submissionId, sub.id))
    .all();

  const history = db
    .select()
    .from(schema.auditEntries)
    .where(
      and(
        eq(schema.auditEntries.entityType, "submission"),
        eq(schema.auditEntries.entityId, sub.id),
      ),
    )
    .all();

  let answers: Record<string, unknown> = {};
  try {
    answers = JSON.parse(sub.answers || "{}") as Record<string, unknown>;
  } catch {
    answers = {};
  }

  const tab = sp.tab === "participants" ? "participants" : "details";

  return (
    <div className="space-y-6">
      <div>
        <Link href={`/admin/e/${slug}/submissions`} className="text-sm text-blue-700">
          ← Submissions
        </Link>
        <div className="mt-2 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold">{sub.title}</h1>
            <div className="mt-2 flex flex-wrap gap-2">
              <Badge className={statusBadgeClass(sub.status)}>
                {statusLabel(sub.status)}
              </Badge>
              <Badge className="bg-slate-100 text-slate-700">{sub.kind}</Badge>
              <Badge className="bg-violet-100 text-violet-800">
                Approval: {sub.approvalStatus}
              </Badge>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <form action={updateSubmissionStatusAction} className="flex gap-2">
              <input type="hidden" name="slug" value={slug} />
              <input type="hidden" name="submissionId" value={sub.id} />
              <select name="status" defaultValue={sub.status} className="rounded-md border px-2 text-sm">
                {[
                  "draft",
                  "pending",
                  "accept_queue",
                  "decline_queue",
                  "accepted",
                  "declined",
                  "withdrawn",
                ].map((s) => (
                  <option key={s} value={s}>
                    {statusLabel(s)}
                  </option>
                ))}
              </select>
              <button type="submit" className="rounded-md bg-blue-600 px-3 py-1.5 text-sm text-white">
                Update status
              </button>
            </form>
            <form action={setApprovalStatusAction} className="flex gap-2">
              <input type="hidden" name="slug" value={slug} />
              <input type="hidden" name="submissionId" value={sub.id} />
              <select
                name="approvalStatus"
                defaultValue={sub.approvalStatus}
                className="rounded-md border px-2 text-sm"
              >
                <option value="draft">draft</option>
                <option value="in_review">in_review</option>
                <option value="approved">approved</option>
              </select>
              <button type="submit" className="rounded-md border px-3 py-1.5 text-sm">
                Set approval
              </button>
            </form>
          </div>
        </div>
      </div>

      <div className="flex gap-2 border-b border-slate-200">
        <Link
          href={`?tab=details`}
          className={`px-3 py-2 text-sm ${tab === "details" ? "border-b-2 border-blue-600 font-semibold" : "text-slate-600"}`}
        >
          Details
        </Link>
        <Link
          href={`?tab=participants`}
          className={`px-3 py-2 text-sm ${tab === "participants" ? "border-b-2 border-blue-600 font-semibold" : "text-slate-600"}`}
        >
          Participants
        </Link>
      </div>

      {tab === "details" ? (
        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader title="Submission" />
            <CardBody className="space-y-3 text-sm">
              <Field label="Description" value={sub.description} />
              <Field label="Track" value={track?.name} />
              <Field label="Format" value={format?.name} />
              <Field label="Level" value={sub.level} />
              <Field label="Language" value={sub.language} />
              <Field label="Source form" value={form?.name ?? "Manual"} />
              <Field
                label="Schedule"
                value={
                  sub.startsAt
                    ? `${sub.startsAt} → ${sub.endsAt} @ ${room?.name ?? "TBD"}`
                    : "Unscheduled"
                }
              />
              <div>
                <div className="font-medium text-slate-700">Custom answers</div>
                <pre className="mt-1 overflow-auto rounded-md bg-slate-50 p-3 text-xs">
                  {JSON.stringify(answers, null, 2)}
                </pre>
              </div>
            </CardBody>
          </Card>
          <div className="space-y-4">
            <Card>
              <CardHeader title="Reviews" />
              <CardBody className="space-y-3 text-sm">
                {assignments.length === 0 ? (
                  <p className="text-slate-500">No reviews yet.</p>
                ) : (
                  assignments.map(({ assignment, review, reviewer }) => (
                    <div key={assignment.id} className="rounded-md border border-slate-200 p-3">
                      <div className="font-medium">
                        {reviewer.firstName} {reviewer.lastName}
                      </div>
                      <div className="text-slate-500">{assignment.status}</div>
                      {review ? (
                        <>
                          <div className="mt-1">Score: {review.score ?? "—"}</div>
                          <p className="mt-1 text-slate-700">{review.comment}</p>
                        </>
                      ) : null}
                    </div>
                  ))
                )}
              </CardBody>
            </Card>
            <Card>
              <CardHeader title="Files" />
              <CardBody className="text-sm">
                {uploads.length === 0 ? (
                  <p className="text-slate-500">No files.</p>
                ) : (
                  uploads.map((u) => (
                    <div key={u.id}>
                      {u.filename} v{u.version}
                    </div>
                  ))
                )}
              </CardBody>
            </Card>
            <Card>
              <CardHeader title="Activity" />
              <CardBody className="space-y-2 text-xs text-slate-600">
                {history.length === 0 ? (
                  <p>No history.</p>
                ) : (
                  history.map((h) => (
                    <div key={h.id}>
                      {h.createdAt}: {h.action}
                    </div>
                  ))
                )}
              </CardBody>
            </Card>
          </div>
        </div>
      ) : (
        <Card>
          <CardHeader title="Participants" />
          <CardBody>
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase text-slate-500">
                  <th className="py-2">Name</th>
                  <th>Role</th>
                  <th>Email</th>
                  <th>Acceptance</th>
                </tr>
              </thead>
              <tbody>
                {participants.map((p) => (
                  <tr key={p.id} className="border-t">
                    <td className="py-2">
                      {p.firstName} {p.lastName}
                      <div className="text-xs text-slate-500">
                        {[p.jobTitle, p.company].filter(Boolean).join(" · ")}
                      </div>
                    </td>
                    <td>{p.role}</td>
                    <td>{p.email}</td>
                    <td>{p.acceptanceStatus}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardBody>
        </Card>
      )}
    </div>
  );
}

function Field({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </div>
      <div className="mt-0.5 whitespace-pre-wrap text-slate-800">{value || "—"}</div>
    </div>
  );
}
