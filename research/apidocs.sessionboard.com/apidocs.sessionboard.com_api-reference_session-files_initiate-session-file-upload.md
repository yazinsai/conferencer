---
url: "https://apidocs.sessionboard.com/api-reference/session-files/initiate-session-file-upload"
title: "Initiate session file upload - Sessionboard API"
---

> ## Documentation Index
>
> Fetch the complete documentation index at: [/llms.txt](https://apidocs.sessionboard.com/llms.txt)
>
> Use this file to discover all available pages before exploring further.

[Skip to main content](https://apidocs.sessionboard.com/api-reference/session-files/initiate-session-file-upload#content-area)

cURL

powerpoint

```
curl --request POST \
  --url https://public-api.sessionboard.com/v1/event/{eventId}/sessions/{sessionId}/files \
  --header 'Content-Type: application/json' \
  --header 'x-access-token: <api-key>' \
  --data '
{
  "filename": "keynote-slides.pptx",
  "size_bytes": 2457600,
  "content_type": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "title": "Keynote slides"
}
'
```

201

```
{
  "data": {
    "id": "3c90c3cc-0d44-4b50-8888-8dd25736052a",
    "url": "<string>",
    "title": "<string>",
    "filename": "<string>",
    "size": 123,
    "mimetype": "<string>",
    "created_at": "2023-11-07T05:31:56Z",
    "updated_at": "2023-11-07T05:31:56Z",
    "assigned_participant_id": "3c90c3cc-0d44-4b50-8888-8dd25736052a",
    "assigned_participant_email": "jsmith@example.com",
    "assigned_participant_name": "<string>",
    "upload": {
      "url": "<string>",
      "method": "PUT",
      "headers": {
        "Content-Type": "<string>"
      }
    }
  }
}
```

POST

https://public-api.sessionboard.comhttps://public-api-eu.sessionboard.com

/

v1

/

event

/

{eventId}

/

sessions

/

{sessionId}

/

files

Try it

cURL

powerpoint

```
curl --request POST \
  --url https://public-api.sessionboard.com/v1/event/{eventId}/sessions/{sessionId}/files \
  --header 'Content-Type: application/json' \
  --header 'x-access-token: <api-key>' \
  --data '
{
  "filename": "keynote-slides.pptx",
  "size_bytes": 2457600,
  "content_type": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "title": "Keynote slides"
}
'
```

201

```
{
  "data": {
    "id": "3c90c3cc-0d44-4b50-8888-8dd25736052a",
    "url": "<string>",
    "title": "<string>",
    "filename": "<string>",
    "size": 123,
    "mimetype": "<string>",
    "created_at": "2023-11-07T05:31:56Z",
    "updated_at": "2023-11-07T05:31:56Z",
    "assigned_participant_id": "3c90c3cc-0d44-4b50-8888-8dd25736052a",
    "assigned_participant_email": "jsmith@example.com",
    "assigned_participant_name": "<string>",
    "upload": {
      "url": "<string>",
      "method": "PUT",
      "headers": {
        "Content-Type": "<string>"
      }
    }
  }
}
```

#### Authorizations

ApiKeyBearerTokenApiKeyBearerToken

[​](https://apidocs.sessionboard.com/api-reference/session-files/initiate-session-file-upload#authorization-x-access-token)

x-access-token

string

header

required

Organization API token. Generate from Organization Settings → API Tokens.

#### Path Parameters

[​](https://apidocs.sessionboard.com/api-reference/session-files/initiate-session-file-upload#parameter-event-id)

eventId

integer

required

Event ID

[​](https://apidocs.sessionboard.com/api-reference/session-files/initiate-session-file-upload#parameter-session-id)

sessionId

string<uuid>

required

Session UUID

#### Body

application/json

[​](https://apidocs.sessionboard.com/api-reference/session-files/initiate-session-file-upload#body-filename)

filename

string

required

Original filename including extension (e.g. `slides.pptx`, `handout.pdf`).

Example:

`"keynote-slides.pptx"`

[​](https://apidocs.sessionboard.com/api-reference/session-files/initiate-session-file-upload#body-size-bytes)

size\_bytes

integer

required

Exact file size in bytes. Maximum 500 MB (524288000) for direct-to-storage upload. Use `POST .../files/upload` for files up to 50 MB without specifying size.

Required range: `1 <= x <= 524288000`

[​](https://apidocs.sessionboard.com/api-reference/session-files/initiate-session-file-upload#body-content-type)

content\_type

string

MIME type. Optional; inferred from the filename extension when omitted.

Example:

`"application/vnd.openxmlformats-officedocument.presentationml.presentation"`

[​](https://apidocs.sessionboard.com/api-reference/session-files/initiate-session-file-upload#body-mimetype)

mimetype

string

Alias for `content_type`.

[​](https://apidocs.sessionboard.com/api-reference/session-files/initiate-session-file-upload#body-title)

title

string

Display title. Defaults to `filename`.

[​](https://apidocs.sessionboard.com/api-reference/session-files/initiate-session-file-upload#body-assigned-participant-id-one-of-0)

assigned\_participant\_id

string<uuid> \| null

Contact UUID of a session participant to assign this file to.

#### Response

201

application/json

Created — upload URL included

[​](https://apidocs.sessionboard.com/api-reference/session-files/initiate-session-file-upload#response-data)

data

object

A content attachment (file, document, or media) associated with a session.

Showchild attributes

Ctrl+I