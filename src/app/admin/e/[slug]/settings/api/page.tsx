import { desc, eq } from "drizzle-orm";
import Link from "next/link";
import { requireEventRole } from "@/lib/auth/guards";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { getDb, schema } from "@/lib/db";
import { SettingsNav } from "../settings-nav";
import { revokeApiTokenAction } from "./actions";
import { CreateTokenForm } from "./create-token-form";

export default async function ApiSettingsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { event } = await requireEventRole(slug, ["organizer"]);
  const db = getDb();

  const tokens = db
    .select()
    .from(schema.apiTokens)
    .where(eq(schema.apiTokens.eventId, event.id))
    .orderBy(desc(schema.apiTokens.createdAt))
    .all();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">API</h1>
          <p className="text-slate-600">
            Manage bearer tokens for the REST API at{" "}
            <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm">/api/v1</code>.
          </p>
        </div>
        <Link
          href={`/admin/e/${slug}/settings/api/docs`}
          className="text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          API reference →
        </Link>
      </div>

      <SettingsNav slug={slug} active="/api" />

      <Card>
        <CardHeader
          title="Create API token"
          subtitle="Tokens are scoped to this event. The raw value is shown once at creation."
        />
        <CardBody>
          <CreateTokenForm slug={slug} />
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Active tokens" subtitle={`${tokens.length} token(s)`} />
        <CardBody>
          {tokens.length === 0 ? (
            <p className="text-sm text-slate-500">No API tokens yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500">
                    <th className="pb-2 pr-4 font-medium">Name</th>
                    <th className="pb-2 pr-4 font-medium">Prefix</th>
                    <th className="pb-2 pr-4 font-medium">Created</th>
                    <th className="pb-2 pr-4 font-medium">Last used</th>
                    <th className="pb-2 font-medium" />
                  </tr>
                </thead>
                <tbody>
                  {tokens.map((token) => (
                    <tr key={token.id} className="border-b border-slate-100">
                      <td className="py-3 pr-4 font-medium text-slate-900">
                        {token.name}
                      </td>
                      <td className="py-3 pr-4 font-mono text-slate-600">
                        {token.tokenPrefix}…
                      </td>
                      <td className="py-3 pr-4 text-slate-600">
                        {new Date(token.createdAt).toLocaleString()}
                      </td>
                      <td className="py-3 pr-4 text-slate-600">
                        {token.lastUsedAt
                          ? new Date(token.lastUsedAt).toLocaleString()
                          : "Never"}
                      </td>
                      <td className="py-3 text-right">
                        <form action={revokeApiTokenAction}>
                          <input type="hidden" name="slug" value={slug} />
                          <input type="hidden" name="tokenId" value={token.id} />
                          <Button type="submit" variant="danger" className="text-xs">
                            Revoke
                          </Button>
                        </form>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Authentication" subtitle="Use bearer tokens in API requests" />
        <CardBody className="space-y-2 text-sm text-slate-600">
          <p>
            Include your token in the{" "}
            <code className="rounded bg-slate-100 px-1">Authorization</code> header:
          </p>
          <pre className="overflow-x-auto rounded-lg bg-slate-900 p-4 text-slate-100">
            {`Authorization: Bearer cnf_…`}
          </pre>
          <p>
            OpenAPI spec:{" "}
            <a
              href="/api/v1/openapi.json"
              className="text-blue-600 hover:underline"
              target="_blank"
              rel="noreferrer"
            >
              /api/v1/openapi.json
            </a>
          </p>
        </CardBody>
      </Card>
    </div>
  );
}
