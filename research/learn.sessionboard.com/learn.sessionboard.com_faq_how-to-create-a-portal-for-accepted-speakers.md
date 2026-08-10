---
url: "https://learn.sessionboard.com/faq/how-to-create-a-portal-for-accepted-speakers"
title: "Create a portal for accepted speakers | Sessionboard Help Center"
---

[Skip to content](https://learn.sessionboard.com/faq/how-to-create-a-portal-for-accepted-speakers#_top)

# Create a portal for accepted speakers

There are two recommended methods for creating a portal specifically for accepted speakers in Sessionboard. Each offers flexibility depending on how you prefer to manage speaker access and visibility.

## Option 1: Filter by Speaker Role + Control Task Visibility

[Section titled “Option 1: Filter by Speaker Role + Control Task Visibility”](https://learn.sessionboard.com/faq/how-to-create-a-portal-for-accepted-speakers#option-1-filter-by-speaker-role--control-task-visibility)

This option uses the built-in Speaker role filter to display all speakers in your event, regardless of session status (pending, declined, or accepted). To limit visibility of tasks to only those assigned to accepted sessions:

1. Create a Custom Portal:

- Navigate to the Portals module.
- Click “Create Portal” to create a Contacts portal.

![Option 1: Filter by Speaker Role + Control Task Visibility](https://learn.sessionboard.com/images/kb/08ba5181-image-png-Feb-24-2026-10-34-26-8374-PM.png)

- In the filter section, ensure the role “Speaker” is filtered by the criteria “is checked”.

![In the filter section, ensure the role “Speaker” is filtered by the criteria “is checked”](https://learn.sessionboard.com/images/kb/526e8054-image-png-Feb-24-2026-10-35-45-6808-PM.png)

- This will include all contacts assigned to sessions as the role type “Speaker” — regardless of the session’s status.

2. Control Task Visibility:

- Go to Page 3 (Configuration) of the portal setup and disable the “Always Show Tasks” setting like this:

![Go to Page 3 (Configuration) of the portal setup and disable the “Always Show Tasks” setting like this](https://learn.sessionboard.com/images/kb/4c1c21e5-image-png-Feb-24-2026-10-38-07-1221-PM.png)
This ensures tasks (forms, file requests, etc.) are only visible to speakers assigned to accepted sessions.

💡NOTE: The list of contacts assigned to the portal will still include all speakers, but only accepted speakers will see the tasks.

## Option 2: Use a Custom Contact Field to Identify Accepted Speakers

[Section titled “Option 2: Use a Custom Contact Field to Identify Accepted Speakers”](https://learn.sessionboard.com/faq/how-to-create-a-portal-for-accepted-speakers#option-2-use-a-custom-contact-field-to-identify-accepted-speakers)

If you prefer to restrict portal access to only accepted speakers (not just task visibility), you can use a custom contact field to flag accepted speakers and filter the portal accordingly.

1. Create a Custom Contact Field:
2. Create a custom checkbox field (e.g., “Accepted Speaker”) and add the field to your Speaker module table view.
3. For each accepted speaker, check the box to identify them as an accepted speaker. 💡TIP: Consider bulk editing the custom field you have created to save time!

![Option 2: Use a Custom Contact Field to Identify Accepted Speakers](https://learn.sessionboard.com/images/kb/ff448e55-image-png-Feb-24-2026-10-40-26-4000-PM.png)

2. Create a Custom Portal Using That Field:
3. When building your portal, apply a filter using the custom field (e.g., “Accepted Speaker is checked”).
4. Only contacts marked as accepted will appear assigned to the portal.

![Only contacts marked as accepted will appear assigned to the portal](https://learn.sessionboard.com/images/kb/1d4276b1-image-png-Feb-24-2026-10-41-27-4961-PM.png)

📝 Important Note: This method requires manual updates:

- If you accept new sessions or assign new speakers to accepted sessions, you’ll need to manually update the custom field for each new speaker. This field does not update automatically based on session status.