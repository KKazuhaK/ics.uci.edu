// Note Markdown -> HTML. One renderer for every place notes are shown:
// note pages at build time, and md-viewer upload mode / md-editor preview in
// the browser. Ported from the legacy md-viewer's marked setup; the quirks
// below exist because real notes depend on them.
import { Marked, Renderer, type Token, type Tokens } from "marked";
import markedFootnote from "marked-footnote";
import type { Lang } from "../i18n";
import { plainTextForSlug, slugifyHeading } from "./slug";
import { CODE_COLLAPSE_MIN, codeBlockUi, escapeHtml, normalizeCodeLanguage } from "./code";
import { getHighlighter, highlightCode } from "./highlight";
import { loadMath, renderMath } from "./math";

export interface RenderOptions {
  lang: Lang;
  /** Relative image paths resolve against this (the note's directory), absolute or root-relative. */
  baseUrl?: string;
  /** Run Shiki on fenced code (default true). */
  highlight?: boolean;
  /** Typeset $…$ / $$…$$ with KaTeX (default true). */
  math?: boolean;
  /** Wrap code blocks with copy / collapse buttons (default true; off for editor preview and export). */
  codeUi?: boolean;
  /** Rewrite link targets (e.g. `lec-04.en-US.md#x` → the note's URL). null keeps the
   *  link as written; false drops the link and keeps its text. */
  resolveLink?: (href: string) => string | null | false;
}

export interface Heading {
  depth: number;
  id: string;
  text: string;
}

export interface RenderResult {
  html: string;
  headings: Heading[];
  /** Fenced ```viz blocks, for build-time validation. */
  viz: { name: string; source: string }[];
  hasMath: boolean;
  hasMermaid: boolean;
}

interface RenderState {
  opts: Required<Pick<RenderOptions, "lang" | "highlight" | "math" | "codeUi">> & {
    baseUrl: RenderOptions["baseUrl"] | undefined;
    resolveLink: RenderOptions["resolveLink"] | undefined;
  };
  slugCounts: Map<string, number>;
  result: RenderResult;
  highlighter: Awaited<ReturnType<typeof getHighlighter>> | null;
}

let state: RenderState | null = null;
function current(): RenderState {
  if (!state) throw new Error("markdown renderer used outside renderMarkdown()");
  return state;
}

function resolveNoteUrl(href: string): string {
  const base = current().opts.baseUrl;
  if (!href || !base || /^(?:[a-z][a-z0-9+.-]*:|\/|#|\?)/i.test(href)) return href;
  try {
    if (base.startsWith("/")) {
      const u = new URL(href, "https://x.invalid" + base);
      return u.pathname + u.search + u.hash;
    }
    return new URL(href, base).href;
  } catch {
    return href;
  }
}

// Notes use multi-line > callouts as line-by-line boxes (course header,
// Klefstad quotes). CommonMark joins those lines with a space; turn soft
// line breaks inside blockquote paragraphs back into <br>.
function splitSoftBreaks(tokens: Token[]): void {
  for (let index = tokens.length - 1; index >= 0; index -= 1) {
    const token = tokens[index]!;
    if (token.type === "text" && !("tokens" in token && token.tokens) && token.text.includes("\n")) {
      const pieces: Token[] = [];
      token.text.split("\n").forEach((part: string, partIndex: number) => {
        if (partIndex > 0) pieces.push({ type: "br", raw: "\n" });
        if (part) pieces.push({ ...token, raw: part, text: part } as Token);
      });
      tokens.splice(index, 1, ...pieces);
    } else if (token.type !== "codespan" && "tokens" in token && token.tokens) {
      splitSoftBreaks(token.tokens);
    }
  }
}

const parser = new Marked({ gfm: true, breaks: false });
parser.use(markedFootnote());
parser.use({
  walkTokens(token) {
    if (token.type !== "blockquote") return;
    (token as Tokens.Blockquote).tokens.forEach((child) => {
      if (child.type === "paragraph") splitSoftBreaks((child as Tokens.Paragraph).tokens);
    });
  },
});
parser.use({
  extensions: [
    {
      // $$...$$ on its own line(s) → .math-block.
      name: "mathBlock",
      level: "block",
      start(src: string) {
        const match = src.match(/^ {0,3}\$\$/m);
        return match ? match.index : undefined;
      },
      tokenizer(src: string) {
        const match = src.match(/^ {0,3}(\$\$[\s\S]+?\$\$)[^\S\n]*(?:\n+|$)/);
        if (match) return { type: "mathBlock", raw: match[0], text: match[1]! };
        return undefined;
      },
      renderer(token) {
        const s = current();
        s.result.hasMath = true;
        const inner = s.opts.math ? renderMath(token.text as string) : escapeHtml(token.text as string);
        return '<div class="math-block">' + inner + "</div>\n";
      },
    },
    {
      // Inline $...$ / $$...$$ is captured whole so marked doesn't eat
      // backslashes or turn _ / * inside formulas into emphasis.
      name: "mathInline",
      level: "inline",
      start(src: string) {
        const index = src.indexOf("$");
        return index < 0 ? undefined : index;
      },
      tokenizer(src: string) {
        const match = src.match(/^\$\$[\s\S]+?\$\$/) || src.match(/^\$(?:\\.|[^\\$])+?\$/);
        if (match) return { type: "mathInline", raw: match[0], text: match[0] };
        return undefined;
      },
      renderer(token) {
        const s = current();
        s.result.hasMath = true;
        return s.opts.math ? renderMath(token.text as string) : escapeHtml(token.text as string);
      },
    },
    {
      // CJK-friendly emphasis: CommonMark refuses to close **…** when the marker
      // sits between punctuation and a CJK character (**术语（term）**之后), which
      // the Chinese notes do constantly. Match the pair directly instead; the
      // markers must hug non-space text, so `int * p` stays literal.
      name: "strongCjk",
      level: "inline",
      start(src: string) {
        const index = src.indexOf("**");
        return index < 0 ? undefined : index;
      },
      tokenizer(src: string) {
        const match = src.match(/^\*\*(?=[^\s*])((?:\\.|`[^`]*`|[^\\*`]|\*(?!\*))+?)(?<=[^\s*])\*\*(?!\*)/);
        if (match) return { type: "strongCjk", raw: match[0], tokens: this.lexer.inlineTokens(match[1]!) };
        return undefined;
      },
      renderer(token) {
        return "<strong>" + this.parser.parseInline(token.tokens!) + "</strong>";
      },
    },
    {
      name: "emCjk",
      level: "inline",
      start(src: string) {
        const index = src.indexOf("*");
        return index < 0 ? undefined : index;
      },
      tokenizer(src: string) {
        const match = src.match(/^\*(?=[^\s*])((?:\\.|`[^`]*`|[^\\*`])+?)(?<=[^\s*])\*(?!\*)/);
        if (match) return { type: "emCjk", raw: match[0], tokens: this.lexer.inlineTokens(match[1]!) };
        return undefined;
      },
      renderer(token) {
        return "<em>" + this.parser.parseInline(token.tokens!) + "</em>";
      },
    },
  ],
  renderer: {
    code(token) {
      const s = current();
      const info = (token.lang || "").trim().split(/\s+/);
      const tag = (info[0] || "").toLowerCase();
      // ```viz <component> keeps its component name; scripts/reader mounts the demo.
      if (tag === "viz") {
        s.result.viz.push({ name: info[1] || "", source: token.text });
        return '<pre data-language="viz" data-viz="' + escapeHtml(info[1] || "") + '"><code>' + escapeHtml(token.text) + "</code></pre>";
      }
      const language = normalizeCodeLanguage(info[0] || "");
      if (language === "mermaid") {
        s.result.hasMermaid = true;
        return '<pre data-language="mermaid"><code class="language-mermaid">' + escapeHtml(token.text) + "</code></pre>";
      }
      let pre: string | null = null;
      if (s.highlighter && language && language !== "text") pre = highlightCode(s.highlighter, token.text, language);
      pre ??= "<pre" + (language ? ' data-language="' + language + '"' : "") + "><code" + (language ? ' class="language-' + language + '"' : "") + ">" + escapeHtml(token.text) + "</code></pre>";
      return s.opts.codeUi ? codeBlockUi(pre, token.text, s.opts.lang) : pre + "\n";
    },
    heading(token) {
      const s = current();
      const id = slugifyHeading(token.text, s.slugCounts);
      const inner = this.parser.parseInline(token.tokens);
      s.result.headings.push({ depth: token.depth, id, text: plainTextForSlug(token.text) });
      return "<h" + token.depth + ' id="' + id + '">' + inner + "</h" + token.depth + ">\n";
    },
    link(token) {
      // `operator[]()` in prose is an empty link to CommonMark; keep it literal.
      if (!token.text && !token.href) return escapeHtml(token.raw);
      const resolved = current().opts.resolveLink?.(token.href);
      if (resolved == null) return false;
      if (resolved === false) return this.parser.parseInline(token.tokens);
      return Renderer.prototype.link.call(this, { ...token, href: resolved });
    },
    image(token) {
      const html = Renderer.prototype.image.call(this, { ...token, href: resolveNoteUrl(token.href) });
      return html.replace(/^<img /, '<img loading="lazy" ');
    },
  },
});

// GFM splits table cells on every unescaped |, even inside `code`.
// Notes write `||` in table cells, so escape pipes inside code spans on table rows.
function escapeTablePipesInCode(markdown: string): string {
  let inFence = false;
  return markdown
    .split("\n")
    .map((line) => {
      if (/^\s*(?:```|~~~)/.test(line)) {
        inFence = !inFence;
        return line;
      }
      if (inFence || !/^\s*(?:>\s*)*\|/.test(line)) return line;
      return line.replace(/(`+)([^`]|[^`][\s\S]*?[^`])\1(?!`)/g, (span) => span.replace(/(?<!\\)\|/g, "\\|"));
    })
    .join("\n");
}

function fenceLanguages(markdown: string): string[] {
  const langs = new Set<string>();
  for (const m of markdown.matchAll(/^ {0,3}(?:```|~~~)\s*([^\s`]+)/gm)) {
    const lang = normalizeCodeLanguage(m[1]!);
    if (lang && lang !== "text" && lang !== "viz" && lang !== "mermaid") langs.add(lang);
  }
  return [...langs];
}

export async function renderMarkdown(markdown: string, options: RenderOptions): Promise<RenderResult> {
  const opts = { lang: options.lang, baseUrl: options.baseUrl, resolveLink: options.resolveLink, highlight: options.highlight ?? true, math: options.math ?? true, codeUi: options.codeUi ?? true };
  const source = escapeTablePipesInCode(markdown.replace(/\r\n/g, "\n"));
  const highlighter = opts.highlight ? await getHighlighter(fenceLanguages(source)) : null;
  if (opts.math) await loadMath();
  const result: RenderResult = { html: "", headings: [], viz: [], hasMath: false, hasMermaid: false };
  // marked's renderer is synchronous; everything async is loaded above.
  state = { opts, slugCounts: new Map(), result, highlighter };
  try {
    result.html = parser.parse(source, { async: false });
  } finally {
    state = null;
  }
  return result;
}

export { CODE_COLLAPSE_MIN };
