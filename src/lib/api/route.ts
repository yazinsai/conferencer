import type { ApiAuthContext } from "@/lib/api/auth";
import { authenticateApiRequest } from "@/lib/api/auth";

export type ApiHandler = (
  ctx: ApiAuthContext,
  req: Request,
) => Response | Promise<Response>;

export async function withApiAuth(
  req: Request,
  handler: ApiHandler,
): Promise<Response> {
  const auth = await authenticateApiRequest(req);
  if (auth instanceof Response) return auth;
  return await handler(auth, req);
}

export async function readJson<T = Record<string, unknown>>(
  req: Request,
): Promise<T | null> {
  try {
    return (await req.json()) as T;
  } catch {
    return null;
  }
}
