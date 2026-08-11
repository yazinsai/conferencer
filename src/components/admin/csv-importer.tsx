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
    <div className="rounded-card border border-rule bg-paper shadow-[var(--shadow-card)]">
      <div className="border-b border-rule px-4 py-3">
        <p className="text-xs font-medium uppercase tracking-[0.1em] text-muted-foreground">
          Step 1
        </p>
        <h2 className="mt-0.5 text-sm font-semibold text-ink">Upload a CSV</h2>
        <p className="text-xs text-muted-foreground">
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
              <h3 className="text-sm font-semibold text-ink">Map the columns</h3>
              <details className="mt-2 rounded-input border border-rule bg-paper-2 px-3 py-2">
                <summary
                  className={cx(
                    "cursor-pointer list-none text-xs font-medium text-ink-2",
                    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                    "[&::-webkit-details-marker]:hidden",
                  )}
                >
                  All recognised fields
                </summary>
                <ul className="mt-2 grid gap-1 text-xs text-muted-foreground sm:grid-cols-2">
                  {IMPORT_FIELDS.map((field) => (
                    <li key={field.key}>{field.label}</li>
                  ))}
                </ul>
              </details>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {headers.map((header, index) => {
                  const mapped = Boolean(mapping[index]);
                  return (
                    <label
                      key={`${header}-${index}`}
                      className={cx(
                        "flex items-center gap-2 text-sm",
                        !mapped && "text-muted-foreground",
                      )}
                    >
                      <span
                        className={cx(
                          "w-40 shrink-0 truncate text-xs wordmark",
                          mapped ? "text-ink-2" : "text-muted-foreground",
                        )}
                      >
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
                  );
                })}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-ink">
                Preview (<span className="wordmark tnum">{rows.length}</span> rows)
              </h3>
              <div className="mt-2 max-h-64 overflow-auto rounded-input border border-rule">
                <table className="w-full text-xs">
                  <thead className="bg-paper-3">
                    <tr>
                      {headers.map((header, index) => (
                        <th
                          key={index}
                          className={cx(
                            "px-2 py-1.5 text-left font-medium",
                            mapping[index] ? "text-ink-2" : "text-muted-foreground",
                          )}
                        >
                          {mapping[index] ? (
                            <span>{mapping[index]}</span>
                          ) : (
                            <span>ignored</span>
                          )}
                          <span className="block font-normal text-muted-foreground wordmark">
                            {header}
                          </span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.slice(0, 12).map((row, i) => (
                      <tr key={i} className="border-t border-rule">
                        {headers.map((_, index) => (
                          <td
                            key={index}
                            className={cx(
                              "px-2 py-1",
                              mapping[index] ? "text-ink-2" : "text-muted-foreground",
                            )}
                          >
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
