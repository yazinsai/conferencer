import { withApiAuth } from "@/lib/api/route";
import { listReviews } from "@/lib/api/handlers";

export async function GET(req: Request) {
  return withApiAuth(req, (ctx) => listReviews(req, ctx));
}
