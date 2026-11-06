# IN4MATX 133: User Interface Software — Lecture 3: CSS

## Table of Contents

- [1. What CSS is and why it is separate from HTML](#1-what-css-is-and-why-it-is-separate-from-html)
- [2. CSS syntax, linking a stylesheet, and default styles](#2-css-syntax-linking-a-stylesheet-and-default-styles)
- [3. Element, class, and ID selectors](#3-element-class-and-id-selectors)
- [4. Common properties: styling a class schedule](#4-common-properties-styling-a-class-schedule)
- [5. The cascade: multiple rules, inheritance, order, specificity](#5-the-cascade-multiple-rules-inheritance-order-specificity)
- [6. Block vs inline and the box model](#6-block-vs-inline-and-the-box-model)
- [7. Position types](#7-position-types)
- [8. Units](#8-units)
- [9. Advanced selectors and pseudo-classes](#9-advanced-selectors-and-pseudo-classes)
- [10. Fonts and fallbacks](#10-fonts-and-fallbacks)
- [11. Tools: references, debugging, compatibility, validation](#11-tools-references-debugging-compatibility-validation)
- [12. In-class Questions & Demos (with Solutions)](#12-in-class-questions--demos-with-solutions)
- [13. Quick Reference & Top 5 Things to Remember](#13-quick-reference--top-5-things-to-remember)

> UCI IN4MATX 133: User Interface Software — Prof. Travis Linden Reid, Fall 2026, Thursday Oct 1
> Built from the Lecture 3 slides (65 pages, including the "Additional slides" p57–65) and the demo repo folder `W1_L2_Oct1_CSS`. Organized by concept, not by source.

> 📅 **Class logistics**: Office hours started this week. Discussion section on Friday is **virtual** (Zoom link on Canvas).
> **A1** is moved to **Monday, Oct 12 at midnight** — after this lecture you have enough to build it.
> All assignments are now due every other Monday at midnight: A1 – Week 3, A2 – Week 5, A3 – Week 7, A4 – Week 9, A5 – Finals.

---

## 1. What CSS is and why it is separate from HTML

**CSS (Cascading Style Sheets)** defines the rules for *styling* a page. That's different from HTML, which provides the *structure* of the document. The opening example (slide 4) is one HTML page shown with three different stylesheets: a plain white page, a black "terminal" look, and a red page with a sidebar of buttons — same content, completely different appearance. Slides 7–8 show the same page in the browser's DevTools: the element tree on the left (`div.container`, `#sidebar`, …) is identical in both, only the CSS rules on `#sidebar` (colour, position, padding) differ.

Why keep style in its own files (slide 9):

| Benefit | What it means |
|---|---|
| Reusability | Apply the same style to multiple web pages |
| Modularity | Include multiple stylesheets that apply to a single page |
| Sane management | Stylesheets can be version-controlled separately from the HTML's structural content |
| Maintainability | Easier to find where a page's style lives |

**HTML specifies semantics; CSS specifies appearance** (slides 20–21). Compare two ways of writing "emphasized":

```html
<!--HTML-->
<p> This text is
<i>emphasized!</i></p>

<!--HTML-->
<p> This text is
<em>emphasized!</em></p>
```

`<i>` conflates appearance and semantics (it means "italic"). `<em>` says nothing about appearance — it means "this is emphasized", and the browser's default style happens to draw it in italics. If you want emphasis to look different, change the CSS, not the tag.

> 🔗 **Go deeper**: [W3Schools: same page, different stylesheets (demo)](https://www.w3schools.com/css/demo_default.htm)

## 2. CSS syntax, linking a stylesheet, and default styles

### 2.1 Rules: selector + properties

A CSS **rule** is a **selector** (which elements the rule applies to) plus a block of **property: value** declarations (what formatting to assign). One rule, many properties:

```css
/* CSS Pseudocode */
selector {
    property: value;
    property: value;
    ...
}
```

The lecture's first example (from `cssBasics.css`) styles every `h1`:

```css
h1 {
	font-family: 'Arial';
	color: blue;
	background-color: #ff0000; /*red*/
}
```

`h1` is the selector ("apply to all h1 tags"); `font-family` is what most people call "the font"; `/* … */` is the only comment syntax in CSS.

### 2.2 Linking the stylesheet from HTML

Link to stylesheets from the HTML's `<head>`:

```html
<head>
    <link rel="stylesheet" href="my-style.css">
</head>
```

`rel` names the **rel**ation between this page and the referenced file. `<link>` has no content, so it has no closing tag. `cssBasics.html` links `cssBasics.css` this way; only the heading picks up the styles — the paragraph is untouched because the rule's selector is `h1`.

Try it below — edit the CSS and press Run:

```viz web-demo
{"title": "Slide 12 · cssBasics.html + cssBasics.css", "html": "    <h1>This is a header!</h1>\n    <p>This is a paragraph. Notice how it doesn't have the header styles applied.</p>", "css": "h1 {\n\tfont-family: 'Arial';\n\tcolor: blue;\n\tbackground-color: #ff0000; /*red*/\n}", "height": 150, "tab": "css", "interactive": true}
```

> 🧪 **Demo files**: [cssBasics.html](https://github.com/travislindenreid/INF33-Demos/blob/main/W1_L2_Oct1_CSS/cssBasics.html) · [cssBasics.css](https://github.com/travislindenreid/INF33-Demos/blob/main/W1_L2_Oct1_CSS/cssBasics.css)

### 2.3 Why was the h1 large? Default values

We never set a size, yet the heading is big: **CSS has default values**. The browser's default style gives `h1` `font-size: 2em` — twice the default 16px, so the heading renders at 32px.

### 2.4 Three places to put CSS (additional slides, not covered in class)

| Where | Example | Verdict |
|---|---|---|
| Inline (`style` attribute) | `<p style="...">Red text</p>` | Supported, but usually bad practice: repeating the same style on every element goes against DRY (Don't Repeat Yourself) |
| Internal (`<style>` in `<head>`) | `<style type="text/css"> p {font-family:'Arial'; color:red;} </style>` | Just putting CSS into the `<head>` of your HTML |
| External (`<link>` to a `.css` file) | `<link rel="stylesheet" href="./css/style.css">` | Generally the best practice — separates structure from style |

The inline example on slide 58 is written `style="font-family='Arial'; color=red;"`. That is a slide bug: inside `style` you still write CSS, with a colon, so it must be `style="font-family:'Arial'; color:red;"`. The `=` version is ignored and the text stays black in Times.

> 🔗 **Go deeper**: [W3Schools: CSS default values](https://www.w3schools.com/cssref/css_default_values.php)

## 3. Element, class, and ID selectors

Three basic kinds of selector (slide 14), all with the same declarations here:

```css
p {                 /* element: what tag is being styled */
    font-family: 'Arial';
    color: red;
}
.emphasize {        /* class: a type of element */
    font-family: 'Arial';
    color: red;
}
#redtext {          /* id: one specific element */
    font-family: 'Arial';
    color: red;
}
```

A **`.`** means class, a **`#`** means id, no prefix means tag name. Classes and IDs are ordinary HTML attributes with values, just like `href` or `src` (slide 15):

```html
<div class="widget foo" id="baz"></div>
```

- An element can have **many classes** (space-separated) but **only one ID**.
- Each page can have **only one element with a given ID** — required to pass validation.
- The same class can (and should) be used on many elements; that's how you style many things at once.

Selectors can be **chained** with no spaces to require everything at once (slide 16):

```css
div.widget.foo#baz {
    /*can chain selectors together!*/
}
```

This matches a `div` that has class `widget` **and** class `foo` **and** id `baz`. (A space would mean something else — see [descendant selectors](#9-advanced-selectors-and-pseudo-classes).)

Fun trick (slide 17): IDs can be used for navigation. `http://example.com/#id` scrolls the page straight to the element with that id — the slide shows a course syllabus jumping to its "Electronics" section.

Step through the selectors (the colours are mine so each rule is visible):

```viz web-demo
{"title": "Slides 14–16 · element, class, ID and chained selectors (colours are mine, to tell the rules apart)", "html": "<p>A plain paragraph</p>\n<p class=\"emphasize\">A paragraph with class=\"emphasize\"</p>\n<p id=\"redtext\">A paragraph with id=\"redtext\"</p>\n<div class=\"widget foo\" id=\"baz\">div class=\"widget foo\" id=\"baz\"</div>\n<div class=\"widget\">div class=\"widget\" only</div>", "css": "body { font-family: 'Arial'; }", "steps": [{"note": "Element selector p: every <p> on the page.", "css": "p {\n  color: red;\n}"}, {"note": "Class selector .emphasize: only elements with that class.", "css": ".emphasize {\n  background-color: #fde68a;\n}"}, {"note": "ID selector #redtext: the one element with that id.", "css": "#redtext {\n  border: 2px solid red;\n}"}, {"note": "Chained div.widget.foo#baz: a div with BOTH classes AND that id, so the plain .widget div is not matched.", "css": "div.widget.foo#baz {\n  background-color: #bfdbfe;\n}"}], "height": 200, "interactive": true}
```

> ⚠️ **Pitfall**: `#name` matches an `id`, `.name` matches a `class`, and a bare `name` matches a *tag*. Writing `#em` or `.em` when you meant the `<em>` tag, or `zot` when you meant `id="zot"`, matches nothing — exactly the trap in Question 1.

> 📝 **Practice**: [Question 1: Which CSS renders the ZOT! paragraph?](#121-question-1-which-css-renders-zot-zot-zot-as-shown-slides-2227)

> 🔗 **Go deeper**: [CSS-Tricks: the difference between ID and class](https://css-tricks.com/the-difference-between-id-and-class/)

## 4. Common properties: styling a class schedule

The properties you'll use constantly (slide 18):

| Property | Controls |
|---|---|
| `font-family` | The "font" (fallback alternatives separated by commas — see [§10](#10-fonts-and-fallbacks)) |
| `font-size` | Size of the text |
| `font-weight` | Boldness (`bold`, or a number like `700`) |
| `color` | Text colour |
| `background-color` | The element's background |
| `opacity` | Transparency |

…and much, much more (see the reference links).

**Demo 1** (slide 19, "Let's style a class schedule") applies exactly these properties to a table. `setup1.html` is a 5-day table whose cells hold `<div class="discussion">`, `<div class="lecture">`, and one `<div id="a1">Assignment due</div>`; `setup1.css` contains only the TODO list. The solution uses one tag selector, two class selectors, and one ID selector:

```css
th {
	font-size: 150%;
}

.discussion {
	background-color: limegreen;
}

.lecture {
	background-color: royalblue;
	color: white;
}

#a1 {
	background-color: saddlebrown;
	color: white;
}
```

Step through the solution one rule at a time:

```viz web-demo
{"title": "Slide 19 · Demo 1: setup1.html → solution1.css, one rule per step", "html": "   <h1>My 133 Schedule</h1>\n   <table>\n   \t<tr>\n   \t\t<th>Monday</th>\n   \t\t<th>Tuesday</th>\n   \t\t<th>Wednesday</th>\n   \t\t<th>Thursday</th>\n   \t\t<th>Friday</th>\n   \t</tr>\n   \t<tr>\n   \t\t<td>\n   \t\t\t<div class=\"discussion\">Discussion</div>\n   \t\t</td>\n   \t\t<td>\n   \t\t\t<div class=\"lecture\">Lecture</div>\n   \t\t</td>\n   \t\t<td>\n   \t\t</td>\n   \t\t<td>\n   \t\t\t<div class=\"lecture\">Lecture</div>\n   \t\t</td>\n   \t\t<td>\n   \t\t</td>\n   \t</tr>\n   \t<tr>\n   \t\t<td>\n   \t\t\t<div class=\"discussion\">Discussion</div>\n   \t\t\t<div id=\"a1\">Assignment due</div>\n   \t\t</td>\n   \t\t<td>\n   \t\t\t<div class=\"lecture\">Lecture</div>\n   \t\t</td>\n   \t\t<td>\n   \t\t</td>\n   \t\t<td>\n   \t\t\t<div class=\"lecture\">Lecture</div>\n   \t\t</td>\n   \t\t<td>\n   \t\t</td>\n   \t</tr>\n   </table>", "css": "", "steps": [{"note": "th { font-size: 150%; } — header row bigger.", "css": "th {\n\tfont-size: 150%;\n}"}, {"note": ".discussion — limegreen background.", "css": ".discussion {\n\tbackground-color: limegreen;\n}"}, {"note": ".lecture — royalblue background, white text.", "css": ".lecture {\n\tbackground-color: royalblue;\n\tcolor: white;\n}"}, {"note": "#a1 — saddlebrown background, white text.", "css": "#a1 {\n\tbackground-color: saddlebrown;\n\tcolor: white;\n}"}], "height": 230}
```

> 🧪 **Demo files**: [setup1.html](https://github.com/travislindenreid/INF33-Demos/blob/main/W1_L2_Oct1_CSS/setup1.html) · [setup1.css](https://github.com/travislindenreid/INF33-Demos/blob/main/W1_L2_Oct1_CSS/setup1.css) · [solution1.css](https://github.com/travislindenreid/INF33-Demos/blob/main/W1_L2_Oct1_CSS/solution1.css)

> 📝 **Practice**: [Demo 1: style the class schedule](#122-demo-1-colour-the-class-schedule-slide-19--setup1--solution1)

> 🔗 **Go deeper**: [W3Schools: CSS reference](http://www.w3schools.com/cssref/default.asp)

## 5. The cascade: multiple rules, inheritance, order, specificity

"Cascading" is the C in CSS: **several rules can apply to the same element**, and the browser combines them.

**Multiple rules** (slide 28). An element with two classes gets the tag rule and both class rules:

```html
<!--HTML-->
<p class="big blue">
This tag has two classes: "big" and "blue"
(classes are separated by spaces)
</p>
```

```css
/* CSS */
p { font-family: 'Verdana'; }   /* apply to all <p> tags */
.big { font-size: larger; }     /* apply to all with class="big" */
.blue { color: blue; }          /* apply to all with class="blue" */
```

Result: Verdana, larger (19.2px instead of 16px), blue.

**Inheritance** (slide 29). Many CSS rules (fonts, colour) are also inherited from parent tags, so a deeply nested element collects styles from all its ancestors:

```html
<div class="content"> <!-- has own styling -->
  <div class="sub-div"> <!-- has own styling + .content styling -->
    <ol class="my-list"> <!-- own styling + .sub-div + .content -->
                         <!-- own style is ol AND .my-list rules-->
      <!-- li styling + .my-list + .sub-div + .content -->
      <li>Item 1</li>
      <li>Item 2</li>
      <li>Item 3</li>
    </ol>
  </div>
</div>
```

**Order** (slide 30). Rules are applied in order: **among peer selectors, the last rule wins**.

```html
<!--HTML-->
<p class="red green">
<em class="blue">Text is blue!</em>
</p>
```

```css
/* CSS */
p { font-family: 'Verdana'; }
.red { color: red; }
.green { color: green; }
.blue { color: blue; }
```

`.red` and `.green` are both class selectors matching the `<p>`, so the one written later in the CSS (`.green`) wins — the `<p>` is green. Order in the *class attribute* doesn't matter: `class="green red"` is still green. The `<em>` is blue because a rule that targets the element itself (`.blue`) beats a colour it would only inherit from its parent.

**External stylesheets apply in order, too** (additional slide 61). With

```html
<head>
  <link rel="stylesheet" href="./css/bootstrap.css">
  <link rel="stylesheet" href="./css/style.css">
</head>
```

`style.css` is loaded after `bootstrap.css`, so your rules override Bootstrap's where they conflict. Link your own sheet last.

**Specificity** (slide 31). When selectors are *not* peers, CSS calculates **specificity** from the kind of selector. General rule: the rule "closer to the HTML element" applies. From most to least specific:

| More specific → less specific | | | |
|---|---|---|---|
| Inline `style` attributes | ID selectors (`#banner`) | Classes, pseudo-classes, other attributes (`.sidebar1`) | Elements, pseudo-elements (`ul`, `h1`) |

The slide admits this is difficult stuff — usually trial-and-error (and DevTools, [§11](#11-tools-references-debugging-compatibility-validation)) resolves most things.

```viz web-demo
{"title": "Slides 28 & 30 · several rules on one element, last peer rule wins", "html": "<p class=\"big blue\">\nThis tag has two classes: \"big\" and \"blue\"\n(classes are separated by spaces)\n</p>\n<p class=\"red green\">\n<em class=\"blue\">Text is blue!</em> (and this part of the p?)\n</p>", "css": "p { font-family: 'Verdana'; }\n.big { font-size: larger; }\n.blue { color: blue; }", "js": "for (const el of document.querySelectorAll('p, em')) {\n  const c = getComputedStyle(el);\n  console.log(el.tagName, '\"' + el.className + '\"', c.color, c.fontSize);\n}", "steps": [{"note": "Add .red then .green (slide 30): both match the second <p>; .green comes later, so green wins. The <em> has its own .blue rule, which beats the colour it would inherit.", "css": ".red { color: red; }\n.green { color: green; }"}], "height": 150, "interactive": true}
```

> ⚠️ **Pitfall**: "last rule wins" only breaks ties between selectors of the **same** specificity. A `#id` rule written first still beats a `.class` rule written later.

## 6. Block vs inline and the box model

So far a page is "one long list" (slide 32): text line after line, like a typewriter with different fonts. To indent, make columns, overlap sections, or add borders, we need to position elements.

### 6.1 Block and inline elements

HTML tags are (almost all) either:

- **Block** elements — start on a new line, with a line break after them (`<p>`, `<div>`, `<h1>`–`<h6>`, `<ul>`, `<ol>`, `<li>`, `<table>`, `<form>`, `<header>`, `<footer>`, `<nav>`, `<section>`, `<article>`, …)
- **Inline** elements — no line break, they flow inside text (`<a>`, `<em>`, `<strong>`, `<span>`, `<img>`, `<b>`, `<i>`, `<code>`, `<input>`, `<button>`, `<label>`, …)

```html
<p>
This is on a line.
<em>This is on the same line.</em>
</p>
<p>This will be on a new line.</p>
```

The `<p>` is block, the `<em>` inline. **Don't put block elements inside inline elements!** (Slide 34 lists all of them from W3Schools.)

### 6.2 The box model

Every element is a box of four layers, inside to outside:

| Layer | Purpose |
|---|---|
| **Content** | The "real" content; its size is `width` and `height` |
| **Padding** | Extends the content area; the background colour extends into it |
| **Border** | Similar, drawn around the padding; has `border-color`, `border-width`, `border-style` |
| **Margin** | Transparent space that separates the element from its neighbours |

`padding`, `border`, and `margin` all have per-direction properties: `padding-top`, `margin-right`, `border-left`, …

All positioning is **relative to the parent**: if you nest tags, the child's margins etc. are measured inside the parent's box.

**Demo 2** (slide 38) continues the schedule. The TODOs in `setup2.css`: a 1-pixel solid border on all cells, 5px padding on the header cells, 5px margin on every discussion, lecture, and assignment. The solution:

```css
td, th {
	border-width: 1px;
	border-style: solid;
}

th {
	font-size: 150%;
	padding: 5px;
}

.discussion {
	background-color: limegreen;
	margin: 5px;
}

.lecture {
	background-color: royalblue;
	color: white;
	margin: 5px;
}

#a1 {
	background-color: saddlebrown;
	color: white;
	margin: 5px;
}
```

`td, th` with a comma is a **selector list**: the rule applies to both. Each cell now has its own box; the coloured blocks sit 5px in from the cell edges, and the header text has 5px of padding inside its border.

```viz web-demo
{"title": "Slide 38 · Demo 2: setup2.css → solution2.css (border, padding, margin)", "html": "   <h1>My 133 Schedule</h1>\n   <table>\n   \t<tr>\n   \t\t<th>Monday</th>\n   \t\t<th>Tuesday</th>\n   \t\t<th>Wednesday</th>\n   \t\t<th>Thursday</th>\n   \t\t<th>Friday</th>\n   \t</tr>\n   \t<tr>\n   \t\t<td>\n   \t\t\t<div class=\"discussion\">Discussion</div>\n   \t\t</td>\n   \t\t<td>\n   \t\t\t<div class=\"lecture\">Lecture</div>\n   \t\t</td>\n   \t\t<td>\n   \t\t</td>\n   \t\t<td>\n   \t\t\t<div class=\"lecture\">Lecture</div>\n   \t\t</td>\n   \t\t<td>\n   \t\t</td>\n   \t</tr>\n   \t<tr>\n   \t\t<td>\n   \t\t\t<div class=\"discussion\">Discussion</div>\n   \t\t\t<div id=\"a1\">Assignment due</div>\n   \t\t</td>\n   \t\t<td>\n   \t\t\t<div class=\"lecture\">Lecture</div>\n   \t\t</td>\n   \t\t<td>\n   \t\t</td>\n   \t\t<td>\n   \t\t\t<div class=\"lecture\">Lecture</div>\n   \t\t</td>\n   \t\t<td>\n   \t\t</td>\n   \t</tr>\n   </table>", "css": "th {\n\tfont-size: 150%;\n}\n\n.discussion {\n\tbackground-color: limegreen;\n}\n\n.lecture {\n\tbackground-color: royalblue;\n\tcolor: white;\n}\n\n#a1 {\n\tbackground-color: saddlebrown;\n\tcolor: white;\n}", "steps": [{"note": "1-pixel solid border on all cells.", "css": "td, th {\n\tborder-width: 1px;\n\tborder-style: solid;\n}"}, {"note": "5px padding inside the header cells.", "css": "th {\n\tpadding: 5px;\n}"}, {"note": "5px margin around every discussion, lecture and assignment box.", "css": ".discussion, .lecture, #a1 {\n\tmargin: 5px;\n}"}], "height": 240, "interactive": true}
```

> 🧪 **Demo files**: [setup2.html](https://github.com/travislindenreid/INF33-Demos/blob/main/W1_L2_Oct1_CSS/setup2.html) · [setup2.css](https://github.com/travislindenreid/INF33-Demos/blob/main/W1_L2_Oct1_CSS/setup2.css) · [solution2.css](https://github.com/travislindenreid/INF33-Demos/blob/main/W1_L2_Oct1_CSS/solution2.css)

> 📝 **Practice**: [Demo 2: borders, padding, margins](#123-demo-2-borders-padding-and-margins-slide-38--setup2--solution2)

### 6.3 Shorthand (additional slides, not covered in class)

`padding`/`margin` take 1–4 values in one line, going clockwise from the top ("TRouBLe": Top, Right, Bottom, Left):

| Written | Means |
|---|---|
| `padding: 10px 5px 5px 10px;` | top 10, right 5, bottom 5, left 10 |
| `padding: 10px 5px 10px;` | top 10, right **and** left 5, bottom 10 |
| `padding: 8px 12px;` | top **and** bottom 8, right **and** left 12 |

Hard to remember; being explicit improves readability at the expense of brevity. Border shorthand is easier — these two are equivalent:

```css
div {
    border-bottom-width: 3px;
    border-bottom-style: solid;
    border-bottom-color: red;
}

div.equivalent {
    border-bottom: 3px solid red;
}
```

> ⚠️ **Pitfall**: a border needs a `border-style`. `border-width: 1px` alone draws nothing — that's why `solution2.css` sets both.

> 🔗 **Go deeper**: [W3Schools: HTML block and inline elements](https://www.w3schools.com/html/html_blocks.asp) · [MDN: Introduction to the CSS box model](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Box_Model/Introduction_to_the_CSS_box_model) · [W3Schools: CSS box model](https://www.w3schools.com/css/css_boxmodel.asp) · [CSS-Tricks: remember the margin/padding shorthand order with "TRouBLe"](https://css-tricks.com/remember-the-order-of-marginpadding-shorthand-with-trouble/) · [W3Schools: CSS borders](https://www.w3schools.com/css/css_border.asp)

## 7. Position types

The `position` property has four values (slide 39):

| Value | Behaviour | Follows page flow? |
|---|---|---|
| `static` | The default | Yes |
| `relative` | Offset from where it would normally be | Yes — helps make adjustments to the flow |
| `absolute` | Placed from the top-left (of the nearest positioned ancestor) | No — ignores the flow entirely |
| `fixed` | Like absolute, but floating: stays put when the page scrolls | No |

`absolute` and `fixed` ignore the flow, but they're helpful in some cases (slide 40): a "member? SIGN IN ABOVE" badge nudged into a form's corner with **relative** positioning, and a **floating action button (FAB)** — the round "+" in a mail app's corner — placed with **absolute** positioning.

The example below is mine (the repo has no file for these slides): one box nudged with `relative`, then a "+" button placed with `absolute` inside a `relative` card, the pattern from the slide's CSS-Tricks link.

```viz web-demo
{"title": "Slides 39–40 · static, relative, and absolute inside relative (my example)", "html": "<div class=\"card\">\n  <div class=\"box\">static</div>\n  <div class=\"box rel\">relative</div>\n  <div class=\"box\">static</div>\n  <button class=\"fab\">+</button>\n</div>", "css": ".card { border: 2px solid #444; padding: 10px; height: 150px; }\n.box { display: inline-block; width: 80px; padding: 8px; background: #bfdbfe; }\n.fab { width: 40px; height: 40px; border-radius: 50%; }", "steps": [{"note": "position: relative with top/left nudges the box from where it would be; its old spot stays reserved.", "css": ".rel { position: relative; top: 20px; left: 10px; background: #fca5a5; }"}, {"note": "position: absolute on the button takes it out of the flow; with a relative parent, bottom/right are measured from the card's corner (a floating action button).", "css": ".card { position: relative; }\n.fab { position: absolute; bottom: 10px; right: 10px; }"}], "height": 200, "interactive": true}
```

> 🔗 **Go deeper**: [Interneting Is Hard: advanced positioning](https://internetingishard.com/html-and-css/advanced-positioning/) · [CSS-Tricks: absolute inside relative (example)](https://css-tricks.com/examples/AbsoluteInsideRelative/)

## 8. Units

CSS lengths come in pixels (`px`), element units (`em`), percentages (`%`), and real-world units (`in`, `cm`).

- **Use relative units (`em`, `%`) whenever possible.** It helps accessibility: people with low vision change the browser's default text size (usually 16px). `em` sizes scale from that default; a heading fixed at 30px stays 30px no matter what the user asks for.
- Relative units are also useful to vary layout based on screen size — more on that next lecture ([Lecture 4](lec-04.en-US.md)).

The slide's table of which units to use where:

| | Recommended | Occasional use | Not recommended |
|---|---|---|---|
| Screen | `em`, `px`, `%` | `ex` | `pt`, `cm`, `mm`, `in`, `pc` |
| Print | `em`, `cm`, `mm`, `in`, `pt`, `pc`, `%` | `px`, `ex` | |

Example from this lecture: `th { font-size: 150%; }` in Demo 1 is relative — 1.5× the inherited size — and the default `h1` is `2em`.

> 🔗 **Go deeper**: [Engage Interactive: em vs rem vs px](https://engageinteractive.co.uk/blog/em-vs-rem-vs-px)

## 9. Advanced selectors and pseudo-classes

Combinators select elements by their place in the tree. They're "extremely useful for making clean stylesheets" — you style by structure instead of adding a class to everything.

| Selector | Name | Selects |
|---|---|---|
| `ul li` (space) | Descendant | **All** `li` inside a `ul` — children and grandchildren |
| `ul > li` | Child | Only **direct** children `li` of a `ul` (not grandchildren) |
| `p + h2` | Adjacent sibling | An `h2` **immediately** after a `p` sibling |
| `p ~ h2` | General sibling | Any `h2` **anywhere after** a `p` sibling (same parent) |

Slide 42's examples: add a top margin for all `h2`s that follow a paragraph, or only inside a particular `div`:

```css
p + h2 {
    margin-top: 10px;
}

div.post p + h2 {
    margin-top: 10px;
}
```

The second one combines everything: a `p + h2` pair that is a descendant of a `div` with class `post`.

Slides 43–45 illustrate with small trees. In `<ul><li>one</li><li>two<ol><li>nested one</li><li>nested two</li></ol></li><li>three</li></ul>`, `ul li` hits all five `li`s, `ul > li` only one, two, three. In `<div><p>Line One</p><p>Line Two</p><div>Box</div><p>Line Three</p></div>`: `p + p` hits Line Two only; `div + p` hits Line Three; `p ~ p` hits Line Two and Line Three; `div ~ p` hits Line Three.

`advancedSelectors.css` (from the repo) applied to a page of headings, paragraphs, and Prof. Reid's cats' medications list:

```css
h1 {
    margin-top: 0px;
}

h2 {
    margin-top: 0px;
}

p ~ h2 {
    color: blue;
}

p + h1 {
	margin-top: 10px;
}

p + h2 {
	margin-top: 10px;
}

ul > li {
    font-weight: bold;
}
```

What you see: the two `h1`s right after a paragraph get the 10px top margin back; the `h1` directly after another `h1` and the first `h1` keep 0. The only `h2` comes after a `p` sibling (earlier in the same `<body>`), so `p ~ h2` turns it blue — even though it directly follows an `h1`, not a `p`. Momo, Nemo, Willow, Leo are bold (`ul > li`); Prozac, Antibiotic, Churu, which sit in the nested `<ol>`, are not. The HTML asks: *What happens if I change the nested list to `ul`? Why?* — they turn bold, because now they are direct children of a `ul` too (last step of the demo).

```viz web-demo
{"title": "Slides 42–45 · advancedSelectors.html + advancedSelectors.css (lorem ipsum shortened)", "html": "    <h1>This is a header!</h1>\n    <p>This is a paragraph. Lorem ipsum dolor sit amet…</p>\n    <h1>This is a header following a paragraph!</h1>\n    <p>Yet another paragraph. Lorem ipsum dolor sit amet…</p>\n    <h1>This is a header following a paragraph!</h1>\n    <h2>This is a header following a header</h2>\n    <p>Yet another paragraph. Lorem ipsum dolor sit amet…</p>\n    <p>Prof Reid's cat's medications</p>\n    <ul>\n        <li>Momo</li>\n        <li>Nemo</li>\n        <li>Willow</li>\n        <li>Leo</li>\n            <!-- What happens if I change the nested list to ul...? why? -->\n            <ol>\n                <li>Prozac</li>\n                <li>Antibiotic</li>\n                <li>Churu (very important)</li>\n            </ol>\n    </ul>", "css": "", "steps": [{"note": "Remove the default top margin on h1 and h2.", "css": "h1 {\n    margin-top: 0px;\n}\n\nh2 {\n    margin-top: 0px;\n}"}, {"note": "p + h1 / p + h2: a heading IMMEDIATELY after a paragraph gets 10px back; the h1 right after another h1 doesn't.", "css": "p + h1 {\n\tmargin-top: 10px;\n}\n\np + h2 {\n\tmargin-top: 10px;\n}"}, {"note": "p ~ h2: any h2 that comes after a p sibling (not necessarily right after) turns blue.", "css": "p ~ h2 {\n    color: blue;\n}"}, {"note": "ul > li: only the direct <li> children of the <ul> are bold; the <li>s inside the nested <ol> are not.", "css": "ul > li {\n    font-weight: bold;\n}"}, {"note": "The comment's question: change the nested <ol> to <ul> — now those <li>s are direct children of a ul too, so they turn bold.", "html": "    <h1>This is a header!</h1>\n    <p>This is a paragraph. Lorem ipsum dolor sit amet…</p>\n    <h1>This is a header following a paragraph!</h1>\n    <p>Yet another paragraph. Lorem ipsum dolor sit amet…</p>\n    <h1>This is a header following a paragraph!</h1>\n    <h2>This is a header following a header</h2>\n    <p>Yet another paragraph. Lorem ipsum dolor sit amet…</p>\n    <p>Prof Reid's cat's medications</p>\n    <ul>\n        <li>Momo</li>\n        <li>Nemo</li>\n        <li>Willow</li>\n        <li>Leo</li>\n            <!-- What happens if I change the nested list to ul...? why? -->\n            <ul>\n                <li>Prozac</li>\n                <li>Antibiotic</li>\n                <li>Churu (very important)</li>\n            </ul>\n    </ul>"}], "height": 420, "interactive": true}
```

> 🧪 **Demo files**: [advancedSelectors.html](https://github.com/travislindenreid/INF33-Demos/blob/main/W1_L2_Oct1_CSS/advancedSelectors.html) · [advancedSelectors.css](https://github.com/travislindenreid/INF33-Demos/blob/main/W1_L2_Oct1_CSS/advancedSelectors.css)

> ⚠️ **Pitfall**: the nested `<ol>` in `advancedSelectors.html` sits directly inside the `<ul>`, not inside Leo's `<li>`. Browsers render it, but valid HTML puts a nested list inside an `<li>` (slide 43's tree does it right).

### 9.1 Pseudo-classes (additional slides, not covered in class)

A pseudo-class selects an element in a special **state**: `selector:pseudo-class { … }`. The classic example is links:

```css
a:link { /* unvisited link */
    color: #FF0000;
}
a:visited { /* visited link */
    color: #00FF00;
}
a:hover { /* mouse over link */
    color: #FF00FF;
}
a:active { /* selected link */
    color: #0000FF;
}
```

Order matters here because of "last rule wins": `:hover` must come after `:link` and `:visited`, and `:active` after `:hover`.

> 🔗 **Go deeper**: [Smashing Magazine: taming advanced CSS selectors](https://www.smashingmagazine.com/2009/08/taming-advanced-css-selectors/) · [CSS-Tricks: child and sibling selectors](https://css-tricks.com/child-and-sibling-selectors/) · [W3Schools: CSS pseudo-classes](https://www.w3schools.com/Css/css_pseudo_classes.asp)

## 10. Fonts and fallbacks

**Font stacks.** `font-family` takes a list; the browser tries the fonts in order and uses the first one available. End with a generic family (`serif`, `sans-serif`) so something sensible always works:

```css
p {
    font-family: "Times New Roman", Times, serif;
}
```

**Web fonts.** Google Fonts is a great resource: link its stylesheet in the HTML, then use the font name in CSS with a fallback:

```html
<!--HTML-->
<link href="https://fonts.googleapis.com/css?family=Roboto" rel="stylesheet">
```

```css
/* CSS */
font-family: 'Roboto', sans-serif;
```

The slide writes `rel=“stylesheet">` with a curly opening quote; pasted as is, the attribute value becomes `“stylesheet` and the font stylesheet never loads. Use straight quotes.

dafont.com ("coolest website on the internet, objectively…?") has zillions of open-source fonts — some fancier than you'd ever want for accessible, readable web design.

**Fallbacks in HTML** work the same way: the browser picks the first source it can use.

```html
<video autoplay>
    <!--webm not supported in IE or Safari-->
    <source src="lecture3.webm" type="video/webm" />
    <!--mp4 supported in modern browsers, but lower quality-->
    <source src="lecture3.mp4" type="video/mp4" />
    <!--backup important for some old browsers-->
    <img src="lecture3.jpg" title="Your browser does not support the <video> tag">
</video>
```

**Why fallbacks** (slide 49): a format isn't supported (webm, ogg, flac); a font might not support certain characters; a font might take time to load ("flash of unstyled text") — so pick a similar default font, so the page doesn't jump when the web font arrives.

> 🔗 **Go deeper**: [Google Fonts](https://fonts.google.com/) · [dafont.com](http://dafont.com) · [CSS-Tricks: fallback font stacks for robust web typography](https://css-tricks.com/css-basics-fallback-font-stacks-robust-web-typography/)

## 11. Tools: references, debugging, compatibility, validation

"There's a lot to CSS. I can't create much from memory alone." — Prof. Reid. Nobody memorizes every property; look things up:

- **References**: W3Schools CSS reference, cssreference.io, the MDN CSS reference, Codecademy's Learn CSS course.
- **Debugging in the browser**: DevTools (Inspect element) shows the element tree, every rule that applies to the selected element (crossed out where overridden — the cascade made visible), and the box-model diagram; you can edit values live (slides 7–8 and 52).
- **Browser compatibility**: standards have solidified, but it's still worth checking a feature on caniuse.com.
- **Validation**: the W3C Markup Validation Service checks your HTML (e.g. duplicate IDs).

> 🔗 **Go deeper**: [W3Schools CSS reference](https://www.w3schools.com/cssref/) · [cssreference.io](https://cssreference.io/) · [MDN CSS reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference) · [Codecademy: Learn CSS](https://www.codecademy.com/learn/learn-css) · [YouTube: debugging CSS in the browser](https://www.youtube.com/watch?v=Z3HGJsNLQ1E) · [Can I use](https://caniuse.com/)
> 🔗 **Go deeper**: [W3C Markup Validation Service](https://validator.w3.org)

## 12. In-class Questions & Demos (with Solutions)

### 12.1 Question 1: Which CSS renders ZOT! ZOT! ZOT! as shown? (slides 22–27)

The poll follows the usual routine (slide 22): answer individually → reveal responses → class-wide discussion → reveal correct answer.

Which CSS renders

```html
<p class="para">
ZOT!
ZOT!
<em id="zot">ZOT!</em>
</p>
```

as the screenshot: one line, **white "ZOT! ZOT!" on a UCI-blue bar**, and the last **ZOT! in bold yellow italics**?

- **A**
  ```css
  p {
      font-family: 'Verdana';
      color: #0064a4; /*Blue*/
      background-color: white;
  }
  #em {
      color: #ffd200; /*Yellow*/
      font-weight: 700; /*Bold*/
  }
  ```
- **B**
  ```css
  .para {
      font-family: 'Verdana';
      background-color: #0064a4; /*Blue*/
      color: white;
  }
  zot {
      color: #ffd200; /*Yellow*/
      font-style: italic;
      font-weight: 700; /*Bold*/
  }
  ```
- **C**
  ```css
  .para {
      font-family: 'Verdana';
      background-color: #0064a4; /*Blue*/
      color: white;
  }
  em {
      color: #ffd200; /*Yellow*/
      font-weight: 700; /*Bold*/
  }
  ```
- **D**
  ```css
  #para {
      font-family: 'Verdana';
      background-color: #0064a4; /*Blue*/
      color: white;
  }
  .em {
      color: #ffd200; /*Yellow*/
      font-style: italic;
      font-weight: 700; /*Bold*/
  }
  ```
- **E**
  ```css
  .para {
      font-family: 'Verdana';
      background-color: #0064a4; /*Blue*/
      color: #ffd200; /*Yellow*/
  }
  #zot {
      color: white;
      font-style: italic;
      font-weight: 700; /*Bold*/
  }
  ```

> ✍️ **Try it first.**

**Answer: C** (revealed on slide 27; the repo's `q1answer.css` is option C).

`.para` matches the `<p>` by its class → blue background, white Verdana text. `em` matches the `<em>` by tag → yellow and bold. The italics need no rule: `<em>` is italic by browser default ([§2.3](#23-why-was-the-h1-large-default-values)).

| Option | What actually happens | Why it's wrong |
|---|---|---|
| A | Blue text on white; the last ZOT! is blue, not yellow or bold | Colours swapped, and `#em` looks for `id="em"`, which doesn't exist |
| B | Bar is right, but the last ZOT! is white and not bold | `zot` is a *tag* selector (no `<zot>` element); the id needs `#zot` |
| C | White on blue, last ZOT! yellow, bold, italic | ✓ |
| D | Nothing is styled — black on white | `#para` needs `id="para"` (it's a class), `.em` needs `class="em"` |
| E | Yellow "ZOT! ZOT!" and a white bold-italic last ZOT! | Selectors are right, colours are swapped |

Each option's computed styles (text colour on background, italic, weight):

| Option | `<p>` | `<em>` |
|---|---|---|
| A | rgb(0, 100, 164) on white | rgb(0, 100, 164), italic, 400 |
| B | white on rgb(0, 100, 164) | white, italic, 400 |
| C | white on rgb(0, 100, 164) | rgb(255, 210, 0), italic, 700 |
| D | black, no background | black, italic, 400 |
| E | rgb(255, 210, 0) on rgb(0, 100, 164) | white, italic, 700 |

```viz web-demo
{"title": "Question 1 check · q1answer.html + q1answer.css (option C)", "html": "    <p class=\"para\">ZOT! ZOT! <em id=\"zot\">ZOT!</em></p>", "css": ".para {\n    font-family: Verdana;\n    background-color: #0064a4;\n    color: white;\n}\n\nem {\n    color: #ffd200;\n    font-weight: 700;\n}", "js": "const s = el => { const c = getComputedStyle(el); return c.color + ' on ' + c.backgroundColor + ', ' + c.fontStyle + ', weight ' + c.fontWeight; };\nconsole.log('p:  ' + s(document.querySelector('p')));\nconsole.log('em: ' + s(document.querySelector('em')));", "height": 80}
```

> 🧪 **Demo files**: [q1answer.html](https://github.com/travislindenreid/INF33-Demos/blob/main/W1_L2_Oct1_CSS/q1answer.html) · [q1answer.css](https://github.com/travislindenreid/INF33-Demos/blob/main/W1_L2_Oct1_CSS/q1answer.css)

Back to [§3 Element, class, and ID selectors](#3-element-class-and-id-selectors).

### 12.2 Demo 1: Colour the class schedule (slide 19 · setup1 → solution1)

Task (the TODO list in `setup1.css`), for the table in `setup1.html`:

- Increase the font size of the header row to 150%
- Change the background for the discussion sections to limegreen
- Change the background for the lectures to royalblue
- Change the background for a1 to saddlebrown
- Change the text color for the lectures and a1 to white

The markup that matters: header cells are `<th>`, the boxes are `<div class="discussion">`, `<div class="lecture">`, and `<div id="a1">`.

> ✍️ **Try it first.**

**Answer** (`solution1.css`):

```css
th {
	font-size: 150%;
}

.discussion {
	background-color: limegreen;
}

.lecture {
	background-color: royalblue;
	color: white;
}

#a1 {
	background-color: saddlebrown;
	color: white;
}
```

Pick the selector by what the HTML gives you: a tag (`th`) for every header cell, a class (`.lecture`) for the repeated boxes, an id (`#a1`) for the one assignment. Result: bigger day names, green Discussion boxes, blue Lecture boxes with white text, a brown "Assignment due" box with white text. Step-by-step demo in [§4](#4-common-properties-styling-a-class-schedule).

### 12.3 Demo 2: Borders, padding, and margins (slide 38 · setup2 → solution2)

`setup2.css` starts with the Demo 1 solution. Task:

- Add a 1-pixel solid border to all cells
- Add 5 pixels of padding to the header cells
- Add 5 pixels of margin to all of the discussions, lectures, and assignments

> ✍️ **Try it first.**

**Answer** — the lines `solution2.css` adds:

```css
td, th {
	border-width: 1px;
	border-style: solid;
}

th {
	/* ...font-size: 150%; from Demo 1... */
	padding: 5px;
}

/* inside .discussion, .lecture and #a1 */
	margin: 5px;
```

"All cells" means both `td` and `th`, so one rule with a selector list. Padding goes inside the header's border; margin goes outside each coloured box, which pushes it 5px away from the cell edges — the boxes no longer touch the borders. Step-by-step demo in [§6.2](#62-the-box-model).

## 13. Quick Reference & Top 5 Things to Remember

**Selectors**

| Selector | Matches |
|---|---|
| `p` | Every `<p>` (element / tag) |
| `.big` | Every element with `big` among its classes |
| `#a1` | The one element with `id="a1"` |
| `div.widget.foo#baz` | Chained: one element meeting all conditions |
| `td, th` | Selector list: either |
| `ul li` | Descendant: any depth |
| `ul > li` | Direct child only |
| `p + h2` | `h2` immediately after a sibling `p` |
| `p ~ h2` | `h2` anywhere after a sibling `p` |
| `a:hover` | Pseudo-class: element in a state |

**Properties from this lecture**

| Group | Properties |
|---|---|
| Text | `font-family`, `font-size`, `font-weight`, `font-style`, `color` |
| Box | `background-color`, `opacity`, `width`, `height`, `padding(-top…)`, `margin(-right…)`, `border(-left…)`, `border-width`, `border-style`, `border-color` |
| Layout | `position: static \| relative \| absolute \| fixed` |

**Units**: `px` absolute · `em` relative to font size · `%` relative to parent · `in`/`cm` for print. Prefer `em`/`%` on screen.

**Specificity, high → low**: inline `style` > `#id` > `.class` / `:pseudo-class` / attributes > element. Ties: last rule wins.

**Top 5 things to remember**

1. `.` is class, `#` is id, no prefix is a tag — the wrong prefix silently matches nothing (Question 1).
2. Among equally specific rules, the **last one in the CSS** wins; the order of classes in the `class` attribute doesn't matter.
3. An id is unique per page and an element has at most one; classes are reusable and an element can have many.
4. Box model inside-out: content → padding (gets the background) → border (needs a style) → margin (transparent, separates neighbours).
5. `ul li` reaches grandchildren, `ul > li` doesn't; `p + h2` means *immediately* after, `p ~ h2` means *anywhere* after.