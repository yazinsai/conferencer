import { requireOrganizer } from "@/lib/guards";
import { contactName, getContact, listRoster } from "@/lib/repo/contacts";
import { listTemplates, renderTemplate } from "@/lib/repo/emails";
import {
  getSubmissionRow,
  listSubmissions,
  submissionsForContact,
} from "@/lib/repo/submissions";
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
  const confirmedCount = listRoster(event.id, { status: "confirmed" }).length;
  const templates = listTemplates(event.id);
  const error = typeof sp.error === "string" ? sp.error : null;
  const preselectContact = typeof sp.contact === "string" ? getContact(sp.contact) : null;
  const preselectSubmission =
    typeof sp.submission === "string" ? getSubmissionRow(sp.submission) : null;

  const decided = listSubmissions(event.id, { limit: 500 }).filter((s) =>
    ["accepted", "declined"].includes(s.status),
  );
  const acceptedCount = decided.filter((s) => s.status === "accepted").length;
  const declinedCount = decided.filter((s) => s.status === "declined").length;
  const acceptedSpeakers = roster.filter((row) =>
    submissionsForContact(event.id, row.id).some((s) => s.status === "accepted"),
  ).length;

  const announcement = templates.find((t) => t.key === "speaker_announcement");
  const preview = announcement ? renderTemplate(announcement, SAMPLE_CONTEXT) : null;

  const focusDecisions = Boolean(preselectSubmission);
  const focusBulk = Boolean(preselectContact) && !preselectSubmission;

  const decisionAudienceDefault = preselectSubmission ? "manual" : "accepted";
  const decisionSendLabel =
    decisionAudienceDefault === "manual"
      ? "Sends to the Recipients choice above — checklist only when set to manual"
      : `Default: ${acceptedCount} accepted · also ${declinedCount} declined, or the checklist`;

  const bulkAudienceDefault = preselectContact ? "" : "all_speakers";
  const bulkSendLabel =
    bulkAudienceDefault === ""
      ? "Sends to the Audience choice above — checklist only when set to manual"
      : `Default: all ${roster.length} speakers · ${confirmedCount} confirmed · ${acceptedSpeakers} with accepted sessions`;

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

      <section
        className={
          focusBulk
            ? "mb-8 border-b border-rule pb-8 opacity-80"
            : "mb-8 border-b border-rule pb-8"
        }
        aria-labelledby="compose-decisions-title"
      >
        <Card className={focusDecisions ? "ring-2 ring-ink/15" : undefined}>
          <CardHeader
            title={<span id="compose-decisions-title">Send decisions</span>}
            description="Notify people whose submissions you have already accepted or declined. Uses the decision templates, with optional overrides and a note appended to every message."
          />
          <form action={sendDecisionsAction} className="space-y-4 p-4">
            <input type="hidden" name="slug" value={slug} />
            <Field
              label="Recipients"
              name="audience"
              hint="Choose a status group, or switch to manual to use the checklist."
            >
              <Select
                id="audience"
                name="audience"
                defaultValue={decisionAudienceDefault}
              >
                <option value="accepted">
                  Everyone with an accepted submission ({acceptedCount})
                </option>
                <option value="declined">
                  Everyone with a declined submission ({declinedCount})
                </option>
                <option value="manual">Only the submissions I tick below</option>
              </Select>
            </Field>

            <fieldset className="max-h-64 overflow-y-auto rounded-md border border-rule p-3">
              <legend className="px-1 text-xs font-medium text-neutral">
                Decided submissions
              </legend>
              <p className="mb-2 text-xs text-muted-foreground">
                Ticks apply only when Recipients is set to “Only the submissions I tick below”.
                Accepted and declined audiences ignore the checklist.
              </p>
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
                    <Chip
                      tone={submission.status === "accepted" ? "green" : "red"}
                      className="ml-2"
                    >
                      {STATUS_LABELS[submission.status]}
                    </Chip>
                    {submission.notified_at ? (
                      <span className="ml-2 text-xs text-muted-foreground">already notified</span>
                    ) : null}
                  </span>
                </label>
              ))}
              {!decided.length ? (
                <p className="text-sm text-muted-foreground">
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

            <p className="text-xs text-muted-foreground">
              Merge fields available:{" "}
              <span className="font-mono text-ink-2">{MERGE_FIELDS.join(" ")}</span>
            </p>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-rule pt-3">
              <p className="text-xs text-neutral">{decisionSendLabel}</p>
              <Button type="submit" variant="primary">
                Send decision emails
              </Button>
            </div>
          </form>
        </Card>
      </section>

      <section
        className={focusDecisions ? "opacity-80" : undefined}
        aria-labelledby="compose-bulk-title"
      >
        <Card className={focusBulk ? "ring-2 ring-ink/15" : undefined}>
          <CardHeader
            title={<span id="compose-bulk-title">General bulk email</span>}
            description="Announcements and welcome messages to a filtered speaker group. Not for accept/decline decisions — use Send decisions above for those."
          />
          <form action={bulkEmailAction} className="space-y-4 p-4">
            <input type="hidden" name="slug" value={slug} />
            <Field
              label="Audience"
              name="audience"
              hint="Choose a group, or leave blank to use the checklist."
            >
              <Select
                id="bulk-audience"
                name="audience"
                defaultValue={bulkAudienceDefault}
              >
                <option value="all_speakers">All speakers ({roster.length})</option>
                <option value="confirmed">Confirmed speakers ({confirmedCount})</option>
                <option value="accepted">
                  Speakers with an accepted session ({acceptedSpeakers})
                </option>
                <option value="">Only the people I tick below</option>
              </Select>
            </Field>

            <fieldset className="max-h-56 overflow-y-auto rounded-md border border-rule p-3">
              <legend className="px-1 text-xs font-medium text-neutral">
                Individual recipients
              </legend>
              <p className="mb-2 text-xs text-muted-foreground">
                Ticks apply only when Audience is “Only the people I tick below”. Group audiences
                ignore the checklist.
              </p>
              {roster.map((row) => (
                <label key={row.id} className="flex items-center gap-2 py-0.5 text-sm">
                  <input
                    type="checkbox"
                    name="contact_ids"
                    value={row.id}
                    defaultChecked={preselectContact?.id === row.id}
                  />
                  {contactName(row)}{" "}
                  <span className="text-xs text-neutral">{row.email}</span>
                </label>
              ))}
            </fieldset>

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
              hint="Merge fields resolve per recipient — the sample below uses placeholder data."
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
              <div className="rounded-md border border-rule bg-paper-3 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Sample rendering
                </p>
                <p className="mt-1 text-xs text-neutral">
                  Uses sample data for {SAMPLE_CONTEXT.speaker_name} — not a live per-recipient
                  preview.
                </p>
                <p className="mt-2 text-sm font-medium text-ink">{preview.subject}</p>
                <div
                  className="prose-cf mt-2 text-sm text-ink-2"
                  dangerouslySetInnerHTML={{ __html: preview.body }}
                />
              </div>
            ) : null}

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-rule pt-3">
              <p className="text-xs text-neutral">{bulkSendLabel}</p>
              <Button type="submit" variant="primary">
                Send bulk email
              </Button>
            </div>
          </form>
        </Card>
      </section>
    </div>
  );
}
