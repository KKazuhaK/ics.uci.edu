// Site knowledge base for the Ask AI worker (tools/ask-ai/worker.js fetches it hourly).
// Course notes come from the content collections; other pages from src/data/sitemap-static.json.
import type { APIRoute } from "astro";
import staticMap from "../data/sitemap-static.json";
import { LANGS } from "../lib/i18n";
import { courseSlug, getCourses, getNoteGroups, pickVersion, unitLabel } from "../lib/notes";

const BASE = import.meta.env.BASE_URL.replace(/\/?$/, "");
// Paths in the sitemap are relative to site.base_url, like the legacy file.
const rel = (path: string) => path.slice(BASE.length) || "/";

export const GET: APIRoute = async () => {
  const groups = await getNoteGroups();
  const coursePages = (await getCourses()).map((course) => {
    const c = course.data;
    const slug = courseSlug(c.code);
    return {
      path: `/notes/${slug}/`,
      title: `${c.name} Notes`,
      description: c.copy["en-US"].heroPrimary,
      category: "notes",
      notes: (groups.get(c.code) ?? []).map((g) => ({
        label: unitLabel(g, "en-US"),
        title: Object.fromEntries(LANGS.filter((l) => g.versions[l]).map((l) => [l, g.versions[l]!.data.title])),
        summary: pickVersion(g, "en-US").note.data.summary,
        languages: LANGS.filter((l) => g.versions[l]),
        urls: Object.fromEntries(LANGS.filter((l) => g.versions[l]).map((l) => [l, rel(`${BASE}/notes/${slug}/${g.slug}/${l}/`)])),
      })),
    };
  });

  const pages = [...staticMap.pages];
  pages.splice(pages.findIndex((p) => p.path === "/notes/") + 1, 0, ...coursePages);
  const site = { ...staticMap.site, updated: new Date().toISOString().slice(0, 10) };
  return new Response(JSON.stringify({ site, pages }, null, 2), { headers: { "Content-Type": "application/json" } });
};
