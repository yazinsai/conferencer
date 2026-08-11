"use client";

import { useState } from "react";

import { cx, inputClass } from "@/components/ui";

/** Textarea with a live character counter (R-POR-3: 5,000 character bio limit). */
export function CharacterCounter({
  name,
  defaultValue,
  max,
  rows = 8,
  label,
  placeholder,
}: {
  name: string;
  defaultValue?: string;
  max: number;
  rows?: number;
  label: string;
  placeholder?: string;
}) {
  const [value, setValue] = useState(defaultValue ?? "");
  const length = value.replace(/<[^>]*>/g, "").length;
  const over = length > max;
  return (
    <div>
      <label htmlFor={name} className="sr-only">
        {label}
      </label>
      <textarea
        id={name}
        name={name}
        rows={rows}
        placeholder={placeholder}
        className={cx(inputClass, over && "border-red-400")}
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      <p className={cx("mt-1 text-right text-xs", over ? "text-red-600" : "text-slate-400")}>
        {length} / {max} characters
      </p>
    </div>
  );
}
