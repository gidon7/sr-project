/**
 * Cloudflare Worker — the backend API for sr-project.
 *
 * Requests for static files (the React SPA) are served automatically from the
 * build output. This handler only runs for requests that aren't a static asset,
 * so we route the `/api/*` namespace here and let everything else fall through
 * to the SPA's index.html.
 */

export interface Env {
  // Add bindings here as you need them, then run `npm run cf-typegen`.
  // Examples:
  // DB: D1Database;
  // KV: KVNamespace;
  // MY_SECRET: string;
}

export default {
  async fetch(request, env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname.startsWith("/api/")) {
      return handleApi(url, request, env);
    }

    // Not an API route and not a static asset → 404.
    // (The SPA fallback for client-side routes is handled by the assets layer.)
    return new Response("Not found", { status: 404 });
  },
} satisfies ExportedHandler<Env>;

async function handleApi(url: URL, _request: Request, _env: Env): Promise<Response> {
  switch (url.pathname) {
    case "/api/health":
      return Response.json({ status: "ok" });

    case "/api/hello":
      return Response.json({
        message: "Hello from the sr-project Worker 👋",
        runtime: "Cloudflare Workers",
      });

    default:
      return Response.json({ error: "Unknown API route" }, { status: 404 });
  }
}
