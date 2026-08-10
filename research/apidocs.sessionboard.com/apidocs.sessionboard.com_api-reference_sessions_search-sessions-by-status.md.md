---
url: "https://apidocs.sessionboard.com/api-reference/sessions/search-sessions-by-status.md"
title: undefined
---

> ## Documentation Index
> Fetch the complete documentation index at: https://apidocs.sessionboard.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Search sessions by status

> Returns a lightweight list of session statuses, including deleted
sessions. Supports filtering by `deletedAt` in addition to standard
filters.

Parent rows additionally include a `subsessions` array with the same
minimal status-focused shape for each child subsession
(`SubsessionStatus`). Subsession rows that appear in the flat
results continue to surface with their own row (for back-compat) and
carry an empty `subsessions` array.




## OpenAPI

````yaml /api-reference/openapi.yaml post /v1/event/{eventId}/sessions/status
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
  /v1/event/{eventId}/sessions/status:
    post:
      tags:
        - Sessions
      summary: Search sessions by status
      description: |
        Returns a lightweight list of session statuses, including deleted
        sessions. Supports filtering by `deletedAt` in addition to standard
        filters.

        Parent rows additionally include a `subsessions` array with the same
        minimal status-focused shape for each child subsession
        (`SubsessionStatus`). Subsession rows that appear in the flat
        results continue to surface with their own row (for back-compat) and
        carry an empty `subsessions` array.
      operationId: search-sessions-by-status
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
                    createdAt:
                      $ref: '#/components/schemas/DateRangeFilter'
                    updatedAt:
                      $ref: '#/components/schemas/DateRangeFilter'
                    deletedAt:
                      $ref: '#/components/schemas/DateRangeFilter'
                    status:
                      type: string
                      enum:
                        - accepted
                        - accept_queue
                        - pending
                        - decline_queue
                        - declined
                sort:
                  type: object
                  properties:
                    order:
                      type: string
                      enum:
                        - createdAt
                        - updatedAt
                        - deletedAt
                    sort:
                      type: string
                      enum:
                        - asc
                        - desc
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
                      $ref: '#/components/schemas/SessionStatus'
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
    SessionStatus:
      type: object
      description: |
        A lightweight representation of a session's status, including
        soft-deleted sessions. Parent rows additionally include a
        `subsessions` array with the same minimal status-focused shape for
        each child subsession. Subsession rows that appear in the flat list
        return an empty `subsessions` array.
      properties:
        id:
          type: string
          format: uuid
        friendly_id:
          type: string
        friendly_id_raw:
          type: integer
        status:
          type: string
        custom_status_id:
          type: string
          format: uuid
          nullable: true
        custom_status:
          $ref: '#/components/schemas/SessionCustomStatus'
        is_abstract:
          type: boolean
        composition_status:
          $ref: '#/components/schemas/CompositionStatus'
        deleted_at:
          type: string
          format: date-time
          nullable: true
        created_at:
          type: string
          format: date-time
        updated_at:
          type: string
          format: date-time
        subsessions:
          type: array
          description: >-
            Empty for subsession rows. Populated with `SubsessionStatus` items
            for parent rows.
          items:
            $ref: '#/components/schemas/SubsessionStatus'
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
    SessionCustomStatus:
      type: object
      description: A custom session status definition configured for an event.
      properties:
        id:
          type: string
        name:
          type: string
        status:
          type: string
          nullable: true
        status_name:
          type: string
          nullable: true
        color:
          type: string
        order:
          type: integer
        is_custom:
          type: boolean
        created_at:
          type: string
          nullable: true
        created_by_user_id:
          type: integer
          nullable: true
        created_by_user_name:
          type: string
          nullable: true
    CompositionStatus:
      type: object
      description: >
        Summary of how this session participates in a composition (merge or
        link).

        Always present on session responses.
      properties:
        role:
          type: string
          enum:
            - standalone
            - target
            - source
          description: |
            - `standalone` — normal editable record
            - `target` — composite parent with one or more linked sources
            - `source` — linked into another record (read-only)
        is_linked:
          type: boolean
        is_read_only:
          type: boolean
        source_count:
          type: integer
          description: Number of records merged or linked into this session.
        target:
          allOf:
            - $ref: '#/components/schemas/CompositionTargetSummary'
          nullable: true
          description: Present when `role` is `source`.
    SubsessionStatus:
      type: object
      description: >-
        A lightweight representation of a subsession's status, included as part
        of the parent SessionStatus response.
      properties:
        id:
          type: string
          format: uuid
        friendly_id:
          type: string
        friendly_id_raw:
          type: integer
        parent_session_friendly_id:
          type: string
        parent_session_friendly_id_raw:
          type: integer
        status:
          type: string
          nullable: true
          description: |
            The subsession's own approval status from the database. The API does
            not inherit the parent session's status. May be null when the
            subsession has no explicit status set.
        custom_status_id:
          type: string
          format: uuid
          nullable: true
        custom_status:
          $ref: '#/components/schemas/SessionCustomStatus'
        deleted_at:
          type: string
          format: date-time
          nullable: true
        created_at:
          type: string
          format: date-time
        updated_at:
          type: string
          format: date-time
    CompositionTargetSummary:
      type: object
      description: Summary of a related session in a composition relationship.
      properties:
        id:
          type: string
          format: uuid
        friendly_id:
          type: string
        title:
          type: string
        is_abstract:
          type: boolean
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