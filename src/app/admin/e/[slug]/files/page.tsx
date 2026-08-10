import Link from "next/link";
import { eq } from "drizzle-orm";
import { requireEventRole } from "@/lib/auth/guards";
import { getDb, schema } from "@/lib/db";
import { Card, CardBody, CardHeader } from "@/components/ui/card";

export default async function FilesLibraryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { event } = await requireEventRole(slug, ["organizer"]);
  const db = getDb();
  const uploads = db
    .select({
      upload: schema.uploads,
      contact: schema.contacts,
      task: schema.tasks,
    })
    .from(schema.uploads)
    .leftJoin(schema.contacts, eq(schema.uploads.contactId, schema.contacts.id))
    .leftJoin(
      schema.taskAssignments,
      eq(schema.uploads.taskAssignmentId, schema.taskAssignments.id),
    )
    .leftJoin(schema.tasks, eq(schema.taskAssignments.taskId, schema.tasks.id))
    .where(eq(schema.uploads.eventId, event.id))
    .all();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Files</h1>
        <p className="text-slate-600">All uploads across the event.</p>
      </div>
      <Card>
        <CardHeader title={`${uploads.length} files`} />
        <CardBody className="overflow-x-auto p-0">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-3 py-2 text-left">File</th>
                <th className="px-3 py-2 text-left">Speaker</th>
                <th className="px-3 py-2 text-left">Task</th>
                <th className="px-3 py-2 text-left">Version</th>
                <th className="px-3 py-2 text-left">Date</th>
              </tr>
            </thead>
            <tbody>
              {uploads.map(({ upload, contact, task }) => (
                <tr key={upload.id} className="border-t">
                  <td className="px-3 py-2">
                    <Link
                      href={`/api/files/${upload.storageKey}`}
                      className="text-blue-700 hover:underline"
                    >
                      {upload.filename}
                    </Link>
                  </td>
                  <td className="px-3 py-2">
                    {contact ? `${contact.firstName} ${contact.lastName}` : "—"}
                  </td>
                  <td className="px-3 py-2">{task?.name ?? "—"}</td>
                  <td className="px-3 py-2">v{upload.version}</td>
                  <td className="px-3 py-2">
                    {new Date(upload.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
              {uploads.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-3 py-6 text-center text-slate-500">
                    No uploads yet.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </CardBody>
      </Card>
    </div>
  );
}
