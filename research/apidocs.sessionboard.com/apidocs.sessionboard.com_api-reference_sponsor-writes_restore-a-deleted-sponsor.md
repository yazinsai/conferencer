---
url: "https://apidocs.sessionboard.com/api-reference/sponsor-writes/restore-a-deleted-sponsor"
title: "Restore a deleted sponsor - Sessionboard API"
---

> ## Documentation Index
>
> Fetch the complete documentation index at: [/llms.txt](https://apidocs.sessionboard.com/llms.txt)
>
> Use this file to discover all available pages before exploring further.

[Skip to main content](https://apidocs.sessionboard.com/api-reference/sponsor-writes/restore-a-deleted-sponsor#content-area)

Restore a deleted sponsor

cURL

```
curl --request POST \
  --url https://public-api.sessionboard.com/v1/event/{eventId}/sponsors/{sponsorId}/restore \
  --header 'x-access-token: <api-key>'
```

```
import requests

url = "https://public-api.sessionboard.com/v1/event/{eventId}/sponsors/{sponsorId}/restore"

headers = {"x-access-token": "<api-key>"}

response = requests.post(url, headers=headers)

print(response.text)
```

```
const options = {method: 'POST', headers: {'x-access-token': '<api-key>'}};

fetch('https://public-api.sessionboard.com/v1/event/{eventId}/sponsors/{sponsorId}/restore', options)
  .then(res => res.json())
  .then(res => console.log(res))
  .catch(err => console.error(err));
```

```
<?php

$curl = curl_init();

curl_setopt_array($curl, [\
  CURLOPT_URL => "https://public-api.sessionboard.com/v1/event/{eventId}/sponsors/{sponsorId}/restore",\
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

	url := "https://public-api.sessionboard.com/v1/event/{eventId}/sponsors/{sponsorId}/restore"

	req, _ := http.NewRequest("POST", url, nil)

	req.Header.Add("x-access-token", "<api-key>")

	res, _ := http.DefaultClient.Do(req)

	defer res.Body.Close()
	body, _ := io.ReadAll(res.Body)

	fmt.Println(string(body))

}
```

```
HttpResponse<String> response = Unirest.post("https://public-api.sessionboard.com/v1/event/{eventId}/sponsors/{sponsorId}/restore")
  .header("x-access-token", "<api-key>")
  .asString();
```

```
require 'uri'
require 'net/http'

url = URI("https://public-api.sessionboard.com/v1/event/{eventId}/sponsors/{sponsorId}/restore")

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
  "friendly_id": "<string>",
  "friendly_id_raw": 123,
  "name": "<string>",
  "description": "<string>",
  "logo_image_url": "<string>",
  "banner_image_url": "<string>",
  "phone": "<string>",
  "address_line_1": "<string>",
  "address_line_2": "<string>",
  "address_city": "<string>",
  "address_state": "<string>",
  "address_postal_code": "<string>",
  "address_coutnry": "<string>",
  "facebook_url": "<string>",
  "instagram_url": "<string>",
  "linkedin_url": "<string>",
  "snapchat_username": "<string>",
  "tiktok_username": "<string>",
  "twitter_url": "<string>",
  "website_url": "<string>",
  "created_at": "<string>",
  "updated_at": "<string>",
  "custom_fields": [\
    {\
      "id": "<string>",\
      "name": "<string>",\
      "value": "<string>",\
      "type": "<string>",\
      "internal_name": "<string>",\
      "created_at": "<string>"\
    }\
  ],
  "translated_fields": [\
    {\
      "id": "<string>",\
      "name": "<string>",\
      "type": "<string>",\
      "parent_field_id": "<string>",\
      "parent_field_source": "<string>",\
      "parent_field_name": "<string>",\
      "parent_field_internal_name": "<string>",\
      "translated_language": "<string>",\
      "value": "<string>"\
    }\
  ],
  "contacts": [\
    {\
      "id": "<string>",\
      "friendly_id": "<string>",\
      "friendly_id_raw": 123,\
      "full_name": "<string>",\
      "first_name": "<string>",\
      "last_name": "<string>",\
      "email": "<string>",\
      "photo_url": "<string>",\
      "company_name": "<string>",\
      "title": "<string>",\
      "about": "<string>",\
      "is_primary": true,\
      "contact_created_at": "<string>",\
      "contact_updated_at": "<string>",\
      "relationship_created_at": "<string>",\
      "relationship_updated_at": "<string>"\
    }\
  ],
  "admin_url": "<string>"
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

sponsors

/

{sponsorId}

/

restore

Try it

Restore a deleted sponsor

cURL

```
curl --request POST \
  --url https://public-api.sessionboard.com/v1/event/{eventId}/sponsors/{sponsorId}/restore \
  --header 'x-access-token: <api-key>'
```

```
import requests

url = "https://public-api.sessionboard.com/v1/event/{eventId}/sponsors/{sponsorId}/restore"

headers = {"x-access-token": "<api-key>"}

response = requests.post(url, headers=headers)

print(response.text)
```

```
const options = {method: 'POST', headers: {'x-access-token': '<api-key>'}};

fetch('https://public-api.sessionboard.com/v1/event/{eventId}/sponsors/{sponsorId}/restore', options)
  .then(res => res.json())
  .then(res => console.log(res))
  .catch(err => console.error(err));
```

```
<?php

$curl = curl_init();

curl_setopt_array($curl, [\
  CURLOPT_URL => "https://public-api.sessionboard.com/v1/event/{eventId}/sponsors/{sponsorId}/restore",\
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

	url := "https://public-api.sessionboard.com/v1/event/{eventId}/sponsors/{sponsorId}/restore"

	req, _ := http.NewRequest("POST", url, nil)

	req.Header.Add("x-access-token", "<api-key>")

	res, _ := http.DefaultClient.Do(req)

	defer res.Body.Close()
	body, _ := io.ReadAll(res.Body)

	fmt.Println(string(body))

}
```

```
HttpResponse<String> response = Unirest.post("https://public-api.sessionboard.com/v1/event/{eventId}/sponsors/{sponsorId}/restore")
  .header("x-access-token", "<api-key>")
  .asString();
```

```
require 'uri'
require 'net/http'

url = URI("https://public-api.sessionboard.com/v1/event/{eventId}/sponsors/{sponsorId}/restore")

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
  "friendly_id": "<string>",
  "friendly_id_raw": 123,
  "name": "<string>",
  "description": "<string>",
  "logo_image_url": "<string>",
  "banner_image_url": "<string>",
  "phone": "<string>",
  "address_line_1": "<string>",
  "address_line_2": "<string>",
  "address_city": "<string>",
  "address_state": "<string>",
  "address_postal_code": "<string>",
  "address_coutnry": "<string>",
  "facebook_url": "<string>",
  "instagram_url": "<string>",
  "linkedin_url": "<string>",
  "snapchat_username": "<string>",
  "tiktok_username": "<string>",
  "twitter_url": "<string>",
  "website_url": "<string>",
  "created_at": "<string>",
  "updated_at": "<string>",
  "custom_fields": [\
    {\
      "id": "<string>",\
      "name": "<string>",\
      "value": "<string>",\
      "type": "<string>",\
      "internal_name": "<string>",\
      "created_at": "<string>"\
    }\
  ],
  "translated_fields": [\
    {\
      "id": "<string>",\
      "name": "<string>",\
      "type": "<string>",\
      "parent_field_id": "<string>",\
      "parent_field_source": "<string>",\
      "parent_field_name": "<string>",\
      "parent_field_internal_name": "<string>",\
      "translated_language": "<string>",\
      "value": "<string>"\
    }\
  ],
  "contacts": [\
    {\
      "id": "<string>",\
      "friendly_id": "<string>",\
      "friendly_id_raw": 123,\
      "full_name": "<string>",\
      "first_name": "<string>",\
      "last_name": "<string>",\
      "email": "<string>",\
      "photo_url": "<string>",\
      "company_name": "<string>",\
      "title": "<string>",\
      "about": "<string>",\
      "is_primary": true,\
      "contact_created_at": "<string>",\
      "contact_updated_at": "<string>",\
      "relationship_created_at": "<string>",\
      "relationship_updated_at": "<string>"\
    }\
  ],
  "admin_url": "<string>"
}
```

#### Authorizations

ApiKeyBearerTokenApiKeyBearerToken

[​](https://apidocs.sessionboard.com/api-reference/sponsor-writes/restore-a-deleted-sponsor#authorization-x-access-token)

x-access-token

string

header

required

Organization API token. Generate from Organization Settings → API Tokens.

#### Path Parameters

[​](https://apidocs.sessionboard.com/api-reference/sponsor-writes/restore-a-deleted-sponsor#parameter-event-id)

eventId

integer

required

The event ID.

[​](https://apidocs.sessionboard.com/api-reference/sponsor-writes/restore-a-deleted-sponsor#parameter-sponsor-id)

sponsorId

string

required

The sponsor ID.

#### Response

200

application/json

Sponsor restored

A sponsor associated with an event.

[​](https://apidocs.sessionboard.com/api-reference/sponsor-writes/restore-a-deleted-sponsor#response-id)

id

string

[​](https://apidocs.sessionboard.com/api-reference/sponsor-writes/restore-a-deleted-sponsor#response-friendly-id)

friendly\_id

string

[​](https://apidocs.sessionboard.com/api-reference/sponsor-writes/restore-a-deleted-sponsor#response-friendly-id-raw)

friendly\_id\_raw

integer

[​](https://apidocs.sessionboard.com/api-reference/sponsor-writes/restore-a-deleted-sponsor#response-name)

name

string

[​](https://apidocs.sessionboard.com/api-reference/sponsor-writes/restore-a-deleted-sponsor#response-description)

description

string

[​](https://apidocs.sessionboard.com/api-reference/sponsor-writes/restore-a-deleted-sponsor#response-logo-image-url)

logo\_image\_url

string

[​](https://apidocs.sessionboard.com/api-reference/sponsor-writes/restore-a-deleted-sponsor#response-banner-image-url)

banner\_image\_url

string

[​](https://apidocs.sessionboard.com/api-reference/sponsor-writes/restore-a-deleted-sponsor#response-phone)

phone

string

[​](https://apidocs.sessionboard.com/api-reference/sponsor-writes/restore-a-deleted-sponsor#response-address-line-1)

address\_line\_1

string

[​](https://apidocs.sessionboard.com/api-reference/sponsor-writes/restore-a-deleted-sponsor#response-address-line-2)

address\_line\_2

string

[​](https://apidocs.sessionboard.com/api-reference/sponsor-writes/restore-a-deleted-sponsor#response-address-city)

address\_city

string

[​](https://apidocs.sessionboard.com/api-reference/sponsor-writes/restore-a-deleted-sponsor#response-address-state)

address\_state

string

[​](https://apidocs.sessionboard.com/api-reference/sponsor-writes/restore-a-deleted-sponsor#response-address-postal-code)

address\_postal\_code

string

[​](https://apidocs.sessionboard.com/api-reference/sponsor-writes/restore-a-deleted-sponsor#response-address-coutnry)

address\_coutnry

string

Country (note: field name contains a known typo preserved for backwards compatibility).

[​](https://apidocs.sessionboard.com/api-reference/sponsor-writes/restore-a-deleted-sponsor#response-facebook-url)

facebook\_url

string

[​](https://apidocs.sessionboard.com/api-reference/sponsor-writes/restore-a-deleted-sponsor#response-instagram-url)

instagram\_url

string

[​](https://apidocs.sessionboard.com/api-reference/sponsor-writes/restore-a-deleted-sponsor#response-linkedin-url)

linkedin\_url

string

[​](https://apidocs.sessionboard.com/api-reference/sponsor-writes/restore-a-deleted-sponsor#response-snapchat-username)

snapchat\_username

string

[​](https://apidocs.sessionboard.com/api-reference/sponsor-writes/restore-a-deleted-sponsor#response-tiktok-username)

tiktok\_username

string

[​](https://apidocs.sessionboard.com/api-reference/sponsor-writes/restore-a-deleted-sponsor#response-twitter-url)

twitter\_url

string

[​](https://apidocs.sessionboard.com/api-reference/sponsor-writes/restore-a-deleted-sponsor#response-website-url)

website\_url

string

[​](https://apidocs.sessionboard.com/api-reference/sponsor-writes/restore-a-deleted-sponsor#response-created-at)

created\_at

string

[​](https://apidocs.sessionboard.com/api-reference/sponsor-writes/restore-a-deleted-sponsor#response-updated-at)

updated\_at

string

[​](https://apidocs.sessionboard.com/api-reference/sponsor-writes/restore-a-deleted-sponsor#response-custom-fields)

custom\_fields

object\[\]

Showchild attributes

[​](https://apidocs.sessionboard.com/api-reference/sponsor-writes/restore-a-deleted-sponsor#response-translated-fields)

translated\_fields

object\[\]

Showchild attributes

[​](https://apidocs.sessionboard.com/api-reference/sponsor-writes/restore-a-deleted-sponsor#response-contacts)

contacts

object\[\]

Showchild attributes

[​](https://apidocs.sessionboard.com/api-reference/sponsor-writes/restore-a-deleted-sponsor#response-admin-url-one-of-0)

admin\_url

string<uri> \| null

Deep link to this entity in the Sessionboard admin UI.

Ctrl+I