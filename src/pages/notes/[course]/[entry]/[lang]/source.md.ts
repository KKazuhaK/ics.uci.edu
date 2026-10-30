// Raw Markdown of a note (no frontmatter), for "Open in Editor" and anyone who wants the source.
import type { APIRoute, GetStaticPaths } from "astro";
import { getNoteGroups } from "../../../../../lib/notes";

export const getStaticPaths = (async () => {
  const groups = await getNoteGroups();
  return [...groups.values()].flat().flatMap((group) =>
    Object.entries(group.versions).map(([lang, note]) => ({
      params: { course: group.courseSlug, entry: group.slug, lang },
      props: { body: note.body ?? "" },
    })),
  );
}) satisfies GetStaticPaths;

export const GET: APIRoute = ({ props }) =>
  new Response(props.body as string, { headers: { "Content-Type": "text/markdown; charset=utf-8" } });
