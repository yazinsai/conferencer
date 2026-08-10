---
url: "https://apidocs.sessionboard.com/api-reference/session-recordings/finalize-session-audio-upload"
title: "Finalize session audio upload - Sessionboard API"
---

> ## Documentation Index
>
> Fetch the complete documentation index at: [/llms.txt](https://apidocs.sessionboard.com/llms.txt)
>
> Use this file to discover all available pages before exploring further.

[Skip to main content](https://apidocs.sessionboard.com/api-reference/session-recordings/finalize-session-audio-upload#content-area)

Finalize session audio upload

cURL

```
curl --request POST \
  --url https://public-api.sessionboard.com/v1/event/{eventId}/sessions/{sessionId}/recordings/{recordingId}/complete \
  --header 'Content-Type: application/json' \
  --header 'x-access-token: <api-key>' \
  --data '
{
  "duration_seconds": 123,
  "file_size_bytes": 123
}
'
```

```
import requests

url = "https://public-api.sessionboard.com/v1/event/{eventId}/sessions/{sessionId}/recordings/{recordingId}/complete"

payload = {
    "duration_seconds": 123,
    "file_size_bytes": 123
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
  body: JSON.stringify({duration_seconds: 123, file_size_bytes: 123})
};

fetch('https://public-api.sessionboard.com/v1/event/{eventId}/sessions/{sessionId}/recordings/{recordingId}/complete', options)
  .then(res => res.json())
  .then(res => console.log(res))
  .catch(err => console.error(err));
```

```
<?php

$curl = curl_init();

curl_setopt_array($curl, [\
  CURLOPT_URL => "https://public-api.sessionboard.com/v1/event/{eventId}/sessions/{sessionId}/recordings/{recordingId}/complete",\
  CURLOPT_RETURNTRANSFER => true,\
  CURLOPT_ENCODING => "",\
  CURLOPT_MAXREDIRS => 10,\
  CURLOPT_TIMEOUT => 30,\
  CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,\
  CURLOPT_CUSTOMREQUEST => "POST",\
  CURLOPT_POSTFIELDS => json_encode([\
    'duration_seconds' => 123,\
    'file_size_bytes' => 123\
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

	url := "https://public-api.sessionboard.com/v1/event/{eventId}/sessions/{sessionId}/recordings/{recordingId}/complete"

	payload := strings.NewReader("{\n  \"duration_seconds\": 123,\n  \"file_size_bytes\": 123\n}")

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
HttpResponse<String> response = Unirest.post("https://public-api.sessionboard.com/v1/event/{eventId}/sessions/{sessionId}/recordings/{recordingId}/complete")
  .header("x-access-token", "<api-key>")
  .header("Content-Type", "application/json")
  .body("{\n  \"duration_seconds\": 123,\n  \"file_size_bytes\": 123\n}")
  .asString();
```

```
require 'uri'
require 'net/http'

url = URI("https://public-api.sessionboard.com/v1/event/{eventId}/sessions/{sessionId}/recordings/{recordingId}/complete")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true

request = Net::HTTP::Post.new(url)
request["x-access-token"] = '<api-key>'
request["Content-Type"] = 'application/json'
request.body = "{\n  \"duration_seconds\": 123,\n  \"file_size_bytes\": 123\n}"

response = http.request(request)
puts response.read_body
```

200

```
{
  "data": {
    "id": "3c90c3cc-0d44-4b50-8888-8dd25736052a",
    "type": "recording",
    "session_id": "3c90c3cc-0d44-4b50-8888-8dd25736052a",
    "s3_bucket": "<string>",
    "s3_key": "<string>",
    "encoding": "linear16",
    "sample_rate": 16000,
    "channels": 1,
    "duration_seconds": 123,
    "file_size_bytes": 123,
    "started_at": "2023-11-07T05:31:56Z",
    "completed_at": "2023-11-07T05:31:56Z",
    "created_at": "2023-11-07T05:31:56Z",
    "updated_at": "2023-11-07T05:31:56Z"
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

recordings

/

{recordingId}

/

complete

Try it

Finalize session audio upload

cURL

```
curl --request POST \
  --url https://public-api.sessionboard.com/v1/event/{eventId}/sessions/{sessionId}/recordings/{recordingId}/complete \
  --header 'Content-Type: application/json' \
  --header 'x-access-token: <api-key>' \
  --data '
{
  "duration_seconds": 123,
  "file_size_bytes": 123
}
'
```

```
import requests

url = "https://public-api.sessionboard.com/v1/event/{eventId}/sessions/{sessionId}/recordings/{recordingId}/complete"

payload = {
    "duration_seconds": 123,
    "file_size_bytes": 123
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
  body: JSON.stringify({duration_seconds: 123, file_size_bytes: 123})
};

fetch('https://public-api.sessionboard.com/v1/event/{eventId}/sessions/{sessionId}/recordings/{recordingId}/complete', options)
  .then(res => res.json())
  .then(res => console.log(res))
  .catch(err => console.error(err));
```

```
<?php

$curl = curl_init();

curl_setopt_array($curl, [\
  CURLOPT_URL => "https://public-api.sessionboard.com/v1/event/{eventId}/sessions/{sessionId}/recordings/{recordingId}/complete",\
  CURLOPT_RETURNTRANSFER => true,\
  CURLOPT_ENCODING => "",\
  CURLOPT_MAXREDIRS => 10,\
  CURLOPT_TIMEOUT => 30,\
  CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,\
  CURLOPT_CUSTOMREQUEST => "POST",\
  CURLOPT_POSTFIELDS => json_encode([\
    'duration_seconds' => 123,\
    'file_size_bytes' => 123\
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

	url := "https://public-api.sessionboard.com/v1/event/{eventId}/sessions/{sessionId}/recordings/{recordingId}/complete"

	payload := strings.NewReader("{\n  \"duration_seconds\": 123,\n  \"file_size_bytes\": 123\n}")

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
HttpResponse<String> response = Unirest.post("https://public-api.sessionboard.com/v1/event/{eventId}/sessions/{sessionId}/recordings/{recordingId}/complete")
  .header("x-access-token", "<api-key>")
  .header("Content-Type", "application/json")
  .body("{\n  \"duration_seconds\": 123,\n  \"file_size_bytes\": 123\n}")
  .asString();
```

```
require 'uri'
require 'net/http'

url = URI("https://public-api.sessionboard.com/v1/event/{eventId}/sessions/{sessionId}/recordings/{recordingId}/complete")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true

request = Net::HTTP::Post.new(url)
request["x-access-token"] = '<api-key>'
request["Content-Type"] = 'application/json'
request.body = "{\n  \"duration_seconds\": 123,\n  \"file_size_bytes\": 123\n}"

response = http.request(request)
puts response.read_body
```

200

```
{
  "data": {
    "id": "3c90c3cc-0d44-4b50-8888-8dd25736052a",
    "type": "recording",
    "session_id": "3c90c3cc-0d44-4b50-8888-8dd25736052a",
    "s3_bucket": "<string>",
    "s3_key": "<string>",
    "encoding": "linear16",
    "sample_rate": 16000,
    "channels": 1,
    "duration_seconds": 123,
    "file_size_bytes": 123,
    "started_at": "2023-11-07T05:31:56Z",
    "completed_at": "2023-11-07T05:31:56Z",
    "created_at": "2023-11-07T05:31:56Z",
    "updated_at": "2023-11-07T05:31:56Z"
  }
}
```

#### Authorizations

ApiKeyBearerTokenApiKeyBearerToken

[​](https://apidocs.sessionboard.com/api-reference/session-recordings/finalize-session-audio-upload#authorization-x-access-token)

x-access-token

string

header

required

Organization API token. Generate from Organization Settings → API Tokens.

#### Path Parameters

[​](https://apidocs.sessionboard.com/api-reference/session-recordings/finalize-session-audio-upload#parameter-event-id)

eventId

integer

required

Event ID

[​](https://apidocs.sessionboard.com/api-reference/session-recordings/finalize-session-audio-upload#parameter-session-id)

sessionId

string<uuid>

required

Session UUID

[​](https://apidocs.sessionboard.com/api-reference/session-recordings/finalize-session-audio-upload#parameter-recording-id)

recordingId

string<uuid>

required

#### Body

application/json

[​](https://apidocs.sessionboard.com/api-reference/session-recordings/finalize-session-audio-upload#body-duration-seconds)

duration\_seconds

number

[​](https://apidocs.sessionboard.com/api-reference/session-recordings/finalize-session-audio-upload#body-file-size-bytes)

file\_size\_bytes

integer

#### Response

200

application/json

OK

[​](https://apidocs.sessionboard.com/api-reference/session-recordings/finalize-session-audio-upload#response-data)

data

object

Showchild attributes

Ctrl+I