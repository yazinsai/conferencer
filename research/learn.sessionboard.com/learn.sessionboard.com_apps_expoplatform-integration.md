---
url: "https://learn.sessionboard.com/apps/expoplatform-integration"
title: "ExpoPlatform | Sessionboard Help Center"
---

[Skip to content](https://learn.sessionboard.com/apps/expoplatform-integration#_top)

# ExpoPlatform

![ExpoPlatform logo](https://learn.sessionboard.com/logo/apps/expoplatform-integration.png)

Sessionboard users can connect their events with ExpoPlatform and sync session and speaker data from Sessionboard to ExpoPlatform.

This one-way integration is a user-friendly process that facilitates data transfer to ExpoPlatform once users have approved their session submissions and confirmed speakers in Sessionboard:

* * *

## Connect integration

[Section titled “Connect integration”](https://learn.sessionboard.com/apps/expoplatform-integration#connect-integration)

Integrations are connected on the organization level in Sessionboard.

After logging in, click “Organization Dashboard” to access your event’s organization:

![Connect Integration](https://learn.sessionboard.com/images/kb/f5a64c87-image-png-Feb-26-2026-05-23-13-0299-PM.png)

Or, from your event, you can click Back to organization:

![From your event, you can click Back to organization](https://learn.sessionboard.com/images/kb/3ce332e9-image-png-Feb-26-2026-05-22-06-6541-PM.png)

Select the ‘Settings’ module to locate ‘Integrations’.

![Select the ‘Settings’ module to locate ‘Integrations’](https://learn.sessionboard.com/images/kb/cc340125-image-png-Feb-26-2026-05-26-46-7552-PM.png)

There, you can connect new or manage existing integrations. To connect a new integration, click the “Connect” button below the integration.

![There, you can connect new or manage existing integrations](https://learn.sessionboard.com/images/kb/8b5e46d1-image-png-Feb-26-2026-06-50-30-6675-PM.png)

ExpoPlatform settings open in a five step wizard: Connections, Map Events, Event Settings, Map Session Fields, and Map Speaker Fields.

For ExpoPlatform, enter the Access/API Token and URL associated with your event. Ensure the URL has no trailing spaces or symbols after the domain name. Click Connect.

![For ExpoPlatform, enter the Access/API Token and URL associated with your event](https://learn.sessionboard.com/images/kb/11501faa-image-png-Jun-04-2026-07-04-35-6501-PM.png)

You have the ability to connect your Sessionboard organization to multiple instances of ExpoPlatform if needed. To do so, simply select “Add New Connection” and repeat the process displayed above.

![You have the ability to connect your Sessionboard organization to multiple instances of ExpoPlatform if needed](https://learn.sessionboard.com/images/kb/6bf337b2-image-png-Feb-26-2026-06-51-31-5742-PM.png)

Enable continuous sync to create/update records on a regular interval (approx. 30 minutes) so that admins don’t have to force sync them. The admin can still manually push a sync if they want to update between the sync intervals.

![Enable continuous sync to create/update records on a regular interval (approx. 30 minutes)](https://learn.sessionboard.com/images/kb/8589aa6c-image-png-Feb-27-2026-02-28-37-9811-PM.png)

Once connected, your connection appears under Existing connections. Click Map Events on the connection to proceed to the next step.

* * *

## Map events

[Section titled “Map events”](https://learn.sessionboard.com/apps/expoplatform-integration#map-events)

Click Map Events on your connection to open the Map Events step. Select the Sessionboard event from the dropdown list, then choose the ExpoPlatform event in the right-hand dropdown.

Click “Add Mapping” to complete the mapping process.

![Map Events](https://learn.sessionboard.com/images/kb/d39cf675-image-png-Feb-27-2026-02-27-14-4735-PM.png)
Mapping Criteria

1. More than one event can be mapped per Sessionboard organization.
2. NOTE: Within your Sessionboard organization, only one Access Token & URL can be utilized. If you would like to map more than one event from Sessionboard into ExpoPlatform, please ensure that every event in ExpoPlatform is associated with the same Access Token & URL.
3. At least one Sessionboard event must be mapped to ExpoPlatform for the sync option to appear in the UI.
4. Once an ExpoPlatform event has been mapped to a Sessionboard event, neither can be re-mapped to another event.

* * *

## Event Settings

[Section titled “Event Settings”](https://learn.sessionboard.com/apps/expoplatform-integration#event-settings)

After mapping an event, configure the event level settings for your sync.

- Default Hall ID: The numeric ID of the ExpoPlatform hall to use as the default for synced sessions.
- Match Halls by Stands: When enabled, Sessionboard retrieves all stands and halls from ExpoPlatform, finds the stand matching the room name, and uses the referenced hall. Check this box if your event leverages Halls and Stands.
- Category ID: The numeric ID of the ExpoPlatform category to apply to synced sessions.
- Default Language: The language code to use as the default for synced records, for example en for english, es for spanish, de for german, etc.

![Event Settings](https://learn.sessionboard.com/images/kb/9c0cf6c3-image-png-Jun-04-2026-07-12-59-9344-PM.png)

The below settings will not need to be used in most cases. Use cases where the following settings are used are if you are syncing multiple languages to Expo Platform

- Session Languages to Prioritize: Language name and ID pairs the sync should prioritize for session data.
- Speaker Languages to Prioritize: Language name and ID pairs the sync should prioritize for speaker data.
- Override Tag Names: Rewrites session tag values when syncing to ExpoPlatform. Tags without an override pass through unchanged. This allows for the value passed to be different than the value collected in Sessionboard if desired.
- Override Track Names: Rewrites session track values when syncing to ExpoPlatform. Tracks without an override pass through unchanged. This allows for the value passed to be different than the value collected in Sessionboard if desired.
- Override Format Names: Rewrites session format values when syncing to ExpoPlatform. Formats without an override pass through unchanged. This allows for the value passed to be different than the value collected in Sessionboard if desired.

![Override Format Names](https://learn.sessionboard.com/images/kb/01ebd8a6-image-png-Jun-04-2026-07-13-25-4711-PM.png)

List settings (such as the language priority lists and name overrides) can be filled in two ways:

- Structured rows: Add entries one at a time. Enter the Display name and ID, then click Add row for additional entries. Click the X to remove a row.
- Bulk paste: Paste several entries at once, one item per line. Within a line, separate the name and ID with the delimiter shown (\| by default). The Live preview shows how your entries will be read before they are saved.

![Bulk paste](https://learn.sessionboard.com/images/kb/38d2eac1-image-png-Jun-04-2026-07-15-42-0336-PM.png)

* * *

## Map session fields

[Section titled “Map session fields”](https://learn.sessionboard.com/apps/expoplatform-integration#map-session-fields)

Once your events have been connected, the next step allows you to map your designated session fields.Within the dropdown, be sure you have selected the correct event mapping that you wish to map the session fields for.

![Map Session Fields](https://learn.sessionboard.com/images/kb/5b5e01de-image-png-Jun-04-2026-07-16-20-7173-PM.png)

The default fields will populate within the session field mapper. Default mappings are greyed out. They are required for the sync and cannot be removed.

You will be able to map additional fields by selecting “Add Field Mapping”. Select the Sessionboard field on the left, then click the destination chip on the right to configure the ExpoPlatform field name, type, and language.

* * *

## Map speaker fields

[Section titled “Map speaker fields”](https://learn.sessionboard.com/apps/expoplatform-integration#map-speaker-fields)

Once your session fields are mapped, you will then be prompted to map your speaker fields.

![Map Speaker Fields](https://learn.sessionboard.com/images/kb/cf8db1d0-image-png-Jun-04-2026-07-18-09-0267-PM.png)

The default fields will populate within the speaker field mapper. Default mappings are greyed out. They are required for the sync and cannot be removed.

You will be able to map additional fields by selecting “Add Field Mapping”. Select the Sessionboard field on the left, then click the destination chip on the right to configure the ExpoPlatform field name, type, and language.

* * *

## Remove mapping

[Section titled “Remove mapping”](https://learn.sessionboard.com/apps/expoplatform-integration#remove-mapping)

To remove event mappings, go to your Organization > Settings > Integrations and click Settings.

![Remove Mapping](https://learn.sessionboard.com/images/kb/885756dc-image-png-Feb-27-2026-02-31-25-9992-PM.png)

This will open the mapping window. A list of existing mappings will be displayed. Click the elipses followed by “Disconnect” to remove the specific mapped events.

![Will open the mapping window](https://learn.sessionboard.com/images/kb/1fc0ecac-image-png-Feb-27-2026-02-32-31-9696-PM.png)

* * *

## Syncing sessions and speakers

[Section titled “Syncing sessions and speakers”](https://learn.sessionboard.com/apps/expoplatform-integration#syncing-sessions-and-speakers)

Before initiating a sync, ensure that you have reviewed and accepted the sessions that you want to sync to ExpoPlatform. Sessions must have a date and time to be synced and be in the future.

You’ll also want to ensure that sessions have rooms (locations), tags, formats (types), and languages if you want those to sync with the associated session.

![Syncing Sessions and Speakers](https://learn.sessionboard.com/images/kb/282e2d04-image-png-Feb-26-2026-05-48-11-8979-PM.png)

Sessionboard is not able to sync speakers to existing contacts in ExpoPlatform. To ensure a seamless syncing of data, we require you to delete/disconnect contacts within ExpoPlatform that have similar email addresses as speakers within Sessionboard.

### Synced Fields

[Section titled “Synced Fields”](https://learn.sessionboard.com/apps/expoplatform-integration#synced-fields)

Sessionboard will endeavor to sync as much data between systems as possible. It is important to use system fields when possible to collect information about your sessions and speakers to ensure they will be successfully matched.

Below is a list of standard fields that will be synced. Fields with an asterisk (\*) are required.

### Sessions

[Section titled “Sessions”](https://learn.sessionboard.com/apps/expoplatform-integration#sessions)

- Title \*
- Starts At datetime \*
  - Sessions that are dated in the past will not be synced to ExpoPlatform.
- Ends At datetime \*
  - Sessions that span multiple dates are not supported in ExpoPlatform and will be synced as the same calendar day.
  - Sessions that have passed will not sync.
- Tracks \*
  - Track values must align exactly in both platforms. If there is no found match a new Track value will be created.
- Format \*
  - Syncs to ‘Session Type’ in ExpoPlatform.
  - Format values must align exactly with Session Type values in ExpoPlatform. If an exact match is not found a new value will be created.
- Description
- Tags
  - Tag values must match exactly in both platforms. If there is no found match a new tag value will be created.
- Language
  - The language must exist in ExpoPlatform. If it does not, English will be selected.
  - Field names can not be edited once you have begun syncing to a partner system. To edit a field name, we recommend creating a new field name and associating it with the session before re-syncing.
- Locations
  - Sessionboard will map Rooms > Halls in ExpoPlatform. If you are leveraging Halls and Stands please be sure to check the “Match Halls by Stands” box in the Event Settings step of your integration settings.

![Sessions](https://learn.sessionboard.com/images/kb/e9822fe9-image-png-Jun-04-2026-07-31-29-2545-PM.png)

- The names of your Rooms in Sessionboard must be exact matches to your halls, or Stands if using stands, in ExpoPlatform in order for them to sync successfully. If the exact name match is not found a new Hall or Stand will be created depending on your event integration.

Speakers - (Speakers & Moderators will sync to ExpoPlatform)

- First Name \*
- Last Name \*
- Email \*
- Job Title
- Company Name
- Website
- Mobile Phone (Tel)
- Biography
- Address
- City
- State (Region)
- Zip (Postcode)
- Country
- Headshot
- Facebook URL (Page)
- LinkedIn URL (Page)
- X (Twitter) URL (Page)

* * *

## Initiate sync

[Section titled “Initiate sync”](https://learn.sessionboard.com/apps/expoplatform-integration#initiate-sync)

1. Go to your event Sessions > Agenda.
2. Under Options, click “Sync to ExpoPlatform”

![Initiate Sync](https://learn.sessionboard.com/images/kb/cd021e02-image-png-Feb-27-2026-02-40-38-0458-PM.png)

1. A message will flash at the bottom of the screen confirming that the sync has started.
2. When the sync is complete, another message will flash confirming that data has been synced.
3. To review your Sync History please navigate to History > Integrations. By clicking ‘Click to View Results’ you will be able to see the number of sessions and speakers that successfully sync’d. If any errors occur that will be surfaced at the bottom of your log under ‘Error Summary’.

* * *

## Resync Behavior

[Section titled “Resync Behavior”](https://learn.sessionboard.com/apps/expoplatform-integration#resync-behavior)

On resync, new sessions and speakers that have been added to the agenda in Sessionboard will be sent to ExpoPlatform. Any updates that are made to previously synced fields (such as correcting a speaker’s title or changing a session time) will also be applied.

In addition to syncing all sessions and their speakers you do have the ability to choose individual sessions to sync. This can be done under the Agenda tab and by selecting the individual sessions you wish to sync.

![Resync Behavior](https://learn.sessionboard.com/images/kb/328b722d-Screenshot-2026-06-19-at-12.16.06-PM.png)

The integration does not support deleting sessions or speakers. If a session is changed to ‘Declined’ or any status other than ‘Accepted’ it will not sync and needs to be manually deleted in Expo Platform. If a speaker or moderator are removed from their session in Sessionboard they will be removed from the session in ExpoPlatform but will remain in the speaker/moderator list.

* * *

## Disconnect Integration

[Section titled “Disconnect Integration”](https://learn.sessionboard.com/apps/expoplatform-integration#disconnect-integration)

To disconnect from the integration, go to your Organization > Settings > Integrations

1. Locate your connected integration and click the three-dot icon beside Settings
2. Click “Disconnect Integration.”
3. Confirm that you are sure before deleting the integration.

![Disconnect Integration](https://learn.sessionboard.com/images/kb/6f8db4f0-image-png-Feb-27-2026-02-42-43-6229-PM.png)

Once the integration is disconnected, you can reconnect using a separate API key or base URL, or reuse the same credentials.

Disconnecting the integration will disconnect all mapped events. Previously-synced sessions will not be able to be resynced even if you remap the same events. The integration should only be disconnected if you intend to sync to a new organization.