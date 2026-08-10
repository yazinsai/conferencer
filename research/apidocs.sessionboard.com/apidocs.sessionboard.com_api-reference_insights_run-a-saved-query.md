---
url: "https://apidocs.sessionboard.com/api-reference/insights/run-a-saved-query"
title: "Run a saved query - Sessionboard API"
---

> ## Documentation Index
>
> Fetch the complete documentation index at: [/llms.txt](https://apidocs.sessionboard.com/llms.txt)
>
> Use this file to discover all available pages before exploring further.

[Skip to main content](https://apidocs.sessionboard.com/api-reference/insights/run-a-saved-query#content-area)

Run a saved query

cURL

```
curl --request POST \
  --url https://public-api.sessionboard.com/v1/insights/queries/{queryId}/run \
  --header 'Content-Type: application/json' \
  --header 'x-access-token: <api-key>' \
  --data '
{
  "eventId": 123,
  "eventIds": [\
    123\
  ],
  "obfuscatePii": true,
  "format": "<string>",
  "page": 123,
  "limit": 123
}
'
```

```
import requests

url = "https://public-api.sessionboard.com/v1/insights/queries/{queryId}/run"

payload = {
    "eventId": 123,
    "eventIds": [123],
    "obfuscatePii": True,
    "format": "<string>",
    "page": 123,
    "limit": 123
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
    eventId: 123,
    eventIds: [123],
    obfuscatePii: true,
    format: '<string>',
    page: 123,
    limit: 123
  })
};

fetch('https://public-api.sessionboard.com/v1/insights/queries/{queryId}/run', options)
  .then(res => res.json())
  .then(res => console.log(res))
  .catch(err => console.error(err));
```

```
<?php

$curl = curl_init();

curl_setopt_array($curl, [\
  CURLOPT_URL => "https://public-api.sessionboard.com/v1/insights/queries/{queryId}/run",\
  CURLOPT_RETURNTRANSFER => true,\
  CURLOPT_ENCODING => "",\
  CURLOPT_MAXREDIRS => 10,\
  CURLOPT_TIMEOUT => 30,\
  CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,\
  CURLOPT_CUSTOMREQUEST => "POST",\
  CURLOPT_POSTFIELDS => json_encode([\
    'eventId' => 123,\
    'eventIds' => [\
        123\
    ],\
    'obfuscatePii' => true,\
    'format' => '<string>',\
    'page' => 123,\
    'limit' => 123\
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

	url := "https://public-api.sessionboard.com/v1/insights/queries/{queryId}/run"

	payload := strings.NewReader("{\n  \"eventId\": 123,\n  \"eventIds\": [\n    123\n  ],\n  \"obfuscatePii\": true,\n  \"format\": \"<string>\",\n  \"page\": 123,\n  \"limit\": 123\n}")

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
HttpResponse<String> response = Unirest.post("https://public-api.sessionboard.com/v1/insights/queries/{queryId}/run")
  .header("x-access-token", "<api-key>")
  .header("Content-Type", "application/json")
  .body("{\n  \"eventId\": 123,\n  \"eventIds\": [\n    123\n  ],\n  \"obfuscatePii\": true,\n  \"format\": \"<string>\",\n  \"page\": 123,\n  \"limit\": 123\n}")
  .asString();
```

```
require 'uri'
require 'net/http'

url = URI("https://public-api.sessionboard.com/v1/insights/queries/{queryId}/run")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true

request = Net::HTTP::Post.new(url)
request["x-access-token"] = '<api-key>'
request["Content-Type"] = 'application/json'
request.body = "{\n  \"eventId\": 123,\n  \"eventIds\": [\n    123\n  ],\n  \"obfuscatePii\": true,\n  \"format\": \"<string>\",\n  \"page\": 123,\n  \"limit\": 123\n}"

response = http.request(request)
puts response.read_body
```

200

```
{
  "results": [\
    {}\
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

insights

/

queries

/

{queryId}

/

run

Try it

Run a saved query

cURL

```
curl --request POST \
  --url https://public-api.sessionboard.com/v1/insights/queries/{queryId}/run \
  --header 'Content-Type: application/json' \
  --header 'x-access-token: <api-key>' \
  --data '
{
  "eventId": 123,
  "eventIds": [\
    123\
  ],
  "obfuscatePii": true,
  "format": "<string>",
  "page": 123,
  "limit": 123
}
'
```

```
import requests

url = "https://public-api.sessionboard.com/v1/insights/queries/{queryId}/run"

payload = {
    "eventId": 123,
    "eventIds": [123],
    "obfuscatePii": True,
    "format": "<string>",
    "page": 123,
    "limit": 123
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
    eventId: 123,
    eventIds: [123],
    obfuscatePii: true,
    format: '<string>',
    page: 123,
    limit: 123
  })
};

fetch('https://public-api.sessionboard.com/v1/insights/queries/{queryId}/run', options)
  .then(res => res.json())
  .then(res => console.log(res))
  .catch(err => console.error(err));
```

```
<?php

$curl = curl_init();

curl_setopt_array($curl, [\
  CURLOPT_URL => "https://public-api.sessionboard.com/v1/insights/queries/{queryId}/run",\
  CURLOPT_RETURNTRANSFER => true,\
  CURLOPT_ENCODING => "",\
  CURLOPT_MAXREDIRS => 10,\
  CURLOPT_TIMEOUT => 30,\
  CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,\
  CURLOPT_CUSTOMREQUEST => "POST",\
  CURLOPT_POSTFIELDS => json_encode([\
    'eventId' => 123,\
    'eventIds' => [\
        123\
    ],\
    'obfuscatePii' => true,\
    'format' => '<string>',\
    'page' => 123,\
    'limit' => 123\
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

	url := "https://public-api.sessionboard.com/v1/insights/queries/{queryId}/run"

	payload := strings.NewReader("{\n  \"eventId\": 123,\n  \"eventIds\": [\n    123\n  ],\n  \"obfuscatePii\": true,\n  \"format\": \"<string>\",\n  \"page\": 123,\n  \"limit\": 123\n}")

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
HttpResponse<String> response = Unirest.post("https://public-api.sessionboard.com/v1/insights/queries/{queryId}/run")
  .header("x-access-token", "<api-key>")
  .header("Content-Type", "application/json")
  .body("{\n  \"eventId\": 123,\n  \"eventIds\": [\n    123\n  ],\n  \"obfuscatePii\": true,\n  \"format\": \"<string>\",\n  \"page\": 123,\n  \"limit\": 123\n}")
  .asString();
```

```
require 'uri'
require 'net/http'

url = URI("https://public-api.sessionboard.com/v1/insights/queries/{queryId}/run")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true

request = Net::HTTP::Post.new(url)
request["x-access-token"] = '<api-key>'
request["Content-Type"] = 'application/json'
request.body = "{\n  \"eventId\": 123,\n  \"eventIds\": [\n    123\n  ],\n  \"obfuscatePii\": true,\n  \"format\": \"<string>\",\n  \"page\": 123,\n  \"limit\": 123\n}"

response = http.request(request)
puts response.read_body
```

200

```
{
  "results": [\
    {}\
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

[​](https://apidocs.sessionboard.com/api-reference/insights/run-a-saved-query#authorization-x-access-token)

x-access-token

string

header

required

Organization API token. Generate from Organization Settings → API Tokens.

#### Path Parameters

[​](https://apidocs.sessionboard.com/api-reference/insights/run-a-saved-query#parameter-query-id)

queryId

string

required

The saved query ID.

#### Body

application/json

[​](https://apidocs.sessionboard.com/api-reference/insights/run-a-saved-query#body-event-id)

eventId

integer

Override the event scope for this run.

[​](https://apidocs.sessionboard.com/api-reference/insights/run-a-saved-query#body-event-ids)

eventIds

integer\[\]

Override with multiple event scopes.

[​](https://apidocs.sessionboard.com/api-reference/insights/run-a-saved-query#body-obfuscate-pii)

obfuscatePii

boolean

default:true

[​](https://apidocs.sessionboard.com/api-reference/insights/run-a-saved-query#body-format)

format

string

[​](https://apidocs.sessionboard.com/api-reference/insights/run-a-saved-query#body-page)

page

integer

[​](https://apidocs.sessionboard.com/api-reference/insights/run-a-saved-query#body-limit)

limit

integer

#### Response

200

application/json

OK

[​](https://apidocs.sessionboard.com/api-reference/insights/run-a-saved-query#response-results)

results

object\[\]

[​](https://apidocs.sessionboard.com/api-reference/insights/run-a-saved-query#response-pagination)

pagination

object

Pagination metadata returned with list responses.

Showchild attributes

Ctrl+I