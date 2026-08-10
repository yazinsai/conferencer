---
url: "https://apidocs.sessionboard.com/api-reference/transcriptions/update-a-transcription-artifact"
title: "Update a transcription artifact - Sessionboard API"
---

> ## Documentation Index
>
> Fetch the complete documentation index at: [/llms.txt](https://apidocs.sessionboard.com/llms.txt)
>
> Use this file to discover all available pages before exploring further.

[Skip to main content](https://apidocs.sessionboard.com/api-reference/transcriptions/update-a-transcription-artifact#content-area)

Update a transcription artifact

cURL

```
curl --request PUT \
  --url https://public-api.sessionboard.com/v1/event/{eventId}/sessions/{sessionId}/transcriptions/{transcriptionId} \
  --header 'Content-Type: application/json' \
  --header 'x-access-token: <api-key>' \
  --data '{}'
```

```
import requests

url = "https://public-api.sessionboard.com/v1/event/{eventId}/sessions/{sessionId}/transcriptions/{transcriptionId}"

payload = {}
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
  body: JSON.stringify({})
};

fetch('https://public-api.sessionboard.com/v1/event/{eventId}/sessions/{sessionId}/transcriptions/{transcriptionId}', options)
  .then(res => res.json())
  .then(res => console.log(res))
  .catch(err => console.error(err));
```

```
<?php

$curl = curl_init();

curl_setopt_array($curl, [\
  CURLOPT_URL => "https://public-api.sessionboard.com/v1/event/{eventId}/sessions/{sessionId}/transcriptions/{transcriptionId}",\
  CURLOPT_RETURNTRANSFER => true,\
  CURLOPT_ENCODING => "",\
  CURLOPT_MAXREDIRS => 10,\
  CURLOPT_TIMEOUT => 30,\
  CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,\
  CURLOPT_CUSTOMREQUEST => "PUT",\
  CURLOPT_POSTFIELDS => json_encode([\
\
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

	url := "https://public-api.sessionboard.com/v1/event/{eventId}/sessions/{sessionId}/transcriptions/{transcriptionId}"

	payload := strings.NewReader("{}")

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
HttpResponse<String> response = Unirest.put("https://public-api.sessionboard.com/v1/event/{eventId}/sessions/{sessionId}/transcriptions/{transcriptionId}")
  .header("x-access-token", "<api-key>")
  .header("Content-Type", "application/json")
  .body("{}")
  .asString();
```

```
require 'uri'
require 'net/http'

url = URI("https://public-api.sessionboard.com/v1/event/{eventId}/sessions/{sessionId}/transcriptions/{transcriptionId}")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true

request = Net::HTTP::Put.new(url)
request["x-access-token"] = '<api-key>'
request["Content-Type"] = 'application/json'
request.body = "{}"

response = http.request(request)
puts response.read_body
```

200

```
{
  "data": {
    "id": "3c90c3cc-0d44-4b50-8888-8dd25736052a",
    "session_id": "3c90c3cc-0d44-4b50-8888-8dd25736052a",
    "transcription": "<string>",
    "speaker": "<string>",
    "is_partial": true,
    "provider": "<string>",
    "created_at": "2023-11-07T05:31:56Z",
    "updated_at": "2023-11-07T05:31:56Z"
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

transcriptions

/

{transcriptionId}

Try it

Update a transcription artifact

cURL

```
curl --request PUT \
  --url https://public-api.sessionboard.com/v1/event/{eventId}/sessions/{sessionId}/transcriptions/{transcriptionId} \
  --header 'Content-Type: application/json' \
  --header 'x-access-token: <api-key>' \
  --data '{}'
```

```
import requests

url = "https://public-api.sessionboard.com/v1/event/{eventId}/sessions/{sessionId}/transcriptions/{transcriptionId}"

payload = {}
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
  body: JSON.stringify({})
};

fetch('https://public-api.sessionboard.com/v1/event/{eventId}/sessions/{sessionId}/transcriptions/{transcriptionId}', options)
  .then(res => res.json())
  .then(res => console.log(res))
  .catch(err => console.error(err));
```

```
<?php

$curl = curl_init();

curl_setopt_array($curl, [\
  CURLOPT_URL => "https://public-api.sessionboard.com/v1/event/{eventId}/sessions/{sessionId}/transcriptions/{transcriptionId}",\
  CURLOPT_RETURNTRANSFER => true,\
  CURLOPT_ENCODING => "",\
  CURLOPT_MAXREDIRS => 10,\
  CURLOPT_TIMEOUT => 30,\
  CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,\
  CURLOPT_CUSTOMREQUEST => "PUT",\
  CURLOPT_POSTFIELDS => json_encode([\
\
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

	url := "https://public-api.sessionboard.com/v1/event/{eventId}/sessions/{sessionId}/transcriptions/{transcriptionId}"

	payload := strings.NewReader("{}")

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
HttpResponse<String> response = Unirest.put("https://public-api.sessionboard.com/v1/event/{eventId}/sessions/{sessionId}/transcriptions/{transcriptionId}")
  .header("x-access-token", "<api-key>")
  .header("Content-Type", "application/json")
  .body("{}")
  .asString();
```

```
require 'uri'
require 'net/http'

url = URI("https://public-api.sessionboard.com/v1/event/{eventId}/sessions/{sessionId}/transcriptions/{transcriptionId}")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true

request = Net::HTTP::Put.new(url)
request["x-access-token"] = '<api-key>'
request["Content-Type"] = 'application/json'
request.body = "{}"

response = http.request(request)
puts response.read_body
```

200

```
{
  "data": {
    "id": "3c90c3cc-0d44-4b50-8888-8dd25736052a",
    "session_id": "3c90c3cc-0d44-4b50-8888-8dd25736052a",
    "transcription": "<string>",
    "speaker": "<string>",
    "is_partial": true,
    "provider": "<string>",
    "created_at": "2023-11-07T05:31:56Z",
    "updated_at": "2023-11-07T05:31:56Z"
  }
}
```

#### Authorizations

ApiKeyBearerTokenApiKeyBearerToken

[​](https://apidocs.sessionboard.com/api-reference/transcriptions/update-a-transcription-artifact#authorization-x-access-token)

x-access-token

string

header

required

Organization API token. Generate from Organization Settings → API Tokens.

#### Path Parameters

[​](https://apidocs.sessionboard.com/api-reference/transcriptions/update-a-transcription-artifact#parameter-event-id)

eventId

integer

required

Event ID

[​](https://apidocs.sessionboard.com/api-reference/transcriptions/update-a-transcription-artifact#parameter-session-id)

sessionId

string<uuid>

required

Session UUID

[​](https://apidocs.sessionboard.com/api-reference/transcriptions/update-a-transcription-artifact#parameter-transcription-id)

transcriptionId

string<uuid>

required

#### Body

application/json

The body is of type `object`.

#### Response

200

application/json

OK

[​](https://apidocs.sessionboard.com/api-reference/transcriptions/update-a-transcription-artifact#response-data)

data

object

Polymorphic transcription artifact. Fields vary by type.

Showchild attributes

Ctrl+I