---
url: "https://apidocs.sessionboard.com/changelog.md"
title: undefined
---

> ## Documentation Index
> Fetch the complete documentation index at: https://apidocs.sessionboard.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Changelog

> What's new in the Sessionboard Public API

Release notes for the Sessionboard Public API. Entries are grouped by month (newest first). Breaking changes are called out explicitly.

<Note>
  API tokens created before scoped tokens were introduced continue to work with full access when no scopes are set. New tokens should request only the scopes your integration needs — see [Authentication](/authentication) and [OAuth](/oauth).
</Note>

***

## July 2026

### July 20 — Session & event content packs

**Added — Composed content** (`read:transcriptions`)

One-call packs for mobile and partner apps — composed transcript elements (speaker turns, optional `interval_sec`), preferred summary, insights, podcast status/URL, and summary/event PDF links.

| Method | Path                                               |
| ------ | -------------------------------------------------- |
| `GET`  | `/v1/event/{eventId}/sessions/{sessionId}/content` |
| `GET`  | `/v1/event/{eventId}/content`                      |
| `GET`  | `/v1/event/{eventId}/content/event`                |
| `GET`  | `/v1/event/{eventId}/content/items/{itemId}`       |
| `GET`  | `.../content/documents/{documentType}`             |

Raw `.../transcriptions` CRUD is unchanged. Content is not session [composition](/api-reference/sessions-composition).

**Documentation**

* New guide: [Consuming session content](/guides/consuming-session-content)
* Updated: [Transcriptions & Media](/api-reference/transcriptions-and-media)

### July 10 — Session files & upload paths

**Added — Session files** (`read:sessions` / `write:sessions`)

Attach PDFs, PowerPoint decks, Word docs, and similar files to a session.

| Path                     | Method   | Endpoint                                                | Max size |
| ------------------------ | -------- | ------------------------------------------------------- | -------- |
| **Simple upload**        | `POST`   | `/v1/event/{eventId}/sessions/{sessionId}/files/upload` | 50 MB    |
| Direct-to-storage create | `POST`   | `/v1/event/{eventId}/sessions/{sessionId}/files`        | 500 MB   |
| Complete                 | `POST`   | `.../files/{fileId}/complete`                           | —        |
| List                     | `GET`    | `.../files`                                             | —        |
| Update                   | `PUT`    | `.../files/{fileId}`                                    | —        |
| Replace                  | `POST`   | `.../files/{fileId}/replace`                            | 500 MB   |
| Delete                   | `DELETE` | `.../files/{fileId}`                                    | —        |

**Simple upload** — one multipart request with field `file`. Sessionboard detects size and MIME type, scans the file, and returns the attached file. No presigned URL steps.

**Direct-to-storage** — create → PUT bytes to signed URL → complete. Use for files over 50 MB (up to 500 MB) or when you prefer uploading straight to storage (standard presigned-URL pattern used by AWS, Stripe, and similar APIs).

Session-scoped creates use standard REST (`POST` on the collection path — no `/create` suffix). The `/create` suffix remains only where `POST` on the collection path is search (sessions, contacts, metadata entities, etc.).

**Documentation**

* New guide: [Uploading session files](/guides/uploading-session-files) — two-tab playbook (simple vs direct-to-storage)
* API overview: [Session Files](/api-reference/session-files)

### July 7 — Sessions & scopes

**Fixed**

* Embedded contact fields on session responses (`photo_url`, `company_name`, `title`, `address_country`, and related profile fields) now populate correctly on `speakers[]`, `chairpersons[]`, `moderators[]`, and `participants[]` in the event's default language.
* Participant ordering respects configured role sort order and per-participant `order`.

**Changed**

* Read routes for transcriptions and recordings require the `read:transcriptions` scope when your token has explicit scopes.
* Read routes for media items require the `read:media` scope when your token has explicit scopes.
* `read:transcriptions` and `read:media` added to the OAuth scope catalog.

**Documentation**

* Session participant model documented: `participants[]` vs legacy role arrays, `participant_role` shape, and contact fields available without `expand`.

### July 6 — Transcriptions, recordings & media upload

**Added — Transcriptions** (`read:transcriptions` / `write:transcriptions`)

| Method   | Path                                                           |
| -------- | -------------------------------------------------------------- |
| `POST`   | `/v1/event/{eventId}/sessions/{sessionId}/transcriptions`      |
| `GET`    | `/v1/event/{eventId}/sessions/{sessionId}/transcriptions`      |
| `GET`    | `/v1/event/{eventId}/sessions/{sessionId}/transcriptions/{id}` |
| `PUT`    | `/v1/event/{eventId}/sessions/{sessionId}/transcriptions/{id}` |
| `DELETE` | `/v1/event/{eventId}/sessions/{sessionId}/transcriptions/{id}` |
| `GET`    | `/v1/event/{eventId}/transcriptions`                           |
| `GET`    | `/v1/event/{eventId}/transcriptions/{id}`                      |

Supports artifact types: `fragment`, `summary`, `insight`, and `translation`. Fragments written via the API appear in the event's Marketing Media transcript view.

**Added — Session recordings** (`read:transcriptions` / `write:transcriptions`)

| Method | Path                                                                |
| ------ | ------------------------------------------------------------------- |
| `POST` | `/v1/event/{eventId}/sessions/{sessionId}/recordings`               |
| `GET`  | `/v1/event/{eventId}/sessions/{sessionId}/recordings`               |
| `GET`  | `/v1/event/{eventId}/sessions/{sessionId}/recordings/{id}`          |
| `POST` | `/v1/event/{eventId}/sessions/{sessionId}/recordings/{id}/complete` |

**Added — Media upload** (`read:media` / `write:media`)

Direct-to-S3 multipart upload for video or audio files, with automatic transcription when processing completes.

| Method | Path                                                              |
| ------ | ----------------------------------------------------------------- |
| `POST` | `/v1/event/{eventId}/sessions/{sessionId}/media/upload/initiate`  |
| `POST` | `/v1/event/{eventId}/sessions/{sessionId}/media/upload/sign-part` |
| `POST` | `/v1/event/{eventId}/sessions/{sessionId}/media/upload/complete`  |
| `POST` | `/v1/event/{eventId}/sessions/{sessionId}/media/upload/abort`     |
| `GET`  | `/v1/event/{eventId}/sessions/{sessionId}/media/{mediaItemId}`    |

**Documentation**

* New guide: [Media & Transcriptions](/guides/uploading-media-and-transcriptions) (three integration playbooks).
* New reference page: [Transcriptions & Media](/api-reference/transcriptions-and-media).
* OpenAPI tags split into **Transcriptions**, **Session Recordings**, and **Media**.

### July 5 — Sessions 2.0 participants

**Added**

* `participants[]` on session search and get — flat list from the Sessions 2.0 model, including custom program roles (Author, Panelist, etc.). Always returned; no expand flag required.
* `participant_role` on legacy `speakers[]`, `chairpersons[]`, and `moderators[]` when the event has Sessions 2.0 roles configured.
* `expand=composition` on session search/get — returns composition status, target session summary, and source counts for abstract-to-session linking.
* Richer nested metadata on `language`, `track`, `level`, `room`, and `format` objects (`color`, `order`, `capacity`, timestamps, etc.) instead of `{ id, name }` only.

**Changed**

* Minimal `parent.subsessions[]` shape now includes `participants` alongside `speakers`.

### July 3 — Session write responses

**Added**

* `is_abstract` on session create and bulk create (requires Sessions 2.0 on the event).
* `expand=composition` on create/update/bulk responses — includes composition status block.

**Changed**

* Create, update, bulk, get, and list responses now share one formatter — write responses match read/search shape (nested metadata, composition, etc.).
* `expand=linked_sources` and `expand=composition` supported consistently across session CRUD handlers.

***

## June 2026

### June 18 — Subsessions

**Fixed**

* `GET /v1/event/{eventId}/sessions/{sessionId}` accepts a subsession UUID directly and returns the full session shape (with parent friendly-id keys).
* `expand=subsession_details` includes `is_public` on every subsession in `parent.subsessions[]`.

***

## May 2026

### May 22 — Subsession field parity

**Added**

* `expand=subsession_details` on session search and get — every item in `parent.subsessions[]` returns full parent-shape parity (`status`, `custom_fields`, `chairpersons`, `moderators`, `sponsors`, `exhibitors`, `tags`, nested metadata, and more). Default subsession shape is unchanged for backward compatibility.
* `GET /v1/event/{eventId}/sessions/{sessionId}` with a subsession UUID returns the full session DTO at the top level.
* `POST /v1/event/{eventId}/sessions/status` returns a minimal `subsessions[]` array on parent rows (id, friendly\_id, status, custom\_status, timestamps) for status-sync integrations.

**Documentation**

* Subsession expand behavior and `SubsessionDetailed` schema documented in the [API overview](/api-reference/overview).

### May 7 — Webhooks

**Documentation**

* Webhook payload schemas updated to match the current event shape.

***

## April 2026

### April 13 — OAuth token lifetimes

**Changed**

* OAuth access tokens expire after **24 hours** (previously shorter).
* OAuth refresh tokens expire after **90 days**.

### April 12 — Deep links & OAuth hardening

**Added**

* `admin_url` on session, contact, exhibitor, and sponsor responses — direct link to the record in the Sessionboard admin UI.

**Changed**

* OAuth Bearer tokens work with all MCP server tools.
* OAuth metadata URLs served correctly over HTTPS behind the load balancer.

### April 11 — OAuth 2.1 & rate limits

**Added**

* OAuth **write scopes** for sessions, contacts, exhibitors, sponsors, fields, metadata, and events.
* RFC 8707 **resource parameter** support on the token endpoint.
* **Per-token rate limit overrides** — contact support to raise limits for high-volume integrations.
* Browser-based OAuth: `/oauth/authorize` redirects to the consent UI.
* OAuth discovery at `/.well-known/oauth-authorization-server`.

**Documentation**

* [OAuth](/oauth) guide and [Rate limiting](/rate-limiting) page published.

### April 10 — Convenience routes & insights

**Added**

* **Convenience routes** for org-level dashboards, widgets, and saved reports at `/v1/dashboards`, `/v1/widgets`, and `/v1/queries` (in addition to event-scoped paths).
* Event-scoped insights, dashboards, widgets, and queries routed through the unified v1 proxy.

**Fixed**

* Widget create no longer returns 404 when `dashboardId` is in the path.
* Rules list handles missing pagination without error.
* Contact create/update returns profile fields correctly when locale casing differs.

### April 9 — Agenda planning & metadata

**Added**

* **Agenda drafts** — full CRUD for drafts, draft sessions, commit, and change history.
* **Scheduling rules** — create, read, update, delete.
* **Personas** — create, read, update, delete.
* **Event metadata CRUD** — rooms, tracks, tags, formats, levels, languages, and session statuses (read and write).

### April 7 — Entity write API (major release)

**Added**

* **Session CRUD** — create, update, delete, restore, bulk operations, and custom field updates.
* **Contact CRUD** — create, update, delete, restore, bulk, and list sessions for a contact.
* **Exhibitor & sponsor CRUD** — create, update, delete, restore, and bulk.
* **Custom field definitions** — create, update, delete.
* **Organization-scoped contact** read endpoints.
* **Bearer token** authentication alongside `X-Access-Token`.
* **Write scopes** enforced on all mutating routes.

**Documentation**

* Full OpenAPI schemas for all CRUD endpoints.
* Sidebar reorganized by org scope, event scope, and convenience routes.

### April 8 — Reliability

**Fixed**

* Error details from the API are forwarded through the proxy (clearer validation messages).
* `204 No Content` responses handled correctly on delete/restore.
* Scheduled smoke tests against the dev environment (ongoing quality monitoring).

***

## March 2026

### March 25 — Organization contacts

**Fixed**

* `GET /v1/organization/{orgId}/contacts/{contactId}` path corrected in the OpenAPI spec (was returning 404 for valid requests).

### March 23 — Documentation site

**Added**

* Public API documentation launched at [apidocs.sessionboard.com](https://apidocs.sessionboard.com) (Mintlify).
* [Insights & AI](/insights/overview) section — MCP server, SbQL, and analytics endpoints.
* EU region base URL documented: `https://public-api-eu.sessionboard.com`.

***

## Earlier capabilities

These endpoints predate 2026 but are part of the current API surface:

* **Session & speaker search** — `POST /v1/event/{eventId}/sessions`, speaker search, and individual session get (with 3-minute cache on get and search).
* **GDPR** — `GET` and `POST /v1/gdpr/requests`.
* **Webhooks** — real-time notifications on data changes ([Webhooks](/webhooks)).
* **Insights** — SbQL execute, AI query generation, saved reports, and dashboards ([Insights overview](/insights/overview)).
