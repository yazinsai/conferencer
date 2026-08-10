---
url: "https://apidocs.sessionboard.com/api-reference/session-recordings/initiate-session-audio-upload"
title: "Initiate session audio upload - Sessionboard API"
---

> ## Documentation Index
>
> Fetch the complete documentation index at: [/llms.txt](https://apidocs.sessionboard.com/llms.txt)
>
> Use this file to discover all available pages before exploring further.

[Skip to main content](https://apidocs.sessionboard.com/api-reference/session-recordings/initiate-session-audio-upload#content-area)

Initiate session audio upload

cURL

```
curl --request POST \
  --url https://public-api.sessionboard.com/v1/event/{eventId}/sessions/{sessionId}/recordings \
  --header 'Content-Type: application/json' \
  --header 'x-access-token: <api-key>' \
  --data '
{
  "filename": "<string>",
  "size_bytes": 123,
  "content_type": "<string>"
}
'
```

```
import requests

url = "https://public-api.sessionboard.com/v1/event/{eventId}/sessions/{sessionId}/recordings"

payload = {
    "filename": "<string>",
    "size_bytes": 123,
    "content_type": "<string>"
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
  body: JSON.stringify({filename: '<string>', size_bytes: 123, content_type: '<string>'})
};

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
  CURLOPT_CUSTOMREQUEST => "POST",\
  CURLOPT_POSTFIELDS => json_encode([\
    'filename' => '<string>',\
    'size_bytes' => 123,\
    'content_type' => '<string>'\
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

	url := "https://public-api.sessionboard.com/v1/event/{eventId}/sessions/{sessionId}/recordings"

	payload := strings.NewReader("{\n  \"filename\": \"<string>\",\n  \"size_bytes\": 123,\n  \"content_type\": \"<string>\"\n}")

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
HttpResponse<String> response = Unirest.post("https://public-api.sessionboard.com/v1/event/{eventId}/sessions/{sessionId}/recordings")
  .header("x-access-token", "<api-key>")
  .header("Content-Type", "application/json")
  .body("{\n  \"filename\": \"<string>\",\n  \"size_bytes\": 123,\n  \"content_type\": \"<string>\"\n}")
  .asString();
```

```
require 'uri'
require 'net/http'

url = URI("https://public-api.sessionboard.com/v1/event/{eventId}/sessions/{sessionId}/recordings")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true

request = Net::HTTP::Post.new(url)
request["x-access-token"] = '<api-key>'
request["Content-Type"] = 'application/json'
request.body = "{\n  \"filename\": \"<string>\",\n  \"size_bytes\": 123,\n  \"content_type\": \"<string>\"\n}"

response = http.request(request)
puts response.read_body
```

201

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
    "updated_at": "2023-11-07T05:31:56Z",
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

recordings

Try it

Initiate session audio upload

cURL

```
curl --request POST \
  --url https://public-api.sessionboard.com/v1/event/{eventId}/sessions/{sessionId}/recordings \
  --header 'Content-Type: application/json' \
  --header 'x-access-token: <api-key>' \
  --data '
{
  "filename": "<string>",
  "size_bytes": 123,
  "content_type": "<string>"
}
'
```

```
import requests

url = "https://public-api.sessionboard.com/v1/event/{eventId}/sessions/{sessionId}/recordings"

payload = {
    "filename": "<string>",
    "size_bytes": 123,
    "content_type": "<string>"
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
  body: JSON.stringify({filename: '<string>', size_bytes: 123, content_type: '<string>'})
};

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
  CURLOPT_CUSTOMREQUEST => "POST",\
  CURLOPT_POSTFIELDS => json_encode([\
    'filename' => '<string>',\
    'size_bytes' => 123,\
    'content_type' => '<string>'\
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

	url := "https://public-api.sessionboard.com/v1/event/{eventId}/sessions/{sessionId}/recordings"

	payload := strings.NewReader("{\n  \"filename\": \"<string>\",\n  \"size_bytes\": 123,\n  \"content_type\": \"<string>\"\n}")

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
HttpResponse<String> response = Unirest.post("https://public-api.sessionboard.com/v1/event/{eventId}/sessions/{sessionId}/recordings")
  .header("x-access-token", "<api-key>")
  .header("Content-Type", "application/json")
  .body("{\n  \"filename\": \"<string>\",\n  \"size_bytes\": 123,\n  \"content_type\": \"<string>\"\n}")
  .asString();
```

```
require 'uri'
require 'net/http'

url = URI("https://public-api.sessionboard.com/v1/event/{eventId}/sessions/{sessionId}/recordings")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true

request = Net::HTTP::Post.new(url)
request["x-access-token"] = '<api-key>'
request["Content-Type"] = 'application/json'
request.body = "{\n  \"filename\": \"<string>\",\n  \"size_bytes\": 123,\n  \"content_type\": \"<string>\"\n}"

response = http.request(request)
puts response.read_body
```

201

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
    "updated_at": "2023-11-07T05:31:56Z",
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

[​](https://apidocs.sessionboard.com/api-reference/session-recordings/initiate-session-audio-upload#authorization-x-access-token)

x-access-token

string

header

required

Organization API token. Generate from Organization Settings → API Tokens.

#### Path Parameters

[​](https://apidocs.sessionboard.com/api-reference/session-recordings/initiate-session-audio-upload#parameter-event-id)

eventId

integer

required

Event ID

[​](https://apidocs.sessionboard.com/api-reference/session-recordings/initiate-session-audio-upload#parameter-session-id)

sessionId

string<uuid>

required

Session UUID

#### Body

application/json

[​](https://apidocs.sessionboard.com/api-reference/session-recordings/initiate-session-audio-upload#body-filename)

filename

string

required

[​](https://apidocs.sessionboard.com/api-reference/session-recordings/initiate-session-audio-upload#body-size-bytes)

size\_bytes

integer

required

[​](https://apidocs.sessionboard.com/api-reference/session-recordings/initiate-session-audio-upload#body-content-type)

content\_type

string

#### Response

201

application/json

Created

[​](https://apidocs.sessionboard.com/api-reference/session-recordings/initiate-session-audio-upload#response-data)

data

object

Showchild attributes

Ctrl+I