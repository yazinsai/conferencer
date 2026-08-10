---
url: "https://apidocs.sessionboard.com/insights/sbql"
title: "SbQL Reference - Sessionboard API"
---

> ## Documentation Index
>
> Fetch the complete documentation index at: [/llms.txt](https://apidocs.sessionboard.com/llms.txt)
>
> Use this file to discover all available pages before exploring further.

[Skip to main content](https://apidocs.sessionboard.com/insights/sbql#content-area)

**Early Access** — SbQL and the Reports / Dashboards query APIs are currently available to select organizations. Reach out to your Sessionboard account manager to get early access.

SbQL (Sessionboard Query Language) is a SQL-like query language purpose-built for querying Sessionboard event data. It provides a familiar syntax for selecting, filtering, joining, and aggregating data across sessions, speakers, contacts, and other event entities.

## [​](https://apidocs.sessionboard.com/insights/sbql\#basic-syntax)  Basic Syntax

SbQL follows standard SELECT-FROM-WHERE patterns:

```
SELECT session.title, session.status
FROM sessions
WHERE session.status = 'accepted'
```

## [​](https://apidocs.sessionboard.com/insights/sbql\#joins-and-aggregations)  Joins and Aggregations

Join entities to combine related data and use aggregate functions for analytics:

```
SELECT speaker.full_name, COUNT(session.id) AS session_count
FROM speakers
JOIN sessions
GROUP BY speaker.full_name
ORDER BY session_count DESC
```

## [​](https://apidocs.sessionboard.com/insights/sbql\#filtering-with-conditions)  Filtering with Conditions

Use standard comparison operators and logical connectives:

```
SELECT session.title, session.start_date, track.name
FROM sessions
JOIN tracks
WHERE session.status = 'accepted'
  AND track.name = 'Keynotes'
ORDER BY session.start_date ASC
```

## [​](https://apidocs.sessionboard.com/insights/sbql\#schema-discovery)  Schema Discovery

Use the Insights schema endpoints to discover the entities and fields available for your organization:

- **Organization schema:**`GET /v1/insights/schema` returns all available entities and their fields.
- **Event schema:**`GET /v1/insights/event/{eventId}/schema` returns entities and fields scoped to a specific event.

The schema response includes entity names, field names, data types, and relationships between entities that you can use in JOIN clauses.For event-scoped schema (`GET /v1/insights/event/{eventId}/schema`), the payload also includes **`session_participant_roles`**: each event’s configured session roles (`name`, `name_plural`, `slug`, `core_role`). Use **`participant_contacts.role_slug`** in SbQL to filter custom roles (e.g. panelists); match user-facing labels to the **`slug`** from this list.**`Session` vs `Abstract`:** Both use the same underlying sessions table. **`FIND Session`** returns only **program** sessions (non-abstract). **`FIND Abstract`** returns only **abstract / CFP** submissions. Prefer these entities over filtering on `is_abstract` in queries.The REST Sessions API exposes the same distinction via `is_abstract` on every session payload, plus `composition_status` for merge/link state. Linked composition sources are excluded from default list/search unless you pass `expand=linked_sources`. See [Sessions & Composition](https://apidocs.sessionboard.com/api-reference/sessions-composition).Relationship entries may include a `description` flagging **legacy** evaluation paths (`ratings`, `criteria_ratings`, etc.).

**Sessions 2.0 / Evaluation Plan 2.0:** When an event has the Sessions 2.0 feature enabled, evaluation **performance** for sessions and speakers (scores, grades, reviewer workload) is primarily stored in the **Evaluation Plan 2.0** data model. Current SbQL evaluation relationships read **legacy**`Evaluation_Plan_Ratings` (and related) tables. For v2-only evaluation activity, those queries may not match product UI or exports—use **Evaluation Plan 2.0** reports and CSV/XLSX exports as the source of truth, and see the internal `sbql-reference.md` _Sessions 2.0_ section for full detail.

## [​](https://apidocs.sessionboard.com/insights/sbql\#natural-language-to-sbql)  Natural Language to SbQL

If you prefer to write queries in plain English, use the `POST /v1/insights/ai/generate` endpoint to convert natural language into SbQL. For example, sending “How many sessions are in each track?” will return a valid SbQL query that you can execute directly.

Ctrl+I