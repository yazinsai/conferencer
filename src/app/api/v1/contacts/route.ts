import { withApiAuth } from "@/lib/api/route";
import { createContact, listContacts } from "@/lib/api/handlers";

export async function GET(req: Request) {
  return withApiAuth(req, (ctx) => listContacts(req, ctx));
}

export async function POST(req: Request) {
  return withApiAuth(req, (ctx) => createContact(req, ctx));
}
