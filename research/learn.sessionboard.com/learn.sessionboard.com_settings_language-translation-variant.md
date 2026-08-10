---
url: "https://learn.sessionboard.com/settings/language-translation-variant"
title: "Language variants | Sessionboard Help Center"
---

[Skip to content](https://learn.sessionboard.com/settings/language-translation-variant#_top)

# Language variants

## What Are Language Variants?

[Section titled “What Are Language Variants?”](https://learn.sessionboard.com/settings/language-translation-variant#what-are-language-variants)

Language variants in Sessionboard allow event organizers to provide translated versions of session, contact, and group standard fields. Admin users are required to collect data using the default primary language fields (English) and translate the data into the language variant field.

![What Are Language Variants?](https://learn.sessionboard.com/images/kb/c0c2997b-image-png-Feb-17-2026-06-30-52-0209-PM.png)

## What Languages Are Supported?

[Section titled “What Languages Are Supported?”](https://learn.sessionboard.com/settings/language-translation-variant#what-languages-are-supported)

Sessionboard provides language variants for the following languages:

- German
- English (United Kingdom)
- Spanish
- French
- French (Canada)
- Portuguese
- Portuguese (Brazil)

Events can use more than one language. The default language will be English (US).

## Important Considerations

[Section titled “Important Considerations”](https://learn.sessionboard.com/settings/language-translation-variant#important-considerations)

- Limited to Field Names: Language variants only support the translation of field labels. Other system-generated text, buttons, and instructions will remain in English.
- Not Supported in Embeds: Language variants will not apply to content displayed through embedded elements.
- Integration Limitations: Not all integrations support language variants. If you intend to use an integration, we recommend reaching out to [support@sessionboard.com](mailto:support@sessionboard.com) to confirm compatibility.
- NOTE: Translated fields are accessible through Sessionboard’s open API.
- Admin-Only Access: Language variant fields are only accessible by event admins and cannot be accessed through external-facing forms, such as portal forms, submission forms, intake forms, or applications. The intended use case is for organizers to collect data in the primary language on an intake form and then translate it within the system. To translate what participants see in a portal, use [multi-language portals](https://learn.sessionboard.com/settings/language-translation-variant#multi-language-portals).

## How to Leverage Language Variants

[Section titled “How to Leverage Language Variants”](https://learn.sessionboard.com/settings/language-translation-variant#how-to-leverage-language-variants)

Once Language Variant has been enabled for your event, within the Fields module, select the appropriate field type at the top of the page based on the type of field you want to add a language variant for: Contact, Group, or Session.

![How to Leverage Language Variants](https://learn.sessionboard.com/images/kb/c4d32e7c-image-png-Feb-17-2026-06-31-41-2566-PM.png)

Select the pencil icon to the left of the field you wish to add a language variant to where a pop-up module will appear.

![Select the pencil icon to the left of the field you wish to add a language variant to where a pop-up module](https://learn.sessionboard.com/images/kb/cb31db0c-image-png-Feb-17-2026-06-32-24-4315-PM.png)

Select Language Variants below the Field Name box to expand the variants you can add (NOTE: Check the box to the left of Show this variant to access the variant within the associated module).

![Select Language Variants below the Field Name box to expand the variants you can add](https://learn.sessionboard.com/images/kb/eb42e5a7-image-png-Feb-17-2026-06-34-12-3070-PM.png)

Once complete, select the Save Changes button at the bottom of the pop-up module.

![Once complete, select the Save Changes button at the bottom of the pop-up module](https://learn.sessionboard.com/images/kb/a5a7edcb-image-png-Feb-17-2026-06-33-07-7859-PM.png)

You can add the language variant on the session, contact, or group level using the steps below:

![To view and edit the values for your language Variant, you can also add the variant to your dashboard view](https://learn.sessionboard.com/images/kb/c2037ed8-image-png-Feb-17-2026-06-30-48-8702-PM.png)

1. Within the module (i.e. Sessions, Contacts, Speakers, Exhibitors, or Sponsors), select the pencil icon to the left of the records you want to access. ​

![Within the module](https://learn.sessionboard.com/images/kb/6aa8f26a-image-png-Feb-17-2026-06-34-52-0974-PM.png)

2. To the right of the field, select the blue globe icon to provide a language variant. ​

![To the right of the field, select the blue globe icon to provide a language variant](https://learn.sessionboard.com/images/kb/048cdcd2-image-png-Feb-17-2026-06-35-38-4325-PM.png)

3. Once you have added the translation for the key field, select the Done button to save your field.

![Once you have added the translation for the key field, select the Done button to save your field](https://learn.sessionboard.com/images/kb/185df83c-image-png-Feb-17-2026-06-36-06-0172-PM.png)

4. To save the session, select the Save Changes button at the bottom of the page.

## Multi-language portals

[Section titled “Multi-language portals”](https://learn.sessionboard.com/settings/language-translation-variant#multi-language-portals)

Language variants cover admin-facing field labels. A multi-language portal covers the other side: what participants read.

Turn on **Enable multi-language portal** in **Portals → \[portal\] → Configuration**, under **Multi-language**. A language picker appears in the portal toolbar. Profile, submission, and form fields that have language variants are captured in the selected language, and anything without a saved translation can be auto-translated.

Choose what gets auto-translated:

- Page headers, titles and descriptions
- Field labels without a saved translation
- Placeholders and dropdown values
- Confirmation and success messages

Available languages are configured under **Event Settings**.

Custom [portal participation section titles](https://learn.sessionboard.com/portals/portals-101#participation-sections) are auto-translated along with the other portal header copy.