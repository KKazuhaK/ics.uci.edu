---
title: "Angular 中的组件"
summary: "大型客户端的框架、安装 Angular、模型-视图-控制器（MVC）及 Angular 的实现方式、组件与根组件、插值/属性/事件/双向绑定、@if 与 @for，以及用输入和输出嵌套组件。"
---

# IN4MATX 133: User Interface Software — Lecture 10：Angular 中的组件

## 目录

- [1. 小型与大型客户端界面，以及框架](#1-小型与大型客户端界面以及框架)
- [2. Angular 与安装](#2-angular-与安装)
- [3. Model-View-Controller（模型-视图-控制器）](#3-model-view-controller模型-视图-控制器)
- [4. Angular 中的 MVC：绑定](#4-angular-中的-mvc绑定)
- [5. Angular 组件](#5-angular-组件)
- [6. 根模板与根组件](#6-根模板与根组件)
- [7. 单向绑定：插值、属性、事件](#7-单向绑定插值属性事件)
- [8. 使用 ngModel 的双向绑定](#8-使用-ngmodel-的双向绑定)
- [9. 控制流：@if 与 @for](#9-控制流if-与-for)
- [10. 使用组件：嵌套、输入与输出](#10-使用组件嵌套输入与输出)
- [11. 课堂问题与演示（附解答）](#11-课堂问题与演示附解答)
- [12. 速查与必记的 5 个要点](#12-速查与必记的-5-个要点)

> UCI IN4MATX 133: User Interface Software — Prof. Travis Linden Reid，2026 年秋季学期，周四 10/29（第 5 周）
> 内容整理自 Lecture 10 的幻灯片和 demo 仓库文件夹 `W5_L2_Oct29_AngularComponents`（一个 Angular 项目，`w5l2-example`）。按概念组织，而不是按来源组织。

> 📅 **课程安排**：周五的讨论会更深入地讲解 Angular——如何启动一个 Angular 项目，以及另一个编码演示。（幻灯片上写的是“Friday (2/6)”，这是早先开课遗留的日期，实际指周五 10/30。）
> 请在 Canvas 上于 **周一 11/2** 之前声明你的 A3 搭档。

本讲目标：解释 Model-View-Controller（模型-视图-控制器）架构以及 Angular 如何实现它，描述 Angular 组件的作用，并实现一个遵循 MVC 的 Angular 组件。

> 💡 **关键点**：Angular 无法在这些笔记的演示框中运行（演示框运行的是普通的 HTML/CSS/JS，而 Angular 需要它自己的编译器）。因此下面的演示用**纯 JavaScript 手动重写**了每个 Angular 示例，并加以标注。这恰好能让人看清 Angular 替你做了什么：演示中每一行手动接线，都是某个绑定所替代的内容。Angular 代码本身以代码块的形式展示，文中引用的输出来自使用 Angular 22 构建仓库中的组件。

---

## 1. 小型与大型客户端界面，以及框架

幻灯片对比了两类前端：

| | “小型”客户端（幻灯片 4：你的 A2 Runkeeper 报告） | “大型”客户端（幻灯片 5：Instagram） |
|---|---|---|
| 页面 | 3 个 | 数百个，页面之间有多种导航方式 |
| 页面间的交互 | 无 | 很多 |
| 数据 / UI | 数据是动态的，UI 相对静态 | 重复出现的 UI 组件（状态更新）；每个人看到的内容和链接都不同 |
| 计算 | 每个页面背后有大量计算，但每个页面都是独立的 | — |

![幻灯片 4：“小型”客户端——A2 的 Runkeeper 报告页面（“One week of #RunKeeper Tweets”、About the data）](https://cdn.jsdelivr.net/gh/KKazuhaK/assets@main/ics.uci.edu/in4matx-133/lec-10/small-client-a2.png)

*大型客户端应用该如何开发？*（幻灯片 6）借助**框架**，框架可以：

- 添加结构与组织，
- 使 UI 组件可复用，
- 支持模块化，
- 在需要时导入包、UI 等。

Angular、React、Vue.js（以及“把你最喜欢的其他框架放在这里”）都支持相同的总体目标，并且在工作方式上有很多共通之处。本课程使用 Angular。

## 2. Angular 与安装

Angular（幻灯片 9）：

- 2009 年首次发布，
- 使用 **TypeScript、HTML 和 CSS**（[Lecture 7](lec-07.zh-CN.md) 讲过 TypeScript），
- 不规定服务端使用哪种框架，
- 每年发布一个大版本（demo 仓库的项目使用 Angular CLI 22.2.3）。

安装与运行（幻灯片 10）：

```bash
npm install -g @angular/cli   # the Angular command-line tool, installed globally
ng new example                # create a new app named "example"
cd example
ng serve                      # run it; add --open to open the browser too
```

应用默认运行在 **localhost:4200** 上，并且在你修改源文件时会自动重新加载。`-g` 很重要：与 [Lecture 6](lec-06.zh-CN.md) 中一样，全局安装才能让 `ng` 命令在命令行中可用。

![幻灯片 10：ng new 生成的应用运行在 localhost:4200——带 Angular 标志的 “Hello, test” 和文档链接](https://cdn.jsdelivr.net/gh/KKazuhaK/assets@main/ics.uci.edu/in4matx-133/lec-10/ng-new-default-app.png)

> 🧪 **演示文件**：[w5l2-example/README.md](https://github.com/travislindenreid/INF33-Demos/blob/main/W5_L2_Oct29_AngularComponents/w5l2-example/README.md) · [package.json](https://github.com/travislindenreid/INF33-Demos/blob/main/W5_L2_Oct29_AngularComponents/w5l2-example/package.json)

## 3. Model-View-Controller（模型-视图-控制器）

**MVC** 是一种组织界面背后代码的方法。它把应用拆分为三种角色：

- **模型（Model）** — 应用背后的数据。
  - 数据变化时通知视图。
  - 允许视图查询其数据。
  - 允许控制器操作其数据。
- **视图（View）** — 应用的可视界面。
  - 渲染模型的内容，并规定模型的数据应当如何呈现。
  - 模型变化时，视图必须更新其呈现，方式可以是**推送（push）**（视图等待变化通知——例如实时更新的信息流），也可以是**拉取（pull）**（视图在需要新数据时主动请求——例如下拉刷新）。
  - 把输入转发给控制器。
- **控制器（Controller）** — 与应用的交互。
  - 解释用户输入，并将其映射为动作。
  - 告诉模型要执行哪些动作。
  - *间接地*（通过模型）告诉视图页面是否应当以不同方式渲染。

幻灯片中的图是一个循环：

![幻灯片 12–15：MVC 循环——用户使用控制器，控制器操作模型，模型更新视图，用户看到视图](https://cdn.jsdelivr.net/gh/KKazuhaK/assets@main/ics.uci.edu/in4matx-133/lec-10/mvc-diagram.png)

> ⚠️ **易错点**：控制器自己从不绘制任何东西。它改变模型，而模型的变化才会更新视图。

> 🔗 **延伸阅读**：[Wikipedia: Model–view–controller](https://en.wikipedia.org/wiki/Model%E2%80%93view%E2%80%93controller)

## 4. Angular 中的 MVC：绑定

Angular 如何把 MVC 映射到文件上（幻灯片 16）：

| MVC 角色 | 在 Angular 中 |
|---|---|
| 视图 | HTML 和 CSS |
| 模型与控制器 | TypeScript |
| 三者之间的粘合剂 | Angular 本身 |

![幻灯片 16–17：Angular 中的 MVC——视图（HTML、CSS）和模型通过双向数据绑定与 Angular 相连；控制器（JavaScript、服务）与服务器通信；用户与视图交互](https://cdn.jsdelivr.net/gh/KKazuhaK/assets@main/ics.uci.edu/in4matx-133/lec-10/mvc-in-angular.png)

关键术语是**绑定（binding）**（幻灯片 17）：

- 视图中的变量可以**绑定**到模型或控制器中的变量和函数。
- 模型中的变量变化时，视图中每一处引用它的地方都会随之变化——Angular 使用的是 **“推送”** 模型。
- 视图接收到用户输入时，会把它传递给绑定到该输入的控制器函数。

第 7–8 节展示了四种绑定；[7.4](#74-演示应用中的单向绑定) 中的演示用手动方式把它们接线。

## 5. Angular 组件

**组件（component）** 是一个界面元素——通常比“一个按钮”大，但比“一个页面”小，并且通常会在界面中重复出现。每个组件都定义了该元素的模型、视图和控制器。

组件术语（幻灯片 20）：

- **模板（template）** — 表示视图的 HTML 文件，
- **样式（style）** — 说明组件如何设置样式的 CSS 文件，
- **选择器（selector）** — Angular 用来查找该组件出现在每一处的 CSS 选择器（例如每一个 `<app-week>` 标签）。

用下面的命令创建一个新组件：

```bash
ng generate component hello
```

这会创建一个包含四个文件的文件夹：

| 文件 | 作用 |
|---|---|
| `hello.css` | 视图 |
| `hello.html` | 视图 |
| `hello.spec.ts` | 自动化测试（我们基本会忽略它） |
| `hello.ts` | 模型与控制器 |

每个应用至少有一个组件，即**根（root）组件**——默认是 `app.html` / `app.css` / `app.ts` / `app.spec.ts`。它本质上就是应用的“主”页面。仓库展示了它如何被放到页面上：`index.html` 只包含 `<app-root></app-root>`，而 `main.ts` 使用根类启动应用：

```ts
// src/main.ts (from the repo)
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
```

**构造函数与 `ngOnInit()`（额外幻灯片 54，课上未讲）。** 大多数组件既有构造函数，也有初始化函数；把初始化代码放在 `ngOnInit()` 中，它会稍后运行：

```ts
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-hello',
  templateUrl: './hello.component.html',
  styleUrls: ['./hello.component.css']
})
export class HelloComponent implements OnInit {
  constructor() { }
  ngOnInit() {
  }
}
```

幻灯片的标题把它叫作 `onInit()`，但接口是 `OnInit`，方法必须命名为 `ngOnInit`。“稍后”为什么重要：给每个组件加上 `<app-hello name="Kazuha">`，且其中带有 `@Input() name = ""`，并在两处打印 `name`，会得到 `constructor: name = ''`，然后是 `ngOnInit: name = 'Kazuha'`——构造函数运行时，输入尚未被设置。（幻灯片中的 `hello.component.*` 文件名是较早的 CLI 命名；当前 CLI 生成的是 `hello.html`、`hello.ts`。）

> 🔗 **延伸阅读**：[Stack Overflow: Difference between constructor and ngOnInit](https://stackoverflow.com/questions/35763730/difference-between-constructor-and-ngoninit)

## 6. 根模板与根组件

幻灯片 23（“Hello Angular”）展示了正在运行的演示应用：番茄猫图片、**"Hello, INF 133"**、“Congratulations! Your app is running. 🎉”，右侧是三个链接胶囊（INF 133 Canvas、INF 133 Slack、Angular tutorials），以及 GitHub / X / YouTube 图标。

![幻灯片 23：运行中的演示应用——番茄猫、“Hello, INF 133”、“Congratulations! Your app is running.”，以及 Canvas / Slack / Angular tutorials 链接](https://cdn.jsdelivr.net/gh/KKazuhaK/assets@main/ics.uci.edu/in4matx-133/lec-10/hello-angular.png)

### 6.1 根模板：app.html

根模板看起来与任何其他 HTML 页面一样；唯一的区别是它可以使用**数据绑定**：

```html
<div class=“left-side”>
  <img src="tomatoCat.png" alt="tomato cat" width="200px">
  <h1>
    Hello, {{title}}!
  </h1>
  <p>Congratulations! Your app is running. 🎉</p>
</div>
```

`{{title}}` 把这段文字绑定到变量 `title`。（幻灯片的排版错误：`class=“left-side”` 使用了弯引号——应写成 `class="left-side"`。）

### 6.2 根组件：app.ts

```ts
import { Component } from '@angular/core';    // import Angular's component library

@Component({                                  // designates the class as a component
  selector: 'app-root',                       // replace all occurrences of <app-root> with this
  templateUrl: './app.html',                  // designate the template
  styleUrls: ['./app.css']                    // designate the style(s)
})
export class App {                            // all code for the component
  title = 'example';
}
```

幻灯片 27 画出了箭头：`app.html` 中的 `{{title}}` ↔ `app.ts` 中的 `title = 'example'`，因此页面显示 “Hello, example!”。

仓库中的 `app.ts`（生成 “Hello, INF 133” 的版本）有两处不同，值得留意：

```ts
@Component({
  imports: [FormsModule, RouterOutlet, Week, Dice],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  title = "INF 133";
  // ...
}
```

- `styleUrl`（一个文件，字符串）对比幻灯片中的 `styleUrls`（数组）——两者都可以接受。
- `imports: [...]` 列出了模板中用到的、不是纯 HTML 的内容：用于 `ngModel` 的 `FormsModule`（第 8 节），以及子组件 `Week` 和 `Dice`（第 10 节）。

> 🧪 **演示文件**：[app.html](https://github.com/travislindenreid/INF33-Demos/blob/main/W5_L2_Oct29_AngularComponents/w5l2-example/src/app/app.html) · [app.ts](https://github.com/travislindenreid/INF33-Demos/blob/main/W5_L2_Oct29_AngularComponents/w5l2-example/src/app/app.ts) · [main.ts](https://github.com/travislindenreid/INF33-Demos/blob/main/W5_L2_Oct29_AngularComponents/w5l2-example/src/main.ts) · [index.html](https://github.com/travislindenreid/INF33-Demos/blob/main/W5_L2_Oct29_AngularComponents/w5l2-example/src/index.html)

## 7. 单向绑定：插值、属性、事件

共有四种绑定（幻灯片 28）：

| 绑定 | 语法 |
|---|---|
| 插值 | `{{ }}` |
| 属性 | `[ ]` |
| 事件 | `( )` |
| 双向 | `[( )]` |

### 7.1 插值绑定 {{ }}

插值把计算得到的字符串“编织”进 HTML 元素标签之间的文本以及属性赋值之中。它还会计算表达式：

```html
<h1>
  Hello, {{title}}
</h1>

<!-- "The sum of 1 + 1 is 2" -->
<p>The sum of 1 + 1 is {{1 + 1}}</p>
```

### 7.2 属性绑定 [ ]

把元素属性设置为组件属性的值。属性名外的方括号表示：引号中的值是一个 TypeScript 表达式，而不是字符串：

```html
<img [src]=“tomatoCatUrl">
```

在 `app.ts` 中设置 `tomatoCatUrl = "tomatoCat.png"` 后，这会显示番茄猫（幻灯片 30）。如果没有方括号，`src="tomatoCatUrl"` 会请求一个名字就叫 `tomatoCatUrl` 的文件。（幻灯片的排版错误：开头的 `“` 是弯引号。）

### 7.3 事件绑定 ( )

监听按键、鼠标移动、点击和触摸等事件。事件名外的圆括号表示：事件触发时运行引号中的语句：

```html
<!--When clicked, will run the onSave() function in
component.ts file-->
<button (click)=“onSave()">Save</button>
```

事件名就是 DOM 的事件名（`click`、`input`……即你在 [Lecture 6](lec-06.zh-CN.md) 中传给 `addEventListener` 的那些），而语句中包含调用括号 `onSave()`。

### 7.4 演示应用中的单向绑定

插值、属性和事件绑定都是**单向的**（只读）：

| 数据方向 | 语法（幻灯片 32 的表格） |
|---|---|
| 单向，数据源（`.ts`）→ 视图目标（`.html`） | `{{expression}}`、`[target]="expression"`、`bind-target="expression"` |
| 单向，视图目标（`.html`）→ 数据源（`.ts`） | `(target)="statement"`、`on-target="statement"` |
| 双向 | `[(target)]="expression"`、`bindon-target="expression"` |

幻灯片 33 把演示应用中的三种单向绑定连接在一起：

```html
<!-- app.html -->
{{title}}
<img [src]="tomatoCatUrl">
<button (click)="clickExample()">Click me and read the console!</button>
```

```ts
// app.ts
@Component({
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html'
})
export class App {
  title = 'INF 133';
  tomatoCatUrl = "tomatoCat.png";
  clickExample() {
    console.log("clicked button!");
  }
}
```

`{{title}}` → `title`，`[src]` → `tomatoCatUrl`，`(click)` → `clickExample()`。点击按钮会记录 `clicked button!`。（幻灯片的代码全程使用弯引号；上面的代码是仓库中的版本。）

![幻灯片 33：箭头把 app.html 中的 {{title}}、[src]="tomatoCatUrl"、(click)="clickExample()" 分别连到 app.ts 中的 title、tomatoCatUrl、clickExample()](https://cdn.jsdelivr.net/gh/KKazuhaK/assets@main/ics.uci.edu/in4matx-133/lec-10/one-way-binding-arrows.png)

下面试一下：同一个页面，模型 / 视图 / 控制器的接线全部手写出来。可以逐步查看，或编辑后点击 Run：

```viz web-demo
{"title": "幻灯片 29–38 · app.html 的四种绑定，用纯 JavaScript 手动接线（Angular 会替你完成这些接线）", "html": "<p><b>Property binding:</b></p>\n<img id=\"cat\" alt=\"tomato cat\" width=\"120\">\n<h1 id=\"hello\"></h1>\n<p><b>Interpolation with math:</b> <span id=\"sum\"></span></p>\n<p><b>Event binding:</b> <button id=\"btn\">Click me and read the console...</button></p>\n<p><b>Two-way binding:</b> <input id=\"box\"></p>", "css": "body { font-family: system-ui, sans-serif; } h1 { margin: 4px 0; }", "js": "// MODEL: the data (the fields of class App in app.ts)\nconst model = { title: \"INF 133\", tomatoCatUrl: \"https://raw.githubusercontent.com/travislindenreid/INF33-Demos/main/W5_L2_Oct29_AngularComponents/w5l2-example/public/tomatoCat.png\", enteredText: \"placeholder\" };\n\n// VIEW: render the model (what {{ }} and [ ] do)\nfunction render() {\n  document.getElementById(\"hello\").textContent = \"Hello, \" + model.title;   // {{title}}\n  document.getElementById(\"sum\").textContent = \"The sum of 1 + 1 is \" + (1 + 1); // {{1 + 1}}\n  document.getElementById(\"cat\").src = model.tomatoCatUrl;                    // [src]=\"tomatoCatUrl\"\n  document.getElementById(\"box\").value = model.enteredText;                   // [(ngModel)] model -> view\n}\n\n// CONTROLLER: map user input to actions (what ( ) does)\nfunction clickExample() { console.log(\"clicked button!\"); }\nfunction textChanged() { console.log(\"you wrote: \" + model.enteredText); }\ndocument.getElementById(\"btn\").addEventListener(\"click\", clickExample);     // (click)=\"clickExample()\"\ndocument.getElementById(\"box\").addEventListener(\"input\", (e) => {\n  model.enteredText = e.target.value;                                         // [(ngModel)] view -> model\n  textChanged();                                                              // (input)=\"textChanged()\"\n});\n\nrender();\n", "steps": [{"note": "事件绑定：点击会运行控制器函数（视图 → .ts）。", "js": "document.getElementById(\"btn\").click();"}, {"note": "双向绑定，视图 → 模型：输入会更新 enteredText，然后 (input) 将其记录下来。", "js": "const box = document.getElementById(\"box\");\nbox.value = \"abc\";\nbox.dispatchEvent(new Event(\"input\"));"}, {"note": "模型 → 视图（“推送”）：修改模型，视图中每一处绑定都会随之更新。", "js": "model.title = \"IN4MATX 133\";\nmodel.enteredText = \"set from the model\";\nrender();\nconsole.log(\"title is now \" + model.title);"}], "height": 330, "interactive": true}
```

控制台会显示 `clicked button!`，然后是 `you wrote: abc`，最后是 `title is now IN4MATX 133`，同时标题变为 “Hello, IN4MATX 133”。在 Angular 中，最后那个 `render()` 调用并不存在：修改 `this.title` 就足够了。

> ⚠️ **易错点**：方括号决定方向。`[x]` 从 `.ts` **读取**到页面中；`(x)` 把事件**发送**给 `.ts`。因此 `(href)="url"` 是一个监听名为 “href” 事件的事件监听器——它永远不会设置链接。这正是 [问题 1](#111-问题-1哪一项可以把链接的-href-绑定到-url幻灯片-3436) 中的陷阱。

> 📝 **练习**：[问题 1](#111-问题-1哪一项可以把链接的-href-绑定到-url幻灯片-3436)

> 🔗 **延伸阅读**：[Angular: Templates](https://angular.dev/guide/templates) · [Angular: Binding](https://angular.dev/guide/templates/binding) · [Angular: Event listeners](https://angular.dev/guide/templates/event-listeners) · [MDN: click event](https://developer.mozilla.org/en-US/docs/Web/API/Element/click_event)

## 8. 使用 ngModel 的双向绑定

“你通常既想显示一个数据属性，又想在用户做出修改时更新该属性。”最常见的用途是绑定到用户输入。**`ngModel` 指令**启用输入框的双向绑定，写法是带有“盒中香蕉”（banana in a box）括号的 `[( )]`：

```html
<!--enteredText variable contains inputted text-->
<!--textChanged() is called after every keystroke-->
<input [(ngModel)]="enteredText" (input)=“textChanged()">
```

在仓库的 `app.ts` 中：

```ts
enteredText = "placeholder";

textChanged () {
  console.log("you wrote: " + this.enteredText);
}
```

输入框一开始显示 `placeholder`（模型 → 视图）；输入会替换 `enteredText`（视图 → 模型），然后 `(input)` 事件绑定会把它记录下来——在清空的输入框中输入 `abc`，会记录 `you wrote: abc`。要使用 `ngModel`，组件的 `imports` 中必须有 `FormsModule`（仓库的 `app.ts` 中有：`import {FormsModule} from '@angular/forms';`）。

幻灯片 38 汇集了所有绑定：

```html
<!--enteredText variable contains inputted text-->
<!--textChanged() is called after every keystroke-->
<input [(ngModel)]="enteredText" (input)=“textChanged()">
<!--When clicked, will run the onSave() function in app.ts file-->
<button (click)=“clickExample()">Click me and read the console…</button>
<h3>
  <!--will display the title-->
  {{title}}
  <!--will display the image at tomatoCatUrl—>
  <img [src]="tomatoCatUrl">
</h3>
```

> ⚠️ **易错点**：幻灯片 38 最后一条注释以破折号 `—>` 结尾，而不是 `-->`，因此注释永远不会闭合。Angular 会拒绝编译该模板（“Unexpected character "EOF"”）；在普通 HTML 页面中，它会悄悄隐藏直到下一个 `-->` 之前的所有内容。另外：注释写的是 `onSave()`，但按钮调用的是 `clickExample()`，并且有两个属性使用了弯引号。

第 [7.4 节的演示](#74-演示应用中的单向绑定) 中的双向步骤展示了两个方向。

> 🔗 **延伸阅读**：[Angular: Two-way binding](https://angular.dev/guide/templates/two-way-binding) · [MDN: change event](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/change_event)

## 9. 控制流：@if 与 @for

模板可以用 `@if` 和 `@for` 决定*是否*渲染某物，以及*渲染多少次*——条件使用圆括号，被包含的内容使用花括号。它们在 2024 年取代了 `*ngIf` 和 `*ngFor`——网上较旧的示例仍在使用旧语法。

### 9.1 @if

仅当条件为真时才渲染标签：

```html
@if(isHalloween()) {
  <p>
    It’s Halloween!!!
  </p>
} @else {
  <p>
    Just another regular ole day…
  </p>
}
```

条件调用了仓库 `app.ts` 中的控制器函数（月份从 0 开始计数，因此 9 表示十月）：

```ts
isHalloween () {
  const today = new Date();
  if(today.getMonth() == 9 && today.getDate() == 31)
  {
    return true;
  }
  return false;
}
```

在上课当天（10/29），页面显示 “Just another regular ole day...”（幻灯片 40 的截图）。

![幻灯片 40：@if / @else 模板及其输出 “Just another regular ole day...”](https://cdn.jsdelivr.net/gh/KKazuhaK/assets@main/ics.uci.edu/in4matx-133/lec-10/if-example.png)

### 9.2 @for

为数组中的每个元素重复渲染一次：

```ts
// In app.ts
days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
```

```html
<ul>
  @for(day of days; track day) {
    <li>
      {{day}}
    </li>
  }
</ul>
```

- `track` 用于性能优化：它应当是每个项目的唯一属性，这样当数组变化时，Angular 才能区分各个项目。
- 你可以选择用 `let i = $index` 获取索引：

```html
<ul>
  @for(day of days; track day; let i = $index) {
    <li>
      {{i+1}}: {{day}}
    </li>
  }
</ul>
```

第一个渲染 Sunday … Saturday；第二个渲染 “1: Sunday” … “7: Saturday”。它就是 Python 中 `for i, day in enumerate(days)` 的模板版本。仓库的 `app.html` 还循环遍历一个内联的对象数组，并使用 `track item.title` 来生成页面右侧的三个链接胶囊。

![幻灯片 41：两个 @for 模板及其输出——Sunday … Saturday，以及 1: Sunday … 7: Saturday](https://cdn.jsdelivr.net/gh/KKazuhaK/assets@main/ics.uci.edu/in4matx-133/lec-10/for-example.png)

> 🔗 **延伸阅读**：[angular.love: Diving into the new Angular control flow](https://angular.love/diving-into-the-new-angular-control-flow-internals) · [Angular: @if](https://angular.dev/api/core/@if) · [Angular: @for](https://angular.dev/api/core/@for)

## 10. 使用组件：嵌套、输入与输出

### 10.1 嵌套组件

组件可以包含其他组件：把子组件的**选择器**（在其 `.ts` 中定义）放入父组件的模板中。在 `app.html` 中：

```html
<div>
  <p class=“exampleTitle”>
    Component nesting example:
  </h1>
  <app-week></app-week>
</div>
```

（幻灯片的错误：`<p>` 却用 `</h1>` 关闭，且 class 使用了弯引号——仓库中是 `<p class="exampleTitle">Component nesting example:</p>`。）父组件还必须在其 `imports` 中列出子组件的类（仓库的 `app.ts` 中为 `imports: [FormsModule, RouterOutlet, Week, Dice]`）。

### 10.2 输入

组件可以声明**输入（inputs）**——即父组件传入的值。下面是 `week.ts` 和 `week.html`（仓库中的版本，与幻灯片 43 一致）：

```ts
import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-week',
  styleUrl: '../app.css',
  templateUrl: './week.html',
})
export class Week {
    @Input() today:string = "";
    days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
}
```

```html
<ul>
    @for(day of days; track day){
        <li>
            {{day}}
            @if(day == today) {
                <strong>Today!</strong>
            }
        </li>
    }
</ul>
```

![幻灯片 43：week.ts 中的 @Input() today（标注为 Input），以及 week.html 中在 @if(day == today) 里引用 today](https://cdn.jsdelivr.net/gh/KKazuhaK/assets@main/ics.uci.edu/in4matx-133/lec-10/week-input.png)

`@Input()` 把 `today` 标记为输入；模板像使用其他字段一样使用它。父组件传入它（幻灯片 44）：

- **如果是动态的，使用属性绑定**：`<app-week [today]="dayOfWeek()"></app-week>` —— `dayOfWeek()` 是 `App` 中的函数；
- **如果是静态值，则像任何其他属性一样**：`<app-week today="Friday"></app-week>`。

```ts
// app.ts
dayOfWeek():string {
  const day = new Date().getDay();
  return ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][day];
}
```

两者都会渲染七天，并在匹配的那一天后面显示 **Today!**。（幻灯片 44 的错误：它用 `</app-day>` 关闭 `<app-week>`，且其标签写的是 “Sets day property”——输入实际名为 `today`。）

![幻灯片 44：传入输入——today="Friday" 设置静态值；[today]="dayOfWeek()" 绑定到 App 的函数](https://cdn.jsdelivr.net/gh/KKazuhaK/assets@main/ics.uci.edu/in4matx-133/lec-10/week-input-passing.png)

试一下——把 Week 组件写成一个普通 JS 函数，其参数扮演 `@Input() today` 的角色：

```viz web-demo
{"title": "幻灯片 41–44 · week.html 的 @for + @if，以及 today 输入，用纯 JavaScript 手动实现", "html": "<p><b>today=\"Friday\" (static):</b></p>\n<div id=\"static\"></div>\n<p><b>[today]=\"dayOfWeek()\" (bound):</b></p>\n<div id=\"bound\"></div>", "css": "body { font-family: system-ui, sans-serif; } ul { margin: 2px 0 8px; }", "js": "const days = [\"Sunday\", \"Monday\", \"Tuesday\", \"Wednesday\", \"Thursday\", \"Friday\", \"Saturday\"];\n\n// The Week component: today is its @Input()\nfunction appWeek(today) {\n  const ul = document.createElement(\"ul\");\n  for (const day of days) {                       // @for(day of days; track day)\n    const li = document.createElement(\"li\");\n    li.textContent = day + \" \";                  // {{day}}\n    if (day == today) {                           // @if(day == today)\n      li.insertAdjacentHTML(\"beforeend\", \"<strong>Today!</strong>\");\n    }\n    ul.append(li);\n  }\n  return ul;\n}\n\nfunction dayOfWeek() {                            // from App in app.ts\n  return days[new Date().getDay()];\n}\n\ndocument.getElementById(\"static\").append(appWeek(\"Friday\"));\ndocument.getElementById(\"bound\").append(appWeek(dayOfWeek()));\nconsole.log(\"dayOfWeek() = \" + dayOfWeek());\n", "height": 400, "interactive": true}
```

静态列表总是标出 Friday；绑定的列表会标出你打开页面的那一天（控制台会打印出来）。

> ⚠️ **易错点**：`today="Friday"` 传入的是*字符串* `"Friday"`；`[today]="Friday"` 则会去父组件中寻找名为 `Friday` 的字段。只有当值是表达式时才使用方括号。

### 10.3 输出（额外幻灯片 53，课上未讲）

组件还可以声明**输出属性（output properties）**——即向父组件发送的事件：

```ts
@Output('myClick') clicks = new EventEmitter<string>();
```

父组件使用事件绑定进行监听，处理函数运行在**父**组件中：

```html
<app-button (myClick)="clickMessage">click with myClick</app-button>
```

```ts
clickMessage() {
  console.log("clicked!");
}
```

幻灯片的错误：语句必须调用函数，即 `(myClick)="clickMessage()"`。若使用幻灯片中的 `"clickMessage"`（不带圆括号），子组件发出事件时不会记录任何内容；使用 `clickMessage()` 则会记录 `clicked!`。输入是从父到子，输出是从子到父。

> 📝 **练习**：[问题 2](#112-问题-2用组件改进你的作品集幻灯片-4547) · [演示：掷骰子](#113-演示掷骰子幻灯片-48--dicets--dicefinishedtxt)

> 🧪 **演示文件**：[week.ts](https://github.com/travislindenreid/INF33-Demos/blob/main/W5_L2_Oct29_AngularComponents/w5l2-example/src/app/week/week.ts) · [week.html](https://github.com/travislindenreid/INF33-Demos/blob/main/W5_L2_Oct29_AngularComponents/w5l2-example/src/app/week/week.html)

---

## 11. 课堂问题与演示（附解答）

### 11.1 问题 1：哪一项可以把链接的 href 绑定到 url？（幻灯片 34–36）

*哪一项可以把链接的 `href` 绑定到变量 `url`？*

- A. `<a href=“{{url}}”>link</a>`
- B. `<a (href)=“url”>link</a>`
- C. `<a [href]=“url”>link</a>`
- D. A 和 B
- E. A 和 C

> ✍️ **先自己试一试。**

**答案：E（A 和 C）。** 幻灯片没有显示投票结果；这是通过在 Angular 22 中、用 `url = "https://example.com/page"` 编译这三个链接（使用直引号）验证的：

| 选项 | 结果 `href` |
|---|---|
| A `href="{{url}}"` | `https://example.com/page` ✅ —— 插值在属性值中同样有效（“在属性赋值之中”，幻灯片 29） |
| B `(href)="url"` | 无 ❌ —— 这是一个*事件*绑定，监听名为 href 的事件；它从不设置任何东西 |
| C `[href]="url"` | `https://example.com/page` ✅ —— 属性绑定 |

所以 D 因为 B 而错误。仓库的 `app.html` 在链接胶囊中使用的是写法 C：`[href]="item.link"`。（幻灯片上的弯引号会让浏览器把 `“` 当作值的一部分——务必输入直引号。）返回 [第 7 节](#7-单向绑定插值属性事件)。

### 11.2 问题 2：用组件改进你的作品集（幻灯片 45–47）

*与搭档一起讨论一个想法：如何用 Angular 组件改进你的作品集网站。*

> ✍️ **先自己试一试。**

**幻灯片给出的示例答案**：一个旧的课程网站（链接见下），其整个站点都在一个 Angular 组件中，而页眉、正文和页脚各自是独立的组件——这使得复用页眉和页脚内容变得很容易。对于 A1 风格的作品集，同样的思路适用于任何重复出现的内容：每个页面都使用的页眉/导航和页脚，或是带有输入（标题、图片、链接）的项目卡片组件，并用 `@for` 为每个项目渲染一次。返回 [第 10 节](#10-使用组件嵌套输入与输出)。

> 🔗 **延伸阅读**：[Example: an earlier IN4MATX 133 course website built with Angular](https://inf133-wi26.depstein.net/)

### 11.3 演示：掷骰子（幻灯片 48 · dice.ts → diceFinished.txt）

**任务**：在演示应用中制作一个 `Dice` 组件，显示两个骰子和一个按钮；点击按钮会同时掷两个骰子并显示总和。幻灯片 48 展示了结果：“Hello!”、一个 “Click to roll the dice!” 按钮、两张骰子图片，以及 “Total: 8”。

![幻灯片 48：完成后的 Dice 组件——“Hello!”、掷骰按钮、两个骰子（5 和 6）以及 “Total: 8”](https://cdn.jsdelivr.net/gh/KKazuhaK/assets@main/ics.uci.edu/in4matx-133/lec-10/rolling-dice.png)

起始代码（`src/app/dice/`，由 `ng generate component dice` 生成）：`dice.html` 是 `<p>TODO: this!</p>`，类是空的：

```ts
import { Component } from '@angular/core';

@Component({
  imports: [],
  selector: 'app-dice',
  styleUrl: './dice.css',
  templateUrl: './dice.html',
})
export class Dice {

}
```

应用已经放置了它：`app.html` 中有 `<app-dice></app-dice>`，且 `app.ts` 导入了 `Dice`。图片 `dice_1.png` … `dice_6.png` 位于项目的 `public/` 文件夹中。

> ✍️ **先自己试一试。**

**解答**（来自 `diceFinished.txt`）。模型 + 控制器，即 `dice.ts`：

```ts
export class Dice {
    diceUrl1 = "dice_1.png";
    diceUrl2 = "dice_1.png";
    total = 2;

    rollDice () {
        var random = Math.floor(Math.random() * 6 + 1);
        this.diceUrl1 = `dice_${random}.png`;

        var random2 = Math.floor(Math.random() * 6 + 1);
        this.diceUrl2 = `dice_${random2}.png`;

        this.total = random + random2;

        console.log(this.diceUrl1);
        console.log(this.diceUrl2);
        console.log(this.total);
    }
}
```

视图，即 `dice.html`：

```html
<p>Hello!</p>
<button (click)="rollDice()">Click to roll the dice!</button>
<p><img [src]="diceUrl1" width="100px"><img [src]="diceUrl2" width="100px"></p>
<p>Total: {{total}}</p>
```

今天课上的每种绑定都出现了：`(click)` 把点击发送给控制器，`rollDice()` 更新模型（`this.diceUrl1`、`this.total`——注意是 `this.`，这与模板中不同），而 `[src]` / `{{total}}` 把新值推送到视图。每次点击会记录三行，例如 `dice_5.png`、`dice_3.png`、`8`。`Math.floor(Math.random() * 6 + 1)` 会得到 1–6 之间的整数（类似于 Python 的 `random.randint(1, 6)`）。

`diceFinished.txt` 标注的是 `diceComponent.cs`，并指向 `templateUrl: './dice.component.html'` 和 `styleUrl: '../app.css'`；本项目中生成的文件是 `dice.html` 和 `dice.css`，因此保留起始代码中的 `@Component({...})`，只粘贴类的主体部分即可。

用纯 JS 手动实现的同一个组件——按 Next 掷骰子：

```viz web-demo
{"title": "幻灯片 48 · 完成的 Dice 组件（diceFinished.txt），用纯 JavaScript 手动实现", "html": "<p>Hello!</p>\n<button id=\"roll\">Click to roll the dice!</button>\n<p><img id=\"d1\" width=\"100\"><img id=\"d2\" width=\"100\"></p>\n<p id=\"total\"></p>", "css": "body { font-family: system-ui, sans-serif; }", "js": "const IMG = \"https://raw.githubusercontent.com/travislindenreid/INF33-Demos/main/W5_L2_Oct29_AngularComponents/w5l2-example/public/\";  // the repo's public/ folder\n// model (fields of class Dice)\nlet diceUrl1 = \"dice_1.png\";\nlet diceUrl2 = \"dice_1.png\";\nlet total = 2;\n\n// view: [src]=\"diceUrl1\", [src]=\"diceUrl2\", Total: {{total}}\nfunction render() {\n  document.getElementById(\"d1\").src = IMG + diceUrl1;\n  document.getElementById(\"d2\").src = IMG + diceUrl2;\n  document.getElementById(\"total\").textContent = \"Total: \" + total;\n}\n\n// controller: (click)=\"rollDice()\"\nfunction rollDice() {\n  var random = Math.floor(Math.random() * 6 + 1);\n  diceUrl1 = `dice_${random}.png`;\n  var random2 = Math.floor(Math.random() * 6 + 1);\n  diceUrl2 = `dice_${random2}.png`;\n  total = random + random2;\n  console.log(diceUrl1);\n  console.log(diceUrl2);\n  console.log(total);\n  render();  // Angular re-renders for you; by hand we must call it\n}\ndocument.getElementById(\"roll\").addEventListener(\"click\", rollDice);\nrender();\n", "steps": [{"note": "点击按钮：rollDice() 随机选取两个点数并更新模型，视图随之变化。", "js": "document.getElementById(\"roll\").click();"}], "height": 230, "interactive": true}
```

> 🧪 **演示文件**：[dice.ts](https://github.com/travislindenreid/INF33-Demos/blob/main/W5_L2_Oct29_AngularComponents/w5l2-example/src/app/dice/dice.ts) · [dice.html](https://github.com/travislindenreid/INF33-Demos/blob/main/W5_L2_Oct29_AngularComponents/w5l2-example/src/app/dice/dice.html) · [diceFinished.txt](https://github.com/travislindenreid/INF33-Demos/blob/main/W5_L2_Oct29_AngularComponents/w5l2-example/src/app/dice/diceFinished.txt)

返回 [第 10 节](#10-使用组件嵌套输入与输出)。

---

## 12. 速查与必记的 5 个要点

**Angular 中的 MVC**

| 角色 | 作用 | Angular 文件 |
|---|---|---|
| 模型 | 数据；数据变化时通知视图 | `.ts`（类字段） |
| 视图 | 渲染模型；转发输入 | `.html` + `.css` |
| 控制器 | 把用户输入映射为对模型的动作 | `.ts`（类方法） |

**绑定与控制流**

| 语法 | 名称 | 方向 | 示例 |
|---|---|---|---|
| `{{expr}}` | 插值 | `.ts` → `.html` | `Hello, {{title}}` |
| `[prop]="expr"` | 属性 | `.ts` → `.html` | `[src]="tomatoCatUrl"` |
| `(event)="stmt()"` | 事件 | `.html` → `.ts` | `(click)="clickExample()"` |
| `[(ngModel)]="field"` | 双向 | 双向 | `[(ngModel)]="enteredText"`（需要 `FormsModule`） |
| `@if(cond) { } @else { }` | 条件 | — | `@if(isHalloween())` |
| `@for(x of xs; track x; let i = $index) { }` | 循环 | — | `@for(day of days; track day)` |

**组件与 CLI**

| 内容 | 语法 |
|---|---|
| 安装 CLI / 新建应用 / 运行 | `npm install -g @angular/cli` · `ng new example` · `ng serve`（localhost:4200） |
| 新建组件 | `ng generate component hello` → `hello.html`、`hello.css`、`hello.ts`、`hello.spec.ts` |
| 组件元数据 | `@Component({ selector, templateUrl, styleUrl(s), imports })` |
| 使用子组件 | 模板中写 `<app-week>`，并在 `imports` 中加入 `Week` |
| 输入（父 → 子） | `@Input() today = "";` · `<app-week today="Friday">` / `[today]="dayOfWeek()"` |
| 输出（子 → 父） | `@Output('myClick') clicks = new EventEmitter<string>();` · `(myClick)="clickMessage()"` |
| 初始化代码 | `ngOnInit()`（在输入设置之后运行），而不是构造函数 |

**必记的 5 个要点**

1. MVC：控制器改变模型，模型更新视图；在 Angular 中，视图是 `.html`/`.css`，模型与控制器则是 `.ts` 类。
2. 方括号从 `.ts` 读取（`[src]`），圆括号把事件发送给 `.ts`（`(click)`），两者同时使用即为双向（`[(ngModel)]`）——因此 `(href)="url"` 什么也不绑定。
3. `{{ }}` 既可用于文本，也可用于属性值之中，并且会计算表达式（`{{1 + 1}}` → 2）。
4. 组件 = 选择器 + 模板 + 样式 + 类；要使用它，在父组件中写入其选择器标签，并把它的类加入父组件的 `imports`。
5. 输入：静态值以普通属性传入（`today="Friday"`），动态值放在方括号中（`[today]="dayOfWeek()"`）；`@for` 需要 `track`，且 `@if`/`@for` 取代了 `*ngIf`/`*ngFor`。
