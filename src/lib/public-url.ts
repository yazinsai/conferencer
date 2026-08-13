/**
 * Public origin for redirects, calendar feeds, and embeds.
 *
 * Next.js standalone binds on HOSTNAME (Dokku sets 0.0.0.0) and then builds
 * `request.url` from that bind address — so `new URL("/", request.url)` becomes
 * `https://0.0.0.0:3000/`. Prefer APP_URL, then the proxy's forwarded host.
 */

function hostnameOf(host: string): string {
  if (host.startsWith("[")) {
    const end = host.indexOf("]");
    return end === -1 ? host : host.slice(1, end);
  }
  return host.split(":")[0] ?? host;
}

function isBindHost(host: string): boolean {
  const hostname = hostnameOf(host);
  return hostname === "0.0.0.0" || hostname === "::";
}

export function publicOrigin(request?: Request): string {
  const configured = (process.env.APP_URL ?? process.env.NEXT_PUBLIC_APP_URL)?.replace(/\/$/, "");
  if (configured) return configured;

  if (request) {
    const forwardedHost = request.headers.get("x-forwarded-host")?.split(",")[0]?.trim();
    const host = forwardedHost || request.headers.get("host") || "";
    if (host && !isBindHost(host)) {
      const proto =
        request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim() ||
        (request.url.startsWith("https:") ? "https" : "http");
      return `${proto}://${host}`;
    }
  }

  return `http://localhost:${process.env.PORT ?? 3000}`;
}

export function publicUrl(path = "", request?: Request): string {
  return `${publicOrigin(request)}${path}`;
}
