---
url: "https://apidocs.sessionboard.com/api-reference/dashboards-&-widgets/create-an-org-dashboard-convenience"
title: "Create an org dashboard (convenience) - Sessionboard API"
---

> ## Documentation Index
>
> Fetch the complete documentation index at: [/llms.txt](https://apidocs.sessionboard.com/llms.txt)
>
> Use this file to discover all available pages before exploring further.

[Skip to main content](https://apidocs.sessionboard.com/api-reference/dashboards-&-widgets/create-an-org-dashboard-convenience#content-area)

Create an org dashboard (convenience)

cURL

```
curl --request POST \
  --url https://public-api.sessionboard.com/v1/dashboards/create \
  --header 'Content-Type: application/json' \
  --header 'x-access-token: <api-key>' \
  --data '
{
  "name": "<string>",
  "description": "<string>",
  "widgets": [\
    {}\
  ]
}
'
```

```
import requests

url = "https://public-api.sessionboard.com/v1/dashboards/create"

payload = {
    "name": "<string>",
    "description": "<string>",
    "widgets": [{}]
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
  body: JSON.stringify({name: '<string>', description: '<string>', widgets: [{}]})
};

fetch('https://public-api.sessionboard.com/v1/dashboards/create', options)
  .then(res => res.json())
  .then(res => console.log(res))
  .catch(err => console.error(err));
```

```
<?php

$curl = curl_init();

curl_setopt_array($curl, [\
  CURLOPT_URL => "https://public-api.sessionboard.com/v1/dashboards/create",\
  CURLOPT_RETURNTRANSFER => true,\
  CURLOPT_ENCODING => "",\
  CURLOPT_MAXREDIRS => 10,\
  CURLOPT_TIMEOUT => 30,\
  CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,\
  CURLOPT_CUSTOMREQUEST => "POST",\
  CURLOPT_POSTFIELDS => json_encode([\
    'name' => '<string>',\
    'description' => '<string>',\
    'widgets' => [\
        [\
\
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

	url := "https://public-api.sessionboard.com/v1/dashboards/create"

	payload := strings.NewReader("{\n  \"name\": \"<string>\",\n  \"description\": \"<string>\",\n  \"widgets\": [\n    {}\n  ]\n}")

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
HttpResponse<String> response = Unirest.post("https://public-api.sessionboard.com/v1/dashboards/create")
  .header("x-access-token", "<api-key>")
  .header("Content-Type", "application/json")
  .body("{\n  \"name\": \"<string>\",\n  \"description\": \"<string>\",\n  \"widgets\": [\n    {}\n  ]\n}")
  .asString();
```

```
require 'uri'
require 'net/http'

url = URI("https://public-api.sessionboard.com/v1/dashboards/create")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true

request = Net::HTTP::Post.new(url)
request["x-access-token"] = '<api-key>'
request["Content-Type"] = 'application/json'
request.body = "{\n  \"name\": \"<string>\",\n  \"description\": \"<string>\",\n  \"widgets\": [\n    {}\n  ]\n}"

response = http.request(request)
puts response.read_body
```

POST

https://public-api.sessionboard.comhttps://public-api-eu.sessionboard.com

/

v1

/

dashboards

/

create

Try it

Create an org dashboard (convenience)

cURL

```
curl --request POST \
  --url https://public-api.sessionboard.com/v1/dashboards/create \
  --header 'Content-Type: application/json' \
  --header 'x-access-token: <api-key>' \
  --data '
{
  "name": "<string>",
  "description": "<string>",
  "widgets": [\
    {}\
  ]
}
'
```

```
import requests

url = "https://public-api.sessionboard.com/v1/dashboards/create"

payload = {
    "name": "<string>",
    "description": "<string>",
    "widgets": [{}]
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
  body: JSON.stringify({name: '<string>', description: '<string>', widgets: [{}]})
};

fetch('https://public-api.sessionboard.com/v1/dashboards/create', options)
  .then(res => res.json())
  .then(res => console.log(res))
  .catch(err => console.error(err));
```

```
<?php

$curl = curl_init();

curl_setopt_array($curl, [\
  CURLOPT_URL => "https://public-api.sessionboard.com/v1/dashboards/create",\
  CURLOPT_RETURNTRANSFER => true,\
  CURLOPT_ENCODING => "",\
  CURLOPT_MAXREDIRS => 10,\
  CURLOPT_TIMEOUT => 30,\
  CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,\
  CURLOPT_CUSTOMREQUEST => "POST",\
  CURLOPT_POSTFIELDS => json_encode([\
    'name' => '<string>',\
    'description' => '<string>',\
    'widgets' => [\
        [\
\
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

	url := "https://public-api.sessionboard.com/v1/dashboards/create"

	payload := strings.NewReader("{\n  \"name\": \"<string>\",\n  \"description\": \"<string>\",\n  \"widgets\": [\n    {}\n  ]\n}")

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
HttpResponse<String> response = Unirest.post("https://public-api.sessionboard.com/v1/dashboards/create")
  .header("x-access-token", "<api-key>")
  .header("Content-Type", "application/json")
  .body("{\n  \"name\": \"<string>\",\n  \"description\": \"<string>\",\n  \"widgets\": [\n    {}\n  ]\n}")
  .asString();
```

```
require 'uri'
require 'net/http'

url = URI("https://public-api.sessionboard.com/v1/dashboards/create")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true

request = Net::HTTP::Post.new(url)
request["x-access-token"] = '<api-key>'
request["Content-Type"] = 'application/json'
request.body = "{\n  \"name\": \"<string>\",\n  \"description\": \"<string>\",\n  \"widgets\": [\n    {}\n  ]\n}"

response = http.request(request)
puts response.read_body
```

#### Authorizations

ApiKeyBearerTokenApiKeyBearerToken

[​](https://apidocs.sessionboard.com/api-reference/dashboards-&-widgets/create-an-org-dashboard-convenience#authorization-x-access-token)

x-access-token

string

header

required

Organization API token. Generate from Organization Settings → API Tokens.

#### Body

application/json

[​](https://apidocs.sessionboard.com/api-reference/dashboards-&-widgets/create-an-org-dashboard-convenience#body-name)

name

string

required

[​](https://apidocs.sessionboard.com/api-reference/dashboards-&-widgets/create-an-org-dashboard-convenience#body-description)

description

string

[​](https://apidocs.sessionboard.com/api-reference/dashboards-&-widgets/create-an-org-dashboard-convenience#body-widgets)

widgets

object\[\]

Optional inline widget definitions.

#### Response

200

Dashboard created

Ctrl+I