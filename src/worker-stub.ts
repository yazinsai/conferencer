/**
 * Placeholder entry for wrangler.toml.
 * Conferencer is deployed via Docker (see deploy/cloudflare.md), not this worker.
 */
export default {
  async fetch(): Promise<Response> {
    return new Response(
      "Conferencer runs as a Docker container. See deploy/cloudflare.md.",
      { status: 501, headers: { "content-type": "text/plain" } },
    );
  },
};
