---
url: "https://apidocs.sessionboard.com/api-reference/session-recordings/list-session-audio-recordings"
title: "List session audio recordings - Sessionboard API"
---

> ## Documentation Index
>
> Fetch the complete documentation index at: [/llms.txt](https://apidocs.sessionboard.com/llms.txt)
>
> Use this file to discover all available pages before exploring further.

[Skip to main content](https://apidocs.sessionboard.com/api-reference/session-recordings/list-session-audio-recordings#content-area)

List session audio recordings

cURL

```
curl --request GET \
  --url https://public-api.sessionboard.com/v1/event/{eventId}/sessions/{sessionId}/recordings \
  --header 'x-access-token: <api-key>'
```

```
import requests

url = "https://public-api.sessionboard.com/v1/event/{eventId}/sessions/{sessionId}/recordings"

headers = {"x-access-token": "<api-key>"}

response = requests.get(url, headers=headers)

print(response.text)
```

```
const options = {method: 'GET', headers: {'x-access-token': '<api-key>'}};

fetch('https://public-api.sessionboard.com/v1/event/{eventId}/sessions/{sessionId}/recordings', options)
  .then(res => res.json())
  .then(res => console.log(res))
  .catch(err => console.error(err));
```

```
<?php

$curl = curl_init();

curl_setopt_array($curl, [\
  CURLOPT_URL => "https://public-api.sessionboard.com/v1/event/{eventId}/sessions/{sessionId}/recordings",\
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

	url := "https://public-api.sessionboard.com/v1/event/{eventId}/sessions/{sessionId}/recordings"

	req, _ := http.NewRequest("GET", url, nil)

	req.Header.Add("x-access-token", "<api-key>")

	res, _ := http.DefaultClient.Do(req)

	defer res.Body.Close()
	body, _ := io.ReadAll(res.Body)

	fmt.Println(string(body))

}
```

```
HttpResponse<String> response = Unirest.get("https://public-api.sessionboard.com/v1/event/{eventId}/sessions/{sessionId}/recordings")
  .header("x-access-token", "<api-key>")
  .asString();
```

```
require 'uri'
require 'net/http'

url = URI("https://public-api.sessionboard.com/v1/event/{eventId}/sessions/{sessionId}/recordings")

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
  "data": [\
    {\
      "id": "3c90c3cc-0d44-4b50-8888-8dd25736052a",\
      "type": "recording",\
      "session_id": "3c90c3cc-0d44-4b50-8888-8dd25736052a",\
      "s3_bucket": "<string>",\
      "s3_key": "<string>",\
      "encoding": "linear16",\
      "sample_rate": 16000,\
      "channels": 1,\
      "duration_seconds": 123,\
      "file_size_bytes": 123,\
      "started_at": "2023-11-07T05:31:56Z",\
      "completed_at": "2023-11-07T05:31:56Z",\
      "created_at": "2023-11-07T05:31:56Z",\
      "updated_at": "2023-11-07T05:31:56Z"\
    }\
  ]
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

sessions

/

{sessionId}

/

recordings

Try it

List session audio recordings

cURL

```
curl --request GET \
  --url https://public-api.sessionboard.com/v1/event/{eventId}/sessions/{sessionId}/recordings \
  --header 'x-access-token: <api-key>'
```

```
import requests

url = "https://public-api.sessionboard.com/v1/event/{eventId}/sessions/{sessionId}/recordings"

headers = {"x-access-token": "<api-key>"}

response = requests.get(url, headers=headers)

print(response.text)
```

```
const options = {method: 'GET', headers: {'x-access-token': '<api-key>'}};

fetch('https://public-api.sessionboard.com/v1/event/{eventId}/sessions/{sessionId}/recordings', options)
  .then(res => res.json())
  .then(res => console.log(res))
  .catch(err => console.error(err));
```

```
<?php

$curl = curl_init();

curl_setopt_array($curl, [\
  CURLOPT_URL => "https://public-api.sessionboard.com/v1/event/{eventId}/sessions/{sessionId}/recordings",\
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

	url := "https://public-api.sessionboard.com/v1/event/{eventId}/sessions/{sessionId}/recordings"

	req, _ := http.NewRequest("GET", url, nil)

	req.Header.Add("x-access-token", "<api-key>")

	res, _ := http.DefaultClient.Do(req)

	defer res.Body.Close()
	body, _ := io.ReadAll(res.Body)

	fmt.Println(string(body))

}
```

```
HttpResponse<String> response = Unirest.get("https://public-api.sessionboard.com/v1/event/{eventId}/sessions/{sessionId}/recordings")
  .header("x-access-token", "<api-key>")
  .asString();
```

```
require 'uri'
require 'net/http'

url = URI("https://public-api.sessionboard.com/v1/event/{eventId}/sessions/{sessionId}/recordings")

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
  "data": [\
    {\
      "id": "3c90c3cc-0d44-4b50-8888-8dd25736052a",\
      "type": "recording",\
      "session_id": "3c90c3cc-0d44-4b50-8888-8dd25736052a",\
      "s3_bucket": "<string>",\
      "s3_key": "<string>",\
      "encoding": "linear16",\
      "sample_rate": 16000,\
      "channels": 1,\
      "duration_seconds": 123,\
      "file_size_bytes": 123,\
      "started_at": "2023-11-07T05:31:56Z",\
      "completed_at": "2023-11-07T05:31:56Z",\
      "created_at": "2023-11-07T05:31:56Z",\
      "updated_at": "2023-11-07T05:31:56Z"\
    }\
  ]
}
```

#### Authorizations

ApiKeyBearerTokenApiKeyBearerToken

[​](https://apidocs.sessionboard.com/api-reference/session-recordings/list-session-audio-recordings#authorization-x-access-token)

x-access-token

string

header

required

Organization API token. Generate from Organization Settings → API Tokens.

#### Path Parameters

[​](https://apidocs.sessionboard.com/api-reference/session-recordings/list-session-audio-recordings#parameter-event-id)

eventId

integer

required

Event ID

[​](https://apidocs.sessionboard.com/api-reference/session-recordings/list-session-audio-recordings#parameter-session-id)

sessionId

string<uuid>

required

Session UUID

#### Response

200

application/json

OK

[​](https://apidocs.sessionboard.com/api-reference/session-recordings/list-session-audio-recordings#response-data)

data

object\[\]

Showchild attributes

Ctrl+I