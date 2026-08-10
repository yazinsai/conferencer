import { requireCrmAccess } from "@/lib/auth/crm-guards";
import { CrmSidebar } from "@/components/admin/crm-sidebar";
import { CrmHeader } from "@/components/admin/crm-header";

export default async function CrmLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, event, org } = await requireCrmAccess();

  return (
    <div className="flex min-h-full">
      <CrmSidebar orgName={org?.name ?? "Organization"} eventSlug={event.slug} />
      <div className="flex min-w-0 flex-1 flex-col">
        <CrmHeader
          eventSlug={event.slug}
          userName={`${user.firstName} ${user.lastName}`}
        />
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
}
