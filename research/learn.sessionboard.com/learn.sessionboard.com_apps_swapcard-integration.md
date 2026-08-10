---
url: "https://learn.sessionboard.com/apps/swapcard-integration"
title: "Swapcard | Sessionboard Help Center"
---

[Skip to content](https://learn.sessionboard.com/apps/swapcard-integration#_top)

# Swapcard

![Swapcard logo](https://learn.sessionboard.com/logo/apps/swapcard-integration.png)

Swapcard is an AI-powered event and matchmaking platform that runs successful in-person, virtual, and hybrid events. AI is used to boost matchmaking, connecting users with the most relevant people based on their profiles and custom event journeys.

Sessionboard users can connect their events with Swapcard and sync session, content, and speaker data from Sessionboard to Swapcard. This one-way integration is a user-friendly process that facilitates data transfer to Swapcard once users have approved and scheduled their sessions in Sessionboard:

* * *

## Connect integration

[Section titled “Connect integration”](https://learn.sessionboard.com/apps/swapcard-integration#connect-integration)

Integrations are connected on the organization level in Sessionboard.

After logging in, click “Organization Dashboard“ to access your event’s organization:

![Connect Integration](https://learn.sessionboard.com/images/kb/f5a64c87-image-png-Feb-26-2026-05-23-13-0299-PM.png)

Or, from your event, you can click Back to organization:

![From your event, you can click Back to organization](https://learn.sessionboard.com/images/kb/3ce332e9-image-png-Feb-26-2026-05-22-06-6541-PM.png)

Select the ‘Settings’ module to locate ‘Integrations’.

![Select the ‘Settings’ module to locate ‘Integrations’](https://learn.sessionboard.com/images/kb/cc340125-image-png-Feb-26-2026-05-26-46-7552-PM.png)

There, you can connect new or manage existing integrations. To connect a new integration, click the “Connect” button below the integration.

![There, you can connect new or manage existing integrations](https://learn.sessionboard.com/images/kb/3e5f4ada-image-png-Feb-27-2026-04-43-00-2035-PM.png)

For Swapcard, enter the API key associated with your event. ❗Important Information❗

API keys are associated with users in Swapcard. When a user is removed from Swapcard, the API key will no longer be valid in Sessionboard.

![API keys are associated with users in Swapcard](https://learn.sessionboard.com/images/kb/c98bce71-image-png-Feb-27-2026-04-43-24-5232-PM.png)

Once you provide the API key, you will have four options: ‘Enable Continuous Sync’, ‘Sync Speakers as Users’, ‘Force People Import Sync’, and ‘Sync Speakers without Email’:

- Enable ‘Continuous sync’ to create/update records on a regular interval (approx. 30 minutes) so that admins don’t have to force sync them. The admin can still manually push a sync if they want to update between the sync intervals.
- Enable ‘Sync Speakers as Users’ if you wish for them to have an account in Swapcard and to access their event by logging in.
- Enable ‘Force People Import Sync’ when you are syncing a contact that has more than one Client ID in your Swapcard community or you are switching the User within your Swapcard community. To better understand this use case and the impact please see Swapcard’s documentation of when to use the Force Import.
- Enable ‘Sync Speakers without Email’ if you would like for your speaker creation within Swapcard to omit their email. This is often used in cases where registration data is also being imported into Swapcard from a 3rd party.

* * *

## Map events

[Section titled “Map events”](https://learn.sessionboard.com/apps/swapcard-integration#map-events)

Once the integration is connected, a window will appear prompting you to map your Sessionboard events with Swapcard ones. Select the SB event from the dropdown list, then choose the Swapcard event in the right-hand dropdown.

Click “Add Mapping” to complete the mapping process.

![Map Events](https://learn.sessionboard.com/images/kb/dd93f9ad-image-png-Feb-27-2026-04-46-43-7184-PM.png)

Once your event is connected, you will be able to identify if you would like to include ‘Moderators’ & ‘Chairpersons’ in your sync. Speakers will natively sync, but this will allow you to include your ‘Moderators’ and ‘Chairpersons’ if you choose to. Additionally, you can opt not to include your session content/files in your sync. These options will be set per event mapping.

![Once your event is connected](https://learn.sessionboard.com/images/kb/8fdc055e-image-png-Feb-27-2026-04-48-34-9283-PM.png)
Mapping Criteria

1. More than one event can be mapped per Sessionboard organization.
2. NOTE: Within your Sessionboard organization, only one API Key can be utilized. If you would like to map more than one event from Sessionboard into Swapcard, please ensure that every event in Swapcard is associated with the same API Key.
3. At least one Sessionboard event must be mapped to Swapcard for the sync option to appear in the UI.
4. Once a Swapcard event has been mapped to a Sessionboard event, neither can be remapped to another event.

## Mapping session fields

[Section titled “Mapping session fields”](https://learn.sessionboard.com/apps/swapcard-integration#mapping-session-fields)

Once your events have been connected, your next window will allow you to map your designated session fields. Within the dropdown, be sure you have selected the correct event that you wish to map the session fields for.

![Mapping Session Fields](https://learn.sessionboard.com/images/kb/b0267f7b-image-png-Mar-03-2026-08-11-33-0794-PM.png)

The default fields will populate within the session field mapper. You will be able to map additional fields by selecting “Add Field Mapping”. You will then be able to select the Sessionboard field and the destination field in Swapcard that you wish to be mapped to.

## Mapping speaker fields

[Section titled “Mapping speaker fields”](https://learn.sessionboard.com/apps/swapcard-integration#mapping-speaker-fields)

Once your session fields are mapped, you will then be prompted to map your speaker fields. The default fields will populate within the speaker field mapper. You will be able to map additional fields by selecting “Add Field Mapping”. You will then be able to select the Sessionboard field and the destination field in Swapcard that you wish to be mapped to.

![Mapping Speaker Fields](https://learn.sessionboard.com/images/kb/6ac44cb6-image-png-Mar-03-2026-08-12-38-2153-PM.png)

* * *

## Remove mapping

[Section titled “Remove mapping”](https://learn.sessionboard.com/apps/swapcard-integration#remove-mapping)

To remove event mappings, go to your Organization > Settings > Integrations and click Settings.

This will open the mapping window. A list of existing mappings will be displayed. Click “Disconnect“ to disconnect specific mapped events.

![Remove Mapping](https://learn.sessionboard.com/images/kb/c28e4874-image-png-Feb-27-2026-04-50-32-3747-PM.png)

* * *

## Syncing sessions and speakers

[Section titled “Syncing sessions and speakers”](https://learn.sessionboard.com/apps/swapcard-integration#syncing-sessions-and-speakers)

Before initiating a sync, ensure that you have reviewed and accepted the sessions that you want to sync to Swapcard. Sessions must have a date and time to be synced.

You’ll also want to ensure that sessions have rooms (locations) and are assigned if you want those to sync with the associated session.

![Syncing Sessions and Speakers](https://learn.sessionboard.com/images/kb/282e2d04-image-png-Feb-26-2026-05-48-11-8979-PM.png)

### Synced Fields

[Section titled “Synced Fields”](https://learn.sessionboard.com/apps/swapcard-integration#synced-fields)

Sessionboard will endeavor to sync as much data between systems as possible. It is important to use system fields when possible to collect information about your sessions and speakers to ensure they will be successfully matched.

Below is a list of standard fields that will be synced. Fields with an asterisk (\*) are required.

### Sessions

[Section titled “Sessions”](https://learn.sessionboard.com/apps/swapcard-integration#sessions)

Sessions will be synced as Plannings in Swapcard. Speakers will be associated with their sessions.

- Title\*
- NOTE: Standard UTF-8 characters are supported; however, emojis are not supported in Swapcard.
- Starts At datetime\*
- Ends At datetime\*
- Sessions that span multiple dates are not supported in Swapcard and will be synced as the same calendar day
- Sessions that have passed will not sync.
- Description
- NOTE: Standard UTF-8 characters are supported; however, emojis are not supported in Swapcard.
- Locations (Rooms)
- Field names can not be edited once you have begun syncing to a partner system. To edit a field name, we recommend creating a new field name and associating it with the session before re-syncing.
- Speakers
- Content
- Content uploaded to a session will be synced to the session and content library in Swapcard

### Speakers

[Section titled “Speakers”](https://learn.sessionboard.com/apps/swapcard-integration#speakers)

If you wish for the speakers to be created as users, please be sure to enable that feature when connecting your integration.

People can be listed in the Swapcard apps and used to print badges. However, people need to be users to log into the app, schedule meetings, receive emails, or use other platform functions. You will need to make that change in Swapcard.

- First Name \*
- Last Name \*
- Email \*
- Job Title
- Company Name
- Website
- Mobile Phone
- Phone
- Biography
- Address
- Zip (Postcode)
- Headshot

It is important to take into consideration all sources of data that you are syncing to Swapcard. If a registration source is also sending data to Swapcard, you will want to be sure that they are not overwriting your speaker data and only syncing information that you wish them to

If your speaker exists in Swapcard, we will match the profiles via email. Please note that we cannot update/change a speaker’s email once synced. A new speaker will need to be created to allow for the new speaker mapping to be established

* * *

## How to Initiate a Sync

[Section titled “How to Initiate a Sync”](https://learn.sessionboard.com/apps/swapcard-integration#how-to-initiate-a-sync)

1. Go to your event Sessions > Agenda.
2. Under Options, click “Sync to Swapcard”

![How to Initiate a Sync](https://learn.sessionboard.com/images/kb/3845df01-image-png-Feb-27-2026-04-55-16-1832-PM.png)

1. A message will flash at the bottom of the screen confirming that the sync has started.
2. When the sync is complete, another message will flash confirming that data has been synced.
3. If there is an issue, a message will appear verifying the number of sessions and speakers that were attempted to sync and that were successfully synced. Please check that your sessions have all the required fields, and contact us if your issue persists.

### Resync Behavior

[Section titled “Resync Behavior”](https://learn.sessionboard.com/apps/swapcard-integration#resync-behavior)

On resync, new sessions and speakers that have been added to the agenda in Sessionboard will be sent to Swapcard. Any updates that are made to previously synced fields (such as correcting a speaker’s title or changing a session time) will also be applied.

In addition to syncing all sessions and their speakers, you have the ability to choose individual sessions to sync. This can be done under the Sessions > Agenda tab and by selecting the individual sessions you wish to sync. You will want to select your session(s) and then under ‘More’ click ‘Sync to Swapcard’.

![Resync Behavior](https://learn.sessionboard.com/images/kb/c65dd40e-image-png-Mar-03-2026-08-29-16-0530-PM.png)

* * *

## Disconnect Integration

[Section titled “Disconnect Integration”](https://learn.sessionboard.com/apps/swapcard-integration#disconnect-integration)

To disconnect from the integration, go to your Organization > Settings > Integrations

1. Locate your connected integration and click the three-dot icon beside Settings
2. Click “Disconnect Integration.”
3. Confirm that you are sure before deleting the integration.

![Disconnect Integration](https://learn.sessionboard.com/images/kb/957ed672-image-png-Feb-27-2026-04-57-45-6494-PM.png)

Once the integration is disconnected, you can reconnect using a separate API key or reuse the same credentials.

Disconnecting the integration will disconnect all mapped events. Previously-synced sessions cannot be able to be resynced even if you remap the same events. The integration should only be disconnected if you intend to sync to a new organization.