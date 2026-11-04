---
title: "Separation in Angular"
summary: "Standalone components and the root component, routing and ActivatedRoute, services and dependency injection, plain classes and npm libraries, Angular's file structure, and the Rolling Dice service demo."
---

# IN4MATX 133: User Interface Software — Lecture 11: Separation in Angular & Modeling human performance

## Table of Contents

- [1. Running an Angular project](#1-running-an-angular-project)
- [2. Large client interfaces need components](#2-large-client-interfaces-need-components)
- [3. Standalone components and the root component](#3-standalone-components-and-the-root-component)
- [4. Angular routing](#4-angular-routing)
- [5. Angular services](#5-angular-services)
- [6. Plain classes](#6-plain-classes)
- [7. Importing a library](#7-importing-a-library)
- [8. Angular's file structure](#8-angulars-file-structure)
- [9. In-class Questions & Demos (with Solutions)](#9-in-class-questions--demos-with-solutions)
- [10. Quick Reference & Top 5 Things to Remember](#10-quick-reference--top-5-things-to-remember)

> UCI IN4MATX 133: User Interface Software — Prof. Travis Linden Reid, Fall 2026, Tuesday 11/3 (Week 6)
> Built from the Lecture 11 slides and the demo repo folder `W6_L1_AngularServices` (`setup1` → `solution1`). Organized by concept, not by source.
> The deck's title also names "Modeling human performance", but none of its slides cover that topic — everything here is the Angular half.

> 📅 **Class logistics**: After today's lecture you have everything you need to complete A3.
> A3's deadline moved back two days — due **Wednesday, Nov 11**.

Goals for today: differentiate and explain the roles of Angular components, modules and services; implement a service in Angular; navigate Angular's file structure.

> 💡 **Key Insight**: As in [Lecture 10](lec-10.en-US.md), Angular can't run inside these notes' demo boxes, so each demo re-creates the Angular example **by hand in plain JavaScript**, labelled as such. The Angular code itself is in the code blocks.

---

## 1. Running an Angular project

To follow the demos (or start A3), open a terminal and:

| Command | What it does |
|---|---|
| `cd [foldername]` | Move into a folder — go into the project folder, where `package.json` lives |
| `ls` (mac) / `dir` (windows) | List the files in the current folder, to help you navigate |
| `npm install` | Download the packages listed in `package.json` into the project. They are **not** in version control, so you must run this after cloning |
| `ng serve --open` | Run the app locally; `--open` opens `http://localhost:4200/` when it's ready |

For this lecture's demo that means `cd solution1`, `npm install`, `ng serve --open`.

## 2. Large client interfaces need components

A "large" client interface (the slide's example is Instagram's web feed) has:

- hundreds of pages and ways to navigate between them,
- repeated UI elements — the status updates in the feed — which Angular implements as **components**,
- different content, links, etc. displayed for each person.

Loading lots of libraries can be slow and expensive, so Angular lets each part of the app **import only the components it needs**. Components themselves were [Lecture 10](lec-10.en-US.md#5-angular-components); today is about how the pieces of a large app are separated: components for views, routing for pages, services for everything that isn't a view.

## 3. Standalone components and the root component

You can import a component **within another component**. These "standalone" components are new in Angular 19 (2024); previously there were *modules* (`@NgModule`) to essentially "wrap" components. You'll still see modules in older code — A3's routing file is one (Section 4).

The root component imports the components its template uses (`app.component.ts`, slide 8):

```ts
import { Component } from '@angular/core';
import { FooterComponent } from ‘.footer/footer.component’;
import { HeaderComponent } from ‘.header/header.component’;

@Component({
imports: [HeaderComponent, FooterComponent],
selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
```

The two `import` lines bring the classes in by file path; `imports: [HeaderComponent, FooterComponent]` is what **allows this component to use** them, i.e. to write `<app-header>` and `<app-footer>` in `app.component.html`. Slide bugs: the paths use curly quotes and are missing a slash — write `'./footer/footer.component'` and `'./header/header.component'`.

The demo repo's root component does the same with its one child:

```ts
// solution1/src/app/app.component.ts (top)
import { Component } from '@angular/core';
import { RigDiceService } from './rig-dice.service';
import { DieComponent } from './die/die.component';

@Component({
  selector: 'app-root',
  imports: [DieComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
```

And `setup1`'s comments point out how the root gets on the page: `selector: 'app-root'` applies this component anywhere the `<app-root>` tag is used, and `index.html` contains only that tag — the root imports the rest of the components needed to display the site:

```html
<body>
  <app-root></app-root>
</body>
```

`main.ts` starts it with `bootstrapApplication(AppComponent, appConfig)`.

> ⚠️ **Pitfall**: Writing `<app-die>` in a template without adding `DieComponent` to that component's `imports` doesn't work — the import statement at the top of the file is not enough on its own.

> 🧪 **Demo files**: [app.component.ts](https://github.com/travislindenreid/INF33-Demos/blob/main/W6_L1_AngularServices/solution1/src/app/app.component.ts) · [index.html (setup1)](https://github.com/travislindenreid/INF33-Demos/blob/main/W6_L1_AngularServices/setup1/src/index.html) · [main.ts](https://github.com/travislindenreid/INF33-Demos/blob/main/W6_L1_AngularServices/solution1/src/main.ts)

## 4. Angular routing

Angular maintains a list of **routes**. In general, routing defines which URIs go to which endpoints; in Angular, it defines which URIs go to which **components**.

### 4.1 The routes table

A3's routing file, `app-routing.module.ts` (called `app.routes.ts` in newer Angular), slide 10:

```ts
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ArtistPageComponent } from './pages/artist-page/artist-page.component';
import { TrackPageComponent } from './pages/track-page/track-page.component';
import { AlbumPageComponent } from './pages/album-page/album-page.component';
import { HomePageComponent } from './pages/home-page/home-page.component';

const routes: Routes = [
  { path: 'artist/:id', component: ArtistPageComponent},
  { path: 'track/:id', component: TrackPageComponent},
  { path: 'album/:id', component: AlbumPageComponent},
  { path: '', component: HomePageComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
```

Each entry is a path pattern plus the component to show. `artist/:id` listens for any endpoint of the form `artist/<something>`; the `:id` part is a **route parameter** that the component can read (4.2). `''` is the empty path, the home page.

In the newer layout (the demo repo), `app.routes.ts` just exports the array — empty here, since the dice app has one page — and `app.config.ts` registers it:

```ts
// solution1/src/app/app.config.ts
export const appConfig: ApplicationConfig = {
  providers: [provideZoneChangeDetection({ eventCoalescing: true }), provideRouter(routes), provideHttpClient()]
};
```

### 4.2 Retrieving the route in a component

`album-page.component.ts` (slide 11) reads the `id`:

```ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-album-page',
  templateUrl: './album-page.component.html',
  styleUrls: ['./album-page.component.css']
})
export class AlbumPageComponent implements OnInit {
  constructor(private route: ActivatedRoute) { }

  ngOnInit() {
    var albumId = this.route.snapshot.paramMap.get('id');
  }
}
```

`constructor(private route: ActivatedRoute)` is **"injecting a service"** (Section 5): Angular hands the component an `ActivatedRoute` describing the current URI, and `snapshot.paramMap.get('id')` retrieves the `:id` from it. Reading it in `ngOnInit()` follows Lecture 10's rule of putting setup code there rather than in the constructor.

What the router does, step by step — the slide's routes table matched by hand:

```viz web-demo
{"title": "Slides 10–11 · the routes table and paramMap.get('id'), by hand in plain JS", "html": "<p>Current URI: <code id=\"uri\"></code></p>\n<p>Component shown: <b id=\"comp\"></b></p>", "css": "body { font-family: system-ui, sans-serif; } code { background: #eef; padding: 1px 4px; }", "js": "// const routes: Routes = [...]  (slide 10)\nconst routes = [\n  { path: 'artist/:id', component: 'ArtistPageComponent' },\n  { path: 'track/:id',  component: 'TrackPageComponent' },\n  { path: 'album/:id',  component: 'AlbumPageComponent' },\n  { path: '',           component: 'HomePageComponent' }\n];\n\n// What the router does for you: find the route, collect :params\nfunction navigate(uri) {\n  const parts = uri.split('/').filter(p => p !== '');\n  for (const r of routes) {\n    const pattern = r.path.split('/').filter(p => p !== '');\n    if (pattern.length !== parts.length) continue;\n    const params = new Map();\n    const ok = pattern.every((p, i) => p.startsWith(':') ? (params.set(p.slice(1), parts[i]), true) : p === parts[i]);\n    if (ok) {\n      document.getElementById('uri').textContent = '/' + parts.join('/');\n      document.getElementById('comp').textContent = r.component;\n      // inside the component: this.route.snapshot.paramMap.get('id')\n      console.log('/' + parts.join('/') + ' -> ' + r.component + ', id = ' + params.get('id'));\n      return;\n    }\n  }\n  console.log('/' + parts.join('/') + ' -> no route');\n}\nnavigate('/');\n", "steps": [{"note": "An album URI: the :id part becomes the id parameter.", "js": "navigate('/album/1DFixLWuPkv3KT3TnV35m3');"}, {"note": "Same pattern, different component.", "js": "navigate('/artist/0OdUWJ0sBjDrqHygGUXeCF');"}, {"note": "A path with no matching route.", "js": "navigate('/playlist/123/extra');"}], "height": 110, "interactive": true}
```

`/` shows `HomePageComponent` (no `id` in its path); `/album/1DFixLWuPkv3KT3TnV35m3` shows `AlbumPageComponent` with `id = 1DFixLWuPkv3KT3TnV35m3`; the artist URI goes to `ArtistPageComponent`; `/playlist/123/extra` matches no route.

> ⚠️ **Pitfall**: The route parameter's name is whatever follows the colon. `path: 'album/:id'` → `paramMap.get('id')`; `get('albumId')` would give `null`.

## 5. Angular services

### 5.1 What goes in a service

Anything **not associated with a specific view** should be turned into a **service** — e.g. getting data from an API, or parsing URIs for routing information. That keeps components lightweight: the component handles its view, the service does the work.

Services are then **injected** into a component: import the service and retrieve it as a **parameter in the constructor**. Create one with:

```bash
ng generate service [name]
```

(`ng generate service rig-dice` is how the demo's `rig-dice.service.ts` and `rig-dice.service.spec.ts` were made.)

### 5.2 You've already used one: ActivatedRoute

Slide 13 re-labels the album-page code from 4.2: `import { ActivatedRoute } from '@angular/router'` is **importing a service**, `constructor(private route: ActivatedRoute) { }` is **injecting it**, and `this.route.snapshot…` in `ngOnInit()` shows the service **can be referenced later** — `private` in the constructor parameter makes it a field of the class (a TypeScript shorthand for declaring the field and assigning it).

### 5.3 Defining a service

A3's `spotify.service.ts` (slide 14):

```ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class SpotifyService {
  baseUrl:string = 'http://localhost:8888';

  constructor(private http:HttpClient) { }

  private sendRequestToExpress(endpoint:string) {
  }
}
```

- `@Injectable(...)` defines the class as injectable (where a component has `@Component`).
- `providedIn: 'root'` says which module(s) can use this service — `'root'` means the whole app.
- `constructor(private http:HttpClient)`: **services can inject other services** — here Angular's `HttpClient`, which sends the HTTP requests (to the Express server on port 8888 in A3). `HttpClient` only works if the app provides it: `provideHttpClient()` in `app.config.ts` (4.1).

### 5.4 Importing a custom service

Your own service is imported **via the file structure** and injected like any other (slide 15):

```ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SpotifyService } from '../../services/spotify.service';

@Component({
  selector: 'app-album-page',
  templateUrl: './album-page.component.html',
  styleUrls: ['./album-page.component.css']
})
export class AlbumPageComponent implements OnInit {

  constructor(private route: ActivatedRoute,
  private spotifyService:SpotifyService) { }
```

Angular services come from a package name (`'@angular/router'`); yours from a relative path (`'../../services/spotify.service'` — up from `pages/album-page/` to `app/`, then into `services/`, no `.ts`). You never write `new SpotifyService(...)`: Angular sees the constructor's parameter types and creates and passes the objects. The chain HttpClient → SpotifyService → AlbumPageComponent, with the injector's work done by hand:

```viz web-demo
{"title": "Slides 13–15 · constructor injection (HttpClient → SpotifyService → AlbumPageComponent), by hand in plain JS", "html": "<p>See the console.</p>", "js": "// Angular builds these objects for you and passes them to constructors.\nclass HttpClient {\n  get(url) { console.log('HttpClient.get ' + url); return Promise.resolve({ name: 'Album ' + url.split('/').pop() }); }\n}\n\n// @Injectable({ providedIn: 'root' })\nclass SpotifyService {\n  baseUrl = 'http://localhost:8888';\n  constructor(http) { this.http = http; }            // HttpClient injected\n  getAlbum(id) { return this.http.get(this.baseUrl + '/album/' + id); }\n}\n\nclass ActivatedRoute {\n  constructor(id) { this.snapshot = { paramMap: new Map([['id', id]]) }; }\n}\n\n// The component stays lightweight: no fetching code of its own\nclass AlbumPageComponent {\n  constructor(route, spotifyService) { this.route = route; this.spotifyService = spotifyService; }\n  ngOnInit() {\n    var albumId = this.route.snapshot.paramMap.get('id');\n    this.spotifyService.getAlbum(albumId).then(album => console.log('page shows: ' + album.name));\n  }\n}\n\n// What the injector does:\nconst http = new HttpClient();\nconst spotify = new SpotifyService(http);\nconst page = new AlbumPageComponent(new ActivatedRoute('42'), spotify);\npage.ngOnInit();\n", "height": 60, "interactive": true}
```

The console prints `HttpClient.get http://localhost:8888/album/42` then `page shows: Album 42`: the component asked for an album by id and never touched HTTP itself. The demo's real service, `RigDiceService`, is worked through in [Demo 1](#93-demo-1-rolling-dice-with-a-service-slide-21--setup1--solution1).

> ⚠️ **Pitfall**: Forgetting `private` (or `public`) in `constructor(private http:HttpClient)` makes `http` a plain constructor parameter — `this.http` won't exist in other methods.

> 📝 **Practice**: [Demo 1: Rolling Dice with a service](#93-demo-1-rolling-dice-with-a-service-slide-21--setup1--solution1)

## 6. Plain classes

Plain-old classes can also be made in Angular, for any processing or "munging" of data you need to do. Create one with `ng generate class [name]`:

```ts
export class Dataparser {
  public constructor() {
    console.log('Hello, world!');
  }
}
```

Import it via the file structure and **instantiate it like any other class**, with `new` (slide 17):

```ts
import { Component, OnInit, Input } from '@angular/core';
import { Dataparser } from '../dataparser';

@Component({
  selector: 'app-day',
  templateUrl: './day.component.html',
  styleUrls: ['./day.component.css']
})
export class DayComponent implements OnInit {
  @Input() today:string;
  days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  constructor() {
    var data = new Dataparser();
  }

  ngOnInit() {
  }
}
```

Creating a `DayComponent` logs `Hello, world!`. The difference from a service: a class is created by you with `new` wherever you need one; a service is `@Injectable` and handed to you by Angular through the constructor.

> ⚠️ **Pitfall**: In a project with `"strict": true` (the demo repo's `tsconfig.json`), the slide's `@Input() today:string;` fails to compile: `error TS2564: Property 'today' has no initializer and is not definitely assigned in the constructor.` Give it a default, as Lecture 10's `week.ts` does: `@Input() today:string = "";`.

## 7. Importing a library

Since Angular is in TypeScript, it can use **any JavaScript or TypeScript library**. Install it as normal with npm (`npm install [packagename]`); if you want TypeScript typings, don't forget to install `@types/[packagename]` as well.

```ts
import chroma from 'chroma-js';

export class Dataparser {
  constructor() {
    console.log(chroma('royalblue')); //'#4169e1'
  }
}
```

Note the different syntax: `import chroma from 'chroma-js'` is a **default import** (no braces), unlike `import { Component } from '@angular/core'`, which picks named exports. After that, `chroma` can be referenced anywhere in the file.

What it really prints (chroma-js 3.2.0): `console.log(chroma('royalblue'))` logs the `Color` object, `Color { _rgb: [ 65, 105, 225, 1, … ] }`; `chroma('royalblue').hex()` gives the slide's `'#4169e1'`.

## 8. Angular's file structure

Angular projects generate a *lot* of files — about 75 in the A3 starter code — and most are boilerplate. Slide 20's tree (an older Angular layout) shows the shape; this lecture's `solution1` (Angular 19) is the current layout:

| Where | File(s) | What it is |
|---|---|---|
| root | `package.json`, `package-lock.json` | dependencies (`npm install` reads them) |
| root | `angular.json` | Angular CLI project config (build/serve settings) |
| root | `tsconfig.json`, `tsconfig.app.json`, `tsconfig.spec.json` | TypeScript settings |
| root | `.editorconfig`, `.gitignore`, `README.md` | editor, git, docs |
| root | `node_modules/` | installed packages — not in git |
| `public/` | `1.png` … `6.png`, `rigged_rolls.json`, `favicon.ico` | static files served as-is (older projects: `src/assets/`) |
| `src/` | `index.html`, `main.ts`, `styles.css` | host page with `<app-root>`, the bootstrap, global styles |
| `src/app/` | `app.component.{ts,html,css,spec.ts}` | the root component |
| `src/app/` | `app.config.ts`, `app.routes.ts` | providers and routes (older: `app.module.ts`, `app-routing.module.ts`) |
| `src/app/die/` | `die.component.*` | a child component (one folder each) |
| `src/app/` | `rig-dice.service.ts`, `rig-dice.service.spec.ts` | a service |

The files you actually edit are almost all in `src/app/`. The `.spec.ts` files are automated tests (Lecture 10: mostly ignored); slide 20's older tree also has `e2e/`, `karma.conf.js`, `polyfills.ts`, `test.ts` and `tslint.json`, which newer CLIs no longer generate.

> 🧪 **Demo files**: [solution1/](https://github.com/travislindenreid/INF33-Demos/tree/main/W6_L1_AngularServices/solution1) · [setup1/](https://github.com/travislindenreid/INF33-Demos/tree/main/W6_L1_AngularServices/setup1)

---

## 9. In-class Questions & Demos (with Solutions)

The poll slides show only the prompts (no options and no results), so the answers come from `solution1`.

### 9.1 Question 1: How will we embed the die components? (slide 22)

*L11-Q1: How will we embed the die components?*

Context: `setup1` already has `DieComponent` (`selector: 'app-die'`, with `@Input() value:number = 0;`), and `AppComponent` has two fields, `die1` and `die2`. `app.component.html` has `TODO 1: add two die apps`.

> ✍️ **Try it first.**

**Answer** (TODO 1 in `solution1/src/app/app.component.html`):

```html
<p>
  <app-die [value]="die1"></app-die>
  <app-die [value]="die2"></app-die>
</p>
```

Two things make it work: the `app-die` selector placed twice in the parent's template, and `DieComponent` listed in `AppComponent`'s `imports: [DieComponent]` ([Section 3](#3-standalone-components-and-the-root-component)). `[value]="die1"` is a property binding into the child's `@Input()` — brackets because `die1` is an expression (a field of the parent), not the literal text "die1" ([Lecture 10](lec-10.en-US.md#102-inputs)).

### 9.2 Question 2: How will we embed a button that activates rollDice()? (slide 23)

*L11-Q2: How will we embed a button that activates the `rollDice()` function?*

> ✍️ **Try it first.**

**Answer** (TODO 3 in `app.component.html`):

```html
<button (click)="rollDice()">Roll dice</button>
```

An **event binding**: `(click)` sends the click to the component, running `rollDice()` in `AppComponent`. It must be `(click)`, not `[click]` (that would be a property binding), and the statement must call the method — `rollDice()` with parentheses. Back to [Section 3](#3-standalone-components-and-the-root-component).

### 9.3 Demo 1: Rolling Dice with a service (slide 21 · setup1 → solution1)

**Task**: the starter is a dice simulator — a heading, an empty spot for a button, a `DieComponent` that always shows `1.png`, and an `AppComponent` that rolls with `Math.random()`. Wire it together, then move the rolling into a **service** that returns (rigged) rolls from `public/rigged_rolls.json`. The TODOs in `setup1`:

```ts
// setup1/src/app/app.component.ts
import { Component } from '@angular/core';
// TODO 4 [after creating die service]: import die service
import { DieComponent } from './die/die.component';

@Component({
  selector: 'app-root',
  imports: [DieComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  die1:number = 0;
  die2:number = 0;

  // TODO 5: add new die service to constructor
  constructor() {

  }

  //TODO 6: use the die roll service instead of Math.random()
  rollDice() {
    this.die1 = Math.floor(Math.random()*6) + 1;
    this.die2 = Math.floor(Math.random()*6) + 1;
  }
}
```

`app.component.html` has TODO 1 (two dice), TODO 3 (button, and print the total); `die.component.html` has TODO 2 (`<img src="1.png">` → use the `value` input).

> ✍️ **Try it first.**

**Solution.** TODO 1 and the button are Questions 1–2 above. TODO 2, the die's view — show the image whose name is the value, and nothing before the first roll:

```html
@if(value != 0) {
    <img src="{{value}}.png">
}
```

TODO 3, the total, under the dice:

```html
@if(die1 !=0 && die2 != 0) {
  <p>Your rolled a total of: {{die1 + die2}}.</p>
}
```

(The repo's text says "Your rolled" — a typo for "You rolled".) Then `ng generate service rig-dice` and fill in `rig-dice.service.ts`:

```ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RigDiceService {
  die1:number[] = [];
  die2:number[] = [];
  die1Index:number = 0;
  die2Index:number = 0;

  constructor(private http:HttpClient) {
    //TODO: use the HTTP client to get the rigged die rolls from the JSON file in the assets folder
    //Add the values to the arrays for die1 and die2
    firstValueFrom(this.http.get('rigged_rolls.json', {responseType: 'json'})).then((data:any) => {
      data.forEach((dieRolls:any) => {
        this.die1.push(dieRolls['die1']);
        this.die2.push(dieRolls['die2']);
      });
    });
  }

  //TODO: first, have the service roll fair dice by using Math.random() to roll.
  // return Math.floor(Math.random() * 6 + 1);

  //Then, update the service to return the rigged die rolls in order.
  rollDie1():number {
    // first, use return this.die1[0] just to test loading first entry of array
    // then:
    return this.die1[(this.die1Index++)%this.die1.length];
  }

  rollDie2():number {
    // first, use return this.die2[0] just to test loading first entry of array
    // then:
    return this.die2[(this.die2Index++)%this.die2.length];
  }
}
```

The comments give the in-class order: first make `rollDie1()` return a fair `Math.floor(Math.random() * 6 + 1)`, then `this.die1[0]` to test the JSON load, then the rigged rolls in order. `http.get('rigged_rolls.json')` fetches the file from `public/` (served at the site root); `firstValueFrom(...)` turns `HttpClient`'s observable into a Promise, so `.then` works as in [Lecture 8](lec-08.en-US.md). `(this.die1Index++) % this.die1.length` walks the array and wraps back to the start after the last of the 19 pairs. `HttpClient` is available because `app.config.ts` has `provideHttpClient()`.

TODOs 4–6, in `AppComponent`:

```ts
import { RigDiceService } from './rig-dice.service';      // TODO 4
// ...
  constructor(private rigDice:RigDiceService) {           // TODO 5

  }

  rollDice() {                                            // TODO 6
    this.die1 = this.rigDice.rollDie1();
    this.die2 = this.rigDice.rollDie2();
  }
```

The component didn't change shape at all — it still sets `die1` and `die2` and the view follows — only *where the numbers come from* moved into the service. That's the point of the lecture.

The finished app, re-created in plain JS (the JSON data inlined, the dice images from the repo) — step through three clicks or press the button yourself:

```viz web-demo
{"title": "Slide 21 · solution1 (AppComponent + DieComponent + RigDiceService), by hand in plain JS", "html": "<div style=\"text-align:center\"><h1>Dice rolling Simulator</h1></div>\n<h2>Push the button to roll the dice:</h2>\n<p><button id=\"roll\">Roll dice</button></p>\n<p id=\"dice\"></p>\n<p id=\"total\"></p>", "css": "body { font-family: system-ui, sans-serif; } h1 { font-size: 1.4em; } h2 { font-size: 1.05em; } img { padding: 5px; width: 60px; height: 60px; }", "js": "const IMG = 'https://raw.githubusercontent.com/travislindenreid/INF33-Demos/main/W6_L1_AngularServices/solution1/public/';\nconst RIGGED = [{\"die1\":5,\"die2\":2},{\"die1\":4,\"die2\":3},{\"die1\":6,\"die2\":1},{\"die1\":2,\"die2\":5},{\"die1\":1,\"die2\":6},{\"die1\":3,\"die2\":4},{\"die1\":2,\"die2\":5},{\"die1\":1,\"die2\":6},{\"die1\":4,\"die2\":3},{\"die1\":3,\"die2\":4},{\"die1\":6,\"die2\":1},{\"die1\":6,\"die2\":1},{\"die1\":4,\"die2\":3},{\"die1\":1,\"die2\":6},{\"die1\":2,\"die2\":5},{\"die1\":5,\"die2\":2},{\"die1\":4,\"die2\":3},{\"die1\":3,\"die2\":4},{\"die1\":4,\"die2\":3}];  // public/rigged_rolls.json\n\n// RigDiceService (rig-dice.service.ts)\nclass RigDiceService {\n  die1 = []; die2 = []; die1Index = 0; die2Index = 0;\n  constructor() {\n    // stands in for firstValueFrom(this.http.get('rigged_rolls.json')).then(...)\n    Promise.resolve(RIGGED).then(data => {\n      data.forEach(dieRolls => { this.die1.push(dieRolls['die1']); this.die2.push(dieRolls['die2']); });\n      console.log('rigged rolls loaded: ' + data.length);\n    });\n  }\n  rollDie1() { return this.die1[(this.die1Index++) % this.die1.length]; }\n  rollDie2() { return this.die2[(this.die2Index++) % this.die2.length]; }\n}\n\n// DieComponent view: @if(value != 0) { <img src=\"{{value}}.png\"> }\nfunction appDie(value) { return value != 0 ? '<img src=\"' + IMG + value + '.png\">' : ''; }\n\n// AppComponent\nconst rigDice = new RigDiceService();   // constructor(private rigDice:RigDiceService)\nlet die1 = 0, die2 = 0;\nfunction render() {\n  document.getElementById('dice').innerHTML = appDie(die1) + appDie(die2);\n  document.getElementById('total').textContent = (die1 != 0 && die2 != 0) ? 'Your rolled a total of: ' + (die1 + die2) + '.' : '';\n}\nfunction rollDice() {\n  die1 = rigDice.rollDie1();\n  die2 = rigDice.rollDie2();\n  console.log(die1 + ' + ' + die2 + ' = ' + (die1 + die2));\n  render();   // Angular re-renders for you\n}\ndocument.getElementById('roll').addEventListener('click', rollDice);  // (click)=\"rollDice()\"\nrender();\n", "steps": [{"note": "First click: the service returns the first rigged pair.", "js": "setTimeout(() => document.getElementById('roll').click());  // after the JSON has loaded"}, {"note": "Second click: the next pair — still a total of 7.", "js": "setTimeout(() => document.getElementById('roll').click());  // after the JSON has loaded"}, {"note": "Third click: and again 7. Every pair in rigged_rolls.json adds to 7.", "js": "setTimeout(() => document.getElementById('roll').click());  // after the JSON has loaded"}], "height": 270, "interactive": true}
```

The rolls come out `5 + 2 = 7`, `4 + 3 = 7`, `6 + 1 = 7`, … — **every pair in `rigged_rolls.json` adds up to 7**, so the faces look random but the total never changes. That's the "rigging".

> ⚠️ **Pitfall**: The JSON loads asynchronously. If `rollDice()` ran before the `.then` filled the arrays, `this.die1.length` is 0, `index % 0` is `NaN`, and `rollDie1()` returns `undefined`; `undefined != 0` is `true`, so the die would try to show `undefined.png` and the total would read `NaN`. A real click comes long after the tiny file has loaded, but code that rolls on start-up would hit this.

> 🧪 **Demo files**: [rig-dice.service.ts](https://github.com/travislindenreid/INF33-Demos/blob/main/W6_L1_AngularServices/solution1/src/app/rig-dice.service.ts) · [app.component.ts](https://github.com/travislindenreid/INF33-Demos/blob/main/W6_L1_AngularServices/solution1/src/app/app.component.ts) · [app.component.html](https://github.com/travislindenreid/INF33-Demos/blob/main/W6_L1_AngularServices/solution1/src/app/app.component.html) · [die.component.html](https://github.com/travislindenreid/INF33-Demos/blob/main/W6_L1_AngularServices/solution1/src/app/die/die.component.html) · [rigged_rolls.json](https://github.com/travislindenreid/INF33-Demos/blob/main/W6_L1_AngularServices/solution1/public/rigged_rolls.json) · [setup1 app.component.ts](https://github.com/travislindenreid/INF33-Demos/blob/main/W6_L1_AngularServices/setup1/src/app/app.component.ts)

Back to [Section 5](#5-angular-services).

---

## 10. Quick Reference & Top 5 Things to Remember

**Which piece does what**

| Piece | Decorator / file | Job | How you get one |
|---|---|---|---|
| Component | `@Component({ selector, templateUrl, styleUrls, imports })` | A view (template + style + class) | Its selector tag in a parent template + the class in the parent's `imports` |
| Module (older Angular) | `@NgModule({ imports, exports })` | "Wraps" components and config (before Angular 19's standalone components) | e.g. A3's `AppRoutingModule` |
| Service | `@Injectable({ providedIn: 'root' })` | Work not tied to a view: API data, routing info | Constructor parameter: `constructor(private s: MyService)` |
| Plain class | `export class X { }` | Data processing | `new X()` |
| Library | npm package | Anything from npm | `npm install pkg` (+ `@types/pkg`), then `import` |

**Routing**

| Thing | Syntax |
|---|---|
| Routes table | `const routes: Routes = [{ path: 'album/:id', component: AlbumPageComponent }, { path: '', component: HomePageComponent }];` |
| Register (new / old) | `provideRouter(routes)` in `app.config.ts` / `RouterModule.forRoot(routes)` in an `@NgModule` |
| Read a parameter | `constructor(private route: ActivatedRoute)` → `this.route.snapshot.paramMap.get('id')` |

**CLI and imports**

| Task | Command / syntax |
|---|---|
| Install dependencies / run | `npm install` · `ng serve --open` (localhost:4200) |
| Generate | `ng generate service [name]` · `ng generate class [name]` |
| HTTP in a service | `provideHttpClient()` in `app.config.ts`; `constructor(private http:HttpClient)` |
| Named vs default import | `import { Component } from '@angular/core'` · `import chroma from 'chroma-js'` |
| Your own file | relative path, no `.ts`: `import { SpotifyService } from '../../services/spotify.service'` |

**Top 5 things to remember**

1. Anything not tied to a specific view (fetching API data, parsing URIs) belongs in a service, so components stay lightweight.
2. To use a service, import it and take it as a constructor parameter with `private` — Angular creates and injects it; you never `new` a service.
3. Routes map URI patterns to components; `:id` in a path is read in the component with `this.route.snapshot.paramMap.get('id')`.
4. A component can use another component only if that class is in its `imports` array (standalone components, Angular 19+); older code wraps things in `@NgModule`s.
5. In a template, `[value]="die1"` binds a child input to an expression and `(click)="rollDice()"` binds an event to a method — brackets read, parentheses listen.
