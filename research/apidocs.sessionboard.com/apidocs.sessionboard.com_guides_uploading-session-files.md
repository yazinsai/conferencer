---
url: "https://apidocs.sessionboard.com/guides/uploading-session-files"
title: "Uploading session files - Sessionboard API"
---

> ## Documentation Index
>
> Fetch the complete documentation index at: [/llms.txt](https://apidocs.sessionboard.com/llms.txt)
>
> Use this file to discover all available pages before exploring further.

[Skip to main content](https://apidocs.sessionboard.com/guides/uploading-session-files#content-area)

Use this guide to upload documents to a session — the same Session Files you manage in the admin UI and speaker portal (slides, handouts, PDFs, and similar).

This is **not** the media or recording upload flow. Use [Media & Transcriptions](https://apidocs.sessionboard.com/guides/uploading-media-and-transcriptions) for video/audio that should be transcribed or stored as session recordings.

## [​](https://apidocs.sessionboard.com/guides/uploading-session-files\#pick-your-upload-path)  Pick your upload path

- Simple upload (≤ 50 MB)

- Direct to storage (> 50 MB)


**Best for:** most integrations — one API call, no S3 steps. Sessionboard detects file size and MIME type from the bytes you send.

|  |  |
| --- | --- |
| **Endpoint** | `POST /v1/event/{eventId}/sessions/{sessionId}/files/upload` |
| **Max size** | **50 MB** |
| **Scope** | `write:sessions` |

Optional form fields: `title`, `assigned_participant_id` (contact UUID on the session).

1

Upload the file

```
POST /v1/event/{eventId}/sessions/{sessionId}/files/upload
Content-Type: multipart/form-data
X-Access-Token: {your-token}
```

**curl**

```
curl -X POST "https://public-api.sessionboard.com/v1/event/{eventId}/sessions/{sessionId}/files/upload" \
  -H "X-Access-Token: $TOKEN" \
  -F "file=@handout.pdf" \
  -F "title=Session handout"
```

**Node.js (form-data)**

```
import fs from 'node:fs';
import FormData from 'form-data';

const form = new FormData();
form.append('file', fs.createReadStream('./handout.pdf'));
form.append('title', 'Session handout');

const res = await fetch(uploadUrl, {
  method: 'POST',
  headers: { 'X-Access-Token': token, ...form.getHeaders() },
  body: form
});
```

The multipart field name must be **`file`**. You do **not** send `filename`, `size_bytes`, or `content_type` — Sessionboard infers them from the upload.

2

Use the response

On success (`201`) you get the finalized file `Content` object — same shape as after the direct-to-storage **complete** step:

```
{
  "data": {
    "id": "a1b2c3d4-....",
    "filename": "handout.pdf",
    "title": "Session handout",
    "size": 512000,
    "mimetype": "application/pdf",
    "url": "https://content.sessionboard.com/..."
  }
}
```

Security scanning runs before the response is returned. No follow-up call is required.

3

Confirm (optional)

```
GET /v1/event/{eventId}/sessions/{sessionId}/files
```

**Best for:** files **larger than 50 MB** (up to **500 MB**), or when you prefer uploading bytes straight to Sessionboard storage (same pattern as [session recordings](https://apidocs.sessionboard.com/guides/uploading-media-and-transcriptions#playbook-3-%E2%80%94-upload-session-audio)).

|  |  |
| --- | --- |
| **Flow** | create → PUT to signed URL → complete |
| **Max size** | **500 MB** |
| **Scope** | `write:sessions` |

1

Start the upload

```
POST /v1/event/{eventId}/sessions/{sessionId}/files
Content-Type: application/json
```

```
{
  "filename": "large-deck.pptx",
  "size_bytes": 52428800,
  "title": "Full slide archive"
}
```

`size_bytes` must match the file on disk. `content_type` is optional — inferred from the filename when omitted.Response includes `data.id` and `data.upload.url` for the next step.

2

PUT the file bytes

Upload the raw file to `data.upload.url` with the `Content-Type` from `data.upload.headers`. Do **not** send your API token to the storage URL.

3

Mark complete

```
POST /v1/event/{eventId}/sessions/{sessionId}/files/{fileId}/complete
```

Sessionboard verifies the object, scans the bytes, and attaches the file.

* * *

## [​](https://apidocs.sessionboard.com/guides/uploading-session-files\#before-you-begin)  Before you begin

- API token with **`write:sessions`** (list/read also needs **`read:sessions`** when your token uses explicit scopes)
- Your `{eventId}` and `{sessionId}`

Send your token on every API request:

```
X-Access-Token: {your-token}
```

### [​](https://apidocs.sessionboard.com/guides/uploading-session-files\#common-file-types)  Common file types

| Kind | Examples |
| --- | --- |
| Documents | PDF, DOC, DOCX |
| Presentations | PPT, PPTX |
| Spreadsheets | XLS, XLSX |
| Images | PNG, JPG, GIF, WEBP, SVG |

Executable and installer files (for example `.exe`, `.msi`, `.dmg`, `.sh`) are rejected on all paths.

* * *

## [​](https://apidocs.sessionboard.com/guides/uploading-session-files\#update-metadata)  Update metadata

Change the display title or assigned participant without re-uploading:

```
PUT /v1/event/{eventId}/sessions/{sessionId}/files/{fileId}
Content-Type: application/json
```

```
{
  "title": "Updated slide deck",
  "assigned_participant_id": "contact-uuid-or-null"
}
```

* * *

## [​](https://apidocs.sessionboard.com/guides/uploading-session-files\#replace-or-delete)  Replace or delete

**Replace** (direct-to-storage flow only today): `POST .../files/{fileId}/replace` → PUT bytes → `POST .../complete`.**Delete:**`DELETE .../files/{fileId}` → `204 No Content`.

* * *

## [​](https://apidocs.sessionboard.com/guides/uploading-session-files\#common-errors)  Common errors

| Situation | What you’ll see |
| --- | --- |
| Simple upload over 50 MB | `400` — use direct-to-storage flow |
| Direct create over 500 MB | `400` — file too large |
| Missing multipart `file` field | `400``VALIDATION_ERROR` |
| Missing `filename` / `size_bytes` (direct create) | `400``VALIDATION_ERROR` |
| Executable / installer type | `400` — file type not allowed |
| Called **complete** before PUT | `400` — upload not found in storage |
| Missing `write:sessions` | `403` |
| Unknown `fileId` / session | `404` |

* * *

## [​](https://apidocs.sessionboard.com/guides/uploading-session-files\#scopes-quick-reference)  Scopes quick reference

| Action | Scope |
| --- | --- |
| List files | `read:sessions` |
| Upload / create / complete / replace / update / delete | `write:sessions` |

## [​](https://apidocs.sessionboard.com/guides/uploading-session-files\#related-reference)  Related reference

- [Session Files API overview](https://apidocs.sessionboard.com/api-reference/session-files)
- [Transcriptions & Media](https://apidocs.sessionboard.com/api-reference/transcriptions-and-media)
- [Authentication & scopes](https://apidocs.sessionboard.com/authentication)

⌘I