---
url: "https://apidocs.sessionboard.com/api-reference/transcriptions/list-composed-session-content-for-an-event"
title: "List composed session content for an event - Sessionboard API"
---

> ## Documentation Index
>
> Fetch the complete documentation index at: [/llms.txt](https://apidocs.sessionboard.com/llms.txt)
>
> Use this file to discover all available pages before exploring further.

[Skip to main content](https://apidocs.sessionboard.com/api-reference/transcriptions/list-composed-session-content-for-an-event#content-area)

List composed session content for an event

cURL

```
curl --request GET \
  --url 'https://public-api.sessionboard.com/v1/event/{eventId}/content?page=1&pageSize=25' \
  --header 'x-access-token: <api-key>'
```

```
import requests

url = "https://public-api.sessionboard.com/v1/event/{eventId}/content?page=1&pageSize=25"

headers = {"x-access-token": "<api-key>"}

response = requests.get(url, headers=headers)

print(response.text)
```

```
const options = {method: 'GET', headers: {'x-access-token': '<api-key>'}};

fetch('https://public-api.sessionboard.com/v1/event/{eventId}/content?page=1&pageSize=25', options)
  .then(res => res.json())
  .then(res => console.log(res))
  .catch(err => console.error(err));
```

```
<?php

$curl = curl_init();

curl_setopt_array($curl, [\
  CURLOPT_URL => "https://public-api.sessionboard.com/v1/event/{eventId}/content?page=1&pageSize=25",\
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

	url := "https://public-api.sessionboard.com/v1/event/{eventId}/content?page=1&pageSize=25"

	req, _ := http.NewRequest("GET", url, nil)

	req.Header.Add("x-access-token", "<api-key>")

	res, _ := http.DefaultClient.Do(req)

	defer res.Body.Close()
	body, _ := io.ReadAll(res.Body)

	fmt.Println(string(body))

}
```

```
HttpResponse<String> response = Unirest.get("https://public-api.sessionboard.com/v1/event/{eventId}/content?page=1&pageSize=25")
  .header("x-access-token", "<api-key>")
  .asString();
```

```
require 'uri'
require 'net/http'

url = URI("https://public-api.sessionboard.com/v1/event/{eventId}/content?page=1&pageSize=25")

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
      "event_id": 123,\
      "title": "<string>",\
      "starts_at": "2023-11-07T05:31:56Z",\
      "updated_at": "2023-11-07T05:31:56Z",\
      "speakers": [\
        {\
          "id": "<string>",\
          "label": "<string>",\
          "name": "<string>"\
        }\
      ],\
      "has_transcription": true,\
      "has_summary": true,\
      "has_podcast": true,\
      "items": [\
        {\
          "id": "3c90c3cc-0d44-4b50-8888-8dd25736052a",\
          "session_id": "3c90c3cc-0d44-4b50-8888-8dd25736052a",\
          "text": "<string>",\
          "elements": [\
            {\
              "value": "<string>",\
              "speaker": {\
                "id": "<string>",\
                "label": "<string>",\
                "name": "<string>"\
              },\
              "start_time": 123,\
              "end_time": 123,\
              "fragment_ids": [\
                "3c90c3cc-0d44-4b50-8888-8dd25736052a"\
              ]\
            }\
          ],\
          "fragment_count": 123,\
          "interval_sec": 123,\
          "language_code": "<string>",\
          "summary_type": "<string>",\
          "provider": "<string>",\
          "content": {},\
          "topics": [\
            {}\
          ],\
          "insight_type": "<string>",\
          "name": "<string>",\
          "metadata": {},\
          "status": "<string>",\
          "url": "<string>",\
          "duration_sec": 123,\
          "generated_at": "2023-11-07T05:31:56Z",\
          "expires_at": "2023-11-07T05:31:56Z",\
          "content_type": "<string>",\
          "scope": "<string>",\
          "quotes": [\
            {}\
          ],\
          "summaries": [\
            {}\
          ],\
          "created_at": "2023-11-07T05:31:56Z",\
          "updated_at": "2023-11-07T05:31:56Z"\
        }\
      ]\
    }\
  ],
  "pagination": {
    "current_page": 123,
    "page_size": 123,
    "total_pages": 123,
    "total_results": 123
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

content

Try it

List composed session content for an event

cURL

```
curl --request GET \
  --url 'https://public-api.sessionboard.com/v1/event/{eventId}/content?page=1&pageSize=25' \
  --header 'x-access-token: <api-key>'
```

```
import requests

url = "https://public-api.sessionboard.com/v1/event/{eventId}/content?page=1&pageSize=25"

headers = {"x-access-token": "<api-key>"}

response = requests.get(url, headers=headers)

print(response.text)
```

```
const options = {method: 'GET', headers: {'x-access-token': '<api-key>'}};

fetch('https://public-api.sessionboard.com/v1/event/{eventId}/content?page=1&pageSize=25', options)
  .then(res => res.json())
  .then(res => console.log(res))
  .catch(err => console.error(err));
```

```
<?php

$curl = curl_init();

curl_setopt_array($curl, [\
  CURLOPT_URL => "https://public-api.sessionboard.com/v1/event/{eventId}/content?page=1&pageSize=25",\
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

	url := "https://public-api.sessionboard.com/v1/event/{eventId}/content?page=1&pageSize=25"

	req, _ := http.NewRequest("GET", url, nil)

	req.Header.Add("x-access-token", "<api-key>")

	res, _ := http.DefaultClient.Do(req)

	defer res.Body.Close()
	body, _ := io.ReadAll(res.Body)

	fmt.Println(string(body))

}
```

```
HttpResponse<String> response = Unirest.get("https://public-api.sessionboard.com/v1/event/{eventId}/content?page=1&pageSize=25")
  .header("x-access-token", "<api-key>")
  .asString();
```

```
require 'uri'
require 'net/http'

url = URI("https://public-api.sessionboard.com/v1/event/{eventId}/content?page=1&pageSize=25")

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
      "event_id": 123,\
      "title": "<string>",\
      "starts_at": "2023-11-07T05:31:56Z",\
      "updated_at": "2023-11-07T05:31:56Z",\
      "speakers": [\
        {\
          "id": "<string>",\
          "label": "<string>",\
          "name": "<string>"\
        }\
      ],\
      "has_transcription": true,\
      "has_summary": true,\
      "has_podcast": true,\
      "items": [\
        {\
          "id": "3c90c3cc-0d44-4b50-8888-8dd25736052a",\
          "session_id": "3c90c3cc-0d44-4b50-8888-8dd25736052a",\
          "text": "<string>",\
          "elements": [\
            {\
              "value": "<string>",\
              "speaker": {\
                "id": "<string>",\
                "label": "<string>",\
                "name": "<string>"\
              },\
              "start_time": 123,\
              "end_time": 123,\
              "fragment_ids": [\
                "3c90c3cc-0d44-4b50-8888-8dd25736052a"\
              ]\
            }\
          ],\
          "fragment_count": 123,\
          "interval_sec": 123,\
          "language_code": "<string>",\
          "summary_type": "<string>",\
          "provider": "<string>",\
          "content": {},\
          "topics": [\
            {}\
          ],\
          "insight_type": "<string>",\
          "name": "<string>",\
          "metadata": {},\
          "status": "<string>",\
          "url": "<string>",\
          "duration_sec": 123,\
          "generated_at": "2023-11-07T05:31:56Z",\
          "expires_at": "2023-11-07T05:31:56Z",\
          "content_type": "<string>",\
          "scope": "<string>",\
          "quotes": [\
            {}\
          ],\
          "summaries": [\
            {}\
          ],\
          "created_at": "2023-11-07T05:31:56Z",\
          "updated_at": "2023-11-07T05:31:56Z"\
        }\
      ]\
    }\
  ],
  "pagination": {
    "current_page": 123,
    "page_size": 123,
    "total_pages": 123,
    "total_results": 123
  }
}
```

#### Authorizations

ApiKeyBearerTokenApiKeyBearerToken

[​](https://apidocs.sessionboard.com/api-reference/transcriptions/list-composed-session-content-for-an-event#authorization-x-access-token)

x-access-token

string

header

required

Organization API token. Generate from Organization Settings → API Tokens.

#### Path Parameters

[​](https://apidocs.sessionboard.com/api-reference/transcriptions/list-composed-session-content-for-an-event#parameter-event-id)

eventId

integer

required

Event ID

#### Query Parameters

[​](https://apidocs.sessionboard.com/api-reference/transcriptions/list-composed-session-content-for-an-event#parameter-page)

page

integer

default:1

Page number for pagination.

Required range: `1 <= x <= 999`

[​](https://apidocs.sessionboard.com/api-reference/transcriptions/list-composed-session-content-for-an-event#parameter-page-size)

pageSize

integer

default:25

Number of results per page.

Required range: `1 <= x <= 100`

[​](https://apidocs.sessionboard.com/api-reference/transcriptions/list-composed-session-content-for-an-event#parameter-session-id)

session\_id

string<uuid>

[​](https://apidocs.sessionboard.com/api-reference/transcriptions/list-composed-session-content-for-an-event#parameter-expand)

expand

string

Comma-separated item types. Default `transcription,summary,insight,podcast,document`.
Add `items` on the event list for full transcription elements (list is compact by default).
`expand=items` alone still includes the default types. Session GET always returns full elements.

Example:

`"transcription,summary,items"`

[​](https://apidocs.sessionboard.com/api-reference/transcriptions/list-composed-session-content-for-an-event#parameter-interval-sec)

interval\_sec

integer

Optional time window (seconds) for rechunking same-speaker transcript elements. Omit for speaker turns only. Clamped to 3600.

Required range: `1 <= x <= 3600`

[​](https://apidocs.sessionboard.com/api-reference/transcriptions/list-composed-session-content-for-an-event#parameter-provider)

provider

enum<string>

Preferred summary provider when multiple exist.

Available options:

`claude`,

`openai`

#### Response

200

application/json

OK

[​](https://apidocs.sessionboard.com/api-reference/transcriptions/list-composed-session-content-for-an-event#response-data)

data

object\[\]

Showchild attributes

[​](https://apidocs.sessionboard.com/api-reference/transcriptions/list-composed-session-content-for-an-event#response-pagination)

pagination

object

Showchild attributes

Ctrl+I