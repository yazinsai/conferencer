import Link from "next/link";
import { and, desc, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session";
import { getDb, schema } from "@/lib/db";
import { getContactForUser, getDefaultEvent } from "@/lib/db/queries";
import { speakerFacingStatus, statusBadgeClass } from "@/lib/domain/status";
import { Badge } from "@/components/ui/badge";
import { Card, CardBody, CardHeader } from "@/components/ui/card";

function isFormOpen(form: {
  status: string;
  opensAt: string | null;
  closesAt: string | null;
}) {
  if (form.status === "closed") return false;
  const now = new Date();
  if (form.opensAt && new Date(form.opensAt) > now) return false;
  if (form.closesAt && new Date(form.closesAt) < now) return false;
  return true;
}

export default async function PortalSubmissionsPage() {
  const user = await getSessionUser();
  if (!user) redirect("/sign-in?next=/portal/submissions");
  const event = getDefaultEvent();
  if (!event) redirect("/");
  const row = getContactForUser(event.id, user.id);
  const db = getDb();

  const submissions = row
    ? db
        .select({
          id: schema.submissions.id,
          title: schema.submissions.title,
          status: schema.submissions.status,
          formId: schema.submissions.formId,
          updatedAt: schema.submissions.updatedAt,
          formatId: schema.submissions.formatId,
        })
        .from(schema.submissions)
        .innerJoin(
          schema.submissionParticipants,
          eq(schema.submissionParticipants.submissionId, schema.submissions.id),
        )
        .where(
          and(
            eq(schema.submissions.eventId, event.id),
            eq(schema.submissionParticipants.contactId, row.contact.id),
          ),
        )
        .orderBy(desc(schema.submissions.updatedAt))
        .all()
    : [];

  const forms = db
    .select()
    .from(schema.submissionForms)
    .where(eq(schema.submissionForms.eventId, event.id))
    .all();
  const formMap = Object.fromEntries(forms.map((f) => [f.id, f]));

  const formats = db
    .select()
    .from(schema.formats)
    .where(eq(schema.formats.eventId, event.id))
    .all();
  const formatMap = Object.fromEntries(formats.map((f) => [f.id, f.name]));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">My Submissions</h1>
        <p className="text-slate-600">
          Proposals you have submitted or are participating in.
        </p>
      </div>

      <Card>
        <CardHeader title={`${submissions.length} submission${submissions.length === 1 ? "" : "s"}`} />
        <CardBody className="space-y-4">
          {submissions.length === 0 ? (
            <p className="text-sm text-slate-500">No submissions yet.</p>
          ) : (
            submissions.map((s) => {
              const form = s.formId ? formMap[s.formId] : null;
              const canEdit = form && isFormOpen(form);
              return (
                <div
                  key={s.id}
                  className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-4 last:border-0 last:pb-0"
                >
                  <div className="min-w-0 flex-1">
                    <div className="font-medium">{s.title}</div>
                    <div className="mt-1 text-xs text-slate-500">
                      {s.formatId ? formatMap[s.formatId] : "—"} · Updated{" "}
                      {new Date(s.updatedAt).toLocaleDateString()}
                    </div>
                    {form ? (
                      <div className="mt-1 text-xs text-slate-500">
                        Form: {form.name}
                        {canEdit ? " (open)" : " (closed)"}
                      </div>
                    ) : null}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge className={statusBadgeClass(s.status)}>
                      {speakerFacingStatus(s.status)}
                    </Badge>
                    {canEdit && s.formId ? (
                      <Link
                        href={`/e/${event.slug}/submit/${s.formId}?edit=${s.id}`}
                        className="text-sm font-medium text-blue-700 hover:underline"
                      >
                        Edit submission
                      </Link>
                    ) : form && !canEdit ? (
                      <span className="text-xs text-slate-400">
                        Editing closed
                      </span>
                    ) : null}
                  </div>
                </div>
              );
            })
          )}
        </CardBody>
      </Card>
    </div>
  );
}
