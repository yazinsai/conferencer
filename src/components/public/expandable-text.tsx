"use client";

import { useState } from "react";

const DEFAULT_MAX = 200;

export function ExpandableText({
  text,
  maxLength = DEFAULT_MAX,
  className = "",
}: {
  text: string | null | undefined;
  maxLength?: number;
  className?: string;
}) {
  const [expanded, setExpanded] = useState(false);
  if (!text?.trim()) return null;

  const needsTruncation = text.length > maxLength;
  const display = expanded || !needsTruncation ? text : `${text.slice(0, maxLength).trimEnd()}…`;

  return (
    <div className={className}>
      <p className="whitespace-pre-wrap text-sm text-slate-600">{display}</p>
      {needsTruncation ? (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mt-1 text-sm font-medium text-[var(--event-accent,#2563eb)] hover:underline"
        >
          {expanded ? "Show less" : "Show more"}
        </button>
      ) : null}
    </div>
  );
}
