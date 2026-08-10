---
url: "https://apidocs.sessionboard.com/api-reference/session-files/finalize-session-file-upload"
title: "Finalize session file upload - Sessionboard API"
---

> ## Documentation Index
>
> Fetch the complete documentation index at: [/llms.txt](https://apidocs.sessionboard.com/llms.txt)
>
> Use this file to discover all available pages before exploring further.

[Skip to main content](https://apidocs.sessionboard.com/api-reference/session-files/finalize-session-file-upload#content-area)

Finalize session file upload

cURL

```
curl --request POST \
  --url https://public-api.sessionboard.com/v1/event/{eventId}/sessions/{sessionId}/files/{fileId}/complete \
  --header 'x-access-token: <api-key>'
```

```
import requests

url = "https://public-api.sessionboard.com/v1/event/{eventId}/sessions/{sessionId}/files/{fileId}/complete"

headers = {"x-access-token": "<api-key>"}

response = requests.post(url, headers=headers)

print(response.text)
```

```
const options = {method: 'POST', headers: {'x-access-token': '<api-key>'}};

fetch('https://public-api.sessionboard.com/v1/event/{eventId}/sessions/{sessionId}/files/{fileId}/complete', options)
  .then(res => res.json())
  .then(res => console.log(res))
  .catch(err => console.error(err));
```

```
<?php

$curl = curl_init();

curl_setopt_array($curl, [\
  CURLOPT_URL => "https://public-api.sessionboard.com/v1/event/{eventId}/sessions/{sessionId}/files/{fileId}/complete",\
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

	url := "https://public-api.sessionboard.com/v1/event/{eventId}/sessions/{sessionId}/files/{fileId}/complete"

	req, _ := http.NewRequest("POST", url, nil)

	req.Header.Add("x-access-token", "<api-key>")

	res, _ := http.DefaultClient.Do(req)

	defer res.Body.Close()
	body, _ := io.ReadAll(res.Body)

	fmt.Println(string(body))

}
```

```
HttpResponse<String> response = Unirest.post("https://public-api.sessionboard.com/v1/event/{eventId}/sessions/{sessionId}/files/{fileId}/complete")
  .header("x-access-token", "<api-key>")
  .asString();
```

```
require 'uri'
require 'net/http'

url = URI("https://public-api.sessionboard.com/v1/event/{eventId}/sessions/{sessionId}/files/{fileId}/complete")

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
  "data": {
    "id": "3c90c3cc-0d44-4b50-8888-8dd25736052a",
    "url": "<string>",
    "title": "<string>",
    "filename": "<string>",
    "size": 123,
    "mimetype": "<string>",
    "created_at": "2023-11-07T05:31:56Z",
    "updated_at": "2023-11-07T05:31:56Z",
    "assigned_participant_id": "3c90c3cc-0d44-4b50-8888-8dd25736052a",
    "assigned_participant_email": "jsmith@example.com",
    "assigned_participant_name": "<string>"
  }
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

sessions

/

{sessionId}

/

files

/

{fileId}

/

complete

Try it

Finalize session file upload

cURL

```
curl --request POST \
  --url https://public-api.sessionboard.com/v1/event/{eventId}/sessions/{sessionId}/files/{fileId}/complete \
  --header 'x-access-token: <api-key>'
```

```
import requests

url = "https://public-api.sessionboard.com/v1/event/{eventId}/sessions/{sessionId}/files/{fileId}/complete"

headers = {"x-access-token": "<api-key>"}

response = requests.post(url, headers=headers)

print(response.text)
```

```
const options = {method: 'POST', headers: {'x-access-token': '<api-key>'}};

fetch('https://public-api.sessionboard.com/v1/event/{eventId}/sessions/{sessionId}/files/{fileId}/complete', options)
  .then(res => res.json())
  .then(res => console.log(res))
  .catch(err => console.error(err));
```

```
<?php

$curl = curl_init();

curl_setopt_array($curl, [\
  CURLOPT_URL => "https://public-api.sessionboard.com/v1/event/{eventId}/sessions/{sessionId}/files/{fileId}/complete",\
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

	url := "https://public-api.sessionboard.com/v1/event/{eventId}/sessions/{sessionId}/files/{fileId}/complete"

	req, _ := http.NewRequest("POST", url, nil)

	req.Header.Add("x-access-token", "<api-key>")

	res, _ := http.DefaultClient.Do(req)

	defer res.Body.Close()
	body, _ := io.ReadAll(res.Body)

	fmt.Println(string(body))

}
```

```
HttpResponse<String> response = Unirest.post("https://public-api.sessionboard.com/v1/event/{eventId}/sessions/{sessionId}/files/{fileId}/complete")
  .header("x-access-token", "<api-key>")
  .asString();
```

```
require 'uri'
require 'net/http'

url = URI("https://public-api.sessionboard.com/v1/event/{eventId}/sessions/{sessionId}/files/{fileId}/complete")

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
  "data": {
    "id": "3c90c3cc-0d44-4b50-8888-8dd25736052a",
    "url": "<string>",
    "title": "<string>",
    "filename": "<string>",
    "size": 123,
    "mimetype": "<string>",
    "created_at": "2023-11-07T05:31:56Z",
    "updated_at": "2023-11-07T05:31:56Z",
    "assigned_participant_id": "3c90c3cc-0d44-4b50-8888-8dd25736052a",
    "assigned_participant_email": "jsmith@example.com",
    "assigned_participant_name": "<string>"
  }
}
```

#### Authorizations

ApiKeyBearerTokenApiKeyBearerToken

[​](https://apidocs.sessionboard.com/api-reference/session-files/finalize-session-file-upload#authorization-x-access-token)

x-access-token

string

header

required

Organization API token. Generate from Organization Settings → API Tokens.

#### Path Parameters

[​](https://apidocs.sessionboard.com/api-reference/session-files/finalize-session-file-upload#parameter-event-id)

eventId

integer

required

Event ID

[​](https://apidocs.sessionboard.com/api-reference/session-files/finalize-session-file-upload#parameter-session-id)

sessionId

string<uuid>

required

Session UUID

[​](https://apidocs.sessionboard.com/api-reference/session-files/finalize-session-file-upload#parameter-file-id)

fileId

string<uuid>

required

Session file (Content) UUID

#### Response

200

application/json

OK

[​](https://apidocs.sessionboard.com/api-reference/session-files/finalize-session-file-upload#response-data)

data

object

A content attachment (file, document, or media) associated with a session.

Showchild attributes

⌘I