"use client";

import Link from "next/link";
import { Fragment, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { addFileCommentAction } from "./actions";

type UploadRow = {
  upload: {
    id: string;
    filename: string;
    version: number;
    createdAt: string;
    storageKey: string;
    contactId: string | null;
  };
  contact: { firstName: string; lastName: string } | null;
  task: { id: string; name: string } | null;
  comments: Array<{
    id: string;
    body: string;
    createdAt: string;
    authorFirstName: string;
    authorLastName: string;
  }>;
};

export function FilesLibrary({
  slug,
  rows,
  tasks,
}: {
  slug: string;
  rows: UploadRow[];
  tasks: Array<{ id: string; name: string }>;
}) {
  const [query, setQuery] = useState("");
  const [taskFilter, setTaskFilter] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((row) => {
      if (taskFilter && row.task?.id !== taskFilter) return false;
      if (!q) return true;
      const speaker = row.contact
        ? `${row.contact.firstName} ${row.contact.lastName}`.toLowerCase()
        : "";
      return (
        row.upload.filename.toLowerCase().includes(q) ||
        speaker.includes(q) ||
        (row.task?.name.toLowerCase().includes(q) ?? false)
      );
    });
  }, [rows, query, taskFilter]);

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    if (selected.size === filtered.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map((r) => r.upload.id)));
    }
  }

  const zipBase = `/admin/e/${slug}/files/zip`;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <label className="text-sm">
          Search
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="File, speaker, or task…"
            className="mt-1 w-64"
          />
        </label>
        <label className="text-sm">
          Task
          <Select
            value={taskFilter}
            onChange={(e) => setTaskFilter(e.target.value)}
            className="mt-1 w-48"
          >
            <option value="">All tasks</option>
            {tasks.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </Select>
        </label>
        <div className="flex flex-wrap gap-2">
          <Link href={`${zipBase}?mode=latest`}>
            <Button type="button" variant="secondary">
              Download latest ZIP
            </Button>
          </Link>
          {selected.size > 0 ? (
            <Link href={`${zipBase}?ids=${Array.from(selected).join(",")}`}>
              <Button type="button">Download selected ({selected.size})</Button>
            </Link>
          ) : (
            <Button type="button" disabled>
              Download selected (0)
            </Button>
          )}
        </div>
      </div>

      <Card>
        <CardHeader
          title={`${filtered.length} file${filtered.length === 1 ? "" : "s"}`}
          subtitle={rows.length !== filtered.length ? `Filtered from ${rows.length} total` : undefined}
        />
        <CardBody className="overflow-x-auto p-0">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-3 py-2 text-left">
                  <input
                    type="checkbox"
                    checked={filtered.length > 0 && selected.size === filtered.length}
                    onChange={toggleAll}
                    aria-label="Select all"
                  />
                </th>
                <th className="px-3 py-2 text-left">File</th>
                <th className="px-3 py-2 text-left">Speaker</th>
                <th className="px-3 py-2 text-left">Task</th>
                <th className="px-3 py-2 text-left">Version</th>
                <th className="px-3 py-2 text-left">Date</th>
                <th className="px-3 py-2 text-left">Comments</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => (
                <Fragment key={row.upload.id}>
                  <tr className="border-t">
                    <td className="px-3 py-2">
                      <input
                        type="checkbox"
                        checked={selected.has(row.upload.id)}
                        onChange={() => toggle(row.upload.id)}
                        aria-label={`Select ${row.upload.filename}`}
                      />
                    </td>
                    <td className="px-3 py-2">
                      <Link
                        href={`/api/files/${row.upload.storageKey}`}
                        className="text-blue-700 hover:underline"
                      >
                        {row.upload.filename}
                      </Link>
                    </td>
                    <td className="px-3 py-2">
                      {row.contact
                        ? `${row.contact.firstName} ${row.contact.lastName}`
                        : "—"}
                    </td>
                    <td className="px-3 py-2">{row.task?.name ?? "—"}</td>
                    <td className="px-3 py-2">v{row.upload.version}</td>
                    <td className="px-3 py-2">
                      {new Date(row.upload.createdAt).toLocaleString()}
                    </td>
                    <td className="px-3 py-2">
                      <button
                        type="button"
                        className="text-blue-700 hover:underline"
                        onClick={() =>
                          setExpanded(expanded === row.upload.id ? null : row.upload.id)
                        }
                      >
                        {row.comments.length} comment{row.comments.length === 1 ? "" : "s"}
                      </button>
                    </td>
                  </tr>
                  {expanded === row.upload.id ? (
                    <tr className="border-t bg-slate-50">
                      <td colSpan={7} className="px-4 py-4">
                        <div className="space-y-3">
                          {row.comments.length === 0 ? (
                            <p className="text-sm text-slate-500">No comments yet.</p>
                          ) : (
                            <ul className="space-y-2">
                              {row.comments.map((c) => (
                                <li
                                  key={c.id}
                                  className="rounded-md border border-slate-200 bg-white p-3 text-sm"
                                >
                                  <div className="text-xs text-slate-500">
                                    {c.authorFirstName} {c.authorLastName} ·{" "}
                                    {new Date(c.createdAt).toLocaleString()}
                                  </div>
                                  <p className="mt-1 whitespace-pre-wrap">{c.body}</p>
                                </li>
                              ))}
                            </ul>
                          )}
                          <form action={addFileCommentAction} className="space-y-2">
                            <input type="hidden" name="slug" value={slug} />
                            <input type="hidden" name="uploadId" value={row.upload.id} />
                            <Label htmlFor={`comment-${row.upload.id}`}>Add comment</Label>
                            <Textarea
                              id={`comment-${row.upload.id}`}
                              name="body"
                              rows={2}
                              required
                              placeholder="Note for organizers…"
                            />
                            <Button type="submit" variant="secondary">
                              Post comment
                            </Button>
                          </form>
                        </div>
                      </td>
                    </tr>
                  ) : null}
                </Fragment>
              ))}
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-3 py-6 text-center text-slate-500">
                    {rows.length === 0 ? "No uploads yet." : "No files match your filters."}
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </CardBody>
      </Card>
    </div>
  );
}
