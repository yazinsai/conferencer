---
url: "https://apidocs.sessionboard.com/api-reference/sessions/search-sessions"
title: "Search sessions - Sessionboard API"
---

> ## Documentation Index
>
> Fetch the complete documentation index at: [/llms.txt](https://apidocs.sessionboard.com/llms.txt)
>
> Use this file to discover all available pages before exploring further.

[Skip to main content](https://apidocs.sessionboard.com/api-reference/sessions/search-sessions#content-area)

Search sessions

cURL

```
curl --request POST \
  --url 'https://public-api.sessionboard.com/v1/event/{eventId}/sessions?page=1&pageSize=25' \
  --header 'Content-Type: application/json' \
  --header 'x-access-token: <api-key>' \
  --data '
{
  "filters": {
    "createdAt": {
      "before": "2023-11-07T05:31:56Z",
      "after": "2023-11-07T05:31:56Z"
    },
    "updatedAt": {
      "before": "2023-11-07T05:31:56Z",
      "after": "2023-11-07T05:31:56Z"
    },
    "isAbstract": true
  },
  "sort": {},
  "expand": []
}
'
```

```
import requests

url = "https://public-api.sessionboard.com/v1/event/{eventId}/sessions?page=1&pageSize=25"

payload = {
    "filters": {
        "createdAt": {
            "before": "2023-11-07T05:31:56Z",
            "after": "2023-11-07T05:31:56Z"
        },
        "updatedAt": {
            "before": "2023-11-07T05:31:56Z",
            "after": "2023-11-07T05:31:56Z"
        },
        "isAbstract": True
    },
    "sort": {},
    "expand": []
}
headers = {
    "x-access-token": "<api-key>",
    "Content-Type": "application/json"
}

response = requests.post(url, json=payload, headers=headers)

print(response.text)
```

```
const options = {
  method: 'POST',
  headers: {'x-access-token': '<api-key>', 'Content-Type': 'application/json'},
  body: JSON.stringify({
    filters: {
      createdAt: {before: '2023-11-07T05:31:56Z', after: '2023-11-07T05:31:56Z'},
      updatedAt: {before: '2023-11-07T05:31:56Z', after: '2023-11-07T05:31:56Z'},
      isAbstract: true
    },
    sort: {},
    expand: []
  })
};

fetch('https://public-api.sessionboard.com/v1/event/{eventId}/sessions?page=1&pageSize=25', options)
  .then(res => res.json())
  .then(res => console.log(res))
  .catch(err => console.error(err));
```

```
<?php

$curl = curl_init();

curl_setopt_array($curl, [\
  CURLOPT_URL => "https://public-api.sessionboard.com/v1/event/{eventId}/sessions?page=1&pageSize=25",\
  CURLOPT_RETURNTRANSFER => true,\
  CURLOPT_ENCODING => "",\
  CURLOPT_MAXREDIRS => 10,\
  CURLOPT_TIMEOUT => 30,\
  CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,\
  CURLOPT_CUSTOMREQUEST => "POST",\
  CURLOPT_POSTFIELDS => json_encode([\
    'filters' => [\
        'createdAt' => [\
                'before' => '2023-11-07T05:31:56Z',\
                'after' => '2023-11-07T05:31:56Z'\
        ],\
        'updatedAt' => [\
                'before' => '2023-11-07T05:31:56Z',\
                'after' => '2023-11-07T05:31:56Z'\
        ],\
        'isAbstract' => true\
    ],\
    'sort' => [\
\
    ],\
    'expand' => [\
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

	url := "https://public-api.sessionboard.com/v1/event/{eventId}/sessions?page=1&pageSize=25"

	payload := strings.NewReader("{\n  \"filters\": {\n    \"createdAt\": {\n      \"before\": \"2023-11-07T05:31:56Z\",\n      \"after\": \"2023-11-07T05:31:56Z\"\n    },\n    \"updatedAt\": {\n      \"before\": \"2023-11-07T05:31:56Z\",\n      \"after\": \"2023-11-07T05:31:56Z\"\n    },\n    \"isAbstract\": true\n  },\n  \"sort\": {},\n  \"expand\": []\n}")

	req, _ := http.NewRequest("POST", url, payload)

	req.Header.Add("x-access-token", "<api-key>")
	req.Header.Add("Content-Type", "application/json")

	res, _ := http.DefaultClient.Do(req)

	defer res.Body.Close()
	body, _ := io.ReadAll(res.Body)

	fmt.Println(string(body))

}
```

```
HttpResponse<String> response = Unirest.post("https://public-api.sessionboard.com/v1/event/{eventId}/sessions?page=1&pageSize=25")
  .header("x-access-token", "<api-key>")
  .header("Content-Type", "application/json")
  .body("{\n  \"filters\": {\n    \"createdAt\": {\n      \"before\": \"2023-11-07T05:31:56Z\",\n      \"after\": \"2023-11-07T05:31:56Z\"\n    },\n    \"updatedAt\": {\n      \"before\": \"2023-11-07T05:31:56Z\",\n      \"after\": \"2023-11-07T05:31:56Z\"\n    },\n    \"isAbstract\": true\n  },\n  \"sort\": {},\n  \"expand\": []\n}")
  .asString();
```

```
require 'uri'
require 'net/http'

url = URI("https://public-api.sessionboard.com/v1/event/{eventId}/sessions?page=1&pageSize=25")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true

request = Net::HTTP::Post.new(url)
request["x-access-token"] = '<api-key>'
request["Content-Type"] = 'application/json'
request.body = "{\n  \"filters\": {\n    \"createdAt\": {\n      \"before\": \"2023-11-07T05:31:56Z\",\n      \"after\": \"2023-11-07T05:31:56Z\"\n    },\n    \"updatedAt\": {\n      \"before\": \"2023-11-07T05:31:56Z\",\n      \"after\": \"2023-11-07T05:31:56Z\"\n    },\n    \"isAbstract\": true\n  },\n  \"sort\": {},\n  \"expand\": []\n}"

response = http.request(request)
puts response.read_body
```

200

```
{
  "results": [\
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
    "currentPage": 123,
    "pageSize": 123,
    "totalPages": 123,
    "totalResults": 123
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

Try it

Search sessions

cURL

```
curl --request POST \
  --url 'https://public-api.sessionboard.com/v1/event/{eventId}/sessions?page=1&pageSize=25' \
  --header 'Content-Type: application/json' \
  --header 'x-access-token: <api-key>' \
  --data '
{
  "filters": {
    "createdAt": {
      "before": "2023-11-07T05:31:56Z",
      "after": "2023-11-07T05:31:56Z"
    },
    "updatedAt": {
      "before": "2023-11-07T05:31:56Z",
      "after": "2023-11-07T05:31:56Z"
    },
    "isAbstract": true
  },
  "sort": {},
  "expand": []
}
'
```

```
import requests

url = "https://public-api.sessionboard.com/v1/event/{eventId}/sessions?page=1&pageSize=25"

payload = {
    "filters": {
        "createdAt": {
            "before": "2023-11-07T05:31:56Z",
            "after": "2023-11-07T05:31:56Z"
        },
        "updatedAt": {
            "before": "2023-11-07T05:31:56Z",
            "after": "2023-11-07T05:31:56Z"
        },
        "isAbstract": True
    },
    "sort": {},
    "expand": []
}
headers = {
    "x-access-token": "<api-key>",
    "Content-Type": "application/json"
}

response = requests.post(url, json=payload, headers=headers)

print(response.text)
```

```
const options = {
  method: 'POST',
  headers: {'x-access-token': '<api-key>', 'Content-Type': 'application/json'},
  body: JSON.stringify({
    filters: {
      createdAt: {before: '2023-11-07T05:31:56Z', after: '2023-11-07T05:31:56Z'},
      updatedAt: {before: '2023-11-07T05:31:56Z', after: '2023-11-07T05:31:56Z'},
      isAbstract: true
    },
    sort: {},
    expand: []
  })
};

fetch('https://public-api.sessionboard.com/v1/event/{eventId}/sessions?page=1&pageSize=25', options)
  .then(res => res.json())
  .then(res => console.log(res))
  .catch(err => console.error(err));
```

```
<?php

$curl = curl_init();

curl_setopt_array($curl, [\
  CURLOPT_URL => "https://public-api.sessionboard.com/v1/event/{eventId}/sessions?page=1&pageSize=25",\
  CURLOPT_RETURNTRANSFER => true,\
  CURLOPT_ENCODING => "",\
  CURLOPT_MAXREDIRS => 10,\
  CURLOPT_TIMEOUT => 30,\
  CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,\
  CURLOPT_CUSTOMREQUEST => "POST",\
  CURLOPT_POSTFIELDS => json_encode([\
    'filters' => [\
        'createdAt' => [\
                'before' => '2023-11-07T05:31:56Z',\
                'after' => '2023-11-07T05:31:56Z'\
        ],\
        'updatedAt' => [\
                'before' => '2023-11-07T05:31:56Z',\
                'after' => '2023-11-07T05:31:56Z'\
        ],\
        'isAbstract' => true\
    ],\
    'sort' => [\
\
    ],\
    'expand' => [\
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

	url := "https://public-api.sessionboard.com/v1/event/{eventId}/sessions?page=1&pageSize=25"

	payload := strings.NewReader("{\n  \"filters\": {\n    \"createdAt\": {\n      \"before\": \"2023-11-07T05:31:56Z\",\n      \"after\": \"2023-11-07T05:31:56Z\"\n    },\n    \"updatedAt\": {\n      \"before\": \"2023-11-07T05:31:56Z\",\n      \"after\": \"2023-11-07T05:31:56Z\"\n    },\n    \"isAbstract\": true\n  },\n  \"sort\": {},\n  \"expand\": []\n}")

	req, _ := http.NewRequest("POST", url, payload)

	req.Header.Add("x-access-token", "<api-key>")
	req.Header.Add("Content-Type", "application/json")

	res, _ := http.DefaultClient.Do(req)

	defer res.Body.Close()
	body, _ := io.ReadAll(res.Body)

	fmt.Println(string(body))

}
```

```
HttpResponse<String> response = Unirest.post("https://public-api.sessionboard.com/v1/event/{eventId}/sessions?page=1&pageSize=25")
  .header("x-access-token", "<api-key>")
  .header("Content-Type", "application/json")
  .body("{\n  \"filters\": {\n    \"createdAt\": {\n      \"before\": \"2023-11-07T05:31:56Z\",\n      \"after\": \"2023-11-07T05:31:56Z\"\n    },\n    \"updatedAt\": {\n      \"before\": \"2023-11-07T05:31:56Z\",\n      \"after\": \"2023-11-07T05:31:56Z\"\n    },\n    \"isAbstract\": true\n  },\n  \"sort\": {},\n  \"expand\": []\n}")
  .asString();
```

```
require 'uri'
require 'net/http'

url = URI("https://public-api.sessionboard.com/v1/event/{eventId}/sessions?page=1&pageSize=25")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true

request = Net::HTTP::Post.new(url)
request["x-access-token"] = '<api-key>'
request["Content-Type"] = 'application/json'
request.body = "{\n  \"filters\": {\n    \"createdAt\": {\n      \"before\": \"2023-11-07T05:31:56Z\",\n      \"after\": \"2023-11-07T05:31:56Z\"\n    },\n    \"updatedAt\": {\n      \"before\": \"2023-11-07T05:31:56Z\",\n      \"after\": \"2023-11-07T05:31:56Z\"\n    },\n    \"isAbstract\": true\n  },\n  \"sort\": {},\n  \"expand\": []\n}"

response = http.request(request)
puts response.read_body
```

200

```
{
  "results": [\
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
    "currentPage": 123,
    "pageSize": 123,
    "totalPages": 123,
    "totalResults": 123
  }
}
```

#### Authorizations

ApiKeyBearerTokenApiKeyBearerToken

[​](https://apidocs.sessionboard.com/api-reference/sessions/search-sessions#authorization-x-access-token)

x-access-token

string

header

required

Organization API token. Generate from Organization Settings → API Tokens.

#### Path Parameters

[​](https://apidocs.sessionboard.com/api-reference/sessions/search-sessions#parameter-event-id)

eventId

integer

required

The event ID.

#### Query Parameters

[​](https://apidocs.sessionboard.com/api-reference/sessions/search-sessions#parameter-page)

page

integer

default:1

Page number for pagination.

Required range: `1 <= x <= 999`

[​](https://apidocs.sessionboard.com/api-reference/sessions/search-sessions#parameter-page-size)

pageSize

integer

default:25

Number of results per page.

Required range: `1 <= x <= 100`

#### Body

application/json

Search request body for sessions with status filtering.

[​](https://apidocs.sessionboard.com/api-reference/sessions/search-sessions#body-filters)

filters

object

Showchild attributes

[​](https://apidocs.sessionboard.com/api-reference/sessions/search-sessions#body-sort)

sort

object

Sorting options for search results.

Showchild attributes

[​](https://apidocs.sessionboard.com/api-reference/sessions/search-sessions#body-expand)

expand

enum<string>\[\]

Available options:

`translated_fields`,

`subsession_details`,

`linked_sources`,

`composition`

#### Response

200

application/json

OK

[​](https://apidocs.sessionboard.com/api-reference/sessions/search-sessions#response-results)

results

object\[\]

Showchild attributes

[​](https://apidocs.sessionboard.com/api-reference/sessions/search-sessions#response-pagination)

pagination

object

Pagination metadata returned with list responses.

Showchild attributes

Ctrl+I