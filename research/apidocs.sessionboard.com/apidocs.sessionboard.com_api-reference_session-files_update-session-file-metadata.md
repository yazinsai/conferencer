---
url: "https://apidocs.sessionboard.com/api-reference/session-files/update-session-file-metadata"
title: "Update session file metadata - Sessionboard API"
---

> ## Documentation Index
>
> Fetch the complete documentation index at: [/llms.txt](https://apidocs.sessionboard.com/llms.txt)
>
> Use this file to discover all available pages before exploring further.

[Skip to main content](https://apidocs.sessionboard.com/api-reference/session-files/update-session-file-metadata#content-area)

Update session file metadata

cURL

```
curl --request PUT \
  --url https://public-api.sessionboard.com/v1/event/{eventId}/sessions/{sessionId}/files/{fileId} \
  --header 'Content-Type: application/json' \
  --header 'x-access-token: <api-key>' \
  --data '
{
  "title": "<string>",
  "assigned_participant_id": "3c90c3cc-0d44-4b50-8888-8dd25736052a"
}
'
```

```
import requests

url = "https://public-api.sessionboard.com/v1/event/{eventId}/sessions/{sessionId}/files/{fileId}"

payload = {
    "title": "<string>",
    "assigned_participant_id": "3c90c3cc-0d44-4b50-8888-8dd25736052a"
}
headers = {
    "x-access-token": "<api-key>",
    "Content-Type": "application/json"
}

response = requests.put(url, json=payload, headers=headers)

print(response.text)
```

```
const options = {
  method: 'PUT',
  headers: {'x-access-token': '<api-key>', 'Content-Type': 'application/json'},
  body: JSON.stringify({
    title: '<string>',
    assigned_participant_id: '3c90c3cc-0d44-4b50-8888-8dd25736052a'
  })
};

fetch('https://public-api.sessionboard.com/v1/event/{eventId}/sessions/{sessionId}/files/{fileId}', options)
  .then(res => res.json())
  .then(res => console.log(res))
  .catch(err => console.error(err));
```

```
<?php

$curl = curl_init();

curl_setopt_array($curl, [\
  CURLOPT_URL => "https://public-api.sessionboard.com/v1/event/{eventId}/sessions/{sessionId}/files/{fileId}",\
  CURLOPT_RETURNTRANSFER => true,\
  CURLOPT_ENCODING => "",\
  CURLOPT_MAXREDIRS => 10,\
  CURLOPT_TIMEOUT => 30,\
  CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,\
  CURLOPT_CUSTOMREQUEST => "PUT",\
  CURLOPT_POSTFIELDS => json_encode([\
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

	url := "https://public-api.sessionboard.com/v1/event/{eventId}/sessions/{sessionId}/files/{fileId}"

	payload := strings.NewReader("{\n  \"title\": \"<string>\",\n  \"assigned_participant_id\": \"3c90c3cc-0d44-4b50-8888-8dd25736052a\"\n}")

	req, _ := http.NewRequest("PUT", url, payload)

	req.Header.Add("x-access-token", "<api-key>")
	req.Header.Add("Content-Type", "application/json")

	res, _ := http.DefaultClient.Do(req)

	defer res.Body.Close()
	body, _ := io.ReadAll(res.Body)

	fmt.Println(string(body))

}
```

```
HttpResponse<String> response = Unirest.put("https://public-api.sessionboard.com/v1/event/{eventId}/sessions/{sessionId}/files/{fileId}")
  .header("x-access-token", "<api-key>")
  .header("Content-Type", "application/json")
  .body("{\n  \"title\": \"<string>\",\n  \"assigned_participant_id\": \"3c90c3cc-0d44-4b50-8888-8dd25736052a\"\n}")
  .asString();
```

```
require 'uri'
require 'net/http'

url = URI("https://public-api.sessionboard.com/v1/event/{eventId}/sessions/{sessionId}/files/{fileId}")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true

request = Net::HTTP::Put.new(url)
request["x-access-token"] = '<api-key>'
request["Content-Type"] = 'application/json'
request.body = "{\n  \"title\": \"<string>\",\n  \"assigned_participant_id\": \"3c90c3cc-0d44-4b50-8888-8dd25736052a\"\n}"

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
    "assigned_participant_name": "<string>"
  }
}
```

PUT

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

Try it

Update session file metadata

cURL

```
curl --request PUT \
  --url https://public-api.sessionboard.com/v1/event/{eventId}/sessions/{sessionId}/files/{fileId} \
  --header 'Content-Type: application/json' \
  --header 'x-access-token: <api-key>' \
  --data '
{
  "title": "<string>",
  "assigned_participant_id": "3c90c3cc-0d44-4b50-8888-8dd25736052a"
}
'
```

```
import requests

url = "https://public-api.sessionboard.com/v1/event/{eventId}/sessions/{sessionId}/files/{fileId}"

payload = {
    "title": "<string>",
    "assigned_participant_id": "3c90c3cc-0d44-4b50-8888-8dd25736052a"
}
headers = {
    "x-access-token": "<api-key>",
    "Content-Type": "application/json"
}

response = requests.put(url, json=payload, headers=headers)

print(response.text)
```

```
const options = {
  method: 'PUT',
  headers: {'x-access-token': '<api-key>', 'Content-Type': 'application/json'},
  body: JSON.stringify({
    title: '<string>',
    assigned_participant_id: '3c90c3cc-0d44-4b50-8888-8dd25736052a'
  })
};

fetch('https://public-api.sessionboard.com/v1/event/{eventId}/sessions/{sessionId}/files/{fileId}', options)
  .then(res => res.json())
  .then(res => console.log(res))
  .catch(err => console.error(err));
```

```
<?php

$curl = curl_init();

curl_setopt_array($curl, [\
  CURLOPT_URL => "https://public-api.sessionboard.com/v1/event/{eventId}/sessions/{sessionId}/files/{fileId}",\
  CURLOPT_RETURNTRANSFER => true,\
  CURLOPT_ENCODING => "",\
  CURLOPT_MAXREDIRS => 10,\
  CURLOPT_TIMEOUT => 30,\
  CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,\
  CURLOPT_CUSTOMREQUEST => "PUT",\
  CURLOPT_POSTFIELDS => json_encode([\
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

	url := "https://public-api.sessionboard.com/v1/event/{eventId}/sessions/{sessionId}/files/{fileId}"

	payload := strings.NewReader("{\n  \"title\": \"<string>\",\n  \"assigned_participant_id\": \"3c90c3cc-0d44-4b50-8888-8dd25736052a\"\n}")

	req, _ := http.NewRequest("PUT", url, payload)

	req.Header.Add("x-access-token", "<api-key>")
	req.Header.Add("Content-Type", "application/json")

	res, _ := http.DefaultClient.Do(req)

	defer res.Body.Close()
	body, _ := io.ReadAll(res.Body)

	fmt.Println(string(body))

}
```

```
HttpResponse<String> response = Unirest.put("https://public-api.sessionboard.com/v1/event/{eventId}/sessions/{sessionId}/files/{fileId}")
  .header("x-access-token", "<api-key>")
  .header("Content-Type", "application/json")
  .body("{\n  \"title\": \"<string>\",\n  \"assigned_participant_id\": \"3c90c3cc-0d44-4b50-8888-8dd25736052a\"\n}")
  .asString();
```

```
require 'uri'
require 'net/http'

url = URI("https://public-api.sessionboard.com/v1/event/{eventId}/sessions/{sessionId}/files/{fileId}")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true

request = Net::HTTP::Put.new(url)
request["x-access-token"] = '<api-key>'
request["Content-Type"] = 'application/json'
request.body = "{\n  \"title\": \"<string>\",\n  \"assigned_participant_id\": \"3c90c3cc-0d44-4b50-8888-8dd25736052a\"\n}"

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
    "assigned_participant_name": "<string>"
  }
}
```

#### Authorizations

ApiKeyBearerTokenApiKeyBearerToken

[​](https://apidocs.sessionboard.com/api-reference/session-files/update-session-file-metadata#authorization-x-access-token)

x-access-token

string

header

required

Organization API token. Generate from Organization Settings → API Tokens.

#### Path Parameters

[​](https://apidocs.sessionboard.com/api-reference/session-files/update-session-file-metadata#parameter-event-id)

eventId

integer

required

Event ID

[​](https://apidocs.sessionboard.com/api-reference/session-files/update-session-file-metadata#parameter-session-id)

sessionId

string<uuid>

required

Session UUID

[​](https://apidocs.sessionboard.com/api-reference/session-files/update-session-file-metadata#parameter-file-id)

fileId

string<uuid>

required

Session file (Content) UUID

#### Body

application/json

[​](https://apidocs.sessionboard.com/api-reference/session-files/update-session-file-metadata#body-title-one-of-0)

title

string \| null

[​](https://apidocs.sessionboard.com/api-reference/session-files/update-session-file-metadata#body-assigned-participant-id-one-of-0)

assigned\_participant\_id

string<uuid> \| null

#### Response

200

application/json

OK

[​](https://apidocs.sessionboard.com/api-reference/session-files/update-session-file-metadata#response-data)

data

object

A content attachment (file, document, or media) associated with a session.

Showchild attributes

Ctrl+I