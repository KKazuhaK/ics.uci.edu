// One-off migration: legacy course hubs (notesCatalog in HTML) -> Astro content collections.
//   public/notes/course_notes/<COURSE>/<File>_<lang>.md  ->  src/content/notes/<COURSE>/<slug>.<lang>.md
//   title/summary move into frontmatter; course copy -> src/content/courses/<COURSE>.json
// Uses `git mv` so file history follows the notes.
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { readHubs } from "./read-hubs.mjs";

const root = new URL("../../", import.meta.url).pathname;
const git = (...args) => execFileSync("git", args, { cwd: root, stdio: "inherit" });

// Hand-collected from index.html / notes/index.html (the only places this lived).
const CARDS = {
  "ICS-46": { name: "ICS 46", fullTitle: "Data Structure Implementation and Analysis", short: "Data Structures in C++.", tagline: "bilingual", dept: "ICS", tone: "blue", current: true, order: 1 },
  "CS-121": { name: "CS 121", fullTitle: "Information Retrieval", short: "Information Retrieval.", tagline: "bilingual", dept: "CS", tone: "navy", current: true, order: 2 },
  "IN4MATX-133": { name: "IN4MATX 133", fullTitle: "User Interface Software", short: "User Interface Software.", tagline: "live HTML/CSS/JS demos", dept: "IN4MATX", tone: "gold", current: true, order: 3 },
  "ICS-45C": { name: "ICS 45C", fullTitle: "Programming in C/C++ as a Second Language", short: "C/C++ as a Second Language.", tagline: "bilingual", dept: "ICS", tone: "blue", current: false, order: 4 },
  "IN4MATX-43": { name: "IN4MATX 43", fullTitle: "Introduction to Software Engineering", short: "Intro to Software Engineering.", tagline: "bilingual", dept: "INF", tone: "gold", current: false, order: 5 },
};

// courseProfiles from the legacy md-viewer.
function readProfiles() {
  const html = readFileSync(`${root}public/tools/md-viewer/index.html`, "utf8");
  const start = html.indexOf("const courseProfiles = ");
  let i = html.indexOf("{", start), depth = 0, j = i;
  for (; j < html.length; j++) {
    if (html[j] === "{") depth++;
    else if (html[j] === "}" && --depth === 0) break;
  }
  return new Function(`return (${html.slice(i, j + 1)});`)();
}

function slugFor(label) {
  let m;
  if ((m = /^Lecture (\d+)$/.exec(label))) return `lec-${m[1].padStart(2, "0")}`;
  if ((m = /^Week (\d+)$/.exec(label))) return `week-${m[1].padStart(2, "0")}`;
  if (label === "Final Review") return "final-review";
  throw new Error(`unknown label ${label}`);
}

const yaml = (s) => JSON.stringify(s); // JSON strings are valid YAML scalars

const profiles = readProfiles();
for (const hub of readHubs()) {
  const { course } = hub;
  const dir = `src/content/notes/${course}`;
  mkdirSync(`${root}${dir}`, { recursive: true });

  for (const entry of hub.notesCatalog) {
    const slug = slugFor(entry.week);
    for (const [lang, version] of Object.entries(entry.availability)) {
      const from = `public/notes/course_notes/${course}/${version.note}`;
      const to = `${dir}/${slug}.${lang}.md`;
      git("mv", from, to);
      const body = readFileSync(`${root}${to}`, "utf8");
      const front = `---\ntitle: ${yaml(entry.title[lang])}\nsummary: ${yaml(entry.summary[lang])}\n---\n\n`;
      writeFileSync(`${root}${to}`, front + body);
    }
  }

  const profile = profiles[course];
  const card = CARDS[course];
  const json = {
    code: course,
    ...card,
    copy: Object.fromEntries(["en-US", "zh-CN"].map((lang) => [lang, {
      heroPrimary: hub.pageCopy[lang].heroPrimary,
      heroSecondary: hub.pageCopy[lang].heroSecondary,
      readerHeading: profile[lang].headingBase,
      readerDescription: profile[lang].descriptionTemplate,
    }])),
  };
  mkdirSync(`${root}src/content/courses`, { recursive: true });
  writeFileSync(`${root}src/content/courses/${course}.json`, JSON.stringify(json, null, 2) + "\n");
  console.log(`${course}: ${hub.notesCatalog.length} entries`);
}
