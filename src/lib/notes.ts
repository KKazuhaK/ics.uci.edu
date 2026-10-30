import { getCollection, type CollectionEntry } from "astro:content";
import { LANGS, type Lang } from "./i18n";

export type NoteEntry = CollectionEntry<"notes">;
export type CourseEntry = CollectionEntry<"courses">;

export type Unit = "lecture" | "week" | "special";

/** One lecture/week of a course, with whichever languages exist. */
export interface NoteGroup {
  course: string; // "ICS-46"
  courseSlug: string; // "ics-46"
  slug: string; // "lec-09"
  unit: Unit;
  number: number | null;
  order: number;
  versions: Partial<Record<Lang, NoteEntry>>;
}

export function courseSlug(code: string): string {
  return code.toLowerCase();
}

export function parseNoteId(id: string): { course: string; slug: string; lang: Lang } {
  const m = /^([^/]+)\/([^/.]+)\.(en-US|zh-CN)$/.exec(id);
  if (!m) throw new Error(`bad note id ${id}`);
  return { course: m[1]!, slug: m[2]!, lang: m[3] as Lang };
}

export function parseSlug(slug: string): { unit: Unit; number: number | null } {
  const m = /^(lec|week)-(\d+)$/.exec(slug);
  if (!m) return { unit: "special", number: null };
  return { unit: m[1] === "lec" ? "lecture" : "week", number: Number(m[2]) };
}

const SPECIAL_ORDER = 1000;

/** "Lecture 9" / "第 9 讲", "Week 1" / "第 1 周", or the special's label. */
export function unitLabel(group: Pick<NoteGroup, "unit" | "number" | "slug" | "versions">, lang: Lang): string {
  const { unit, number } = group;
  if (unit === "lecture") return lang === "zh-CN" ? `第 ${number} 讲` : `Lecture ${number}`;
  if (unit === "week") return lang === "zh-CN" ? `第 ${number} 周` : `Week ${number}`;
  const custom = (group.versions[lang] ?? Object.values(group.versions)[0])?.data.label;
  if (custom) return custom[lang];
  return group.slug.split("-").map((w) => w[0]!.toUpperCase() + w.slice(1)).join(" ");
}

/** English unit label used where the legacy site always showed English ("Lecture 9"). */
export function unitLabelEn(group: NoteGroup): string {
  return unitLabel(group, "en-US");
}

let groupsCache: Promise<Map<string, NoteGroup[]>> | null = null;

/** course code -> groups sorted in reading order. */
export function getNoteGroups(): Promise<Map<string, NoteGroup[]>> {
  groupsCache ??= (async () => {
    const notes = await getCollection("notes", (n) => !n.data.draft);
    const byKey = new Map<string, NoteGroup>();
    for (const note of notes) {
      const { course, slug, lang } = parseNoteId(note.id);
      const key = `${course}/${slug}`;
      let group = byKey.get(key);
      if (!group) {
        const { unit, number } = parseSlug(slug);
        group = { course, courseSlug: courseSlug(course), slug, unit, number, order: number ?? SPECIAL_ORDER, versions: {} };
        byKey.set(key, group);
      }
      group.versions[lang] = note;
      if (note.data.order !== undefined) group.order = note.data.order;
    }
    const byCourse = new Map<string, NoteGroup[]>();
    for (const group of byKey.values()) {
      const list = byCourse.get(group.course) ?? [];
      list.push(group);
      byCourse.set(group.course, list);
    }
    for (const list of byCourse.values()) list.sort((a, b) => a.order - b.order || a.slug.localeCompare(b.slug));
    return byCourse;
  })();
  return groupsCache;
}

export async function getCourses(): Promise<CourseEntry[]> {
  const courses = await getCollection("courses");
  const groups = await getNoteGroups();
  for (const code of groups.keys()) {
    if (!courses.some((c) => c.data.code === code)) {
      throw new Error(`Notes exist for ${code} but src/content/courses/${code}.json is missing`);
    }
  }
  return courses.sort((a, b) => Number(b.data.current) - Number(a.data.current) || a.data.order - b.data.order);
}

/** Pick the version to open for a preferred language, falling back to any. */
export function pickVersion(group: NoteGroup, lang: Lang): { lang: Lang; note: NoteEntry } {
  for (const l of [lang, ...LANGS.filter((x) => x !== lang)]) {
    const note = group.versions[l];
    if (note) return { lang: l, note };
  }
  throw new Error(`empty group ${group.course}/${group.slug}`);
}
