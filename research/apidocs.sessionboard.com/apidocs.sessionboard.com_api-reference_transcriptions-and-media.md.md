---
url: "https://apidocs.sessionboard.com/api-reference/transcriptions-and-media.md"
title: undefined
---

> ## Documentation Index
> Fetch the complete documentation index at: https://apidocs.sessionboard.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Transcriptions & Media

> Unified transcription API, session recordings, and media upload endpoints.

For step-by-step integration flows, start with the [Media & Transcriptions](/guides/uploading-media-and-transcriptions) guide. To **read** composed transcripts and AI artifacts in an app, see [Consuming session content](/guides/consuming-session-content).

## Five integration paths

| Path                   | Best for                                                      | Sidebar group                               |
| ---------------------- | ------------------------------------------------------------- | ------------------------------------------- |
| **Content packs**      | One-call composed transcript + artifacts for apps             | Event — Media → Transcriptions (`/content`) |
| **Transcriptions**     | Raw CRUD — fragments, summaries, insights, translations       | Event — Media → Transcriptions              |
| **Session recordings** | Audio for a session's recording archive                       | Event — Media → Session recordings          |
| **Media upload**       | Video or audio files that should be transcribed automatically | Event — Media → Media upload                |
| **Session files**      | PDFs, PowerPoint, Word docs, and similar attachments          | Event — Media → Session files               |

<Note>
  **Session files** (slides, handouts, PDFs) support a one-call multipart upload (`POST .../files/upload`, max 50 MB) or direct-to-storage for larger files (up to 500 MB). Scopes: `read:sessions` / `write:sessions`. See [Uploading session files](/guides/uploading-session-files) and the [Session Files API overview](/api-reference/session-files).
</Note>

## Resource model

Transcription data uses four types, all tied to a session:

| Type          | Description                                                                   |
| ------------- | ----------------------------------------------------------------------------- |
| `fragment`    | Transcript text (synced by you or created when media transcription completes) |
| `summary`     | Structured summary content                                                    |
| `insight`     | Topics, entities, or key phrases                                              |
| `translation` | Translated text linked to a source artifact                                   |

Responses use the standard envelope:

```json theme={null}
{
  "data": {
    "id": "uuid",
    "type": "fragment",
    "session_id": "uuid",
    "transcription": "...",
    "created_at": "...",
    "updated_at": "..."
  }
}
```

List endpoints include `pagination` with `current_page`, `page_size`, `total_pages`, and `total_results`.

## Session & event content

Ready-to-render packs for partners and mobile apps. Not the same as session [composition](/api-reference/sessions-composition) (abstract/parent linking).

<CardGroup cols={2}>
  <Card title="Get session content" icon="mobile" href="/api-reference/openapi.yaml#/paths/~1v1~1event~1%7BeventId%7D~1sessions~1%7BsessionId%7D~1content/get">
    GET /v1/event/{eventId}/sessions/{sessionId}/content
  </Card>

  <Card title="List event content" icon="list" href="/api-reference/openapi.yaml#/paths/~1v1~1event~1%7BeventId%7D~1content/get">
    GET /v1/event/{eventId}/content
  </Card>

  <Card title="Event-level artifacts" icon="file-pdf" href="/api-reference/openapi.yaml#/paths/~1v1~1event~1%7BeventId%7D~1content~1event/get">
    GET /v1/event/{eventId}/content/event
  </Card>

  <Card title="Get content item" icon="file-lines" href="/api-reference/openapi.yaml#/paths/~1v1~1event~1%7BeventId%7D~1content~1items~1%7BitemId%7D/get">
    GET /v1/event/{eventId}/content/items/{itemId}
  </Card>
</CardGroup>

Guide: [Consuming session content](/guides/consuming-session-content).

## Transcriptions

<CardGroup cols={2}>
  <Card title="List event transcriptions" icon="list" href="/api-reference/openapi.yaml#/paths/~1v1~1event~1%7BeventId%7D~1transcriptions/get">
    GET /v1/event/{eventId}/transcriptions
  </Card>

  <Card title="List session transcriptions" icon="list" href="/api-reference/openapi.yaml#/paths/~1v1~1event~1%7BeventId%7D~1sessions~1%7BsessionId%7D~1transcriptions/get">
    GET /v1/event/{eventId}/sessions/{sessionId}/transcriptions
  </Card>

  <Card title="Get session transcription" icon="file-lines" href="/api-reference/openapi.yaml#/paths/~1v1~1event~1%7BeventId%7D~1sessions~1%7BsessionId%7D~1transcriptions~1%7BtranscriptionId%7D/get">
    GET /v1/event/{eventId}/sessions/{sessionId}/transcriptions/{transcriptionId}
  </Card>

  <Card title="Create transcription" icon="plus" href="/api-reference/openapi.yaml#/paths/~1v1~1event~1%7BeventId%7D~1sessions~1%7BsessionId%7D~1transcriptions/post">
    POST /v1/event/{eventId}/sessions/{sessionId}/transcriptions
  </Card>
</CardGroup>

## Session recordings

<CardGroup cols={2}>
  <Card title="List session recordings" icon="list" href="/api-reference/openapi.yaml#/paths/~1v1~1event~1%7BeventId%7D~1sessions~1%7BsessionId%7D~1recordings/get">
    GET /v1/event/{eventId}/sessions/{sessionId}/recordings
  </Card>

  <Card title="Start recording upload" icon="upload" href="/api-reference/openapi.yaml#/paths/~1v1~1event~1%7BeventId%7D~1sessions~1%7BsessionId%7D~1recordings/post">
    POST /v1/event/{eventId}/sessions/{sessionId}/recordings
  </Card>

  <Card title="Get session recording" icon="microphone" href="/api-reference/openapi.yaml#/paths/~1v1~1event~1%7BeventId%7D~1sessions~1%7BsessionId%7D~1recordings~1%7BrecordingId%7D/get">
    GET /v1/event/{eventId}/sessions/{sessionId}/recordings/{recordingId}
  </Card>

  <Card title="Complete recording upload" icon="check" href="/api-reference/openapi.yaml#/paths/~1v1~1event~1%7BeventId%7D~1sessions~1%7BsessionId%7D~1recordings~1%7BrecordingId%7D~1complete/post">
    POST .../recordings/{recordingId}/complete
  </Card>
</CardGroup>

## Session files

Document attachments (PDF, PowerPoint, Word, images). Full playbook: [Uploading session files](/guides/uploading-session-files). API overview: [Session Files](/api-reference/session-files).

<CardGroup cols={2}>
  <Card title="List session files" icon="list" href="/api-reference/openapi.yaml#/paths/~1v1~1event~1%7BeventId%7D~1sessions~1%7BsessionId%7D~1files/get">
    GET /v1/event/{eventId}/sessions/{sessionId}/files
  </Card>

  <Card title="Simple file upload" icon="upload" href="/api-reference/openapi.yaml#/paths/~1v1~1event~1%7BeventId%7D~1sessions~1%7BsessionId%7D~1files~1upload/post">
    POST /v1/event/{eventId}/sessions/{sessionId}/files/upload
  </Card>

  <Card title="Direct-to-storage create" icon="cloud-arrow-up" href="/api-reference/openapi.yaml#/paths/~1v1~1event~1%7BeventId%7D~1sessions~1%7BsessionId%7D~1files/post">
    POST /v1/event/{eventId}/sessions/{sessionId}/files
  </Card>

  <Card title="Complete file upload" icon="check" href="/api-reference/openapi.yaml#/paths/~1v1~1event~1%7BeventId%7D~1sessions~1%7BsessionId%7D~1files~1%7BfileId%7D~1complete/post">
    POST .../files/{fileId}/complete
  </Card>

  <Card title="Session files guide" icon="file-arrow-up" href="/guides/uploading-session-files">
    Replace, update metadata, delete
  </Card>
</CardGroup>

## Media upload

<CardGroup cols={2}>
  <Card title="Start media upload" icon="upload" href="/api-reference/openapi.yaml#/paths/~1v1~1event~1%7BeventId%7D~1sessions~1%7BsessionId%7D~1media~1upload~1initiate/post">
    POST .../media/upload/initiate
  </Card>

  <Card title="Get media item status" icon="video" href="/api-reference/openapi.yaml#/paths/~1v1~1event~1%7BeventId%7D~1sessions~1%7BsessionId%7D~1media~1%7BmediaItemId%7D/get">
    GET /v1/event/{eventId}/sessions/{sessionId}/media/{mediaItemId}
  </Card>
</CardGroup>

## Related reference

* [Media & Transcriptions guide](/guides/uploading-media-and-transcriptions) — step-by-step playbooks
* [Uploading session files](/guides/uploading-session-files) — PDF and document attachments
* [Session Files API overview](/api-reference/session-files)
* [Authentication & scopes](/authentication)
