---
url: "https://learn.sessionboard.com/communications/add-on-custom-email-domain"
title: "Add-on: custom email domain | Sessionboard Help Center"
---

[Skip to content](https://learn.sessionboard.com/communications/add-on-custom-email-domain#_top)

# Add-on: custom email domain

## What is a Custom Email Domain?

[Section titled “What is a Custom Email Domain?”](https://learn.sessionboard.com/communications/add-on-custom-email-domain#what-is-a-custom-email-domain)

A custom email domain is a personalized email address that uses your own domain name instead of a generic email service provider’s domain.

In Sessionboard, all emails are sent from the sender [no-reply@notify.sessionboard.com](mailto:no-reply@notify.sessionboard.com). If a Custom Email Domain is purchased, teams can use their preferred event email as the sender of all email communications (i.e. [john.doe@yourcompany.com](mailto:john.doe@yourcompany.com)).

Here’s a breakdown of what it entails:

1. **Domain Name**: This is your own unique web address (e.g., yourcompany.com) that you own and control.
2. **Email Addresses**: With a custom domain, you can create email addresses that use this domain, such as [info@yourcompany.com](mailto:info@yourcompany.com) or [support@yourcompany.com](mailto:support@yourcompany.com).

## Benefits of Using a Custom Email Domain/Event Email

[Section titled “Benefits of Using a Custom Email Domain/Event Email”](https://learn.sessionboard.com/communications/add-on-custom-email-domain#benefits-of-using-a-custom-email-domainevent-email)

Using a custom email domain when sending emails to your event audience is important for several reasons:

1. **Professionalism**: A custom email domain (e.g., [yourname@yourcompany.com](mailto:yourname@yourcompany.com)) enhances your credibility and presents a professional image, making your communications appear more trustworthy and legitimate.
2. **Brand Consistency**: It reinforces your brand identity with every email sent, creating a cohesive experience for your audience and helping with brand recognition.
3. **Improved Deliverability**: Custom domains can improve email deliverability and reduce the likelihood of your messages being marked as spam. Email providers are more likely to trust emails from recognized domains.
4. **Control and Security**: With a custom domain, you have greater control over your email security settings, including anti-spam and anti-phishing measures, reducing the risk of email spoofing and phishing attacks.

## Email Domain Requirements

[Section titled “Email Domain Requirements”](https://learn.sessionboard.com/communications/add-on-custom-email-domain#email-domain-requirements)

Below, are the requirements for an email domain before it can be utilized within Sessionboard:

- No typos
- The domain must be corporate and not Outlook, Yahoo, or Gmail.
- Once a domain has been set up within Sessionboard, the email utilized can not be changed.

## Set-Up/Authentication Process

[Section titled “Set-Up/Authentication Process”](https://learn.sessionboard.com/communications/add-on-custom-email-domain#set-upauthentication-process)

01. Event Admin sends an email to [support@sessionboard.com](mailto:support@sessionboard.com) with the email address they are requesting to use.
02. Sessionboard provides the event admin with DNS (Domain Name Resolution) records to configure.
03. From your domain provider’s website, find the page or area that has your domain or domain records (below are some instructions for the most common domain providers).
04. [Google Domains](https://support.google.com/domains/answer/3290350#zippy=%2Cadd-a-resource-record)
05. [AWS](https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/resource-record-sets-creating.html)
06. [Azure](https://azure.microsoft.com/en-us/blog/a-records-cname-and-using-dns-with-windows-azure-web-sites-waws/)
07. [Cloudflare](https://developers.cloudflare.com/dns/manage-dns-records/how-to/create-dns-records)
08. [GoDaddy](https://ie.godaddy.com/help/add-a-cname-record-19236)
09. Once you’ve found this area you are ready for the next step, adding the DNS records to your domain.
10. [Troubleshooting Sender Authentication](https://docs.sendgrid.com/ui/account-and-settings/troubleshooting-sender-authentication)
11. Sessionboard verifies that the DNS records were set up correctly and adds the preferred event email to the event.

## Deliverability & Allowlisting

[Section titled “Deliverability & Allowlisting”](https://learn.sessionboard.com/communications/add-on-custom-email-domain#deliverability--allowlisting)

Authenticating your domain tells receiving servers that Sessionboard is allowed to send as your address. It does not override filtering on the recipient’s side. Organizations with strict filters, commonly universities, controlled work networks, government agencies, and hospitals, may occasionally filter your email as potentially malicious, even if it’s not.

A custom email domain changes the sending address, not the sending infrastructure. All Sessionboard email is sent through SendGrid from the same Sessionboard sending IP addresses.

**If anyone reports missing email, ask their IT team to allowlist**:

- `159.183.10.230`
- `159.183.207.219`
- `159.183.47.254`

Also have them allowlist your custom domain sending address: [example@yourcompany.com](mailto:example@yourcompany.com)

Allowlisting is per recipient organization. Setting up your custom domain does not allowlist you with any third party, and allowlisting done by one organization does not carry over to another.

For recipient-side troubleshooting, see: [Why am I not receiving emails?](https://learn.sessionboard.com/faq/why-am-i-not-receiving-emails)

## Frequently Asked Questions

[Section titled “Frequently Asked Questions”](https://learn.sessionboard.com/communications/add-on-custom-email-domain#frequently-asked-questions)

1. **Why do I need to configure the DNS records?**
2. The DNS records are used to map the alias (custom email domain) to the Sessionboard domain. Once this is completed on your end, we then ensure the alias is authenticated with our email provider to ensure deliverability. If the DNS records are not added to your domain and we try to send emails from your domain, the email will be flagged as spam and affect both of our deliverability scores. Verifying the domain creates a connection that indicates trust between both parties that we will not try to impersonate you or send unauthorized communications. Because we don’t have access to your domain we ask you to add the records we provide to your domain to show that we are authenticated. Once that is done we have to verify it on our end. Here is a reference link that explains the process: [https://docs.sendgrid.com/ui/account-and-settings/how-to-set-up-domain-authentication#key-terminology](https://docs.sendgrid.com/ui/account-and-settings/how-to-set-up-domain-authentication#key-terminology). ​
3. **How can I retrieve the SPF record entries?**
4. Sessionboard uses automated security which handles the SPF/DKIM so they stay automatically updated: [https://docs.sendgrid.com/ui/account-and-settings/spf-records#spf-and-sender-authentication](https://docs.sendgrid.com/ui/account-and-settings/spf-records#spf-and-sender-authentication)
5. **We set up our custom domain but some recipients still are not receiving emails. Why?**
6. Domain authentication proves you authorized Sessionboard to send as your address. It does not stop the recipient’s mail server from filtering the message. If a specific organization is blocking your email, their IT team needs to allowlist your sending address and include:sendgrid.net. Allowlisting applies only to the organization that does it, so it does not extend to other recipients or organizations.