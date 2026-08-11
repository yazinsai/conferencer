import { requireOrganizer } from "@/lib/guards";
import { contactName, getContact, listRoster } from "@/lib/repo/contacts";
import { listTemplates, renderTemplate } from "@/lib/repo/emails";
import { getSubmissionRow, listSubmissions } from "@/lib/repo/submissions";
import { STATUS_LABELS } from "@/lib/status";
import { bulkEmailAction } from "@/server/speaker-actions";
import { sendDecisionsAction } from "@/server/email-actions";
import { MERGE_FIELDS, SAMPLE_CONTEXT } from "@/lib/merge";
import {
  Button,
  Card,
  CardHeader,
  Chip,
  Field,
  FormError,
  Input,
  LinkButton,
  Notice,
  PageHeader,
  Select,
  Textarea,
} from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function ComposePage({
  params,
  searchParams,
}: PageProps<"/admin/e/[slug]/emails/compose">) {
  const { slug } = await params;
  const sp = await searchParams;
  const { event } = await requireOrganizer(slug);

  const roster = listRoster(event.id);
  const templates = listTemplates(event.id);
  const error = typeof sp.error === "string" ? sp.error : null;
  const preselectContact = typeof sp.contact === "string" ? getContact(sp.contact) : null;
  const preselectSubmission =
    typeof sp.submission === "string" ? getSubmissionRow(sp.submission) : null;

  const decided = listSubmissions(event.id, { limit: 500 }).filter((s) =>
    ["accepted", "declined"].includes(s.status),
  );
  const announcement = templates.find((t) => t.key === "speaker_announcement");
  const preview = announcement ? renderTemplate(announcement, SAMPLE_CONTEXT) : null;

  return (
    <div className="max-w-4xl">
      <PageHeader
        title="Compose"
        description="Send decisions or a general message. Everything is logged in the outbox with the rendered body."
        actions={<LinkButton href={`/admin/e/${slug}/emails`}>Back to emails</LinkButton>}
      />
      {error ? (
        <div className="mb-4">
          <FormError>{error}</FormError>
        </div>
      ) : null}

      <Card className="mb-6">
        <CardHeader
          title="Send decisions"
          description="Pre-filled from the decision templates, with merge fields and an optional note appended to every message."
        />
        <form action={sendDecisionsAction} className="space-y-4 p-4">
          <input type="hidden" name="slug" value={slug} />
          <Field label="Recipients" name="audience">
            <Select
              id="audience"
              name="audience"
              defaultValue={preselectSubmission ? "manual" : "accepted"}
            >
              <option value="accepted">Everyone with an accepted submission</option>
              <option value="declined">Everyone with a declined submission</option>
              <option value="manual">Only the submissions I tick below</option>
            </Select>
          </Field>

          <fieldset className="max-h-64 overflow-y-auto rounded-md border border-slate-200 p-3">
            <legend className="px-1 text-xs font-medium text-slate-600">
              Decided submissions
            </legend>
            {decided.map((submission) => (
              <label key={submission.id} className="flex items-center gap-2 py-0.5 text-sm">
                <input
                  type="checkbox"
                  name="submission_ids"
                  value={submission.id}
                  defaultChecked={preselectSubmission?.id === submission.id}
                />
                <span>
                  {submission.title}
                  <Chip tone={submission.status === "accepted" ? "green" : "red"} className="ml-2">
                    {STATUS_LABELS[submission.status]}
                  </Chip>
                  {submission.notified_at ? (
                    <span className="ml-2 text-xs text-slate-400">already notified</span>
                  ) : null}
                </span>
              </label>
            ))}
            {!decided.length ? (
              <p className="text-sm text-slate-500">
                No accepted or declined submissions yet — record a decision first.
              </p>
            ) : null}
          </fieldset>

          <div className="grid gap-3 sm:grid-cols-2">
            <Field
              label="Subject override"
              name="subject"
              hint="Leave blank to use the decision template."
            >
              <Input
                id="subject"
                name="subject"
                placeholder="Your talk has been accepted to {event_name}"
              />
            </Field>
            <Field label="Body override" name="body" hint="Leave blank to use the template body.">
              <Textarea id="body" name="body" rows={3} />
            </Field>
          </div>

          <Field
            label="Note appended to every message"
            name="note"
            hint="Use this to attach reviewer feedback or request changes."
          >
            <Textarea
              id="note"
              name="note"
              rows={3}
              placeholder="The committee would love to see more detail on the migration failures."
            />
          </Field>

          <p className="text-xs text-slate-500">
            Merge fields available: <span className="font-mono">{MERGE_FIELDS.join(" ")}</span>
          </p>

          <Button type="submit" variant="primary">
            Send decision emails
          </Button>
        </form>
      </Card>

      <Card>
        <CardHeader
          title="General bulk email"
          description="Announcements and welcome messages to a filtered speaker group."
        />
        <form action={bulkEmailAction} className="space-y-4 p-4">
          <input type="hidden" name="slug" value={slug} />
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Audience" name="audience">
              <Select id="bulk-audience" name="audience" defaultValue={preselectContact ? "" : "all_speakers"}>
                <option value="all_speakers">All speakers ({roster.length})</option>
                <option value="confirmed">Confirmed speakers</option>
                <option value="accepted">Speakers with an accepted session</option>
                <option value="">Only the people I tick below</option>
              </Select>
            </Field>
            <Field label="Template" name="template_key" hint="Loads a starting point below.">
              <Select id="template_key" name="template_key" defaultValue="speaker_announcement">
                <option value="">No template</option>
                {templates.map((template) => (
                  <option key={template.id} value={template.key}>
                    {template.name}
                  </option>
                ))}
              </Select>
            </Field>
          </div>

          <fieldset className="max-h-56 overflow-y-auto rounded-md border border-slate-200 p-3">
            <legend className="px-1 text-xs font-medium text-slate-600">Individual recipients</legend>
            {roster.map((row) => (
              <label key={row.id} className="flex items-center gap-2 py-0.5 text-sm">
                <input
                  type="checkbox"
                  name="contact_ids"
                  value={row.id}
                  defaultChecked={preselectContact?.id === row.id}
                />
                {contactName(row)}{" "}
                <span className="text-xs text-slate-400">{row.email}</span>
              </label>
            ))}
          </fieldset>

          <Field label="Subject" name="subject" required>
            <Input
              id="subject"
              name="subject"
              defaultValue={`Welcome to ${event.name} speakers`}
              required
            />
          </Field>
          <Field
            label="Body"
            name="body"
            hint="Merge fields resolve per recipient — the preview below shows a sample."
          >
            <Textarea
              id="body"
              name="body"
              rows={8}
              defaultValue={
                announcement?.body_html ??
                "<p>Hi {first_name},</p><p>Welcome to the speaker line-up.</p>"
              }
            />
          </Field>

          {preview ? (
            <Notice tone="info">
              <p className="text-xs font-semibold uppercase tracking-wide">
                Preview for {SAMPLE_CONTEXT.speaker_name}
              </p>
              <p className="mt-1 font-medium">{preview.subject}</p>
              <div
                className="prose-cf mt-1 text-sm"
                dangerouslySetInnerHTML={{ __html: preview.body }}
              />
            </Notice>
          ) : null}

          <Button type="submit" variant="primary">
            Send bulk email
          </Button>
        </form>
      </Card>
    </div>
  );
}
