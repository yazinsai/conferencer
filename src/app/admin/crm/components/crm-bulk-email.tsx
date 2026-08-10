"use client";

import { useMemo, useState } from "react";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { applyMergeFields } from "@/lib/email/merge";

type EmailTemplate = {
  key: string;
  subject: string;
  bodyHtml: string;
};

const MERGE_FIELDS = [
  "{speaker_name}",
  "{first_name}",
  "{last_name}",
  "{event_name}",
  "{company}",
  "{job_title}",
  "{portal_link}",
] as const;

export function CrmBulkEmailFields({
  templates,
  eventName,
  sampleContact,
}: {
  templates: EmailTemplate[];
  eventName: string;
  sampleContact: { firstName: string; lastName: string; company?: string | null; jobTitle?: string | null };
}) {
  const [templateKey, setTemplateKey] = useState("");
  const [subject, setSubject] = useState("");
  const [bodyHtml, setBodyHtml] = useState("");

  const sampleFields = useMemo(
    () => ({
      speaker_name: `${sampleContact.firstName} ${sampleContact.lastName}`,
      first_name: sampleContact.firstName,
      last_name: sampleContact.lastName,
      event_name: eventName,
      company: sampleContact.company ?? "",
      job_title: sampleContact.jobTitle ?? "",
      portal_link: "/portal",
    }),
    [sampleContact, eventName],
  );

  const sampleSubject = applyMergeFields(subject || "Subject preview", sampleFields);
  const sampleBody = applyMergeFields(bodyHtml || "<p>Message preview</p>", sampleFields);

  function onTemplateChange(key: string) {
    setTemplateKey(key);
    const tpl = templates.find((t) => t.key === key);
    if (tpl) {
      setSubject(tpl.subject);
      setBodyHtml(tpl.bodyHtml);
    }
  }

  return (
    <div className="space-y-3 border-b border-slate-100 px-4 py-3">
      <h3 className="text-sm font-medium text-slate-700">Send email to selected contacts</h3>
      <input type="hidden" name="templateKey" value={templateKey} />

      <div className="grid gap-3 md:grid-cols-2">
        <div>
          <Label htmlFor="crmTemplateSelect">Template (optional)</Label>
          <Select
            id="crmTemplateSelect"
            value={templateKey}
            onChange={(e) => onTemplateChange(e.target.value)}
          >
            <option value="">Custom message</option>
            {templates.map((t) => (
              <option key={t.key} value={t.key}>
                {t.key.replace(/_/g, " ")}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="crmEmailSubject">Subject</Label>
          <Input
            id="crmEmailSubject"
            name="subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Subject line with {merge_fields}"
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="crmEmailBody">Message body (HTML)</Label>
        <Textarea
          id="crmEmailBody"
          name="bodyHtml"
          rows={4}
          value={bodyHtml}
          onChange={(e) => setBodyHtml(e.target.value)}
          placeholder="<p>Hi {first_name}, …</p>"
          required
        />
        <p className="mt-1 text-xs text-slate-500">Merge fields: {MERGE_FIELDS.join(", ")}</p>
      </div>

      <div className="rounded-md border border-slate-200 bg-slate-50 p-3 text-sm">
        <p className="mb-1 font-medium text-slate-700">Sample merge preview</p>
        <p className="text-slate-600">
          <span className="font-medium">Subject:</span> {sampleSubject}
        </p>
        <div
          className="prose prose-sm mt-2 max-w-none text-slate-700"
          dangerouslySetInnerHTML={{ __html: sampleBody }}
        />
      </div>
    </div>
  );
}
