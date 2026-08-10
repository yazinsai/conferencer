import { runDueJobs } from "@/lib/cron";
import { currentUser } from "@/lib/auth";
import { hasRole } from "@/lib/auth";
import { defaultEvent } from "@/lib/repo/events";

export const dynamic = "force-dynamic";

/**
 * Cron endpoint for platforms that trigger over HTTP.
 * Authorised by CRON_SECRET, or by a signed-in organizer (handy for a manual run).
 */
export async function POST(request: Request) {
  const secret = process.env.CRON_SECRET;
  const header = request.headers.get("authorization") ?? "";
  let allowed = Boolean(secret) && header === `Bearer ${secret}`;

  if (!allowed) {
    const user = await currentUser();
    const event = defaultEvent();
    allowed = Boolean(user && event && hasRole(user.id, event.id, "organizer"));
  }
  if (!allowed) return new Response("Unauthorized", { status: 401 });

  const result = await runDueJobs();
  return Response.json({ ok: true, ...result });
}

export const GET = POST;
