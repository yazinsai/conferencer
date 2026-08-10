import { withApiAuth } from "@/lib/api/route";
import {
  createFormat,
  listFormats,
} from "@/lib/api/handlers";

export async function GET(req: Request) {
  return withApiAuth(req, (ctx) => listFormats(req, ctx));
}

export async function POST(req: Request) {
  return withApiAuth(req, (ctx) => createFormat(req, ctx));
}
