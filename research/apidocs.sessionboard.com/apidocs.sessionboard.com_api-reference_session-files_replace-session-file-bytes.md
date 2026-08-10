---
url: "https://apidocs.sessionboard.com/api-reference/session-files/replace-session-file-bytes"
title: "Replace session file bytes - Sessionboard API"
---

> ## Documentation Index
>
> Fetch the complete documentation index at: [/llms.txt](https://apidocs.sessionboard.com/llms.txt)
>
> Use this file to discover all available pages before exploring further.

[Skip to main content](https://apidocs.sessionboard.com/api-reference/session-files/replace-session-file-bytes#content-area)

Replace session file bytes

cURL

```
curl --request POST \
  --url https://public-api.sessionboard.com/v1/event/{eventId}/sessions/{sessionId}/files/{fileId}/replace \
  --header 'Content-Type: application/json' \
  --header 'x-access-token: <api-key>' \
  --data '
{
  "filename": "keynote-slides.pptx",
  "size_bytes": 262144000,
  "content_type": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "mimetype": "<string>",
  "title": "<string>",
  "assigned_participant_id": "3c90c3cc-0d44-4b50-8888-8dd25736052a"
}
'
```

```
import requests

url = "https://public-api.sessionboard.com/v1/event/{eventId}/sessions/{sessionId}/files/{fileId}/replace"

payload = {
    "filename": "keynote-slides.pptx",
    "size_bytes": 262144000,
    "content_type": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "mimetype": "<string>",
    "title": "<string>",
    "assigned_participant_id": "3c90c3cc-0d44-4b50-8888-8dd25736052a"
}
headers = {
    "x-access-token": "<api-key>",
    "Content-Type": "application/json"
}

response = requests.post(url, json=payload, headers=headers)

print(response.text)
```

```
const options = {
  method: 'POST',
  headers: {'x-access-token': '<api-key>', 'Content-Type': 'application/json'},
  body: JSON.stringify({
    filename: 'keynote-slides.pptx',
    size_bytes: 262144000,
    content_type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    mimetype: '<string>',
    title: '<string>',
    assigned_participant_id: '3c90c3cc-0d44-4b50-8888-8dd25736052a'
  })
};

fetch('https://public-api.sessionboard.com/v1/event/{eventId}/sessions/{sessionId}/files/{fileId}/replace', options)
  .then(res => res.json())
  .then(res => console.log(res))
  .catch(err => console.error(err));
```

```
<?php

$curl = curl_init();

curl_setopt_array($curl, [\
  CURLOPT_URL => "https://public-api.sessionboard.com/v1/event/{eventId}/sessions/{sessionId}/files/{fileId}/replace",\
  CURLOPT_RETURNTRANSFER => true,\
  CURLOPT_ENCODING => "",\
  CURLOPT_MAXREDIRS => 10,\
  CURLOPT_TIMEOUT => 30,\
  CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,\
  CURLOPT_CUSTOMREQUEST => "POST",\
  CURLOPT_POSTFIELDS => json_encode([\
    'filename' => 'keynote-slides.pptx',\
    'size_bytes' => 262144000,\
    'content_type' => 'application/vnd.openxmlformats-officedocument.presentationml.presentation',\
    'mimetype' => '<string>',\
    'title' => '<string>',\
    'assigned_participant_id' => '3c90c3cc-0d44-4b50-8888-8dd25736052a'\
  ]),\
  CURLOPT_HTTPHEADER => [\
    "Content-Type: application/json",\
    "x-access-token: <api-key>"\
  ],\
]);

$response = curl_exec($curl);
$err = curl_error($curl);

curl_close($curl);

if ($err) {
  echo "cURL Error #:" . $err;
} else {
  echo $response;
}
```

```
package main

import (
	"fmt"
	"strings"
	"net/http"
	"io"
)

func main() {

	url := "https://public-api.sessionboard.com/v1/event/{eventId}/sessions/{sessionId}/files/{fileId}/replace"

	payload := strings.NewReader("{\n  \"filename\": \"keynote-slides.pptx\",\n  \"size_bytes\": 262144000,\n  \"content_type\": \"application/vnd.openxmlformats-officedocument.presentationml.presentation\",\n  \"mimetype\": \"<string>\",\n  \"title\": \"<string>\",\n  \"assigned_participant_id\": \"3c90c3cc-0d44-4b50-8888-8dd25736052a\"\n}")

	req, _ := http.NewRequest("POST", url, payload)

	req.Header.Add("x-access-token", "<api-key>")
	req.Header.Add("Content-Type", "application/json")

	res, _ := http.DefaultClient.Do(req)

	defer res.Body.Close()
	body, _ := io.ReadAll(res.Body)

	fmt.Println(string(body))

}
```

```
HttpResponse<String> response = Unirest.post("https://public-api.sessionboard.com/v1/event/{eventId}/sessions/{sessionId}/files/{fileId}/replace")
  .header("x-access-token", "<api-key>")
  .header("Content-Type", "application/json")
  .body("{\n  \"filename\": \"keynote-slides.pptx\",\n  \"size_bytes\": 262144000,\n  \"content_type\": \"application/vnd.openxmlformats-officedocument.presentationml.presentation\",\n  \"mimetype\": \"<string>\",\n  \"title\": \"<string>\",\n  \"assigned_participant_id\": \"3c90c3cc-0d44-4b50-8888-8dd25736052a\"\n}")
  .asString();
```

```
require 'uri'
require 'net/http'

url = URI("https://public-api.sessionboard.com/v1/event/{eventId}/sessions/{sessionId}/files/{fileId}/replace")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true

request = Net::HTTP::Post.new(url)
request["x-access-token"] = '<api-key>'
request["Content-Type"] = 'application/json'
request.body = "{\n  \"filename\": \"keynote-slides.pptx\",\n  \"size_bytes\": 262144000,\n  \"content_type\": \"application/vnd.openxmlformats-officedocument.presentationml.presentation\",\n  \"mimetype\": \"<string>\",\n  \"title\": \"<string>\",\n  \"assigned_participant_id\": \"3c90c3cc-0d44-4b50-8888-8dd25736052a\"\n}"

response = http.request(request)
puts response.read_body
```

200

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

/

{fileId}

/

replace

Try it

Replace session file bytes

cURL

```
curl --request POST \
  --url https://public-api.sessionboard.com/v1/event/{eventId}/sessions/{sessionId}/files/{fileId}/replace \
  --header 'Content-Type: application/json' \
  --header 'x-access-token: <api-key>' \
  --data '
{
  "filename": "keynote-slides.pptx",
  "size_bytes": 262144000,
  "content_type": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "mimetype": "<string>",
  "title": "<string>",
  "assigned_participant_id": "3c90c3cc-0d44-4b50-8888-8dd25736052a"
}
'
```

```
import requests

url = "https://public-api.sessionboard.com/v1/event/{eventId}/sessions/{sessionId}/files/{fileId}/replace"

payload = {
    "filename": "keynote-slides.pptx",
    "size_bytes": 262144000,
    "content_type": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "mimetype": "<string>",
    "title": "<string>",
    "assigned_participant_id": "3c90c3cc-0d44-4b50-8888-8dd25736052a"
}
headers = {
    "x-access-token": "<api-key>",
    "Content-Type": "application/json"
}

response = requests.post(url, json=payload, headers=headers)

print(response.text)
```

```
const options = {
  method: 'POST',
  headers: {'x-access-token': '<api-key>', 'Content-Type': 'application/json'},
  body: JSON.stringify({
    filename: 'keynote-slides.pptx',
    size_bytes: 262144000,
    content_type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    mimetype: '<string>',
    title: '<string>',
    assigned_participant_id: '3c90c3cc-0d44-4b50-8888-8dd25736052a'
  })
};

fetch('https://public-api.sessionboard.com/v1/event/{eventId}/sessions/{sessionId}/files/{fileId}/replace', options)
  .then(res => res.json())
  .then(res => console.log(res))
  .catch(err => console.error(err));
```

```
<?php

$curl = curl_init();

curl_setopt_array($curl, [\
  CURLOPT_URL => "https://public-api.sessionboard.com/v1/event/{eventId}/sessions/{sessionId}/files/{fileId}/replace",\
  CURLOPT_RETURNTRANSFER => true,\
  CURLOPT_ENCODING => "",\
  CURLOPT_MAXREDIRS => 10,\
  CURLOPT_TIMEOUT => 30,\
  CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,\
  CURLOPT_CUSTOMREQUEST => "POST",\
  CURLOPT_POSTFIELDS => json_encode([\
    'filename' => 'keynote-slides.pptx',\
    'size_bytes' => 262144000,\
    'content_type' => 'application/vnd.openxmlformats-officedocument.presentationml.presentation',\
    'mimetype' => '<string>',\
    'title' => '<string>',\
    'assigned_participant_id' => '3c90c3cc-0d44-4b50-8888-8dd25736052a'\
  ]),\
  CURLOPT_HTTPHEADER => [\
    "Content-Type: application/json",\
    "x-access-token: <api-key>"\
  ],\
]);

$response = curl_exec($curl);
$err = curl_error($curl);

curl_close($curl);

if ($err) {
  echo "cURL Error #:" . $err;
} else {
  echo $response;
}
```

```
package main

import (
	"fmt"
	"strings"
	"net/http"
	"io"
)

func main() {

	url := "https://public-api.sessionboard.com/v1/event/{eventId}/sessions/{sessionId}/files/{fileId}/replace"

	payload := strings.NewReader("{\n  \"filename\": \"keynote-slides.pptx\",\n  \"size_bytes\": 262144000,\n  \"content_type\": \"application/vnd.openxmlformats-officedocument.presentationml.presentation\",\n  \"mimetype\": \"<string>\",\n  \"title\": \"<string>\",\n  \"assigned_participant_id\": \"3c90c3cc-0d44-4b50-8888-8dd25736052a\"\n}")

	req, _ := http.NewRequest("POST", url, payload)

	req.Header.Add("x-access-token", "<api-key>")
	req.Header.Add("Content-Type", "application/json")

	res, _ := http.DefaultClient.Do(req)

	defer res.Body.Close()
	body, _ := io.ReadAll(res.Body)

	fmt.Println(string(body))

}
```

```
HttpResponse<String> response = Unirest.post("https://public-api.sessionboard.com/v1/event/{eventId}/sessions/{sessionId}/files/{fileId}/replace")
  .header("x-access-token", "<api-key>")
  .header("Content-Type", "application/json")
  .body("{\n  \"filename\": \"keynote-slides.pptx\",\n  \"size_bytes\": 262144000,\n  \"content_type\": \"application/vnd.openxmlformats-officedocument.presentationml.presentation\",\n  \"mimetype\": \"<string>\",\n  \"title\": \"<string>\",\n  \"assigned_participant_id\": \"3c90c3cc-0d44-4b50-8888-8dd25736052a\"\n}")
  .asString();
```

```
require 'uri'
require 'net/http'

url = URI("https://public-api.sessionboard.com/v1/event/{eventId}/sessions/{sessionId}/files/{fileId}/replace")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true

request = Net::HTTP::Post.new(url)
request["x-access-token"] = '<api-key>'
request["Content-Type"] = 'application/json'
request.body = "{\n  \"filename\": \"keynote-slides.pptx\",\n  \"size_bytes\": 262144000,\n  \"content_type\": \"application/vnd.openxmlformats-officedocument.presentationml.presentation\",\n  \"mimetype\": \"<string>\",\n  \"title\": \"<string>\",\n  \"assigned_participant_id\": \"3c90c3cc-0d44-4b50-8888-8dd25736052a\"\n}"

response = http.request(request)
puts response.read_body
```

200

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

[​](https://apidocs.sessionboard.com/api-reference/session-files/replace-session-file-bytes#authorization-x-access-token)

x-access-token

string

header

required

Organization API token. Generate from Organization Settings → API Tokens.

#### Path Parameters

[​](https://apidocs.sessionboard.com/api-reference/session-files/replace-session-file-bytes#parameter-event-id)

eventId

integer

required

Event ID

[​](https://apidocs.sessionboard.com/api-reference/session-files/replace-session-file-bytes#parameter-session-id)

sessionId

string<uuid>

required

Session UUID

[​](https://apidocs.sessionboard.com/api-reference/session-files/replace-session-file-bytes#parameter-file-id)

fileId

string<uuid>

required

Session file (Content) UUID

#### Body

application/json

[​](https://apidocs.sessionboard.com/api-reference/session-files/replace-session-file-bytes#body-filename)

filename

string

required

Original filename including extension (e.g. `slides.pptx`, `handout.pdf`).

Example:

`"keynote-slides.pptx"`

[​](https://apidocs.sessionboard.com/api-reference/session-files/replace-session-file-bytes#body-size-bytes)

size\_bytes

integer

required

Exact file size in bytes. Maximum 500 MB (524288000) for direct-to-storage upload. Use `POST .../files/upload` for files up to 50 MB without specifying size.

Required range: `1 <= x <= 524288000`

[​](https://apidocs.sessionboard.com/api-reference/session-files/replace-session-file-bytes#body-content-type)

content\_type

string

MIME type. Optional; inferred from the filename extension when omitted.

Example:

`"application/vnd.openxmlformats-officedocument.presentationml.presentation"`

[​](https://apidocs.sessionboard.com/api-reference/session-files/replace-session-file-bytes#body-mimetype)

mimetype

string

Alias for `content_type`.

[​](https://apidocs.sessionboard.com/api-reference/session-files/replace-session-file-bytes#body-title)

title

string

Display title. Defaults to `filename`.

[​](https://apidocs.sessionboard.com/api-reference/session-files/replace-session-file-bytes#body-assigned-participant-id-one-of-0)

assigned\_participant\_id

string<uuid> \| null

Contact UUID of a session participant to assign this file to.

#### Response

200

application/json

OK — new upload URL included

[​](https://apidocs.sessionboard.com/api-reference/session-files/replace-session-file-bytes#response-data)

data

object

A content attachment (file, document, or media) associated with a session.

Showchild attributes

Ctrl+I