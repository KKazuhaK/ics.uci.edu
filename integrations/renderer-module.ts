// Publishes the note renderer as a standalone ES module at
// assets/js/kzh-markdown.mjs, so tools outside this repo (the notes skills'
// check_md.py) render drafts with the same code as the site.
import type { AstroIntegration } from "astro";
import { fileURLToPath } from "node:url";
import { build } from "vite";

export default function rendererModule(): AstroIntegration {
  return {
    name: "renderer-module",
    hooks: {
      "astro:build:done": async ({ dir, logger }) => {
        await build({
          configFile: false,
          publicDir: false,
          logLevel: "warn",
          build: {
            outDir: fileURLToPath(new URL("assets/js/", dir)),
            emptyOutDir: false,
            minify: false,
            lib: { entry: fileURLToPath(new URL("../src/lib/markdown/module.ts", import.meta.url)), formats: ["es"], fileName: () => "kzh-markdown.mjs" },
            rolldownOptions: {
              // Only loaded when highlight / math are on, which module callers don't use.
              external: ["shiki", "katex"],
              // One self-contained file.
              output: { codeSplitting: false },
            },
          },
        });
        logger.info("assets/js/kzh-markdown.mjs");
      },
    },
  };
}
