---
url: "https://learn.sessionboard.com/apps/grip-integration"
title: "Grip | Sessionboard Help Center"
---

[Skip to content](https://learn.sessionboard.com/apps/grip-integration#_top)

# Grip

![Grip logo](https://learn.sessionboard.com/logo/apps/grip-integration.png)

![Grip](https://learn.sessionboard.com/images/kb/52f10188-Integration-3--1.png)

Grip is the leading AI-powered event networking solution for Virtual, Hybrid, and In-person events.

Sessionboard users can connect their events with Grip and sync session and speaker data from Sessionboard to Grip. This one-way integration is a user-friendly process that facilitates data transfer to Grip once users have approved and scheduled their sessions in Sessionboard:

* * *

## Connect integration

[Section titled “Connect integration”](https://learn.sessionboard.com/apps/grip-integration#connect-integration)

Integrations are connected on the organization level in Sessionboard.

After logging in, click “Organization Dashboard“ to access your event’s organization:

![Connect Integration](https://learn.sessionboard.com/images/kb/f5a64c87-image-png-Feb-26-2026-05-23-13-0299-PM.png)

Or, from your event, you can click Back to organization:

![From your event, you can click Back to organization](https://learn.sessionboard.com/images/kb/3ce332e9-image-png-Feb-26-2026-05-22-06-6541-PM.png)

Select the ‘Settings’ module to locate ‘Integrations’.

![Select the ‘Settings’ module to locate ‘Integrations’](https://learn.sessionboard.com/images/kb/cc340125-image-png-Feb-26-2026-05-26-46-7552-PM.png)

There, you can connect new or manage existing integrations. To connect a new integration, click the “Connect” button below the integration.

![There, you can connect new or manage existing integrations](https://learn.sessionboard.com/images/kb/1e6ef467-image-png-Feb-26-2026-07-57-25-8653-PM.png)
You will want to “Add New Connection”

![You will want to “Add New Connection”](https://learn.sessionboard.com/images/kb/1375046e-image-png-Feb-26-2026-07-57-51-5525-PM.png)

Enter the API token associated with your Grip event.

![Enter the API token associated with your Grip event](https://learn.sessionboard.com/images/kb/ba9851c0-image-png-Feb-26-2026-07-58-05-0928-PM.png)

### Helpful Tip

[Section titled “Helpful Tip”](https://learn.sessionboard.com/apps/grip-integration#helpful-tip)

Enable continuous sync to create/update records on a regular interval (approx. 30 minutes) so that admins don’t have to force sync them. The admin can still manually push a sync if they want to update between the sync intervals.

* * *

## Map events

[Section titled “Map events”](https://learn.sessionboard.com/apps/grip-integration#map-events)

Once the integration is connected, a window will appear prompting you to map your Grip containers with Sessionboard events. Select the Sessionboard Event from the dropdown list, then choose the Grip event in the right-hand dropdown.Click “Add Mapping” once selected.

![Map Events](https://learn.sessionboard.com/images/kb/9e8bfb28-image-png-Feb-26-2026-07-58-55-8934-PM.png)

* * *

## Event Settings

[Section titled “Event Settings”](https://learn.sessionboard.com/apps/grip-integration#event-settings)

Once you have selected your event mapping you will be required to enter your Speaker Data Type ID\*, which is required to proceed. This will allow for all net new speakers that are created from Sessionboard to have the correct Data Type.Groups and Session Roles are all optional fields and if you wish to use those within Grip you can also provide that information at this time.

![Event Settings](https://learn.sessionboard.com/images/kb/b2588580-image-png-Feb-26-2026-08-01-21-8357-PM.png)

If you would like to leverage Session Roles you must include a Speaker Role ID in order to sync your Moderator and Chairpersons

* * *

## Map session fields

[Section titled “Map session fields”](https://learn.sessionboard.com/apps/grip-integration#map-session-fields)

![Map Session Fields](https://learn.sessionboard.com/images/kb/36474d2f-image-png-Feb-26-2026-08-03-10-6484-PM.png)

Sessionboard will endeavor to sync as much data between systems as possible. It is important to use system fields when possible to collect information about your sessions and speakers to ensure they will be successfully matched.

Below is a list of standard fields that will be synced for your sessions. Field(s) with an asterisk\* are required.

- Title \*
- Starts At datetime \*
- Ends At datetime \*
- Sessions that span multiple dates are not supported in Grip and will be synced as the same calendar day
- Sessions that have passed will not sync.
- Tracks\*
- Field names can not be edited once you have begun syncing to a partner system. To edit a field name, we recommend creating a new field name and associating it with the session before re-syncing.
- Location (Room)\*
- Field names can not be edited once you have begun syncing to a partner system. To edit a field name, we recommend creating a new field name and associating it with the session before re-syncing.
- Description

When mapping any custom fields you will want to use the Grip “Field System Name” eg. ‘app-237-event-6863-format-2’

* * *

## Map speaker fields

[Section titled “Map speaker fields”](https://learn.sessionboard.com/apps/grip-integration#map-speaker-fields)

![Map Speaker Fields](https://learn.sessionboard.com/images/kb/cb992e34-image-png-Feb-26-2026-08-03-33-6200-PM.png)

Below is a list of standard fields that will be synced. Field(s) with an asterisk\* are required.

- First Name \*
- Last Name \*
- Email \*
- Job Title
- Company Name
- Mobile Phone
- Biography
- Headshot

* * *

## Syncing sessions and speakers IMPORTANT INFORMATION

[Section titled “Syncing sessions and speakers IMPORTANT INFORMATION”](https://learn.sessionboard.com/apps/grip-integration#syncing-sessions-and-speakers-important-information)

Before syncing your event, please review the following important notes:

- Sessions and/or speakers will not be removed from Grip if speaker and/or session statuses are changed in Sessionboard. Admins will have to manually delete the session/speaker record in Grip.
- Speakers that are pre-existing in Grip will be updated
- Only accepted sessions, and their associated speakers, will sync to Grip.
- Sessions must have a date, time, track and location to be synced.
- Speakers in your database must have a unique email address to sync to Grip. Check your data closely for duplicates before syncing.
- Verify that the timezone in both Sessionboard and Grip matches your event. To do this in Sessionboard, go to Settings > Details.

![Syncing Sessions and Speakers IMPORTANT INFORMATION](https://learn.sessionboard.com/images/kb/282e2d04-image-png-Feb-26-2026-05-48-11-8979-PM.png)

* * *

## How To Initiate A Sync

[Section titled “How To Initiate A Sync”](https://learn.sessionboard.com/apps/grip-integration#how-to-initiate-a-sync)

1. Go to your event Sessions > Agenda.
2. Reminder: Only “Accepted” sessions and their associated “Accepted” speakers will be synced.
3. Under Options, click “Sync to Grip”

![How To Initiate A Sync](https://learn.sessionboard.com/images/kb/56db8ff6-image-png-Feb-26-2026-08-06-55-6212-PM.png)

1. A message will flash at the bottom of the screen confirming that the sync has started.
2. When the sync is complete, another message will flash confirming that data has been synced.
3. If there is an issue, a message will appear verifying the number of sessions and speakers that were attempted to sync and that were successfully synced. Please check that your sessions have all the required fields and contact [support@sessionboard.com](mailto:support@sessionboard.com) if you need additional assistance.

### Resync Behavior

[Section titled “Resync Behavior”](https://learn.sessionboard.com/apps/grip-integration#resync-behavior)

On resync, new sessions and speakers that have been added to the agenda in Sessionboard will be sent to Grip. Any updates that are made to previously synced fields (such as correcting a speaker’s title or changing a session time) will also be applied.

In addition to syncing all sessions and their speakers you do have the ability to choose individual sessions to sync. This can be done under the Agenda tab and by selecting the individual sessions you wish to sync. Then simply click More > Sync to Grip.

![Resync Behavior](https://learn.sessionboard.com/images/kb/47933f38-image-png-Mar-03-2026-08-16-35-6283-PM.png)

* * *

## Disconnect Integration

[Section titled “Disconnect Integration”](https://learn.sessionboard.com/apps/grip-integration#disconnect-integration)

To disconnect from the integration, go to your Organization > Settings > Integrations

1. Locate your connected integration and click the three-dot icon beside Settings
2. Click “Disconnect Integration.”
3. Confirm that you are sure before deleting the integration.

![Disconnect Integration](https://learn.sessionboard.com/images/kb/3ed0f475-image-png-Feb-26-2026-08-09-38-0643-PM.png)

Once the integration is disconnected, you can reconnect using a separate API token, or reuse the same credentials.

Disconnecting the integration will disconnect all mapped events. Previously-synced sessions will not be able to be resynced even if you remap the same events. The integration should only be disconnected if you intend to sync to a new organization.

### Remove mapped event

[Section titled “Remove mapped event”](https://learn.sessionboard.com/apps/grip-integration#remove-mapped-event)

To remove event mappings, go to your Organization > Settings > Integrations and click Settings underneath the integration partner you are utilizing.

This will open the mapping window. A list of existing mappings will be displayed. Click “Disconnect” to disconnect specific mapped events.

❗ Removing a mapping will not disconnect the integration. Other mapped events will continue to sync on request.

![Remove Mapped Event](https://learn.sessionboard.com/images/kb/c8fe4cb4-image-png-Feb-27-2026-09-17-48-7365-PM.png)

* * *

### Integration Support

[Section titled “Integration Support”](https://learn.sessionboard.com/apps/grip-integration#integration-support)

If you are experiencing problems with syncing (i.e. error messages or data not appearing in Grip), email [support@sessionboard.com](mailto:support@sessionboard.com) with the following information:

- Event Name
- Session name(s)
- fields not appearing
- Speaker name(s)
- fields not appearing
- Image of any errors received when syncing (if applicable) Example Email:

![Integration Support](https://learn.sessionboard.com/images/kb/444ba0ba-Screenshot-2024-04-18-at-2_43_25-PM-Sep-28-2024-02-32-46-7602-AM.png)