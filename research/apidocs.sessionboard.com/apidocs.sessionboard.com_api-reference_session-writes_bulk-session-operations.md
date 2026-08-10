---
url: "https://apidocs.sessionboard.com/api-reference/session-writes/bulk-session-operations"
title: "Bulk session operations - Sessionboard API"
---

> ## Documentation Index
>
> Fetch the complete documentation index at: [/llms.txt](https://apidocs.sessionboard.com/llms.txt)
>
> Use this file to discover all available pages before exploring further.

[Skip to main content](https://apidocs.sessionboard.com/api-reference/session-writes/bulk-session-operations#content-area)

Bulk session operations

cURL

```
curl --request POST \
  --url https://public-api.sessionboard.com/v1/event/{eventId}/sessions/bulk \
  --header 'Content-Type: application/json' \
  --header 'x-access-token: <api-key>' \
  --data '
{
  "operations": [\
    {\
      "id": "3c90c3cc-0d44-4b50-8888-8dd25736052a",\
      "data": {}\
    }\
  ]
}
'
```

```
import requests

url = "https://public-api.sessionboard.com/v1/event/{eventId}/sessions/bulk"

payload = { "operations": [\
        {\
            "id": "3c90c3cc-0d44-4b50-8888-8dd25736052a",\
            "data": {}\
        }\
    ] }
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
  body: JSON.stringify({operations: [{id: '3c90c3cc-0d44-4b50-8888-8dd25736052a', data: {}}]})
};

fetch('https://public-api.sessionboard.com/v1/event/{eventId}/sessions/bulk', options)
  .then(res => res.json())
  .then(res => console.log(res))
  .catch(err => console.error(err));
```

```
<?php

$curl = curl_init();

curl_setopt_array($curl, [\
  CURLOPT_URL => "https://public-api.sessionboard.com/v1/event/{eventId}/sessions/bulk",\
  CURLOPT_RETURNTRANSFER => true,\
  CURLOPT_ENCODING => "",\
  CURLOPT_MAXREDIRS => 10,\
  CURLOPT_TIMEOUT => 30,\
  CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,\
  CURLOPT_CUSTOMREQUEST => "POST",\
  CURLOPT_POSTFIELDS => json_encode([\
    'operations' => [\
        [\
                'id' => '3c90c3cc-0d44-4b50-8888-8dd25736052a',\
                'data' => [\
\
                ]\
        ]\
    ]\
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

	url := "https://public-api.sessionboard.com/v1/event/{eventId}/sessions/bulk"

	payload := strings.NewReader("{\n  \"operations\": [\n    {\n      \"id\": \"3c90c3cc-0d44-4b50-8888-8dd25736052a\",\n      \"data\": {}\n    }\n  ]\n}")

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
HttpResponse<String> response = Unirest.post("https://public-api.sessionboard.com/v1/event/{eventId}/sessions/bulk")
  .header("x-access-token", "<api-key>")
  .header("Content-Type", "application/json")
  .body("{\n  \"operations\": [\n    {\n      \"id\": \"3c90c3cc-0d44-4b50-8888-8dd25736052a\",\n      \"data\": {}\n    }\n  ]\n}")
  .asString();
```

```
require 'uri'
require 'net/http'

url = URI("https://public-api.sessionboard.com/v1/event/{eventId}/sessions/bulk")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true

request = Net::HTTP::Post.new(url)
request["x-access-token"] = '<api-key>'
request["Content-Type"] = 'application/json'
request.body = "{\n  \"operations\": [\n    {\n      \"id\": \"3c90c3cc-0d44-4b50-8888-8dd25736052a\",\n      \"data\": {}\n    }\n  ]\n}"

response = http.request(request)
puts response.read_body
```

200

```
{
  "batch_id": "3c90c3cc-0d44-4b50-8888-8dd25736052a",
  "results": [\
    {\
      "index": 123,\
      "action": "<string>",\
      "id": "3c90c3cc-0d44-4b50-8888-8dd25736052a",\
      "error": {\
        "code": "<string>",\
        "message": "<string>"\
      }\
    }\
  ],
  "stats": {
    "total": 123,
    "succeeded": 123,
    "failed": 123
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

bulk

Try it

Bulk session operations

cURL

```
curl --request POST \
  --url https://public-api.sessionboard.com/v1/event/{eventId}/sessions/bulk \
  --header 'Content-Type: application/json' \
  --header 'x-access-token: <api-key>' \
  --data '
{
  "operations": [\
    {\
      "id": "3c90c3cc-0d44-4b50-8888-8dd25736052a",\
      "data": {}\
    }\
  ]
}
'
```

```
import requests

url = "https://public-api.sessionboard.com/v1/event/{eventId}/sessions/bulk"

payload = { "operations": [\
        {\
            "id": "3c90c3cc-0d44-4b50-8888-8dd25736052a",\
            "data": {}\
        }\
    ] }
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
  body: JSON.stringify({operations: [{id: '3c90c3cc-0d44-4b50-8888-8dd25736052a', data: {}}]})
};

fetch('https://public-api.sessionboard.com/v1/event/{eventId}/sessions/bulk', options)
  .then(res => res.json())
  .then(res => console.log(res))
  .catch(err => console.error(err));
```

```
<?php

$curl = curl_init();

curl_setopt_array($curl, [\
  CURLOPT_URL => "https://public-api.sessionboard.com/v1/event/{eventId}/sessions/bulk",\
  CURLOPT_RETURNTRANSFER => true,\
  CURLOPT_ENCODING => "",\
  CURLOPT_MAXREDIRS => 10,\
  CURLOPT_TIMEOUT => 30,\
  CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,\
  CURLOPT_CUSTOMREQUEST => "POST",\
  CURLOPT_POSTFIELDS => json_encode([\
    'operations' => [\
        [\
                'id' => '3c90c3cc-0d44-4b50-8888-8dd25736052a',\
                'data' => [\
\
                ]\
        ]\
    ]\
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

	url := "https://public-api.sessionboard.com/v1/event/{eventId}/sessions/bulk"

	payload := strings.NewReader("{\n  \"operations\": [\n    {\n      \"id\": \"3c90c3cc-0d44-4b50-8888-8dd25736052a\",\n      \"data\": {}\n    }\n  ]\n}")

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
HttpResponse<String> response = Unirest.post("https://public-api.sessionboard.com/v1/event/{eventId}/sessions/bulk")
  .header("x-access-token", "<api-key>")
  .header("Content-Type", "application/json")
  .body("{\n  \"operations\": [\n    {\n      \"id\": \"3c90c3cc-0d44-4b50-8888-8dd25736052a\",\n      \"data\": {}\n    }\n  ]\n}")
  .asString();
```

```
require 'uri'
require 'net/http'

url = URI("https://public-api.sessionboard.com/v1/event/{eventId}/sessions/bulk")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true

request = Net::HTTP::Post.new(url)
request["x-access-token"] = '<api-key>'
request["Content-Type"] = 'application/json'
request.body = "{\n  \"operations\": [\n    {\n      \"id\": \"3c90c3cc-0d44-4b50-8888-8dd25736052a\",\n      \"data\": {}\n    }\n  ]\n}"

response = http.request(request)
puts response.read_body
```

200

```
{
  "batch_id": "3c90c3cc-0d44-4b50-8888-8dd25736052a",
  "results": [\
    {\
      "index": 123,\
      "action": "<string>",\
      "id": "3c90c3cc-0d44-4b50-8888-8dd25736052a",\
      "error": {\
        "code": "<string>",\
        "message": "<string>"\
      }\
    }\
  ],
  "stats": {
    "total": 123,
    "succeeded": 123,
    "failed": 123
  }
}
```

#### Authorizations

ApiKeyBearerTokenApiKeyBearerToken

[​](https://apidocs.sessionboard.com/api-reference/session-writes/bulk-session-operations#authorization-x-access-token)

x-access-token

string

header

required

Organization API token. Generate from Organization Settings → API Tokens.

#### Path Parameters

[​](https://apidocs.sessionboard.com/api-reference/session-writes/bulk-session-operations#parameter-event-id)

eventId

integer

required

The event ID.

#### Body

application/json

Request body for bulk create/update/delete operations.

[​](https://apidocs.sessionboard.com/api-reference/session-writes/bulk-session-operations#body-operations)

operations

object\[\]

required

Array of operations to execute (max 100).

Maximum array length: `100`

Showchild attributes

#### Response

200

application/json

Bulk operation completed

Response body for bulk operations, including per-item results.

[​](https://apidocs.sessionboard.com/api-reference/session-writes/bulk-session-operations#response-batch-id)

batch\_id

string<uuid>

Unique identifier for this bulk batch.

[​](https://apidocs.sessionboard.com/api-reference/session-writes/bulk-session-operations#response-results)

results

object\[\]

Per-operation results in the same order as the request.

Showchild attributes

[​](https://apidocs.sessionboard.com/api-reference/session-writes/bulk-session-operations#response-stats)

stats

object

Summary statistics for the batch.

Showchild attributes

Ctrl+I