---
url: "https://apidocs.sessionboard.com/guides/uploading-media-and-transcriptions.md"
title: undefined
---

> ## Documentation Index
> Fetch the complete documentation index at: https://apidocs.sessionboard.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Media & Transcriptions

> Step-by-step playbooks for syncing transcript text, uploading media files, adding session audio, and pulling composed content.

Use this guide to pick the right workflow, then follow the steps. All paths are session-scoped unless noted.

## Pick your playbook

<CardGroup cols={1}>
  <Card title="Playbook 1 — Sync transcript text" icon="file-lines">
    **You already have the words** (full transcript, summary, topics, or translation) and want them on a session.

    Requires `write:transcriptions` to create; `read:transcriptions` to list or verify.
  </Card>

  <Card title="Playbook 2 — Upload a media file" icon="video">
    **You have a video or audio file** (MP4, MOV, MP3, etc.) and want Sessionboard to transcribe it automatically.

    Requires `write:media` to upload; `read:media` to check status. If you upload on a session URL, transcript lines appear in the session transcription list when processing finishes — no separate fragment upload needed.
  </Card>

  <Card title="Playbook 3 — Upload session audio" icon="microphone">
    **You have an audio file for a session’s recording archive** (live capture, imported audio, or segments to stitch later).

    Requires `write:transcriptions`. Accepts common audio formats; Sessionboard normalizes the file when you mark the upload complete.
  </Card>

  <Card title="Playbook 4 — Pull composed content" icon="mobile">
    **You want a ready-to-render pack** for a mobile app or partner integration — composed transcript, summary, insights, podcast, and PDF links in one call.

    Requires `read:transcriptions`. Prefer this over the raw polymorphic transcriptions list.
  </Card>
</CardGroup>

<Note>
  Not sure which to use? **Playbook 1** is for text you generate elsewhere. **Playbook 2** is for files you want transcribed inside Sessionboard (same flow as Import → Upload in the admin UI). **Playbook 3** is for audio tied to the session recording archive, not the media library. **Playbook 4** is for reading composed session/event content into an app.

  For **PDFs, PowerPoint, and other session attachments** (slides, handouts), use the separate [Uploading session files](/guides/uploading-session-files) guide — different scopes (`write:sessions`) and endpoints.
</Note>

***

## Before you begin

Replace `{eventId}` and `{sessionId}` with your event and session IDs. Send your API token on every request:

```http theme={null}
X-Access-Token: {your-token}
```

Create tokens and scopes in [Authentication](/authentication). Writes always need an explicit scope; legacy tokens with empty scopes can read but cannot create or upload.

***

## Playbook 1 — Sync transcript text

### When to use it

* You produced a transcript outside Sessionboard and want it on a session.
* You need summaries, topic insights, or translations alongside transcript text.

### Transcription types

| `type`        | What to send                                                                                                |
| ------------- | ----------------------------------------------------------------------------------------------------------- |
| `fragment`    | Transcript text (`transcription`). Use one fragment for a full session transcript, or many for timed lines. |
| `summary`     | Summary content (`content`).                                                                                |
| `insight`     | Topics or entities (`name`, `insight_type`). Optionally link to fragments with `fragment_ids`.              |
| `translation` | Translated text (`translated_text`) linked to a source fragment or summary.                                 |

<Steps>
  <Step title="Create a transcription">
    ```http theme={null}
    POST /v1/event/{eventId}/sessions/{sessionId}/transcriptions
    Content-Type: application/json
    ```

    **Example — full session transcript as one fragment:**

    ```json theme={null}
    {
      "type": "fragment",
      "transcription": "Welcome everyone to today's keynote...",
      "provider": "my-platform",
      "is_partial": false,
      "language_code": "en"
    }
    ```

    Set `is_partial` to `false` when the text is final. The response includes the new `id`.
  </Step>

  <Step title="Verify on the session">
    ```http theme={null}
    GET /v1/event/{eventId}/sessions/{sessionId}/transcriptions
    GET /v1/event/{eventId}/sessions/{sessionId}/transcriptions/{transcriptionId}
    ```
  </Step>

  <Step title="Update or remove (optional)">
    ```http theme={null}
    PUT /v1/event/{eventId}/sessions/{sessionId}/transcriptions/{transcriptionId}
    DELETE /v1/event/{eventId}/sessions/{sessionId}/transcriptions/{transcriptionId}
    ```
  </Step>
</Steps>

### Event-wide listing

To search across all sessions in an event:

```http theme={null}
GET /v1/event/{eventId}/transcriptions?page=1&page_size=25&type=fragment
```

By default, in-progress live-capture lines (`is_partial=true`) are hidden. Add `include_partial=true` to include them.

***

## Playbook 2 — Upload a media file

### When to use it

* You have a **video or audio file** and want automatic transcription.
* The file should appear in Sessionboard’s media hub for the session.

### What happens

1. You upload the file in parts (large files supported, up to **50 GB**).
2. Sessionboard processes the file and runs transcription.
3. You poll until `transcript_status` is `ready`.
4. If the upload URL includes `{sessionId}`, transcript **fragments** are added to that session automatically. You do **not** need Playbook 1 for the same content.

<Steps>
  <Step title="Start the upload">
    ```http theme={null}
    POST /v1/event/{eventId}/sessions/{sessionId}/media/upload/initiate
    Content-Type: application/json
    ```

    ```json theme={null}
    {
      "filename": "keynote-recording.mp4",
      "content_type": "video/mp4",
      "size_bytes": 524288000
    }
    ```

    Response includes `key`, `upload_id`, and part sizing. Keep these for the next steps.
  </Step>

  <Step title="Get upload URLs for each part">
    ```http theme={null}
    POST /v1/event/{eventId}/sessions/{sessionId}/media/upload/sign-part
    Content-Type: application/json
    ```

    ```json theme={null}
    {
      "key": "{key from initiate}",
      "upload_id": "{upload_id from initiate}",
      "part_numbers": [1, 2, 3]
    }
    ```

    Response returns a URL per part number.
  </Step>

  <Step title="Upload each part">
    `PUT` the file bytes to each URL from the previous step. Save the `ETag` header from each response — you need it to finish the upload.
  </Step>

  <Step title="Finish the upload">
    ```http theme={null}
    POST /v1/event/{eventId}/sessions/{sessionId}/media/upload/complete
    Content-Type: application/json
    ```

    ```json theme={null}
    {
      "key": "{key}",
      "upload_id": "{upload_id}",
      "filename": "keynote-recording.mp4",
      "size_bytes": 524288000,
      "parts": [
        { "part_number": 1, "etag": "\"abc123\"" },
        { "part_number": 2, "etag": "\"def456\"" }
      ]
    }
    ```

    Response includes `mediaItemId`. The session is taken from the URL — do not send `session_id` in the body.
  </Step>

  <Step title="Poll until transcription is ready">
    ```http theme={null}
    GET /v1/event/{eventId}/sessions/{sessionId}/media/{mediaItemId}
    ```

    Check `transcript_status`:

    | Status       | Meaning                                                                 |
    | ------------ | ----------------------------------------------------------------------- |
    | `queued`     | Waiting to process                                                      |
    | `processing` | Transcription in progress                                               |
    | `ready`      | Done — session fragments are available if you uploaded on a session URL |
    | `failed`     | Processing failed — inspect the item or retry upload                    |

    Then list session transcriptions to read the generated fragments:

    ```http theme={null}
    GET /v1/event/{eventId}/sessions/{sessionId}/transcriptions?type=fragment
    ```
  </Step>
</Steps>

<Tip>
  To cancel an in-progress upload, call `POST .../media/upload/abort` with `key` and `upload_id`.
</Tip>

***

## Playbook 3 — Upload session audio

### When to use it

* You have **audio for a session’s recording archive** (not the media library flow in Playbook 2).
* You need audio available for session playback, stitching, or downstream transcription inside Sessionboard.

### Supported file types

`wav`, `mp3`, `m4a`, `aac`, `flac`, `ogg`, `pcm`

<Steps>
  <Step title="Start the recording upload">
    ```http theme={null}
    POST /v1/event/{eventId}/sessions/{sessionId}/recordings
    Content-Type: application/json
    ```

    ```json theme={null}
    {
      "filename": "session-audio.wav",
      "content_type": "audio/wav",
      "size_bytes": 1048576
    }
    ```

    Response includes a recording `id` and an `upload.url`. Use that URL for the next step.
  </Step>

  <Step title="Upload the file">
    `PUT` the audio bytes to `upload.url` using the `Content-Type` from the response headers.
  </Step>

  <Step title="Mark the upload complete">
    ```http theme={null}
    POST /v1/event/{eventId}/sessions/{sessionId}/recordings/{recordingId}/complete
    Content-Type: application/json
    ```

    ```json theme={null}
    {
      "duration_seconds": 3600,
      "file_size_bytes": 1048576
    }
    ```

    Both fields are optional but help accuracy. Sessionboard accepts common formats and prepares the file for the recording pipeline when you complete.

    Calling **complete** again on an already-completed recording returns success without duplicating work.
  </Step>

  <Step title="Confirm the recording">
    ```http theme={null}
    GET /v1/event/{eventId}/sessions/{sessionId}/recordings/{recordingId}
    GET /v1/event/{eventId}/sessions/{sessionId}/recordings
    ```
  </Step>
</Steps>

***

## Playbook 4 — Pull composed content

### When to use it

* You are building a **mobile app, partner integration, or site** that needs a ready-to-render transcript plus AI artifacts.
* You want **one call per session** (or a paginated event list) instead of paging the mixed raw `.../transcriptions` list and stitching fragments yourself.

This is **not** session [composition](/api-reference/sessions-composition) (abstract → parent/child linking). Content packs live under `/content`.

Requires `read:transcriptions` (legacy tokens with empty scopes still pass for reads).

### What you get

Each session pack returns an `items[]` array. Filter by `type`:

| `type`          | Meaning                                                       |
| --------------- | ------------------------------------------------------------- |
| `transcription` | Composed speaker turns (`elements[]`) plus full joined `text` |
| `summary`       | Preferred rolling/final summary                               |
| `insight`       | Thoughts, themes, topics, key phrases, etc.                   |
| `podcast`       | Digest audio status + time-limited `url` when ready           |
| `document`      | Links to summary PDF / summary card downloads                 |

Event-level packs add `event_report` and a `recap` rollup.

<Steps>
  <Step title="Get one session pack (canonical)">
    ```http theme={null}
    GET /v1/event/{eventId}/sessions/{sessionId}/content
    ```

    Optional query params:

    | Param          | Purpose                                                                         |
    | -------------- | ------------------------------------------------------------------------------- |
    | `expand`       | Slim the pack, e.g. `expand=transcription,summary`                              |
    | `interval_sec` | Rechunk same-speaker elements into \~N-second windows (default = speaker turns) |
    | `provider`     | Prefer a summary provider (`claude` or `openai`) when multiple exist            |

    Example response shape:

    ```json theme={null}
    {
      "data": {
        "id": "{sessionId}",
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
                "end_time": 51.88
              }
            ]
          },
          { "type": "summary", "provider": "openai", "content": { "summary": "…", "key_points": [] } },
          { "type": "insight", "insight_type": "thought", "name": "…" },
          { "type": "podcast", "status": "none", "url": null },
          {
            "type": "document",
            "document_type": "summary_pdf",
            "url": "https://public-api.sessionboard.com/v1/event/{eventId}/sessions/{sessionId}/content/documents/summary_pdf"
          }
        ]
      }
    }
    ```

    Join transcript text in your client:

    ```js theme={null}
    const transcription = data.items.find((i) => i.type === "transcription");
    const fullText =
      transcription?.text ??
      transcription?.elements?.map((e) => e.value).join(" ") ??
      "";
    ```
  </Step>

  <Step title="List packs across an event">
    ```http theme={null}
    GET /v1/event/{eventId}/content?page=1&page_size=25
    ```

    Returns `{ data: [ SessionContent, … ], pagination: { current_page, page_size, total_pages, total_results } }`.

    List packs are **compact** by default (transcription `text` without full `elements`). Pass `expand=items` (with other types) for full element arrays:

    ```http theme={null}
    GET /v1/event/{eventId}/content?page=1&page_size=25&expand=transcription,summary,insight,podcast,document,items
    ```
  </Step>

  <Step title="Get event-level artifacts">
    ```http theme={null}
    GET /v1/event/{eventId}/content/event
    ```

    Returns the event report document metadata and a recap rollup (quotes, topics, summary excerpts). Default expand is `document,recap`.
  </Step>

  <Step title="Download a PDF or summary card (optional)">
    Use the `url` on a `document` item, or call directly:

    ```http theme={null}
    GET /v1/event/{eventId}/sessions/{sessionId}/content/documents/summary_pdf
    GET /v1/event/{eventId}/sessions/{sessionId}/content/documents/summary_card
    GET /v1/event/{eventId}/content/documents/event_report
    ```

    These stream binary PDF/PNG. Send the same `X-Access-Token`. Podcast `url` values are time-limited — refresh the content pack before `expires_at`.
  </Step>
</Steps>

<Tip>
  Full reference, item catalog, and single-item fetch (`GET .../content/items/{itemId}`) live in [Consuming session content](/guides/consuming-session-content). Keep using Playbooks 1–3 (or live capture) to **write** data; use Playbook 4 to **read** the composed view.
</Tip>

***

## Scopes quick reference

| Scope                  | Use it for                                                      |
| ---------------------- | --------------------------------------------------------------- |
| `read:transcriptions`  | List/get transcriptions, recordings, and composed content packs |
| `write:transcriptions` | Create, update, delete transcriptions; upload session audio     |
| `read:media`           | Check media upload and transcription status                     |
| `write:media`          | Multipart media upload                                          |

Scoped read tokens must include the matching read scope. For example, `read:events` alone does **not** allow transcription or media GET endpoints.

***

## Related reference

* [Consuming session content](/guides/consuming-session-content) — content packs in depth
* [Transcriptions & Media API overview](/api-reference/transcriptions-and-media)
* [Uploading session files](/guides/uploading-session-files) — PDFs, PowerPoint, and document attachments
* [Authentication & scopes](/authentication)
* [OpenAPI — transcriptions endpoints](/api-reference/openapi.yaml)
