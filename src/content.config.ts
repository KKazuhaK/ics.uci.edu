import { defineCollection } from "astro:content";
import { z } from "astro/zod";
import { glob } from "astro/loaders";
import { LANGS } from "./lib/i18n";

const localizedCourseCopy = z.object({
  heroPrimary: z.string(),
  heroSecondary: z.string(),
  readerHeading: z.string(),
  // {course} and {weekPhrase} are filled in per note.
  readerDescription: z.string(),
});

const courses = defineCollection({
  loader: glob({ pattern: "*.json", base: "./src/content/courses" }),
  schema: z.object({
    code: z.string().regex(/^[A-Z0-9]+-[A-Z0-9]+$/),
    name: z.string(),
    fullTitle: z.string(),
    short: z.string(),
    tagline: z.string(),
    dept: z.string(),
    tone: z.enum(["blue", "navy", "gold"]),
    // Taken this term: sorted first on the homepage and Notes home.
    current: z.boolean(),
    order: z.number().int(),
    copy: z.object(Object.fromEntries(LANGS.map((l) => [l, localizedCourseCopy])) as Record<(typeof LANGS)[number], typeof localizedCourseCopy>),
  }),
});

// src/content/notes/<COURSE>/<slug>.<lang>.md, slug = lec-NN | week-NN | <special>
const NOTE_FILE = /^([A-Z0-9]+-[A-Z0-9]+)\/([a-z0-9-]+)\.(en-US|zh-CN)\.md$/;

const notes = defineCollection({
  loader: glob({
    pattern: "*/*.md",
    base: "./src/content/notes",
    generateId: ({ entry }) => {
      if (!NOTE_FILE.test(entry)) {
        throw new Error(`Note file "${entry}" must be named <COURSE>/<slug>.<en-US|zh-CN>.md`);
      }
      return entry.replace(/\.md$/, "");
    },
  }),
  schema: z.object({
    title: z.string().min(1),
    summary: z.string().min(1),
    // Only for specials (e.g. final-review) whose label can't be derived from the slug.
    label: z.object({ "en-US": z.string(), "zh-CN": z.string() }).optional(),
    // Override the slug-derived sort position.
    order: z.number().optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { courses, notes };
