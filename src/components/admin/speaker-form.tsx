import {
  Avatar,
  Button,
  Card,
  CardHeader,
  Field,
  Input,
  Select,
  Textarea,
  cx,
  fileInputClass,
} from "@/components/ui";
import { SPEAKER_STATUSES } from "@/lib/status";
import { saveSpeakerAction } from "@/server/speaker-actions";
import type { Contact } from "@/lib/repo/contacts";
import { contactName } from "@/lib/repo/contacts";
import { readJson } from "@/lib/db";

export function SpeakerForm({
  slug,
  contact,
  speakerStatus,
}: {
  slug: string;
  contact?: Contact;
  speakerStatus?: string;
}) {
  const tags = contact ? readJson<string[]>(contact.tags, []) : [];
  return (
    <form action={saveSpeakerAction} className="space-y-4" encType="multipart/form-data">
      <input type="hidden" name="slug" value={slug} />
      {contact ? <input type="hidden" name="contact_id" value={contact.id} /> : null}

      <Card>
        <CardHeader title="Identity" />
        <div className="grid gap-4 p-4 sm:grid-cols-2">
          <Field label="First name" name="first_name" required>
            <Input
              id="first_name"
              name="first_name"
              defaultValue={contact?.first_name ?? ""}
              required
            />
          </Field>
          <Field label="Last name" name="last_name" required>
            <Input id="last_name" name="last_name" defaultValue={contact?.last_name ?? ""} required />
          </Field>
          <Field label="Email" name="email" required>
            <Input id="email" name="email" type="email" defaultValue={contact?.email ?? ""} required />
          </Field>
          <Field label="Speaker status" name="speaker_status">
            <Select id="speaker_status" name="speaker_status" defaultValue={speakerStatus ?? "prospect"}>
              {SPEAKER_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Job title" name="job_title">
            <Input id="job_title" name="job_title" defaultValue={contact?.job_title ?? ""} />
          </Field>
          <Field label="Company" name="company">
            <Input id="company" name="company" defaultValue={contact?.company ?? ""} />
          </Field>
          <Field label="Pronouns" name="pronouns">
            <Input id="pronouns" name="pronouns" defaultValue={contact?.pronouns ?? ""} />
          </Field>
          <Field label="Phone" name="phone">
            <Input id="phone" name="phone" defaultValue={contact?.phone ?? ""} />
          </Field>
        </div>
      </Card>

      <Card>
        <CardHeader title="Biography and headshot" />
        <div className="space-y-4 p-4">
          <Field label="Biography" name="biography">
            <Textarea
              id="biography"
              name="biography"
              rows={8}
              defaultValue={contact?.biography ?? ""}
            />
          </Field>
          <div className="flex flex-wrap items-center gap-4">
            <Avatar
              src={contact?.headshot_url}
              name={contact ? contactName(contact) : "New speaker"}
              size={72}
            />
            <div>
              <label htmlFor="headshot" className="block text-sm font-medium text-slate-700">
                Headshot
              </label>
              <input
                id="headshot"
                name="headshot"
                type="file"
                accept=".png,.jpg,.jpeg,.webp,.gif,.svg"
                className={cx("mt-1", fileInputClass)}
              />
              <p className="mt-1 text-xs text-slate-500">
                PNG, JPG, WEBP, GIF or SVG up to 20 MB.
              </p>
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader title="Links" />
        <div className="grid gap-4 p-4 sm:grid-cols-2">
          <Field label="LinkedIn" name="linkedin_url">
            <Input id="linkedin_url" name="linkedin_url" defaultValue={contact?.linkedin_url ?? ""} />
          </Field>
          <Field label="X" name="twitter_url">
            <Input id="twitter_url" name="twitter_url" defaultValue={contact?.twitter_url ?? ""} />
          </Field>
          <Field label="Website" name="website_url">
            <Input id="website_url" name="website_url" defaultValue={contact?.website_url ?? ""} />
          </Field>
          <Field label="Tags" name="tags" hint="Comma separated.">
            <Input id="tags" name="tags" defaultValue={tags.join(", ")} />
          </Field>
        </div>
      </Card>

      <Card>
        <CardHeader
          title="Logistics and internal notes"
          description="Never shown publicly."
        />
        <div className="grid gap-4 p-4 sm:grid-cols-2">
          <Field label="Dietary requirements" name="dietary">
            <Input id="dietary" name="dietary" defaultValue={contact?.dietary ?? ""} />
          </Field>
          <Field label="T-shirt size" name="tshirt_size">
            <Select id="tshirt_size" name="tshirt_size" defaultValue={contact?.tshirt_size ?? ""}>
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
            hint="Arrival dates, seat preference, accessibility needs."
          >
            <Textarea
              id="travel_notes"
              name="travel_notes"
              rows={3}
              defaultValue={contact?.travel_notes ?? ""}
            />
          </Field>
          <Field label="Internal notes" name="notes">
            <Textarea id="notes" name="notes" rows={3} defaultValue={contact?.notes ?? ""} />
          </Field>
        </div>
      </Card>

      <Button type="submit" variant="primary" size="lg">
        {contact ? "Save speaker" : "Add speaker"}
      </Button>
    </form>
  );
}
