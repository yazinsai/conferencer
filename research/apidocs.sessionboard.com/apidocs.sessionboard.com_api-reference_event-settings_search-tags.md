---
url: "https://apidocs.sessionboard.com/api-reference/event-settings/search-tags"
title: "Search tags - Sessionboard API"
---

> ## Documentation Index
>
> Fetch the complete documentation index at: [/llms.txt](https://apidocs.sessionboard.com/llms.txt)
>
> Use this file to discover all available pages before exploring further.

[Skip to main content](https://apidocs.sessionboard.com/api-reference/event-settings/search-tags#content-area)

Search tags

cURL

```
curl --request POST \
  --url 'https://public-api.sessionboard.com/v1/event/{eventId}/tags?page=1&pageSize=25' \
  --header 'Content-Type: application/json' \
  --header 'x-access-token: <api-key>' \
  --data '
{
  "filters": {
    "createdAt": {
      "before": "2023-11-07T05:31:56Z",
      "after": "2023-11-07T05:31:56Z"
    },
    "updatedAt": {
      "before": "2023-11-07T05:31:56Z",
      "after": "2023-11-07T05:31:56Z"
    }
  },
  "sort": {},
  "expand": []
}
'
```

```
import requests

url = "https://public-api.sessionboard.com/v1/event/{eventId}/tags?page=1&pageSize=25"

payload = {
    "filters": {
        "createdAt": {
            "before": "2023-11-07T05:31:56Z",
            "after": "2023-11-07T05:31:56Z"
        },
        "updatedAt": {
            "before": "2023-11-07T05:31:56Z",
            "after": "2023-11-07T05:31:56Z"
        }
    },
    "sort": {},
    "expand": []
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
  body: JSON.stringify({
    filters: {
      createdAt: {before: '2023-11-07T05:31:56Z', after: '2023-11-07T05:31:56Z'},
      updatedAt: {before: '2023-11-07T05:31:56Z', after: '2023-11-07T05:31:56Z'}
    },
    sort: {},
    expand: []
  })
};

fetch('https://public-api.sessionboard.com/v1/event/{eventId}/tags?page=1&pageSize=25', options)
  .then(res => res.json())
  .then(res => console.log(res))
  .catch(err => console.error(err));
```

```
<?php

$curl = curl_init();

curl_setopt_array($curl, [\
  CURLOPT_URL => "https://public-api.sessionboard.com/v1/event/{eventId}/tags?page=1&pageSize=25",\
  CURLOPT_RETURNTRANSFER => true,\
  CURLOPT_ENCODING => "",\
  CURLOPT_MAXREDIRS => 10,\
  CURLOPT_TIMEOUT => 30,\
  CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,\
  CURLOPT_CUSTOMREQUEST => "POST",\
  CURLOPT_POSTFIELDS => json_encode([\
    'filters' => [\
        'createdAt' => [\
                'before' => '2023-11-07T05:31:56Z',\
                'after' => '2023-11-07T05:31:56Z'\
        ],\
        'updatedAt' => [\
                'before' => '2023-11-07T05:31:56Z',\
                'after' => '2023-11-07T05:31:56Z'\
        ]\
    ],\
    'sort' => [\
\
    ],\
    'expand' => [\
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

	url := "https://public-api.sessionboard.com/v1/event/{eventId}/tags?page=1&pageSize=25"

	payload := strings.NewReader("{\n  \"filters\": {\n    \"createdAt\": {\n      \"before\": \"2023-11-07T05:31:56Z\",\n      \"after\": \"2023-11-07T05:31:56Z\"\n    },\n    \"updatedAt\": {\n      \"before\": \"2023-11-07T05:31:56Z\",\n      \"after\": \"2023-11-07T05:31:56Z\"\n    }\n  },\n  \"sort\": {},\n  \"expand\": []\n}")

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
HttpResponse<String> response = Unirest.post("https://public-api.sessionboard.com/v1/event/{eventId}/tags?page=1&pageSize=25")
  .header("x-access-token", "<api-key>")
  .header("Content-Type", "application/json")
  .body("{\n  \"filters\": {\n    \"createdAt\": {\n      \"before\": \"2023-11-07T05:31:56Z\",\n      \"after\": \"2023-11-07T05:31:56Z\"\n    },\n    \"updatedAt\": {\n      \"before\": \"2023-11-07T05:31:56Z\",\n      \"after\": \"2023-11-07T05:31:56Z\"\n    }\n  },\n  \"sort\": {},\n  \"expand\": []\n}")
  .asString();
```

```
require 'uri'
require 'net/http'

url = URI("https://public-api.sessionboard.com/v1/event/{eventId}/tags?page=1&pageSize=25")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true

request = Net::HTTP::Post.new(url)
request["x-access-token"] = '<api-key>'
request["Content-Type"] = 'application/json'
request.body = "{\n  \"filters\": {\n    \"createdAt\": {\n      \"before\": \"2023-11-07T05:31:56Z\",\n      \"after\": \"2023-11-07T05:31:56Z\"\n    },\n    \"updatedAt\": {\n      \"before\": \"2023-11-07T05:31:56Z\",\n      \"after\": \"2023-11-07T05:31:56Z\"\n    }\n  },\n  \"sort\": {},\n  \"expand\": []\n}"

response = http.request(request)
puts response.read_body
```

200

```
{
  "results": [\
    {\
      "id": "3c90c3cc-0d44-4b50-8888-8dd25736052a",\
      "name": "<string>",\
      "created_at": "<string>",\
      "updated_at": "<string>"\
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

POST

https://public-api.sessionboard.comhttps://public-api-eu.sessionboard.com

/

v1

/

event

/

{eventId}

/

tags

Try it

Search tags

cURL

```
curl --request POST \
  --url 'https://public-api.sessionboard.com/v1/event/{eventId}/tags?page=1&pageSize=25' \
  --header 'Content-Type: application/json' \
  --header 'x-access-token: <api-key>' \
  --data '
{
  "filters": {
    "createdAt": {
      "before": "2023-11-07T05:31:56Z",
      "after": "2023-11-07T05:31:56Z"
    },
    "updatedAt": {
      "before": "2023-11-07T05:31:56Z",
      "after": "2023-11-07T05:31:56Z"
    }
  },
  "sort": {},
  "expand": []
}
'
```

```
import requests

url = "https://public-api.sessionboard.com/v1/event/{eventId}/tags?page=1&pageSize=25"

payload = {
    "filters": {
        "createdAt": {
            "before": "2023-11-07T05:31:56Z",
            "after": "2023-11-07T05:31:56Z"
        },
        "updatedAt": {
            "before": "2023-11-07T05:31:56Z",
            "after": "2023-11-07T05:31:56Z"
        }
    },
    "sort": {},
    "expand": []
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
  body: JSON.stringify({
    filters: {
      createdAt: {before: '2023-11-07T05:31:56Z', after: '2023-11-07T05:31:56Z'},
      updatedAt: {before: '2023-11-07T05:31:56Z', after: '2023-11-07T05:31:56Z'}
    },
    sort: {},
    expand: []
  })
};

fetch('https://public-api.sessionboard.com/v1/event/{eventId}/tags?page=1&pageSize=25', options)
  .then(res => res.json())
  .then(res => console.log(res))
  .catch(err => console.error(err));
```

```
<?php

$curl = curl_init();

curl_setopt_array($curl, [\
  CURLOPT_URL => "https://public-api.sessionboard.com/v1/event/{eventId}/tags?page=1&pageSize=25",\
  CURLOPT_RETURNTRANSFER => true,\
  CURLOPT_ENCODING => "",\
  CURLOPT_MAXREDIRS => 10,\
  CURLOPT_TIMEOUT => 30,\
  CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,\
  CURLOPT_CUSTOMREQUEST => "POST",\
  CURLOPT_POSTFIELDS => json_encode([\
    'filters' => [\
        'createdAt' => [\
                'before' => '2023-11-07T05:31:56Z',\
                'after' => '2023-11-07T05:31:56Z'\
        ],\
        'updatedAt' => [\
                'before' => '2023-11-07T05:31:56Z',\
                'after' => '2023-11-07T05:31:56Z'\
        ]\
    ],\
    'sort' => [\
\
    ],\
    'expand' => [\
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

	url := "https://public-api.sessionboard.com/v1/event/{eventId}/tags?page=1&pageSize=25"

	payload := strings.NewReader("{\n  \"filters\": {\n    \"createdAt\": {\n      \"before\": \"2023-11-07T05:31:56Z\",\n      \"after\": \"2023-11-07T05:31:56Z\"\n    },\n    \"updatedAt\": {\n      \"before\": \"2023-11-07T05:31:56Z\",\n      \"after\": \"2023-11-07T05:31:56Z\"\n    }\n  },\n  \"sort\": {},\n  \"expand\": []\n}")

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
HttpResponse<String> response = Unirest.post("https://public-api.sessionboard.com/v1/event/{eventId}/tags?page=1&pageSize=25")
  .header("x-access-token", "<api-key>")
  .header("Content-Type", "application/json")
  .body("{\n  \"filters\": {\n    \"createdAt\": {\n      \"before\": \"2023-11-07T05:31:56Z\",\n      \"after\": \"2023-11-07T05:31:56Z\"\n    },\n    \"updatedAt\": {\n      \"before\": \"2023-11-07T05:31:56Z\",\n      \"after\": \"2023-11-07T05:31:56Z\"\n    }\n  },\n  \"sort\": {},\n  \"expand\": []\n}")
  .asString();
```

```
require 'uri'
require 'net/http'

url = URI("https://public-api.sessionboard.com/v1/event/{eventId}/tags?page=1&pageSize=25")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true

request = Net::HTTP::Post.new(url)
request["x-access-token"] = '<api-key>'
request["Content-Type"] = 'application/json'
request.body = "{\n  \"filters\": {\n    \"createdAt\": {\n      \"before\": \"2023-11-07T05:31:56Z\",\n      \"after\": \"2023-11-07T05:31:56Z\"\n    },\n    \"updatedAt\": {\n      \"before\": \"2023-11-07T05:31:56Z\",\n      \"after\": \"2023-11-07T05:31:56Z\"\n    }\n  },\n  \"sort\": {},\n  \"expand\": []\n}"

response = http.request(request)
puts response.read_body
```

200

```
{
  "results": [\
    {\
      "id": "3c90c3cc-0d44-4b50-8888-8dd25736052a",\
      "name": "<string>",\
      "created_at": "<string>",\
      "updated_at": "<string>"\
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

[​](https://apidocs.sessionboard.com/api-reference/event-settings/search-tags#authorization-x-access-token)

x-access-token

string

header

required

Organization API token. Generate from Organization Settings → API Tokens.

#### Path Parameters

[​](https://apidocs.sessionboard.com/api-reference/event-settings/search-tags#parameter-event-id)

eventId

integer

required

The event ID.

#### Query Parameters

[​](https://apidocs.sessionboard.com/api-reference/event-settings/search-tags#parameter-page)

page

integer

default:1

Page number for pagination.

Required range: `1 <= x <= 999`

[​](https://apidocs.sessionboard.com/api-reference/event-settings/search-tags#parameter-page-size)

pageSize

integer

default:25

Number of results per page.

Required range: `1 <= x <= 100`

#### Body

application/json

Common search request body used across multiple endpoints.

[​](https://apidocs.sessionboard.com/api-reference/event-settings/search-tags#body-filters)

filters

object

Showchild attributes

[​](https://apidocs.sessionboard.com/api-reference/event-settings/search-tags#body-sort)

sort

object

Sorting options for search results.

Showchild attributes

[​](https://apidocs.sessionboard.com/api-reference/event-settings/search-tags#body-expand)

expand

enum<string>\[\]

Expand records with additional data. See the `Expand` parameter for `linked_sources` and `composition` details.

Available options:

`translated_fields`,

`subsession_details`,

`linked_sources`,

`composition`

#### Response

200

application/json

OK

[​](https://apidocs.sessionboard.com/api-reference/event-settings/search-tags#response-results)

results

object\[\]

Showchild attributes

[​](https://apidocs.sessionboard.com/api-reference/event-settings/search-tags#response-pagination)

pagination

object

Pagination metadata returned with list responses.

Showchild attributes

Ctrl+I