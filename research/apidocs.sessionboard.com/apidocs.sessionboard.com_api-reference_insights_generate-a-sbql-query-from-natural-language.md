---
url: "https://apidocs.sessionboard.com/api-reference/insights/generate-a-sbql-query-from-natural-language"
title: "Generate a SbQL query from natural language - Sessionboard API"
---

> ## Documentation Index
>
> Fetch the complete documentation index at: [/llms.txt](https://apidocs.sessionboard.com/llms.txt)
>
> Use this file to discover all available pages before exploring further.

[Skip to main content](https://apidocs.sessionboard.com/api-reference/insights/generate-a-sbql-query-from-natural-language#content-area)

Generate a SbQL query from natural language

cURL

```
curl --request POST \
  --url https://public-api.sessionboard.com/v1/insights/ai/generate \
  --header 'Content-Type: application/json' \
  --header 'x-access-token: <api-key>' \
  --data '
{
  "prompt": "<string>",
  "eventId": 123,
  "eventIds": [\
    123\
  ],
  "conversationHistory": [\
    {\
      "role": "<string>",\
      "content": "<string>"\
    }\
  ]
}
'
```

```
import requests

url = "https://public-api.sessionboard.com/v1/insights/ai/generate"

payload = {
    "prompt": "<string>",
    "eventId": 123,
    "eventIds": [123],
    "conversationHistory": [\
        {\
            "role": "<string>",\
            "content": "<string>"\
        }\
    ]
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
    prompt: '<string>',
    eventId: 123,
    eventIds: [123],
    conversationHistory: [{role: '<string>', content: '<string>'}]
  })
};

fetch('https://public-api.sessionboard.com/v1/insights/ai/generate', options)
  .then(res => res.json())
  .then(res => console.log(res))
  .catch(err => console.error(err));
```

```
<?php

$curl = curl_init();

curl_setopt_array($curl, [\
  CURLOPT_URL => "https://public-api.sessionboard.com/v1/insights/ai/generate",\
  CURLOPT_RETURNTRANSFER => true,\
  CURLOPT_ENCODING => "",\
  CURLOPT_MAXREDIRS => 10,\
  CURLOPT_TIMEOUT => 30,\
  CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,\
  CURLOPT_CUSTOMREQUEST => "POST",\
  CURLOPT_POSTFIELDS => json_encode([\
    'prompt' => '<string>',\
    'eventId' => 123,\
    'eventIds' => [\
        123\
    ],\
    'conversationHistory' => [\
        [\
                'role' => '<string>',\
                'content' => '<string>'\
        ]\
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

	url := "https://public-api.sessionboard.com/v1/insights/ai/generate"

	payload := strings.NewReader("{\n  \"prompt\": \"<string>\",\n  \"eventId\": 123,\n  \"eventIds\": [\n    123\n  ],\n  \"conversationHistory\": [\n    {\n      \"role\": \"<string>\",\n      \"content\": \"<string>\"\n    }\n  ]\n}")

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
HttpResponse<String> response = Unirest.post("https://public-api.sessionboard.com/v1/insights/ai/generate")
  .header("x-access-token", "<api-key>")
  .header("Content-Type", "application/json")
  .body("{\n  \"prompt\": \"<string>\",\n  \"eventId\": 123,\n  \"eventIds\": [\n    123\n  ],\n  \"conversationHistory\": [\n    {\n      \"role\": \"<string>\",\n      \"content\": \"<string>\"\n    }\n  ]\n}")
  .asString();
```

```
require 'uri'
require 'net/http'

url = URI("https://public-api.sessionboard.com/v1/insights/ai/generate")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true

request = Net::HTTP::Post.new(url)
request["x-access-token"] = '<api-key>'
request["Content-Type"] = 'application/json'
request.body = "{\n  \"prompt\": \"<string>\",\n  \"eventId\": 123,\n  \"eventIds\": [\n    123\n  ],\n  \"conversationHistory\": [\n    {\n      \"role\": \"<string>\",\n      \"content\": \"<string>\"\n    }\n  ]\n}"

response = http.request(request)
puts response.read_body
```

200

```
{
  "query": "<string>",
  "explanation": "<string>"
}
```

POST

https://public-api.sessionboard.comhttps://public-api-eu.sessionboard.com

/

v1

/

insights

/

ai

/

generate

Try it

Generate a SbQL query from natural language

cURL

```
curl --request POST \
  --url https://public-api.sessionboard.com/v1/insights/ai/generate \
  --header 'Content-Type: application/json' \
  --header 'x-access-token: <api-key>' \
  --data '
{
  "prompt": "<string>",
  "eventId": 123,
  "eventIds": [\
    123\
  ],
  "conversationHistory": [\
    {\
      "role": "<string>",\
      "content": "<string>"\
    }\
  ]
}
'
```

```
import requests

url = "https://public-api.sessionboard.com/v1/insights/ai/generate"

payload = {
    "prompt": "<string>",
    "eventId": 123,
    "eventIds": [123],
    "conversationHistory": [\
        {\
            "role": "<string>",\
            "content": "<string>"\
        }\
    ]
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
    prompt: '<string>',
    eventId: 123,
    eventIds: [123],
    conversationHistory: [{role: '<string>', content: '<string>'}]
  })
};

fetch('https://public-api.sessionboard.com/v1/insights/ai/generate', options)
  .then(res => res.json())
  .then(res => console.log(res))
  .catch(err => console.error(err));
```

```
<?php

$curl = curl_init();

curl_setopt_array($curl, [\
  CURLOPT_URL => "https://public-api.sessionboard.com/v1/insights/ai/generate",\
  CURLOPT_RETURNTRANSFER => true,\
  CURLOPT_ENCODING => "",\
  CURLOPT_MAXREDIRS => 10,\
  CURLOPT_TIMEOUT => 30,\
  CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,\
  CURLOPT_CUSTOMREQUEST => "POST",\
  CURLOPT_POSTFIELDS => json_encode([\
    'prompt' => '<string>',\
    'eventId' => 123,\
    'eventIds' => [\
        123\
    ],\
    'conversationHistory' => [\
        [\
                'role' => '<string>',\
                'content' => '<string>'\
        ]\
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

	url := "https://public-api.sessionboard.com/v1/insights/ai/generate"

	payload := strings.NewReader("{\n  \"prompt\": \"<string>\",\n  \"eventId\": 123,\n  \"eventIds\": [\n    123\n  ],\n  \"conversationHistory\": [\n    {\n      \"role\": \"<string>\",\n      \"content\": \"<string>\"\n    }\n  ]\n}")

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
HttpResponse<String> response = Unirest.post("https://public-api.sessionboard.com/v1/insights/ai/generate")
  .header("x-access-token", "<api-key>")
  .header("Content-Type", "application/json")
  .body("{\n  \"prompt\": \"<string>\",\n  \"eventId\": 123,\n  \"eventIds\": [\n    123\n  ],\n  \"conversationHistory\": [\n    {\n      \"role\": \"<string>\",\n      \"content\": \"<string>\"\n    }\n  ]\n}")
  .asString();
```

```
require 'uri'
require 'net/http'

url = URI("https://public-api.sessionboard.com/v1/insights/ai/generate")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true

request = Net::HTTP::Post.new(url)
request["x-access-token"] = '<api-key>'
request["Content-Type"] = 'application/json'
request.body = "{\n  \"prompt\": \"<string>\",\n  \"eventId\": 123,\n  \"eventIds\": [\n    123\n  ],\n  \"conversationHistory\": [\n    {\n      \"role\": \"<string>\",\n      \"content\": \"<string>\"\n    }\n  ]\n}"

response = http.request(request)
puts response.read_body
```

200

```
{
  "query": "<string>",
  "explanation": "<string>"
}
```

#### Authorizations

[​](https://apidocs.sessionboard.com/api-reference/insights/generate-a-sbql-query-from-natural-language#authorization-x-access-token)

x-access-token

string

header

required

Organization API token. Generate from Organization Settings → API Tokens.

#### Body

application/json

[​](https://apidocs.sessionboard.com/api-reference/insights/generate-a-sbql-query-from-natural-language#body-prompt)

prompt

string

required

Natural language description of the data you want to query.

Example:

`"Show me all accepted sessions with their speakers"`

[​](https://apidocs.sessionboard.com/api-reference/insights/generate-a-sbql-query-from-natural-language#body-event-id)

eventId

integer

Scope to a single event for context.

[​](https://apidocs.sessionboard.com/api-reference/insights/generate-a-sbql-query-from-natural-language#body-event-ids)

eventIds

integer\[\]

Scope to multiple events for context.

[​](https://apidocs.sessionboard.com/api-reference/insights/generate-a-sbql-query-from-natural-language#body-conversation-history)

conversationHistory

object\[\]

Previous conversation turns for multi-turn query refinement.

Showchild attributes

#### Response

200

application/json

OK

[​](https://apidocs.sessionboard.com/api-reference/insights/generate-a-sbql-query-from-natural-language#response-query)

query

string

The generated SbQL query.

[​](https://apidocs.sessionboard.com/api-reference/insights/generate-a-sbql-query-from-natural-language#response-explanation)

explanation

string

Human-readable explanation of the generated query.

Ctrl+I