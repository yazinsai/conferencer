"use client";

import { useEffect, useRef, useState } from "react";

import { Button, cx } from "@/components/ui";

function fileBoxes(form: HTMLFormElement) {
  return Array.from(
    form.querySelectorAll<HTMLInputElement>('input[type="checkbox"][name="ids"]'),
  );
}

function useFileSelection(total: number) {
  const [selected, setSelected] = useState(0);

  useEffect(() => {
    const form = document.getElementById("files-zip-form");
    if (!(form instanceof HTMLFormElement)) return;

    const sync = () => setSelected(fileBoxes(form).filter((box) => box.checked).length);
    form.addEventListener("change", sync);
    sync();
    return () => form.removeEventListener("change", sync);
  }, [total]);

  function setAll(checked: boolean) {
    const form = document.getElementById("files-zip-form");
    if (!(form instanceof HTMLFormElement)) return;
    for (const box of fileBoxes(form)) box.checked = checked;
    form.dispatchEvent(new Event("change", { bubbles: true }));
    setSelected(checked ? total : 0);
  }

  return { selected, setAll, allSelected: total > 0 && selected === total };
}

/** Toolbar: selected count, group-by, and selection-scoped ZIP submit. */
export function FileZipToolbar({ total }: { total: number }) {
  const { selected } = useFileSelection(total);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="tnum text-sm text-muted-foreground" role="status" aria-live="polite">
        <strong className="font-medium text-ink">{selected}</strong> selected
      </span>
      <label htmlFor="group" className="text-xs font-medium text-ink-2">
        Group ZIP by
      </label>
      <select
        id="group"
        name="group"
        className="rounded-input border border-field bg-paper px-2 py-1 text-xs text-ink"
        defaultValue="session"
      >
        <option value="session">Folder per session</option>
        <option value="speaker">Folder per speaker</option>
        <option value="flat">Flat</option>
      </select>
      <input type="hidden" name="scope" value="selected" />
      <Button type="submit" size="sm" variant="primary">
        Download selected
      </Button>
    </div>
  );
}

/** Header checkbox that selects or clears every file row. */
export function FileSelectAll({ total }: { total: number }) {
  const { selected, setAll, allSelected } = useFileSelection(total);
  const inputRef = useRef<HTMLInputElement>(null);
  const indeterminate = selected > 0 && selected < total;

  useEffect(() => {
    if (inputRef.current) inputRef.current.indeterminate = indeterminate;
  }, [indeterminate]);

  return (
    <input
      ref={inputRef}
      type="checkbox"
      aria-label="Select all files"
      checked={allSelected}
      onChange={(e) => setAll(e.target.checked)}
      className={cx("size-4 accent-ink")}
    />
  );
}
