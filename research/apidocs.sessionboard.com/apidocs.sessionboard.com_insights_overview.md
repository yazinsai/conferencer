---
url: "https://apidocs.sessionboard.com/insights/overview"
title: "Reports & Dashboards - Sessionboard API"
---

> ## Documentation Index
>
> Fetch the complete documentation index at: [/llms.txt](https://apidocs.sessionboard.com/llms.txt)
>
> Use this file to discover all available pages before exploring further.

[Skip to main content](https://apidocs.sessionboard.com/insights/overview#content-area)

**Early Access** — Reports, Dashboards, and related query APIs are currently available to select organizations. Reach out to your Sessionboard account manager to get early access.

These endpoints power **Reports** and **Dashboards** in Sessionboard — the same surfaces organizers use in the product to explore session and speaker data, run saved reports, and view dashboard widgets.Under the hood, queries use **SbQL** (Sessionboard Query Language). You can also convert natural language into SbQL, discover the query schema, and connect AI assistants via the [MCP Server](https://apidocs.sessionboard.com/insights/mcp-server).

API tokens need the **`read:insights`** scope (the scope name is historical; it gates Reports, Dashboards, and SbQL access). See [Authentication](https://apidocs.sessionboard.com/authentication).

## [​](https://apidocs.sessionboard.com/insights/overview\#prerequisites)  Prerequisites

1. **Organization-level:** AI / analytics features must be enabled for your organization. Contact your Sessionboard account manager.
2. **Token-level:** Grant **`read:insights`**, and turn on **MCP Access** on the token if you will use the MCP server or Insights-prefixed query routes.

## [​](https://apidocs.sessionboard.com/insights/overview\#what-this-covers)  What this covers

| Capability | Product mapping | Description |
| --- | --- | --- |
| **Saved reports** | Reports | List and run saved queries created in Sessionboard |
| **Dashboards** | Dashboards | Retrieve dashboard configs and widget data |
| **Execute SbQL** | Reports / ad-hoc analysis | Run SbQL against your event data |
| **Generate SbQL** | AI assist | Turn natural language into SbQL |
| **Schema discovery** | Query builder | Entities, fields, and relationships you can query |
| **Suggestions** | Query assist | Contextual query suggestions |

Endpoint paths still use the `/v1/insights/...` prefix (for example `POST /v1/insights/execute`, `GET /v1/insights/queries`). That prefix is the public API namespace — not a separate product called Insights.

## [​](https://apidocs.sessionboard.com/insights/overview\#learn-more)  Learn more

## SbQL Reference

Query language syntax, entities, and examples.

## MCP Server

Connect Claude and other AI assistants to your event data.

⌘I