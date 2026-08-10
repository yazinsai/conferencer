---
url: "https://apidocs.sessionboard.com/api-reference/agenda-planning/list-draft-sessions"
title: "List draft sessions - Sessionboard API"
---

> ## Documentation Index
>
> Fetch the complete documentation index at: [/llms.txt](https://apidocs.sessionboard.com/llms.txt)
>
> Use this file to discover all available pages before exploring further.

[Skip to main content](https://apidocs.sessionboard.com/api-reference/agenda-planning/list-draft-sessions#content-area)

List draft sessions

cURL

```
curl --request GET \
  --url https://public-api.sessionboard.com/v1/event/{eventId}/agenda-drafts/{draftId}/sessions \
  --header 'x-access-token: <api-key>'
```

```
import requests

url = "https://public-api.sessionboard.com/v1/event/{eventId}/agenda-drafts/{draftId}/sessions"

headers = {"x-access-token": "<api-key>"}

response = requests.get(url, headers=headers)

print(response.text)
```

```
const options = {method: 'GET', headers: {'x-access-token': '<api-key>'}};

fetch('https://public-api.sessionboard.com/v1/event/{eventId}/agenda-drafts/{draftId}/sessions', options)
  .then(res => res.json())
  .then(res => console.log(res))
  .catch(err => console.error(err));
```

```
<?php

$curl = curl_init();

curl_setopt_array($curl, [\
  CURLOPT_URL => "https://public-api.sessionboard.com/v1/event/{eventId}/agenda-drafts/{draftId}/sessions",\
  CURLOPT_RETURNTRANSFER => true,\
  CURLOPT_ENCODING => "",\
  CURLOPT_MAXREDIRS => 10,\
  CURLOPT_TIMEOUT => 30,\
  CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,\
  CURLOPT_CUSTOMREQUEST => "GET",\
  CURLOPT_HTTPHEADER => [\
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
	"net/http"
	"io"
)

func main() {

	url := "https://public-api.sessionboard.com/v1/event/{eventId}/agenda-drafts/{draftId}/sessions"

	req, _ := http.NewRequest("GET", url, nil)

	req.Header.Add("x-access-token", "<api-key>")

	res, _ := http.DefaultClient.Do(req)

	defer res.Body.Close()
	body, _ := io.ReadAll(res.Body)

	fmt.Println(string(body))

}
```

```
HttpResponse<String> response = Unirest.get("https://public-api.sessionboard.com/v1/event/{eventId}/agenda-drafts/{draftId}/sessions")
  .header("x-access-token", "<api-key>")
  .asString();
```

```
require 'uri'
require 'net/http'

url = URI("https://public-api.sessionboard.com/v1/event/{eventId}/agenda-drafts/{draftId}/sessions")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true

request = Net::HTTP::Get.new(url)
request["x-access-token"] = '<api-key>'

response = http.request(request)
puts response.read_body
```

200

```
[\
  {\
    "id": "3c90c3cc-0d44-4b50-8888-8dd25736052a",\
    "draft_id": "3c90c3cc-0d44-4b50-8888-8dd25736052a",\
    "session_id": "3c90c3cc-0d44-4b50-8888-8dd25736052a",\
    "starts_at": "2023-11-07T05:31:56Z",\
    "ends_at": "2023-11-07T05:31:56Z",\
    "room_id": "3c90c3cc-0d44-4b50-8888-8dd25736052a",\
    "created_at": "2023-11-07T05:31:56Z",\
    "updated_at": "2023-11-07T05:31:56Z"\
  }\
]
```

GET

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

Try it

List draft sessions

cURL

```
curl --request GET \
  --url https://public-api.sessionboard.com/v1/event/{eventId}/agenda-drafts/{draftId}/sessions \
  --header 'x-access-token: <api-key>'
```

```
import requests

url = "https://public-api.sessionboard.com/v1/event/{eventId}/agenda-drafts/{draftId}/sessions"

headers = {"x-access-token": "<api-key>"}

response = requests.get(url, headers=headers)

print(response.text)
```

```
const options = {method: 'GET', headers: {'x-access-token': '<api-key>'}};

fetch('https://public-api.sessionboard.com/v1/event/{eventId}/agenda-drafts/{draftId}/sessions', options)
  .then(res => res.json())
  .then(res => console.log(res))
  .catch(err => console.error(err));
```

```
<?php

$curl = curl_init();

curl_setopt_array($curl, [\
  CURLOPT_URL => "https://public-api.sessionboard.com/v1/event/{eventId}/agenda-drafts/{draftId}/sessions",\
  CURLOPT_RETURNTRANSFER => true,\
  CURLOPT_ENCODING => "",\
  CURLOPT_MAXREDIRS => 10,\
  CURLOPT_TIMEOUT => 30,\
  CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,\
  CURLOPT_CUSTOMREQUEST => "GET",\
  CURLOPT_HTTPHEADER => [\
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
	"net/http"
	"io"
)

func main() {

	url := "https://public-api.sessionboard.com/v1/event/{eventId}/agenda-drafts/{draftId}/sessions"

	req, _ := http.NewRequest("GET", url, nil)

	req.Header.Add("x-access-token", "<api-key>")

	res, _ := http.DefaultClient.Do(req)

	defer res.Body.Close()
	body, _ := io.ReadAll(res.Body)

	fmt.Println(string(body))

}
```

```
HttpResponse<String> response = Unirest.get("https://public-api.sessionboard.com/v1/event/{eventId}/agenda-drafts/{draftId}/sessions")
  .header("x-access-token", "<api-key>")
  .asString();
```

```
require 'uri'
require 'net/http'

url = URI("https://public-api.sessionboard.com/v1/event/{eventId}/agenda-drafts/{draftId}/sessions")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true

request = Net::HTTP::Get.new(url)
request["x-access-token"] = '<api-key>'

response = http.request(request)
puts response.read_body
```

200

```
[\
  {\
    "id": "3c90c3cc-0d44-4b50-8888-8dd25736052a",\
    "draft_id": "3c90c3cc-0d44-4b50-8888-8dd25736052a",\
    "session_id": "3c90c3cc-0d44-4b50-8888-8dd25736052a",\
    "starts_at": "2023-11-07T05:31:56Z",\
    "ends_at": "2023-11-07T05:31:56Z",\
    "room_id": "3c90c3cc-0d44-4b50-8888-8dd25736052a",\
    "created_at": "2023-11-07T05:31:56Z",\
    "updated_at": "2023-11-07T05:31:56Z"\
  }\
]
```

#### Authorizations

ApiKeyBearerTokenApiKeyBearerToken

[​](https://apidocs.sessionboard.com/api-reference/agenda-planning/list-draft-sessions#authorization-x-access-token)

x-access-token

string

header

required

Organization API token. Generate from Organization Settings → API Tokens.

#### Path Parameters

[​](https://apidocs.sessionboard.com/api-reference/agenda-planning/list-draft-sessions#parameter-event-id)

eventId

integer

required

[​](https://apidocs.sessionboard.com/api-reference/agenda-planning/list-draft-sessions#parameter-draft-id)

draftId

string<uuid>

required

#### Response

200

application/json

OK

[​](https://apidocs.sessionboard.com/api-reference/agenda-planning/list-draft-sessions#response-items-id)

id

string<uuid>

[​](https://apidocs.sessionboard.com/api-reference/agenda-planning/list-draft-sessions#response-items-draft-id)

draft\_id

string<uuid>

[​](https://apidocs.sessionboard.com/api-reference/agenda-planning/list-draft-sessions#response-items-session-id)

session\_id

string<uuid>

[​](https://apidocs.sessionboard.com/api-reference/agenda-planning/list-draft-sessions#response-items-starts-at)

starts\_at

string<date-time>

[​](https://apidocs.sessionboard.com/api-reference/agenda-planning/list-draft-sessions#response-items-ends-at)

ends\_at

string<date-time>

[​](https://apidocs.sessionboard.com/api-reference/agenda-planning/list-draft-sessions#response-items-room-id)

room\_id

string<uuid>

[​](https://apidocs.sessionboard.com/api-reference/agenda-planning/list-draft-sessions#response-items-created-at)

created\_at

string<date-time>

[​](https://apidocs.sessionboard.com/api-reference/agenda-planning/list-draft-sessions#response-items-updated-at)

updated\_at

string<date-time>

Ctrl+I