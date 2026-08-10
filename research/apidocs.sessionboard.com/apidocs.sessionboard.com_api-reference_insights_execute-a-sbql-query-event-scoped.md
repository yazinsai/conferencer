---
url: "https://apidocs.sessionboard.com/api-reference/insights/execute-a-sbql-query-event-scoped"
title: "Execute a SbQL query (event-scoped) - Sessionboard API"
---

> ## Documentation Index
>
> Fetch the complete documentation index at: [/llms.txt](https://apidocs.sessionboard.com/llms.txt)
>
> Use this file to discover all available pages before exploring further.

[Skip to main content](https://apidocs.sessionboard.com/api-reference/insights/execute-a-sbql-query-event-scoped#content-area)

Execute a SbQL query (event-scoped)

cURL

```
curl --request POST \
  --url https://public-api.sessionboard.com/v1/event/{eventId}/insights/execute \
  --header 'Content-Type: application/json' \
  --header 'x-access-token: <api-key>' \
  --data '
{
  "query": "<string>",
  "obfuscatePii": true,
  "page": 123,
  "limit": 123
}
'
```

```
import requests

url = "https://public-api.sessionboard.com/v1/event/{eventId}/insights/execute"

payload = {
    "query": "<string>",
    "obfuscatePii": True,
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
  body: JSON.stringify({query: '<string>', obfuscatePii: true, page: 123, limit: 123})
};

fetch('https://public-api.sessionboard.com/v1/event/{eventId}/insights/execute', options)
  .then(res => res.json())
  .then(res => console.log(res))
  .catch(err => console.error(err));
```

```
<?php

$curl = curl_init();

curl_setopt_array($curl, [\
  CURLOPT_URL => "https://public-api.sessionboard.com/v1/event/{eventId}/insights/execute",\
  CURLOPT_RETURNTRANSFER => true,\
  CURLOPT_ENCODING => "",\
  CURLOPT_MAXREDIRS => 10,\
  CURLOPT_TIMEOUT => 30,\
  CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,\
  CURLOPT_CUSTOMREQUEST => "POST",\
  CURLOPT_POSTFIELDS => json_encode([\
    'query' => '<string>',\
    'obfuscatePii' => true,\
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

	url := "https://public-api.sessionboard.com/v1/event/{eventId}/insights/execute"

	payload := strings.NewReader("{\n  \"query\": \"<string>\",\n  \"obfuscatePii\": true,\n  \"page\": 123,\n  \"limit\": 123\n}")

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
HttpResponse<String> response = Unirest.post("https://public-api.sessionboard.com/v1/event/{eventId}/insights/execute")
  .header("x-access-token", "<api-key>")
  .header("Content-Type", "application/json")
  .body("{\n  \"query\": \"<string>\",\n  \"obfuscatePii\": true,\n  \"page\": 123,\n  \"limit\": 123\n}")
  .asString();
```

```
require 'uri'
require 'net/http'

url = URI("https://public-api.sessionboard.com/v1/event/{eventId}/insights/execute")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true

request = Net::HTTP::Post.new(url)
request["x-access-token"] = '<api-key>'
request["Content-Type"] = 'application/json'
request.body = "{\n  \"query\": \"<string>\",\n  \"obfuscatePii\": true,\n  \"page\": 123,\n  \"limit\": 123\n}"

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

event

/

{eventId}

/

insights

/

execute

Try it

Execute a SbQL query (event-scoped)

cURL

```
curl --request POST \
  --url https://public-api.sessionboard.com/v1/event/{eventId}/insights/execute \
  --header 'Content-Type: application/json' \
  --header 'x-access-token: <api-key>' \
  --data '
{
  "query": "<string>",
  "obfuscatePii": true,
  "page": 123,
  "limit": 123
}
'
```

```
import requests

url = "https://public-api.sessionboard.com/v1/event/{eventId}/insights/execute"

payload = {
    "query": "<string>",
    "obfuscatePii": True,
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
  body: JSON.stringify({query: '<string>', obfuscatePii: true, page: 123, limit: 123})
};

fetch('https://public-api.sessionboard.com/v1/event/{eventId}/insights/execute', options)
  .then(res => res.json())
  .then(res => console.log(res))
  .catch(err => console.error(err));
```

```
<?php

$curl = curl_init();

curl_setopt_array($curl, [\
  CURLOPT_URL => "https://public-api.sessionboard.com/v1/event/{eventId}/insights/execute",\
  CURLOPT_RETURNTRANSFER => true,\
  CURLOPT_ENCODING => "",\
  CURLOPT_MAXREDIRS => 10,\
  CURLOPT_TIMEOUT => 30,\
  CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,\
  CURLOPT_CUSTOMREQUEST => "POST",\
  CURLOPT_POSTFIELDS => json_encode([\
    'query' => '<string>',\
    'obfuscatePii' => true,\
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

	url := "https://public-api.sessionboard.com/v1/event/{eventId}/insights/execute"

	payload := strings.NewReader("{\n  \"query\": \"<string>\",\n  \"obfuscatePii\": true,\n  \"page\": 123,\n  \"limit\": 123\n}")

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
HttpResponse<String> response = Unirest.post("https://public-api.sessionboard.com/v1/event/{eventId}/insights/execute")
  .header("x-access-token", "<api-key>")
  .header("Content-Type", "application/json")
  .body("{\n  \"query\": \"<string>\",\n  \"obfuscatePii\": true,\n  \"page\": 123,\n  \"limit\": 123\n}")
  .asString();
```

```
require 'uri'
require 'net/http'

url = URI("https://public-api.sessionboard.com/v1/event/{eventId}/insights/execute")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true

request = Net::HTTP::Post.new(url)
request["x-access-token"] = '<api-key>'
request["Content-Type"] = 'application/json'
request.body = "{\n  \"query\": \"<string>\",\n  \"obfuscatePii\": true,\n  \"page\": 123,\n  \"limit\": 123\n}"

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

ApiKeyBearerTokenApiKeyBearerToken

[​](https://apidocs.sessionboard.com/api-reference/insights/execute-a-sbql-query-event-scoped#authorization-x-access-token)

x-access-token

string

header

required

Organization API token. Generate from Organization Settings → API Tokens.

#### Path Parameters

[​](https://apidocs.sessionboard.com/api-reference/insights/execute-a-sbql-query-event-scoped#parameter-event-id)

eventId

integer

required

The event ID to scope the query to.

#### Body

application/json

[​](https://apidocs.sessionboard.com/api-reference/insights/execute-a-sbql-query-event-scoped#body-query)

query

string

required

[​](https://apidocs.sessionboard.com/api-reference/insights/execute-a-sbql-query-event-scoped#body-obfuscate-pii)

obfuscatePii

boolean

default:true

[​](https://apidocs.sessionboard.com/api-reference/insights/execute-a-sbql-query-event-scoped#body-page)

page

integer

[​](https://apidocs.sessionboard.com/api-reference/insights/execute-a-sbql-query-event-scoped#body-limit)

limit

integer

#### Response

200

application/json

OK

[​](https://apidocs.sessionboard.com/api-reference/insights/execute-a-sbql-query-event-scoped#response-results)

results

object\[\]

[​](https://apidocs.sessionboard.com/api-reference/insights/execute-a-sbql-query-event-scoped#response-pagination)

pagination

object

Pagination metadata returned with list responses.

Showchild attributes

Ctrl+I