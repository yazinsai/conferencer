export function buildOpenApiSpec(baseUrl: string) {
  const bearer = { bearerAuth: [] as string[] };
  const listParams = [
    { name: "limit", in: "query", schema: { type: "integer", default: 50, maximum: 100 } },
    { name: "cursor", in: "query", schema: { type: "string" } },
    { name: "updated_since", in: "query", schema: { type: "string", format: "date-time" } },
  ];

  const listOp = (summary: string, extraParams: object[] = []) => ({
    summary,
    security: [bearer],
    parameters: [...listParams, ...extraParams],
    responses: {
      "200": {
        description: "Paginated list",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                data: { type: "array", items: { type: "object" } },
                meta: {
                  type: "object",
                  properties: {
                    next_cursor: { type: "string" },
                    limit: { type: "integer" },
                  },
                },
              },
            },
          },
        },
      },
      "401": { $ref: "#/components/responses/Unauthorized" },
    },
  });

  const getOp = (summary: string) => ({
    summary,
    security: [bearer],
    responses: {
      "200": {
        description: "Resource",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: { data: { type: "object" } },
            },
          },
        },
      },
      "401": { $ref: "#/components/responses/Unauthorized" },
      "404": { $ref: "#/components/responses/NotFound" },
    },
  });

  return {
    openapi: "3.0.3",
    info: {
      title: "Conferencer API",
      version: "1.0.0",
      description:
        "REST API for Conferencer event program data. Authenticate with a bearer token from Settings → API Tokens.",
    },
    servers: [{ url: baseUrl }],
    security: [bearer],
    paths: {
      "/api/v1/events": {
        get: {
          ...getOp("Get current event"),
        },
      },
      "/api/v1/submissions": {
        get: listOp("List submissions", [
          { name: "status", in: "query", schema: { type: "string" } },
          { name: "kind", in: "query", schema: { type: "string" } },
        ]),
        post: {
          summary: "Create submission",
          security: [bearer],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["title"],
                  properties: {
                    title: { type: "string" },
                    kind: { type: "string" },
                    status: { type: "string" },
                    description: { type: "string" },
                  },
                },
              },
            },
          },
          responses: { "201": { description: "Created" }, "401": { $ref: "#/components/responses/Unauthorized" } },
        },
      },
      "/api/v1/submissions/{id}": {
        get: {
          ...getOp("Get submission"),
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        },
        patch: {
          summary: "Update submission",
          security: [bearer],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          requestBody: {
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { status: { type: "string" }, title: { type: "string" } },
                },
              },
            },
          },
          responses: { "200": { description: "Updated" } },
        },
      },
      "/api/v1/submissions/bulk-status": {
        post: {
          summary: "Bulk update submission status",
          security: [bearer],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["ids", "status"],
                  properties: {
                    ids: { type: "array", items: { type: "string" } },
                    status: { type: "string" },
                  },
                },
              },
            },
          },
          responses: { "200": { description: "Updated" } },
        },
      },
      "/api/v1/sessions": {
        get: listOp("List accepted sessions (alias for submissions with kind=session, status=accepted)"),
      },
      "/api/v1/contacts": {
        get: listOp("List event contacts"),
        post: { summary: "Create or link contact", security: [bearer], responses: { "201": { description: "Created" } } },
      },
      "/api/v1/contacts/bulk": {
        post: {
          summary: "Bulk upsert contacts",
          security: [bearer],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    contacts: { type: "array", items: { type: "object" } },
                  },
                },
              },
            },
          },
          responses: { "200": { description: "Upserted" } },
        },
      },
      "/api/v1/contacts/{id}": {
        get: {
          ...getOp("Get contact"),
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        },
        patch: {
          summary: "Update contact",
          security: [bearer],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          responses: { "200": { description: "Updated" } },
        },
        delete: {
          summary: "Remove contact from event",
          security: [bearer],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          responses: { "200": { description: "Deleted" } },
        },
      },
      "/api/v1/participants": {
        get: listOp("List submission participants", [
          { name: "role", in: "query", schema: { type: "string" } },
          { name: "submission_id", in: "query", schema: { type: "string" } },
        ]),
      },
      "/api/v1/participants/{id}": {
        get: {
          ...getOp("Get participant"),
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        },
      },
      "/api/v1/forms": { get: listOp("List submission forms") },
      "/api/v1/forms/{id}": {
        get: {
          ...getOp("Get form"),
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        },
      },
      "/api/v1/tracks": {
        get: listOp("List tracks"),
        post: { summary: "Create track", security: [bearer], responses: { "201": { description: "Created" } } },
      },
      "/api/v1/tracks/{id}": {
        get: {
          ...getOp("Get track"),
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        },
        patch: { summary: "Update track", security: [bearer], parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { "200": { description: "Updated" } } },
        delete: { summary: "Delete track", security: [bearer], parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { "200": { description: "Deleted" } } },
      },
      "/api/v1/formats": {
        get: listOp("List formats"),
        post: { summary: "Create format", security: [bearer], responses: { "201": { description: "Created" } } },
      },
      "/api/v1/formats/{id}": {
        get: {
          ...getOp("Get format"),
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        },
        patch: { summary: "Update format", security: [bearer], parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { "200": { description: "Updated" } } },
        delete: { summary: "Delete format", security: [bearer], parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { "200": { description: "Deleted" } } },
      },
      "/api/v1/rooms": {
        get: listOp("List rooms"),
        post: { summary: "Create room", security: [bearer], responses: { "201": { description: "Created" } } },
      },
      "/api/v1/rooms/{id}": {
        get: {
          ...getOp("Get room"),
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        },
        patch: { summary: "Update room", security: [bearer], parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { "200": { description: "Updated" } } },
        delete: { summary: "Delete room", security: [bearer], parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { "200": { description: "Deleted" } } },
      },
      "/api/v1/tasks": {
        get: listOp("List tasks"),
        post: { summary: "Create task", security: [bearer], responses: { "201": { description: "Created" } } },
      },
      "/api/v1/tasks/{id}": {
        get: {
          ...getOp("Get task"),
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        },
        patch: { summary: "Update task", security: [bearer], parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { "200": { description: "Updated" } } },
        delete: { summary: "Delete task", security: [bearer], parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { "200": { description: "Deleted" } } },
      },
      "/api/v1/task-assignments": {
        get: listOp("List task assignments"),
        post: { summary: "Create task assignment", security: [bearer], responses: { "201": { description: "Created" } } },
      },
      "/api/v1/task-assignments/bulk": {
        post: {
          summary: "Bulk assign task to contacts",
          security: [bearer],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["taskId", "contactIds"],
                  properties: {
                    taskId: { type: "string" },
                    contactIds: { type: "array", items: { type: "string" } },
                    dueAt: { type: "string", format: "date-time" },
                  },
                },
              },
            },
          },
          responses: { "200": { description: "Assigned" } },
        },
      },
      "/api/v1/task-assignments/{id}": {
        get: {
          ...getOp("Get task assignment"),
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        },
        patch: { summary: "Update task assignment", security: [bearer], parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { "200": { description: "Updated" } } },
        delete: { summary: "Delete task assignment", security: [bearer], parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { "200": { description: "Deleted" } } },
      },
      "/api/v1/evaluation-plans": { get: listOp("List evaluation plans") },
      "/api/v1/evaluation-plans/{id}": {
        get: {
          ...getOp("Get evaluation plan"),
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        },
      },
      "/api/v1/reviews": { get: listOp("List reviews") },
      "/api/v1/reviews/{id}": {
        get: {
          ...getOp("Get review"),
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        },
      },
      "/api/v1/uploads": { get: listOp("List uploads (metadata only)") },
      "/api/v1/emails": { get: listOp("List email outbox") },
      "/api/v1/public/{slug}/sessions": {
        get: {
          summary: "Public session list (no auth)",
          security: [],
          parameters: [{ name: "slug", in: "path", required: true, schema: { type: "string" } }],
          responses: { "200": { description: "Public sessions" }, "404": { $ref: "#/components/responses/NotFound" } },
        },
      },
      "/api/v1/public/{slug}/speakers": {
        get: {
          summary: "Public speaker list (no auth)",
          security: [],
          parameters: [{ name: "slug", in: "path", required: true, schema: { type: "string" } }],
          responses: { "200": { description: "Public speakers" }, "404": { $ref: "#/components/responses/NotFound" } },
        },
      },
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          description: "API token from Settings → API Tokens (format: cnf_…)",
        },
      },
      responses: {
        Unauthorized: {
          description: "Invalid or missing token",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  error: {
                    type: "object",
                    properties: {
                      code: { type: "string" },
                      message: { type: "string" },
                    },
                  },
                },
              },
            },
          },
        },
        NotFound: {
          description: "Resource not found",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  error: {
                    type: "object",
                    properties: {
                      code: { type: "string" },
                      message: { type: "string" },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  };
}
