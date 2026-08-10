---
url: "https://learn.sessionboard.com/faq/why-am-i-not-receiving-emails"
title: "Why you aren't receiving emails | Sessionboard Help Center"
---

[Skip to content](https://learn.sessionboard.com/faq/why-am-i-not-receiving-emails#_top)

# Why you aren't receiving emails

If you or your speakers, submitters, or portal users are not receiving emails sent from Sessionboard, this article covers the most common causes and fixes based on real support cases.

## History shows the email was sent, but it never arrived

[Section titled “History shows the email was sent, but it never arrived”](https://learn.sessionboard.com/faq/why-am-i-not-receiving-emails#history-shows-the-email-was-sent-but-it-never-arrived)

### Symptoms

[Section titled “Symptoms”](https://learn.sessionboard.com/faq/why-am-i-not-receiving-emails#symptoms)

Admin sends an email or a test to themselves, History shows it as sent, but it does not appear in the inbox. Often it fails to arrive at both a work and a personal address.

### Why it happens

[Section titled “Why it happens”](https://learn.sessionboard.com/faq/why-am-i-not-receiving-emails#why-it-happens)

A record in History means Sessionboard handed the message to our email provider successfully. Anything after that point is handled by the receiving mail server, so the message is almost always being filtered, quarantined, or delayed on the recipient side rather than lost in Sessionboard.

### Fix

[Section titled “Fix”](https://learn.sessionboard.com/faq/why-am-i-not-receiving-emails#fix)

1. Confirm the send actually happened: go to **History > Emails** and search for the recipient.
2. Check the spam, junk, quarantine, and Other/Clutter folders, including any email protection service your organization uses (Outlook Protection, Mimecast, Cisco IronPort, Proofpoint).
3. Search the mailbox for `no-reply@sessionboard.com`, or for your custom domain address if you have the [Custom Email Domain](https://learn.sessionboard.com/communications/add-on-custom-email-domain) add-on.
4. Send a test to an address on a different provider (for example a personal Gmail) to confirm where the block is.
5. Have your IT team, and/or the recipient’s IT team, allowlist Sessionboard’s sending IP addresses. This is the fix in most cases where an email shows as sent but never arrives:
   - `159.183.10.230`
   - `159.183.207.219`
   - `159.183.47.254`
6. Resend the email once the IPs are allowlisted and confirm it arrives. For full allowlisting detail, see [Emails are landing in spam or being blocked by a corporate filter](https://learn.sessionboard.com/faq/why-am-i-not-receiving-emails#emails-are-landing-in-spam-or-being-blocked-by-a-corporate-filter).

* * *

## Emails are landing in spam or being blocked by a corporate filter

[Section titled “Emails are landing in spam or being blocked by a corporate filter”](https://learn.sessionboard.com/faq/why-am-i-not-receiving-emails#emails-are-landing-in-spam-or-being-blocked-by-a-corporate-filter)

### Symptoms

[Section titled “Symptoms”](https://learn.sessionboard.com/faq/why-am-i-not-receiving-emails#symptoms-1)

Emails arrive at personal addresses but get caught by your organization’s spam filter. Universities, government agencies, hospitals, and other institutions with strict filtering are the most common blockers.

### Why it happens

[Section titled “Why it happens”](https://learn.sessionboard.com/faq/why-am-i-not-receiving-emails#why-it-happens-1)

Sessionboard sends all email through SendGrid, from Sessionboard’s sending IP addresses. Strict recipient filters may quarantine or block that mail even when the message and the sender are legitimate. This applies whether you send from `no-reply@sessionboard.com` or from a custom email domain.

### Fix

[Section titled “Fix”](https://learn.sessionboard.com/faq/why-am-i-not-receiving-emails#fix-1)

1. Ask your IT team, and your speakers’ IT teams, to allowlist the following sending IP addresses:
   - `159.183.10.230`
   - `159.183.207.219`
   - `159.183.47.254`
2. Also allowlist the sending address: `no-reply@sessionboard.com`, or your custom domain address if you have the [Custom Email Domain](https://learn.sessionboard.com/communications/add-on-custom-email-domain) add-on.
3. Send a test to one affected recipient after the allowlist is in place to confirm the change worked.
4. Allowlisting is per organization. Each blocking organization needs to do it on their own mail server, and allowlisting by one organization does not carry over to another.

If recipients still do not receive email after the IPs are allowlisted, contact [support@sessionboard.com](mailto:support@sessionboard.com) with the affected addresses and the send time.

* * *

## The email address on the contact record is wrong

[Section titled “The email address on the contact record is wrong”](https://learn.sessionboard.com/faq/why-am-i-not-receiving-emails#the-email-address-on-the-contact-record-is-wrong)

### Symptoms

[Section titled “Symptoms”](https://learn.sessionboard.com/faq/why-am-i-not-receiving-emails#symptoms-2)

One specific person never receives anything while everyone else on the same send does.

### Why it happens

[Section titled “Why it happens”](https://learn.sessionboard.com/faq/why-am-i-not-receiving-emails#why-it-happens-2)

A typo in the address, most often a wrong or extra character in the domain. These sends usually appear as delivered or bounced in History depending on whether the domain exists.

### Fix

[Section titled “Fix”](https://learn.sessionboard.com/faq/why-am-i-not-receiving-emails#fix-2)

1. Open the contact record and check the **Email** field character by character.
2. Correct the address and confirm the **Portal Username** field also reflects the address the person expects to receive email at. See [Updating a Contact’s Email Address vs. Portal Username](https://learn.sessionboard.com/contacts/changing-a-contact-s-email-address).
3. Check for a duplicate contact record holding the old address. See [How to Merge Duplicate Contacts](https://learn.sessionboard.com/contacts/merge-duplicates).
4. Resend the email.

* * *

## Portal emails go to a different address than the one on the record

[Section titled “Portal emails go to a different address than the one on the record”](https://learn.sessionboard.com/faq/why-am-i-not-receiving-emails#portal-emails-go-to-a-different-address-than-the-one-on-the-record)

### Symptoms

[Section titled “Symptoms”](https://learn.sessionboard.com/faq/why-am-i-not-receiving-emails#symptoms-3)

The Email field on the profile is correct, but portal access and portal notifications use a different address.

### Why it happens

[Section titled “Why it happens”](https://learn.sessionboard.com/faq/why-am-i-not-receiving-emails#why-it-happens-3)

In Sessionboard the **Email field and the Portal Username are separate fields**. Portal access and portal notifications follow the Portal Username, so updating only the Email field leaves the old address in place.

### Fix

[Section titled “Fix”](https://learn.sessionboard.com/faq/why-am-i-not-receiving-emails#fix-3)

1. Open the contact record and scroll to the **Portal Username** field at the bottom.
2. Update it to match the address the person uses.
3. Make sure there are no duplicate records with similar names or email addresses.
4. Resend the portal invitation.
5. For full detail on how these two fields interact, see [Updating a Contact’s Email Address vs. Portal Username](https://learn.sessionboard.com/contacts/changing-a-contact-s-email-address).

* * *

## Emails are bouncing

[Section titled “Emails are bouncing”](https://learn.sessionboard.com/faq/why-am-i-not-receiving-emails#emails-are-bouncing)

### Symptoms

[Section titled “Symptoms”](https://learn.sessionboard.com/faq/why-am-i-not-receiving-emails#symptoms-4)

History shows bounce errors for some or all recipients at a given company.

### Why it happens

[Section titled “Why it happens”](https://learn.sessionboard.com/faq/why-am-i-not-receiving-emails#why-it-happens-4)

A bounce is an explicit rejection from the receiving server. Common causes are an address that no longer exists, a full mailbox, or a recipient server rejecting the sending reputation or the message content.

### Fix

[Section titled “Fix”](https://learn.sessionboard.com/faq/why-am-i-not-receiving-emails#fix-4)

1. Go to **History > Emails** and open the bounce to read the reason returned by the receiving server.
2. If the reason is an unknown or invalid recipient, correct the address on the contact record.
3. If the reason references a block, a blocklist, or a policy rejection, the recipient’s server is refusing the message. Ask their IT team to allowlist Sessionboard’s [sending IP addresses](https://learn.sessionboard.com/faq/why-am-i-not-receiving-emails#emails-are-landing-in-spam-or-being-blocked-by-a-corporate-filter).
4. If the issue persists after allowing the IPs on the bounced address email, contact [support@sessionboard.com](mailto:support@sessionboard.com) with the domain and a screenshot of the bounce so we can investigate with our email provider.

* * *

## Portal invitations were never received

[Section titled “Portal invitations were never received”](https://learn.sessionboard.com/faq/why-am-i-not-receiving-emails#portal-invitations-were-never-received)

### Symptoms

[Section titled “Symptoms”](https://learn.sessionboard.com/faq/why-am-i-not-receiving-emails#symptoms-5)

The most common cause is a portal mismatch. Notifications are configured per portal, so if the contact is assigned to a different portal than the one you configured notifications on, they will not receive anything. Portal assignment is driven by portal filters rather than session assignment, so a contact can easily sit in a different portal than you expect.

### Fix

[Section titled “Fix”](https://learn.sessionboard.com/faq/why-am-i-not-receiving-emails#fix-5)

1. Check which portal the contact is actually assigned to:
1. Go to **Contacts**.
2. Click **Columns**, add **Assigned Portal**, then **Apply Changes**.
3. Find the contact and note the portal listed.
2. Go to Portal settings, make sure their assigned portal has notifications ON for tasks or summaries.
3. Confirm notifications are switched on for that portal. Email Notifications and the Weekly Digest are enabled or disabled per portal, so a contact in a portal with notifications off will never be emailed.
4. Check the email address on the contact record for typos, and verify the **Portal Username** matches the address the person uses: [Updating a Contact’s Email Address vs. Portal Username](https://learn.sessionboard.com/contacts/changing-a-contact-s-email-address)
5. Confirm the invitation was sent: **History > Emails**, then search for the contact.
6. Ask the user to check spam and junk for `no-reply@sessionboard.com`. If they are on a corporate address, have their IT team allowlist Sessionboard’s [sending IP addresses](https://learn.sessionboard.com/faq/why-am-i-not-receiving-emails#emails-are-landing-in-spam-or-being-blocked-by-a-corporate-filter).
7. Resend the invitation. See [Inviting Users To The Event Portal](https://learn.sessionboard.com/portals/inviting-users-to-the-event-portal).

For other portal access problems, see [6 Common Speaker Portal Issues (and How to Fix Them)](https://learn.sessionboard.com/faq/common-speaker-portal-issues-and-how-to-fix-them).

* * *

### Still having issues?

[Section titled “Still having issues?”](https://learn.sessionboard.com/faq/why-am-i-not-receiving-emails#still-having-issues)

Contact [support@sessionboard.com](mailto:support@sessionboard.com) with:

- Event name
- The recipient email address or addresses affected
- The date and time of the send
- The email or template name
- A screenshot of the bounce or error, if you have one
- What steps you have already tried