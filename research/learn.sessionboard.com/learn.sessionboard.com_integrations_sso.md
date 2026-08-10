---
url: "https://learn.sessionboard.com/integrations/sso"
title: "Single Sign-on (SSO) | Sessionboard Help Center"
---

[Skip to content](https://learn.sessionboard.com/integrations/sso#_top)

# Single Sign-on (SSO)

Single Sign-On lets users access multiple applications with one set of credentials, authenticating once through a central identity provider (Okta, Auth0, Microsoft Entra/Azure AD, etc.).

- Sessionboard supports **SAML**, **OIDC**, and **OAuth 2.0 Password**.
- Different SSO configurations can be set up for **Session Submission Forms**, **Portals**, and **Admin login**.
- Authentication is handled by your identity provider, so enforce 2FA there rather than in Sessionboard.

Configurations live in **Org Settings → SSO**, with a tab per protocol.

## SAML setup

[Section titled “SAML setup”](https://learn.sessionboard.com/integrations/sso#saml-setup)

**You provide:** Identity Provider name, x509 certificate, Issuer, Domain, SSO URL, and a test user.

**Sessionboard provides:** Assertion Consumer Service URL and Issuer URL.

**Expected attributes:**`id`, `firstName`, `lastName`, `email`, `nameID` (email).

### AuthnRequest Binding

[Section titled “AuthnRequest Binding”](https://learn.sessionboard.com/integrations/sso#authnrequest-binding)

Choose how the sign-in request reaches your SSO URL:

| Binding | Use when |
| --- | --- |
| **HTTP-Redirect** | The default. The request is sent as query parameters on a redirect. |
| **HTTP-POST** | Your identity provider’s endpoint expects a form POST instead. |

Match this to the endpoint type your identity provider publishes. Picking the wrong one usually shows up as the provider rejecting the request rather than as a Sessionboard error.

## OIDC setup

[Section titled “OIDC setup”](https://learn.sessionboard.com/integrations/sso#oidc-setup)

**You provide:** Identity Provider name, Domain (required for admin SSO), Authorization URL, Issuer, Token URL, User Info URL, Client ID, Client Secret, Scopes.

**Sessionboard provides:** Callback URL.

**Expected attributes:**`sub`, `given_name`, `family_name`, `preferred_username` (email).

### Use PKCE

[Section titled “Use PKCE”](https://learn.sessionboard.com/integrations/sso#use-pkce)

**Use PKCE (Optional)** adds Proof Key for Code Exchange to the authorization code flow. Enable it if your identity provider requires or supports it — some providers now reject authorization code flows without it.

## OAuth 2.0 Password setup

[Section titled “OAuth 2.0 Password setup”](https://learn.sessionboard.com/integrations/sso#oauth-20-password-setup)

For identity providers that authenticate with the resource owner password credentials grant, where the user enters their credentials in Sessionboard rather than being redirected.

**You provide:** Identity Provider name, Client ID, Client Secret, Token Endpoint, and User Info Endpoint. Domain is optional unless you are using this for admin login, and Issuer is optional.

Both endpoints must be `https://`.

## Enforced authentication

[Section titled “Enforced authentication”](https://learn.sessionboard.com/integrations/sso#enforced-authentication)

Each configuration has an **Enforced Authentication** option. With it on, matching users must sign in through that provider rather than choosing another method.

Ready to set up SSO? Reach out to [support@sessionboard.com](mailto:support@sessionboard.com).