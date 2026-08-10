"use client";

import { useState } from "react";
import { Textarea } from "@/components/ui/input";

const MAX = 5000;

export function BiographyField({ defaultValue }: { defaultValue: string }) {
  const [value, setValue] = useState(defaultValue);
  const remaining = MAX - value.length;

  return (
    <div>
      <Textarea
        name="biography"
        rows={6}
        maxLength={MAX}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Tell attendees about yourself…"
      />
      <p
        className={`mt-1 text-right text-xs ${remaining < 100 ? "text-amber-600" : "text-slate-500"}`}
      >
        {value.length.toLocaleString()} / {MAX.toLocaleString()} characters
      </p>
    </div>
  );
}
