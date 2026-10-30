// Links that open a note in the reader's preferred language. Markup carries
// one URL per language (data-href-en-US, data-href-zh-CN); href defaults to the
// first so the page works without JS.
import { getLangPref } from "./lang-pref";

export function applyLangLinks(root: ParentNode = document): void {
  const lang = getLangPref();
  if (!lang) return;
  root.querySelectorAll<HTMLAnchorElement>("a[data-lang-links]").forEach((a) => {
    const href = a.getAttribute(`data-href-${lang}`);
    if (href) a.href = href;
  });
}
