"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { applyMergeFields } from "@/lib/email/merge";
import { SAMPLE_MERGE_FIELDS } from "@/lib/email/sample-fields";
import { saveEmailTemplateAction } from "./actions";

type Template = {
  id: string;
  key: string;
  subject: string;
  bodyHtml: string;
  isEnabled: boolean;
};

const MERGE_FIELD_HINTS = Object.keys(SAMPLE_MERGE_FIELDS).map((k) => `{${k}}`);

function humanizeKey(key: string) {
  return key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function EmailTemplateEditor({
  slug,
  eventName,
  templates,
}: {
  slug: string;
  eventName: string;
  templates: Template[];
}) {
  return (
    <div className="space-y-4">
      {templates.map((tpl) => (
        <EmailTemplateCard key={tpl.id} slug={slug} eventName={eventName} template={tpl} />
      ))}
    </div>
  );
}

function EmailTemplateCard({
  slug,
  eventName,
  template,
}: {
  slug: string;
  eventName: string;
  template: Template;
}) {
  const [subject, setSubject] = useState(template.subject);
  const [bodyHtml, setBodyHtml] = useState(template.bodyHtml);
  const [isEnabled, setIsEnabled] = useState(template.isEnabled);

  const sampleFields = useMemo(
    () => ({
      ...SAMPLE_MERGE_FIELDS,
      event_name: eventName,
    }),
    [eventName],
  );

  const previewSubject = applyMergeFields(subject || "Subject preview", sampleFields);
  const previewBody = applyMergeFields(bodyHtml || "<p>Message preview</p>", sampleFields);

  return (
    <form action={saveEmailTemplateAction} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <input type="hidden" name="slug" value={slug} />
      <input type="hidden" name="templateId" value={template.id} />

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-base font-semibold text-slate-900">{humanizeKey(template.key)}</h3>
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            name="isEnabled"
            checked={isEnabled}
            onChange={(e) => setIsEnabled(e.target.checked)}
            className="rounded border-slate-300"
          />
          Enabled
        </label>
      </div>

      <div className="grid gap-4">
        <div>
          <Label htmlFor={`subject-${template.id}`}>Subject</Label>
          <Input
            id={`subject-${template.id}`}
            name="subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            required
          />
        </div>

        <div>
          <Label htmlFor={`body-${template.id}`}>Body (HTML)</Label>
          <Textarea
            id={`body-${template.id}`}
            name="bodyHtml"
            rows={5}
            value={bodyHtml}
            onChange={(e) => setBodyHtml(e.target.value)}
            required
          />
          <p className="mt-1 text-xs text-slate-500">
            Merge fields: {MERGE_FIELD_HINTS.join(", ")}
          </p>
        </div>

        <div className="rounded-md border border-slate-200 bg-slate-50 p-3 text-sm">
          <p className="mb-1 font-medium text-slate-700">Preview with sample data</p>
          <p className="text-slate-600">
            <span className="font-medium">Subject:</span> {previewSubject}
          </p>
          <div
            className="prose prose-sm mt-2 max-w-none text-slate-700"
            dangerouslySetInnerHTML={{ __html: previewBody }}
          />
        </div>

        <div>
          <Button type="submit">Save template</Button>
        </div>
      </div>
    </form>
  );
}
