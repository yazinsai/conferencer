---
url: "https://learn.sessionboard.com/apps/asp-integration"
title: "ASP | Sessionboard Help Center"
---

[Skip to content](https://learn.sessionboard.com/apps/asp-integration#_top)

# ASP

![ASP logo](https://learn.sessionboard.com/logo/apps/asp-integration.png)

Click HERE to see an example of an event within ASP syncing from Sessionboard.

ASP is a CMS platform that facilitates building event websites with several layouts to feature event sessions, speakers, exhibitors, and other types of content.

Sessionboard users can connect their events with ASP Events and sync session and speaker data from Sessionboard to ASP Events. This one-way integration is a user-friendly process that facilitates data transfer to ASP Events once users have approved and scheduled their sessions in Sessionboard:

* * *

## Connect integration

[Section titled “Connect integration”](https://learn.sessionboard.com/apps/asp-integration#connect-integration)

Integrations are connected on the organization level in Sessionboard.

After logging in, click “Organization Dashboard“ to access your event’s organization:

![Connect Integration](https://learn.sessionboard.com/images/kb/f5a64c87-image-png-Feb-26-2026-05-23-13-0299-PM.png)

Or, from your event, you can click Back to organization:

![From your event, you can click Back to organization](https://learn.sessionboard.com/images/kb/3ce332e9-image-png-Feb-26-2026-05-22-06-6541-PM.png)

Select the ‘Settings’ module to locate ‘Integrations’.

![Select the ‘Settings’ module to locate ‘Integrations’](https://learn.sessionboard.com/images/kb/cc340125-image-png-Feb-26-2026-05-26-46-7552-PM.png)

There, you can connect new or manage existing integrations. To connect a new integration, click the “Connect” button below the integration.

![There, you can connect new or manage existing integrations](https://learn.sessionboard.com/images/kb/35c69b4d-image-png-Feb-26-2026-05-27-36-6396-PM.png)

For ASP Events, enter the API key and secret associated with your event.

![For ASP Events, enter the API key and secret associated with your event](https://learn.sessionboard.com/images/kb/508d3b73-image-png-Feb-26-2026-05-28-24-7214-PM.png)

Enable **Continuous Sync** to create/update records on a regular interval (approx. 30 minutes) so that admins don’t have to force sync them. The admin can still manually push a sync if they want to update between the sync intervals.

* * *

## Map events

[Section titled “Map events”](https://learn.sessionboard.com/apps/asp-integration#map-events)

Once the integration is connected, a window will appear prompting you to map your ASP Events events with Sessionboard ones. Select the Sessionboard Event from the dropdown list, then choose the ASP Event in the right-hand dropdown.

Enter the Seminar ID that you want the sessions to be synced to.

Click “Add Mapping” to complete the mapping process.

![Map Events](https://learn.sessionboard.com/images/kb/40d3dc89-image-png-Feb-26-2026-06-16-36-4788-PM.png)
Mapping Criteria

1. More than one event can be mapped per Sessionboard organization.
2. At least one Sessionboard event must be mapped to ASP Events for the sync option to appear in the UI.
3. Once an ASP event has been mapped to a Sessionboard event, neither can be re-mapped to another event.

* * *

## Event Settings

[Section titled “Event Settings”](https://learn.sessionboard.com/apps/asp-integration#event-settings)

Once your events have been connected, your next window will allow you to setyour designated event settings. Within the dropdown, be sure you have selected the correct event that you wish to establish the settings for.

![Event Settings](https://learn.sessionboard.com/images/kb/f70a9cf3-Screenshot-2026-05-07-at-12.43.47-PM.png)

Only your Accepted Sessions and the associated speakers will sync to ASP.If you delete (or change to a status other than accepted) a previously synced session or speaker in Sessionboard then by default we will mark said record as inactive/unpublished within the ASP instance.If you check the above settings then the session/speaker will not be updated and will need to be manually removed from ASP if desired.

## Mapping session fields

[Section titled “Mapping session fields”](https://learn.sessionboard.com/apps/asp-integration#mapping-session-fields)

Once your event settings are completed, your next window will allow you to map your designated session fields. Within the dropdown, be sure you have selected the correct event that you wish to map the session fields for.

![Mapping Session Fields](https://learn.sessionboard.com/images/kb/dd7a4c3e-image-png-Feb-26-2026-05-42-09-6906-PM.png)

The default fields will populate within the session field mapper. You will be able to map additional fields by selecting “Add Field Mapping”. You will then be able to select the Sessionboard field and the destination field in ASP that you wish to be mapped to. For the ASP field you will want to place the ASP field slug just as it appears in your ASP instance.

![The default fields will populate within the session field mapper](https://learn.sessionboard.com/images/kb/a70bcf86-image-png-Feb-26-2026-05-45-03-4741-PM.png)

### Synced Fields

[Section titled “Synced Fields”](https://learn.sessionboard.com/apps/asp-integration#synced-fields)

Sessionboard will sync as much data between systems as possible. It is important to use system/standard fields when possible to collect information about your sessions and speakers to ensure they will be successfully matched.

Below is a list of standard fields that will be synced. Fields with an asterisk (\*) are required.

Sessions

- Title \*
- Starts At datetime\*
- Ends At datetime\*
- Sessions that span multiple dates are not supported in ASP Events and will be synced as the same calendar day.
- Sessions that have passed will not sync into ASP.
- Client Session ID\*
- Sessionboard ID\*
- This must be created in ASP as a custom text field on every event seminar (and named sessionboard\_id). This is where we sync our UUID
- Description
- Format (Session Type)
- Type must match existing in ASP, else, will be created as “Session”
- Field names can not be edited once you have begun syncing to a partner system. To edit a field name, we recommend creating a new field name and associating it with the session before re-syncing.
- Speakers
- Location (Room)
- Field names can not be edited once you have begun syncing to a partner system. To edit a field name, we recommend creating a new field name and associating it with the session before re-syncing.
- Tags (Streams)
- Field names can not be edited once you have begun syncing to a partner system. To edit a field name, we recommend creating a new field name and associating it with the session before re-syncing.
- Assigned tag colors in Sessionboard will also sync to ASP.

### Custom Session Fields

[Section titled “Custom Session Fields”](https://learn.sessionboard.com/apps/asp-integration#custom-session-fields)

If you wish to sync any of the below Sessionboard fields to ASP, these fields MUST be created in ASP exactly as they are listed below in each seminar before syncing your event(s).

- Session Content
- To use this, this must be created in ASP as a custom field on every event seminar (and named sessionboard-content).
- Content files are sent to ASP as a URL.
- The most recent file will be taken from Sessionboard and synced to ASP.
- Levels
- This must be created in ASP as a check box field on every event seminar (and named levels-checkbox).
- Moderators
- This must be created in ASP as a custom speakerlist field on every event seminar (and named panel-moderator). The fields that sync for moderators are the same as the ones Sessionboard syncs for speakers.
- Chairpersons
- This must be created in ASP as a custom speakerlist field on every event seminar (and named chairperson). The fields that sync for chairpersons are the same as the ones Sessionboard syncs for speakers.

* * *

## Mapping speaker fields

[Section titled “Mapping speaker fields”](https://learn.sessionboard.com/apps/asp-integration#mapping-speaker-fields)

Once your session fields are mapped, you will then be prompted to map your speaker fields. The default fields will populate within the speaker field mapper. You will be able to map additional fields by selecting “Add Field Mapping”. You will then be able to select the Sessionboard field and the destination field in ASP that you wish to be mapped to. For the ASP field you will want to place the ASP field slug just as it appears in your ASP instance.

![Mapping Speaker Fields](https://learn.sessionboard.com/images/kb/e72de255-image-png-Feb-26-2026-05-45-39-2397-PM.png)

### Synced Fields

[Section titled “Synced Fields”](https://learn.sessionboard.com/apps/asp-integration#synced-fields-1)

Sessionboard will sync as much data between systems as possible. It is important to use system/standard fields when possible to collect information about your sessions and speakers to ensure they will be successfully matched.

Below is a list of standard fields that will be synced. Fields with an asterisk (\*) are required.

Speakers

- First Name \*
- Last Name \*
- Email \*
- Job Title
- Honorific (Title)
- Company Name
- Website
- Mobile Phone
- Biography
- Headshot
- Facebook URL (Page)
- LinkedIn URL (Page)
- Twitter URL (Page)

* * *

## Syncing sessions and speakers

[Section titled “Syncing sessions and speakers”](https://learn.sessionboard.com/apps/asp-integration#syncing-sessions-and-speakers)

Before initiating a sync, ensure that you have reviewed and accepted the sessions that you want to sync to ASP Events. Sessions must have a date/time and Client Session ID to be synced.

![Syncing Sessions and Speakers](https://learn.sessionboard.com/images/kb/282e2d04-image-png-Feb-26-2026-05-48-11-8979-PM.png)

### Initiate sync

[Section titled “Initiate sync”](https://learn.sessionboard.com/apps/asp-integration#initiate-sync)

1. Go to Sessions > Agenda.
2. Reminder: Only “Accepted” sessions and their associated “Accepted” speakers will be synced.
3. Under Options, click “Sync to ASP”

![Initiate Sync](https://learn.sessionboard.com/images/kb/a4ec2788-image-png-Feb-26-2026-05-53-38-2670-PM.png)

1. A message will flash at the bottom of the screen confirming that the sync has started.
2. When the sync is complete, another message will flash confirming that data has been synced.
3. If there is an issue, a message will appear verifying the number of sessions and speakers that were attempted to sync and that were successfully synced. Please check that your sessions have all the required fields and contact [support@sessionboard.com](mailto:support@sessionboard.com) if you need additional assistance.

### Resync Behavior

[Section titled “Resync Behavior”](https://learn.sessionboard.com/apps/asp-integration#resync-behavior)

Currently, syncing is a one-step process. There is no ability to sync individual sessions or speakers.

On resync, new sessions and speakers that have been added to the agenda in Sessionboard will be sent to ASP Events. Any updates that are made to previously synced fields (such as correcting a speaker’s title or changing a session time) will also be applied.

* * *

## Disconnect Integration

[Section titled “Disconnect Integration”](https://learn.sessionboard.com/apps/asp-integration#disconnect-integration)

To disconnect from the integration, go to your Organization > Settings > Integrations

1. Locate your connected integration and click the three-dot icon to the right of “Settings”.
2. Click “Disconnect Integration.”
3. Confirm that you are sure before deleting the integration.

![Disconnect Integration](https://learn.sessionboard.com/images/kb/25844e16-image-png-Feb-26-2026-05-55-50-4113-PM.png)

Once the integration is disconnected, you can reconnect using a separate API key/secret, or reuse the same credentials.

Disconnecting the integration will disconnect all mapped events. Previously-synced sessions will not be able to be resynced even if you remap the same events. The integration should only be disconnected if you intend to sync to a new organization.

### Remove mapped event

[Section titled “Remove mapped event”](https://learn.sessionboard.com/apps/asp-integration#remove-mapped-event)

To remove event mappings, go to your Organization > Settings > Integrations and click Settings underneath the integration partner you are utilizing.

This will open the mapping window. A list of existing mappings will be displayed. Click “Remove Mapping” to disconnect specific mapped events.

❗ Removing a mapping will not disconnect the integration. Other mapped events will continue to sync on request.

![Remove Mapped Event](https://learn.sessionboard.com/images/kb/baea2935-image-png-Feb-26-2026-05-57-13-7096-PM.png)