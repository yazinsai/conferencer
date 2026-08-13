"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactElement,
} from "react";

import { buttonClass, cx, EmptyState, inputClass } from "@/components/ui";
import { Icon, type IconName } from "@/components/ui/icon";
import type { CommandItem } from "@/components/admin/command-search.routes";

export type { CommandItem };

type FlatOption =
  | { kind: "item"; item: CommandItem }
  | { kind: "search"; id: string; label: string; href: string };

function isSubsequence(haystack: string, needle: string): boolean {
  let ni = 0;
  for (let hi = 0; hi < haystack.length && ni < needle.length; hi++) {
    if (haystack[hi] === needle[ni]) ni += 1;
  }
  return ni === needle.length;
}

/** Lower score wins. Prefix → substring → subsequence. Null = no match. */
function matchRank(label: string, query: string): number | null {
  const l = label.toLowerCase();
  const q = query.toLowerCase();
  if (l.startsWith(q)) return 0;
  if (l.includes(q)) return 1;
  if (isSubsequence(l, q)) return 2;
  return null;
}

function filterItems(items: CommandItem[], query: string): CommandItem[] {
  const q = query.trim();
  if (!q) return items;
  return items
    .map((item) => {
      const rank = matchRank(item.label, q);
      return rank === null ? null : { item, rank };
    })
    .filter((entry): entry is { item: CommandItem; rank: number } => entry !== null)
    .sort((a, b) => a.rank - b.rank)
    .map((entry) => entry.item);
}

const KBD =
  "wordmark inline-flex items-center rounded-md border border-rule bg-paper-3 px-1.5 py-0.5 text-[0.625rem] font-medium text-muted-foreground";

const ROW =
  "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm outline-none transition-[background-color,color] duration-[120ms] ease-out";

/**
 * Native `<dialog showModal()>` — focus trap, Esc, and focus restore are built
 * in, with less code than wiring radix-ui Dialog without its zoom motion.
 */
export function CommandPalette({
  items,
  slug,
  trigger = "button",
}: {
  items: CommandItem[];
  slug: string;
  /**
   * `searchbar` adopts the admin bar's existing search pill as the trigger. The
   * pill stays a real `<form>` posting to the search page, so with the bundle
   * missing it still searches; hydration only upgrades a pointer press into the
   * palette. Opening is bound to pointer-down and typing rather than focus,
   * because the dialog takes focus and restores it on close — an `onFocus`
   * trigger would reopen itself forever.
   */
  trigger?: "button" | "searchbar";
}): ReactElement {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const reactId = useId();
  const listboxId = `${reactId}-listbox`;
  const searchOptionId = `${reactId}-search-everything`;

  const filtered = useMemo(() => filterItems(items, query), [items, query]);
  const trimmed = query.trim();
  const searchHref = `/admin/e/${slug}/search?q=${encodeURIComponent(trimmed)}`;

  const options = useMemo((): FlatOption[] => {
    const rows: FlatOption[] = filtered.map((item) => ({ kind: "item", item }));
    if (trimmed) {
      rows.push({
        kind: "search",
        id: searchOptionId,
        label: `Search everything for «${trimmed}» →`,
        href: searchHref,
      });
    }
    return rows;
  }, [filtered, trimmed, searchHref, searchOptionId]);

  const goTo = useMemo(
    () => filtered.filter((item) => item.group === "Go to"),
    [filtered],
  );
  const recent = useMemo(
    () => filtered.filter((item) => item.group === "Recent"),
    [filtered],
  );

  const optionIndexById = useMemo(() => {
    const map = new Map<string, number>();
    options.forEach((option, index) => {
      map.set(option.kind === "item" ? option.item.id : option.id, index);
    });
    return map;
  }, [options]);

  const activeOption = options[activeIndex] ?? null;
  const activeDescendant =
    activeOption === null
      ? undefined
      : activeOption.kind === "item"
        ? activeOption.item.id
        : activeOption.id;

  const close = useCallback(() => {
    const dialog = dialogRef.current;
    if (dialog?.open) dialog.close();
    setOpen(false);
    setQuery("");
    setActiveIndex(0);
  }, []);

  const openPalette = useCallback(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    setQuery("");
    setActiveIndex(0);
    setOpen(true);
    if (!dialog.open) dialog.showModal();
    requestAnimationFrame(() => inputRef.current?.focus());
  }, []);

  useEffect(() => {
    function onGlobalKey(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        if (dialogRef.current?.open) close();
        else openPalette();
      }
    }
    window.addEventListener("keydown", onGlobalKey);
    return () => window.removeEventListener("keydown", onGlobalKey);
  }, [close, openPalette]);

  useEffect(() => {
    if (!open) return;
    const el = listRef.current?.querySelector<HTMLElement>(
      `[data-command-index="${activeIndex}"]`,
    );
    el?.scrollIntoView({ block: "nearest" });
  }, [activeIndex, open, options.length]);

  function navigateTo(href: string) {
    close();
    router.push(href);
  }

  function onInputKeyDown(event: ReactKeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (options.length === 0) return;
      setActiveIndex((index) => (index + 1) % options.length);
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      if (options.length === 0) return;
      setActiveIndex((index) => (index - 1 + options.length) % options.length);
      return;
    }
    if (event.key === "Enter") {
      event.preventDefault();
      if (!activeOption) return;
      const href =
        activeOption.kind === "item" ? activeOption.item.href : activeOption.href;
      navigateTo(href);
      return;
    }
    if (event.key === "Escape") {
      event.preventDefault();
      close();
    }
  }

  function renderRow(option: FlatOption) {
    const id = option.kind === "item" ? option.item.id : option.id;
    const index = optionIndexById.get(id) ?? 0;
    const selected = index === activeIndex;
    const href = option.kind === "item" ? option.item.href : option.href;
    const label = option.kind === "item" ? option.item.label : option.label;
    const icon: IconName = option.kind === "item" ? option.item.icon : "search";
    const hint = option.kind === "item" ? option.item.hint : undefined;

    return (
      <Link
        key={id}
        id={id}
        href={href}
        role="option"
        aria-selected={selected}
        data-command-index={index}
        onMouseEnter={() => setActiveIndex(index)}
        onClick={(event) => {
          event.preventDefault();
          navigateTo(href);
        }}
        className={cx(
          ROW,
          selected
            ? "bg-paper-3 font-medium text-ink"
            : "text-neutral hover:bg-paper-2 hover:text-ink",
        )}
      >
        <Icon
          name={icon}
          size={17}
          className={selected ? "text-ink" : "text-muted-foreground"}
        />
        <span className="min-w-0 flex-1 truncate">{label}</span>
        {hint ? (
          <span className="shrink-0 text-xs text-muted-foreground">{hint}</span>
        ) : null}
      </Link>
    );
  }

  const empty = Boolean(trimmed && filtered.length === 0);
  const searchOption = options.find((option) => option.kind === "search");

  return (
    <>
      <style>{`
        @keyframes cmd-palette-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        dialog[data-cmd-palette][open] {
          animation: cmd-palette-in var(--dur-short) var(--ease-out);
        }
        @media (prefers-reduced-motion: reduce) {
          dialog[data-cmd-palette][open] {
            animation-duration: 150ms;
          }
        }
      `}</style>

      {trigger === "searchbar" ? (
        <form
          action={`/admin/e/${slug}/search`}
          role="search"
          className="min-w-0 flex-1 sm:max-w-sm"
        >
          <label htmlFor="global-search" className="sr-only">
            Search submissions, speakers and sessions
          </label>
          {/* The shell carries the focus ring, so it draws around the whole
              control rather than inside the pill. */}
          <div className="flex h-9 items-center gap-2 rounded-pill border border-rule bg-paper-2 pl-3 pr-1.5 outline-2 outline-offset-2 outline-transparent focus-within:border-ink-2 focus-within:bg-paper focus-within:outline-ring">
            <Icon name="search" size={16} className="text-muted-foreground" />
            <input
              id="global-search"
              name="q"
              type="search"
              placeholder="Search submissions, speakers…"
              className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              onMouseDown={(event) => {
                event.preventDefault();
                openPalette();
              }}
              onKeyDown={(event) => {
                if (event.key === "Tab" || event.key === "Enter") return;
                if (event.key.length !== 1 && event.key !== "ArrowDown") return;
                event.preventDefault();
                openPalette();
                if (event.key.length === 1) setQuery(event.key);
              }}
            />
            <kbd className={cx(KBD, "hidden shrink-0 bg-paper sm:inline-flex")}>⌘K</kbd>
          </div>
        </form>
      ) : (
        <button
          type="button"
          onClick={openPalette}
          className={cx(buttonClass("secondary", "md"), "gap-2")}
        >
          <Icon name="search" size={16} />
          <span>Search</span>
          <kbd className={KBD}>⌘K</kbd>
        </button>
      )}

      <dialog
        ref={dialogRef}
        data-cmd-palette=""
        aria-label="Command search"
        className={cx(
          "fixed top-[min(20vh,8rem)] left-1/2 z-[400] m-0 w-[min(100%-1.5rem,32rem)] -translate-x-1/2",
          "rounded-card border border-rule bg-paper p-0 text-ink shadow-[var(--shadow-raised)]",
          "open:flex open:flex-col",
          "backdrop:bg-ink/40",
        )}
        onClose={() => {
          setOpen(false);
          setQuery("");
          setActiveIndex(0);
        }}
        onCancel={(event) => {
          event.preventDefault();
          close();
        }}
        onClick={(event) => {
          if (event.target === dialogRef.current) close();
        }}
      >
        <div className="flex items-center gap-2 border-b border-rule px-3 py-2.5">
          <Icon name="search" size={18} className="text-muted-foreground" />
          <input
            ref={inputRef}
            type="search"
            role="combobox"
            aria-expanded={open}
            aria-controls={listboxId}
            aria-activedescendant={activeDescendant}
            aria-autocomplete="list"
            aria-label="Jump to a page or search"
            placeholder="Jump to a page or search…"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setActiveIndex(0);
            }}
            onKeyDown={onInputKeyDown}
            className={cx(
              inputClass,
              "h-9 border-0 bg-transparent px-0 shadow-none outline-none",
              "hover:bg-transparent focus-visible:border-transparent focus-visible:outline-none",
            )}
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
          />
        </div>

        <div
          ref={listRef}
          id={listboxId}
          role="listbox"
          aria-label="Results"
          className="max-h-[min(60vh,24rem)] overflow-y-auto p-2"
        >
          {empty && searchOption ? (
            <EmptyState
              icon="search"
              title={`No matches for «${trimmed}»`}
              description="Try another name, or search everything across this event."
              action={renderRow(searchOption)}
            />
          ) : (
            <>
              {goTo.length > 0 ? (
                <div className="mb-2">
                  <p className="wordmark px-2.5 pb-1 text-[0.625rem] uppercase tracking-[0.14em] text-muted-foreground">
                    Go to
                  </p>
                  <div className="space-y-px">
                    {goTo.map((item) => renderRow({ kind: "item", item }))}
                  </div>
                </div>
              ) : null}

              {recent.length > 0 ? (
                <div className="mb-2">
                  <p className="wordmark px-2.5 pb-1 text-[0.625rem] uppercase tracking-[0.14em] text-muted-foreground">
                    Recent
                  </p>
                  <div className="space-y-px">
                    {recent.map((item) => renderRow({ kind: "item", item }))}
                  </div>
                </div>
              ) : null}

              {searchOption ? (
                <div className="mt-1 border-t border-rule pt-2">
                  {renderRow(searchOption)}
                </div>
              ) : null}

              {!trimmed && filtered.length === 0 ? (
                <p className="px-2.5 py-6 text-center text-sm text-muted-foreground">
                  No destinations yet.
                </p>
              ) : null}
            </>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-rule bg-paper-2 px-3 py-2 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <kbd className={KBD}>↑</kbd>
            <kbd className={KBD}>↓</kbd>
            <span>navigate</span>
          </span>
          <span aria-hidden>·</span>
          <span className="inline-flex items-center gap-1">
            <kbd className={KBD}>↵</kbd>
            <span>open</span>
          </span>
          <span aria-hidden>·</span>
          <span className="inline-flex items-center gap-1">
            <kbd className={KBD}>esc</kbd>
            <span>close</span>
          </span>
        </div>
      </dialog>
    </>
  );
}
