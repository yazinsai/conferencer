---
url: "https://learn.sessionboard.com/integrations/cvent"
title: "Cvent | Sessionboard Help Center"
---

[Skip to content](https://learn.sessionboard.com/integrations/cvent#_top)

# Cvent

![Cvent logo](https://learn.sessionboard.com/logo/apps/cvent.png)

The Cvent integration lets you send session and speaker information collected in Sessionboard to Cvent.

## Setup

[Section titled “Setup”](https://learn.sessionboard.com/integrations/cvent#setup)

### In Cvent

[Section titled “In Cvent”](https://learn.sessionboard.com/integrations/cvent#in-cvent)

- Create a **Machine to Machine Application** in the Cvent developer portal (Client ID + Client Secret).
- Grant API scopes for sessions, speakers, custom fields, program items, events, contacts, session categories, and bulk/file operations.
- Enable **Agenda** and **Speakers** on the event (and **Attendee Hub** if syncing session content).

### In Sessionboard

[Section titled “In Sessionboard”](https://learn.sessionboard.com/integrations/cvent#in-sessionboard)

Open Integrations

Go to **Organization Dashboard → Settings → Integrations**.

Enter credentials

Add the Client ID, Client Secret, and endpoint:

- **North America:**`https://api-platform.cvent.com`
- **Europe:**`https://api-platform-eur.cvent.com`

Enable continuous sync

Turn on continuous sync for automatic updates every 30 minutes.

## Event & field mapping

[Section titled “Event & field mapping”](https://learn.sessionboard.com/integrations/cvent#event--field-mapping)

Map each Sessionboard event to a Cvent event. Event options: **Sync Subsessions to Session Programs**, **Skip Content Sync**, **Sync Moderators**, **Sync Chairpersons**.

| Session fields | Speaker fields |
| --- | --- |
| Title _(required)_ | First Name _(required)_ |
| Starts At _(required)_ | Last Name _(required)_ |
| Ends At _(required)_ | Email _(required)_ |
| Description | Company |
| Location | Job Title, Biography, Headshot (max 2MB, 300×300) |

## Syncing

[Section titled “Syncing”](https://learn.sessionboard.com/integrations/cvent#syncing)

- **Manual:** **Sessions → Agenda → Options → Sync to Cvent** (or select individual sessions).
- **Automatic:** new sessions are created, previously synced sessions updated, and only **future** sessions sync. Speakers are matched by email — existing Cvent records are reused, new ones create Contact records.
- **Content:** requires Attendee Hub; max 10MB per file; avoid spaces in filenames.

Sync issues? Contact [support@sessionboard.com](mailto:support@sessionboard.com) with the event name, affected records/fields, and error screenshots.