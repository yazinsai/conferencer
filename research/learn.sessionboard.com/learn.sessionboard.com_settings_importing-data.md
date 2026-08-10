---
url: "https://learn.sessionboard.com/settings/importing-data"
title: "Importing data | Sessionboard Help Center"
---

[Skip to content](https://learn.sessionboard.com/settings/importing-data#_top)

# Importing data

Importing helps users create new event contacts, sessions, exhibitors, and sponsors, as well as update fields for existing records.

* * *

Before you start importing, let’s review some important requirements for your import file.

## File Requirements & Technical Limitations

[Section titled “File Requirements & Technical Limitations”](https://learn.sessionboard.com/settings/importing-data#file-requirements--technical-limitations)

- Imported files must be saved as UTF-8. Excel files: Excel does this by default in North America. For other regions, open in Excel, go to File → Save As, choose “CSV (Comma delimited)” and in the Tools dropdown next to Save, select “Web Options” → Encoding → UTF-8 Google Sheets: Download → CSV automatically gives you UTF-8 Database exports: Look for encoding options and select UTF-8
- The limit of records that can be imported per file is 1000.
- Phone numbers (i.e., Mobile Phone & Home Phone fields) must be in the following format: +1 (123)456-7891
- Numbers must include the country code as well as the area code. Ex: +1 (123)456-7891 > +1 is the country code Ex: +1 (123)456-7891 > 123 is the area code
- URLs (i.e., website, LinkedIn URL, headshots) should be provided in the following format: [https://sample-website.com](https://sample-website.com/).
- Multi-select fields (i.e., tags) should be separated by a pipe (\|). (Ex: Convertible \| Two Door)
- Currency & file field types (excluding headshot) can not be imported.
- Session dates and times should be in the following format: YYYY-MM-DD HH:mm (Example: 2024-08-14 09:30) The formatting of session dates and times ensures that Sessionboard is most consistent across all regions.

How to remove date/time formatting in an Excel file:

When entering date and time values into an Excel cell, Excel might automatically reformat these entries in a way that isn’t compatible with Sessionboard. To ensure proper data import into Sessionboard, admin users should follow the instructions below to remove any automatic formatting applied by Excel.

1. Select the cell(s) that you’ll enter numbers into.
2. Press Ctrl + 1 (the 1 in the row of numbers above the QWERTY keys) to open Format Cells.
3. Select Text, and then click OK

![File Requirements & Technical Limitations](https://learn.sessionboard.com/images/kb/8df67c25-Screenshot-2024-02-26-at-7_25_57-AM-1.png)

## Step 1: Create Custom Fields

[Section titled “Step 1: Create Custom Fields”](https://learn.sessionboard.com/settings/importing-data#step-1-create-custom-fields)

Before importing your data, you may want to create any custom fields you need so that data can be imported directly into them.

First, review all of the standard fields available in Sessionboard. If you need to import data into fields that are not part of the standard set, create custom fields in advance.

![Step 1: Create Custom Fields](https://learn.sessionboard.com/images/kb/694c178f-image-png-Jul-07-2026-06-34-11-4302-PM.png)

Once your custom fields have been created, ensure to add them to your module view. This ensures they will be included in your import template and allows you to successfully import data into them.

## Step 2: Generate An Import Template

[Section titled “Step 2: Generate An Import Template”](https://learn.sessionboard.com/settings/importing-data#step-2-generate-an-import-template)

1. Within the module you will be importing to (i.e., Contacts, Sessions, Sponsors, or Exhibitors), select Options > Import.

![Step 2: Generate An Import Template](https://learn.sessionboard.com/images/kb/0894e81a-image-png-Jul-07-2026-06-36-58-0597-PM.png)
💡Importing Team Members? To generate an import template for the Event Team module, select Import.

![Importing Team Members?](https://learn.sessionboard.com/images/kb/50365a57-image-png-Jul-07-2026-06-38-26-2927-PM.png)

2. Within the pop-up model, select the option to Generate Import Template. Templates will automatically download to your device as a CSV file.

![Within the pop-up model, select the option to Generate Import Template](https://learn.sessionboard.com/images/kb/bc7e60db-image-png-Feb-02-2026-07-06-30-9741-PM.png)

Session Import Template

When using the Sessions module import template, do not add data to the column Session Friendly ID. Session IDs are assigned to new sessions upon import/creation. This field can be utilized if you wish to import data to update existing sessions.

![When using the Sessions module import template, do not add data to the column Session Friendly ID](https://learn.sessionboard.com/images/kb/389c4889-Screenshot-2024-09-11-at-2_30_06-PM-1.png)

## Step 3: Import New Records

[Section titled “Step 3: Import New Records”](https://learn.sessionboard.com/settings/importing-data#step-3-import-new-records)

For this demonstration, we will review importing contacts; however, this workflow can be followed for importing sessions, exhibitors, sponsors, and team members.

1. Within the module you will be importing to (i.e. Contacts, Speakers, Sessions, Sponsors, or Exhibitors), select Options > Import.

![Step 3: Import New Records](https://learn.sessionboard.com/images/kb/0894e81a-image-png-Jul-07-2026-06-36-58-0597-PM.png)

2. Within the pop-up model, select Upload a file to import. You will be prompted to either select a file on your device to import or copy and paste data into a table.

![Within the pop-up model, select Upload a file to import](https://learn.sessionboard.com/images/kb/bcf8e85d-image-png-Feb-02-2026-07-07-24-7088-PM.png)

3. Select if your file has a header or not to continue with the importing process. Once completed, select the blue ‘Next’ button at the bottom right-hand corner of the screen.

![Select if your file has a header or not to continue with the importing process](https://learn.sessionboard.com/images/kb/b6990ebf-Screenshot-2023-10-25-at-6_08_49-PM-1.png)

4. Map your fields: Within this window, you will have 2 columns. The left column provides all of the fields within the event while the right column shows you what fields were included in your imported file. Map your file fields to the fields reflected in the event. Once completed, select the blue ‘Next’ button at the bottom right-hand corner of the screen.

![Map your fields](https://learn.sessionboard.com/images/kb/73e507f2-Screenshot-2023-10-25-at-6_11_26-PM-1.png)

5. The last step is to verify that the data is correct. The system will highlight any rows that may need additional attention if a field is invalid. Click on the red cell(s) to identify the error and make updates as needed.

![The last step is to verify that the data is correct](https://learn.sessionboard.com/images/kb/82381418-Screenshot-2023-10-25-at-6_15_54-PM-1.png)

6. Click the blue ‘Submit’ button at the bottom right-hand corner of the pop-up window for the system to proceed with importing your data.
7. Once your data has been successfully imported into your event, you will receive a confirmation message on the screen.​

![Once your data has been successfully imported into your event](https://learn.sessionboard.com/images/kb/cec97dde-Screenshot-2023-10-25-at-6_17_56-PM-1.png)

## Import to update existing records

[Section titled “Import to update existing records”](https://learn.sessionboard.com/settings/importing-data#import-to-update-existing-records)

### Step 1: Export Data

[Section titled “Step 1: Export Data”](https://learn.sessionboard.com/settings/importing-data#step-1-export-data)

Before importing updates, it’s important to export your existing data. This ensures that the system updates the correct records rather than creating duplicates.

Contacts (i.e., Speakers, Moderators, Chairperson)

1. Navigate to the Contacts module.
2. Update your module table view to include the following fields:
3. First Name (required for importing)
4. Last Name (required for importing)
5. Email (used as the unique identifier to locate the existing record)
6. Any additional fields you plan to update
7. Click Options > Export to export your data as a CSV or XLSX file.

Groups (i.e., Sponsors & Exhibitors)

1. Navigate to the Sponsors or Exhibitors module.
2. Update your module table view to include the following fields:
3. Name (used as the unique identifier to locate the existing record)
4. Any additional fields you plan to update

![Step 1: Export Data](https://learn.sessionboard.com/images/kb/5acb5613-image-png-Feb-23-2026-11-14-36-7887-PM.png)

3. Click Options > Export to export your data as a CSV or XLSX file.

Sessions

1. Navigate to the Sessions module.
2. Update your module table view to include the following fields:
3. Status (required for importing)
4. Title (required for importing)
5. Session ID (used as the unique identifier to locate the existing record)

![Step 1: Export Data](https://learn.sessionboard.com/images/kb/bb68f52c-Screenshot-2026-04-06-at-4.45.55-PM.png)

4. Any additional fields you plan to update
5. Click Options > Export to export your data as a CSV or XLSX file.

### Step 2: Update Your Exported File

[Section titled “Step 2: Update Your Exported File”](https://learn.sessionboard.com/settings/importing-data#step-2-update-your-exported-file)

1. Open the exported file.
2. Update the fields you want to edit.
3. Add a new column titled “Update record if already exists”.
4. In this column, enter TRUE for all records/rows you wish to update. Delete any records/rows you do not wish to udpate.

![Step 2: Update Your Exported File](https://learn.sessionboard.com/images/kb/5c295274-Screenshot-2024-02-14-at-1_59_46-PM-1.png)

5. Save the updated file to your device.

### Step 3: Import to Update Records

[Section titled “Step 3: Import to Update Records”](https://learn.sessionboard.com/settings/importing-data#step-3-import-to-update-records)

Follow Step 3 above to import your file.

![Step 3: Import to Update Records](https://learn.sessionboard.com/images/kb/e4591d56-Screenshot-2024-09-11-at-2_25_06-PM-1.png)