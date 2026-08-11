import { listLookup } from "@/lib/repo/events";
import { listForms } from "@/lib/repo/forms";
import {
  APPROVAL_STATUSES,
  listSubmissions,
  statusCounts,
  SUBMISSION_STATUSES,
  type SubmissionFilters,
} from "@/lib/repo/submissions";
import { SubmissionTable } from "@/components/admin/submission-table";
import { ALL_COLUMNS, DEFAULT_COLUMNS } from "@/lib/columns";
import {
  deleteViewAction,
  saveViewAction,
  setApprovalAction,
  setStatusAction,
} from "@/server/submissions-actions";
import { Disclosure, FilterSelect, SearchBox } from "@/components/client/basics";
import { Chip, LinkButton, PageHeader, SubNav } from "@/components/ui";
import { listViews, viewQuery } from "@/lib/repo/views";

const TABS: Array<{ key: string; label: string }> = [
  { key: "all", label: "All" },
  { key: "accepted", label: "Accepted" },
  { key: "accept_queue", label: "Accept Queue" },
  { key: "pending", label: "Pending" },
  { key: "decline_queue", label: "Decline Queue" },
  { key: "declined", label: "Declined" },
  { key: "withdrawn", label: "Withdrawn" },
  { key: "draft", label: "Drafts" },
];

export async function SubmissionsView({
  slug,
  eventId,
  searchParams,
  kind,
  title,
  description,
}: {
  slug: string;
  eventId: string;
  searchParams: Record<string, string | string[] | undefined>;
  kind: "all" | "abstract" | "session";
  title: string;
  description: string;
}) {
  const str = (key: string) =>
    typeof searchParams[key] === "string" ? (searchParams[key] as string) : "";

  const status = str("status") || "all";
  const filters: SubmissionFilters = {
    status,
    kind,
    q: str("q"),
    trackId: str("track"),
    formatId: str("format"),
    formId: str("form"),
    level: str("level"),
    language: str("language"),
    approval: str("approval"),
    scheduled: (str("scheduled") as "yes" | "no") || undefined,
    sort: str("sort") || "recent",
    limit: Number(str("per") || 100),
  };

  const rows = listSubmissions(eventId, filters);
  const counts = statusCounts(eventId, kind);
  const tracks = listLookup("tracks", eventId);
  const formats = listLookup("formats", eventId);
  const levels = listLookup("levels", eventId);
  const forms = listForms(eventId);
  const formNames = Object.fromEntries(forms.map((f) => [f.id, f.name]));

  const views = listViews(eventId);
  const columnParam = str("columns");
  const columns = columnParam ? columnParam.split(",").filter(Boolean) : DEFAULT_COLUMNS;

  const base = `/admin/e/${slug}/${kind === "abstract" ? "abstracts" : kind === "session" ? "sessions" : "submissions"}`;
  const qs = new URLSearchParams(
    Object.entries(searchParams).flatMap(([k, v]) =>
      typeof v === "string" && v ? [[k, v] as [string, string]] : [],
    ),
  );

  return (
    <div>
      <PageHeader
        title={title}
        description={description}
        actions={
          <>
            <LinkButton href={`/admin/e/${slug}/submissions/export.csv?${qs.toString()}`} size="sm">
              Export CSV
            </LinkButton>
            <LinkButton
              href={`/admin/e/${slug}/submissions/new?kind=abstract`}
              size="sm"
            >
              Add Abstract
            </LinkButton>
            <LinkButton
              href={`/admin/e/${slug}/submissions/new?kind=session`}
              size="sm"
              variant="primary"
            >
              Add Session
            </LinkButton>
          </>
        }
      />

      <SubNav
        current={status === "all" ? base : `${base}?status=${status}`}
        items={TABS.map((tab) => ({
          href: tab.key === "all" ? base : `${base}?status=${tab.key}`,
          label: tab.label,
          count: counts[tab.key] ?? 0,
        }))}
      />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <SearchBox
          param="q"
          label="Search submissions"
          placeholder="Search title, abstract or speaker…"
          className="w-full sm:w-80"
        />
        <FilterSelect
          param="track"
          label="Track"
          allLabel="All tracks"
          options={tracks.map((t) => ({ value: t.id, label: t.name }))}
        />
        <FilterSelect
          param="format"
          label="Format"
          allLabel="All formats"
          options={formats.map((f) => ({ value: f.id, label: f.name }))}
        />
        <Disclosure label="More filters">
          <div className="space-y-3">
            <FilterSelect
              param="level"
              label="Level"
              allLabel="Any level"
              options={levels.map((l) => ({ value: l.name, label: l.name }))}
            />
            <FilterSelect
              param="form"
              label="Form"
              allLabel="Any form"
              options={forms.map((f) => ({ value: f.id, label: f.name }))}
            />
            <FilterSelect
              param="approval"
              label="Approval"
              allLabel="Any approval"
              options={APPROVAL_STATUSES.map((a) => ({ value: a, label: a }))}
            />
            <FilterSelect
              param="scheduled"
              label="Scheduled"
              allLabel="Any"
              options={[
                { value: "yes", label: "On the agenda" },
                { value: "no", label: "Not scheduled" },
              ]}
            />
          </div>
        </Disclosure>
        <FilterSelect
          param="sort"
          label="Sort"
          allLabel="Newest first"
          options={[
            { value: "title", label: "Title A–Z" },
            { value: "title_desc", label: "Title Z–A" },
            { value: "score", label: "Highest rated" },
            { value: "score_asc", label: "Lowest rated" },
            { value: "status", label: "Status" },
            { value: "track", label: "Track" },
            { value: "schedule", label: "Schedule" },
            { value: "oldest", label: "Oldest first" },
          ]}
        />
        <Disclosure label="Columns" align="right">
          <form method="get" className="space-y-2">
            {Object.entries(searchParams).map(([k, v]) =>
              typeof v === "string" && v && k !== "columns" ? (
                <input key={k} type="hidden" name={k} value={v} />
              ) : null,
            )}
            <p className="text-xs font-medium text-slate-600">Show columns</p>
            <div className="max-h-64 space-y-1 overflow-y-auto">
              {ALL_COLUMNS.map((column) => (
                <label key={column.key} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    name="columns"
                    value={column.key}
                    defaultChecked={columns.includes(column.key)}
                  />
                  {column.label}
                </label>
              ))}
            </div>
            <button
              type="submit"
              className="w-full rounded-md bg-brand-600 px-2 py-1.5 text-xs font-medium text-white"
            >
              Apply columns
            </button>
          </form>
        </Disclosure>

        <Disclosure label={`Saved views (${views.length})`} align="right">
          <div className="w-72 space-y-3">
            {views.length ? (
              <ul className="space-y-1">
                {views.map((view) => {
                  const config = JSON.parse(view.config || "{}") as Record<string, string>;
                  return (
                    <li key={view.id} className="flex items-center justify-between gap-2">
                      <a
                        href={`${base}?${viewQuery(config)}`}
                        className="text-sm font-medium text-brand-700 hover:underline"
                      >
                        {view.name}
                      </a>
                      <form action={deleteViewAction}>
                        <input type="hidden" name="slug" value={slug} />
                        <input type="hidden" name="view_id" value={view.id} />
                        <button
                          type="submit"
                          className="text-[11px] text-slate-400 hover:text-red-600"
                        >
                          delete
                        </button>
                      </form>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="text-xs text-slate-500">
                No saved views yet. Filter and sort the list, then save it here.
              </p>
            )}
            <form action={saveViewAction} className="space-y-2 border-t border-slate-200 pt-2">
              <input type="hidden" name="slug" value={slug} />
              {["status", "q", "track", "format", "form", "level", "approval", "scheduled", "sort"].map(
                (key) => (
                  <input key={key} type="hidden" name={key} value={str(key)} />
                ),
              )}
              <input type="hidden" name="columns" value={columns.join(",")} />
              <label className="block text-xs font-medium text-slate-600">
                Save this view
                <input
                  name="name"
                  required
                  placeholder="Platform track shortlist"
                  className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1 text-sm"
                />
              </label>
              <p className="text-[11px] text-slate-400">
                Saves the current filters, sort and columns.
              </p>
              <button
                type="submit"
                className="w-full rounded-md bg-brand-600 px-2 py-1.5 text-xs font-medium text-white"
              >
                Save view
              </button>
            </form>
          </div>
        </Disclosure>

        {views.length ? (
          <span className="flex flex-wrap items-center gap-1">
            {views.slice(0, 4).map((view) => (
              <a
                key={view.id}
                href={`${base}?${viewQuery(JSON.parse(view.config || "{}"))}`}
                className="inline-flex"
              >
                <Chip tone="blue">{view.name}</Chip>
              </a>
            ))}
          </span>
        ) : null}
      </div>

      <p className="mb-3 text-sm text-slate-500" role="status">
        Showing <strong className="text-slate-800">{rows.length}</strong> submissions
      </p>

      <SubmissionTable
        rows={rows}
        slug={slug}
        columns={columns}
        statuses={[...SUBMISSION_STATUSES]}
        approvals={[...APPROVAL_STATUSES]}
        formNames={formNames}
        setStatusAction={setStatusAction}
        setApprovalAction={setApprovalAction}
      />
    </div>
  );
}
