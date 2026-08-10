---
url: "https://apidocs.sessionboard.com/introduction.md"
title: undefined
---

> ## Documentation Index
> Fetch the complete documentation index at: https://apidocs.sessionboard.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Introduction

> Get started with the Sessionboard Public API

The Sessionboard Public API provides access to your event data including sessions, speakers, contacts, sponsors, and exhibitors. Use it to build integrations, sync data to external platforms, or power custom experiences for your events.

## Base URL

Sessionboard operates in two regions. Use the base URL corresponding to where your organization's data is hosted.

<Tabs>
  <Tab title="US Region">
    ```
    https://public-api.sessionboard.com
    ```
  </Tab>

  <Tab title="EU Region">
    ```
    https://public-api-eu.sessionboard.com
    ```
  </Tab>
</Tabs>

## Quick Links

<CardGroup cols={2}>
  <Card title="Authentication" icon="lock" href="/authentication">
    Learn how to authenticate requests using API tokens.
  </Card>

  <Card title="Webhooks" icon="webhook" href="/webhooks">
    Receive real-time notifications when data changes.
  </Card>

  <Card title="Build an Integration" icon="puzzle-piece" href="/integrations">
    Explore methods for syncing Sessionboard data to your platform.
  </Card>

  <Card title="API Reference" icon="code" href="/api-reference/overview">
    Browse the full endpoint reference with request and response schemas.
  </Card>

  <Card title="Media & Transcriptions" icon="closed-captioning" href="/guides/uploading-media-and-transcriptions">
    Sync transcript text, upload media files, or add session audio recordings.
  </Card>

  <Card title="Session Files" icon="file-arrow-up" href="/guides/uploading-session-files">
    Attach PDFs and documents — simple upload (≤50 MB) or direct-to-storage (≤500 MB).
  </Card>

  <Card title="Changelog" icon="clock-rotate-left" href="/changelog">
    See what's new — endpoints, scopes, and response shape updates.
  </Card>
</CardGroup>

## Pagination

All search endpoints return paginated results. The response body includes a `pagination` object alongside the `results` array.

```json theme={null}
{
  "data": [],
  "pagination": {
    "currentPage": 1,
    "pageSize": 25,
    "totalPages": 10,
    "totalResults": 250
  }
}
```

<Note>
  Some legacy search endpoints return a `results` key instead of `data`. Check each endpoint's response schema for the exact shape.
</Note>

Use the `page` and `pageSize` query parameters (or body parameters on POST search endpoints) to navigate through results. The default page size is 25 and the maximum is 100.

## Rate Limiting

The API enforces rate limits to ensure fair usage — see [Rate Limiting](/rate-limiting) for details. Build your integration to handle `429 Too Many Requests` responses with exponential backoff.

## Caching

To ensure fast response times, the following endpoints are cached for **3 minutes**:

* `GET /v1/event/{eventId}/sessions/{sessionId}` — individual session retrieval
* `POST /v1/event/{eventId}/sessions` — session search

If you update data in Sessionboard and immediately query the API, you may see stale results for up to 3 minutes. Webhook notifications are delivered in real time and are not subject to caching.
