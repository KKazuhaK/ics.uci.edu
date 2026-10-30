// Site knowledge base for the Ask AI worker (tools/ask-ai/worker.js fetches it
// hourly and pastes it into the system prompt). Built entirely from site data.
import type { APIRoute } from "astro";
import { ABOUT } from "../data/about";
import { DEMO_COURSES, visibleWeeks } from "../data/demos";
import { PAGE_DESCRIPTIONS, SITE } from "../data/site";
import { TOOLS } from "../data/tools";
import { LANGS } from "../lib/i18n";
import { courseSlug, getCourses, getNoteGroups, pickVersion, unitLabel } from "../lib/notes";

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
      notes: (groups.get(c.code) ?? []).map((g) => {
        const langs = LANGS.filter((l) => g.versions[l]);
        return {
          label: unitLabel(g, "en-US"),
          title: Object.fromEntries(langs.map((l) => [l, g.versions[l]!.data.title])),
          summary: pickVersion(g, "en-US").note.data.summary,
          languages: langs,
          urls: Object.fromEntries(langs.map((l) => [l, `/notes/${slug}/${g.slug}/${l}/`])),
        };
      }),
    };
  });

  const pages = [
    { path: "/", title: "Home", description: PAGE_DESCRIPTIONS.home, category: "main" },
    {
      path: "/about.html",
      title: "About Me",
      description: PAGE_DESCRIPTIONS.about,
      category: "main",
      content: { name: ABOUT.name, degree: ABOUT.degree, school: ABOUT.school, email: ABOUT.email, bio: ABOUT.bio, links: ABOUT.links },
    },
    { path: "/notes/", title: "Notes", description: PAGE_DESCRIPTIONS.notes, category: "notes" },
    ...coursePages,
    { path: "/notes/demo_notes/", title: "LA/TA Demo Notes", description: PAGE_DESCRIPTIONS.demos, category: "notes" },
    ...DEMO_COURSES.map((c) => ({
      path: `/notes/demo_notes/${c.code}/`,
      title: `${c.name} Demos`,
      description: c.about,
      category: "notes",
      demos: visibleWeeks(c).map((w) => ({ path: `/notes/demo_notes/${c.code}/${w.file}`, title: `Week ${w.week} Demos: ${w.title}`, description: w.summary })),
    })),
    { path: "/tools/", title: "Tools", description: PAGE_DESCRIPTIONS.tools, category: "tools" },
    ...TOOLS.map((t) => ({ path: `/tools/${t.slug}/`, title: t.name, description: t.about, category: "tools" })),
  ];

  const site = { ...SITE, updated: new Date().toISOString().slice(0, 10) };
  return new Response(JSON.stringify({ site, pages }, null, 2), { headers: { "Content-Type": "application/json" } });
};
