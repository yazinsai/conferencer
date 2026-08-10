"use client";

import { useState } from "react";

import { buttonClass, cx, fileInputClass, inputClass } from "@/components/ui";
import { autoMap, IMPORT_FIELDS, parseCsv } from "@/lib/csv";

/**
 * File → parse → column mapping → preview → import (SPK-03).
 * Parsing happens in the browser so the organizer sees exactly what will land.
 */
export function CsvImporter({
  slug,
  action,
}: {
  slug: string;
  action: (formData: FormData) => Promise<void>;
}) {
  const [raw, setRaw] = useState("");
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<string[][]>([]);
  const [mapping, setMapping] = useState<Record<number, string>>({});

  async function onFile(file: File) {
    const text = await file.text();
    const parsed = parseCsv(text);
    setRaw(text);
    setHeaders(parsed.headers);
    setRows(parsed.rows);
    setMapping(autoMap(parsed.headers));
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white">
      <div className="border-b border-slate-200 px-4 py-3">
        <h2 className="text-sm font-semibold text-slate-900">Upload a CSV</h2>
        <p className="text-xs text-slate-500">
          The file stays in your browser until you press Import.
        </p>
      </div>
      <div className="space-y-4 p-4">
        <input
          type="file"
          accept=".csv,text/csv"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void onFile(file);
          }}
          className={fileInputClass}
        />

        {headers.length ? (
          <>
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Map the columns</h3>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                {headers.map((header, index) => (
                  <label key={`${header}-${index}`} className="flex items-center gap-2 text-sm">
                    <span className="w-40 shrink-0 truncate font-mono text-xs text-slate-600">
                      {header || `Column ${index + 1}`}
                    </span>
                    <select
                      className={cx(inputClass, "py-1 text-xs")}
                      value={mapping[index] ?? ""}
                      onChange={(e) =>
                        setMapping((prev) => ({ ...prev, [index]: e.target.value }))
                      }
                    >
                      <option value="">— ignore —</option>
                      {IMPORT_FIELDS.map((field) => (
                        <option key={field.key} value={field.key}>
                          {field.label}
                        </option>
                      ))}
                    </select>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                Preview ({rows.length} rows)
              </h3>
              <div className="mt-2 max-h-64 overflow-auto rounded-md border border-slate-200">
                <table className="w-full text-xs">
                  <thead className="bg-slate-50">
                    <tr>
                      {headers.map((header, index) => (
                        <th key={index} className="px-2 py-1 text-left font-medium text-slate-600">
                          {mapping[index] ? (
                            <span className="text-brand-700">{mapping[index]}</span>
                          ) : (
                            <span className="text-slate-400">ignored</span>
                          )}
                          <span className="block font-normal text-slate-400">{header}</span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.slice(0, 12).map((row, i) => (
                      <tr key={i} className="border-t border-slate-100">
                        {headers.map((_, index) => (
                          <td key={index} className="px-2 py-1 text-slate-700">
                            {row[index] ?? ""}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <form action={action}>
              <input type="hidden" name="slug" value={slug} />
              <input type="hidden" name="csv" value={raw} />
              {headers.map((_, index) => (
                <input key={index} type="hidden" name="map" value={mapping[index] ?? ""} />
              ))}
              <button type="submit" className={buttonClass("primary", "md")}>
                Import {rows.length} rows
              </button>
            </form>
          </>
        ) : null}
      </div>
    </div>
  );
}
