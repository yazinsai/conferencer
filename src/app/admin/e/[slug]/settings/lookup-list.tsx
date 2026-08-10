import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  createLookupAction,
  deleteLookupAction,
  moveLookupAction,
  updateLookupAction,
} from "./actions";

type LookupItem = {
  id: string;
  name: string;
  color: string;
  sortOrder: number;
};

export function LookupList({
  slug,
  kind,
  title,
  subtitle,
  items,
}: {
  slug: string;
  kind: "tracks" | "formats" | "rooms";
  title: string;
  subtitle: string;
  items: LookupItem[];
}) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader title={`Add ${title.slice(0, -1)}`} />
        <CardBody>
          <form action={createLookupAction} className="flex flex-wrap items-end gap-3">
            <input type="hidden" name="slug" value={slug} />
            <input type="hidden" name="kind" value={kind} />
            <label className="text-sm">
              Name
              <Input name="name" required className="mt-1 w-56" placeholder="Name" />
            </label>
            <label className="text-sm">
              Color
              <Input name="color" type="color" defaultValue="#2563eb" className="mt-1 h-10 w-16 p-1" />
            </label>
            <Button type="submit">Add</Button>
          </form>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title={title} subtitle={subtitle} />
        <CardBody className="space-y-3 p-0">
          {items.length === 0 ? (
            <p className="px-5 py-4 text-sm text-slate-600">No items yet. Add one above.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {items.map((item, index) => (
                <li key={item.id} className="flex flex-wrap items-center gap-3 px-5 py-3">
                  <span
                    className="h-4 w-4 shrink-0 rounded-full ring-1 ring-slate-200"
                    style={{ backgroundColor: item.color }}
                  />
                  <form action={updateLookupAction} className="flex flex-1 flex-wrap items-center gap-2">
                    <input type="hidden" name="slug" value={slug} />
                    <input type="hidden" name="kind" value={kind} />
                    <input type="hidden" name="itemId" value={item.id} />
                    <Input name="name" defaultValue={item.name} className="max-w-xs" />
                    <Input name="color" type="color" defaultValue={item.color} className="h-10 w-16 p-1" />
                    <Button type="submit" variant="secondary">
                      Save
                    </Button>
                  </form>
                  <div className="flex gap-1">
                    <form action={moveLookupAction}>
                      <input type="hidden" name="slug" value={slug} />
                      <input type="hidden" name="kind" value={kind} />
                      <input type="hidden" name="itemId" value={item.id} />
                      <input type="hidden" name="direction" value="up" />
                      <Button type="submit" variant="ghost" disabled={index === 0}>
                        ↑
                      </Button>
                    </form>
                    <form action={moveLookupAction}>
                      <input type="hidden" name="slug" value={slug} />
                      <input type="hidden" name="kind" value={kind} />
                      <input type="hidden" name="itemId" value={item.id} />
                      <input type="hidden" name="direction" value="down" />
                      <Button type="submit" variant="ghost" disabled={index === items.length - 1}>
                        ↓
                      </Button>
                    </form>
                    <form action={deleteLookupAction}>
                      <input type="hidden" name="slug" value={slug} />
                      <input type="hidden" name="kind" value={kind} />
                      <input type="hidden" name="itemId" value={item.id} />
                      <Button type="submit" variant="danger">
                        Delete
                      </Button>
                    </form>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
