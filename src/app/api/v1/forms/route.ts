import { withApiAuth } from "@/lib/api/route";
import { getForm, listForms } from "@/lib/api/handlers";

export async function GET(req: Request) {
  return withApiAuth(req, (ctx) => listForms(req, ctx));
}
