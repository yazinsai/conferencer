import { eq } from "drizzle-orm";
import { requireEventRole } from "@/lib/auth/guards";
import { getDb, schema } from "@/lib/db";
import { FilesLibrary } from "./files-library";

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

  const comments = db
    .select({
      comment: schema.fileComments,
      author: schema.users,
    })
    .from(schema.fileComments)
    .innerJoin(schema.uploads, eq(schema.fileComments.uploadId, schema.uploads.id))
    .innerJoin(schema.users, eq(schema.fileComments.authorUserId, schema.users.id))
    .where(eq(schema.uploads.eventId, event.id))
    .all();

  const commentsByUpload = new Map<
    string,
    Array<{
      id: string;
      body: string;
      createdAt: string;
      authorFirstName: string;
      authorLastName: string;
    }>
  >();
  for (const { comment, author } of comments) {
    const list = commentsByUpload.get(comment.uploadId) ?? [];
    list.push({
      id: comment.id,
      body: comment.body,
      createdAt: comment.createdAt,
      authorFirstName: author.firstName,
      authorLastName: author.lastName,
    });
    commentsByUpload.set(comment.uploadId, list);
  }

  const taskMap = new Map<string, { id: string; name: string }>();
  for (const row of uploads) {
    if (row.task) taskMap.set(row.task.id, { id: row.task.id, name: row.task.name });
  }

  const rows = uploads.map(({ upload, contact, task }) => ({
    upload: {
      id: upload.id,
      filename: upload.filename,
      version: upload.version,
      createdAt: upload.createdAt,
      storageKey: upload.storageKey,
      contactId: upload.contactId,
    },
    contact: contact
      ? { firstName: contact.firstName, lastName: contact.lastName }
      : null,
    task: task ? { id: task.id, name: task.name } : null,
    comments: commentsByUpload.get(upload.id) ?? [],
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Files</h1>
        <p className="text-slate-600">
          All uploads across the event. Search, filter, comment, and export as ZIP.
        </p>
      </div>
      <FilesLibrary
        slug={slug}
        rows={rows}
        tasks={Array.from(taskMap.values()).sort((a, b) => a.name.localeCompare(b.name))}
      />
    </div>
  );
}
