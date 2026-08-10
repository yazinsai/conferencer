---
url: "https://apidocs.sessionboard.com/webhooks.md"
title: undefined
---

> ## Documentation Index
> Fetch the complete documentation index at: https://apidocs.sessionboard.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Webhooks

> Receive real-time notifications when data changes

Webhooks allow your application to receive real-time HTTP callbacks when data changes in Sessionboard. Instead of polling the API for updates, you can subscribe to specific events and receive notifications as they happen.

## Event Catalog

Subscribe to any combination of the following webhook events.

<AccordionGroup>
  <Accordion title="Contacts">
    | Event                         | Description                                    |
    | ----------------------------- | ---------------------------------------------- |
    | `contact.created`             | A new contact was created in the organization. |
    | `contact.updated`             | A contact's details were updated.              |
    | `contact.deleted`             | A contact was deleted from the organization.   |
    | `contact.event.associated`    | A contact was associated with an event.        |
    | `contact.event.disassociated` | A contact was removed from an event.           |
  </Accordion>

  <Accordion title="Sessions">
    \| Event | Description | | --- | --- | | `session.created` | A new session was
    created. | | `session.updated` | A session's details were updated. | |
    `session.deleted` | A session was deleted. | | `session.speaker.attached` | A
    speaker was attached to a session. | | `session.speaker.detached` | A speaker
    was detached from a session. |
  </Accordion>

  <Accordion title="Exhibitors">
    \| Event | Description | | --- | --- | | `exhibitor.created` | A new exhibitor
    was created. | | `exhibitor.updated` | An exhibitor's details were updated. |
    \| `exhibitor.deleted` | An exhibitor was deleted. | |
    `exhibitor.event.associated` | An exhibitor was associated with an event. | |
    `exhibitor.event.disassociated` | An exhibitor was removed from an event. |
  </Accordion>

  <Accordion title="Sponsors">
    | Event                         | Description                             |
    | ----------------------------- | --------------------------------------- |
    | `sponsor.created`             | A new sponsor was created.              |
    | `sponsor.updated`             | A sponsor's details were updated.       |
    | `sponsor.deleted`             | A sponsor was deleted.                  |
    | `sponsor.event.associated`    | A sponsor was associated with an event. |
    | `sponsor.event.disassociated` | A sponsor was removed from an event.    |
  </Accordion>
</AccordionGroup>

## Payload Structure

Every webhook delivery sends a JSON payload with two top-level keys: `data` (the full resource that changed) and `metadata` (information about the event itself).

<Note>
  The `data` field contains the **full resource object** for the affected entity
  (Session, Contact, Sponsor, or Exhibitor). Its shape matches the corresponding
  response schema in the [API Reference](/api-reference/overview).
</Note>

Example delivery for a `session.updated` event:

```json theme={null}
{
  "data": {
    "id": "fd4e0275-f018-40bc-909a-f8cdfa0df354",
    "sourceOfChange": "user"
  },
  "metadata": {
    "action": "session.updated",
    "actor_id": 7,
    "event_id": 4001,
    "org_id": "757e8d5b-ce66-45f5-ab36-273414f8ab2f",
    "resource_url": "https://public-api.sessionboard.com/v1/event/4001/sessions/fd4e0275-f018-40bc-909a-f8cdfa0df354",
    "version": 1,
    "datetime": "2026-04-28T16:00:00Z"
  }
}
```

The `data` object above is abbreviated — production payloads include every field of the resource. Refer to the `Session`, `Contact`, `Sponsor`, and `Exhibitor` response schemas in the [API Reference](/api-reference/overview) for the complete shape.

### Payload Attributes

| Field                   | Description                                                                                       |
| ----------------------- | ------------------------------------------------------------------------------------------------- |
| `data.sourceOfChange`   | Changes were performed by a user or an agent.                                                     |
| `data.id`               | Unique identifier of the affected resource. Always present at the top of `data`.                  |
| `metadata.action`       | The webhook event type (e.g., `session.updated`).                                                 |
| `metadata.actor_id`     | ID of the user who performed the action. `null` for system-generated events.                      |
| `metadata.event_id`     | The Sessionboard event ID associated with the change. `null` for organization-level events.       |
| `metadata.org_id`       | Your organization's unique identifier.                                                            |
| `metadata.resource_url` | Direct URL to fetch the full resource from the Public API.                                        |
| `metadata.version`      | Payload schema version. Currently `1`. New non-breaking fields may be added without bumping this. |
| `metadata.datetime`     | UTC ISO 8601 timestamp of when the event occurred in Sessionboard.                                |

<Note>
  **Forward compatibility:** Sessionboard may add new fields to `data` and
  `metadata` at any time. Webhook consumers should ignore unknown fields rather
  than fail on them. Removed or renamed fields will trigger a `metadata.version`
  bump.
</Note>

## Creating a Webhook

<Steps>
  <Step title="Open Webhook Settings">
    In the Sessionboard admin dashboard, navigate to **Settings > Integrations > Webhooks**.

    <img src="https://mintcdn.com/sessionboard/7hHHJS7WuPeOwpBI/images/webhooks1.png?fit=max&auto=format&n=7hHHJS7WuPeOwpBI&q=85&s=01d282b463590d3b44544b7642877578" alt="Webhook settings panel" width="1876" height="1980" data-path="images/webhooks1.png" />
  </Step>

  <Step title="Add an Endpoint">
    Click **Add Endpoint** and enter the URL where you want to receive webhook deliveries. This must be a publicly accessible HTTPS endpoint. Select which events you want to subscribe to for this endpoint.

    <img src="https://mintcdn.com/sessionboard/7hHHJS7WuPeOwpBI/images/webhooks2.png?fit=max&auto=format&n=7hHHJS7WuPeOwpBI&q=85&s=abff7dfb51003ef1de488a12504deb30" alt="Adding a webhook endpoint" width="2230" height="1830" data-path="images/webhooks2.png" />
  </Step>

  <Step title="Save and Activate">
    Save the webhook configuration. Sessionboard will begin sending events to your endpoint immediately. You can also add custom headers for additional security (e.g., passing a token that your server validates to ensure the request is from Sessionboard).
  </Step>
</Steps>

## Testing Webhooks

Use the **Testing** tab on any endpoint to send a sample payload without triggering a real action. You can also use [Svix Play](https://play.svix.com) to capture and inspect deliveries in a temporary sandbox.

<img src="https://mintcdn.com/sessionboard/7hHHJS7WuPeOwpBI/images/webhooks3.png?fit=max&auto=format&n=7hHHJS7WuPeOwpBI&q=85&s=b7558b0da050247a2f1c036c60cee5ff" alt="Testing a webhook endpoint" width="2182" height="1786" data-path="images/webhooks3.png" />

## Monitoring

Sessionboard provides delivery logs for each webhook endpoint in the admin dashboard. You can view recent deliveries, inspect payloads, and check response status codes. Failed deliveries are retried automatically with exponential backoff.

<img src="https://mintcdn.com/sessionboard/7hHHJS7WuPeOwpBI/images/webhooks5.png?fit=max&auto=format&n=7hHHJS7WuPeOwpBI&q=85&s=b0c20a0ed7beac48df38d14ececa9815" alt="Webhook delivery logs" width="2936" height="1778" data-path="images/webhooks5.png" />
