import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { cloudflare } from "@cloudflare/vite-plugin";

// React SPA (frontend) + Cloudflare Worker (backend API) in a single build.
// The Cloudflare plugin serves the built assets and runs ./worker/index.ts.
export default defineConfig({
  plugins: [react(), cloudflare()],
});
