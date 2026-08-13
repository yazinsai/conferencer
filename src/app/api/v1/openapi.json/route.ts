import { publicOrigin } from "@/lib/public-url";

export const dynamic = "force-dynamic";

const RESOURCES = [
  "events",
  "submissions",
  "sessions",
  "contacts",
  "speakers",
  "participants",
  "forms",
  "tracks",
  "formats",
  "rooms",
  "tasks",
  "task-assignments",
  "evaluation-plans",
  "reviews",
  "uploads",
  "emails",
];

export async function GET(request: Request) {
  const origin = publicOrigin(request);

  const paths: Record<string, unknown> = {};
  for (const resource of RESOURCES) {
    paths[`/api/v1/${resource}`] = {
      get: {
        summary: `List ${resource}`,
        tags: [resource],
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "limit", in: "query", schema: { type: "integer", default: 50, maximum: 200 } },
          { name: "cursor", in: "query", schema: { type: "string" } },
          { name: "updated_since", in: "query", schema: { type: "string", format: "date-time" } },
          { name: "q", in: "query", schema: { type: "string" } },
        ],
        responses: {
          200: {
            description: "A page of records",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Page" },
              },
            },
          },
          401: { description: "Missing or invalid bearer token" },
        },
      },
      ...(["submissions", "sessions", "contacts", "speakers", "participants", "task-assignments", "tracks", "formats", "rooms"].includes(
        resource,
      )
        ? {
            post: {
              summary: `Create a ${resource.replace(/s$/, "")}`,
              tags: [resource],
              security: [{ bearerAuth: [] }],
              requestBody: {
                content: { "application/json": { schema: { type: "object" } } },
              },
              responses: { 201: { description: "Created" }, 422: { description: "Validation error" } },
            },
          }
        : {}),
    };
  }

  paths["/api/v1/submissions/{id}"] = {
    get: {
      summary: "Get one submission",
      tags: ["submissions"],
      security: [{ bearerAuth: [] }],
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
      responses: { 200: { description: "The submission" }, 404: { description: "Not found" } },
    },
    patch: {
      summary: "Update a submission",
      tags: ["submissions"],
      security: [{ bearerAuth: [] }],
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
      requestBody: { content: { "application/json": { schema: { $ref: "#/components/schemas/Submission" } } } },
      responses: { 200: { description: "Updated" } },
    },
    delete: {
      summary: "Delete a submission",
      tags: ["submissions"],
      security: [{ bearerAuth: [] }],
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
      responses: { 204: { description: "Deleted" } },
    },
  };

  paths["/api/v1/submissions/bulk-status"] = {
    post: {
      summary: "Bulk change submission status",
      tags: ["submissions"],
      security: [{ bearerAuth: [] }],
      requestBody: {
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                ids: { type: "array", items: { type: "string" } },
                status: { type: "string", enum: ["pending", "accepted", "declined", "withdrawn"] },
              },
            },
          },
        },
      },
      responses: { 200: { description: "Number of records changed" } },
    },
  };

  paths["/api/v1/contacts/bulk-upsert"] = {
    post: {
      summary: "Bulk upsert contacts by email",
      tags: ["contacts"],
      security: [{ bearerAuth: [] }],
      responses: { 200: { description: "Created and updated counts" } },
    },
  };

  paths["/api/v1/task-assignments/bulk"] = {
    post: {
      summary: "Bulk assign tasks",
      tags: ["task-assignments"],
      security: [{ bearerAuth: [] }],
      responses: { 200: { description: "Created count" } },
    },
  };

  paths["/api/v1/public/sessions"] = {
    get: {
      summary: "Public session feed (no token required)",
      tags: ["public"],
      parameters: [
        { name: "event", in: "query", schema: { type: "string" }, description: "Event slug" },
        { name: "q", in: "query", schema: { type: "string" } },
      ],
      responses: { 200: { description: "Approved, accepted, published sessions" } },
    },
  };
  paths["/api/v1/public/speakers"] = {
    get: {
      summary: "Public speaker feed (no token required)",
      tags: ["public"],
      responses: { 200: { description: "Speakers with public sessions" } },
    },
  };

  return Response.json(
    {
      openapi: "3.0.3",
      info: {
        title: "Conferencer API",
        version: "1.0.0",
        description:
          "Read/write access to a single event's programme: submissions, speakers, tasks, evaluations and public feeds. Authenticate with a bearer token from Settings → API tokens.",
      },
      servers: [{ url: origin }],
      components: {
        securitySchemes: {
          bearerAuth: { type: "http", scheme: "bearer" },
        },
        schemas: {
          Page: {
            type: "object",
            properties: {
              data: { type: "array", items: { type: "object" } },
              meta: {
                type: "object",
                properties: {
                  count: { type: "integer" },
                  limit: { type: "integer" },
                  next_cursor: { type: "string", nullable: true },
                },
              },
            },
          },
          Submission: {
            type: "object",
            properties: {
              id: { type: "string" },
              title: { type: "string" },
              description: { type: "string", nullable: true },
              kind: { type: "string", enum: ["abstract", "session"] },
              status: {
                type: "string",
                enum: [
                  "draft",
                  "pending",
                  "accept_queue",
                  "decline_queue",
                  "accepted",
                  "declined",
                  "withdrawn",
                ],
              },
              approval_status: { type: "string", enum: ["draft", "in_review", "approved"] },
              track_id: { type: "string", nullable: true },
              format_id: { type: "string", nullable: true },
              room_id: { type: "string", nullable: true },
              starts_at: { type: "string", nullable: true },
              ends_at: { type: "string", nullable: true },
            },
          },
        },
      },
      paths,
    },
    { headers: { "Cache-Control": "public, max-age=300" } },
  );
}
