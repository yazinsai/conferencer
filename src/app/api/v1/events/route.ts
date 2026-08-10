import { withApiAuth } from "@/lib/api/route";
import { getEventHandler } from "@/lib/api/handlers";

export async function GET(req: Request) {
  return withApiAuth(req, (ctx) => getEventHandler(req, ctx));
}
