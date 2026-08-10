---
url: "https://apidocs.sessionboard.com/api-reference/agenda-planning/update-a-persona"
title: "Update a persona - Sessionboard API"
---

> ## Documentation Index
>
> Fetch the complete documentation index at: [/llms.txt](https://apidocs.sessionboard.com/llms.txt)
>
> Use this file to discover all available pages before exploring further.

[Skip to main content](https://apidocs.sessionboard.com/api-reference/agenda-planning/update-a-persona#content-area)

Update a persona

cURL

```
curl --request PUT \
  --url https://public-api.sessionboard.com/v1/event/{eventId}/personas/{personaId} \
  --header 'Content-Type: application/json' \
  --header 'x-access-token: <api-key>' \
  --data '
{
  "name": "<string>",
  "description": "<string>",
  "config": {}
}
'
```

```
import requests

url = "https://public-api.sessionboard.com/v1/event/{eventId}/personas/{personaId}"

payload = {
    "name": "<string>",
    "description": "<string>",
    "config": {}
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
  body: JSON.stringify({name: '<string>', description: '<string>', config: {}})
};

fetch('https://public-api.sessionboard.com/v1/event/{eventId}/personas/{personaId}', options)
  .then(res => res.json())
  .then(res => console.log(res))
  .catch(err => console.error(err));
```

```
<?php

$curl = curl_init();

curl_setopt_array($curl, [\
  CURLOPT_URL => "https://public-api.sessionboard.com/v1/event/{eventId}/personas/{personaId}",\
  CURLOPT_RETURNTRANSFER => true,\
  CURLOPT_ENCODING => "",\
  CURLOPT_MAXREDIRS => 10,\
  CURLOPT_TIMEOUT => 30,\
  CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,\
  CURLOPT_CUSTOMREQUEST => "PUT",\
  CURLOPT_POSTFIELDS => json_encode([\
    'name' => '<string>',\
    'description' => '<string>',\
    'config' => [\
\
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

	url := "https://public-api.sessionboard.com/v1/event/{eventId}/personas/{personaId}"

	payload := strings.NewReader("{\n  \"name\": \"<string>\",\n  \"description\": \"<string>\",\n  \"config\": {}\n}")

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
HttpResponse<String> response = Unirest.put("https://public-api.sessionboard.com/v1/event/{eventId}/personas/{personaId}")
  .header("x-access-token", "<api-key>")
  .header("Content-Type", "application/json")
  .body("{\n  \"name\": \"<string>\",\n  \"description\": \"<string>\",\n  \"config\": {}\n}")
  .asString();
```

```
require 'uri'
require 'net/http'

url = URI("https://public-api.sessionboard.com/v1/event/{eventId}/personas/{personaId}")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true

request = Net::HTTP::Put.new(url)
request["x-access-token"] = '<api-key>'
request["Content-Type"] = 'application/json'
request.body = "{\n  \"name\": \"<string>\",\n  \"description\": \"<string>\",\n  \"config\": {}\n}"

response = http.request(request)
puts response.read_body
```

200

```
{
  "id": "3c90c3cc-0d44-4b50-8888-8dd25736052a",
  "event_id": 123,
  "name": "<string>",
  "description": "<string>",
  "config": {},
  "created_at": "2023-11-07T05:31:56Z",
  "updated_at": "2023-11-07T05:31:56Z"
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

personas

/

{personaId}

Try it

Update a persona

cURL

```
curl --request PUT \
  --url https://public-api.sessionboard.com/v1/event/{eventId}/personas/{personaId} \
  --header 'Content-Type: application/json' \
  --header 'x-access-token: <api-key>' \
  --data '
{
  "name": "<string>",
  "description": "<string>",
  "config": {}
}
'
```

```
import requests

url = "https://public-api.sessionboard.com/v1/event/{eventId}/personas/{personaId}"

payload = {
    "name": "<string>",
    "description": "<string>",
    "config": {}
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
  body: JSON.stringify({name: '<string>', description: '<string>', config: {}})
};

fetch('https://public-api.sessionboard.com/v1/event/{eventId}/personas/{personaId}', options)
  .then(res => res.json())
  .then(res => console.log(res))
  .catch(err => console.error(err));
```

```
<?php

$curl = curl_init();

curl_setopt_array($curl, [\
  CURLOPT_URL => "https://public-api.sessionboard.com/v1/event/{eventId}/personas/{personaId}",\
  CURLOPT_RETURNTRANSFER => true,\
  CURLOPT_ENCODING => "",\
  CURLOPT_MAXREDIRS => 10,\
  CURLOPT_TIMEOUT => 30,\
  CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,\
  CURLOPT_CUSTOMREQUEST => "PUT",\
  CURLOPT_POSTFIELDS => json_encode([\
    'name' => '<string>',\
    'description' => '<string>',\
    'config' => [\
\
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

	url := "https://public-api.sessionboard.com/v1/event/{eventId}/personas/{personaId}"

	payload := strings.NewReader("{\n  \"name\": \"<string>\",\n  \"description\": \"<string>\",\n  \"config\": {}\n}")

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
HttpResponse<String> response = Unirest.put("https://public-api.sessionboard.com/v1/event/{eventId}/personas/{personaId}")
  .header("x-access-token", "<api-key>")
  .header("Content-Type", "application/json")
  .body("{\n  \"name\": \"<string>\",\n  \"description\": \"<string>\",\n  \"config\": {}\n}")
  .asString();
```

```
require 'uri'
require 'net/http'

url = URI("https://public-api.sessionboard.com/v1/event/{eventId}/personas/{personaId}")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true

request = Net::HTTP::Put.new(url)
request["x-access-token"] = '<api-key>'
request["Content-Type"] = 'application/json'
request.body = "{\n  \"name\": \"<string>\",\n  \"description\": \"<string>\",\n  \"config\": {}\n}"

response = http.request(request)
puts response.read_body
```

200

```
{
  "id": "3c90c3cc-0d44-4b50-8888-8dd25736052a",
  "event_id": 123,
  "name": "<string>",
  "description": "<string>",
  "config": {},
  "created_at": "2023-11-07T05:31:56Z",
  "updated_at": "2023-11-07T05:31:56Z"
}
```

#### Authorizations

ApiKeyBearerTokenApiKeyBearerToken

[​](https://apidocs.sessionboard.com/api-reference/agenda-planning/update-a-persona#authorization-x-access-token)

x-access-token

string

header

required

Organization API token. Generate from Organization Settings → API Tokens.

#### Path Parameters

[​](https://apidocs.sessionboard.com/api-reference/agenda-planning/update-a-persona#parameter-event-id)

eventId

integer

required

[​](https://apidocs.sessionboard.com/api-reference/agenda-planning/update-a-persona#parameter-persona-id)

personaId

string<uuid>

required

#### Body

application/json

[​](https://apidocs.sessionboard.com/api-reference/agenda-planning/update-a-persona#body-name)

name

string

[​](https://apidocs.sessionboard.com/api-reference/agenda-planning/update-a-persona#body-description)

description

string

[​](https://apidocs.sessionboard.com/api-reference/agenda-planning/update-a-persona#body-config)

config

object

#### Response

200

application/json

Persona updated

An evaluation persona representing an attendee type for schedule evaluation.

[​](https://apidocs.sessionboard.com/api-reference/agenda-planning/update-a-persona#response-id)

id

string<uuid>

[​](https://apidocs.sessionboard.com/api-reference/agenda-planning/update-a-persona#response-event-id)

event\_id

integer

[​](https://apidocs.sessionboard.com/api-reference/agenda-planning/update-a-persona#response-name)

name

string

[​](https://apidocs.sessionboard.com/api-reference/agenda-planning/update-a-persona#response-description)

description

string

[​](https://apidocs.sessionboard.com/api-reference/agenda-planning/update-a-persona#response-config)

config

object

[​](https://apidocs.sessionboard.com/api-reference/agenda-planning/update-a-persona#response-created-at)

created\_at

string<date-time>

[​](https://apidocs.sessionboard.com/api-reference/agenda-planning/update-a-persona#response-updated-at)

updated\_at

string<date-time>

Ctrl+I