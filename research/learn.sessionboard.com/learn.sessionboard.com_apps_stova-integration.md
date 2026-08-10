---
url: "https://learn.sessionboard.com/apps/stova-integration"
title: "Stova | Sessionboard Help Center"
---

[Skip to content](https://learn.sessionboard.com/apps/stova-integration#_top)

# Stova

![Stova logo](https://learn.sessionboard.com/logo/apps/stova-integration.png)

![Stova](https://learn.sessionboard.com/images/kb/1a013f6e-Integration-1--1.png)

Through Sessionboard’s integration with Stova, event admins can easily send information for their sessions and speakers that were collected in Sessionboard to Stova:

## Connect integration

[Section titled “Connect integration”](https://learn.sessionboard.com/apps/stova-integration#connect-integration)

Integrations are connected on the organization level in Sessionboard.

After logging in, click “Organization Dashboard“ to access your event’s organization:

![Connect Integration](https://learn.sessionboard.com/images/kb/f5a64c87-image-png-Feb-26-2026-05-23-13-0299-PM.png)

Or, from your event, you can click Back to organization:

![From your event, you can click Back to organization](https://learn.sessionboard.com/images/kb/3ce332e9-image-png-Feb-26-2026-05-22-06-6541-PM.png)

Select the ‘Settings’ module to locate ‘Integrations’.

![Select the ‘Settings’ module to locate ‘Integrations’](https://learn.sessionboard.com/images/kb/cc340125-image-png-Feb-26-2026-05-26-46-7552-PM.png)

There, you can connect new or manage existing integrations. To connect a new integration, click the “Connect” button below the integration.

![There, you can connect new or manage existing integrations](https://learn.sessionboard.com/images/kb/588625c0-image-png-Feb-27-2026-04-20-32-1049-PM.png)

You will select the Stova API Endpoint that your account uses. (i.e. EMEA, NA, and AP), the Stova Account ID, and the Stova Account Key.

![You will select the Stova API Endpoint that your account uses.](https://learn.sessionboard.com/images/kb/2415144f-image-png-Feb-27-2026-04-22-27-9699-PM.png)

Enable continuous sync to create/update records on a regular interval (approx. 30 minutes) so that admins don’t have to force sync them. The admin can still manually push a sync if they want to update between the sync intervals.

## Map events

[Section titled “Map events”](https://learn.sessionboard.com/apps/stova-integration#map-events)

Once the integration is connected, a window will appear prompting you to map your Sessionboard event to an event within Stova. Once complete, select Add Mapping to complete the mapping process.

![Map Events](https://learn.sessionboard.com/images/kb/0ad922ae-image-png-Feb-27-2026-04-32-36-6884-PM.png)

## Mapping session fields

[Section titled “Mapping session fields”](https://learn.sessionboard.com/apps/stova-integration#mapping-session-fields)

Once your events have been connected, your next window will allow you to map your designated session fields. Within the dropdown, be sure you have selected the correct event that you wish to map the session fields for.

![Mapping Session Fields](https://learn.sessionboard.com/images/kb/ba9a3724-image-png-Mar-03-2026-07-08-54-9448-PM.png)

The default fields will populate within the session field mapper. You will be able to map additional fields by selecting “Add Field Mapping”. You will then be able to select the Sessionboard field and the destination field in Stova that you wish to be mapped to.

## Mapping speaker fields

[Section titled “Mapping speaker fields”](https://learn.sessionboard.com/apps/stova-integration#mapping-speaker-fields)

Once your session fields are mapped, you will then be prompted to map your speaker fields. The default fields will populate within the speaker field mapper. You will be able to map additional fields by selecting “Add Field Mapping”. You will then be able to select the Sessionboard field and the destination field in Stova that you wish to be mapped to.

![Mapping Speaker Fields](https://learn.sessionboard.com/images/kb/3370b41c-image-png-Mar-03-2026-07-10-52-0839-PM.png)

## Sync sessions and speakers

[Section titled “Sync sessions and speakers”](https://learn.sessionboard.com/apps/stova-integration#sync-sessions-and-speakers)

Before syncing your event, please review the following important notes:

NOTE: Sessions and/or speakers will not be removed from Stova if speaker and/or session statuses are changed in Sessionboard. Admins will have to manually delete the session/speaker record in Stova.Similarly, deleting a a session or speaker from Sessionboard, won’t delete it from Stova. You’ll need to manually delete it from Stova.

- Only accepted sessions, and their associated speakers, will sync to Stova.
- Sessionboard will update pre-existing contacts if there are any contacts in Stova with the same email address in Sessionboard.
- Verify that the timezone in both Sessionboard and Stova matches your event. To do this in Sessionboard, go to your organization Settings > Details.

![Sync Sessions and Speakers](https://learn.sessionboard.com/images/kb/282e2d04-image-png-Feb-26-2026-05-48-11-8979-PM.png)

### Synced Fields

[Section titled “Synced Fields”](https://learn.sessionboard.com/apps/stova-integration#synced-fields)

Sessionboard will endeavor to sync as much data between systems as possible. It is important to use system/standard fields when possible to collect information about your sessions and speakers to ensure they will be successfully matched.

Below is a list of standard fields that will be synced. Fields with an asterisk (\*) are required.

Sessions

- Title \*
- Description
- Starts At datetime
- Ends At datetime
- Location
- Room Capacity
  - The capacity set at your Room level syncs to MaxAttendees in Stova

Speakers

- First Name \*
- Last Name \*
- Email \*
- Company Name
- Biography
- Headshot (Stova requires PNG files)

## How To Process A Sync

[Section titled “How To Process A Sync”](https://learn.sessionboard.com/apps/stova-integration#how-to-process-a-sync)

1. Go to your event Sessions > Agenda.
2. Reminder: Only “Accepted” sessions and their associated “Accepted” speakers will be synced.
3. Under Options, click Sync to Stova

![How To Process A Sync](https://learn.sessionboard.com/images/kb/5b5c1d0e-image-png-Feb-27-2026-04-38-21-1130-PM.png)

1. A message will flash at the bottom of the screen confirming that the sync has started.
2. When the sync is complete, another message will flash confirming that data has been synced.
3. If there is an issue, a message will appear verifying the number of sessions and speakers that were attempted to sync and that were successfully synced. Please check that your sessions have all the required fields and contact [support@sessionboard.com](mailto:support@sessionboard.com) if you need additional assistance.

Resync Behavior

Currently, syncing is a one-step process. There is no ability to sync individual sessions or speakers.

On resync, new sessions and speakers that have been added to the agenda in Sessionboard will be sent to Stova. Any updates that are made to previously synced fields (such as correcting a speaker’s title or changing a session time) will also be applied.

## Disconnect Integration

[Section titled “Disconnect Integration”](https://learn.sessionboard.com/apps/stova-integration#disconnect-integration)

To disconnect from the integration, go to your Organization > Settings > Integrations

1. Locate your connected integration and click the three-dot icon to the right of “Settings”.
2. Click “Disconnect Integration”
3. Confirm that you are sure before deleting the integration.

![Disconnect Integration](https://learn.sessionboard.com/images/kb/619f5a25-image-png-Feb-27-2026-04-38-59-4141-PM.png)

Once the integration is disconnected, you can reconnect using a new Account ID and Key, or reuse the same credentials.

Disconnecting the integration will disconnect all mapped events. Previously-synced sessions will not be able to be resynced even if you remap the same events. The integration should only be disconnected if you intend to sync to a new organization.

Remove Mapped Event

To remove event mappings, go to your Organization > Settings > Integrations and click Settings underneath the integration partner you are utilizing.

This will open the mapping window. A list of existing mappings will be displayed. Click “Remove Mapping” to disconnect specific mapped events.

❗ Removing a mapping will not disconnect the integration. Other mapped events will continue to sync on request.

* * *

Integration Support

If you are experiencing problems with syncing (i.e. error messages or data not appearing in Stova), email [support@sessionboard.com](mailto:support@sessionboard.com) with the following information:

- Event Name
- Session name(s)
- fields not appearing
- Speaker name(s)
- fields not appearing
- Image of any errors received when syncing (if applicable)

Example email:

![Example support email reporting a Stova sync error](https://learn.sessionboard.com/images/kb/444ba0ba-Screenshot-2024-04-18-at-2_43_25-PM-Sep-28-2024-02-32-46-7602-AM.png)