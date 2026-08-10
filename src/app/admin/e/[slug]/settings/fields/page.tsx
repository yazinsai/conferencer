import { eq } from "drizzle-orm";
import { requireEventRole } from "@/lib/auth/guards";
import { getDb, schema } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { createCustomFieldAction } from "../actions";
import { SettingsNav } from "../settings-nav";

export default async function FieldsSettingsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { event } = await requireEventRole(slug, ["organizer"]);
  const db = getDb();
  const fields = db
    .select()
    .from(schema.fields)
    .where(eq(schema.fields.eventId, event.id))
    .all();

  const standard = fields.filter((f) => f.isStandard);
  const custom = fields.filter((f) => !f.isStandard);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Fields</h1>
        <p className="text-slate-600">
          Standard form fields and custom fields for submissions and contacts.
        </p>
      </div>
      <SettingsNav slug={slug} active="/fields" />

      <Card>
        <CardHeader title="Create custom field" />
        <CardBody>
          <form action={createCustomFieldAction} className="grid gap-4 md:grid-cols-2">
            <input type="hidden" name="slug" value={slug} />
            <label className="text-sm">
              Scope
              <Select name="scope" defaultValue="session" className="mt-1">
                <option value="session">Session</option>
                <option value="contact">Contact</option>
              </Select>
            </label>
            <label className="text-sm">
              Type
              <Select name="type" defaultValue="text" className="mt-1">
                <option value="text">Text</option>
                <option value="textarea">Textarea</option>
                <option value="email">Email</option>
                <option value="dropdown">Dropdown</option>
                <option value="checkbox">Checkbox</option>
                <option value="number">Number</option>
              </Select>
            </label>
            <label className="text-sm md:col-span-2">
              Label
              <Input name="label" required className="mt-1" placeholder="Field label" />
            </label>
            <label className="text-sm md:col-span-2">
              Options (JSON array or comma-separated)
              <Textarea
                name="options"
                rows={2}
                className="mt-1 font-mono text-xs"
                placeholder='["Option A", "Option B"]'
              />
            </label>
            <label className="text-sm">
              Max length
              <Input name="maxLength" type="number" min={1} className="mt-1" />
            </label>
            <div className="flex items-end">
              <Button type="submit">Add custom field</Button>
            </div>
          </form>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Standard fields" subtitle={`${standard.length} built-in`} />
        <CardBody className="overflow-x-auto p-0">
          <FieldTable fields={standard} />
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Custom fields" subtitle={`${custom.length} defined`} />
        <CardBody className="overflow-x-auto p-0">
          {custom.length === 0 ? (
            <p className="px-5 py-4 text-sm text-slate-600">No custom fields yet.</p>
          ) : (
            <FieldTable fields={custom} />
          )}
        </CardBody>
      </Card>
    </div>
  );
}

function FieldTable({
  fields,
}: {
  fields: Array<typeof schema.fields.$inferSelect>;
}) {
  return (
    <table className="min-w-full text-sm">
      <thead className="bg-slate-50 text-xs uppercase text-slate-500">
        <tr>
          <th className="px-4 py-2 text-left">Label</th>
          <th className="px-4 py-2 text-left">Key</th>
          <th className="px-4 py-2 text-left">Scope</th>
          <th className="px-4 py-2 text-left">Type</th>
          <th className="px-4 py-2 text-left">Options</th>
          <th className="px-4 py-2 text-left">Max length</th>
        </tr>
      </thead>
      <tbody>
        {fields.map((f) => (
          <tr key={f.id} className="border-t">
            <td className="px-4 py-2 font-medium">{f.label}</td>
            <td className="px-4 py-2 font-mono text-xs text-slate-600">{f.key}</td>
            <td className="px-4 py-2 capitalize">{f.scope}</td>
            <td className="px-4 py-2">{f.type}</td>
            <td className="px-4 py-2 max-w-xs truncate font-mono text-xs text-slate-600">
              {f.options ?? "[]"}
            </td>
            <td className="px-4 py-2">{f.maxLength ?? "—"}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
