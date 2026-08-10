import {
  Button,
  Card,
  CardHeader,
  Dot,
  Input,
  Table,
  Td,
  Th,
} from "@/components/ui";
import { ConfirmSubmit } from "@/components/client/basics";
import { lookupUsage, type Lookup, type LookupTable } from "@/lib/repo/events";
import {
  createLookupAction,
  deleteLookupAction,
  updateLookupAction,
} from "@/server/settings-actions";

export function LookupEditor({
  slug,
  table,
  title,
  description,
  rows,
  extra,
}: {
  slug: string;
  table: LookupTable;
  title: string;
  description: string;
  rows: Lookup[];
  extra?: "duration" | "capacity";
}) {
  return (
    <Card>
      <CardHeader title={title} description={description} />
      <Table className="rounded-none border-0">
        <thead>
          <tr>
            <Th className="w-8" />
            <Th>Name</Th>
            <Th className="w-28">Colour</Th>
            {extra === "duration" ? <Th className="w-28">Minutes</Th> : null}
            {extra === "capacity" ? <Th className="w-28">Capacity</Th> : null}
            <Th className="w-20">Order</Th>
            <Th className="w-32" />
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const usage = lookupUsage(table, row.id);
            return (
            <tr key={row.id}>
              <Td>
                <Dot color={row.color} />
              </Td>
              <Td colSpan={extra ? 4 : 3}>
                <form action={updateLookupAction} className="flex flex-wrap items-center gap-2">
                  <input type="hidden" name="slug" value={slug} />
                  <input type="hidden" name="table" value={table} />
                  <input type="hidden" name="id" value={row.id} />
                  <Input name="name" defaultValue={row.name} className="w-56" aria-label="Name" />
                  <Input
                    name="color"
                    type="color"
                    defaultValue={row.color}
                    className="h-9 w-14 p-1"
                    aria-label="Colour"
                  />
                  {extra === "duration" ? (
                    <Input
                      name="duration_minutes"
                      type="number"
                      defaultValue={row.duration_minutes ?? ""}
                      className="w-24"
                      aria-label="Duration in minutes"
                    />
                  ) : null}
                  {extra === "capacity" ? (
                    <Input
                      name="capacity"
                      type="number"
                      defaultValue={row.capacity ?? ""}
                      className="w-24"
                      aria-label="Capacity"
                    />
                  ) : null}
                  <Input
                    name="sort_order"
                    type="number"
                    defaultValue={row.sort_order}
                    className="w-20"
                    aria-label="Sort order"
                  />
                  <Button type="submit" size="sm">
                    Save
                  </Button>
                </form>
              </Td>
              <Td>
                <form action={deleteLookupAction}>
                  <input type="hidden" name="slug" value={slug} />
                  <input type="hidden" name="table" value={table} />
                  <input type="hidden" name="id" value={row.id} />
                  <ConfirmSubmit
                    size="sm"
                    message={
                      usage
                        ? `Delete "${row.name}"? ${usage} submission${
                            usage === 1 ? "" : "s"
                          } currently use it and will be left without one. This cannot be undone.`
                        : `Delete "${row.name}"? Nothing is using it, so this is safe.`
                    }
                    variant="ghost"
                  >
                    Delete
                  </ConfirmSubmit>
                </form>
              </Td>
            </tr>
            );
          })}
          {!rows.length ? (
            <tr>
              <Td colSpan={6} className="py-6 text-center text-slate-500">
                Nothing here yet — add the first one below.
              </Td>
            </tr>
          ) : null}
        </tbody>
      </Table>
      <form
        action={createLookupAction}
        className="flex flex-wrap items-end gap-2 border-t border-slate-200 p-4"
      >
        <input type="hidden" name="slug" value={slug} />
        <input type="hidden" name="table" value={table} />
        <div>
          <label htmlFor={`new-${table}`} className="block text-xs font-medium text-slate-600">
            Add new
          </label>
          <Input id={`new-${table}`} name="name" placeholder="Name" className="w-56" required />
        </div>
        <Input name="color" type="color" defaultValue="#4f46e5" className="h-9 w-14 p-1" aria-label="Colour" />
        {extra === "duration" ? (
          <Input
            name="duration_minutes"
            type="number"
            placeholder="Minutes"
            className="w-28"
            aria-label="Duration in minutes"
          />
        ) : null}
        {extra === "capacity" ? (
          <Input
            name="capacity"
            type="number"
            placeholder="Capacity"
            className="w-28"
            aria-label="Capacity"
          />
        ) : null}
        <Button type="submit" variant="primary">
          Add
        </Button>
      </form>
    </Card>
  );
}
