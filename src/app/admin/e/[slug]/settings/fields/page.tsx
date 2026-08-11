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
  Field,
  Input,
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
        breadcrumb={<a href={`/admin/e/${slug}/settings`}>Settings</a>}
      />

      <Card className="mb-6">
        <CardHeader title="Create a custom field" />
        <form action={createFieldAction} className="space-y-5 p-4">
          <input type="hidden" name="slug" value={slug} />
          <div className="grid gap-4 sm:grid-cols-3">
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
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold text-ink">Field details</h3>
            <div className="grid gap-4 sm:grid-cols-3">
              <Field
                label="Character limit"
                name="max_length"
                hint="Applies to text types. Leave blank for no limit."
              >
                <Input id="max_length" name="max_length" type="number" min={1} />
              </Field>
              <Field
                label="Options"
                name="options"
                hint="For choice types. One per line; scored options use “Label | points”."
              >
                <Textarea
                  id="options"
                  name="options"
                  rows={3}
                  placeholder={"Beginner\nIntermediate\nAdvanced"}
                />
              </Field>
              <Field label="Help text" name="help_text" hint="Shown beneath the field on forms.">
                <Textarea id="help_text" name="help_text" rows={3} />
              </Field>
            </div>
          </div>

          <Button type="submit" variant="primary">
            Create field
          </Button>
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
                <Th className="text-right">Limit</Th>
                <Th>Options</Th>
                <Th className="w-28">Actions</Th>
              </tr>
            </thead>
            <tbody>
              {group.rows.map((field, index) => (
                <tr key={field.id} className={index % 2 === 1 ? "bg-paper-2/70" : undefined}>
                  <Td colSpan={6} className="!p-0">
                    <details className="group">
                      <summary className="grid cursor-pointer list-none grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,0.8fr)_minmax(0,0.5fr)_minmax(0,1.2fr)_7rem] items-center gap-2 border-b border-rule/70 px-3 py-2.5 outline-2 outline-offset-[-2px] outline-transparent marker:content-none hover:bg-paper-2 focus-visible:outline-ring [&::-webkit-details-marker]:hidden">
                        <span>
                          <span className="font-medium text-ink">{field.label}</span>
                          {field.is_standard ? (
                            <span className="ml-2 text-xs text-muted-foreground">Standard</span>
                          ) : null}
                        </span>
                        <span className="wordmark truncate text-xs text-muted-foreground">
                          {field.key}
                        </span>
                        <span className="truncate text-sm text-neutral">
                          {FIELD_TYPE_LABELS[field.type] ?? field.type}
                        </span>
                        <span className="wordmark tnum text-right text-sm text-ink-2">
                          {field.max_length ?? "—"}
                        </span>
                        <span className="truncate text-xs text-muted-foreground">
                          {isChoiceType(field.type)
                            ? parseOptions(field.options)
                                .map((o) => o.label)
                                .join(", ") || "—"
                            : "—"}
                        </span>
                        <span className="inline-flex h-9 items-center justify-center rounded-pill border border-rule-2 bg-background px-3.5 text-sm font-medium text-ink group-open:bg-paper-3">
                          Edit
                        </span>
                      </summary>
                      <div className="border-b border-rule bg-paper-2 px-4 py-4">
                        <form
                          action={updateFieldAction}
                          className="grid gap-3 sm:grid-cols-2"
                          aria-label={`Edit ${field.label}`}
                        >
                          <input type="hidden" name="slug" value={slug} />
                          <input type="hidden" name="id" value={field.id} />
                          <Field label="Label" name={`label-${field.id}`}>
                            <Input
                              id={`label-${field.id}`}
                              name="label"
                              defaultValue={field.label}
                            />
                          </Field>
                          <Field label="Character limit" name={`max-${field.id}`}>
                            <Input
                              id={`max-${field.id}`}
                              name="max_length"
                              type="number"
                              defaultValue={field.max_length ?? ""}
                            />
                          </Field>
                          <Field label="Options" name={`options-${field.id}`}>
                            <Textarea
                              id={`options-${field.id}`}
                              name="options"
                              rows={3}
                              defaultValue={optionsToText(parseOptions(field.options))}
                            />
                          </Field>
                          <Field label="Help text" name={`help-${field.id}`}>
                            <Textarea
                              id={`help-${field.id}`}
                              name="help_text"
                              rows={3}
                              defaultValue={field.help_text ?? ""}
                            />
                          </Field>
                          <div className="sm:col-span-2">
                            <Button type="submit" size="sm" variant="primary">
                              Save
                            </Button>
                          </div>
                        </form>
                        {!field.is_standard ? (
                          <form action={deleteFieldAction} className="mt-3 border-t border-rule pt-3">
                            <input type="hidden" name="slug" value={slug} />
                            <input type="hidden" name="id" value={field.id} />
                            <ConfirmSubmit message={`Delete the field "${field.label}"?`}>
                              Delete field
                            </ConfirmSubmit>
                          </form>
                        ) : null}
                      </div>
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
