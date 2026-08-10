import Image from "next/image";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session";
import { getContactForUser, getDefaultEvent } from "@/lib/db/queries";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Input, Label, Select } from "@/components/ui/input";
import { BiographyField } from "./biography-field";
import { saveProfileAction } from "./actions";

const TSHIRT_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "3XL"];

export default async function PortalProfilePage() {
  const user = await getSessionUser();
  if (!user) redirect("/sign-in?next=/portal/profile");
  const event = getDefaultEvent();
  if (!event) redirect("/");
  const row = getContactForUser(event.id, user.id);

  if (!row) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold">My Profile</h1>
        <p className="text-slate-600">
          Your speaker profile will appear here once you submit a proposal or are
          invited to the event.
        </p>
      </div>
    );
  }

  const c = row.contact;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">My Profile</h1>
        <p className="text-slate-600">
          This information is shared with organizers and may appear on the event
          website.
        </p>
      </div>

      <Card>
        <CardHeader title="Speaker profile" />
        <CardBody>
          <form action={saveProfileAction} className="space-y-5">
            {c.headshotUrl ? (
              <div className="flex items-center gap-4">
                <Image
                  src={c.headshotUrl}
                  alt="Headshot"
                  width={80}
                  height={80}
                  className="h-20 w-20 rounded-full object-cover"
                  unoptimized
                />
                <p className="text-sm text-slate-500">Current headshot</p>
              </div>
            ) : null}

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="firstName">First name</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  defaultValue={c.firstName}
                  required
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last name</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  defaultValue={c.lastName}
                  required
                />
              </div>
              <div>
                <Label htmlFor="pronouns">Pronouns</Label>
                <Input
                  id="pronouns"
                  name="pronouns"
                  defaultValue={c.pronouns ?? ""}
                  placeholder="she/her, they/them…"
                />
              </div>
              <div>
                <Label htmlFor="jobTitle">Job title</Label>
                <Input
                  id="jobTitle"
                  name="jobTitle"
                  defaultValue={c.jobTitle ?? ""}
                />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="company">Company</Label>
                <Input
                  id="company"
                  name="company"
                  defaultValue={c.company ?? ""}
                />
              </div>
            </div>

            <div>
              <Label>Biography</Label>
              <BiographyField defaultValue={c.biography ?? ""} />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="linkedinUrl">LinkedIn</Label>
                <Input
                  id="linkedinUrl"
                  name="linkedinUrl"
                  type="url"
                  defaultValue={c.linkedinUrl ?? ""}
                  placeholder="https://linkedin.com/in/…"
                />
              </div>
              <div>
                <Label htmlFor="twitterUrl">Twitter / X</Label>
                <Input
                  id="twitterUrl"
                  name="twitterUrl"
                  type="url"
                  defaultValue={c.twitterUrl ?? ""}
                  placeholder="https://x.com/…"
                />
              </div>
              <div>
                <Label htmlFor="facebookUrl">Facebook</Label>
                <Input
                  id="facebookUrl"
                  name="facebookUrl"
                  type="url"
                  defaultValue={c.facebookUrl ?? ""}
                />
              </div>
              <div>
                <Label htmlFor="websiteUrl">Website</Label>
                <Input
                  id="websiteUrl"
                  name="websiteUrl"
                  type="url"
                  defaultValue={c.websiteUrl ?? ""}
                />
              </div>
              <div>
                <Label htmlFor="dietary">Dietary requirements</Label>
                <Input
                  id="dietary"
                  name="dietary"
                  defaultValue={c.dietary ?? ""}
                />
              </div>
              <div>
                <Label htmlFor="tshirtSize">T-shirt size</Label>
                <Select
                  id="tshirtSize"
                  name="tshirtSize"
                  defaultValue={c.tshirtSize ?? ""}
                >
                  <option value="">—</option>
                  {TSHIRT_SIZES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-5">
              <h3 className="text-sm font-semibold text-slate-900">Headshot</h3>
              <div className="mt-3 grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="headshotUrl">Image URL</Label>
                  <Input
                    id="headshotUrl"
                    name="headshotUrl"
                    type="url"
                    defaultValue={
                      c.headshotUrl?.startsWith("/api/files/")
                        ? ""
                        : (c.headshotUrl ?? "")
                    }
                    placeholder="https://…"
                  />
                </div>
                <div>
                  <Label htmlFor="headshotFile">Or upload file</Label>
                  <Input
                    id="headshotFile"
                    name="headshotFile"
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/gif"
                  />
                  <p className="mt-1 text-xs text-slate-500">
                    PNG, JPEG, WebP, or GIF · max 20 MB
                  </p>
                </div>
              </div>
            </div>

            <div>
              <Button type="submit">Save profile</Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
