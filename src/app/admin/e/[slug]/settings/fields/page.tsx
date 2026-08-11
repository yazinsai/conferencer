import { requireOrganizer } from "@/lib/guards";
import { listFields } from "@/lib/repo/forms";
import {
  createFieldAction,
  deleteFieldAction,
  updateFieldAction,
} from "@/server/settings-actions";
import {
  Button,
  Card,
  CardHeader,
  Chip,
  Field,
  Input,
  LinkButton,
  PageHeader,
  Select,
  Table,
  Td,
  Textarea,
  Th,
} from "@/components/ui";
import { ConfirmSubmit } from "@/components/client/basics";
import {
  FIELD_TYPES,
  FIELD_TYPE_LABELS,
  isChoiceType,
  optionsToText,
  parseOptions,
} from "@/lib/fields";

export const dynamic = "force-dynamic";

export default async function FieldsPage({ params }: PageProps<"/admin/e/[slug]/settings/fields">) {
  const { slug } = await params;
  const { event } = await requireOrganizer(slug);
  const session = listFields(event.id, "session");
  const contact = listFields(event.id, "contact");

  return (
    <div className="max-w-5xl">
      <PageHeader
        title="Fields"
        description="The reusable field library. Anything you create here is immediately available in every form builder and list view."
        actions={<LinkButton href={`/admin/e/${slug}/settings`}>Back to settings</LinkButton>}
      />

      <Card className="mb-6">
        <CardHeader title="Create a custom field" />
        <form action={createFieldAction} className="grid gap-4 p-4 sm:grid-cols-2">
          <input type="hidden" name="slug" value={slug} />
          <Field label="Label" name="label" required>
            <Input id="label" name="label" required placeholder="e.g. Key takeaway" />
          </Field>
          <Field label="Applies to" name="scope">
            <Select id="scope" name="scope" defaultValue="session">
              <option value="session">Session / abstract</option>
              <option value="contact">Person / speaker</option>
            </Select>
          </Field>
          <Field label="Type" name="type">
            <Select id="type" name="type" defaultValue="text">
              {FIELD_TYPES.map((type) => (
                <option key={type} value={type}>
                  {FIELD_TYPE_LABELS[type]}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Character limit" name="max_length" hint="Leave blank for no limit.">
            <Input id="max_length" name="max_length" type="number" min={1} />
          </Field>
          <Field
            label="Options"
            name="options"
            hint="One per line. For scored options use “Label | points”."
          >
            <Textarea id="options" name="options" rows={3} placeholder={"Beginner\nIntermediate\nAdvanced"} />
          </Field>
          <Field label="Help text" name="help_text">
            <Textarea id="help_text" name="help_text" rows={3} />
          </Field>
          <div className="sm:col-span-2">
            <Button type="submit" variant="primary">
              Create field
            </Button>
          </div>
        </form>
      </Card>

      {[
        { title: "Session fields", rows: session },
        { title: "Contact fields", rows: contact },
      ].map((group) => (
        <Card key={group.title} className="mb-6">
          <CardHeader title={group.title} description={`${group.rows.length} fields`} />
          <Table className="rounded-none border-0">
            <thead>
              <tr>
                <Th>Label</Th>
                <Th>Key</Th>
                <Th>Type</Th>
                <Th>Limit</Th>
                <Th>Options</Th>
                <Th />
              </tr>
            </thead>
            <tbody>
              {group.rows.map((field) => (
                <tr key={field.id}>
                  <Td className="font-medium text-slate-800">
                    {field.label}
                    {field.is_standard ? (
                      <Chip tone="slate" className="ml-2">
                        Standard
                      </Chip>
                    ) : null}
                  </Td>
                  <Td className="font-mono text-xs text-slate-500">{field.key}</Td>
                  <Td className="text-xs">{FIELD_TYPE_LABELS[field.type] ?? field.type}</Td>
                  <Td className="text-xs">{field.max_length ?? "—"}</Td>
                  <Td className="text-xs text-slate-500">
                    {isChoiceType(field.type)
                      ? parseOptions(field.options)
                          .map((o) => o.label)
                          .join(", ") || "—"
                      : "—"}
                  </Td>
                  <Td>
                    <details>
                      <summary className="cursor-pointer text-xs font-medium text-brand-700">
                        Edit
                      </summary>
                      <form action={updateFieldAction} className="mt-2 w-72 space-y-2">
                        <input type="hidden" name="slug" value={slug} />
                        <input type="hidden" name="id" value={field.id} />
                        <Input name="label" defaultValue={field.label} aria-label="Label" />
                        <Input
                          name="max_length"
                          type="number"
                          defaultValue={field.max_length ?? ""}
                          placeholder="Character limit"
                          aria-label="Character limit"
                        />
                        <Textarea
                          name="options"
                          rows={3}
                          defaultValue={optionsToText(parseOptions(field.options))}
                          placeholder="Options, one per line"
                          aria-label="Options"
                        />
                        <Textarea
                          name="help_text"
                          rows={2}
                          defaultValue={field.help_text ?? ""}
                          placeholder="Help text"
                          aria-label="Help text"
                        />
                        <div className="flex gap-2">
                          <Button type="submit" size="sm" variant="primary">
                            Save
                          </Button>
                        </div>
                      </form>
                      {!field.is_standard ? (
                        <form action={deleteFieldAction} className="mt-2">
                          <input type="hidden" name="slug" value={slug} />
                          <input type="hidden" name="id" value={field.id} />
                          <ConfirmSubmit message={`Delete the field "${field.label}"?`}>
                            Delete field
                          </ConfirmSubmit>
                        </form>
                      ) : null}
                    </details>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>
      ))}
    </div>
  );
}
