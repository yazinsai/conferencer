import { withApiAuth } from "@/lib/api/route";
import {
  createTaskAssignment,
  listTaskAssignments,
} from "@/lib/api/handlers";

export async function GET(req: Request) {
  return withApiAuth(req, (ctx) => listTaskAssignments(req, ctx));
}

export async function POST(req: Request) {
  return withApiAuth(req, (ctx) => createTaskAssignment(req, ctx));
}
