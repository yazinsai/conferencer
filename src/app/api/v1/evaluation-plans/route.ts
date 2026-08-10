import { withApiAuth } from "@/lib/api/route";
import { listEvaluationPlans } from "@/lib/api/handlers";

export async function GET(req: Request) {
  return withApiAuth(req, (ctx) => listEvaluationPlans(req, ctx));
}
