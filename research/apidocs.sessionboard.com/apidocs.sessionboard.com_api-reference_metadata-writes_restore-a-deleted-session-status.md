---
url: "https://apidocs.sessionboard.com/api-reference/metadata-writes/restore-a-deleted-session-status"
title: "Restore a deleted session status - Sessionboard API"
---

> ## Documentation Index
>
> Fetch the complete documentation index at: [/llms.txt](https://apidocs.sessionboard.com/llms.txt)
>
> Use this file to discover all available pages before exploring further.

[Skip to main content](https://apidocs.sessionboard.com/api-reference/metadata-writes/restore-a-deleted-session-status#content-area)

Restore a deleted session status

cURL

```
curl --request POST \
  --url https://public-api.sessionboard.com/v1/event/{eventId}/statuses/{id}/restore \
  --header 'x-access-token: <api-key>'
```

```
import requests

url = "https://public-api.sessionboard.com/v1/event/{eventId}/statuses/{id}/restore"

headers = {"x-access-token": "<api-key>"}

response = requests.post(url, headers=headers)

print(response.text)
```

```
const options = {method: 'POST', headers: {'x-access-token': '<api-key>'}};

fetch('https://public-api.sessionboard.com/v1/event/{eventId}/statuses/{id}/restore', options)
  .then(res => res.json())
  .then(res => console.log(res))
  .catch(err => console.error(err));
```

```
<?php

$curl = curl_init();

curl_setopt_array($curl, [\
  CURLOPT_URL => "https://public-api.sessionboard.com/v1/event/{eventId}/statuses/{id}/restore",\
  CURLOPT_RETURNTRANSFER => true,\
  CURLOPT_ENCODING => "",\
  CURLOPT_MAXREDIRS => 10,\
  CURLOPT_TIMEOUT => 30,\
  CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,\
  CURLOPT_CUSTOMREQUEST => "POST",\
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

	url := "https://public-api.sessionboard.com/v1/event/{eventId}/statuses/{id}/restore"

	req, _ := http.NewRequest("POST", url, nil)

	req.Header.Add("x-access-token", "<api-key>")

	res, _ := http.DefaultClient.Do(req)

	defer res.Body.Close()
	body, _ := io.ReadAll(res.Body)

	fmt.Println(string(body))

}
```

```
HttpResponse<String> response = Unirest.post("https://public-api.sessionboard.com/v1/event/{eventId}/statuses/{id}/restore")
  .header("x-access-token", "<api-key>")
  .asString();
```

```
require 'uri'
require 'net/http'

url = URI("https://public-api.sessionboard.com/v1/event/{eventId}/statuses/{id}/restore")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true

request = Net::HTTP::Post.new(url)
request["x-access-token"] = '<api-key>'

response = http.request(request)
puts response.read_body
```

200

```
{
  "id": "<string>",
  "name": "<string>",
  "status": "<string>",
  "status_name": "<string>",
  "color": "<string>",
  "order": 123,
  "is_custom": true,
  "created_at": "<string>",
  "created_by_user_id": 123,
  "created_by_user_name": "<string>"
}
```

POST

https://public-api.sessionboard.comhttps://public-api-eu.sessionboard.com

/

v1

/

event

/

{eventId}

/

statuses

/

{id}

/

restore

Try it

Restore a deleted session status

cURL

```
curl --request POST \
  --url https://public-api.sessionboard.com/v1/event/{eventId}/statuses/{id}/restore \
  --header 'x-access-token: <api-key>'
```

```
import requests

url = "https://public-api.sessionboard.com/v1/event/{eventId}/statuses/{id}/restore"

headers = {"x-access-token": "<api-key>"}

response = requests.post(url, headers=headers)

print(response.text)
```

```
const options = {method: 'POST', headers: {'x-access-token': '<api-key>'}};

fetch('https://public-api.sessionboard.com/v1/event/{eventId}/statuses/{id}/restore', options)
  .then(res => res.json())
  .then(res => console.log(res))
  .catch(err => console.error(err));
```

```
<?php

$curl = curl_init();

curl_setopt_array($curl, [\
  CURLOPT_URL => "https://public-api.sessionboard.com/v1/event/{eventId}/statuses/{id}/restore",\
  CURLOPT_RETURNTRANSFER => true,\
  CURLOPT_ENCODING => "",\
  CURLOPT_MAXREDIRS => 10,\
  CURLOPT_TIMEOUT => 30,\
  CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,\
  CURLOPT_CUSTOMREQUEST => "POST",\
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

	url := "https://public-api.sessionboard.com/v1/event/{eventId}/statuses/{id}/restore"

	req, _ := http.NewRequest("POST", url, nil)

	req.Header.Add("x-access-token", "<api-key>")

	res, _ := http.DefaultClient.Do(req)

	defer res.Body.Close()
	body, _ := io.ReadAll(res.Body)

	fmt.Println(string(body))

}
```

```
HttpResponse<String> response = Unirest.post("https://public-api.sessionboard.com/v1/event/{eventId}/statuses/{id}/restore")
  .header("x-access-token", "<api-key>")
  .asString();
```

```
require 'uri'
require 'net/http'

url = URI("https://public-api.sessionboard.com/v1/event/{eventId}/statuses/{id}/restore")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true

request = Net::HTTP::Post.new(url)
request["x-access-token"] = '<api-key>'

response = http.request(request)
puts response.read_body
```

200

```
{
  "id": "<string>",
  "name": "<string>",
  "status": "<string>",
  "status_name": "<string>",
  "color": "<string>",
  "order": 123,
  "is_custom": true,
  "created_at": "<string>",
  "created_by_user_id": 123,
  "created_by_user_name": "<string>"
}
```

#### Authorizations

ApiKeyBearerTokenApiKeyBearerToken

[​](https://apidocs.sessionboard.com/api-reference/metadata-writes/restore-a-deleted-session-status#authorization-x-access-token)

x-access-token

string

header

required

Organization API token. Generate from Organization Settings → API Tokens.

#### Path Parameters

[​](https://apidocs.sessionboard.com/api-reference/metadata-writes/restore-a-deleted-session-status#parameter-event-id)

eventId

integer

required

[​](https://apidocs.sessionboard.com/api-reference/metadata-writes/restore-a-deleted-session-status#parameter-id)

id

string

required

#### Response

200

application/json

Status restored

A custom session status definition configured for an event.

[​](https://apidocs.sessionboard.com/api-reference/metadata-writes/restore-a-deleted-session-status#response-id)

id

string

[​](https://apidocs.sessionboard.com/api-reference/metadata-writes/restore-a-deleted-session-status#response-name)

name

string

[​](https://apidocs.sessionboard.com/api-reference/metadata-writes/restore-a-deleted-session-status#response-status-one-of-0)

status

string \| null

[​](https://apidocs.sessionboard.com/api-reference/metadata-writes/restore-a-deleted-session-status#response-status-name-one-of-0)

status\_name

string \| null

[​](https://apidocs.sessionboard.com/api-reference/metadata-writes/restore-a-deleted-session-status#response-color)

color

string

[​](https://apidocs.sessionboard.com/api-reference/metadata-writes/restore-a-deleted-session-status#response-order)

order

integer

[​](https://apidocs.sessionboard.com/api-reference/metadata-writes/restore-a-deleted-session-status#response-is-custom)

is\_custom

boolean

[​](https://apidocs.sessionboard.com/api-reference/metadata-writes/restore-a-deleted-session-status#response-created-at-one-of-0)

created\_at

string \| null

[​](https://apidocs.sessionboard.com/api-reference/metadata-writes/restore-a-deleted-session-status#response-created-by-user-id-one-of-0)

created\_by\_user\_id

integer \| null

[​](https://apidocs.sessionboard.com/api-reference/metadata-writes/restore-a-deleted-session-status#response-created-by-user-name-one-of-0)

created\_by\_user\_name

string \| null

Ctrl+I