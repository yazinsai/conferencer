---
url: "https://apidocs.sessionboard.com/api-reference/contacts/get-a-contacts-sessions.md"
title: undefined
---

> ## Documentation Index
> Fetch the complete documentation index at: https://apidocs.sessionboard.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Get a contact's sessions

> Returns all sessions associated with a specific contact within an
event, including linked composition sources. Each session summary
includes `is_abstract` and `composition_status`. The full
`composition` graph is not available on this lightweight endpoint —
use session GET or search with `expand=composition` for details.




## OpenAPI

````yaml /api-reference/openapi.yaml get /v1/event/{eventId}/contacts/{contactId}/sessions
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
  /v1/event/{eventId}/contacts/{contactId}/sessions:
    get:
      tags:
        - Contacts
      summary: Get a contact's sessions
      description: |
        Returns all sessions associated with a specific contact within an
        event, including linked composition sources. Each session summary
        includes `is_abstract` and `composition_status`. The full
        `composition` graph is not available on this lightweight endpoint —
        use session GET or search with `expand=composition` for details.
      operationId: get-contact-sessions
      parameters:
        - name: eventId
          in: path
          required: true
          schema:
            type: integer
        - name: contactId
          in: path
          required: true
          schema:
            type: string
      responses:
        '200':
          description: OK
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ContactSessionsResponse'
        '401':
          description: Unauthorized
        '404':
          description: Contact not found
components:
  schemas:
    ContactSessionsResponse:
      type: object
      properties:
        sessions:
          type: array
          items:
            $ref: '#/components/schemas/ContactSessionSummary'
        status:
          type: string
          description: |
            Aggregated contact status derived from linked sessions
            (`accepted`, `pending`, or a single session's status).
    ContactSessionSummary:
      type: object
      description: |
        Lightweight session summary for contact session lists. Includes
        composition summary fields but not the full `composition` graph.
      properties:
        id:
          type: string
          format: uuid
        title:
          type: string
        status:
          type: string
        custom_status:
          type: string
          nullable: true
        is_abstract:
          type: boolean
        composition_status:
          $ref: '#/components/schemas/CompositionStatus'
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