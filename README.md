# sr-project

React + Vite single-page app (frontend) with a Cloudflare **Worker** backend,
deployed to **Cloudflare Workers** with static assets — the unified successor to
"Cloudflare Pages + Workers". The Worker serves the built SPA and handles the
`/api/*` routes.

## Stack

- **Frontend:** React 19 + Vite + TypeScript
- **Backend:** Cloudflare Worker (`worker/index.ts`)
- **Glue:** [`@cloudflare/vite-plugin`](https://developers.cloudflare.com/workers/vite-plugin/) — runs the Worker in dev and bundles everything for deploy
- **Deploy/CLI:** Wrangler

## Project layout

```
src/                 React app (frontend)
  main.tsx
  App.tsx
worker/
  index.ts           Worker backend — /api/* routes live here
public/              static files copied as-is
index.html           SPA entry
vite.config.ts       React + Cloudflare plugins
wrangler.jsonc       Cloudflare deployment config (name, assets, compat date)
```

## Prerequisites

- Node.js 20+ (this repo was set up with Node 24 LTS)
- A free [Cloudflare account](https://dash.cloudflare.com/sign-up)

## Local development

```bash
npm install
npm run dev
```

Open the printed URL (default http://localhost:5173). The frontend calls
`/api/hello`, which is served by the Worker in `worker/index.ts` — all in one
dev server.

## Build

```bash
npm run build      # tsc type-check + vite build → dist/
npm run preview    # preview the production build locally
```

## Deploy to Cloudflare

1. Log in once (opens a browser):

   ```bash
   npx wrangler login
   ```

2. Deploy:

   ```bash
   npm run deploy
   ```

   This builds and runs `wrangler deploy`. Your site goes live at
   `https://sr-project.<your-subdomain>.workers.dev`. Add a custom domain in the
   Cloudflare dashboard (Workers & Pages → sr-project → Settings → Domains).

### CI / Git-based deploys (optional)

To deploy automatically on every push, add a Cloudflare API token as a GitHub
Actions secret (`CLOUDFLARE_API_TOKEN`) and run `wrangler deploy` in a workflow,
or connect this repo in the Cloudflare dashboard (Workers & Pages → Create →
Connect to Git) with build command `npm run build`.

## Adding backend bindings (KV, D1, secrets…)

1. Declare the binding in `wrangler.jsonc`.
2. Run `npm run cf-typegen` to regenerate types.
3. Use it via the typed `env` argument in `worker/index.ts`.

Local secrets go in a `.dev.vars` file (git-ignored); production secrets are set
with `npx wrangler secret put <NAME>`.
