import { requireOrganizer } from "@/lib/guards";
import { importSpeakersAction } from "@/server/speaker-actions";
import {
  Button,
  FormError,
  LinkButton,
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

      <p className="mb-4 text-sm text-neutral">
        Required header: <span className="font-medium text-ink">Email</span>. Name helps when the
        row is new. Anything unrecognised is ignored — full field list appears with column mapping
        after you upload.
      </p>

      <CsvImporter slug={slug} action={importSpeakersAction} />

      <details className="mt-6 rounded-card border border-rule bg-paper">
        <summary
          className={[
            "cursor-pointer list-none px-4 py-3 text-sm font-medium text-ink",
            "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
            "[&::-webkit-details-marker]:hidden",
          ].join(" ")}
        >
          <span className="flex flex-wrap items-baseline gap-x-2">
            <span>Paste CSV instead</span>
            <span className="text-xs font-normal text-muted-foreground">
              Alternative · copy from a spreadsheet
            </span>
          </span>
        </summary>
        <form action={importSpeakersAction} className="space-y-3 border-t border-rule p-4">
          <input type="hidden" name="slug" value={slug} />
          <p className="text-xs text-muted-foreground">
            Include an Email column. Recognised fields:{" "}
            {IMPORT_FIELDS.map((field) => field.label).join(", ")}.
          </p>
          <Textarea
            name="csv"
            rows={8}
            placeholder={
              "First Name,Last Name,Email,Job Title,Company\nAda,Lovelace,ada@example.com,Analyst,Analytical Engines"
            }
          />
          <Button type="submit" variant="primary">
            Import pasted CSV
          </Button>
        </form>
      </details>
    </div>
  );
}
