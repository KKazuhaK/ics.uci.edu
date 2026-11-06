# IN4MATX 133: User Interface Software — Lecture 4: Responsive Design & JavaScript 1

## Table of Contents

- [1. Screens in the ubiquitous computing era](#1-screens-in-the-ubiquitous-computing-era)
- [2. Adaptive vs. responsive design](#2-adaptive-vs-responsive-design)
- [3. Testing responsive designs](#3-testing-responsive-designs)
- [4. Breakpoints and media queries](#4-breakpoints-and-media-queries)
- [5. Fluid grids and flexible images](#5-fluid-grids-and-flexible-images)
- [6. Mobile-first design](#6-mobile-first-design)
- [7. Grid-based layouts](#7-grid-based-layouts)
- [8. Grid frameworks and their critics](#8-grid-frameworks-and-their-critics)
- [9. Setting up Bootstrap](#9-setting-up-bootstrap)
- [10. The Bootstrap grid system](#10-the-bootstrap-grid-system)
- [11. Bootstrap default styling and components](#11-bootstrap-default-styling-and-components)
- [12. The role of JavaScript](#12-the-role-of-javascript)
- [13. Other web languages and JavaScript's popularity](#13-other-web-languages-and-javascripts-popularity)
- [14. History and versions of JavaScript](#14-history-and-versions-of-javascript)
- [15. JavaScript vs. Java](#15-javascript-vs-java)
- [16. In-class Questions & Demos (with Solutions)](#16-in-class-questions--demos-with-solutions)
- [17. Quick Reference & Top 5 Things to Remember](#17-quick-reference--top-5-things-to-remember)

> UCI IN4MATX 133: User Interface Software — Prof. Travis Linden Reid, Fall 2026, Tuesday 10/6
> Built from the Lecture 4 slides (85 pages, including the "Extra slides" on adaptive design) and the demo repo folder `W2_L1_Oct6_Bootstrap`. Organized by concept, not by source.

> 📅 **Class logistics**: A1 (responsive portfolio) due at midnight — the slide says "Monday (10/6)"; check Canvas for the exact date.
> Friday's discussion is in person, and so are all the remaining discussions; check the "Discussion & Office Hours updates" page on Canvas for changes.
> Slack has an A1 channel for questions and help.
> A1 tips (slide 60): answer the README questions — use Question 2 to advocate for yourself, especially 3C (describe the advanced feature you used). Fix HTML/CSS validation and accessibility warnings, or justify any you ignore in the README; errors and "known issues" are not acceptable and lose points. Use your browser's Web Developer tools (read Console errors, check the box model, use the resolution simulator). If you already started, you can retrofit your existing code for Bootstrap.

---

## 1. Screens in the ubiquitous computing era

Recall Weiser's three waves of computing from [Lecture 1](lec-01.en-US.md#2-weiser-and-the-three-waves-of-computing): **mainframe** ("many to one": many people share one computer), **personal** ("one to one"), and **ubiquitous** ("one to many": one person, many devices). Each wave changed what a web page has to fit.

- **Personal computing era**: pages were usually **960 px wide**. Most screens were 1024 px wide (the slide writes "1024x978"; the usual size was 1024x768), so 960 left room for the vertical scrollbar, and 960 divides evenly into many column counts (the 960 Grid System is built on it).
- **Today**: the display-resolution chart on slide 7 spans Weiser's **tabs** (inch-scale), **pads** (yard-scale) and **boards** (foot-scale, as labelled on the slide) — dozens of resolutions. Even "just Apple devices" (slide 8, a table of iPhone/iPad models) covers many logical widths, heights and scale factors.

So how do we account for this? Two answers: **responsive design** or **adaptive design**.

> 🔗 **Go deeper**: [960 Grid System](https://960.gs/) · [Wikipedia: Display resolution](https://en.wikipedia.org/wiki/Display_resolution) · [iOS Resolution (Apple device sizes)](https://www.ios-resolution.com/)

## 2. Adaptive vs. responsive design

- **Adaptive design**: develop and maintain **multiple sets of code**, and change the layout depending on **device type** and screen size. The diagram shows one separate design per device (desktop, tablet, phone).
- **Responsive design**: develop **one set of HTML and CSS** that changes its layout depending on **screen size**. One design flows to every device.

| | Responsive design | Adaptive design |
|---|---|---|
| **+** | Easier to maintain one code base, future-proof | Can cater the experience to a device's capabilities and performance |
| **−** | Worse performance: requires downloading the entire stylesheet | Much more difficult to maintain separate codebases |
| **−** | Emphasis on making it "look right" rather than creating an experience | Limits development to a few key capabilities, because you have to implement for everything |

So, generally: **adaptive performs better** (lower loading time), **responsive is easier to develop**.

**Beyond the web (slide 19).** The terms come from web development, but the principle applies to other software. Many games ship on multiple platforms: the interface is usually **redesigned per platform (adaptive)**, while **responsive** design handles different resolutions on one platform — but not always: games exported for web and desktop are often responsive, not adaptive. The industry overall is **moving away from adaptive design toward responsive design** (slide 20), which is what the rest of this lecture teaches.

**Adaptive design in practice** (extra slides, not covered in class):
- *Why bother?* Video is a lot to load. Why send a higher resolution than the screen can render, use up your own bandwidth, and make laggy videos (unhappy users)? A company like Google (the slide shows mobile YouTube in Chrome's device mode) can afford the development burden.
- *Detecting the device*: the **user agent string** is accessible from JavaScript as `navigator.userAgent`. But there's usually a better way — do you really care about the browser or operating system, or is the resolution enough? And the string can be spoofed or incorrect.
- *Better*: use a **media query on the `<link>`** so the browser loads the right external stylesheet:

```html
<!--HTML-->
<head>
  <link rel="stylesheet" media="screen and (device-width: 375px)
    and (device-height: 667px) and (-webkit-device-pixel-ratio: 2)" href="iPhone8.css">
</head>
```

The demo prints this browser's user agent string (the same code in your own browser prints yours):

```viz web-demo
{"title": "Extra slide 84 · navigator.userAgent", "html": "<p>See the console.</p>", "js": "console.log(navigator.userAgent);\n", "height": 60}
```

> 📝 **Practice**: [Question 1](#161-question-1-responsive-vs-adaptive-performance-and-effort-slides-1216) · [Question 2](#162-question-2-hearthstone-responsive-or-adaptive-slide-18)
> 🔗 **Go deeper**: [Webflow: Adaptive vs. responsive design](https://webflow.com/blog/adaptive-vs-responsive-design) · [MDN: Browser detection using the user agent](https://developer.mozilla.org/en-US/docs/Web/HTTP/Browser_detection_using_the_user_agent)

## 3. Testing responsive designs

Chrome and Firefox both have tools for testing different resolutions without owning every device:

- **Firefox**: Responsive Design Mode, `ctrl + opt + M` (as on the slide; Mac shortcut).
- **Chrome**: open DevTools and use device mode (the slide shows Prof. Reid's portfolio page squeezed to a phone width).

> 🔗 **Go deeper**: [Chrome DevTools: Device mode](https://developer.chrome.com/docs/devtools/device-mode/) · [MDN: Browser detection using the user agent](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Browser_detection_using_the_user_agent)

## 4. Breakpoints and media queries

A **breakpoint** is the point at which your design "breaks" — it is no longer visually appealing or usable — so the layout must change there. Designs vary, but most have **3–5 breakpoints**: extra small (old mobile), small (mobile), medium (tablet), large (laptop or desktop), extra large (wide desktop or wall display). Again, this is somewhat similar to Weiser's three types of computers (tabs, pads, boards).

Breakpoints are written as **media queries** in CSS. A query can be extremely specific:

```css
/* CSS */
@media screen and (device-width: 375px) and (device-height: 667px)
  and (-webkit-device-pixel-ratio: 2) {
  /* iPhone 8-specific CSS */
}
```

The parts: `@media`; a media type — `screen`, `print`, `speech`, `all`; media features — `min-width`, `max-width`, `orientation`, `-webkit-min-device-pixel-ratio`, and many, many more. Usually you just split widths into ranges (slides 24 and 49):

```css
@media screen and (max-width: 640px) {
  /* small screens */
}
@media screen and (min-width: 640px and max-width: 1024px) {
  /* medium screens */
}
@media screen and (min-width: 1024px) {
  /* large screens */
}
```

> ⚠️ **Pitfall**: the slide's middle query is invalid — `(min-width: 640px and max-width: 1024px)` puts two features inside one pair of parentheses, so the browser treats it as never matching, and medium screens get no styles. Each feature needs its own parentheses: `@media screen and (min-width: 640px) and (max-width: 1024px)`.

The demo uses the slide's three ranges with the middle query fixed; step through the viewport widths:

```viz web-demo
{"title": "Slides 24/49 · three breakpoints (fixed middle query)", "html": "<div class=\"box\">Resize me</div>\n", "css": ".box { padding: 20px; color: white; background: gray; }\n\n@media screen and (max-width: 640px) {\n  /* small screens */\n  .box { background: seagreen; }\n  .box::after { content: \" (small)\"; }\n}\n@media screen and (min-width: 640px) and (max-width: 1024px) {\n  /* medium screens */\n  .box { background: royalblue; }\n  .box::after { content: \" (medium)\"; }\n}\n@media screen and (min-width: 1024px) {\n  /* large screens */\n  .box { background: saddlebrown; }\n  .box::after { content: \" (large)\"; }\n}\n", "width": 375, "height": 90, "interactive": true, "steps": [{"note": "800px wide: only the medium query matches.", "width": 800}, {"note": "1200px wide: only the large query matches.", "width": 1200}]}
```

| Viewport | Matching query | Box colour |
|---|---|---|
| 375px | `max-width: 640px` | green "(small)" |
| 800px | `min-width: 640px` and `max-width: 1024px` | blue "(medium)" |
| 1200px | `min-width: 1024px` | brown "(large)" |

## 5. Fluid grids and flexible images

Responsive design rests on two techniques:

- **Fluid grids**: lay out content in columns whose widths can vary. Bootstrap helps with this ([section 10](#10-the-bootstrap-grid-system)).
- **Flexible images**: let image size change based on the screen layout. Put images in containers that scale appropriately, and set `width: 100%`, `max-width: 100%`, `height: auto` so an image shrinks with its container while keeping its aspect ratio.

```css
img {
  max-width: 100%;  /* never wider than its container */
  height: auto;     /* keep the aspect ratio */
}
```

> 🔗 **Go deeper**: [W3Schools: Media query examples](https://www.w3schools.com/css/css3_mediaqueries_ex.asp)

## 6. Mobile-first design

Two directions for building across screen sizes:

- **"Graceful degradation"** (mobile *last*): design for desktop and shoe-horn it onto smaller screens — the slide's diagram labels this "degraded, shoe-horned, short-sighted, crappy".
- **"Progressive enhancement"** (mobile *first*): **plan your design for mobile, then make your app better with more real estate** — add more features, and make existing features easier to navigate ("progressively enhanced, future-friendly, awesome").

**Mobile-first, not mobile-only.** Copying the mobile UI straight to desktop creates inefficiencies: extra clicks to navigate and underutilized real estate (the slide's examples: Google Sheets' phone-style screen on a desktop monitor, the Windows 8 tile start screen). So plan for mobile, but consider how the experience should change on desktop and other devices; go beyond making everything bigger — *enhance* your design.

> 🔗 **Go deeper**: [Prototypr: Mobile first, desktop worst](https://blog.prototypr.io/mobile-first-desktop-worst-f900909ae9e2)

## 7. Grid-based layouts

Grids are an established tool for arranging content (the slide overlays grid lines on a medieval manuscript page). Gridded content is familiar and easy to follow; in general it's good to target **fewer lines** — but breaking that rule is important for creativity and grabbing attention.

The parts of a grid (slide 31 annotates a news site):

- **Rows** — horizontal bands of content.
- **Columns** — the vertical units the width is divided into (the example uses 12: a 2-column logo, an 8-column menu, 1-column margins, a 2 | 8 | 2 hero, a 1 | 10 | 1 article row).
- **Gutters** — the gaps between columns.
- **Padding/spacing** — defined by specific elements.

> 🔗 **Go deeper**: [Rune Madsen: Grid systems (Printing Code lecture)](http://printingcode.runemadsen.com/lecture-grid/)

## 8. Grid frameworks and their critics

Grid-based frameworks give you a ready-made fluid grid:

| Framework | Notes from the slide |
|---|---|
| **Bootstrap** | Most popular, most extensions (used in this course) |
| **Foundation** | Includes icons, drag & drop editor |
| **Pure.css** | Small file size, 3.5KB |

Grid frameworks make development easier. **What are the downsides?**

1. They **can lead to similar-looking webpages** (Bootstrap's own example templates — Album, Pricing, Checkout, Product, Cover, Carousel, Blog, Dashboard — all share one look).
2. They **can involve loading many files, hurting performance** (a network waterfall of dozens of jQuery/plugin scripts).
3. They **can stifle creativity** (paid themes built on the same components).

The 960 Grid System inventor's counter-argument to grid critics: "Michael Phelps following a painted line at the bottom of a pool doesn't make him a less talented swimmer" — a grid is a guide, not a limit on skill.

> 🔗 **Go deeper**: [Bootstrap](https://getbootstrap.com/) · [W3Schools: Bootstrap 5 get started](https://www.w3schools.com/bootstrap5/bootstrap_get_started.php) · [Foundation](https://get.foundation/) · [Pure.css](https://pure-css.github.io/)

## 9. Setting up Bootstrap

**Direct download** gives you CSS and JavaScript files. **Minified** files (`.min.css`, `.min.js`) are compressed and load faster; **`.map`** files support editing preprocessed files (not used in this class). We use `bootstrap.min.css` for now, loaded **before** your own stylesheet so your rules override Bootstrap's:

```html
<link rel="stylesheet" href="css/bootstrap.min.css">
<link rel="stylesheet" href=“css/override.css">
```

**From a Content Delivery Network (CDN)** instead: browser-side caching reduces the burden of loading files (a visitor may already have Bootstrap cached from another site). Two attributes come with it:
- `integrity`: a hash so the browser checks the downloaded file is exactly what's expected — protects you if the CDN server is compromised.
- `crossorigin`: some imports require credentials; `anonymous` requires none.

```html
<link rel="stylesheet" href=“https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css”integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH" crossorigin="anonymous">
```

> ⚠️ **Pitfall**: both slides contain curly quotes (`“…”`) from the slide software. With them, the `href` value becomes `“css/override.css` (with the quote character in it), so the file 404s; on the CDN line, the curly quotes swallow the `integrity` attribute into the URL, so Bootstrap never loads. Retype every quote as a straight `"` and put a space before `integrity`. Fixed:
> `<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH" crossorigin="anonymous">` — with this line the hash matches and Bootstrap's styles apply.

**Specify a viewport** in the page's `<head>`. It sets the device width and the scale level (for zooming):

```html
<head>
  <meta name="viewport" content="width=device-width,initial-scale=1">
</head>
```

**Designate a container.** All Bootstrap content lives in a container. It's just a class, so any element can be the container:

```html
<div class="container">
  <!--Bootstrap content-->
</div>

<main class="container">
  <!--Bootstrap content-->
</main>
```

> 🔗 **Go deeper**: [Bootstrap 5.3: Download](https://getbootstrap.com/docs/5.3/getting-started/download/)

## 10. The Bootstrap grid system

The grid has **12 columns** — 12 has a lot of factors (1, 2, 3, 4, 6). You write a `row` and give each child a `col-[size]-[number]` class: `number` = how many of the 12 columns it spans, `size` = from which breakpoint up.

| | Extra small | Small | Medium | Large | Extra large |
|---|---|---|---|---|---|
| Viewport | <576px | ≥576px | ≥768px | ≥992px | ≥1200px |
| Max container width | None (auto) | 540px | 720px | 960px | 1140px |
| Class prefix | `.col-` | `.col-sm-` | `.col-md-` | `.col-lg-` | `.col-xl-` |

Number of columns: 12. Gutter width: 30px (15px on each side of a column). Nestable: yes. Column ordering: yes. (That table and the "15px gutter" are from Bootstrap 4's docs; in the Bootstrap 5.3 loaded on the slides, the breakpoints and container widths above still hold, but each column side gets 12px of padding.)

**Rules from the slides:**
- **Rows are block elements, columns are inline** — columns line up side by side inside a row.
- **Content over 12 columns wraps** within the same row: `3 + 6 + 4 = 13`, so the 4 wraps to the next line.
- **The size number is optional**: plain `.col` divides the leftover space proportionally.
- **`.col` with no size defaults to the smallest (xs)**, i.e. applies at every width.
- **The largest size listed covers any larger sizes not listed**: `col-12 col-md-8` = 100% on small screens, 67% (8/12) on medium and up.

```html
<main class="container">
  <div class="row">
    <div class="col-3">A</div>
    <div class="col-6">B</div>
    <div class=“col-4">C</div>
    <div class=“col">D</div>
    <div class="col">E</div>
  </div>
</main>
```

Result (slide 40, after fixing the curly quotes): A (3) and B (6) on the first line; C (4) doesn't fit (3+6+4=13) and wraps; on the second line C takes 4 columns and D and E split the remaining 8 equally (4 each). With the slide's curly quotes left in, C and D get the class `“col-4"` / `“col"` (quote included), Bootstrap ignores them, and each takes a full-width line.

```viz web-demo
{"title": "Slides 40 & 42 · Bootstrap grid (curly quotes fixed)", "libs": ["bootstrap"], "html": "<main class=\"container\">\n  <div class=\"row\">\n    <div class=\"col-3\">A</div>\n    <div class=\"col-6\">B</div>\n    <div class=\"col-4\">C</div>\n    <div class=\"col\">D</div>\n    <div class=\"col\">E</div>\n  </div>\n  <hr>\n  <div class=\"row\">\n    <div class=\"col-12 col-md-8\">.col-12 .col-md-8</div>\n    <div class=\"col-6 col-md-4\">.col-6 .col-md-4</div>\n  </div>\n  <div class=\"row\">\n    <div class=\"col-6\">.col-6</div>\n    <div class=\"col-6\">.col-6</div>\n  </div>\n</main>\n", "css": ".row > div { background: #0099ff; color: white; border: 1px solid white; text-align: center; }\n", "width": 1000, "height": 200, "interactive": true, "steps": [{"note": "375px (xs): .col-12 takes the whole row and .col-6 drops below it at half width; .col-6 stays 50% everywhere.", "width": 375}]}
```

| Classes | xs (375px) | md and up (1000px) |
|---|---|---|
| `col-12 col-md-8` | 100% | 67% |
| `col-6 col-md-4` | 50% | 33% |
| `col-6` | 50% | 50% |

**Display classes** apply a display type (like `none` or `block`) and combine with sizes:
- `.d-none` hides the element on all sizes.
- `.d-md-none` hides it on md and larger.
- `.d-md-block.d-none` (both classes) hides it only on sm and xs — `d-none` hides everywhere, then `d-md-block` shows it again from md up.

**Bootstrap's media queries** are written as Sass mixins (Sass is covered later in the quarter):

```css
/* Extra small devices (old phones, less than 768px) */
@include media-breakpoint-up(xs) { ... }
/* Small devices (phones, 768px and up) */
@include media-breakpoint-up(sm) { ... }
/* Medium devices (tablets, 992px and up) */
@include media-breakpoint-up(md) { ... }
/* Large devices (desktops, 1200px and up) */
@include media-breakpoint-up(lg) { ... }

// Example usage:
@include media-breakpoint-up(sm) {
  .some-class {
    display: block;
  }
}
```

> ⚠️ **Pitfall**: the pixel values in these slide comments are shifted one size up from the grid table above (sm is ≥576px, md ≥768px, lg ≥992px, xl ≥1200px). For exam questions, go by the grid table.

> 📝 **Practice**: [Demo 1](#163-demo-1-responsive-class-schedule-slide-44--setup1--solution1) · [Question 3](#164-question-3-which-code-creates-this-layout-slides-4548)
> 🔗 **Go deeper**: [Bootstrap 5.3: Grid system](https://getbootstrap.com/docs/5.3/layout/grid/)

## 11. Bootstrap default styling and components

- **Default styling**: Bootstrap changes a lot of styles for you (headings, form fields, buttons), and adds custom styles through class suffixes (e.g. button variants like Primary, Success, Info, Warning, Danger on the slide).
- **Components**: elements pre-arranged into common patterns — navigation bars, dropdowns, alerts, etc. become much simpler. Some components require JavaScript (load Bootstrap's JS file too).

> 🔗 **Go deeper**: [Bootstrap CSS (default styling)](http://getbootstrap.com/css) · [Bootstrap 3.4: Components](https://getbootstrap.com/docs/3.4/components/)

## 12. The role of JavaScript

"Switching gears" to the third web language (introduced "if we have time"). Each language has one role:

| Language | Kind | Role |
|---|---|---|
| HTML | Markup language | Specify how content is rendered |
| CSS | Styling language | Visually style content |
| JavaScript | Programming language | Dynamically manipulate content |

**Why JavaScript?** It makes pages **dynamic**, makes pages **personalized**, and makes pages **interact with other sources**, like databases and APIs.

## 13. Other web languages and JavaScript's popularity

- These days you can create a dynamic website in almost any language: **Ruby** via Ruby on Rails, **Python** via Django or web2py.
- Some languages **transpile to JavaScript**: **TypeScript** (by Microsoft) introduces types — more on TypeScript later in the course; **Kotlin** (the slide says "by Google"; it was created by JetBrains and backed by Google) runs on the Java virtual machine *and* compiles to JavaScript, linking all of Google's platforms.
- **Popularity** (GitHub Octoverse, top 10 languages on GitHub 2023–2025): JavaScript was #1 until early 2024, then dropped behind Python and later TypeScript; by Aug 2025 the order is TypeScript, Python, JavaScript, Java, C#, PHP, Shell, C++, HCL, Go. JavaScript plus TypeScript still dominate.

> 🔗 **Go deeper**: [GitHub Octoverse](https://octoverse.github.com/)

## 14. History and versions of JavaScript

**How did JavaScript become the most popular language for web development?**

- **1995**: "Developed under the name Mocha, the language was officially called LiveScript when it first shipped in beta releases of Netscape Navigator 2.0 in September 1995, but it later was renamed JavaScript." Java's popularity was on the rise, so the name was a **marketing ploy**; it was intended to be the "web" language to Java's "desktop" one.
- **1997**: Netscape submitted JavaScript to **ECMA International** (European Computer Manufacturers Association) as an industry standard; versions are standardized as **"ECMAScript"**, first adopted in 1997.
- **Late 1990s–early 2000s**: alternatives sprang up — Microsoft's **JScript** engine, and **Macromedia Flash** for the dynamic web. Both were vaguely JavaScript-like, but the standards differed.
- **Convergence**: Firefox came out in 2005, Adobe bought Flash, and JScript followed the standards. But browsers' implementations of the language still vary.
- **JavaScript engines**: SpiderMonkey (Firefox), V8 (Chrome, Node.js), JavaScriptCore (Safari), Chakra (IE & Edge, no longer).

**Versions.** ECMAScript is just the standard for JavaScript. A new version is released yearly, but the standard has been pretty similar since 2015 (ES6). Engines and browsers continually play catch-up (the slide's ES6 compatibility table is mostly green, with a few red gaps), so many tools support slightly older versions of the standard.

**Polyfills** ensure a user's browser has the latest libraries: they download "fill" versions of added functions, re-written using existing functions. Also called a **"shim"** or a **"fallback"** (the slide shows Polyfill.io, which serves just the polyfills each browser needs from one `<script>` tag).

> 🔗 **Go deeper**: [The history of JavaScript (Medium, Ben Aston)](https://medium.com/@benastontweet/lesson-1a-the-history-of-javascript-8c1ce3bffb17) · [ES6 compatibility table](https://compat-table.github.io/compat-table/es6/)

## 15. JavaScript vs. Java

Despite the name, the two are unrelated languages:

| JavaScript | Java |
|---|---|
| Interpreted language | Compiled language (into bytecode) |
| Executed by a JavaScript engine | Run in a Java Virtual Machine (JVM) |
| Engine runs the same code that a programmer writes | Bytecode is unreadable by people |
| Standardized through ECMAScript, but discrepancies exist | "Write once, deploy anywhere" |
| Debugging dependent on execution environment | Bugs found at compile time |
| Prototype based | Class-based |
| Used in every browser without a plugin | Requires a plugin to be run in most browsers |

> 💡 **Key Insight**: in Python terms, JavaScript behaves like an interpreted script (errors show up when the line runs, in whatever browser runs it), while Java resembles C++'s compile-first model (many bugs caught before running).

---

## 16. In-class Questions & Demos (with Solutions)

### 16.1 Question 1: Responsive vs. adaptive performance and effort (slides 12–16)

Which of these statements is true? *(2 min think to yourself; 5 min to discuss with peers.)* Slide 16 rephrases it: generally, which **performs** better (lower loading time)? Generally, which is **easier to develop**?

- A. Responsive performs better and is easier to develop
- B. Responsive performs better, but adaptive is easier to develop
- C. Adaptive performs better, but responsive is easier to develop
- D. Adaptive performs better and is easier to develop
- E. There are no differences (this answer is incorrect)

> ✍️ **Try it first.**

**Answer: C** (marked on slide 16). Adaptive sends each device only the code made for it, so it loads less; responsive downloads the entire stylesheet everywhere. But responsive is one codebase, while adaptive means maintaining several. A and B get performance backwards; D ignores the cost of separate codebases. Back to [section 2](#2-adaptive-vs-responsive-design).

### 16.2 Question 2: Hearthstone, responsive or adaptive? (slide 18)

Imagine you are building Hearthstone, a video game, which can be played on mobile (left) or desktop (right). The tool you build this game in can easily export a single game project to executables that can run on mobile phones or PCs. Are you going to apply responsive or adaptive design? Why? *(2 min think to yourself; 5 min to discuss with peers.)*

> ✍️ **Try it first.**

**Answer** (discussion question; slide 19 gives the takeaway): for different **platforms** (phone vs. PC) games usually **redesign the interface — adaptive** — because touch on a small screen and mouse on a large one need different layouts (the two screenshots show different boards and controls). Within one platform, **responsive** design handles the many resolutions. But not always: games exported for web and desktop are often responsive only. Back to [section 2](#2-adaptive-vs-responsive-design).

### 16.3 Demo 1: Responsive class schedule (slide 44 · setup1 → solution1)

The slide shows "My 133 Schedule" as a table on desktop and as a stack of cells on a phone. The task (TODO comment in `setup1.html`):

- Make the table a Bootstrap container and each row a Bootstrap row
- Make each cell a column of width 2 on medium screens or larger
- Hide the header row on small and extra small screens

The starter is a plain `<table>` (Monday–Friday header row, then two rows of cells holding Discussion / Lecture / Assignment due `<div>`s) with Bootstrap 5.1.3 linked from a CDN before `setup1.css`.

> ✍️ **Try it first.**

**Answer** (`solution1.html`; the CSS is unchanged). Only classes are added:

```html
<table class="container">
	<tr class="row">
		<th class="d-none d-md-block col-md-2">Monday</th>
		<!-- … same for Tuesday–Friday -->
	</tr>
	<tr class="row">
		<td class="col-md-2">
			<div class="discussion">Discussion</div>
		</td>
		<td class="col-md-2">
			<div class="lecture">Lecture</div>
		</td>
		<!-- … every td gets col-md-2 -->
	</tr>
</table>
```

- `container` / `row` turn the table and its rows into Bootstrap's grid (it's just a class, so even a `<table>` works).
- `col-md-2` gives each cell 2 of 12 columns from md (≥768px) up; below md there is no size class, so each cell takes the full width and the cells stack.
- `d-none d-md-block` hides the day names below md and shows them from md up.

At 375px the cells stack one per line with no header; at 1000px the header row is back and the five days sit side by side, each 2/12 wide (the row is not full: 5 × 2 = 10 columns). Step through:

```viz web-demo
{"title": "Slide 44 · Demo 1 solution1.html (Bootstrap 5.3 here; the repo loads 5.1.3)", "libs": ["bootstrap"], "html": "<div>\n   <h1>My 133 Schedule</h1>\n   <table class=\"container\">\n      <tr class=\"row\">\n         <th class=\"d-none d-md-block col-md-2\">Monday</th>\n         <th class=\"d-none d-md-block col-md-2\">Tuesday</th>\n         <th class=\"d-none d-md-block col-md-2\">Wednesday</th>\n         <th class=\"d-none d-md-block col-md-2\">Thursday</th>\n         <th class=\"d-none d-md-block col-md-2\">Friday</th>\n      </tr>\n      <tr class=\"row\">\n         <td class=\"col-md-2\">\n            <div class=\"discussion\">Discussion</div>\n         </td>\n         <td class=\"col-md-2\">\n            <div class=\"lecture\">Lecture</div>\n         </td>\n         <td class=\"col-md-2\">\n\n         </td>\n         <td class=\"col-md-2\">\n            <div class=\"lecture\">Lecture</div>\n         </td>\n         <td class=\"col-md-2\">\n         </td>\n      </tr>\n      <tr class=\"row\">\n         <td class=\"col-md-2\">\n            <div class=\"discussion\">Discussion</div>\n            <div id=\"a1\">Assignment due</div>\n         </td>\n         <td class=\"col-md-2\">\n            <div class=\"lecture\">Lecture</div>\n         </td>\n         <td class=\"col-md-2\">\n\n         </td>\n         <td class=\"col-md-2\">\n            <div class=\"lecture\">Lecture</div>\n         </td>\n         <td class=\"col-md-2\">\n         </td>\n      </tr>\n   </table>\n</div>\n", "css": "td, th {\n\tborder-width: 1px;\n\tborder-style: solid;\n}\n\nth {\n\tfont-size: 150%;\n\tpadding: 5px;\n}\n\n.discussion {\n\tbackground-color: limegreen;\n\tmargin: 5px;\n}\n\n.lecture {\n\tbackground-color: royalblue;\n\tcolor: white;\n\tmargin: 5px;\n}\n\n#a1 {\n\tbackground-color: saddlebrown;\n\tcolor: white;\n\tmargin: 5px;\n}\n", "width": 375, "height": 330, "steps": [{"note": "md and up (1000px): header row visible, every cell is col-md-2.", "width": 1000}]}
```

> 🧪 **Demo files**: [setup1.html](https://github.com/travislindenreid/INF33-Demos/blob/main/W2_L1_Oct6_Bootstrap/setup1.html) · [setup1.css](https://github.com/travislindenreid/INF33-Demos/blob/main/W2_L1_Oct6_Bootstrap/setup1.css) · [solution1.html](https://github.com/travislindenreid/INF33-Demos/blob/main/W2_L1_Oct6_Bootstrap/solution1.html) · [solution1.css](https://github.com/travislindenreid/INF33-Demos/blob/main/W2_L1_Oct6_Bootstrap/solution1.css)

Back to [section 10](#10-the-bootstrap-grid-system).

### 16.4 Question 3: Which code creates this layout? (slides 45–48)

Target: on an **lg screen (laptop)**: A | B (A wider), C | D (equal), E full width. On an **sm screen (phone)**: A full, B full, C | D (equal), E full. *(2 min think individually; 5 min discuss & answer poll.)*

A.
```html
<div class="row">
  <div class="col-md-8 col-sm-12">A</div>
  <div class="col-md-4 col-sm-12”>B</div>
  <div class="col-md-6">C</div>
  <div class="col-md-6">D</div>
  <div class="col-12">E</div>
</div>
```

B.
```html
<div class="row">
  <div class="col-md-8 col-sm-12">A</div>
  <div class="col-md-4 col-sm-12”>B</div>
</div>
<div class="row">
  <div class="col-6">C</div>
  <div class="col-6">D</div>
  <div class="col-12">E</div>
</div>
```

C.
```html
<div class="row">
  <div class="col-8">A</div>
  <div class="col-4">B</div>
  <div class="col-sm-6">C</div>
  <div class=“col-sm-6">D</div>
</div>
<div class="row">
  <div class="col-md-6 col-xl-4">E</div>
</div>
```

- D. A and B
- E. B and C

> ✍️ **Try it first.**

**Answer: B** (marked on slide 48; confirmed by rendering the repo's `q2.html`, which has the three options with straight quotes).

| Option | sm (600px) | lg (1000px) |
|---|---|---|
| A | A, B, **C, D**, E all full width — wrong: C and D have only `col-md-6`, so below md they're full width | A\|B, C\|D, E ✓ |
| B | A, B full; C\|D; E full ✓ | A\|B, C\|D, E ✓ |
| C | **A\|B side by side** — wrong: `col-8`/`col-4` apply at every size | A\|B, C\|D, but **E only half width** (`col-md-6` covers lg; `col-xl-4` starts at 1200px) |

So D (A and B) and E (B and C) are wrong too. The key rule: a class with no size (`col-6`) applies everywhere; a sized class (`col-md-6`) applies from that size up, and below it the element is full width.

```viz web-demo
{"title": "Slides 45–48 · q2.html: options A, B, C", "libs": ["bootstrap"], "html": "<h1>A</h1>\n    <div class=\"container\">\n        <div class=\"row\">\n            <div class=\"col-md-8 col-sm-12 cell\">A</div>\n            <div class=\"col-md-4 col-sm-12 cell\">B</div>\n            <div class=\"col-md-6 cell\">C</div>\n            <div class=\"col-md-6 cell\">D</div>\n            <div class=\"col-12 cell\">E</div>\n        </div>\n    </div>\n\n\n    <h1>B</h1>\n    <div class=\"container\">\n        <div class=\"row\">\n            <div class=\"col-md-8 col-sm-12 cell\">A</div>\n            <div class=\"col-md-4 col-sm-12 cell\">B</div>\n        </div>\n        <div class=\"row\">\n            <div class=\"col-6 cell\">C</div>\n            <div class=\"col-6 cell\">D</div>\n            <div class=\"col-12 cell\">E</div>\n        </div>\n    </div>\n\n\n    <h1>C</h1>\n    <div class=\"container\">\n        <div class=\"row\">\n            <div class=\"col-8 cell\">A</div>\n            <div class=\"col-4 cell\">B</div>\n            <div class=\"col-sm-6 cell\">C</div>\n            <div class=\"col-sm-6 cell\">D</div>\n        </div>\n        <div class=\"row\">\n            <div class=\"col-md-6 col-xl-4 cell\">E</div>\n        </div>\n    </div>\n", "css": ".cell {\n    background-color: #0099ff;\n    color: white;\n    text-align: center;\n    border-style: solid;\n    border-color: white;\n    border-width: 1px;\n    padding: 5px;\n}\n", "width": 600, "height": 560, "steps": [{"note": "lg (1000px): A, B and C all show A|B, C|D, but C's E is only half width; at sm (600px) only B matched the phone picture.", "width": 1000}]}
```

> ⚠️ **Pitfall**: the slide versions contain curly quotes (`col-sm-12”`, `“col-sm-6`) — copied literally, they break the markup (an element loses its class, or its class value runs on into the next tag). The repo's `q2.html` fixes them.

> 🧪 **Demo files**: [q2.html](https://github.com/travislindenreid/INF33-Demos/blob/main/W2_L1_Oct6_Bootstrap/q2.html) · [q2.css](https://github.com/travislindenreid/INF33-Demos/blob/main/W2_L1_Oct6_Bootstrap/q2.css)

Back to [section 10](#10-the-bootstrap-grid-system).

---

## 17. Quick Reference & Top 5 Things to Remember

**Responsive vs. adaptive**

| | Responsive | Adaptive |
|---|---|---|
| Code | One set of HTML/CSS | Multiple sets, per device type |
| Changes layout by | Screen size | Device type and screen size |
| Performance | Worse (whole stylesheet) | Better (tailored) |
| Development | Easier, future-proof | Harder (separate codebases) |

**Media queries**

| Piece | Examples |
|---|---|
| Media types | `screen`, `print`, `speech`, `all` |
| Features | `min-width`, `max-width`, `orientation`, `-webkit-min-device-pixel-ratio` |
| Range | `@media screen and (min-width: 640px) and (max-width: 1024px) { … }` |
| On a link | `<link rel="stylesheet" media="…" href="iPhone8.css">` |

**Bootstrap**

| Need | Code |
|---|---|
| Viewport | `<meta name="viewport" content="width=device-width,initial-scale=1">` |
| Container / row | `class="container"`, `class="row"` |
| Column, all sizes | `col-6`, or `col` for an equal share |
| Column from a size up | `col-sm-*` ≥576, `col-md-*` ≥768, `col-lg-*` ≥992, `col-xl-*` ≥1200 |
| Hide everywhere / from md up / below md | `d-none` / `d-md-none` / `d-none d-md-block` |

**JavaScript facts**: Mocha → LiveScript → JavaScript (Netscape, 1995); standard = ECMAScript (ECMA, 1997; similar since 2015); engines: SpiderMonkey, V8, JavaScriptCore, Chakra; polyfill = shim = fallback.

**Top 5 things to remember**

1. Adaptive performs better; responsive is easier to develop and maintain.
2. Every media feature needs its own parentheses: `(min-width: 640px) and (max-width: 1024px)`.
3. Bootstrap's grid is 12 columns; over 12 in a row wraps, and plain `col` splits what's left.
4. A sized class applies from that breakpoint **up**; below it the column is full width, and an unsized `col-*` applies at every size.
5. JavaScript is interpreted, prototype-based and runs in every browser; it's unrelated to compiled, class-based Java.