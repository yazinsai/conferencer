---
url: "https://learn.sessionboard.com/faq/task-use-field"
title: "Personalize a task with the Use Field option | Sessionboard Help Center"
---

[Skip to content](https://learn.sessionboard.com/faq/task-use-field#_top)

# Personalize a task with the Use Field option

A task is a general action item within the portal that a user or group must complete by a specified deadline.

When creating a task, you can choose to display a shared description and task link that will be visible to all portal users, or you can use a field that displays a unique description and task link for each user. This allows the content of the task to be personalized per user.

![Personalize a task with the Use Field option](https://learn.sessionboard.com/images/kb/fceb72f1-Screenshot-2025-06-11-at-2.34.33-PM.png)

![Personalize a task with the Use Field option](https://learn.sessionboard.com/images/kb/34d403cc-Screenshot-2025-06-11-at-2.35.58-PM.png)

|  |  |
| --- | --- |

Use the instructions below to learn how to share a unique description/task link for each user:

## Create custom field (optional)

[Section titled “Create custom field (optional)”](https://learn.sessionboard.com/faq/task-use-field#create-custom-field-optional)

Before you create your task, it’s important to ensure you know what field you want for the task description and task link. This field will display the unique description and/or link to your portal users.

You can either use a standard field provided by Sessionboard or create a custom field using the steps outlined below:

1. Within the Library > Fields module, select the appropriate field type at the top of the page based on the type of field you want to create: Contact, Group, or Session. Contact Task - use a contact field Group Task - use a group field Session Task - use a session field

![Create Custom Field](https://learn.sessionboard.com/images/kb/cb1f2c28-image-png-Feb-24-2026-10-24-32-8927-PM.png)

2. Click the + Add Field button in the top-right corner.

![Click the + Add Field button in the top-right corner](https://learn.sessionboard.com/images/kb/6317b925-image-png-Feb-24-2026-10-24-48-2349-PM.png)

3. Within the pop-up modal, define the details of your new field by adding a field name and selecting the field type (i.e., dropdown, file, text, checkbox) from the dropdown menu. NOTE: If you are creating a field for the task link, we recommend utilizing a text area field type. Links should be formatted with the http:// or https:// prefix (ex: [https://www.sessionboard.com/](https://www.sessionboard.com/)).

![Within the pop-up modal](https://learn.sessionboard.com/images/kb/7f7d7ad2-image-png-Feb-24-2026-10-25-49-7965-PM.png)

4. Once you’ve completed all the details, click Save Changes to add your new field. The custom field will now appear in the list of fields under the selected category and is ready to use.

## Import data to custom/standard field

[Section titled “Import data to custom/standard field”](https://learn.sessionboard.com/faq/task-use-field#import-data-to-customstandard-field)

After creating a custom field or identifying the standard field you’d like to use, be sure to update all relevant records (e.g., contacts, sessions, or groups) with the information you want to display in the task description or as the task link using that field. You can do this manually or via import.

Follow the steps below to import data into the field(s) you plan to use.

01. Navigate to the module that corresponds to the field you will be utilizing.
02. Contacts Module > Contact Field
03. Sponsors/Exhibitors Module > Group Field
04. Sessions Module > Session Field
05. Adjust your table view to include the following fields:
06. Contacts Module
07. First Name
08. Last Name
09. Email
10. Custom/standard field(s) you will be using for the task
11. Sponsors/Exhibitors Module
12. Name
13. Custom/standard field(s) you will be using for the task
14. Sessions Module
15. Session ID
16. Title
17. Status
18. Custom/standard field(s) you will be using for the task
19. Select Options > Export .CSV or Export .XLSX - This will serve as your import template.

![Import Data to Custom/Standard Field](https://learn.sessionboard.com/images/kb/1a2e4c22-image-png-Feb-24-2026-10-28-25-5485-PM.png)

4. Within your exported file, add a column with the title Update record if already exists associated with the word TRUE for each row.

![Screenshot+2024-02-14+at+1_59_46 PM-1](https://learn.sessionboard.com/images/kb/1a9972ef-Screenshot-2024-02-14-at-1_59_46-PM-1.webp)

5. Add the missing data to the column you’ll use for your task description or link. This can be either a custom field you’ve created or a standard field available to you.
6. Once your file is complete, reimport it into your event.

![Screenshot+2024-09-11+at+2_25_06 PM-1](https://learn.sessionboard.com/images/kb/fb4d2cfd-Screenshot-2024-09-11-at-2_25_06-PM-1.png)

Create A Task Using A Field

Now that you have created and added data to your fields, it is time to create the task to which you will connect the fields.

1. Navigate to Portals > Tasks and select the +Add Task button on the right-hand side of your page.

![Navigate to Portals > Tasks and select the +Add Task button on the right-hand side of your page](https://learn.sessionboard.com/images/kb/62d26625-image-png-Feb-24-2026-10-29-21-5730-PM.png)

2. Within the pop-up, add a task name and select the type of task you are creating.

![Within the pop-up, add a task name and select the type of task you are creating](https://learn.sessionboard.com/images/kb/4137aa27-image-png-Feb-24-2026-10-29-52-9719-PM.png)

3. For the field Description, select the option Use Field.

![For the field Description, select the option Use Field](https://learn.sessionboard.com/images/kb/18eb8040-image-png-Feb-24-2026-10-30-14-0693-PM.png)

4. Within the pop-up, select the field you would like to use as the task description

![Within the pop-up, select the field you would like to use as the task description](https://learn.sessionboard.com/images/kb/3311784b-image-png-Feb-24-2026-10-30-36-6671-PM.png)

5. For the field Task Link, select the option Use Field.

![For the field Task Link, select the option Use Field](https://learn.sessionboard.com/images/kb/ea85d3e2-image-png-Feb-24-2026-10-30-59-8136-PM.png)

6. Within the pop-up, select the field you would like to use as the task link

![Within the pop-up, select the field you would like to use as the task link](https://learn.sessionboard.com/images/kb/1205e56e-image-png-Feb-24-2026-10-31-17-2596-PM.png)

7. Once complete, don’t forget to click Create Task.

![Once complete, don’t forget to click Create Task](https://learn.sessionboard.com/images/kb/e12330d2-image-png-Feb-24-2026-10-31-33-6534-PM.png)