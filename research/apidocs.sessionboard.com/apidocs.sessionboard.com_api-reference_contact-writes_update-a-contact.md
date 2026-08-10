---
url: "https://apidocs.sessionboard.com/api-reference/contact-writes/update-a-contact"
title: "Update a contact - Sessionboard API"
---

> ## Documentation Index
>
> Fetch the complete documentation index at: [/llms.txt](https://apidocs.sessionboard.com/llms.txt)
>
> Use this file to discover all available pages before exploring further.

[Skip to main content](https://apidocs.sessionboard.com/api-reference/contact-writes/update-a-contact#content-area)

Update a contact

cURL

```
curl --request PUT \
  --url https://public-api.sessionboard.com/v1/event/{eventId}/contacts/{contactId} \
  --header 'Content-Type: application/json' \
  --header 'x-access-token: <api-key>' \
  --data '
{
  "updated_at": "2023-11-07T05:31:56Z",
  "first_name": "<string>",
  "last_name": "<string>",
  "email": "jsmith@example.com",
  "company": "<string>",
  "title": "<string>",
  "phone": "<string>",
  "custom_fields": {}
}
'
```

```
import requests

url = "https://public-api.sessionboard.com/v1/event/{eventId}/contacts/{contactId}"

payload = {
    "updated_at": "2023-11-07T05:31:56Z",
    "first_name": "<string>",
    "last_name": "<string>",
    "email": "jsmith@example.com",
    "company": "<string>",
    "title": "<string>",
    "phone": "<string>",
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
  body: JSON.stringify({
    updated_at: '2023-11-07T05:31:56Z',
    first_name: '<string>',
    last_name: '<string>',
    email: 'jsmith@example.com',
    company: '<string>',
    title: '<string>',
    phone: '<string>',
    custom_fields: {}
  })
};

fetch('https://public-api.sessionboard.com/v1/event/{eventId}/contacts/{contactId}', options)
  .then(res => res.json())
  .then(res => console.log(res))
  .catch(err => console.error(err));
```

```
<?php

$curl = curl_init();

curl_setopt_array($curl, [\
  CURLOPT_URL => "https://public-api.sessionboard.com/v1/event/{eventId}/contacts/{contactId}",\
  CURLOPT_RETURNTRANSFER => true,\
  CURLOPT_ENCODING => "",\
  CURLOPT_MAXREDIRS => 10,\
  CURLOPT_TIMEOUT => 30,\
  CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,\
  CURLOPT_CUSTOMREQUEST => "PUT",\
  CURLOPT_POSTFIELDS => json_encode([\
    'updated_at' => '2023-11-07T05:31:56Z',\
    'first_name' => '<string>',\
    'last_name' => '<string>',\
    'email' => 'jsmith@example.com',\
    'company' => '<string>',\
    'title' => '<string>',\
    'phone' => '<string>',\
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

	url := "https://public-api.sessionboard.com/v1/event/{eventId}/contacts/{contactId}"

	payload := strings.NewReader("{\n  \"updated_at\": \"2023-11-07T05:31:56Z\",\n  \"first_name\": \"<string>\",\n  \"last_name\": \"<string>\",\n  \"email\": \"jsmith@example.com\",\n  \"company\": \"<string>\",\n  \"title\": \"<string>\",\n  \"phone\": \"<string>\",\n  \"custom_fields\": {}\n}")

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
HttpResponse<String> response = Unirest.put("https://public-api.sessionboard.com/v1/event/{eventId}/contacts/{contactId}")
  .header("x-access-token", "<api-key>")
  .header("Content-Type", "application/json")
  .body("{\n  \"updated_at\": \"2023-11-07T05:31:56Z\",\n  \"first_name\": \"<string>\",\n  \"last_name\": \"<string>\",\n  \"email\": \"jsmith@example.com\",\n  \"company\": \"<string>\",\n  \"title\": \"<string>\",\n  \"phone\": \"<string>\",\n  \"custom_fields\": {}\n}")
  .asString();
```

```
require 'uri'
require 'net/http'

url = URI("https://public-api.sessionboard.com/v1/event/{eventId}/contacts/{contactId}")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true

request = Net::HTTP::Put.new(url)
request["x-access-token"] = '<api-key>'
request["Content-Type"] = 'application/json'
request.body = "{\n  \"updated_at\": \"2023-11-07T05:31:56Z\",\n  \"first_name\": \"<string>\",\n  \"last_name\": \"<string>\",\n  \"email\": \"jsmith@example.com\",\n  \"company\": \"<string>\",\n  \"title\": \"<string>\",\n  \"phone\": \"<string>\",\n  \"custom_fields\": {}\n}"

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

PUT

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

Try it

Update a contact

cURL

```
curl --request PUT \
  --url https://public-api.sessionboard.com/v1/event/{eventId}/contacts/{contactId} \
  --header 'Content-Type: application/json' \
  --header 'x-access-token: <api-key>' \
  --data '
{
  "updated_at": "2023-11-07T05:31:56Z",
  "first_name": "<string>",
  "last_name": "<string>",
  "email": "jsmith@example.com",
  "company": "<string>",
  "title": "<string>",
  "phone": "<string>",
  "custom_fields": {}
}
'
```

```
import requests

url = "https://public-api.sessionboard.com/v1/event/{eventId}/contacts/{contactId}"

payload = {
    "updated_at": "2023-11-07T05:31:56Z",
    "first_name": "<string>",
    "last_name": "<string>",
    "email": "jsmith@example.com",
    "company": "<string>",
    "title": "<string>",
    "phone": "<string>",
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
  body: JSON.stringify({
    updated_at: '2023-11-07T05:31:56Z',
    first_name: '<string>',
    last_name: '<string>',
    email: 'jsmith@example.com',
    company: '<string>',
    title: '<string>',
    phone: '<string>',
    custom_fields: {}
  })
};

fetch('https://public-api.sessionboard.com/v1/event/{eventId}/contacts/{contactId}', options)
  .then(res => res.json())
  .then(res => console.log(res))
  .catch(err => console.error(err));
```

```
<?php

$curl = curl_init();

curl_setopt_array($curl, [\
  CURLOPT_URL => "https://public-api.sessionboard.com/v1/event/{eventId}/contacts/{contactId}",\
  CURLOPT_RETURNTRANSFER => true,\
  CURLOPT_ENCODING => "",\
  CURLOPT_MAXREDIRS => 10,\
  CURLOPT_TIMEOUT => 30,\
  CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,\
  CURLOPT_CUSTOMREQUEST => "PUT",\
  CURLOPT_POSTFIELDS => json_encode([\
    'updated_at' => '2023-11-07T05:31:56Z',\
    'first_name' => '<string>',\
    'last_name' => '<string>',\
    'email' => 'jsmith@example.com',\
    'company' => '<string>',\
    'title' => '<string>',\
    'phone' => '<string>',\
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

	url := "https://public-api.sessionboard.com/v1/event/{eventId}/contacts/{contactId}"

	payload := strings.NewReader("{\n  \"updated_at\": \"2023-11-07T05:31:56Z\",\n  \"first_name\": \"<string>\",\n  \"last_name\": \"<string>\",\n  \"email\": \"jsmith@example.com\",\n  \"company\": \"<string>\",\n  \"title\": \"<string>\",\n  \"phone\": \"<string>\",\n  \"custom_fields\": {}\n}")

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
HttpResponse<String> response = Unirest.put("https://public-api.sessionboard.com/v1/event/{eventId}/contacts/{contactId}")
  .header("x-access-token", "<api-key>")
  .header("Content-Type", "application/json")
  .body("{\n  \"updated_at\": \"2023-11-07T05:31:56Z\",\n  \"first_name\": \"<string>\",\n  \"last_name\": \"<string>\",\n  \"email\": \"jsmith@example.com\",\n  \"company\": \"<string>\",\n  \"title\": \"<string>\",\n  \"phone\": \"<string>\",\n  \"custom_fields\": {}\n}")
  .asString();
```

```
require 'uri'
require 'net/http'

url = URI("https://public-api.sessionboard.com/v1/event/{eventId}/contacts/{contactId}")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true

request = Net::HTTP::Put.new(url)
request["x-access-token"] = '<api-key>'
request["Content-Type"] = 'application/json'
request.body = "{\n  \"updated_at\": \"2023-11-07T05:31:56Z\",\n  \"first_name\": \"<string>\",\n  \"last_name\": \"<string>\",\n  \"email\": \"jsmith@example.com\",\n  \"company\": \"<string>\",\n  \"title\": \"<string>\",\n  \"phone\": \"<string>\",\n  \"custom_fields\": {}\n}"

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

[​](https://apidocs.sessionboard.com/api-reference/contact-writes/update-a-contact#authorization-x-access-token)

x-access-token

string

header

required

Organization API token. Generate from Organization Settings → API Tokens.

#### Path Parameters

[​](https://apidocs.sessionboard.com/api-reference/contact-writes/update-a-contact#parameter-event-id)

eventId

integer

required

The event ID.

[​](https://apidocs.sessionboard.com/api-reference/contact-writes/update-a-contact#parameter-contact-id)

contactId

string

required

The contact ID.

#### Body

application/json

[​](https://apidocs.sessionboard.com/api-reference/contact-writes/update-a-contact#body-updated-at)

updated\_at

string<date-time>

Optional optimistic concurrency control. Send the `updated_at` value from the last-fetched contact.

[​](https://apidocs.sessionboard.com/api-reference/contact-writes/update-a-contact#body-first-name)

first\_name

string

[​](https://apidocs.sessionboard.com/api-reference/contact-writes/update-a-contact#body-last-name)

last\_name

string

[​](https://apidocs.sessionboard.com/api-reference/contact-writes/update-a-contact#body-email)

email

string<email>

[​](https://apidocs.sessionboard.com/api-reference/contact-writes/update-a-contact#body-company)

company

string

[​](https://apidocs.sessionboard.com/api-reference/contact-writes/update-a-contact#body-title)

title

string

[​](https://apidocs.sessionboard.com/api-reference/contact-writes/update-a-contact#body-phone)

phone

string

[​](https://apidocs.sessionboard.com/api-reference/contact-writes/update-a-contact#body-custom-fields)

custom\_fields

object

Custom field values keyed by field internal name.

#### Response

200

application/json

Contact updated

A contact (speaker, attendee, or organizational contact) in Sessionboard.

[​](https://apidocs.sessionboard.com/api-reference/contact-writes/update-a-contact#response-id)

id

string

[​](https://apidocs.sessionboard.com/api-reference/contact-writes/update-a-contact#response-friendly-id)

friendly\_id

string

[​](https://apidocs.sessionboard.com/api-reference/contact-writes/update-a-contact#response-full-name)

full\_name

string

[​](https://apidocs.sessionboard.com/api-reference/contact-writes/update-a-contact#response-first-name)

first\_name

string

[​](https://apidocs.sessionboard.com/api-reference/contact-writes/update-a-contact#response-last-name)

last\_name

string

[​](https://apidocs.sessionboard.com/api-reference/contact-writes/update-a-contact#response-email)

email

string

[​](https://apidocs.sessionboard.com/api-reference/contact-writes/update-a-contact#response-created-at)

created\_at

string

[​](https://apidocs.sessionboard.com/api-reference/contact-writes/update-a-contact#response-updated-at)

updated\_at

string

[​](https://apidocs.sessionboard.com/api-reference/contact-writes/update-a-contact#response-photo-url)

photo\_url

string

[​](https://apidocs.sessionboard.com/api-reference/contact-writes/update-a-contact#response-company-name)

company\_name

string

[​](https://apidocs.sessionboard.com/api-reference/contact-writes/update-a-contact#response-title)

title

string

[​](https://apidocs.sessionboard.com/api-reference/contact-writes/update-a-contact#response-about)

about

string

[​](https://apidocs.sessionboard.com/api-reference/contact-writes/update-a-contact#response-phone-home)

phone\_home

string

[​](https://apidocs.sessionboard.com/api-reference/contact-writes/update-a-contact#response-phone-mobile)

phone\_mobile

string

[​](https://apidocs.sessionboard.com/api-reference/contact-writes/update-a-contact#response-address-line-1)

address\_line\_1

string

[​](https://apidocs.sessionboard.com/api-reference/contact-writes/update-a-contact#response-address-line-2)

address\_line\_2

string

[​](https://apidocs.sessionboard.com/api-reference/contact-writes/update-a-contact#response-address-city)

address\_city

string

[​](https://apidocs.sessionboard.com/api-reference/contact-writes/update-a-contact#response-address-state)

address\_state

string

[​](https://apidocs.sessionboard.com/api-reference/contact-writes/update-a-contact#response-address-postal-code)

address\_postal\_code

string

[​](https://apidocs.sessionboard.com/api-reference/contact-writes/update-a-contact#response-address-country)

address\_country

string

[​](https://apidocs.sessionboard.com/api-reference/contact-writes/update-a-contact#response-website-url)

website\_url

string

[​](https://apidocs.sessionboard.com/api-reference/contact-writes/update-a-contact#response-linkedin-url)

linkedin\_url

string

[​](https://apidocs.sessionboard.com/api-reference/contact-writes/update-a-contact#response-twitter-url)

twitter\_url

string

[​](https://apidocs.sessionboard.com/api-reference/contact-writes/update-a-contact#response-facebook-url)

facebook\_url

string

[​](https://apidocs.sessionboard.com/api-reference/contact-writes/update-a-contact#response-honorific)

honorific

string

[​](https://apidocs.sessionboard.com/api-reference/contact-writes/update-a-contact#response-salutation)

salutation

string

[​](https://apidocs.sessionboard.com/api-reference/contact-writes/update-a-contact#response-pronouns)

pronouns

string

[​](https://apidocs.sessionboard.com/api-reference/contact-writes/update-a-contact#response-gender)

gender

string

[​](https://apidocs.sessionboard.com/api-reference/contact-writes/update-a-contact#response-past-companies)

past\_companies

string

[​](https://apidocs.sessionboard.com/api-reference/contact-writes/update-a-contact#response-educational-affiliation)

educational\_affiliation

string

[​](https://apidocs.sessionboard.com/api-reference/contact-writes/update-a-contact#response-highest-level-of-education)

highest\_level\_of\_education

string

[​](https://apidocs.sessionboard.com/api-reference/contact-writes/update-a-contact#response-ethnicity)

ethnicity

string

[​](https://apidocs.sessionboard.com/api-reference/contact-writes/update-a-contact#response-languages)

languages

string

[​](https://apidocs.sessionboard.com/api-reference/contact-writes/update-a-contact#response-speaker-score)

speaker\_score

string

[​](https://apidocs.sessionboard.com/api-reference/contact-writes/update-a-contact#response-organization-contact)

organization\_contact

string

[​](https://apidocs.sessionboard.com/api-reference/contact-writes/update-a-contact#response-speaker-fee)

speaker\_fee

string

[​](https://apidocs.sessionboard.com/api-reference/contact-writes/update-a-contact#response-availability)

availability

string

[​](https://apidocs.sessionboard.com/api-reference/contact-writes/update-a-contact#response-preferred-session-format)

preferred\_session\_format

string

[​](https://apidocs.sessionboard.com/api-reference/contact-writes/update-a-contact#response-annual-revenue)

annual\_revenue

string

[​](https://apidocs.sessionboard.com/api-reference/contact-writes/update-a-contact#response-headcount)

headcount

string

[​](https://apidocs.sessionboard.com/api-reference/contact-writes/update-a-contact#response-years-in-operation)

years\_in\_operation

string

[​](https://apidocs.sessionboard.com/api-reference/contact-writes/update-a-contact#response-organization-structure)

organization\_structure

string

[​](https://apidocs.sessionboard.com/api-reference/contact-writes/update-a-contact#response-industry)

industry

string

[​](https://apidocs.sessionboard.com/api-reference/contact-writes/update-a-contact#response-global-region)

global\_region

string

[​](https://apidocs.sessionboard.com/api-reference/contact-writes/update-a-contact#response-audience-type)

audience\_type

string

[​](https://apidocs.sessionboard.com/api-reference/contact-writes/update-a-contact#response-target-age-range)

target\_age\_range

string

[​](https://apidocs.sessionboard.com/api-reference/contact-writes/update-a-contact#response-topic-expertise)

topic\_expertise

string

[​](https://apidocs.sessionboard.com/api-reference/contact-writes/update-a-contact#response-brand)

brand

string

[​](https://apidocs.sessionboard.com/api-reference/contact-writes/update-a-contact#response-translated-fields)

translated\_fields

object\[\]

Showchild attributes

[​](https://apidocs.sessionboard.com/api-reference/contact-writes/update-a-contact#response-custom-fields)

custom\_fields

object\[\]

Showchild attributes

[​](https://apidocs.sessionboard.com/api-reference/contact-writes/update-a-contact#response-admin-url-one-of-0)

admin\_url

string<uri> \| null

Deep link to this entity in the Sessionboard admin UI.

Ctrl+I