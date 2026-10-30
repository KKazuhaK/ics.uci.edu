// One-off: pull notesCatalog / pageCopy out of the legacy course hub pages.
import { readFileSync, readdirSync } from "node:fs";
const root = new URL("../../public/notes/course_notes/", import.meta.url);
export function readHubs() {
  return readdirSync(root).map((course) => {
    const html = readFileSync(new URL(`${course}/index.html`, root), "utf8");
    const grab = (name) => {
      const start = html.indexOf(`const ${name} = `);
      if (start < 0) return null;
      let i = html.indexOf("=", start) + 1, depth = 0, began = false, j = i;
      for (; j < html.length; j++) {
        const c = html[j];
        if (c === "[" || c === "{") { depth++; began = true; }
        else if (c === "]" || c === "}") { depth--; if (began && depth === 0) break; }
      }
      return new Function(`return (${html.slice(i, j + 1)});`)();
    };
    const title = html.match(/<title>([^<]*)<\/title>/)[1];
    return { course, title, pageCopy: grab("pageCopy"), notesCatalog: grab("notesCatalog") };
  });
}
if (import.meta.url === `file://${process.argv[1]}`) {
  for (const h of readHubs()) {
    console.log("==", h.course, "|", h.title, "| pageCopy keys:", Object.keys(h.pageCopy || {}).join(","), JSON.stringify(h.pageCopy?.["en-US"] ?? {}).slice(0, 200));
    for (const e of h.notesCatalog) console.log("  ", e.week, "|", Object.entries(e.availability).map(([l, v]) => `${l}:${v?.note}`).join(" "), Object.keys(e).filter((k) => !["week", "title", "summary", "availability"].includes(k)).join(","));
  }
}
