"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { createTaskAction } from "./actions";

const TASK_TYPES = [
  { value: "action", label: "Action (mark complete)" },
  { value: "file_request", label: "File request" },
  { value: "form", label: "Form" },
] as const;

type Speaker = {
  contactId: string;
  firstName: string;
  lastName: string;
  speakerStatus: string;
};

type SubmissionForm = {
  id: string;
  name: string;
};

export function CreateTaskForm({
  slug,
  speakers,
  confirmedCount,
  submissionForms,
}: {
  slug: string;
  speakers: Speaker[];
  confirmedCount: number;
  submissionForms: SubmissionForm[];
}) {
  const [type, setType] = useState("action");

  return (
    <form action={createTaskAction} className="space-y-4">
      <input type="hidden" name="slug" value={slug} />
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" required />
        </div>
        <div>
          <Label htmlFor="type">Type</Label>
          <Select
            id="type"
            name="type"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            {TASK_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </Select>
        </div>
        {type === "form" ? (
          <div className="md:col-span-2">
            <Label htmlFor="formId">Form</Label>
            <Select id="formId" name="formId" defaultValue="">
              <option value="">Free text (no form)</option>
              {submissionForms.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </Select>
            {submissionForms.length === 0 ? (
              <p className="mt-1 text-xs text-slate-500">
                No submission forms yet — speakers will see a free-text response field.
              </p>
            ) : null}
          </div>
        ) : null}
        <div className="md:col-span-2">
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" name="description" rows={2} />
        </div>
        <div>
          <Label htmlFor="linkUrl">Link URL (action tasks)</Label>
          <Input id="linkUrl" name="linkUrl" type="url" placeholder="https://…" />
        </div>
        <div>
          <Label htmlFor="dueAt">Due date</Label>
          <Input id="dueAt" name="dueAt" type="date" />
        </div>
        {type === "file_request" ? (
          <>
            <div>
              <Label htmlFor="acceptedTypes">Accepted file types</Label>
              <Input
                id="acceptedTypes"
                name="acceptedTypes"
                defaultValue="application/pdf,image/png,image/jpeg"
              />
            </div>
            <div>
              <Label htmlFor="maxSizeMb">Max file size (MB)</Label>
              <Input
                id="maxSizeMb"
                name="maxSizeMb"
                type="number"
                min={1}
                max={100}
                defaultValue={20}
              />
            </div>
          </>
        ) : null}
      </div>

      <div className="border-t border-slate-100 pt-4">
        <Label>Assign to</Label>
        <div className="mt-2 space-y-2">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              name="assignMode"
              value="all_confirmed"
              defaultChecked
            />
            All confirmed speakers ({confirmedCount})
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="radio" name="assignMode" value="selected" />
            Selected speakers
          </label>
        </div>
        <div className="mt-3 max-h-48 overflow-y-auto rounded-md border border-slate-200 p-3">
          {speakers.map((s) => (
            <label
              key={s.contactId}
              className="flex items-center gap-2 py-1 text-sm"
            >
              <input type="checkbox" name="contactIds" value={s.contactId} />
              {s.firstName} {s.lastName}
              <span className="text-slate-400">({s.speakerStatus})</span>
            </label>
          ))}
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="isRequired" defaultChecked />
        Required task
      </label>

      <Button type="submit">Create task</Button>
    </form>
  );
}
