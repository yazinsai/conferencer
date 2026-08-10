import { requireEventRole } from "@/lib/auth/guards";
import { AdminSidebar } from "@/components/admin/sidebar";
import { AdminHeader } from "@/components/admin/header";

export default async function AdminEventLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { user, event } = await requireEventRole(slug, ["organizer"], {
    redirectTo: `/admin/e/${slug}`,
  });

  return (
    <div className="flex min-h-full">
      <AdminSidebar slug={event.slug} eventName={event.name} />
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminHeader
          slug={event.slug}
          userName={`${user.firstName} ${user.lastName}`}
        />
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
}
