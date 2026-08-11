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
import { ALL_COLUMNS, DEFAULT_COLUMNS, SESSION_DEFAULT_COLUMNS } from "@/lib/columns";
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

function headerActions(slug: string, kind: "all" | "abstract" | "session", qs: string) {
  const exportBtn = (
    <LinkButton href={`/admin/e/${slug}/submissions/export.csv?${qs}`} size="sm">
      Export CSV
    </LinkButton>
  );
  const addAbstract = (primary?: boolean) => (
    <LinkButton
      href={`/admin/e/${slug}/submissions/new?kind=abstract`}
      size="sm"
      variant={primary ? "primary" : "secondary"}
    >
      Add Abstract
    </LinkButton>
  );
  const addSession = (primary?: boolean) => (
    <LinkButton
      href={`/admin/e/${slug}/submissions/new?kind=session`}
      size="sm"
      variant={primary ? "primary" : "secondary"}
    >
      Add Session
    </LinkButton>
  );

  if (kind === "abstract") {
    return (
      <>
        {exportBtn}
        {addSession(false)}
        {addAbstract(true)}
      </>
    );
  }
  if (kind === "session") {
    return (
      <>
        {exportBtn}
        <LinkButton href={`/admin/e/${slug}/agenda`} size="sm">
          Open agenda
        </LinkButton>
        {addSession(true)}
      </>
    );
  }
  return (
    <>
      {exportBtn}
      {addAbstract(false)}
      {addSession(true)}
    </>
  );
}

function activeFilterChips({
  status,
  filters,
  tracks,
  formats,
  forms,
  base,
  searchParams,
}: {
  status: string;
  filters: SubmissionFilters;
  tracks: Array<{ id: string; name: string }>;
  formats: Array<{ id: string; name: string }>;
  forms: Array<{ id: string; name: string }>;
  base: string;
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const chips: Array<{ key: string; label: string; clearKey: string }> = [];
  if (filters.q) chips.push({ key: "q", label: `Search: ${filters.q}`, clearKey: "q" });
  if (filters.trackId) {
    const name = tracks.find((t) => t.id === filters.trackId)?.name ?? "Track";
    chips.push({ key: "track", label: name, clearKey: "track" });
  }
  if (filters.formatId) {
    const name = formats.find((f) => f.id === filters.formatId)?.name ?? "Format";
    chips.push({ key: "format", label: name, clearKey: "format" });
  }
  if (filters.level) chips.push({ key: "level", label: filters.level, clearKey: "level" });
  if (filters.formId) {
    const name = forms.find((f) => f.id === filters.formId)?.name ?? "Form";
    chips.push({ key: "form", label: name, clearKey: "form" });
  }
  if (filters.approval) {
    chips.push({ key: "approval", label: `Approval: ${filters.approval}`, clearKey: "approval" });
  }
  if (filters.scheduled) {
    chips.push({
      key: "scheduled",
      label: filters.scheduled === "yes" ? "On the agenda" : "Not scheduled",
      clearKey: "scheduled",
    });
  }
  if (status !== "all") {
    const tab = TABS.find((t) => t.key === status);
    if (tab) chips.push({ key: "status", label: tab.label, clearKey: "status" });
  }

  if (!chips.length) return null;

  return (
    <span className="flex flex-wrap items-center gap-1.5">
      {chips.map((chip) => {
        const next = new URLSearchParams(
          Object.entries(searchParams).flatMap(([k, v]) =>
            typeof v === "string" && v && k !== chip.clearKey ? [[k, v] as [string, string]] : [],
          ),
        );
        return (
          <a key={chip.key} href={`${base}?${next.toString()}`} className="inline-flex">
            <Chip tone="slate" title={`Clear ${chip.label}`}>
              {chip.label} ×
            </Chip>
          </a>
        );
      })}
    </span>
  );
}

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
  const defaultColumns = kind === "session" ? SESSION_DEFAULT_COLUMNS : DEFAULT_COLUMNS;
  const columns = columnParam ? columnParam.split(",").filter(Boolean) : defaultColumns;

  const base = `/admin/e/${slug}/${kind === "abstract" ? "abstracts" : kind === "session" ? "sessions" : "submissions"}`;
  const qs = new URLSearchParams(
    Object.entries(searchParams).flatMap(([k, v]) =>
      typeof v === "string" && v ? [[k, v] as [string, string]] : [],
    ),
  );

  const sparseSession = kind === "session" && rows.length <= 3;
  const primaryTabs = TABS.filter((tab) => {
    if (tab.key === "all" || tab.key === status) return true;
    const count = counts[tab.key] ?? 0;
    if (sparseSession) return count > 0;
    return true;
  });
  const hiddenTabs = TABS.filter((tab) => !primaryTabs.some((p) => p.key === tab.key));

  const columnsPanel = (
    <Disclosure label="Columns" align="right">
      <form method="get" className="space-y-2">
        {Object.entries(searchParams).map(([k, v]) =>
          typeof v === "string" && v && k !== "columns" ? (
            <input key={k} type="hidden" name={k} value={v} />
          ) : null,
        )}
        <p className="text-xs font-medium text-ink-2">Show columns</p>
        <div className="max-h-64 space-y-1 overflow-y-auto">
          {ALL_COLUMNS.map((column) => (
            <label key={column.key} className="flex items-center gap-2 text-sm text-ink">
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
        <button type="submit" className="w-full rounded-pill bg-ink px-2 py-1.5 text-xs font-medium text-paper">
          Apply columns
        </button>
      </form>
    </Disclosure>
  );

  const savedViewsPanel = (
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
                    className="text-sm font-medium text-signal hover:underline"
                  >
                    {view.name}
                  </a>
                  <form action={deleteViewAction}>
                    <input type="hidden" name="slug" value={slug} />
                    <input type="hidden" name="view_id" value={view.id} />
                    <button
                      type="submit"
                      className="text-[11px] text-muted-foreground hover:text-destructive"
                    >
                      delete
                    </button>
                  </form>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-xs text-muted-foreground">
            No saved views yet. Filter and sort the list, then save it here.
          </p>
        )}
        <form action={saveViewAction} className="space-y-2 border-t border-rule pt-2">
          <input type="hidden" name="slug" value={slug} />
          {["status", "q", "track", "format", "form", "level", "approval", "scheduled", "sort"].map(
            (key) => (
              <input key={key} type="hidden" name={key} value={str(key)} />
            ),
          )}
          <input type="hidden" name="columns" value={columns.join(",")} />
          <label className="block text-xs font-medium text-ink-2">
            Save this view
            <input
              name="name"
              required
              placeholder="Platform track shortlist"
              className="mt-1 w-full rounded-input border border-field bg-paper px-2 py-1 text-sm text-ink"
            />
          </label>
          <p className="text-[11px] text-muted-foreground">
            Saves the current filters, sort and columns.
          </p>
          <button
            type="submit"
            className="w-full rounded-pill bg-ink px-2 py-1.5 text-xs font-medium text-paper"
          >
            Save view
          </button>
        </form>
      </div>
    </Disclosure>
  );

  const moreFilters = (
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
        {sparseSession ? (
          <FilterSelect
            param="format"
            label="Format"
            allLabel="All formats"
            options={formats.map((f) => ({ value: f.id, label: f.name }))}
          />
        ) : null}
      </div>
    </Disclosure>
  );

  return (
    <div>
      <PageHeader
        title={title}
        description={description}
        actions={headerActions(slug, kind, qs.toString())}
      />

      <SubNav
        current={status === "all" ? base : `${base}?status=${status}`}
        items={primaryTabs.map((tab) => ({
          href: tab.key === "all" ? base : `${base}?status=${tab.key}`,
          label: tab.label,
          count: counts[tab.key] ?? 0,
        }))}
      />

      <div className="-mt-3 mb-4 flex flex-wrap items-center gap-3">
        <p className="text-sm text-muted-foreground" role="status">
          Showing <strong className="tnum font-medium text-ink">{rows.length}</strong>
          {status !== "all"
            ? ` · ${TABS.find((t) => t.key === status)?.label ?? status}`
            : ""}
        </p>
        {hiddenTabs.length ? (
          <Disclosure label="More statuses">
            <ul className="min-w-44 space-y-1">
              {hiddenTabs.map((tab) => (
                <li key={tab.key}>
                  <a
                    href={tab.key === "all" ? base : `${base}?status=${tab.key}`}
                    className="flex items-center justify-between gap-3 rounded-md px-2 py-1.5 text-sm text-ink hover:bg-paper-2"
                  >
                    <span>{tab.label}</span>
                    <span className="tnum text-xs text-muted-foreground">
                      {counts[tab.key] ?? 0}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </Disclosure>
        ) : null}
      </div>

      {/* Row 1 — search + high-frequency filters */}
      <div className="mb-2 flex flex-wrap items-center gap-3">
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
        {!sparseSession ? (
          <FilterSelect
            param="format"
            label="Format"
            allLabel="All formats"
            options={formats.map((f) => ({ value: f.id, label: f.name }))}
          />
        ) : null}
        {moreFilters}
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
      </div>

      {/* Row 2 — quieter utilities + active filters */}
      <div className="mb-4 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm">
        <div className="flex flex-wrap items-center gap-2 text-muted-foreground">
          {columnsPanel}
          {savedViewsPanel}
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
        {activeFilterChips({
          status,
          filters,
          tracks,
          formats,
          forms,
          base,
          searchParams,
        })}
      </div>

      <SubmissionTable
        rows={rows}
        slug={slug}
        columns={columns}
        statuses={[...SUBMISSION_STATUSES]}
        approvals={[...APPROVAL_STATUSES]}
        formNames={formNames}
        showKind={kind === "all"}
        setStatusAction={setStatusAction}
        setApprovalAction={setApprovalAction}
      />
    </div>
  );
}
