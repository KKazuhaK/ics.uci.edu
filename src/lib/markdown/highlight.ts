// Shiki, VS Code Dark+ theme. Languages load on demand; unknown ones fall back to plain blocks.
import type { HighlighterGeneric, BundledLanguage, BundledTheme } from "shiki";

export const SHIKI_THEME = "dark-plus";
type Highlighter = HighlighterGeneric<BundledLanguage, BundledTheme>;

let highlighterPromise: Promise<Highlighter> | null = null;

export async function getHighlighter(langs: string[]): Promise<Highlighter> {
  const shiki = await import("shiki");
  highlighterPromise ??= shiki.createHighlighter({ themes: [SHIKI_THEME], langs: [] });
  const highlighter = await highlighterPromise;
  const loaded = new Set(highlighter.getLoadedLanguages());
  const wanted = langs.filter((l) => !loaded.has(l) && l in shiki.bundledLanguages) as BundledLanguage[];
  if (wanted.length) await highlighter.loadLanguage(...wanted);
  return highlighter;
}

/** Highlighted <pre>, or null when the language isn't available. */
export function highlightCode(highlighter: Highlighter, code: string, lang: string): string | null {
  if (!highlighter.getLoadedLanguages().includes(lang)) return null;
  try {
    const html = highlighter.codeToHtml(code, { lang, theme: SHIKI_THEME });
    return html.replace(/^<pre /, `<pre data-language="${lang}" `);
  } catch {
    return null;
  }
}
