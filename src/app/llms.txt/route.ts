import { demoLlmsTxt } from "@/lib/demo-login";

export const dynamic = "force-dynamic";

export function GET() {
  return new Response(demoLlmsTxt(), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=300",
    },
  });
}
