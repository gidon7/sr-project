import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Cloudflare Pages: 일반 정적 빌드(dist/). 백엔드는 Pages Functions(functions/).
export default defineConfig({
  plugins: [react()],
});
