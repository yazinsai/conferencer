---
url: "https://apidocs.sessionboard.com/api-reference/contact-writes/bulk-contact-operations.md"
title: undefined
---

> ## Documentation Index
> Fetch the complete documentation index at: https://apidocs.sessionboard.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Bulk contact operations

> Create, update, or delete multiple contacts in a single request (max 100 operations). Requires the `write:contacts` scope.



## OpenAPI

````yaml /api-reference/openapi.yaml post /v1/event/{eventId}/contacts/bulk
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
  /v1/event/{eventId}/contacts/bulk:
    post:
      tags:
        - Contact Writes
      summary: Bulk contact operations
      description: >-
        Create, update, or delete multiple contacts in a single request (max 100
        operations). Requires the `write:contacts` scope.
      operationId: bulk-contacts
      parameters:
        - name: eventId
          in: path
          required: true
          schema:
            type: integer
          description: The event ID.
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/BulkOperations'
      responses:
        '200':
          description: Bulk operation completed
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/BulkResponse'
        '401':
          description: Unauthorized
        '403':
          description: Missing write:contacts scope
        '429':
          description: Rate limit or daily quota exceeded
components:
  schemas:
    BulkOperations:
      type: object
      description: Request body for bulk create/update/delete operations.
      required:
        - operations
      properties:
        operations:
          type: array
          maxItems: 100
          description: Array of operations to execute (max 100).
          items:
            type: object
            required:
              - action
            properties:
              action:
                type: string
                enum:
                  - create
                  - update
                  - delete
                description: The operation to perform.
              id:
                type: string
                format: uuid
                description: Entity ID. Required for `update` and `delete` actions.
              data:
                type: object
                description: >
                  Entity-specific fields. Required for `create` and `update`
                  actions.

                  Session create supports `is_abstract` (boolean, default
                  false).

                  `is_abstract` cannot be changed on update.
    BulkResponse:
      type: object
      description: Response body for bulk operations, including per-item results.
      properties:
        batch_id:
          type: string
          format: uuid
          description: Unique identifier for this bulk batch.
        results:
          type: array
          description: Per-operation results in the same order as the request.
          items:
            type: object
            properties:
              index:
                type: integer
                description: Zero-based index of the operation in the request array.
              action:
                type: string
                description: The action that was performed (create, update, delete).
              status:
                type: string
                enum:
                  - success
                  - error
                description: Whether this individual operation succeeded or failed.
              id:
                type: string
                format: uuid
                description: The ID of the created or affected entity.
              error:
                type: object
                description: Error details (only present when status is error).
                properties:
                  code:
                    type: string
                    description: Machine-readable error code.
                  message:
                    type: string
                    description: Human-readable error description.
        stats:
          type: object
          description: Summary statistics for the batch.
          properties:
            total:
              type: integer
              description: Total number of operations in the batch.
            succeeded:
              type: integer
              description: Number of operations that succeeded.
            failed:
              type: integer
              description: Number of operations that failed.
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