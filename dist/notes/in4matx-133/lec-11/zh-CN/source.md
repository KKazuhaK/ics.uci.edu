# IN4MATX 133: User Interface Software — Lecture 11：Angular 中的分离与人类表现建模

## 目录

- [1. 运行 Angular 项目](#1-运行-angular-项目)
- [2. 大型客户端界面需要组件](#2-大型客户端界面需要组件)
- [3. 独立组件与根组件](#3-独立组件与根组件)
- [4. Angular 路由](#4-angular-路由)
- [5. Angular 服务](#5-angular-服务)
- [6. 普通类](#6-普通类)
- [7. 导入库](#7-导入库)
- [8. Angular 的文件结构](#8-angular-的文件结构)
- [9. 课堂问题与演示（附解答）](#9-课堂问题与演示附解答)
- [10. 速查与必记的 5 个要点](#10-速查与必记的-5-个要点)

> UCI IN4MATX 133: User Interface Software — Prof. Travis Linden Reid，2026 年秋季学期，周二 11/3（第 6 周）
> 内容整理自 Lecture 11 的幻灯片和 demo 仓库文件夹 `W6_L1_AngularServices`（`setup1` → `solution1`）。按概念组织，而不是按来源组织。
> 幻灯片的标题还提到了“Modeling human performance”（人类表现建模），但没有任何一张幻灯片涉及该主题——这里的内容全部是 Angular 部分。

> 📅 **课程安排**：今天的课之后，你就已经具备完成 A3 所需的全部内容。
> A3 的截止日期推迟了两天——现在是 **周三 11/11**。

本讲目标：区分并解释 Angular 组件、模块和服务的作用；在 Angular 中实现一个服务；理解 Angular 的文件结构。

> 💡 **关键点**：与 [Lecture 10](lec-10.zh-CN.md) 一样，Angular 无法在这些笔记的演示框中运行，因此每个演示都**用纯 JavaScript 手动重写**了 Angular 示例，并加以标注。Angular 代码本身位于代码块中。

---

## 1. 运行 Angular 项目

要跟随演示（或开始 A3），打开终端并执行：

| 命令 | 作用 |
|---|---|
| `cd [foldername]` | 进入一个文件夹——进入项目文件夹，`package.json` 就在那里 |
| `ls`（mac）/ `dir`（windows） | 列出当前文件夹中的文件，帮助你导航 |
| `npm install` | 下载 `package.json` 中列出的包到项目中。这些包**不**在版本控制中，因此克隆之后必须运行此命令 |
| `ng serve --open` | 在本地运行应用；`--open` 会在准备就绪时打开 `http://localhost:4200/` |

对于本讲的演示，就是执行 `cd solution1`、`npm install`、`ng serve --open`。

## 2. 大型客户端界面需要组件

一个“大型”客户端界面（幻灯片的例子是 Instagram 的网页信息流）具有：

- 数百个页面，以及在它们之间导航的多种方式，
- 重复出现的 UI 元素——信息流中的状态更新——Angular 把它们实现为**组件**，
- 为每个人显示的不同内容、链接等。

加载大量库可能既慢又耗费资源，因此 Angular 允许应用的每个部分**只导入它需要的组件**。组件本身已在 [Lecture 10](lec-10.zh-CN.md#5-angular-组件) 中讲过；今天的内容是大型应用的各个部分如何分离：组件负责视图，路由负责页面，服务负责所有非视图的工作。

## 3. 独立组件与根组件

你可以在**一个组件内部导入另一个组件**。这些“独立”（standalone）组件是 Angular 19（2024）中的新特性；此前，人们使用*模块*（`@NgModule`）来“包装”组件。你仍会在较旧的代码中看到模块——A3 的路由文件就是其中之一（见第 4 节）。

根组件导入其模板所使用的组件（`app.component.ts`，幻灯片 8）：

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

这两行 `import` 通过文件路径把类引入；`imports: [HeaderComponent, FooterComponent]` 则**允许该组件使用**它们，即在 `app.component.html` 中编写 `<app-header>` 和 `<app-footer>`。幻灯片的错误：路径使用了弯引号，并且缺少斜杠——应写为 `'./footer/footer.component'` 和 `'./header/header.component'`。

演示仓库的根组件对它唯一的子组件也是这样做的：

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

`setup1` 的注释指出了根组件如何出现在页面上：`selector: 'app-root'` 使该组件应用于每一处 `<app-root>` 标签，而 `index.html` 中只包含这一个标签——根组件导入显示网站所需的其余组件：

```html
<body>
  <app-root></app-root>
</body>
```

`main.ts` 使用 `bootstrapApplication(AppComponent, appConfig)` 启动它。

> ⚠️ **易错点**：在模板中写入 `<app-die>`，但没有把 `DieComponent` 加入该组件的 `imports`，是行不通的——文件顶部的 import 语句本身是不够的。

> 🧪 **演示文件**：[app.component.ts](https://github.com/travislindenreid/INF33-Demos/blob/main/W6_L1_AngularServices/solution1/src/app/app.component.ts) · [index.html (setup1)](https://github.com/travislindenreid/INF33-Demos/blob/main/W6_L1_AngularServices/setup1/src/index.html) · [main.ts](https://github.com/travislindenreid/INF33-Demos/blob/main/W6_L1_AngularServices/solution1/src/main.ts)

## 4. Angular 路由

Angular 维护一个**路由**列表。一般而言，路由定义了哪些 URI 对应哪些端点；在 Angular 中，它定义了哪些 URI 对应哪些**组件**。

### 4.1 路由表

A3 的路由文件 `app-routing.module.ts`（在较新的 Angular 中称为 `app.routes.ts`），幻灯片 10：

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

每一项都是一个路径模式加上要显示的组件。`artist/:id` 会匹配任何形如 `artist/<something>` 的端点；`:id` 部分是一个**路由参数**，组件可以读取它（4.2）。`''` 是空路径，即主页。

在较新的布局（演示仓库）中，`app.routes.ts` 只导出数组——这里为空，因为骰子应用只有一个页面——而 `app.config.ts` 负责注册它：

```ts
// solution1/src/app/app.config.ts
export const appConfig: ApplicationConfig = {
  providers: [provideZoneChangeDetection({ eventCoalescing: true }), provideRouter(routes), provideHttpClient()]
};
```

### 4.2 在组件中获取路由

`album-page.component.ts`（幻灯片 11）读取 `id`：

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

`constructor(private route: ActivatedRoute)` 就是**“注入服务”**（见第 5 节）：Angular 把描述当前 URI 的 `ActivatedRoute` 交给组件，而 `snapshot.paramMap.get('id')` 则从中取出 `:id`。与 Lecture 10 的规则一致，在 `ngOnInit()` 中读取它，而不是在构造函数中放置初始化代码。

路由器一步步做了什么——幻灯片的路由表被手动对应到下面的演示中：

```viz web-demo
{"title": "Slides 10–11 · the routes table and paramMap.get('id'), by hand in plain JS", "html": "<p>Current URI: <code id=\"uri\"></code></p>\n<p>Component shown: <b id=\"comp\"></b></p>", "css": "body { font-family: system-ui, sans-serif; } code { background: #eef; padding: 1px 4px; }", "js": "// const routes: Routes = [...]  (slide 10)\nconst routes = [\n  { path: 'artist/:id', component: 'ArtistPageComponent' },\n  { path: 'track/:id',  component: 'TrackPageComponent' },\n  { path: 'album/:id',  component: 'AlbumPageComponent' },\n  { path: '',           component: 'HomePageComponent' }\n];\n\n// What the router does for you: find the route, collect :params\nfunction navigate(uri) {\n  const parts = uri.split('/').filter(p => p !== '');\n  for (const r of routes) {\n    const pattern = r.path.split('/').filter(p => p !== '');\n    if (pattern.length !== parts.length) continue;\n    const params = new Map();\n    const ok = pattern.every((p, i) => p.startsWith(':') ? (params.set(p.slice(1), parts[i]), true) : p === parts[i]);\n    if (ok) {\n      document.getElementById('uri').textContent = '/' + parts.join('/');\n      document.getElementById('comp').textContent = r.component;\n      // inside the component: this.route.snapshot.paramMap.get('id')\n      console.log('/' + parts.join('/') + ' -> ' + r.component + ', id = ' + params.get('id'));\n      return;\n    }\n  }\n  console.log('/' + parts.join('/') + ' -> no route');\n}\nnavigate('/');\n", "steps": [{"note": "An album URI: the :id part becomes the id parameter.", "js": "navigate('/album/1DFixLWuPkv3KT3TnV35m3');"}, {"note": "Same pattern, different component.", "js": "navigate('/artist/0OdUWJ0sBjDrqHygGUXeCF');"}, {"note": "A path with no matching route.", "js": "navigate('/playlist/123/extra');"}], "height": 110, "interactive": true}
```

`/` 显示 `HomePageComponent`（其路径中没有 `id`）；`/album/1DFixLWuPkv3KT3TnV35m3` 显示 `AlbumPageComponent`，且 `id = 1DFixLWuPkv3KT3TnV35m3`；艺术家 URI 则进入 `ArtistPageComponent`；`/playlist/123/extra` 不匹配任何路由。

> ⚠️ **易错点**：路由参数的名字就是冒号后面的部分。`path: 'album/:id'` 对应 `paramMap.get('id')`；如果写成 `get('albumId')`，结果将是 `null`。

## 5. Angular 服务

### 5.1 服务中放什么

任何**与特定视图无关**的内容都应当写成**服务**——例如从 API 获取数据，或解析用于路由的 URI 信息。这样可以让组件保持轻量：组件负责视图，服务负责工作。

服务随后被**注入**到组件中：导入服务，并把它作为**构造函数的参数**取得。用下面的命令创建服务：

```bash
ng generate service [name]
```

（演示中的 `rig-dice.service.ts` 和 `rig-dice.service.spec.ts` 就是用 `ng generate service rig-dice` 创建的。）

### 5.2 你已经用过一个：ActivatedRoute

幻灯片 13 重新标注了 4.2 中的 album-page 代码：`import { ActivatedRoute } from '@angular/router'` 是**导入服务**，`constructor(private route: ActivatedRoute) { }` 是**注入服务**，而 `ngOnInit()` 中的 `this.route.snapshot…` 表明该服务**可以在之后被引用**——构造函数参数前的 `private` 会使它成为类的一个字段（这是 TypeScript 的简写，同时声明字段并完成赋值）。

### 5.3 定义服务

A3 的 `spotify.service.ts`（幻灯片 14）：

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

- `@Injectable(...)` 把该类定义为可注入的（相当于组件上的 `@Component`）。
- `providedIn: 'root'` 说明哪些模块可以使用该服务——`'root'` 表示整个应用。
- `constructor(private http:HttpClient)`：**服务可以注入其他服务**——这里注入的是 Angular 的 `HttpClient`，它负责发送 HTTP 请求（在 A3 中发送到端口 8888 上的 Express 服务器）。`HttpClient` 只有在应用提供它时才能工作：即 `app.config.ts` 中的 `provideHttpClient()`（4.1）。

### 5.4 导入自定义服务

你自己的服务通过**文件结构**导入，并且像其他服务一样被注入（幻灯片 15）：

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

Angular 的服务来自包名（`'@angular/router'`）；你自己的服务则来自相对路径（`'../../services/spotify.service'`——从 `pages/album-page/` 向上到 `app/`，再进入 `services/`，末尾不带 `.ts`）。你永远不需要写 `new SpotifyService(...)`：Angular 会查看构造函数参数的类型，并替你创建和传递对象。下面是 HttpClient → SpotifyService → AlbumPageComponent 这条链，注入器的工作被手动完成：

```viz web-demo
{"title": "Slides 13–15 · constructor injection (HttpClient → SpotifyService → AlbumPageComponent), by hand in plain JS", "html": "<p>See the console.</p>", "js": "// Angular builds these objects for you and passes them to constructors.\nclass HttpClient {\n  get(url) { console.log('HttpClient.get ' + url); return Promise.resolve({ name: 'Album ' + url.split('/').pop() }); }\n}\n\n// @Injectable({ providedIn: 'root' })\nclass SpotifyService {\n  baseUrl = 'http://localhost:8888';\n  constructor(http) { this.http = http; }            // HttpClient injected\n  getAlbum(id) { return this.http.get(this.baseUrl + '/album/' + id); }\n}\n\nclass ActivatedRoute {\n  constructor(id) { this.snapshot = { paramMap: new Map([['id', id]]) }; }\n}\n\n// The component stays lightweight: no fetching code of its own\nclass AlbumPageComponent {\n  constructor(route, spotifyService) { this.route = route; this.spotifyService = spotifyService; }\n  ngOnInit() {\n    var albumId = this.route.snapshot.paramMap.get('id');\n    this.spotifyService.getAlbum(albumId).then(album => console.log('page shows: ' + album.name));\n  }\n}\n\n// What the injector does:\nconst http = new HttpClient();\nconst spotify = new SpotifyService(http);\nconst page = new AlbumPageComponent(new ActivatedRoute('42'), spotify);\npage.ngOnInit();\n", "height": 60, "interactive": true}
```

控制台会打印 `HttpClient.get http://localhost:8888/album/42`，然后是 `page shows: Album 42`：组件请求了某个 id 的专辑，自己却从未接触 HTTP。演示中真正的服务 `RigDiceService` 将在 [演示 1](#93-演示-1使用服务掷骰子幻灯片-21--setup1--solution1) 中详细讲解。

> ⚠️ **易错点**：在 `constructor(private http:HttpClient)` 中忘记写 `private`（或 `public`），`http` 就只是一个普通的构造函数参数——在其他方法中将不存在 `this.http`。

> 📝 **练习**：[演示 1：使用服务掷骰子](#93-演示-1使用服务掷骰子幻灯片-21--setup1--solution1)

## 6. 普通类

在 Angular 中也可以创建普通的类，用于任何数据的处理或“整理”（munging）。用 `ng generate class [name]` 创建：

```ts
export class Dataparser {
  public constructor() {
    console.log('Hello, world!');
  }
}
```

通过文件结构导入它，并用 `new` **像实例化其他类一样实例化它**（幻灯片 17）：

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

创建 `DayComponent` 时会打印 `Hello, world!`。与服务的区别在于：普通类由你在需要的地方用 `new` 创建；而服务带有 `@Injectable`，由 Angular 通过构造函数交给你。

> ⚠️ **易错点**：在启用了 `"strict": true` 的项目中（演示仓库的 `tsconfig.json`），幻灯片中的 `@Input() today:string;` 无法编译，报错：`error TS2564: Property 'today' has no initializer and is not definitely assigned in the constructor.` 为它提供默认值即可，如 Lecture 10 的 `week.ts` 那样：`@Input() today:string = "";`。

## 7. 导入库

由于 Angular 使用 TypeScript，它可以使用**任何 JavaScript 或 TypeScript 库**。像平常一样用 npm 安装（`npm install [packagename]`）；如果你需要 TypeScript 的类型声明，别忘了也安装 `@types/[packagename]`。

```ts
import chroma from 'chroma-js';

export class Dataparser {
  constructor() {
    console.log(chroma('royalblue')); //'#4169e1'
  }
}
```

注意语法的不同：`import chroma from 'chroma-js'` 是**默认导入**（没有花括号），不同于选取命名导出的 `import { Component } from '@angular/core'`。之后，`chroma` 就可以在文件中的任何位置被引用。

实际输出（chroma-js 3.2.0）：`console.log(chroma('royalblue'))` 会打印 `Color` 对象，即 `Color { _rgb: [ 65, 105, 225, 1, … ] }`；`chroma('royalblue').hex()` 得到幻灯片中的 `'#4169e1'`。

## 8. Angular 的文件结构

Angular 项目会生成*大量*文件——A3 的初始代码中约有 75 个——而其中大多数是样板文件。幻灯片 20 的目录树（较旧的 Angular 布局）展示了大致结构；本讲的 `solution1`（Angular 19）是当前的布局：

| 位置 | 文件 | 作用 |
|---|---|---|
| 根目录 | `package.json`、`package-lock.json` | 依赖项（`npm install` 会读取它们） |
| 根目录 | `angular.json` | Angular CLI 项目配置（构建/服务设置） |
| 根目录 | `tsconfig.json`、`tsconfig.app.json`、`tsconfig.spec.json` | TypeScript 设置 |
| 根目录 | `.editorconfig`、`.gitignore`、`README.md` | 编辑器、git、文档 |
| 根目录 | `node_modules/` | 已安装的包——不在 git 中 |
| `public/` | `1.png` … `6.png`、`rigged_rolls.json`、`favicon.ico` | 原样提供的静态文件（较旧的项目使用 `src/assets/`） |
| `src/` | `index.html`、`main.ts`、`styles.css` | 包含 `<app-root>` 的宿主页面、启动代码、全局样式 |
| `src/app/` | `app.component.{ts,html,css,spec.ts}` | 根组件 |
| `src/app/` | `app.config.ts`、`app.routes.ts` | 提供者（providers）和路由（较旧的是 `app.module.ts`、`app-routing.module.ts`） |
| `src/app/die/` | `die.component.*` | 一个子组件（每个组件一个文件夹） |
| `src/app/` | `rig-dice.service.ts`、`rig-dice.service.spec.ts` | 一个服务 |

你真正编辑的文件几乎都在 `src/app/` 中。`.spec.ts` 文件是自动化测试（Lecture 10 中提到：基本可以忽略）；幻灯片 20 较旧的目录树还包括 `e2e/`、`karma.conf.js`、`polyfills.ts`、`test.ts` 和 `tslint.json`，而较新的 CLI 已不再生成这些文件。

> 🧪 **演示文件**：[solution1/](https://github.com/travislindenreid/INF33-Demos/tree/main/W6_L1_AngularServices/solution1) · [setup1/](https://github.com/travislindenreid/INF33-Demos/tree/main/W6_L1_AngularServices/setup1)

---

## 9. 课堂问题与演示（附解答）

投票幻灯片只显示了提问部分（没有选项，也没有结果），因此下面的答案来自 `solution1`。

### 9.1 问题 1：我们如何嵌入骰子组件？（幻灯片 22）

*L11-Q1: How will we embed the die components?*

背景：`setup1` 已经有了 `DieComponent`（`selector: 'app-die'`，带有 `@Input() value:number = 0;`），而 `AppComponent` 有两个字段 `die1` 和 `die2`。`app.component.html` 中有 `TODO 1: add two die apps`。

> ✍️ **先自己试一试。**

**答案**（`solution1/src/app/app.component.html` 中的 TODO 1）：

```html
<p>
  <app-die [value]="die1"></app-die>
  <app-die [value]="die2"></app-die>
</p>
```

让它生效的有两点：在父组件模板中放两次 `app-die` 选择器，并且在 `AppComponent` 的 `imports: [DieComponent]` 中列出 `DieComponent`（[第 3 节](#3-独立组件与根组件)）。`[value]="die1"` 是对子组件 `@Input()` 的属性绑定——使用方括号是因为 `die1` 是一个表达式（父组件的一个字段），而不是字面文本 "die1"（[Lecture 10](lec-10.zh-CN.md#102-输入)）。

### 9.2 问题 2：如何嵌入一个调用 rollDice() 的按钮？（幻灯片 23）

*L11-Q2: How will we embed a button that activates the `rollDice()` function?*

> ✍️ **先自己试一试。**

**答案**（`app.component.html` 中的 TODO 3）：

```html
<button (click)="rollDice()">Roll dice</button>
```

这是一个**事件绑定**：`(click)` 把点击发送给组件，运行 `AppComponent` 中的 `rollDice()`。必须使用 `(click)`，而不是 `[click]`（那会是属性绑定）；语句必须调用该方法——即带括号的 `rollDice()`。返回 [第 3 节](#3-独立组件与根组件)。

### 9.3 演示 1：使用服务掷骰子（幻灯片 21 · setup1 → solution1）

**任务**：起始代码是一个骰子模拟器——一个标题、一个用于放按钮的空位置、一个始终显示 `1.png` 的 `DieComponent`，以及一个用 `Math.random()` 掷骰子的 `AppComponent`。先把它们连接起来，然后把掷骰逻辑移入一个**服务**，该服务从 `public/rigged_rolls.json` 返回（作弊的）点数。`setup1` 中的 TODO 如下：

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

`app.component.html` 中有 TODO 1（两个骰子）和 TODO 3（按钮，以及显示总和）；`die.component.html` 中有 TODO 2（`<img src="1.png">` → 使用 `value` 输入）。

> ✍️ **先自己试一试。**

**解答**。TODO 1 和按钮即上面的问题 1–2。TODO 2 是骰子的视图——显示名称为其数值的图片，并且在第一次掷骰之前什么都不显示：

```html
@if(value != 0) {
    <img src="{{value}}.png">
}
```

TODO 3，即骰子下方的总和：

```html
@if(die1 !=0 && die2 != 0) {
  <p>Your rolled a total of: {{die1 + die2}}.</p>
}
```

（仓库中的文字是 "Your rolled"——应为 "You rolled"，这是一个拼写错误。）然后执行 `ng generate service rig-dice`，并在 `rig-dice.service.ts` 中填入：

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

代码中的注释给出了课堂上的顺序：先让 `rollDie1()` 返回公平的 `Math.floor(Math.random() * 6 + 1)`，然后返回 `this.die1[0]` 以测试 JSON 是否加载成功，最后按顺序返回作弊的点数。`http.get('rigged_rolls.json')` 从 `public/` 获取文件（在网站根路径下提供）；`firstValueFrom(...)` 把 `HttpClient` 的 observable 转换为 Promise，因此可以使用 `.then`，与 [Lecture 8](lec-08.zh-CN.md) 中一样。`(this.die1Index++) % this.die1.length` 遍历数组，并在 19 对点数之后回绕到开头。`HttpClient` 之所以可用，是因为 `app.config.ts` 中有 `provideHttpClient()`。

`AppComponent` 中的 TODO 4–6：

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

组件的结构完全没有改变——它仍然设置 `die1` 和 `die2`，视图随之更新——变化的只是*数字从哪里来*，它们被移到了服务中。这正是本讲的重点。

下面是用纯 JS 重新实现的完成版应用（JSON 数据已内联，骰子图片来自仓库）——可以点击三次，或自己按下按钮：

```viz web-demo
{"title": "Slide 21 · solution1 (AppComponent + DieComponent + RigDiceService), by hand in plain JS", "html": "<div style=\"text-align:center\"><h1>Dice rolling Simulator</h1></div>\n<h2>Push the button to roll the dice:</h2>\n<p><button id=\"roll\">Roll dice</button></p>\n<p id=\"dice\"></p>\n<p id=\"total\"></p>", "css": "body { font-family: system-ui, sans-serif; } h1 { font-size: 1.4em; } h2 { font-size: 1.05em; } img { padding: 5px; width: 60px; height: 60px; }", "js": "const IMG = 'https://raw.githubusercontent.com/travislindenreid/INF33-Demos/main/W6_L1_AngularServices/solution1/public/';\nconst RIGGED = [{\"die1\":5,\"die2\":2},{\"die1\":4,\"die2\":3},{\"die1\":6,\"die2\":1},{\"die1\":2,\"die2\":5},{\"die1\":1,\"die2\":6},{\"die1\":3,\"die2\":4},{\"die1\":2,\"die2\":5},{\"die1\":1,\"die2\":6},{\"die1\":4,\"die2\":3},{\"die1\":3,\"die2\":4},{\"die1\":6,\"die2\":1},{\"die1\":6,\"die2\":1},{\"die1\":4,\"die2\":3},{\"die1\":1,\"die2\":6},{\"die1\":2,\"die2\":5},{\"die1\":5,\"die2\":2},{\"die1\":4,\"die2\":3},{\"die1\":3,\"die2\":4},{\"die1\":4,\"die2\":3}];  // public/rigged_rolls.json\n\n// RigDiceService (rig-dice.service.ts)\nclass RigDiceService {\n  die1 = []; die2 = []; die1Index = 0; die2Index = 0;\n  constructor() {\n    // stands in for firstValueFrom(this.http.get('rigged_rolls.json')).then(...)\n    Promise.resolve(RIGGED).then(data => {\n      data.forEach(dieRolls => { this.die1.push(dieRolls['die1']); this.die2.push(dieRolls['die2']); });\n      console.log('rigged rolls loaded: ' + data.length);\n    });\n  }\n  rollDie1() { return this.die1[(this.die1Index++) % this.die1.length]; }\n  rollDie2() { return this.die2[(this.die2Index++) % this.die2.length]; }\n}\n\n// DieComponent view: @if(value != 0) { <img src=\"{{value}}.png\"> }\nfunction appDie(value) { return value != 0 ? '<img src=\"' + IMG + value + '.png\">' : ''; }\n\n// AppComponent\nconst rigDice = new RigDiceService();   // constructor(private rigDice:RigDiceService)\nlet die1 = 0, die2 = 0;\nfunction render() {\n  document.getElementById('dice').innerHTML = appDie(die1) + appDie(die2);\n  document.getElementById('total').textContent = (die1 != 0 && die2 != 0) ? 'Your rolled a total of: ' + (die1 + die2) + '.' : '';\n}\nfunction rollDice() {\n  die1 = rigDice.rollDie1();\n  die2 = rigDice.rollDie2();\n  console.log(die1 + ' + ' + die2 + ' = ' + (die1 + die2));\n  render();   // Angular re-renders for you\n}\ndocument.getElementById('roll').addEventListener('click', rollDice);  // (click)=\"rollDice()\"\nrender();\n", "steps": [{"note": "First click: the service returns the first rigged pair.", "js": "setTimeout(() => document.getElementById('roll').click());  // after the JSON has loaded"}, {"note": "Second click: the next pair — still a total of 7.", "js": "setTimeout(() => document.getElementById('roll').click());  // after the JSON has loaded"}, {"note": "Third click: and again 7. Every pair in rigged_rolls.json adds to 7.", "js": "setTimeout(() => document.getElementById('roll').click());  // after the JSON has loaded"}], "height": 270, "interactive": true}
```

结果是 `5 + 2 = 7`、`4 + 3 = 7`、`6 + 1 = 7`，……——**`rigged_rolls.json` 中的每一对点数之和都是 7**，因此骰子的点数看起来是随机的，但总和永远不变。这就是“作弊”（rigging）。

> ⚠️ **易错点**：JSON 是异步加载的。如果 `rollDice()` 在 `.then` 填充数组之前运行，那么 `this.die1.length` 为 0，`index % 0` 得到 `NaN`，`rollDie1()` 返回 `undefined`；而 `undefined != 0` 为 `true`，因此骰子会尝试显示 `undefined.png`，总和则会显示 `NaN`。真正的点击发生在那个很小的文件加载完成之后很久，但在应用启动时就掷骰子的代码会遇到这个问题。

> 🧪 **演示文件**：[rig-dice.service.ts](https://github.com/travislindenreid/INF33-Demos/blob/main/W6_L1_AngularServices/solution1/src/app/rig-dice.service.ts) · [app.component.ts](https://github.com/travislindenreid/INF33-Demos/blob/main/W6_L1_AngularServices/solution1/src/app/app.component.ts) · [app.component.html](https://github.com/travislindenreid/INF33-Demos/blob/main/W6_L1_AngularServices/solution1/src/app/app.component.html) · [die.component.html](https://github.com/travislindenreid/INF33-Demos/blob/main/W6_L1_AngularServices/solution1/src/app/die/die.component.html) · [rigged_rolls.json](https://github.com/travislindenreid/INF33-Demos/blob/main/W6_L1_AngularServices/solution1/public/rigged_rolls.json) · [setup1 app.component.ts](https://github.com/travislindenreid/INF33-Demos/blob/main/W6_L1_AngularServices/setup1/src/app/app.component.ts)

返回 [第 5 节](#5-angular-服务)。

---

## 10. 速查与必记的 5 个要点

**各部分的作用**

| 部分 | 装饰器 / 文件 | 作用 | 如何获得 |
|---|---|---|---|
| 组件 | `@Component({ selector, templateUrl, styleUrls, imports })` | 一个视图（模板 + 样式 + 类） | 在父模板中写入其选择器标签，并把该类加入父组件的 `imports` |
| 模块（较旧的 Angular） | `@NgModule({ imports, exports })` | “包装”组件和配置（在 Angular 19 的独立组件之前） | 例如 A3 的 `AppRoutingModule` |
| 服务 | `@Injectable({ providedIn: 'root' })` | 与视图无关的工作：API 数据、路由信息 | 构造函数参数：`constructor(private s: MyService)` |
| 普通类 | `export class X { }` | 数据处理 | `new X()` |
| 库 | npm 包 | npm 中的任何内容 | `npm install pkg`（+ `@types/pkg`），然后 `import` |

**路由**

| 内容 | 语法 |
|---|---|
| 路由表 | `const routes: Routes = [{ path: 'album/:id', component: AlbumPageComponent }, { path: '', component: HomePageComponent }];` |
| 注册（新 / 旧） | `app.config.ts` 中的 `provideRouter(routes)` / `@NgModule` 中的 `RouterModule.forRoot(routes)` |
| 读取参数 | `constructor(private route: ActivatedRoute)` → `this.route.snapshot.paramMap.get('id')` |

**CLI 与导入**

| 任务 | 命令 / 语法 |
|---|---|
| 安装依赖 / 运行 | `npm install` · `ng serve --open`（localhost:4200） |
| 生成 | `ng generate service [name]` · `ng generate class [name]` |
| 服务中的 HTTP | `app.config.ts` 中的 `provideHttpClient()`；`constructor(private http:HttpClient)` |
| 命名导入与默认导入 | `import { Component } from '@angular/core'` · `import chroma from 'chroma-js'` |
| 你自己的文件 | 相对路径，不带 `.ts`：`import { SpotifyService } from '../../services/spotify.service'` |

**必记的 5 个要点**

1. 与特定视图无关的内容（获取 API 数据、解析 URI）应放入服务，使组件保持轻量。
2. 要使用服务，需导入它，并以带 `private` 的构造函数参数的形式获取——Angular 会创建并注入它；你永远不需要 `new` 一个服务。
3. 路由把 URI 模式映射到组件；路径中的 `:id` 在组件中通过 `this.route.snapshot.paramMap.get('id')` 读取。
4. 只有当某个类位于组件的 `imports` 数组中时，该组件才能使用它（独立组件，Angular 19+）；较旧的代码会把内容包装在 `@NgModule` 中。
5. 在模板中，`[value]="die1"` 把子组件的输入绑定到一个表达式，而 `(click)="rollDice()"` 把事件绑定到一个方法——方括号表示读取，圆括号表示监听。