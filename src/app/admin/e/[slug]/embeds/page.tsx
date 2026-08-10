import { eq } from "drizzle-orm";
import { requireEventRole } from "@/lib/auth/guards";
import { getDb, schema } from "@/lib/db";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { CopyUrlButton } from "@/app/admin/e/[slug]/forms/[formId]/edit/copy-url-button";

export default async function EmbedsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { event } = await requireEventRole(slug, ["organizer"]);
  const db = getDb();
  const embeds = db
    .select()
    .from(schema.embeds)
    .where(eq(schema.embeds.eventId, event.id))
    .all();
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Embeds</h1>
        <p className="text-slate-600">
          Shareable public widgets. Styled HTML script tags, JSON, and iCal feeds.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {embeds.map((emb) => {
          const publicPath =
            emb.type === "sessions"
              ? `/e/${slug}/sessions`
              : emb.type === "speakers"
                ? `/e/${slug}/speakers`
                : emb.type === "agenda"
                  ? `/e/${slug}/agenda`
                  : emb.type === "itinerary"
                    ? `/e/${slug}/itinerary`
                    : `/e/${slug}/gallery`;
          const jsonUrl = `${base}/e/${slug}/embed/${emb.token}.json`;
          const icsUrl = `${base}/e/${slug}/embed/${emb.token}.ics`;
          const snippet = `<script src="${base}/e/${slug}/embed/${emb.token}.js" async></script>`;
          return (
            <Card key={emb.id}>
              <CardHeader title={emb.type} subtitle={emb.format} />
              <CardBody className="space-y-3 text-sm">
                <div>
                  <div className="text-xs font-semibold uppercase text-slate-500">
                    Public page
                  </div>
                  <a href={publicPath} className="text-blue-700 hover:underline">
                    {publicPath}
                  </a>
                </div>
                <div>
                  <div className="text-xs font-semibold uppercase text-slate-500">
                    Script snippet
                  </div>
                  <pre className="mt-1 overflow-auto rounded bg-slate-50 p-2 text-xs">
                    {snippet}
                  </pre>
                  <CopyUrlButton url={snippet} />
                </div>
                <div className="text-xs text-slate-600">
                  JSON: <code>{jsonUrl}</code>
                  <br />
                  iCal: <code>{icsUrl}</code>
                </div>
              </CardBody>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
