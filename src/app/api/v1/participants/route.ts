import { withApiAuth } from "@/lib/api/route";
import { getParticipant, listParticipants } from "@/lib/api/handlers";

export async function GET(req: Request) {
  return withApiAuth(req, (ctx) => listParticipants(req, ctx));
}
