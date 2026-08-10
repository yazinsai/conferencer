import Link from "next/link";

import { requireOrganizer } from "@/lib/guards";
import { humanSize, listComments, listUploads, versionsOf } from "@/lib/repo/uploads";
import { commentOnUploadAction } from "@/server/task-actions";
import { SearchBox } from "@/components/client/basics";
import {
  Button,
  Card,
  Chip,
  LinkButton,
  PageHeader,
  Table,
  Td,
  Textarea,
  Th,
} from "@/components/ui";
import { formatStamp } from "@/lib/datetime";

export const dynamic = "force-dynamic";

export default async function FilesPage({
  params,
  searchParams,
}: PageProps<"/admin/e/[slug]/files">) {
  const { slug } = await params;
  const sp = await searchParams;
  const { event } = await requireOrganizer(slug);
  const str = (key: string) => (typeof sp[key] === "string" ? (sp[key] as string) : "");

  const uploads = listUploads(event.id, {
    q: str("q"),
    submissionId: str("submission") || undefined,
    latestOnly: str("all") !== "1",
  });
  const openId = str("file");
  const open = openId ? uploads.find((u) => u.id === openId) : null;
  const versions = open?.task_assignment_id ? versionsOf(open.task_assignment_id) : open ? [open] : [];
  const comments = open ? listComments(open.id) : [];

  return (
    <div>
      <PageHeader
        title="Files"
        description="Every upload across the event, with its speaker, session, version count and comments."
        actions={
          <>
            <LinkButton href={`/admin/e/${slug}/files/export.zip`} size="sm" variant="primary">
              Download all latest versions (ZIP)
            </LinkButton>
            <LinkButton href={`/admin/e/${slug}/tasks/deliverables`} size="sm">
              Deliverables
            </LinkButton>
          </>
        }
      />

      <form action={`/admin/e/${slug}/files/export.zip`} method="get" className="space-y-3">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <SearchBox
            param="q"
            label="Search files"
            placeholder="Search filenames…"
            className="w-full sm:w-72"
          />
          <LinkButton
            href={`/admin/e/${slug}/files?all=${str("all") === "1" ? "0" : "1"}`}
            size="sm"
          >
            {str("all") === "1" ? "Show latest versions only" : "Show every version"}
          </LinkButton>
          <span className="text-sm text-slate-500" role="status">
            {uploads.length} files
          </span>
          <div className="ml-auto flex items-center gap-2">
            <label htmlFor="group" className="text-xs font-medium text-slate-600">
              Group ZIP by
            </label>
            <select
              id="group"
              name="group"
              className="rounded-md border border-slate-300 px-2 py-1 text-xs"
              defaultValue="session"
            >
              <option value="session">Folder per session</option>
              <option value="speaker">Folder per speaker</option>
              <option value="flat">Flat</option>
            </select>
            <Button type="submit" size="sm" variant="primary">
              Download selected as ZIP
            </Button>
          </div>
        </div>

        <Table>
          <thead>
            <tr>
              <Th className="w-8" />
              <Th>File</Th>
              <Th>Speaker</Th>
              <Th>Session</Th>
              <Th>Task</Th>
              <Th>Size</Th>
              <Th>Versions</Th>
              <Th>Uploaded</Th>
              <Th />
            </tr>
          </thead>
          <tbody>
            {uploads.map((upload) => (
              <tr key={upload.id}>
                <Td>
                  <input
                    type="checkbox"
                    name="ids"
                    value={upload.id}
                    defaultChecked
                    aria-label={`Include ${upload.filename}`}
                  />
                </Td>
                <Td className="font-medium">{upload.filename}</Td>
                <Td className="text-sm">{upload.contact_name ?? "—"}</Td>
                <Td className="text-sm">{upload.submission_title ?? "—"}</Td>
                <Td className="text-xs">{upload.task_name ?? "—"}</Td>
                <Td className="text-xs">{humanSize(upload.size)}</Td>
                <Td className="text-xs">
                  {upload.version_count > 1 ? (
                    <Chip tone="blue">{upload.version_count} versions</Chip>
                  ) : (
                    "1"
                  )}
                </Td>
                <Td className="text-xs">{formatStamp(upload.created_at)}</Td>
                <Td>
                  <div className="flex gap-2 text-xs">
                    <Link
                      href={`/admin/e/${slug}/files?file=${upload.id}`}
                      className="font-medium text-brand-700 hover:underline"
                    >
                      Details
                    </Link>
                    <a
                      href={`/f/${upload.id}?download=1`}
                      className="font-medium text-brand-700 hover:underline"
                    >
                      Download
                    </a>
                  </div>
                </Td>
              </tr>
            ))}
            {!uploads.length ? (
              <tr>
                <Td colSpan={9} className="py-8 text-center text-slate-500">
                  No files uploaded yet.
                </Td>
              </tr>
            ) : null}
          </tbody>
        </Table>
      </form>

      {open ? (
        <Card className="mt-5">
          <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-200 px-4 py-3">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">{open.filename}</h2>
              <p className="text-xs text-slate-500">
                {open.contact_name ?? "unknown"} · {open.submission_title ?? "no session"} ·{" "}
                {open.task_name ?? "no task"}
              </p>
            </div>
            <LinkButton href={`/admin/e/${slug}/files`} size="sm">
              Close
            </LinkButton>
          </div>

          <div className="grid gap-4 p-4 md:grid-cols-2">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Versions
              </h3>
              <ul className="mt-2 space-y-1 text-sm">
                {versions.map((version, index) => (
                  <li key={version.id} className="flex items-center justify-between gap-2">
                    <span>
                      v{version.version} · {humanSize(version.size)} ·{" "}
                      {formatStamp(version.created_at)}
                      {index === 0 ? (
                        <Chip tone="green" className="ml-2">
                          Latest
                        </Chip>
                      ) : null}
                    </span>
                    <a
                      href={`/f/${version.id}?download=1`}
                      className="text-xs font-medium text-brand-700 hover:underline"
                    >
                      Download
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Comments
              </h3>
              <ul className="mt-2 space-y-2">
                {comments.map((comment) => (
                  <li key={comment.id} className="rounded-md bg-slate-50 px-3 py-2 text-sm">
                    <p className="text-slate-800">{comment.body}</p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {comment.author_name} · {formatStamp(comment.created_at)}
                    </p>
                  </li>
                ))}
                {!comments.length ? (
                  <li className="text-sm text-slate-500">No comments yet.</li>
                ) : null}
              </ul>
              <form action={commentOnUploadAction} className="mt-3 space-y-2">
                <input type="hidden" name="slug" value={slug} />
                <input type="hidden" name="upload_id" value={open.id} />
                <Textarea name="body" rows={2} required aria-label="Reply" placeholder="Reply…" />
                <Button type="submit" size="sm">
                  Post reply
                </Button>
              </form>
            </div>
          </div>
        </Card>
      ) : null}
    </div>
  );
}
