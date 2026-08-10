---
url: "https://apidocs.sessionboard.com/api-reference/metadata-writes/update-a-room"
title: "Update a room - Sessionboard API"
---

> ## Documentation Index
>
> Fetch the complete documentation index at: [/llms.txt](https://apidocs.sessionboard.com/llms.txt)
>
> Use this file to discover all available pages before exploring further.

[Skip to main content](https://apidocs.sessionboard.com/api-reference/metadata-writes/update-a-room#content-area)

Update a room

cURL

```
curl --request PUT \
  --url https://public-api.sessionboard.com/v1/event/{eventId}/rooms/{id} \
  --header 'Content-Type: application/json' \
  --header 'x-access-token: <api-key>' \
  --data '
{
  "name": "<string>",
  "capacity": 123
}
'
```

```
import requests

url = "https://public-api.sessionboard.com/v1/event/{eventId}/rooms/{id}"

payload = {
    "name": "<string>",
    "capacity": 123
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
  body: JSON.stringify({name: '<string>', capacity: 123})
};

fetch('https://public-api.sessionboard.com/v1/event/{eventId}/rooms/{id}', options)
  .then(res => res.json())
  .then(res => console.log(res))
  .catch(err => console.error(err));
```

```
<?php

$curl = curl_init();

curl_setopt_array($curl, [\
  CURLOPT_URL => "https://public-api.sessionboard.com/v1/event/{eventId}/rooms/{id}",\
  CURLOPT_RETURNTRANSFER => true,\
  CURLOPT_ENCODING => "",\
  CURLOPT_MAXREDIRS => 10,\
  CURLOPT_TIMEOUT => 30,\
  CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,\
  CURLOPT_CUSTOMREQUEST => "PUT",\
  CURLOPT_POSTFIELDS => json_encode([\
    'name' => '<string>',\
    'capacity' => 123\
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

	url := "https://public-api.sessionboard.com/v1/event/{eventId}/rooms/{id}"

	payload := strings.NewReader("{\n  \"name\": \"<string>\",\n  \"capacity\": 123\n}")

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
HttpResponse<String> response = Unirest.put("https://public-api.sessionboard.com/v1/event/{eventId}/rooms/{id}")
  .header("x-access-token", "<api-key>")
  .header("Content-Type", "application/json")
  .body("{\n  \"name\": \"<string>\",\n  \"capacity\": 123\n}")
  .asString();
```

```
require 'uri'
require 'net/http'

url = URI("https://public-api.sessionboard.com/v1/event/{eventId}/rooms/{id}")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true

request = Net::HTTP::Put.new(url)
request["x-access-token"] = '<api-key>'
request["Content-Type"] = 'application/json'
request.body = "{\n  \"name\": \"<string>\",\n  \"capacity\": 123\n}"

response = http.request(request)
puts response.read_body
```

200

```
{
  "id": "3c90c3cc-0d44-4b50-8888-8dd25736052a",
  "name": "<string>",
  "order": 123,
  "capacity": 123,
  "created_at": "<string>",
  "updated_at": "<string>"
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

rooms

/

{id}

Try it

Update a room

cURL

```
curl --request PUT \
  --url https://public-api.sessionboard.com/v1/event/{eventId}/rooms/{id} \
  --header 'Content-Type: application/json' \
  --header 'x-access-token: <api-key>' \
  --data '
{
  "name": "<string>",
  "capacity": 123
}
'
```

```
import requests

url = "https://public-api.sessionboard.com/v1/event/{eventId}/rooms/{id}"

payload = {
    "name": "<string>",
    "capacity": 123
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
  body: JSON.stringify({name: '<string>', capacity: 123})
};

fetch('https://public-api.sessionboard.com/v1/event/{eventId}/rooms/{id}', options)
  .then(res => res.json())
  .then(res => console.log(res))
  .catch(err => console.error(err));
```

```
<?php

$curl = curl_init();

curl_setopt_array($curl, [\
  CURLOPT_URL => "https://public-api.sessionboard.com/v1/event/{eventId}/rooms/{id}",\
  CURLOPT_RETURNTRANSFER => true,\
  CURLOPT_ENCODING => "",\
  CURLOPT_MAXREDIRS => 10,\
  CURLOPT_TIMEOUT => 30,\
  CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,\
  CURLOPT_CUSTOMREQUEST => "PUT",\
  CURLOPT_POSTFIELDS => json_encode([\
    'name' => '<string>',\
    'capacity' => 123\
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

	url := "https://public-api.sessionboard.com/v1/event/{eventId}/rooms/{id}"

	payload := strings.NewReader("{\n  \"name\": \"<string>\",\n  \"capacity\": 123\n}")

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
HttpResponse<String> response = Unirest.put("https://public-api.sessionboard.com/v1/event/{eventId}/rooms/{id}")
  .header("x-access-token", "<api-key>")
  .header("Content-Type", "application/json")
  .body("{\n  \"name\": \"<string>\",\n  \"capacity\": 123\n}")
  .asString();
```

```
require 'uri'
require 'net/http'

url = URI("https://public-api.sessionboard.com/v1/event/{eventId}/rooms/{id}")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true

request = Net::HTTP::Put.new(url)
request["x-access-token"] = '<api-key>'
request["Content-Type"] = 'application/json'
request.body = "{\n  \"name\": \"<string>\",\n  \"capacity\": 123\n}"

response = http.request(request)
puts response.read_body
```

200

```
{
  "id": "3c90c3cc-0d44-4b50-8888-8dd25736052a",
  "name": "<string>",
  "order": 123,
  "capacity": 123,
  "created_at": "<string>",
  "updated_at": "<string>"
}
```

#### Authorizations

ApiKeyBearerTokenApiKeyBearerToken

[​](https://apidocs.sessionboard.com/api-reference/metadata-writes/update-a-room#authorization-x-access-token)

x-access-token

string

header

required

Organization API token. Generate from Organization Settings → API Tokens.

#### Path Parameters

[​](https://apidocs.sessionboard.com/api-reference/metadata-writes/update-a-room#parameter-event-id)

eventId

integer

required

[​](https://apidocs.sessionboard.com/api-reference/metadata-writes/update-a-room#parameter-id)

id

string

required

#### Body

application/json

[​](https://apidocs.sessionboard.com/api-reference/metadata-writes/update-a-room#body-name)

name

string

[​](https://apidocs.sessionboard.com/api-reference/metadata-writes/update-a-room#body-capacity)

capacity

integer

#### Response

200

application/json

Room updated

A room or venue location for sessions. When nested inside a `Session`
response, `room` is only populated when the session `location` is
`room` (not for external URLs).

[​](https://apidocs.sessionboard.com/api-reference/metadata-writes/update-a-room#response-id)

id

string<uuid>

[​](https://apidocs.sessionboard.com/api-reference/metadata-writes/update-a-room#response-name)

name

string

[​](https://apidocs.sessionboard.com/api-reference/metadata-writes/update-a-room#response-order)

order

integer

[​](https://apidocs.sessionboard.com/api-reference/metadata-writes/update-a-room#response-capacity-one-of-0)

capacity

integer \| null

Maximum room capacity. Returned on nested session `room` objects and
standalone room list/search endpoints.

[​](https://apidocs.sessionboard.com/api-reference/metadata-writes/update-a-room#response-created-at)

created\_at

string

[​](https://apidocs.sessionboard.com/api-reference/metadata-writes/update-a-room#response-updated-at)

updated\_at

string

Ctrl+I