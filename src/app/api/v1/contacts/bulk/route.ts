import { withApiAuth } from "@/lib/api/route";
import { bulkUpsertContacts } from "@/lib/api/handlers";

export async function POST(req: Request) {
  return withApiAuth(req, (ctx) => bulkUpsertContacts(req, ctx));
}
