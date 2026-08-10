import { requireOrganizer } from "@/lib/guards";
import { listTemplates, renderTemplate } from "@/lib/repo/emails";
import { saveTemplateAction } from "@/server/email-actions";
import { MERGE_FIELDS, SAMPLE_CONTEXT } from "@/lib/merge";
import {
  Button,
  Card,
  CardHeader,
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
  const previewKey = typeof sp.preview === "string" ? sp.preview : null;

  return (
    <div className="max-w-4xl">
      <PageHeader
        title="Email templates"
        description="Every automated message, editable per event. Preview renders against a sample speaker."
        actions={<LinkButton href={`/admin/e/${slug}/emails`}>Back to emails</LinkButton>}
      />

      {sp.saved ? <Notice tone="success" className="mb-4">Template saved.</Notice> : null}

      <Notice tone="info" className="mb-4">
        <p className="font-medium">Merge fields</p>
        <p className="mt-1 font-mono text-xs">{MERGE_FIELDS.join("  ")}</p>
      </Notice>

      <div className="space-y-4">
        {templates.map((template) => {
          const preview = renderTemplate(template, SAMPLE_CONTEXT);
          const open = previewKey === template.key;
          return (
            <Card key={template.id}>
              <CardHeader
                title={template.name}
                description={<code className="text-xs">{template.key}</code>}
                actions={
                  <>
                    <Chip tone={template.is_enabled ? "green" : "slate"}>
                      {template.is_enabled ? "Enabled" : "Disabled"}
                    </Chip>
                    <LinkButton
                      href={`/admin/e/${slug}/emails/templates?preview=${open ? "" : template.key}`}
                      size="sm"
                    >
                      {open ? "Hide preview" : "Preview"}
                    </LinkButton>
                  </>
                }
              />
              {open ? (
                <div className="border-b border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Preview for {SAMPLE_CONTEXT.speaker_name}
                  </p>
                  <p className="mt-1 text-sm font-medium text-slate-900">{preview.subject}</p>
                  <div
                    className="prose-cf mt-2 rounded-md border border-slate-200 bg-white p-3 text-sm text-slate-700"
                    dangerouslySetInnerHTML={{ __html: preview.body }}
                  />
                </div>
              ) : null}
              <form action={saveTemplateAction} className="space-y-3 p-4">
                <input type="hidden" name="slug" value={slug} />
                <input type="hidden" name="template_id" value={template.id} />
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
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    name="is_enabled"
                    defaultChecked={Boolean(template.is_enabled)}
                  />
                  Enabled
                </label>
                <Button type="submit" variant="primary" size="sm">
                  Save template
                </Button>
              </form>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
