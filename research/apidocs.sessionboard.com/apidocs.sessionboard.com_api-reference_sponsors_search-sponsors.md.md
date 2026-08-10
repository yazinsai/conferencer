---
url: "https://apidocs.sessionboard.com/api-reference/sponsors/search-sponsors.md"
title: undefined
---

> ## Documentation Index
> Fetch the complete documentation index at: https://apidocs.sessionboard.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Search sponsors

> Search and filter sponsors within an event.



## OpenAPI

````yaml /api-reference/openapi.yaml post /v1/event/{eventId}/sponsors
openapi: 3.1.0
info:
  title: Sessionboard Public API
  version: '1.0'
  description: >-
    REST API for managing sessions, speakers, contacts, sponsors, exhibitors,
    and event data on the Sessionboard platform.
  contact:
    name: Sessionboard Support
    email: support@sessionboard.com
  termsOfService: https://www.sessionboard.com/legal/terms-of-service
servers:
  - url: https://public-api.sessionboard.com
    description: US Region
  - url: https://public-api-eu.sessionboard.com
    description: EU Region
security:
  - ApiKey: []
  - BearerToken: []
tags:
  - name: Events
    description: Manage events on the platform.
  - name: Sessions
    description: Search and retrieve sessions within an event.
  - name: Session Writes
    description: >-
      Create, update, delete, and restore sessions. Requires the
      `write:sessions` scope.
  - name: Contact Writes
    description: >-
      Create, update, delete, and restore contacts. Requires the
      `write:contacts` scope.
  - name: Exhibitor Writes
    description: >-
      Create, update, delete, and restore exhibitors. Requires the
      `write:exhibitors` scope.
  - name: Sponsor Writes
    description: >-
      Create, update, delete, and restore sponsors. Requires the
      `write:sponsors` scope.
  - name: Field Writes
    description: >-
      Create, update, and delete custom fields. Requires the `write:fields`
      scope.
  - name: Speakers
    description: Search and retrieve speakers within an event.
  - name: Contacts
    description: Search and retrieve contacts at the organization or event level.
  - name: Sponsors
    description: Search and retrieve sponsors within an event.
  - name: Exhibitors
    description: Search and retrieve exhibitors within an event.
  - name: Event Settings
    description: >-
      Retrieve event configuration such as fields, tags, tracks, rooms, formats,
      levels, languages, and session statuses.
  - name: GDPR
    description: Manage GDPR data access and erasure requests.
  - name: Insights
    description: >-
      Query event data using SbQL, generate queries with AI, and manage
      dashboards.
  - name: Metadata Writes
    description: >-
      Create, update, and delete session metadata (rooms, tracks, tags, formats,
      levels, languages, statuses). Requires the `write:metadata` scope.
  - name: Agenda Planning
    description: >-
      Manage agenda drafts, draft sessions, scheduling rules, and evaluation
      personas. Requires the `write:events` scope.
  - name: Dashboards & Widgets
    description: >-
      Create, read, update, and delete dashboards and widgets at the event or
      organization level. Requires `write:events` scope for writes.
  - name: Reports & Queries
    description: >-
      Create, read, update, delete, and run saved SbQL queries/reports at the
      event or organization level. Requires `write:events` scope for writes.
  - name: Transcriptions
    description: >-
      Transcript text on sessions — fragments, summaries, insights, and
      translations. Requires `read:transcriptions` / `write:transcriptions`
      scopes.
  - name: Session Recordings
    description: >-
      Session audio files for recording archives (live capture or imported
      audio). Requires `read:transcriptions` / `write:transcriptions` scopes.
  - name: Media
    description: >-
      Upload video or audio files for automatic transcription. Requires
      `read:media` / `write:media` scopes.
  - name: Session Files
    description: >
      Documents attached to sessions (PDFs, PowerPoint, Word, images, and
      similar).

      Simple upload: `POST .../files/upload` (multipart, max 50 MB).

      Direct-to-storage: create → PUT → complete (max 500 MB).

      Requires `read:sessions` / `write:sessions` scopes.

      See the [Uploading session files](/guides/uploading-session-files) guide.
  - name: OAuth
    description: >-
      OAuth 2.1 endpoints for AI client authorization (Claude, ChatGPT). Mounted
      at `/oauth/` (not `/v1/`).
paths:
  /v1/event/{eventId}/sponsors:
    post:
      tags:
        - Sponsors
      summary: Search sponsors
      description: Search and filter sponsors within an event.
      operationId: search-sponsors
      parameters:
        - name: eventId
          in: path
          required: true
          schema:
            type: integer
          description: The event ID.
        - $ref: '#/components/parameters/Page'
        - $ref: '#/components/parameters/PageSize'
      requestBody:
        required: false
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/RecordSearchBody'
      responses:
        '200':
          description: OK
          content:
            application/json:
              schema:
                type: object
                properties:
                  results:
                    type: array
                    items:
                      $ref: '#/components/schemas/Sponsor'
                  pagination:
                    $ref: '#/components/schemas/Pagination'
        '401':
          description: Unauthorized
        '404':
          description: Event not found
components:
  parameters:
    Page:
      name: page
      in: query
      required: false
      schema:
        type: integer
        minimum: 1
        maximum: 999
        default: 1
      description: Page number for pagination.
    PageSize:
      name: pageSize
      in: query
      required: false
      schema:
        type: integer
        minimum: 1
        maximum: 100
        default: 25
      description: Number of results per page.
  schemas:
    RecordSearchBody:
      type: object
      description: Common search request body used across multiple endpoints.
      properties:
        filters:
          type: object
          properties:
            createdAt:
              $ref: '#/components/schemas/DateRangeFilter'
            updatedAt:
              $ref: '#/components/schemas/DateRangeFilter'
            status:
              type: string
              enum:
                - accepted
                - accept_queue
                - pending
                - decline_queue
                - declined
              description: Filter by session status (applicable to session searches).
        sort:
          $ref: '#/components/schemas/SortOptions'
        expand:
          type: array
          items:
            type: string
            enum:
              - translated_fields
              - subsession_details
              - linked_sources
              - composition
          description: >
            Expand records with additional data. See the `Expand` parameter for
            `linked_sources` and `composition` details.
    Sponsor:
      type: object
      description: A sponsor associated with an event.
      properties:
        id:
          type: string
        friendly_id:
          type: string
        friendly_id_raw:
          type: integer
        name:
          type: string
        description:
          type: string
        logo_image_url:
          type: string
        banner_image_url:
          type: string
        phone:
          type: string
        address_line_1:
          type: string
        address_line_2:
          type: string
        address_city:
          type: string
        address_state:
          type: string
        address_postal_code:
          type: string
        address_coutnry:
          type: string
          description: >-
            Country (note: field name contains a known typo preserved for
            backwards compatibility).
        facebook_url:
          type: string
        instagram_url:
          type: string
        linkedin_url:
          type: string
        snapchat_username:
          type: string
        tiktok_username:
          type: string
        twitter_url:
          type: string
        website_url:
          type: string
        created_at:
          type: string
        updated_at:
          type: string
        custom_fields:
          type: array
          items:
            $ref: '#/components/schemas/CustomFieldValue'
        translated_fields:
          type: array
          items:
            $ref: '#/components/schemas/TranslatedField'
        contacts:
          type: array
          items:
            $ref: '#/components/schemas/AccountContact'
        admin_url:
          type: string
          format: uri
          nullable: true
          description: Deep link to this entity in the Sessionboard admin UI.
      examples:
        - id: b2c3d4e5-f6a7-8901-bcde-f12345678901
          friendly_id: SPON-3
          friendly_id_raw: 3
          name: TechCorp Global
          description: Platinum sponsor and technology partner.
          logo_image_url: https://cdn.sessionboard.com/logos/techcorp.png
          phone: +1-555-0100
          address_city: San Francisco
          address_state: CA
          address_coutnry: US
          website_url: https://www.techcorp.example.com
          linkedin_url: https://www.linkedin.com/company/techcorp
          created_at: '2024-01-05T08:00:00Z'
          updated_at: '2024-02-20T12:00:00Z'
          custom_fields: []
          translated_fields: []
          contacts: []
    Pagination:
      type: object
      description: Pagination metadata returned with list responses.
      properties:
        currentPage:
          type: integer
          examples:
            - 1
        pageSize:
          type: integer
          examples:
            - 25
        totalPages:
          type: integer
          examples:
            - 4
        totalResults:
          type: integer
          examples:
            - 97
    DateRangeFilter:
      type: object
      description: Filter by a date range using before and/or after bounds.
      properties:
        before:
          type: string
          format: date-time
          description: Return records before this date-time.
        after:
          type: string
          format: date-time
          description: Return records after this date-time.
    SortOptions:
      type: object
      description: Sorting options for search results.
      properties:
        order:
          type: string
          enum:
            - createdAt
            - updatedAt
          description: The field to sort by.
        sort:
          type: string
          enum:
            - asc
            - desc
          description: Sort direction.
    CustomFieldValue:
      type: object
      description: A custom field value attached to a record.
      properties:
        id:
          type: string
        name:
          type: string
        value:
          type: string
        type:
          type: string
        internal_name:
          type: string
        created_at:
          type: string
    TranslatedField:
      type: object
      description: A translated version of a field value.
      properties:
        id:
          type: string
        name:
          type: string
        type:
          type: string
        parent_field_id:
          type: string
        parent_field_source:
          type: string
        parent_field_name:
          type: string
        parent_field_internal_name:
          type: string
        translated_language:
          type: string
        value:
          type: string
    AccountContact:
      type: object
      description: A contact associated with a sponsor or exhibitor account.
      properties:
        id:
          type: string
        friendly_id:
          type: string
        friendly_id_raw:
          type: integer
        full_name:
          type: string
        first_name:
          type: string
        last_name:
          type: string
        email:
          type: string
        photo_url:
          type: string
        company_name:
          type: string
        title:
          type: string
        about:
          type: string
        is_primary:
          type: boolean
        contact_created_at:
          type: string
        contact_updated_at:
          type: string
        relationship_created_at:
          type: string
        relationship_updated_at:
          type: string
  securitySchemes:
    ApiKey:
      type: apiKey
      in: header
      name: x-access-token
      description: >-
        Organization API token. Generate from Organization Settings → API
        Tokens.
    BearerToken:
      type: http
      scheme: bearer
      description: >-
        OAuth 2.1 access token. Obtained via the OAuth PKCE flow at
        `/oauth/token`.

````