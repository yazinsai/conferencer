---
url: "https://apidocs.sessionboard.com/insights/mcp-server.md"
title: undefined
---

> ## Documentation Index
> Fetch the complete documentation index at: https://apidocs.sessionboard.com/llms.txt
> Use this file to discover all available pages before exploring further.

# MCP Server

> Connect AI assistants to Sessionboard via Model Context Protocol

<Note>
  **Early Access** — The MCP Server is currently available to select organizations. Reach out to your Sessionboard account manager to get early access to this feature.
</Note>

The Sessionboard MCP (Model Context Protocol) server allows AI assistants like Claude to query and manage your event data directly. Built on the [Model Context Protocol](https://modelcontextprotocol.io/) standard by Anthropic, the MCP server exposes 27 consolidated tools covering read access, write operations, analytics, and agenda planning.

## What is MCP?

Model Context Protocol is an open standard that enables AI assistants to securely connect to external data sources and tools. Instead of copying data into prompts, MCP lets the AI query and update your data on demand through a structured interface.

## Prerequisites

<Warning>
  Three things must be enabled before the MCP server will accept requests:

  1. **AI must be enabled for your organization** — Contact Sessionboard support or your account manager to enable AI features for your organization.
  2. **MCP access must be enabled on your organization** — This is a separate feature flag that grants access to the MCP server and Reports / Dashboards query endpoints (`/v1/insights/...`).
  3. **MCP must be enabled on your API token** — When generating or editing an API token, ensure the **MCP Access** toggle is turned on and the **read:insights** scope is granted. For write operations, add the appropriate write scopes (e.g., `write:sessions`, `write:contacts`, `write:events`).

  If any of these are missing, MCP requests will return a `403 Forbidden` error.
</Warning>

## Setup

<Steps>
  <Step title="Generate an API Token">
    Create an API token in the Sessionboard admin dashboard with the **read:insights** scope and **MCP Access** enabled. Add write scopes if you want the AI to create or update data. See [Authentication](/authentication) for detailed instructions.
  </Step>

  <Step title="Configure Your AI Client">
    Add the Sessionboard MCP server to your AI client's configuration. The exact setup depends on your client.

    **Remote connection (Claude Desktop, Claude Code, ChatGPT, etc.):**

    ```json theme={null}
    {
      "mcpServers": {
        "sessionboard": {
          "url": "https://mcp.sessionboard.com/mcp"
        }
      }
    }
    ```

    When you connect, the MCP server will walk you through OAuth authorization automatically — no need to configure tokens manually.

    For EU-hosted organizations, use `https://mcp-eu.sessionboard.com/mcp` instead.
  </Step>

  <Step title="Start Querying">
    Ask your AI assistant questions about your event data in natural language. The assistant will use the MCP tools to query Sessionboard and return results.
  </Step>
</Steps>

## Available Tools (27)

The MCP server exposes 27 tools organized into 3 categories. Write operations use a `manage_*` pattern — one tool per entity with an `action` parameter to pick the operation (e.g., `action: "create"`).

All tools include [MCP annotations](https://modelcontextprotocol.io/docs/concepts/tools#tool-annotations) for safe AI behavior — read tools are marked `readOnlyHint: true`, write tools are marked `destructiveHint: false`, and all are `openWorldHint: false`.

### Search & Analytics (8 tools)

Find events, ask questions about your data, and explore your schema.

| Tool                 | Description                                                                   |
| -------------------- | ----------------------------------------------------------------------------- |
| `list_events`        | List all events in the organization                                           |
| `find_event`         | Search events by name                                                         |
| `get_event_overview` | Event summary — session counts, speakers, tracks, status breakdown            |
| `get_schema`         | Browse your data model — entities, fields, and relationships                  |
| `query_data`         | Ask a question in plain English and get results (AI writes the query for you) |
| `execute_sbql`       | Run a SbQL query directly with pagination                                     |
| `get_suggestions`    | Get suggested queries based on your data                                      |
| `get_widget_schema`  | Widget types, configs, and grid layout rules for dashboards                   |

### Read Details (4 tools)

Fetch sessions and contacts. All read-only and paginated.

| Tool            | Description                                                |
| --------------- | ---------------------------------------------------------- |
| `list_sessions` | List sessions for an event (paginated, up to 100 per page) |
| `get_session`   | Get a single session by ID with full details               |
| `list_contacts` | List contacts for an event (paginated, up to 100 per page) |
| `get_contact`   | Get a single contact by ID with full details               |

### Create & Manage (15 tools)

Each `manage_*` tool handles all operations for an entity — create, update, delete, and more — using an `action` parameter. For example, `manage_session` with `action: "create"` creates a session, while `action: "update"` updates one.

| Tool                     | Actions                                                              | Scope                             | Description                                                                  |
| ------------------------ | -------------------------------------------------------------------- | --------------------------------- | ---------------------------------------------------------------------------- |
| `manage_metadata`        | `list`, `create`, `update`                                           | `write:metadata` / `write:fields` | Rooms, tracks, tags, formats, levels, languages, statuses, and custom fields |
| `manage_session`         | `create`, `update`, `restore`, `update_fields`                       | `write:sessions`                  | Session CRUD + custom field values                                           |
| `manage_contact`         | `create`, `update`, `restore`                                        | `write:contacts`                  | Contact CRUD (find-or-create by email)                                       |
| `manage_exhibitor`       | `create`, `update`, `restore`                                        | `write:exhibitors`                | Exhibitor CRUD                                                               |
| `manage_sponsor`         | `create`, `update`, `restore`                                        | `write:sponsors`                  | Sponsor CRUD                                                                 |
| `manage_agenda_draft`    | `list`, `get`, `create`, `update`, `delete`, `get_changes`, `commit` | `write:events`                    | Agenda draft lifecycle                                                       |
| `manage_draft_sessions`  | `list`, `create`, `update`, `delete`, `bulk`                         | `write:events`                    | Session placements in drafts                                                 |
| `manage_event_rules`     | `list`, `get`, `create`, `update`, `delete`                          | `write:events`                    | Scheduling rules and constraints                                             |
| `manage_personas`        | `list`, `get`, `create`, `update`, `delete`                          | `write:events`                    | Evaluation personas                                                          |
| `manage_event_dashboard` | `list`, `get`, `create`, `update`, `delete`                          | `write:events`                    | Event-scoped dashboards                                                      |
| `manage_event_widget`    | `create`, `update`, `delete`                                         | `write:events`                    | Event dashboard widgets                                                      |
| `manage_event_report`    | `list`, `run`, `create`, `create_from_nl`, `update`, `delete`        | `write:events`                    | Event-scoped saved reports                                                   |
| `manage_org_dashboard`   | `list`, `get`, `create`, `update`, `delete`                          | `write:events`                    | Org-level dashboards (cross-event)                                           |
| `manage_org_widget`      | `create`, `update`, `delete`                                         | `write:events`                    | Org-level dashboard widgets                                                  |
| `manage_org_report`      | `list`, `run`, `create`, `create_from_nl`, `update`, `delete`        | `write:events`                    | Org-level saved reports (cross-event)                                        |

## Parameter Conventions

* **Event scoping** — All event-scoped tools require `event_id` (snake\_case string).
* **Action selection** — Consolidated tools use `action` to pick the operation (e.g., `action: "create"`).
* **Entity IDs** — snake\_case: `session_id`, `contact_id`, `entity_id`, `draft_id`, `widget_id`, `query_id`.
* **Optimistic concurrency** — Update actions require `updated_at` (ISO 8601 timestamp from the last read). Returns `409 Conflict` if the entity was modified since.

## Result Size Safety

All results are automatically truncated to prevent context window overflow:

* **List results** — Capped at 50 items. When truncated, the response includes `truncated: true`, `total_count`, and a `hint` with guidance on pagination.
* **Query results** — Capped at 100 rows with truncation metadata.
* **SbQL queries** — `execute_sbql` and `query_data` default to a 50-row limit. Use the `limit` parameter for more.

## Resources

The MCP server also exposes two [MCP resources](https://modelcontextprotocol.io/docs/concepts/resources) that AI clients can load into context:

| URI             | Description                                                             |
| --------------- | ----------------------------------------------------------------------- |
| `sbql://schema` | The SbQL schema — entities, fields, relationships, and format functions |
| `sbql://events` | List of events in the organization with metadata                        |

## Prompt Templates

Pre-built templates that structure the AI's approach to common report types:

| Prompt               | Description                                                         |
| -------------------- | ------------------------------------------------------------------- |
| `speaker_roster`     | Generate a speaker roster with contact info and session assignments |
| `session_schedule`   | Generate a day-by-day session schedule grid                         |
| `evaluation_summary` | Generate an evaluation/review score analysis                        |
| `task_status`        | Show outstanding tasks across speakers and exhibitors               |

## Security

* **Org isolation** — The SbQL compiler injects `org_id` into every query from the authenticated token. Prompt injection cannot access other organizations' data.
* **PII obfuscation** — Enabled by default. Emails become `j***@a***.com`, phone numbers become `***-***-4567`. Org admins can toggle this per-token.
* **Scoped access** — Tokens are restricted to specific scopes and optionally to specific events.
* **Audit logging** — Every API call is recorded with source, method, response time, and token ID.

## Example Conversations

Once connected, you can ask questions like:

* "How many sessions are accepted for this year's conference?"
* "Show me the top 10 speakers by number of sessions."
* "What's the breakdown of sessions by track and status?"
* "List all sessions that don't have a room assigned yet."
* "Create a new track called 'AI & Machine Learning' with color #4F46E5."
* "Build a dashboard showing session counts by status and track."
* "Create a draft agenda and schedule the keynote in the Main Hall at 9am."
