// Parity check: legacy md-viewer marked pipeline vs src/lib/markdown/render.ts
// on every note (highlight/math off; code-block chrome stripped before comparing).
import { readFileSync, readdirSync } from "node:fs";
import { Marked, Renderer } from "marked";
import markedFootnote from "marked-footnote";
import { renderMarkdown } from "../../src/lib/markdown/render";

// Saved copy of the last hand-written md-viewer (commit d1aa991).
const html = readFileSync("scripts/migrate/fixtures/legacy-md-viewer.html", "utf8");
const a = html.indexOf("\t\t\tfunction escapeHtml(text)");
const b = html.indexOf("\t\t\tfunction formatLastModified");
const legacySrc = html.slice(a, b);
const marked = { Marked, Renderer };
const legacy = new Function("marked", "markedFootnote", legacySrc + "\nreturn markdownToHtml;")(marked, markedFootnote) as (md: string) => string;

const strip = (s: string) =>
  s.replace(/<button type="button" class="code-(?:copy|collapse)-btn"[\s\S]*?<\/button>/g, "")
   .replace(/<div class="code-(?:wrap|collapse is-collapsed)">([\s\S]*?<\/pre>)<\/div>\n/g, "$1");

let bad = 0, total = 0;
for (const course of readdirSync("src/content/notes")) {
  for (const f of readdirSync(`src/content/notes/${course}`)) {
    const md = readFileSync(`src/content/notes/${course}/${f}`, "utf8").replace(/^---\n[\s\S]*?\n---\n\n/, "");
    const lang = f.includes("zh-CN") ? "zh-CN" : "en-US";
    const want = legacy(md);
    const got = strip((await renderMarkdown(md, { lang, highlight: false, math: false })).html);
    total++;
    if (want !== got) {
      bad++;
      let i = 0; while (want[i] === got[i]) i++;
      console.log(`DIFF ${course}/${f} @${i}\n  legacy: ${JSON.stringify(want.slice(i - 60, i + 120))}\n  new:    ${JSON.stringify(got.slice(i - 60, i + 120))}`);
    }
  }
}
console.log(`${total - bad}/${total} identical`);
