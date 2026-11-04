// Build-time only (reads process.env). Absolute URL search engines should treat
// as the page's home. Mirrors set CANONICAL_URL (e.g. "https://ics.uci.edu/~kazuhak/")
// so their pages point at the ICS copy; the ICS build leaves it unset and links to itself.
import { url } from "./urls";

/** `path` is a URL path under the deploy base, as from `url()` or `Astro.url.pathname`. */
export function canonicalUrl(path: string, site: URL | undefined): string {
  const root = process.env.CANONICAL_URL;
  if (!root) return new URL(path, site).href;
  const base = url(); // always ends in "/"
  const rest = path.startsWith(base) ? path.slice(base.length) : path === base.slice(0, -1) ? "" : path.replace(/^\//, "");
  return new URL(rest, root.replace(/\/?$/, "/")).href;
}
