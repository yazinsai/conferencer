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
  /** Compact utility label, or false to omit the card header when PageHeader already introduces the page. */
  cardHeader = "default",
}: {
  slug: string;
  table: LookupTable;
  title: string;
  description: string;
  rows: Lookup[];
  extra?: "duration" | "capacity";
  cardHeader?: "default" | "compact" | false | string;
}) {
  const colCount = 3 + (extra ? 1 : 0) + 1; // name, colour, [extra], order, actions
  const regionLabel =
    typeof cardHeader === "string" && cardHeader !== "default" && cardHeader !== "compact"
      ? cardHeader
      : title;

  return (
    <Card aria-label={regionLabel}>
      {cardHeader === false ? null : cardHeader === "compact" ||
        (typeof cardHeader === "string" && cardHeader !== "default") ? (
        <CardHeader
          title={
            typeof cardHeader === "string" && cardHeader !== "compact"
              ? cardHeader
              : `Manage ${title.toLowerCase()}`
          }
        />
      ) : (
        <CardHeader title={title} description={description} />
      )}
      <Table className="rounded-none border-0">
        <thead>
          <tr>
            <Th>Name</Th>
            <Th className="w-28">Colour</Th>
            {extra === "duration" ? (
              <Th className="w-28">
                Minutes
                <span className="mt-0.5 block normal-case tracking-normal text-muted-foreground font-normal">
                  Agenda default
                </span>
              </Th>
            ) : null}
            {extra === "capacity" ? (
              <Th className="w-28">
                Capacity
                <span className="mt-0.5 block normal-case tracking-normal text-muted-foreground font-normal">
                  people
                </span>
              </Th>
            ) : null}
            <Th className="w-20 text-right">Order</Th>
            <Th className="w-40">Actions</Th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const usage = lookupUsage(table, row.id);
            const formId = `lookup-update-${table}-${row.id}`;
            return (
              <tr key={row.id}>
                <Td>
                  <form id={formId} action={updateLookupAction} className="hidden">
                    <input type="hidden" name="slug" value={slug} />
                    <input type="hidden" name="table" value={table} />
                    <input type="hidden" name="id" value={row.id} />
                  </form>
                  <Input
                    form={formId}
                    name="name"
                    defaultValue={row.name}
                    className="w-full min-w-[10rem] max-w-xs"
                    aria-label="Name"
                  />
                </Td>
                <Td>
                  <div className="flex items-center gap-2">
                    <Dot color={row.color} />
                    <Input
                      form={formId}
                      name="color"
                      type="color"
                      defaultValue={row.color}
                      className="h-9 w-14 p-1"
                      aria-label="Colour"
                    />
                  </div>
                </Td>
                {extra === "duration" ? (
                  <Td>
                    <Input
                      form={formId}
                      name="duration_minutes"
                      type="number"
                      defaultValue={row.duration_minutes ?? ""}
                      className="w-full max-w-[6.5rem] text-right wordmark tnum"
                      aria-label="Duration in minutes"
                    />
                  </Td>
                ) : null}
                {extra === "capacity" ? (
                  <Td>
                    <Input
                      form={formId}
                      name="capacity"
                      type="number"
                      defaultValue={row.capacity ?? ""}
                      className="w-full max-w-[6.5rem] text-right wordmark tnum"
                      aria-label="Capacity"
                    />
                  </Td>
                ) : null}
                <Td>
                  <Input
                    form={formId}
                    name="sort_order"
                    type="number"
                    defaultValue={row.sort_order}
                    className="w-full max-w-[5rem] text-right wordmark tnum"
                    aria-label="Sort order"
                  />
                </Td>
                <Td>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <Button form={formId} type="submit" size="sm">
                      Save
                    </Button>
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
                        variant="danger"
                      >
                        Delete
                      </ConfirmSubmit>
                    </form>
                  </div>
                </Td>
              </tr>
            );
          })}
          {!rows.length ? (
            <tr>
              <Td colSpan={colCount} className="py-6 text-center text-muted-foreground">
                Nothing here yet — add the first one below.
              </Td>
            </tr>
          ) : null}
        </tbody>
      </Table>
      <form
        action={createLookupAction}
        className="border-t border-rule p-4"
        aria-label={`Add new ${title.toLowerCase()}`}
      >
        <input type="hidden" name="slug" value={slug} />
        <input type="hidden" name="table" value={table} />
        <div
          className={
            extra
              ? "grid gap-3 sm:grid-cols-[minmax(0,1.4fr)_auto_minmax(0,7rem)_minmax(0,5rem)_auto] sm:items-end"
              : "grid gap-3 sm:grid-cols-[minmax(0,1.4fr)_auto_minmax(0,5rem)_auto] sm:items-end"
          }
        >
          <div className="min-w-0">
            <label htmlFor={`new-${table}-name`} className="mb-1.5 block text-[0.8125rem] font-medium text-ink-2">
              Name
            </label>
            <Input id={`new-${table}-name`} name="name" placeholder="Name" className="w-full" required />
          </div>
          <div>
            <label htmlFor={`new-${table}-color`} className="mb-1.5 block text-[0.8125rem] font-medium text-ink-2">
              Colour
            </label>
            <Input
              id={`new-${table}-color`}
              name="color"
              type="color"
              defaultValue="#4f46e5"
              className="h-9 w-14 p-1"
            />
          </div>
          {extra === "duration" ? (
            <div>
              <label
                htmlFor={`new-${table}-minutes`}
                className="mb-1.5 block text-[0.8125rem] font-medium text-ink-2"
              >
                Minutes
              </label>
              <Input
                id={`new-${table}-minutes`}
                name="duration_minutes"
                type="number"
                className="w-full text-right wordmark tnum"
                aria-describedby={`new-${table}-minutes-hint`}
              />
              <p id={`new-${table}-minutes-hint`} className="mt-1 text-xs text-muted-foreground">
                Default agenda length
              </p>
            </div>
          ) : null}
          {extra === "capacity" ? (
            <div>
              <label
                htmlFor={`new-${table}-capacity`}
                className="mb-1.5 block text-[0.8125rem] font-medium text-ink-2"
              >
                Capacity
              </label>
              <Input
                id={`new-${table}-capacity`}
                name="capacity"
                type="number"
                className="w-full text-right wordmark tnum"
                aria-describedby={`new-${table}-capacity-hint`}
              />
              <p id={`new-${table}-capacity-hint`} className="mt-1 text-xs text-muted-foreground">
                people
              </p>
            </div>
          ) : null}
          <div className="hidden sm:block">
            <span className="mb-1.5 block text-[0.8125rem] font-medium text-ink-2">Order</span>
            <p className="flex h-9 items-center text-xs text-muted-foreground">Added last</p>
          </div>
          <div className="sm:justify-self-end">
            <Button type="submit" variant="primary" className="w-full sm:w-auto">
              Add
            </Button>
          </div>
        </div>
      </form>
    </Card>
  );
}
