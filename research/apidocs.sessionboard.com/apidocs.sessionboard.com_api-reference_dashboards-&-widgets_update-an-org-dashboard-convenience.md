---
url: "https://apidocs.sessionboard.com/api-reference/dashboards-&-widgets/update-an-org-dashboard-convenience"
title: "Update an org dashboard (convenience) - Sessionboard API"
---

> ## Documentation Index
>
> Fetch the complete documentation index at: [/llms.txt](https://apidocs.sessionboard.com/llms.txt)
>
> Use this file to discover all available pages before exploring further.

[Skip to main content](https://apidocs.sessionboard.com/api-reference/dashboards-&-widgets/update-an-org-dashboard-convenience#content-area)

Update an org dashboard (convenience)

cURL

```
curl --request PUT \
  --url https://public-api.sessionboard.com/v1/dashboards/{id} \
  --header 'Content-Type: application/json' \
  --header 'x-access-token: <api-key>' \
  --data '
{
  "name": "<string>",
  "description": "<string>"
}
'
```

```
import requests

url = "https://public-api.sessionboard.com/v1/dashboards/{id}"

payload = {
    "name": "<string>",
    "description": "<string>"
}
headers = {
    "x-access-token": "<api-key>",
    "Content-Type": "application/json"
}

response = requests.put(url, json=payload, headers=headers)

print(response.text)
```

```
const options = {
  method: 'PUT',
  headers: {'x-access-token': '<api-key>', 'Content-Type': 'application/json'},
  body: JSON.stringify({name: '<string>', description: '<string>'})
};

fetch('https://public-api.sessionboard.com/v1/dashboards/{id}', options)
  .then(res => res.json())
  .then(res => console.log(res))
  .catch(err => console.error(err));
```

```
<?php

$curl = curl_init();

curl_setopt_array($curl, [\
  CURLOPT_URL => "https://public-api.sessionboard.com/v1/dashboards/{id}",\
  CURLOPT_RETURNTRANSFER => true,\
  CURLOPT_ENCODING => "",\
  CURLOPT_MAXREDIRS => 10,\
  CURLOPT_TIMEOUT => 30,\
  CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,\
  CURLOPT_CUSTOMREQUEST => "PUT",\
  CURLOPT_POSTFIELDS => json_encode([\
    'name' => '<string>',\
    'description' => '<string>'\
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

	url := "https://public-api.sessionboard.com/v1/dashboards/{id}"

	payload := strings.NewReader("{\n  \"name\": \"<string>\",\n  \"description\": \"<string>\"\n}")

	req, _ := http.NewRequest("PUT", url, payload)

	req.Header.Add("x-access-token", "<api-key>")
	req.Header.Add("Content-Type", "application/json")

	res, _ := http.DefaultClient.Do(req)

	defer res.Body.Close()
	body, _ := io.ReadAll(res.Body)

	fmt.Println(string(body))

}
```

```
HttpResponse<String> response = Unirest.put("https://public-api.sessionboard.com/v1/dashboards/{id}")
  .header("x-access-token", "<api-key>")
  .header("Content-Type", "application/json")
  .body("{\n  \"name\": \"<string>\",\n  \"description\": \"<string>\"\n}")
  .asString();
```

```
require 'uri'
require 'net/http'

url = URI("https://public-api.sessionboard.com/v1/dashboards/{id}")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true

request = Net::HTTP::Put.new(url)
request["x-access-token"] = '<api-key>'
request["Content-Type"] = 'application/json'
request.body = "{\n  \"name\": \"<string>\",\n  \"description\": \"<string>\"\n}"

response = http.request(request)
puts response.read_body
```

PUT

https://public-api.sessionboard.comhttps://public-api-eu.sessionboard.com

/

v1

/

dashboards

/

{id}

Try it

Update an org dashboard (convenience)

cURL

```
curl --request PUT \
  --url https://public-api.sessionboard.com/v1/dashboards/{id} \
  --header 'Content-Type: application/json' \
  --header 'x-access-token: <api-key>' \
  --data '
{
  "name": "<string>",
  "description": "<string>"
}
'
```

```
import requests

url = "https://public-api.sessionboard.com/v1/dashboards/{id}"

payload = {
    "name": "<string>",
    "description": "<string>"
}
headers = {
    "x-access-token": "<api-key>",
    "Content-Type": "application/json"
}

response = requests.put(url, json=payload, headers=headers)

print(response.text)
```

```
const options = {
  method: 'PUT',
  headers: {'x-access-token': '<api-key>', 'Content-Type': 'application/json'},
  body: JSON.stringify({name: '<string>', description: '<string>'})
};

fetch('https://public-api.sessionboard.com/v1/dashboards/{id}', options)
  .then(res => res.json())
  .then(res => console.log(res))
  .catch(err => console.error(err));
```

```
<?php

$curl = curl_init();

curl_setopt_array($curl, [\
  CURLOPT_URL => "https://public-api.sessionboard.com/v1/dashboards/{id}",\
  CURLOPT_RETURNTRANSFER => true,\
  CURLOPT_ENCODING => "",\
  CURLOPT_MAXREDIRS => 10,\
  CURLOPT_TIMEOUT => 30,\
  CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,\
  CURLOPT_CUSTOMREQUEST => "PUT",\
  CURLOPT_POSTFIELDS => json_encode([\
    'name' => '<string>',\
    'description' => '<string>'\
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

	url := "https://public-api.sessionboard.com/v1/dashboards/{id}"

	payload := strings.NewReader("{\n  \"name\": \"<string>\",\n  \"description\": \"<string>\"\n}")

	req, _ := http.NewRequest("PUT", url, payload)

	req.Header.Add("x-access-token", "<api-key>")
	req.Header.Add("Content-Type", "application/json")

	res, _ := http.DefaultClient.Do(req)

	defer res.Body.Close()
	body, _ := io.ReadAll(res.Body)

	fmt.Println(string(body))

}
```

```
HttpResponse<String> response = Unirest.put("https://public-api.sessionboard.com/v1/dashboards/{id}")
  .header("x-access-token", "<api-key>")
  .header("Content-Type", "application/json")
  .body("{\n  \"name\": \"<string>\",\n  \"description\": \"<string>\"\n}")
  .asString();
```

```
require 'uri'
require 'net/http'

url = URI("https://public-api.sessionboard.com/v1/dashboards/{id}")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true

request = Net::HTTP::Put.new(url)
request["x-access-token"] = '<api-key>'
request["Content-Type"] = 'application/json'
request.body = "{\n  \"name\": \"<string>\",\n  \"description\": \"<string>\"\n}"

response = http.request(request)
puts response.read_body
```

#### Authorizations

ApiKeyBearerTokenApiKeyBearerToken

[​](https://apidocs.sessionboard.com/api-reference/dashboards-&-widgets/update-an-org-dashboard-convenience#authorization-x-access-token)

x-access-token

string

header

required

Organization API token. Generate from Organization Settings → API Tokens.

#### Path Parameters

[​](https://apidocs.sessionboard.com/api-reference/dashboards-&-widgets/update-an-org-dashboard-convenience#parameter-id)

id

string

required

#### Body

application/json

[​](https://apidocs.sessionboard.com/api-reference/dashboards-&-widgets/update-an-org-dashboard-convenience#body-name)

name

string

[​](https://apidocs.sessionboard.com/api-reference/dashboards-&-widgets/update-an-org-dashboard-convenience#body-description)

description

string

#### Response

200

Dashboard updated

Ctrl+I