import { requireOrganizer } from "@/lib/guards";
import { importSpeakersAction } from "@/server/speaker-actions";
import {
  Button,
  Card,
  CardHeader,
  FormError,
  LinkButton,
  Notice,
  PageHeader,
  Textarea,
} from "@/components/ui";
import { IMPORT_FIELDS } from "@/lib/csv";
import { CsvImporter } from "@/components/admin/csv-importer";

export const dynamic = "force-dynamic";

export default async function ImportSpeakersPage({
  params,
  searchParams,
}: PageProps<"/admin/e/[slug]/speakers/import">) {
  const { slug } = await params;
  const sp = await searchParams;
  await requireOrganizer(slug);
  const error = typeof sp.error === "string" ? sp.error : null;

  return (
    <div className="max-w-4xl">
      <PageHeader
        title="Import speakers"
        description="Upload a CSV, check the column mapping, preview the rows, then import. Existing people are matched by email and updated rather than duplicated."
        actions={<LinkButton href={`/admin/e/${slug}/speakers`}>Back to speakers</LinkButton>}
      />
      {error ? (
        <div className="mb-4">
          <FormError>{error}</FormError>
        </div>
      ) : null}

      <Notice tone="info" className="mb-4">
        Recognised columns:{" "}
        {IMPORT_FIELDS.map((field) => field.label).join(", ")}. Anything else is ignored. Headers are
        matched automatically — you can override each one before importing.
      </Notice>

      <CsvImporter slug={slug} action={importSpeakersAction} />

      <Card className="mt-6">
        <CardHeader
          title="Paste CSV instead"
          description="Handy when you are copying out of a spreadsheet."
        />
        <form action={importSpeakersAction} className="space-y-3 p-4">
          <input type="hidden" name="slug" value={slug} />
          <Textarea
            name="csv"
            rows={8}
            placeholder={"First Name,Last Name,Email,Job Title,Company\nAda,Lovelace,ada@example.com,Analyst,Analytical Engines"}
          />
          <Button type="submit" variant="primary">
            Import pasted CSV
          </Button>
        </form>
      </Card>
    </div>
  );
}
