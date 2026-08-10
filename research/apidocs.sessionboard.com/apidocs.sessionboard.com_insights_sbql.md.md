---
url: "https://apidocs.sessionboard.com/insights/sbql.md"
title: undefined
---

> ## Documentation Index
> Fetch the complete documentation index at: https://apidocs.sessionboard.com/llms.txt
> Use this file to discover all available pages before exploring further.

# SbQL Reference

> Sessionboard Query Language reference

<Note>
  **Early Access** — SbQL and the Reports / Dashboards query APIs are currently available to select organizations. Reach out to your Sessionboard account manager to get early access.
</Note>

SbQL (Sessionboard Query Language) is a SQL-like query language purpose-built for querying Sessionboard event data. It provides a familiar syntax for selecting, filtering, joining, and aggregating data across sessions, speakers, contacts, and other event entities.

## Basic Syntax

SbQL follows standard SELECT-FROM-WHERE patterns:

```sql theme={null}
SELECT session.title, session.status
FROM sessions
WHERE session.status = 'accepted'
```

## Joins and Aggregations

Join entities to combine related data and use aggregate functions for analytics:

```sql theme={null}
SELECT speaker.full_name, COUNT(session.id) AS session_count
FROM speakers
JOIN sessions
GROUP BY speaker.full_name
ORDER BY session_count DESC
```

## Filtering with Conditions

Use standard comparison operators and logical connectives:

```sql theme={null}
SELECT session.title, session.start_date, track.name
FROM sessions
JOIN tracks
WHERE session.status = 'accepted'
  AND track.name = 'Keynotes'
ORDER BY session.start_date ASC
```

## Schema Discovery

Use the Insights schema endpoints to discover the entities and fields available for your organization:

* **Organization schema:** `GET /v1/insights/schema` returns all available entities and their fields.
* **Event schema:** `GET /v1/insights/event/{eventId}/schema` returns entities and fields scoped to a specific event.

The schema response includes entity names, field names, data types, and relationships between entities that you can use in JOIN clauses.

For event-scoped schema (`GET /v1/insights/event/{eventId}/schema`), the payload also includes **`session_participant_roles`**: each event’s configured session roles (`name`, `name_plural`, `slug`, `core_role`). Use **`participant_contacts.role_slug`** in SbQL to filter custom roles (e.g. panelists); match user-facing labels to the **`slug`** from this list.

**`Session` vs `Abstract`:** Both use the same underlying sessions table. **`FIND Session`** returns only **program** sessions (non-abstract). **`FIND Abstract`** returns only **abstract / CFP** submissions. Prefer these entities over filtering on `is_abstract` in queries.

The REST Sessions API exposes the same distinction via `is_abstract` on every session payload, plus `composition_status` for merge/link state. Linked composition sources are excluded from default list/search unless you pass `expand=linked_sources`. See [Sessions & Composition](/api-reference/sessions-composition).

Relationship entries may include a `description` flagging **legacy** evaluation paths (`ratings`, `criteria_ratings`, etc.).

<Note>
  **Sessions 2.0 / Evaluation Plan 2.0:** When an event has the Sessions 2.0 feature enabled, evaluation **performance** for sessions and speakers (scores, grades, reviewer workload) is primarily stored in the **Evaluation Plan 2.0** data model. Current SbQL evaluation relationships read **legacy** `Evaluation_Plan_Ratings` (and related) tables. For v2-only evaluation activity, those queries may not match product UI or exports—use **Evaluation Plan 2.0** reports and CSV/XLSX exports as the source of truth, and see the internal `sbql-reference.md` *Sessions 2.0* section for full detail.
</Note>

## Natural Language to SbQL

If you prefer to write queries in plain English, use the `POST /v1/insights/ai/generate` endpoint to convert natural language into SbQL. For example, sending "How many sessions are in each track?" will return a valid SbQL query that you can execute directly.
