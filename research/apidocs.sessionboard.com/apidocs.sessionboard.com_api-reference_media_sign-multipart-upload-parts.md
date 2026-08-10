---
url: "https://apidocs.sessionboard.com/api-reference/media/sign-multipart-upload-parts"
title: "Sign multipart upload parts - Sessionboard API"
---

> ## Documentation Index
>
> Fetch the complete documentation index at: [/llms.txt](https://apidocs.sessionboard.com/llms.txt)
>
> Use this file to discover all available pages before exploring further.

[Skip to main content](https://apidocs.sessionboard.com/api-reference/media/sign-multipart-upload-parts#content-area)

Sign multipart upload parts

cURL

```
curl --request POST \
  --url https://public-api.sessionboard.com/v1/event/{eventId}/sessions/{sessionId}/media/upload/sign-part \
  --header 'Content-Type: application/json' \
  --header 'x-access-token: <api-key>' \
  --data '
{
  "key": "<string>",
  "upload_id": "<string>",
  "part_numbers": [\
    123\
  ]
}
'
```

```
import requests

url = "https://public-api.sessionboard.com/v1/event/{eventId}/sessions/{sessionId}/media/upload/sign-part"

payload = {
    "key": "<string>",
    "upload_id": "<string>",
    "part_numbers": [123]
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
  body: JSON.stringify({key: '<string>', upload_id: '<string>', part_numbers: [123]})
};

fetch('https://public-api.sessionboard.com/v1/event/{eventId}/sessions/{sessionId}/media/upload/sign-part', options)
  .then(res => res.json())
  .then(res => console.log(res))
  .catch(err => console.error(err));
```

```
<?php

$curl = curl_init();

curl_setopt_array($curl, [\
  CURLOPT_URL => "https://public-api.sessionboard.com/v1/event/{eventId}/sessions/{sessionId}/media/upload/sign-part",\
  CURLOPT_RETURNTRANSFER => true,\
  CURLOPT_ENCODING => "",\
  CURLOPT_MAXREDIRS => 10,\
  CURLOPT_TIMEOUT => 30,\
  CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,\
  CURLOPT_CUSTOMREQUEST => "POST",\
  CURLOPT_POSTFIELDS => json_encode([\
    'key' => '<string>',\
    'upload_id' => '<string>',\
    'part_numbers' => [\
        123\
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

	url := "https://public-api.sessionboard.com/v1/event/{eventId}/sessions/{sessionId}/media/upload/sign-part"

	payload := strings.NewReader("{\n  \"key\": \"<string>\",\n  \"upload_id\": \"<string>\",\n  \"part_numbers\": [\n    123\n  ]\n}")

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
HttpResponse<String> response = Unirest.post("https://public-api.sessionboard.com/v1/event/{eventId}/sessions/{sessionId}/media/upload/sign-part")
  .header("x-access-token", "<api-key>")
  .header("Content-Type", "application/json")
  .body("{\n  \"key\": \"<string>\",\n  \"upload_id\": \"<string>\",\n  \"part_numbers\": [\n    123\n  ]\n}")
  .asString();
```

```
require 'uri'
require 'net/http'

url = URI("https://public-api.sessionboard.com/v1/event/{eventId}/sessions/{sessionId}/media/upload/sign-part")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true

request = Net::HTTP::Post.new(url)
request["x-access-token"] = '<api-key>'
request["Content-Type"] = 'application/json'
request.body = "{\n  \"key\": \"<string>\",\n  \"upload_id\": \"<string>\",\n  \"part_numbers\": [\n    123\n  ]\n}"

response = http.request(request)
puts response.read_body
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

media

/

upload

/

sign-part

Try it

Sign multipart upload parts

cURL

```
curl --request POST \
  --url https://public-api.sessionboard.com/v1/event/{eventId}/sessions/{sessionId}/media/upload/sign-part \
  --header 'Content-Type: application/json' \
  --header 'x-access-token: <api-key>' \
  --data '
{
  "key": "<string>",
  "upload_id": "<string>",
  "part_numbers": [\
    123\
  ]
}
'
```

```
import requests

url = "https://public-api.sessionboard.com/v1/event/{eventId}/sessions/{sessionId}/media/upload/sign-part"

payload = {
    "key": "<string>",
    "upload_id": "<string>",
    "part_numbers": [123]
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
  body: JSON.stringify({key: '<string>', upload_id: '<string>', part_numbers: [123]})
};

fetch('https://public-api.sessionboard.com/v1/event/{eventId}/sessions/{sessionId}/media/upload/sign-part', options)
  .then(res => res.json())
  .then(res => console.log(res))
  .catch(err => console.error(err));
```

```
<?php

$curl = curl_init();

curl_setopt_array($curl, [\
  CURLOPT_URL => "https://public-api.sessionboard.com/v1/event/{eventId}/sessions/{sessionId}/media/upload/sign-part",\
  CURLOPT_RETURNTRANSFER => true,\
  CURLOPT_ENCODING => "",\
  CURLOPT_MAXREDIRS => 10,\
  CURLOPT_TIMEOUT => 30,\
  CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,\
  CURLOPT_CUSTOMREQUEST => "POST",\
  CURLOPT_POSTFIELDS => json_encode([\
    'key' => '<string>',\
    'upload_id' => '<string>',\
    'part_numbers' => [\
        123\
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

	url := "https://public-api.sessionboard.com/v1/event/{eventId}/sessions/{sessionId}/media/upload/sign-part"

	payload := strings.NewReader("{\n  \"key\": \"<string>\",\n  \"upload_id\": \"<string>\",\n  \"part_numbers\": [\n    123\n  ]\n}")

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
HttpResponse<String> response = Unirest.post("https://public-api.sessionboard.com/v1/event/{eventId}/sessions/{sessionId}/media/upload/sign-part")
  .header("x-access-token", "<api-key>")
  .header("Content-Type", "application/json")
  .body("{\n  \"key\": \"<string>\",\n  \"upload_id\": \"<string>\",\n  \"part_numbers\": [\n    123\n  ]\n}")
  .asString();
```

```
require 'uri'
require 'net/http'

url = URI("https://public-api.sessionboard.com/v1/event/{eventId}/sessions/{sessionId}/media/upload/sign-part")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true

request = Net::HTTP::Post.new(url)
request["x-access-token"] = '<api-key>'
request["Content-Type"] = 'application/json'
request.body = "{\n  \"key\": \"<string>\",\n  \"upload_id\": \"<string>\",\n  \"part_numbers\": [\n    123\n  ]\n}"

response = http.request(request)
puts response.read_body
```

#### Authorizations

ApiKeyBearerTokenApiKeyBearerToken

[​](https://apidocs.sessionboard.com/api-reference/media/sign-multipart-upload-parts#authorization-x-access-token)

x-access-token

string

header

required

Organization API token. Generate from Organization Settings → API Tokens.

#### Path Parameters

[​](https://apidocs.sessionboard.com/api-reference/media/sign-multipart-upload-parts#parameter-event-id)

eventId

integer

required

Event ID

[​](https://apidocs.sessionboard.com/api-reference/media/sign-multipart-upload-parts#parameter-session-id)

sessionId

string<uuid>

required

Session UUID

#### Body

application/json

[​](https://apidocs.sessionboard.com/api-reference/media/sign-multipart-upload-parts#body-key)

key

string

required

[​](https://apidocs.sessionboard.com/api-reference/media/sign-multipart-upload-parts#body-upload-id)

upload\_id

string

required

[​](https://apidocs.sessionboard.com/api-reference/media/sign-multipart-upload-parts#body-part-numbers)

part\_numbers

integer\[\]

required

#### Response

200

OK

Ctrl+I