---
url: "https://learn.sessionboard.com/faq/how-are-tasks-ordered-within-the-portal"
title: "How are tasks ordered within the portal? | Sessionboard Help Center"
---

[Skip to content](https://learn.sessionboard.com/faq/how-are-tasks-ordered-within-the-portal#_top)

# How are tasks ordered within the portal?

Portal admins can choose how tasks, forms, and file requests are ordered for their participants: sort chronologically by due date, or set a fully custom cross-type order, instead of relying only on the system default.

Each portal (config set) has a **Task display order** setting that lets event admins choose how tasks, forms, and file requests are sequenced for portal users. Choose the mode that fits your event, or leave the default in place; no action is required unless you want to change how tasks appear.

## Task display order modes

[Section titled “Task display order modes”](https://learn.sessionboard.com/faq/how-are-tasks-ordered-within-the-portal#task-display-order-modes)

Under portal settings, admins can choose one of three modes:

### 1\. Smart (default)

[Section titled “1. Smart (default)”](https://learn.sessionboard.com/faq/how-are-tasks-ordered-within-the-portal#1-smart-default)

![Task display order set to Smart](https://learn.sessionboard.com/images/kb/58d3bb22-Screenshot-2026-07-15-at-15.17.14.png)

This is the existing behavior, and it’s what every portal uses unless an admin opts into a different mode. Tasks are sorted using the following hierarchy:

`Required > Incomplete > Type > Due Date > Name`

Required tasks come first, then incomplete tasks, grouped by type, ordered by due date, and finally sorted alphabetically by name.

### 2\. Due Date

[Section titled “2. Due Date”](https://learn.sessionboard.com/faq/how-are-tasks-ordered-within-the-portal#2-due-date)

![Task display order set to Due Date](https://learn.sessionboard.com/images/kb/d74e663b-Screenshot-2026-07-15-at-15.17.28.png)

Tasks, forms, and file requests are sorted chronologically by due date across all task types; type no longer factors into the order. This is a good fit if your participants think in terms of “what’s due next” rather than “what kind of task is this.”

- Items are ordered earliest due date first, regardless of whether they’re a task, form, or file request.
- Items with no due date are grouped at the end of the list, after everything with a due date.
- If two or more items share the same due date, they’re sorted alphabetically by name as a tie breaker.

Because ordering is fully automatic in this mode, there’s no manual reorder step. Admins simply select **Due Date** from the Task display order setting, and the portal recalculates order going forward.

### 3\. Custom

[Section titled “3. Custom”](https://learn.sessionboard.com/faq/how-are-tasks-ordered-within-the-portal#3-custom)

![Task display order set to Custom](https://learn.sessionboard.com/images/kb/afb91feb-Screenshot-2026-07-15-at-15.17.39.png)

Admins define a single, unified order for tasks, forms, and file requests together. This is useful when your task sequence doesn’t map cleanly to type or due date. For example, a form might need to be completed before a related task becomes relevant, or you may have a specific cross-type sequence you want every participant to follow.

**Setting it up:**

1. Select **Custom** from the Task display order setting.
2. Open the unified reorder panel. It has two tabs:
   - **My Tasks**: tasks, forms, and file requests assigned directly to the contact or group
   - **Submission Tasks**: tasks, forms, and file requests scoped to a session or submission
3. Within each tab, drag and drop items into the order you want portal users to see. Order is set independently for each tab, and each session group gets its own order within Submission Tasks.
4. Save your changes. The order takes effect immediately across the portal.

**A few things to know:**

- Custom order is unified across item types, so tasks, forms, and file requests can be freely interleaved rather than grouped by type.
- When you assign a new task, form, or file request while in Custom mode, it’s added to the end of the relevant list until you manually reposition it.
- Reordering only happens in this unified panel. Drag reorder inside the individual Assign Tasks, Assign Forms, and Assign File Requests panels is disabled while Custom mode is active.