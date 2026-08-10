---
url: "https://apidocs.sessionboard.com/authentication.md"
title: undefined
---

> ## Documentation Index
> Fetch the complete documentation index at: https://apidocs.sessionboard.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Authentication

> Authenticate with API tokens or OAuth 2.1

The Sessionboard Public API supports two authentication methods:

1. **API Tokens** — Long-lived tokens for server-to-server integrations and scripts
2. **OAuth 2.1** — For AI assistants (Claude, ChatGPT) and user-authorized connections

<Tabs>
  <Tab title="API Tokens">
    API tokens are scoped to your organization and can be generated from the Sessionboard admin dashboard.

    ## Generate a Token

    <Steps>
      <Step title="Open Organization Settings">
        Log in to the Sessionboard admin dashboard and navigate to **Organization Settings** from the sidebar.
      </Step>

      <Step title="Navigate to API Tokens">
        Select the **API Tokens** section within your organization settings.
      </Step>

      <Step title="Generate a New Token">
        Click **Generate Token**. Give the token a descriptive name and select the appropriate scopes for your use case.
      </Step>

      <Step title="Copy the Token">
        Copy the generated token immediately. For security reasons, the full token value is only displayed once. Store it securely in your application's environment variables or secrets manager.
      </Step>
    </Steps>

    ## Using the Token

    Include the token in the `x-access-token` header on every API request.

    <CodeGroup>
      ```bash cURL theme={null}
      curl -X GET https://public-api.sessionboard.com/v1/events \
        -H "x-access-token: YOUR_TOKEN"
      ```

      ```javascript JavaScript theme={null}
      const response = await fetch('https://public-api.sessionboard.com/v1/events', {
        headers: {
          'x-access-token': 'YOUR_TOKEN'
        }
      });

      const data = await response.json();
      ```

      ```python Python theme={null}
      import requests

      response = requests.get(
          'https://public-api.sessionboard.com/v1/events',
          headers={'x-access-token': 'YOUR_TOKEN'}
      )

      data = response.json()
      ```
    </CodeGroup>

    <Warning>
      Keep your API tokens secure. Never commit tokens to source control, embed them in client-side code, or share them in public channels. If a token is compromised, revoke it immediately from the API Tokens settings page and generate a new one.
    </Warning>

    ## Token Scopes

    API tokens can be granted specific scopes to control access:

    | Scope                  | Type  | Description                                                                                                  |
    | ---------------------- | ----- | ------------------------------------------------------------------------------------------------------------ |
    | `read:events`          | Read  | Access event data                                                                                            |
    | `read:sessions`        | Read  | Access session data and list session file attachments                                                        |
    | `read:contacts`        | Read  | Access speaker and contact data                                                                              |
    | `read:reports`         | Read  | Access saved reports                                                                                         |
    | `read:dashboards`      | Read  | Access dashboards                                                                                            |
    | `read:insights`        | Read  | Access Reports, Dashboards, and SbQL query APIs. Required for MCP.                                           |
    | `read:transcriptions`  | Read  | Access session transcriptions and recordings                                                                 |
    | `read:media`           | Read  | Access uploaded media items and transcription status                                                         |
    | `write:sessions`       | Write | Create, update, delete, and restore sessions; upload and manage session files                                |
    | `write:contacts`       | Write | Create, update, delete, and restore contacts                                                                 |
    | `write:exhibitors`     | Write | Create, update, delete, and restore exhibitors                                                               |
    | `write:sponsors`       | Write | Create, update, delete, and restore sponsors                                                                 |
    | `write:fields`         | Write | Create, update, and delete custom fields                                                                     |
    | `write:metadata`       | Write | Create, update, and delete session metadata (rooms, tracks, etc.)                                            |
    | `write:transcriptions` | Write | Create, update, and delete transcriptions and session recordings                                             |
    | `write:media`          | Write | Upload media files for automatic transcription                                                               |
    | `write:events`         | Write | Create, update, and delete agenda drafts, scheduling rules, personas, dashboards, widgets, and saved reports |

    Legacy tokens (empty scopes array) get all read scopes implicitly but do **not** get write access. When generating a token, select only the scopes your integration requires.

    Scoped read tokens must include the domain-specific read scope for each API area — for example, `read:events` alone does not grant access to transcription, media, or session file endpoints. Those require `read:transcriptions`, `read:media`, or `read:sessions` respectively.
  </Tab>

  <Tab title="OAuth 2.1">
    For AI assistants like Claude and ChatGPT, Sessionboard supports OAuth 2.1 with PKCE. This allows users to authorize AI tools to access their event data through a secure consent flow.

    See the full [OAuth 2.1 guide](/oauth) for setup instructions, token exchange, and available scopes.

    **Quick overview:**

    * Users authorize via a consent page at `appv2.sessionboard.com/oauth/consent`
    * Tokens are issued by `public-api.sessionboard.com/oauth/token`
    * Access tokens expire after 1 hour, refresh tokens after 7 days
    * Tokens inherit the authorizing user's permissions (dynamic — changes take effect immediately)

    ```bash theme={null}
    # Using an OAuth access token
    curl https://public-api.sessionboard.com/v1/events \
      -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
    ```
  </Tab>
</Tabs>
