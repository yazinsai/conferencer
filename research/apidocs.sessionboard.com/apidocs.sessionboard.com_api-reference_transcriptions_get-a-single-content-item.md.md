---
url: "https://apidocs.sessionboard.com/api-reference/transcriptions/get-a-single-content-item.md"
title: undefined
---

> ## Documentation Index
> Fetch the complete documentation index at: https://apidocs.sessionboard.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Get a single content item

> Resolve one content item. `itemId` may be a session UUID (composed transcription),
a summary/insight/podcast UUID, or a document type (`summary_pdf`, `summary_card`,
`event_report`, `recap`). Document types `summary_pdf` / `summary_card` require
`session_id`. Requires `read:transcriptions` scope.




## OpenAPI

````yaml /api-reference/openapi.yaml get /v1/event/{eventId}/content/items/{itemId}
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
  /v1/event/{eventId}/content/items/{itemId}:
    get:
      tags:
        - Transcriptions
      summary: Get a single content item
      description: >
        Resolve one content item. `itemId` may be a session UUID (composed
        transcription),

        a summary/insight/podcast UUID, or a document type (`summary_pdf`,
        `summary_card`,

        `event_report`, `recap`). Document types `summary_pdf` / `summary_card`
        require

        `session_id`. Requires `read:transcriptions` scope.
      operationId: get-content-item
      parameters:
        - $ref: '#/components/parameters/EventId'
        - name: itemId
          in: path
          required: true
          schema:
            type: string
        - name: session_id
          in: query
          schema:
            type: string
            format: uuid
        - name: interval_sec
          in: query
          schema:
            type: integer
            minimum: 1
        - name: provider
          in: query
          schema:
            type: string
      responses:
        '200':
          description: OK
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ContentItemResponse'
        '400':
          description: Validation error
        '403':
          description: Missing read:transcriptions scope
        '404':
          description: Not found
components:
  parameters:
    EventId:
      name: eventId
      in: path
      required: true
      schema:
        type: integer
      description: Event ID
  schemas:
    ContentItemResponse:
      type: object
      properties:
        data:
          $ref: '#/components/schemas/ContentItem'
    ContentItem:
      type: object
      description: Typed item inside a session or event content pack.
      properties:
        id:
          oneOf:
            - type: string
              format: uuid
            - type: string
            - type: 'null'
        type:
          type: string
          enum:
            - transcription
            - summary
            - insight
            - podcast
            - document
            - recap
        session_id:
          type: string
          format: uuid
        text:
          type: string
          description: Full joined transcript (transcription items).
        elements:
          type: array
          items:
            $ref: '#/components/schemas/TranscriptionElement'
        fragment_count:
          type: integer
        interval_sec:
          type: integer
          nullable: true
        language_code:
          type: string
        summary_type:
          type: string
        provider:
          type: string
        content:
          type: object
        topics:
          type: array
          items:
            type: object
        insight_type:
          type: string
        name:
          type: string
        metadata:
          type: object
          nullable: true
        status:
          type: string
        url:
          type: string
          nullable: true
        duration_sec:
          type: integer
          nullable: true
        generated_at:
          type: string
          format: date-time
          nullable: true
        expires_at:
          type: string
          format: date-time
          nullable: true
        document_type:
          type: string
          enum:
            - summary_pdf
            - summary_card
            - event_report
        content_type:
          type: string
        scope:
          type: string
        quotes:
          type: array
          items:
            type: object
        summaries:
          type: array
          items:
            type: object
        created_at:
          type: string
          format: date-time
        updated_at:
          type: string
          format: date-time
    TranscriptionElement:
      type: object
      properties:
        value:
          type: string
        speaker:
          type: object
          properties:
            id:
              type: string
            label:
              type: string
            name:
              type: string
              nullable: true
        start_time:
          type: number
        end_time:
          type: number
        fragment_ids:
          type: array
          items:
            type: string
            format: uuid
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