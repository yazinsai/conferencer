---
url: "https://apidocs.sessionboard.com/api-reference/session-files/initiate-session-file-upload.md"
title: undefined
---

> ## Documentation Index
> Fetch the complete documentation index at: https://apidocs.sessionboard.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Initiate session file upload

> Creates a file record and returns a short-lived S3 upload URL.
Requires `write:sessions`.

Next: `PUT` the file bytes to `data.upload.url`, then call
`POST .../files/{fileId}/complete`. For files up to **50 MB**, prefer
`POST .../files/upload` (one multipart call). This direct-to-storage
path supports up to **500 MB**.
See [Uploading session files](/guides/uploading-session-files).




## OpenAPI

````yaml /api-reference/openapi.yaml post /v1/event/{eventId}/sessions/{sessionId}/files
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
  /v1/event/{eventId}/sessions/{sessionId}/files:
    post:
      tags:
        - Session Files
      summary: Initiate session file upload
      description: |
        Creates a file record and returns a short-lived S3 upload URL.
        Requires `write:sessions`.

        Next: `PUT` the file bytes to `data.upload.url`, then call
        `POST .../files/{fileId}/complete`. For files up to **50 MB**, prefer
        `POST .../files/upload` (one multipart call). This direct-to-storage
        path supports up to **500 MB**.
        See [Uploading session files](/guides/uploading-session-files).
      operationId: create-session-file
      parameters:
        - $ref: '#/components/parameters/EventId'
        - $ref: '#/components/parameters/SessionId'
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/SessionFileCreateRequest'
            examples:
              powerpoint:
                summary: PowerPoint slides
                value:
                  filename: keynote-slides.pptx
                  size_bytes: 2457600
                  content_type: >-
                    application/vnd.openxmlformats-officedocument.presentationml.presentation
                  title: Keynote slides
              pdf:
                summary: PDF handout
                value:
                  filename: handout.pdf
                  size_bytes: 512000
                  content_type: application/pdf
                  title: Session handout
      responses:
        '201':
          description: Created — upload URL included
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/SessionFileCreateResponse'
        '400':
          description: Validation error (missing fields, oversize, denied type)
        '403':
          description: Missing write:sessions scope
components:
  parameters:
    EventId:
      name: eventId
      in: path
      required: true
      schema:
        type: integer
      description: Event ID
    SessionId:
      name: sessionId
      in: path
      required: true
      schema:
        type: string
        format: uuid
      description: Session UUID
  schemas:
    SessionFileCreateRequest:
      type: object
      required:
        - filename
        - size_bytes
      properties:
        filename:
          type: string
          description: >-
            Original filename including extension (e.g. `slides.pptx`,
            `handout.pdf`).
          example: keynote-slides.pptx
        size_bytes:
          type: integer
          minimum: 1
          maximum: 524288000
          description: >-
            Exact file size in bytes. Maximum 500 MB (524288000) for
            direct-to-storage upload. Use `POST .../files/upload` for files up
            to 50 MB without specifying size.
        content_type:
          type: string
          description: >-
            MIME type. Optional; inferred from the filename extension when
            omitted.
          example: >-
            application/vnd.openxmlformats-officedocument.presentationml.presentation
        mimetype:
          type: string
          description: Alias for `content_type`.
        title:
          type: string
          description: Display title. Defaults to `filename`.
        assigned_participant_id:
          type: string
          format: uuid
          nullable: true
          description: Contact UUID of a session participant to assign this file to.
    SessionFileCreateResponse:
      type: object
      properties:
        data:
          allOf:
            - $ref: '#/components/schemas/Content'
            - type: object
              properties:
                upload:
                  type: object
                  properties:
                    url:
                      type: string
                      format: uri
                      description: Presigned S3 URL — PUT the file bytes here.
                    method:
                      type: string
                      example: PUT
                    headers:
                      type: object
                      properties:
                        Content-Type:
                          type: string
    Content:
      type: object
      description: >-
        A content attachment (file, document, or media) associated with a
        session.
      properties:
        id:
          type: string
          format: uuid
        url:
          type: string
          format: uri
        title:
          type: string
        filename:
          type: string
        size:
          type: integer
        mimetype:
          type: string
        created_at:
          type: string
          format: date-time
        updated_at:
          type: string
          format: date-time
        assigned_participant_id:
          type: string
          format: uuid
          nullable: true
          description: Contact UUID of the session participant this file is assigned to.
        assigned_participant_email:
          type: string
          format: email
          nullable: true
        assigned_participant_name:
          type: string
          nullable: true
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