import Link from "next/link";
import { requireCrmAccess } from "@/lib/auth/crm-guards";
import { findDuplicateContacts } from "@/lib/crm/queries";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { mergeContactsAction } from "../actions";

export default async function CrmDuplicatesPage() {
  const { orgId } = await requireCrmAccess();
  const groups = findDuplicateContacts(orgId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Duplicate detection</h1>
        <p className="text-slate-600">
          Contacts with the same name but different email addresses. Merge into a chosen primary
          contact.
        </p>
      </div>

      {groups.length === 0 ? (
        <Card>
          <CardBody>
            <p className="text-slate-600">No duplicate name groups found.</p>
          </CardBody>
        </Card>
      ) : (
        groups.map((group, i) => (
          <Card key={`${group[0].firstName}-${group[0].lastName}-${i}`}>
            <CardHeader
              title={`${group[0].firstName} ${group[0].lastName}`}
              subtitle={`${group.length} contacts with different emails`}
            />
            <CardBody>
              <form action={mergeContactsAction} className="space-y-4">
                <table className="min-w-full text-left text-sm">
                  <thead className="text-xs uppercase text-slate-500">
                    <tr>
                      <th className="pb-2 pr-4">Primary</th>
                      <th className="pb-2 pr-4">Merge</th>
                      <th className="pb-2 pr-4">Name</th>
                      <th className="pb-2 pr-4">Email</th>
                      <th className="pb-2">Company</th>
                    </tr>
                  </thead>
                  <tbody>
                    {group.map((c, idx) => (
                      <tr key={c.id} className="border-t border-slate-100">
                        <td className="py-2 pr-4">
                          <input
                            type="radio"
                            name="primaryId"
                            value={c.id}
                            defaultChecked={idx === 0}
                            required
                          />
                        </td>
                        <td className="py-2 pr-4">
                          <input
                            type="checkbox"
                            name="mergeIds"
                            value={c.id}
                            defaultChecked={idx > 0}
                          />
                        </td>
                        <td className="py-2 pr-4">
                          <Link
                            href={`/admin/crm/contacts/${c.id}`}
                            className="text-blue-700 hover:underline"
                          >
                            {c.firstName} {c.lastName}
                          </Link>
                        </td>
                        <td className="py-2 pr-4">{c.email}</td>
                        <td className="py-2">{c.company || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <Button type="submit">Merge selected into primary</Button>
              </form>
            </CardBody>
          </Card>
        ))
      )}
    </div>
  );
}
