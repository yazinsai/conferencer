---
url: "https://apidocs.sessionboard.com/api-reference/transcriptions/get-event-level-content-artifacts"
title: "Get event-level content artifacts - Sessionboard API"
---

> ## Documentation Index
>
> Fetch the complete documentation index at: [/llms.txt](https://apidocs.sessionboard.com/llms.txt)
>
> Use this file to discover all available pages before exploring further.

[Skip to main content](https://apidocs.sessionboard.com/api-reference/transcriptions/get-event-level-content-artifacts#content-area)

Get event-level content artifacts

cURL

```
curl --request GET \
  --url https://public-api.sessionboard.com/v1/event/{eventId}/content/event \
  --header 'x-access-token: <api-key>'
```

```
import requests

url = "https://public-api.sessionboard.com/v1/event/{eventId}/content/event"

headers = {"x-access-token": "<api-key>"}

response = requests.get(url, headers=headers)

print(response.text)
```

```
const options = {method: 'GET', headers: {'x-access-token': '<api-key>'}};

fetch('https://public-api.sessionboard.com/v1/event/{eventId}/content/event', options)
  .then(res => res.json())
  .then(res => console.log(res))
  .catch(err => console.error(err));
```

```
<?php

$curl = curl_init();

curl_setopt_array($curl, [\
  CURLOPT_URL => "https://public-api.sessionboard.com/v1/event/{eventId}/content/event",\
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

	url := "https://public-api.sessionboard.com/v1/event/{eventId}/content/event"

	req, _ := http.NewRequest("GET", url, nil)

	req.Header.Add("x-access-token", "<api-key>")

	res, _ := http.DefaultClient.Do(req)

	defer res.Body.Close()
	body, _ := io.ReadAll(res.Body)

	fmt.Println(string(body))

}
```

```
HttpResponse<String> response = Unirest.get("https://public-api.sessionboard.com/v1/event/{eventId}/content/event")
  .header("x-access-token", "<api-key>")
  .asString();
```

```
require 'uri'
require 'net/http'

url = URI("https://public-api.sessionboard.com/v1/event/{eventId}/content/event")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true

request = Net::HTTP::Get.new(url)
request["x-access-token"] = '<api-key>'

response = http.request(request)
puts response.read_body
```

200

```
{
  "data": {
    "id": 123,
    "updated_at": "2023-11-07T05:31:56Z",
    "items": [\
      {\
        "id": "3c90c3cc-0d44-4b50-8888-8dd25736052a",\
        "session_id": "3c90c3cc-0d44-4b50-8888-8dd25736052a",\
        "text": "<string>",\
        "elements": [\
          {\
            "value": "<string>",\
            "speaker": {\
              "id": "<string>",\
              "label": "<string>",\
              "name": "<string>"\
            },\
            "start_time": 123,\
            "end_time": 123,\
            "fragment_ids": [\
              "3c90c3cc-0d44-4b50-8888-8dd25736052a"\
            ]\
          }\
        ],\
        "fragment_count": 123,\
        "interval_sec": 123,\
        "language_code": "<string>",\
        "summary_type": "<string>",\
        "provider": "<string>",\
        "content": {},\
        "topics": [\
          {}\
        ],\
        "insight_type": "<string>",\
        "name": "<string>",\
        "metadata": {},\
        "status": "<string>",\
        "url": "<string>",\
        "duration_sec": 123,\
        "generated_at": "2023-11-07T05:31:56Z",\
        "expires_at": "2023-11-07T05:31:56Z",\
        "content_type": "<string>",\
        "scope": "<string>",\
        "quotes": [\
          {}\
        ],\
        "summaries": [\
          {}\
        ],\
        "created_at": "2023-11-07T05:31:56Z",\
        "updated_at": "2023-11-07T05:31:56Z"\
      }\
    ]
  }
}
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

content

/

event

Try it

Get event-level content artifacts

cURL

```
curl --request GET \
  --url https://public-api.sessionboard.com/v1/event/{eventId}/content/event \
  --header 'x-access-token: <api-key>'
```

```
import requests

url = "https://public-api.sessionboard.com/v1/event/{eventId}/content/event"

headers = {"x-access-token": "<api-key>"}

response = requests.get(url, headers=headers)

print(response.text)
```

```
const options = {method: 'GET', headers: {'x-access-token': '<api-key>'}};

fetch('https://public-api.sessionboard.com/v1/event/{eventId}/content/event', options)
  .then(res => res.json())
  .then(res => console.log(res))
  .catch(err => console.error(err));
```

```
<?php

$curl = curl_init();

curl_setopt_array($curl, [\
  CURLOPT_URL => "https://public-api.sessionboard.com/v1/event/{eventId}/content/event",\
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

	url := "https://public-api.sessionboard.com/v1/event/{eventId}/content/event"

	req, _ := http.NewRequest("GET", url, nil)

	req.Header.Add("x-access-token", "<api-key>")

	res, _ := http.DefaultClient.Do(req)

	defer res.Body.Close()
	body, _ := io.ReadAll(res.Body)

	fmt.Println(string(body))

}
```

```
HttpResponse<String> response = Unirest.get("https://public-api.sessionboard.com/v1/event/{eventId}/content/event")
  .header("x-access-token", "<api-key>")
  .asString();
```

```
require 'uri'
require 'net/http'

url = URI("https://public-api.sessionboard.com/v1/event/{eventId}/content/event")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true

request = Net::HTTP::Get.new(url)
request["x-access-token"] = '<api-key>'

response = http.request(request)
puts response.read_body
```

200

```
{
  "data": {
    "id": 123,
    "updated_at": "2023-11-07T05:31:56Z",
    "items": [\
      {\
        "id": "3c90c3cc-0d44-4b50-8888-8dd25736052a",\
        "session_id": "3c90c3cc-0d44-4b50-8888-8dd25736052a",\
        "text": "<string>",\
        "elements": [\
          {\
            "value": "<string>",\
            "speaker": {\
              "id": "<string>",\
              "label": "<string>",\
              "name": "<string>"\
            },\
            "start_time": 123,\
            "end_time": 123,\
            "fragment_ids": [\
              "3c90c3cc-0d44-4b50-8888-8dd25736052a"\
            ]\
          }\
        ],\
        "fragment_count": 123,\
        "interval_sec": 123,\
        "language_code": "<string>",\
        "summary_type": "<string>",\
        "provider": "<string>",\
        "content": {},\
        "topics": [\
          {}\
        ],\
        "insight_type": "<string>",\
        "name": "<string>",\
        "metadata": {},\
        "status": "<string>",\
        "url": "<string>",\
        "duration_sec": 123,\
        "generated_at": "2023-11-07T05:31:56Z",\
        "expires_at": "2023-11-07T05:31:56Z",\
        "content_type": "<string>",\
        "scope": "<string>",\
        "quotes": [\
          {}\
        ],\
        "summaries": [\
          {}\
        ],\
        "created_at": "2023-11-07T05:31:56Z",\
        "updated_at": "2023-11-07T05:31:56Z"\
      }\
    ]
  }
}
```

#### Authorizations

ApiKeyBearerTokenApiKeyBearerToken

[​](https://apidocs.sessionboard.com/api-reference/transcriptions/get-event-level-content-artifacts#authorization-x-access-token)

x-access-token

string

header

required

Organization API token. Generate from Organization Settings → API Tokens.

#### Path Parameters

[​](https://apidocs.sessionboard.com/api-reference/transcriptions/get-event-level-content-artifacts#parameter-event-id)

eventId

integer

required

Event ID

#### Query Parameters

[​](https://apidocs.sessionboard.com/api-reference/transcriptions/get-event-level-content-artifacts#parameter-expand)

expand

string

Comma-separated. Default `document,recap`. Pass only the types you want.

Example:

`"document,recap"`

#### Response

200

application/json

OK

[​](https://apidocs.sessionboard.com/api-reference/transcriptions/get-event-level-content-artifacts#response-data)

data

object

Showchild attributes

Ctrl+I