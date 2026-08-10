---
url: "https://apidocs.sessionboard.com/api-reference/contacts/search-organization-contacts.md"
title: undefined
---

> ## Documentation Index
> Fetch the complete documentation index at: https://apidocs.sessionboard.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Search organization contacts

> Search and filter contacts across the organization.



## OpenAPI

````yaml /api-reference/openapi.yaml post /v1/organization/{orgId}/contacts
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
  /v1/organization/{orgId}/contacts:
    post:
      tags:
        - Contacts
      summary: Search organization contacts
      description: Search and filter contacts across the organization.
      operationId: search-org-contacts
      parameters:
        - name: orgId
          in: path
          required: true
          schema:
            type: string
            format: uuid
          description: The organization ID (UUID).
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
                      $ref: '#/components/schemas/Contact'
                  pagination:
                    $ref: '#/components/schemas/Pagination'
        '401':
          description: Unauthorized
        '404':
          description: Organization not found
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
    Contact:
      type: object
      description: >-
        A contact (speaker, attendee, or organizational contact) in
        Sessionboard.
      properties:
        id:
          type: string
        friendly_id:
          type: string
        full_name:
          type: string
        first_name:
          type: string
        last_name:
          type: string
        email:
          type: string
        created_at:
          type: string
        updated_at:
          type: string
        photo_url:
          type: string
        company_name:
          type: string
        title:
          type: string
        about:
          type: string
        phone_home:
          type: string
        phone_mobile:
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
        address_country:
          type: string
        website_url:
          type: string
        linkedin_url:
          type: string
        twitter_url:
          type: string
        facebook_url:
          type: string
        honorific:
          type: string
        salutation:
          type: string
        pronouns:
          type: string
        gender:
          type: string
        past_companies:
          type: string
        educational_affiliation:
          type: string
        highest_level_of_education:
          type: string
        ethnicity:
          type: string
        languages:
          type: string
        speaker_score:
          type: string
        organization_contact:
          type: string
        speaker_fee:
          type: string
        availability:
          type: string
        preferred_session_format:
          type: string
        annual_revenue:
          type: string
        headcount:
          type: string
        years_in_operation:
          type: string
        organization_structure:
          type: string
        industry:
          type: string
        global_region:
          type: string
        audience_type:
          type: string
        target_age_range:
          type: string
        topic_expertise:
          type: string
        brand:
          type: string
        translated_fields:
          type: array
          items:
            $ref: '#/components/schemas/TranslatedField'
        custom_fields:
          type: array
          items:
            $ref: '#/components/schemas/CustomFieldValue'
        admin_url:
          type: string
          format: uri
          nullable: true
          description: Deep link to this entity in the Sessionboard admin UI.
      examples:
        - id: a1b2c3d4-e5f6-7890-abcd-ef1234567890
          friendly_id: SPK-42
          full_name: Dr. Jane Smith
          first_name: Jane
          last_name: Smith
          email: jane.smith@university.edu
          created_at: '2023-11-01T10:00:00Z'
          updated_at: '2024-02-15T16:30:00Z'
          photo_url: https://cdn.sessionboard.com/photos/jane-smith.jpg
          company_name: State University
          title: Professor of Computer Science
          about: Dr. Smith is a leading researcher in distributed systems.
          address_city: Austin
          address_state: TX
          address_country: US
          honorific: Dr.
          pronouns: she/her
          topic_expertise: Distributed Systems, Cloud Computing
          custom_fields: []
          translated_fields: []
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