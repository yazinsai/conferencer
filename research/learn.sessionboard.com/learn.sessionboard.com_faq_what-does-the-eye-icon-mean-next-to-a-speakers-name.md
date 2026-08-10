---
url: "https://learn.sessionboard.com/faq/what-does-the-eye-icon-mean-next-to-a-speakers-name"
title: "What the eye icon next to a speaker means | Sessionboard Help Center"
---

[Skip to content](https://learn.sessionboard.com/faq/what-does-the-eye-icon-mean-next-to-a-speakers-name#_top)

# What the eye icon next to a speaker means

The eye icon next to a speaker’s name controls the public visibility of that speaker in your event embeds and API responses.

![What the eye icon next to a speaker means](https://learn.sessionboard.com/images/kb/a5acae8a-image-png-Feb-09-2026-10-36-50-5272-PM.png)

This setting is helpful if you want to keep a speaker’s profile private until officially announced.

## Public / Hidden Speakers

[Section titled “Public / Hidden Speakers”](https://learn.sessionboard.com/faq/what-does-the-eye-icon-mean-next-to-a-speakers-name#public--hidden-speakers)

- Visible (Eye Icon Not Visible): By default, all speakers are public. This means:
  - They appear in your Sessionboard embeds
  - \`\` The speaker’s information is returned with the is\_public value set to TRUE via the Open API using the ‘Get Sessions’ or ‘Search Sessions’ endpoints.
- Hidden (Eye Icon Crossed Out): If you toggle the icon off (clicking on the speaker’s name so the icon appears crossed out)
- The speaker will be hidden from all embeds.
- \`\` The is\_public value will be FALSE in the Open API using the ‘Get Sessions’ or ‘Search Sessions’ endpoints.

## How To Control Speaker Visibility

[Section titled “How To Control Speaker Visibility”](https://learn.sessionboard.com/faq/what-does-the-eye-icon-mean-next-to-a-speakers-name#how-to-control-speaker-visibility)

You can make a speaker hidden by:

- Clicking on the speaker’s name within the Session participants widget

![How To Control Speaker Visibility](https://learn.sessionboard.com/images/kb/5fd34b2b-image-png-Feb-09-2026-10-37-30-5475-PM.png)

## API Payload Example

[Section titled “API Payload Example”](https://learn.sessionboard.com/faq/what-does-the-eye-icon-mean-next-to-a-speakers-name#api-payload-example)

![API Payload Example](https://learn.sessionboard.com/images/kb/42ca03a5-Screenshot-2025-05-15-at-10.32.58-AM.png)