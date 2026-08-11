import Link from "next/link";

export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Link href="/" className="text-sm font-semibold tracking-tight text-slate-900">
            Conferencer
          </Link>
          <nav className="flex items-center gap-4 text-sm text-slate-600">
            <Link href="/sign-in" className="hover:text-slate-900">
              Sign in
            </Link>
            <Link href="/sign-up" className="hover:text-slate-900">
              Sign up
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex flex-1 items-start justify-center px-4 py-12">
        <div className="w-full max-w-md">{children}</div>
      </main>
    </div>
  );
}
