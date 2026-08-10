import { withApiAuth } from "@/lib/api/route";
import { createRoom, listRooms } from "@/lib/api/handlers";

export async function GET(req: Request) {
  return withApiAuth(req, (ctx) => listRooms(req, ctx));
}

export async function POST(req: Request) {
  return withApiAuth(req, (ctx) => createRoom(req, ctx));
}
