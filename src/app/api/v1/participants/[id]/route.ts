import { withApiAuth } from "@/lib/api/route";
import { getParticipant } from "@/lib/api/handlers";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  return withApiAuth(req, (ctx) => getParticipant(id, ctx));
}
