---
url: "https://apidocs.sessionboard.com/api-reference/session-files"
title: "Session Files - Sessionboard API"
---

> ## Documentation Index
>
> Fetch the complete documentation index at: [/llms.txt](https://apidocs.sessionboard.com/llms.txt)
>
> Use this file to discover all available pages before exploring further.

[Skip to main content](https://apidocs.sessionboard.com/api-reference/session-files#content-area)

For step-by-step integration flows, start with the [Uploading session files](https://apidocs.sessionboard.com/guides/uploading-session-files) guide.

Session files are **not** the media or recording upload flow. Use [Media & Transcriptions](https://apidocs.sessionboard.com/guides/uploading-media-and-transcriptions) for video/audio that should be transcribed or stored as session recordings.

## [​](https://apidocs.sessionboard.com/api-reference/session-files\#upload-paths)  Upload paths

- Simple (≤ 50 MB)

- Direct to storage (≤ 500 MB)


One multipart call — Sessionboard detects size and MIME type, scans the file, and returns the attached `Content` object.

1. `POST .../files/upload` with multipart field **`file`**
2. Optional form fields: `title`, `assigned_participant_id`

Presigned URL flow for larger files or clients that prefer direct-to-S3 upload:

1. `POST .../files` — JSON with `filename` and `size_bytes`
2. `PUT` bytes to `data.upload.url`
3. `POST .../files/{fileId}/complete`

## [​](https://apidocs.sessionboard.com/api-reference/session-files\#scopes)  Scopes

| Action | Scope |
| --- | --- |
| List files | `read:sessions` |
| Upload / create / complete / replace / update / delete | `write:sessions` |

## [​](https://apidocs.sessionboard.com/api-reference/session-files\#endpoints)  Endpoints

[**Simple upload** \\
\\
POST /v1/event//sessions//files/upload](https://apidocs.sessionboard.com/api-reference/openapi.yaml#/paths/~1v1~1event~1%7BeventId%7D~1sessions~1%7BsessionId%7D~1files~1upload/post)

[**List session files** \\
\\
GET /v1/event//sessions//files](https://apidocs.sessionboard.com/api-reference/openapi.yaml#/paths/~1v1~1event~1%7BeventId%7D~1sessions~1%7BsessionId%7D~1files/get)

[**Start direct upload** \\
\\
POST /v1/event//sessions//files](https://apidocs.sessionboard.com/api-reference/openapi.yaml#/paths/~1v1~1event~1%7BeventId%7D~1sessions~1%7BsessionId%7D~1files/post)

[**Complete direct upload** \\
\\
POST …/files//complete](https://apidocs.sessionboard.com/api-reference/openapi.yaml#/paths/~1v1~1event~1%7BeventId%7D~1sessions~1%7BsessionId%7D~1files~1%7BfileId%7D~1complete/post)

[**Replace file bytes** \\
\\
POST …/files//replace](https://apidocs.sessionboard.com/api-reference/openapi.yaml#/paths/~1v1~1event~1%7BeventId%7D~1sessions~1%7BsessionId%7D~1files~1%7BfileId%7D~1replace/post)

[**Update metadata** \\
\\
PUT /v1/event//sessions//files/](https://apidocs.sessionboard.com/api-reference/openapi.yaml#/paths/~1v1~1event~1%7BeventId%7D~1sessions~1%7BsessionId%7D~1files~1%7BfileId%7D/put)

## [​](https://apidocs.sessionboard.com/api-reference/session-files\#response-shape)  Response shape

File objects use the `Content` schema (`id`, `url`, `title`, `filename`, `size`, `mimetype`, assigned participant fields, timestamps). Direct-to-storage create/replace responses also include an `upload` object with `url`, `method`, and `headers` for the presigned PUT.

## [​](https://apidocs.sessionboard.com/api-reference/session-files\#related-reference)  Related reference

- [Uploading session files](https://apidocs.sessionboard.com/guides/uploading-session-files) — full playbook
- [Transcriptions & Media](https://apidocs.sessionboard.com/api-reference/transcriptions-and-media)
- [Authentication & scopes](https://apidocs.sessionboard.com/authentication)

Ctrl+I