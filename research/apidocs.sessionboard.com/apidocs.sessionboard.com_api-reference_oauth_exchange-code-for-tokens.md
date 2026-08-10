---
url: "https://apidocs.sessionboard.com/api-reference/oauth/exchange-code-for-tokens"
title: "Exchange code for tokens - Sessionboard API"
---

> ## Documentation Index
>
> Fetch the complete documentation index at: [/llms.txt](https://apidocs.sessionboard.com/llms.txt)
>
> Use this file to discover all available pages before exploring further.

[Skip to main content](https://apidocs.sessionboard.com/api-reference/oauth/exchange-code-for-tokens#content-area)

Exchange code for tokens

cURL

```
curl --request POST \
  --url https://public-api.sessionboard.com/oauth/token \
  --header 'Content-Type: application/json' \
  --data '
{
  "grant_type": "authorization_code",
  "code": "<string>",
  "redirect_uri": "<string>",
  "client_id": "<string>",
  "code_verifier": "<string>"
}
'
```

```
import requests

url = "https://public-api.sessionboard.com/oauth/token"

payload = {
    "grant_type": "authorization_code",
    "code": "<string>",
    "redirect_uri": "<string>",
    "client_id": "<string>",
    "code_verifier": "<string>"
}
headers = {"Content-Type": "application/json"}

response = requests.post(url, json=payload, headers=headers)

print(response.text)
```

```
const options = {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    grant_type: 'authorization_code',
    code: '<string>',
    redirect_uri: '<string>',
    client_id: '<string>',
    code_verifier: '<string>'
  })
};

fetch('https://public-api.sessionboard.com/oauth/token', options)
  .then(res => res.json())
  .then(res => console.log(res))
  .catch(err => console.error(err));
```

```
<?php

$curl = curl_init();

curl_setopt_array($curl, [\
  CURLOPT_URL => "https://public-api.sessionboard.com/oauth/token",\
  CURLOPT_RETURNTRANSFER => true,\
  CURLOPT_ENCODING => "",\
  CURLOPT_MAXREDIRS => 10,\
  CURLOPT_TIMEOUT => 30,\
  CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,\
  CURLOPT_CUSTOMREQUEST => "POST",\
  CURLOPT_POSTFIELDS => json_encode([\
    'grant_type' => 'authorization_code',\
    'code' => '<string>',\
    'redirect_uri' => '<string>',\
    'client_id' => '<string>',\
    'code_verifier' => '<string>'\
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

	url := "https://public-api.sessionboard.com/oauth/token"

	payload := strings.NewReader("{\n  \"grant_type\": \"authorization_code\",\n  \"code\": \"<string>\",\n  \"redirect_uri\": \"<string>\",\n  \"client_id\": \"<string>\",\n  \"code_verifier\": \"<string>\"\n}")

	req, _ := http.NewRequest("POST", url, payload)

	req.Header.Add("Content-Type", "application/json")

	res, _ := http.DefaultClient.Do(req)

	defer res.Body.Close()
	body, _ := io.ReadAll(res.Body)

	fmt.Println(string(body))

}
```

```
HttpResponse<String> response = Unirest.post("https://public-api.sessionboard.com/oauth/token")
  .header("Content-Type", "application/json")
  .body("{\n  \"grant_type\": \"authorization_code\",\n  \"code\": \"<string>\",\n  \"redirect_uri\": \"<string>\",\n  \"client_id\": \"<string>\",\n  \"code_verifier\": \"<string>\"\n}")
  .asString();
```

```
require 'uri'
require 'net/http'

url = URI("https://public-api.sessionboard.com/oauth/token")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true

request = Net::HTTP::Post.new(url)
request["Content-Type"] = 'application/json'
request.body = "{\n  \"grant_type\": \"authorization_code\",\n  \"code\": \"<string>\",\n  \"redirect_uri\": \"<string>\",\n  \"client_id\": \"<string>\",\n  \"code_verifier\": \"<string>\"\n}"

response = http.request(request)
puts response.read_body
```

200

```
{
  "access_token": "<string>",
  "token_type": "Bearer",
  "expires_in": 3600,
  "refresh_token": "<string>",
  "scope": "<string>"
}
```

POST

https://public-api.sessionboard.comhttps://public-api-eu.sessionboard.com

/

oauth

/

token

Try it

Exchange code for tokens

cURL

```
curl --request POST \
  --url https://public-api.sessionboard.com/oauth/token \
  --header 'Content-Type: application/json' \
  --data '
{
  "grant_type": "authorization_code",
  "code": "<string>",
  "redirect_uri": "<string>",
  "client_id": "<string>",
  "code_verifier": "<string>"
}
'
```

```
import requests

url = "https://public-api.sessionboard.com/oauth/token"

payload = {
    "grant_type": "authorization_code",
    "code": "<string>",
    "redirect_uri": "<string>",
    "client_id": "<string>",
    "code_verifier": "<string>"
}
headers = {"Content-Type": "application/json"}

response = requests.post(url, json=payload, headers=headers)

print(response.text)
```

```
const options = {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    grant_type: 'authorization_code',
    code: '<string>',
    redirect_uri: '<string>',
    client_id: '<string>',
    code_verifier: '<string>'
  })
};

fetch('https://public-api.sessionboard.com/oauth/token', options)
  .then(res => res.json())
  .then(res => console.log(res))
  .catch(err => console.error(err));
```

```
<?php

$curl = curl_init();

curl_setopt_array($curl, [\
  CURLOPT_URL => "https://public-api.sessionboard.com/oauth/token",\
  CURLOPT_RETURNTRANSFER => true,\
  CURLOPT_ENCODING => "",\
  CURLOPT_MAXREDIRS => 10,\
  CURLOPT_TIMEOUT => 30,\
  CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,\
  CURLOPT_CUSTOMREQUEST => "POST",\
  CURLOPT_POSTFIELDS => json_encode([\
    'grant_type' => 'authorization_code',\
    'code' => '<string>',\
    'redirect_uri' => '<string>',\
    'client_id' => '<string>',\
    'code_verifier' => '<string>'\
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

	url := "https://public-api.sessionboard.com/oauth/token"

	payload := strings.NewReader("{\n  \"grant_type\": \"authorization_code\",\n  \"code\": \"<string>\",\n  \"redirect_uri\": \"<string>\",\n  \"client_id\": \"<string>\",\n  \"code_verifier\": \"<string>\"\n}")

	req, _ := http.NewRequest("POST", url, payload)

	req.Header.Add("Content-Type", "application/json")

	res, _ := http.DefaultClient.Do(req)

	defer res.Body.Close()
	body, _ := io.ReadAll(res.Body)

	fmt.Println(string(body))

}
```

```
HttpResponse<String> response = Unirest.post("https://public-api.sessionboard.com/oauth/token")
  .header("Content-Type", "application/json")
  .body("{\n  \"grant_type\": \"authorization_code\",\n  \"code\": \"<string>\",\n  \"redirect_uri\": \"<string>\",\n  \"client_id\": \"<string>\",\n  \"code_verifier\": \"<string>\"\n}")
  .asString();
```

```
require 'uri'
require 'net/http'

url = URI("https://public-api.sessionboard.com/oauth/token")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true

request = Net::HTTP::Post.new(url)
request["Content-Type"] = 'application/json'
request.body = "{\n  \"grant_type\": \"authorization_code\",\n  \"code\": \"<string>\",\n  \"redirect_uri\": \"<string>\",\n  \"client_id\": \"<string>\",\n  \"code_verifier\": \"<string>\"\n}"

response = http.request(request)
puts response.read_body
```

200

```
{
  "access_token": "<string>",
  "token_type": "Bearer",
  "expires_in": 3600,
  "refresh_token": "<string>",
  "scope": "<string>"
}
```

#### Body

application/json

- Authorization Code Exchange

- Refresh Token


[​](https://apidocs.sessionboard.com/api-reference/oauth/exchange-code-for-tokens#body-one-of-0-grant-type)

grant\_type

enum<string>

required

Available options:

`authorization_code`

[​](https://apidocs.sessionboard.com/api-reference/oauth/exchange-code-for-tokens#body-one-of-0-code)

code

string

required

[​](https://apidocs.sessionboard.com/api-reference/oauth/exchange-code-for-tokens#body-one-of-0-redirect-uri)

redirect\_uri

string

required

[​](https://apidocs.sessionboard.com/api-reference/oauth/exchange-code-for-tokens#body-one-of-0-client-id)

client\_id

string

required

[​](https://apidocs.sessionboard.com/api-reference/oauth/exchange-code-for-tokens#body-one-of-0-code-verifier)

code\_verifier

string

required

PKCE code verifier

#### Response

200

application/json

Tokens issued

[​](https://apidocs.sessionboard.com/api-reference/oauth/exchange-code-for-tokens#response-access-token)

access\_token

string

[​](https://apidocs.sessionboard.com/api-reference/oauth/exchange-code-for-tokens#response-token-type)

token\_type

string

Example:

`"Bearer"`

[​](https://apidocs.sessionboard.com/api-reference/oauth/exchange-code-for-tokens#response-expires-in)

expires\_in

integer

Example:

`3600`

[​](https://apidocs.sessionboard.com/api-reference/oauth/exchange-code-for-tokens#response-refresh-token)

refresh\_token

string

[​](https://apidocs.sessionboard.com/api-reference/oauth/exchange-code-for-tokens#response-scope)

scope

string

⌘I