---
url: "https://apidocs.sessionboard.com/api-reference/agenda-planning/create-an-agenda-draft"
title: "Create an agenda draft - Sessionboard API"
---

> ## Documentation Index
>
> Fetch the complete documentation index at: [/llms.txt](https://apidocs.sessionboard.com/llms.txt)
>
> Use this file to discover all available pages before exploring further.

[Skip to main content](https://apidocs.sessionboard.com/api-reference/agenda-planning/create-an-agenda-draft#content-area)

Create an agenda draft

cURL

```
curl --request POST \
  --url https://public-api.sessionboard.com/v1/event/{eventId}/agenda-drafts/create \
  --header 'Content-Type: application/json' \
  --header 'x-access-token: <api-key>' \
  --data '
{
  "name": "<string>",
  "description": "<string>"
}
'
```

```
import requests

url = "https://public-api.sessionboard.com/v1/event/{eventId}/agenda-drafts/create"

payload = {
    "name": "<string>",
    "description": "<string>"
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
  body: JSON.stringify({name: '<string>', description: '<string>'})
};

fetch('https://public-api.sessionboard.com/v1/event/{eventId}/agenda-drafts/create', options)
  .then(res => res.json())
  .then(res => console.log(res))
  .catch(err => console.error(err));
```

```
<?php

$curl = curl_init();

curl_setopt_array($curl, [\
  CURLOPT_URL => "https://public-api.sessionboard.com/v1/event/{eventId}/agenda-drafts/create",\
  CURLOPT_RETURNTRANSFER => true,\
  CURLOPT_ENCODING => "",\
  CURLOPT_MAXREDIRS => 10,\
  CURLOPT_TIMEOUT => 30,\
  CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,\
  CURLOPT_CUSTOMREQUEST => "POST",\
  CURLOPT_POSTFIELDS => json_encode([\
    'name' => '<string>',\
    'description' => '<string>'\
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

	url := "https://public-api.sessionboard.com/v1/event/{eventId}/agenda-drafts/create"

	payload := strings.NewReader("{\n  \"name\": \"<string>\",\n  \"description\": \"<string>\"\n}")

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
HttpResponse<String> response = Unirest.post("https://public-api.sessionboard.com/v1/event/{eventId}/agenda-drafts/create")
  .header("x-access-token", "<api-key>")
  .header("Content-Type", "application/json")
  .body("{\n  \"name\": \"<string>\",\n  \"description\": \"<string>\"\n}")
  .asString();
```

```
require 'uri'
require 'net/http'

url = URI("https://public-api.sessionboard.com/v1/event/{eventId}/agenda-drafts/create")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true

request = Net::HTTP::Post.new(url)
request["x-access-token"] = '<api-key>'
request["Content-Type"] = 'application/json'
request.body = "{\n  \"name\": \"<string>\",\n  \"description\": \"<string>\"\n}"

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
  "created_at": "2023-11-07T05:31:56Z",
  "updated_at": "2023-11-07T05:31:56Z",
  "admin_url": "<string>"
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

agenda-drafts

/

create

Try it

Create an agenda draft

cURL

```
curl --request POST \
  --url https://public-api.sessionboard.com/v1/event/{eventId}/agenda-drafts/create \
  --header 'Content-Type: application/json' \
  --header 'x-access-token: <api-key>' \
  --data '
{
  "name": "<string>",
  "description": "<string>"
}
'
```

```
import requests

url = "https://public-api.sessionboard.com/v1/event/{eventId}/agenda-drafts/create"

payload = {
    "name": "<string>",
    "description": "<string>"
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
  body: JSON.stringify({name: '<string>', description: '<string>'})
};

fetch('https://public-api.sessionboard.com/v1/event/{eventId}/agenda-drafts/create', options)
  .then(res => res.json())
  .then(res => console.log(res))
  .catch(err => console.error(err));
```

```
<?php

$curl = curl_init();

curl_setopt_array($curl, [\
  CURLOPT_URL => "https://public-api.sessionboard.com/v1/event/{eventId}/agenda-drafts/create",\
  CURLOPT_RETURNTRANSFER => true,\
  CURLOPT_ENCODING => "",\
  CURLOPT_MAXREDIRS => 10,\
  CURLOPT_TIMEOUT => 30,\
  CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,\
  CURLOPT_CUSTOMREQUEST => "POST",\
  CURLOPT_POSTFIELDS => json_encode([\
    'name' => '<string>',\
    'description' => '<string>'\
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

	url := "https://public-api.sessionboard.com/v1/event/{eventId}/agenda-drafts/create"

	payload := strings.NewReader("{\n  \"name\": \"<string>\",\n  \"description\": \"<string>\"\n}")

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
HttpResponse<String> response = Unirest.post("https://public-api.sessionboard.com/v1/event/{eventId}/agenda-drafts/create")
  .header("x-access-token", "<api-key>")
  .header("Content-Type", "application/json")
  .body("{\n  \"name\": \"<string>\",\n  \"description\": \"<string>\"\n}")
  .asString();
```

```
require 'uri'
require 'net/http'

url = URI("https://public-api.sessionboard.com/v1/event/{eventId}/agenda-drafts/create")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true

request = Net::HTTP::Post.new(url)
request["x-access-token"] = '<api-key>'
request["Content-Type"] = 'application/json'
request.body = "{\n  \"name\": \"<string>\",\n  \"description\": \"<string>\"\n}"

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
  "created_at": "2023-11-07T05:31:56Z",
  "updated_at": "2023-11-07T05:31:56Z",
  "admin_url": "<string>"
}
```

#### Authorizations

ApiKeyBearerTokenApiKeyBearerToken

[​](https://apidocs.sessionboard.com/api-reference/agenda-planning/create-an-agenda-draft#authorization-x-access-token)

x-access-token

string

header

required

Organization API token. Generate from Organization Settings → API Tokens.

#### Path Parameters

[​](https://apidocs.sessionboard.com/api-reference/agenda-planning/create-an-agenda-draft#parameter-event-id)

eventId

integer

required

The event ID.

#### Body

application/json

[​](https://apidocs.sessionboard.com/api-reference/agenda-planning/create-an-agenda-draft#body-name)

name

string

required

Draft name.

[​](https://apidocs.sessionboard.com/api-reference/agenda-planning/create-an-agenda-draft#body-description)

description

string

Optional description.

#### Response

200

application/json

Draft created

An agenda draft workspace for planning session schedule changes before committing them to the live event.

[​](https://apidocs.sessionboard.com/api-reference/agenda-planning/create-an-agenda-draft#response-id)

id

string<uuid>

[​](https://apidocs.sessionboard.com/api-reference/agenda-planning/create-an-agenda-draft#response-event-id)

event\_id

integer

[​](https://apidocs.sessionboard.com/api-reference/agenda-planning/create-an-agenda-draft#response-name)

name

string

[​](https://apidocs.sessionboard.com/api-reference/agenda-planning/create-an-agenda-draft#response-description)

description

string

[​](https://apidocs.sessionboard.com/api-reference/agenda-planning/create-an-agenda-draft#response-status)

status

enum<string>

Available options:

`draft`,

`committed`

[​](https://apidocs.sessionboard.com/api-reference/agenda-planning/create-an-agenda-draft#response-created-at)

created\_at

string<date-time>

[​](https://apidocs.sessionboard.com/api-reference/agenda-planning/create-an-agenda-draft#response-updated-at)

updated\_at

string<date-time>

[​](https://apidocs.sessionboard.com/api-reference/agenda-planning/create-an-agenda-draft#response-admin-url-one-of-0)

admin\_url

string<uri> \| null

Deep link to this entity in the Sessionboard admin UI.

Ctrl+I