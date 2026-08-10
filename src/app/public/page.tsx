import { redirect } from "next/navigation";

import { publicPath } from "@/lib/aliases";

export const dynamic = "force-dynamic";

export default function Page() {
  redirect(publicPath(""));
}
