#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { apiFetch, buildQuery } from "./client.js";

type ApiListResponse<T> = { data: T; meta?: { next_cursor?: string; limit?: number } };
type ApiItemResponse<T> = { data: T };

const mcp = new McpServer({
  name: "conferencer",
  version: "0.1.0",
});

function jsonResult(data: unknown) {
  return {
    content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
  };
}

mcp.registerTool(
  "list_submissions",
  {
    description: "List submissions for the authenticated event (GET /api/v1/submissions)",
    inputSchema: {
      status: z
        .string()
        .optional()
        .describe("Filter by status: pending, accepted, declined, draft, etc."),
      kind: z.string().optional().describe("Filter by kind: abstract or session"),
      limit: z.number().int().min(1).max(100).optional().describe("Page size (default 50)"),
      cursor: z.string().optional().describe("Pagination cursor from a previous response"),
    },
  },
  async ({ status, kind, limit, cursor }) => {
    const result = await apiFetch<ApiListResponse<unknown[]>>(
      `/api/v1/submissions${buildQuery({ status, kind, limit, cursor })}`,
    );
    return jsonResult(result);
  },
);

mcp.registerTool(
  "get_submission",
  {
    description: "Get a single submission by ID (GET /api/v1/submissions/{id})",
    inputSchema: {
      id: z.string().describe("Submission ID (sub_…)"),
    },
  },
  async ({ id }) => {
    const result = await apiFetch<ApiItemResponse<unknown>>(`/api/v1/submissions/${id}`);
    return jsonResult(result);
  },
);

mcp.registerTool(
  "update_submission_status",
  {
    description: "Update a submission status (PATCH /api/v1/submissions/{id})",
    inputSchema: {
      id: z.string().describe("Submission ID (sub_…)"),
      status: z
        .string()
        .describe(
          "New status: draft, pending, accept_queue, accepted, decline_queue, declined, withdrawn",
        ),
    },
  },
  async ({ id, status }) => {
    const result = await apiFetch<ApiItemResponse<unknown>>(`/api/v1/submissions/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
    return jsonResult(result);
  },
);

mcp.registerTool(
  "list_contacts",
  {
    description: "List CRM contacts for the org (GET /api/v1/contacts)",
    inputSchema: {
      limit: z.number().int().min(1).max(100).optional(),
      cursor: z.string().optional(),
    },
  },
  async ({ limit, cursor }) => {
    const result = await apiFetch<ApiListResponse<unknown[]>>(
      `/api/v1/contacts${buildQuery({ limit, cursor })}`,
    );
    return jsonResult(result);
  },
);

mcp.registerTool(
  "list_sessions",
  {
    description: "List agenda sessions (GET /api/v1/sessions)",
    inputSchema: {
      limit: z.number().int().min(1).max(100).optional(),
      cursor: z.string().optional(),
    },
  },
  async ({ limit, cursor }) => {
    const result = await apiFetch<ApiListResponse<unknown[]>>(
      `/api/v1/sessions${buildQuery({ limit, cursor })}`,
    );
    return jsonResult(result);
  },
);

mcp.registerTool(
  "list_tasks",
  {
    description: "List speaker tasks (GET /api/v1/tasks)",
    inputSchema: {
      type: z
        .string()
        .optional()
        .describe("Filter by task type: action, file_request, form"),
      limit: z.number().int().min(1).max(100).optional(),
      cursor: z.string().optional(),
    },
  },
  async ({ type, limit, cursor }) => {
    const result = await apiFetch<ApiListResponse<unknown[]>>(
      `/api/v1/tasks${buildQuery({ type, limit, cursor })}`,
    );
    return jsonResult(result);
  },
);

async function main() {
  const transport = new StdioServerTransport();
  await mcp.connect(transport);
}

main().catch((error) => {
  console.error("Conferencer MCP server failed:", error);
  process.exit(1);
});
