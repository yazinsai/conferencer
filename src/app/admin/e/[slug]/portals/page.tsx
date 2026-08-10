import { requireOrganizer } from "@/lib/guards";
import { get } from "@/lib/db";
import { savePortalAction } from "@/server/portal-config-actions";
import {
  Button,
  Card,
  CardHeader,
  Field,
  Input,
  LinkButton,
  Notice,
  PageHeader,
  Textarea,
} from "@/components/ui";

export const dynamic = "force-dynamic";

type Portal = {
  id: string;
  name: string;
  welcome_message: string | null;
  accent_color: string | null;
  show_tasks_always: number;
  show_sessions: number;
  allow_manage_profile: number;
  allow_manage_participants: number;
  send_weekly_digest: number;
  final_deadline_days: number | null;
  heading_invited: string;
  heading_submissions: string;
  heading_confirmed: string;
};

export default async function PortalsPage({
  params,
  searchParams,
}: PageProps<"/admin/e/[slug]/portals">) {
  const { slug } = await params;
  const sp = await searchParams;
  const { event } = await requireOrganizer(slug);
  const portal = get<Portal>(
    "SELECT * FROM portals WHERE event_id = ? ORDER BY is_default DESC LIMIT 1",
    event.id,
  );

  return (
    <div className="max-w-3xl">
      <PageHeader
        title="Speaker portal"
        description="What speakers see when they sign in: the welcome message, which sections appear, and what they may edit."
        actions={<LinkButton href="/portal">Open the portal</LinkButton>}
      />
      {sp.saved ? <Notice tone="success" className="mb-4">Portal settings saved.</Notice> : null}

      <Card>
        <CardHeader title={portal?.name ?? "Speaker Portal"} description="Default portal" />
        <form action={savePortalAction} className="space-y-4 p-4">
          <input type="hidden" name="slug" value={slug} />
          <input type="hidden" name="portal_id" value={portal?.id ?? ""} />

          <Field label="Portal name" name="name">
            <Input id="name" name="name" defaultValue={portal?.name ?? "Speaker Portal"} />
          </Field>
          <Field label="Welcome message" name="welcome_message">
            <Textarea
              id="welcome_message"
              name="welcome_message"
              rows={4}
              defaultValue={portal?.welcome_message ?? ""}
            />
          </Field>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Accent colour" name="accent_color">
              <Input
                id="accent_color"
                name="accent_color"
                type="color"
                defaultValue={portal?.accent_color ?? event.accent_color}
                className="h-10 w-24 p-1"
              />
            </Field>
            <Field
              label="Final deadline (days before the event)"
              name="final_deadline_days"
            >
              <Input
                id="final_deadline_days"
                name="final_deadline_days"
                type="number"
                defaultValue={portal?.final_deadline_days ?? ""}
              />
            </Field>
          </div>

          <fieldset className="rounded-md border border-slate-200 p-3">
            <legend className="px-1 text-sm font-medium text-slate-700">Sections</legend>
            {[
              {
                name: "show_tasks_always",
                label: "Always show tasks (otherwise only after acceptance)",
                checked: portal?.show_tasks_always,
              },
              { name: "show_sessions", label: "Show their sessions", checked: portal?.show_sessions },
              {
                name: "allow_manage_profile",
                label: "Let speakers edit their own profile",
                checked: portal?.allow_manage_profile,
              },
              {
                name: "allow_manage_participants",
                label: "Let submitters manage co-speakers",
                checked: portal?.allow_manage_participants,
              },
              {
                name: "send_weekly_digest",
                label: "Send a weekly digest of outstanding tasks",
                checked: portal?.send_weekly_digest,
              },
            ].map((toggle) => (
              <label key={toggle.name} className="flex items-center gap-2 py-1 text-sm">
                <input
                  type="checkbox"
                  name={toggle.name}
                  defaultChecked={Boolean(toggle.checked ?? 1)}
                />
                {toggle.label}
              </label>
            ))}
          </fieldset>

          <fieldset className="rounded-md border border-slate-200 p-3">
            <legend className="px-1 text-sm font-medium text-slate-700">Section headings</legend>
            <div className="grid gap-3 sm:grid-cols-3">
              <Field label="Invited sessions" name="heading_invited">
                <Input
                  id="heading_invited"
                  name="heading_invited"
                  defaultValue={portal?.heading_invited ?? "Invited Sessions"}
                />
              </Field>
              <Field label="My submissions" name="heading_submissions">
                <Input
                  id="heading_submissions"
                  name="heading_submissions"
                  defaultValue={portal?.heading_submissions ?? "My Submissions"}
                />
              </Field>
              <Field label="Confirmed participation" name="heading_confirmed">
                <Input
                  id="heading_confirmed"
                  name="heading_confirmed"
                  defaultValue={portal?.heading_confirmed ?? "Confirmed Participation"}
                />
              </Field>
            </div>
          </fieldset>

          <Button type="submit" variant="primary">
            Save portal settings
          </Button>
        </form>
      </Card>
    </div>
  );
}
