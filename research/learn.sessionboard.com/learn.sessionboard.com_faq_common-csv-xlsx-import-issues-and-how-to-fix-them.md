---
url: "https://learn.sessionboard.com/faq/common-csv-xlsx-import-issues-and-how-to-fix-them"
title: "6 common CSV & XLSX import issues (and how to fix them) | Sessionboard Help Center"
---

[Skip to content](https://learn.sessionboard.com/faq/common-csv-xlsx-import-issues-and-how-to-fix-them#_top)

# 6 common CSV & XLSX import issues (and how to fix them)

## “All records valid” but the import still fails

[Section titled ““All records valid” but the import still fails”](https://learn.sessionboard.com/faq/common-csv-xlsx-import-issues-and-how-to-fix-them#all-records-valid-but-the-import-still-fails)

### Symptoms

[Section titled “Symptoms”](https://learn.sessionboard.com/faq/common-csv-xlsx-import-issues-and-how-to-fix-them#symptoms)

Validation shows 0 invalid records and green checkmark → click Continue → “File upload was unable to be processed. Please check your records and try again.” → no records imported

![Symptoms](https://learn.sessionboard.com/images/kb/55005eef-bdf82fc3-0cca-4eeb-aeb9-43d3d2d65752.png)

### Why it happens

[Section titled “Why it happens”](https://learn.sessionboard.com/faq/common-csv-xlsx-import-issues-and-how-to-fix-them#why-it-happens)

Validation checks field formatting, but not all backend constraints (duplicate detection, file size, temp system issues). Clean validation ≠ successful write.

### Fix

[Section titled “Fix”](https://learn.sessionboard.com/faq/common-csv-xlsx-import-issues-and-how-to-fix-them#fix)

1. Reduce file size — Sessionboard supports max 1,000 records per import. Split into smaller files
2. Check for special characters — open CSV in a text editor, look for “, &, <, > in field values
3. While these were recently allowed, some of these might still cause issues when reading the file.
4. Re-export the template — download a fresh template from the import screen, copy data into it
5. Try a different browser — Chrome incognito or another browser
6. If it persists, contact support with CSV attached + URL where you’re importing + event name

* * *

## Date/time fields fail after editing in Google Sheets

[Section titled “Date/time fields fail after editing in Google Sheets”](https://learn.sessionboard.com/faq/common-csv-xlsx-import-issues-and-how-to-fix-them#datetime-fields-fail-after-editing-in-google-sheets)

### Symptoms

[Section titled “Symptoms”](https://learn.sessionboard.com/faq/common-csv-xlsx-import-issues-and-how-to-fix-them#symptoms-1)

Export CSV → open in Google Sheets → edit → re-import → errors on all “Starts at” and “Ends at” fields. Dates look correct, but SB rejects them.

![Symptoms](https://learn.sessionboard.com/images/kb/a560b3c5-image-png-Mar-10-2026-09-05-08-8156-PM.png)

### Why it happens

[Section titled “Why it happens”](https://learn.sessionboard.com/faq/common-csv-xlsx-import-issues-and-how-to-fix-them#why-it-happens-1)

Google Sheets auto-converts date/time values. When re-exported, dates come out as e.g. 3/25/2026 9:00 AM instead of the required YYYY-MM-DD HH:mm format.

### Fix

[Section titled “Fix”](https://learn.sessionboard.com/faq/common-csv-xlsx-import-issues-and-how-to-fix-them#fix-1)

- \`\`Option A: In Google Sheets, select date columns → Format > Number > Custom date and time → delete current logic using the backspace key → use the UI to match the needed format: YYYY-MM-DD HH:mm

![Fix](https://learn.sessionboard.com/images/kb/ac361e12-image-png-Mar-10-2026-07-44-05-4207-PM.png)

- Add Day > Click on Day > Day with leading zero, add a slash: ‘/’, add Month, etc.
  - This is how it needs to look before applying:

![Is how it needs to look before applying](https://learn.sessionboard.com/images/kb/060585d6-image-png-Mar-25-2026-07-52-42-5116-PM.png)

- Once done: File > Download as CSV
- Option B: Use Excel instead of Google Sheets — handles date formatting more predictably
- Option C: Skip re-import, use Bulk Edit directly (Sessions > select > Bulk Edit > Start/End Time)

* * *

## Existing field data is getting overwritten or wiped

[Section titled “Existing field data is getting overwritten or wiped”](https://learn.sessionboard.com/faq/common-csv-xlsx-import-issues-and-how-to-fix-them#existing-field-data-is-getting-overwritten-or-wiped)

### Symptoms

[Section titled “Symptoms”](https://learn.sessionboard.com/faq/common-csv-xlsx-import-issues-and-how-to-fix-them#symptoms-2)

After import, fields not in your spreadsheet are blanked out. Descriptions and custom fields are now empty. Only meant to update dates.

### Why it happens

[Section titled “Why it happens”](https://learn.sessionboard.com/faq/common-csv-xlsx-import-issues-and-how-to-fix-them#why-it-happens-2)

SB maps every column to a field. If a field like Description is present but empty, it overwrites existing data. An empty column means “set this field to empty,” it doesn’t mean “do not update.”

### Fix

[Section titled “Fix”](https://learn.sessionboard.com/faq/common-csv-xlsx-import-issues-and-how-to-fix-them#fix-2)

1. Export existing data first — Sessions > Export. The file includes the Session Friendly ID column.
2. \`\`Add column “Update record if already exists” set to TRUE for every row you want to update. Without this, SB may create duplicates.
3. Make your changes in the relevant columns.
4. At the mapping screen, set “Ignore this column” for any column you’re NOT intentionally changing.
5. Proceed with import.

Always export a backup before importing updates: go to Sessions > Options > Export to download a full copy first.

* * *

## “Session Friendly ID” field — what is it and where does it come from?

[Section titled ““Session Friendly ID” field — what is it and where does it come from?”](https://learn.sessionboard.com/faq/common-csv-xlsx-import-issues-and-how-to-fix-them#session-friendly-id-field--what-is-it-and-where-does-it-come-from)

Session Friendly ID is an internal identifier SB uses to match CSV rows to existing session records.

- Importing new records? Leave Session ID blank — SB generates IDs automatically.
- Updating existing records? Use the Session ID from a previous SB export so the system matches the right record.
- Do NOT invent your own Session ID values — only use values from a Sessionboard export.

![‘Session Friendly ID’ field — what is it and where does it come from?](https://learn.sessionboard.com/images/kb/2252ec46-image-png-Mar-10-2026-09-09-10-0478-PM.png)

* * *

## Importing session times and rooms from Excel

[Section titled “Importing session times and rooms from Excel”](https://learn.sessionboard.com/faq/common-csv-xlsx-import-issues-and-how-to-fix-them#importing-session-times-and-rooms-from-excel)

1. Download the Sessions import template: Sessions > Import > Download Template
2. Copy session data into template, matching column headers exactly
3. Date format: YYYY-MM-DD HH:mm (e.g. 2026-03-25 18:00)
4. For Room/Location, use exact room name as it appears in event settings
5. Phone numbers must include country + area code in the following format:
6. \`\`+1 (123)456-7891
7. Save as .csv (UTF-8 encoding) as preferred instead of .xlsx
8. At mapping step, use “Ignore this column” for any fields you’re not setting

* * *

## Custom fields not appearing during import mapping

[Section titled “Custom fields not appearing during import mapping”](https://learn.sessionboard.com/faq/common-csv-xlsx-import-issues-and-how-to-fix-them#custom-fields-not-appearing-during-import-mapping)

Symptoms: You created custom fields in Sessionboard, but they don’t appear as mapping options when importing a CSV.

Why: Custom fields must be added to your module’s table view before they appear as import mapping options. If they’re not visible in your Sessions, Contacts, or Speakers table, they won’t show up during import.

Fix:

1. Go to the relevant module (e.g. Contacts)
2. Click the Columns button to manage visible fields

![Custom fields not appearing during import mapping](https://learn.sessionboard.com/images/kb/cc4767a5-image-png-Mar-10-2026-09-13-01-3267-PM.png)

3. Add your custom fields to the table view
4. Re-download the import template via Import > Template — your custom fields will now be included as column headers
5. Re-attempt the import

Before you import — checklist

- Export a backup of existing data first
- Use the Sessionboard-provided template on Options > Import > Template (not a custom spreadsheet)
- Date/time format: YYYY-MM-DD HH:mm (e.g. 2026-03-25 18:00)
- Set “Ignore this column” for every field you’re not intentionally updating
- Keep files under the 1,000 record limit per import
- Try to avoid special characters (“, &, <, >)
  - While these were recently allowed, some of these might still cause issues when reading the file.
- We suggest saving/exporting as .csv (UTF-8 encoding), instead of .xlsx

* * *

## Still having issues?

[Section titled “Still having issues?”](https://learn.sessionboard.com/faq/common-csv-xlsx-import-issues-and-how-to-fix-them#still-having-issues)