---
url: "https://learn.sessionboard.com/apps/snoball-integration"
title: "Snöball | Sessionboard Help Center"
---

[Skip to content](https://learn.sessionboard.com/apps/snoball-integration#_top)

# Snöball

Snöball is an event marketing tool that taps into your speakers’, partners’, and attendees’ professional circles and builds up your community and, in turn, your attendance.

Sessionboard users can connect their events with Snöball and sync session and speaker data from Sessionboard to Snöball so that ‘share your participation’ links can be generated in Snöball and sent back to Sessionboard:

* * *

## Connect integration

[Section titled “Connect integration”](https://learn.sessionboard.com/apps/snoball-integration#connect-integration)

### Retrieve API Key

[Section titled “Retrieve API Key”](https://learn.sessionboard.com/apps/snoball-integration#retrieve-api-key)

Integrations are connected on the organization level in Sessionboard.

After logging in, click “Organization Dashboard“ to access your event’s organization:

![Retrieve API Key](https://learn.sessionboard.com/images/kb/f5a64c87-image-png-Feb-26-2026-05-23-13-0299-PM.png)

Or, from your event, you can click Back to organization:

![From your event, you can click Back to organization](https://learn.sessionboard.com/images/kb/3ce332e9-image-png-Feb-26-2026-05-22-06-6541-PM.png)

Select the ‘Settings’ module to locate ‘API Tokens’

![Select the ‘Settings’ module to locate ‘API Tokens’](https://learn.sessionboard.com/images/kb/64349e7d-image-png-Feb-27-2026-02-46-06-6884-PM.png)

Select the Create Token button to generate a new API key for your event.

Once a token has been generated, you can copy the token to share with Snöball.

![Once a token has been generated, you can copy the token to share with Snöball](https://learn.sessionboard.com/images/kb/9ad9c206-image-png-Feb-27-2026-02-46-55-5092-PM.png)

### Retrieve Event ID

[Section titled “Retrieve Event ID”](https://learn.sessionboard.com/apps/snoball-integration#retrieve-event-id)

In your organization’s Dashboard, select the event you would like to access.

![Retrieve Event ID](https://learn.sessionboard.com/images/kb/09ca998f-image-png-Feb-27-2026-02-47-44-8984-PM.png)

\`\`Within the page address bar, locate the 2-4 digit number within the event URL that proceeds [https://appv2.sessionboard.com/event/.This](https://appv2.sessionboard.com/event/.This) is your event ID.

![Within the page address bar](https://learn.sessionboard.com/images/kb/24c5475e-image-png-Feb-27-2026-02-48-56-1303-PM.png)

* * *

## Create Snöball link field

[Section titled “Create Snöball link field”](https://learn.sessionboard.com/apps/snoball-integration#create-sn%C3%B6ball-link-field)

Within your event, navigate to the Library > Fields module to create a field that will be used to display the links sent from Snöball.

SPEAKERS: Create a Contact field

SPONSORS: Create a Group field​

![Create Snöball Link Field](https://learn.sessionboard.com/images/kb/b2855d46-image-png-Feb-27-2026-02-51-53-7561-PM.png)

Select the + Add Field button to the right of your screen to create a new field.

![Select the + Add Field button to the right of your screen to create a new field](https://learn.sessionboard.com/images/kb/2900dc84-image-png-Feb-27-2026-09-38-15-3792-PM.png)

Within the pop-up modal, fill in the fields below. Ensure to Save Changes to your field once complete:

- Field Name: Snoball Link
- Field Type: Text
- Field Level: Event Field

![Field Level](https://learn.sessionboard.com/images/kb/8ea05333-image-png-Feb-27-2026-02-54-29-3047-PM.png)

* * *

## Share API key & event ID with Snöball

[Section titled “Share API key & event ID with Snöball”](https://learn.sessionboard.com/apps/snoball-integration#share-api-key--event-id-with-sn%C3%B6ball)

Once you have located/generated your API Token and Event ID, share these details with Snöball so they can connect your Snöball instance with your Sessionboard event.

* * *

## Create Snöball portal task

[Section titled “Create Snöball portal task”](https://learn.sessionboard.com/apps/snoball-integration#create-sn%C3%B6ball-portal-task)

So that your event contacts can access the Snoball URL and share their participation with their community, event admins need to create a task that will be accessible to your event contacts (i.e. speakers & sponsors) within their portal.

1. Within your event, navigate to the Portals module and select the page Tasks.

![Create Snöball Portal Task](https://learn.sessionboard.com/images/kb/45ab48ac-image-png-Feb-27-2026-02-55-45-1232-PM.png)

2. Select the “Add Task” button to open a pop-up modal
3. Within the pop-up modal, create a task that references the following criteria:
4. Task (Name): Snöball - Share Your Participation
5. Contact Type:
6. SPEAKERS: Select People
7. SPONSORS: Select Groups
8. Description: Example descriptions can include: “Click here to invite your network to attend your presentation.”
9. Task Link: Select Use Field. Within the pop-up window, locate and select the field you previously created (Snoball URL).
10. Ensure to select the Create Task button once you have completed creating your task.

![Ensure to select the Create Task button once you have completed creating your task](https://learn.sessionboard.com/images/kb/1de94851-image-png-Feb-27-2026-03-00-57-8330-PM.png)

* * *

## Assign Snöball task to portal

[Section titled “Assign Snöball task to portal”](https://learn.sessionboard.com/apps/snoball-integration#assign-sn%C3%B6ball-task-to-portal)

Once you have created your task, the task will need to be assigned to the portal(s) your event contacts have access to.

![Assign Snöball Task to Portal](https://learn.sessionboard.com/images/kb/57a0105a-image-png-Feb-26-2026-07-39-38-6212-PM.png)

2. Within the Tasks widget, select the Add button to open a pop-up window. This will show any tasks you have created to select and assign to your portal.

![Within the Tasks widget, select the Add button to open a pop-up window](https://learn.sessionboard.com/images/kb/5607bb0c-image-png-Feb-26-2026-07-46-11-5983-PM.png)

3. Once the tasks have been assigned, you can edit additional settings by selecting the pencil under “Actions”.​​

![Once the tasks have been assigned, you can edit additional settings by selecting the pencil under “Actions”](https://learn.sessionboard.com/images/kb/ba5da436-undefined-Feb-27-2026-03-07-17-6087-PM.png)

1. Alias: Adjust the name of what the task will be listed as in the portal
2. Required: Tasks can be marked as required by toggling this button on. This action can also be done from the portal main menu.
3. Due Date: Assign a due date to each task that the portal user can track.
4. Extended Due Date: Allow task completion beyond the regular due date. ​

![Extended Due Date](https://learn.sessionboard.com/images/kb/806d713a-undefined-Feb-26-2026-07-52-04-4047-PM.png)

4. Once complete, ensure to click the Update button in the pop-up window.

### Portal View How to view a portal as an Admin

[Section titled “Portal View How to view a portal as an Admin”](https://learn.sessionboard.com/apps/snoball-integration#portal-view-how-to-view-a-portal-as-an-admin)

![Portal View How to view a portal as an Admin](https://learn.sessionboard.com/images/kb/13f6e7af-image-png-Mar-03-2026-07-49-49-4775-PM.png)