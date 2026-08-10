---
url: "https://apidocs.sessionboard.com/guides/consuming-session-content.md"
title: undefined
---

> ## Documentation Index
> Fetch the complete documentation index at: https://apidocs.sessionboard.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Consuming session content

> One-call composed transcripts, summaries, insights, podcasts, and PDFs for mobile and partner apps.

Use the **content** endpoints when you want a ready-to-render pack for a session or event — not the raw polymorphic transcriptions list.

<Note>
  **Content** is not the same as session **composition** (abstract → parent/child linking). Composition docs live under [Sessions & Composition](/api-reference/sessions-composition).
</Note>

## When to use which API

| Goal                                                       | Endpoint family                        |
| ---------------------------------------------------------- | -------------------------------------- |
| Display a full session transcript + AI artifacts in an app | `GET .../sessions/{sessionId}/content` |
| Browse packs across an event                               | `GET .../content` (paginated)          |
| Event report PDF + recap rollup                            | `GET .../content/event`                |
| Create/update raw fragments, summaries, insights           | `.../transcriptions` CRUD              |

Scope: `read:transcriptions` (legacy tokens with empty scopes still pass for reads).

## Session pack (canonical)

```bash theme={null}
curl --request GET \
  --url 'https://public-api.sessionboard.com/v1/event/6046/sessions/{sessionId}/content' \
  --header 'x-access-token: YOUR_TOKEN'
```

Response shape (proxy envelope):

```json theme={null}
{
  "data": {
    "id": "session-uuid",
    "event_id": 6046,
    "title": "Keynote",
    "speakers": [{ "id": "0", "label": "Speaker 0", "name": null }],
    "has_transcription": true,
    "has_summary": true,
    "has_podcast": false,
    "items": [
      {
        "type": "transcription",
        "text": "Full joined transcript…",
        "elements": [
          {
            "value": "Speaker turn text…",
            "speaker": { "id": "0", "label": "Speaker 0", "name": null },
            "start_time": 2.23,
            "end_time": 51.88,
            "fragment_ids": ["…"]
          }
        ]
      },
      { "type": "summary", "provider": "openai", "content": { "summary": "…", "key_points": [] } },
      { "type": "insight", "insight_type": "thought", "name": "…" },
      { "type": "podcast", "status": "none", "url": null },
      { "type": "document", "document_type": "summary_pdf", "url": "https://…/sessions/{sessionId}/content/documents/summary_pdf" }
    ]
  }
}
```

### Join transcript text

```js theme={null}
const transcription = data.items.find((i) => i.type === "transcription");
const fullText =
  transcription?.text ??
  transcription?.elements?.map((e) => e.value).join(" ") ??
  "";
```

`elements.map(e => e.value).join(' ')` always equals `text` when elements are present.

### Speaker turns vs time windows

* Default: consecutive same-speaker fragments → one element (speaker turns).
* `?interval_sec=60`: rechunk same-speaker blocks into \~60s windows (speaker changes still split).

### Slim the payload

```bash theme={null}
# Transcript + summary only
.../content?expand=transcription,summary
```

### Prefer a summary provider

```bash theme={null}
.../content?provider=claude
```

When multiple rolling summaries exist, the newest is returned unless `provider` matches.

## Event list

```bash theme={null}
curl --request GET \
  --url 'https://public-api.sessionboard.com/v1/event/6046/content?page=1&page_size=25' \
  --header 'x-access-token: YOUR_TOKEN'
```

Returns `{ data: [ SessionContent, … ], pagination: { current_page, page_size, total_pages, total_results } }`.

List packs are **compact** by default (transcription `text` without full `elements`). Pass `expand=items` (with other types) for full element arrays.

## Event-level artifacts

```bash theme={null}
GET /v1/event/{eventId}/content/event
```

Includes `document` (`event_report`) and `recap` (quotes, topics, summary excerpts).

## Podcasts and PDFs

| Item       | Behavior                                                                                                                                             |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `podcast`  | `status`: `none` \| `queued` \| `generating` \| `ready` \| `failed`. When ready, `url` is a time-limited download link; refresh before `expires_at`. |
| `document` | Metadata + `url` pointing at authenticated download routes (`summary_pdf`, `summary_card`, `event_report`).                                          |

Generation of podcasts/PDFs is not triggered by the public API — content endpoints are read-only.

## Single item

```bash theme={null}
GET /v1/event/{eventId}/content/items/{itemId}
```

| `itemId`                         | Result                                      |
| -------------------------------- | ------------------------------------------- |
| Session UUID                     | Composed `transcription` item               |
| Summary / insight / podcast UUID | That item                                   |
| `summary_pdf` / `summary_card`   | Document metadata (`?session_id=` required) |
| `event_report` / `recap`         | Event-level item                            |

## Related

* [Transcriptions & Media overview](/api-reference/transcriptions-and-media)
* [Uploading media and transcriptions](/guides/uploading-media-and-transcriptions)
