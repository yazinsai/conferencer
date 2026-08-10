---
url: "https://learn.sessionboard.com/faq/common-speaker-portal-issues-and-how-to-fix-them"
title: "6 common speaker portal issues (and how to fix them) | Sessionboard Help Center"
---

[Skip to content](https://learn.sessionboard.com/faq/common-speaker-portal-issues-and-how-to-fix-them#_top)

# 6 common speaker portal issues (and how to fix them)

## “You do not have access to this portal” error

[Section titled ““You do not have access to this portal” error”](https://learn.sessionboard.com/faq/common-speaker-portal-issues-and-how-to-fix-them#you-do-not-have-access-to-this-portal-error)

### Symptoms

[Section titled “Symptoms”](https://learn.sessionboard.com/faq/common-speaker-portal-issues-and-how-to-fix-them#symptoms)

Speaker or participant clicks portal link → gets “You do not have access to the portal for this event” when logging in → other speakers accessing the same portal fine

### Why it happens

[Section titled “Why it happens”](https://learn.sessionboard.com/faq/common-speaker-portal-issues-and-how-to-fix-them#why-it-happens)

It almost always means the email used to log in does not match the Portal Username on the contact’s record. In Sessionboard, the Email field and the Portal Username are separate fields. The portal checks the Portal Username, not the Email field. If someone is trying to log in with their email address but their Portal Username is a different email (or blank), they’ll be blocked.

### Fix (Admin Side)

[Section titled “Fix (Admin Side)”](https://learn.sessionboard.com/faq/common-speaker-portal-issues-and-how-to-fix-them#fix-admin-side)

1. Go to the contact’s record in Sessionboard
2. Check if the Email field is correct:

![Fix](https://learn.sessionboard.com/images/kb/3aa9e143-image-png-Mar-11-2026-06-38-29-4517-PM.png)

3. Double-check their Portal Username field at the bottom of the contact record:

![Double-check their Portal Username field at the bottom of the contact record](https://learn.sessionboard.com/images/kb/ff0796c4-image-png-Mar-11-2026-06-39-58-4300-PM.png)

4. Make sure the Portal Username matches the email the person is using to log in
5. If the Portal Username is blank or different, update it to match
6. Confirm the contact is assigned to the correct portal (Portals > Edit Criteria) and is in the participant list there.
7. Ask the speaker to try logging in again using the correct URL
8. You can get the portal URL from Portals > Copy Link.

See the KB article Updating a Contact’s Email Address vs. Portal Username for more details on how these two fields work.

* * *

## Portal tasks assigned but not visible to the user

[Section titled “Portal tasks assigned but not visible to the user”](https://learn.sessionboard.com/faq/common-speaker-portal-issues-and-how-to-fix-them#portal-tasks-assigned-but-not-visible-to-the-user)

### Symptoms

[Section titled “Symptoms”](https://learn.sessionboard.com/faq/common-speaker-portal-issues-and-how-to-fix-them#symptoms-1)

Admin assigns a task to a contact through the contacts module → task appears correctly on the admin side under their profile → but it doesn’t show up on the user-facing portal when the user logs in

### Why it happens

[Section titled “Why it happens”](https://learn.sessionboard.com/faq/common-speaker-portal-issues-and-how-to-fix-them#why-it-happens-1)

Tasks must be assigned through a portal that the user is actually a participant of. If the task was assigned to the contact record but the contact isn’t in the portal’s participant list (or is in a different portal), the task won’t appear for them. Additionally, if the portal filters don’t include the contact, the task won’t surface.

### Fix

[Section titled “Fix”](https://learn.sessionboard.com/faq/common-speaker-portal-issues-and-how-to-fix-them#fix)

1. Confirm the contact is in the correct portal:
2. Method 1: Contacts > Columns > Assigned Portal > Apply Changes. Double-check your contact assigned portal.
3. Method 2: Check the portal filters (Portals > Edit Criteria), make sure the contact matches the filter criteria and is listed (e.g. role, group)
4. Verify the task is assigned to the correct portal (Portals > Edit Tasks)
5. Try “View Portal As” from the contact’s profile to see what they see
6. In rare situations where everything looks correct and changes aren’t updated, you can try:
7. Remove, save, and re-add the portal filters
8. Remove, save, and re-assign the task

* * *

## Cannot submit forms through the portal

[Section titled “Cannot submit forms through the portal”](https://learn.sessionboard.com/faq/common-speaker-portal-issues-and-how-to-fix-them#cannot-submit-forms-through-the-portal)

### Symptoms

[Section titled “Symptoms”](https://learn.sessionboard.com/faq/common-speaker-portal-issues-and-how-to-fix-them#symptoms-2)

Portal user tries to submit a form task → gets an error or the submit button doesn’t work → admin has already extended the due date but the issue persists

### Why it happens

[Section titled “Why it happens”](https://learn.sessionboard.com/faq/common-speaker-portal-issues-and-how-to-fix-them#why-it-happens-2)

Extending a due date on an existing form doesn’t always refresh the submission window for users who already have the form open. The form may also have validation errors the user can’t see, or the portal task status may be stuck.

### Fix

[Section titled “Fix”](https://learn.sessionboard.com/faq/common-speaker-portal-issues-and-how-to-fix-them#fix-1)

1. Confirm the form’s due date has been properly saved (re-open tasks for that specific portal via Portals > Edit Tasks, and verify the date)
2. Make sure the task is assigned for all needed portals inside your Portals module.
3. Common case: You assign the task only in 1 portal; other portals are missing it.
4. Make sure the due date has been updated for all needed portals inside your Portals module.
5. Common case: You update the task due date only in 1 portal; other portals are still past due date.
6. Ask the user to log out, clear their browser cache, and log back in
7. Check if the form has required fields that the user hasn’t filled in
8. Try “View Portal As” the affected user to reproduce the issue
9. If the issue persists, contact [support@sessionboard.com](mailto:support@sessionboard.com) with the event name, portal name, and the affected user’s email

* * *

## “View portal as” not working or redirecting incorrectly

[Section titled ““View portal as” not working or redirecting incorrectly”](https://learn.sessionboard.com/faq/common-speaker-portal-issues-and-how-to-fix-them#view-portal-as-not-working-or-redirecting-incorrectly)

### Symptoms

[Section titled “Symptoms”](https://learn.sessionboard.com/faq/common-speaker-portal-issues-and-how-to-fix-them#symptoms-3)

Admin clicks “View Portal As” on a contact → gets an error retrieving portal data, or the portal loads blank

### Why it happens

[Section titled “Why it happens”](https://learn.sessionboard.com/faq/common-speaker-portal-issues-and-how-to-fix-them#why-it-happens-3)

This typically happens with newly added contacts whose portal record hasn’t fully propagated, or when the contact’s portal configuration has an error.

### Fix

[Section titled “Fix”](https://learn.sessionboard.com/faq/common-speaker-portal-issues-and-how-to-fix-them#fix-2)

1. Access their contact record, scroll down & check that the contact’s Portal Username field is populated:

![Access their contact record, scroll down & check that the contact’s Portal Username field is populated](https://learn.sessionboard.com/images/kb/ff0796c4-image-png-Mar-11-2026-06-39-58-4300-PM.png)

2. Try accessing from another browser, such as Google Chrome; many times, browser extensions or a different configuration might be breaking a Sessionboard element.
3. If the error says “error getting portal tasks” or “error retrieving portal data,” contact [support@sessionboard.com](mailto:support@sessionboard.com) — most of the time, this is a visual bug only, and speakers are still able to access their tasks, and the portal loads correctly from their end.

* * *

## Portal filters aren’t picking up speakers or participant count shows 0

[Section titled “Portal filters aren’t picking up speakers or participant count shows 0”](https://learn.sessionboard.com/faq/common-speaker-portal-issues-and-how-to-fix-them#portal-filters-arent-picking-up-speakers-or-participant-count-shows-0)

![Portal filters aren’t picking up speakers or participant count shows 0](https://learn.sessionboard.com/images/kb/ed954288-image-png-Mar-11-2026-07-38-33-6719-PM.png)

### Symptoms

[Section titled “Symptoms”](https://learn.sessionboard.com/faq/common-speaker-portal-issues-and-how-to-fix-them#symptoms-4)

Portal shows 0 participants even though speakers are assigned to sessions

### Why it happens

[Section titled “Why it happens”](https://learn.sessionboard.com/faq/common-speaker-portal-issues-and-how-to-fix-them#why-it-happens-4)

Portal participants are populated by portal filters, not session assignments. If your portal filters (e.g. “Role = Speaker”) don’t match the contacts, or if contacts haven’t been added to the event yet, the count will be 0.

### Fix

[Section titled “Fix”](https://learn.sessionboard.com/faq/common-speaker-portal-issues-and-how-to-fix-them#fix-3)

1. Remove, save & re-add the portal filters to force an update on the list
2. Review the portal filter logic — if using multiple conditions, keep in mind they’ll need to match all conditions in order to be selected
3. Go to the portal configuration and review the filter criteria (Portals > Edit Criteria)
4. Confirm that the contacts you expect match those filters from the Contacts module
5. Check that the contacts have been added to the event (not just the CRM) by adding them via Contacts > Add Contact button
6. If using role-based filters such as Speaker, Moderator, or Chairperson, verify that the role is assigned to their session record

* * *

## Portal invitations aren’t being received

[Section titled “Portal invitations aren’t being received”](https://learn.sessionboard.com/faq/common-speaker-portal-issues-and-how-to-fix-them#portal-invitations-arent-being-received)

### Symptoms

[Section titled “Symptoms”](https://learn.sessionboard.com/faq/common-speaker-portal-issues-and-how-to-fix-them#symptoms-5)

Admin sends portal invitations → users report never receiving them

### Fix

[Section titled “Fix”](https://learn.sessionboard.com/faq/common-speaker-portal-issues-and-how-to-fix-them#fix-4)

1. Check the email address on the contact’s record — typos are the most common cause
2. Verify the contact’s Portal Username and communication email are both correct and up to date — go to the contact record and confirm both fields reflect the address the user expects to receive email at
3. See the KB article Updating a Contact’s Email Address vs. Portal Username for more details on how these two fields work.
4. \`\`Ask the user to check spam/junk folders, especially for [no-reply@sessionboard.com](mailto:no-reply@sessionboard.com)
5. Verify the invitation was actually sent: go to History > Emails and search for the contact
6. If using a corporate email, the user’s IT team may need to allowlist sessionboard.com
7. Common cause: corporate/work email has a strong firewall and isn’t delivering email properly; custom email protection, such as Outlook Protection, Cisco IronPort, etc.
8. Re-send the invitation once again
9. Contact [support@sessionboard.com](mailto:support@sessionboard.com) with the email address having issues if you’re unable to fix it after these steps.

* * *

### Still having issues?

[Section titled “Still having issues?”](https://learn.sessionboard.com/faq/common-speaker-portal-issues-and-how-to-fix-them#still-having-issues)