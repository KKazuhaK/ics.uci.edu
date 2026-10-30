// LA/TA demo tracks. Each week's page lives at src/pages/notes/demo_notes/<code>/<file>.
// hidden: true keeps a week off the listings without deleting its page.
export interface DemoWeek {
  week: number;
  title: string;
  summary: string;
  labs: number;
  file: string;
  hidden?: boolean;
}

export interface DemoCourse {
  code: string;
  name: string;
  heading: string;
  intro: string;
  cardDesc: string;
  shortDesc: string;
  about: string; // sitemap.json
  metaDesc: string;
  weeks: DemoWeek[];
}

export const DEMO_COURSES: DemoCourse[] = [
  {
    code: "ICS-31",
    name: "ICS 31",
    heading: "ICS 31 — Interactive Demos",
    intro: "Step-by-step interactive walkthroughs for ICS 31 lab concepts. Use these during LA/TA sessions to help students visualize how Python expressions work.",
    cardDesc: "Introduction to Programming — LA demo walkthroughs covering Python basics and interactive examples.",
    shortDesc: "Intro to Programming · LA demo notebooks",
    metaDesc: "Step-by-step interactive walkthroughs for ICS 31 lab concepts — for LA/TA sessions.",
    about: "Interactive Python demos for ICS 31 (Introduction to Programming). Includes variable watch panels and step-by-step code execution.",
    weeks: [
      { week: 2, title: "Basic Types, Operators & Modules | Expressions & Strings", summary: "Numeric types, arithmetic expressions, division/modulo, string basics, slicing, formatting, f-strings, and related labs.", labs: 4, file: "week-2.html" },
      { week: 3, title: "Loops, Lists & String Operations", summary: "For loops, if/elif branching, list building with append(), string methods (split), and counting patterns.", labs: 4, file: "week-3.html" },
      { week: 5, title: "While Loops", summary: "Sentinel-controlled while loops, integer division (//) and modulo (%), tuple unpacking — Lab 5.18 (Countdown until matching digits) and Lab 5.19 (Mad Lib).", labs: 2, file: "week-5.html" },
    ],
  },
];

export const visibleWeeks = (c: DemoCourse) => c.weeks.filter((w) => !w.hidden);
