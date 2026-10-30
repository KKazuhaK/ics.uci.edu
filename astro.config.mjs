// @ts-check
import { defineConfig } from "astro/config";
import legacyRedirects from "./integrations/legacy-redirects";

// Production lives under the user directory; `npm run deploy:next` overrides
// the base to stage a build at /~kazuhak/next/ next to the live site.
const base = process.env.SITE_BASE ?? "/~kazuhak";

export default defineConfig({
  site: "https://ics.uci.edu",
  base,
  trailingSlash: "ignore",
  build: { format: "directory" },
  integrations: [legacyRedirects()],
  // mermaid is one big lazy-loaded chunk, only fetched on notes with diagrams.
  vite: { build: { chunkSizeWarningLimit: 3000 } },
});
