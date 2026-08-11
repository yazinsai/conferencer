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
  const accent = portal?.accent_color ?? event.accent_color;
  const usingEventDefault = !portal?.accent_color;

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
        <form action={savePortalAction} className="space-y-6 p-4">
          <input type="hidden" name="slug" value={slug} />
          <input type="hidden" name="portal_id" value={portal?.id ?? ""} />

          <section className="space-y-4">
            <div>
              <h2 className="text-sm font-semibold text-ink">Basics</h2>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Identity and the first message speakers see after signing in.
              </p>
            </div>
            <Field label="Portal name" name="name">
              <Input id="name" name="name" defaultValue={portal?.name ?? "Speaker Portal"} />
            </Field>
            <Field
              label="Welcome message (HTML)"
              name="welcome_message"
              hint="Basic HTML is rendered on the portal. Keep markup simple — paragraphs and links are safest."
            >
              <Textarea
                id="welcome_message"
                name="welcome_message"
                rows={4}
                defaultValue={portal?.welcome_message ?? ""}
              />
            </Field>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Field label="Accent colour" name="accent_color">
                  <div className="flex items-center gap-3">
                    <Input
                      id="accent_color"
                      name="accent_color"
                      type="color"
                      defaultValue={accent}
                      className="h-10 w-24 p-1"
                    />
                    <div className="text-xs text-muted-foreground">
                      <p className="font-mono text-ink">{accent}</p>
                      {usingEventDefault ? <p>Event default</p> : <p>Portal override</p>}
                    </div>
                  </div>
                </Field>
              </div>
              <Field
                label="Final deadline (days before the event)"
                name="final_deadline_days"
                hint="Leave blank for no portal-wide deadline. Speakers then only see per-task due dates."
              >
                <Input
                  id="final_deadline_days"
                  name="final_deadline_days"
                  type="number"
                  defaultValue={portal?.final_deadline_days ?? ""}
                />
              </Field>
            </div>
          </section>

          <hr className="border-rule" />

          <section className="space-y-3">
            <div>
              <h2 className="text-sm font-semibold text-ink">Visibility &amp; permissions</h2>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Which sections appear, and what speakers may change themselves.
              </p>
            </div>
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
          </section>

          <hr className="border-rule" />

          <section className="space-y-3">
            <div>
              <h2 className="text-sm font-semibold text-ink">Labels</h2>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Custom headings for the three portal sections.
              </p>
            </div>
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
          </section>

          <Button type="submit" variant="primary">
            Save portal settings
          </Button>
        </form>
      </Card>
    </div>
  );
}
