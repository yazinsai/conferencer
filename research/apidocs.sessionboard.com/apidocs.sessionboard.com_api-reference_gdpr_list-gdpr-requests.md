---
url: "https://apidocs.sessionboard.com/api-reference/gdpr/list-gdpr-requests"
title: "List GDPR requests - Sessionboard API"
---

> ## Documentation Index
>
> Fetch the complete documentation index at: [/llms.txt](https://apidocs.sessionboard.com/llms.txt)
>
> Use this file to discover all available pages before exploring further.

[Skip to main content](https://apidocs.sessionboard.com/api-reference/gdpr/list-gdpr-requests#content-area)

List GDPR requests

cURL

```
curl --request GET \
  --url https://public-api.sessionboard.com/v1/gdpr/requests \
  --header 'x-access-token: <api-key>'
```

```
import requests

url = "https://public-api.sessionboard.com/v1/gdpr/requests"

headers = {"x-access-token": "<api-key>"}

response = requests.get(url, headers=headers)

print(response.text)
```

```
const options = {method: 'GET', headers: {'x-access-token': '<api-key>'}};

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

	url := "https://public-api.sessionboard.com/v1/gdpr/requests"

	req, _ := http.NewRequest("GET", url, nil)

	req.Header.Add("x-access-token", "<api-key>")

	res, _ := http.DefaultClient.Do(req)

	defer res.Body.Close()
	body, _ := io.ReadAll(res.Body)

	fmt.Println(string(body))

}
```

```
HttpResponse<String> response = Unirest.get("https://public-api.sessionboard.com/v1/gdpr/requests")
  .header("x-access-token", "<api-key>")
  .asString();
```

```
require 'uri'
require 'net/http'

url = URI("https://public-api.sessionboard.com/v1/gdpr/requests")

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
  "results": [\
    {\
      "id": "<string>",\
      "org_id": "<string>",\
      "request_type": "<string>",\
      "identity_type": "<string>",\
      "identity_value": "<string>",\
      "status": "<string>",\
      "matching_user_exists": true,\
      "response": {\
        "users": [\
          123\
        ],\
        "org_users": [\
          "<string>"\
        ],\
        "event_users": [\
          123\
        ],\
        "contact_records": [\
          "<string>"\
        ]\
      },\
      "created_at": "<string>",\
      "updated_at": "<string>"\
    }\
  ]
}
```

GET

https://public-api.sessionboard.comhttps://public-api-eu.sessionboard.com

/

v1

/

gdpr

/

requests

Try it

List GDPR requests

cURL

```
curl --request GET \
  --url https://public-api.sessionboard.com/v1/gdpr/requests \
  --header 'x-access-token: <api-key>'
```

```
import requests

url = "https://public-api.sessionboard.com/v1/gdpr/requests"

headers = {"x-access-token": "<api-key>"}

response = requests.get(url, headers=headers)

print(response.text)
```

```
const options = {method: 'GET', headers: {'x-access-token': '<api-key>'}};

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

	url := "https://public-api.sessionboard.com/v1/gdpr/requests"

	req, _ := http.NewRequest("GET", url, nil)

	req.Header.Add("x-access-token", "<api-key>")

	res, _ := http.DefaultClient.Do(req)

	defer res.Body.Close()
	body, _ := io.ReadAll(res.Body)

	fmt.Println(string(body))

}
```

```
HttpResponse<String> response = Unirest.get("https://public-api.sessionboard.com/v1/gdpr/requests")
  .header("x-access-token", "<api-key>")
  .asString();
```

```
require 'uri'
require 'net/http'

url = URI("https://public-api.sessionboard.com/v1/gdpr/requests")

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
  "results": [\
    {\
      "id": "<string>",\
      "org_id": "<string>",\
      "request_type": "<string>",\
      "identity_type": "<string>",\
      "identity_value": "<string>",\
      "status": "<string>",\
      "matching_user_exists": true,\
      "response": {\
        "users": [\
          123\
        ],\
        "org_users": [\
          "<string>"\
        ],\
        "event_users": [\
          123\
        ],\
        "contact_records": [\
          "<string>"\
        ]\
      },\
      "created_at": "<string>",\
      "updated_at": "<string>"\
    }\
  ]
}
```

#### Authorizations

ApiKeyBearerTokenApiKeyBearerToken

[​](https://apidocs.sessionboard.com/api-reference/gdpr/list-gdpr-requests#authorization-x-access-token)

x-access-token

string

header

required

Organization API token. Generate from Organization Settings → API Tokens.

#### Response

200

application/json

OK

[​](https://apidocs.sessionboard.com/api-reference/gdpr/list-gdpr-requests#response-results)

results

object\[\]

Showchild attributes

Ctrl+I