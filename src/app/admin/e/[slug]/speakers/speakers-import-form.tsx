"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Label } from "@/components/ui/input";
import {
  importSpeakersCsvAction,
  previewSpeakersCsvAction,
  type ImportPreview,
} from "./actions";

type ImportState = ImportPreview & { csvText?: string; step?: "preview" | "done" };

async function previewAction(_prev: ImportState, formData: FormData): Promise<ImportState> {
  const file = formData.get("csvFile");
  if (!(file instanceof File)) {
    return { created: 0, updated: 0, skipped: 0, total: 0, errors: ["Choose a CSV file"] };
  }
  const preview = await previewSpeakersCsvAction(formData);
  const csvText = await file.text();
  return { ...preview, csvText, step: "preview" };
}

async function importAction(_prev: ImportState, formData: FormData): Promise<ImportState> {
  const result = await importSpeakersCsvAction(formData);
  return { ...result, step: "done" };
}

const COLUMN_HELP =
  "Expected columns: first_name, last_name, email, job_title, company, biography";

export function SpeakersImportForm({ slug }: { slug: string }) {
  const [previewState, previewFormAction, previewPending] = useActionState(previewAction, {
    created: 0,
    updated: 0,
    skipped: 0,
    total: 0,
    errors: [],
  });
  const [importState, importFormAction, importPending] = useActionState(importAction, {
    created: 0,
    updated: 0,
    skipped: 0,
    total: 0,
    errors: [],
  });

  const done = importState.step === "done";
  const showPreview = previewState.step === "preview" && !done;

  return (
    <Card>
      <CardHeader title="Import speakers from CSV" subtitle={COLUMN_HELP} />
      <CardBody className="space-y-4">
        {!showPreview && !done ? (
          <form action={previewFormAction} className="space-y-3">
            <input type="hidden" name="slug" value={slug} />
            <div>
              <Label htmlFor="csvFile">CSV file</Label>
              <input
                id="csvFile"
                name="csvFile"
                type="file"
                accept=".csv,text/csv"
                required
                className="mt-1 block w-full text-sm"
              />
            </div>
            {previewState.errors.length > 0 && !previewState.step ? (
              <p className="text-sm text-rose-600">{previewState.errors[0]}</p>
            ) : null}
            <Button type="submit" disabled={previewPending}>
              {previewPending ? "Parsing…" : "Preview import"}
            </Button>
          </form>
        ) : null}

        {showPreview ? (
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3">
                <div className="text-2xl font-semibold text-emerald-800">
                  {previewState.created}
                </div>
                <div className="text-sm text-emerald-700">To create</div>
              </div>
              <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3">
                <div className="text-2xl font-semibold text-blue-800">
                  {previewState.updated}
                </div>
                <div className="text-sm text-blue-700">To update</div>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
                <div className="text-2xl font-semibold text-slate-800">
                  {previewState.skipped}
                </div>
                <div className="text-sm text-slate-600">Skipped</div>
              </div>
            </div>
            <p className="text-sm text-slate-600">
              {previewState.total} valid row{previewState.total === 1 ? "" : "s"} ready to import.
            </p>
            {previewState.errors.length > 0 ? (
              <ul className="max-h-32 overflow-y-auto text-sm text-amber-700">
                {previewState.errors.map((e) => (
                  <li key={e}>{e}</li>
                ))}
              </ul>
            ) : null}
            <form action={importFormAction} className="flex gap-2">
              <input type="hidden" name="slug" value={slug} />
              <input type="hidden" name="csvText" value={previewState.csvText ?? ""} />
              <Button type="submit" disabled={importPending || previewState.total === 0}>
                {importPending ? "Importing…" : "Confirm import"}
              </Button>
            </form>
          </div>
        ) : null}

        {done ? (
          <div className="space-y-2">
            <p className="font-medium text-emerald-800">Import complete</p>
            <p className="text-sm text-slate-600">
              Created {importState.created}, updated {importState.updated}, skipped{" "}
              {importState.skipped}.
            </p>
          </div>
        ) : null}
      </CardBody>
    </Card>
  );
}
