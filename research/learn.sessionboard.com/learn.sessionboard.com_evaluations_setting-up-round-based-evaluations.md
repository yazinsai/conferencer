---
url: "https://learn.sessionboard.com/evaluations/setting-up-round-based-evaluations"
title: "Setting up round-based evaluations (Sessions 2.0) | Sessionboard Help Center"
---

[Skip to content](https://learn.sessionboard.com/evaluations/setting-up-round-based-evaluations#_top)

# Setting up round-based evaluations (Sessions 2.0)

## How evaluations work in Sessions 2.0

[Section titled “How evaluations work in Sessions 2.0”](https://learn.sessionboard.com/evaluations/setting-up-round-based-evaluations#how-evaluations-work-in-sessions-20)

Round-based evaluations replace the single-stage evaluation model from the previous version. Instead of one review pass, you can build a multi-stage process that mirrors how peer review actually works, for example: Initial Screen → Peer Review → Committee Decision.

Each round has its own timeline, scorecard, anonymization settings, and evaluator pool. This means your triage committee can use a simple pass/fail scorecard in Round 1, while your expert reviewers use a detailed rubric with multiple criteria in Round 2.

Key changes from the previous evaluation model:

- Multiple rounds per plan: Chain as many review stages as your program requires.
- Scorecards replace rigid rubrics: Each round has its own scorecard with flexible question types (ratings, text, dropdowns, file uploads).
- Reviewer View Configuration: Control which submission fields evaluators can see, filter by, and view on submission cards.
- Flexible assignment logic: Choose from four distribution modes: All to All, Per Submission, Per Reviewer, or Individual Reviewer.
- Real-time admin visibility: See all evaluators’ progress across all rounds from a single dashboard. The Summary page shows Started / In progress / Complete metrics for Assignments and Evaluators.
- Funnel vs. Parallel rounds: Choose whether submissions must be promoted between rounds (Funnel) or reviewed across rounds simultaneously (Parallel).
- Points vs. Percentage scoring: Plans can be measured by total accumulated points or by percentage out of 100%.

* * *

## The evaluation plan wizard

[Section titled “The evaluation plan wizard”](https://learn.sessionboard.com/evaluations/setting-up-round-based-evaluations#the-evaluation-plan-wizard)

When you create or edit an evaluation plan, Sessionboard opens a 4-step wizard with a sidebar navigation:

1. Overview, Name and basics (plan name, instructions, review period, and global toggles).
2. Rounds, Review rounds (configure round names, types, voting, and scorecards).
3. Evaluators, Select users who can evaluate (choose from existing event users).
4. Assignments, Who evaluates what (filter sessions and set assignment logic).

You can navigate between steps using the sidebar or the Continue → and ← Back buttons at the bottom. Your progress is saved automatically as you work.

To create a new plan, navigate to Program → Evaluations in the left-hand sidebar and click Evaluation Plans → + Add Plan. The wizard opens to the Overview step.

![The evaluation plan wizard](https://learn.sessionboard.com/images/kb/ad8a1524-image-png-Apr-14-2026-07-06-56-2478-PM.png)

## Step 1: Overview

[Section titled “Step 1: Overview”](https://learn.sessionboard.com/evaluations/setting-up-round-based-evaluations#step-1-overview)

The Overview step (labeled “Name and basics” in the sidebar) is where you configure the plan’s core settings.

### Name and Instructions

[Section titled “Name and Instructions”](https://learn.sessionboard.com/evaluations/setting-up-round-based-evaluations#name-and-instructions)

- Name: Give the plan a descriptive name (e.g., “My Evaluation Plan”).
- Set Plan as Open: Toggle this on to open the evaluation plan and begin letting your evaluators review submissions. Leave it off while you are still configuring.
- Instructions: A rich-text editor for guidance that applies to your default round (Round 1). Use formatting, links, and lists to clearly describe the evaluation criteria and expectations.

![Name and Instructions](https://learn.sessionboard.com/images/kb/ef0a5243-image-png-Apr-14-2026-07-07-19-9277-PM.png)

### Review period

[Section titled “Review period”](https://learn.sessionboard.com/evaluations/setting-up-round-based-evaluations#review-period)

Set the window during which evaluators can complete reviews for the default round:

- Opens: The date evaluators can begin submitting reviews.
- Closes: The deadline after which evaluators can no longer submit or modify their reviews.

### Additional settings

[Section titled “Additional settings”](https://learn.sessionboard.com/evaluations/setting-up-round-based-evaluations#additional-settings)

- Enable Anonymized Review: Hides submitter and participant identity from evaluators (applies to Round 1).
- Enable Weekly Reminders: Evaluators get reminder emails for sessions pending in this round (applies to Round 1).
- Include Uploaded Files: Lets evaluators download files attached to sessions in this plan (applies to Round 1).
- Include Sub-Sessions: When enabled, sub-sessions are included in the evaluation scope alongside their parent sessions.
- Show Scores From Other Evaluators: When enabled, evaluators can see other reviewers’ scores for a submission while completing their own review.

![Additional settings](https://learn.sessionboard.com/images/kb/a1decf30-image-png-Jun-24-2026-09-40-02-7445-PM.png)

### Scoring Method

[Section titled “Scoring Method”](https://learn.sessionboard.com/evaluations/setting-up-round-based-evaluations#scoring-method)

Configure how the plan measures overall evaluator scores. This is set in the Overview step under Scoring method:

- Percentage-based: Normalizes scores to a percentage out of 100%, regardless of the number of scorecard questions or their individual point values.
- Points-based: Displays scores as total accumulated points across all scorecard questions.

* * *

## Step 2: Rounds

[Section titled “Step 2: Rounds”](https://learn.sessionboard.com/evaluations/setting-up-round-based-evaluations#step-2-rounds)

The Rounds step (labeled “Review rounds” in the sidebar) is where you configure review rounds (similar to award program rounds). A default Round 1 is created automatically. Click + Add round to add additional stages.

![Step 2: Rounds](https://learn.sessionboard.com/images/kb/5eff8935-image-png-Apr-14-2026-07-10-44-9443-PM.png)

### Basic Information

[Section titled “Basic Information”](https://learn.sessionboard.com/evaluations/setting-up-round-based-evaluations#basic-information)

- Round Name: A descriptive label (e.g., “Round 1,” “Peer Review,” “Final Selection”).
- Round Type: Select the round type (e.g., “Review Only”). This setting cannot be changed after creation.

### Voting

[Section titled “Voting”](https://learn.sessionboard.com/evaluations/setting-up-round-based-evaluations#voting)

- Reviewer Type: Define who can vote in this round (e.g., “Reviewers,” where only selected evaluators can vote).
- Voting Type: Choose the voting method (e.g., “Score Voting”).

![Voting](https://learn.sessionboard.com/images/kb/10b37613-image-png-Apr-14-2026-07-10-19-0414-PM.png)

### Round Mode: Funnel vs. Parallel

[Section titled “Round Mode: Funnel vs. Parallel”](https://learn.sessionboard.com/evaluations/setting-up-round-based-evaluations#round-mode-funnel-vs-parallel)

When configuring your evaluation plan, you can now choose how submissions move between rounds:

- Funnel (default): Submissions must be explicitly promoted from one round to the next. Only promoted submissions appear in subsequent rounds. This is the traditional peer-review model where you triage first and advance only qualifying submissions.

Parallel: Submissions are reviewed across all rounds simultaneously — no promotion required. This mirrors the behavior of Evaluation Plans 1.0 and is useful when every submission should go through every review stage regardless of earlier scores.

![Round Mode: Funnel vs. Parallel](https://learn.sessionboard.com/images/kb/78246bba-image-png-Jun-24-2026-09-44-40-4357-PM.png)

Round mode also decides how you move submissions between rounds. **Promote** and **Demote** in **Sessions → Submissions** work on funnel plans only. For parallel plans, open the evaluation plan’s **Rounds** tab and move submissions between round buckets there.

### Abstaining

[Section titled “Abstaining”](https://learn.sessionboard.com/evaluations/setting-up-round-based-evaluations#abstaining)

Reviewers can mark a submission as abstained when they have a conflict of interest or cannot review it. Configure this per round, under **Abstaining**:

| Setting | What it does |
| --- | --- |
| **Allow reviewers to abstain** | On by default. When off, reviewers cannot mark submissions as abstained in the review portal. |
| **Require a reason when abstaining** | Prompts the reviewer for a reason whenever they abstain. They cannot save the abstention without one. |

When a reason is required, choose how reviewers give it:

- **Free text** — the reviewer types their own reason.
- **Select from a list of options** — the reviewer picks from **Reason options** you define.

The same settings exist on Awards round settings, and behave identically there.

* * *

## Configuring scorecards

[Section titled “Configuring scorecards”](https://learn.sessionboard.com/evaluations/setting-up-round-based-evaluations#configuring-scorecards)

Each round has its own Scorecard, the set of questions your evaluators answer when reviewing a submission. The scorecard is configured within the round settings.

Click + Add Question to choose from:

### Scoring Questions

[Section titled “Scoring Questions”](https://learn.sessionboard.com/evaluations/setting-up-round-based-evaluations#scoring-questions)

- 1-3 Scale: Rate on a 1 to 3 scale.
- 1-5 Scale: Rate on a 1 to 5 scale.
- 1-10 Scale: Rate on a 1 to 10 scale.
- Numeric Score: Custom min/max input for non-standard scoring ranges.
- Custom Dropdown: Custom options with point values (e.g., “Accept = 3, Revise = 2, Reject = 1”).

### Input Fields

[Section titled “Input Fields”](https://learn.sessionboard.com/evaluations/setting-up-round-based-evaluations#input-fields)

- Free Text: Open comments and written feedback.
- File Upload: Document upload (e.g., marked-up manuscripts or review forms).

### Layout

[Section titled “Layout”](https://learn.sessionboard.com/evaluations/setting-up-round-based-evaluations#layout)

- Separator: Section divider to organize longer scorecards visually.

![Layout](https://learn.sessionboard.com/images/kb/c04cac69-image-png-Apr-14-2026-07-12-48-4449-PM.png)

* * *

## Reviewer View Configuration

[Section titled “Reviewer View Configuration”](https://learn.sessionboard.com/evaluations/setting-up-round-based-evaluations#reviewer-view-configuration)

The Reviewer View Configuration section controls what evaluators see when reviewing submissions. It has three sub-sections:

### Visible Fields to Reviewers

[Section titled “Visible Fields to Reviewers”](https://learn.sessionboard.com/evaluations/setting-up-round-based-evaluations#visible-fields-to-reviewers)

Choose which submission fields evaluators can see during their review. All fields are visible by default. Uncheck any field to hide it from reviewers.

Each field shows its type (e.g., Text, Wysiwyg, Dropdown). Common fields include ID, Type, Title, Description, Format, and Tags.

![Visible Fields to Reviewers](https://learn.sessionboard.com/images/kb/e9e395a0-image-png-Apr-14-2026-07-13-14-5688-PM.png)

### Filterable Fields for Reviewers

[Section titled “Filterable Fields for Reviewers”](https://learn.sessionboard.com/evaluations/setting-up-round-based-evaluations#filterable-fields-for-reviewers)

Choose which fields reviewers can filter submissions by. Only checkbox, dropdown (single or multi-select), and multi-select fields are eligible.

The category is always included and cannot be removed. You can optionally enable filtering by Format, Tags, Level, Language, Status, Submitter, Track, Location, and other dropdown-type fields.

![Filterable Fields for Reviewers](https://learn.sessionboard.com/images/kb/0b7015ae-image-png-Apr-14-2026-07-13-29-6263-PM.png)

### Submission Card Fields

[Section titled “Submission Card Fields”](https://learn.sessionboard.com/evaluations/setting-up-round-based-evaluations#submission-card-fields)

Customize what information appears on the submission card in the evaluator’s dashboard. Title is always the card heading and cannot be removed. You can add up to 3 optional fields below the title, displayed in the order you set.

See Add a field to choose from available fields like ID, Type, Description, Format, Tags, Level, Language, Status, and Submitter.

![Submission Card Fields](https://learn.sessionboard.com/images/kb/0ae5a0bf-image-png-Apr-14-2026-07-13-41-9624-PM.png)

### Visible Participant Fields to Reviewers

[Section titled “Visible Participant Fields to Reviewers”](https://learn.sessionboard.com/evaluations/setting-up-round-based-evaluations#visible-participant-fields-to-reviewers)

A fourth sub-section — Visible Participant Fields to Reviewers — lets you choose which participant/speaker fields are visible to evaluators when reviewing a submission. Use this to control how much biographical or identifying information reviewers see about the people associated with each session.

![Visible Participant Fields to Reviewers](https://learn.sessionboard.com/images/kb/c7050c35-image-png-Jun-24-2026-09-48-53-8626-PM.png)

* * *

## Step 3: Evaluators

[Section titled “Step 3: Evaluators”](https://learn.sessionboard.com/evaluations/setting-up-round-based-evaluations#step-3-evaluators)

The Evaluators step (labeled “Select users who can evaluate” in the sidebar) is where you choose who will review submissions for this plan.

Evaluators must already be users on this event. To add an evaluator:

1. Use the Search by name or email… bar to find the user.
2. Click on their name to select them.

At the top of the page, the Rounds section shows which rounds new evaluators are enrolled in. New evaluators are enrolled in the rounds you select here. Check or uncheck rounds to control which review stages each evaluator participates in.

![Step 3: Evaluators](https://learn.sessionboard.com/images/kb/7c477a97-image-png-Apr-14-2026-07-17-29-1746-PM.png)

Invite email toggle: A toggle labeled “Send invite email to new evaluators” controls whether evaluators added from this point on receive an invitation email. Note that existing evaluators are never re-emailed through this toggle.

Resending invites to existing evaluators: To resend an invite to an evaluator who has already been added, go to the plan’s deep-dive view → Evaluators tab, click the ⋯ menu next to the evaluator’s name, and select Resend invite email.

![Resending invites to existing evaluators](https://learn.sessionboard.com/images/kb/22e48ae3-image-png-Jun-24-2026-09-51-01-2589-PM.png)

* * *

## Step 4: Assignments

[Section titled “Step 4: Assignments”](https://learn.sessionboard.com/evaluations/setting-up-round-based-evaluations#step-4-assignments)

The Assignments step has been redesigned with a simplified Assignment Wizard UI. The flow is the same — define a rule, filter sessions, choose logic, preview, confirm — but the interface is more streamlined and easier to navigate.

The Assignments step (labeled “Who evaluates what” in the sidebar) is where you define which submissions each evaluator reviews. The wizard is configured per round — a round selector at the top right (e.g., “Round 1”) shows which round you are configuring. The left panel shows a snapshot of the current state; the right panel shows a live Impact Preview as you make selections.

The Assignments step has been redesigned with a simplified, three-stage wizard UI. The flow replaces the previous multi-step preview flow and is more streamlined.

### Stage 1: Which submissions?

[Section titled “Stage 1: Which submissions?”](https://learn.sessionboard.com/evaluations/setting-up-round-based-evaluations#stage-1-which-submissions)

Choose the pool of submissions this rule should target:

- All submissions in plan scope: Uses this plan’s submission filters and limits.
- By submission filters: Narrow by standard and custom submission fields (status, format, tags, etc.). Use this to route specific types of submissions to the most relevant evaluators.
- Individual submissions: Pick specific submissions by title or ID search.

![Stage 1: Which submissions?](https://learn.sessionboard.com/images/kb/542bf3aa-image-png-Jun-24-2026-09-56-25-6009-PM.png)

### Stage 2: How should they be distributed?

[Section titled “Stage 2: How should they be distributed?”](https://learn.sessionboard.com/evaluations/setting-up-round-based-evaluations#stage-2-how-should-they-be-distributed)

Choose the distribution strategy — this controls how submissions map to evaluators:

- All to All: Every reviewer receives all filtered submissions.
- Individual Reviewer: Assign to one or more specific reviewers you select.

Optionally, set Workload constraints to cap how work is spread:

- Reviewers per submission: Maximum number of reviewers assigned to each submission.
- Max submissions per evaluator: Maximum number of submissions assigned to each evaluator.

When both workload constraints are off, each evaluator is assigned to every submission in scope.

![Stage 2: How should they be distributed?](https://learn.sessionboard.com/images/kb/6a0c0b68-image-png-Jun-24-2026-09-56-57-9819-PM.png)

### Stage 3: Review and apply

[Section titled “Stage 3: Review and apply”](https://learn.sessionboard.com/evaluations/setting-up-round-based-evaluations#stage-3-review-and-apply)

The Impact Preview panel on the right updates in real time and shows:

- Filtered submissions
- Evaluators in this round
- New Assignments

Before applying, choose how this rule interacts with existing assignments (When applying):

- Add to existing: Adds new pairs only; never removes anything.
- Replace not-yet-reviewed: Removes in-scope assignments that don’t match this rule and have no review activity yet.
- Replace all (including reviewed): Removes all non-matching in-scope assignments, even if a reviewer has already started.

Click the Assign \[X\] submissions to \[Y\] evaluators button to apply. When finished, click Done to exit the wizard.

![Stage 3: Review and apply](https://learn.sessionboard.com/images/kb/f336605d-image-png-Jun-24-2026-09-57-43-3841-PM.png)

* * *

## Managing your evaluation plans

[Section titled “Managing your evaluation plans”](https://learn.sessionboard.com/evaluations/setting-up-round-based-evaluations#managing-your-evaluation-plans)

From the Evaluation Plans list, you can perform the following actions on any plan:

- Review: If you’re an admin & a reviewer, you’ll be able to review.
- Edit: Re-open the plan wizard to modify settings, rounds, evaluators, and assignments.
- Open / Close: Control whether evaluators can currently access and submit reviews.
- Export Results: Download evaluation data in two formats: Individual Grades Report (every evaluator’s responses per submission) or Cumulative Grades Report (aggregated scores per submission).
- Duplicate: Create a copy of the plan with the same configuration, useful for running similar evaluations across multiple tracks or events.
- Notify: Notify evaluators.
- Delete: Permanently remove the plan and all associated data.

* * *

### Deep-Dive View

[Section titled “Deep-Dive View”](https://learn.sessionboard.com/evaluations/setting-up-round-based-evaluations#deep-dive-view)

Clicking on an evaluation plan now opens a dedicated deep-dive view with four tabs:

- Submissions: See all submissions in the plan with their evaluation status (ID, Title, Evaluators, Progress, Avg score, Status). Supports Grouped and Flat views.
- Rounds: View submissions grouped by round. Select submissions and use the Bulk action dropdown to Promote to next round or Demote to previous round.
- Evaluators: Monitor individual evaluator progress across all rounds. Use the ⋯ menu next to each evaluator to resend the invite email, Edit assignments, or Remove from plan.
- Review: Access the review interface directly from the plan management view (available when you are also an evaluator on the plan).

![Deep-Dive View](https://learn.sessionboard.com/images/kb/f8a6ee48-image-png-Jun-24-2026-09-59-24-7446-PM.png)

* * *

### Summary Page Metrics

[Section titled “Summary Page Metrics”](https://learn.sessionboard.com/evaluations/setting-up-round-based-evaluations#summary-page-metrics)

The evaluation summary page (Program → Evaluations → Summary tab) now shows enhanced metrics. Metrics are shown separately for Assignments and Evaluators:

- Started: Assignments/evaluators that have begun but not completed all reviews.
- In progress: Assignments/evaluators actively in the middle of a review.
- Complete: Finished evaluations.

Additional metrics on the Summary page include: Total Evaluations, Evaluated Submissions, number of Evaluation Plans, and number of Evaluators. Average Submission Score By Plan and Top 10 Submissions are also available.

![Summary Page Metrics](https://learn.sessionboard.com/images/kb/2a037621-image-png-Jun-24-2026-10-01-48-8781-PM.png)

* * *

## Best practices

[Section titled “Best practices”](https://learn.sessionboard.com/evaluations/setting-up-round-based-evaluations#best-practices)

- Start simple, add complexity: If this is your first round-based evaluation, start with a single round. You can always add more rounds in future programs.
- Choose your round mode intentionally: Use Funnel when you want to triage submissions before advancing them. Use Parallel when all submissions should be reviewed at every stage simultaneously.
- Use anonymization strategically: Enable anonymized review for peer evaluation rounds to reduce bias, but consider disabling it for committee decision rounds where context matters.
- Set clear instructions: Use the rich-text Instructions field on the Overview step to clearly describe evaluation criteria, scoring guidelines, and expectations.
- Customize the reviewer view: Hide irrelevant submission fields and configure card fields so evaluators can quickly scan and prioritize their assigned sessions.
- Enable weekly reminders: Turn on weekly reminder emails to keep evaluators on track without manual follow-up.
- Use field filtering for targeted assignments: Take advantage of the new field filtering in the Assignment Wizard to route specific types of submissions (by language, format, level, etc.) to the most relevant evaluators.
- Preview assignments before saving: Use the Impact Preview panel to verify session counts and evaluator workload before anything goes live.
- Monitor progress via the Summary page: Use the Started / In progress / Complete metrics to spot evaluators who are behind, and follow up before your close date.
- Export early and often: Download interim reports to track trends, even before all evaluations are complete.

* * *

## Next steps

[Section titled “Next steps”](https://learn.sessionboard.com/evaluations/setting-up-round-based-evaluations#next-steps)

With your evaluation plan configured, continue setting up your review process:

- [How to evaluate sessions](https://learn.sessionboard.com/evaluations/how-to-evaluate-sessions): Share this guide with your evaluators. It walks them through accessing their assignments, reviewing submissions, and completing scorecards.
- [Building your submission form](https://learn.sessionboard.com/applications/building-your-submission-form): Review how submissions are collected and what fields evaluators will see during their review.
- [Program site](https://learn.sessionboard.com/site/program-site): Publish your forms and evaluations to a branded portal so evaluators and submitters have a single access point.