import { requireOrganizer } from "@/lib/guards";
import { listTemplates, renderTemplate } from "@/lib/repo/emails";
import { saveTemplateAction } from "@/server/email-actions";
import { MERGE_FIELDS, SAMPLE_CONTEXT } from "@/lib/merge";
import {
  Button,
  Card,
  Chip,
  Field,
  Input,
  LinkButton,
  Notice,
  PageHeader,
  Textarea,
} from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function TemplatesPage({
  params,
  searchParams,
}: PageProps<"/admin/e/[slug]/emails/templates">) {
  const { slug } = await params;
  const sp = await searchParams;
  const { event } = await requireOrganizer(slug);
  const templates = listTemplates(event.id);
  const selectedKey = typeof sp.preview === "string" && sp.preview ? sp.preview : null;

  return (
    <div className="max-w-5xl">
      <PageHeader
        title="Email templates"
        description="Every automated message, editable per event. Preview renders against a sample speaker."
        actions={<LinkButton href={`/admin/e/${slug}/emails`}>Back to emails</LinkButton>}
      />

      {sp.saved ? (
        <Notice tone="success" className="mb-4">
          Template saved.
        </Notice>
      ) : null}

      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(12rem,15rem)]">
        <aside className="rounded-card border border-rule bg-paper-2 p-4 lg:col-start-2 lg:row-start-1 lg:sticky lg:top-[calc(var(--nav-height)+0.75rem)]">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Merge fields
          </p>
          <p className="mt-1 text-xs text-neutral">
            Use these tokens in subject or body. They resolve per recipient at send time.
          </p>
          <ul className="mt-3 flex flex-wrap gap-1.5">
            {MERGE_FIELDS.map((field) => (
              <li key={field}>
                <code className="inline-block rounded-md border border-rule bg-paper px-1.5 py-0.5 font-mono text-[0.6875rem] text-ink-2">
                  {field}
                </code>
              </li>
            ))}
          </ul>
        </aside>

        <div className="min-w-0 space-y-2 lg:col-start-1 lg:row-start-1">
          {templates.map((template) => {
            const preview = renderTemplate(template, SAMPLE_CONTEXT);
            const open = selectedKey === template.key;
            return (
              <Card key={template.id} className="overflow-hidden">
                <details open={open || undefined}>
                  <summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-3 border-b border-rule px-4 py-3 marker:content-none [&::-webkit-details-marker]:hidden">
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold text-ink">{template.name}</span>
                      <code className="mt-0.5 block text-xs text-muted-foreground">
                        {template.key}
                      </code>
                    </span>
                    <span className="flex shrink-0 items-center gap-2">
                      <Chip tone={template.is_enabled ? "green" : "slate"}>
                        {template.is_enabled ? "Enabled" : "Disabled"}
                      </Chip>
                      <span className="text-xs font-medium text-signal">
                        {open ? "Editing" : "Edit →"}
                      </span>
                    </span>
                  </summary>

                  <form action={saveTemplateAction} className="space-y-3 p-4">
                    <input type="hidden" name="slug" value={slug} />
                    <input type="hidden" name="template_id" value={template.id} />

                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <label className="flex items-center gap-2 text-sm text-ink-2">
                        <input
                          type="checkbox"
                          name="is_enabled"
                          defaultChecked={Boolean(template.is_enabled)}
                        />
                        Enabled for this event
                      </label>
                      <LinkButton
                        href={
                          open
                            ? `/admin/e/${slug}/emails/templates`
                            : `/admin/e/${slug}/emails/templates?preview=${template.key}`
                        }
                        size="sm"
                      >
                        {open ? "Hide preview" : "Show preview"}
                      </LinkButton>
                    </div>

                    {open ? (
                      <div className="rounded-md border border-rule bg-paper-3 p-3">
                        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          Preview for {SAMPLE_CONTEXT.speaker_name}
                        </p>
                        <p className="mt-1 text-sm font-medium text-ink">{preview.subject}</p>
                        <div
                          className="prose-cf mt-2 rounded-md border border-rule bg-paper p-3 text-sm text-ink-2"
                          dangerouslySetInnerHTML={{ __html: preview.body }}
                        />
                      </div>
                    ) : null}

                    <Field label="Subject" name={`subject-${template.id}`}>
                      <Input
                        id={`subject-${template.id}`}
                        name="subject"
                        defaultValue={template.subject}
                      />
                    </Field>
                    <Field label="Body" name={`body-${template.id}`}>
                      <Textarea
                        id={`body-${template.id}`}
                        name="body_html"
                        rows={7}
                        defaultValue={template.body_html}
                      />
                    </Field>

                    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-rule pt-3">
                      <p className="text-xs text-muted-foreground">
                        Saves subject, body, and enabled state for this template.
                      </p>
                      <Button type="submit" variant="primary" size="sm">
                        Save template
                      </Button>
                    </div>
                  </form>
                </details>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
