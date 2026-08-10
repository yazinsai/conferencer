---
url: "https://apidocs.sessionboard.com/api-reference/transcriptions-and-media"
title: "Transcriptions & Media - Sessionboard API"
---

> ## Documentation Index
>
> Fetch the complete documentation index at: [/llms.txt](https://apidocs.sessionboard.com/llms.txt)
>
> Use this file to discover all available pages before exploring further.

[Skip to main content](https://apidocs.sessionboard.com/api-reference/transcriptions-and-media#content-area)

For step-by-step integration flows, start with the [Media & Transcriptions](https://apidocs.sessionboard.com/guides/uploading-media-and-transcriptions) guide. To **read** composed transcripts and AI artifacts in an app, see [Consuming session content](https://apidocs.sessionboard.com/guides/consuming-session-content).

## [​](https://apidocs.sessionboard.com/api-reference/transcriptions-and-media\#five-integration-paths)  Five integration paths

| Path | Best for | Sidebar group |
| --- | --- | --- |
| **Content packs** | One-call composed transcript + artifacts for apps | Event — Media → Transcriptions (`/content`) |
| **Transcriptions** | Raw CRUD — fragments, summaries, insights, translations | Event — Media → Transcriptions |
| **Session recordings** | Audio for a session’s recording archive | Event — Media → Session recordings |
| **Media upload** | Video or audio files that should be transcribed automatically | Event — Media → Media upload |
| **Session files** | PDFs, PowerPoint, Word docs, and similar attachments | Event — Media → Session files |

**Session files** (slides, handouts, PDFs) support a one-call multipart upload (`POST .../files/upload`, max 50 MB) or direct-to-storage for larger files (up to 500 MB). Scopes: `read:sessions` / `write:sessions`. See [Uploading session files](https://apidocs.sessionboard.com/guides/uploading-session-files) and the [Session Files API overview](https://apidocs.sessionboard.com/api-reference/session-files).

## [​](https://apidocs.sessionboard.com/api-reference/transcriptions-and-media\#resource-model)  Resource model

Transcription data uses four types, all tied to a session:

| Type | Description |
| --- | --- |
| `fragment` | Transcript text (synced by you or created when media transcription completes) |
| `summary` | Structured summary content |
| `insight` | Topics, entities, or key phrases |
| `translation` | Translated text linked to a source artifact |

Responses use the standard envelope:

```
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

## [​](https://apidocs.sessionboard.com/api-reference/transcriptions-and-media\#session-&-event-content)  Session & event content

Ready-to-render packs for partners and mobile apps. Not the same as session [composition](https://apidocs.sessionboard.com/api-reference/sessions-composition) (abstract/parent linking).

[**Get session content** \\
\\
GET /v1/event//sessions//content](https://apidocs.sessionboard.com/api-reference/openapi.yaml#/paths/~1v1~1event~1%7BeventId%7D~1sessions~1%7BsessionId%7D~1content/get)

[**List event content** \\
\\
GET /v1/event//content](https://apidocs.sessionboard.com/api-reference/openapi.yaml#/paths/~1v1~1event~1%7BeventId%7D~1content/get)

[**Event-level artifacts** \\
\\
GET /v1/event//content/event](https://apidocs.sessionboard.com/api-reference/openapi.yaml#/paths/~1v1~1event~1%7BeventId%7D~1content~1event/get)

[**Get content item** \\
\\
GET /v1/event//content/items/](https://apidocs.sessionboard.com/api-reference/openapi.yaml#/paths/~1v1~1event~1%7BeventId%7D~1content~1items~1%7BitemId%7D/get)

Guide: [Consuming session content](https://apidocs.sessionboard.com/guides/consuming-session-content).

## [​](https://apidocs.sessionboard.com/api-reference/transcriptions-and-media\#transcriptions)  Transcriptions

[**List event transcriptions** \\
\\
GET /v1/event//transcriptions](https://apidocs.sessionboard.com/api-reference/openapi.yaml#/paths/~1v1~1event~1%7BeventId%7D~1transcriptions/get)

[**List session transcriptions** \\
\\
GET /v1/event//sessions//transcriptions](https://apidocs.sessionboard.com/api-reference/openapi.yaml#/paths/~1v1~1event~1%7BeventId%7D~1sessions~1%7BsessionId%7D~1transcriptions/get)

[**Get session transcription** \\
\\
GET /v1/event//sessions//transcriptions/](https://apidocs.sessionboard.com/api-reference/openapi.yaml#/paths/~1v1~1event~1%7BeventId%7D~1sessions~1%7BsessionId%7D~1transcriptions~1%7BtranscriptionId%7D/get)

[**Create transcription** \\
\\
POST /v1/event//sessions//transcriptions](https://apidocs.sessionboard.com/api-reference/openapi.yaml#/paths/~1v1~1event~1%7BeventId%7D~1sessions~1%7BsessionId%7D~1transcriptions/post)

## [​](https://apidocs.sessionboard.com/api-reference/transcriptions-and-media\#session-recordings)  Session recordings

[**List session recordings** \\
\\
GET /v1/event//sessions//recordings](https://apidocs.sessionboard.com/api-reference/openapi.yaml#/paths/~1v1~1event~1%7BeventId%7D~1sessions~1%7BsessionId%7D~1recordings/get)

[**Start recording upload** \\
\\
POST /v1/event//sessions//recordings](https://apidocs.sessionboard.com/api-reference/openapi.yaml#/paths/~1v1~1event~1%7BeventId%7D~1sessions~1%7BsessionId%7D~1recordings/post)

[**Get session recording** \\
\\
GET /v1/event//sessions//recordings/](https://apidocs.sessionboard.com/api-reference/openapi.yaml#/paths/~1v1~1event~1%7BeventId%7D~1sessions~1%7BsessionId%7D~1recordings~1%7BrecordingId%7D/get)

[**Complete recording upload** \\
\\
POST …/recordings//complete](https://apidocs.sessionboard.com/api-reference/openapi.yaml#/paths/~1v1~1event~1%7BeventId%7D~1sessions~1%7BsessionId%7D~1recordings~1%7BrecordingId%7D~1complete/post)

## [​](https://apidocs.sessionboard.com/api-reference/transcriptions-and-media\#session-files)  Session files

Document attachments (PDF, PowerPoint, Word, images). Full playbook: [Uploading session files](https://apidocs.sessionboard.com/guides/uploading-session-files). API overview: [Session Files](https://apidocs.sessionboard.com/api-reference/session-files).

[**List session files** \\
\\
GET /v1/event//sessions//files](https://apidocs.sessionboard.com/api-reference/openapi.yaml#/paths/~1v1~1event~1%7BeventId%7D~1sessions~1%7BsessionId%7D~1files/get)

[**Simple file upload** \\
\\
POST /v1/event//sessions//files/upload](https://apidocs.sessionboard.com/api-reference/openapi.yaml#/paths/~1v1~1event~1%7BeventId%7D~1sessions~1%7BsessionId%7D~1files~1upload/post)

[**Direct-to-storage create** \\
\\
POST /v1/event//sessions//files](https://apidocs.sessionboard.com/api-reference/openapi.yaml#/paths/~1v1~1event~1%7BeventId%7D~1sessions~1%7BsessionId%7D~1files/post)

[**Complete file upload** \\
\\
POST …/files//complete](https://apidocs.sessionboard.com/api-reference/openapi.yaml#/paths/~1v1~1event~1%7BeventId%7D~1sessions~1%7BsessionId%7D~1files~1%7BfileId%7D~1complete/post)

[**Session files guide** \\
\\
Replace, update metadata, delete](https://apidocs.sessionboard.com/guides/uploading-session-files)

## [​](https://apidocs.sessionboard.com/api-reference/transcriptions-and-media\#media-upload)  Media upload

[**Start media upload** \\
\\
POST …/media/upload/initiate](https://apidocs.sessionboard.com/api-reference/openapi.yaml#/paths/~1v1~1event~1%7BeventId%7D~1sessions~1%7BsessionId%7D~1media~1upload~1initiate/post)

[**Get media item status** \\
\\
GET /v1/event//sessions//media/](https://apidocs.sessionboard.com/api-reference/openapi.yaml#/paths/~1v1~1event~1%7BeventId%7D~1sessions~1%7BsessionId%7D~1media~1%7BmediaItemId%7D/get)

## [​](https://apidocs.sessionboard.com/api-reference/transcriptions-and-media\#related-reference)  Related reference

- [Media & Transcriptions guide](https://apidocs.sessionboard.com/guides/uploading-media-and-transcriptions) — step-by-step playbooks
- [Uploading session files](https://apidocs.sessionboard.com/guides/uploading-session-files) — PDF and document attachments
- [Session Files API overview](https://apidocs.sessionboard.com/api-reference/session-files)
- [Authentication & scopes](https://apidocs.sessionboard.com/authentication)

Ctrl+I