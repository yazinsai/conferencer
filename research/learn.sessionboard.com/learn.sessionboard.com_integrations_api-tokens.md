---
url: "https://learn.sessionboard.com/integrations/api-tokens"
title: "Generating API tokens | Sessionboard Help Center"
---

[Skip to content](https://learn.sessionboard.com/integrations/api-tokens#_top)

# Generating API tokens

API tokens let you:

- Sync event data with external systems (CRMs, BI tools, custom dashboards)
- Build custom integrations on the Sessionboard Public API
- Connect AI assistants (Claude, ChatGPT, and other MCP-compatible clients) to query and act on your event data in natural language
- Run scheduled or programmatic reports through SbQL

## Generate a token

[Section titled “Generate a token”](https://learn.sessionboard.com/integrations/api-tokens#generate-a-token)

Open Organization Settings

Log in to the admin dashboard and click **Organization Settings**.

Go to API Tokens

Select the **API Tokens** section.

Generate a new token

Click **Generate Token** and provide:

- **Descriptive name** — e.g., “Tableau dashboard”
- **Scopes** — see below
- **MCP Access** — toggle on for AI assistants
- **Hide PII** — recommended
- **Event restrictions** (optional) — limit to specific events

Copy the token immediately

The full token value is shown **only once**. Copy it and store it in a password manager, secrets vault, or environment variable. It cannot be retrieved later — even by Sessionboard staff.

## Scopes

[Section titled “Scopes”](https://learn.sessionboard.com/integrations/api-tokens#scopes)

Grant only the scopes your integration needs.

| Scope | What it does |
| --- | --- |
| **Default (read access)** | Read-only access to events, sessions, speakers, contacts, sponsors, exhibitors. Granted automatically. |
| **read:insights** | Required for Insights endpoints, SbQL, and any MCP / AI connection. |
| **write:sessions** | Create and update sessions. |
| **write:contacts** | Create and update contacts. |
| **write:events** | Manage event-level config (rules, dashboards, reports, drafts). |
| **write:metadata / write:fields** | Manage rooms, tracks, tags, formats, levels, languages, statuses, and custom fields. |
| **write:exhibitors / write:sponsors** | Manage exhibitor and sponsor records. |

## Hide PII (recommended)

[Section titled “Hide PII (recommended)”](https://learn.sessionboard.com/integrations/api-tokens#hide-pii-recommended)

When enabled (the default), personal data is obfuscated — emails return as `j***@a***.com`, phone numbers as `***-***-4567`. Leave it on, especially for tokens used by AI assistants or third-party integrations.

## Use your token

[Section titled “Use your token”](https://learn.sessionboard.com/integrations/api-tokens#use-your-token)

Include the token in the `x-access-token` header on every request:

```
curl -X GET https://public-api.sessionboard.com/v1/events \

  -H "x-access-token: YOUR_TOKEN"
```

Use `https://public-api.sessionboard.com` for US-hosted orgs and `https://public-api-eu.sessionboard.com` for EU-hosted orgs.

## Connect AI assistants (MCP)

[Section titled “Connect AI assistants (MCP)”](https://learn.sessionboard.com/integrations/api-tokens#connect-ai-assistants-mcp)

Sessionboard supports the **Model Context Protocol (MCP)**. Connect Claude, ChatGPT, or any MCP client via OAuth (recommended) or a manual token with **MCP Access** enabled and the **read:insights** scope.

Point remote MCP clients to:

- **US:**`https://mcp.sessionboard.com/mcp`
- **EU:**`https://mcp-eu.sessionboard.com/mcp`

The MCP server exposes 27 tools for search, read, and write. Ask things like _“How many sessions are accepted for our 2026 conference?”_ or _“Create a new track called ‘AI & Machine Learning.’”_

## Manage & revoke

[Section titled “Manage & revoke”](https://learn.sessionboard.com/integrations/api-tokens#manage--revoke)

From **Organization Settings → API Tokens** you can rename a token, edit scopes/MCP/PII/event restrictions, or revoke it (irreversible — any integration using it stops working). All API calls are recorded in an audit log with source, method, response time, and token ID.

## Rate limits & caching

[Section titled “Rate limits & caching”](https://learn.sessionboard.com/integrations/api-tokens#rate-limits--caching)

Handle `429 Too Many Requests` with exponential backoff. Individual session retrieval and session search are cached for 3 minutes; webhook notifications are real-time and not cached.

Full docs: [apidocs.sessionboard.com](https://apidocs.sessionboard.com/introduction)