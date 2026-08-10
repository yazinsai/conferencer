---
url: "https://apidocs.sessionboard.com/api-reference/session-files.md"
title: undefined
---

> ## Documentation Index
> Fetch the complete documentation index at: https://apidocs.sessionboard.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Session Files

> Attach PDFs, PowerPoint decks, and other documents to sessions.

For step-by-step integration flows, start with the [Uploading session files](/guides/uploading-session-files) guide.

<Note>
  Session files are **not** the media or recording upload flow. Use [Media & Transcriptions](/guides/uploading-media-and-transcriptions) for video/audio that should be transcribed or stored as session recordings.
</Note>

## Upload paths

<Tabs>
  <Tab title="Simple (≤ 50 MB)">
    One multipart call — Sessionboard detects size and MIME type, scans the file, and returns the attached `Content` object.

    1. `POST .../files/upload` with multipart field **`file`**
    2. Optional form fields: `title`, `assigned_participant_id`
  </Tab>

  <Tab title="Direct to storage (≤ 500 MB)">
    Presigned URL flow for larger files or clients that prefer direct-to-S3 upload:

    1. `POST .../files` — JSON with `filename` and `size_bytes`
    2. `PUT` bytes to `data.upload.url`
    3. `POST .../files/{fileId}/complete`
  </Tab>
</Tabs>

## Scopes

| Action                                                 | Scope            |
| ------------------------------------------------------ | ---------------- |
| List files                                             | `read:sessions`  |
| Upload / create / complete / replace / update / delete | `write:sessions` |

## Endpoints

<CardGroup cols={2}>
  <Card title="Simple upload" icon="upload" href="/api-reference/openapi.yaml#/paths/~1v1~1event~1%7BeventId%7D~1sessions~1%7BsessionId%7D~1files~1upload/post">
    POST /v1/event/{eventId}/sessions/{sessionId}/files/upload
  </Card>

  <Card title="List session files" icon="list" href="/api-reference/openapi.yaml#/paths/~1v1~1event~1%7BeventId%7D~1sessions~1%7BsessionId%7D~1files/get">
    GET /v1/event/{eventId}/sessions/{sessionId}/files
  </Card>

  <Card title="Start direct upload" icon="cloud-arrow-up" href="/api-reference/openapi.yaml#/paths/~1v1~1event~1%7BeventId%7D~1sessions~1%7BsessionId%7D~1files/post">
    POST /v1/event/{eventId}/sessions/{sessionId}/files
  </Card>

  <Card title="Complete direct upload" icon="check" href="/api-reference/openapi.yaml#/paths/~1v1~1event~1%7BeventId%7D~1sessions~1%7BsessionId%7D~1files~1%7BfileId%7D~1complete/post">
    POST .../files/{fileId}/complete
  </Card>

  <Card title="Replace file bytes" icon="rotate" href="/api-reference/openapi.yaml#/paths/~1v1~1event~1%7BeventId%7D~1sessions~1%7BsessionId%7D~1files~1%7BfileId%7D~1replace/post">
    POST .../files/{fileId}/replace
  </Card>

  <Card title="Update metadata" icon="pen" href="/api-reference/openapi.yaml#/paths/~1v1~1event~1%7BeventId%7D~1sessions~1%7BsessionId%7D~1files~1%7BfileId%7D/put">
    PUT /v1/event/{eventId}/sessions/{sessionId}/files/{fileId}
  </Card>
</CardGroup>

## Response shape

File objects use the `Content` schema (`id`, `url`, `title`, `filename`, `size`, `mimetype`, assigned participant fields, timestamps). Direct-to-storage create/replace responses also include an `upload` object with `url`, `method`, and `headers` for the presigned PUT.

## Related reference

* [Uploading session files](/guides/uploading-session-files) — full playbook
* [Transcriptions & Media](/api-reference/transcriptions-and-media)
* [Authentication & scopes](/authentication)
