// Links between notes are written as relative Markdown links to the source file:
//   [Lecture 4](lec-04.en-US.md#2-the-stack-adt)   same course
//   [Week 1](../CS-121/week-01.en-US.md)          another course
// They render as note URLs. A link to a note that isn't written yet renders as
// plain text (with a build warning) and turns into a link once the note exists.
import { getCollection } from "astro:content";
import { courseSlug, parseNoteId } from "./notes";
import { noteUrl } from "./urls";

const NOTE_LINK = /^(?:\.\/|\.\.\/([A-Z0-9]+-[A-Z0-9]+)\/)?([a-z0-9-]+)\.(en-US|zh-CN)\.md(#.*)?$/;

let ids: Promise<Set<string>> | null = null;

export async function noteLinkResolver(fromId: string): Promise<(href: string) => string | null | false> {
  ids ??= getCollection("notes").then((all) => new Set(all.map((n) => n.id)));
  const known = await ids;
  const { course: fromCourse } = parseNoteId(fromId);
  return (href) => {
    const m = NOTE_LINK.exec(href);
    if (!m) return null;
    const [, course = fromCourse, slug, lang, hash = ""] = m;
    const id = `${course}/${slug}.${lang}`;
    if (!known.has(id)) {
      console.warn(`[notes] ${fromId}: ${href} not written yet; rendered as plain text`);
      return false;
    }
    return noteUrl(courseSlug(course), slug!, lang as "en-US" | "zh-CN") + hash;
  };
}
