import { and, eq } from "drizzle-orm";
import { getDb, schema } from "@/lib/db";
import { getPublicSessions } from "@/lib/public/program";
import { buildCalendarFeed } from "@/lib/calendar/ics";

type Ctx = { params: Promise<{ slug: string; token: string }> };

export async function GET(req: Request, ctx: Ctx) {
  const { slug, token } = await ctx.params;
  const pathname = new URL(req.url).pathname;
  const format = pathname.endsWith(".ics")
    ? "ics"
    : pathname.endsWith(".js")
      ? "js"
      : "json";

  const cleanToken = token.replace(/\.(json|ics|js)$/i, "");
  const db = getDb();
  const embed = db
    .select()
    .from(schema.embeds)
    .where(eq(schema.embeds.token, cleanToken))
    .get();
  if (!embed) return new Response("Not found", { status: 404 });

  const event = db
    .select()
    .from(schema.events)
    .where(and(eq(schema.events.id, embed.eventId), eq(schema.events.slug, slug)))
    .get();
  if (!event) return new Response("Not found", { status: 404 });

  const program = await getPublicSessions(slug);
  const sessions = program?.sessions ?? [];

  if (format === "ics") {
    const ics = buildCalendarFeed(
      sessions
        .filter((s) => s.startsAt && s.endsAt)
        .map((s) => ({
          uid: `${s.id}@conferencer`,
          summary: s.title,
          description: s.description ?? "",
          startsAt: s.startsAt!,
          endsAt: s.endsAt!,
          location: s.room?.name ?? event.location ?? "",
          organizerEmail: "noreply@example.com",
          organizerName: event.name,
        })),
      { name: event.name },
    );
    return new Response(ics, {
      headers: {
        "Content-Type": "text/calendar; charset=utf-8",
        "Cache-Control": "public, max-age=60",
      },
    });
  }

  if (format === "js") {
    const html = sessions
      .slice(0, 50)
      .map(
        (s) =>
          `<div class="cnf-session"><strong>${escapeHtml(s.title)}</strong><div>${escapeHtml(s.track?.name ?? "")} · ${escapeHtml(s.format?.name ?? "")}</div></div>`,
      )
      .join("");
    const script = `(function(){var d=document.currentScript;var el=document.createElement('div');el.className='conferencer-embed';el.innerHTML=${JSON.stringify(`<div style="font-family:system-ui,sans-serif">${html}</div>`)};d.parentNode.insertBefore(el,d);})();`;
    return new Response(script, {
      headers: {
        "Content-Type": "application/javascript; charset=utf-8",
        "Cache-Control": "public, max-age=60",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }

  return Response.json(
    {
      event: { name: event.name, slug: event.slug },
      type: embed.type,
      sessions: sessions.map((s) => ({
        id: s.id,
        title: s.title,
        description: s.description,
        startsAt: s.startsAt,
        endsAt: s.endsAt,
        room: s.room?.name ?? null,
        track: s.track?.name ?? null,
        format: s.format?.name ?? null,
        speakers: s.speakers.map((sp) => ({
          name: `${sp.firstName} ${sp.lastName}`,
          jobTitle: sp.jobTitle,
          company: sp.company,
        })),
      })),
    },
    { headers: { "Cache-Control": "public, max-age=60" } },
  );
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
