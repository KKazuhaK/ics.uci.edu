// The reader's preferred note language, shared by note pages, course hubs and
// the Notes home. URLs carry the language too; this only fills in the default.
import { isLang, LANG_PREF_KEY, type Lang } from "../lib/i18n";

export function getLangPref(): Lang | null {
  try {
    const v = localStorage.getItem(LANG_PREF_KEY);
    return isLang(v) ? v : null;
  } catch {
    return null;
  }
}

export function setLangPref(lang: Lang): void {
  try {
    localStorage.setItem(LANG_PREF_KEY, lang);
  } catch {}
}
