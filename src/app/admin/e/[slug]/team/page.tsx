import { eq } from "drizzle-orm";
import { requireEventRole } from "@/lib/auth/guards";
import { getDb, schema } from "@/lib/db";
import { Card, CardBody, CardHeader } from "@/components/ui/card";

export default async function TeamPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { event } = await requireEventRole(slug, ["organizer"]);
  const members = getDb()
    .select({
      membership: schema.eventMemberships,
      user: schema.users,
    })
    .from(schema.eventMemberships)
    .innerJoin(schema.users, eq(schema.eventMemberships.userId, schema.users.id))
    .where(eq(schema.eventMemberships.eventId, event.id))
    .all();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Event Team</h1>
        <p className="text-slate-600">Organizers, reviewers, and participants with logins.</p>
      </div>
      <Card>
        <CardHeader title={`${members.length} members`} />
        <CardBody className="overflow-x-auto p-0">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-3 py-2 text-left">Name</th>
                <th className="px-3 py-2 text-left">Email</th>
                <th className="px-3 py-2 text-left">Role</th>
              </tr>
            </thead>
            <tbody>
              {members.map(({ membership, user }) => (
                <tr key={membership.id} className="border-t">
                  <td className="px-3 py-2">
                    {user.firstName} {user.lastName}
                  </td>
                  <td className="px-3 py-2">{user.email}</td>
                  <td className="px-3 py-2 capitalize">{membership.role}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardBody>
      </Card>
    </div>
  );
}
