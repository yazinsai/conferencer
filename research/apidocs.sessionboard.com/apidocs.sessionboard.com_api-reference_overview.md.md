---
url: "https://apidocs.sessionboard.com/api-reference/overview.md"
title: undefined
---

> ## Documentation Index
> Fetch the complete documentation index at: https://apidocs.sessionboard.com/llms.txt
> Use this file to discover all available pages before exploring further.

# API Reference

> Complete reference for the Sessionboard Public API

This reference documents every endpoint available in the Sessionboard Public API. Endpoint pages are generated from our OpenAPI specification and include request parameters, response schemas, and example payloads.

## Base URLs

| Region | Base URL                                 |
| ------ | ---------------------------------------- |
| US     | `https://public-api.sessionboard.com`    |
| EU     | `https://public-api-eu.sessionboard.com` |

Use the base URL corresponding to the region where your organization's data is hosted.

## Authentication

All requests require an `x-access-token` header containing a valid API token. See [Authentication](/authentication) for details on generating and managing tokens.

```bash theme={null}
curl -H "x-access-token: YOUR_TOKEN" https://public-api.sessionboard.com/v1/events
```

## Common Patterns

### Pagination

Search endpoints accept `page` and `pageSize` parameters and return a `pagination` object in the response. The default page size is 25 and the maximum is 100.

Session responses include `is_abstract` and `composition_status` for composition-aware integrations. Subsessions inherit these fields from their parent. See [Sessions & composition](/api-reference/sessions-composition) for filters, expand options, and contact session summaries.

### Filtering

POST-based search endpoints accept filter criteria in the request body. Refer to each endpoint's documentation for available filter fields.

### Create vs Search Endpoints

Some resources have two `POST` endpoints at similar paths:

| Path Pattern                               | Purpose                                                   |
| ------------------------------------------ | --------------------------------------------------------- |
| `POST /v1/event/{eventId}/sessions`        | **Search** sessions with filters, sorting, and pagination |
| `POST /v1/event/{eventId}/sessions/create` | **Create** a new session                                  |

The `/create` suffix distinguishes write operations from search where both use `POST` on the same collection path (sessions, contacts, exhibitors, sponsors, custom fields, and metadata entities).

Session-scoped **transcriptions**, **recordings**, and **session files** use standard REST — `POST` on the collection path creates a resource; there is no conflicting search endpoint. See [Media & Transcriptions](/guides/uploading-media-and-transcriptions) and [Uploading session files](/guides/uploading-session-files) for upload flows.

### Sorting

POST-based search endpoints accept a `sort` object in the request body to control result ordering. Sort by `createdAt` or `updatedAt` with `asc` or `desc` direction.

### Expanding Records

Some endpoints support an `expand` query parameter (or request-body field) to include additional data in the response.

| Expand value         | Endpoints            | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| -------------------- | -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `translated_fields`  | most read endpoints  | Returns translated versions of text fields when your event has translations enabled.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| `subsession_details` | session search + get | Returns full parent-shape parity (`status`, `custom_status`, `custom_fields`, `chairpersons`, `moderators`, `sponsors`, `exhibitors`, `tags`, `language`, `track`, `level`, `room`, `is_public`, `external_url`, `client_session_id`, `ceu_credits`, `capacity`, `source`) on every subsession inside `parent.subsessions[]`. Nested `language`, `track`, `level`, and `room` objects include the same fields as on parent sessions (see the `Session` schema). Without this expand the array contains the minimal subsession shape (`id`, `friendly_id`, `title`, `description`, `starts_at`, `ends_at`, `speakers`, `participants`, `format`, `content`, timestamps, parent friendly-id keys). Heavy joins are gated behind the flag for query performance. |

### Nested session metadata

Session responses embed assigned metadata as nested objects:

| Field      | Populated fields                                                       | Notes                           |
| ---------- | ---------------------------------------------------------------------- | ------------------------------- |
| `language` | `id`, `event_id`, `name`, `order`, `created_at`, `updated_at`          |                                 |
| `track`    | `id`, `event_id`, `name`, `color`, `order`, `created_at`, `updated_at` |                                 |
| `level`    | `id`, `name`, `order`, `created_at`, `updated_at`                      | No `event_id` on nested objects |
| `format`   | `id`, `name` only                                                      |                                 |
| `room`     | `id`, `name`, `order`, `capacity`, `created_at`, `updated_at`          | Only when `location` is `room`  |

Unassigned metadata is returned as an empty object `{}` on `POST /v1/event/{eventId}/sessions` (search). CRUD proxy endpoints (`GET` list, create, update, restore) return `null` instead.

### Subsessions

Sessions can have subsessions (child sessions linked to a parent). Subsessions are returned both:

* **Nested**, inside `parent.subsessions[]` on every session response. The default shape is minimal — pass `expand=subsession_details` to receive full parity with the parent session.
* **Top-level**, by calling `GET /v1/event/{eventId}/sessions/{sessionId}` with the subsession's UUID directly. The endpoint always returns the full session shape (including `chairpersons`, `moderators`, `custom_fields`, etc.) plus `parent_session_friendly_id` and `parent_session_friendly_id_raw` keys identifying the parent. The `expand=subsession_details` flag has no effect at the top level.

This means callers can iterate `parent.subsessions[]`, take each subsession id, and call the GET endpoint to retrieve the same shape they would for a parent session — useful for integration patterns that need to walk the session tree.

### Session participants (Sessions 2.0)

Session responses include **both** legacy role arrays and a flat `participants` array:

| Field                                    | Source                                   | When to use                                                                 |
| ---------------------------------------- | ---------------------------------------- | --------------------------------------------------------------------------- |
| `speakers`, `chairpersons`, `moderators` | Legacy junction tables                   | Existing integrations that expect these arrays                              |
| `participants`                           | `Session_Participants` + `Session_Roles` | New integrations; events with custom program roles (Author, Panelist, etc.) |

Each participant object uses the `SessionSpeaker` contact profile shape plus `participant_role` (`slug`, `name`, `name_plural`, `core_role`). Use `participant_role.name` (or `slug`) as the display/program role — for example **Author** or **Panelist**. `core_role` is only the legacy junction mapping (`speaker`, `chairperson`, `moderator`) and is not the role label.

Contact profile fields on embedded participants — `photo_url`, `company_name`, `title`, `address_country`, and other standard contact fields — are included in the event's default language **without** expand. Use `expand=translated_fields` for other locales.

Legacy `speakers` / `chairpersons` / `moderators` entries also include `participant_role` when the event has Sessions 2.0 roles configured.

### Organization-Scoped vs Convenience Routes

Dashboards, widgets, and saved reports support three route patterns:

| Pattern      | Example                               | Notes                                |
| ------------ | ------------------------------------- | ------------------------------------ |
| Event-scoped | `/v1/event/{eventId}/dashboards`      | Scoped to a single event             |
| Org-scoped   | `/v1/organization/{orgId}/dashboards` | Cross-event, explicit org ID         |
| Convenience  | `/v1/dashboards`                      | Cross-event, org resolved from token |

The convenience routes are recommended for org-level operations — they're simpler and don't require you to know the org ID. The org-scoped routes (`/v1/organization/{orgId}/...`) are equivalent but require the org ID in the URL.

## Media & Transcriptions

Sessionboard exposes three related but distinct media workflows. Pick the path that matches what you have:

| Workflow               | When to use                                                                         | Scopes                                        |
| ---------------------- | ----------------------------------------------------------------------------------- | --------------------------------------------- |
| **Transcriptions**     | You already have transcript text, summaries, topics, or translations to sync        | `read:transcriptions`, `write:transcriptions` |
| **Session recordings** | You have an audio file for a session's recording archive                            | `read:transcriptions`, `write:transcriptions` |
| **Media upload**       | You have a video or audio file and want Sessionboard to transcribe it automatically | `read:media`, `write:media`                   |

Start with the [Media & Transcriptions guide](/guides/uploading-media-and-transcriptions) for playbooks and examples, or the [API overview](/api-reference/transcriptions-and-media) for resource shapes. Endpoint pages are grouped under **Event — Media** in the sidebar.

## Error Codes

| Status Code | Description                                                                                                                                       |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `200`       | Success. The response body contains the requested data.                                                                                           |
| `400`       | Bad Request. The request body or parameters are invalid. Check the error message for details.                                                     |
| `401`       | Unauthorized. The `x-access-token` header is missing or the token is invalid.                                                                     |
| `403`       | Forbidden. The token does not have the required scope for this endpoint.                                                                          |
| `404`       | Not Found. The requested resource does not exist.                                                                                                 |
| `409`       | Conflict. The resource was modified since you last fetched it. Re-fetch the resource to get the current `updated_at` value and retry your update. |
| `429`       | Too Many Requests. You are being rate limited. Retry after a short delay with exponential backoff.                                                |
| `500`       | Internal Server Error. An unexpected error occurred. Contact support if the issue persists.                                                       |
