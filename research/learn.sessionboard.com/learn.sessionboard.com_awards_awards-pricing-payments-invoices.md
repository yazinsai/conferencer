---
url: "https://learn.sessionboard.com/awards/awards-pricing-payments-invoices"
title: "Awards pricing, payments & invoices | Sessionboard Help Center"
---

[Skip to content](https://learn.sessionboard.com/awards/awards-pricing-payments-invoices#_top)

# Awards pricing, payments & invoices

## When to charge for submissions

[Section titled “When to charge for submissions”](https://learn.sessionboard.com/awards/awards-pricing-payments-invoices#when-to-charge-for-submissions)

Not every awards program requires a submission fee — but for those that do, Sessionboard lets you configure pricing directly within the program setup wizard (Step 4: Pricing) or later through Settings → Edit Settings on your Awards Program Dashboard.

The first choice you will make is When to Collect Payment. There are two options:

- Do Not Collect Payment — Submissions are free. The rest of the pricing configuration is skipped entirely. You can always enable payment collection later by editing your program settings.
- Upon Submission — Payment is collected at the time the submitter completes and submits their entry. The submitter must complete payment before the submission is finalized.

![When to charge for submissions](https://learn.sessionboard.com/images/kb/c5569395-image-png-Mar-24-2026-02-53-55-0950-PM.png)

* * *

## Setting up a payment gateway

[Section titled “Setting up a payment gateway”](https://learn.sessionboard.com/awards/awards-pricing-payments-invoices#setting-up-a-payment-gateway)

Before you can collect payments, you need a payment gateway connected to your organization. This is configured at the organization level, not per program — so once set up, any awards program in your organization can use it.

If no payment gateway is configured yet, the Pricing step will display a prompt with a Manage Payment Settings button. Clicking this takes you to your organization’s payment settings, where you can connect a gateway.

Once a gateway is available, select it from the Select Payment Gateway dropdown in the Pricing step. The selected gateway will process all transactions for this program.

![Setting up a payment gateway](https://learn.sessionboard.com/images/kb/d0e40bb4-image-png-Mar-24-2026-02-58-47-6033-PM.png)

### Supported payment gateways

[Section titled “Supported payment gateways”](https://learn.sessionboard.com/awards/awards-pricing-payments-invoices#supported-payment-gateways)

Sessionboard supports over 100 payment gateways. When adding a new gateway, you can choose from the following featured providers:

- Stripe — Cards, wallets, and bank transfers.
- Braintree — PayPal, Venmo, and cards.
- Authorize.net — Cards and eChecks.
- PayPal Commerce — PayPal, Pay Later, and Venmo.

For the full list and to make sure your preferred payment gateway is supported, please access:

- Awards List of Supported Payment Gateways

If your preferred gateway is not listed, reach out to the Sessionboard team for assistance connecting it.

![Supported payment gateways](https://learn.sessionboard.com/images/kb/344d60ea-image-png-Mar-24-2026-03-06-33-9458-PM.png)

### Adding a payment gateway

[Section titled “Adding a payment gateway”](https://learn.sessionboard.com/awards/awards-pricing-payments-invoices#adding-a-payment-gateway)

To add a new payment gateway, navigate to your organization’s payment settings via Settings → Payment Settings → Add Gateway. The setup follows a guided process:

- Step 1 — Select Provider: Choose your payment gateway from the available provider cards.
- Step 2 — Configure: Enter a Gateway Nickname (a display name to help you identify this gateway, e.g., “Stripe - Awards”), paste your Restricted API Key from your gateway provider, and optionally enable Test Mode to use sandbox credentials for testing before going live. Expandable setup instructions are available on this screen if you need help locating your API key.
- Step 3 — Finalize: Review your configuration and complete the setup.

![Adding a payment gateway](https://learn.sessionboard.com/images/kb/33249586-image-png-Mar-24-2026-03-08-23-8494-PM.png)
Tip: Use Test Mode during initial setup to verify that payments process correctly with sandbox credentials before switching to your live API key. This avoids accidental charges while you are still configuring your program.

* * *

## Configuring the base fee

[Section titled “Configuring the base fee”](https://learn.sessionboard.com/awards/awards-pricing-payments-invoices#configuring-the-base-fee)

The Base Fee is the default fee charged for every submission in this program. It appears at the top of the pricing configuration and is set as a fixed dollar amount (e.g., $50 USD).

To set or change the base fee, enter the amount in the Base Fee field. This fee applies to all submissions regardless of category or other conditions — think of it as the starting price before any pricing rules adjust it.

If your program is free, leave the base fee at $0 (or select “Do Not Collect Payment” in the step above).

![Configuring the base fee](https://learn.sessionboard.com/images/kb/df5bdc21-image-png-Mar-24-2026-03-03-46-7340-PM.png)

* * *

## Pricing rules (conditional fees)

[Section titled “Pricing rules (conditional fees)”](https://learn.sessionboard.com/awards/awards-pricing-payments-invoices#pricing-rules-conditional-fees)

Pricing Rules let you adjust the submission fee based on specific conditions. This is useful for scenarios like category-based pricing, early-bird discounts, or tiered fees based on submission attributes.

To add a pricing rule, click + Add Rule in the Pricing Rules section. Each rule follows an If / then structure: select a field, set a condition (e.g., “Selected Category is Lifetime Achievement”), then define how the fee should change. The action can be one of three types:

- Set fee to — Overrides the base fee entirely with a specific dollar amount for matching submissions.
- Add — Adds a fixed amount on top of the base fee.
- Subtract — Reduces the base fee by a fixed amount (useful for discounts tied to specific conditions).

Pricing rules are evaluated in order and applied on top of (or in place of) the base fee, depending on how you configure them.

![Pricing rules](https://learn.sessionboard.com/images/kb/abd749a9-image-png-Mar-24-2026-03-11-48-1892-PM.png)

* * *

## VAT rules

[Section titled “VAT rules”](https://learn.sessionboard.com/awards/awards-pricing-payments-invoices#vat-rules)

If your organization needs to collect tax on submission fees, use the VAT Rules section to configure tax rates. VAT rules are applied to the overall total in a user’s cartafter the base fee and any pricing rules have been calculated.

Click + Add VAT Rule to create a new rule. Each rule requires a Label (e.g., VAT, GST, Sales Tax), a Type, and an Amount. The type can be either:

- Add additional % — Applies a percentage-based tax on top of the total (e.g., +20%).
- Add flat fee — Adds a fixed amount to the total regardless of the submission fee.

![VAT rules](https://learn.sessionboard.com/images/kb/7c14c93b-image-png-Mar-24-2026-03-13-43-7547-PM.png)

* * *

## Promo codes

[Section titled “Promo codes”](https://learn.sessionboard.com/awards/awards-pricing-payments-invoices#promo-codes)

Promo codes give you the ability to offer discounts to specific submitters. When a promo code is active, applicants can enter it at checkout to receive a reduced fee.

To create a promo code, click + Add Promo Code in the Promo Codes section at the bottom of the Pricing step. Enter a Code (the text string applicants will type at checkout, e.g., EARLYBIRD), select a Type, and set an Amount. The discount type can be:

- Percentage off — Reduces the submission fee by a percentage (e.g., 20% off).
- Flat amount off — Deducts a fixed dollar amount from the submission fee.

![Promo codes](https://learn.sessionboard.com/images/kb/a81f9304-image-png-Mar-24-2026-03-15-51-3170-PM.png)

* * *

## Managing invoices

[Section titled “Managing invoices”](https://learn.sessionboard.com/awards/awards-pricing-payments-invoices#managing-invoices)

Once your program begins collecting payments, all transactions are tracked in the Invoices tab. You can access invoices in two places:

- Program-level: From your Awards Program Dashboard, navigate to Dashboard → Invoices section to see transactions for that specific program.
- Organization-level: From Programs → Awards, click the Invoices tab to see transactions across all programs.

The Invoices view shows four summary cards at the top:

- Total Collected — The total amount of payments successfully received.
- Pending — Payments that have been initiated but not yet completed.
- Refunded — The total amount that has been refunded to submitters.
- Failed Payments — The number of payment attempts that did not succeed.

Below the summary cards, individual invoices are listed with details including the submitter, amount, payment status, and date.

![Managing invoices](https://learn.sessionboard.com/images/kb/f21c38d7-image-png-Mar-24-2026-03-27-31-2180-PM.png)

### Processing refunds

[Section titled “Processing refunds”](https://learn.sessionboard.com/awards/awards-pricing-payments-invoices#processing-refunds)

If a submitter needs a refund — for example, due to a duplicate submission or a withdrawn entry — you can process it from the Invoices section. Locate the invoice, and use the refund option to return the payment to the submitter. Refunded amounts are reflected in the Refunded summary card.

* * *

## Next steps

[Section titled “Next steps”](https://learn.sessionboard.com/awards/awards-pricing-payments-invoices#next-steps)

With pricing and payments configured, continue setting up your program:

- Awards Notifications & Email Templates — Customize the Invoice / Receipt email and other automated notifications that reference pricing and payment details.
- Managing Submissions, Reviewers & Rounds — Set up evaluation rounds, add reviewers, and manage the review pipeline.
- Setting Up Your Awards Site — Publish a branded portal where submitters can log in, pay, and track their submissions.