---
url: "https://apidocs.sessionboard.com/oauth"
title: "OAuth 2.1 (AI Clients) - Sessionboard API"
---

> ## Documentation Index
>
> Fetch the complete documentation index at: [/llms.txt](https://apidocs.sessionboard.com/llms.txt)
>
> Use this file to discover all available pages before exploring further.

[Skip to main content](https://apidocs.sessionboard.com/oauth#content-area)

Sessionboard supports OAuth 2.1 with PKCE for authenticating AI assistants (Claude, ChatGPT, and other MCP-compatible clients). This enables users to authorize AI tools to query their event data through a secure, permission-based flow.

## [​](https://apidocs.sessionboard.com/oauth\#how-it-works)  How It Works

```
1. AI client redirects user to Sessionboard consent page
2. User logs in, selects organization, approves requested scopes
3. Sessionboard redirects back with an authorization code
4. AI client exchanges the code for access + refresh tokens
5. AI client uses the access token for MCP queries
```

## [​](https://apidocs.sessionboard.com/oauth\#endpoints)  Endpoints

All OAuth endpoints are on `public-api.sessionboard.com` (US) or `public-api-eu.sessionboard.com` (EU).

| Endpoint | Method | Description |
| --- | --- | --- |
| `/oauth/authorize` | GET | Validate authorization request parameters |
| `/oauth/authorize/consent` | POST | User approves — generates authorization code |
| `/oauth/eligible-orgs` | GET | List orgs where user has AI Access permission |
| `/oauth/token` | POST | Exchange code for tokens, refresh tokens |
| `/oauth/revoke` | POST | Revoke access or refresh tokens |
| `/oauth/.well-known/oauth-authorization-server` | GET | RFC 8414 server metadata |

## [​](https://apidocs.sessionboard.com/oauth\#authorization-request)  Authorization Request

Redirect the user to the authorization endpoint with these parameters:

```
GET /oauth/authorize?
  client_id=your-client-id&
  redirect_uri=https://your-app.com/callback&
  response_type=code&
  scope=read:events+read:sessions+read:contacts&
  code_challenge=<S256_HASH>&
  code_challenge_method=S256&
  state=<random_state>
```

| Parameter | Required | Description |
| --- | --- | --- |
| `client_id` | Yes | Your registered OAuth client ID |
| `redirect_uri` | Yes | Must match a registered redirect URI |
| `response_type` | Yes | Must be `code` |
| `scope` | No | Space-separated scopes (defaults to client’s registered scopes) |
| `code_challenge` | Yes | PKCE challenge (S256 method) |
| `code_challenge_method` | Yes | Must be `S256` |
| `state` | Recommended | Opaque value for CSRF protection |

## [​](https://apidocs.sessionboard.com/oauth\#token-exchange)  Token Exchange

Exchange the authorization code for tokens:

cURL

```
curl -X POST https://public-api.sessionboard.com/oauth/token \
  -H "Content-Type: application/json" \
  -d '{
    "grant_type": "authorization_code",
    "code": "AUTHORIZATION_CODE",
    "redirect_uri": "https://your-app.com/callback",
    "client_id": "your-client-id",
    "code_verifier": "YOUR_PKCE_VERIFIER"
  }'
```

**Response:**

```
{
  "access_token": "...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "refresh_token": "...",
  "scope": "read:events read:sessions read:contacts"
}
```

## [​](https://apidocs.sessionboard.com/oauth\#refresh-tokens)  Refresh Tokens

Access tokens expire after 1 hour. Use the refresh token to get a new one:

```
curl -X POST https://public-api.sessionboard.com/oauth/token \
  -H "Content-Type: application/json" \
  -d '{
    "grant_type": "refresh_token",
    "refresh_token": "YOUR_REFRESH_TOKEN",
    "client_id": "your-client-id"
  }'
```

Refresh tokens expire after 7 days and are rotated on each use (the old token is revoked).

## [​](https://apidocs.sessionboard.com/oauth\#using-the-token)  Using the Token

Include the access token as a Bearer token on API requests:

```
curl https://public-api.sessionboard.com/v1/events \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

Bearer tokens work on all `/v1/` endpoints alongside the existing `x-access-token` header authentication.

## [​](https://apidocs.sessionboard.com/oauth\#token-revocation)  Token Revocation

Revoke a token when the user disconnects:

```
curl -X POST https://public-api.sessionboard.com/oauth/revoke \
  -H "Content-Type: application/json" \
  -d '{
    "token": "TOKEN_TO_REVOKE",
    "token_type_hint": "access_token"
  }'
```

## [​](https://apidocs.sessionboard.com/oauth\#available-scopes)  Available Scopes

| Scope | Description |
| --- | --- |
| `read:events` | View events and event details |
| `read:sessions` | View session data including titles, times, tracks, and statuses |
| `read:contacts` | View contact, participant, exhibitor, and sponsor information |
| `read:reports` | View and run saved custom reports |
| `read:dashboards` | View dashboards and widget data |
| `read:insights` | Query Reports / Dashboards data with SbQL and natural language |
| `read:transcriptions` | View session transcriptions and audio recordings |
| `read:media` | View uploaded media items and transcription status |

OAuth tokens currently support **read-only** scopes. For write operations (creating sessions, updating contacts, managing agendas), use [API tokens](https://apidocs.sessionboard.com/authentication) with the appropriate `write:*` scopes.

## [​](https://apidocs.sessionboard.com/oauth\#permission-model)  Permission Model

OAuth tokens inherit the authorizing user’s permissions:

- **Organization admin with AI Access** → token can query all events in the org
- **Event-only user with AI Access** → token scoped to their permitted events
- **AI Access revoked** → token stops working immediately (checked on every request)
- **AI features disabled for org** → all OAuth tokens for that org are blocked

The “AI Access” permission (under Data & Insights) controls who can authorize OAuth connections. It is enabled by default for Admin roles.

## [​](https://apidocs.sessionboard.com/oauth\#server-metadata)  Server Metadata

Discover OAuth server capabilities at:

```
GET /oauth/.well-known/oauth-authorization-server
```

Returns supported response types, grant types, scopes, and endpoint URLs per [RFC 8414](https://datatracker.ietf.org/doc/html/rfc8414).

Ctrl+I