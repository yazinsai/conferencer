import { withApiAuth } from "@/lib/api/route";
import { listSessions } from "@/lib/api/handlers";

export async function GET(req: Request) {
  return withApiAuth(req, (ctx) => listSessions(req, ctx));
}
