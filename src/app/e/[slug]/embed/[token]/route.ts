import { getEventBySlug } from "@/lib/repo/events";
import { getEmbedByToken } from "@/lib/repo/embeds";
import {
  publicSessions,
  publicSpeakers,
  speakersForSubmissions,
  publicSessionsForSpeaker,
} from "@/lib/repo/submissions";
import { readJson } from "@/lib/db";
import { buildIcs } from "@/lib/ics";
import { formatRange, formatTime } from "@/lib/datetime";
import { stripHtml } from "@/lib/fields";
import { publicOrigin } from "@/lib/public-url";

export const dynamic = "force-dynamic";

/**
 * Public, cacheable widget feed. `format` comes from the saved embed and can be
 * overridden with ?format= so one token serves JSON, XML, iCal and HTML.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string; token: string }> },
) {
  const { slug, token } = await params;
  const event = getEventBySlug(slug);
  if (!event) return new Response("Not found", { status: 404 });

  // Allow "<token>.json" style suffixes as well as ?format=.
  const [rawToken, suffix] = token.split(".");
  const embed = getEmbedByToken(rawToken);
  if (!embed || embed.event_id !== event.id) return new Response("Not found", { status: 404 });

  const url = new URL(request.url);
  const origin = publicOrigin(request);
  const format = (url.searchParams.get("format") || suffix || embed.format) as string;
  const config = readJson<{ track?: string; format?: string; accent?: string }>(embed.config, {});

  const sessions = publicSessions(event.id, {
    trackId: config.track,
    formatId: config.format,
  });
  const speakerMap = speakersForSubmissions(sessions.map((s) => s.id));
  const cache = "public, max-age=60, s-maxage=300";

  if (format === "ical" || format === "ics") {
    const ics = buildIcs(
      sessions
        .filter((session) => session.pub_starts_at)
        .map((session) => ({
          uid: `${session.id}@conferencer`,
          title: session.title,
          description: session.description,
          location: session.room_name ?? event.location,
          start: session.pub_starts_at,
          end: session.pub_ends_at,
          url: `${origin}/e/${event.slug}/sessions/${session.id}`,
        })),
      { calendarName: event.name, timezone: event.timezone },
    );
    return new Response(ics, {
      headers: { "Content-Type": "text/calendar; charset=utf-8", "Cache-Control": cache },
    });
  }

  if (format === "json") {
    const payload =
      embed.type === "speakers" || embed.type === "gallery"
        ? {
            event: eventPayload(event),
            speakers: publicSpeakers(event.id).map((speaker) => ({
              id: speaker.id,
              name: `${speaker.first_name} ${speaker.last_name}`,
              job_title: speaker.job_title,
              company: speaker.company,
              biography: stripHtml(speaker.biography ?? ""),
              headshot_url: speaker.headshot_url ? `${origin}${speaker.headshot_url}` : null,
              sessions: publicSessionsForSpeaker(event.id, speaker.id).map((s) => ({
                id: s.id,
                title: s.title,
                starts_at: s.pub_starts_at,
                room: s.room_name,
              })),
            })),
          }
        : {
            event: eventPayload(event),
            sessions: sessions.map((session) => sessionPayload(session, speakerMap, origin, event.slug)),
          };
    return Response.json(payload, { headers: { "Cache-Control": cache } });
  }

  if (format === "xml") {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<event name="${escapeXml(event.name)}" slug="${event.slug}">
${sessions
  .map(
    (session) => `  <session id="${session.id}">
    <title>${escapeXml(session.title)}</title>
    <track>${escapeXml(session.track_name ?? "")}</track>
    <format>${escapeXml(session.format_name ?? "")}</format>
    <room>${escapeXml(session.room_name ?? "")}</room>
    <starts_at>${session.pub_starts_at ?? ""}</starts_at>
    <ends_at>${session.pub_ends_at ?? ""}</ends_at>
    <description>${escapeXml(stripHtml(session.description ?? ""))}</description>
    <speakers>${escapeXml(session.speakers ?? "")}</speakers>
  </session>`,
  )
  .join("\n")}
</event>`;
    return new Response(xml, {
      headers: { "Content-Type": "application/xml; charset=utf-8", "Cache-Control": cache },
    });
  }

  const accent = config.accent ?? event.accent_color;
  const html = renderHtml(embed.type, event.name, sessions, speakerMap, accent, origin, event.slug);

  if (format === "styled_html" || format === "js") {
    // A single <script> tag that injects the widget into the host page.
    const script = `(function(){
  var host = document.currentScript;
  var wrap = document.createElement('div');
  wrap.className = 'conferencer-embed';
  wrap.innerHTML = ${JSON.stringify(html)};
  host.parentNode.insertBefore(wrap, host);
})();`;
    return new Response(script, {
      headers: {
        "Content-Type": "application/javascript; charset=utf-8",
        "Cache-Control": cache,
        "Access-Control-Allow-Origin": "*",
      },
    });
  }

  return new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": cache,
      "Access-Control-Allow-Origin": "*",
    },
  });
}

function eventPayload(event: {
  id: string;
  name: string;
  slug: string;
  starts_at: string | null;
  ends_at: string | null;
  location: string | null;
  timezone: string;
}) {
  return {
    id: event.id,
    name: event.name,
    slug: event.slug,
    starts_at: event.starts_at,
    ends_at: event.ends_at,
    location: event.location,
    timezone: event.timezone,
  };
}

function sessionPayload(
  session: ReturnType<typeof publicSessions>[number],
  speakerMap: ReturnType<typeof speakersForSubmissions>,
  origin: string,
  slug: string,
) {
  return {
    id: session.id,
    title: session.title,
    description: stripHtml(session.description ?? ""),
    track: session.track_name,
    format: session.format_name,
    level: session.level,
    room: session.room_name,
    starts_at: session.pub_starts_at,
    ends_at: session.pub_ends_at,
    url: `${origin}/e/${slug}/sessions/${session.id}`,
    speakers: (speakerMap.get(session.id) ?? []).map((speaker) => ({
      id: speaker.contact_id,
      name: `${speaker.first_name} ${speaker.last_name}`,
      job_title: speaker.job_title,
      company: speaker.company,
    })),
  };
}

function renderHtml(
  type: string,
  eventName: string,
  sessions: ReturnType<typeof publicSessions>,
  speakerMap: ReturnType<typeof speakersForSubmissions>,
  accent: string,
  origin: string,
  slug: string,
): string {
  const css = `<style>
.cf-embed{font-family:ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;color:#0f172a}
.cf-embed *{box-sizing:border-box}
.cf-grid{display:grid;gap:12px;grid-template-columns:repeat(auto-fill,minmax(260px,1fr))}
.cf-card{border:1px solid #e2e8f0;border-radius:8px;padding:12px;background:#fff}
.cf-title{font-weight:600;margin:0 0 4px;font-size:15px}
.cf-meta{color:#64748b;font-size:12px;margin:0 0 6px}
.cf-chip{display:inline-block;border-radius:999px;padding:2px 8px;font-size:11px;background:${accent}1a;color:${accent};margin-right:4px}
.cf-desc{font-size:13px;color:#334155;margin:6px 0 0}
.cf-h{font-size:16px;font-weight:700;margin:0 0 10px}
.cf-avatar{width:64px;height:64px;border-radius:999px;object-fit:cover;display:block;margin:0 auto 8px}
.cf-center{text-align:center}
</style>`;

  if (type === "speakers" || type === "gallery") {
    const seen = new Map<string, { name: string; title: string; company: string; photo: string | null }>();
    for (const [, list] of speakerMap) {
      for (const speaker of list) {
        seen.set(speaker.contact_id, {
          name: `${speaker.first_name} ${speaker.last_name}`,
          title: speaker.job_title ?? "",
          company: speaker.company ?? "",
          photo: speaker.headshot_url ? `${origin}${speaker.headshot_url}` : null,
        });
      }
    }
    const cards = [...seen.values()]
      .sort((a, b) => a.name.split(" ").pop()!.localeCompare(b.name.split(" ").pop()!))
      .map(
        (speaker) => `<div class="cf-card cf-center">
  ${speaker.photo ? `<img class="cf-avatar" src="${speaker.photo}" alt="${escapeHtml(speaker.name)}" />` : ""}
  <p class="cf-title">${escapeHtml(speaker.name)}</p>
  <p class="cf-meta">${escapeHtml([speaker.title, speaker.company].filter(Boolean).join(", "))}</p>
</div>`,
      )
      .join("");
    return `${css}<div class="cf-embed"><p class="cf-h">${escapeHtml(eventName)} speakers</p><div class="cf-grid">${cards}</div></div>`;
  }

  const cards = sessions
    .map((session) => {
      const speakers = (speakerMap.get(session.id) ?? [])
        .map((s) => `${s.first_name} ${s.last_name}${s.company ? `, ${s.company}` : ""}`)
        .join(" · ");
      return `<div class="cf-card">
  <p class="cf-title"><a href="${origin}/e/${slug}/sessions/${session.id}" style="color:inherit;text-decoration:none">${escapeHtml(session.title)}</a></p>
  <p class="cf-meta">${escapeHtml(
    session.pub_starts_at ? formatRange(session.pub_starts_at, session.pub_ends_at) : "Time TBA",
  )}${session.room_name ? ` · ${escapeHtml(session.room_name)}` : ""}</p>
  ${session.track_name ? `<span class="cf-chip">${escapeHtml(session.track_name)}</span>` : ""}
  ${session.format_name ? `<span class="cf-chip">${escapeHtml(session.format_name)}</span>` : ""}
  ${speakers ? `<p class="cf-meta">${escapeHtml(speakers)}</p>` : ""}
  <p class="cf-desc">${escapeHtml(stripHtml(session.description ?? "").slice(0, 180))}…</p>
</div>`;
    })
    .join("");

  if (type === "agenda" || type === "itinerary") {
    const byDay = new Map<string, string[]>();
    for (const session of sessions) {
      const day = session.pub_starts_at?.slice(0, 10) ?? "Unscheduled";
      const list = byDay.get(day) ?? [];
      list.push(
        `<li><strong>${escapeHtml(formatTime(session.pub_starts_at))}</strong> — ${escapeHtml(
          session.title,
        )}${session.room_name ? ` <span class="cf-meta">${escapeHtml(session.room_name)}</span>` : ""}</li>`,
      );
      byDay.set(day, list);
    }
    const days = [...byDay.entries()]
      .sort()
      .map(([day, items]) => `<h3 class="cf-h">${day}</h3><ul>${items.join("")}</ul>`)
      .join("");
    return `${css}<div class="cf-embed"><p class="cf-h">${escapeHtml(eventName)} agenda</p>${days}</div>`;
  }

  return `${css}<div class="cf-embed"><p class="cf-h">${escapeHtml(eventName)} sessions</p><div class="cf-grid">${cards}</div></div>`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function escapeXml(value: string): string {
  return escapeHtml(value).replace(/'/g, "&apos;");
}
