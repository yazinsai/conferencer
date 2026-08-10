---
url: "https://apidocs.sessionboard.com/api-reference/event-settings/list-languages"
title: "List languages - Sessionboard API"
---

> ## Documentation Index
>
> Fetch the complete documentation index at: [/llms.txt](https://apidocs.sessionboard.com/llms.txt)
>
> Use this file to discover all available pages before exploring further.

[Skip to main content](https://apidocs.sessionboard.com/api-reference/event-settings/list-languages#content-area)

List languages

cURL

```
curl --request GET \
  --url https://public-api.sessionboard.com/v1/event/{eventId}/languages \
  --header 'x-access-token: <api-key>'
```

```
import requests

url = "https://public-api.sessionboard.com/v1/event/{eventId}/languages"

headers = {"x-access-token": "<api-key>"}

response = requests.get(url, headers=headers)

print(response.text)
```

```
const options = {method: 'GET', headers: {'x-access-token': '<api-key>'}};

fetch('https://public-api.sessionboard.com/v1/event/{eventId}/languages', options)
  .then(res => res.json())
  .then(res => console.log(res))
  .catch(err => console.error(err));
```

```
<?php

$curl = curl_init();

curl_setopt_array($curl, [\
  CURLOPT_URL => "https://public-api.sessionboard.com/v1/event/{eventId}/languages",\
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

	url := "https://public-api.sessionboard.com/v1/event/{eventId}/languages"

	req, _ := http.NewRequest("GET", url, nil)

	req.Header.Add("x-access-token", "<api-key>")

	res, _ := http.DefaultClient.Do(req)

	defer res.Body.Close()
	body, _ := io.ReadAll(res.Body)

	fmt.Println(string(body))

}
```

```
HttpResponse<String> response = Unirest.get("https://public-api.sessionboard.com/v1/event/{eventId}/languages")
  .header("x-access-token", "<api-key>")
  .asString();
```

```
require 'uri'
require 'net/http'

url = URI("https://public-api.sessionboard.com/v1/event/{eventId}/languages")

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
    "order": 123,\
    "created_at": "<string>",\
    "updated_at": "<string>"\
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

languages

Try it

List languages

cURL

```
curl --request GET \
  --url https://public-api.sessionboard.com/v1/event/{eventId}/languages \
  --header 'x-access-token: <api-key>'
```

```
import requests

url = "https://public-api.sessionboard.com/v1/event/{eventId}/languages"

headers = {"x-access-token": "<api-key>"}

response = requests.get(url, headers=headers)

print(response.text)
```

```
const options = {method: 'GET', headers: {'x-access-token': '<api-key>'}};

fetch('https://public-api.sessionboard.com/v1/event/{eventId}/languages', options)
  .then(res => res.json())
  .then(res => console.log(res))
  .catch(err => console.error(err));
```

```
<?php

$curl = curl_init();

curl_setopt_array($curl, [\
  CURLOPT_URL => "https://public-api.sessionboard.com/v1/event/{eventId}/languages",\
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

	url := "https://public-api.sessionboard.com/v1/event/{eventId}/languages"

	req, _ := http.NewRequest("GET", url, nil)

	req.Header.Add("x-access-token", "<api-key>")

	res, _ := http.DefaultClient.Do(req)

	defer res.Body.Close()
	body, _ := io.ReadAll(res.Body)

	fmt.Println(string(body))

}
```

```
HttpResponse<String> response = Unirest.get("https://public-api.sessionboard.com/v1/event/{eventId}/languages")
  .header("x-access-token", "<api-key>")
  .asString();
```

```
require 'uri'
require 'net/http'

url = URI("https://public-api.sessionboard.com/v1/event/{eventId}/languages")

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
    "order": 123,\
    "created_at": "<string>",\
    "updated_at": "<string>"\
  }\
]
```

#### Authorizations

ApiKeyBearerTokenApiKeyBearerToken

[​](https://apidocs.sessionboard.com/api-reference/event-settings/list-languages#authorization-x-access-token)

x-access-token

string

header

required

Organization API token. Generate from Organization Settings → API Tokens.

#### Path Parameters

[​](https://apidocs.sessionboard.com/api-reference/event-settings/list-languages#parameter-event-id)

eventId

integer

required

The event ID.

#### Response

200

application/json

OK

[​](https://apidocs.sessionboard.com/api-reference/event-settings/list-languages#response-items-id)

id

string<uuid>

[​](https://apidocs.sessionboard.com/api-reference/event-settings/list-languages#response-items-event-id)

event\_id

integer

[​](https://apidocs.sessionboard.com/api-reference/event-settings/list-languages#response-items-name)

name

string

[​](https://apidocs.sessionboard.com/api-reference/event-settings/list-languages#response-items-order)

order

integer

[​](https://apidocs.sessionboard.com/api-reference/event-settings/list-languages#response-items-created-at)

created\_at

string

[​](https://apidocs.sessionboard.com/api-reference/event-settings/list-languages#response-items-updated-at)

updated\_at

string

Ctrl+I