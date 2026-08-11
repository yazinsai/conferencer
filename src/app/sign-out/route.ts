import { NextResponse } from "next/server";

import { destroySession } from "@/lib/auth";

async function handle(request: Request) {
  await destroySession();
  return NextResponse.redirect(new URL("/", request.url), { status: 303 });
}

export const GET = handle;
export const POST = handle;
