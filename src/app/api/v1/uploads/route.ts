import { withApiAuth } from "@/lib/api/route";
import { listUploads } from "@/lib/api/handlers";

export async function GET(req: Request) {
  return withApiAuth(req, (ctx) => listUploads(req, ctx));
}
