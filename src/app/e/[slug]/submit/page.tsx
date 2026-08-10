import { notFound, redirect } from "next/navigation";

import { eventBySlugOr404 } from "@/lib/guards";
import { defaultForm } from "@/lib/repo/forms";

export const dynamic = "force-dynamic";

export default async function SubmitIndex({ params }: PageProps<"/e/[slug]/submit">) {
  const { slug } = await params;
  const event = eventBySlugOr404(slug);
  const form = defaultForm(event.id);
  if (!form) notFound();
  redirect(`/e/${event.slug}/submit/${form.id}`);
}
