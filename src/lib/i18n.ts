export const LANGS = ["en-US", "zh-CN"] as const;
export type Lang = (typeof LANGS)[number];
export const DEFAULT_LANG: Lang = "en-US";

// localStorage key holding the reader's preferred note language (see scripts/lang-pref.ts).
export const LANG_PREF_KEY = "kzh-lang";

export function isLang(value: unknown): value is Lang {
  return typeof value === "string" && (LANGS as readonly string[]).includes(value);
}

export function otherLang(lang: Lang): Lang {
  return lang === "zh-CN" ? "en-US" : "zh-CN";
}

export function t<T>(lang: Lang, strings: Record<Lang, T>): T {
  return strings[lang];
}

export const LANG_LABEL: Record<Lang, string> = { "en-US": "English", "zh-CN": "中文" };
export const LANG_SHORT: Record<Lang, string> = { "en-US": "EN", "zh-CN": "中" };
