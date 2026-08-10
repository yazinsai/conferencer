import Link from "next/link";

const links = [
  { href: "", label: "Event" },
  { href: "/tracks", label: "Tracks" },
  { href: "/formats", label: "Formats" },
  { href: "/rooms", label: "Rooms" },
] as const;

export function SettingsNav({
  slug,
  active,
}: {
  slug: string;
  active: "" | "/tracks" | "/formats" | "/rooms";
}) {
  const base = `/admin/e/${slug}/settings`;
  return (
    <nav className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
      {links.map((l) => {
        const href = `${base}${l.href}`;
        const isActive = l.href === active;
        return (
          <Link
            key={l.href}
            href={href}
            className={`rounded-md px-3 py-1.5 text-sm font-medium ${
              isActive
                ? "bg-blue-600 text-white"
                : "bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
            }`}
          >
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}
