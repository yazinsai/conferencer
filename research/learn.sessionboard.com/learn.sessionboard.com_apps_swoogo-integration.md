---
url: "https://learn.sessionboard.com/apps/swoogo-integration"
title: "Swoogo | Sessionboard Help Center"
---

[Skip to content](https://learn.sessionboard.com/apps/swoogo-integration#_top)

# Swoogo

![Swoogo logo](https://learn.sessionboard.com/logo/apps/swoogo-integration.png)

Swoogo is a conference management system that facilitates registration, attendee tracking, and automated marketing tools.

Sessionboard users can connect their events with Swoogo and sync session and speaker data from Sessionboard to Swoogo. This one-way integration is a user-friendly process that facilitates data transfer to Swoogo once users have approved and scheduled their sessions in Sessionboard.

* * *

## Connect integration

[Section titled “Connect integration”](https://learn.sessionboard.com/apps/swoogo-integration#connect-integration)

Integrations are connected on the organization level in Sessionboard.

After logging in, click “Organization Dashboard“ to access your event’s organization:

![Connect Integration](https://learn.sessionboard.com/images/kb/f5a64c87-image-png-Feb-26-2026-05-23-13-0299-PM.png)

Or, from your event, you can click Back to organization:

![From your event, you can click Back to organization](https://learn.sessionboard.com/images/kb/3ce332e9-image-png-Feb-26-2026-05-22-06-6541-PM.png)

Select the ‘Settings’ module to locate ‘Integrations’.

![Select the ‘Settings’ module to locate ‘Integrations’](https://learn.sessionboard.com/images/kb/cc340125-image-png-Feb-26-2026-05-26-46-7552-PM.png)

There, you can connect new or manage existing integrations. To connect a new integration, click the “Connect” button below the integration.

![There, you can connect new or manage existing integrations](https://learn.sessionboard.com/images/kb/cbc27e6a-image-png-Feb-27-2026-05-00-19-2726-PM.png)

For Swoogo, enter the Consumer API Key and Consumer Secret associated with your Swoogo instance.

![For Swoogo, enter the Consumer API Key and Consumer Secret associated with your Swoogo instance](https://learn.sessionboard.com/images/kb/6f704430-image-png-Feb-27-2026-05-00-47-7986-PM.png)

Enable continuous sync to create/update records on a regular interval (approx. 30 minutes) so that admins don’t have to force sync them. The admin can still manually push a sync if they want to update between the sync intervals.

## Map events

[Section titled “Map events”](https://learn.sessionboard.com/apps/swoogo-integration#map-events)

Once the integration is connected, a window will appear prompting you to map your Sessionboard events with Swoogo ones. Select the Sessionboard event from the dropdown list, then choose the Swoogo event in the right-hand dropdown.

Click “Add Mapping” to complete the mapping process.

![Map Events](https://learn.sessionboard.com/images/kb/cec2bc90-image-png-Feb-27-2026-05-02-12-1924-PM.png)

Mapping Criteria

1. More than one event can be mapped per Sessionboard organization.
2. NOTE: Within your Sessionboard organization, only one Consumer Key & Secret can be utilized. If you would like to map more than one event from Sessionboard into Swoogo, please ensure that every event in Swoogo is associated with the same Consumer Key & Secret.
3. At least one Sessionboard event must be mapped to Swoogo for the sync option to appear in the UI.
4. Once an Swoogo event has been mapped to a Sessionboard event, neither can be re-mapped to another event.

## Event Settings

[Section titled “Event Settings”](https://learn.sessionboard.com/apps/swoogo-integration#event-settings)

Once you have selected your event mapping, you’ll be able to choose if you want to Sync Chairpersons, Moderators & Sponsors.

Also, you can toggle Remove Deleted Speakers & Remove Deleted Sessions. When enabled, these would be removed if they are deleted from Sessionboard or if the session status is changed to any status that is not Accepted. For us to enable V2 of the integration, please reach out to [support@sessionboard.com](mailto:support@sessionboard.com).

![Event Settings](https://learn.sessionboard.com/images/kb/cf602234-image-png-Feb-27-2026-05-47-50-3285-PM.png)

## Mapping session fields

[Section titled “Mapping session fields”](https://learn.sessionboard.com/apps/swoogo-integration#mapping-session-fields)

Once your events have been connected, your next window will allow you to map your designated session fields. Within the dropdown, be sure you have selected the correct event that you wish to map the session fields for.

![Mapping Session Fields](https://learn.sessionboard.com/images/kb/e437af52-image-png-Feb-27-2026-05-57-15-9668-PM.png)

The default fields will populate within the session field mapper. You will be able to map additional fields by selecting “Add Field Mapping”. You will then be able to select the Sessionboard field and the destination field in Swoogo that you wish to be mapped to.

![The default fields will populate within the session field mapper](https://learn.sessionboard.com/images/kb/a3efd982-image-png-Feb-27-2026-05-57-39-6516-PM.png)

## Mapping speaker fields

[Section titled “Mapping speaker fields”](https://learn.sessionboard.com/apps/swoogo-integration#mapping-speaker-fields)

Once your session fields are mapped, you will then be prompted to map your speaker fields. The default fields will populate within the speaker field mapper. You will be able to map additional fields by selecting “Add Field Mapping”. You will then be able to select the Sessionboard field and the destination field in Swoogo that you wish to be mapped to.

![Mapping Speaker Fields](https://learn.sessionboard.com/images/kb/22918c0f-image-png-Feb-27-2026-05-58-12-7738-PM.png)

## Remove mapping

[Section titled “Remove mapping”](https://learn.sessionboard.com/apps/swoogo-integration#remove-mapping)

To remove event mappings, go to your Organization > Settings > Integrations and click Settings.

This will open the mapping window. A list of existing mappings will be displayed. Click “Disconnect“ to disconnect specific mapped events.

![Remove Mapping](https://learn.sessionboard.com/images/kb/4ae0974f-image-png-Feb-27-2026-06-04-27-3207-PM.png)

* * *

## Syncing sessions, speakers, and sponsors

[Section titled “Syncing sessions, speakers, and sponsors”](https://learn.sessionboard.com/apps/swoogo-integration#syncing-sessions-speakers-and-sponsors)

Before initiating a sync, ensure that you have reviewed and accepted the sessions that you want to sync to Swoogo.

You’ll also want to ensure that sessions have rooms (locations) and tracks assigned if you want those to sync with the associated session.

![Syncing Sessions, Speakers, and Sponsors](https://learn.sessionboard.com/images/kb/282e2d04-image-png-Feb-26-2026-05-48-11-8979-PM.png)

### Synced Fields

[Section titled “Synced Fields”](https://learn.sessionboard.com/apps/swoogo-integration#synced-fields)

Sessionboard will endeavor to sync as much data between systems as possible. It is important to use system fields when possible to collect information about your sessions and speakers to ensure they will be successfully matched.

Below is a list of standard fields that will be synced. Fields with an asterisk (\*) are required.

Sessions

Sessions will be synced as sessions in Swoogo. Speakers will be associated with their sessions.

- Title (Name in Swoogo) \*
- Starts At date and time
- Ends At date and time
- Sessions that span multiple dates are not supported in Swoogo and will be synced as the same calendar day as the start date
- Sessions that have passed will not sync.
- Description
- Locations (Rooms)
- Field names can not be edited once you have begun syncing to a partner system. To edit a field name, we recommend creating a new field name and associating it with the session before re-syncing.
- Tracks
- Field names can not be edited once you have begun syncing to a partner system. To edit a field name, we recommend creating a new field name and associating it with the session before re-syncing.

If mapping ‘Capacity’ to Swoogo, there will be logic supported. If your session capacity has a value, it will sync to Swoogo as such. If your session capacity is null, then the capacity you have set at the room level will sync to Swoogo to ensure a value is syncing.

Speakers

Speakers will be synced to Swoogo as speakers.

- First Name \*
- Last Name \*
- Email \* (Please ensure all emails are unique to ensure data syncs as desired)
- Job Title
- Company Name
- Biography
- Headshot
- NOTE: Max 2 MB size due to Swoogo file size requirement. If your image is larger, we will attempt to downscale it.

Sponsors

Sponsors will not be connected to their sessions in Swoogo.

- Name\*
- Description
- Website
- Tier (Sponsorship Level in Swoogo)
- Logo
- NOTE: Max 2 MB size due to Swoogo file size requirement. If your image is larger, we will attempt to downscale it.

### Initiate sync

[Section titled “Initiate sync”](https://learn.sessionboard.com/apps/swoogo-integration#initiate-sync)

1. Go to your event Sessions > Agenda.
2. Under Options, click “Sync to Swoogo”

![Initiate Sync](https://learn.sessionboard.com/images/kb/d6ad627d-image-png-Feb-27-2026-06-07-56-1515-PM.png)

1. A message will flash at the bottom of the screen confirming that the sync has started.
2. When the sync is complete, another message will flash confirming that data has been synced.
3. If there is an issue, a message will appear verifying the number of sessions and speakers that were attempted to sync and that were successfully synced. Please check that your sessions have all the required fields, and contact us if your issue persists.

This will sync all accepted sessions and their associated speakers.

![To sync sponsors, you will need to initiate this from the sponsor’s module](https://learn.sessionboard.com/images/kb/40293bbc-image-png-Feb-27-2026-06-08-59-5108-PM.png)

Syncing Specific Sessions: You are able to manually sync individual sessions by selecting your desired sessions from your sessions view. To do this, navigate to your event Sessions > Agenda > More > Sync to Swoogo. This will allow for individual sessions to sync to Swoogo. Note: Sessions must be accepted\*

![Syncing Specific Sessions](https://learn.sessionboard.com/images/kb/4dd1f8e7-image-png-Mar-03-2026-08-25-51-1038-PM.png)

Syncing Specific Speakers:

You are able to manually sync individual speakers by selecting your desired speakers from your speakers view. To do this, navigate to Contacts > Speakers > Options > Sync to Swoogo. This will allow for individual sessions to sync to Swoogo.

![You are able to manually sync individual speakers by selecting your desired speakers from your speakers view](https://learn.sessionboard.com/images/kb/29022040-image-png-Feb-27-2026-06-12-48-8265-PM.png)

### Resync Behavior

[Section titled “Resync Behavior”](https://learn.sessionboard.com/apps/swoogo-integration#resync-behavior)

On resync, new sessions and speakers that have been added to the agenda in Sessionboard will be sent to Swoogo. Any updates that are made to previously synced fields (such as correcting a speaker’s title or changing a session time) will also be applied.

## Disconnect Integration

[Section titled “Disconnect Integration”](https://learn.sessionboard.com/apps/swoogo-integration#disconnect-integration)

To disconnect from the integration, go to your Organization > Settings > Integrations

1. Locate your connected integration and click the three-dot icon beside Settings
2. Click “Disconnect Integration.”
3. Confirm that you are sure before deleting the integration.

![Disconnect Integration](https://learn.sessionboard.com/images/kb/eb6ef492-image-png-Feb-27-2026-06-13-23-2990-PM.png)

Once the integration is disconnected, you can reconnect using a separate API key or reuse the same credentials.

Disconnecting the integration will disconnect all mapped events. Previously-synced sessions will not be able to be resynced even if you remap the same events. The integration should only be disconnected if you intend to sync to a new organization.