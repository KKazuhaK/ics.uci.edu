// Public entry for assets/js/kzh-markdown.mjs (built by integrations/renderer-module.ts).
// The notes skills' check_md.py imports it under node to render a draft exactly
// like the site does. Shiki and KaTeX are left out of this bundle, so highlight
// and math default to off here (the site's own pages turn them on).
import { renderMarkdown as render, type RenderOptions, type RenderResult } from "./render";

export type { Heading, RenderOptions, RenderResult } from "./render";
export { plainTextForSlug, slugifyHeading } from "./slug";

export function renderMarkdown(markdown: string, options: RenderOptions): Promise<RenderResult> {
  return render(markdown, { highlight: false, math: false, ...options });
}

/** Bumped when the module's API changes in a way callers must notice. */
export const API_VERSION = 1;
