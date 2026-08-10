import Link from "next/link";

const PAGE_SIZES = [25, 50, 100] as const;

export function parsePageSize(raw?: string): number {
  const n = Number(raw ?? 50);
  return PAGE_SIZES.includes(n as (typeof PAGE_SIZES)[number]) ? n : 50;
}

export function parsePage(raw?: string): number {
  const n = Number(raw ?? 1);
  return Number.isFinite(n) && n >= 1 ? Math.floor(n) : 1;
}

function buildHref(
  basePath: string,
  params: Record<string, string | undefined>,
  overrides: Record<string, string | number | undefined>,
) {
  const merged = { ...params, ...overrides };
  const sp = new URLSearchParams();
  for (const [key, value] of Object.entries(merged)) {
    if (value !== undefined && value !== "" && value !== "all") {
      sp.set(key, String(value));
    }
  }
  const qs = sp.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

export function ListPagination({
  basePath,
  params,
  page,
  pageSize,
  total,
}: {
  basePath: string;
  params: Record<string, string | undefined>;
  page: number;
  pageSize: number;
  total: number;
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages);
  const start = total === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const end = Math.min(safePage * pageSize, total);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-4 py-3 text-sm text-slate-600">
      <div>
        {total === 0 ? "No results" : `Showing ${start}–${end} of ${total}`}
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase text-slate-500">Per page</span>
          {PAGE_SIZES.map((size) => (
            <Link
              key={size}
              href={buildHref(basePath, params, { page: 1, pageSize: size })}
              className={`rounded-md border px-2 py-1 text-sm ${
                pageSize === size
                  ? "border-blue-600 bg-blue-50 text-blue-700"
                  : "border-slate-200 hover:bg-slate-50"
              }`}
            >
              {size}
            </Link>
          ))}
        </div>
        <div className="flex items-center gap-1">
          {safePage > 1 ? (
            <Link
              href={buildHref(basePath, params, {
                page: safePage - 1,
                pageSize,
              })}
              className="rounded-md border border-slate-200 px-3 py-1 hover:bg-slate-50"
            >
              Previous
            </Link>
          ) : (
            <span className="rounded-md border border-slate-100 px-3 py-1 text-slate-400">
              Previous
            </span>
          )}
          <span className="px-2 text-xs text-slate-500">
            Page {safePage} of {totalPages}
          </span>
          {safePage < totalPages ? (
            <Link
              href={buildHref(basePath, params, {
                page: safePage + 1,
                pageSize,
              })}
              className="rounded-md border border-slate-200 px-3 py-1 hover:bg-slate-50"
            >
              Next
            </Link>
          ) : (
            <span className="rounded-md border border-slate-100 px-3 py-1 text-slate-400">
              Next
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
