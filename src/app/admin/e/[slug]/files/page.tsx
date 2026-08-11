import Link from "next/link";

import { requireOrganizer } from "@/lib/guards";
import { humanSize, listComments, listUploads, versionsOf } from "@/lib/repo/uploads";
import { commentOnUploadAction } from "@/server/task-actions";
import { SearchBox } from "@/components/client/basics";
import { FileSelectAll, FileZipToolbar } from "@/components/admin/file-selection";
import {
  Button,
  Card,
  Chip,
  LinkButton,
  PageHeader,
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
            <LinkButton href={`/admin/e/${slug}/files/export.zip`} size="sm">
              Download all latest
            </LinkButton>
            <LinkButton href={`/admin/e/${slug}/tasks/deliverables`} size="sm">
              Deliverables
            </LinkButton>
          </>
        }
      />

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
        <span className="text-sm text-muted-foreground" role="status">
          {uploads.length} files
        </span>
      </div>

      <form
        id="files-zip-form"
        action={`/admin/e/${slug}/files/export.zip`}
        method="get"
        className="space-y-3"
      >
        <div className="mb-3 flex flex-wrap items-center gap-3">
          <FileZipToolbar total={uploads.length} />
        </div>

        <div className="max-w-full overflow-x-auto rounded-card border border-rule bg-paper">
          <table className="w-full min-w-[52rem] border-collapse text-sm">
            <thead>
              <tr>
                <Th className="sticky left-0 z-[2] w-10 bg-paper-2">
                  <FileSelectAll total={uploads.length} />
                </Th>
                <Th className="sticky left-10 z-[2] min-w-[12rem] bg-paper-2">File</Th>
                <Th className="min-w-[8rem]">Speaker</Th>
                <Th className="min-w-[10rem]">Session</Th>
                <Th className="w-28">Task</Th>
                <Th className="w-20">Size</Th>
                <Th className="w-24">Versions</Th>
                <Th className="w-36">Uploaded</Th>
                <Th className="sticky right-0 z-[2] w-36 bg-paper-2">
                  <span className="sr-only">Actions</span>
                </Th>
              </tr>
            </thead>
            <tbody>
              {uploads.map((upload) => (
                <tr key={upload.id} className="group">
                  <Td className="sticky left-0 z-[1] bg-paper group-hover:bg-paper-2">
                    <input
                      type="checkbox"
                      name="ids"
                      value={upload.id}
                      aria-label={`Include ${upload.filename}`}
                    />
                  </Td>
                  <Td className="sticky left-10 z-[1] min-w-[12rem] bg-paper font-medium text-ink group-hover:bg-paper-2">
                    {upload.filename}
                  </Td>
                  <Td className="text-sm text-neutral">{upload.contact_name ?? "—"}</Td>
                  <Td className="text-sm text-neutral">{upload.submission_title ?? "—"}</Td>
                  <Td className="text-xs text-muted-foreground">{upload.task_name ?? "—"}</Td>
                  <Td className="tnum text-xs text-muted-foreground">{humanSize(upload.size)}</Td>
                  <Td className="text-xs">
                    {upload.version_count > 1 ? (
                      <Chip tone="blue">{upload.version_count} versions</Chip>
                    ) : (
                      <span className="text-muted-foreground">1</span>
                    )}
                  </Td>
                  <Td className="tnum text-xs text-muted-foreground">
                    {formatStamp(upload.created_at)}
                  </Td>
                  <Td className="sticky right-0 z-[1] bg-paper group-hover:bg-paper-2">
                    <div className="flex gap-2 text-xs">
                      <Link
                        href={`/admin/e/${slug}/files?file=${upload.id}`}
                        className="font-medium text-signal hover:underline"
                      >
                        Details
                      </Link>
                      <a
                        href={`/f/${upload.id}?download=1`}
                        className="font-medium text-signal hover:underline"
                      >
                        Download
                      </a>
                    </div>
                  </Td>
                </tr>
              ))}
              {!uploads.length ? (
                <tr>
                  <Td colSpan={9} className="py-8 text-center text-muted-foreground">
                    No files uploaded yet.
                  </Td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </form>

      {open ? (
        <Card className="mt-5">
          <div className="flex flex-wrap items-start justify-between gap-3 border-b border-rule px-4 py-3">
            <div>
              <h2 className="text-sm font-semibold text-ink">{open.filename}</h2>
              <p className="text-xs text-muted-foreground">
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
              <h3 className="wordmark text-[0.6875rem] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                Versions
              </h3>
              <ul className="mt-2 space-y-1 text-sm">
                {versions.map((version, index) => (
                  <li key={version.id} className="flex items-center justify-between gap-2">
                    <span className="text-ink">
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
                      className="text-xs font-medium text-signal hover:underline"
                    >
                      Download
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="wordmark text-[0.6875rem] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                Comments
              </h3>
              <ul className="mt-2 space-y-2">
                {comments.map((comment) => (
                  <li key={comment.id} className="rounded-input bg-paper-2 px-3 py-2 text-sm">
                    <p className="text-ink">{comment.body}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {comment.author_name} · {formatStamp(comment.created_at)}
                    </p>
                  </li>
                ))}
                {!comments.length ? (
                  <li className="text-sm text-muted-foreground">No comments yet.</li>
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
