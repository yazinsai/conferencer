import { requireOrganizer } from "@/lib/guards";
import { all } from "@/lib/db";
import { createApiTokenAction, deleteApiTokenAction } from "@/server/settings-actions";
import {
  Button,
  Card,
  CardHeader,
  Input,
  LinkButton,
  Notice,
  PageHeader,
  Table,
  Td,
  Th,
} from "@/components/ui";
import { ConfirmSubmit, CopyButton } from "@/components/client/basics";
import { formatStamp } from "@/lib/datetime";

export const dynamic = "force-dynamic";

type ApiToken = {
  id: string;
  name: string;
  token: string;
  created_at: string;
  last_used_at: string | null;
};

export default async function ApiTokensPage({ params }: PageProps<"/admin/e/[slug]/settings/api">) {
  const { slug } = await params;
  const { event } = await requireOrganizer(slug);
  const tokens = all<ApiToken>(
    "SELECT * FROM api_tokens WHERE event_id = ? ORDER BY created_at DESC",
    event.id,
  );

  return (
    <div className="max-w-4xl">
      <PageHeader
        title="API tokens"
        description="Bearer tokens for the REST API at /api/v1, scoped to this event."
        actions={
          <>
            <LinkButton href="/api/v1/openapi.json" size="sm">
              OpenAPI spec
            </LinkButton>
            <LinkButton href="/api-docs" size="sm">
              API reference
            </LinkButton>
            <LinkButton href={`/admin/e/${slug}/settings`}>Back to settings</LinkButton>
          </>
        }
      />

      <Notice tone="info" className="mb-4">
        <p className="font-medium">Using the API</p>
        <pre className="mt-1 overflow-x-auto text-xs">
          {`curl -H "Authorization: Bearer <token>" \\\n  ${"$"}{APP_URL}/api/v1/submissions?limit=25`}
        </pre>
      </Notice>

      <Card>
        <CardHeader title="Tokens" description={`${tokens.length} active`} />
        <Table className="rounded-none border-0">
          <thead>
            <tr>
              <Th>Name</Th>
              <Th>Token</Th>
              <Th>Created</Th>
              <Th>Last used</Th>
              <Th />
            </tr>
          </thead>
          <tbody>
            {tokens.map((row) => (
              <tr key={row.id}>
                <Td className="font-medium">{row.name}</Td>
                <Td>
                  <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs">
                    {row.token}
                  </code>
                  <span className="ml-2 inline-block align-middle">
                    <CopyButton value={row.token} label="Copy" />
                  </span>
                </Td>
                <Td className="text-xs">{formatStamp(row.created_at)}</Td>
                <Td className="text-xs">
                  {row.last_used_at ? formatStamp(row.last_used_at) : "never"}
                </Td>
                <Td>
                  <form action={deleteApiTokenAction}>
                    <input type="hidden" name="slug" value={slug} />
                    <input type="hidden" name="id" value={row.id} />
                    <ConfirmSubmit message={`Revoke "${row.name}"?`} variant="ghost">
                      Revoke
                    </ConfirmSubmit>
                  </form>
                </Td>
              </tr>
            ))}
            {!tokens.length ? (
              <tr>
                <Td colSpan={5} className="py-6 text-center text-slate-500">
                  No tokens yet.
                </Td>
              </tr>
            ) : null}
          </tbody>
        </Table>
        <form
          action={createApiTokenAction}
          className="flex flex-wrap items-end gap-2 border-t border-slate-200 p-4"
        >
          <input type="hidden" name="slug" value={slug} />
          <div>
            <label htmlFor="token-name" className="block text-xs font-medium text-slate-600">
              Create a token
            </label>
            <Input id="token-name" name="name" placeholder="Website integration" className="w-64" />
          </div>
          <Button type="submit" variant="primary">
            Create token
          </Button>
        </form>
      </Card>
    </div>
  );
}
