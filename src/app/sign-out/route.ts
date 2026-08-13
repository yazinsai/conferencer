import { NextResponse } from "next/server";

import { destroySession } from "@/lib/auth";
import { publicUrl } from "@/lib/public-url";

async function handle(request: Request) {
  await destroySession();
  return NextResponse.redirect(publicUrl("/", request), { status: 303 });
}

export const GET = handle;
export const POST = handle;
