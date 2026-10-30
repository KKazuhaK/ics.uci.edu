import type { Lang } from "../i18n";

export function escapeHtml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

const ALIASES: Record<string, string> = {
  "c++": "cpp", cc: "cpp", cxx: "cpp", hpp: "cpp", "h++": "cpp", hxx: "cpp",
  py: "python",
  sh: "bash", shell: "bash", zsh: "bash",
  js: "javascript", mjs: "javascript", cjs: "javascript",
  ts: "typescript", mts: "typescript", cts: "typescript",
  yml: "yaml", md: "markdown",
  plain: "text", plaintext: "text", txt: "text",
};

export function normalizeCodeLanguage(language: string): string {
  const raw = (language || "").trim().toLowerCase();
  return raw ? (ALIASES[raw] ?? raw) : "";
}

// Code blocks longer than this many lines start folded to their first 20.
export const CODE_COLLAPSE_MIN = 30;

const ICON = {
  chevron: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>',
  copy: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>',
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>',
};
export { ICON as CODE_ICONS };

export const CODE_STRINGS = {
  "en-US": { showAll: (n: number) => `Show all ${n} lines`, collapse: "Collapse", copy: "Copy code", copied: "Copied" },
  "zh-CN": { showAll: (n: number) => `展开全部（${n} 行）`, collapse: "收起", copy: "复制代码", copied: "已复制" },
} satisfies Record<Lang, unknown>;

/** Wrap a rendered <pre> with the copy button, and the collapse toggle when it is long.
 *  Behaviour is wired up by scripts/reader/code-ui.ts via event delegation. */
export function codeBlockUi(preHtml: string, code: string, lang: Lang): string {
  const s = CODE_STRINGS[lang];
  const copy = `<button type="button" class="code-copy-btn" title="${s.copy}" aria-label="${s.copy}">${ICON.copy}</button>`;
  const lineCount = code.replace(/\n+$/, "").split("\n").length;
  if (lineCount <= CODE_COLLAPSE_MIN) return `<div class="code-wrap">${preHtml}${copy}</div>\n`;
  const toggle = `<button type="button" class="code-collapse-btn" aria-expanded="false" data-lines="${lineCount}">${ICON.chevron}<span>${s.showAll(lineCount)}</span></button>`;
  return `<div class="code-collapse is-collapsed">${preHtml}${toggle}${copy}</div>\n`;
}
