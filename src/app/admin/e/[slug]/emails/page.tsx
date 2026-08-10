import Link from "next/link";

import { requireOrganizer } from "@/lib/guards";
import { listMessages, TEMPLATE_SEEDS } from "@/lib/repo/emails";
import { FilterSelect, SearchBox } from "@/components/client/basics";
import {
  Card,
  CardHeader,
  Chip,
  LinkButton,
  Notice,
  PageHeader,
  Table,
  Td,
  Th,
} from "@/components/ui";
import { formatStamp } from "@/lib/datetime";

export const dynamic = "force-dynamic";

export default async function EmailsPage({
  params,
  searchParams,
}: PageProps<"/admin/e/[slug]/emails">) {
  const { slug } = await params;
  const sp = await searchParams;
  const { event } = await requireOrganizer(slug);
  const str = (key: string) => (typeof sp[key] === "string" ? (sp[key] as string) : "");

  const messages = listMessages(event.id, {
    q: str("q"),
    templateKey: str("template"),
  });
  const open = str("message");
  const detail = open ? messages.find((m) => m.id === open) : null;

  return (
    <div>
      <PageHeader
        title="Emails"
        description="Every message this event has sent, including automated ones. Delivery is logged here even when no mail provider is configured."
        actions={
          <>
            <LinkButton href={`/admin/e/${slug}/emails/templates`} size="sm">
              Templates
            </LinkButton>
            <LinkButton href={`/admin/e/${slug}/emails/compose`} size="sm" variant="primary">
              Compose
            </LinkButton>
          </>
        }
      />

      {sp.sent ? (
        <Notice tone="success" className="mb-4">
          Sent {String(sp.sent)} message(s)
          {sp.decisions ? ` for ${String(sp.decisions)} submission(s)` : ""}. Each one is listed
          below.
        </Notice>
      ) : null}

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <SearchBox
          param="q"
          label="Search emails"
          placeholder="Search recipient or subject…"
          className="w-full sm:w-72"
        />
        <FilterSelect
          param="template"
          label="Template"
          allLabel="Any template"
          options={TEMPLATE_SEEDS.map((t) => ({ value: t.key, label: t.name }))}
        />
        {str("q") || str("template") ? (
          <LinkButton href={`/admin/e/${slug}/emails`} size="sm">
            Clear
          </LinkButton>
        ) : null}
        <span className="text-sm text-slate-500" role="status">
          {messages.length} messages
        </span>
      </div>

      {detail ? (
        <Card className="mb-4">
          <CardHeader
            title={detail.subject}
            description={`To ${detail.to_name ?? ""} <${detail.to_email}> · ${formatStamp(
              detail.created_at,
            )}`}
            actions={
              <LinkButton href={`/admin/e/${slug}/emails`} size="sm">
                Close
              </LinkButton>
            }
          />
          <div
            className="prose-cf p-5 text-sm text-slate-700"
            dangerouslySetInnerHTML={{ __html: detail.body_html }}
          />
        </Card>
      ) : null}

      <Table>
        <thead>
          <tr>
            <Th>Sent</Th>
            <Th>Recipient</Th>
            <Th>Subject</Th>
            <Th>Template</Th>
            <Th>Status</Th>
            <Th />
          </tr>
        </thead>
        <tbody>
          {messages.map((message) => (
            <tr key={message.id}>
              <Td className="whitespace-nowrap text-xs">{formatStamp(message.created_at)}</Td>
              <Td className="text-sm">
                {message.to_name ? (
                  <span className="font-medium text-slate-800">{message.to_name}</span>
                ) : null}
                <span className="block text-xs text-slate-500">{message.to_email}</span>
              </Td>
              <Td className="text-sm">{message.subject}</Td>
              <Td className="text-xs">{message.template_key ?? "custom"}</Td>
              <Td>
                <Chip
                  tone={
                    message.status === "sent" ? "green" : message.status === "failed" ? "red" : "slate"
                  }
                >
                  {message.status}
                </Chip>
              </Td>
              <Td>
                <Link
                  href={`/admin/e/${slug}/emails?message=${message.id}`}
                  className="text-xs font-medium text-brand-700 hover:underline"
                >
                  View body
                </Link>
              </Td>
            </tr>
          ))}
          {!messages.length ? (
            <tr>
              <Td colSpan={6} className="py-8 text-center text-slate-500">
                No messages yet.
              </Td>
            </tr>
          ) : null}
        </tbody>
      </Table>
    </div>
  );
}
