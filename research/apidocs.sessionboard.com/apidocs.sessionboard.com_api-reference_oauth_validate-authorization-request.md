---
url: "https://apidocs.sessionboard.com/api-reference/oauth/validate-authorization-request"
title: "Validate authorization request - Sessionboard API"
---

> ## Documentation Index
>
> Fetch the complete documentation index at: [/llms.txt](https://apidocs.sessionboard.com/llms.txt)
>
> Use this file to discover all available pages before exploring further.

[Skip to main content](https://apidocs.sessionboard.com/api-reference/oauth/validate-authorization-request#content-area)

Validate authorization request

cURL

```
curl --request GET \
  --url https://public-api.sessionboard.com/oauth/authorize
```

```
import requests

url = "https://public-api.sessionboard.com/oauth/authorize"

response = requests.get(url)

print(response.text)
```

```
const options = {method: 'GET'};

fetch('https://public-api.sessionboard.com/oauth/authorize', options)
  .then(res => res.json())
  .then(res => console.log(res))
  .catch(err => console.error(err));
```

```
<?php

$curl = curl_init();

curl_setopt_array($curl, [\
  CURLOPT_URL => "https://public-api.sessionboard.com/oauth/authorize",\
  CURLOPT_RETURNTRANSFER => true,\
  CURLOPT_ENCODING => "",\
  CURLOPT_MAXREDIRS => 10,\
  CURLOPT_TIMEOUT => 30,\
  CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,\
  CURLOPT_CUSTOMREQUEST => "GET",\
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

	url := "https://public-api.sessionboard.com/oauth/authorize"

	req, _ := http.NewRequest("GET", url, nil)

	res, _ := http.DefaultClient.Do(req)

	defer res.Body.Close()
	body, _ := io.ReadAll(res.Body)

	fmt.Println(string(body))

}
```

```
HttpResponse<String> response = Unirest.get("https://public-api.sessionboard.com/oauth/authorize")
  .asString();
```

```
require 'uri'
require 'net/http'

url = URI("https://public-api.sessionboard.com/oauth/authorize")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true

request = Net::HTTP::Get.new(url)

response = http.request(request)
puts response.read_body
```

200

```
{
  "authorization_request": {
    "client_id": "<string>",
    "client_name": "<string>",
    "redirect_uri": "<string>",
    "scopes": [\
      "<string>"\
    ]
  }
}
```

GET

https://public-api.sessionboard.comhttps://public-api-eu.sessionboard.com

/

oauth

/

authorize

Try it

Validate authorization request

cURL

```
curl --request GET \
  --url https://public-api.sessionboard.com/oauth/authorize
```

```
import requests

url = "https://public-api.sessionboard.com/oauth/authorize"

response = requests.get(url)

print(response.text)
```

```
const options = {method: 'GET'};

fetch('https://public-api.sessionboard.com/oauth/authorize', options)
  .then(res => res.json())
  .then(res => console.log(res))
  .catch(err => console.error(err));
```

```
<?php

$curl = curl_init();

curl_setopt_array($curl, [\
  CURLOPT_URL => "https://public-api.sessionboard.com/oauth/authorize",\
  CURLOPT_RETURNTRANSFER => true,\
  CURLOPT_ENCODING => "",\
  CURLOPT_MAXREDIRS => 10,\
  CURLOPT_TIMEOUT => 30,\
  CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,\
  CURLOPT_CUSTOMREQUEST => "GET",\
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

	url := "https://public-api.sessionboard.com/oauth/authorize"

	req, _ := http.NewRequest("GET", url, nil)

	res, _ := http.DefaultClient.Do(req)

	defer res.Body.Close()
	body, _ := io.ReadAll(res.Body)

	fmt.Println(string(body))

}
```

```
HttpResponse<String> response = Unirest.get("https://public-api.sessionboard.com/oauth/authorize")
  .asString();
```

```
require 'uri'
require 'net/http'

url = URI("https://public-api.sessionboard.com/oauth/authorize")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true

request = Net::HTTP::Get.new(url)

response = http.request(request)
puts response.read_body
```

200

```
{
  "authorization_request": {
    "client_id": "<string>",
    "client_name": "<string>",
    "redirect_uri": "<string>",
    "scopes": [\
      "<string>"\
    ]
  }
}
```

#### Query Parameters

[​](https://apidocs.sessionboard.com/api-reference/oauth/validate-authorization-request#parameter-client-id)

client\_id

string

required

[​](https://apidocs.sessionboard.com/api-reference/oauth/validate-authorization-request#parameter-redirect-uri)

redirect\_uri

string

required

[​](https://apidocs.sessionboard.com/api-reference/oauth/validate-authorization-request#parameter-response-type)

response\_type

enum<string>

required

Available options:

`code`

[​](https://apidocs.sessionboard.com/api-reference/oauth/validate-authorization-request#parameter-code-challenge)

code\_challenge

string

required

[​](https://apidocs.sessionboard.com/api-reference/oauth/validate-authorization-request#parameter-code-challenge-method)

code\_challenge\_method

enum<string>

required

Available options:

`S256`

[​](https://apidocs.sessionboard.com/api-reference/oauth/validate-authorization-request#parameter-scope)

scope

string

Space-separated scopes

[​](https://apidocs.sessionboard.com/api-reference/oauth/validate-authorization-request#parameter-state)

state

string

#### Response

200

application/json

Authorization request validated

[​](https://apidocs.sessionboard.com/api-reference/oauth/validate-authorization-request#response-authorization-request)

authorization\_request

object

Showchild attributes

Ctrl+I