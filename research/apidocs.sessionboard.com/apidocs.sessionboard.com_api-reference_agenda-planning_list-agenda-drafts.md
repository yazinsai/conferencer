---
url: "https://apidocs.sessionboard.com/api-reference/agenda-planning/list-agenda-drafts"
title: "List agenda drafts - Sessionboard API"
---

> ## Documentation Index
>
> Fetch the complete documentation index at: [/llms.txt](https://apidocs.sessionboard.com/llms.txt)
>
> Use this file to discover all available pages before exploring further.

[Skip to main content](https://apidocs.sessionboard.com/api-reference/agenda-planning/list-agenda-drafts#content-area)

List agenda drafts

cURL

```
curl --request GET \
  --url https://public-api.sessionboard.com/v1/event/{eventId}/agenda-drafts \
  --header 'x-access-token: <api-key>'
```

```
import requests

url = "https://public-api.sessionboard.com/v1/event/{eventId}/agenda-drafts"

headers = {"x-access-token": "<api-key>"}

response = requests.get(url, headers=headers)

print(response.text)
```

```
const options = {method: 'GET', headers: {'x-access-token': '<api-key>'}};

fetch('https://public-api.sessionboard.com/v1/event/{eventId}/agenda-drafts', options)
  .then(res => res.json())
  .then(res => console.log(res))
  .catch(err => console.error(err));
```

```
<?php

$curl = curl_init();

curl_setopt_array($curl, [\
  CURLOPT_URL => "https://public-api.sessionboard.com/v1/event/{eventId}/agenda-drafts",\
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

	url := "https://public-api.sessionboard.com/v1/event/{eventId}/agenda-drafts"

	req, _ := http.NewRequest("GET", url, nil)

	req.Header.Add("x-access-token", "<api-key>")

	res, _ := http.DefaultClient.Do(req)

	defer res.Body.Close()
	body, _ := io.ReadAll(res.Body)

	fmt.Println(string(body))

}
```

```
HttpResponse<String> response = Unirest.get("https://public-api.sessionboard.com/v1/event/{eventId}/agenda-drafts")
  .header("x-access-token", "<api-key>")
  .asString();
```

```
require 'uri'
require 'net/http'

url = URI("https://public-api.sessionboard.com/v1/event/{eventId}/agenda-drafts")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true

request = Net::HTTP::Get.new(url)
request["x-access-token"] = '<api-key>'

response = http.request(request)
puts response.read_body
```

200

```
[\
  {\
    "id": "3c90c3cc-0d44-4b50-8888-8dd25736052a",\
    "event_id": 123,\
    "name": "<string>",\
    "description": "<string>",\
    "created_at": "2023-11-07T05:31:56Z",\
    "updated_at": "2023-11-07T05:31:56Z",\
    "admin_url": "<string>"\
  }\
]
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

agenda-drafts

Try it

List agenda drafts

cURL

```
curl --request GET \
  --url https://public-api.sessionboard.com/v1/event/{eventId}/agenda-drafts \
  --header 'x-access-token: <api-key>'
```

```
import requests

url = "https://public-api.sessionboard.com/v1/event/{eventId}/agenda-drafts"

headers = {"x-access-token": "<api-key>"}

response = requests.get(url, headers=headers)

print(response.text)
```

```
const options = {method: 'GET', headers: {'x-access-token': '<api-key>'}};

fetch('https://public-api.sessionboard.com/v1/event/{eventId}/agenda-drafts', options)
  .then(res => res.json())
  .then(res => console.log(res))
  .catch(err => console.error(err));
```

```
<?php

$curl = curl_init();

curl_setopt_array($curl, [\
  CURLOPT_URL => "https://public-api.sessionboard.com/v1/event/{eventId}/agenda-drafts",\
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

	url := "https://public-api.sessionboard.com/v1/event/{eventId}/agenda-drafts"

	req, _ := http.NewRequest("GET", url, nil)

	req.Header.Add("x-access-token", "<api-key>")

	res, _ := http.DefaultClient.Do(req)

	defer res.Body.Close()
	body, _ := io.ReadAll(res.Body)

	fmt.Println(string(body))

}
```

```
HttpResponse<String> response = Unirest.get("https://public-api.sessionboard.com/v1/event/{eventId}/agenda-drafts")
  .header("x-access-token", "<api-key>")
  .asString();
```

```
require 'uri'
require 'net/http'

url = URI("https://public-api.sessionboard.com/v1/event/{eventId}/agenda-drafts")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true

request = Net::HTTP::Get.new(url)
request["x-access-token"] = '<api-key>'

response = http.request(request)
puts response.read_body
```

200

```
[\
  {\
    "id": "3c90c3cc-0d44-4b50-8888-8dd25736052a",\
    "event_id": 123,\
    "name": "<string>",\
    "description": "<string>",\
    "created_at": "2023-11-07T05:31:56Z",\
    "updated_at": "2023-11-07T05:31:56Z",\
    "admin_url": "<string>"\
  }\
]
```

#### Authorizations

ApiKeyBearerTokenApiKeyBearerToken

[​](https://apidocs.sessionboard.com/api-reference/agenda-planning/list-agenda-drafts#authorization-x-access-token)

x-access-token

string

header

required

Organization API token. Generate from Organization Settings → API Tokens.

#### Path Parameters

[​](https://apidocs.sessionboard.com/api-reference/agenda-planning/list-agenda-drafts#parameter-event-id)

eventId

integer

required

The event ID.

#### Response

200

application/json

OK

[​](https://apidocs.sessionboard.com/api-reference/agenda-planning/list-agenda-drafts#response-items-id)

id

string<uuid>

[​](https://apidocs.sessionboard.com/api-reference/agenda-planning/list-agenda-drafts#response-items-event-id)

event\_id

integer

[​](https://apidocs.sessionboard.com/api-reference/agenda-planning/list-agenda-drafts#response-items-name)

name

string

[​](https://apidocs.sessionboard.com/api-reference/agenda-planning/list-agenda-drafts#response-items-description)

description

string

[​](https://apidocs.sessionboard.com/api-reference/agenda-planning/list-agenda-drafts#response-items-status)

status

enum<string>

Available options:

`draft`,

`committed`

[​](https://apidocs.sessionboard.com/api-reference/agenda-planning/list-agenda-drafts#response-items-created-at)

created\_at

string<date-time>

[​](https://apidocs.sessionboard.com/api-reference/agenda-planning/list-agenda-drafts#response-items-updated-at)

updated\_at

string<date-time>

[​](https://apidocs.sessionboard.com/api-reference/agenda-planning/list-agenda-drafts#response-items-admin-url-one-of-0)

admin\_url

string<uri> \| null

Deep link to this entity in the Sessionboard admin UI.

⌘I