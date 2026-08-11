import { requireOrganizer } from "@/lib/guards";
import { readJson } from "@/lib/db";
import { listWebhooks, WEBHOOK_EVENT_LABELS, WEBHOOK_EVENTS } from "@/lib/webhooks";
import {
  createWebhookAction,
  deleteWebhookAction,
  testWebhookAction,
  toggleWebhookAction,
} from "@/server/webhook-actions";
import {
  Button,
  Card,
  CardHeader,
  Chip,
  Field,
  Input,
  Notice,
  PageHeader,
  Table,
  Td,
  Th,
} from "@/components/ui";
import { ConfirmSubmit, CopyButton } from "@/components/client/basics";
import { formatStamp } from "@/lib/datetime";

export const dynamic = "force-dynamic";

export default async function WebhooksPage({
  params,
  searchParams,
}: PageProps<"/admin/e/[slug]/settings/webhooks">) {
  const { slug } = await params;
  const sp = await searchParams;
  const { event } = await requireOrganizer(slug);
  const hooks = listWebhooks(event.id);
  const empty = hooks.length === 0;

  const addForm = (
    <Card className={empty ? "mb-5" : undefined}>
      <CardHeader title="Add an endpoint" />
      <form action={createWebhookAction} className="space-y-4 p-4">
        <input type="hidden" name="slug" value={slug} />
        <Field label="URL" name="url" required>
          <Input
            id="url"
            name="url"
            type="url"
            placeholder="https://example.com/hooks/conferencer"
            required
          />
        </Field>
        <fieldset>
          <legend className="mb-2 text-sm font-medium text-ink-2">Events</legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {WEBHOOK_EVENTS.map((name) => (
              <label
                key={name}
                className="flex cursor-pointer items-start gap-2.5 rounded-md px-2 py-2 transition-colors duration-[120ms] ease-out hover:bg-paper-2"
              >
                <input
                  type="checkbox"
                  name="events"
                  value={name}
                  defaultChecked
                  className="mt-1 size-4 shrink-0 accent-ink"
                />
                <span className="min-w-0">
                  <span className="block text-sm font-medium text-ink">
                    {WEBHOOK_EVENT_LABELS[name]}
                  </span>
                  <code className="wordmark text-xs text-muted-foreground">{name}</code>
                </span>
              </label>
            ))}
          </div>
        </fieldset>
        <Button type="submit" variant="primary">
          Add endpoint
        </Button>
      </form>
    </Card>
  );

  const verification = (
    <aside className="rounded-card border border-rule bg-paper-2 px-4 py-3 text-sm text-neutral">
      <p className="font-medium text-ink">Verifying a delivery</p>
      <p className="mt-1 max-w-[65ch] text-xs leading-relaxed">
        Every request is signed. Deliveries time out after 5 seconds and never block the action that
        triggered them.
      </p>
      <dl className="mt-3 space-y-1.5 text-xs">
        <div className="flex flex-wrap gap-x-2 gap-y-0.5">
          <dt className="text-muted-foreground">Event header</dt>
          <dd>
            <code className="wordmark text-ink-2">X-Conferencer-Event</code>
          </dd>
        </div>
        <div className="flex flex-wrap gap-x-2 gap-y-0.5">
          <dt className="text-muted-foreground">Signature header</dt>
          <dd>
            <code className="wordmark text-ink-2">X-Conferencer-Signature: sha256=…</code>
          </dd>
        </div>
        <div className="flex flex-wrap gap-x-2 gap-y-0.5">
          <dt className="text-muted-foreground">Algorithm</dt>
          <dd>HMAC-SHA256 of the raw body with the endpoint secret</dd>
        </div>
      </dl>
    </aside>
  );

  return (
    <div className="max-w-4xl">
      <PageHeader
        title="Webhooks"
        description="Push programme events to your own systems as they happen."
        breadcrumb={<a href={`/admin/e/${slug}/settings`}>Settings</a>}
      />

      {sp.tested ? (
        <Notice tone="success" className="mb-4">
          Test event delivered — check the Last status column below.
        </Notice>
      ) : null}

      {empty ? (
        <>
          <h2 className="mb-3 text-sm font-semibold text-ink">Endpoints</h2>
          <p className="mb-4 text-sm text-muted-foreground">
            No endpoints yet. Add one to start receiving events.
          </p>
          {addForm}
          <div className="mt-5">{verification}</div>
        </>
      ) : (
        <>
          <Card className="mb-5">
            <CardHeader title="Endpoints" description={`${hooks.length} configured`} />
            <Table className="rounded-none border-0">
              <thead>
                <tr>
                  <Th>URL</Th>
                  <Th>Events</Th>
                  <Th>Secret</Th>
                  <Th>Last status</Th>
                  <Th />
                </tr>
              </thead>
              <tbody>
                {hooks.map((hook) => (
                  <tr key={hook.id}>
                    <Td className="max-w-64 truncate font-mono text-xs">{hook.url}</Td>
                    <Td className="text-xs">
                      {readJson<string[]>(hook.events, []).map((name) => (
                        <Chip key={name} tone="slate" className="mr-1">
                          {name in WEBHOOK_EVENT_LABELS
                            ? WEBHOOK_EVENT_LABELS[name as keyof typeof WEBHOOK_EVENT_LABELS]
                            : name}
                        </Chip>
                      ))}
                    </Td>
                    <Td>
                      <CopyButton value={hook.secret} label="Copy secret" raw />
                    </Td>
                    <Td className="text-xs">
                      {hook.last_status ? (
                        <>
                          <Chip tone={hook.last_status.startsWith("2") ? "green" : "red"}>
                            {hook.last_status}
                          </Chip>
                          <span className="ml-1 text-muted-foreground">
                            {formatStamp(hook.last_sent_at)}
                          </span>
                        </>
                      ) : (
                        <span className="text-muted-foreground">never fired</span>
                      )}
                    </Td>
                    <Td>
                      <div className="flex flex-wrap gap-1">
                        <form action={testWebhookAction}>
                          <input type="hidden" name="slug" value={slug} />
                          <input type="hidden" name="webhook_id" value={hook.id} />
                          <Button type="submit" size="sm">
                            Send test
                          </Button>
                        </form>
                        <form action={toggleWebhookAction}>
                          <input type="hidden" name="slug" value={slug} />
                          <input type="hidden" name="webhook_id" value={hook.id} />
                          <input type="hidden" name="active" value={hook.is_active ? "0" : "1"} />
                          <Button type="submit" size="sm" variant="ghost">
                            {hook.is_active ? "Pause" : "Resume"}
                          </Button>
                        </form>
                        <form action={deleteWebhookAction}>
                          <input type="hidden" name="slug" value={slug} />
                          <input type="hidden" name="webhook_id" value={hook.id} />
                          <ConfirmSubmit message="Delete this webhook endpoint?" variant="danger">
                            Delete
                          </ConfirmSubmit>
                        </form>
                      </div>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card>

          {addForm}
          <div className="mt-5">{verification}</div>
        </>
      )}
    </div>
  );
}
