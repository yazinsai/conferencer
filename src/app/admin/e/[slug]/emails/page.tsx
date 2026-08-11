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
import { formatShortDate, formatTime } from "@/lib/datetime";

export const dynamic = "force-dynamic";

const TEMPLATE_NAMES = Object.fromEntries(TEMPLATE_SEEDS.map((t) => [t.key, t.name]));

function templateLabel(key: string | null): string {
  if (!key) return "Custom";
  return TEMPLATE_NAMES[key] ?? key;
}

function sentParts(iso: string | null | undefined) {
  if (!iso) return { date: "—", time: "" };
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return { date: String(iso), time: "" };
  const naive = d.toISOString().slice(0, 16);
  return {
    date: `${formatShortDate(naive)}, ${d.getUTCFullYear()}`,
    time: formatTime(naive),
  };
}

function emailsHref(
  slug: string,
  opts: { q?: string; template?: string; message?: string | null },
) {
  const params = new URLSearchParams();
  if (opts.q) params.set("q", opts.q);
  if (opts.template) params.set("template", opts.template);
  if (opts.message) params.set("message", opts.message);
  const qs = params.toString();
  return qs ? `/admin/e/${slug}/emails?${qs}` : `/admin/e/${slug}/emails`;
}

export default async function EmailsPage({
  params,
  searchParams,
}: PageProps<"/admin/e/[slug]/emails">) {
  const { slug } = await params;
  const sp = await searchParams;
  const { event } = await requireOrganizer(slug);
  const str = (key: string) => (typeof sp[key] === "string" ? (sp[key] as string) : "");

  const q = str("q");
  const template = str("template");
  const messages = listMessages(event.id, {
    q,
    templateKey: template,
  });
  const open = str("message");
  const detail = open ? messages.find((m) => m.id === open) : null;
  const detailSent = detail ? sentParts(detail.created_at) : null;

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
        {q || template ? (
          <LinkButton href={`/admin/e/${slug}/emails`} size="sm">
            Clear
          </LinkButton>
        ) : null}
        <span className="text-sm text-muted-foreground" role="status">
          {messages.length} messages
        </span>
      </div>

      <div
        className={
          detail
            ? "grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] xl:grid-cols-[minmax(0,1fr)_minmax(0,26rem)]"
            : undefined
        }
      >
        <div className="min-w-0">
          <Table>
            <thead>
              <tr>
                <Th className="min-w-[12rem]">Subject</Th>
                <Th className="min-w-[10rem]">Recipient</Th>
                <Th className="w-[8.5rem]">Template</Th>
                <Th className="w-[5.5rem]">Status</Th>
                <Th className="w-[4.5rem]">
                  <span className="sr-only">Open</span>
                </Th>
              </tr>
            </thead>
            <tbody>
              {messages.map((message) => {
                const selected = message.id === open;
                const sent = sentParts(message.created_at);
                const label = templateLabel(message.template_key);
                return (
                  <tr
                    key={message.id}
                    className={selected ? "bg-paper-3" : undefined}
                  >
                    <Td className="min-w-0">
                      <p className="text-sm font-medium text-ink break-words">
                        {message.subject}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        <span>{sent.date}</span>
                        {sent.time ? (
                          <>
                            {" · "}
                            <span className="wordmark tnum">{sent.time}</span>
                          </>
                        ) : null}
                      </p>
                    </Td>
                    <Td className="min-w-0 text-sm">
                      {message.to_name ? (
                        <span className="font-medium text-ink-2">{message.to_name}</span>
                      ) : null}
                      <span
                        className={
                          message.to_name
                            ? "mt-0.5 block text-xs text-neutral break-all"
                            : "text-neutral break-all"
                        }
                      >
                        {message.to_email}
                      </span>
                    </Td>
                    <Td className="text-xs text-neutral">
                      <span className="block break-words">{label}</span>
                      {message.template_key && TEMPLATE_NAMES[message.template_key] ? (
                        <span className="mt-0.5 block font-mono text-[0.6875rem] text-muted-foreground">
                          {message.template_key}
                        </span>
                      ) : null}
                    </Td>
                    <Td>
                      <Chip
                        tone={
                          message.status === "sent"
                            ? "green"
                            : message.status === "failed"
                              ? "red"
                              : "slate"
                        }
                      >
                        {message.status}
                      </Chip>
                    </Td>
                    <Td className="text-right">
                      <Link
                        href={emailsHref(slug, {
                          q,
                          template,
                          message: selected ? null : message.id,
                        })}
                        className="text-xs font-medium text-signal underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                        aria-label={
                          selected
                            ? `Close body of ${message.subject}`
                            : `View body of ${message.subject}`
                        }
                      >
                        {selected ? "Close" : "View →"}
                      </Link>
                    </Td>
                  </tr>
                );
              })}
              {!messages.length ? (
                <tr>
                  <Td colSpan={5} className="py-8 text-center text-muted-foreground">
                    No messages yet.
                  </Td>
                </tr>
              ) : null}
            </tbody>
          </Table>
        </div>

        {detail && detailSent ? (
          <Card className="min-w-0 lg:sticky lg:top-[calc(var(--nav-height)+0.75rem)]">
            <CardHeader
              title={detail.subject}
              description={
                <span className="block">
                  To{" "}
                  {detail.to_name ? (
                    <>
                      <span className="text-ink-2">{detail.to_name}</span>{" "}
                    </>
                  ) : null}
                  <span className="text-neutral">&lt;{detail.to_email}&gt;</span>
                  <span className="mt-0.5 block">
                    {detailSent.date}
                    {detailSent.time ? (
                      <>
                        {" · "}
                        <span className="wordmark tnum">{detailSent.time}</span>
                      </>
                    ) : null}
                    {" · "}
                    {templateLabel(detail.template_key)}
                  </span>
                </span>
              }
              actions={
                <LinkButton
                  href={emailsHref(slug, { q, template, message: null })}
                  size="sm"
                >
                  Close
                </LinkButton>
              }
            />
            <div
              className="prose-cf max-h-[min(70vh,36rem)] overflow-auto p-5 text-sm text-ink-2"
              dangerouslySetInnerHTML={{ __html: detail.body_html }}
            />
          </Card>
        ) : null}
      </div>
    </div>
  );
}
