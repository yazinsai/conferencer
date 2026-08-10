import { withApiAuth } from "@/lib/api/route";
import { deleteTrack, getTrack, patchTrack } from "@/lib/api/handlers";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  return withApiAuth(req, (ctx) => getTrack(id, ctx));
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  return withApiAuth(req, (ctx) => patchTrack(id, req, ctx));
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  return withApiAuth(req, (ctx) => deleteTrack(id, ctx));
}
