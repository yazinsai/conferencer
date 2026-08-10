---
url: "https://apidocs.sessionboard.com/api-reference/session-files/upload-a-session-file-simple"
title: "Upload a session file (simple) - Sessionboard API"
---

> ## Documentation Index
>
> Fetch the complete documentation index at: [/llms.txt](https://apidocs.sessionboard.com/llms.txt)
>
> Use this file to discover all available pages before exploring further.

[Skip to main content](https://apidocs.sessionboard.com/api-reference/session-files/upload-a-session-file-simple#content-area)

Upload a session file (simple)

cURL

```
curl --request POST \
  --url https://public-api.sessionboard.com/v1/event/{eventId}/sessions/{sessionId}/files/upload \
  --header 'Content-Type: multipart/form-data' \
  --header 'x-access-token: <api-key>' \
  --form file='@example-file' \
  --form 'title=<string>' \
  --form assigned_participant_id=3c90c3cc-0d44-4b50-8888-8dd25736052a
```

```
import requests

url = "https://public-api.sessionboard.com/v1/event/{eventId}/sessions/{sessionId}/files/upload"

files = { "file": ("example-file", open("example-file", "rb")) }
payload = {
    "title": "<string>",
    "assigned_participant_id": "3c90c3cc-0d44-4b50-8888-8dd25736052a"
}
headers = {"x-access-token": "<api-key>"}

response = requests.post(url, data=payload, files=files, headers=headers)

print(response.text)
```

```
const form = new FormData();
form.append('file', '<string>');
form.append('title', '<string>');
form.append('assigned_participant_id', '3c90c3cc-0d44-4b50-8888-8dd25736052a');

const options = {method: 'POST', headers: {'x-access-token': '<api-key>'}};

options.body = form;

fetch('https://public-api.sessionboard.com/v1/event/{eventId}/sessions/{sessionId}/files/upload', options)
  .then(res => res.json())
  .then(res => console.log(res))
  .catch(err => console.error(err));
```

```
<?php

$curl = curl_init();

curl_setopt_array($curl, [\
  CURLOPT_URL => "https://public-api.sessionboard.com/v1/event/{eventId}/sessions/{sessionId}/files/upload",\
  CURLOPT_RETURNTRANSFER => true,\
  CURLOPT_ENCODING => "",\
  CURLOPT_MAXREDIRS => 10,\
  CURLOPT_TIMEOUT => 30,\
  CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,\
  CURLOPT_CUSTOMREQUEST => "POST",\
  CURLOPT_POSTFIELDS => "-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"file\"; filename=\"example-file\"\r\nContent-Type: application/octet-stream\r\n\r\n<string>\r\n-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"title\"\r\n\r\n<string>\r\n-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"assigned_participant_id\"\r\n\r\n3c90c3cc-0d44-4b50-8888-8dd25736052a\r\n-----011000010111000001101001--",\
  CURLOPT_HTTPHEADER => [\
    "Content-Type: multipart/form-data",\
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

	url := "https://public-api.sessionboard.com/v1/event/{eventId}/sessions/{sessionId}/files/upload"

	payload := strings.NewReader("-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"file\"; filename=\"example-file\"\r\nContent-Type: application/octet-stream\r\n\r\n<string>\r\n-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"title\"\r\n\r\n<string>\r\n-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"assigned_participant_id\"\r\n\r\n3c90c3cc-0d44-4b50-8888-8dd25736052a\r\n-----011000010111000001101001--")

	req, _ := http.NewRequest("POST", url, payload)

	req.Header.Add("x-access-token", "<api-key>")

	res, _ := http.DefaultClient.Do(req)

	defer res.Body.Close()
	body, _ := io.ReadAll(res.Body)

	fmt.Println(string(body))

}
```

```
HttpResponse<String> response = Unirest.post("https://public-api.sessionboard.com/v1/event/{eventId}/sessions/{sessionId}/files/upload")
  .header("x-access-token", "<api-key>")
  .body("-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"file\"; filename=\"example-file\"\r\nContent-Type: application/octet-stream\r\n\r\n<string>\r\n-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"title\"\r\n\r\n<string>\r\n-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"assigned_participant_id\"\r\n\r\n3c90c3cc-0d44-4b50-8888-8dd25736052a\r\n-----011000010111000001101001--")
  .asString();
```

```
require 'uri'
require 'net/http'

url = URI("https://public-api.sessionboard.com/v1/event/{eventId}/sessions/{sessionId}/files/upload")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true

request = Net::HTTP::Post.new(url)
request["x-access-token"] = '<api-key>'
request.body = "-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"file\"; filename=\"example-file\"\r\nContent-Type: application/octet-stream\r\n\r\n<string>\r\n-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"title\"\r\n\r\n<string>\r\n-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"assigned_participant_id\"\r\n\r\n3c90c3cc-0d44-4b50-8888-8dd25736052a\r\n-----011000010111000001101001--"

response = http.request(request)
puts response.read_body
```

201

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

upload

Try it

Upload a session file (simple)

cURL

```
curl --request POST \
  --url https://public-api.sessionboard.com/v1/event/{eventId}/sessions/{sessionId}/files/upload \
  --header 'Content-Type: multipart/form-data' \
  --header 'x-access-token: <api-key>' \
  --form file='@example-file' \
  --form 'title=<string>' \
  --form assigned_participant_id=3c90c3cc-0d44-4b50-8888-8dd25736052a
```

```
import requests

url = "https://public-api.sessionboard.com/v1/event/{eventId}/sessions/{sessionId}/files/upload"

files = { "file": ("example-file", open("example-file", "rb")) }
payload = {
    "title": "<string>",
    "assigned_participant_id": "3c90c3cc-0d44-4b50-8888-8dd25736052a"
}
headers = {"x-access-token": "<api-key>"}

response = requests.post(url, data=payload, files=files, headers=headers)

print(response.text)
```

```
const form = new FormData();
form.append('file', '<string>');
form.append('title', '<string>');
form.append('assigned_participant_id', '3c90c3cc-0d44-4b50-8888-8dd25736052a');

const options = {method: 'POST', headers: {'x-access-token': '<api-key>'}};

options.body = form;

fetch('https://public-api.sessionboard.com/v1/event/{eventId}/sessions/{sessionId}/files/upload', options)
  .then(res => res.json())
  .then(res => console.log(res))
  .catch(err => console.error(err));
```

```
<?php

$curl = curl_init();

curl_setopt_array($curl, [\
  CURLOPT_URL => "https://public-api.sessionboard.com/v1/event/{eventId}/sessions/{sessionId}/files/upload",\
  CURLOPT_RETURNTRANSFER => true,\
  CURLOPT_ENCODING => "",\
  CURLOPT_MAXREDIRS => 10,\
  CURLOPT_TIMEOUT => 30,\
  CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,\
  CURLOPT_CUSTOMREQUEST => "POST",\
  CURLOPT_POSTFIELDS => "-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"file\"; filename=\"example-file\"\r\nContent-Type: application/octet-stream\r\n\r\n<string>\r\n-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"title\"\r\n\r\n<string>\r\n-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"assigned_participant_id\"\r\n\r\n3c90c3cc-0d44-4b50-8888-8dd25736052a\r\n-----011000010111000001101001--",\
  CURLOPT_HTTPHEADER => [\
    "Content-Type: multipart/form-data",\
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

	url := "https://public-api.sessionboard.com/v1/event/{eventId}/sessions/{sessionId}/files/upload"

	payload := strings.NewReader("-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"file\"; filename=\"example-file\"\r\nContent-Type: application/octet-stream\r\n\r\n<string>\r\n-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"title\"\r\n\r\n<string>\r\n-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"assigned_participant_id\"\r\n\r\n3c90c3cc-0d44-4b50-8888-8dd25736052a\r\n-----011000010111000001101001--")

	req, _ := http.NewRequest("POST", url, payload)

	req.Header.Add("x-access-token", "<api-key>")

	res, _ := http.DefaultClient.Do(req)

	defer res.Body.Close()
	body, _ := io.ReadAll(res.Body)

	fmt.Println(string(body))

}
```

```
HttpResponse<String> response = Unirest.post("https://public-api.sessionboard.com/v1/event/{eventId}/sessions/{sessionId}/files/upload")
  .header("x-access-token", "<api-key>")
  .body("-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"file\"; filename=\"example-file\"\r\nContent-Type: application/octet-stream\r\n\r\n<string>\r\n-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"title\"\r\n\r\n<string>\r\n-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"assigned_participant_id\"\r\n\r\n3c90c3cc-0d44-4b50-8888-8dd25736052a\r\n-----011000010111000001101001--")
  .asString();
```

```
require 'uri'
require 'net/http'

url = URI("https://public-api.sessionboard.com/v1/event/{eventId}/sessions/{sessionId}/files/upload")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true

request = Net::HTTP::Post.new(url)
request["x-access-token"] = '<api-key>'
request.body = "-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"file\"; filename=\"example-file\"\r\nContent-Type: application/octet-stream\r\n\r\n<string>\r\n-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"title\"\r\n\r\n<string>\r\n-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"assigned_participant_id\"\r\n\r\n3c90c3cc-0d44-4b50-8888-8dd25736052a\r\n-----011000010111000001101001--"

response = http.request(request)
puts response.read_body
```

201

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

[​](https://apidocs.sessionboard.com/api-reference/session-files/upload-a-session-file-simple#authorization-x-access-token)

x-access-token

string

header

required

Organization API token. Generate from Organization Settings → API Tokens.

#### Path Parameters

[​](https://apidocs.sessionboard.com/api-reference/session-files/upload-a-session-file-simple#parameter-event-id)

eventId

integer

required

Event ID

[​](https://apidocs.sessionboard.com/api-reference/session-files/upload-a-session-file-simple#parameter-session-id)

sessionId

string<uuid>

required

Session UUID

#### Body

multipart/form-data

[​](https://apidocs.sessionboard.com/api-reference/session-files/upload-a-session-file-simple#body-file)

file

file

required

The file to attach (field name must be `file`).

[​](https://apidocs.sessionboard.com/api-reference/session-files/upload-a-session-file-simple#body-title)

title

string

Display title. Defaults to the uploaded filename.

[​](https://apidocs.sessionboard.com/api-reference/session-files/upload-a-session-file-simple#body-assigned-participant-id)

assigned\_participant\_id

string<uuid>

Contact UUID of a session participant.

#### Response

201

application/json

Created — file attached and scanned

[​](https://apidocs.sessionboard.com/api-reference/session-files/upload-a-session-file-simple#response-data)

data

object

A content attachment (file, document, or media) associated with a session.

Showchild attributes

Ctrl+I