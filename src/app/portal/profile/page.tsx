import { requirePortalUser } from "@/lib/guards";
import { contactName, linkContactToUser, portalContact } from "@/lib/repo/contacts";
import { saveProfileAction } from "@/server/portal-actions";
import {
  Avatar,
  Button,
  Card,
  CardHeader,
  Field,
  FormError,
  Input,
  Notice,
  PageHeader,
  Select,
  Textarea,
} from "@/components/ui";
import { CharacterCounter } from "@/components/client/counter";

export const metadata = { title: "My profile" };
export const dynamic = "force-dynamic";

export default async function PortalProfile({ searchParams }: PageProps<"/portal/profile">) {
  const sp = await searchParams;
  const { user, event } = await requirePortalUser();
  const contact = portalContact(event, user) ?? linkContactToUser(event, user);
  const error = typeof sp.error === "string" ? sp.error : null;

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="My profile"
        description="This is what attendees see on the public speakers page. Keep it current — changes reach the organizers instantly."
      />
      {sp.saved ? <Notice tone="success" className="mb-4">Profile saved.</Notice> : null}
      {error ? <FormError>{error}</FormError> : null}

      <form action={saveProfileAction} className="space-y-4">
        <Card>
          <CardHeader title="Headshot" description="Square images look best. PNG, JPG, WEBP or SVG up to 20 MB." />
          <div className="flex flex-wrap items-center gap-5 p-4">
            <Avatar src={contact.headshot_url} name={contactName(contact)} size={96} />
            <div>
              <label
                htmlFor="headshot"
                className="block text-sm font-medium text-slate-700"
              >
                Upload a new headshot
              </label>
              <input
                id="headshot"
                name="headshot"
                type="file"
                accept=".png,.jpg,.jpeg,.webp,.gif,.svg"
                className="mt-1 block text-sm text-slate-600 file:mr-3 file:rounded-md file:border file:border-slate-300 file:bg-white file:px-3 file:py-1.5 file:text-sm file:font-medium hover:file:bg-slate-50"
              />
              <p className="mt-1 text-xs text-slate-500">
                Accepted types: .png .jpg .jpeg .webp .gif .svg — maximum 20 MB.
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader title="About you" />
          <div className="grid gap-4 p-4 sm:grid-cols-2">
            <Field label="Salutation" name="salutation">
              <Input id="salutation" name="salutation" defaultValue={contact.salutation ?? ""} />
            </Field>
            <Field label="Honorific" name="honorific">
              <Input id="honorific" name="honorific" defaultValue={contact.honorific ?? ""} />
            </Field>
            <Field label="First name" name="first_name" required>
              <Input id="first_name" name="first_name" defaultValue={contact.first_name} required />
            </Field>
            <Field label="Last name" name="last_name" required>
              <Input id="last_name" name="last_name" defaultValue={contact.last_name} required />
            </Field>
            <Field label="Pronouns" name="pronouns">
              <Input id="pronouns" name="pronouns" defaultValue={contact.pronouns ?? ""} />
            </Field>
            <Field label="Gender" name="gender">
              <Input id="gender" name="gender" defaultValue={contact.gender ?? ""} />
            </Field>
            <Field label="Job title" name="job_title">
              <Input id="job_title" name="job_title" defaultValue={contact.job_title ?? ""} />
            </Field>
            <Field label="Company" name="company">
              <Input id="company" name="company" defaultValue={contact.company ?? ""} />
            </Field>
            <Field label="Mobile phone" name="phone">
              <Input id="phone" name="phone" defaultValue={contact.phone ?? ""} />
            </Field>
            <Field label="Email" name="email" hint="Contact the organizers to change your email.">
              <Input id="email" defaultValue={contact.email} disabled />
            </Field>
          </div>
        </Card>

        <Card>
          <CardHeader title="Biography" description="Up to 5,000 characters." />
          <div className="p-4">
            <CharacterCounter
              name="biography"
              defaultValue={contact.biography ?? ""}
              max={5000}
              rows={10}
              label="Biography"
            />
          </div>
        </Card>

        <Card>
          <CardHeader title="My Links" />
          <div className="grid gap-4 p-4 sm:grid-cols-2">
            <Field label="LinkedIn" name="linkedin_url">
              <Input
                id="linkedin_url"
                name="linkedin_url"
                defaultValue={contact.linkedin_url ?? ""}
                placeholder="https://www.linkedin.com/in/…"
              />
            </Field>
            <Field label="X" name="twitter_url">
              <Input
                id="twitter_url"
                name="twitter_url"
                defaultValue={contact.twitter_url ?? ""}
                placeholder="https://x.com/…"
              />
            </Field>
            <Field label="Facebook" name="facebook_url">
              <Input id="facebook_url" name="facebook_url" defaultValue={contact.facebook_url ?? ""} />
            </Field>
            <Field label="Website" name="website_url">
              <Input id="website_url" name="website_url" defaultValue={contact.website_url ?? ""} />
            </Field>
          </div>
        </Card>

        <Card>
          <CardHeader
            title="Logistics"
            description="Only the organizers see this — it never appears publicly."
          />
          <div className="grid gap-4 p-4 sm:grid-cols-2">
            <Field label="Dietary requirements" name="dietary">
              <Input id="dietary" name="dietary" defaultValue={contact.dietary ?? ""} />
            </Field>
            <Field label="T-shirt size" name="tshirt_size">
              <Select id="tshirt_size" name="tshirt_size" defaultValue={contact.tshirt_size ?? ""}>
                <option value="">—</option>
                {["XS", "S", "M", "L", "XL", "XXL"].map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </Select>
            </Field>
            <Field
              label="Travel preferences"
              name="travel_notes"
              hint="Arrival dates, seat preferences, accessibility needs."
            >
              <Textarea
                id="travel_notes"
                name="travel_notes"
                rows={3}
                defaultValue={contact.travel_notes ?? ""}
              />
            </Field>
          </div>
        </Card>

        <Button type="submit" variant="primary" size="lg">
          Save profile
        </Button>
      </form>
    </div>
  );
}
