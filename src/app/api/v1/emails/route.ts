import { withApiAuth } from "@/lib/api/route";
import { listEmails } from "@/lib/api/handlers";

export async function GET(req: Request) {
  return withApiAuth(req, (ctx) => listEmails(req, ctx));
}
