---
url: "https://apidocs.sessionboard.com/api-reference/transcriptions/list-transcriptions-for-an-event"
title: "List transcriptions for an event - Sessionboard API"
---

> ## Documentation Index
>
> Fetch the complete documentation index at: [/llms.txt](https://apidocs.sessionboard.com/llms.txt)
>
> Use this file to discover all available pages before exploring further.

[Skip to main content](https://apidocs.sessionboard.com/api-reference/transcriptions/list-transcriptions-for-an-event#content-area)

List transcriptions for an event

cURL

```
curl --request GET \
  --url 'https://public-api.sessionboard.com/v1/event/{eventId}/transcriptions?page=1&pageSize=25' \
  --header 'x-access-token: <api-key>'
```

```
import requests

url = "https://public-api.sessionboard.com/v1/event/{eventId}/transcriptions?page=1&pageSize=25"

headers = {"x-access-token": "<api-key>"}

response = requests.get(url, headers=headers)

print(response.text)
```

```
const options = {method: 'GET', headers: {'x-access-token': '<api-key>'}};

fetch('https://public-api.sessionboard.com/v1/event/{eventId}/transcriptions?page=1&pageSize=25', options)
  .then(res => res.json())
  .then(res => console.log(res))
  .catch(err => console.error(err));
```

```
<?php

$curl = curl_init();

curl_setopt_array($curl, [\
  CURLOPT_URL => "https://public-api.sessionboard.com/v1/event/{eventId}/transcriptions?page=1&pageSize=25",\
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

	url := "https://public-api.sessionboard.com/v1/event/{eventId}/transcriptions?page=1&pageSize=25"

	req, _ := http.NewRequest("GET", url, nil)

	req.Header.Add("x-access-token", "<api-key>")

	res, _ := http.DefaultClient.Do(req)

	defer res.Body.Close()
	body, _ := io.ReadAll(res.Body)

	fmt.Println(string(body))

}
```

```
HttpResponse<String> response = Unirest.get("https://public-api.sessionboard.com/v1/event/{eventId}/transcriptions?page=1&pageSize=25")
  .header("x-access-token", "<api-key>")
  .asString();
```

```
require 'uri'
require 'net/http'

url = URI("https://public-api.sessionboard.com/v1/event/{eventId}/transcriptions?page=1&pageSize=25")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true

request = Net::HTTP::Get.new(url)
request["x-access-token"] = '<api-key>'

response = http.request(request)
puts response.read_body
```

200

```
{
  "data": [\
    {\
      "id": "3c90c3cc-0d44-4b50-8888-8dd25736052a",\
      "session_id": "3c90c3cc-0d44-4b50-8888-8dd25736052a",\
      "transcription": "<string>",\
      "speaker": "<string>",\
      "is_partial": true,\
      "provider": "<string>",\
      "created_at": "2023-11-07T05:31:56Z",\
      "updated_at": "2023-11-07T05:31:56Z"\
    }\
  ],
  "pagination": {
    "currentPage": 123,
    "pageSize": 123,
    "totalPages": 123,
    "totalResults": 123
  }
}
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

transcriptions

Try it

List transcriptions for an event

cURL

```
curl --request GET \
  --url 'https://public-api.sessionboard.com/v1/event/{eventId}/transcriptions?page=1&pageSize=25' \
  --header 'x-access-token: <api-key>'
```

```
import requests

url = "https://public-api.sessionboard.com/v1/event/{eventId}/transcriptions?page=1&pageSize=25"

headers = {"x-access-token": "<api-key>"}

response = requests.get(url, headers=headers)

print(response.text)
```

```
const options = {method: 'GET', headers: {'x-access-token': '<api-key>'}};

fetch('https://public-api.sessionboard.com/v1/event/{eventId}/transcriptions?page=1&pageSize=25', options)
  .then(res => res.json())
  .then(res => console.log(res))
  .catch(err => console.error(err));
```

```
<?php

$curl = curl_init();

curl_setopt_array($curl, [\
  CURLOPT_URL => "https://public-api.sessionboard.com/v1/event/{eventId}/transcriptions?page=1&pageSize=25",\
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

	url := "https://public-api.sessionboard.com/v1/event/{eventId}/transcriptions?page=1&pageSize=25"

	req, _ := http.NewRequest("GET", url, nil)

	req.Header.Add("x-access-token", "<api-key>")

	res, _ := http.DefaultClient.Do(req)

	defer res.Body.Close()
	body, _ := io.ReadAll(res.Body)

	fmt.Println(string(body))

}
```

```
HttpResponse<String> response = Unirest.get("https://public-api.sessionboard.com/v1/event/{eventId}/transcriptions?page=1&pageSize=25")
  .header("x-access-token", "<api-key>")
  .asString();
```

```
require 'uri'
require 'net/http'

url = URI("https://public-api.sessionboard.com/v1/event/{eventId}/transcriptions?page=1&pageSize=25")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true

request = Net::HTTP::Get.new(url)
request["x-access-token"] = '<api-key>'

response = http.request(request)
puts response.read_body
```

200

```
{
  "data": [\
    {\
      "id": "3c90c3cc-0d44-4b50-8888-8dd25736052a",\
      "session_id": "3c90c3cc-0d44-4b50-8888-8dd25736052a",\
      "transcription": "<string>",\
      "speaker": "<string>",\
      "is_partial": true,\
      "provider": "<string>",\
      "created_at": "2023-11-07T05:31:56Z",\
      "updated_at": "2023-11-07T05:31:56Z"\
    }\
  ],
  "pagination": {
    "currentPage": 123,
    "pageSize": 123,
    "totalPages": 123,
    "totalResults": 123
  }
}
```

#### Authorizations

ApiKeyBearerTokenApiKeyBearerToken

[​](https://apidocs.sessionboard.com/api-reference/transcriptions/list-transcriptions-for-an-event#authorization-x-access-token)

x-access-token

string

header

required

Organization API token. Generate from Organization Settings → API Tokens.

#### Path Parameters

[​](https://apidocs.sessionboard.com/api-reference/transcriptions/list-transcriptions-for-an-event#parameter-event-id)

eventId

integer

required

Event ID

#### Query Parameters

[​](https://apidocs.sessionboard.com/api-reference/transcriptions/list-transcriptions-for-an-event#parameter-page)

page

integer

default:1

Page number for pagination.

Required range: `1 <= x <= 999`

[​](https://apidocs.sessionboard.com/api-reference/transcriptions/list-transcriptions-for-an-event#parameter-page-size)

pageSize

integer

default:25

Number of results per page.

Required range: `1 <= x <= 100`

[​](https://apidocs.sessionboard.com/api-reference/transcriptions/list-transcriptions-for-an-event#parameter-type)

type

enum<string>

Available options:

`fragment`,

`summary`,

`insight`,

`translation`

[​](https://apidocs.sessionboard.com/api-reference/transcriptions/list-transcriptions-for-an-event#parameter-session-id)

session\_id

string<uuid>

[​](https://apidocs.sessionboard.com/api-reference/transcriptions/list-transcriptions-for-an-event#parameter-language-code)

language\_code

string

[​](https://apidocs.sessionboard.com/api-reference/transcriptions/list-transcriptions-for-an-event#parameter-include-partial)

include\_partial

boolean

default:false

#### Response

200

application/json

OK

[​](https://apidocs.sessionboard.com/api-reference/transcriptions/list-transcriptions-for-an-event#response-data)

data

object\[\]

Showchild attributes

[​](https://apidocs.sessionboard.com/api-reference/transcriptions/list-transcriptions-for-an-event#response-pagination)

pagination

object

Pagination metadata returned with list responses.

Showchild attributes

Ctrl+I