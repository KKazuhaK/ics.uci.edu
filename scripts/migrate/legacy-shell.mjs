// One-off: split a legacy Bento page into head/main/after fragments under
// src/legacy/<name>/ and write an Astro page that wraps them in LegacyPage.
//   node scripts/migrate/legacy-shell.mjs <public/path.html> <src/pages/out.astro> <name> [navPath]
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, relative } from "node:path";

const [src, out, name, navPath] = process.argv.slice(2);
const html = readFileSync(src, "utf8");
// Page scripts contain strings such as '</head><body>…</body></html>'
// (md-editor's HTML export). </head> is taken at its first occurrence (no
// script precedes it), </body> at its last, so neither is cut short.
const between = (s, a, b, last = false) => {
  const i = s.indexOf(a);
  const j = last ? s.lastIndexOf(b) : s.indexOf(b, i + a.length);
  if (i < 0 || j < 0) throw new Error(`${src}: missing ${a} … ${b}`);
  return s.slice(i + a.length, j);
};

const title = /<title>([^<]*)<\/title>/.exec(html)[1].replace(/\s*\|\s*Kazuha Mo — UC Irvine\s*$/, "");
const description = /<meta name="description" content="([^"]*)"/.exec(html)?.[1];

// <head>: drop what BaseLayout already provides.
let head = between(html, "<head>", "</head>")
  .replace(/\s*<title>[^<]*<\/title>/, "")
  .replace(/\s*<meta (?:charset|name="viewport"|name="description")[^>]*>/g, "")
  .replace(/\s*<link rel="(?:icon|preconnect)"[^>]*>/g, "")
  .replace(/\s*<link href="https:\/\/fonts\.googleapis\.com\/css2\?family=Inter[^"]*" rel="stylesheet" \/>/, "")
  .replace(/\s*<link rel="stylesheet" href="[./]*assets\/css\/bento\.css" \/>/, "")
  .replace(/\s*<script>\s*\(function \(\) \{\s*try \{\s*var saved = localStorage\.getItem\("kzh-theme"\);[\s\S]*?<\/script>/, "");

const body = between(html, "<body>", "</body>", true);
const navEnd = body.indexOf("</nav>", body.indexOf('<nav class="nav"')) + "</nav>".length;
const footStart = body.indexOf('<footer class="foot">');
if (body.lastIndexOf('<footer class="foot">') !== footStart) throw new Error(`${src}: more than one footer`);
const footEnd = body.indexOf("</footer>", footStart) + "</footer>".length;
const appEnd = body.indexOf("</div>", footEnd) + "</div>".length;
const main = body.slice(navEnd, footStart);
const after = body.slice(appEnd)
  .replace(/\s*<script src="[./]*assets\/js\/(?:bento|chat-widget)\.js" defer><\/script>/g, "");

for (const [k, v] of Object.entries({ head, main, after })) if (/<nav class="nav"|<footer class="foot"/.test(v)) throw new Error(`${src}: shell leaked into ${k}`);

const dir = `src/legacy/${name}`;
mkdirSync(dir, { recursive: true });
writeFileSync(`${dir}/head.html`, head.trim() + "\n");
writeFileSync(`${dir}/main.html`, main.trim() + "\n");
writeFileSync(`${dir}/after.html`, after.trim() + "\n");
// Keep history attached to the biggest fragment.
const rel = (p) => relative(dirname(out), p).replace(/^(?!\.)/, "./");
mkdirSync(dirname(out), { recursive: true });
const attrs = [`title=${JSON.stringify(title)}`, description && `description=${JSON.stringify(description)}`, navPath && `navPath=${JSON.stringify(navPath)}`].filter(Boolean).join(" ");
writeFileSync(out, `---
import LegacyPage from "${rel("src/components/LegacyPage.astro")}";
import head from "${rel(`${dir}/head.html`)}?raw";
import main from "${rel(`${dir}/main.html`)}?raw";
import after from "${rel(`${dir}/after.html`)}?raw";
---

<LegacyPage ${attrs} head={head} main={main} after={after} />
`);
execFileSync("git", ["rm", "-q", src]);
console.log(`${src} -> ${out} (${title})`);
