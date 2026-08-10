---
url: "https://apidocs.sessionboard.com/api-reference/exhibitor-writes/update-an-exhibitor"
title: "Update an exhibitor - Sessionboard API"
---

> ## Documentation Index
>
> Fetch the complete documentation index at: [/llms.txt](https://apidocs.sessionboard.com/llms.txt)
>
> Use this file to discover all available pages before exploring further.

[Skip to main content](https://apidocs.sessionboard.com/api-reference/exhibitor-writes/update-an-exhibitor#content-area)

Update an exhibitor

cURL

```
curl --request PUT \
  --url https://public-api.sessionboard.com/v1/event/{eventId}/exhibitors/{exhibitorId} \
  --header 'Content-Type: application/json' \
  --header 'x-access-token: <api-key>' \
  --data '
{
  "updated_at": "2023-11-07T05:31:56Z",
  "name": "<string>",
  "custom_fields": {}
}
'
```

```
import requests

url = "https://public-api.sessionboard.com/v1/event/{eventId}/exhibitors/{exhibitorId}"

payload = {
    "updated_at": "2023-11-07T05:31:56Z",
    "name": "<string>",
    "custom_fields": {}
}
headers = {
    "x-access-token": "<api-key>",
    "Content-Type": "application/json"
}

response = requests.put(url, json=payload, headers=headers)

print(response.text)
```

```
const options = {
  method: 'PUT',
  headers: {'x-access-token': '<api-key>', 'Content-Type': 'application/json'},
  body: JSON.stringify({updated_at: '2023-11-07T05:31:56Z', name: '<string>', custom_fields: {}})
};

fetch('https://public-api.sessionboard.com/v1/event/{eventId}/exhibitors/{exhibitorId}', options)
  .then(res => res.json())
  .then(res => console.log(res))
  .catch(err => console.error(err));
```

```
<?php

$curl = curl_init();

curl_setopt_array($curl, [\
  CURLOPT_URL => "https://public-api.sessionboard.com/v1/event/{eventId}/exhibitors/{exhibitorId}",\
  CURLOPT_RETURNTRANSFER => true,\
  CURLOPT_ENCODING => "",\
  CURLOPT_MAXREDIRS => 10,\
  CURLOPT_TIMEOUT => 30,\
  CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,\
  CURLOPT_CUSTOMREQUEST => "PUT",\
  CURLOPT_POSTFIELDS => json_encode([\
    'updated_at' => '2023-11-07T05:31:56Z',\
    'name' => '<string>',\
    'custom_fields' => [\
\
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

	url := "https://public-api.sessionboard.com/v1/event/{eventId}/exhibitors/{exhibitorId}"

	payload := strings.NewReader("{\n  \"updated_at\": \"2023-11-07T05:31:56Z\",\n  \"name\": \"<string>\",\n  \"custom_fields\": {}\n}")

	req, _ := http.NewRequest("PUT", url, payload)

	req.Header.Add("x-access-token", "<api-key>")
	req.Header.Add("Content-Type", "application/json")

	res, _ := http.DefaultClient.Do(req)

	defer res.Body.Close()
	body, _ := io.ReadAll(res.Body)

	fmt.Println(string(body))

}
```

```
HttpResponse<String> response = Unirest.put("https://public-api.sessionboard.com/v1/event/{eventId}/exhibitors/{exhibitorId}")
  .header("x-access-token", "<api-key>")
  .header("Content-Type", "application/json")
  .body("{\n  \"updated_at\": \"2023-11-07T05:31:56Z\",\n  \"name\": \"<string>\",\n  \"custom_fields\": {}\n}")
  .asString();
```

```
require 'uri'
require 'net/http'

url = URI("https://public-api.sessionboard.com/v1/event/{eventId}/exhibitors/{exhibitorId}")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true

request = Net::HTTP::Put.new(url)
request["x-access-token"] = '<api-key>'
request["Content-Type"] = 'application/json'
request.body = "{\n  \"updated_at\": \"2023-11-07T05:31:56Z\",\n  \"name\": \"<string>\",\n  \"custom_fields\": {}\n}"

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

PUT

https://public-api.sessionboard.comhttps://public-api-eu.sessionboard.com

/

v1

/

event

/

{eventId}

/

exhibitors

/

{exhibitorId}

Try it

Update an exhibitor

cURL

```
curl --request PUT \
  --url https://public-api.sessionboard.com/v1/event/{eventId}/exhibitors/{exhibitorId} \
  --header 'Content-Type: application/json' \
  --header 'x-access-token: <api-key>' \
  --data '
{
  "updated_at": "2023-11-07T05:31:56Z",
  "name": "<string>",
  "custom_fields": {}
}
'
```

```
import requests

url = "https://public-api.sessionboard.com/v1/event/{eventId}/exhibitors/{exhibitorId}"

payload = {
    "updated_at": "2023-11-07T05:31:56Z",
    "name": "<string>",
    "custom_fields": {}
}
headers = {
    "x-access-token": "<api-key>",
    "Content-Type": "application/json"
}

response = requests.put(url, json=payload, headers=headers)

print(response.text)
```

```
const options = {
  method: 'PUT',
  headers: {'x-access-token': '<api-key>', 'Content-Type': 'application/json'},
  body: JSON.stringify({updated_at: '2023-11-07T05:31:56Z', name: '<string>', custom_fields: {}})
};

fetch('https://public-api.sessionboard.com/v1/event/{eventId}/exhibitors/{exhibitorId}', options)
  .then(res => res.json())
  .then(res => console.log(res))
  .catch(err => console.error(err));
```

```
<?php

$curl = curl_init();

curl_setopt_array($curl, [\
  CURLOPT_URL => "https://public-api.sessionboard.com/v1/event/{eventId}/exhibitors/{exhibitorId}",\
  CURLOPT_RETURNTRANSFER => true,\
  CURLOPT_ENCODING => "",\
  CURLOPT_MAXREDIRS => 10,\
  CURLOPT_TIMEOUT => 30,\
  CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,\
  CURLOPT_CUSTOMREQUEST => "PUT",\
  CURLOPT_POSTFIELDS => json_encode([\
    'updated_at' => '2023-11-07T05:31:56Z',\
    'name' => '<string>',\
    'custom_fields' => [\
\
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

	url := "https://public-api.sessionboard.com/v1/event/{eventId}/exhibitors/{exhibitorId}"

	payload := strings.NewReader("{\n  \"updated_at\": \"2023-11-07T05:31:56Z\",\n  \"name\": \"<string>\",\n  \"custom_fields\": {}\n}")

	req, _ := http.NewRequest("PUT", url, payload)

	req.Header.Add("x-access-token", "<api-key>")
	req.Header.Add("Content-Type", "application/json")

	res, _ := http.DefaultClient.Do(req)

	defer res.Body.Close()
	body, _ := io.ReadAll(res.Body)

	fmt.Println(string(body))

}
```

```
HttpResponse<String> response = Unirest.put("https://public-api.sessionboard.com/v1/event/{eventId}/exhibitors/{exhibitorId}")
  .header("x-access-token", "<api-key>")
  .header("Content-Type", "application/json")
  .body("{\n  \"updated_at\": \"2023-11-07T05:31:56Z\",\n  \"name\": \"<string>\",\n  \"custom_fields\": {}\n}")
  .asString();
```

```
require 'uri'
require 'net/http'

url = URI("https://public-api.sessionboard.com/v1/event/{eventId}/exhibitors/{exhibitorId}")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true

request = Net::HTTP::Put.new(url)
request["x-access-token"] = '<api-key>'
request["Content-Type"] = 'application/json'
request.body = "{\n  \"updated_at\": \"2023-11-07T05:31:56Z\",\n  \"name\": \"<string>\",\n  \"custom_fields\": {}\n}"

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

[​](https://apidocs.sessionboard.com/api-reference/exhibitor-writes/update-an-exhibitor#authorization-x-access-token)

x-access-token

string

header

required

Organization API token. Generate from Organization Settings → API Tokens.

#### Path Parameters

[​](https://apidocs.sessionboard.com/api-reference/exhibitor-writes/update-an-exhibitor#parameter-event-id)

eventId

integer

required

The event ID.

[​](https://apidocs.sessionboard.com/api-reference/exhibitor-writes/update-an-exhibitor#parameter-exhibitor-id)

exhibitorId

string

required

The exhibitor ID.

#### Body

application/json

[​](https://apidocs.sessionboard.com/api-reference/exhibitor-writes/update-an-exhibitor#body-updated-at)

updated\_at

string<date-time>

Optional optimistic concurrency control. Send the `updated_at` value from the last-fetched exhibitor.

[​](https://apidocs.sessionboard.com/api-reference/exhibitor-writes/update-an-exhibitor#body-name)

name

string

[​](https://apidocs.sessionboard.com/api-reference/exhibitor-writes/update-an-exhibitor#body-custom-fields)

custom\_fields

object

Custom field values keyed by field internal name.

#### Response

200

application/json

Exhibitor updated

An exhibitor associated with an event.

[​](https://apidocs.sessionboard.com/api-reference/exhibitor-writes/update-an-exhibitor#response-id)

id

string

[​](https://apidocs.sessionboard.com/api-reference/exhibitor-writes/update-an-exhibitor#response-friendly-id)

friendly\_id

string

[​](https://apidocs.sessionboard.com/api-reference/exhibitor-writes/update-an-exhibitor#response-friendly-id-raw)

friendly\_id\_raw

integer

[​](https://apidocs.sessionboard.com/api-reference/exhibitor-writes/update-an-exhibitor#response-name)

name

string

[​](https://apidocs.sessionboard.com/api-reference/exhibitor-writes/update-an-exhibitor#response-description)

description

string

[​](https://apidocs.sessionboard.com/api-reference/exhibitor-writes/update-an-exhibitor#response-logo-image-url)

logo\_image\_url

string

[​](https://apidocs.sessionboard.com/api-reference/exhibitor-writes/update-an-exhibitor#response-banner-image-url)

banner\_image\_url

string

[​](https://apidocs.sessionboard.com/api-reference/exhibitor-writes/update-an-exhibitor#response-phone)

phone

string

[​](https://apidocs.sessionboard.com/api-reference/exhibitor-writes/update-an-exhibitor#response-address-line-1)

address\_line\_1

string

[​](https://apidocs.sessionboard.com/api-reference/exhibitor-writes/update-an-exhibitor#response-address-line-2)

address\_line\_2

string

[​](https://apidocs.sessionboard.com/api-reference/exhibitor-writes/update-an-exhibitor#response-address-city)

address\_city

string

[​](https://apidocs.sessionboard.com/api-reference/exhibitor-writes/update-an-exhibitor#response-address-state)

address\_state

string

[​](https://apidocs.sessionboard.com/api-reference/exhibitor-writes/update-an-exhibitor#response-address-postal-code)

address\_postal\_code

string

[​](https://apidocs.sessionboard.com/api-reference/exhibitor-writes/update-an-exhibitor#response-address-coutnry)

address\_coutnry

string

Country (note: field name contains a known typo preserved for backwards compatibility).

[​](https://apidocs.sessionboard.com/api-reference/exhibitor-writes/update-an-exhibitor#response-facebook-url)

facebook\_url

string

[​](https://apidocs.sessionboard.com/api-reference/exhibitor-writes/update-an-exhibitor#response-instagram-url)

instagram\_url

string

[​](https://apidocs.sessionboard.com/api-reference/exhibitor-writes/update-an-exhibitor#response-linkedin-url)

linkedin\_url

string

[​](https://apidocs.sessionboard.com/api-reference/exhibitor-writes/update-an-exhibitor#response-snapchat-username)

snapchat\_username

string

[​](https://apidocs.sessionboard.com/api-reference/exhibitor-writes/update-an-exhibitor#response-tiktok-username)

tiktok\_username

string

[​](https://apidocs.sessionboard.com/api-reference/exhibitor-writes/update-an-exhibitor#response-twitter-url)

twitter\_url

string

[​](https://apidocs.sessionboard.com/api-reference/exhibitor-writes/update-an-exhibitor#response-website-url)

website\_url

string

[​](https://apidocs.sessionboard.com/api-reference/exhibitor-writes/update-an-exhibitor#response-created-at)

created\_at

string

[​](https://apidocs.sessionboard.com/api-reference/exhibitor-writes/update-an-exhibitor#response-updated-at)

updated\_at

string

[​](https://apidocs.sessionboard.com/api-reference/exhibitor-writes/update-an-exhibitor#response-custom-fields)

custom\_fields

object\[\]

Showchild attributes

[​](https://apidocs.sessionboard.com/api-reference/exhibitor-writes/update-an-exhibitor#response-translated-fields)

translated\_fields

object\[\]

Showchild attributes

[​](https://apidocs.sessionboard.com/api-reference/exhibitor-writes/update-an-exhibitor#response-contacts)

contacts

object\[\]

Showchild attributes

[​](https://apidocs.sessionboard.com/api-reference/exhibitor-writes/update-an-exhibitor#response-admin-url-one-of-0)

admin\_url

string<uri> \| null

Deep link to this entity in the Sessionboard admin UI.

Ctrl+I