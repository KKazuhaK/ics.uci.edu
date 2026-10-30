# Kazuha @ UCI -- Site Architecture

**Source:** `~/site/` (this repo) · **Served from:** `~/public_html/` (build output only, never edit it by hand)
**Public URL:** `https://ics.uci.edu/~kazuhak/`
**Stack:** Astro 7.4.1 + TypeScript (strictest), static output. Node 22.22 on the ICS host caps Astro at 7.4.1 (7.4.2+ needs Node ≥ 22.23.4).
**Design system:** Bento — UCI blue + gold, Inter, pill nav, card grid. Vanilla JS in the browser, no framework runtime, no jQuery.

---

## Workflow

**Publishing = pushing to GitHub `main`.** No server step is needed:

1. Push to `KKazuhaK/ics.uci.edu` `main` (from here, Claude Code on the web, or claude.ai).
2. GitHub Actions (`.github/workflows/site.yml`) runs `astro check`, the renderer parity test and the build on every push. A failing build stops here and the live site stays as it was (see the Actions tab for the error).
3. On `main`, the build is force-pushed to the `deploy` branch (one commit, the latest build only).
4. Cron on circinus-19 runs `scripts/pull-deploy.sh` every 5 minutes: if `deploy` moved, it syncs that build into `~/public_html` via `deploy.sh` (log: `~/.cache/site-pull-deploy.log`; it also fast-forwards `~/site`). `scripts/pull-deploy.sh --force` redeploys now.

Cron entry (per openlab node; re-add if the job lives on another node): `*/5 * * * * $HOME/site/scripts/pull-deploy.sh >> $HOME/.cache/site-pull-deploy.log 2>&1`

Local commands (still work; a local `npm run deploy` is replaced by the next CI build):

```bash
npm run dev           # local dev server
npm run check         # astro check (types + content schemas)
npm run deploy:next   # check → build with base /~kazuhak/next → rsync to ~/public_html/next/ (staging)
npm run deploy        # check → build with base /~kazuhak     → rsync to ~/public_html/ (live)
npx tsx scripts/migrate/parity.ts   # renderer vs legacy md-viewer on every note (kept as a regression test)
```

- `scripts/deploy.sh` refuses to sync a build made for the other base, and refuses `prod` while `~/public_html/.git` exists. rsync runs with `--delete --chmod=D755,F644` (so the old umask/403 problem is gone) and **excludes** what isn't built from this repo: `resources/`, `remote_profiles/`, `temp/`, `.venv/`, `.claude/`, `.codex`, `CLAUDE.md`, `next/`, `assets/config/*.local.json`. Anything else put straight into `~/public_html/` is deleted by the next deploy.
- Base path: `SITE_BASE` env (default `/~kazuhak`). In code always build links with `url()` / `courseUrl()` / `noteUrl()` from `src/lib/urls.ts`; never hard-code `/~kazuhak/`.
- `build.format: "preserve"`: `about.astro` → `about.html`, `x/index.astro` → `x/index.html`, so legacy URLs keep working.
- Before committing: Opus adversarial review of the diff (see the global CLAUDE.md).
- Commits and PRs are authored solely by Kazuha: no `Co-Authored-By`, no Claude author/committer, no "Generated with" lines, no AI credit in code or docs.
- GitHub `KKazuhaK/ics.uci.edu` `main` is the source of truth; pull before working locally. Don't commit to the `deploy` branch (CI overwrites it).

---

## Directory Structure

```
~/site/
├── astro.config.mjs              # base, preserve format, legacy-redirects integration
├── integrations/legacy-redirects.ts  # appends 301s for pre-Astro URLs to dist/.htaccess
├── .github/workflows/site.yml    # CI: check + build every push; main → deploy branch
├── scripts/deploy.sh             # staging / prod rsync with guards (SRC=<dir> for another build)
├── scripts/pull-deploy.sh        # cron: deploy branch → ~/public_html
├── scripts/migrate/              # one-off migration scripts (kept for reference) + parity.ts
├── .lastmod-ignore-revs          # commits that don't count as "last edited" (bulk moves)
├── public/                       # copied verbatim: .htaccess, assets/{css,js,viz,config}, images, favicon,
│                                 #   tools/ask-ai/worker.js (reference), tools/speedtest/ (3rd-party, DO NOT modify),
│                                 #   design scratchpads (md-viewer/paste-demo, md-editor/{export,outline}-demo)
└── src/
    ├── content.config.ts         # zod schemas for courses + notes
    ├── content/courses/<COURSE>.json
    ├── content/notes/<COURSE>/<slug>.<lang>.md
    ├── data/{site,about,tools,demos}.ts, legacy-notes.json
    ├── layouts/BaseLayout.astro  # <head>, pill nav, footer, bento.js, chat-widget.js
    ├── components/               # NoteReader, LegacyPage, LangBoot/LangSwitch, NoteLink, Icon
    ├── legacy/<page>/{head,main,after}.html   # inner markup of not-yet-rewritten pages (see below)
    ├── lib/                      # notes data, i18n, urls, git dates, note links, viz validation
    ├── lib/markdown/             # THE note renderer (build + browser)
    ├── pages/                    # routes (see below)
    ├── scripts/                  # browser modules (reader UI, md-viewer, language preference)
    └── styles/reader.css         # reading view styles (note pages + md-viewer)
```

### Routes

| URL | Source |
|---|---|
| `/` | `pages/index.astro` (course tiles, Recent notes, tools card all from data) |
| `/about.html` | `pages/about.astro` ← `data/about.ts` |
| `/notes/` | `pages/notes/index.astro` (stats, latest 3 per course) |
| `/notes/<course>/` | `pages/notes/[course]/index.astro` — course hub, `<course>` = lowercased code (`ics-46`) |
| `/notes/<course>/<slug>/<lang>/` | `pages/notes/[course]/[entry]/[lang]/index.astro` → `components/NoteReader.astro` |
| `/notes/<course>/<slug>/<lang>/source.md` | raw Markdown (Open in Editor uses it) |
| `/notes/demo_notes/`, `/notes/demo_notes/<COURSE>/` | from `data/demos.ts` |
| `/notes/demo_notes/ICS-31/week-N.html` | `pages/notes/demo_notes/ICS-31/week-N.astro` (LegacyPage) |
| `/tools/` | `pages/tools/index.astro` ← `data/tools.ts` |
| `/tools/md-viewer/` | `pages/tools/md-viewer/index.astro` + `scripts/md-viewer.ts` |
| `/tools/md-editor/`, `/tools/code-runner/`, `/tools/ask-ai/` | LegacyPage |
| `/sitemap.json` | `pages/sitemap.json.ts` (AI knowledge base, built from all data) |

### Legacy redirects (`dist/.htaccess`, generated)

`notes/course_notes/<COURSE>/` → `notes/<course>/`; `tools/md-viewer/?…note=<File>.md` (and `?file=`) → the note page; `notes/course_notes/<COURSE>/<File>.md` → its `source.md`. Mapping lives in `src/data/legacy-notes.json`. Targets are absolute `https://` (a relative target comes out as `http://` behind the proxy and gets blocked as mixed content).

---

## Notes System

### Adding a note

Create `src/content/notes/<COURSE>/<slug>.<lang>.md`:

```markdown
---
title: "Quick Sort"
summary: "Hoare partitioning, full traces, worst/best/average analysis, …"
---

# Information and Computer Science 46 — Lecture 9: Quick Sort
…
```

- `<slug>`: `lec-NN` (lecture courses) or `week-NN` (two digits), or a special like `final-review`. Lecture/week number, label ("Lecture 9" / "第 9 讲"), sort order, prev/next, hub card, Notes home strip, homepage tiles and Recent notes, and sitemap entry all derive from the slug. Specials sort last; optional frontmatter `label: { en-US, zh-CN }`, `order`, `draft: true`.
- `<lang>`: `en-US` / `zh-CN` (BCP 47). The other language is optional; hubs show "Other language only" when missing.
- Bad file names, missing title/summary, or notes for a course without `src/content/courses/<COURSE>.json` fail the build.
- **Links between notes** are relative links to the source file: `[Lecture 4](lec-04.en-US.md#2-the-stack-adt)`, other course `[Week 1](../CS-121/week-01.en-US.md)`. They render as note URLs. A link to a note that doesn't exist yet renders as plain text with a build warning and becomes a link once the note exists. Don't write `?kind=course_notes…` links (legacy).
- Images: only slide figures hosted in the `KKazuhaK/assets` repo via jsDelivr, `![alt](https://cdn.jsdelivr.net/gh/KKazuhaK/assets@main/ics.uci.edu/<course>/<slug>/<name>.png)`; the notes skills' `check_md.py` rejects any other image source. Otherwise draw it (viz, Mermaid, table).
- "Last edited" = last git commit touching the file (follows renames, skips `.lastmod-ignore-revs`), uncommitted files use mtime. Irvine time zone.
- Chinese note headings use Arabic numerals (`## 1.`), same numbering as the English version — language switching keeps the reader's position by heading index, and falls back to scroll fraction when counts differ.

### Adding a course

1. `src/content/courses/<COURSE>.json` (code, name, fullTitle, short, tagline, dept, tone `blue|navy|gold`, `current`, `order`, `copy.{en-US,zh-CN}.{heroPrimary,heroSecondary,readerHeading,readerDescription}`; `readerDescription` takes `{course}` / `{weekPhrase}`).
2. Add notes. Everything else (hub, Notes home card, homepage tile, sitemap) appears automatically.
3. Each term flip `current` (current courses sort first on Home / Notes).

### Renderer (`src/lib/markdown/`)

One renderer for note pages (build time), md-viewer and md-editor (browser). Ported from the legacy md-viewer marked setup; `scripts/migrate/parity.ts` proves identical output on all notes.

- Own `new Marked()` instance (marked 15.0.7 + marked-footnote 1.4.0, GFM). Never use the global `marked`: chat-widget.js loads another copy into the global and reconfigures it.
- `$…$` / `$$…$$` captured whole and typeset with KaTeX (0.16.11) at render time; `strongCjk` / `emCjk` let `**…**` close next to CJK punctuation; multi-line `>` callouts keep line breaks; `|` inside backticks on table rows auto-escaped; empty `[]()` stays literal; raw HTML renders (no sanitizer). Write a literal `+`/`1.` at line start as `\+` / `1\.`.
- Heading ids: `slugifyHeading()` in `slug.ts` (TOC anchors and shared links depend on it; md-editor's TOC button uses an identical copy).
- Code: Shiki (dark-plus) with on-demand languages; unknown language → plain block. Options: `highlight`, `math`, `codeUi` (copy button + collapse >30 lines, wired by `scripts/reader/code-ui.ts`), `resolveLink`, `baseUrl`.
- ` ```mermaid ` → placeholder, rendered in the browser by `scripts/reader/mermaid.ts` (bundled mermaid 11, pan/zoom viewer: drag, ⌘/Ctrl+wheel or pinch, +/−/⤢, resize handle, auto-fit height, 100% default or fit-to-width).
- ` ```viz <component> ` → placeholder mounted by `scripts/reader/viz.ts` from `public/assets/viz/`. **Validated at build time** (`lib/viz-validate.ts`: JSON, component exists, `validate()`, `steps()`); a broken demo fails the build.
- Published for the notes skills' `check_md.py` as a standalone module (see "Renderer module for skills").

### Renderer module for skills

`integrations/renderer-module.ts` bundles `src/lib/markdown/module.ts` into `dist/assets/js/kzh-markdown.mjs` after every build (Vite lib mode, no dependencies; Shiki/KaTeX left external). The notes skills' `check_md.py` downloads it and imports it under node to render drafts exactly like the site:

```js
import { renderMarkdown, slugifyHeading, API_VERSION } from "./kzh-markdown.mjs";
await renderMarkdown(body /* no frontmatter */, { lang: "en-US", highlight: false, math: false, codeUi: false });
// → { html, headings: [{depth,id,text}], viz: [{name,source}], hasMath, hasMermaid }
```

With those options the HTML is byte-identical to the legacy md-viewer's `markdownToHtml`. Bump `API_VERSION` when the exported API changes incompatibly, and update the skills.

### Reading UI (note pages)

Breadcrumb `Notes › <Course> › <Lecture N>` with language switch, Headings palette (⌘/Ctrl+Shift+O), Open in Editor; TOC sidebar (4+ headings; hidden ≤768px); prev/next cards; floating reading bar after the intro scrolls away (prev · course · lang · next, progress line, tucks while scrolling down); shortcuts `[` `]` `L`; Top + Ask AI button group. Language preference: `localStorage.kzh-lang`, written on every note view and by the hub toggle; hubs/Notes home/Home links follow it (`LangBoot` picks the language before first paint: `?lang=` → preference → en-US).

### viz components (`public/assets/viz/`)

Flat, one file per algorithm/structure, `_`-prefixed = infrastructure; `README.md` is the catalog + authoring contract (403 publicly). `_core.js` must stay DOM-free (build-time validation and the skills import it under node). When adding a component, also add it to the relevant skill's `references/viz-components.md`. Old `tools/md-viewer/viz/*` URLs 301 to `assets/viz/`.

---

## Tools

- **md-viewer** (`/tools/md-viewer/`): drag/drop or pick `.md/.markdown/.txt` (5 MB), Paste button, page-level ⌘V. Uses the shared renderer + reader modules. Handoffs: md-editor → viewer via `localStorage.mv-transfer`; viewer/note page → editor via `localStorage.me-transfer`.
- **md-editor** (`src/legacy/md-editor/`, EasyMDE + CodeMirror 5): live preview and HTML/PDF export call the shared renderer through `window.kzhMarkdownReady` (resolved by the page's module script). Preview: no Shiki, no code buttons; export: Shiki on. Mermaid/viz show as code in the editor. New toolbar items need a Lucide mapping in the `lucideIcons` table.
- **code-runner**, **ask-ai**: unchanged inner pages (LegacyPage). code-runner's Web mode uses `assets/viz/web-demo.js`.
- **speedtest**: third-party, DO NOT modify.

### LegacyPage

`src/legacy/<page>/{head,main,after}.html` are the original pages' inner markup/scripts, inserted verbatim into the shared shell (`components/LegacyPage.astro`). Edit them like before; they are not processed by Astro (relative URLs keep working because output paths are unchanged). Rewrite one into real components when it next needs substantial work.

---

## Design System: Bento

`public/assets/css/bento.css` + `public/assets/js/bento.js`. Shell comes from `BaseLayout.astro` (`.app` › `nav.nav` › `main.page` › `footer.foot`).

- Theme toggle `.theme-btn` → `[data-theme]` on `<html>`, persisted in `localStorage.kzh-theme` (set before paint in BaseLayout).
- Active nav link by `location.pathname`; override with BaseLayout's `navPath` prop (note pages / hubs pass `"notes/"`).
- Icons: inline Lucide SVG (`components/Icon.astro` or inline). No icon font.
- `@view-transition { navigation: auto; }` page transitions.
- Shared utilities: `.eyebrow` / `.eyebrow-pill`, `.crumbs` chips, `.weeks-list` / `.week-row-item`, `.week-grid` / `.week-card`, `.lang-switch`.
- Page-specific styles go in the page's `<style>` (scoped) — not into `bento.css`. Mobile breakpoint `@media (max-width: 736px)`.
- Deployment-local footer (ICP record for the domestic mirror): `assets/config/site.local.json`, read by bento.js; the 404 on ics.uci.edu is expected.

---

## AI Chat System

Cloudflare Workers AI (Gemma 4 text, Llama 4 Scout for images).

- **Widget** `public/assets/js/chat-widget.js` on every page (via BaseLayout); reads page text (16000 chars) as context; Markdown + KaTeX rendering; image/PDF/text upload (8 MB). Skipped on `/tools/ask-ai/`. Groups with `#back-to-top` into `#cw-btn-group`.
- **Standalone** `/tools/ask-ai/`: no system prompt; login via Kazuha Hub SSO (Entra ID → JWT, 7 days) or access code (`CHAT_PASSWORD`, comma-separated).
- **Worker** reference copy `public/tools/ask-ai/worker.js`, deployed at `https://ics-uci-edu-chat-ai.kazuhahub.workers.dev`. Env: binding `AI`; `CHAT_PASSWORD`, `AZURE_CLIENT_ID`, `AZURE_CLIENT_SECRET`, `AZURE_TENANT_ID`, `JWT_SECRET`. Free plan 10,000 neurons/day (error 4006 → "try again tomorrow"). Re-emits OpenAI-style SSE. Thinking on, reasoning dropped. Routes: `GET /auth/login`, `GET /auth/callback`, `POST /` (`mode: "page" | "chat"`). CORS: `https://ics.uci.edu`, `http://localhost`. Redeploy after changing prompt/model/auth.
- **Knowledge base**: worker fetches `/sitemap.json` hourly and pastes it into the widget's system prompt (`SCOPE_RULES`: site-only, never reveal model/provider). `sitemap.json` is generated from courses/notes/data at build — nothing to run by hand.

---

## Access Control

`public/.htaccess` (+ generated redirects appended at build):
- `README.*`, `SITE_DOCS.md`, `CLAUDE.md` → 403.
- `.md` served as `text/markdown; charset=utf-8`.
- `remote_profiles/` (Clash subscription, not in this repo): listing disabled, files work; `remote_profiles/Clash/` sets YAML headers. `resources/` (not in this repo): fancy listing, public.
