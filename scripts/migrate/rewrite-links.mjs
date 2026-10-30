// One-off: legacy viewer links (?kind=course_notes&course=C&lang=L&note=FILE#x)
// inside notes -> relative Markdown links (slug.lang.md#x, or ../C/slug.lang.md#x).
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
const map = JSON.parse(readFileSync("src/data/legacy-notes.json", "utf8"));
const RE = /\((?:\.\.\/\.\.\/tools\/md-viewer\/|\/~kazuhak\/tools\/md-viewer\/)?\?kind=course_notes&(?:amp;)?course=([A-Z0-9-]+)&(?:amp;)?lang=(?:en-US|zh-CN)&(?:amp;)?note=([A-Za-z0-9._-]+\.md)(#[^)\s]*)?\)/g;
let n = 0;
for (const course of readdirSync("src/content/notes")) {
  for (const f of readdirSync(`src/content/notes/${course}`)) {
    const path = `src/content/notes/${course}/${f}`;
    const text = readFileSync(path, "utf8");
    const out = text.replace(RE, (all, c, file, hash = "") => {
      // Not-yet-written notes aren't in the map; derive their future id from the name.
      const m = /_(Lec|Week)0*(\d+)_Notes_(en-US|zh-CN)\.md$/.exec(file);
      const id = map[`${c}/${file}`] ?? (m && `${c}/${m[1] === "Lec" ? "lec" : "week"}-${m[2].padStart(2, "0")}.${m[3]}`);
      if (!id) throw new Error(`${path}: unknown legacy note ${c}/${file}`);
      n++;
      const [tc, rest] = id.split("/");
      return `(${tc === course ? "" : `../${tc}/`}${rest}.md${hash})`;
    });
    if (out !== text) writeFileSync(path, out);
  }
}
console.log(`rewrote ${n} links`);
