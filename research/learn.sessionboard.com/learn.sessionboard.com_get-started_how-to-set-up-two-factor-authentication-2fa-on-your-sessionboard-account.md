---
url: "https://learn.sessionboard.com/get-started/how-to-set-up-two-factor-authentication-2fa-on-your-sessionboard-account"
title: "Set up two-factor authentication (2FA) | Sessionboard Help Center"
---

[Skip to content](https://learn.sessionboard.com/get-started/how-to-set-up-two-factor-authentication-2fa-on-your-sessionboard-account#_top)

# Set up two-factor authentication (2FA)

## What is two-factor authentication?

[Section titled “What is two-factor authentication?”](https://learn.sessionboard.com/get-started/how-to-set-up-two-factor-authentication-2fa-on-your-sessionboard-account#what-is-two-factor-authentication)

Two-factor authentication (2FA) requires two different ways to verify your identity before granting access to your account. Even if someone gets hold of your password, they still cannot log in without the second step.

The two steps are:

1. **Something you know** — your password.
2. **Something you have or are** — a code from an authenticator app, a code sent to your email, or a passkey tied to your device (fingerprint, Face ID, security key).

2FA is optional for every Sessionboard user, and you can turn it on yourself at any time. It becomes mandatory only if your organization has asked for it to be enforced.

## When 2FA is required for everyone

[Section titled “When 2FA is required for everyone”](https://learn.sessionboard.com/get-started/how-to-set-up-two-factor-authentication-2fa-on-your-sessionboard-account#when-2fa-is-required-for-everyone)

An organization can require 2FA for all of its members. When that is switched on, anyone without 2FA is prompted to enroll on their next sign-in and cannot use the app until they do. It applies to every child event of the organization as well.

Once enforcement is on, members cannot switch their own 2FA off. See [the “Disable two-factor authentication” option is grayed out](https://learn.sessionboard.com/get-started/how-to-set-up-two-factor-authentication-2fa-on-your-sessionboard-account#the-disable-two-factor-authentication-option-is-grayed-out) below.

## What happens when you log in

[Section titled “What happens when you log in”](https://learn.sessionboard.com/get-started/how-to-set-up-two-factor-authentication-2fa-on-your-sessionboard-account#what-happens-when-you-log-in)

After entering your password, Sessionboard will prompt you to verify your identity. You’ll see a screen with your available methods and can choose which one to use.

### Available verification methods

[Section titled “Available verification methods”](https://learn.sessionboard.com/get-started/how-to-set-up-two-factor-authentication-2fa-on-your-sessionboard-account#available-verification-methods)

| Method | How it works | Setup required? |
| --- | --- | --- |
| Passkey | Uses your device’s biometrics (Face ID, Touch ID, Windows Hello) or a hardware security key. No code to type. | Yes (one-time setup) |
| Authenticator app | Generates a 6-digit code every 30 seconds via an app like Google Authenticator, Authy, or 1Password. | Yes (one-time setup) |
| Email code | A one-time code is sent to your registered email address. Valid for 10 minutes. | No, available to all users automatically |

Never share your login code. Sessionboard staff will never ask for your 2FA code. If someone does, it’s a phishing attempt.

## Set up 2FA on your account

[Section titled “Set up 2FA on your account”](https://learn.sessionboard.com/get-started/how-to-set-up-two-factor-authentication-2fa-on-your-sessionboard-account#set-up-2fa-on-your-account)

Open your account settings

Log in, click your profile icon in the top right, go to **Account Settings**, and scroll to **Two-Factor Authentication (2FA)**.

![The profile menu with Account Settings](https://learn.sessionboard.com/images/kb/c57a5f0c-1-4.jpg)

![The Two-Factor Authentication section of Account Settings](https://learn.sessionboard.com/images/kb/499cd386-2-1.jpg)

Add a passkey (recommended)

Passkeys are the most secure option and the least work — no codes to type, just your fingerprint or face.

1. Scroll to **Passkeys**.
2. Click **\+ Add a passkey**.
3. Follow your device’s prompt (fingerprint, Face ID, Windows Hello, or a security key).

Once enrolled, the device appears in the list with its name and last-used date.

![The Passkeys section with the Add a passkey button](https://learn.sessionboard.com/images/kb/c8fa830c-image-png-Jun-30-2026-07-10-22-3521-PM.png)

![A device prompt confirming passkey enrollment](https://learn.sessionboard.com/images/kb/cff04219-image-png-Jun-30-2026-07-11-49-9619-PM.png)

Add an authenticator app as a backup

Use 1Password, Authy, Google Authenticator, or any TOTP app. These generate a 6-digit code that refreshes every 30 seconds.

1. Scroll to **Authenticator app**.
2. Click **\+ Set up authenticator app**.
3. Scan the QR code with your app.
4. Enter the 6-digit code to confirm.

![The authenticator app QR code](https://learn.sessionboard.com/images/kb/7a66dd3d-image-png-Jun-30-2026-07-20-21-9477-PM.png)

![Entering the 6-digit code to confirm the authenticator app](https://learn.sessionboard.com/images/kb/080025ff-image-png-Jun-30-2026-07-21-01-6819-PM.png)

Choose your preferred method

Under **Preferred method**, pick **Passkey** or **Authenticator app**. That method is offered first every time you sign in.

### How to confirm 2FA is active

[Section titled “How to confirm 2FA is active”](https://learn.sessionboard.com/get-started/how-to-set-up-two-factor-authentication-2fa-on-your-sessionboard-account#how-to-confirm-2fa-is-active)

After setup, your 2FA status will show as On at the top of the section, along with your enrolled method (e.g., Passkey) and the enrollment date.

## Trusted devices

[Section titled “Trusted devices”](https://learn.sessionboard.com/get-started/how-to-set-up-two-factor-authentication-2fa-on-your-sessionboard-account#trusted-devices)

When logging in, you can check Devices that can skip the second factor for 30 days to skip the 2FA prompt on that device for the next 30 days. This is useful for your personal computer or phone, where you log in regularly.

## Recovery codes

[Section titled “Recovery codes”](https://learn.sessionboard.com/get-started/how-to-set-up-two-factor-authentication-2fa-on-your-sessionboard-account#recovery-codes)

Recovery codes are a set of one-time-use backup codes that let you access your account if you lose all your 2FA devices. Think of them like a spare key, store them somewhere safe and offline.

### How to generate your recovery codes

[Section titled “How to generate your recovery codes”](https://learn.sessionboard.com/get-started/how-to-set-up-two-factor-authentication-2fa-on-your-sessionboard-account#how-to-generate-your-recovery-codes)

1. Go to Account Settings
2. Scroll to the Recovery codes section.
3. Click to generate your codes.
4. Save them immediately (in a password manager, a printed sheet in a secure place, or an encrypted file). Do not store them in your email or in Sessionboard.

![How to generate your recovery codes](https://learn.sessionboard.com/images/kb/a204a5a6-image-png-Jun-30-2026-07-23-06-9208-PM.png)

## Common issues

[Section titled “Common issues”](https://learn.sessionboard.com/get-started/how-to-set-up-two-factor-authentication-2fa-on-your-sessionboard-account#common-issues)

### I’m not receiving the email code

[Section titled “I’m not receiving the email code”](https://learn.sessionboard.com/get-started/how-to-set-up-two-factor-authentication-2fa-on-your-sessionboard-account#im-not-receiving-the-email-code)

Check your spam or junk folder. The code is valid for 10 minutes. If you still don’t receive it, try logging in again to request a new code, or switch to your authenticator app or passkey if you have one set up.

### My authenticator app code isn’t working

[Section titled “My authenticator app code isn’t working”](https://learn.sessionboard.com/get-started/how-to-set-up-two-factor-authentication-2fa-on-your-sessionboard-account#my-authenticator-app-code-isnt-working)

Codes expire every 30 seconds. Wait for the code to refresh and enter the new one immediately. Also make sure your phone’s clock is set to automatic/network time, since a time drift can cause TOTP codes to fail.

### The “Disable two-factor authentication” option is grayed out

[Section titled “The “Disable two-factor authentication” option is grayed out”](https://learn.sessionboard.com/get-started/how-to-set-up-two-factor-authentication-2fa-on-your-sessionboard-account#the-disable-two-factor-authentication-option-is-grayed-out)

Your organization requires 2FA, so members cannot turn it off individually. Ask your organization admin if the requirement should still apply; they can contact Sessionboard support to lift it.

### I lost access to my phone / authenticator app

[Section titled “I lost access to my phone / authenticator app”](https://learn.sessionboard.com/get-started/how-to-set-up-two-factor-authentication-2fa-on-your-sessionboard-account#i-lost-access-to-my-phone--authenticator-app)

### Is 2FA the same as MFA?

[Section titled “Is 2FA the same as MFA?”](https://learn.sessionboard.com/get-started/how-to-set-up-two-factor-authentication-2fa-on-your-sessionboard-account#is-2fa-the-same-as-mfa)

2FA (Two-Factor Authentication) is a type of MFA (Multi-Factor Authentication). MFA can involve two or more factors; 2FA specifically uses two. Both terms are often used interchangeably, and Sessionboard’s implementation satisfies both requirements.

## Still having issues?

[Section titled “Still having issues?”](https://learn.sessionboard.com/get-started/how-to-set-up-two-factor-authentication-2fa-on-your-sessionboard-account#still-having-issues)

Email [support@sessionboard.com](mailto:support@sessionboard.com) or use the in-app chat. Include your registered email address and what happens when you try to sign in, so the team can help on the first reply.