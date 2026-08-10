---
url: "https://apidocs.sessionboard.com/api-reference/event-settings/list-session-statuses"
title: "List session statuses - Sessionboard API"
---

> ## Documentation Index
>
> Fetch the complete documentation index at: [/llms.txt](https://apidocs.sessionboard.com/llms.txt)
>
> Use this file to discover all available pages before exploring further.

[Skip to main content](https://apidocs.sessionboard.com/api-reference/event-settings/list-session-statuses#content-area)

List session statuses

cURL

```
curl --request GET \
  --url https://public-api.sessionboard.com/v1/event/{eventId}/statuses \
  --header 'x-access-token: <api-key>'
```

```
import requests

url = "https://public-api.sessionboard.com/v1/event/{eventId}/statuses"

headers = {"x-access-token": "<api-key>"}

response = requests.get(url, headers=headers)

print(response.text)
```

```
const options = {method: 'GET', headers: {'x-access-token': '<api-key>'}};

fetch('https://public-api.sessionboard.com/v1/event/{eventId}/statuses', options)
  .then(res => res.json())
  .then(res => console.log(res))
  .catch(err => console.error(err));
```

```
<?php

$curl = curl_init();

curl_setopt_array($curl, [\
  CURLOPT_URL => "https://public-api.sessionboard.com/v1/event/{eventId}/statuses",\
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

	url := "https://public-api.sessionboard.com/v1/event/{eventId}/statuses"

	req, _ := http.NewRequest("GET", url, nil)

	req.Header.Add("x-access-token", "<api-key>")

	res, _ := http.DefaultClient.Do(req)

	defer res.Body.Close()
	body, _ := io.ReadAll(res.Body)

	fmt.Println(string(body))

}
```

```
HttpResponse<String> response = Unirest.get("https://public-api.sessionboard.com/v1/event/{eventId}/statuses")
  .header("x-access-token", "<api-key>")
  .asString();
```

```
require 'uri'
require 'net/http'

url = URI("https://public-api.sessionboard.com/v1/event/{eventId}/statuses")

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
    "id": "<string>",\
    "name": "<string>",\
    "status": "<string>",\
    "status_name": "<string>",\
    "color": "<string>",\
    "order": 123,\
    "is_custom": true,\
    "created_at": "<string>",\
    "created_by_user_id": 123,\
    "created_by_user_name": "<string>"\
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

statuses

Try it

List session statuses

cURL

```
curl --request GET \
  --url https://public-api.sessionboard.com/v1/event/{eventId}/statuses \
  --header 'x-access-token: <api-key>'
```

```
import requests

url = "https://public-api.sessionboard.com/v1/event/{eventId}/statuses"

headers = {"x-access-token": "<api-key>"}

response = requests.get(url, headers=headers)

print(response.text)
```

```
const options = {method: 'GET', headers: {'x-access-token': '<api-key>'}};

fetch('https://public-api.sessionboard.com/v1/event/{eventId}/statuses', options)
  .then(res => res.json())
  .then(res => console.log(res))
  .catch(err => console.error(err));
```

```
<?php

$curl = curl_init();

curl_setopt_array($curl, [\
  CURLOPT_URL => "https://public-api.sessionboard.com/v1/event/{eventId}/statuses",\
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

	url := "https://public-api.sessionboard.com/v1/event/{eventId}/statuses"

	req, _ := http.NewRequest("GET", url, nil)

	req.Header.Add("x-access-token", "<api-key>")

	res, _ := http.DefaultClient.Do(req)

	defer res.Body.Close()
	body, _ := io.ReadAll(res.Body)

	fmt.Println(string(body))

}
```

```
HttpResponse<String> response = Unirest.get("https://public-api.sessionboard.com/v1/event/{eventId}/statuses")
  .header("x-access-token", "<api-key>")
  .asString();
```

```
require 'uri'
require 'net/http'

url = URI("https://public-api.sessionboard.com/v1/event/{eventId}/statuses")

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
    "id": "<string>",\
    "name": "<string>",\
    "status": "<string>",\
    "status_name": "<string>",\
    "color": "<string>",\
    "order": 123,\
    "is_custom": true,\
    "created_at": "<string>",\
    "created_by_user_id": 123,\
    "created_by_user_name": "<string>"\
  }\
]
```

#### Authorizations

ApiKeyBearerTokenApiKeyBearerToken

[​](https://apidocs.sessionboard.com/api-reference/event-settings/list-session-statuses#authorization-x-access-token)

x-access-token

string

header

required

Organization API token. Generate from Organization Settings → API Tokens.

#### Path Parameters

[​](https://apidocs.sessionboard.com/api-reference/event-settings/list-session-statuses#parameter-event-id)

eventId

integer

required

The event ID.

#### Response

200

application/json

OK

[​](https://apidocs.sessionboard.com/api-reference/event-settings/list-session-statuses#response-items-id)

id

string

[​](https://apidocs.sessionboard.com/api-reference/event-settings/list-session-statuses#response-items-name)

name

string

[​](https://apidocs.sessionboard.com/api-reference/event-settings/list-session-statuses#response-items-status-one-of-0)

status

string \| null

[​](https://apidocs.sessionboard.com/api-reference/event-settings/list-session-statuses#response-items-status-name-one-of-0)

status\_name

string \| null

[​](https://apidocs.sessionboard.com/api-reference/event-settings/list-session-statuses#response-items-color)

color

string

[​](https://apidocs.sessionboard.com/api-reference/event-settings/list-session-statuses#response-items-order)

order

integer

[​](https://apidocs.sessionboard.com/api-reference/event-settings/list-session-statuses#response-items-is-custom)

is\_custom

boolean

[​](https://apidocs.sessionboard.com/api-reference/event-settings/list-session-statuses#response-items-created-at-one-of-0)

created\_at

string \| null

[​](https://apidocs.sessionboard.com/api-reference/event-settings/list-session-statuses#response-items-created-by-user-id-one-of-0)

created\_by\_user\_id

integer \| null

[​](https://apidocs.sessionboard.com/api-reference/event-settings/list-session-statuses#response-items-created-by-user-name-one-of-0)

created\_by\_user\_name

string \| null

Ctrl+I