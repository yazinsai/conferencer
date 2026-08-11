import { redirect } from "next/navigation";

import { adminPath } from "@/lib/aliases";

export const dynamic = "force-dynamic";

export default function Page() {
  redirect(adminPath("/tasks/deliverables"));
}
