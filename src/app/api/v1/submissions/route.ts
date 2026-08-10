import { withApiAuth } from "@/lib/api/route";
import {
  createSubmission,
  listSubmissions,
} from "@/lib/api/handlers";

export async function GET(req: Request) {
  return withApiAuth(req, (ctx) => listSubmissions(req, ctx));
}

export async function POST(req: Request) {
  return withApiAuth(req, (ctx) => createSubmission(req, ctx));
}
