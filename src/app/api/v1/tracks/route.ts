import { withApiAuth } from "@/lib/api/route";
import {
  createTrack,
  getTrack,
  listTracks,
} from "@/lib/api/handlers";

export async function GET(req: Request) {
  return withApiAuth(req, (ctx) => listTracks(req, ctx));
}

export async function POST(req: Request) {
  return withApiAuth(req, (ctx) => createTrack(req, ctx));
}
