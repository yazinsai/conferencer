---
url: "https://learn.sessionboard.com/apps/bizzabo-integration"
title: "Bizzabo | Sessionboard Help Center"
---

[Skip to content](https://learn.sessionboard.com/apps/bizzabo-integration#_top)

# Bizzabo

![Bizzabo logo](https://learn.sessionboard.com/logo/apps/bizzabo-integration.png)

Sessionboard users can connect their events with Bizzabo to sync session and speaker data from Sessionboard to Bizzabo. This one-way integration is a user-friendly process that facilitates data transfer to Bizzabo once users have approved and scheduled their sessions in Sessionboard.

* * *

## Connect integrations

[Section titled “Connect integrations”](https://learn.sessionboard.com/apps/bizzabo-integration#connect-integrations)

Integrations are connected on the organization level in Sessionboard.

After logging in, click “Organization Dashboard“ to access your event’s organization:

![Connect Integrations](https://learn.sessionboard.com/images/kb/f5a64c87-image-png-Feb-26-2026-05-23-13-0299-PM.png)

Or, from your event, you can click Back to organization:

![From your event, you can click Back to organization](https://learn.sessionboard.com/images/kb/3ce332e9-image-png-Feb-26-2026-05-22-06-6541-PM.png)

Select the ‘Settings’ module to locate ‘Integrations’.

![Select the ‘Settings’ module to locate ‘Integrations’](https://learn.sessionboard.com/images/kb/cc340125-image-png-Feb-26-2026-05-26-46-7552-PM.png)

There, you can connect new or manage existing integrations. To connect a new integration, click the “Connect” button below the integration.

![There, you can connect new or manage existing integrations](https://learn.sessionboard.com/images/kb/4ae13ec8-image-png-Feb-26-2026-06-14-52-3957-PM.png)

For Bizzabo, enter the client ID, client secret, and account ID associated with your event.

![For Bizzabo, enter the client ID, client secret, and account ID associated with your event](https://learn.sessionboard.com/images/kb/7e28bb6a-image-png-Feb-26-2026-06-15-18-2975-PM.png)

Enable continuous sync to create/update records on a regular interval (approx. 30 minutes) so that admins don’t have to force sync them. The admin can still manually push a sync if they want to update between the sync intervals.

* * *

## Map events

[Section titled “Map events”](https://learn.sessionboard.com/apps/bizzabo-integration#map-events)

Once the integration is connected, you will want to select ‘Map Events’. Select the Sessionboard Event from the dropdown list, then choose the Bizzabo Event in the right-hand dropdown.

![Map Events](https://learn.sessionboard.com/images/kb/83089e14-image-png-Feb-26-2026-06-17-58-9186-PM.png)

* * *

## Mapping session fields

[Section titled “Mapping session fields”](https://learn.sessionboard.com/apps/bizzabo-integration#mapping-session-fields)

Once your events have been connected, your next window will allow you to map your designated session fields. Within the dropdown, be sure you have selected the correct event that you wish to map the session fields for.

![Mapping Session Fields](https://learn.sessionboard.com/images/kb/85f776e3-image-png-Feb-26-2026-06-18-40-4327-PM.png)

The default field ‘Title’ will populate within the session field mapper. You will be able to map additional fields by selecting “Add Field Mapping”. You will then be able to select the Sessionboard field and the destination field in Bizzabo that you wish to be mapped to.

![The default field ‘Title’ will populate within the session field mapper](https://learn.sessionboard.com/images/kb/0a5dc269-image-png-Mar-03-2026-07-22-30-3595-PM.png)

Mapping Locations & Bizzabo Tags:

Please ensure that the values of your ‘Rooms’ in Sessionboard align with your Bizzabo ‘Main Location’ names.

If you are mapping any fields to Bizzabo Tags, please ensure the values align exactly as you have them in Sessionboard.

* * *

## Mapping speaker fields

[Section titled “Mapping speaker fields”](https://learn.sessionboard.com/apps/bizzabo-integration#mapping-speaker-fields)

Once your session fields are mapped, you will then be prompted to map your speaker fields. The default fields will populate within the speaker field mapper. You will be able to map additional fields by selecting “Add Field Mapping”. You will then be able to select the Sessionboard field and the destination field in Bizzabo that you wish to be mapped to.

![Mapping Speaker Fields](https://learn.sessionboard.com/images/kb/8c282bd3-image-png-Feb-26-2026-06-19-55-2484-PM.png)

* * *

## Remove mapping

[Section titled “Remove mapping”](https://learn.sessionboard.com/apps/bizzabo-integration#remove-mapping)

To remove event mappings, go to your Organization > Settings > Integrations > Settings.

This will open the mapping window. A list of existing mappings will be displayed. Click “Disconnect” to disconnect specific mapped events.

![Remove Mapping](https://learn.sessionboard.com/images/kb/f8596dc8-image-png-Feb-26-2026-06-24-01-0179-PM.png)

### Mapping criteria

[Section titled “Mapping criteria”](https://learn.sessionboard.com/apps/bizzabo-integration#mapping-criteria)

1. More than one event can be mapped per Sessionboard organization.
2. NOTE: Within your Sessionboard organization, only one Consumer Key & Secret can be utilized. If you would like to map more than one event from Sessionboard into Bizzabo, please ensure that every event in Bizzabo is associated with the same Client ID, Secret, and Account ID.
3. At least one Sessionboard event must be mapped to Bizzabo for the sync option to appear in the UI.
4. Once a Bizzabo event has been mapped to a Sessionboard event, neither can be re-mapped to another event.

* * *

## Syncing sessions and speakers

[Section titled “Syncing sessions and speakers”](https://learn.sessionboard.com/apps/bizzabo-integration#syncing-sessions-and-speakers)

Before you start a sync, please make sure you have reviewed and accepted the sessions you want to sync to Bizzabo. Sessions must be accepted to be synced.

You’ll also want to ensure that sessions have rooms (locations) assigned if you want those to sync with the associated session.

To ensure seamless data syncing, Bizzabo requires a unique email per contact. Please be sure all your speakers have a unique email before initiating the sync.

Also, verify that the time zones in both events match before syncing. To do this in Sessionboard, go to the Details page and confirm a timezone.

- If you need to change the timezone in Sessionboard, please get in touch with [support@sessionboard.com](mailto:support@sessionboard.com) for assistance

## Synced Fields

[Section titled “Synced Fields”](https://learn.sessionboard.com/apps/bizzabo-integration#synced-fields)

Sessionboard will endeavor to sync as much data between systems as possible. It is important to use system fields when possible to collect information about your sessions and speakers to ensure they will be successfully matched.

Below is a list of standard fields that will be synced. Fields with an asterisk (\*) are required.

### Sessions

[Section titled “Sessions”](https://learn.sessionboard.com/apps/bizzabo-integration#sessions)

Sessions will be synced as sessions in Bizzabo. Speakers will be associated with their sessions.

- Title (Session Title in Bizzabo)\*
- Speakers
  - The speaker role in Sessionboard will carry over to Bizzabo as ‘Speaker Label’ (Speaker & Moderator only)

### Speakers

[Section titled “Speakers”](https://learn.sessionboard.com/apps/bizzabo-integration#speakers)

Speakers will be synced to Bizzabo as Speakers and listed in Contacts showing association with their contact role.

- First Name \*
- Last Name \*
- Email \*

### Custom Participant Roles

[Section titled “Custom Participant Roles”](https://learn.sessionboard.com/apps/bizzabo-integration#custom-participant-roles)

Bizzabo supports the following Speaker Labels:

- Speaker
- Panelist
- Keynote
- Moderator

Your standard Sessionboard Moderators will sync as Moderators with the associated speaker label in Bizzabo.

If you would like to have ‘Panelist’ or ‘Keynote’ sync to Bizzabo as the speaker label please be sure that you create the custom participant role in Sessionboard within the Speaker category. They must have an exact match of ‘Panelist’ and ‘Keynote’ in order for them to sync to Bizzabo. Please see this article on how to create your [Session Participant Roles](https://learn.sessionboard.com/concepts/participant-roles).

### Initiate sync

[Section titled “Initiate sync”](https://learn.sessionboard.com/apps/bizzabo-integration#initiate-sync)

1. Go to your event Sessions > Agenda.
2. Under Options, click “Sync to Bizzabo”
3. A message will flash at the bottom of the screen, confirming that the sync has started.
4. When the sync is complete, another message will flash, confirming that data has been synced.

![Initiate Sync](https://learn.sessionboard.com/images/kb/33f9e4b2-image-png-Feb-26-2026-06-27-20-8788-PM.png)

### Resync Behavior

[Section titled “Resync Behavior”](https://learn.sessionboard.com/apps/bizzabo-integration#resync-behavior)

Currently, syncing is a one-step process. There is no ability to sync individual sessions or speakers.

On resync, new sessions and speakers that have been added to the agenda in Sessionboard will be sent to BIzzabo. Any updates that are made to previously synced fields (such as correcting a speaker’s title or changing a session time) will also be applied.

## Disconnect Integration

[Section titled “Disconnect Integration”](https://learn.sessionboard.com/apps/bizzabo-integration#disconnect-integration)

To disconnect from the integration, go to your Organization > Settings > Integrations

1. Locate your connected integration and click the three-dot icon beside Settings
2. Click “Disconnect Integration.”
3. Confirm that you are sure before deleting the integration.

Once the integration is disconnected, you can reconnect using a separate API key or reuse the same credentials.

Disconnecting the integration will disconnect all mapped events. Previously-synced sessions will not be able to be resynced even if you remap the same events. The integration should only be disconnected if you intend to sync to a new organization.