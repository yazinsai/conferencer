---
url: "https://apidocs.sessionboard.com/api-reference/oauth/authorization-server-metadata"
title: "Authorization server metadata - Sessionboard API"
---

> ## Documentation Index
>
> Fetch the complete documentation index at: [/llms.txt](https://apidocs.sessionboard.com/llms.txt)
>
> Use this file to discover all available pages before exploring further.

[Skip to main content](https://apidocs.sessionboard.com/api-reference/oauth/authorization-server-metadata#content-area)

Authorization server metadata

cURL

```
curl --request GET \
  --url https://public-api.sessionboard.com/oauth/.well-known/oauth-authorization-server
```

```
import requests

url = "https://public-api.sessionboard.com/oauth/.well-known/oauth-authorization-server"

response = requests.get(url)

print(response.text)
```

```
const options = {method: 'GET'};

fetch('https://public-api.sessionboard.com/oauth/.well-known/oauth-authorization-server', options)
  .then(res => res.json())
  .then(res => console.log(res))
  .catch(err => console.error(err));
```

```
<?php

$curl = curl_init();

curl_setopt_array($curl, [\
  CURLOPT_URL => "https://public-api.sessionboard.com/oauth/.well-known/oauth-authorization-server",\
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

	url := "https://public-api.sessionboard.com/oauth/.well-known/oauth-authorization-server"

	req, _ := http.NewRequest("GET", url, nil)

	res, _ := http.DefaultClient.Do(req)

	defer res.Body.Close()
	body, _ := io.ReadAll(res.Body)

	fmt.Println(string(body))

}
```

```
HttpResponse<String> response = Unirest.get("https://public-api.sessionboard.com/oauth/.well-known/oauth-authorization-server")
  .asString();
```

```
require 'uri'
require 'net/http'

url = URI("https://public-api.sessionboard.com/oauth/.well-known/oauth-authorization-server")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true

request = Net::HTTP::Get.new(url)

response = http.request(request)
puts response.read_body
```

200

```
{
  "issuer": "<string>",
  "authorization_endpoint": "<string>",
  "token_endpoint": "<string>",
  "revocation_endpoint": "<string>",
  "response_types_supported": [\
    "<string>"\
  ],
  "grant_types_supported": [\
    "<string>"\
  ],
  "scopes_supported": [\
    "<string>"\
  ],
  "code_challenge_methods_supported": [\
    "<string>"\
  ]
}
```

GET

https://public-api.sessionboard.comhttps://public-api-eu.sessionboard.com

/

oauth

/

.well-known

/

oauth-authorization-server

Try it

Authorization server metadata

cURL

```
curl --request GET \
  --url https://public-api.sessionboard.com/oauth/.well-known/oauth-authorization-server
```

```
import requests

url = "https://public-api.sessionboard.com/oauth/.well-known/oauth-authorization-server"

response = requests.get(url)

print(response.text)
```

```
const options = {method: 'GET'};

fetch('https://public-api.sessionboard.com/oauth/.well-known/oauth-authorization-server', options)
  .then(res => res.json())
  .then(res => console.log(res))
  .catch(err => console.error(err));
```

```
<?php

$curl = curl_init();

curl_setopt_array($curl, [\
  CURLOPT_URL => "https://public-api.sessionboard.com/oauth/.well-known/oauth-authorization-server",\
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

	url := "https://public-api.sessionboard.com/oauth/.well-known/oauth-authorization-server"

	req, _ := http.NewRequest("GET", url, nil)

	res, _ := http.DefaultClient.Do(req)

	defer res.Body.Close()
	body, _ := io.ReadAll(res.Body)

	fmt.Println(string(body))

}
```

```
HttpResponse<String> response = Unirest.get("https://public-api.sessionboard.com/oauth/.well-known/oauth-authorization-server")
  .asString();
```

```
require 'uri'
require 'net/http'

url = URI("https://public-api.sessionboard.com/oauth/.well-known/oauth-authorization-server")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true

request = Net::HTTP::Get.new(url)

response = http.request(request)
puts response.read_body
```

200

```
{
  "issuer": "<string>",
  "authorization_endpoint": "<string>",
  "token_endpoint": "<string>",
  "revocation_endpoint": "<string>",
  "response_types_supported": [\
    "<string>"\
  ],
  "grant_types_supported": [\
    "<string>"\
  ],
  "scopes_supported": [\
    "<string>"\
  ],
  "code_challenge_methods_supported": [\
    "<string>"\
  ]
}
```

#### Response

200 - application/json

Server metadata

[​](https://apidocs.sessionboard.com/api-reference/oauth/authorization-server-metadata#response-issuer)

issuer

string

[​](https://apidocs.sessionboard.com/api-reference/oauth/authorization-server-metadata#response-authorization-endpoint)

authorization\_endpoint

string

[​](https://apidocs.sessionboard.com/api-reference/oauth/authorization-server-metadata#response-token-endpoint)

token\_endpoint

string

[​](https://apidocs.sessionboard.com/api-reference/oauth/authorization-server-metadata#response-revocation-endpoint)

revocation\_endpoint

string

[​](https://apidocs.sessionboard.com/api-reference/oauth/authorization-server-metadata#response-response-types-supported)

response\_types\_supported

string\[\]

[​](https://apidocs.sessionboard.com/api-reference/oauth/authorization-server-metadata#response-grant-types-supported)

grant\_types\_supported

string\[\]

[​](https://apidocs.sessionboard.com/api-reference/oauth/authorization-server-metadata#response-scopes-supported)

scopes\_supported

string\[\]

[​](https://apidocs.sessionboard.com/api-reference/oauth/authorization-server-metadata#response-code-challenge-methods-supported)

code\_challenge\_methods\_supported

string\[\]

Ctrl+I