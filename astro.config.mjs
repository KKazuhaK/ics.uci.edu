// @ts-check
import { defineConfig } from "astro/config";
import legacyRedirects from "./integrations/legacy-redirects";
import rendererModule from "./integrations/renderer-module";

// Production lives under the user directory; `npm run deploy:next` overrides
// the base to stage a build at /~kazuhak/next/ next to the live site.
// The uci.kazuha.me mirror (CI `cloudflare` job) sets SITE_URL + SITE_BASE=/; with
// neither set the build is the ICS one.
const base = process.env.SITE_BASE ?? "/~kazuhak";

export default defineConfig({
  site: process.env.SITE_URL ?? "https://ics.uci.edu",
  base,
  trailingSlash: "ignore",
  // "preserve": about.astro -> about.html, x/index.astro -> x/index.html, so legacy URLs keep working.
  build: { format: "preserve" },
  integrations: [legacyRedirects(), rendererModule()],
  // mermaid is one big lazy-loaded chunk, only fetched on notes with diagrams.
  vite: { build: { chunkSizeWarningLimit: 3000 } },
});
