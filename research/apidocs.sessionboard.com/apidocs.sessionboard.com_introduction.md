---
url: "https://apidocs.sessionboard.com/introduction"
title: "Introduction - Sessionboard API"
---

> ## Documentation Index
>
> Fetch the complete documentation index at: [/llms.txt](https://apidocs.sessionboard.com/llms.txt)
>
> Use this file to discover all available pages before exploring further.

[Skip to main content](https://apidocs.sessionboard.com/introduction#content-area)

The Sessionboard Public API provides access to your event data including sessions, speakers, contacts, sponsors, and exhibitors. Use it to build integrations, sync data to external platforms, or power custom experiences for your events.

## [​](https://apidocs.sessionboard.com/introduction\#base-url)  Base URL

Sessionboard operates in two regions. Use the base URL corresponding to where your organization’s data is hosted.

- US Region

- EU Region


```
https://public-api.sessionboard.com
```

```
https://public-api-eu.sessionboard.com
```

## [​](https://apidocs.sessionboard.com/introduction\#quick-links)  Quick Links

[**Authentication** \\
\\
Learn how to authenticate requests using API tokens.](https://apidocs.sessionboard.com/authentication)

[**Webhooks** \\
\\
Receive real-time notifications when data changes.](https://apidocs.sessionboard.com/webhooks)

[**Build an Integration** \\
\\
Explore methods for syncing Sessionboard data to your platform.](https://apidocs.sessionboard.com/integrations)

[**API Reference** \\
\\
Browse the full endpoint reference with request and response schemas.](https://apidocs.sessionboard.com/api-reference/overview)

[**Media & Transcriptions** \\
\\
Sync transcript text, upload media files, or add session audio recordings.](https://apidocs.sessionboard.com/guides/uploading-media-and-transcriptions)

[**Session Files** \\
\\
Attach PDFs and documents — simple upload (≤50 MB) or direct-to-storage (≤500 MB).](https://apidocs.sessionboard.com/guides/uploading-session-files)

[**Changelog** \\
\\
See what’s new — endpoints, scopes, and response shape updates.](https://apidocs.sessionboard.com/changelog)

## [​](https://apidocs.sessionboard.com/introduction\#pagination)  Pagination

All search endpoints return paginated results. The response body includes a `pagination` object alongside the `results` array.

```
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

Some legacy search endpoints return a `results` key instead of `data`. Check each endpoint’s response schema for the exact shape.

Use the `page` and `pageSize` query parameters (or body parameters on POST search endpoints) to navigate through results. The default page size is 25 and the maximum is 100.

## [​](https://apidocs.sessionboard.com/introduction\#rate-limiting)  Rate Limiting

The API enforces rate limits to ensure fair usage — see [Rate Limiting](https://apidocs.sessionboard.com/rate-limiting) for details. Build your integration to handle `429 Too Many Requests` responses with exponential backoff.

## [​](https://apidocs.sessionboard.com/introduction\#caching)  Caching

To ensure fast response times, the following endpoints are cached for **3 minutes**:

- `GET /v1/event/{eventId}/sessions/{sessionId}` — individual session retrieval
- `POST /v1/event/{eventId}/sessions` — session search

If you update data in Sessionboard and immediately query the API, you may see stale results for up to 3 minutes. Webhook notifications are delivered in real time and are not subject to caching.

Ctrl+I