---
url: "https://apidocs.sessionboard.com/api-reference/sessions/list-sessions-crud-proxy"
title: "List sessions (CRUD proxy) - Sessionboard API"
---

> ## Documentation Index
>
> Fetch the complete documentation index at: [/llms.txt](https://apidocs.sessionboard.com/llms.txt)
>
> Use this file to discover all available pages before exploring further.

[Skip to main content](https://apidocs.sessionboard.com/api-reference/sessions/list-sessions-crud-proxy#content-area)

List sessions (CRUD proxy)

cURL

```
curl --request GET \
  --url 'https://public-api.sessionboard.com/v1/event/{eventId}/sessions?page=1&page_size=25' \
  --header 'x-access-token: <api-key>'
```

```
import requests

url = "https://public-api.sessionboard.com/v1/event/{eventId}/sessions?page=1&page_size=25"

headers = {"x-access-token": "<api-key>"}

response = requests.get(url, headers=headers)

print(response.text)
```

```
const options = {method: 'GET', headers: {'x-access-token': '<api-key>'}};

fetch('https://public-api.sessionboard.com/v1/event/{eventId}/sessions?page=1&page_size=25', options)
  .then(res => res.json())
  .then(res => console.log(res))
  .catch(err => console.error(err));
```

```
<?php

$curl = curl_init();

curl_setopt_array($curl, [\
  CURLOPT_URL => "https://public-api.sessionboard.com/v1/event/{eventId}/sessions?page=1&page_size=25",\
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

	url := "https://public-api.sessionboard.com/v1/event/{eventId}/sessions?page=1&page_size=25"

	req, _ := http.NewRequest("GET", url, nil)

	req.Header.Add("x-access-token", "<api-key>")

	res, _ := http.DefaultClient.Do(req)

	defer res.Body.Close()
	body, _ := io.ReadAll(res.Body)

	fmt.Println(string(body))

}
```

```
HttpResponse<String> response = Unirest.get("https://public-api.sessionboard.com/v1/event/{eventId}/sessions?page=1&page_size=25")
  .header("x-access-token", "<api-key>")
  .asString();
```

```
require 'uri'
require 'net/http'

url = URI("https://public-api.sessionboard.com/v1/event/{eventId}/sessions?page=1&page_size=25")

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
  "data": [\
    {\
      "id": "3c90c3cc-0d44-4b50-8888-8dd25736052a",\
      "friendly_id": "<string>",\
      "friendly_id_raw": 123,\
      "title": "<string>",\
      "description": "<string>",\
      "custom_status_id": "<string>",\
      "custom_status": {\
        "id": "<string>",\
        "name": "<string>"\
      },\
      "starts_at": "2023-11-07T05:31:56Z",\
      "ends_at": "2023-11-07T05:31:56Z",\
      "is_public": true,\
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
      },\
      "composition": {\
        "target": {\
          "id": "3c90c3cc-0d44-4b50-8888-8dd25736052a",\
          "friendly_id": "<string>",\
          "title": "<string>",\
          "is_abstract": true\
        },\
        "sources": [\
          {\
            "composition_id": "3c90c3cc-0d44-4b50-8888-8dd25736052a",\
            "created_at": "2023-11-07T05:31:56Z",\
            "id": "3c90c3cc-0d44-4b50-8888-8dd25736052a",\
            "friendly_id": "<string>",\
            "title": "<string>",\
            "is_abstract": true\
          }\
        ]\
      },\
      "external_url": "<string>",\
      "client_session_id": "<string>",\
      "created_at": "2023-11-07T05:31:56Z",\
      "updated_at": "2023-11-07T05:31:56Z",\
      "ceu_credits": 123,\
      "capacity": 123,\
      "custom_fields": [\
        {\
          "id": "<string>",\
          "name": "<string>",\
          "value": "<string>",\
          "type": "<string>",\
          "internal_name": "<string>",\
          "created_at": "<string>"\
        }\
      ],\
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
      ],\
      "speakers": [\
        {\
          "id": "<string>",\
          "participant_role": {\
            "id": "3c90c3cc-0d44-4b50-8888-8dd25736052a",\
            "slug": "<string>",\
            "name": "<string>",\
            "name_plural": "<string>"\
          },\
          "friendly_id": "<string>",\
          "full_name": "<string>",\
          "first_name": "<string>",\
          "last_name": "<string>",\
          "email": "<string>",\
          "created_at": "<string>",\
          "updated_at": "<string>",\
          "photo_url": "<string>",\
          "company_name": "<string>",\
          "title": "<string>",\
          "about": "<string>",\
          "phone_home": "<string>",\
          "phone_mobile": "<string>",\
          "address_line_1": "<string>",\
          "address_line_2": "<string>",\
          "address_city": "<string>",\
          "address_state": "<string>",\
          "address_postal_code": "<string>",\
          "address_country": "<string>",\
          "website_url": "<string>",\
          "linkedin_url": "<string>",\
          "twitter_url": "<string>",\
          "facebook_url": "<string>",\
          "instagram_url": "<string>",\
          "snapchat_username": "<string>",\
          "tiktok_username": "<string>",\
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
          ],\
          "custom_fields": [\
            {\
              "id": "<string>",\
              "name": "<string>",\
              "value": "<string>",\
              "type": "<string>",\
              "internal_name": "<string>",\
              "created_at": "<string>"\
            }\
          ]\
        }\
      ],\
      "chairpersons": [\
        {\
          "id": "<string>",\
          "participant_role": {\
            "id": "3c90c3cc-0d44-4b50-8888-8dd25736052a",\
            "slug": "<string>",\
            "name": "<string>",\
            "name_plural": "<string>"\
          },\
          "friendly_id": "<string>",\
          "full_name": "<string>",\
          "first_name": "<string>",\
          "last_name": "<string>",\
          "email": "<string>",\
          "created_at": "<string>",\
          "updated_at": "<string>",\
          "photo_url": "<string>",\
          "company_name": "<string>",\
          "title": "<string>",\
          "about": "<string>",\
          "phone_home": "<string>",\
          "phone_mobile": "<string>",\
          "address_line_1": "<string>",\
          "address_line_2": "<string>",\
          "address_city": "<string>",\
          "address_state": "<string>",\
          "address_postal_code": "<string>",\
          "address_country": "<string>",\
          "website_url": "<string>",\
          "linkedin_url": "<string>",\
          "twitter_url": "<string>",\
          "facebook_url": "<string>",\
          "instagram_url": "<string>",\
          "snapchat_username": "<string>",\
          "tiktok_username": "<string>",\
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
          ],\
          "custom_fields": [\
            {\
              "id": "<string>",\
              "name": "<string>",\
              "value": "<string>",\
              "type": "<string>",\
              "internal_name": "<string>",\
              "created_at": "<string>"\
            }\
          ]\
        }\
      ],\
      "moderators": [\
        {\
          "id": "<string>",\
          "participant_role": {\
            "id": "3c90c3cc-0d44-4b50-8888-8dd25736052a",\
            "slug": "<string>",\
            "name": "<string>",\
            "name_plural": "<string>"\
          },\
          "friendly_id": "<string>",\
          "full_name": "<string>",\
          "first_name": "<string>",\
          "last_name": "<string>",\
          "email": "<string>",\
          "created_at": "<string>",\
          "updated_at": "<string>",\
          "photo_url": "<string>",\
          "company_name": "<string>",\
          "title": "<string>",\
          "about": "<string>",\
          "phone_home": "<string>",\
          "phone_mobile": "<string>",\
          "address_line_1": "<string>",\
          "address_line_2": "<string>",\
          "address_city": "<string>",\
          "address_state": "<string>",\
          "address_postal_code": "<string>",\
          "address_country": "<string>",\
          "website_url": "<string>",\
          "linkedin_url": "<string>",\
          "twitter_url": "<string>",\
          "facebook_url": "<string>",\
          "instagram_url": "<string>",\
          "snapchat_username": "<string>",\
          "tiktok_username": "<string>",\
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
          ],\
          "custom_fields": [\
            {\
              "id": "<string>",\
              "name": "<string>",\
              "value": "<string>",\
              "type": "<string>",\
              "internal_name": "<string>",\
              "created_at": "<string>"\
            }\
          ]\
        }\
      ],\
      "participants": [\
        {\
          "id": "<string>",\
          "participant_role": {\
            "id": "3c90c3cc-0d44-4b50-8888-8dd25736052a",\
            "slug": "<string>",\
            "name": "<string>",\
            "name_plural": "<string>"\
          },\
          "friendly_id": "<string>",\
          "full_name": "<string>",\
          "first_name": "<string>",\
          "last_name": "<string>",\
          "email": "<string>",\
          "created_at": "<string>",\
          "updated_at": "<string>",\
          "photo_url": "<string>",\
          "company_name": "<string>",\
          "title": "<string>",\
          "about": "<string>",\
          "phone_home": "<string>",\
          "phone_mobile": "<string>",\
          "address_line_1": "<string>",\
          "address_line_2": "<string>",\
          "address_city": "<string>",\
          "address_state": "<string>",\
          "address_postal_code": "<string>",\
          "address_country": "<string>",\
          "website_url": "<string>",\
          "linkedin_url": "<string>",\
          "twitter_url": "<string>",\
          "facebook_url": "<string>",\
          "instagram_url": "<string>",\
          "snapchat_username": "<string>",\
          "tiktok_username": "<string>",\
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
          ],\
          "custom_fields": [\
            {\
              "id": "<string>",\
              "name": "<string>",\
              "value": "<string>",\
              "type": "<string>",\
              "internal_name": "<string>",\
              "created_at": "<string>"\
            }\
          ],\
          "session_participant_id": "3c90c3cc-0d44-4b50-8888-8dd25736052a"\
        }\
      ],\
      "sponsors": [\
        {\
          "id": "<string>",\
          "friendly_id": "<string>",\
          "friendly_id_raw": 123,\
          "name": "<string>",\
          "description": "<string>",\
          "logo_image_url": "<string>",\
          "banner_image_url": "<string>",\
          "phone": "<string>",\
          "address_line_1": "<string>",\
          "address_line_2": "<string>",\
          "address_city": "<string>",\
          "address_state": "<string>",\
          "address_postal_code": "<string>",\
          "address_coutnry": "<string>",\
          "facebook_url": "<string>",\
          "instagram_url": "<string>",\
          "linkedin_url": "<string>",\
          "snapchat_username": "<string>",\
          "tiktok_username": "<string>",\
          "twitter_url": "<string>",\
          "website_url": "<string>",\
          "created_at": "<string>",\
          "updated_at": "<string>",\
          "custom_fields": [\
            {\
              "id": "<string>",\
              "name": "<string>",\
              "value": "<string>",\
              "type": "<string>",\
              "internal_name": "<string>",\
              "created_at": "<string>"\
            }\
          ],\
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
          ],\
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
          ]\
        }\
      ],\
      "exhibitors": [\
        {\
          "id": "<string>",\
          "friendly_id": "<string>",\
          "friendly_id_raw": 123,\
          "name": "<string>",\
          "description": "<string>",\
          "logo_image_url": "<string>",\
          "banner_image_url": "<string>",\
          "phone": "<string>",\
          "address_line_1": "<string>",\
          "address_line_2": "<string>",\
          "address_city": "<string>",\
          "address_state": "<string>",\
          "address_postal_code": "<string>",\
          "address_coutnry": "<string>",\
          "facebook_url": "<string>",\
          "instagram_url": "<string>",\
          "linkedin_url": "<string>",\
          "snapchat_username": "<string>",\
          "tiktok_username": "<string>",\
          "twitter_url": "<string>",\
          "website_url": "<string>",\
          "created_at": "<string>",\
          "updated_at": "<string>",\
          "custom_fields": [\
            {\
              "id": "<string>",\
              "name": "<string>",\
              "value": "<string>",\
              "type": "<string>",\
              "internal_name": "<string>",\
              "created_at": "<string>"\
            }\
          ],\
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
          ],\
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
          ]\
        }\
      ],\
      "content": [\
        {\
          "id": "3c90c3cc-0d44-4b50-8888-8dd25736052a",\
          "url": "<string>",\
          "title": "<string>",\
          "filename": "<string>",\
          "size": 123,\
          "mimetype": "<string>",\
          "created_at": "2023-11-07T05:31:56Z",\
          "updated_at": "2023-11-07T05:31:56Z",\
          "assigned_participant_id": "3c90c3cc-0d44-4b50-8888-8dd25736052a",\
          "assigned_participant_email": "jsmith@example.com",\
          "assigned_participant_name": "<string>"\
        }\
      ],\
      "tags": [\
        {\
          "id": "3c90c3cc-0d44-4b50-8888-8dd25736052a",\
          "name": "<string>",\
          "created_at": "<string>",\
          "updated_at": "<string>"\
        }\
      ],\
      "language": {\
        "id": "3c90c3cc-0d44-4b50-8888-8dd25736052a",\
        "event_id": 123,\
        "name": "<string>",\
        "order": 123,\
        "created_at": "<string>",\
        "updated_at": "<string>"\
      },\
      "track": {\
        "id": "3c90c3cc-0d44-4b50-8888-8dd25736052a",\
        "event_id": 123,\
        "name": "<string>",\
        "color": "<string>",\
        "order": 123,\
        "created_at": "<string>",\
        "updated_at": "<string>"\
      },\
      "level": {\
        "id": "3c90c3cc-0d44-4b50-8888-8dd25736052a",\
        "name": "<string>",\
        "order": 123,\
        "created_at": "<string>",\
        "updated_at": "<string>"\
      },\
      "format": {\
        "id": "<string>",\
        "name": "<string>"\
      },\
      "room": {\
        "id": "3c90c3cc-0d44-4b50-8888-8dd25736052a",\
        "name": "<string>",\
        "order": 123,\
        "capacity": 123,\
        "created_at": "<string>",\
        "updated_at": "<string>"\
      },\
      "subsessions": [\
        {\
          "id": "3c90c3cc-0d44-4b50-8888-8dd25736052a",\
          "friendly_id": "<string>",\
          "friendly_id_raw": 123,\
          "parent_session_friendly_id": "<string>",\
          "parent_session_friendly_id_raw": 123,\
          "title": "<string>",\
          "description": "<string>",\
          "starts_at": "2023-11-07T05:31:56Z",\
          "ends_at": "2023-11-07T05:31:56Z",\
          "created_at": "2023-11-07T05:31:56Z",\
          "updated_at": "2023-11-07T05:31:56Z",\
          "translated_fields": [\
            {}\
          ],\
          "speakers": [\
            {\
              "id": "<string>",\
              "participant_role": {\
                "id": "3c90c3cc-0d44-4b50-8888-8dd25736052a",\
                "slug": "<string>",\
                "name": "<string>",\
                "name_plural": "<string>"\
              },\
              "friendly_id": "<string>",\
              "full_name": "<string>",\
              "first_name": "<string>",\
              "last_name": "<string>",\
              "email": "<string>",\
              "created_at": "<string>",\
              "updated_at": "<string>",\
              "photo_url": "<string>",\
              "company_name": "<string>",\
              "title": "<string>",\
              "about": "<string>",\
              "phone_home": "<string>",\
              "phone_mobile": "<string>",\
              "address_line_1": "<string>",\
              "address_line_2": "<string>",\
              "address_city": "<string>",\
              "address_state": "<string>",\
              "address_postal_code": "<string>",\
              "address_country": "<string>",\
              "website_url": "<string>",\
              "linkedin_url": "<string>",\
              "twitter_url": "<string>",\
              "facebook_url": "<string>",\
              "instagram_url": "<string>",\
              "snapchat_username": "<string>",\
              "tiktok_username": "<string>",\
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
              ],\
              "custom_fields": [\
                {\
                  "id": "<string>",\
                  "name": "<string>",\
                  "value": "<string>",\
                  "type": "<string>",\
                  "internal_name": "<string>",\
                  "created_at": "<string>"\
                }\
              ]\
            }\
          ],\
          "participants": [\
            {\
              "id": "<string>",\
              "participant_role": {\
                "id": "3c90c3cc-0d44-4b50-8888-8dd25736052a",\
                "slug": "<string>",\
                "name": "<string>",\
                "name_plural": "<string>"\
              },\
              "friendly_id": "<string>",\
              "full_name": "<string>",\
              "first_name": "<string>",\
              "last_name": "<string>",\
              "email": "<string>",\
              "created_at": "<string>",\
              "updated_at": "<string>",\
              "photo_url": "<string>",\
              "company_name": "<string>",\
              "title": "<string>",\
              "about": "<string>",\
              "phone_home": "<string>",\
              "phone_mobile": "<string>",\
              "address_line_1": "<string>",\
              "address_line_2": "<string>",\
              "address_city": "<string>",\
              "address_state": "<string>",\
              "address_postal_code": "<string>",\
              "address_country": "<string>",\
              "website_url": "<string>",\
              "linkedin_url": "<string>",\
              "twitter_url": "<string>",\
              "facebook_url": "<string>",\
              "instagram_url": "<string>",\
              "snapchat_username": "<string>",\
              "tiktok_username": "<string>",\
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
              ],\
              "custom_fields": [\
                {\
                  "id": "<string>",\
                  "name": "<string>",\
                  "value": "<string>",\
                  "type": "<string>",\
                  "internal_name": "<string>",\
                  "created_at": "<string>"\
                }\
              ],\
              "session_participant_id": "3c90c3cc-0d44-4b50-8888-8dd25736052a"\
            }\
          ],\
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
          },\
          "format": {\
            "id": "<string>",\
            "name": "<string>"\
          },\
          "content": [\
            {\
              "id": "3c90c3cc-0d44-4b50-8888-8dd25736052a",\
              "url": "<string>",\
              "title": "<string>",\
              "filename": "<string>",\
              "size": 123,\
              "mimetype": "<string>",\
              "created_at": "2023-11-07T05:31:56Z",\
              "updated_at": "2023-11-07T05:31:56Z",\
              "assigned_participant_id": "3c90c3cc-0d44-4b50-8888-8dd25736052a",\
              "assigned_participant_email": "jsmith@example.com",\
              "assigned_participant_name": "<string>"\
            }\
          ]\
        }\
      ],\
      "admin_url": "<string>"\
    }\
  ],
  "pagination": {
    "current_page": 123,
    "page_size": 123,
    "total_pages": 123,
    "total_results": 123
  }
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

sessions

Try it

List sessions (CRUD proxy)

cURL

```
curl --request GET \
  --url 'https://public-api.sessionboard.com/v1/event/{eventId}/sessions?page=1&page_size=25' \
  --header 'x-access-token: <api-key>'
```

```
import requests

url = "https://public-api.sessionboard.com/v1/event/{eventId}/sessions?page=1&page_size=25"

headers = {"x-access-token": "<api-key>"}

response = requests.get(url, headers=headers)

print(response.text)
```

```
const options = {method: 'GET', headers: {'x-access-token': '<api-key>'}};

fetch('https://public-api.sessionboard.com/v1/event/{eventId}/sessions?page=1&page_size=25', options)
  .then(res => res.json())
  .then(res => console.log(res))
  .catch(err => console.error(err));
```

```
<?php

$curl = curl_init();

curl_setopt_array($curl, [\
  CURLOPT_URL => "https://public-api.sessionboard.com/v1/event/{eventId}/sessions?page=1&page_size=25",\
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

	url := "https://public-api.sessionboard.com/v1/event/{eventId}/sessions?page=1&page_size=25"

	req, _ := http.NewRequest("GET", url, nil)

	req.Header.Add("x-access-token", "<api-key>")

	res, _ := http.DefaultClient.Do(req)

	defer res.Body.Close()
	body, _ := io.ReadAll(res.Body)

	fmt.Println(string(body))

}
```

```
HttpResponse<String> response = Unirest.get("https://public-api.sessionboard.com/v1/event/{eventId}/sessions?page=1&page_size=25")
  .header("x-access-token", "<api-key>")
  .asString();
```

```
require 'uri'
require 'net/http'

url = URI("https://public-api.sessionboard.com/v1/event/{eventId}/sessions?page=1&page_size=25")

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
  "data": [\
    {\
      "id": "3c90c3cc-0d44-4b50-8888-8dd25736052a",\
      "friendly_id": "<string>",\
      "friendly_id_raw": 123,\
      "title": "<string>",\
      "description": "<string>",\
      "custom_status_id": "<string>",\
      "custom_status": {\
        "id": "<string>",\
        "name": "<string>"\
      },\
      "starts_at": "2023-11-07T05:31:56Z",\
      "ends_at": "2023-11-07T05:31:56Z",\
      "is_public": true,\
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
      },\
      "composition": {\
        "target": {\
          "id": "3c90c3cc-0d44-4b50-8888-8dd25736052a",\
          "friendly_id": "<string>",\
          "title": "<string>",\
          "is_abstract": true\
        },\
        "sources": [\
          {\
            "composition_id": "3c90c3cc-0d44-4b50-8888-8dd25736052a",\
            "created_at": "2023-11-07T05:31:56Z",\
            "id": "3c90c3cc-0d44-4b50-8888-8dd25736052a",\
            "friendly_id": "<string>",\
            "title": "<string>",\
            "is_abstract": true\
          }\
        ]\
      },\
      "external_url": "<string>",\
      "client_session_id": "<string>",\
      "created_at": "2023-11-07T05:31:56Z",\
      "updated_at": "2023-11-07T05:31:56Z",\
      "ceu_credits": 123,\
      "capacity": 123,\
      "custom_fields": [\
        {\
          "id": "<string>",\
          "name": "<string>",\
          "value": "<string>",\
          "type": "<string>",\
          "internal_name": "<string>",\
          "created_at": "<string>"\
        }\
      ],\
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
      ],\
      "speakers": [\
        {\
          "id": "<string>",\
          "participant_role": {\
            "id": "3c90c3cc-0d44-4b50-8888-8dd25736052a",\
            "slug": "<string>",\
            "name": "<string>",\
            "name_plural": "<string>"\
          },\
          "friendly_id": "<string>",\
          "full_name": "<string>",\
          "first_name": "<string>",\
          "last_name": "<string>",\
          "email": "<string>",\
          "created_at": "<string>",\
          "updated_at": "<string>",\
          "photo_url": "<string>",\
          "company_name": "<string>",\
          "title": "<string>",\
          "about": "<string>",\
          "phone_home": "<string>",\
          "phone_mobile": "<string>",\
          "address_line_1": "<string>",\
          "address_line_2": "<string>",\
          "address_city": "<string>",\
          "address_state": "<string>",\
          "address_postal_code": "<string>",\
          "address_country": "<string>",\
          "website_url": "<string>",\
          "linkedin_url": "<string>",\
          "twitter_url": "<string>",\
          "facebook_url": "<string>",\
          "instagram_url": "<string>",\
          "snapchat_username": "<string>",\
          "tiktok_username": "<string>",\
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
          ],\
          "custom_fields": [\
            {\
              "id": "<string>",\
              "name": "<string>",\
              "value": "<string>",\
              "type": "<string>",\
              "internal_name": "<string>",\
              "created_at": "<string>"\
            }\
          ]\
        }\
      ],\
      "chairpersons": [\
        {\
          "id": "<string>",\
          "participant_role": {\
            "id": "3c90c3cc-0d44-4b50-8888-8dd25736052a",\
            "slug": "<string>",\
            "name": "<string>",\
            "name_plural": "<string>"\
          },\
          "friendly_id": "<string>",\
          "full_name": "<string>",\
          "first_name": "<string>",\
          "last_name": "<string>",\
          "email": "<string>",\
          "created_at": "<string>",\
          "updated_at": "<string>",\
          "photo_url": "<string>",\
          "company_name": "<string>",\
          "title": "<string>",\
          "about": "<string>",\
          "phone_home": "<string>",\
          "phone_mobile": "<string>",\
          "address_line_1": "<string>",\
          "address_line_2": "<string>",\
          "address_city": "<string>",\
          "address_state": "<string>",\
          "address_postal_code": "<string>",\
          "address_country": "<string>",\
          "website_url": "<string>",\
          "linkedin_url": "<string>",\
          "twitter_url": "<string>",\
          "facebook_url": "<string>",\
          "instagram_url": "<string>",\
          "snapchat_username": "<string>",\
          "tiktok_username": "<string>",\
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
          ],\
          "custom_fields": [\
            {\
              "id": "<string>",\
              "name": "<string>",\
              "value": "<string>",\
              "type": "<string>",\
              "internal_name": "<string>",\
              "created_at": "<string>"\
            }\
          ]\
        }\
      ],\
      "moderators": [\
        {\
          "id": "<string>",\
          "participant_role": {\
            "id": "3c90c3cc-0d44-4b50-8888-8dd25736052a",\
            "slug": "<string>",\
            "name": "<string>",\
            "name_plural": "<string>"\
          },\
          "friendly_id": "<string>",\
          "full_name": "<string>",\
          "first_name": "<string>",\
          "last_name": "<string>",\
          "email": "<string>",\
          "created_at": "<string>",\
          "updated_at": "<string>",\
          "photo_url": "<string>",\
          "company_name": "<string>",\
          "title": "<string>",\
          "about": "<string>",\
          "phone_home": "<string>",\
          "phone_mobile": "<string>",\
          "address_line_1": "<string>",\
          "address_line_2": "<string>",\
          "address_city": "<string>",\
          "address_state": "<string>",\
          "address_postal_code": "<string>",\
          "address_country": "<string>",\
          "website_url": "<string>",\
          "linkedin_url": "<string>",\
          "twitter_url": "<string>",\
          "facebook_url": "<string>",\
          "instagram_url": "<string>",\
          "snapchat_username": "<string>",\
          "tiktok_username": "<string>",\
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
          ],\
          "custom_fields": [\
            {\
              "id": "<string>",\
              "name": "<string>",\
              "value": "<string>",\
              "type": "<string>",\
              "internal_name": "<string>",\
              "created_at": "<string>"\
            }\
          ]\
        }\
      ],\
      "participants": [\
        {\
          "id": "<string>",\
          "participant_role": {\
            "id": "3c90c3cc-0d44-4b50-8888-8dd25736052a",\
            "slug": "<string>",\
            "name": "<string>",\
            "name_plural": "<string>"\
          },\
          "friendly_id": "<string>",\
          "full_name": "<string>",\
          "first_name": "<string>",\
          "last_name": "<string>",\
          "email": "<string>",\
          "created_at": "<string>",\
          "updated_at": "<string>",\
          "photo_url": "<string>",\
          "company_name": "<string>",\
          "title": "<string>",\
          "about": "<string>",\
          "phone_home": "<string>",\
          "phone_mobile": "<string>",\
          "address_line_1": "<string>",\
          "address_line_2": "<string>",\
          "address_city": "<string>",\
          "address_state": "<string>",\
          "address_postal_code": "<string>",\
          "address_country": "<string>",\
          "website_url": "<string>",\
          "linkedin_url": "<string>",\
          "twitter_url": "<string>",\
          "facebook_url": "<string>",\
          "instagram_url": "<string>",\
          "snapchat_username": "<string>",\
          "tiktok_username": "<string>",\
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
          ],\
          "custom_fields": [\
            {\
              "id": "<string>",\
              "name": "<string>",\
              "value": "<string>",\
              "type": "<string>",\
              "internal_name": "<string>",\
              "created_at": "<string>"\
            }\
          ],\
          "session_participant_id": "3c90c3cc-0d44-4b50-8888-8dd25736052a"\
        }\
      ],\
      "sponsors": [\
        {\
          "id": "<string>",\
          "friendly_id": "<string>",\
          "friendly_id_raw": 123,\
          "name": "<string>",\
          "description": "<string>",\
          "logo_image_url": "<string>",\
          "banner_image_url": "<string>",\
          "phone": "<string>",\
          "address_line_1": "<string>",\
          "address_line_2": "<string>",\
          "address_city": "<string>",\
          "address_state": "<string>",\
          "address_postal_code": "<string>",\
          "address_coutnry": "<string>",\
          "facebook_url": "<string>",\
          "instagram_url": "<string>",\
          "linkedin_url": "<string>",\
          "snapchat_username": "<string>",\
          "tiktok_username": "<string>",\
          "twitter_url": "<string>",\
          "website_url": "<string>",\
          "created_at": "<string>",\
          "updated_at": "<string>",\
          "custom_fields": [\
            {\
              "id": "<string>",\
              "name": "<string>",\
              "value": "<string>",\
              "type": "<string>",\
              "internal_name": "<string>",\
              "created_at": "<string>"\
            }\
          ],\
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
          ],\
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
          ]\
        }\
      ],\
      "exhibitors": [\
        {\
          "id": "<string>",\
          "friendly_id": "<string>",\
          "friendly_id_raw": 123,\
          "name": "<string>",\
          "description": "<string>",\
          "logo_image_url": "<string>",\
          "banner_image_url": "<string>",\
          "phone": "<string>",\
          "address_line_1": "<string>",\
          "address_line_2": "<string>",\
          "address_city": "<string>",\
          "address_state": "<string>",\
          "address_postal_code": "<string>",\
          "address_coutnry": "<string>",\
          "facebook_url": "<string>",\
          "instagram_url": "<string>",\
          "linkedin_url": "<string>",\
          "snapchat_username": "<string>",\
          "tiktok_username": "<string>",\
          "twitter_url": "<string>",\
          "website_url": "<string>",\
          "created_at": "<string>",\
          "updated_at": "<string>",\
          "custom_fields": [\
            {\
              "id": "<string>",\
              "name": "<string>",\
              "value": "<string>",\
              "type": "<string>",\
              "internal_name": "<string>",\
              "created_at": "<string>"\
            }\
          ],\
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
          ],\
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
          ]\
        }\
      ],\
      "content": [\
        {\
          "id": "3c90c3cc-0d44-4b50-8888-8dd25736052a",\
          "url": "<string>",\
          "title": "<string>",\
          "filename": "<string>",\
          "size": 123,\
          "mimetype": "<string>",\
          "created_at": "2023-11-07T05:31:56Z",\
          "updated_at": "2023-11-07T05:31:56Z",\
          "assigned_participant_id": "3c90c3cc-0d44-4b50-8888-8dd25736052a",\
          "assigned_participant_email": "jsmith@example.com",\
          "assigned_participant_name": "<string>"\
        }\
      ],\
      "tags": [\
        {\
          "id": "3c90c3cc-0d44-4b50-8888-8dd25736052a",\
          "name": "<string>",\
          "created_at": "<string>",\
          "updated_at": "<string>"\
        }\
      ],\
      "language": {\
        "id": "3c90c3cc-0d44-4b50-8888-8dd25736052a",\
        "event_id": 123,\
        "name": "<string>",\
        "order": 123,\
        "created_at": "<string>",\
        "updated_at": "<string>"\
      },\
      "track": {\
        "id": "3c90c3cc-0d44-4b50-8888-8dd25736052a",\
        "event_id": 123,\
        "name": "<string>",\
        "color": "<string>",\
        "order": 123,\
        "created_at": "<string>",\
        "updated_at": "<string>"\
      },\
      "level": {\
        "id": "3c90c3cc-0d44-4b50-8888-8dd25736052a",\
        "name": "<string>",\
        "order": 123,\
        "created_at": "<string>",\
        "updated_at": "<string>"\
      },\
      "format": {\
        "id": "<string>",\
        "name": "<string>"\
      },\
      "room": {\
        "id": "3c90c3cc-0d44-4b50-8888-8dd25736052a",\
        "name": "<string>",\
        "order": 123,\
        "capacity": 123,\
        "created_at": "<string>",\
        "updated_at": "<string>"\
      },\
      "subsessions": [\
        {\
          "id": "3c90c3cc-0d44-4b50-8888-8dd25736052a",\
          "friendly_id": "<string>",\
          "friendly_id_raw": 123,\
          "parent_session_friendly_id": "<string>",\
          "parent_session_friendly_id_raw": 123,\
          "title": "<string>",\
          "description": "<string>",\
          "starts_at": "2023-11-07T05:31:56Z",\
          "ends_at": "2023-11-07T05:31:56Z",\
          "created_at": "2023-11-07T05:31:56Z",\
          "updated_at": "2023-11-07T05:31:56Z",\
          "translated_fields": [\
            {}\
          ],\
          "speakers": [\
            {\
              "id": "<string>",\
              "participant_role": {\
                "id": "3c90c3cc-0d44-4b50-8888-8dd25736052a",\
                "slug": "<string>",\
                "name": "<string>",\
                "name_plural": "<string>"\
              },\
              "friendly_id": "<string>",\
              "full_name": "<string>",\
              "first_name": "<string>",\
              "last_name": "<string>",\
              "email": "<string>",\
              "created_at": "<string>",\
              "updated_at": "<string>",\
              "photo_url": "<string>",\
              "company_name": "<string>",\
              "title": "<string>",\
              "about": "<string>",\
              "phone_home": "<string>",\
              "phone_mobile": "<string>",\
              "address_line_1": "<string>",\
              "address_line_2": "<string>",\
              "address_city": "<string>",\
              "address_state": "<string>",\
              "address_postal_code": "<string>",\
              "address_country": "<string>",\
              "website_url": "<string>",\
              "linkedin_url": "<string>",\
              "twitter_url": "<string>",\
              "facebook_url": "<string>",\
              "instagram_url": "<string>",\
              "snapchat_username": "<string>",\
              "tiktok_username": "<string>",\
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
              ],\
              "custom_fields": [\
                {\
                  "id": "<string>",\
                  "name": "<string>",\
                  "value": "<string>",\
                  "type": "<string>",\
                  "internal_name": "<string>",\
                  "created_at": "<string>"\
                }\
              ]\
            }\
          ],\
          "participants": [\
            {\
              "id": "<string>",\
              "participant_role": {\
                "id": "3c90c3cc-0d44-4b50-8888-8dd25736052a",\
                "slug": "<string>",\
                "name": "<string>",\
                "name_plural": "<string>"\
              },\
              "friendly_id": "<string>",\
              "full_name": "<string>",\
              "first_name": "<string>",\
              "last_name": "<string>",\
              "email": "<string>",\
              "created_at": "<string>",\
              "updated_at": "<string>",\
              "photo_url": "<string>",\
              "company_name": "<string>",\
              "title": "<string>",\
              "about": "<string>",\
              "phone_home": "<string>",\
              "phone_mobile": "<string>",\
              "address_line_1": "<string>",\
              "address_line_2": "<string>",\
              "address_city": "<string>",\
              "address_state": "<string>",\
              "address_postal_code": "<string>",\
              "address_country": "<string>",\
              "website_url": "<string>",\
              "linkedin_url": "<string>",\
              "twitter_url": "<string>",\
              "facebook_url": "<string>",\
              "instagram_url": "<string>",\
              "snapchat_username": "<string>",\
              "tiktok_username": "<string>",\
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
              ],\
              "custom_fields": [\
                {\
                  "id": "<string>",\
                  "name": "<string>",\
                  "value": "<string>",\
                  "type": "<string>",\
                  "internal_name": "<string>",\
                  "created_at": "<string>"\
                }\
              ],\
              "session_participant_id": "3c90c3cc-0d44-4b50-8888-8dd25736052a"\
            }\
          ],\
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
          },\
          "format": {\
            "id": "<string>",\
            "name": "<string>"\
          },\
          "content": [\
            {\
              "id": "3c90c3cc-0d44-4b50-8888-8dd25736052a",\
              "url": "<string>",\
              "title": "<string>",\
              "filename": "<string>",\
              "size": 123,\
              "mimetype": "<string>",\
              "created_at": "2023-11-07T05:31:56Z",\
              "updated_at": "2023-11-07T05:31:56Z",\
              "assigned_participant_id": "3c90c3cc-0d44-4b50-8888-8dd25736052a",\
              "assigned_participant_email": "jsmith@example.com",\
              "assigned_participant_name": "<string>"\
            }\
          ]\
        }\
      ],\
      "admin_url": "<string>"\
    }\
  ],
  "pagination": {
    "current_page": 123,
    "page_size": 123,
    "total_pages": 123,
    "total_results": 123
  }
}
```

#### Authorizations

ApiKeyBearerTokenApiKeyBearerToken

[​](https://apidocs.sessionboard.com/api-reference/sessions/list-sessions-crud-proxy#authorization-x-access-token)

x-access-token

string

header

required

Organization API token. Generate from Organization Settings → API Tokens.

#### Path Parameters

[​](https://apidocs.sessionboard.com/api-reference/sessions/list-sessions-crud-proxy#parameter-event-id)

eventId

integer

required

The event ID.

#### Query Parameters

[​](https://apidocs.sessionboard.com/api-reference/sessions/list-sessions-crud-proxy#parameter-page)

page

integer

default:1

Page number for pagination.

Required range: `1 <= x <= 999`

[​](https://apidocs.sessionboard.com/api-reference/sessions/list-sessions-crud-proxy#parameter-page-size)

page\_size

integer

default:25

Required range: `1 <= x <= 100`

[​](https://apidocs.sessionboard.com/api-reference/sessions/list-sessions-crud-proxy#parameter-is-abstract)

is\_abstract

boolean

Filter to abstract submissions or program sessions.

[​](https://apidocs.sessionboard.com/api-reference/sessions/list-sessions-crud-proxy#parameter-expand)

expand

enum<string>\[\]

Expand records with additional data.

Possible values:

- `translated_fields` — includes the `translated_fields` array on records when the event has language variants configured.
- `subsession_details` — applies to session responses. Each subsession inside `parent.subsessions[]` is returned with full parent-session field parity (`status`, `custom_status`, `custom_fields`, `chairpersons`, `moderators`, `sponsors`, `exhibitors`, `tags`, `language`, `track`, `level`, `room`, `is_public`, `external_url`, `client_session_id`, `ceu_credits`, `capacity`, `source`) instead of the default minimal shape. Subsessions inherit `is_abstract`, `composition_status`, and optional `composition` from the parent. Not required when calling `GET /v1/event/{eventId}/sessions/{sessionId}` with a subsession UUID — that endpoint always returns the full shape at the top level.
- `linked_sources` — include sessions that are linked as composition sources (excluded from list/search results by default).
- `composition` — attach a full `composition` object with target and source details on each returned session. Recommended for single-session GET; use cautiously on broad searches.

Available options:

`translated_fields`,

`subsession_details`,

`linked_sources`,

`composition`

[​](https://apidocs.sessionboard.com/api-reference/sessions/list-sessions-crud-proxy#parameter-status)

status

string

[​](https://apidocs.sessionboard.com/api-reference/sessions/list-sessions-crud-proxy#parameter-track-id)

track\_id

string<uuid>

[​](https://apidocs.sessionboard.com/api-reference/sessions/list-sessions-crud-proxy#parameter-tag-id)

tag\_id

string<uuid>

[​](https://apidocs.sessionboard.com/api-reference/sessions/list-sessions-crud-proxy#parameter-search)

search

string

#### Response

200 - application/json

OK

[​](https://apidocs.sessionboard.com/api-reference/sessions/list-sessions-crud-proxy#response-data)

data

object\[\]

Showchild attributes

[​](https://apidocs.sessionboard.com/api-reference/sessions/list-sessions-crud-proxy#response-pagination)

pagination

object

Showchild attributes

Ctrl+I