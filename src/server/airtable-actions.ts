"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireOrganizer } from "@/lib/guards";
import { pullFromAirtable, pushToAirtable } from "@/lib/airtable";

export async function pushAirtableAction(formData: FormData) {
  const slug = String(formData.get("slug"));
  const { event } = await requireOrganizer(slug);
  try {
    const result = await pushToAirtable(event);
    redirect(
      `/admin/e/${slug}/settings/airtable?pushed=${result.submissions}&speakers=${result.speakers}`,
    );
  } catch (error) {
    if (error instanceof Error && error.message.includes("NEXT_REDIRECT")) throw error;
    redirect(
      `/admin/e/${slug}/settings/airtable?error=${encodeURIComponent(
        error instanceof Error ? error.message : "Airtable push failed",
      )}`,
    );
  }
}

export async function pullAirtableAction(formData: FormData) {
  const slug = String(formData.get("slug"));
  const { event } = await requireOrganizer(slug);
  try {
    const result = await pullFromAirtable(event);
    revalidatePath(`/admin/e/${slug}`, "layout");
    redirect(
      `/admin/e/${slug}/settings/airtable?pulled=${result.submissions}&speakers=${result.speakers}`,
    );
  } catch (error) {
    if (error instanceof Error && error.message.includes("NEXT_REDIRECT")) throw error;
    redirect(
      `/admin/e/${slug}/settings/airtable?error=${encodeURIComponent(
        error instanceof Error ? error.message : "Airtable pull failed",
      )}`,
    );
  }
}
