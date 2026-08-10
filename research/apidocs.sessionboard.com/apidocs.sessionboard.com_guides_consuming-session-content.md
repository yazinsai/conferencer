---
url: "https://apidocs.sessionboard.com/guides/consuming-session-content"
title: "Consuming session content - Sessionboard API"
---

> ## Documentation Index
>
> Fetch the complete documentation index at: [/llms.txt](https://apidocs.sessionboard.com/llms.txt)
>
> Use this file to discover all available pages before exploring further.

[Skip to main content](https://apidocs.sessionboard.com/guides/consuming-session-content#content-area)

Use the **content** endpoints when you want a ready-to-render pack for a session or event — not the raw polymorphic transcriptions list.

**Content** is not the same as session **composition** (abstract → parent/child linking). Composition docs live under [Sessions & Composition](https://apidocs.sessionboard.com/api-reference/sessions-composition).

## [​](https://apidocs.sessionboard.com/guides/consuming-session-content\#when-to-use-which-api)  When to use which API

| Goal | Endpoint family |
| --- | --- |
| Display a full session transcript + AI artifacts in an app | `GET .../sessions/{sessionId}/content` |
| Browse packs across an event | `GET .../content` (paginated) |
| Event report PDF + recap rollup | `GET .../content/event` |
| Create/update raw fragments, summaries, insights | `.../transcriptions` CRUD |

Scope: `read:transcriptions` (legacy tokens with empty scopes still pass for reads).

## [​](https://apidocs.sessionboard.com/guides/consuming-session-content\#session-pack-canonical)  Session pack (canonical)

```
curl --request GET \
  --url 'https://public-api.sessionboard.com/v1/event/6046/sessions/{sessionId}/content' \
  --header 'x-access-token: YOUR_TOKEN'
```

Response shape (proxy envelope):

```
{
  "data": {
    "id": "session-uuid",
    "event_id": 6046,
    "title": "Keynote",
    "speakers": [{ "id": "0", "label": "Speaker 0", "name": null }],
    "has_transcription": true,
    "has_summary": true,
    "has_podcast": false,
    "items": [\
      {\
        "type": "transcription",\
        "text": "Full joined transcript…",\
        "elements": [\
          {\
            "value": "Speaker turn text…",\
            "speaker": { "id": "0", "label": "Speaker 0", "name": null },\
            "start_time": 2.23,\
            "end_time": 51.88,\
            "fragment_ids": ["…"]\
          }\
        ]\
      },\
      { "type": "summary", "provider": "openai", "content": { "summary": "…", "key_points": [] } },\
      { "type": "insight", "insight_type": "thought", "name": "…" },\
      { "type": "podcast", "status": "none", "url": null },\
      { "type": "document", "document_type": "summary_pdf", "url": "https://…/sessions/{sessionId}/content/documents/summary_pdf" }\
    ]
  }
}
```

### [​](https://apidocs.sessionboard.com/guides/consuming-session-content\#join-transcript-text)  Join transcript text

```
const transcription = data.items.find((i) => i.type === "transcription");
const fullText =
  transcription?.text ??
  transcription?.elements?.map((e) => e.value).join(" ") ??
  "";
```

`elements.map(e => e.value).join(' ')` always equals `text` when elements are present.

### [​](https://apidocs.sessionboard.com/guides/consuming-session-content\#speaker-turns-vs-time-windows)  Speaker turns vs time windows

- Default: consecutive same-speaker fragments → one element (speaker turns).
- `?interval_sec=60`: rechunk same-speaker blocks into ~60s windows (speaker changes still split).

### [​](https://apidocs.sessionboard.com/guides/consuming-session-content\#slim-the-payload)  Slim the payload

```
# Transcript + summary only
.../content?expand=transcription,summary
```

### [​](https://apidocs.sessionboard.com/guides/consuming-session-content\#prefer-a-summary-provider)  Prefer a summary provider

```
.../content?provider=claude
```

When multiple rolling summaries exist, the newest is returned unless `provider` matches.

## [​](https://apidocs.sessionboard.com/guides/consuming-session-content\#event-list)  Event list

```
curl --request GET \
  --url 'https://public-api.sessionboard.com/v1/event/6046/content?page=1&page_size=25' \
  --header 'x-access-token: YOUR_TOKEN'
```

Returns `{ data: [ SessionContent, … ], pagination: { current_page, page_size, total_pages, total_results } }`.List packs are **compact** by default (transcription `text` without full `elements`). Pass `expand=items` (with other types) for full element arrays.

## [​](https://apidocs.sessionboard.com/guides/consuming-session-content\#event-level-artifacts)  Event-level artifacts

```
GET /v1/event/{eventId}/content/event
```

Includes `document` (`event_report`) and `recap` (quotes, topics, summary excerpts).

## [​](https://apidocs.sessionboard.com/guides/consuming-session-content\#podcasts-and-pdfs)  Podcasts and PDFs

| Item | Behavior |
| --- | --- |
| `podcast` | `status`: `none` \| `queued` \| `generating` \| `ready` \| `failed`. When ready, `url` is a time-limited download link; refresh before `expires_at`. |
| `document` | Metadata + `url` pointing at authenticated download routes (`summary_pdf`, `summary_card`, `event_report`). |

Generation of podcasts/PDFs is not triggered by the public API — content endpoints are read-only.

## [​](https://apidocs.sessionboard.com/guides/consuming-session-content\#single-item)  Single item

```
GET /v1/event/{eventId}/content/items/{itemId}
```

| `itemId` | Result |
| --- | --- |
| Session UUID | Composed `transcription` item |
| Summary / insight / podcast UUID | That item |
| `summary_pdf` / `summary_card` | Document metadata (`?session_id=` required) |
| `event_report` / `recap` | Event-level item |

## [​](https://apidocs.sessionboard.com/guides/consuming-session-content\#related)  Related

- [Transcriptions & Media overview](https://apidocs.sessionboard.com/api-reference/transcriptions-and-media)
- [Uploading media and transcriptions](https://apidocs.sessionboard.com/guides/uploading-media-and-transcriptions)

Ctrl+I