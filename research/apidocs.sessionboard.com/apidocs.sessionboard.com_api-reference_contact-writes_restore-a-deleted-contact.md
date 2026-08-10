---
url: "https://apidocs.sessionboard.com/api-reference/contact-writes/restore-a-deleted-contact"
title: "Restore a deleted contact - Sessionboard API"
---

> ## Documentation Index
>
> Fetch the complete documentation index at: [/llms.txt](https://apidocs.sessionboard.com/llms.txt)
>
> Use this file to discover all available pages before exploring further.

[Skip to main content](https://apidocs.sessionboard.com/api-reference/contact-writes/restore-a-deleted-contact#content-area)

Restore a deleted contact

cURL

```
curl --request POST \
  --url https://public-api.sessionboard.com/v1/event/{eventId}/contacts/{contactId}/restore \
  --header 'x-access-token: <api-key>'
```

```
import requests

url = "https://public-api.sessionboard.com/v1/event/{eventId}/contacts/{contactId}/restore"

headers = {"x-access-token": "<api-key>"}

response = requests.post(url, headers=headers)

print(response.text)
```

```
const options = {method: 'POST', headers: {'x-access-token': '<api-key>'}};

fetch('https://public-api.sessionboard.com/v1/event/{eventId}/contacts/{contactId}/restore', options)
  .then(res => res.json())
  .then(res => console.log(res))
  .catch(err => console.error(err));
```

```
<?php

$curl = curl_init();

curl_setopt_array($curl, [\
  CURLOPT_URL => "https://public-api.sessionboard.com/v1/event/{eventId}/contacts/{contactId}/restore",\
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

	url := "https://public-api.sessionboard.com/v1/event/{eventId}/contacts/{contactId}/restore"

	req, _ := http.NewRequest("POST", url, nil)

	req.Header.Add("x-access-token", "<api-key>")

	res, _ := http.DefaultClient.Do(req)

	defer res.Body.Close()
	body, _ := io.ReadAll(res.Body)

	fmt.Println(string(body))

}
```

```
HttpResponse<String> response = Unirest.post("https://public-api.sessionboard.com/v1/event/{eventId}/contacts/{contactId}/restore")
  .header("x-access-token", "<api-key>")
  .asString();
```

```
require 'uri'
require 'net/http'

url = URI("https://public-api.sessionboard.com/v1/event/{eventId}/contacts/{contactId}/restore")

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
  "full_name": "<string>",
  "first_name": "<string>",
  "last_name": "<string>",
  "email": "<string>",
  "created_at": "<string>",
  "updated_at": "<string>",
  "photo_url": "<string>",
  "company_name": "<string>",
  "title": "<string>",
  "about": "<string>",
  "phone_home": "<string>",
  "phone_mobile": "<string>",
  "address_line_1": "<string>",
  "address_line_2": "<string>",
  "address_city": "<string>",
  "address_state": "<string>",
  "address_postal_code": "<string>",
  "address_country": "<string>",
  "website_url": "<string>",
  "linkedin_url": "<string>",
  "twitter_url": "<string>",
  "facebook_url": "<string>",
  "honorific": "<string>",
  "salutation": "<string>",
  "pronouns": "<string>",
  "gender": "<string>",
  "past_companies": "<string>",
  "educational_affiliation": "<string>",
  "highest_level_of_education": "<string>",
  "ethnicity": "<string>",
  "languages": "<string>",
  "speaker_score": "<string>",
  "organization_contact": "<string>",
  "speaker_fee": "<string>",
  "availability": "<string>",
  "preferred_session_format": "<string>",
  "annual_revenue": "<string>",
  "headcount": "<string>",
  "years_in_operation": "<string>",
  "organization_structure": "<string>",
  "industry": "<string>",
  "global_region": "<string>",
  "audience_type": "<string>",
  "target_age_range": "<string>",
  "topic_expertise": "<string>",
  "brand": "<string>",
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

contacts

/

{contactId}

/

restore

Try it

Restore a deleted contact

cURL

```
curl --request POST \
  --url https://public-api.sessionboard.com/v1/event/{eventId}/contacts/{contactId}/restore \
  --header 'x-access-token: <api-key>'
```

```
import requests

url = "https://public-api.sessionboard.com/v1/event/{eventId}/contacts/{contactId}/restore"

headers = {"x-access-token": "<api-key>"}

response = requests.post(url, headers=headers)

print(response.text)
```

```
const options = {method: 'POST', headers: {'x-access-token': '<api-key>'}};

fetch('https://public-api.sessionboard.com/v1/event/{eventId}/contacts/{contactId}/restore', options)
  .then(res => res.json())
  .then(res => console.log(res))
  .catch(err => console.error(err));
```

```
<?php

$curl = curl_init();

curl_setopt_array($curl, [\
  CURLOPT_URL => "https://public-api.sessionboard.com/v1/event/{eventId}/contacts/{contactId}/restore",\
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

	url := "https://public-api.sessionboard.com/v1/event/{eventId}/contacts/{contactId}/restore"

	req, _ := http.NewRequest("POST", url, nil)

	req.Header.Add("x-access-token", "<api-key>")

	res, _ := http.DefaultClient.Do(req)

	defer res.Body.Close()
	body, _ := io.ReadAll(res.Body)

	fmt.Println(string(body))

}
```

```
HttpResponse<String> response = Unirest.post("https://public-api.sessionboard.com/v1/event/{eventId}/contacts/{contactId}/restore")
  .header("x-access-token", "<api-key>")
  .asString();
```

```
require 'uri'
require 'net/http'

url = URI("https://public-api.sessionboard.com/v1/event/{eventId}/contacts/{contactId}/restore")

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
  "full_name": "<string>",
  "first_name": "<string>",
  "last_name": "<string>",
  "email": "<string>",
  "created_at": "<string>",
  "updated_at": "<string>",
  "photo_url": "<string>",
  "company_name": "<string>",
  "title": "<string>",
  "about": "<string>",
  "phone_home": "<string>",
  "phone_mobile": "<string>",
  "address_line_1": "<string>",
  "address_line_2": "<string>",
  "address_city": "<string>",
  "address_state": "<string>",
  "address_postal_code": "<string>",
  "address_country": "<string>",
  "website_url": "<string>",
  "linkedin_url": "<string>",
  "twitter_url": "<string>",
  "facebook_url": "<string>",
  "honorific": "<string>",
  "salutation": "<string>",
  "pronouns": "<string>",
  "gender": "<string>",
  "past_companies": "<string>",
  "educational_affiliation": "<string>",
  "highest_level_of_education": "<string>",
  "ethnicity": "<string>",
  "languages": "<string>",
  "speaker_score": "<string>",
  "organization_contact": "<string>",
  "speaker_fee": "<string>",
  "availability": "<string>",
  "preferred_session_format": "<string>",
  "annual_revenue": "<string>",
  "headcount": "<string>",
  "years_in_operation": "<string>",
  "organization_structure": "<string>",
  "industry": "<string>",
  "global_region": "<string>",
  "audience_type": "<string>",
  "target_age_range": "<string>",
  "topic_expertise": "<string>",
  "brand": "<string>",
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
  "admin_url": "<string>"
}
```

#### Authorizations

ApiKeyBearerTokenApiKeyBearerToken

[​](https://apidocs.sessionboard.com/api-reference/contact-writes/restore-a-deleted-contact#authorization-x-access-token)

x-access-token

string

header

required

Organization API token. Generate from Organization Settings → API Tokens.

#### Path Parameters

[​](https://apidocs.sessionboard.com/api-reference/contact-writes/restore-a-deleted-contact#parameter-event-id)

eventId

integer

required

The event ID.

[​](https://apidocs.sessionboard.com/api-reference/contact-writes/restore-a-deleted-contact#parameter-contact-id)

contactId

string

required

The contact ID.

#### Response

200

application/json

Contact restored

A contact (speaker, attendee, or organizational contact) in Sessionboard.

[​](https://apidocs.sessionboard.com/api-reference/contact-writes/restore-a-deleted-contact#response-id)

id

string

[​](https://apidocs.sessionboard.com/api-reference/contact-writes/restore-a-deleted-contact#response-friendly-id)

friendly\_id

string

[​](https://apidocs.sessionboard.com/api-reference/contact-writes/restore-a-deleted-contact#response-full-name)

full\_name

string

[​](https://apidocs.sessionboard.com/api-reference/contact-writes/restore-a-deleted-contact#response-first-name)

first\_name

string

[​](https://apidocs.sessionboard.com/api-reference/contact-writes/restore-a-deleted-contact#response-last-name)

last\_name

string

[​](https://apidocs.sessionboard.com/api-reference/contact-writes/restore-a-deleted-contact#response-email)

email

string

[​](https://apidocs.sessionboard.com/api-reference/contact-writes/restore-a-deleted-contact#response-created-at)

created\_at

string

[​](https://apidocs.sessionboard.com/api-reference/contact-writes/restore-a-deleted-contact#response-updated-at)

updated\_at

string

[​](https://apidocs.sessionboard.com/api-reference/contact-writes/restore-a-deleted-contact#response-photo-url)

photo\_url

string

[​](https://apidocs.sessionboard.com/api-reference/contact-writes/restore-a-deleted-contact#response-company-name)

company\_name

string

[​](https://apidocs.sessionboard.com/api-reference/contact-writes/restore-a-deleted-contact#response-title)

title

string

[​](https://apidocs.sessionboard.com/api-reference/contact-writes/restore-a-deleted-contact#response-about)

about

string

[​](https://apidocs.sessionboard.com/api-reference/contact-writes/restore-a-deleted-contact#response-phone-home)

phone\_home

string

[​](https://apidocs.sessionboard.com/api-reference/contact-writes/restore-a-deleted-contact#response-phone-mobile)

phone\_mobile

string

[​](https://apidocs.sessionboard.com/api-reference/contact-writes/restore-a-deleted-contact#response-address-line-1)

address\_line\_1

string

[​](https://apidocs.sessionboard.com/api-reference/contact-writes/restore-a-deleted-contact#response-address-line-2)

address\_line\_2

string

[​](https://apidocs.sessionboard.com/api-reference/contact-writes/restore-a-deleted-contact#response-address-city)

address\_city

string

[​](https://apidocs.sessionboard.com/api-reference/contact-writes/restore-a-deleted-contact#response-address-state)

address\_state

string

[​](https://apidocs.sessionboard.com/api-reference/contact-writes/restore-a-deleted-contact#response-address-postal-code)

address\_postal\_code

string

[​](https://apidocs.sessionboard.com/api-reference/contact-writes/restore-a-deleted-contact#response-address-country)

address\_country

string

[​](https://apidocs.sessionboard.com/api-reference/contact-writes/restore-a-deleted-contact#response-website-url)

website\_url

string

[​](https://apidocs.sessionboard.com/api-reference/contact-writes/restore-a-deleted-contact#response-linkedin-url)

linkedin\_url

string

[​](https://apidocs.sessionboard.com/api-reference/contact-writes/restore-a-deleted-contact#response-twitter-url)

twitter\_url

string

[​](https://apidocs.sessionboard.com/api-reference/contact-writes/restore-a-deleted-contact#response-facebook-url)

facebook\_url

string

[​](https://apidocs.sessionboard.com/api-reference/contact-writes/restore-a-deleted-contact#response-honorific)

honorific

string

[​](https://apidocs.sessionboard.com/api-reference/contact-writes/restore-a-deleted-contact#response-salutation)

salutation

string

[​](https://apidocs.sessionboard.com/api-reference/contact-writes/restore-a-deleted-contact#response-pronouns)

pronouns

string

[​](https://apidocs.sessionboard.com/api-reference/contact-writes/restore-a-deleted-contact#response-gender)

gender

string

[​](https://apidocs.sessionboard.com/api-reference/contact-writes/restore-a-deleted-contact#response-past-companies)

past\_companies

string

[​](https://apidocs.sessionboard.com/api-reference/contact-writes/restore-a-deleted-contact#response-educational-affiliation)

educational\_affiliation

string

[​](https://apidocs.sessionboard.com/api-reference/contact-writes/restore-a-deleted-contact#response-highest-level-of-education)

highest\_level\_of\_education

string

[​](https://apidocs.sessionboard.com/api-reference/contact-writes/restore-a-deleted-contact#response-ethnicity)

ethnicity

string

[​](https://apidocs.sessionboard.com/api-reference/contact-writes/restore-a-deleted-contact#response-languages)

languages

string

[​](https://apidocs.sessionboard.com/api-reference/contact-writes/restore-a-deleted-contact#response-speaker-score)

speaker\_score

string

[​](https://apidocs.sessionboard.com/api-reference/contact-writes/restore-a-deleted-contact#response-organization-contact)

organization\_contact

string

[​](https://apidocs.sessionboard.com/api-reference/contact-writes/restore-a-deleted-contact#response-speaker-fee)

speaker\_fee

string

[​](https://apidocs.sessionboard.com/api-reference/contact-writes/restore-a-deleted-contact#response-availability)

availability

string

[​](https://apidocs.sessionboard.com/api-reference/contact-writes/restore-a-deleted-contact#response-preferred-session-format)

preferred\_session\_format

string

[​](https://apidocs.sessionboard.com/api-reference/contact-writes/restore-a-deleted-contact#response-annual-revenue)

annual\_revenue

string

[​](https://apidocs.sessionboard.com/api-reference/contact-writes/restore-a-deleted-contact#response-headcount)

headcount

string

[​](https://apidocs.sessionboard.com/api-reference/contact-writes/restore-a-deleted-contact#response-years-in-operation)

years\_in\_operation

string

[​](https://apidocs.sessionboard.com/api-reference/contact-writes/restore-a-deleted-contact#response-organization-structure)

organization\_structure

string

[​](https://apidocs.sessionboard.com/api-reference/contact-writes/restore-a-deleted-contact#response-industry)

industry

string

[​](https://apidocs.sessionboard.com/api-reference/contact-writes/restore-a-deleted-contact#response-global-region)

global\_region

string

[​](https://apidocs.sessionboard.com/api-reference/contact-writes/restore-a-deleted-contact#response-audience-type)

audience\_type

string

[​](https://apidocs.sessionboard.com/api-reference/contact-writes/restore-a-deleted-contact#response-target-age-range)

target\_age\_range

string

[​](https://apidocs.sessionboard.com/api-reference/contact-writes/restore-a-deleted-contact#response-topic-expertise)

topic\_expertise

string

[​](https://apidocs.sessionboard.com/api-reference/contact-writes/restore-a-deleted-contact#response-brand)

brand

string

[​](https://apidocs.sessionboard.com/api-reference/contact-writes/restore-a-deleted-contact#response-translated-fields)

translated\_fields

object\[\]

Showchild attributes

[​](https://apidocs.sessionboard.com/api-reference/contact-writes/restore-a-deleted-contact#response-custom-fields)

custom\_fields

object\[\]

Showchild attributes

[​](https://apidocs.sessionboard.com/api-reference/contact-writes/restore-a-deleted-contact#response-admin-url-one-of-0)

admin\_url

string<uri> \| null

Deep link to this entity in the Sessionboard admin UI.

Ctrl+I