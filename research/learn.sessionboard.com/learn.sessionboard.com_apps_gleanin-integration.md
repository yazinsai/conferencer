---
url: "https://learn.sessionboard.com/apps/gleanin-integration"
title: "Gleanin | Sessionboard Help Center"
---

[Skip to content](https://learn.sessionboard.com/apps/gleanin-integration#_top)

# Gleanin

![Gleanin logo](https://learn.sessionboard.com/logo/apps/gleanin-integration.png)

Gleanin is a marketing platform that creates campaigns for participants to become event advocates by sharing their registration and attendance on social media via customized links.

Sessionboard users can connect their events with Gleanin and sync session and speaker data from Sessionboard to Gleanin. Once speakers are synced, their Gleanin share links will be available to distribute from their speaker portal.

This one-way integration is a user-friendly process that facilitates data transfer to Gleanin once users have approved and scheduled their sessions in Sessionboard:

* * *

## Connect integration

[Section titled “Connect integration”](https://learn.sessionboard.com/apps/gleanin-integration#connect-integration)

Integrations are connected on the organization level in Sessionboard.

After logging in, click “Organization Dashboard“ to access your event’s organization:

![Connect Integration](https://learn.sessionboard.com/images/kb/f5a64c87-image-png-Feb-26-2026-05-23-13-0299-PM.png)

Or, from your event, you can click Back to organization:

![From your event, you can click Back to organization](https://learn.sessionboard.com/images/kb/3ce332e9-image-png-Feb-26-2026-05-22-06-6541-PM.png)

Select the ‘Settings’ module to locate ‘Integrations’.

![Select the ‘Settings’ module to locate ‘Integrations’](https://learn.sessionboard.com/images/kb/cc340125-image-png-Feb-26-2026-05-26-46-7552-PM.png)

There, you can connect new or manage existing integrations. To connect a new integration, click the “Connect” button below the integration.

![There, you can connect new or manage existing integrations](https://learn.sessionboard.com/images/kb/e111b74f-image-png-Feb-26-2026-07-06-12-6311-PM.png)

Enter the Gleanin API token associated with your event.

![Enter the Gleanin API token associated with your event](https://learn.sessionboard.com/images/kb/8580f190-image-png-Feb-26-2026-07-06-46-6332-PM.png)

* * *

## Map events

[Section titled “Map events”](https://learn.sessionboard.com/apps/gleanin-integration#map-events)

Once the integration is connected, a window will appear prompting you to map your Gleanin events with Sessionboard events. Select the Sessionboard event from the dropdown list, then choose the Gleanin event in the right-hand dropdown.

Click “Add Mapping” to complete the mapping process.

![Map Events](https://learn.sessionboard.com/images/kb/e9f230b9-image-png-Feb-26-2026-07-07-34-5617-PM.png)

Enable continuous sync to create/update records on a regular interval (approx. 30 minutes) so that admins don’t have to force sync them. The admin can still manually push a sync if they want to update between the sync intervals.

![Enable continuous sync to create/update records on a regular interval (approx. 30 minutes)](https://learn.sessionboard.com/images/kb/8bb16eb7-image-png-Feb-26-2026-07-08-22-7733-PM.png)
Mapping Criteria

1. At least one Sessionboard event must be mapped to Gleanin for the sync option to appear in the UI.
2. Once a Gleanin event has been mapped to a Sessionboard event, neither can be re-mapped to another event.

## Event Settings

[Section titled “Event Settings”](https://learn.sessionboard.com/apps/gleanin-integration#event-settings)

In step 3, you can manage your event settings for your integration. Here, you can toggle to Sync Chairpersons, and toggle to Sync Moderators:

![Event Settings](https://learn.sessionboard.com/images/kb/d10f53fd--1731332F-C323-4003-A191-1CC4DB203FEE--png.png)

You can only choose 1 option:

- Sync SB Track to GL Tracks
- Sync SB Tags to GL Tracks

* * *

## Remove mapping

[Section titled “Remove mapping”](https://learn.sessionboard.com/apps/gleanin-integration#remove-mapping)

To remove event mappings, go to your Organization > Settings > Integrations > Settings.

This will open the mapping window. A list of existing mappings will be displayed. Click “Disconnect” to disconnect specific mapped events.

![Remove Mapping](https://learn.sessionboard.com/images/kb/0d2569f7-image-png-Feb-26-2026-07-16-43-2582-PM.png)

* * *

## Syncing sessions, speakers, and exhibitors

[Section titled “Syncing sessions, speakers, and exhibitors”](https://learn.sessionboard.com/apps/gleanin-integration#syncing-sessions-speakers-and-exhibitors)

Before initiating a sync, ensure that you have reviewed and accepted the sessions that you want to sync to Gleanin. Sessions must have a date and time to be synced.

![Syncing Sessions, Speakers, and Exhibitors](https://learn.sessionboard.com/images/kb/282e2d04-image-png-Feb-26-2026-05-48-11-8979-PM.png)

Sessionboard is not able to sync speakers to existing contacts in Gleanin. To ensure a seamless syncing of data, we require you to delete/disconnect contacts within Gleanin that have similar email addresses as speakers within Sessionboard.

### Synced Fields

[Section titled “Synced Fields”](https://learn.sessionboard.com/apps/gleanin-integration#synced-fields)

Sessionboard will endeavor to sync as much data between systems as possible. It is important to use system fields when possible to collect information about your sessions and speakers to ensure they will be successfully matched.

Below is a list of standard fields that will be synced. Fields with an asterisk (\*) are required.

Sessions

- Title\*
- Starts At date & time\*
- Ends At date & time\*
- Sessions that have passed will not sync.
- Description

Speakers

- First Name \*
- Last Name \*
- Email \*
- Job Title
- Company Name
- Headshot
- NOTE: Gleanin does not support .heic (High-Efficiency Image Container) files.

### Exhibitors

[Section titled “Exhibitors”](https://learn.sessionboard.com/apps/gleanin-integration#exhibitors)

The process to sync will be available from the Exhibitors module under ‘Options’.

- Primary Contact Name > This field will be synced to the field ‘Company Name’ in Gleanin.
- Primary Contact Email Address > This field will be synced to the field ‘E-Mail Address’ in Gleanin.
- Logo
- For updates to this field that may need to be synced to Gleanin, an update has to be on the contact level. We recommend adding a space after either the first or last name so that the system can update the whole record.

* * *

## Initiate sync

[Section titled “Initiate sync”](https://learn.sessionboard.com/apps/gleanin-integration#initiate-sync)

1. Go to your event Sessions > Agenda.
2. Under Options, click “Sync to Gleanin”

![Initiate Sync](https://learn.sessionboard.com/images/kb/26eb2b99-image-png-Feb-26-2026-07-18-55-3045-PM.png)

1. A message will flash at the bottom of the screen confirming that the sync has started.
2. When the sync is complete, another message will flash confirming that data has been synced.
3. If there is an issue, a message will appear verifying the number of sessions and speakers that were attempted to sync and that successfully synced. Please check that your sessions have all the required fields and contact us if your issue persists.

### Resync Behavior

[Section titled “Resync Behavior”](https://learn.sessionboard.com/apps/gleanin-integration#resync-behavior)

Currently, syncing is a one-step process. There is no ability to sync individual sessions or speakers.

On resync, new sessions and speakers that have been added to the agenda in Sessionboard will be sent to Gleanin. Any updates that are made to previously synced fields (such as correcting a speaker’s title or changing a session time) will also be applied.

* * *

## Create Gleanin link task

[Section titled “Create Gleanin link task”](https://learn.sessionboard.com/apps/gleanin-integration#create-gleanin-link-task)

Gleanin supports the ability to sync contacts as exhibitors and generate custom share links for each team member. Once Gleanin links are available for each speaker or contact, they will be shown in the Sessionboard dashboard under “Gleanin Link” _The Gleanin Link field will auto create upon the connection of the integration_ Once you have your links in Sessionboard you will want to create a Portal Task. This will allow for said contacts to access their link in their portal. 👉🏽 See our guide on how to Create & Assign Tasks

1. Within your event, navigate to the Portals module and select the page Tasks.
2. Select the “Add Task” button to open a pop-up modal

![Create Gleanin Link Task](https://learn.sessionboard.com/images/kb/3f170585-image-png-Feb-26-2026-07-20-18-3335-PM.png)

3. Within the pop-up modal, create a task that references the below criteria:
4. Task (Name): Gleanin - Share Your Participation (Or any naming convention that aligns with your event)
5. Contact Type:
6. SPEAKERS: Select Contacts
7. Exhibitors: Select Groups
8. Description: Example descriptions can include: “Click here to invite your network to attend your presentation.”
9. Task Link: Select Use Field. Within the pop-up window, locate and select the field (Gleanin Link).
10. Ensure to select the Create Task button once you have completed creating your task.

![Ensure to select the Create Task button once you have completed creating your task](https://learn.sessionboard.com/images/kb/ad7dc47d-image-png-Feb-26-2026-07-36-50-4176-PM.png)

* * *

## Assign task to portal

[Section titled “Assign task to portal”](https://learn.sessionboard.com/apps/gleanin-integration#assign-task-to-portal)

Once you have created your task, the task will need to be assigned to the portal(s) your event contacts have access to.

![Assign Task to Portal](https://learn.sessionboard.com/images/kb/57a0105a-image-png-Feb-26-2026-07-39-38-6212-PM.png)

2. Within the Tasks widget, select the Add button to open a pop-up window. This will show any tasks you have created to select and assign to your portal.

![Within the Tasks widget, select the Add button to open a pop-up window](https://learn.sessionboard.com/images/kb/5607bb0c-image-png-Feb-26-2026-07-46-11-5983-PM.png)

3. Once the tasks have been assigned, you can edit additional settings by selecting the pencil under “Actions”.​

![Once the tasks have been assigned, you can edit additional settings by selecting the pencil under “Actions”](https://learn.sessionboard.com/images/kb/f508e2b5-image-png-Feb-26-2026-07-47-05-4152-PM.png)

1. Alias: Adjust the name of what the task will be listed as in the portal
2. Required: Tasks can be marked as required by toggling this button on. This action can also be done from the portal’s main menu.
3. Due Date: Assign a due date to each task that the portal user can track.
4. Extended Due Date: Allow task completion beyond the regular due date.

![Extended Due Date](https://learn.sessionboard.com/images/kb/806d713a-undefined-Feb-26-2026-07-52-04-4047-PM.png)

4. Once complete, ensure to click the Update button in the pop-up window.

* * *

## Disconnect Integration

[Section titled “Disconnect Integration”](https://learn.sessionboard.com/apps/gleanin-integration#disconnect-integration)

To disconnect from the integration, go to your Organization > Settings > Integrations

1. Locate your connected integration and click the three-dot icon beside Settings
2. Click “Disconnect Integration.”
3. Confirm that you are sure before deleting the integration.

Once the integration is disconnected, you can reconnect using a separate API token or reuse the same credentials.

Disconnecting the integration will disconnect all mapped events. Previously-synced sessions cannot be able to be resynced even if you remap the same events. The integration should only be disconnected if you intend to sync to a new organization.