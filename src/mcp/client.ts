const API_URL = (process.env.CONFERENCER_API_URL ?? "http://localhost:3000").replace(
  /\/$/,
  "",
);
const API_TOKEN = process.env.CONFERENCER_API_TOKEN ?? "";

export function requireApiToken() {
  if (!API_TOKEN) {
    throw new Error(
      "CONFERENCER_API_TOKEN is required (create one under Settings → API)",
    );
  }
}

export async function apiFetch<T = unknown>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  requireApiToken();

  const headers = new Headers(init?.headers);
  headers.set("Authorization", `Bearer ${API_TOKEN}`);
  if (init?.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const res = await fetch(`${API_URL}${path}`, { ...init, headers });
  const text = await res.text();
  let body: unknown = null;
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = text;
    }
  }

  if (!res.ok) {
    const message =
      typeof body === "object" &&
      body !== null &&
      "error" in body &&
      typeof (body as { error?: { message?: string } }).error?.message ===
        "string"
        ? (body as { error: { message: string } }).error.message
        : text || res.statusText;
    throw new Error(`API ${res.status}: ${message}`);
  }

  return body as T;
}

export function buildQuery(params?: Record<string, string | number | undefined>) {
  if (!params) return "";
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") {
      search.set(key, String(value));
    }
  }
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}
