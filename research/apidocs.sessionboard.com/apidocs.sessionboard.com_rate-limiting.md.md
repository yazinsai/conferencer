---
url: "https://apidocs.sessionboard.com/rate-limiting.md"
title: undefined
---

> ## Documentation Index
> Fetch the complete documentation index at: https://apidocs.sessionboard.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Rate Limiting

> Understand API rate limits and how to handle them

The Sessionboard Public API enforces rate limits to ensure fair usage and platform stability. Rate limits are applied per API token with separate counters for each category.

## Limits by Endpoint

Rate-limited endpoints are grouped into independent buckets. Each bucket tracks its own counter, so hitting the limit on writes won't block your reads.

| Category                             | Limit | Window     | Endpoints                                                                                                                                                                    |
| ------------------------------------ | ----- | ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Entity reads**                     | 100   | 15 minutes | `GET` single session, contact, exhibitor, sponsor; `GET` field, room, track, tag, format, level, language, status lists                                                      |
| **Session writes**                   | 100   | 15 minutes | `POST /sessions/create`, `PUT`, `DELETE`, `POST /restore`, `POST /bulk` for sessions; `POST .../files/upload`, `POST` / `PUT` / `DELETE` on session files (`write:sessions`) |
| **Transcription & recording writes** | 100   | 15 minutes | `POST` / `PUT` / `DELETE` on session transcriptions; `POST` on session recordings and `POST /complete` (`write:transcriptions`)                                              |
| **Media upload writes**              | 100   | 15 minutes | Multipart media upload initiate, sign-part, complete, abort (`write:media`)                                                                                                  |
| **Contact writes**                   | 100   | 15 minutes | `POST /create`, `PUT`, `DELETE`, `POST /restore`, `POST /bulk` for contacts                                                                                                  |
| **Exhibitor writes**                 | 100   | 15 minutes | `POST /create`, `PUT`, `DELETE`, `POST /restore`, `POST /bulk` for exhibitors                                                                                                |
| **Sponsor writes**                   | 100   | 15 minutes | `POST /create`, `PUT`, `DELETE`, `POST /restore`, `POST /bulk` for sponsors                                                                                                  |
| **Field writes**                     | 100   | 15 minutes | `POST /create`, `PUT`, `DELETE` for custom fields                                                                                                                            |
| **Metadata writes**                  | 100   | 15 minutes | `POST /create`, `PUT`, `DELETE` for rooms, tracks, tags, formats, levels, languages, statuses                                                                                |
| **Event management writes**          | 100   | 15 minutes | Agenda drafts, draft sessions, scheduling rules, personas, dashboards, widgets, saved reports                                                                                |
| **Insights & SbQL**                  | 100   | 15 minutes | All `/insights/*` and `/event/{eventId}/insights/*` endpoints                                                                                                                |

### Endpoints without rate limits

The following endpoints do not enforce rate limits. They are legacy endpoints that query the database directly:

* `GET /v1/events` — list events
* `POST /v1/event/{eventId}/sessions` — search sessions
* `POST /v1/event/{eventId}/contacts` — search contacts
* `POST /v1/event/{eventId}/sponsors` — search sponsors
* `POST /v1/event/{eventId}/exhibitors` — search exhibitors
* `POST /v1/event/{eventId}/speakers` — search speakers
* `GET /v1/event/{eventId}/speakers/{contactId}` — get speaker
* `POST /v1/event/{eventId}/fields` — search fields
* `POST /v1/event/{eventId}/{rooms,tracks,tags,formats,levels,languages}` — search metadata
* `POST /v1/event/{eventId}/sessions/status` — search sessions by status
* `POST /v1/event/{eventId}/session-statuses` — search session statuses
* `GET/POST /v1/gdpr/requests` — GDPR endpoints
* `GET /v1/event/{eventId}/contacts/{contactId}/sessions` — contact sessions
* `GET /v1/organization/{orgId}/contacts/*` — org-level contact endpoints

<Note>
  Even though these endpoints don't enforce rate limits today, we recommend building your integration to handle `429` responses gracefully in case limits are added in the future.
</Note>

## Response Headers

Rate-limited endpoints include these headers on every response (both successful and rate-limited):

| Header                | Description                                     |
| --------------------- | ----------------------------------------------- |
| `RateLimit-Limit`     | Maximum requests allowed in the current window  |
| `RateLimit-Remaining` | Requests remaining in the current window        |
| `RateLimit-Reset`     | Unix timestamp (seconds) when the window resets |

## Exceeding the Limit

When you exceed the rate limit, the API returns a `429` status with a `Retry-After` header:

```
HTTP/1.1 429 Too Many Requests
RateLimit-Limit: 100
RateLimit-Remaining: 0
RateLimit-Reset: 1711900800
Retry-After: 45
```

```json theme={null}
{
  "error": "TooManyRequestsError",
  "message": "Error while trying to reach the endpoint: Too many requests"
}
```

## Custom Rate Limits

By default, each API token is limited to **100 requests per 15 minutes** per category. If your integration requires a higher throughput, contact Sessionboard support to request an elevated rate limit for your token.

Custom limits are applied per token and override the default for all rate-limited buckets. The 15-minute window stays the same — only the request count changes. For example, a token with a custom limit of 1,000 can make up to 1,000 requests per 15 minutes in each category.

<Note>
  When a custom rate limit is active, the `RateLimit-Limit` header reflects the token's custom value, not the default 100.
</Note>

## Best Practices

<CardGroup cols={2}>
  <Card title="Cache responses" icon="database">
    Cache API responses locally to reduce the number of requests. Many endpoints return data that doesn't change frequently.
  </Card>

  <Card title="Use pagination" icon="arrow-right">
    Use `page` and `pageSize` parameters to fetch only the data you need instead of requesting large datasets.
  </Card>

  <Card title="Handle 429 gracefully" icon="clock">
    When you receive a 429 response, wait for the `Retry-After` duration before making another request. Implement exponential backoff for retries.
  </Card>

  <Card title="Batch operations" icon="layer-group">
    Where possible, use bulk endpoints instead of making many individual requests. Bulk operations count as a single request against the rate limit.
  </Card>
</CardGroup>

## Rate Limits by Auth Method

| Auth Method                  | Limit            | Notes                                |
| ---------------------------- | ---------------- | ------------------------------------ |
| API Token (`x-access-token`) | 100 req / 15 min | Per token, per category              |
| OAuth Bearer Token           | 100 req / 15 min | Per token, per category              |
| Unauthenticated              | Blocked          | All endpoints require authentication |
