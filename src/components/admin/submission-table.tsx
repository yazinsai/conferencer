"use client";

import Link from "next/link";
import { startTransition, useState } from "react";

import { buttonClass, Chip, cx, Icon, Select, Td, Th } from "@/components/ui";
import type { SubmissionRow } from "@/lib/repo/submissions";
import { APPROVAL_LABELS, STATUS_LABELS, statusTone } from "@/lib/status";

import { ALL_COLUMNS } from "@/lib/columns";

const COLUMN_WIDTH: Record<string, string> = {
  status: "min-w-[10.5rem] w-[10.5rem]",
  form: "w-36",
  title: "min-w-[16rem] w-[22rem]",
  description: "min-w-[14rem] w-64",
  speakers: "min-w-[10rem] w-44",
  track: "w-36",
  tags: "w-36",
  format: "w-28",
  level: "w-24",
  files: "w-16",
  rating: "w-20",
  approval: "w-28",
  schedule: "min-w-[9rem] w-40",
  notified: "w-24",
  created: "w-28",
};

export function SubmissionTable({
  rows,
  slug,
  columns,
  statuses,
  approvals,
  formNames,
  showKind = true,
  setStatusAction,
  setApprovalAction,
}: {
  rows: SubmissionRow[];
  slug: string;
  columns: string[];
  statuses: string[];
  approvals: string[];
  formNames: Record<string, string>;
  showKind?: boolean;
  setStatusAction: (formData: FormData) => Promise<void>;
  setApprovalAction: (formData: FormData) => Promise<void>;
}) {
  const [selected, setSelected] = useState<string[]>([]);
  const allSelected = rows.length > 0 && selected.length === rows.length;
  const show = (key: string) => columns.includes(key);
  const base = `/admin/e/${slug}/submissions`;
  const visibleColumns = ALL_COLUMNS.filter((c) => show(c.key));

  return (
    <div>
      {selected.length ? (
        <div className="mb-3 flex flex-wrap items-center gap-3 rounded-card border border-signal/25 bg-signal-soft px-3 py-2 text-sm">
          <span className="font-medium text-ink">{selected.length} selected</span>
          <form action={setStatusAction} className="flex items-center gap-2">
            <input type="hidden" name="slug" value={slug} />
            {selected.map((id) => (
              <input key={id} type="hidden" name="ids" value={id} />
            ))}
            <label htmlFor="bulk-status" className="text-xs text-ink-2">
              Set status
            </label>
            <Select
              id="bulk-status"
              name="status"
              className="h-8 w-auto py-0 text-xs"
              defaultValue="accepted"
            >
              {statuses.map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABELS[s as keyof typeof STATUS_LABELS] ?? s}
                </option>
              ))}
            </Select>
            <button type="submit" className={buttonClass("primary", "sm")}>
              Apply
            </button>
          </form>
          <form action={setApprovalAction} className="flex items-center gap-2">
            <input type="hidden" name="slug" value={slug} />
            {selected.map((id) => (
              <input key={id} type="hidden" name="ids" value={id} />
            ))}
            <label htmlFor="bulk-approval" className="text-xs text-ink-2">
              Content approval
            </label>
            <Select
              id="bulk-approval"
              name="approval_status"
              className="h-8 w-auto py-0 text-xs"
              defaultValue="approved"
            >
              {approvals.map((s) => (
                <option key={s} value={s}>
                  {APPROVAL_LABELS[s] ?? s}
                </option>
              ))}
            </Select>
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

      <div className="max-w-full overflow-x-auto rounded-card border border-rule bg-paper">
        <table className="w-full min-w-[56rem] border-collapse text-sm">
          <thead className="sticky top-0 z-[1]">
            <tr>
              <Th className="w-10 bg-paper-2">
                <input
                  type="checkbox"
                  aria-label="Select all submissions"
                  checked={allSelected}
                  onChange={(e) => setSelected(e.target.checked ? rows.map((r) => r.id) : [])}
                />
              </Th>
              <Th className="w-11 bg-paper-2">
                <span className="sr-only">Edit</span>
              </Th>
              {visibleColumns.map((column) => (
                <Th
                  key={column.key}
                  className={cx(
                    "bg-paper-2",
                    COLUMN_WIDTH[column.key],
                    column.key === "title" || column.key === "status"
                      ? "text-ink-2"
                      : undefined,
                  )}
                >
                  {column.label}
                </Th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className={cx(selected.includes(row.id) && "bg-paper-2")}>
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
                    className={cx(
                      "inline-flex size-9 items-center justify-center rounded-input text-muted-foreground",
                      "transition-colors duration-[120ms] ease-out",
                      "hover:bg-paper-3 hover:text-ink",
                      "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                    )}
                  >
                    <Icon name="edit" size={16} />
                  </Link>
                </Td>
                {show("status") ? (
                  <Td className={COLUMN_WIDTH.status}>
                    <InlineStatusSelect
                      slug={slug}
                      id={row.id}
                      title={row.title}
                      status={row.status}
                      statuses={statuses}
                      action={setStatusAction}
                    />
                  </Td>
                ) : null}
                {show("form") ? (
                  <Td className={cx(COLUMN_WIDTH.form, "text-xs text-muted-foreground")}>
                    {row.form_id ? formNames[row.form_id] ?? "—" : "Added manually"}
                  </Td>
                ) : null}
                {show("title") ? (
                  <Td className={COLUMN_WIDTH.title}>
                    <Link
                      href={`${base}/${row.id}`}
                      className="font-medium text-ink hover:text-signal"
                    >
                      {row.title}
                    </Link>
                    {showKind ? (
                      <span className="ml-1.5 text-[11px] uppercase tracking-wide text-muted-foreground">
                        {row.kind}
                      </span>
                    ) : null}
                  </Td>
                ) : null}
                {show("description") ? (
                  <Td className={cx(COLUMN_WIDTH.description, "text-xs text-muted-foreground")}>
                    {(row.description ?? "").slice(0, 120)}
                    {(row.description ?? "").length > 120 ? "…" : ""}
                  </Td>
                ) : null}
                {show("speakers") ? (
                  <Td className={cx(COLUMN_WIDTH.speakers, "text-neutral")}>
                    {row.speakers ?? "—"}
                  </Td>
                ) : null}
                {show("track") ? (
                  <Td className={COLUMN_WIDTH.track}>
                    {row.track_name ? (
                      <Chip color={row.track_color}>{row.track_name}</Chip>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </Td>
                ) : null}
                {show("tags") ? (
                  <Td className={cx(COLUMN_WIDTH.tags, "text-xs text-muted-foreground")}>
                    {(JSON.parse(row.tags || "[]") as string[]).join(", ") || "—"}
                  </Td>
                ) : null}
                {show("format") ? (
                  <Td className={cx(COLUMN_WIDTH.format, "text-neutral")}>
                    {row.format_name ?? "—"}
                  </Td>
                ) : null}
                {show("level") ? (
                  <Td className={cx(COLUMN_WIDTH.level, "text-neutral")}>{row.level ?? "—"}</Td>
                ) : null}
                {show("files") ? (
                  <Td className={cx(COLUMN_WIDTH.files, "text-center text-muted-foreground")}>
                    {row.file_count || "—"}
                  </Td>
                ) : null}
                {show("rating") ? (
                  <Td className={COLUMN_WIDTH.rating}>
                    {row.avg_score !== null && row.avg_score !== undefined ? (
                      <span title={`${row.review_count} review(s)`}>
                        <strong className="tnum text-ink">{row.avg_score.toFixed(2)}</strong>{" "}
                        <span className="text-xs text-muted-foreground">({row.review_count})</span>
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </Td>
                ) : null}
                {show("approval") ? (
                  <Td className={COLUMN_WIDTH.approval}>
                    <Chip tone={row.approval_status === "approved" ? "green" : "slate"}>
                      {APPROVAL_LABELS[row.approval_status] ?? row.approval_status}
                    </Chip>
                  </Td>
                ) : null}
                {show("schedule") ? (
                  <Td className={cx(COLUMN_WIDTH.schedule, "text-xs text-neutral")}>
                    {row.starts_at ? (
                      <>
                        <span className="tnum">{row.starts_at.replace("T", " ")}</span>
                        {row.room_name ? (
                          <span className="block text-muted-foreground">{row.room_name}</span>
                        ) : null}
                      </>
                    ) : (
                      <span className="text-muted-foreground">Unscheduled</span>
                    )}
                  </Td>
                ) : null}
                {show("notified") ? (
                  <Td className={COLUMN_WIDTH.notified}>
                    {row.notified_at ? (
                      <Chip tone="green">Notified</Chip>
                    ) : (
                      <span className="text-xs text-muted-foreground">Not yet</span>
                    )}
                  </Td>
                ) : null}
                {show("created") ? (
                  <Td className={cx(COLUMN_WIDTH.created, "tnum text-xs text-muted-foreground")}>
                    {row.created_at.slice(0, 10)}
                  </Td>
                ) : null}
              </tr>
            ))}
            {!rows.length ? (
              <tr>
                <Td colSpan={visibleColumns.length + 2} className="py-10 text-center text-muted-foreground">
                  No submissions match this view.
                </Td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <p className="mt-2 text-xs text-muted-foreground">
        Tip: change a status straight from the row, or tick several rows for a bulk decision.
      </p>
      <StatusLegend />
    </div>
  );
}

function InlineStatusSelect({
  slug,
  id,
  title,
  status,
  statuses,
  action,
}: {
  slug: string;
  id: string;
  title: string;
  status: string;
  statuses: string[];
  action: (formData: FormData) => Promise<void>;
}) {
  const [value, setValue] = useState(status);
  const [serverStatus, setServerStatus] = useState(status);

  if (status !== serverStatus) {
    setServerStatus(status);
    setValue(status);
  }

  return (
    <form action={action} className="flex items-center gap-1">
      <input type="hidden" name="slug" value={slug} />
      <input type="hidden" name="id" value={id} />
      <Select
        name="status"
        value={value}
        aria-label={`Status for ${title}`}
        className="h-8 px-2 py-0 text-xs"
        onChange={(e) => {
          const next = e.target.value;
          setValue(next);
          const fd = new FormData();
          fd.set("slug", slug);
          fd.set("id", id);
          fd.set("status", next);
          startTransition(() => {
            void action(fd);
          });
        }}
      >
        {statuses.map((s) => (
          <option key={s} value={s}>
            {STATUS_LABELS[s as keyof typeof STATUS_LABELS] ?? s}
          </option>
        ))}
      </Select>
      <noscript>
        <button type="submit" className="text-xs text-signal underline">
          Save
        </button>
      </noscript>
    </form>
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
