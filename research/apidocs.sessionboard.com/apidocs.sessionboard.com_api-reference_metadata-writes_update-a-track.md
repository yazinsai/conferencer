---
url: "https://apidocs.sessionboard.com/api-reference/metadata-writes/update-a-track"
title: "Update a track - Sessionboard API"
---

> ## Documentation Index
>
> Fetch the complete documentation index at: [/llms.txt](https://apidocs.sessionboard.com/llms.txt)
>
> Use this file to discover all available pages before exploring further.

[Skip to main content](https://apidocs.sessionboard.com/api-reference/metadata-writes/update-a-track#content-area)

Update a track

cURL

```
curl --request PUT \
  --url https://public-api.sessionboard.com/v1/event/{eventId}/tracks/{id} \
  --header 'Content-Type: application/json' \
  --header 'x-access-token: <api-key>' \
  --data '
{
  "name": "<string>",
  "color": "<string>"
}
'
```

```
import requests

url = "https://public-api.sessionboard.com/v1/event/{eventId}/tracks/{id}"

payload = {
    "name": "<string>",
    "color": "<string>"
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
  body: JSON.stringify({name: '<string>', color: '<string>'})
};

fetch('https://public-api.sessionboard.com/v1/event/{eventId}/tracks/{id}', options)
  .then(res => res.json())
  .then(res => console.log(res))
  .catch(err => console.error(err));
```

```
<?php

$curl = curl_init();

curl_setopt_array($curl, [\
  CURLOPT_URL => "https://public-api.sessionboard.com/v1/event/{eventId}/tracks/{id}",\
  CURLOPT_RETURNTRANSFER => true,\
  CURLOPT_ENCODING => "",\
  CURLOPT_MAXREDIRS => 10,\
  CURLOPT_TIMEOUT => 30,\
  CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,\
  CURLOPT_CUSTOMREQUEST => "PUT",\
  CURLOPT_POSTFIELDS => json_encode([\
    'name' => '<string>',\
    'color' => '<string>'\
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

	url := "https://public-api.sessionboard.com/v1/event/{eventId}/tracks/{id}"

	payload := strings.NewReader("{\n  \"name\": \"<string>\",\n  \"color\": \"<string>\"\n}")

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
HttpResponse<String> response = Unirest.put("https://public-api.sessionboard.com/v1/event/{eventId}/tracks/{id}")
  .header("x-access-token", "<api-key>")
  .header("Content-Type", "application/json")
  .body("{\n  \"name\": \"<string>\",\n  \"color\": \"<string>\"\n}")
  .asString();
```

```
require 'uri'
require 'net/http'

url = URI("https://public-api.sessionboard.com/v1/event/{eventId}/tracks/{id}")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true

request = Net::HTTP::Put.new(url)
request["x-access-token"] = '<api-key>'
request["Content-Type"] = 'application/json'
request.body = "{\n  \"name\": \"<string>\",\n  \"color\": \"<string>\"\n}"

response = http.request(request)
puts response.read_body
```

200

```
{
  "id": "3c90c3cc-0d44-4b50-8888-8dd25736052a",
  "event_id": 123,
  "name": "<string>",
  "color": "<string>",
  "order": 123,
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

tracks

/

{id}

Try it

Update a track

cURL

```
curl --request PUT \
  --url https://public-api.sessionboard.com/v1/event/{eventId}/tracks/{id} \
  --header 'Content-Type: application/json' \
  --header 'x-access-token: <api-key>' \
  --data '
{
  "name": "<string>",
  "color": "<string>"
}
'
```

```
import requests

url = "https://public-api.sessionboard.com/v1/event/{eventId}/tracks/{id}"

payload = {
    "name": "<string>",
    "color": "<string>"
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
  body: JSON.stringify({name: '<string>', color: '<string>'})
};

fetch('https://public-api.sessionboard.com/v1/event/{eventId}/tracks/{id}', options)
  .then(res => res.json())
  .then(res => console.log(res))
  .catch(err => console.error(err));
```

```
<?php

$curl = curl_init();

curl_setopt_array($curl, [\
  CURLOPT_URL => "https://public-api.sessionboard.com/v1/event/{eventId}/tracks/{id}",\
  CURLOPT_RETURNTRANSFER => true,\
  CURLOPT_ENCODING => "",\
  CURLOPT_MAXREDIRS => 10,\
  CURLOPT_TIMEOUT => 30,\
  CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,\
  CURLOPT_CUSTOMREQUEST => "PUT",\
  CURLOPT_POSTFIELDS => json_encode([\
    'name' => '<string>',\
    'color' => '<string>'\
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

	url := "https://public-api.sessionboard.com/v1/event/{eventId}/tracks/{id}"

	payload := strings.NewReader("{\n  \"name\": \"<string>\",\n  \"color\": \"<string>\"\n}")

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
HttpResponse<String> response = Unirest.put("https://public-api.sessionboard.com/v1/event/{eventId}/tracks/{id}")
  .header("x-access-token", "<api-key>")
  .header("Content-Type", "application/json")
  .body("{\n  \"name\": \"<string>\",\n  \"color\": \"<string>\"\n}")
  .asString();
```

```
require 'uri'
require 'net/http'

url = URI("https://public-api.sessionboard.com/v1/event/{eventId}/tracks/{id}")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true

request = Net::HTTP::Put.new(url)
request["x-access-token"] = '<api-key>'
request["Content-Type"] = 'application/json'
request.body = "{\n  \"name\": \"<string>\",\n  \"color\": \"<string>\"\n}"

response = http.request(request)
puts response.read_body
```

200

```
{
  "id": "3c90c3cc-0d44-4b50-8888-8dd25736052a",
  "event_id": 123,
  "name": "<string>",
  "color": "<string>",
  "order": 123,
  "created_at": "<string>",
  "updated_at": "<string>"
}
```

#### Authorizations

ApiKeyBearerTokenApiKeyBearerToken

[​](https://apidocs.sessionboard.com/api-reference/metadata-writes/update-a-track#authorization-x-access-token)

x-access-token

string

header

required

Organization API token. Generate from Organization Settings → API Tokens.

#### Path Parameters

[​](https://apidocs.sessionboard.com/api-reference/metadata-writes/update-a-track#parameter-event-id)

eventId

integer

required

[​](https://apidocs.sessionboard.com/api-reference/metadata-writes/update-a-track#parameter-id)

id

string

required

#### Body

application/json

[​](https://apidocs.sessionboard.com/api-reference/metadata-writes/update-a-track#body-name)

name

string

[​](https://apidocs.sessionboard.com/api-reference/metadata-writes/update-a-track#body-color)

color

string

#### Response

200

application/json

Track updated

A session track (e.g., a conference track or topic area).

When nested inside a `Session` response, includes `event_id`. Standalone
metadata list and search endpoints (`GET`/`POST /tracks`) omit `event_id`
because the event is implicit from the URL.

[​](https://apidocs.sessionboard.com/api-reference/metadata-writes/update-a-track#response-id)

id

string<uuid>

[​](https://apidocs.sessionboard.com/api-reference/metadata-writes/update-a-track#response-event-id)

event\_id

integer

[​](https://apidocs.sessionboard.com/api-reference/metadata-writes/update-a-track#response-name)

name

string

[​](https://apidocs.sessionboard.com/api-reference/metadata-writes/update-a-track#response-color)

color

string

[​](https://apidocs.sessionboard.com/api-reference/metadata-writes/update-a-track#response-order)

order

integer

[​](https://apidocs.sessionboard.com/api-reference/metadata-writes/update-a-track#response-created-at)

created\_at

string

[​](https://apidocs.sessionboard.com/api-reference/metadata-writes/update-a-track#response-updated-at)

updated\_at

string

Ctrl+I