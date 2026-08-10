import { asc, eq } from "drizzle-orm";
import { requireEventRole } from "@/lib/auth/guards";
import { getDb, schema } from "@/lib/db";
import { seedEmailTemplatesForEvent } from "@/lib/email/templates";
import { SettingsNav } from "../settings-nav";
import { EmailTemplateEditor } from "./template-editor";

export default async function EmailTemplatesSettingsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { event } = await requireEventRole(slug, ["organizer"]);
  const db = getDb();

  seedEmailTemplatesForEvent(db, event.id);

  const templates = db
    .select({
      id: schema.emailTemplates.id,
      key: schema.emailTemplates.key,
      subject: schema.emailTemplates.subject,
      bodyHtml: schema.emailTemplates.bodyHtml,
      isEnabled: schema.emailTemplates.isEnabled,
    })
    .from(schema.emailTemplates)
    .where(eq(schema.emailTemplates.eventId, event.id))
    .orderBy(asc(schema.emailTemplates.key))
    .all();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Email templates</h1>
        <p className="text-slate-600">
          Customize transactional emails sent from this event. Use merge fields for personalization.
        </p>
      </div>

      <SettingsNav slug={slug} active="/templates" />

      <EmailTemplateEditor slug={slug} eventName={event.name} templates={templates} />
    </div>
  );
}
