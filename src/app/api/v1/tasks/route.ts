import { withApiAuth } from "@/lib/api/route";
import {
  createTask,
  listTasks,
} from "@/lib/api/handlers";

export async function GET(req: Request) {
  return withApiAuth(req, (ctx) => listTasks(req, ctx));
}

export async function POST(req: Request) {
  return withApiAuth(req, (ctx) => createTask(req, ctx));
}
