---
url: "https://apidocs.sessionboard.com/api-reference/sessions/get-a-session"
title: "Get a session - Sessionboard API"
---

> ## Documentation Index
>
> Fetch the complete documentation index at: [/llms.txt](https://apidocs.sessionboard.com/llms.txt)
>
> Use this file to discover all available pages before exploring further.

[Skip to main content](https://apidocs.sessionboard.com/api-reference/sessions/get-a-session#content-area)

Get a session

cURL

```
curl --request GET \
  --url https://public-api.sessionboard.com/v1/event/{eventId}/sessions/{sessionId} \
  --header 'x-access-token: <api-key>'
```

```
import requests

url = "https://public-api.sessionboard.com/v1/event/{eventId}/sessions/{sessionId}"

headers = {"x-access-token": "<api-key>"}

response = requests.get(url, headers=headers)

print(response.text)
```

```
const options = {method: 'GET', headers: {'x-access-token': '<api-key>'}};

fetch('https://public-api.sessionboard.com/v1/event/{eventId}/sessions/{sessionId}', options)
  .then(res => res.json())
  .then(res => console.log(res))
  .catch(err => console.error(err));
```

```
<?php

$curl = curl_init();

curl_setopt_array($curl, [\
  CURLOPT_URL => "https://public-api.sessionboard.com/v1/event/{eventId}/sessions/{sessionId}",\
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

	url := "https://public-api.sessionboard.com/v1/event/{eventId}/sessions/{sessionId}"

	req, _ := http.NewRequest("GET", url, nil)

	req.Header.Add("x-access-token", "<api-key>")

	res, _ := http.DefaultClient.Do(req)

	defer res.Body.Close()
	body, _ := io.ReadAll(res.Body)

	fmt.Println(string(body))

}
```

```
HttpResponse<String> response = Unirest.get("https://public-api.sessionboard.com/v1/event/{eventId}/sessions/{sessionId}")
  .header("x-access-token", "<api-key>")
  .asString();
```

```
require 'uri'
require 'net/http'

url = URI("https://public-api.sessionboard.com/v1/event/{eventId}/sessions/{sessionId}")

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
  "id": "3c90c3cc-0d44-4b50-8888-8dd25736052a",
  "friendly_id": "<string>",
  "friendly_id_raw": 123,
  "title": "<string>",
  "description": "<string>",
  "custom_status_id": "<string>",
  "custom_status": {
    "id": "<string>",
    "name": "<string>"
  },
  "starts_at": "2023-11-07T05:31:56Z",
  "ends_at": "2023-11-07T05:31:56Z",
  "is_public": true,
  "is_abstract": true,
  "composition_status": {
    "is_linked": true,
    "is_read_only": true,
    "source_count": 123,
    "target": {
      "id": "3c90c3cc-0d44-4b50-8888-8dd25736052a",
      "friendly_id": "<string>",
      "title": "<string>",
      "is_abstract": true
    }
  },
  "composition": {
    "target": {
      "id": "3c90c3cc-0d44-4b50-8888-8dd25736052a",
      "friendly_id": "<string>",
      "title": "<string>",
      "is_abstract": true
    },
    "sources": [\
      {\
        "composition_id": "3c90c3cc-0d44-4b50-8888-8dd25736052a",\
        "created_at": "2023-11-07T05:31:56Z",\
        "id": "3c90c3cc-0d44-4b50-8888-8dd25736052a",\
        "friendly_id": "<string>",\
        "title": "<string>",\
        "is_abstract": true\
      }\
    ]
  },
  "external_url": "<string>",
  "client_session_id": "<string>",
  "created_at": "2023-11-07T05:31:56Z",
  "updated_at": "2023-11-07T05:31:56Z",
  "ceu_credits": 123,
  "capacity": 123,
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
  ],
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
  ],
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
  ],
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
  ],
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
  ],
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
  ],
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
  ],
  "tags": [\
    {\
      "id": "3c90c3cc-0d44-4b50-8888-8dd25736052a",\
      "name": "<string>",\
      "created_at": "<string>",\
      "updated_at": "<string>"\
    }\
  ],
  "language": {
    "id": "3c90c3cc-0d44-4b50-8888-8dd25736052a",
    "event_id": 123,
    "name": "<string>",
    "order": 123,
    "created_at": "<string>",
    "updated_at": "<string>"
  },
  "track": {
    "id": "3c90c3cc-0d44-4b50-8888-8dd25736052a",
    "event_id": 123,
    "name": "<string>",
    "color": "<string>",
    "order": 123,
    "created_at": "<string>",
    "updated_at": "<string>"
  },
  "level": {
    "id": "3c90c3cc-0d44-4b50-8888-8dd25736052a",
    "name": "<string>",
    "order": 123,
    "created_at": "<string>",
    "updated_at": "<string>"
  },
  "format": {
    "id": "<string>",
    "name": "<string>"
  },
  "room": {
    "id": "3c90c3cc-0d44-4b50-8888-8dd25736052a",
    "name": "<string>",
    "order": 123,
    "capacity": 123,
    "created_at": "<string>",
    "updated_at": "<string>"
  },
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
  ],
  "admin_url": "<string>"
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

/

{sessionId}

Try it

Get a session

cURL

```
curl --request GET \
  --url https://public-api.sessionboard.com/v1/event/{eventId}/sessions/{sessionId} \
  --header 'x-access-token: <api-key>'
```

```
import requests

url = "https://public-api.sessionboard.com/v1/event/{eventId}/sessions/{sessionId}"

headers = {"x-access-token": "<api-key>"}

response = requests.get(url, headers=headers)

print(response.text)
```

```
const options = {method: 'GET', headers: {'x-access-token': '<api-key>'}};

fetch('https://public-api.sessionboard.com/v1/event/{eventId}/sessions/{sessionId}', options)
  .then(res => res.json())
  .then(res => console.log(res))
  .catch(err => console.error(err));
```

```
<?php

$curl = curl_init();

curl_setopt_array($curl, [\
  CURLOPT_URL => "https://public-api.sessionboard.com/v1/event/{eventId}/sessions/{sessionId}",\
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

	url := "https://public-api.sessionboard.com/v1/event/{eventId}/sessions/{sessionId}"

	req, _ := http.NewRequest("GET", url, nil)

	req.Header.Add("x-access-token", "<api-key>")

	res, _ := http.DefaultClient.Do(req)

	defer res.Body.Close()
	body, _ := io.ReadAll(res.Body)

	fmt.Println(string(body))

}
```

```
HttpResponse<String> response = Unirest.get("https://public-api.sessionboard.com/v1/event/{eventId}/sessions/{sessionId}")
  .header("x-access-token", "<api-key>")
  .asString();
```

```
require 'uri'
require 'net/http'

url = URI("https://public-api.sessionboard.com/v1/event/{eventId}/sessions/{sessionId}")

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
  "id": "3c90c3cc-0d44-4b50-8888-8dd25736052a",
  "friendly_id": "<string>",
  "friendly_id_raw": 123,
  "title": "<string>",
  "description": "<string>",
  "custom_status_id": "<string>",
  "custom_status": {
    "id": "<string>",
    "name": "<string>"
  },
  "starts_at": "2023-11-07T05:31:56Z",
  "ends_at": "2023-11-07T05:31:56Z",
  "is_public": true,
  "is_abstract": true,
  "composition_status": {
    "is_linked": true,
    "is_read_only": true,
    "source_count": 123,
    "target": {
      "id": "3c90c3cc-0d44-4b50-8888-8dd25736052a",
      "friendly_id": "<string>",
      "title": "<string>",
      "is_abstract": true
    }
  },
  "composition": {
    "target": {
      "id": "3c90c3cc-0d44-4b50-8888-8dd25736052a",
      "friendly_id": "<string>",
      "title": "<string>",
      "is_abstract": true
    },
    "sources": [\
      {\
        "composition_id": "3c90c3cc-0d44-4b50-8888-8dd25736052a",\
        "created_at": "2023-11-07T05:31:56Z",\
        "id": "3c90c3cc-0d44-4b50-8888-8dd25736052a",\
        "friendly_id": "<string>",\
        "title": "<string>",\
        "is_abstract": true\
      }\
    ]
  },
  "external_url": "<string>",
  "client_session_id": "<string>",
  "created_at": "2023-11-07T05:31:56Z",
  "updated_at": "2023-11-07T05:31:56Z",
  "ceu_credits": 123,
  "capacity": 123,
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
  ],
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
  ],
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
  ],
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
  ],
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
  ],
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
  ],
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
  ],
  "tags": [\
    {\
      "id": "3c90c3cc-0d44-4b50-8888-8dd25736052a",\
      "name": "<string>",\
      "created_at": "<string>",\
      "updated_at": "<string>"\
    }\
  ],
  "language": {
    "id": "3c90c3cc-0d44-4b50-8888-8dd25736052a",
    "event_id": 123,
    "name": "<string>",
    "order": 123,
    "created_at": "<string>",
    "updated_at": "<string>"
  },
  "track": {
    "id": "3c90c3cc-0d44-4b50-8888-8dd25736052a",
    "event_id": 123,
    "name": "<string>",
    "color": "<string>",
    "order": 123,
    "created_at": "<string>",
    "updated_at": "<string>"
  },
  "level": {
    "id": "3c90c3cc-0d44-4b50-8888-8dd25736052a",
    "name": "<string>",
    "order": 123,
    "created_at": "<string>",
    "updated_at": "<string>"
  },
  "format": {
    "id": "<string>",
    "name": "<string>"
  },
  "room": {
    "id": "3c90c3cc-0d44-4b50-8888-8dd25736052a",
    "name": "<string>",
    "order": 123,
    "capacity": 123,
    "created_at": "<string>",
    "updated_at": "<string>"
  },
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
  ],
  "admin_url": "<string>"
}
```

#### Authorizations

ApiKeyBearerTokenApiKeyBearerToken

[​](https://apidocs.sessionboard.com/api-reference/sessions/get-a-session#authorization-x-access-token)

x-access-token

string

header

required

Organization API token. Generate from Organization Settings → API Tokens.

#### Path Parameters

[​](https://apidocs.sessionboard.com/api-reference/sessions/get-a-session#parameter-event-id)

eventId

integer

required

The event ID.

[​](https://apidocs.sessionboard.com/api-reference/sessions/get-a-session#parameter-session-id)

sessionId

string<uuid>

required

The session ID.

#### Query Parameters

[​](https://apidocs.sessionboard.com/api-reference/sessions/get-a-session#parameter-expand)

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

#### Response

200

application/json

OK

A session within an event (e.g., talk, workshop, panel, or CFP abstract submission).

[​](https://apidocs.sessionboard.com/api-reference/sessions/get-a-session#response-id)

id

string<uuid>

[​](https://apidocs.sessionboard.com/api-reference/sessions/get-a-session#response-friendly-id)

friendly\_id

string

[​](https://apidocs.sessionboard.com/api-reference/sessions/get-a-session#response-friendly-id-raw)

friendly\_id\_raw

integer

[​](https://apidocs.sessionboard.com/api-reference/sessions/get-a-session#response-title)

title

string

[​](https://apidocs.sessionboard.com/api-reference/sessions/get-a-session#response-description)

description

string

[​](https://apidocs.sessionboard.com/api-reference/sessions/get-a-session#response-status)

status

enum<string>

Available options:

`accepted`,

`accept_queue`,

`pending`,

`decline_queue`,

`declined`

[​](https://apidocs.sessionboard.com/api-reference/sessions/get-a-session#response-custom-status-id)

custom\_status\_id

string

[​](https://apidocs.sessionboard.com/api-reference/sessions/get-a-session#response-custom-status)

custom\_status

object

Showchild attributes

[​](https://apidocs.sessionboard.com/api-reference/sessions/get-a-session#response-starts-at)

starts\_at

string<date-time>

[​](https://apidocs.sessionboard.com/api-reference/sessions/get-a-session#response-ends-at)

ends\_at

string<date-time>

[​](https://apidocs.sessionboard.com/api-reference/sessions/get-a-session#response-is-public)

is\_public

boolean

[​](https://apidocs.sessionboard.com/api-reference/sessions/get-a-session#response-is-abstract)

is\_abstract

boolean

True for CFP abstract submissions; false for program sessions.

[​](https://apidocs.sessionboard.com/api-reference/sessions/get-a-session#response-composition-status)

composition\_status

object

Summary of how this session participates in a composition (merge or link).
Always present on session responses.

Showchild attributes

[​](https://apidocs.sessionboard.com/api-reference/sessions/get-a-session#response-composition)

composition

object

Present when `expand=composition` is requested.

Showchild attributes

[​](https://apidocs.sessionboard.com/api-reference/sessions/get-a-session#response-external-url)

external\_url

string<uri>

[​](https://apidocs.sessionboard.com/api-reference/sessions/get-a-session#response-client-session-id)

client\_session\_id

string

[​](https://apidocs.sessionboard.com/api-reference/sessions/get-a-session#response-created-at)

created\_at

string<date-time>

[​](https://apidocs.sessionboard.com/api-reference/sessions/get-a-session#response-updated-at)

updated\_at

string<date-time>

[​](https://apidocs.sessionboard.com/api-reference/sessions/get-a-session#response-ceu-credits)

ceu\_credits

number<float>

[​](https://apidocs.sessionboard.com/api-reference/sessions/get-a-session#response-capacity)

capacity

integer

[​](https://apidocs.sessionboard.com/api-reference/sessions/get-a-session#response-custom-fields)

custom\_fields

object\[\]

Showchild attributes

[​](https://apidocs.sessionboard.com/api-reference/sessions/get-a-session#response-translated-fields)

translated\_fields

object\[\]

Showchild attributes

[​](https://apidocs.sessionboard.com/api-reference/sessions/get-a-session#response-speakers)

speakers

object\[\]

Legacy junction-table speakers (`Session_Speakers`). Retained for backwards
compatibility. Each entry includes `participant_role` when the event has
Sessions 2.0 roles configured. Prefer `participants` for new integrations
that need custom program roles or a single flat participant list.

Showchild attributes

[​](https://apidocs.sessionboard.com/api-reference/sessions/get-a-session#response-chairpersons)

chairpersons

object\[\]

Legacy junction-table chairpersons (`Session_Chairpersons`). See `speakers`
for migration guidance.

Showchild attributes

[​](https://apidocs.sessionboard.com/api-reference/sessions/get-a-session#response-moderators)

moderators

object\[\]

Legacy junction-table moderators (`Session_Moderators`). See `speakers`
for migration guidance.

Showchild attributes

[​](https://apidocs.sessionboard.com/api-reference/sessions/get-a-session#response-participants)

participants

object\[\]

Flat list of session participants from the Sessions 2.0 data model
(`Session_Participants` \+ `Session_Roles`). Always returned on session
search and get (no expand flag). Includes custom program roles (for example
Author, Panelist) in addition to the legacy speaker/chairperson/moderator
junction tables. Legacy arrays above remain for backwards compatibility;
each legacy entry also includes `participant_role` when event roles are
configured. Contact profile fields (`photo_url`, `company_name`, `title`,
`address_country`, etc.) are hydrated from the contact record in the event's
default language without requiring expand.

Showchild attributes

[​](https://apidocs.sessionboard.com/api-reference/sessions/get-a-session#response-sponsors)

sponsors

object\[\]

Showchild attributes

[​](https://apidocs.sessionboard.com/api-reference/sessions/get-a-session#response-exhibitors)

exhibitors

object\[\]

Showchild attributes

[​](https://apidocs.sessionboard.com/api-reference/sessions/get-a-session#response-content)

content

object\[\]

Showchild attributes

[​](https://apidocs.sessionboard.com/api-reference/sessions/get-a-session#response-tags)

tags

object\[\]

Showchild attributes

[​](https://apidocs.sessionboard.com/api-reference/sessions/get-a-session#response-language)

language

object

Assigned session language. Includes `id`, `event_id`, `name`, `order`,
`created_at`, and `updated_at` when set. Unassigned values are an
empty object `{}` on `POST` session search responses and `null` on
CRUD proxy responses (`GET` list, create, update, restore).

Showchild attributes

[​](https://apidocs.sessionboard.com/api-reference/sessions/get-a-session#response-track)

track

object

Assigned session track. Includes `id`, `event_id`, `name`, `color`,
`order`, `created_at`, and `updated_at` when set. Unassigned values
are `{}` on `POST` session search and `null` on CRUD proxy responses.

Showchild attributes

[​](https://apidocs.sessionboard.com/api-reference/sessions/get-a-session#response-level)

level

object

Assigned session level. Includes `id`, `name`, `order`, `created_at`,
and `updated_at` when set (no `event_id` on nested objects). Unassigned
values are `{}` on `POST` session search and `null` on CRUD proxy responses.

Showchild attributes

[​](https://apidocs.sessionboard.com/api-reference/sessions/get-a-session#response-format)

format

object

Assigned session format. Nested session objects include only `id` and
`name` (not the full standalone `Format` schema).

Showchild attributes

[​](https://apidocs.sessionboard.com/api-reference/sessions/get-a-session#response-room)

room

object

Assigned room when `location` is `room`. Includes `id`, `name`,
`order`, `capacity`, `created_at`, and `updated_at` when set. Omitted
when location is `external` or unset (`{}` on `POST` search, `null` on
CRUD proxy). `event_id` is not included on nested room objects.

Showchild attributes

[​](https://apidocs.sessionboard.com/api-reference/sessions/get-a-session#response-subsessions)

subsessions

object\[\]

Subsessions of this parent session. Each item defaults to the
minimal `Subsession` shape; pass `expand=subsession_details` to
receive the full `SubsessionDetailed` shape on every subsession
in the array. Composition fields (`is_abstract`,
`composition_status`, optional `composition`) are inherited from
the parent session.

A subsession nested within a parent session. This is the default
minimal shape returned inside `parent.subsessions[]` when the
`subsession_details` expand value is not requested.

To receive the full parent-shape parity (`status`, `custom_status`,
`custom_fields`, `chairpersons`, `moderators`, `sponsors`,
`exhibitors`, `tags`, `language`, `track`, `level`, `room`, etc.),
pass `expand=subsession_details` on the GET or POST search request.
See the `SubsessionDetailed` schema.

`is_abstract`, `composition_status`, and optional `composition`
(when `expand=composition`) are inherited from the parent session.

Alternatively, call `GET /v1/event/{eventId}/sessions/{sessionId}`
with the subsession's UUID directly — the endpoint always returns the
full session shape at the top level.

- Option 1

- Option 2


Showchild attributes

[​](https://apidocs.sessionboard.com/api-reference/sessions/get-a-session#response-admin-url-one-of-0)

admin\_url

string<uri> \| null

Deep link to this entity in the Sessionboard admin UI.

Ctrl+I