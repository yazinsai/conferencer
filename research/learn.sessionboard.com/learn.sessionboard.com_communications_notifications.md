---
url: "https://learn.sessionboard.com/communications/notifications"
title: "Notifications and messaging | Sessionboard Help Center"
---

[Skip to content](https://learn.sessionboard.com/communications/notifications#_top)

# Notifications and messaging

Notifications tell your team when something needs them: a submission changed, a task came due, someone replied in a session thread. They arrive in a bell menu in the header, and each person chooses whether they also want them by email or as a Slack DM.

## The notification bell

[Section titled “The notification bell”](https://learn.sessionboard.com/communications/notifications#the-notification-bell)

Once the feature is on, a bell appears in the header with a count of what is waiting. Opening it lists your notifications newest first. You can **Mark all read** from here, or click **See all notifications** to open the full inbox.

Inside an event or an organization, the bell defaults to showing only that context. A **This event** (or **This organization**) / **All** toggle at the top switches between the two, and a line at the bottom tells you how many notifications are waiting elsewhere.

Inside an event with AI Agents turned on, the bell gains a second tab, **Needs attention**, holding actions your agents have proposed. It opens on whichever tab has work in it, and the count on the bell covers both. Outside an event, or with AI Agents off, there are no tabs — just the inbox.

## The notification centre

[Section titled “The notification centre”](https://learn.sessionboard.com/communications/notifications#the-notification-centre)

Open the full inbox from **See all notifications** in the bell, or go to **Notifications** in the sidebar. It exists at both levels:

| Scope | Where |
| --- | --- |
| Organization | **Org → Notifications** |
| Event | **Event → Notifications** |

The inbox has an **Unread** filter and a **Group** control set to **None**, **Event**, or **Date** — Date bands everything into Today, Yesterday, Earlier this week, Earlier this month, and Older. Grouping by event disappears when you are already looking at a single event, since every row would land in the same group.

The same scope toggle as the bell sits at the top: the current **This event** or **This organization** on one side, **All events & orgs** on the other. Use it to triage one event, then switch to All to clear the rest.

## Choose how you are notified

[Section titled “Choose how you are notified”](https://learn.sessionboard.com/communications/notifications#choose-how-you-are-notified)

The **Preferences** tab lists every notification type with a checkbox per delivery channel.

| Channel | What it does |
| --- | --- |
| **In-product** | Appears in the bell and the inbox. |
| **Email** | Sends an email, either immediately or in a daily digest. |
| **Slack** | Sends the recipient a direct message from your organization’s connected Slack app. |

Types are grouped into **Admin**, **Portal**, **System**, and **Messages** so you can find one quickly, and there is a filter box above the list.

### Organization and event preferences

[Section titled “Organization and event preferences”](https://learn.sessionboard.com/communications/notifications#organization-and-event-preferences)

You can set preferences at the organization level and then override them for a single event. When you are looking at an event’s preferences, Sessionboard notes that **event settings override your organization defaults** — so a busy event can be noisier than your baseline without you having to change everything back afterwards.

### Email frequency

[Section titled “Email frequency”](https://learn.sessionboard.com/communications/notifications#email-frequency)

Click **Manage email frequency** to choose between:

- **Immediately** — a notification email as soon as something happens.
- **Daily summary** — one email a day instead of one per notification.

Most notification types default to the daily summary. Conversational ones — new messages, mentions, and changes to session data — default to immediate instead, because a batched reply a day later is not much use. Your own choice always wins over the default.

### Slack delivery

[Section titled “Slack delivery”](https://learn.sessionboard.com/communications/notifications#slack-delivery)

Slack notifications arrive as a DM from the Sessionboard app, in the same place as your other app notifications, with a link back to the record.

To use it, connect Slack under **Apps → Slack** first. The preferences screen prompts you when it is not connected. If Slack is unavailable — not connected, or the recipient is not in the workspace — Sessionboard skips the Slack copy quietly and still delivers in-product and email, so nobody misses a notification because of a workspace problem.

## Set an organization-wide policy

[Section titled “Set an organization-wide policy”](https://learn.sessionboard.com/communications/notifications#set-an-organization-wide-policy)

Organization admins get a third tab, **Organization policy**, on the org notification centre. It sets the default for everyone in the organization, one notification type at a time:

| Policy | Effect |
| --- | --- |
| **On** | Members receive it and can manage it themselves. This is the default. |
| **Off** | Disabled for the whole organization. Nobody receives it. |
| **Required** | Members receive it and cannot turn it off. |

Members see the result as locked rows in their own preferences, labelled **Required by your organization** or **Turned off by your organization**.

The tab appears only on the organization notification centre, not the event one, and only for admins who can update organization settings.

## Session messages

[Section titled “Session messages”](https://learn.sessionboard.com/communications/notifications#session-messages)

When notifications are on, session profiles gain a **Messages** tab — a threaded conversation about that session, with @mentions. Admins see every thread on the session; participants see the ones they are part of. Mentions notify the person you named through whichever channels they have chosen.

Speaker portals show a message indicator on a submission when there is something to read, so participants do not have to open each one to check.

## Related

[Section titled “Related”](https://learn.sessionboard.com/communications/notifications#related)

- [Automated emails](https://learn.sessionboard.com/communications/automated-emails) — the transactional emails Sessionboard sends regardless of these settings
- [Early Access](https://learn.sessionboard.com/get-started/early-access) — how to turn the feature on