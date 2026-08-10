---
url: "https://apidocs.sessionboard.com/api-reference/insights/execute-a-sbql-query"
title: "Execute a SbQL query - Sessionboard API"
---

> ## Documentation Index
>
> Fetch the complete documentation index at: [/llms.txt](https://apidocs.sessionboard.com/llms.txt)
>
> Use this file to discover all available pages before exploring further.

[Skip to main content](https://apidocs.sessionboard.com/api-reference/insights/execute-a-sbql-query#content-area)

Execute a SbQL query

cURL

```
curl --request POST \
  --url https://public-api.sessionboard.com/v1/insights/execute \
  --header 'Content-Type: application/json' \
  --header 'x-access-token: <api-key>' \
  --data '
{
  "query": "<string>",
  "eventId": 123,
  "eventIds": [\
    123\
  ],
  "obfuscatePii": true,
  "format": "<string>",
  "page": 123,
  "limit": 123,
  "search": "<string>",
  "sortBy": "<string>",
  "groupBy": "<string>",
  "pivot": "<string>"
}
'
```

```
import requests

url = "https://public-api.sessionboard.com/v1/insights/execute"

payload = {
    "query": "<string>",
    "eventId": 123,
    "eventIds": [123],
    "obfuscatePii": True,
    "format": "<string>",
    "page": 123,
    "limit": 123,
    "search": "<string>",
    "sortBy": "<string>",
    "groupBy": "<string>",
    "pivot": "<string>"
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
    query: '<string>',
    eventId: 123,
    eventIds: [123],
    obfuscatePii: true,
    format: '<string>',
    page: 123,
    limit: 123,
    search: '<string>',
    sortBy: '<string>',
    groupBy: '<string>',
    pivot: '<string>'
  })
};

fetch('https://public-api.sessionboard.com/v1/insights/execute', options)
  .then(res => res.json())
  .then(res => console.log(res))
  .catch(err => console.error(err));
```

```
<?php

$curl = curl_init();

curl_setopt_array($curl, [\
  CURLOPT_URL => "https://public-api.sessionboard.com/v1/insights/execute",\
  CURLOPT_RETURNTRANSFER => true,\
  CURLOPT_ENCODING => "",\
  CURLOPT_MAXREDIRS => 10,\
  CURLOPT_TIMEOUT => 30,\
  CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,\
  CURLOPT_CUSTOMREQUEST => "POST",\
  CURLOPT_POSTFIELDS => json_encode([\
    'query' => '<string>',\
    'eventId' => 123,\
    'eventIds' => [\
        123\
    ],\
    'obfuscatePii' => true,\
    'format' => '<string>',\
    'page' => 123,\
    'limit' => 123,\
    'search' => '<string>',\
    'sortBy' => '<string>',\
    'groupBy' => '<string>',\
    'pivot' => '<string>'\
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

	url := "https://public-api.sessionboard.com/v1/insights/execute"

	payload := strings.NewReader("{\n  \"query\": \"<string>\",\n  \"eventId\": 123,\n  \"eventIds\": [\n    123\n  ],\n  \"obfuscatePii\": true,\n  \"format\": \"<string>\",\n  \"page\": 123,\n  \"limit\": 123,\n  \"search\": \"<string>\",\n  \"sortBy\": \"<string>\",\n  \"groupBy\": \"<string>\",\n  \"pivot\": \"<string>\"\n}")

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
HttpResponse<String> response = Unirest.post("https://public-api.sessionboard.com/v1/insights/execute")
  .header("x-access-token", "<api-key>")
  .header("Content-Type", "application/json")
  .body("{\n  \"query\": \"<string>\",\n  \"eventId\": 123,\n  \"eventIds\": [\n    123\n  ],\n  \"obfuscatePii\": true,\n  \"format\": \"<string>\",\n  \"page\": 123,\n  \"limit\": 123,\n  \"search\": \"<string>\",\n  \"sortBy\": \"<string>\",\n  \"groupBy\": \"<string>\",\n  \"pivot\": \"<string>\"\n}")
  .asString();
```

```
require 'uri'
require 'net/http'

url = URI("https://public-api.sessionboard.com/v1/insights/execute")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true

request = Net::HTTP::Post.new(url)
request["x-access-token"] = '<api-key>'
request["Content-Type"] = 'application/json'
request.body = "{\n  \"query\": \"<string>\",\n  \"eventId\": 123,\n  \"eventIds\": [\n    123\n  ],\n  \"obfuscatePii\": true,\n  \"format\": \"<string>\",\n  \"page\": 123,\n  \"limit\": 123,\n  \"search\": \"<string>\",\n  \"sortBy\": \"<string>\",\n  \"groupBy\": \"<string>\",\n  \"pivot\": \"<string>\"\n}"

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

execute

Try it

Execute a SbQL query

cURL

```
curl --request POST \
  --url https://public-api.sessionboard.com/v1/insights/execute \
  --header 'Content-Type: application/json' \
  --header 'x-access-token: <api-key>' \
  --data '
{
  "query": "<string>",
  "eventId": 123,
  "eventIds": [\
    123\
  ],
  "obfuscatePii": true,
  "format": "<string>",
  "page": 123,
  "limit": 123,
  "search": "<string>",
  "sortBy": "<string>",
  "groupBy": "<string>",
  "pivot": "<string>"
}
'
```

```
import requests

url = "https://public-api.sessionboard.com/v1/insights/execute"

payload = {
    "query": "<string>",
    "eventId": 123,
    "eventIds": [123],
    "obfuscatePii": True,
    "format": "<string>",
    "page": 123,
    "limit": 123,
    "search": "<string>",
    "sortBy": "<string>",
    "groupBy": "<string>",
    "pivot": "<string>"
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
    query: '<string>',
    eventId: 123,
    eventIds: [123],
    obfuscatePii: true,
    format: '<string>',
    page: 123,
    limit: 123,
    search: '<string>',
    sortBy: '<string>',
    groupBy: '<string>',
    pivot: '<string>'
  })
};

fetch('https://public-api.sessionboard.com/v1/insights/execute', options)
  .then(res => res.json())
  .then(res => console.log(res))
  .catch(err => console.error(err));
```

```
<?php

$curl = curl_init();

curl_setopt_array($curl, [\
  CURLOPT_URL => "https://public-api.sessionboard.com/v1/insights/execute",\
  CURLOPT_RETURNTRANSFER => true,\
  CURLOPT_ENCODING => "",\
  CURLOPT_MAXREDIRS => 10,\
  CURLOPT_TIMEOUT => 30,\
  CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,\
  CURLOPT_CUSTOMREQUEST => "POST",\
  CURLOPT_POSTFIELDS => json_encode([\
    'query' => '<string>',\
    'eventId' => 123,\
    'eventIds' => [\
        123\
    ],\
    'obfuscatePii' => true,\
    'format' => '<string>',\
    'page' => 123,\
    'limit' => 123,\
    'search' => '<string>',\
    'sortBy' => '<string>',\
    'groupBy' => '<string>',\
    'pivot' => '<string>'\
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

	url := "https://public-api.sessionboard.com/v1/insights/execute"

	payload := strings.NewReader("{\n  \"query\": \"<string>\",\n  \"eventId\": 123,\n  \"eventIds\": [\n    123\n  ],\n  \"obfuscatePii\": true,\n  \"format\": \"<string>\",\n  \"page\": 123,\n  \"limit\": 123,\n  \"search\": \"<string>\",\n  \"sortBy\": \"<string>\",\n  \"groupBy\": \"<string>\",\n  \"pivot\": \"<string>\"\n}")

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
HttpResponse<String> response = Unirest.post("https://public-api.sessionboard.com/v1/insights/execute")
  .header("x-access-token", "<api-key>")
  .header("Content-Type", "application/json")
  .body("{\n  \"query\": \"<string>\",\n  \"eventId\": 123,\n  \"eventIds\": [\n    123\n  ],\n  \"obfuscatePii\": true,\n  \"format\": \"<string>\",\n  \"page\": 123,\n  \"limit\": 123,\n  \"search\": \"<string>\",\n  \"sortBy\": \"<string>\",\n  \"groupBy\": \"<string>\",\n  \"pivot\": \"<string>\"\n}")
  .asString();
```

```
require 'uri'
require 'net/http'

url = URI("https://public-api.sessionboard.com/v1/insights/execute")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true

request = Net::HTTP::Post.new(url)
request["x-access-token"] = '<api-key>'
request["Content-Type"] = 'application/json'
request.body = "{\n  \"query\": \"<string>\",\n  \"eventId\": 123,\n  \"eventIds\": [\n    123\n  ],\n  \"obfuscatePii\": true,\n  \"format\": \"<string>\",\n  \"page\": 123,\n  \"limit\": 123,\n  \"search\": \"<string>\",\n  \"sortBy\": \"<string>\",\n  \"groupBy\": \"<string>\",\n  \"pivot\": \"<string>\"\n}"

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

[​](https://apidocs.sessionboard.com/api-reference/insights/execute-a-sbql-query#authorization-x-access-token)

x-access-token

string

header

required

Organization API token. Generate from Organization Settings → API Tokens.

#### Body

application/json

[​](https://apidocs.sessionboard.com/api-reference/insights/execute-a-sbql-query#body-query)

query

string

required

The SbQL query string to execute.

Example:

`"SELECT sessions.title, sessions.status FROM sessions"`

[​](https://apidocs.sessionboard.com/api-reference/insights/execute-a-sbql-query#body-event-id)

eventId

integer

Scope query to a single event.

[​](https://apidocs.sessionboard.com/api-reference/insights/execute-a-sbql-query#body-event-ids)

eventIds

integer\[\]

Scope query to multiple events.

[​](https://apidocs.sessionboard.com/api-reference/insights/execute-a-sbql-query#body-obfuscate-pii)

obfuscatePii

boolean

default:true

Whether to obfuscate personally identifiable information in results.

[​](https://apidocs.sessionboard.com/api-reference/insights/execute-a-sbql-query#body-format)

format

string

Output format for results.

[​](https://apidocs.sessionboard.com/api-reference/insights/execute-a-sbql-query#body-page)

page

integer

Page number for paginated results.

[​](https://apidocs.sessionboard.com/api-reference/insights/execute-a-sbql-query#body-limit)

limit

integer

Maximum number of rows to return.

[​](https://apidocs.sessionboard.com/api-reference/insights/execute-a-sbql-query#body-search)

search

string

Full-text search within results.

[​](https://apidocs.sessionboard.com/api-reference/insights/execute-a-sbql-query#body-sort-by)

sortBy

string

Column name to sort results by.

[​](https://apidocs.sessionboard.com/api-reference/insights/execute-a-sbql-query#body-sort-direction)

sortDirection

enum<string>

Sort direction.

Available options:

`asc`,

`desc`

[​](https://apidocs.sessionboard.com/api-reference/insights/execute-a-sbql-query#body-group-by)

groupBy

string

Column name to group results by.

[​](https://apidocs.sessionboard.com/api-reference/insights/execute-a-sbql-query#body-pivot)

pivot

string

Column name to pivot results on.

#### Response

200

application/json

OK

[​](https://apidocs.sessionboard.com/api-reference/insights/execute-a-sbql-query#response-results)

results

object\[\]

[​](https://apidocs.sessionboard.com/api-reference/insights/execute-a-sbql-query#response-pagination)

pagination

object

Pagination metadata returned with list responses.

Showchild attributes

Ctrl+I