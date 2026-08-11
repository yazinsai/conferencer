import { requireOrganizer } from "@/lib/guards";
import { all } from "@/lib/db";
import { addTeamMemberAction, removeTeamMemberAction } from "@/server/team-actions";
import {
  Button,
  Card,
  CardHeader,
  Chip,
  Field,
  Input,
  Notice,
  PageHeader,
  Table,
  Td,
  Th,
} from "@/components/ui";
import { ConfirmSubmit, CopyButton } from "@/components/client/basics";
import { TeamRoleField } from "@/components/admin/team-role-field";
import { formatStamp } from "@/lib/datetime";

export const dynamic = "force-dynamic";

type Member = {
  id: string;
  user_id: string;
  role: string;
  email: string;
  first_name: string;
  last_name: string;
  created_at: string;
};

export default async function TeamPage({
  params,
  searchParams,
}: PageProps<"/admin/e/[slug]/team">) {
  const { slug } = await params;
  const sp = await searchParams;
  const { event } = await requireOrganizer(slug);
  const members = all<Member>(
    `SELECT m.id, m.user_id, m.role, m.created_at, u.email, u.first_name, u.last_name
       FROM event_memberships m JOIN users u ON u.id = m.user_id
      WHERE m.event_id = ? AND m.role IN ('organizer','reviewer')
      ORDER BY m.role, u.last_name`,
    event.id,
  );

  return (
    <div className="max-w-4xl">
      <PageHeader
        title="Event team"
        description="Organizers see everything. Reviewers only see the submissions assigned to them. Prefer sharing the invite link after saving."
      />

      {sp.invite ? (
        <Notice tone="info" className="mb-4">
          <p className="font-medium">Invitation created for {String(sp.email ?? "")}</p>
          <div className="mt-2 flex items-center gap-2">
            <code className="rounded bg-paper px-2 py-1 font-mono text-xs">
              /set-password/{String(sp.invite)}
            </code>
            <CopyButton value={`/set-password/${String(sp.invite)}`} label="Copy invite link" />
          </div>
        </Notice>
      ) : null}

      <Card className="mb-5">
        <CardHeader title="Members" description={`${members.length} people`} />
        <Table className="rounded-none border-0">
          <thead>
            <tr>
              <Th>Member</Th>
              <Th>Role</Th>
              <Th>Added</Th>
              <Th />
            </tr>
          </thead>
          <tbody>
            {members.map((member) => {
              const name = `${member.first_name} ${member.last_name}`.trim() || member.email;
              return (
                <tr key={member.id}>
                  <Td>
                    <div className="min-w-0">
                      <p className="font-medium text-ink">{name}</p>
                      <p className="mt-0.5 text-sm text-muted-foreground">{member.email}</p>
                    </div>
                  </Td>
                  <Td>
                    <Chip tone={member.role === "organizer" ? "green" : "blue"}>{member.role}</Chip>
                  </Td>
                  <Td className="text-xs wordmark tnum text-muted-foreground">
                    {formatStamp(member.created_at)}
                  </Td>
                  <Td>
                    <form action={removeTeamMemberAction}>
                      <input type="hidden" name="slug" value={slug} />
                      <input type="hidden" name="membership_id" value={member.id} />
                      <ConfirmSubmit
                        message={`Remove ${name} (${member.email}) as ${member.role}?`}
                        variant="danger"
                        aria-label={`Remove ${name}, ${member.email}`}
                      >
                        Remove
                      </ConfirmSubmit>
                    </form>
                  </Td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </Card>

      <Card>
        <CardHeader
          title="Add a team member"
          description="Share the invite link that appears after saving — the simpler path."
        />
        <form action={addTeamMemberAction} className="grid gap-3 p-4 sm:grid-cols-2">
          <input type="hidden" name="slug" value={slug} />
          <Field label="First name" name="first_name">
            <Input id="first_name" name="first_name" />
          </Field>
          <Field label="Last name" name="last_name">
            <Input id="last_name" name="last_name" />
          </Field>
          <Field label="Email" name="email" required>
            <Input id="email" name="email" type="email" required />
          </Field>
          <TeamRoleField />
          <details className="sm:col-span-2">
            <summary
              className={[
                "cursor-pointer list-none text-sm font-medium text-ink-2",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                "[&::-webkit-details-marker]:hidden",
              ].join(" ")}
            >
              Set a password instead
            </summary>
            <div className="mt-3 max-w-md">
              <Field
                label="Password"
                name="password"
                hint="Optional. Prefer the invite link so they choose their own password."
              >
                <Input id="password" name="password" type="text" autoComplete="off" />
              </Field>
            </div>
          </details>
          <div className="flex items-end sm:col-span-2">
            <Button type="submit" variant="primary">
              Add member
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
