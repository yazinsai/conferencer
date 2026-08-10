"use client";

import { useActionState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import { autoAssignAction, previewAutoAssignAction } from "../actions";

type Preview = {
  newAssignments: number;
  submissionCount: number;
  reviewerCount: number;
  description: string;
};

type FormState = {
  preview?: Preview;
  created?: number;
  error?: string;
};

async function previewAction(_prev: FormState, formData: FormData): Promise<FormState> {
  try {
    const preview = await previewAutoAssignAction(formData);
    return { preview };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Preview failed" };
  }
}

async function applyAction(_prev: FormState, formData: FormData): Promise<FormState> {
  try {
    const result = await autoAssignAction(formData);
    return { created: result.created };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Auto-assign failed" };
  }
}

type Track = { id: string; name: string };

export function AutoAssignForm({
  slug,
  planId,
  roundId,
  tracks,
}: {
  slug: string;
  planId: string;
  roundId: string;
  tracks: Track[];
}) {
  const [previewState, previewFormAction, previewPending] = useActionState(previewAction, {});
  const [applyState, applyFormAction, applyPending] = useActionState(applyAction, {});
  const [, startTransition] = useTransition();

  const preview = previewState.preview;
  const created = applyState.created;

  return (
    <div className="space-y-4">
      <form
        id="auto-assign-form"
        className="grid gap-3 sm:grid-cols-2"
        onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          startTransition(() => previewFormAction(fd));
        }}
      >
        <input type="hidden" name="slug" value={slug} />
        <input type="hidden" name="planId" value={planId} />
        <input type="hidden" name="roundId" value={roundId} />
        <div>
          <Label>Distribution mode</Label>
          <Select name="mode" defaultValue="reviewers_per_submission">
            <option value="reviewers_per_submission">N reviewers per submission</option>
            <option value="max_per_reviewer">Max submissions per reviewer</option>
          </Select>
        </div>
        <div>
          <Label>Count (N)</Label>
          <Input name="count" type="number" min={1} defaultValue={2} required />
        </div>
        <div className="sm:col-span-2">
          <Label>Track filter (optional)</Label>
          <Select name="trackId" defaultValue="">
            <option value="">All tracks</option>
            {tracks.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </Select>
        </div>
        <div className="sm:col-span-2 flex flex-wrap gap-2">
          <Button type="submit" variant="secondary" disabled={previewPending}>
            {previewPending ? "Previewing…" : "Preview impact"}
          </Button>
          <Button
            type="button"
            disabled={applyPending || !preview || preview.newAssignments === 0}
            onClick={() => {
              const form = document.getElementById("auto-assign-form") as HTMLFormElement | null;
              if (!form) return;
              const fd = new FormData(form);
              startTransition(() => applyFormAction(fd));
            }}
          >
            {applyPending ? "Applying…" : "Apply auto-assign"}
          </Button>
        </div>
      </form>

      {previewState.error || applyState.error ? (
        <p className="text-sm text-rose-600">{previewState.error ?? applyState.error}</p>
      ) : null}

      {preview ? (
        <div className="rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-900">
          <strong>Impact preview:</strong> {preview.description}
        </div>
      ) : null}

      {created != null ? (
        <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
          Created {created} assignment(s).
        </div>
      ) : null}
    </div>
  );
}
