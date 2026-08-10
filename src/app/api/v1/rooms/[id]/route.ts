import { withApiAuth } from "@/lib/api/route";
import { deleteRoom, getRoom, patchRoom } from "@/lib/api/handlers";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  return withApiAuth(req, (ctx) => getRoom(id, ctx));
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  return withApiAuth(req, (ctx) => patchRoom(id, req, ctx));
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  return withApiAuth(req, (ctx) => deleteRoom(id, ctx));
}
