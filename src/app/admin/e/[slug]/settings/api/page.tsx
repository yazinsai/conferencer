import { requireOrganizer } from "@/lib/guards";
import { all } from "@/lib/db";
import { createApiTokenAction, deleteApiTokenAction } from "@/server/settings-actions";
import {
  Button,
  Card,
  CardHeader,
  Field,
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

function fingerprint(token: string): string {
  if (token.length <= 10) return token;
  return `${token.slice(0, 4)}…${token.slice(-4)}`;
}

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
        breadcrumb={<a href={`/admin/e/${slug}/settings`}>Settings</a>}
        actions={
          <>
            <LinkButton href="/api/v1/openapi.json" size="sm" variant="primary">
              OpenAPI spec
            </LinkButton>
            <LinkButton href="/api-docs" size="sm" variant="ghost">
              API reference
            </LinkButton>
          </>
        }
      />

      <Notice tone="info" className="mb-4">
        <p className="font-medium">Using the API</p>
        <pre className="mt-1 overflow-x-auto rounded-md border border-rule bg-paper-3 p-3 font-mono text-xs text-ink-2">
          {`curl -H "Authorization: Bearer <token>" \\\n  ${"$"}{APP_URL}/api/v1/submissions?limit=25`}
        </pre>
      </Notice>

      <Card className="mb-5">
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
                <Td className="font-medium text-ink">{row.name}</Td>
                <Td>
                  <div className="flex max-w-xs items-center gap-2">
                    <code
                      className="block min-w-0 flex-1 truncate rounded-md border border-rule bg-paper-3 px-1.5 py-0.5 font-mono text-xs text-ink-2"
                      title="Token fingerprint"
                    >
                      {fingerprint(row.token)}
                    </code>
                    {/* Server-rendered fallback so the full credential remains selectable without clipboard JS. */}
                    <input
                      type="text"
                      readOnly
                      value={row.token}
                      aria-label={`Full token for ${row.name}`}
                      className="sr-only"
                      tabIndex={-1}
                    />
                    <CopyButton
                      value={row.token}
                      label="Copy"
                      raw
                      className="shrink-0"
                      aria-label={`Copy token ${row.name}`}
                    />
                  </div>
                </Td>
                <Td className="wordmark tnum text-xs text-muted-foreground">
                  {formatStamp(row.created_at)}
                </Td>
                <Td className="wordmark tnum text-xs text-muted-foreground">
                  {row.last_used_at ? formatStamp(row.last_used_at) : "never"}
                </Td>
                <Td>
                  <form action={deleteApiTokenAction}>
                    <input type="hidden" name="slug" value={slug} />
                    <input type="hidden" name="id" value={row.id} />
                    <ConfirmSubmit message={`Revoke "${row.name}"?`} variant="danger">
                      Revoke
                    </ConfirmSubmit>
                  </form>
                </Td>
              </tr>
            ))}
            {!tokens.length ? (
              <tr>
                <Td colSpan={5} className="py-6 text-center text-muted-foreground">
                  No tokens yet.
                </Td>
              </tr>
            ) : null}
          </tbody>
        </Table>
      </Card>

      <Card>
        <CardHeader title="Create a token" />
        <form action={createApiTokenAction} className="flex flex-wrap items-end gap-3 p-4">
          <input type="hidden" name="slug" value={slug} />
          <div className="min-w-[16rem] flex-1">
            <Field
              label="Token name"
              name="name"
              hint="Used to identify this integration."
            >
              <Input
                id="name"
                name="name"
                placeholder="Website integration"
                className="w-full max-w-sm"
                required
              />
            </Field>
          </div>
          <Button type="submit" variant="primary">
            Create token
          </Button>
        </form>
      </Card>
    </div>
  );
}
