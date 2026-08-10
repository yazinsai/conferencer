---
url: "https://apidocs.sessionboard.com/api-reference/agenda-planning/create-a-draft-session"
title: "Create a draft session - Sessionboard API"
---

> ## Documentation Index
>
> Fetch the complete documentation index at: [/llms.txt](https://apidocs.sessionboard.com/llms.txt)
>
> Use this file to discover all available pages before exploring further.

[Skip to main content](https://apidocs.sessionboard.com/api-reference/agenda-planning/create-a-draft-session#content-area)

Create a draft session

cURL

```
curl --request POST \
  --url https://public-api.sessionboard.com/v1/event/{eventId}/agenda-drafts/{draftId}/sessions/create \
  --header 'Content-Type: application/json' \
  --header 'x-access-token: <api-key>' \
  --data '
{
  "session_id": "3c90c3cc-0d44-4b50-8888-8dd25736052a",
  "starts_at": "2023-11-07T05:31:56Z",
  "ends_at": "2023-11-07T05:31:56Z",
  "room_id": "3c90c3cc-0d44-4b50-8888-8dd25736052a"
}
'
```

```
import requests

url = "https://public-api.sessionboard.com/v1/event/{eventId}/agenda-drafts/{draftId}/sessions/create"

payload = {
    "session_id": "3c90c3cc-0d44-4b50-8888-8dd25736052a",
    "starts_at": "2023-11-07T05:31:56Z",
    "ends_at": "2023-11-07T05:31:56Z",
    "room_id": "3c90c3cc-0d44-4b50-8888-8dd25736052a"
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
    session_id: '3c90c3cc-0d44-4b50-8888-8dd25736052a',
    starts_at: '2023-11-07T05:31:56Z',
    ends_at: '2023-11-07T05:31:56Z',
    room_id: '3c90c3cc-0d44-4b50-8888-8dd25736052a'
  })
};

fetch('https://public-api.sessionboard.com/v1/event/{eventId}/agenda-drafts/{draftId}/sessions/create', options)
  .then(res => res.json())
  .then(res => console.log(res))
  .catch(err => console.error(err));
```

```
<?php

$curl = curl_init();

curl_setopt_array($curl, [\
  CURLOPT_URL => "https://public-api.sessionboard.com/v1/event/{eventId}/agenda-drafts/{draftId}/sessions/create",\
  CURLOPT_RETURNTRANSFER => true,\
  CURLOPT_ENCODING => "",\
  CURLOPT_MAXREDIRS => 10,\
  CURLOPT_TIMEOUT => 30,\
  CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,\
  CURLOPT_CUSTOMREQUEST => "POST",\
  CURLOPT_POSTFIELDS => json_encode([\
    'session_id' => '3c90c3cc-0d44-4b50-8888-8dd25736052a',\
    'starts_at' => '2023-11-07T05:31:56Z',\
    'ends_at' => '2023-11-07T05:31:56Z',\
    'room_id' => '3c90c3cc-0d44-4b50-8888-8dd25736052a'\
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

	url := "https://public-api.sessionboard.com/v1/event/{eventId}/agenda-drafts/{draftId}/sessions/create"

	payload := strings.NewReader("{\n  \"session_id\": \"3c90c3cc-0d44-4b50-8888-8dd25736052a\",\n  \"starts_at\": \"2023-11-07T05:31:56Z\",\n  \"ends_at\": \"2023-11-07T05:31:56Z\",\n  \"room_id\": \"3c90c3cc-0d44-4b50-8888-8dd25736052a\"\n}")

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
HttpResponse<String> response = Unirest.post("https://public-api.sessionboard.com/v1/event/{eventId}/agenda-drafts/{draftId}/sessions/create")
  .header("x-access-token", "<api-key>")
  .header("Content-Type", "application/json")
  .body("{\n  \"session_id\": \"3c90c3cc-0d44-4b50-8888-8dd25736052a\",\n  \"starts_at\": \"2023-11-07T05:31:56Z\",\n  \"ends_at\": \"2023-11-07T05:31:56Z\",\n  \"room_id\": \"3c90c3cc-0d44-4b50-8888-8dd25736052a\"\n}")
  .asString();
```

```
require 'uri'
require 'net/http'

url = URI("https://public-api.sessionboard.com/v1/event/{eventId}/agenda-drafts/{draftId}/sessions/create")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true

request = Net::HTTP::Post.new(url)
request["x-access-token"] = '<api-key>'
request["Content-Type"] = 'application/json'
request.body = "{\n  \"session_id\": \"3c90c3cc-0d44-4b50-8888-8dd25736052a\",\n  \"starts_at\": \"2023-11-07T05:31:56Z\",\n  \"ends_at\": \"2023-11-07T05:31:56Z\",\n  \"room_id\": \"3c90c3cc-0d44-4b50-8888-8dd25736052a\"\n}"

response = http.request(request)
puts response.read_body
```

200

```
{
  "id": "3c90c3cc-0d44-4b50-8888-8dd25736052a",
  "draft_id": "3c90c3cc-0d44-4b50-8888-8dd25736052a",
  "session_id": "3c90c3cc-0d44-4b50-8888-8dd25736052a",
  "starts_at": "2023-11-07T05:31:56Z",
  "ends_at": "2023-11-07T05:31:56Z",
  "room_id": "3c90c3cc-0d44-4b50-8888-8dd25736052a",
  "created_at": "2023-11-07T05:31:56Z",
  "updated_at": "2023-11-07T05:31:56Z"
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

agenda-drafts

/

{draftId}

/

sessions

/

create

Try it

Create a draft session

cURL

```
curl --request POST \
  --url https://public-api.sessionboard.com/v1/event/{eventId}/agenda-drafts/{draftId}/sessions/create \
  --header 'Content-Type: application/json' \
  --header 'x-access-token: <api-key>' \
  --data '
{
  "session_id": "3c90c3cc-0d44-4b50-8888-8dd25736052a",
  "starts_at": "2023-11-07T05:31:56Z",
  "ends_at": "2023-11-07T05:31:56Z",
  "room_id": "3c90c3cc-0d44-4b50-8888-8dd25736052a"
}
'
```

```
import requests

url = "https://public-api.sessionboard.com/v1/event/{eventId}/agenda-drafts/{draftId}/sessions/create"

payload = {
    "session_id": "3c90c3cc-0d44-4b50-8888-8dd25736052a",
    "starts_at": "2023-11-07T05:31:56Z",
    "ends_at": "2023-11-07T05:31:56Z",
    "room_id": "3c90c3cc-0d44-4b50-8888-8dd25736052a"
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
    session_id: '3c90c3cc-0d44-4b50-8888-8dd25736052a',
    starts_at: '2023-11-07T05:31:56Z',
    ends_at: '2023-11-07T05:31:56Z',
    room_id: '3c90c3cc-0d44-4b50-8888-8dd25736052a'
  })
};

fetch('https://public-api.sessionboard.com/v1/event/{eventId}/agenda-drafts/{draftId}/sessions/create', options)
  .then(res => res.json())
  .then(res => console.log(res))
  .catch(err => console.error(err));
```

```
<?php

$curl = curl_init();

curl_setopt_array($curl, [\
  CURLOPT_URL => "https://public-api.sessionboard.com/v1/event/{eventId}/agenda-drafts/{draftId}/sessions/create",\
  CURLOPT_RETURNTRANSFER => true,\
  CURLOPT_ENCODING => "",\
  CURLOPT_MAXREDIRS => 10,\
  CURLOPT_TIMEOUT => 30,\
  CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,\
  CURLOPT_CUSTOMREQUEST => "POST",\
  CURLOPT_POSTFIELDS => json_encode([\
    'session_id' => '3c90c3cc-0d44-4b50-8888-8dd25736052a',\
    'starts_at' => '2023-11-07T05:31:56Z',\
    'ends_at' => '2023-11-07T05:31:56Z',\
    'room_id' => '3c90c3cc-0d44-4b50-8888-8dd25736052a'\
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

	url := "https://public-api.sessionboard.com/v1/event/{eventId}/agenda-drafts/{draftId}/sessions/create"

	payload := strings.NewReader("{\n  \"session_id\": \"3c90c3cc-0d44-4b50-8888-8dd25736052a\",\n  \"starts_at\": \"2023-11-07T05:31:56Z\",\n  \"ends_at\": \"2023-11-07T05:31:56Z\",\n  \"room_id\": \"3c90c3cc-0d44-4b50-8888-8dd25736052a\"\n}")

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
HttpResponse<String> response = Unirest.post("https://public-api.sessionboard.com/v1/event/{eventId}/agenda-drafts/{draftId}/sessions/create")
  .header("x-access-token", "<api-key>")
  .header("Content-Type", "application/json")
  .body("{\n  \"session_id\": \"3c90c3cc-0d44-4b50-8888-8dd25736052a\",\n  \"starts_at\": \"2023-11-07T05:31:56Z\",\n  \"ends_at\": \"2023-11-07T05:31:56Z\",\n  \"room_id\": \"3c90c3cc-0d44-4b50-8888-8dd25736052a\"\n}")
  .asString();
```

```
require 'uri'
require 'net/http'

url = URI("https://public-api.sessionboard.com/v1/event/{eventId}/agenda-drafts/{draftId}/sessions/create")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true

request = Net::HTTP::Post.new(url)
request["x-access-token"] = '<api-key>'
request["Content-Type"] = 'application/json'
request.body = "{\n  \"session_id\": \"3c90c3cc-0d44-4b50-8888-8dd25736052a\",\n  \"starts_at\": \"2023-11-07T05:31:56Z\",\n  \"ends_at\": \"2023-11-07T05:31:56Z\",\n  \"room_id\": \"3c90c3cc-0d44-4b50-8888-8dd25736052a\"\n}"

response = http.request(request)
puts response.read_body
```

200

```
{
  "id": "3c90c3cc-0d44-4b50-8888-8dd25736052a",
  "draft_id": "3c90c3cc-0d44-4b50-8888-8dd25736052a",
  "session_id": "3c90c3cc-0d44-4b50-8888-8dd25736052a",
  "starts_at": "2023-11-07T05:31:56Z",
  "ends_at": "2023-11-07T05:31:56Z",
  "room_id": "3c90c3cc-0d44-4b50-8888-8dd25736052a",
  "created_at": "2023-11-07T05:31:56Z",
  "updated_at": "2023-11-07T05:31:56Z"
}
```

#### Authorizations

ApiKeyBearerTokenApiKeyBearerToken

[​](https://apidocs.sessionboard.com/api-reference/agenda-planning/create-a-draft-session#authorization-x-access-token)

x-access-token

string

header

required

Organization API token. Generate from Organization Settings → API Tokens.

#### Path Parameters

[​](https://apidocs.sessionboard.com/api-reference/agenda-planning/create-a-draft-session#parameter-event-id)

eventId

integer

required

[​](https://apidocs.sessionboard.com/api-reference/agenda-planning/create-a-draft-session#parameter-draft-id)

draftId

string<uuid>

required

#### Body

application/json

[​](https://apidocs.sessionboard.com/api-reference/agenda-planning/create-a-draft-session#body-session-id)

session\_id

string<uuid>

required

[​](https://apidocs.sessionboard.com/api-reference/agenda-planning/create-a-draft-session#body-starts-at)

starts\_at

string<date-time>

[​](https://apidocs.sessionboard.com/api-reference/agenda-planning/create-a-draft-session#body-ends-at)

ends\_at

string<date-time>

[​](https://apidocs.sessionboard.com/api-reference/agenda-planning/create-a-draft-session#body-room-id)

room\_id

string<uuid>

#### Response

200

application/json

Draft session created

A session placement within an agenda draft.

[​](https://apidocs.sessionboard.com/api-reference/agenda-planning/create-a-draft-session#response-id)

id

string<uuid>

[​](https://apidocs.sessionboard.com/api-reference/agenda-planning/create-a-draft-session#response-draft-id)

draft\_id

string<uuid>

[​](https://apidocs.sessionboard.com/api-reference/agenda-planning/create-a-draft-session#response-session-id)

session\_id

string<uuid>

[​](https://apidocs.sessionboard.com/api-reference/agenda-planning/create-a-draft-session#response-starts-at)

starts\_at

string<date-time>

[​](https://apidocs.sessionboard.com/api-reference/agenda-planning/create-a-draft-session#response-ends-at)

ends\_at

string<date-time>

[​](https://apidocs.sessionboard.com/api-reference/agenda-planning/create-a-draft-session#response-room-id)

room\_id

string<uuid>

[​](https://apidocs.sessionboard.com/api-reference/agenda-planning/create-a-draft-session#response-created-at)

created\_at

string<date-time>

[​](https://apidocs.sessionboard.com/api-reference/agenda-planning/create-a-draft-session#response-updated-at)

updated\_at

string<date-time>

Ctrl+I