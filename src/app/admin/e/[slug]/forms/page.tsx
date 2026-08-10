import Link from "next/link";
import { and, count, eq } from "drizzle-orm";
import { requireEventRole } from "@/lib/auth/guards";
import { getDb, schema } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { createFormAction, deleteFormAction, duplicateFormAction } from "./actions";

const TABS = [
  { key: "all", label: "All" },
  { key: "open", label: "Open" },
  { key: "closed", label: "Closed" },
] as const;

function formatClosesAt(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default async function FormsIndexPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { slug } = await params;
  const sp = await searchParams;
  const tab = sp.tab ?? "all";
  const { event } = await requireEventRole(slug, ["organizer"]);
  const db = getDb();

  const forms = db
    .select()
    .from(schema.submissionForms)
    .where(eq(schema.submissionForms.eventId, event.id))
    .orderBy(schema.submissionForms.createdAt)
    .all();

  const filtered =
    tab === "open"
      ? forms.filter((f) => f.status === "open")
      : tab === "closed"
        ? forms.filter((f) => f.status === "closed")
        : forms;

  const counts = {
    all: forms.length,
    open: forms.filter((f) => f.status === "open").length,
    closed: forms.filter((f) => f.status === "closed").length,
  };

  const enriched = filtered.map((form) => {
    const submitted = db
      .select({ c: count() })
      .from(schema.submissions)
      .where(
        and(
          eq(schema.submissions.formId, form.id),
          eq(schema.submissions.isDraft, false),
        ),
      )
      .get();
    const drafts = db
      .select({ c: count() })
      .from(schema.submissions)
      .where(
        and(
          eq(schema.submissions.formId, form.id),
          eq(schema.submissions.isDraft, true),
        ),
      )
      .get();
    return {
      ...form,
      submissionCount: Number(submitted?.c ?? 0),
      draftCount: Number(drafts?.c ?? 0),
    };
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Forms</h1>
          <p className="text-slate-600">Build and manage call-for-speakers submission forms.</p>
        </div>
        <form action={createFormAction}>
          <input type="hidden" name="slug" value={slug} />
          <Button type="submit">Create form</Button>
        </form>
      </div>

      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => {
          const active = tab === t.key;
          return (
            <Link
              key={t.key}
              href={`/admin/e/${slug}/forms?tab=${t.key}`}
              className={`rounded-full px-3 py-1.5 text-sm ${
                active
                  ? "bg-blue-600 text-white"
                  : "bg-white border border-slate-200 text-slate-700"
              }`}
            >
              {t.label} ({counts[t.key]})
            </Link>
          );
        })}
      </div>

      <Card>
        <CardHeader title={`${enriched.length} forms`} />
        <CardBody className="overflow-x-auto p-0">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">Title</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Collects</th>
                <th className="px-4 py-2">Submissions</th>
                <th className="px-4 py-2">Drafts</th>
                <th className="px-4 py-2">Closes</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {enriched.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-slate-500">
                    No forms yet. Create one to get started.
                  </td>
                </tr>
              ) : (
                enriched.map((form) => (
                  <tr key={form.id} className="border-t border-slate-100 hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/e/${slug}/forms/${form.id}/edit?step=1`}
                        className="font-medium text-blue-700 hover:underline"
                      >
                        {form.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3">{form.title}</td>
                    <td className="px-4 py-3">
                      <Badge
                        className={
                          form.status === "open"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-slate-100 text-slate-700"
                        }
                      >
                        {form.status === "open" ? "Open" : "Closed"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 capitalize">{form.collects}</td>
                    <td className="px-4 py-3">{form.submissionCount}</td>
                    <td className="px-4 py-3">{form.draftCount}</td>
                    <td className="px-4 py-3">{formatClosesAt(form.closesAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        <ButtonLink
                          href={`/admin/e/${slug}/forms/${form.id}/edit?step=1`}
                          variant="secondary"
                        >
                          Edit
                        </ButtonLink>
                        <form action={duplicateFormAction} className="inline">
                          <input type="hidden" name="slug" value={slug} />
                          <input type="hidden" name="formId" value={form.id} />
                          <Button type="submit" variant="ghost">
                            Duplicate
                          </Button>
                        </form>
                        <form action={deleteFormAction} className="inline">
                          <input type="hidden" name="slug" value={slug} />
                          <input type="hidden" name="formId" value={form.id} />
                          <Button type="submit" variant="danger">
                            Delete
                          </Button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </CardBody>
      </Card>
    </div>
  );
}
