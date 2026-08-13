"use client";

import { useRef, useState } from "react";

import { Chip, cx } from "@/components/ui";
import { Icon } from "@/components/ui/icon";

/**
 * The embeds tile: the real one-line script tag, with a copy button.
 *
 * Silent success — the icon becomes a check for a moment and no toast fires
 * (design.md § Microinteractions stance). The fallback path matters: `navigator
 * .clipboard` needs a secure context, so a failure selects the text instead of
 * pretending it copied.
 */
export function CopyEmbed({ slug }: { slug: string | null }) {
  // The real shape, from `/admin/e/[slug]/embeds`: one signed token per widget, and
  // `?format=` swaps what that same token serves.
  const snippet = `<script src="/e/${slug ?? "your-event"}/embed/pk_agenda_9f2c?format=styled_html" async></script>`;
  const [copied, setCopied] = useState(false);
  const code = useRef<HTMLElement | null>(null);

  async function copy() {
    try {
      await navigator.clipboard.writeText(snippet);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      // No clipboard permission: select it so the reader can copy it themselves.
      const node = code.current;
      if (!node) return;
      const range = document.createRange();
      range.selectNodeContents(node);
      const selection = window.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(range);
    }
  }

  return (
    <div className="min-w-0">
      <div className="relative min-w-0 overflow-hidden rounded-input border border-rule bg-paper-3">
        <code
          ref={code}
          className="wordmark block max-h-24 overflow-x-auto whitespace-pre px-2.5 py-2 pr-11 text-[11px] leading-relaxed text-ink-2"
        >
          {snippet}
        </code>
        <button
          type="button"
          onClick={copy}
          aria-label={copied ? "Copied" : "Copy the embed snippet"}
          className="absolute right-1.5 top-1.5 grid size-7 place-items-center rounded-md border border-rule bg-paper text-muted-foreground transition-colors duration-[120ms] ease-out hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
        >
          <Icon
            name={copied ? "check" : "copy"}
            size={14}
            className={cx(copied && "text-positive")}
          />
        </button>
      </div>

      <p aria-live="polite" className="mt-2 min-h-[1rem] text-[11px] text-muted-foreground">
        {copied ? (
          <span className="text-positive">Copied.</span>
        ) : (
          "One token per widget. Change ?format= and the same token serves another shape."
        )}
      </p>

      <div className="mt-2.5 flex flex-wrap gap-1.5">
        {["styled_html", "json", "xml", "ical"].map((format) => (
          <Chip key={format} tone="slate">
            <span className="wordmark">{format}</span>
          </Chip>
        ))}
      </div>
    </div>
  );
}
