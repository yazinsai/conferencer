import { requireOrganizer } from "@/lib/guards";
import { readJson } from "@/lib/db";
import { listWebhooks, WEBHOOK_EVENTS } from "@/lib/webhooks";
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

export default async function WebhooksPage({
  params,
  searchParams,
}: PageProps<"/admin/e/[slug]/settings/webhooks">) {
  const { slug } = await params;
  const sp = await searchParams;
  const { event } = await requireOrganizer(slug);
  const hooks = listWebhooks(event.id);

  return (
    <div className="max-w-4xl">
      <PageHeader
        title="Webhooks"
        description="Push programme events to your own systems as they happen."
        actions={<LinkButton href={`/admin/e/${slug}/settings`}>Back to settings</LinkButton>}
      />

      {sp.tested ? (
        <Notice tone="success" className="mb-4">
          Test event delivered — check the Last status column below.
        </Notice>
      ) : null}

      <Notice tone="info" className="mb-4">
        <p className="font-medium">Verifying a delivery</p>
        <p className="mt-1 text-xs">
          Every request carries <code>X-Conferencer-Event</code> and{" "}
          <code>X-Conferencer-Signature: sha256=…</code>, an HMAC-SHA256 of the raw body using the
          endpoint&apos;s secret. Deliveries time out after 5 seconds and never block the action
          that triggered them.
        </p>
      </Notice>

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
                      {name}
                    </Chip>
                  ))}
                </Td>
                <Td>
                  <CopyButton value={hook.secret} label="Copy secret" />
                </Td>
                <Td className="text-xs">
                  {hook.last_status ? (
                    <>
                      <Chip tone={hook.last_status.startsWith("2") ? "green" : "red"}>
                        {hook.last_status}
                      </Chip>
                      <span className="ml-1 text-slate-400">
                        {formatStamp(hook.last_sent_at)}
                      </span>
                    </>
                  ) : (
                    <span className="text-slate-400">never fired</span>
                  )}
                </Td>
                <Td>
                  <div className="flex gap-1">
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
                      <ConfirmSubmit message="Delete this webhook endpoint?" variant="ghost">
                        Delete
                      </ConfirmSubmit>
                    </form>
                  </div>
                </Td>
              </tr>
            ))}
            {!hooks.length ? (
              <tr>
                <Td colSpan={5} className="py-6 text-center text-slate-500">
                  No endpoints yet.
                </Td>
              </tr>
            ) : null}
          </tbody>
        </Table>
      </Card>

      <Card>
        <CardHeader title="Add an endpoint" />
        <form action={createWebhookAction} className="space-y-3 p-4">
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
            <legend className="mb-1 text-sm font-medium text-slate-700">Events</legend>
            <div className="flex flex-wrap gap-3">
              {WEBHOOK_EVENTS.map((name) => (
                <label key={name} className="flex items-center gap-1.5 text-sm">
                  <input type="checkbox" name="events" value={name} defaultChecked />
                  <code className="text-xs">{name}</code>
                </label>
              ))}
            </div>
          </fieldset>
          <Button type="submit" variant="primary">
            Add endpoint
          </Button>
        </form>
      </Card>
    </div>
  );
}
