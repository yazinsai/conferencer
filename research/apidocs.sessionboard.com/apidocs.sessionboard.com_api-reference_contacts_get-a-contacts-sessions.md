---
url: "https://apidocs.sessionboard.com/api-reference/contacts/get-a-contacts-sessions"
title: "Get a contact's sessions - Sessionboard API"
---

> ## Documentation Index
>
> Fetch the complete documentation index at: [/llms.txt](https://apidocs.sessionboard.com/llms.txt)
>
> Use this file to discover all available pages before exploring further.

[Skip to main content](https://apidocs.sessionboard.com/api-reference/contacts/get-a-contacts-sessions#content-area)

Get a contact's sessions

cURL

```
curl --request GET \
  --url https://public-api.sessionboard.com/v1/event/{eventId}/contacts/{contactId}/sessions \
  --header 'x-access-token: <api-key>'
```

```
import requests

url = "https://public-api.sessionboard.com/v1/event/{eventId}/contacts/{contactId}/sessions"

headers = {"x-access-token": "<api-key>"}

response = requests.get(url, headers=headers)

print(response.text)
```

```
const options = {method: 'GET', headers: {'x-access-token': '<api-key>'}};

fetch('https://public-api.sessionboard.com/v1/event/{eventId}/contacts/{contactId}/sessions', options)
  .then(res => res.json())
  .then(res => console.log(res))
  .catch(err => console.error(err));
```

```
<?php

$curl = curl_init();

curl_setopt_array($curl, [\
  CURLOPT_URL => "https://public-api.sessionboard.com/v1/event/{eventId}/contacts/{contactId}/sessions",\
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

	url := "https://public-api.sessionboard.com/v1/event/{eventId}/contacts/{contactId}/sessions"

	req, _ := http.NewRequest("GET", url, nil)

	req.Header.Add("x-access-token", "<api-key>")

	res, _ := http.DefaultClient.Do(req)

	defer res.Body.Close()
	body, _ := io.ReadAll(res.Body)

	fmt.Println(string(body))

}
```

```
HttpResponse<String> response = Unirest.get("https://public-api.sessionboard.com/v1/event/{eventId}/contacts/{contactId}/sessions")
  .header("x-access-token", "<api-key>")
  .asString();
```

```
require 'uri'
require 'net/http'

url = URI("https://public-api.sessionboard.com/v1/event/{eventId}/contacts/{contactId}/sessions")

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
  "sessions": [\
    {\
      "id": "3c90c3cc-0d44-4b50-8888-8dd25736052a",\
      "title": "<string>",\
      "status": "<string>",\
      "custom_status": "<string>",\
      "is_abstract": true,\
      "composition_status": {\
        "is_linked": true,\
        "is_read_only": true,\
        "source_count": 123,\
        "target": {\
          "id": "3c90c3cc-0d44-4b50-8888-8dd25736052a",\
          "friendly_id": "<string>",\
          "title": "<string>",\
          "is_abstract": true\
        }\
      }\
    }\
  ],
  "status": "<string>"
}
```

GET

https://public-api.sessionboard.comhttps://public-api-eu.sessionboard.com

/

v1

/

event

/

{eventId}

/

contacts

/

{contactId}

/

sessions

Try it

Get a contact's sessions

cURL

```
curl --request GET \
  --url https://public-api.sessionboard.com/v1/event/{eventId}/contacts/{contactId}/sessions \
  --header 'x-access-token: <api-key>'
```

```
import requests

url = "https://public-api.sessionboard.com/v1/event/{eventId}/contacts/{contactId}/sessions"

headers = {"x-access-token": "<api-key>"}

response = requests.get(url, headers=headers)

print(response.text)
```

```
const options = {method: 'GET', headers: {'x-access-token': '<api-key>'}};

fetch('https://public-api.sessionboard.com/v1/event/{eventId}/contacts/{contactId}/sessions', options)
  .then(res => res.json())
  .then(res => console.log(res))
  .catch(err => console.error(err));
```

```
<?php

$curl = curl_init();

curl_setopt_array($curl, [\
  CURLOPT_URL => "https://public-api.sessionboard.com/v1/event/{eventId}/contacts/{contactId}/sessions",\
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

	url := "https://public-api.sessionboard.com/v1/event/{eventId}/contacts/{contactId}/sessions"

	req, _ := http.NewRequest("GET", url, nil)

	req.Header.Add("x-access-token", "<api-key>")

	res, _ := http.DefaultClient.Do(req)

	defer res.Body.Close()
	body, _ := io.ReadAll(res.Body)

	fmt.Println(string(body))

}
```

```
HttpResponse<String> response = Unirest.get("https://public-api.sessionboard.com/v1/event/{eventId}/contacts/{contactId}/sessions")
  .header("x-access-token", "<api-key>")
  .asString();
```

```
require 'uri'
require 'net/http'

url = URI("https://public-api.sessionboard.com/v1/event/{eventId}/contacts/{contactId}/sessions")

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
  "sessions": [\
    {\
      "id": "3c90c3cc-0d44-4b50-8888-8dd25736052a",\
      "title": "<string>",\
      "status": "<string>",\
      "custom_status": "<string>",\
      "is_abstract": true,\
      "composition_status": {\
        "is_linked": true,\
        "is_read_only": true,\
        "source_count": 123,\
        "target": {\
          "id": "3c90c3cc-0d44-4b50-8888-8dd25736052a",\
          "friendly_id": "<string>",\
          "title": "<string>",\
          "is_abstract": true\
        }\
      }\
    }\
  ],
  "status": "<string>"
}
```

#### Authorizations

ApiKeyBearerTokenApiKeyBearerToken

[​](https://apidocs.sessionboard.com/api-reference/contacts/get-a-contacts-sessions#authorization-x-access-token)

x-access-token

string

header

required

Organization API token. Generate from Organization Settings → API Tokens.

#### Path Parameters

[​](https://apidocs.sessionboard.com/api-reference/contacts/get-a-contacts-sessions#parameter-event-id)

eventId

integer

required

[​](https://apidocs.sessionboard.com/api-reference/contacts/get-a-contacts-sessions#parameter-contact-id)

contactId

string

required

#### Response

200

application/json

OK

[​](https://apidocs.sessionboard.com/api-reference/contacts/get-a-contacts-sessions#response-sessions)

sessions

object\[\]

Showchild attributes

[​](https://apidocs.sessionboard.com/api-reference/contacts/get-a-contacts-sessions#response-status)

status

string

Aggregated contact status derived from linked sessions
(`accepted`, `pending`, or a single session's status).

Ctrl+I