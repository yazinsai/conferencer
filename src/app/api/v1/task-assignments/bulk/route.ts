import { withApiAuth } from "@/lib/api/route";
import { bulkAssignTasks } from "@/lib/api/handlers";

export async function POST(req: Request) {
  return withApiAuth(req, (ctx) => bulkAssignTasks(req, ctx));
}
