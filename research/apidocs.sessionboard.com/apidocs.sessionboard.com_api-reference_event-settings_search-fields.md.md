---
url: "https://apidocs.sessionboard.com/api-reference/event-settings/search-fields.md"
title: undefined
---

> ## Documentation Index
> Fetch the complete documentation index at: https://apidocs.sessionboard.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Search fields

> Search and filter field definitions for an event, including standard and custom fields.



## OpenAPI

````yaml /api-reference/openapi.yaml post /v1/event/{eventId}/fields
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
  /v1/event/{eventId}/fields:
    post:
      tags:
        - Event Settings
      summary: Search fields
      description: >-
        Search and filter field definitions for an event, including standard and
        custom fields.
      operationId: search-fields
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
              type: object
              properties:
                filters:
                  type: object
                  properties:
                    module:
                      type: string
                      enum:
                        - session
                        - account
                        - contact
                      description: Filter by module type.
                    source:
                      type: string
                      enum:
                        - standard
                        - custom
                      description: Filter by field source.
                    scope:
                      type: string
                      enum:
                        - global
                        - event
                      description: Filter by field scope.
                    createdAt:
                      $ref: '#/components/schemas/DateRangeFilter'
                    updatedAt:
                      $ref: '#/components/schemas/DateRangeFilter'
                sort:
                  $ref: '#/components/schemas/SortOptions'
                expand:
                  type: array
                  items:
                    type: string
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
                      $ref: '#/components/schemas/Field'
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
    Field:
      type: object
      description: A field definition (standard or custom) for an event module.
      properties:
        id:
          type: string
        internal_name:
          type: string
        public_name:
          type: string
        field_type:
          type: string
        field_source:
          type: string
        contains_pii:
          type: boolean
          description: >-
            Whether this field contains personally identifiable information
            (PII).
        scope:
          type: string
        createdAt:
          type: string
        updatedAt:
          type: string
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