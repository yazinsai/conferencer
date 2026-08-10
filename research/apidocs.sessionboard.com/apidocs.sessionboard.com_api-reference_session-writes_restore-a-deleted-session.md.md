---
url: "https://apidocs.sessionboard.com/api-reference/session-writes/restore-a-deleted-session.md"
title: undefined
---

> ## Documentation Index
> Fetch the complete documentation index at: https://apidocs.sessionboard.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Restore a deleted session

> Restore a previously soft-deleted session. Requires the `write:sessions` scope.



## OpenAPI

````yaml /api-reference/openapi.yaml post /v1/event/{eventId}/sessions/{sessionId}/restore
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
  /v1/event/{eventId}/sessions/{sessionId}/restore:
    post:
      tags:
        - Session Writes
      summary: Restore a deleted session
      description: >-
        Restore a previously soft-deleted session. Requires the `write:sessions`
        scope.
      operationId: restore-session
      parameters:
        - name: eventId
          in: path
          required: true
          schema:
            type: integer
          description: The event ID.
        - name: sessionId
          in: path
          required: true
          schema:
            type: string
            format: uuid
          description: The session ID.
      responses:
        '200':
          description: Session restored
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Session'
        '401':
          description: Unauthorized
        '403':
          description: Missing write:sessions scope
        '404':
          description: Session not found or not deleted
components:
  schemas:
    Session:
      type: object
      description: >-
        A session within an event (e.g., talk, workshop, panel, or CFP abstract
        submission).
      properties:
        id:
          type: string
          format: uuid
        friendly_id:
          type: string
        friendly_id_raw:
          type: integer
        title:
          type: string
        description:
          type: string
        status:
          type: string
          enum:
            - accepted
            - accept_queue
            - pending
            - decline_queue
            - declined
        custom_status_id:
          type: string
        custom_status:
          type: object
          properties:
            id:
              type: string
            name:
              type: string
        starts_at:
          type: string
          format: date-time
        ends_at:
          type: string
          format: date-time
        is_public:
          type: boolean
        is_abstract:
          type: boolean
          description: True for CFP abstract submissions; false for program sessions.
        composition_status:
          $ref: '#/components/schemas/CompositionStatus'
        composition:
          $ref: '#/components/schemas/CompositionDetail'
          description: Present when `expand=composition` is requested.
        external_url:
          type: string
          format: uri
        client_session_id:
          type: string
        created_at:
          type: string
          format: date-time
        updated_at:
          type: string
          format: date-time
        ceu_credits:
          type: number
          format: float
        capacity:
          type: integer
        custom_fields:
          type: array
          items:
            $ref: '#/components/schemas/CustomFieldValue'
        translated_fields:
          type: array
          items:
            $ref: '#/components/schemas/TranslatedField'
        speakers:
          type: array
          description: >
            Legacy junction-table speakers (`Session_Speakers`). Retained for
            backwards

            compatibility. Each entry includes `participant_role` when the event
            has

            Sessions 2.0 roles configured. Prefer `participants` for new
            integrations

            that need custom program roles or a single flat participant list.
          items:
            $ref: '#/components/schemas/SessionSpeaker'
        chairpersons:
          type: array
          description: >
            Legacy junction-table chairpersons (`Session_Chairpersons`). See
            `speakers`

            for migration guidance.
          items:
            $ref: '#/components/schemas/SessionSpeaker'
        moderators:
          type: array
          description: >
            Legacy junction-table moderators (`Session_Moderators`). See
            `speakers`

            for migration guidance.
          items:
            $ref: '#/components/schemas/SessionSpeaker'
        participants:
          type: array
          description: >
            Flat list of session participants from the Sessions 2.0 data model

            (`Session_Participants` + `Session_Roles`). Always returned on
            session

            search and get (no expand flag). Includes custom program roles (for
            example

            Author, Panelist) in addition to the legacy
            speaker/chairperson/moderator

            junction tables. Legacy arrays above remain for backwards
            compatibility;

            each legacy entry also includes `participant_role` when event roles
            are

            configured. Contact profile fields (`photo_url`, `company_name`,
            `title`,

            `address_country`, etc.) are hydrated from the contact record in the
            event's

            default language without requiring expand.
          items:
            $ref: '#/components/schemas/SessionParticipant'
        sponsors:
          type: array
          items:
            $ref: '#/components/schemas/SessionSponsor'
        exhibitors:
          type: array
          items:
            $ref: '#/components/schemas/SessionExhibitor'
        content:
          type: array
          items:
            $ref: '#/components/schemas/Content'
        tags:
          type: array
          items:
            $ref: '#/components/schemas/Tag'
        language:
          allOf:
            - $ref: '#/components/schemas/Language'
          description: >
            Assigned session language. Includes `id`, `event_id`, `name`,
            `order`,

            `created_at`, and `updated_at` when set. Unassigned values are an

            empty object `{}` on `POST` session search responses and `null` on

            CRUD proxy responses (`GET` list, create, update, restore).
        track:
          allOf:
            - $ref: '#/components/schemas/Track'
          description: >
            Assigned session track. Includes `id`, `event_id`, `name`, `color`,

            `order`, `created_at`, and `updated_at` when set. Unassigned values

            are `{}` on `POST` session search and `null` on CRUD proxy
            responses.
        level:
          allOf:
            - $ref: '#/components/schemas/Level'
          description: >
            Assigned session level. Includes `id`, `name`, `order`,
            `created_at`,

            and `updated_at` when set (no `event_id` on nested objects).
            Unassigned

            values are `{}` on `POST` session search and `null` on CRUD proxy
            responses.
        format:
          type: object
          description: >
            Assigned session format. Nested session objects include only `id`
            and

            `name` (not the full standalone `Format` schema).
          properties:
            id:
              type: string
            name:
              type: string
        room:
          allOf:
            - $ref: '#/components/schemas/Room'
          description: >
            Assigned room when `location` is `room`. Includes `id`, `name`,

            `order`, `capacity`, `created_at`, and `updated_at` when set.
            Omitted

            when location is `external` or unset (`{}` on `POST` search, `null`
            on

            CRUD proxy). `event_id` is not included on nested room objects.
        subsessions:
          type: array
          description: |
            Subsessions of this parent session. Each item defaults to the
            minimal `Subsession` shape; pass `expand=subsession_details` to
            receive the full `SubsessionDetailed` shape on every subsession
            in the array. Composition fields (`is_abstract`,
            `composition_status`, optional `composition`) are inherited from
            the parent session.
          items:
            oneOf:
              - $ref: '#/components/schemas/Subsession'
              - $ref: '#/components/schemas/SubsessionDetailed'
        admin_url:
          type: string
          format: uri
          nullable: true
          description: Deep link to this entity in the Sessionboard admin UI.
      examples:
        - id: 497f6eca-6276-4993-bfeb-53cbbbba6f08
          friendly_id: SESS-8
          friendly_id_raw: 8
          title: Networking
          description: <p>Networking session description</p>
          status: accepted
          starts_at: '2024-03-15T09:00:00Z'
          ends_at: '2024-03-15T10:00:00Z'
          is_public: true
          created_at: '2024-01-10T14:30:00Z'
          updated_at: '2024-03-01T09:15:00Z'
          ceu_credits: 1.5
          capacity: 200
          language:
            id: a1b2c3d4-e5f6-7890-abcd-ef1234567890
            event_id: 42
            name: English
            order: 0
            created_at: '2024-01-01T00:00:00Z'
            updated_at: '2024-01-01T00:00:00Z'
          track:
            id: b2c3d4e5-f6a7-8901-bcde-f12345678901
            event_id: 42
            name: Artificial Intelligence & ML
            color: '#329af0'
            order: 1
            created_at: '2024-01-01T00:00:00Z'
            updated_at: '2024-01-01T00:00:00Z'
          level:
            id: c3d4e5f6-a7b8-9012-cdef-123456789012
            name: Beginner
            order: 2
            created_at: '2024-01-01T00:00:00Z'
            updated_at: '2024-01-01T00:00:00Z'
          format:
            id: d4e5f6a7-b8c9-0123-def0-234567890123
            name: Session
          room:
            id: e5f6a7b8-c9d0-1234-ef01-345678901234
            name: Workshop Room 1
            order: 3
            capacity: 120
            created_at: '2024-01-01T00:00:00Z'
            updated_at: '2024-01-01T00:00:00Z'
          tags: []
          speakers: []
          content: []
          custom_fields: []
          admin_url: >-
            https://app.sessionboard.com/event/42/sessions/497f6eca-6276-4993-bfeb-53cbbbba6f08
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
    CompositionDetail:
      type: object
      description: Full composition graph. Present when `expand=composition`.
      properties:
        target:
          allOf:
            - $ref: '#/components/schemas/CompositionTargetSummary'
          nullable: true
        sources:
          type: array
          items:
            $ref: '#/components/schemas/CompositionSource'
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
    SessionSpeaker:
      type: object
      description: >
        A contact embedded on a session (speaker, chairperson, moderator, or
        other

        program role). Standard contact profile fields (`photo_url`,
        `company_name`,

        `title`, `address_country`, etc.) are hydrated from the contact's module
        field

        values in the event's default language. No expand is required for these
        fields;

        use `expand=translated_fields` for other locales.
      properties:
        id:
          type: string
        participant_role:
          $ref: '#/components/schemas/ParticipantRole'
          description: >
            The event's configured program role for this participant (Sessions
            2.0).

            `name` and `slug` reflect the configured `Session_Roles` record (for
            example

            Author, Panelist). `core_role` is the legacy junction category
            mapping only

            (`speaker`, `chairperson`, `moderator`) and must not be used as the
            display

            role label. Present on legacy `speakers`, `chairpersons`, and
            `moderators`

            entries when the event has `Session_Roles` configured.
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
        instagram_url:
          type: string
        snapchat_username:
          type: string
        tiktok_username:
          type: string
        translated_fields:
          type: array
          items:
            $ref: '#/components/schemas/TranslatedField'
        custom_fields:
          type: array
          items:
            $ref: '#/components/schemas/CustomFieldValue'
    SessionParticipant:
      allOf:
        - $ref: '#/components/schemas/SessionSpeaker'
        - type: object
          description: >
            Sessions 2.0 participant row. Includes the same contact profile
            fields as

            `SessionSpeaker`. `participant_role` is always present (sourced from

            `Session_Roles`).
          properties:
            session_participant_id:
              type: string
              format: uuid
              description: Primary key of the `Session_Participants` row.
    SessionSponsor:
      type: object
      description: A sponsor associated with a session. Same shape as Sponsor.
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
    SessionExhibitor:
      type: object
      description: An exhibitor associated with a session. Same shape as Exhibitor.
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
    Tag:
      type: object
      description: A tag that can be applied to sessions.
      properties:
        id:
          type: string
          format: uuid
        name:
          type: string
        created_at:
          type: string
        updated_at:
          type: string
    Language:
      type: object
      description: |
        A language configured for an event.

        When nested inside a `Session` response, includes `event_id`. Standalone
        metadata list and search endpoints (`GET`/`POST /languages`) omit
        `event_id` because the event is implicit from the URL.
      properties:
        id:
          type: string
          format: uuid
        event_id:
          type: integer
        name:
          type: string
        order:
          type: integer
        created_at:
          type: string
        updated_at:
          type: string
    Track:
      type: object
      description: >
        A session track (e.g., a conference track or topic area).


        When nested inside a `Session` response, includes `event_id`. Standalone

        metadata list and search endpoints (`GET`/`POST /tracks`) omit
        `event_id`

        because the event is implicit from the URL.
      properties:
        id:
          type: string
          format: uuid
        event_id:
          type: integer
        name:
          type: string
        color:
          type: string
        order:
          type: integer
        created_at:
          type: string
        updated_at:
          type: string
    Level:
      type: object
      description: A session difficulty level (e.g., Beginner, Intermediate, Advanced).
      properties:
        id:
          type: string
          format: uuid
        name:
          type: string
        order:
          type: integer
        created_at:
          type: string
        updated_at:
          type: string
    Room:
      type: object
      description: |
        A room or venue location for sessions. When nested inside a `Session`
        response, `room` is only populated when the session `location` is
        `room` (not for external URLs).
      properties:
        id:
          type: string
          format: uuid
        name:
          type: string
        order:
          type: integer
        capacity:
          type: integer
          nullable: true
          description: |
            Maximum room capacity. Returned on nested session `room` objects and
            standalone room list/search endpoints.
        created_at:
          type: string
        updated_at:
          type: string
    Subsession:
      type: object
      description: |
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
      properties:
        id:
          type: string
          format: uuid
        friendly_id:
          type: string
          description: >-
            Human-readable id formatted as
            `<event-prefix>-<parent-friendly-id>-<subsession-number>` (or
            `<event-prefix>-<subsession-friendly-id>` when the event has
            `show_subsession_friendly_id` enabled).
        friendly_id_raw:
          type: integer
          description: Underlying numeric friendly id (the suffix of `friendly_id`).
        parent_session_friendly_id:
          type: string
          description: Human-readable friendly id of the parent session, e.g. `SESS-3370`.
        parent_session_friendly_id_raw:
          type: integer
          description: Numeric friendly id of the parent session.
        title:
          type: string
        description:
          type: string
        starts_at:
          type: string
          format: date-time
        ends_at:
          type: string
          format: date-time
        created_at:
          type: string
          format: date-time
        updated_at:
          type: string
          format: date-time
        translated_fields:
          type: array
          description: >-
            Present only when `expand=translated_fields` is set and the event
            has language variants configured.
          items:
            type: object
        speakers:
          type: array
          items:
            $ref: '#/components/schemas/SessionSpeaker'
        participants:
          type: array
          description: >-
            Sessions 2.0 participants for this subsession (see
            `Session.participants`).
          items:
            $ref: '#/components/schemas/SessionParticipant'
        is_abstract:
          type: boolean
          description: Inherited from the parent session.
        composition_status:
          $ref: '#/components/schemas/CompositionStatus'
        format:
          type: object
          properties:
            id:
              type: string
            name:
              type: string
        content:
          type: array
          items:
            $ref: '#/components/schemas/Content'
    SubsessionDetailed:
      type: object
      description: |
        Full-parity subsession returned inside `parent.subsessions[]` when the
        `subsession_details` expand value is set on the request. The shape
        mirrors `Session` (minus the recursive `subsessions` property, since
        subsessions cannot be nested) and adds the parent-friendly-id fields
        so callers can iterate the array and then call
        `GET /v1/event/{eventId}/sessions/{sessionId}` with each subsession
        id for the same shape at the top level.

        `is_abstract`, `composition_status`, and optional `composition`
        (when `expand=composition`) are inherited from the parent session.
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
        title:
          type: string
        description:
          type: string
        status:
          type: string
        custom_status_id:
          type: string
          format: uuid
          nullable: true
        custom_status:
          $ref: '#/components/schemas/SessionCustomStatus'
        starts_at:
          type: string
          format: date-time
        ends_at:
          type: string
          format: date-time
        is_public:
          type: boolean
        is_abstract:
          type: boolean
          description: Inherited from the parent session.
        composition_status:
          $ref: '#/components/schemas/CompositionStatus'
        external_url:
          type: string
          nullable: true
        client_session_id:
          type: string
          nullable: true
        ceu_credits:
          type: number
          nullable: true
        capacity:
          type: integer
          nullable: true
        translated_fields:
          type: array
          description: >-
            Present only when `expand=translated_fields` is set and the event
            has language variants configured.
          items:
            type: object
        created_at:
          type: string
          format: date-time
        updated_at:
          type: string
          format: date-time
        custom_fields:
          type: array
          items:
            $ref: '#/components/schemas/CustomFieldValue'
        speakers:
          type: array
          items:
            $ref: '#/components/schemas/SessionSpeaker'
        chairpersons:
          type: array
          items:
            $ref: '#/components/schemas/SessionSpeaker'
        moderators:
          type: array
          items:
            $ref: '#/components/schemas/SessionSpeaker'
        participants:
          type: array
          description: >-
            Sessions 2.0 participants for this subsession (see
            `Session.participants`).
          items:
            $ref: '#/components/schemas/SessionParticipant'
        sponsors:
          type: array
          items:
            $ref: '#/components/schemas/Sponsor'
        exhibitors:
          type: array
          items:
            $ref: '#/components/schemas/Exhibitor'
        content:
          type: array
          items:
            $ref: '#/components/schemas/Content'
        tags:
          type: array
          items:
            $ref: '#/components/schemas/Tag'
        language:
          allOf:
            - $ref: '#/components/schemas/Language'
          description: >-
            Same shape as `Session.language` when assigned; `{}` when
            unassigned.
        track:
          allOf:
            - $ref: '#/components/schemas/Track'
          description: Same shape as `Session.track` when assigned; `{}` when unassigned.
        level:
          allOf:
            - $ref: '#/components/schemas/Level'
          description: Same shape as `Session.level` when assigned; `{}` when unassigned.
        format:
          type: object
          description: Nested format includes only `id` and `name`.
          properties:
            id:
              type: string
            name:
              type: string
        room:
          allOf:
            - $ref: '#/components/schemas/Room'
          description: |
            Same shape as `Session.room` when `location` is `room`; `{}` when
            location is external or unset.
        source:
          type: string
      examples:
        - id: ff14c2e4-2abf-4610-8267-0d2935f19576
          friendly_id: SESS-3370-3
          friendly_id_raw: 3052
          parent_session_friendly_id: SESS-3370
          parent_session_friendly_id_raw: 3370
          title: Imagining a better tomorrow
          status: accepted
          is_public: true
          custom_status: null
          custom_fields:
            - id: 749c5737-cde4-44cc-acf6-15a6ccf74a5f
              name: Co-authors
              type: textarea
              internal_name: co_authors
              value: Mohamed Tarik, Mar...
              created_at: '2026-01-21T13:15:57.710Z'
          chairpersons: []
          moderators: []
          sponsors: []
          exhibitors: []
          tags: []
          speakers: []
          content: []
          language:
            id: a1b2c3d4-e5f6-7890-abcd-ef1234567890
            event_id: 72
            name: English
            order: 0
            created_at: '2025-01-01T00:00:00Z'
            updated_at: '2025-02-01T00:00:00Z'
          track:
            id: b2c3d4e5-f6a7-8901-bcde-f12345678901
            event_id: 72
            name: Artificial Intelligence & ML
            color: '#329af0'
            order: 1
            created_at: '2025-01-01T00:00:00Z'
            updated_at: '2025-02-01T00:00:00Z'
          level:
            id: c3d4e5f6-a7b8-9012-cdef-123456789012
            name: Beginner
            order: 2
            created_at: '2025-01-01T00:00:00Z'
            updated_at: '2025-02-01T00:00:00Z'
          format:
            id: d4e5f6a7-b8c9-0123-def0-234567890123
            name: Technical Programme Forum Paper
          room:
            id: e5f6a7b8-c9d0-1234-ef01-345678901234
            name: Workshop Room 1
            order: 3
            capacity: 120
            created_at: '2025-01-01T00:00:00Z'
            updated_at: '2025-02-01T00:00:00Z'
          source: Manual
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
    CompositionSource:
      type: object
      properties:
        composition_id:
          type: string
          format: uuid
        relationship_type:
          type: string
          enum:
            - merged_session
            - merged_abstract
            - composed_into_session
        created_at:
          type: string
          format: date-time
        id:
          type: string
          format: uuid
        friendly_id:
          type: string
        title:
          type: string
        is_abstract:
          type: boolean
    ParticipantRole:
      type: object
      description: >
        An event-configured session participant role (`Session_Roles`). Use
        `name` (or

        `slug` for programmatic matching) as the participant's role label.
        `core_role`

        is the legacy junction category only.
      properties:
        id:
          type: string
          format: uuid
          description: Session_Roles.id
        slug:
          type: string
          description: Stable programmatic identifier for the role within the event.
        name:
          type: string
          description: Display name (singular).
        name_plural:
          type: string
          description: Display name (plural).
        core_role:
          type: string
          enum:
            - speaker
            - chairperson
            - moderator
          description: Legacy junction category this role maps to for integrations.
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
    Exhibitor:
      type: object
      description: An exhibitor associated with an event.
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
        - id: c3d4e5f6-a7b8-9012-cdef-123456789012
          friendly_id: EXH-7
          friendly_id_raw: 7
          name: InnovateTech Labs
          description: Showcasing next-generation event technology solutions.
          logo_image_url: https://cdn.sessionboard.com/logos/innovatetech.png
          address_city: Chicago
          address_state: IL
          address_coutnry: US
          website_url: https://www.innovatetech.example.com
          created_at: '2024-01-12T10:00:00Z'
          updated_at: '2024-03-01T14:00:00Z'
          custom_fields: []
          translated_fields: []
          contacts: []
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