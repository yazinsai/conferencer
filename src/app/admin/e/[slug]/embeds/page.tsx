import { requireOrganizer } from "@/lib/guards";
import { readJson } from "@/lib/db";
import { listLookup } from "@/lib/repo/events";
import { EMBED_FORMATS, EMBED_TYPES, listEmbeds } from "@/lib/repo/embeds";
import {
  createEmbedAction,
  deleteEmbedAction,
  rotateEmbedTokenAction,
  updateEmbedAction,
} from "@/server/embed-actions";
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
  Select,
} from "@/components/ui";
import { ConfirmSubmit, CopyButton } from "@/components/client/basics";

export const dynamic = "force-dynamic";

export default async function EmbedsPage({
  params,
  searchParams,
}: PageProps<"/admin/e/[slug]/embeds">) {
  const { slug } = await params;
  const sp = await searchParams;
  const { event } = await requireOrganizer(slug);
  const embeds = listEmbeds(event.id);
  const tracks = listLookup("tracks", event.id);
  const formats = listLookup("formats", event.id);
  const openId = typeof sp.open === "string" ? sp.open : "";

  return (
    <div className="max-w-4xl">
      <PageHeader
        title="Site &amp; embeds"
        description="Publish live event content to your own website. Every widget has a shareable URL and a copy-paste snippet."
        actions={<LinkButton href={`/e/${event.slug}`}>Open the public site</LinkButton>}
      />

      {sp.created ? <Notice tone="success" className="mb-4">Embed created.</Notice> : null}
      {sp.saved ? <Notice tone="success" className="mb-4">Embed saved.</Notice> : null}
      {sp.rotated ? (
        <Notice tone="success" className="mb-4">
          Embed URL rotated. Update any live snippets to the new token.
        </Notice>
      ) : null}

      <details className="mb-5 rounded-card border border-rule bg-paper shadow-[var(--shadow-card)]">
        <summary className="cursor-pointer list-none px-4 py-3 text-sm font-medium text-ink marker:content-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus [&::-webkit-details-marker]:hidden">
          Create embed
        </summary>
        <form action={createEmbedAction} className="grid gap-3 border-t border-rule p-4 sm:grid-cols-4">
          <input type="hidden" name="slug" value={slug} />
          <Field label="Name" name="name" required>
            <Input id="new-name" name="name" placeholder="Website session list" required />
          </Field>
          <Field label="Widget" name="type">
            <Select id="new-type" name="type" defaultValue="sessions">
              {EMBED_TYPES.map((entry) => (
                <option key={entry.value} value={entry.value}>
                  {entry.label}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Format" name="format">
            <Select id="new-format" name="format" defaultValue="styled_html">
              {EMBED_FORMATS.map((entry) => (
                <option key={entry.value} value={entry.value}>
                  {entry.label}
                </option>
              ))}
            </Select>
          </Field>
          <div className="flex items-end">
            <Button type="submit" variant="primary">
              Create embed
            </Button>
          </div>
        </form>
      </details>

      <Card className="mb-5">
        <CardHeader title="Public pages" description="These are live right now — no embedding needed." />
        <ul className="grid gap-2 p-4 sm:grid-cols-2">
          {[
            { href: `/e/${event.slug}/sessions`, label: "List of Sessions" },
            { href: `/e/${event.slug}/speakers`, label: "List of Speakers" },
            { href: `/e/${event.slug}/agenda`, label: "Agenda" },
            { href: `/e/${event.slug}/itinerary`, label: "Schedule Itinerary" },
            { href: `/e/${event.slug}/gallery`, label: "Speaker Gallery" },
            { href: `/e/${event.slug}/my-schedule`, label: "Personal schedule" },
          ].map((entry) => (
            <li key={entry.href} className="flex items-center justify-between gap-2 text-sm">
              <a
                href={entry.href}
                className="font-medium text-ink underline decoration-rule-2 underline-offset-2 hover:decoration-ink"
              >
                {entry.label}
              </a>
              <CopyButton value={entry.href} label="Copy URL" />
            </li>
          ))}
        </ul>
      </Card>

      <div className="space-y-3">
        {embeds.map((embed) => {
          const config = readJson<{ track?: string; format?: string; accent?: string }>(
            embed.config,
            {},
          );
          const base = `/e/${event.slug}/embed/${embed.token}`;
          const snippet = `<script src="${base}?format=styled_html" async></script>`;
          const typeLabel =
            EMBED_TYPES.find((entry) => entry.value === embed.type)?.label ?? embed.type;
          const formatLabel =
            EMBED_FORMATS.find((entry) => entry.value === embed.format)?.label ?? embed.format;
          return (
            <details
              key={embed.id}
              className="rounded-card border border-rule bg-paper shadow-[var(--shadow-card)]"
              open={openId === embed.id}
            >
              <summary className="cursor-pointer list-none px-4 py-3 marker:content-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus [&::-webkit-details-marker]:hidden">
                <span className="flex flex-wrap items-center justify-between gap-3">
                  <span className="min-w-0">
                    <span className="block font-medium text-ink">{embed.name}</span>
                    <span className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <Chip tone="slate">{typeLabel}</Chip>
                      <Chip tone="slate">{formatLabel}</Chip>
                    </span>
                  </span>
                  <span className="text-xs font-medium text-muted-foreground">Configure</span>
                </span>
              </summary>
              <div className="space-y-3 border-t border-rule p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Script tag (works on any site, no framework needed)
                  </p>
                  <CopyButton value={snippet} label="Copy snippet" />
                </div>
                <div>
                  <code className="block overflow-x-auto rounded-input bg-ink px-3 py-2 font-mono text-xs text-paper">
                    {snippet}
                  </code>
                </div>

                <div className="grid gap-2 sm:grid-cols-2">
                  {[
                    { label: "Styled HTML", href: `${base}?format=styled_html` },
                    { label: "Plain HTML", href: `${base}?format=html` },
                    { label: "JSON", href: `${base}.json` },
                    { label: "XML", href: `${base}?format=xml` },
                    { label: "iCal", href: `${base}.ics` },
                  ].map((entry) => (
                    <div key={entry.label} className="flex items-center justify-between gap-2 text-sm">
                      <a
                        href={entry.href}
                        className="font-medium text-ink underline decoration-rule-2 underline-offset-2 hover:decoration-ink"
                      >
                        {entry.label}
                      </a>
                      <CopyButton value={entry.href} label="Copy URL" />
                    </div>
                  ))}
                </div>

                <form
                  action={updateEmbedAction}
                  className="grid gap-3 border-t border-rule pt-3 sm:grid-cols-4"
                >
                  <input type="hidden" name="slug" value={slug} />
                  <input type="hidden" name="embed_id" value={embed.id} />
                  <Field label="Name" name={`name-${embed.id}`}>
                    <Input id={`name-${embed.id}`} name="name" defaultValue={embed.name} />
                  </Field>
                  <Field label="Widget" name={`type-${embed.id}`}>
                    <Select id={`type-${embed.id}`} name="type" defaultValue={embed.type}>
                      {EMBED_TYPES.map((entry) => (
                        <option key={entry.value} value={entry.value}>
                          {entry.label}
                        </option>
                      ))}
                    </Select>
                  </Field>
                  <Field label="Default format" name={`format-${embed.id}`}>
                    <Select id={`format-${embed.id}`} name="format" defaultValue={embed.format}>
                      {EMBED_FORMATS.map((entry) => (
                        <option key={entry.value} value={entry.value}>
                          {entry.label}
                        </option>
                      ))}
                    </Select>
                  </Field>
                  <Field label="Accent colour" name={`accent-${embed.id}`}>
                    <Input
                      id={`accent-${embed.id}`}
                      name="accent"
                      type="color"
                      defaultValue={config.accent ?? event.accent_color}
                      className="h-10 w-20 p-1"
                    />
                  </Field>
                  <Field label="Only this track" name={`track-${embed.id}`}>
                    <Select id={`track-${embed.id}`} name="track" defaultValue={config.track ?? ""}>
                      <option value="">All tracks</option>
                      {tracks.map((track) => (
                        <option key={track.id} value={track.id}>
                          {track.name}
                        </option>
                      ))}
                    </Select>
                  </Field>
                  <Field label="Only this format" name={`sf-${embed.id}`}>
                    <Select
                      id={`sf-${embed.id}`}
                      name="session_format"
                      defaultValue={config.format ?? ""}
                    >
                      <option value="">All formats</option>
                      {formats.map((entry) => (
                        <option key={entry.id} value={entry.id}>
                          {entry.name}
                        </option>
                      ))}
                    </Select>
                  </Field>
                  <div className="flex flex-wrap items-end gap-2 sm:col-span-2">
                    <Button type="submit" variant="primary">
                      Save embed
                    </Button>
                  </div>
                </form>

                <div className="flex flex-wrap items-center justify-between gap-2 border-t border-rule pt-3">
                  <p className="text-xs text-muted-foreground">
                    Rotating the URL invalidates every live snippet that still uses the current
                    token.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <form action={rotateEmbedTokenAction}>
                      <input type="hidden" name="slug" value={slug} />
                      <input type="hidden" name="embed_id" value={embed.id} />
                      <ConfirmSubmit
                        message={`Rotate the URL for "${embed.name}"? Current snippets will stop working until they are updated.`}
                        variant="danger"
                      >
                        Rotate URL (breaks current snippets)
                      </ConfirmSubmit>
                    </form>
                    <form action={deleteEmbedAction}>
                      <input type="hidden" name="slug" value={slug} />
                      <input type="hidden" name="embed_id" value={embed.id} />
                      <ConfirmSubmit message={`Delete the embed "${embed.name}"?`} variant="danger">
                        Delete
                      </ConfirmSubmit>
                    </form>
                  </div>
                </div>
              </div>
            </details>
          );
        })}
        {!embeds.length ? (
          <Card className="p-8 text-center text-sm text-muted-foreground">
            No embeds yet. Create one above.
          </Card>
        ) : null}
      </div>
    </div>
  );
}
