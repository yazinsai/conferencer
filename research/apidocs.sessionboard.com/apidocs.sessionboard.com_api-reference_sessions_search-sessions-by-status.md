---
url: "https://apidocs.sessionboard.com/api-reference/sessions/search-sessions-by-status"
title: "Search sessions by status - Sessionboard API"
---

> ## Documentation Index
>
> Fetch the complete documentation index at: [/llms.txt](https://apidocs.sessionboard.com/llms.txt)
>
> Use this file to discover all available pages before exploring further.

[Skip to main content](https://apidocs.sessionboard.com/api-reference/sessions/search-sessions-by-status#content-area)

Search sessions by status

cURL

```
curl --request POST \
  --url 'https://public-api.sessionboard.com/v1/event/{eventId}/sessions/status?page=1&pageSize=25' \
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
    },
    "deletedAt": {
      "before": "2023-11-07T05:31:56Z",
      "after": "2023-11-07T05:31:56Z"
    }
  },
  "sort": {},
  "expand": [\
    "<string>"\
  ]
}
'
```

```
import requests

url = "https://public-api.sessionboard.com/v1/event/{eventId}/sessions/status?page=1&pageSize=25"

payload = {
    "filters": {
        "createdAt": {
            "before": "2023-11-07T05:31:56Z",
            "after": "2023-11-07T05:31:56Z"
        },
        "updatedAt": {
            "before": "2023-11-07T05:31:56Z",
            "after": "2023-11-07T05:31:56Z"
        },
        "deletedAt": {
            "before": "2023-11-07T05:31:56Z",
            "after": "2023-11-07T05:31:56Z"
        }
    },
    "sort": {},
    "expand": ["<string>"]
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
      updatedAt: {before: '2023-11-07T05:31:56Z', after: '2023-11-07T05:31:56Z'},
      deletedAt: {before: '2023-11-07T05:31:56Z', after: '2023-11-07T05:31:56Z'}
    },
    sort: {},
    expand: ['<string>']
  })
};

fetch('https://public-api.sessionboard.com/v1/event/{eventId}/sessions/status?page=1&pageSize=25', options)
  .then(res => res.json())
  .then(res => console.log(res))
  .catch(err => console.error(err));
```

```
<?php

$curl = curl_init();

curl_setopt_array($curl, [\
  CURLOPT_URL => "https://public-api.sessionboard.com/v1/event/{eventId}/sessions/status?page=1&pageSize=25",\
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
        ],\
        'deletedAt' => [\
                'before' => '2023-11-07T05:31:56Z',\
                'after' => '2023-11-07T05:31:56Z'\
        ]\
    ],\
    'sort' => [\
\
    ],\
    'expand' => [\
        '<string>'\
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

	url := "https://public-api.sessionboard.com/v1/event/{eventId}/sessions/status?page=1&pageSize=25"

	payload := strings.NewReader("{\n  \"filters\": {\n    \"createdAt\": {\n      \"before\": \"2023-11-07T05:31:56Z\",\n      \"after\": \"2023-11-07T05:31:56Z\"\n    },\n    \"updatedAt\": {\n      \"before\": \"2023-11-07T05:31:56Z\",\n      \"after\": \"2023-11-07T05:31:56Z\"\n    },\n    \"deletedAt\": {\n      \"before\": \"2023-11-07T05:31:56Z\",\n      \"after\": \"2023-11-07T05:31:56Z\"\n    }\n  },\n  \"sort\": {},\n  \"expand\": [\n    \"<string>\"\n  ]\n}")

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
HttpResponse<String> response = Unirest.post("https://public-api.sessionboard.com/v1/event/{eventId}/sessions/status?page=1&pageSize=25")
  .header("x-access-token", "<api-key>")
  .header("Content-Type", "application/json")
  .body("{\n  \"filters\": {\n    \"createdAt\": {\n      \"before\": \"2023-11-07T05:31:56Z\",\n      \"after\": \"2023-11-07T05:31:56Z\"\n    },\n    \"updatedAt\": {\n      \"before\": \"2023-11-07T05:31:56Z\",\n      \"after\": \"2023-11-07T05:31:56Z\"\n    },\n    \"deletedAt\": {\n      \"before\": \"2023-11-07T05:31:56Z\",\n      \"after\": \"2023-11-07T05:31:56Z\"\n    }\n  },\n  \"sort\": {},\n  \"expand\": [\n    \"<string>\"\n  ]\n}")
  .asString();
```

```
require 'uri'
require 'net/http'

url = URI("https://public-api.sessionboard.com/v1/event/{eventId}/sessions/status?page=1&pageSize=25")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true

request = Net::HTTP::Post.new(url)
request["x-access-token"] = '<api-key>'
request["Content-Type"] = 'application/json'
request.body = "{\n  \"filters\": {\n    \"createdAt\": {\n      \"before\": \"2023-11-07T05:31:56Z\",\n      \"after\": \"2023-11-07T05:31:56Z\"\n    },\n    \"updatedAt\": {\n      \"before\": \"2023-11-07T05:31:56Z\",\n      \"after\": \"2023-11-07T05:31:56Z\"\n    },\n    \"deletedAt\": {\n      \"before\": \"2023-11-07T05:31:56Z\",\n      \"after\": \"2023-11-07T05:31:56Z\"\n    }\n  },\n  \"sort\": {},\n  \"expand\": [\n    \"<string>\"\n  ]\n}"

response = http.request(request)
puts response.read_body
```

200

```
{
  "results": [\
    {\
      "id": "3c90c3cc-0d44-4b50-8888-8dd25736052a",\
      "friendly_id": "<string>",\
      "friendly_id_raw": 123,\
      "status": "<string>",\
      "custom_status_id": "3c90c3cc-0d44-4b50-8888-8dd25736052a",\
      "custom_status": {\
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
      },\
      "is_abstract": true,\
      "composition_status": {\
        "is_linked": true,\
        "is_read_only": true,\
        "source_count": 123,\
        "target": {\
          "id": "3c90c3cc-0d44-4b50-8888-8dd25736052a",\
          "friendly_id": "<string>",\
          "title": "<string>",\
          "is_abstract": true\
        }\
      },\
      "deleted_at": "2023-11-07T05:31:56Z",\
      "created_at": "2023-11-07T05:31:56Z",\
      "updated_at": "2023-11-07T05:31:56Z",\
      "subsessions": [\
        {\
          "id": "3c90c3cc-0d44-4b50-8888-8dd25736052a",\
          "friendly_id": "<string>",\
          "friendly_id_raw": 123,\
          "parent_session_friendly_id": "<string>",\
          "parent_session_friendly_id_raw": 123,\
          "status": "<string>",\
          "custom_status_id": "3c90c3cc-0d44-4b50-8888-8dd25736052a",\
          "custom_status": {\
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
          },\
          "deleted_at": "2023-11-07T05:31:56Z",\
          "created_at": "2023-11-07T05:31:56Z",\
          "updated_at": "2023-11-07T05:31:56Z"\
        }\
      ]\
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

sessions

/

status

Try it

Search sessions by status

cURL

```
curl --request POST \
  --url 'https://public-api.sessionboard.com/v1/event/{eventId}/sessions/status?page=1&pageSize=25' \
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
    },
    "deletedAt": {
      "before": "2023-11-07T05:31:56Z",
      "after": "2023-11-07T05:31:56Z"
    }
  },
  "sort": {},
  "expand": [\
    "<string>"\
  ]
}
'
```

```
import requests

url = "https://public-api.sessionboard.com/v1/event/{eventId}/sessions/status?page=1&pageSize=25"

payload = {
    "filters": {
        "createdAt": {
            "before": "2023-11-07T05:31:56Z",
            "after": "2023-11-07T05:31:56Z"
        },
        "updatedAt": {
            "before": "2023-11-07T05:31:56Z",
            "after": "2023-11-07T05:31:56Z"
        },
        "deletedAt": {
            "before": "2023-11-07T05:31:56Z",
            "after": "2023-11-07T05:31:56Z"
        }
    },
    "sort": {},
    "expand": ["<string>"]
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
      updatedAt: {before: '2023-11-07T05:31:56Z', after: '2023-11-07T05:31:56Z'},
      deletedAt: {before: '2023-11-07T05:31:56Z', after: '2023-11-07T05:31:56Z'}
    },
    sort: {},
    expand: ['<string>']
  })
};

fetch('https://public-api.sessionboard.com/v1/event/{eventId}/sessions/status?page=1&pageSize=25', options)
  .then(res => res.json())
  .then(res => console.log(res))
  .catch(err => console.error(err));
```

```
<?php

$curl = curl_init();

curl_setopt_array($curl, [\
  CURLOPT_URL => "https://public-api.sessionboard.com/v1/event/{eventId}/sessions/status?page=1&pageSize=25",\
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
        ],\
        'deletedAt' => [\
                'before' => '2023-11-07T05:31:56Z',\
                'after' => '2023-11-07T05:31:56Z'\
        ]\
    ],\
    'sort' => [\
\
    ],\
    'expand' => [\
        '<string>'\
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

	url := "https://public-api.sessionboard.com/v1/event/{eventId}/sessions/status?page=1&pageSize=25"

	payload := strings.NewReader("{\n  \"filters\": {\n    \"createdAt\": {\n      \"before\": \"2023-11-07T05:31:56Z\",\n      \"after\": \"2023-11-07T05:31:56Z\"\n    },\n    \"updatedAt\": {\n      \"before\": \"2023-11-07T05:31:56Z\",\n      \"after\": \"2023-11-07T05:31:56Z\"\n    },\n    \"deletedAt\": {\n      \"before\": \"2023-11-07T05:31:56Z\",\n      \"after\": \"2023-11-07T05:31:56Z\"\n    }\n  },\n  \"sort\": {},\n  \"expand\": [\n    \"<string>\"\n  ]\n}")

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
HttpResponse<String> response = Unirest.post("https://public-api.sessionboard.com/v1/event/{eventId}/sessions/status?page=1&pageSize=25")
  .header("x-access-token", "<api-key>")
  .header("Content-Type", "application/json")
  .body("{\n  \"filters\": {\n    \"createdAt\": {\n      \"before\": \"2023-11-07T05:31:56Z\",\n      \"after\": \"2023-11-07T05:31:56Z\"\n    },\n    \"updatedAt\": {\n      \"before\": \"2023-11-07T05:31:56Z\",\n      \"after\": \"2023-11-07T05:31:56Z\"\n    },\n    \"deletedAt\": {\n      \"before\": \"2023-11-07T05:31:56Z\",\n      \"after\": \"2023-11-07T05:31:56Z\"\n    }\n  },\n  \"sort\": {},\n  \"expand\": [\n    \"<string>\"\n  ]\n}")
  .asString();
```

```
require 'uri'
require 'net/http'

url = URI("https://public-api.sessionboard.com/v1/event/{eventId}/sessions/status?page=1&pageSize=25")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true

request = Net::HTTP::Post.new(url)
request["x-access-token"] = '<api-key>'
request["Content-Type"] = 'application/json'
request.body = "{\n  \"filters\": {\n    \"createdAt\": {\n      \"before\": \"2023-11-07T05:31:56Z\",\n      \"after\": \"2023-11-07T05:31:56Z\"\n    },\n    \"updatedAt\": {\n      \"before\": \"2023-11-07T05:31:56Z\",\n      \"after\": \"2023-11-07T05:31:56Z\"\n    },\n    \"deletedAt\": {\n      \"before\": \"2023-11-07T05:31:56Z\",\n      \"after\": \"2023-11-07T05:31:56Z\"\n    }\n  },\n  \"sort\": {},\n  \"expand\": [\n    \"<string>\"\n  ]\n}"

response = http.request(request)
puts response.read_body
```

200

```
{
  "results": [\
    {\
      "id": "3c90c3cc-0d44-4b50-8888-8dd25736052a",\
      "friendly_id": "<string>",\
      "friendly_id_raw": 123,\
      "status": "<string>",\
      "custom_status_id": "3c90c3cc-0d44-4b50-8888-8dd25736052a",\
      "custom_status": {\
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
      },\
      "is_abstract": true,\
      "composition_status": {\
        "is_linked": true,\
        "is_read_only": true,\
        "source_count": 123,\
        "target": {\
          "id": "3c90c3cc-0d44-4b50-8888-8dd25736052a",\
          "friendly_id": "<string>",\
          "title": "<string>",\
          "is_abstract": true\
        }\
      },\
      "deleted_at": "2023-11-07T05:31:56Z",\
      "created_at": "2023-11-07T05:31:56Z",\
      "updated_at": "2023-11-07T05:31:56Z",\
      "subsessions": [\
        {\
          "id": "3c90c3cc-0d44-4b50-8888-8dd25736052a",\
          "friendly_id": "<string>",\
          "friendly_id_raw": 123,\
          "parent_session_friendly_id": "<string>",\
          "parent_session_friendly_id_raw": 123,\
          "status": "<string>",\
          "custom_status_id": "3c90c3cc-0d44-4b50-8888-8dd25736052a",\
          "custom_status": {\
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
          },\
          "deleted_at": "2023-11-07T05:31:56Z",\
          "created_at": "2023-11-07T05:31:56Z",\
          "updated_at": "2023-11-07T05:31:56Z"\
        }\
      ]\
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

[​](https://apidocs.sessionboard.com/api-reference/sessions/search-sessions-by-status#authorization-x-access-token)

x-access-token

string

header

required

Organization API token. Generate from Organization Settings → API Tokens.

#### Path Parameters

[​](https://apidocs.sessionboard.com/api-reference/sessions/search-sessions-by-status#parameter-event-id)

eventId

integer

required

The event ID.

#### Query Parameters

[​](https://apidocs.sessionboard.com/api-reference/sessions/search-sessions-by-status#parameter-page)

page

integer

default:1

Page number for pagination.

Required range: `1 <= x <= 999`

[​](https://apidocs.sessionboard.com/api-reference/sessions/search-sessions-by-status#parameter-page-size)

pageSize

integer

default:25

Number of results per page.

Required range: `1 <= x <= 100`

#### Body

application/json

[​](https://apidocs.sessionboard.com/api-reference/sessions/search-sessions-by-status#body-filters)

filters

object

Showchild attributes

[​](https://apidocs.sessionboard.com/api-reference/sessions/search-sessions-by-status#body-sort)

sort

object

Showchild attributes

[​](https://apidocs.sessionboard.com/api-reference/sessions/search-sessions-by-status#body-expand)

expand

string\[\]

#### Response

200

application/json

OK

[​](https://apidocs.sessionboard.com/api-reference/sessions/search-sessions-by-status#response-results)

results

object\[\]

Showchild attributes

[​](https://apidocs.sessionboard.com/api-reference/sessions/search-sessions-by-status#response-pagination)

pagination

object

Pagination metadata returned with list responses.

Showchild attributes

Ctrl+I