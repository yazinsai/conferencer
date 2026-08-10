"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requireEventRole } from "@/lib/auth/guards";
import { getDb, schema } from "@/lib/db";

function revalidateTemplates(slug: string) {
  revalidatePath(`/admin/e/${slug}/settings/templates`);
}

export async function saveEmailTemplateAction(formData: FormData) {
  const slug = String(formData.get("slug") || "");
  const templateId = String(formData.get("templateId") || "");
  const { event } = await requireEventRole(slug, ["organizer"]);
  const db = getDb();

  const subject = String(formData.get("subject") || "").trim();
  const bodyHtml = String(formData.get("bodyHtml") || "").trim();
  const isEnabled = formData.get("isEnabled") === "on";

  if (!subject || !bodyHtml) throw new Error("Subject and body are required");

  db.update(schema.emailTemplates)
    .set({ subject, bodyHtml, isEnabled })
    .where(
      and(
        eq(schema.emailTemplates.id, templateId),
        eq(schema.emailTemplates.eventId, event.id),
      ),
    )
    .run();

  revalidateTemplates(slug);
}
