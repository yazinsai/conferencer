import { NextResponse } from "next/server";

import { createSession, findUserByEmail } from "@/lib/auth";
import { DEMO_ACCOUNTS, resolveDemoRole, safeNextPath } from "@/lib/demo-login";
import { landingFor } from "@/lib/guards";
import { publicUrl } from "@/lib/public-url";

export const dynamic = "force-dynamic";

/**
 * GET door into the seeded demo. Crawlers follow <a href>; they will not POST
 * a persona button. /demo, /demo/organizer, /demo/reviewer, /demo/speaker.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ role?: string[] }> },
) {
  const { role: segments } = await params;
  const url = new URL(request.url);
  const resolved = resolveDemoRole(segments?.[0] ?? url.searchParams.get("role"));
  if (!resolved) {
    return NextResponse.redirect(publicUrl("/sign-in", request), { status: 303 });
  }

  const user = findUserByEmail(DEMO_ACCOUNTS[resolved].email);
  if (!user) {
    return NextResponse.redirect(
      publicUrl("/sign-in?error=Demo%20accounts%20are%20not%20seeded%20on%20this%20instance.", request),
      { status: 303 },
    );
  }

  await createSession(user.id);
  const next = safeNextPath(url.searchParams.get("next"));
  return NextResponse.redirect(publicUrl(next || landingFor(user), request), { status: 303 });
}
