import { desc, eq } from "drizzle-orm";
import { requireEventRole } from "@/lib/auth/guards";
import { getDb, schema } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { Card, CardBody, CardHeader } from "@/components/ui/card";

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

export default async function EmailsOutboxPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { event } = await requireEventRole(slug, ["organizer"]);
  const db = getDb();

  const messages = db
    .select()
    .from(schema.emailMessages)
    .where(eq(schema.emailMessages.eventId, event.id))
    .orderBy(desc(schema.emailMessages.createdAt))
    .all();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Email outbox</h1>
        <p className="text-slate-600">
          Messages sent or queued for this event ({messages.length} total).
        </p>
      </div>

      <Card>
        <CardHeader title="Messages" />
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
                    <td className="px-4 py-3">
                      <details className="max-w-md">
                        <summary className="cursor-pointer text-blue-700 hover:underline">
                          View body
                        </summary>
                        <div
                          className="prose prose-sm mt-2 max-h-48 overflow-auto rounded border border-slate-200 bg-slate-50 p-2 text-xs"
                          dangerouslySetInnerHTML={{ __html: msg.bodyHtml }}
                        />
                        {msg.error ? (
                          <p className="mt-2 text-xs text-rose-600">{msg.error}</p>
                        ) : null}
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
