"use client";

import Link from "next/link";
import { useState } from "react";

import { buttonClass, Chip, cx, Td, Th } from "@/components/ui";
import type { SubmissionRow } from "@/lib/repo/submissions";
import { APPROVAL_LABELS, STATUS_LABELS, statusTone } from "@/lib/repo/submissions";

export type Column = { key: string; label: string };

export const ALL_COLUMNS: Column[] = [
  { key: "status", label: "Status" },
  { key: "form", label: "Source form" },
  { key: "title", label: "Title" },
  { key: "description", label: "Description" },
  { key: "speakers", label: "Speakers" },
  { key: "track", label: "Track" },
  { key: "tags", label: "Tags" },
  { key: "format", label: "Format" },
  { key: "level", label: "Level" },
  { key: "files", label: "Files" },
  { key: "rating", label: "Rating" },
  { key: "approval", label: "Approval" },
  { key: "schedule", label: "Scheduled" },
  { key: "notified", label: "Notified" },
  { key: "created", label: "Submitted" },
];

export const DEFAULT_COLUMNS = [
  "status",
  "title",
  "speakers",
  "track",
  "format",
  "files",
  "rating",
  "approval",
  "notified",
];

export function SubmissionTable({
  rows,
  slug,
  columns,
  statuses,
  approvals,
  formNames,
  setStatusAction,
  setApprovalAction,
}: {
  rows: SubmissionRow[];
  slug: string;
  columns: string[];
  statuses: string[];
  approvals: string[];
  formNames: Record<string, string>;
  setStatusAction: (formData: FormData) => Promise<void>;
  setApprovalAction: (formData: FormData) => Promise<void>;
}) {
  const [selected, setSelected] = useState<string[]>([]);
  const allSelected = rows.length > 0 && selected.length === rows.length;
  const show = (key: string) => columns.includes(key);
  const base = `/admin/e/${slug}/submissions`;

  return (
    <div>
      {selected.length ? (
        <div className="mb-3 flex flex-wrap items-center gap-3 rounded-md border border-brand-200 bg-brand-50 px-3 py-2 text-sm">
          <span className="font-medium text-brand-900">{selected.length} selected</span>
          <form action={setStatusAction} className="flex items-center gap-2">
            <input type="hidden" name="slug" value={slug} />
            {selected.map((id) => (
              <input key={id} type="hidden" name="ids" value={id} />
            ))}
            <label htmlFor="bulk-status" className="text-xs text-brand-900">
              Set status
            </label>
            <select
              id="bulk-status"
              name="status"
              className="rounded-md border border-slate-300 px-2 py-1 text-xs"
              defaultValue="accepted"
            >
              {statuses.map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABELS[s as keyof typeof STATUS_LABELS] ?? s}
                </option>
              ))}
            </select>
            <button type="submit" className={buttonClass("primary", "sm")}>
              Apply
            </button>
          </form>
          <form action={setApprovalAction} className="flex items-center gap-2">
            <input type="hidden" name="slug" value={slug} />
            {selected.map((id) => (
              <input key={id} type="hidden" name="ids" value={id} />
            ))}
            <label htmlFor="bulk-approval" className="text-xs text-brand-900">
              Content approval
            </label>
            <select
              id="bulk-approval"
              name="approval_status"
              className="rounded-md border border-slate-300 px-2 py-1 text-xs"
              defaultValue="approved"
            >
              {approvals.map((s) => (
                <option key={s} value={s}>
                  {APPROVAL_LABELS[s] ?? s}
                </option>
              ))}
            </select>
            <button type="submit" className={buttonClass("secondary", "sm")}>
              Apply
            </button>
          </form>
          <a
            className={buttonClass("secondary", "sm")}
            href={`/admin/e/${slug}/submissions/export.csv?ids=${selected.join(",")}`}
          >
            Export selected
          </a>
          <button
            type="button"
            className={buttonClass("ghost", "sm")}
            onClick={() => setSelected([])}
          >
            Clear
          </button>
        </div>
      ) : null}

      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr>
              <Th className="w-8">
                <input
                  type="checkbox"
                  aria-label="Select all submissions"
                  checked={allSelected}
                  onChange={(e) => setSelected(e.target.checked ? rows.map((r) => r.id) : [])}
                />
              </Th>
              <Th className="w-8" />
              {ALL_COLUMNS.filter((c) => show(c.key)).map((column) => (
                <Th key={column.key}>{column.label}</Th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className={cx(selected.includes(row.id) && "bg-brand-50/50")}>
                <Td>
                  <input
                    type="checkbox"
                    aria-label={`Select ${row.title}`}
                    checked={selected.includes(row.id)}
                    onChange={(e) =>
                      setSelected((prev) =>
                        e.target.checked ? [...prev, row.id] : prev.filter((x) => x !== row.id),
                      )
                    }
                  />
                </Td>
                <Td>
                  <Link
                    href={`${base}/${row.id}?edit=1`}
                    title="Quick edit"
                    aria-label={`Edit ${row.title}`}
                    className="text-slate-400 hover:text-brand-700"
                  >
                    ✎
                  </Link>
                </Td>
                {show("status") ? (
                  <Td>
                    <form action={setStatusAction} className="flex items-center gap-1">
                      <input type="hidden" name="slug" value={slug} />
                      <input type="hidden" name="id" value={row.id} />
                      <select
                        name="status"
                        defaultValue={row.status}
                        aria-label={`Status for ${row.title}`}
                        className="rounded-md border border-slate-300 bg-white px-1.5 py-1 text-xs"
                        onChange={(e) => e.currentTarget.form?.requestSubmit()}
                      >
                        {statuses.map((s) => (
                          <option key={s} value={s}>
                            {STATUS_LABELS[s as keyof typeof STATUS_LABELS] ?? s}
                          </option>
                        ))}
                      </select>
                      <noscript>
                        <button type="submit" className="text-xs underline">
                          Save
                        </button>
                      </noscript>
                    </form>
                  </Td>
                ) : null}
                {show("form") ? (
                  <Td className="text-xs text-slate-500">
                    {row.form_id ? formNames[row.form_id] ?? "—" : "Added manually"}
                  </Td>
                ) : null}
                {show("title") ? (
                  <Td className="min-w-56">
                    <Link
                      href={`${base}/${row.id}`}
                      className="font-medium text-slate-900 hover:text-brand-700"
                    >
                      {row.title}
                    </Link>
                    <span className="ml-1.5 text-[11px] uppercase tracking-wide text-slate-400">
                      {row.kind}
                    </span>
                  </Td>
                ) : null}
                {show("description") ? (
                  <Td className="min-w-64 text-xs text-slate-500">
                    {(row.description ?? "").slice(0, 120)}
                    {(row.description ?? "").length > 120 ? "…" : ""}
                  </Td>
                ) : null}
                {show("speakers") ? <Td className="min-w-40">{row.speakers ?? "—"}</Td> : null}
                {show("track") ? (
                  <Td>
                    {row.track_name ? (
                      <Chip color={row.track_color}>{row.track_name}</Chip>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </Td>
                ) : null}
                {show("tags") ? (
                  <Td className="text-xs text-slate-500">
                    {(JSON.parse(row.tags || "[]") as string[]).join(", ") || "—"}
                  </Td>
                ) : null}
                {show("format") ? <Td>{row.format_name ?? "—"}</Td> : null}
                {show("level") ? <Td>{row.level ?? "—"}</Td> : null}
                {show("files") ? <Td className="text-center">{row.file_count || "—"}</Td> : null}
                {show("rating") ? (
                  <Td>
                    {row.avg_score !== null && row.avg_score !== undefined ? (
                      <span title={`${row.review_count} review(s)`}>
                        <strong>{row.avg_score.toFixed(2)}</strong>{" "}
                        <span className="text-xs text-slate-400">({row.review_count})</span>
                      </span>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </Td>
                ) : null}
                {show("approval") ? (
                  <Td>
                    <Chip tone={row.approval_status === "approved" ? "green" : "slate"}>
                      {APPROVAL_LABELS[row.approval_status] ?? row.approval_status}
                    </Chip>
                  </Td>
                ) : null}
                {show("schedule") ? (
                  <Td className="text-xs">
                    {row.starts_at ? (
                      <>
                        {row.starts_at.replace("T", " ")}
                        {row.room_name ? <span className="block text-slate-400">{row.room_name}</span> : null}
                      </>
                    ) : (
                      <span className="text-slate-400">Unscheduled</span>
                    )}
                  </Td>
                ) : null}
                {show("notified") ? (
                  <Td>
                    {row.notified_at ? (
                      <Chip tone="green">Notified</Chip>
                    ) : (
                      <span className="text-xs text-slate-400">Not yet</span>
                    )}
                  </Td>
                ) : null}
                {show("created") ? (
                  <Td className="text-xs text-slate-500">{row.created_at.slice(0, 10)}</Td>
                ) : null}
              </tr>
            ))}
            {!rows.length ? (
              <tr>
                <Td colSpan={columns.length + 2} className="py-10 text-center text-slate-500">
                  No submissions match this view.
                </Td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <p className="mt-2 text-xs text-slate-500">
        Tip: change a status straight from the row, or tick several rows for a bulk decision.
      </p>
      <StatusLegend />
    </div>
  );
}

function StatusLegend() {
  return (
    <div className="mt-2 flex flex-wrap gap-1.5">
      {Object.entries(STATUS_LABELS).map(([key, label]) => (
        <Chip key={key} tone={statusTone(key)}>
          {label}
        </Chip>
      ))}
    </div>
  );
}
