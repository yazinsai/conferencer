import { withApiAuth } from "@/lib/api/route";
import { bulkUpdateSubmissionStatus } from "@/lib/api/handlers";

export async function POST(req: Request) {
  return withApiAuth(req, (ctx) => bulkUpdateSubmissionStatus(req, ctx));
}
