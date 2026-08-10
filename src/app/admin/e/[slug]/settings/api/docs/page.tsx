import { requireEventRole } from "@/lib/auth/guards";
import { SettingsNav } from "../../settings-nav";

const ENDPOINTS = [
  { method: "GET", path: "/api/v1/events", desc: "Current event (from token)" },
  { method: "GET", path: "/api/v1/submissions", desc: "List submissions" },
  { method: "POST", path: "/api/v1/submissions", desc: "Create submission" },
  { method: "GET", path: "/api/v1/submissions/{id}", desc: "Get submission" },
  { method: "PATCH", path: "/api/v1/submissions/{id}", desc: "Update submission" },
  { method: "POST", path: "/api/v1/submissions/bulk-status", desc: "Bulk status change" },
  { method: "GET", path: "/api/v1/sessions", desc: "Accepted sessions" },
  { method: "GET", path: "/api/v1/contacts", desc: "List contacts" },
  { method: "POST", path: "/api/v1/contacts", desc: "Create contact" },
  { method: "POST", path: "/api/v1/contacts/bulk", desc: "Bulk upsert contacts" },
  { method: "GET", path: "/api/v1/participants", desc: "List participants" },
  { method: "GET", path: "/api/v1/forms", desc: "List forms" },
  { method: "GET", path: "/api/v1/tracks", desc: "List/create tracks" },
  { method: "GET", path: "/api/v1/formats", desc: "List/create formats" },
  { method: "GET", path: "/api/v1/rooms", desc: "List/create rooms" },
  { method: "GET", path: "/api/v1/tasks", desc: "List/create tasks" },
  { method: "GET", path: "/api/v1/task-assignments", desc: "List task assignments" },
  { method: "POST", path: "/api/v1/task-assignments/bulk", desc: "Bulk assign tasks" },
  { method: "GET", path: "/api/v1/evaluation-plans", desc: "List evaluation plans" },
  { method: "GET", path: "/api/v1/reviews", desc: "List reviews" },
  { method: "GET", path: "/api/v1/uploads", desc: "List uploads (metadata)" },
  { method: "GET", path: "/api/v1/emails", desc: "List email outbox" },
  { method: "GET", path: "/api/v1/public/{slug}/sessions", desc: "Public sessions (no auth)" },
  { method: "GET", path: "/api/v1/public/{slug}/speakers", desc: "Public speakers (no auth)" },
];

export default async function ApiDocsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  await requireEventRole(slug, ["organizer"]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">API reference</h1>
        <p className="text-slate-600">
          REST API documentation for event <strong>{slug}</strong>.
        </p>
      </div>

      <SettingsNav slug={slug} active="/api" />

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <iframe
          title="OpenAPI spec"
          src="/api/v1/openapi.json"
          className="hidden"
        />
        <div className="border-b border-slate-100 px-5 py-4">
          <p className="text-sm text-slate-600">
            Full OpenAPI 3 spec:{" "}
            <a
              href="/api/v1/openapi.json"
              className="font-medium text-blue-600 hover:underline"
              target="_blank"
              rel="noreferrer"
            >
              /api/v1/openapi.json
            </a>
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-500">
                <th className="px-5 py-3 font-medium">Method</th>
                <th className="px-5 py-3 font-medium">Path</th>
                <th className="px-5 py-3 font-medium">Description</th>
              </tr>
            </thead>
            <tbody>
              {ENDPOINTS.map((ep) => (
                <tr key={`${ep.method}-${ep.path}`} className="border-b border-slate-100">
                  <td className="px-5 py-3">
                    <span
                      className={`rounded px-2 py-0.5 font-mono text-xs font-semibold ${
                        ep.method === "GET"
                          ? "bg-emerald-100 text-emerald-800"
                          : ep.method === "POST"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {ep.method}
                    </span>
                  </td>
                  <td className="px-5 py-3 font-mono text-slate-800">{ep.path}</td>
                  <td className="px-5 py-3 text-slate-600">{ep.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="border-t border-slate-100 px-5 py-4 text-sm text-slate-600">
          <p className="font-medium text-slate-800">List query parameters</p>
          <ul className="mt-2 list-inside list-disc space-y-1">
            <li>
              <code>limit</code> — page size (default 50, max 100)
            </li>
            <li>
              <code>cursor</code> — id-based pagination cursor from{" "}
              <code>meta.next_cursor</code>
            </li>
            <li>
              <code>updated_since</code> — ISO timestamp filter
            </li>
            <li>Resource-specific filters (e.g. <code>status</code>, <code>kind</code>)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
