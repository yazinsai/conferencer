import { redirect } from "next/navigation";
import { desc, eq } from "drizzle-orm";
import { getSessionUser } from "@/lib/auth/session";
import { forbidden, getUserRolesForEvent } from "@/lib/auth/guards";
import { getDefaultEvent } from "@/lib/db/queries";
import { getDb, schema } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { ButtonLink } from "@/components/ui/button";

function formatTimestamp(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function statusBadge(status: string) {
  if (status === "sent") return "bg-emerald-100 text-emerald-800";
  if (status === "failed") return "bg-rose-100 text-rose-800";
  return "bg-amber-100 text-amber-800";
}

/** R-EVAL-6 — guessable path `/admin/emails` (also available under event slug). */
export default async function AdminEmailsShortcutPage() {
  const user = await getSessionUser();
  if (!user) redirect("/sign-in?next=/admin/emails");

  const event = getDefaultEvent();
  if (!event) {
    return (
      <div className="p-8">
        <h1 className="text-xl font-semibold">Email outbox</h1>
        <p className="mt-2 text-slate-600">No event seeded yet. Run npm run seed.</p>
      </div>
    );
  }

  const roles = await getUserRolesForEvent(user.id, event.id);
  if (!roles.includes("organizer")) forbidden();

  const db = getDb();
  const messages = db
    .select()
    .from(schema.emailMessages)
    .where(eq(schema.emailMessages.eventId, event.id))
    .orderBy(desc(schema.emailMessages.createdAt))
    .all();

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Emails</h1>
          <p className="text-slate-600">
            In-app outbox for {event.name} — recipient, subject, body, timestamp.
          </p>
        </div>
        <ButtonLink href={`/admin/e/${event.slug}/emails`} variant="secondary">
          Open in event admin
        </ButtonLink>
      </div>

      <Card>
        <CardHeader title={`${messages.length} messages`} />
        <CardBody className="overflow-x-auto p-0">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-2">To</th>
                <th className="px-4 py-2">Subject</th>
                <th className="px-4 py-2">Template</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Timestamp</th>
                <th className="px-4 py-2">Body</th>
              </tr>
            </thead>
            <tbody>
              {messages.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                    No emails yet.
                  </td>
                </tr>
              ) : (
                messages.map((msg) => (
                  <tr key={msg.id} className="border-t border-slate-100 align-top">
                    <td className="px-4 py-3">{msg.toEmail}</td>
                    <td className="max-w-xs px-4 py-3">{msg.subject}</td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-600">
                      {msg.templateKey ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      <Badge className={statusBadge(msg.status)}>{msg.status}</Badge>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                      {formatTimestamp(msg.sentAt ?? msg.createdAt)}
                    </td>
                    <td className="max-w-md px-4 py-3">
                      <details>
                        <summary className="cursor-pointer text-blue-700">View body</summary>
                        <div
                          className="prose-compact mt-2 max-h-48 overflow-auto rounded border border-slate-100 bg-slate-50 p-2 text-xs"
                          dangerouslySetInnerHTML={{ __html: msg.bodyHtml }}
                        />
                      </details>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </CardBody>
      </Card>
    </div>
  );
}
