import type { Lang } from "./i18n";

// import.meta.env.BASE_URL is "/~kazuhak" or "/~kazuhak/next" (no trailing slash
// because trailingSlash is "ignore"); normalise to always end in "/".
const BASE = import.meta.env.BASE_URL.replace(/\/?$/, "/");

/** Site-relative path -> URL under the deploy base. `url("notes/")` -> "/~kazuhak/notes/". */
export function url(path = ""): string {
  return BASE + path.replace(/^\//, "");
}

export function courseUrl(courseSlug: string): string {
  return url(`notes/${courseSlug}/`);
}

export function noteUrl(courseSlug: string, slug: string, lang: Lang): string {
  return url(`notes/${courseSlug}/${slug}/${lang}/`);
}

export function noteSourceUrl(courseSlug: string, slug: string, lang: Lang): string {
  return url(`notes/${courseSlug}/${slug}/${lang}/source.md`);
}
