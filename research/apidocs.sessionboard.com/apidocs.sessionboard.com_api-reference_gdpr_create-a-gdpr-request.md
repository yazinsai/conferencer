---
url: "https://apidocs.sessionboard.com/api-reference/gdpr/create-a-gdpr-request"
title: "Create a GDPR request - Sessionboard API"
---

> ## Documentation Index
>
> Fetch the complete documentation index at: [/llms.txt](https://apidocs.sessionboard.com/llms.txt)
>
> Use this file to discover all available pages before exploring further.

[Skip to main content](https://apidocs.sessionboard.com/api-reference/gdpr/create-a-gdpr-request#content-area)

Create a GDPR request

cURL

```
curl --request POST \
  --url https://public-api.sessionboard.com/v1/gdpr/requests \
  --header 'Content-Type: application/json' \
  --header 'x-access-token: <api-key>' \
  --data '
{
  "identityType": "email",
  "identityValue": "<string>"
}
'
```

```
import requests

url = "https://public-api.sessionboard.com/v1/gdpr/requests"

payload = {
    "identityType": "email",
    "identityValue": "<string>"
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
  body: JSON.stringify({identityType: 'email', identityValue: '<string>'})
};

fetch('https://public-api.sessionboard.com/v1/gdpr/requests', options)
  .then(res => res.json())
  .then(res => console.log(res))
  .catch(err => console.error(err));
```

```
<?php

$curl = curl_init();

curl_setopt_array($curl, [\
  CURLOPT_URL => "https://public-api.sessionboard.com/v1/gdpr/requests",\
  CURLOPT_RETURNTRANSFER => true,\
  CURLOPT_ENCODING => "",\
  CURLOPT_MAXREDIRS => 10,\
  CURLOPT_TIMEOUT => 30,\
  CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,\
  CURLOPT_CUSTOMREQUEST => "POST",\
  CURLOPT_POSTFIELDS => json_encode([\
    'identityType' => 'email',\
    'identityValue' => '<string>'\
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

	url := "https://public-api.sessionboard.com/v1/gdpr/requests"

	payload := strings.NewReader("{\n  \"identityType\": \"email\",\n  \"identityValue\": \"<string>\"\n}")

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
HttpResponse<String> response = Unirest.post("https://public-api.sessionboard.com/v1/gdpr/requests")
  .header("x-access-token", "<api-key>")
  .header("Content-Type", "application/json")
  .body("{\n  \"identityType\": \"email\",\n  \"identityValue\": \"<string>\"\n}")
  .asString();
```

```
require 'uri'
require 'net/http'

url = URI("https://public-api.sessionboard.com/v1/gdpr/requests")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true

request = Net::HTTP::Post.new(url)
request["x-access-token"] = '<api-key>'
request["Content-Type"] = 'application/json'
request.body = "{\n  \"identityType\": \"email\",\n  \"identityValue\": \"<string>\"\n}"

response = http.request(request)
puts response.read_body
```

201

```
{
  "id": "<string>",
  "org_id": "<string>",
  "request_type": "<string>",
  "identity_type": "<string>",
  "identity_value": "<string>",
  "status": "<string>",
  "matching_user_exists": true,
  "response": {
    "users": [\
      123\
    ],
    "org_users": [\
      "<string>"\
    ],
    "event_users": [\
      123\
    ],
    "contact_records": [\
      "<string>"\
    ]
  },
  "created_at": "<string>",
  "updated_at": "<string>"
}
```

POST

https://public-api.sessionboard.comhttps://public-api-eu.sessionboard.com

/

v1

/

gdpr

/

requests

Try it

Create a GDPR request

cURL

```
curl --request POST \
  --url https://public-api.sessionboard.com/v1/gdpr/requests \
  --header 'Content-Type: application/json' \
  --header 'x-access-token: <api-key>' \
  --data '
{
  "identityType": "email",
  "identityValue": "<string>"
}
'
```

```
import requests

url = "https://public-api.sessionboard.com/v1/gdpr/requests"

payload = {
    "identityType": "email",
    "identityValue": "<string>"
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
  body: JSON.stringify({identityType: 'email', identityValue: '<string>'})
};

fetch('https://public-api.sessionboard.com/v1/gdpr/requests', options)
  .then(res => res.json())
  .then(res => console.log(res))
  .catch(err => console.error(err));
```

```
<?php

$curl = curl_init();

curl_setopt_array($curl, [\
  CURLOPT_URL => "https://public-api.sessionboard.com/v1/gdpr/requests",\
  CURLOPT_RETURNTRANSFER => true,\
  CURLOPT_ENCODING => "",\
  CURLOPT_MAXREDIRS => 10,\
  CURLOPT_TIMEOUT => 30,\
  CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,\
  CURLOPT_CUSTOMREQUEST => "POST",\
  CURLOPT_POSTFIELDS => json_encode([\
    'identityType' => 'email',\
    'identityValue' => '<string>'\
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

	url := "https://public-api.sessionboard.com/v1/gdpr/requests"

	payload := strings.NewReader("{\n  \"identityType\": \"email\",\n  \"identityValue\": \"<string>\"\n}")

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
HttpResponse<String> response = Unirest.post("https://public-api.sessionboard.com/v1/gdpr/requests")
  .header("x-access-token", "<api-key>")
  .header("Content-Type", "application/json")
  .body("{\n  \"identityType\": \"email\",\n  \"identityValue\": \"<string>\"\n}")
  .asString();
```

```
require 'uri'
require 'net/http'

url = URI("https://public-api.sessionboard.com/v1/gdpr/requests")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true

request = Net::HTTP::Post.new(url)
request["x-access-token"] = '<api-key>'
request["Content-Type"] = 'application/json'
request.body = "{\n  \"identityType\": \"email\",\n  \"identityValue\": \"<string>\"\n}"

response = http.request(request)
puts response.read_body
```

201

```
{
  "id": "<string>",
  "org_id": "<string>",
  "request_type": "<string>",
  "identity_type": "<string>",
  "identity_value": "<string>",
  "status": "<string>",
  "matching_user_exists": true,
  "response": {
    "users": [\
      123\
    ],
    "org_users": [\
      "<string>"\
    ],
    "event_users": [\
      123\
    ],
    "contact_records": [\
      "<string>"\
    ]
  },
  "created_at": "<string>",
  "updated_at": "<string>"
}
```

#### Authorizations

ApiKeyBearerTokenApiKeyBearerToken

[​](https://apidocs.sessionboard.com/api-reference/gdpr/create-a-gdpr-request#authorization-x-access-token)

x-access-token

string

header

required

Organization API token. Generate from Organization Settings → API Tokens.

#### Body

application/json

[​](https://apidocs.sessionboard.com/api-reference/gdpr/create-a-gdpr-request#body-request-type)

requestType

enum<string>

required

The type of GDPR request.

Available options:

`erasure`,

`access`

[​](https://apidocs.sessionboard.com/api-reference/gdpr/create-a-gdpr-request#body-identity-type)

identityType

enum<string>

required

The type of identity to look up.

Available options:

`email`

[​](https://apidocs.sessionboard.com/api-reference/gdpr/create-a-gdpr-request#body-identity-value)

identityValue

string

required

The identity value (e.g., an email address).

Example:

`"jane.doe@example.com"`

#### Response

201

application/json

Created

A GDPR data access or erasure request.

[​](https://apidocs.sessionboard.com/api-reference/gdpr/create-a-gdpr-request#response-id)

id

string

[​](https://apidocs.sessionboard.com/api-reference/gdpr/create-a-gdpr-request#response-org-id)

org\_id

string

[​](https://apidocs.sessionboard.com/api-reference/gdpr/create-a-gdpr-request#response-request-type)

request\_type

string

[​](https://apidocs.sessionboard.com/api-reference/gdpr/create-a-gdpr-request#response-identity-type)

identity\_type

string

[​](https://apidocs.sessionboard.com/api-reference/gdpr/create-a-gdpr-request#response-identity-value)

identity\_value

string

[​](https://apidocs.sessionboard.com/api-reference/gdpr/create-a-gdpr-request#response-status)

status

string

[​](https://apidocs.sessionboard.com/api-reference/gdpr/create-a-gdpr-request#response-matching-user-exists)

matching\_user\_exists

boolean

[​](https://apidocs.sessionboard.com/api-reference/gdpr/create-a-gdpr-request#response-response)

response

object

Showchild attributes

[​](https://apidocs.sessionboard.com/api-reference/gdpr/create-a-gdpr-request#response-created-at)

created\_at

string

[​](https://apidocs.sessionboard.com/api-reference/gdpr/create-a-gdpr-request#response-updated-at)

updated\_at

string

⌘I