---
url: "https://apidocs.sessionboard.com/api-reference/sessions-composition.md"
title: undefined
---

> ## Documentation Index
> Fetch the complete documentation index at: https://apidocs.sessionboard.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Sessions & Composition

> Abstract vs program sessions, composition_status, and expand options for linked records.

# Sessions, abstracts & composition

Sessions and CFP abstract submissions share the same API resource. Use `is_abstract` to tell them apart.

## `is_abstract`

| Value   | Meaning                   |
| ------- | ------------------------- |
| `false` | Program session (default) |
| `true`  | CFP / abstract submission |

Every session response includes `is_abstract`. Filter list/search results with `filters.isAbstract` in `POST /v1/event/{eventId}/sessions`.

Create an abstract on write:

```json theme={null}
POST /v1/event/{eventId}/sessions/create
{
  "title": "Novel approach to speaker management",
  "is_abstract": true
}
```

Requires the **Sessions 2.0** feature on the event. `is_abstract` cannot be changed after create.

## `composition_status`

Always present on session payloads — a lightweight summary of merge/link state:

```json theme={null}
{
  "composition_status": {
    "role": "source",
    "is_linked": true,
    "is_read_only": true,
    "source_count": 0,
    "target": {
      "id": "...",
      "friendly_id": "SESS-99",
      "title": "Composite session",
      "is_abstract": false
    }
  }
}
```

| `role`       | Meaning                                                    |
| ------------ | ---------------------------------------------------------- |
| `standalone` | Normal editable record                                     |
| `target`     | Composite parent — has linked sources (`source_count > 0`) |
| `source`     | Linked into another record — **read-only** via API         |

When `role` is `source`, field updates are blocked until the record is unlinked in the admin UI.

## Expand options

Use the existing `expand` array (query param on GET, request body on POST search):

### `linked_sources`

By default, sessions linked as composition sources are **hidden** from list/search (same as the admin content list). Pass `expand=linked_sources` to include them.

```json theme={null}
POST /v1/event/{eventId}/sessions
{
  "expand": ["linked_sources"],
  "filters": { "isAbstract": true }
}
```

### `composition`

Adds a full `composition` object with target and sources (including `relationship_type`):

```
GET /v1/event/{eventId}/sessions/{sessionId}?expand=composition
```

Relationship types:

| Value                   | Meaning                                            |
| ----------------------- | -------------------------------------------------- |
| `merged_session`        | Program session merged into a composite            |
| `merged_abstract`       | Abstract merged into a composite abstract          |
| `composed_into_session` | Abstract linked or composed into a program session |

Use `expand=composition` on broad searches sparingly — it loads the full graph per row.

## Session participants

Session search and get responses include legacy `speakers`, `chairpersons`, and `moderators` arrays **and** a flat `participants` array from the Sessions 2.0 model (`Session_Participants` + `Session_Roles`).

* Use **`participants`** when you need custom program roles (Author, Panelist, etc.) or a single list of everyone on a session.
* Legacy arrays remain for backwards compatibility; each legacy entry also includes `participant_role` when roles are configured.

Contact profile fields (`photo_url`, `company_name`, `title`, `address_country`, etc.) are hydrated on all embedded contact shapes in the event's default language without expand. See [API overview — Session participants](/api-reference/overview#session-participants-sessions-20) for details.

## Subsessions

Subsessions cannot be composition sources or targets. When a subsession appears in API responses, composition fields are **inherited from the parent session**:

* `GET /v1/event/{eventId}/sessions/{sessionId}` with a subsession UUID returns the parent's `is_abstract`, `composition_status`, and optional `composition` graph (when `expand=composition`).
* Nested entries in `parent.subsessions[]` from session search receive the same inherited fields after the parent row is enriched.
* Contact session endpoints (`GET .../contacts/{contactId}/sessions`) return `is_abstract` and `composition_status` on each linked session summary (not the full `composition` graph).

This matches how organizers think about program blocks: the parent session owns the composition relationship.

## Contact sessions

Speaker-linked session lists include composition summary fields:

```
GET /v1/event/{eventId}/contacts/{contactId}/sessions
GET /v1/organization/{orgId}/contacts/{contactId}/sessions
```

Each session in the response includes `is_abstract` and `composition_status`. Linked composition sources are included (not filtered out). The full `composition` graph is **not** available on these lightweight endpoints — use session GET or search with `expand=composition` when you need source/target details.

## SbQL parity

SbQL exposes separate `Session` and `Abstract` entities over the same table. REST uses `is_abstract` on the unified session resource. See [SbQL reference](/insights/sbql).
