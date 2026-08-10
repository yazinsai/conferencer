---
url: "https://apidocs.sessionboard.com/api-reference/oauth/revoke-a-token"
title: "Revoke a token - Sessionboard API"
---

> ## Documentation Index
>
> Fetch the complete documentation index at: [/llms.txt](https://apidocs.sessionboard.com/llms.txt)
>
> Use this file to discover all available pages before exploring further.

[Skip to main content](https://apidocs.sessionboard.com/api-reference/oauth/revoke-a-token#content-area)

Revoke a token

cURL

```
curl --request POST \
  --url https://public-api.sessionboard.com/oauth/revoke \
  --header 'Content-Type: application/json' \
  --data '
{
  "token": "<string>"
}
'
```

```
import requests

url = "https://public-api.sessionboard.com/oauth/revoke"

payload = { "token": "<string>" }
headers = {"Content-Type": "application/json"}

response = requests.post(url, json=payload, headers=headers)

print(response.text)
```

```
const options = {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({token: '<string>'})
};

fetch('https://public-api.sessionboard.com/oauth/revoke', options)
  .then(res => res.json())
  .then(res => console.log(res))
  .catch(err => console.error(err));
```

```
<?php

$curl = curl_init();

curl_setopt_array($curl, [\
  CURLOPT_URL => "https://public-api.sessionboard.com/oauth/revoke",\
  CURLOPT_RETURNTRANSFER => true,\
  CURLOPT_ENCODING => "",\
  CURLOPT_MAXREDIRS => 10,\
  CURLOPT_TIMEOUT => 30,\
  CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,\
  CURLOPT_CUSTOMREQUEST => "POST",\
  CURLOPT_POSTFIELDS => json_encode([\
    'token' => '<string>'\
  ]),\
  CURLOPT_HTTPHEADER => [\
    "Content-Type: application/json"\
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

	url := "https://public-api.sessionboard.com/oauth/revoke"

	payload := strings.NewReader("{\n  \"token\": \"<string>\"\n}")

	req, _ := http.NewRequest("POST", url, payload)

	req.Header.Add("Content-Type", "application/json")

	res, _ := http.DefaultClient.Do(req)

	defer res.Body.Close()
	body, _ := io.ReadAll(res.Body)

	fmt.Println(string(body))

}
```

```
HttpResponse<String> response = Unirest.post("https://public-api.sessionboard.com/oauth/revoke")
  .header("Content-Type", "application/json")
  .body("{\n  \"token\": \"<string>\"\n}")
  .asString();
```

```
require 'uri'
require 'net/http'

url = URI("https://public-api.sessionboard.com/oauth/revoke")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true

request = Net::HTTP::Post.new(url)
request["Content-Type"] = 'application/json'
request.body = "{\n  \"token\": \"<string>\"\n}"

response = http.request(request)
puts response.read_body
```

POST

https://public-api.sessionboard.comhttps://public-api-eu.sessionboard.com

/

oauth

/

revoke

Try it

Revoke a token

cURL

```
curl --request POST \
  --url https://public-api.sessionboard.com/oauth/revoke \
  --header 'Content-Type: application/json' \
  --data '
{
  "token": "<string>"
}
'
```

```
import requests

url = "https://public-api.sessionboard.com/oauth/revoke"

payload = { "token": "<string>" }
headers = {"Content-Type": "application/json"}

response = requests.post(url, json=payload, headers=headers)

print(response.text)
```

```
const options = {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({token: '<string>'})
};

fetch('https://public-api.sessionboard.com/oauth/revoke', options)
  .then(res => res.json())
  .then(res => console.log(res))
  .catch(err => console.error(err));
```

```
<?php

$curl = curl_init();

curl_setopt_array($curl, [\
  CURLOPT_URL => "https://public-api.sessionboard.com/oauth/revoke",\
  CURLOPT_RETURNTRANSFER => true,\
  CURLOPT_ENCODING => "",\
  CURLOPT_MAXREDIRS => 10,\
  CURLOPT_TIMEOUT => 30,\
  CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,\
  CURLOPT_CUSTOMREQUEST => "POST",\
  CURLOPT_POSTFIELDS => json_encode([\
    'token' => '<string>'\
  ]),\
  CURLOPT_HTTPHEADER => [\
    "Content-Type: application/json"\
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

	url := "https://public-api.sessionboard.com/oauth/revoke"

	payload := strings.NewReader("{\n  \"token\": \"<string>\"\n}")

	req, _ := http.NewRequest("POST", url, payload)

	req.Header.Add("Content-Type", "application/json")

	res, _ := http.DefaultClient.Do(req)

	defer res.Body.Close()
	body, _ := io.ReadAll(res.Body)

	fmt.Println(string(body))

}
```

```
HttpResponse<String> response = Unirest.post("https://public-api.sessionboard.com/oauth/revoke")
  .header("Content-Type", "application/json")
  .body("{\n  \"token\": \"<string>\"\n}")
  .asString();
```

```
require 'uri'
require 'net/http'

url = URI("https://public-api.sessionboard.com/oauth/revoke")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true

request = Net::HTTP::Post.new(url)
request["Content-Type"] = 'application/json'
request.body = "{\n  \"token\": \"<string>\"\n}"

response = http.request(request)
puts response.read_body
```

#### Body

application/json

[​](https://apidocs.sessionboard.com/api-reference/oauth/revoke-a-token#body-token)

token

string

required

[​](https://apidocs.sessionboard.com/api-reference/oauth/revoke-a-token#body-token-type-hint)

token\_type\_hint

enum<string>

Available options:

`access_token`,

`refresh_token`

#### Response

200

Token revoked (or was already invalid)

⌘I