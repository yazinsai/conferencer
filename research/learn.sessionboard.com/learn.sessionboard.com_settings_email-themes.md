---
url: "https://learn.sessionboard.com/settings/email-themes"
title: "Email themes | Sessionboard Help Center"
---

[Skip to content](https://learn.sessionboard.com/settings/email-themes#_top)

# Email themes

* * *

## What Are Email Themes?

[Section titled “What Are Email Themes?”](https://learn.sessionboard.com/settings/email-themes#what-are-email-themes)

Email Themes control the visual wrapper around your emails — the header, footer, background, colors, and layout that surround the email content. This is separate from the email’s actual text and body copy.

Common use cases:

- Sending plain, unbranded emails (similar to a regular Gmail message)
- Adding a custom event logo as a header banner
- Replacing Sessionboard’s default footer with a branded one
- Applying custom colors and typography to all outgoing event emails

📌 Email Themes only apply to emails sent manually via the “Send Email” modal. Automated system emails are not affected.

## Email Themes vs. Email Templates \`\`\`\`

[Section titled “Email Themes vs. Email Templates \`\`\`\`”](https://learn.sessionboard.com/settings/email-themes#email-themes-vs-email-templates-)

| Email Templates | Email Themes |
| --- | --- |
| Define the content of the email (subject line, body text, merge tags) | Define the visual wrapper around that content (header, footer, colors, layout) |
| Existing feature — works the same as before | New feature — enabled upon request |
| Injected into the theme via {{{content}}} | Must include {{{content}}} to display email body correctly |

Think of it this way: the template is what you write inside the email, and the theme is the branded envelope it sits inside.

### Accessing email themes

[Section titled “Accessing email themes”](https://learn.sessionboard.com/settings/email-themes#accessing-email-themes)

Navigate to Settings → Email Themes within your event:

![Accessing Email Themes](https://learn.sessionboard.com/images/kb/245eca0c-image-png-Jul-08-2026-05-55-11-7469-PM.png)

The themes list is organized into three tabs:

- All Themes — every theme associated with this event
- Default — the theme currently applied to all manually-sent emails (marked with a ⭐)
- Custom — themes you’ve created

![Custom — themes you’ve created](https://learn.sessionboard.com/images/kb/285a810f-image-png-Mar-20-2026-04-16-42-9916-PM.png)

The Standard theme is built-in and set as the default out of the box. It cannot be edited, duplicated, or deleted.

### Creating a new theme

[Section titled “Creating a new theme”](https://learn.sessionboard.com/settings/email-themes#creating-a-new-theme)

Click + Add Theme in the top right corner. You’ll be prompted to select a starting template:

- Plain — a minimal, unstyled wrapper with no header or footer (ideal for clean, Gmail-style emails)
- Event Logo — includes your event logo in the header by default

![Creating a New Theme](https://learn.sessionboard.com/images/kb/4cc0864e-image-png-Mar-20-2026-04-17-17-0953-PM.png)

Select a template to open the theme editor.

### Using the theme editor

[Section titled “Using the theme editor”](https://learn.sessionboard.com/settings/email-themes#using-the-theme-editor)

The theme editor is a drag-and-drop builder. The left sidebar contains five panels:

- Blocks — add new content blocks (text, images, buttons, dividers, etc.)
- Pages & Layers — view and navigate the layer structure of your theme
- Global Styles — set global fonts, colors, and spacing
- Assets — upload and manage images such as your event logo
- Templates — switch to a different starter template

![Using the Theme Editor](https://learn.sessionboard.com/images/kb/7f882943-image-png-Mar-20-2026-04-19-14-5407-PM.png)

#### Toolbar

[Section titled “Toolbar”](https://learn.sessionboard.com/settings/email-themes#toolbar)

The top toolbar includes: Component outline, Preview, Fullscreen, Code editor, Import code, Download, Delete, Save, Undo, and Redo. Use the Desktop / Mobile toggle to preview how the theme renders across screen sizes.

![Toolbar](https://learn.sessionboard.com/images/kb/4d49fe00-image-png-Mar-20-2026-04-19-57-1800-PM.png)

#### \`\`Required: The {{{content}}} Tag

[Section titled “\`\`Required: The {{{content}}} Tag”](https://learn.sessionboard.com/settings/email-themes#required-the-content-tag)

\`\`Every theme must contain the {{{content}}} merge tag. This is where your email template content is injected when an email is sent. If the tag is missing, the editor will display a warning:

![Required: The {{{content}}} Tag](https://learn.sessionboard.com/images/kb/e098f6ff-image-png-Mar-20-2026-04-03-39-4388-PM.png)

Do not remove this tag from your theme.

#### Importing HTML

[Section titled “Importing HTML”](https://learn.sessionboard.com/settings/email-themes#importing-html)

Use the Code or Import code buttons in the toolbar to paste custom HTML directly into the editor. Any valid HTML email layout can be imported, including code from external email design tools.

![Importing HTML](https://learn.sessionboard.com/images/kb/4cb727a7-image-png-Mar-20-2026-04-21-00-9499-PM.png)

### Available Merge Tags

[Section titled “Available Merge Tags”](https://learn.sessionboard.com/settings/email-themes#available-merge-tags)

Insert dynamic variables into your theme to pull live event and recipient data at send time. Tags are available via the Edit variable panel in the editor or can be typed directly in the code view.

![Available Merge Tags](https://learn.sessionboard.com/images/kb/938246c9-image-png-Mar-20-2026-04-22-18-7357-PM.png)

![Insert dynamic variables into your theme to pull live event and recipient data at send time](https://learn.sessionboard.com/images/kb/8db7957a-image-png-Mar-20-2026-04-22-59-7032-PM.png)

```
| Merge Tag | Output |

| --- | --- |

| &#123;&#123;&#123;content&#125;&#125;&#125; | The body of the email template — required in every theme |

| &#123;&#123;&#123;event_name&#125;&#125;&#125; | The name of your event |

| &#123;&#123;&#123;event_logo_image_url&#125;&#125;&#125; | Your event logo as an image URL |

| &#123;&#123;&#123;recipient_name&#125;&#125;&#125; | The full name of the email recipient |

| &#123;&#123;&#123;recipient_email&#125;&#125;&#125; | The email address of the recipient |

| &#123;&#123;&#123;recipient_phone&#125;&#125;&#125; | The phone number of the recipient |

| &#123;&#123;&#123;subject&#125;&#125;&#125; | The subject line of the email |

| &#123;&#123;&#123;replyTo&#125;&#125;&#125; | The reply-to email address |

| &#123;&#123;&#123;sendFrom&#125;&#125;&#125; | The sender email address |

| &#123;&#123;&#123;cc&#125;&#125;&#125; | CC recipients |

| &#123;&#123;&#123;bcc&#125;&#125;&#125; | BCC recipients |

| &#123;&#123;&#123;emailType&#125;&#125;&#125; | The type/category of the email being sent |

![Selecting a merge tag from the list in the email editor](/images/kb/fa13cd18-image-png-Mar-20-2026-04-26-40-9703-PM.png)

## Setting a theme as default

Only one theme can be active per event at a time. To set a custom theme as the default:

1. Go to Settings → Email Themes

2. Find your custom theme in the list

3. Click the ... (ellipsis) menu on the right side of the row

4. Select Make Default

The theme will now apply to all manually-sent emails from this event. The active default is marked with a ⭐ in the themes list.

![Setting a Theme as Default](/images/kb/7293085c-image-png-Mar-20-2026-04-27-34-1581-PM.png)

## Key Things to Know

- Event-level feature. Themes are configured per event, not at the organization level.

- Manual emails only. Themes apply exclusively to emails sent via the "Send Email" modal. Automated and system emails are not affected.

- One default at a time. Only one theme can be active per event. All manually-sent emails use the current default.

- Standard theme is locked. The built-in Standard theme cannot be edited, duplicated, or deleted. It can only be replaced as default by a custom theme.

- HTML import supported. Custom HTML from external email builders can be pasted in via the Import code option in the toolbar.

<Note>

Enabled upon request. This feature must be activated by the Sessionboard team. Contact support@sessionboard.com to get started.

</Note>
```