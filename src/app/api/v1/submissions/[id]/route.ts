import { withApiAuth } from "@/lib/api/route";
import { getSubmission, patchSubmission } from "@/lib/api/handlers";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  return withApiAuth(req, (ctx) => getSubmission(id, ctx));
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  return withApiAuth(req, (ctx) => patchSubmission(id, req, ctx));
}
