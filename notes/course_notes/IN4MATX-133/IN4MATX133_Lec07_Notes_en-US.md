# IN4MATX 133: User Interface Software — Lecture 7: TypeScript & Data Visualization Tools

## Table of Contents

- [1. What TypeScript is](#1-what-typescript-is)
- [2. Types](#2-types)
- [3. Classes, interfaces and inheritance](#3-classes-interfaces-and-inheritance)
- [4. tsconfig.json and declaration files](#4-tsconfigjson-and-declaration-files)
- [5. Benefits, drawbacks and other transpilers](#5-benefits-drawbacks-and-other-transpilers)
- [6. Interactive software and UI tools](#6-interactive-software-and-ui-tools)
- [7. Evaluating tools: threshold and ceiling](#7-evaluating-tools-threshold-and-ceiling)
- [8. Visualization tools and declarative languages](#8-visualization-tools-and-declarative-languages)
- [9. Vega-Lite: a grammar of graphics](#9-vega-lite-a-grammar-of-graphics)
- [10. Building a histogram in Vega-Lite](#10-building-a-histogram-in-vega-lite)
- [11. Sensible defaults and overriding them](#11-sensible-defaults-and-overriding-them)
- [12. In-class Questions & Demos (with Solutions)](#12-in-class-questions--demos-with-solutions)
- [13. Quick Reference & Top 5 Things to Remember](#13-quick-reference--top-5-things-to-remember)

> UCI IN4MATX 133: User Interface Software — Prof. Travis Linden Reid, Fall 2026, Thursday 10/15
> Built from the Lecture 7 slides (78 pages) and the demo repo folder `W3_L2_Oct15_TypeScript_VegaLite`. Organized by concept, not by source.

> 📅 **Class logistics**: Last material needed for A2; Friday's discussion has a deeper Vega-Lite demo.
> Bonus slides p70–78 (more TypeScript) are folded into sections 2–4, marked "(bonus slides)".

---

## 1. What TypeScript is

**Installing** (a global npm package, see [Lecture 6](?kind=course_notes&course=IN4MATX-133&lang=en-US&note=IN4MATX133_Lec06_Notes_en-US.md#11-npm)):

```bash
npm install -g typescript   # installs tsc, the TypeScript transpiler
```

Also via Homebrew (Mac) or Chocolatey (PC).

**About TypeScript** (slides 6–7):

- **Microsoft, 2012**; first Visual Studio only, now Eclipse, Sublime, WebStorm, Atom, etc. Latest: TypeScript 7.0 (July 2026).
- Adds **static types, type checking and objects** to JavaScript, all **optional**.
- **Transpiles** ("transcompiles") to JavaScript: `tsc` converts TS to equivalent JS; browsers only run the JS.
- A **strict superset of JavaScript**: valid JS is valid TS, so TS can use popular JS libraries.

Types are checked at compile time (like C++), then **erased**: none are left in the `.js`.

> 🔗 **Go deeper**: [TypeScript: Download](https://www.typescriptlang.org/download)

---

## 2. Types

### 2.1 Annotating a variable and transpiling

`hello.ts` puts a type after a colon:

```ts
var courseNumber:number = 133;
console.log('Hello, IN4MATX ' + courseNumber + '!');
```

`tsc hello.ts` generates `hello.js`, annotation gone:

```js
var courseNumber = 133;
console.log('Hello, IN4MATX ' + courseNumber + '!');
```

Prints `Hello, IN4MATX 133!` (current tsc also adds `"use strict";`). (Slide bug: `hello.js` ends with `‘!');`, a curly quote and syntax error → `'!'`.)

**Predefined types** (slide 9): `number`, `boolean`, `string`, `void` (generally a function return type), `null`, `undefined`, `any`.

**Typing is optional.** Both of these initialize `courseNum`:

```ts
var courseNum:any = 133;
var courseNum = 133;
console.log('Hello, IN4MATX ' + courseNum + '!');
```

Alternatives (`lecture.ts` comments one out); together they conflict, since the second **infers** `number`. (Slide bug: same curly quote, `‘!'`.)

### 2.2 Typed functions and error checking

Functions can specify **argument types and return types**:

```ts
function area(shape: string, width: number, height: number) 
{
    var area = width * height;
    return "I'm a " + shape + " of area " + area + " cm^2.";
}
// "better" function
function area2(shape: string, width: number, height: number):string {
    var area:number = width * height;
    return "I'm a " + shape + " of area " + area + " cm^2.";
}
```

Both return `I'm a square of area 225 cm^2.`; `area2` is "better" because its return and local types are stated too.

**Types enable error checking** (slide 12): arguments in the wrong order:

```ts
document.body.innerHTML = area2(15, 15, 'square');
```

tsc: `error TS2345: Argument of type 'number' is not assignable to parameter of type 'string'.` (slide: `type '15'`; commented out in `lecture.ts`).

Demo (tsc's JS output): step 1's bad call runs silently as `I'm a 15 of area NaN cm^2.`

```viz web-demo
{"title": "Slides 11–12 · the JavaScript tsc emits for area2 (the browser runs JS, not TS)", "interactive": true, "html": "<p>See the console.</p>", "js": "// compiled from area2 in lecture.ts (types stripped by tsc)\nfunction area2(shape, width, height) {\n    var area = width * height;\n    return \"I'm a \" + shape + \" of area \" + area + \" cm^2.\";\n}\nconsole.log(area2('square', 15, 15));", "height": 60, "steps": [{"note": "The slide's bad call: tsc rejects it, but if you skip the type check the JS runs and silently prints NaN.", "js": "console.log(area2(15, 15, 'square'));"}]}
```

> 🧪 **Demo files**: [lecture.ts](https://github.com/travislindenreid/INF33-Demos/blob/main/W3_L2_Oct15_TypeScript_VegaLite/lecture/lecture.ts) · [lecture.js](https://github.com/travislindenreid/INF33-Demos/blob/main/W3_L2_Oct15_TypeScript_VegaLite/lecture/lecture.js)

> ⚠️ **Pitfall**: tsc **still writes the `.js`** when there are type errors (by default), so read the errors.

### 2.3 Union types, optional parameters, generics (bonus slides)

**Union types** (slide 77, from the TypeScript 1.4 announcement): `|` allows one of several types:

```ts
function f(x: number | number[]) {
  if (typeof x === "number") {
    return x + 10;
  }
  else {
    // return sum of numbers
  }
}
```

`f(5)` → `15`; `f([1, 2, 3])` → `undefined` (the `else` is only a comment); `f("5")` is a type error.

**Optional and default parameters** (slide 78, TypeScript Handbook): `?` marks a parameter optional, `=` gives a default:

```ts
function f(n: number) {
  console.log(n.toFixed()); // 0 arguments
  console.log(n.toFixed(3)); // 1 argument
}

function f(x?: number) {
  // ...
}
f(); // OK
f(10); // OK

function f(x = 10) {
  // ...
}
```

(Three separate snippets.) An omitted `x?` is `undefined`; without `?`, `f()` is an error; `x = 10` defaults to 10. For `n = 3.14159`: `toFixed()` → `3`, `toFixed(3)` → `3.142`.

**Generics** (slide 75) "work the same as Java": type parameter `T` keeps the caller's type:

```ts
function identity<T>(arg: T): T {
    return arg;
}
let output = identity<string>("myString");  // type of output will be 'string'
let output = identity("myString");  // type of output will be 'string'
```

The second call **infers** `T` (like a C++ template). (Slide bug: `let output` twice → `Cannot redeclare block-scoped variable 'output'`; rename one.)

> 📝 **Practice**: [Question 1](#121-question-1-which-typescript-files-transpile-to-this-js-slide-14) · [Demo 1](#122-demo-1-add-types-to-joinntimes-slide-13--setup1--solution1)

> 🔗 **Go deeper**: [TypeScript Handbook: Generics](https://www.typescriptlang.org/docs/handbook/generics.html) · [Announcing TypeScript 1.4 (union types)](https://devblogs.microsoft.com/typescript/announcing-typescript-1-4/) · [TypeScript Handbook: Optional parameters](https://www.typescriptlang.org/docs/handbook/2/functions.html#optional-parameters)

---

## 3. Classes, interfaces and inheritance

### 3.1 Classes

Classes work "just like in Java": typed fields at the top, a constructor, methods:

```ts
class Shape {
    area: number;
    color: string;
    name: string;
 
    constructor (name: string, width: number, height: number ) {
        this.name = name
        this.area = width * height;
        this.color = "pink";
    };
    shoutout() {
        return "I'm " + this.color + " " + this.name +  " with an area of " + this.area + " cm squared.";
    }
}
 
var square = new Shape("square", 30, 30);
```

`square.shoutout()` → `I'm pink square with an area of 900 cm squared.` (`lecture.js`: the same JS `class`, fields untyped.)

### 3.2 Interfaces (bonus slide)

An interface describes an object's "inputs" and "outputs": its required properties and their types:

```ts
interface Shape {
    name: string;
    width: number;
    height: number;
    color?: string; // ? Specifies an "optional" value
}
 
function area(shape : Shape):string {
    var area = shape.width * shape.height;
    return "I'm " + shape.name + " with area " + area + " cm squared";
}
 
console.log(area({name: "rectangle", width: 30, height: 15}));
console.log(area({name: "square", width: 30, height: 30, color: "red"}));
```

Prints areas 450 and 900. Any object literal with the right properties is a `Shape`; omitting `height` is a type error. (Slide bug: curly `“red"` → `"red"`.)

### 3.3 Inheritance (bonus slide)

Classes and interfaces can be **extended**: `super(...)` calls the base constructor, a same-named method **overrides**, `super.method()` calls the base version:

```ts
class Shape3D extends Shape {
    volume: number;
 
    constructor (name: string, width: number, height: number, length: number ) {
        super( name, width, height ); //calls base class constructor
        this.volume = length * this.area;
    };
 
    shoutout() { //overrides the base class
        return "I'm " + this.name +  " with a volume of " + this.volume + " cm cube.";
    }
 
    superShout() { //calls base class shoutout method
        return super.shoutout();
    }
}
 
var cube = new Shape3D("cube", 30, 30, 30);
console.log( cube.shoutout() );
console.log( cube.superShout() );
```

Prints `I'm cube with a volume of 27000 cm cube.`, then (base method) `I'm pink cube with an area of 900 cm squared.` Demo:

```viz web-demo
{"title": "Slides 17 & 74 · compiled JS of Shape and Shape3D", "interactive": true, "html": "<p>See the console.</p>", "js": "// compiled JavaScript of the slide 17 Shape class + slide 74 Shape3D (types stripped)\nclass Shape {\n    constructor(name, width, height) {\n        this.name = name;\n        this.area = width * height;\n        this.color = \"pink\";\n    }\n    ;\n    shoutout() {\n        return \"I'm \" + this.color + \" \" + this.name + \" with an area of \" + this.area + \" cm squared.\";\n    }\n}\nvar square = new Shape(\"square\", 30, 30);\nconsole.log(square.shoutout());\nclass Shape3D extends Shape {\n    constructor(name, width, height, length) {\n        super(name, width, height); //calls base class constructor\n        this.volume = length * this.area;\n    }\n    ;\n    shoutout() {\n        return \"I'm \" + this.name + \" with a volume of \" + this.volume + \" cm cube.\";\n    }\n    superShout() {\n        return super.shoutout();\n    }\n}\n\nvar cube = new Shape3D(\"cube\", 30, 30, 30);\nconsole.log(cube.shoutout());\nconsole.log(cube.superShout());\n", "height": 60}
```

### 3.4 Getters and setters (bonus slide)

`get`/`set` run code when a property is read or assigned; `private` hides the backing field:

```ts
const fullNameMaxLength = 10;
class Employee {
  private _fullName: string = "";
  get fullName(): string {
    return this._fullName;
  }
  set fullName(newName: string) {
    if (newName && newName.length > fullNameMaxLength) {
      throw new Error("fullName has a max length of " + fullNameMaxLength);
    }
    this._fullName = newName;
  }
}
```

`emp.fullName = "Peter"` stores it; a 14-character name throws. Outside access to `emp._fullName` is a compile-time error only.

---

## 4. tsconfig.json and declaration files

A `tsconfig.json` file:

- indicates a TypeScript **project**;
- says which files or folders to transpile;
- picks transpiler options, such as whether to remove comments;
- specifies which version of ECMAScript (JavaScript) to transpile to.

Build the whole project with:

```bash
tsc --project tsconfig.json
```

**Declaration files (bonus slides 71–72).** A `.d.ts` keeps the stripped types, so library users can check their calls:

```bash
tsc --declaration test.ts
npm install --save @types/your-library-here   # typings for many existing JS libraries
```

```ts
//test.ts
function area(shape: string, width: number, height: number):string {
    var area:number = width * height;
    return "I'm a " + shape + " of area " + area + " cm^2.";
}
document.body.innerHTML = area('square', 15, 15);
```

```js
// transpiled test.js
function area(shape, width, height) {
    var area = width * height;
    return "I'm a " + shape + " of area " + area + " cm^2.";
}
document.body.innerHTML = area('square', 15, 15);
```

```ts
// generated test.d.ts
declare function area(shape: string, width: number, height: number): string;
```

A `.d.ts` is like a C++ header: signatures only, no bodies.

> 🔗 **Go deeper**: [TypeScript Handbook: tsconfig.json](https://www.typescriptlang.org/docs/handbook/tsconfig-json.html)

---

## 5. Benefits, drawbacks and other transpilers

| Benefits of TypeScript | Drawbacks of TypeScript |
|---|---|
| **Type checking**: errors *before* the code runs | **Transpiling is occasionally a pain**; it can be slow for large projects |
| Editors autocomplete methods and APIs | Might not work with new JavaScript libraries out of the gate |
| Easier to refactor code | Took a while to fit Angular and React (now Angular's default) |
| **Object-oriented**: easier to manage/maintain large code bases | |
| Simple enough to use: same principles as Java and other OO languages | |

**Other noteworthy JavaScript transpilers:**

| | Dart | Kotlin |
|---|---|---|
| Developed by | Google | JetBrains (who develop a lot of IDEs) |
| Idea | introduces typing and similar object-oriented practices | a "better" Java, fully interoperable with it |
| To JavaScript via | `dart2js` | `kotlin.js` (for use with React, etc.) |

---

## 6. Interactive software and UI tools

*Switching topics: software tools and visualization*, a **very narrow slice**; for more, take **IN4MATX 143**.

**Sequential programs (command line).** The program prompts; the person waits, then types, modeled as a file (`input()`, `std::cin`).

**Event-driven programming.** The program waits for the person; input arrives as **events** (mouse down, drag, key up) in one ordered **event queue** that hides device specifics (`addEventListener`, [Lecture 6](?kind=course_notes&course=IN4MATX-133&lang=en-US&note=IN4MATX133_Lec06_Notes_en-US.md#7-events-and-listeners)).

**The basic interactive software loop** is in all interactive software somewhere:

```js
do { 
  e = read_event();          // Input
  dispatch_event(e);         // Processing
  if (damage_exists()) 
     update_display();       // Output
} while (e.type != WM_QUIT); 
```

Writing it for every webpage or app would be tedious, so **we rely on tools to handle common operations**.

**Example: a button.** Set X/Y bounds, check mouse down *and* mouse up are inside, then fire an event, for every button.

**Understanding tools.**

- *What is a UI tool?* Software/libraries that help build a UI: Bootstrap (responsive), Angular, React, etc.
- *Why use them?* They package common practices in a framework, make them easy to follow, and let you focus on your app.
- *They enable* faster, more iterative design, a better implementation, and consistency across apps using the same tool.
- *Why are tools hard to design?* Core practices and people's tasks keep changing.

---

## 7. Evaluating tools: threshold and ceiling

Four key terms for evaluating a tool's "usefulness" (Myers, Hudson & Pausch, TOCHI 2000):

| Term | Meaning | From the slides |
|---|---|---|
| **Threshold** | how hard it is to get started | Depends on prior knowledge; a new language raises it, borrowed concepts lower it. |
| **Ceiling** | how much can be achieved | Tools restrict what's possible vs raw device access. |
| **Path of least resistance** | tools influence what interfaces are created | Bootstrap pages look alike ([Lecture 4](?kind=course_notes&course=IN4MATX-133&lang=en-US&note=IN4MATX133_Lec04_Notes_en-US.md)). **Sapir-Whorf**: language limits thought; tools frame how we think about design. |
| **Moving targets** | changing needs make tools obsolete | Codification constrains design; understanding and tech (e.g. VR) move on. |

**Both are relative.** The best tools are **low threshold** and **high ceiling** (Photoshop adds tutorials to lower its threshold).

> 📝 **Practice**: [Question 2](#123-question-2-threshold-and-ceiling-of-photoshop-vs-paint-slide-38)

> 🔗 **Go deeper**: [Myers, Hudson & Pausch (2000): Past, present, and future of user interface software tools](https://doi.org/10.1145/344949.344959)

---

## 8. Visualization tools and declarative languages

*What does this have to do with visualization?* Visualization tools follow the same principles.

### 8.1 SVG vs Excel

**SVG (Scalable Vector Graphics)**: XML-based, HTML-like markup of lines, circles, rectangles; browsers render it. (Slide: raster "S" of pixels vs smooth vector "S".)

```html
<svg width="100" height="100">
  <circle cx="50" cy="50" r="40" stroke="green" stroke-width="4" fill="yellow" />
</svg>
```

A yellow circle, green border, center (50, 50), radius 40:

```viz web-demo
{"title": "Slide 43 · an SVG circle", "interactive": true, "html": "<svg width=\"100\" height=\"100\">\n  <circle cx=\"50\" cy=\"50\" r=\"40\" stroke=\"green\" stroke-width=\"4\" fill=\"yellow\" />\n</svg>", "height": 120, "steps": [{"note": "Add a rectangle: SVG is built from shapes like this.", "html": "<svg width=\"100\" height=\"100\">\n  <circle cx=\"50\" cy=\"50\" r=\"40\" stroke=\"green\" stroke-width=\"4\" fill=\"yellow\" />\n  <rect x=\"35\" y=\"35\" width=\"30\" height=\"30\" fill=\"blue\" />\n</svg>"}]}
```

| Tool | Threshold | Ceiling |
|---|---|---|
| SVG | high | high (anything, e.g. Minard's Napoleon chart) |
| Microsoft Excel | low | low (standard charts like the slide's "Wildlife Population" bar chart) |

### 8.2 The spectrum of visualization tools

Slide 45, from lower threshold (top) to higher ceiling (bottom):

| Layer | Kind | Examples |
|---|---|---|
| Charting tools | Chart typologies | Excel, Google Charts |
| Declarative languages | Visual analysis grammars | ggplot, VizQL |
| Declarative languages | **Visualization grammars** (highlighted) | Protovis, D3.js, **Vega-Lite** |
| Programming languages | Graphics APIs | Processing, SVG, OpenGL |

### 8.3 Declarative vs imperative

A **declarative language** describes **what**, not **how**, separating the **specification** from the **execution**; **imperative** code gives explicit steps.

The slides relabel HTML (markup) and CSS (styling) as **declarative**, JavaScript (programming) as **imperative**. Slide 49:

```html
<main class="container">
  <div class="row">
    <div class="col-3">A</div>
    <div class="col-6">B</div>
    <div class="col-4">C</div>
    <div class="col">D</div>
    <div class="col">E</div>
  </div>
</main>
```

```js
var array = ['1', 'fish', 2, 'blue'];
array[5] = 'dog';
array.push('2');
array[2] = array[array.length - 1] - 4;
array[0] = typeof array[2];
array[4] = array.indexOf('blue');
console.log(array.join('*'));
```

Grid: *what*. JS: *step-by-step*, ending in `number*fish*-2*blue*3*dog*2` ([Lecture 5](?kind=course_notes&course=IN4MATX-133&lang=en-US&note=IN4MATX133_Lec05_Notes_en-US.md)). (Slide bug: curly `“col-4"`, `“col"`; fixed.)

**Why declarative?** Faster iteration, less code, a lower threshold, and it can be generated programmatically.

> 🔗 **Go deeper**: [Wikipedia: Vector graphics](https://en.wikipedia.org/wiki/Vector_graphics) · [Edward Tufte: posters](https://www.edwardtufte.com/tufte/posters)

---

## 9. Vega-Lite: a grammar of graphics

**Goal** (Satyanarayan et al., IEEE Vis 2017): "an expressive (high ceiling) yet concise (low threshold) declarative language for specifying visualizations".

A **grammar of graphics**: a chart is these parts:

| Part | What it is |
|---|---|
| **Data** | the input data to visualize |
| **Mark** | the data-representative graphics: area, bar, dot (point), image, line, label (text), rule, arc |
| **Transform** | whether to filter, aggregate, bin, etc. |
| **Encoding** | the mapping between data fields and mark properties (x, y, color, …) |
| **Scale** | (part of an encoding) maps data values to visual values |
| **Guides** | axes and legends that visualize the scales |

A spec is a JSON object; data is usually a JSON array of records (the repo's `seattle-weather.json`, 365 rows for 2015):

```json
[
    {
        "date": "2015/01/01", 
        "weather": "sun", 
        "temperature": 1.1999999999999997
    }, 
    {
        "date": "2015/01/02", 
        "weather": "fog", 
        "temperature": 2.8
    }, 
    ...
]
```

Draw it with `vegaEmbed('#id', spec)` after loading the vega, vega-lite and vega-embed scripts ([Demo 2](#124-demo-2-bar-chart-of-us-ages-in-2000-slide-63--setup2--solution2)).

> 🔗 **Go deeper**: [Satyanarayan et al. (2017): Vega-Lite: A Grammar of Interactive Graphics](https://doi.org/10.1109/TVCG.2016.2599030)

---

## 10. Building a histogram in Vega-Lite

**Histogram = bar with x = binned field, y = count**, colored by weather. Built one change at a time:

**Step 1: a tick per record** (slide 55): mark `"tick"`, x = `"temperature"`:

```js
{
  data: {url: "weather-seattle.json"},
  mark: "tick",
  encoding: {
    x: {
      field: "temperature",
      type: "quantitative"
    }
  }
}
```

Every field gets one of **four types**:

| Type | Meaning | Example |
|---|---|---|
| `quantitative` | numerical | temperature |
| `temporal` | time | date |
| `ordinal` | ordered categories | age group, month |
| `nominal` | unordered categories | weather, origin |

**Step 2: bin** (slide 56): `bin: true` on x; axis title `BIN(temperature)`, one tick per bin, no count yet.

**Step 3: count** (slide 57): y with `aggregate: "count"`; still ticks, at each count's height.

**Step 4: bars** (slide 58): `mark: "bar"` makes it a histogram:

```js
{
  data: {url: "weather-seattle.json"},
  mark: "bar",
  encoding: {
    x: {
      bin: true,
      field: "temperature",
      type: "quantitative"
    },
    y: {
      aggregate: "count",
      type: "quantitative"
    }
  }
}
```

**Step 5: color** (slide 59): `color: {field: "weather", type: "nominal"}` splits each bar into **stacked** segments, with a legend.

Demo with 12 inline rows (`data: {values: …}`), so counts are small:

```viz web-demo
{"title": "Slides 55–59 · building the histogram one encoding at a time (inline rows from seattle-weather.json)", "interactive": true, "libs": ["vega-lite"], "html": "<div id=\"vis\"></div>", "js": "// 12 rows from the repo's seattle-weather.json (the demo can't load the file)\nvar weather = [\n  {\"date\": \"2015/01/01\", \"weather\": \"sun\", \"temperature\": 1.2},\n  {\"date\": \"2015/01/02\", \"weather\": \"fog\", \"temperature\": 2.8},\n  {\"date\": \"2015/01/18\", \"weather\": \"rain\", \"temperature\": 10.55},\n  {\"date\": \"2015/03/25\", \"weather\": \"fog\", \"temperature\": 10.8},\n  {\"date\": \"2015/04/01\", \"weather\": \"rain\", \"temperature\": 9.2},\n  {\"date\": \"2015/05/22\", \"weather\": \"sun\", \"temperature\": 14.2},\n  {\"date\": \"2015/06/15\", \"weather\": \"drizzle\", \"temperature\": 23.05},\n  {\"date\": \"2015/07/08\", \"weather\": \"drizzle\", \"temperature\": 22.2},\n  {\"date\": \"2015/07/31\", \"weather\": \"sun\", \"temperature\": 26.1},\n  {\"date\": \"2015/08/14\", \"weather\": \"rain\", \"temperature\": 16.65},\n  {\"date\": \"2015/08/22\", \"weather\": \"drizzle\", \"temperature\": 19.45},\n  {\"date\": \"2015/10/19\", \"weather\": \"fog\", \"temperature\": 14.7}\n];\n\nvegaEmbed(\"#vis\", {\n  data: {values: weather},\n  mark: \"tick\",\n  encoding: {\n    x: {field: \"temperature\", type: \"quantitative\"}\n  }\n}, {actions: false});", "height": 260, "tab": "js", "steps": [{"note": "Slide 56: bin: true groups the temperatures into bins.", "js": "vegaEmbed(\"#vis\", {\n  data: {values: weather},\n  mark: \"tick\",\n  encoding: {\n    x: {bin: true, field: \"temperature\", type: \"quantitative\"}\n  }\n}, {actions: false});"}, {"note": "Slide 57: y counts the records in each bin (still ticks).", "js": "vegaEmbed(\"#vis\", {\n  data: {values: weather},\n  mark: \"tick\",\n  encoding: {\n    x: {bin: true, field: \"temperature\", type: \"quantitative\"},\n    y: {aggregate: \"count\", type: \"quantitative\"}\n  }\n}, {actions: false});"}, {"note": "Slide 58: change the mark to bar, and it's a histogram.", "js": "vegaEmbed(\"#vis\", {\n  data: {values: weather},\n  mark: \"bar\",\n  encoding: {\n    x: {bin: true, field: \"temperature\", type: \"quantitative\"},\n    y: {aggregate: \"count\", type: \"quantitative\"}\n  }\n}, {actions: false});"}, {"note": "Slide 59: color by the nominal weather field; the bars stack automatically.", "js": "vegaEmbed(\"#vis\", {\n  data: {values: weather},\n  mark: \"bar\",\n  encoding: {\n    x: {bin: true, field: \"temperature\", type: \"quantitative\"},\n    y: {aggregate: \"count\", type: \"quantitative\"},\n    color: {field: \"weather\", type: \"nominal\"}\n  }\n}, {actions: false});"}]}
```

> 🧪 **Demo files**: [seattle-weather.json](https://github.com/travislindenreid/INF33-Demos/blob/main/W3_L2_Oct15_TypeScript_VegaLite/demos/setup/seattle-weather.json)

> ⚠️ **Pitfall**: Slides load `"weather-seattle.json"`, the repo file is `seattle-weather.json`; a wrong `url` gives an empty chart, no error. (The slides' `snow` isn't in the repo's 2015 data.)

---

## 11. Sensible defaults and overriding them

Slide 59 never specified colors, bin widths, axis labels or stacking: Vega-Lite chose **"sensible defaults"**.

**Overriding the defaults** (slide 61): a custom color scale maps each `domain` value to a `range` color:

```js
color: {
  field: "weather",
  type: "nominal",
  scale: {
    domain: ["sun","fog","drizzle", "rain","snow"],
    range: ["#e7ba52","#c7c7c7","#aec7e8","#1f77b4","#9467bd"]
  }
}
```

Slide bug: `scale` sits *beside* `color`, so Vega-Lite drops it (warning) → put it inside `color`, as above (curly `“#1f77b4"` fixed too).

**Monthly precipitation** (slide 62): `timeUnit: "month"` groups and labels dates (e.g. "2018-10-17") by month; `aggregate: "mean"` averages:

```js
{
data: {url: "weather-seattle.json"},
mark: "bar",
encoding: {
x: {
timeUnit: "month", field: "date",
type: "quantitative"
},
y: {
aggregate: "mean",
field: "precipitation",
type: "quantitative"
}
}
}
```

Slide bugs: the repo data has no `precipitation` (the demo uses temperature), and a `quantitative` month draws **no bars**; use `"ordinal"` (as on the slide) or `"temporal"`.

```viz web-demo
{"title": "Slides 61–62 · overriding the color scale, then a monthly mean (inline rows from seattle-weather.json)", "interactive": true, "libs": ["vega-lite"], "html": "<div id=\"vis\"></div>", "js": "// 12 rows from the repo's seattle-weather.json (the demo can't load the file)\nvar weather = [\n  {\"date\": \"2015/01/01\", \"weather\": \"sun\", \"temperature\": 1.2},\n  {\"date\": \"2015/01/02\", \"weather\": \"fog\", \"temperature\": 2.8},\n  {\"date\": \"2015/01/18\", \"weather\": \"rain\", \"temperature\": 10.55},\n  {\"date\": \"2015/03/25\", \"weather\": \"fog\", \"temperature\": 10.8},\n  {\"date\": \"2015/04/01\", \"weather\": \"rain\", \"temperature\": 9.2},\n  {\"date\": \"2015/05/22\", \"weather\": \"sun\", \"temperature\": 14.2},\n  {\"date\": \"2015/06/15\", \"weather\": \"drizzle\", \"temperature\": 23.05},\n  {\"date\": \"2015/07/08\", \"weather\": \"drizzle\", \"temperature\": 22.2},\n  {\"date\": \"2015/07/31\", \"weather\": \"sun\", \"temperature\": 26.1},\n  {\"date\": \"2015/08/14\", \"weather\": \"rain\", \"temperature\": 16.65},\n  {\"date\": \"2015/08/22\", \"weather\": \"drizzle\", \"temperature\": 19.45},\n  {\"date\": \"2015/10/19\", \"weather\": \"fog\", \"temperature\": 14.7}\n];\n\n// slide 61, with scale moved inside color (see the note above)\nvegaEmbed(\"#vis\", {\n  data: {values: weather},\n  mark: \"bar\",\n  encoding: {\n    x: {bin: true, field: \"temperature\", type: \"quantitative\"},\n    y: {aggregate: \"count\", type: \"quantitative\"},\n    color: {\n      field: \"weather\", type: \"nominal\",\n      scale: {\n        domain: [\"sun\",\"fog\",\"drizzle\",\"rain\",\"snow\"],\n        range: [\"#e7ba52\",\"#c7c7c7\",\"#aec7e8\",\"#1f77b4\",\"#9467bd\"]\n      }\n    }\n  }\n}, {actions: false});", "height": 260, "tab": "js", "steps": [{"note": "Slide 62's idea on the repo data: timeUnit month on date, y = mean temperature (the repo file has no precipitation field).", "js": "// slide 62 (ordinal month; temperature instead of precipitation)\nvegaEmbed(\"#vis\", {\n  data: {values: weather},\n  mark: \"bar\",\n  encoding: {\n    x: {timeUnit: \"month\", field: \"date\", type: \"ordinal\"},\n    y: {aggregate: \"mean\", field: \"temperature\", type: \"quantitative\"}\n  }\n}, {actions: false});"}]}
```

**Sensible defaults are Vega-Lite's secret** (slide 67): **lower threshold** (concise specs), **same ceiling** (overridable). Downside: charts **look similar** (path of least resistance, like grid frameworks) ([section 7](#7-evaluating-tools-threshold-and-ceiling)).

The in-class **Vega-Lite demo** (slide 63, `setup2.js`, "Not TypeScript!") is [Demo 2](#124-demo-2-bar-chart-of-us-ages-in-2000-slide-63--setup2--solution2).

> 📝 **Practice**: [Demo 2](#124-demo-2-bar-chart-of-us-ages-in-2000-slide-63--setup2--solution2) · [Question 3](#125-question-3-which-vega-lite-spec-draws-this-scatter-plot-slide-64)

---

## 12. In-class Questions & Demos (with Solutions)

### 12.1 Question 1: Which TypeScript files transpile to this JS? (slide 14)

Which TypeScript files would transpile to

```js
function pythagorean(a, b) {
    var cSq = a * a + b * b;
    return Math.sqrt(cSq);
}
```

```ts
// 1
function pythagorean(a:number, b:number):number {
var cSq = a*a + b*b;
return Math.sqrt(cSq);
}
// 2
function pythagorean(a:number, b:number) {
var cSq = a*a + b*b;
return Math.sqrt(cSq);
}
// 3
function pythagorean(a, b) {
    var cSq = a * a + b * b;
    return Math.sqrt(cSq);
}
```

- **A** 1
- **B** 2
- **C** 3
- **D** 1 and 2
- **E** 1, 2, and 3

> ✍️ **Try it first.**

**Answer: E** (revealed on slide 16).

- Types are **erased**: files 1 and 2 lose their `:number`s (tsc on the repo's `q1.ts` versions confirms).
- File 3 is plain JS, and TS is a superset, so it transpiles to itself.
- Trap: strict mode flags file 3 (`implicitly has an 'any' type`) **but still emits the same JS**.

> 🧪 **Demo files**: [q1.ts](https://github.com/travislindenreid/INF33-Demos/blob/main/W3_L2_Oct15_TypeScript_VegaLite/q1/q1.ts) · [q1.js](https://github.com/travislindenreid/INF33-Demos/blob/main/W3_L2_Oct15_TypeScript_VegaLite/q1/q1.js)

Back to [2. Types](#2-types).

### 12.2 Demo 1: Add types to joinNTimes (slide 13 · setup1 → solution1)

The task, from `setup1.ts`:

- Write the function in plain JavaScript to join the array of strings on the "join" character, concatenating the results with a newline (`'\n'`).
- Add types to all the parameters and the return of that function.
- How does that change which function calls are legal?

The three calls to try (commented out in the starter):

```ts
//console.log(joinNTimes(['hello', 'my', 'name', 'is', 'theresa'], ' ', 3));
//console.log(joinNTimes(['in4matx', 133], '-', 2))
//console.log(joinNTimes(['two', 'too', 'to'], 2, 4))
```

> ✍️ **Try it first.**

**Answer.** Plain JS (the repo's `setup1.js`):

```js
function joinNTimes(arrOfStr, joinStr, n) {
    var joinedStr = '';
    for (var i = 0; i < n; i++) {
        joinedStr += arrOfStr.join(joinStr) + '\n';
    }
    return joinedStr;
}
```

Untyped, **all three calls run** (the slide's console):

```
hello my name is theresa
hello my name is theresa
hello my name is theresa

in4matx-133
in4matx-133

two2too2to
two2too2to
two2too2to
two2too2to
```

`join` coerces `133` to `"133"` and uses `2` as the separator `"2"`.

With types (from `solution1.ts`):

```ts
function joinNTimes(arrOfStr:string[], joinStr:string, n:number):string {
	var joinedStr:string = '';
	for(var i:number=0;i<n;i++) {
		joinedStr += arrOfStr.join(joinStr) + '\n';
	}
	return joinedStr;
}
```

Now **only the first call is legal**:

| Call | tsc |
|---|---|
| `joinNTimes(['hello', …, 'theresa'], ' ', 3)` | OK |
| `joinNTimes(['in4matx', 133], '-', 2)` | `Type 'number' is not assignable to type 'string'.` (`133` inside a `string[]`) |
| `joinNTimes(['two', 'too', 'to'], 2, 4)` | `Argument of type 'number' is not assignable to parameter of type 'string'.` (`joinStr`) |

`solution1.js` keeps only the first call. (Repo quirk: `solution1.ts` is all inside `/* … */`.)

> 🧪 **Demo files**: [setup1.html](https://github.com/travislindenreid/INF33-Demos/blob/main/W3_L2_Oct15_TypeScript_VegaLite/demos/setup/setup1.html) · [setup1.ts](https://github.com/travislindenreid/INF33-Demos/blob/main/W3_L2_Oct15_TypeScript_VegaLite/demos/setup/setup1.ts) · [setup1.js](https://github.com/travislindenreid/INF33-Demos/blob/main/W3_L2_Oct15_TypeScript_VegaLite/demos/setup/setup1.js) · [solution1.ts](https://github.com/travislindenreid/INF33-Demos/blob/main/W3_L2_Oct15_TypeScript_VegaLite/demos/solution/solution1.ts) · [solution1.js](https://github.com/travislindenreid/INF33-Demos/blob/main/W3_L2_Oct15_TypeScript_VegaLite/demos/solution/solution1.js)

Back to [2. Types](#2-types).

### 12.3 Question 2: Threshold and ceiling of Photoshop vs Paint (slide 38)

Relative to each other, what are the *threshold* and *ceiling* of Adobe Photoshop and Microsoft Paint? (They're tools for making images, but the principles apply.)

- **A** Photoshop: high ceiling, high threshold; Paint: low ceiling, low threshold
- **B** Photoshop: high ceiling, low threshold; Paint: low ceiling, high threshold
- **C** Photoshop: low ceiling, high threshold; Paint: high ceiling, low threshold
- **D** Photoshop: low ceiling, low threshold; Paint: high ceiling, high threshold
- **E** I'm confused, just clicking in to get participation credit

> ✍️ **Try it first.**

**Answer: A** (revealed on slide 40).

- **Ceiling**: Photoshop does far more (layers, filters, photo editing), which rules out C and D.
- **Threshold**: Paint is easy; Photoshop takes learning (hence its tutorials, slide 41), which rules out B.
- Both terms are relative.

Back to [7. Evaluating tools](#7-evaluating-tools-threshold-and-ceiling).

### 12.4 Demo 2: Bar chart of U.S. ages in 2000 (slide 63 · setup2 → solution2)

The task (`setup2.js`): a bar chart of the U.S. age distribution, **ages on the Y-axis, counts on the X-axis**. Records of `population.json` (loaded from the web; copy in the folder):

```json
[{"year":1850,"age":0,"sex":1,"people":1483789},
{"year":1850,"age":0,"sex":2,"people":1450376},
...]
```

The starter (`setup2.html` loads vega 5.21.0, vega-lite 5.2.0, vega-embed 6.20.2 from jsDelivr, plus an `<h1>` and empty `<div id="plot">`):

```js
document.addEventListener('DOMContentLoaded', function (event) {
	var schema = {
		"$schema": "https://vega.github.io/schema/vega-lite/v4.json",
		"data": { "url": "https://vega.github.io/editor/data/population.json"},
		"transform": [{"filter": "datum.year == 2000"}], /*Only select population data from 2000*/
		/*Make a bar chart, encode the X and Y axes*/
	}
	vegaEmbed('#plot', schema, {actions:false});
});
```

As given it fails: `Invalid specification … includes at least one of … "mark", "layer", …`.

> ✍️ **Try it first.**

**Answer** (the part `solution2.js` adds in place of the comment):

```js
		"mark": "bar",
		"encoding": {
			"y": {
			  "field": "age", "type": "ordinal"
			},
			"x": {
			  "aggregate": "sum", "field": "people", "type": "quantitative",
			  "axis": {"title": "population"}
			}
		}
```

- `mark: "bar"`, **y = age, `ordinal`**: one bar per age group, in order.
- **x = `sum` of `people`**: adds each age's two records (sex 1 and 2).
- `axis: {"title": "population"}` overrides the default title (`Sum of people`).
- The `transform` filter keeps only the 2000 rows.

Result: 19 bars, ages 0–90, longest at 35–40 (~23M). The v4 `$schema` causes a harmless warning.

Demo: year-2000 rows for ages 0, 10, … 90, plus a 1990 row the filter drops:

```viz web-demo
{"title": "Demo 2 · solution2.js with inline rows (DOMContentLoaded wrapper dropped; the demo runs after the page)", "libs": ["vega-lite"], "html": "<h1>U.S. age distribution in 2000</h1>\n<div id=\"plot\">\n</div>", "js": "// population.json, year 2000 rows for ages 0,10,...,90 (+ one 1990 row the filter drops)\nvar population = [\n  {\"year\": 2000, \"age\": 0, \"sex\": 1, \"people\": 9735380},\n  {\"year\": 2000, \"age\": 0, \"sex\": 2, \"people\": 9310714},\n  {\"year\": 2000, \"age\": 10, \"sex\": 1, \"people\": 10563233},\n  {\"year\": 2000, \"age\": 10, \"sex\": 2, \"people\": 10022524},\n  {\"year\": 2000, \"age\": 20, \"sex\": 1, \"people\": 9731315},\n  {\"year\": 2000, \"age\": 20, \"sex\": 2, \"people\": 9324244},\n  {\"year\": 2000, \"age\": 30, \"sex\": 1, \"people\": 10205879},\n  {\"year\": 2000, \"age\": 30, \"sex\": 2, \"people\": 10119296},\n  {\"year\": 2000, \"age\": 40, \"sex\": 1, \"people\": 11320252},\n  {\"year\": 2000, \"age\": 40, \"sex\": 2, \"people\": 11488578},\n  {\"year\": 2000, \"age\": 50, \"sex\": 1, \"people\": 8507934},\n  {\"year\": 2000, \"age\": 50, \"sex\": 2, \"people\": 8911133},\n  {\"year\": 2000, \"age\": 60, \"sex\": 1, \"people\": 5123399},\n  {\"year\": 2000, \"age\": 60, \"sex\": 2, \"people\": 5668961},\n  {\"year\": 2000, \"age\": 70, \"sex\": 1, \"people\": 3792145},\n  {\"year\": 2000, \"age\": 70, \"sex\": 2, \"people\": 5184855},\n  {\"year\": 2000, \"age\": 80, \"sex\": 1, \"people\": 1902638},\n  {\"year\": 2000, \"age\": 80, \"sex\": 2, \"people\": 3221898},\n  {\"year\": 2000, \"age\": 90, \"sex\": 1, \"people\": 336303},\n  {\"year\": 2000, \"age\": 90, \"sex\": 2, \"people\": 1064581},\n  {\"year\": 1990, \"age\": 0, \"sex\": 1, \"people\": 9307465},\n  {\"year\": 1990, \"age\": 0, \"sex\": 2, \"people\": 8894007}\n];\n\nvar schema = {\n    \"data\": { \"values\": population },\n    \"transform\": [{\"filter\": \"datum.year == 2000\"}], /*Only select population data from 2000*/\n    \"mark\": \"bar\",\n    \"encoding\": {\n        \"y\": {\n          \"field\": \"age\", \"type\": \"ordinal\"\n        },\n        \"x\": {\n          \"aggregate\": \"sum\", \"field\": \"people\", \"type\": \"quantitative\",\n          \"axis\": {\"title\": \"population\"}\n        }\n    }\n}\nvegaEmbed('#plot', schema, {actions:false});", "height": 340, "tab": "js"}
```

> 🧪 **Demo files**: [setup2.html](https://github.com/travislindenreid/INF33-Demos/blob/main/W3_L2_Oct15_TypeScript_VegaLite/demos/setup/setup2.html) · [setup2.js](https://github.com/travislindenreid/INF33-Demos/blob/main/W3_L2_Oct15_TypeScript_VegaLite/demos/setup/setup2.js) · [solution2.html](https://github.com/travislindenreid/INF33-Demos/blob/main/W3_L2_Oct15_TypeScript_VegaLite/demos/solution/solution2.html) · [solution2.js](https://github.com/travislindenreid/INF33-Demos/blob/main/W3_L2_Oct15_TypeScript_VegaLite/demos/solution/solution2.js) · [population.json](https://github.com/travislindenreid/INF33-Demos/blob/main/W3_L2_Oct15_TypeScript_VegaLite/demos/setup/population.json)

Back to [11. Sensible defaults](#11-sensible-defaults-and-overriding-them).

### 12.5 Question 3: Which Vega-Lite spec draws this scatter plot? (slide 64)

How would this visualization be specified in Vega-Lite? (Assume field names are correct.) The chart: hollow circles, **Horsepower** on x (0–200+), **Miles_per_Gallon** on y (0–50), color by **Origin** (Europe blue, Japan orange, USA red).

- **A**
  ```js
  mark: "point",
    encoding: {
      x: {field: "MPG", type: "ordinal"},
      y: {field: “Horsepower", type: "ordinal"},
      color: {field: "Origin", type: "nominal"}
    }
  ```
- **B**
  ```js
  mark: "point",
    encoding: {
      x: {field: "Horsepower", type: "quantitative"},
      y: {field: "MPG", type: "quantitative"},
      color: {field: "Origin", type: "nominal"}
    }
  ```
- **C**
  ```js
  mark: "ticks",
    encoding: {
      x: {field: "Horsepower", type: "quantitative"},
      y: {field: "MPG", type: "quantitative"},
      color: {field: "Origin", type: "nominal"}
    }
  ```
- **D**
  ```js
  mark: "point",
    encoding: {
      x: {field: "Horsepower", type: "quantitative"},
      y: {field: "MPG", type: "quantitative"},
      color: {field: "Origin", type: "ordinal"}
    }
  ```
- **E**
  ```js
  mark: "ticks",
    encoding: {
      x: {field: "MPT", type: "ordinal"},
      y: {field: “Horsepower", type: "ordinal"},
      color: {field: "Origin", type: "nominal"}
    }
  ```

(Letters as on reveal slide 66; the slide text orders them differently. A and E keep the slide's curly `“`.)

> ✍️ **Try it first.**

**Answer: B** (revealed on slide 66).

- **Mark**: hollow circles = `"point"`; `"ticks"` isn't a mark (C errors), ruling out C and E.
- **Axes**: Horsepower x, MPG y, both `quantitative`; A and E swap them as `ordinal` (E: typo `"MPT"`).
- **Color**: Origin is unordered, so `nominal` (three hues). D's `ordinal` gives shades of one hue:

```viz web-demo
{"title": "Question 3 · option B (nominal color), then option D (ordinal color)", "libs": ["vega-lite"], "html": "<div id=\"vis\"></div>", "js": "// three made-up rows, just to compare B (nominal) with D (ordinal)\nvar cars = [\n  {\"Horsepower\": 130, \"MPG\": 18, \"Origin\": \"USA\"},\n  {\"Horsepower\": 95, \"MPG\": 24, \"Origin\": \"Japan\"},\n  {\"Horsepower\": 46, \"MPG\": 26, \"Origin\": \"Europe\"}\n];\nfunction show(colorType) {\n  vegaEmbed(\"#vis\", {\n    data: {values: cars},\n    mark: \"point\",\n    encoding: {\n      x: {field: \"Horsepower\", type: \"quantitative\"},\n      y: {field: \"MPG\", type: \"quantitative\"},\n      color: {field: \"Origin\", type: colorType}\n    }\n  }, {actions: false});\n}\nshow(\"nominal\"); // option B", "height": 240, "tab": "js", "steps": [{"note": "Option D: ordinal color turns the three origins into shades of one hue, unlike the slide's chart.", "js": "show(\"ordinal\"); // option D"}]}
```

Back to [11. Sensible defaults](#11-sensible-defaults-and-overriding-them).

---

## 13. Quick Reference & Top 5 Things to Remember

**TypeScript**

| Syntax / command | Meaning |
|---|---|
| `npm install -g typescript` | installs `tsc` |
| `tsc hello.ts` | writes `hello.js` (types stripped) |
| `tsc --project tsconfig.json` | build a project per its config |
| `tsc --declaration test.ts` | also writes `test.d.ts` (types only) |
| `npm install --save @types/lib` | type declarations for a JS library |
| `var x:number = 133;` | annotated variable; `var x = 133;` infers `number` |
| `number`, `boolean`, `string`, `void`, `null`, `undefined`, `any` | predefined types |
| `function f(a: string, b: number): string` | parameter and return types |
| `string[]` | array of strings |
| `x: number \| number[]` | union type |
| `f(x?: number)` / `f(x = 10)` | optional / default parameter |
| `interface Shape { color?: string; }` | object shape; `?` = optional property |
| `class B extends A { constructor(){ super(...) } }` | inheritance; `super.m()` calls the base method |
| `private`, `get` / `set` | hidden field; accessor property |
| `function identity<T>(arg: T): T` | generic function |

**Tool evaluation**

| Term | Meaning |
|---|---|
| Threshold | how hard to get started (want low) |
| Ceiling | how much can be achieved (want high) |
| Path of least resistance | tools shape what gets built (all Bootstrap / Vega-Lite output looks alike) |
| Moving targets | changing needs make tools obsolete |

**Vega-Lite**

| Piece | Example |
|---|---|
| data | `data: {url: "file.json"}` or `data: {values: [...]}` |
| mark | `"bar"`, `"tick"`, `"point"`, `"line"`, `"area"`, `"rule"`, `"text"`, `"arc"` |
| field types | `quantitative`, `temporal`, `ordinal`, `nominal` |
| bin | `x: {bin: true, field: "temperature", type: "quantitative"}` |
| aggregate | `y: {aggregate: "count", type: "quantitative"}`; also `"sum"`, `"mean"` |
| color | `color: {field: "weather", type: "nominal"}` |
| custom scale | `color: {…, scale: {domain: [...], range: [...]}}` (inside the channel) |
| time | `x: {timeUnit: "month", field: "date", type: "ordinal"}` |
| filter | `transform: [{"filter": "datum.year == 2000"}]` |
| draw it | `vegaEmbed('#plot', spec, {actions: false})` |

**Top 5 things to remember**

1. TS types are **checked, then erased**: typed and untyped code emit the same JS, even with type errors.
2. Typing is optional: `var x = 133` is **inferred** as `number`; parameter types decide which calls are legal.
3. **Threshold** = how hard to start, **ceiling** = how much is possible; want low/high; relative (Photoshop high/high, Paint low/low).
4. Declarative = *what* (HTML, CSS, Vega-Lite); imperative = step-by-step *how* (JS). Vega-Lite's **sensible defaults** lower the threshold; overrides keep the ceiling.
5. Vega-Lite spec = **data + mark + encoding** with the right field type; histogram = `bar`, binned x, `count` y.
