"use client";

import { useEffect, useId, useState } from "react";

import { Field, Input, Select, Textarea } from "@/components/ui";

/**
 * Progressive enhancement for the create/edit task form: hide type-specific
 * field groups until that type is selected. Without JS every control stays
 * visible and server-submittable. Hidden groups remain in the DOM so values
 * survive type switches.
 */
export function TaskTypeFields({
  defaultType = "action",
  linkUrl = "",
  acceptedTypes = "",
  maxSizeMb = 20,
  formSchema = "",
}: {
  defaultType?: string;
  linkUrl?: string;
  acceptedTypes?: string;
  maxSizeMb?: number | null;
  formSchema?: string;
}) {
  const [type, setType] = useState(defaultType);
  const [enhanced, setEnhanced] = useState(false);
  const statusId = useId();

  useEffect(() => {
    setEnhanced(true);
  }, []);

  const showLink = !enhanced || type === "action";
  const showFile = !enhanced || type === "file_request";
  const showForm = !enhanced || type === "form";

  return (
    <>
      <Field label="Type" name="type">
        <Select
          id="type"
          name="type"
          defaultValue={defaultType}
          onChange={(event) => setType(event.target.value)}
          aria-describedby={statusId}
        >
          <option value="action">Action — mark complete</option>
          <option value="file_request">File request — upload a file</option>
          <option value="form">Form — answer questions</option>
        </Select>
      </Field>
      <p id={statusId} className="sr-only" aria-live="polite">
        {enhanced
          ? `Showing fields for ${type.replace("_", " ")} tasks.`
          : "All task fields are available."}
      </p>

      <div className={showLink ? "space-y-3" : "hidden"} data-task-group="action">
        <p className="text-xs font-medium text-ink-2">Action details</p>
        <Field label="Link" name="link_url" hint="Optional resource to open.">
          <Input id="link_url" name="link_url" defaultValue={linkUrl} />
        </Field>
      </div>

      <div className={showFile ? "space-y-3" : "hidden"} data-task-group="file_request">
        <p className="text-xs font-medium text-ink-2">File request</p>
        <Field
          label="Accepted file types"
          name="accepted_types"
          hint="Comma separated, e.g. .pdf,.pptx — shown to the speaker before they pick a file."
        >
          <Input id="accepted_types" name="accepted_types" defaultValue={acceptedTypes} />
        </Field>
        <Field label="Max size (MB)" name="max_size_mb">
          <Input
            id="max_size_mb"
            name="max_size_mb"
            type="number"
            defaultValue={maxSizeMb ?? 20}
          />
        </Field>
      </div>

      <div className={showForm ? "space-y-3" : "hidden"} data-task-group="form">
        <p className="text-xs font-medium text-ink-2">Form questions</p>
        <Field
          label="Form questions"
          name="form_schema"
          hint="One per line: Label | type | required | option;option"
        >
          <Textarea
            id="form_schema"
            name="form_schema"
            rows={4}
            defaultValue={formSchema}
            placeholder={
              "Arrival date | date | required\nHotel needed | dropdown | required | Yes;No"
            }
          />
        </Field>
      </div>
    </>
  );
}

/**
 * Progressive enhancement for the assign form: show the speaker checkbox list
 * only when “Only the people I tick” is selected. Without JS the full fieldset
 * remains available.
 */
export function AssignAudienceFields({
  roster,
}: {
  roster: Array<{ id: string; name: string; email: string | null }>;
}) {
  const [audience, setAudience] = useState("accepted");
  const [enhanced, setEnhanced] = useState(false);
  const statusId = useId();

  useEffect(() => {
    setEnhanced(true);
  }, []);

  const showPicker = !enhanced || audience === "selected";
  const summary =
    audience === "all"
      ? "Every speaker on the roster will receive this task."
      : "Speakers on accepted sessions will receive this task.";

  return (
    <>
      <Field label="Audience" name="audience">
        <Select
          id="audience"
          name="audience"
          defaultValue="accepted"
          onChange={(event) => setAudience(event.target.value)}
          aria-describedby={statusId}
        >
          <option value="accepted">Speakers on accepted sessions</option>
          <option value="all">Every speaker on the roster</option>
          <option value="selected">Only the people I tick</option>
        </Select>
      </Field>
      <p id={statusId} className="sr-only" aria-live="polite">
        {enhanced
          ? audience === "selected"
            ? "Speaker picker available."
            : summary
          : "Speaker picker and audience options are both available."}
      </p>
      {showPicker ? (
        <fieldset className="max-h-56 overflow-y-auto rounded-input border border-rule p-3">
          <legend className="px-1 text-xs font-medium text-ink-2">Speakers</legend>
          {roster.map((row) => (
            <label key={row.id} className="flex items-center gap-2 py-0.5 text-sm">
              <input type="checkbox" name="contact_ids" value={row.id} />
              {row.name}{" "}
              <span className="text-xs text-muted-foreground">{row.email}</span>
            </label>
          ))}
        </fieldset>
      ) : (
        <p className="rounded-input border border-rule bg-paper-2 px-3 py-2 text-sm text-muted-foreground">
          {summary}
        </p>
      )}
    </>
  );
}
