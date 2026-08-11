import Link from "next/link";
import { forbidden, notFound } from "next/navigation";

import { requirePortalUser } from "@/lib/guards";
import { readJson } from "@/lib/db";
import { linkContactToUser, portalContact } from "@/lib/repo/contacts";
import { effectiveDue, getAssignment, isComplete, isOverdue } from "@/lib/repo/tasks";
import { humanSize, listComments, versionsOf } from "@/lib/repo/uploads";
import {
  commentOnFileAction,
  completeTaskAction,
  submitTaskFormAction,
  uploadTaskFileAction,
} from "@/server/portal-actions";
import {
  Button,
  Card,
  CardHeader,
  Chip,
  Field,
  FormError,
  Input,
  Notice,
  Select,
  Textarea,
  cx,
  fileInputClass,
} from "@/components/ui";
import { formatDate, formatStamp } from "@/lib/datetime";

export const dynamic = "force-dynamic";

type FormFieldSpec = {
  key: string;
  label: string;
  type?: string;
  options?: string[];
  required?: boolean;
};

export default async function PortalTaskDetail({
  params,
  searchParams,
}: PageProps<"/portal/tasks/[id]">) {
  const { id } = await params;
  const sp = await searchParams;
  const { user, event } = await requirePortalUser();
  const contact = portalContact(event, user) ?? linkContactToUser(event, user);
  const assignment = getAssignment(id);
  if (!assignment || assignment.event_id !== event.id) notFound();
  if (assignment.contact_id !== contact.id) forbidden();

  const versions = versionsOf(assignment.id);
  const latest = versions[0];
  const comments = latest ? listComments(latest.id) : [];
  const complete = isComplete(assignment.status);
  const overdue = isOverdue(assignment);
  const schema = readJson<FormFieldSpec[]>(assignment.form_schema, []);
  const response = readJson<Record<string, string>>(assignment.response, {});
  const error = typeof sp.error === "string" ? sp.error : null;
  const due = effectiveDue(assignment);

  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/portal/tasks" className="text-sm font-medium text-signal hover:underline">
        ← My tasks
      </Link>
      <div className="mt-2">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <h1 className="display text-xl text-ink sm:text-2xl">{assignment.task_name}</h1>
          <Chip tone={complete ? "green" : overdue ? "red" : "slate"}>
            {complete ? "Complete" : overdue ? "Overdue" : "To do"}
          </Chip>
        </div>
        <p
          className={cx(
            "tnum mt-1 text-sm",
            overdue ? "font-medium text-destructive" : "text-muted-foreground",
          )}
        >
          {due ? `Due ${formatDate(due)}` : "No due date"}
          {" · "}
          {assignment.is_required ? "Required" : "Optional"}
          {assignment.submission_title ? ` · ${assignment.submission_title}` : ""}
        </p>
      </div>

      {sp.uploaded ? <Notice tone="success" className="mt-4">File uploaded.</Notice> : null}
      {sp.saved ? <Notice tone="success" className="mt-4">Your answers were saved.</Notice> : null}
      {error ? (
        <div className="mt-4">
          <FormError>{error}</FormError>
        </div>
      ) : null}

      {(assignment.task_description || assignment.task_type === "action") ? (
        <section className="mt-5 rounded-card border border-rule bg-paper p-5 shadow-[var(--shadow-card)]">
          {assignment.task_description ? (
            <p className="text-sm text-ink-2">{assignment.task_description}</p>
          ) : null}
          {assignment.task_link ? (
            <a
              href={assignment.task_link}
              target="_blank"
              rel="noreferrer noopener"
              className="mt-2 inline-block text-sm font-medium text-signal hover:underline"
            >
              Open the linked resource →
            </a>
          ) : null}
          {assignment.task_type === "action" ? (
            <form
              action={completeTaskAction}
              className={cx(
                "flex flex-wrap items-center gap-3",
                assignment.task_description || assignment.task_link ? "mt-4" : undefined,
              )}
            >
              <input type="hidden" name="assignment_id" value={assignment.id} />
              <input type="hidden" name="status" value={complete ? "not_started" : "complete"} />
              <Button type="submit" variant={complete ? "secondary" : "primary"}>
                {complete ? "Mark as incomplete" : "Mark as complete"}
              </Button>
              <span className="text-sm text-muted-foreground">
                {complete
                  ? `Completed ${formatStamp(assignment.completed_at)}`
                  : "Tick this off once it is done."}
              </span>
            </form>
          ) : null}
        </section>
      ) : null}

      {assignment.task_type === "file_request" ? (
        <>
          <Card className="mt-4">
            <CardHeader
              title="Upload your file"
              description={`Accepted types: ${
                assignment.accepted_types || "pdf, images, slides, documents"
              } · maximum ${assignment.max_size_mb} MB per file.`}
            />
            <form
              action={uploadTaskFileAction}
              encType="multipart/form-data"
              className="space-y-3 p-4"
            >
              <input type="hidden" name="assignment_id" value={assignment.id} />
              <div>
                <label htmlFor="file" className="block text-sm font-medium text-ink-2">
                  Choose a file
                </label>
                <input
                  id="file"
                  name="file"
                  type="file"
                  accept={assignment.accepted_types || undefined}
                  required
                  className={cx("mt-1", fileInputClass)}
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  Uploading again creates a new version — earlier versions stay available.
                </p>
              </div>
              <Button type="submit" variant="primary">
                Upload file
              </Button>
            </form>
          </Card>

          {versions.length ? (
            <Card className="mt-4">
              <CardHeader title="Versions" description={`${versions.length} uploaded`} />
              <ul className="divide-y divide-rule">
                {versions.map((version, index) => (
                  <li
                    key={version.id}
                    className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 text-sm"
                  >
                    <div>
                      <span className="font-medium text-ink">{version.filename}</span>{" "}
                      <span className="tnum text-xs text-muted-foreground">
                        v{version.version} · {humanSize(version.size)} ·{" "}
                        {formatStamp(version.created_at)}
                      </span>
                      {index === 0 ? (
                        <Chip tone="green" className="ml-2">
                          Latest
                        </Chip>
                      ) : null}
                    </div>
                    <a
                      href={`/f/${version.id}?download=1`}
                      className="font-medium text-signal hover:underline"
                    >
                      Download
                    </a>
                  </li>
                ))}
              </ul>
            </Card>
          ) : null}

          {latest ? (
            <Card className="mt-4">
              <CardHeader title="Comments" description="Visible to you and the organizers." />
              <ul className="divide-y divide-rule">
                {comments.map((comment) => (
                  <li key={comment.id} className="px-4 py-3">
                    <p className="text-sm text-ink-2">{comment.body}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {comment.author_name} · {formatStamp(comment.created_at)}
                    </p>
                  </li>
                ))}
                {!comments.length ? (
                  <li className="px-4 py-4 text-sm text-muted-foreground">No comments yet.</li>
                ) : null}
              </ul>
              <form action={commentOnFileAction} className="space-y-2 border-t border-rule p-4">
                <input type="hidden" name="upload_id" value={latest.id} />
                <input type="hidden" name="assignment_id" value={assignment.id} />
                <label htmlFor="body" className="block text-xs font-medium text-ink-2">
                  Add a comment
                </label>
                <Textarea id="body" name="body" rows={2} required />
                <Button type="submit" size="sm" variant="primary">
                  Post comment
                </Button>
              </form>
            </Card>
          ) : null}
        </>
      ) : null}

      {assignment.task_type === "form" ? (
        <Card className="mt-4">
          <CardHeader title="Complete this form" />
          <form action={submitTaskFormAction} className="space-y-4 p-4">
            <input type="hidden" name="assignment_id" value={assignment.id} />
            {schema.map((field) => (
              <Field
                key={field.key}
                label={field.label}
                name={`field_${field.key}`}
                required={field.required}
              >
                {field.type === "textarea" ? (
                  <Textarea
                    id={`field_${field.key}`}
                    name={`field_${field.key}`}
                    rows={3}
                    defaultValue={response[field.key] ?? ""}
                    required={field.required}
                  />
                ) : field.type === "dropdown" ? (
                  <Select
                    id={`field_${field.key}`}
                    name={`field_${field.key}`}
                    defaultValue={response[field.key] ?? ""}
                    required={field.required}
                  >
                    <option value="">Select…</option>
                    {(field.options ?? []).map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </Select>
                ) : (
                  <Input
                    id={`field_${field.key}`}
                    name={`field_${field.key}`}
                    type={
                      field.type === "date"
                        ? "date"
                        : field.type === "number"
                          ? "number"
                          : "text"
                    }
                    defaultValue={response[field.key] ?? ""}
                    required={field.required}
                  />
                )}
              </Field>
            ))}
            {!schema.length ? (
              <p className="text-sm text-muted-foreground">
                This form has no questions configured yet.
              </p>
            ) : null}
            <Button type="submit" variant="primary">
              Submit form
            </Button>
          </form>
        </Card>
      ) : null}
    </div>
  );
}
