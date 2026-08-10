import { buildOpenApiSpec } from "@/lib/api/openapi";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
    `${url.protocol}//${url.host}`;

  const spec = buildOpenApiSpec(baseUrl);
  return Response.json(spec, {
    headers: {
      "Cache-Control": "public, max-age=300",
    },
  });
}
