import Link from "next/link";

import { requireOrganizer } from "@/lib/guards";
import { get } from "@/lib/db";
import { formIsOpen, listForms } from "@/lib/repo/forms";
import {
  createFormAction,
  deleteFormAction,
  duplicateFormAction,
  setFormStatusAction,
} from "@/server/form-actions";
import {
  Button,
  Chip,
  Input,
  LinkButton,
  PageHeader,
  Select,
  SubNav,
  Table,
  Td,
  Th,
} from "@/components/ui";
import { ConfirmSubmit, CopyButton } from "@/components/client/basics";
import { formatDate } from "@/lib/datetime";

export const dynamic = "force-dynamic";

export default async function FormsPage({
  params,
  searchParams,
}: PageProps<"/admin/e/[slug]/forms">) {
  const { slug } = await params;
  const sp = await searchParams;
  const { event } = await requireOrganizer(slug);
  const tab = typeof sp.tab === "string" ? sp.tab : "all";
  const base = `/admin/e/${slug}/forms`;

  const forms = listForms(event.id).filter((form) => {
    if (tab === "open") return formIsOpen(form);
    if (tab === "closed") return !formIsOpen(form);
    return true;
  });

  const counts = listForms(event.id).reduce(
    (acc, form) => {
      acc.all += 1;
      if (formIsOpen(form)) acc.open += 1;
      else acc.closed += 1;
      return acc;
    },
    { all: 0, open: 0, closed: 0 },
  );

  return (
    <div>
      <PageHeader
        title="Submission forms"
        description="Build the call for speakers. Each form has its own public URL, questions, deadline and notifications."
      />

      <SubNav
        current={tab === "all" ? base : `${base}?tab=${tab}`}
        items={[
          { href: base, label: "All", count: counts.all },
          { href: `${base}?tab=open`, label: "Open", count: counts.open },
          { href: `${base}?tab=closed`, label: "Closed", count: counts.closed },
        ]}
      />

      <form
        action={createFormAction}
        className="mb-5 flex flex-wrap items-end gap-x-3 gap-y-2 rounded-card border border-rule bg-paper-2 px-3 py-2.5"
      >
        <input type="hidden" name="slug" value={slug} />
        <div className="min-w-0">
          <label htmlFor="form-name" className="block text-xs font-medium text-muted-foreground">
            Internal name
          </label>
          <Input
            id="form-name"
            name="name"
            placeholder="2027 Call for Speakers"
            className="w-64 bg-paper"
            required
          />
        </div>
        <div>
          <label htmlFor="form-collects" className="block text-xs font-medium text-muted-foreground">
            Collects
          </label>
          <Select id="form-collects" name="collects" defaultValue="abstracts" className="w-40 bg-paper">
            <option value="abstracts">Abstracts</option>
            <option value="sessions">Sessions</option>
          </Select>
        </div>
        <Button type="submit" variant="primary" size="sm">
          Create form
        </Button>
      </form>

      <Table>
        <thead>
          <tr>
            <Th>Form</Th>
            <Th>State</Th>
            <Th>Collects</Th>
            <Th>Submissions</Th>
            <Th>Drafts</Th>
            <Th>Closes</Th>
            <Th>Public link</Th>
            <Th>Actions</Th>
          </tr>
        </thead>
        <tbody>
          {forms.map((form) => {
            const submissions =
              get<{ n: number }>(
                "SELECT COUNT(*) AS n FROM submissions WHERE form_id = ? AND status != 'draft'",
                form.id,
              )?.n ?? 0;
            const drafts =
              get<{ n: number }>(
                "SELECT COUNT(*) AS n FROM submissions WHERE form_id = ? AND status = 'draft'",
                form.id,
              )?.n ?? 0;
            const publicUrl = `/e/${event.slug}/submit/${form.id}`;
            const open = formIsOpen(form);
            return (
              <tr key={form.id}>
                <Td>
                  <Link
                    href={`${base}/${form.id}?step=1`}
                    className="font-medium text-ink hover:underline"
                  >
                    {form.name}
                  </Link>
                  <p className="text-xs text-muted-foreground">{form.title}</p>
                </Td>
                <Td>
                  <form action={setFormStatusAction} className="flex items-center gap-2">
                    <input type="hidden" name="slug" value={slug} />
                    <input type="hidden" name="id" value={form.id} />
                    <input type="hidden" name="status" value={open ? "closed" : "open"} />
                    <Chip tone={open ? "green" : "slate"}>{open ? "Open" : "Closed"}</Chip>
                    <Button type="submit" size="sm" variant="secondary">
                      {open ? "Close form" : "Reopen form"}
                    </Button>
                  </form>
                </Td>
                <Td className="capitalize">{form.collects}</Td>
                <Td className="tnum">{submissions}</Td>
                <Td className="tnum">{drafts}</Td>
                <Td className="text-xs text-muted-foreground">
                  {form.closes_at ? formatDate(form.closes_at) : "No close date"}
                </Td>
                <Td>
                  <div className="flex items-center gap-2">
                    <a
                      href={publicUrl}
                      className="text-xs font-medium text-neutral underline underline-offset-2 hover:text-ink"
                    >
                      View form
                    </a>
                    <CopyButton value={publicUrl} label="Copy link" />
                  </div>
                </Td>
                <Td>
                  <div className="flex items-center gap-1 border-l border-rule pl-3">
                    <form action={duplicateFormAction}>
                      <input type="hidden" name="slug" value={slug} />
                      <input type="hidden" name="id" value={form.id} />
                      <Button type="submit" size="sm" variant="ghost">
                        Duplicate
                      </Button>
                    </form>
                    <form action={deleteFormAction}>
                      <input type="hidden" name="slug" value={slug} />
                      <input type="hidden" name="id" value={form.id} />
                      <ConfirmSubmit
                        message={`Delete "${form.name}"? Submissions stay, but the form is gone.`}
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
          {!forms.length ? (
            <tr>
              <Td colSpan={8} className="py-8 text-center text-muted-foreground">
                No forms in this view.{" "}
                <LinkButton href={base} size="sm">
                  Show all
                </LinkButton>
              </Td>
            </tr>
          ) : null}
        </tbody>
      </Table>
    </div>
  );
}
