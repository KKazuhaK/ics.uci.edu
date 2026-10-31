# IN4MATX 133: User Interface Software — Lecture 7：TypeScript 与数据可视化工具

## 目录

- [1. 什么是 TypeScript](#1-什么是-typescript)
- [2. 类型](#2-类型)
- [3. 类、接口与继承](#3-类接口与继承)
- [4. tsconfig.json 与声明文件](#4-tsconfigjson-与声明文件)
- [5. 优点、缺点与其他转译器](#5-优点缺点与其他转译器)
- [6. 交互式软件与 UI 工具](#6-交互式软件与-ui-工具)
- [7. 评估工具：门槛与天花板](#7-评估工具门槛与天花板)
- [8. 可视化工具与声明式语言](#8-可视化工具与声明式语言)
- [9. Vega-Lite：图形语法](#9-vega-lite图形语法)
- [10. 在 Vega-Lite 中构建直方图](#10-在-vega-lite-中构建直方图)
- [11. 合理的默认值及其覆盖](#11-合理的默认值及其覆盖)
- [12. 课堂问题与演示（附解答）](#12-课堂问题与演示附解答)
- [13. 速查与必记的 5 个要点](#13-速查与必记的-5-个要点)

> UCI IN4MATX 133: User Interface Software — Prof. Travis Linden Reid，2026 年秋季学期，周四 10/15
> 内容整理自 Lecture 7 的幻灯片（共 78 页）和 demo 仓库文件夹 `W3_L2_Oct15_TypeScript_VegaLite`。按概念组织，而不是按来源组织。

> 📅 **课程安排**：本讲是 A2 所需的最后一部分内容；周五的 discussion 会有更深入的 Vega-Lite 演示。
> 加分幻灯片 p70–78（更多 TypeScript 内容）已并入第 2–4 节，并标注为“（加分幻灯片）”。

---

## 1. 什么是 TypeScript

**安装**（全局 npm 包，见 [Lecture 6](lec-06.zh-CN.md#11-npm)）：

```bash
npm install -g typescript   # installs tsc, the TypeScript transpiler
```

也可以通过 Homebrew（Mac）或 Chocolatey（PC）安装。

**关于 TypeScript**（幻灯片 6–7）：

- **Microsoft，2012 年**；最初只支持 Visual Studio，现在支持 Eclipse、Sublime、WebStorm、Atom 等。最新版本：TypeScript 7.0（2026 年 7 月）。
- 为 JavaScript 增加了**静态类型、类型检查和对象**，且这些都是**可选的**。
- **转译**（transpile，也叫“transcompile”）成 JavaScript：`tsc` 把 TS 转换成等价的 JS；浏览器只运行 JS。
- 是 **JavaScript 的严格超集**：合法的 JS 就是合法的 TS，所以 TS 可以使用流行的 JS 库。

类型在编译期检查（和 C++ 一样），之后被**擦除**：`.js` 里不会留下任何类型。

> 🔗 **延伸阅读**：[TypeScript: Download](https://www.typescriptlang.org/download)

---

## 2. 类型

### 2.1 标注变量与转译

`hello.ts` 在冒号后写类型：

```ts
var courseNumber:number = 133;
console.log('Hello, IN4MATX ' + courseNumber + '!');
```

`tsc hello.ts` 生成 `hello.js`，类型标注消失：

```js
var courseNumber = 133;
console.log('Hello, IN4MATX ' + courseNumber + '!');
```

会输出 `Hello, IN4MATX 133!`（现在的 tsc 还会额外加上 `"use strict";`）。（幻灯片的 bug：`hello.js` 末尾是 `‘!');`，用了弯引号，是语法错误 → 应为 `'!'`。）

**预定义类型**（幻灯片 9）：`number`、`boolean`、`string`、`void`（通常用作函数返回类型）、`null`、`undefined`、`any`。

**类型是可选的。**下面两种写法都能初始化 `courseNum`：

```ts
var courseNum:any = 133;
var courseNum = 133;
console.log('Hello, IN4MATX ' + courseNum + '!');
```

这是两种备选写法（`lecture.ts` 里把其中一个注释掉了）；放在一起会冲突，因为第二个会**推断**为 `number`。（幻灯片的 bug：同样的弯引号，`‘!'`。）

### 2.2 带类型的函数与错误检查

函数可以指定**参数类型和返回类型**：

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

两者都返回 `I'm a square of area 225 cm^2.`；`area2` 之所以“更好”，是因为它连返回值和局部变量的类型也写明了。

**类型让错误检查成为可能**（幻灯片 12）：参数顺序写反了：

```ts
document.body.innerHTML = area2(15, 15, 'square');
```

tsc 报错：`error TS2345: Argument of type 'number' is not assignable to parameter of type 'string'.`（幻灯片上写的是 `type '15'`；在 `lecture.ts` 中被注释掉了。）

演示（tsc 输出的 JS）：第 1 步的错误调用会悄悄地运行，输出 `I'm a 15 of area NaN cm^2.`

```viz web-demo
{"title": "Slides 11–12 · the JavaScript tsc emits for area2 (the browser runs JS, not TS)", "interactive": true, "html": "<p>See the console.</p>", "js": "// compiled from area2 in lecture.ts (types stripped by tsc)\nfunction area2(shape, width, height) {\n    var area = width * height;\n    return \"I'm a \" + shape + \" of area \" + area + \" cm^2.\";\n}\nconsole.log(area2('square', 15, 15));", "height": 60, "steps": [{"note": "The slide's bad call: tsc rejects it, but if you skip the type check the JS runs and silently prints NaN.", "js": "console.log(area2(15, 15, 'square'));"}]}
```

> 🧪 **演示文件**：[lecture.ts](https://github.com/travislindenreid/INF33-Demos/blob/main/W3_L2_Oct15_TypeScript_VegaLite/lecture/lecture.ts) · [lecture.js](https://github.com/travislindenreid/INF33-Demos/blob/main/W3_L2_Oct15_TypeScript_VegaLite/lecture/lecture.js)

> ⚠️ **易错点**：即使有类型错误，tsc（默认）**仍然会写出 `.js`**，所以一定要看报错信息。

### 2.3 联合类型、可选参数、泛型（加分幻灯片）

**联合类型**（union type，幻灯片 77，来自 TypeScript 1.4 的发布公告）：`|` 表示可以是几种类型之一：

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

`f(5)` → `15`；`f([1, 2, 3])` → `undefined`（`else` 里只有注释）；`f("5")` 是类型错误。

**可选参数与默认参数**（幻灯片 78，TypeScript Handbook）：`?` 表示参数可选，`=` 给出默认值：

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

（这是三段互相独立的代码。）省略的 `x?` 是 `undefined`；没有 `?` 时 `f()` 会报错；`x = 10` 的默认值为 10。当 `n = 3.14159` 时：`toFixed()` → `3`，`toFixed(3)` → `3.142`。

**泛型**（generics，幻灯片 75）“和 Java 一样”：类型参数 `T` 保留调用者传入的类型：

```ts
function identity<T>(arg: T): T {
    return arg;
}
let output = identity<string>("myString");  // type of output will be 'string'
let output = identity("myString");  // type of output will be 'string'
```

第二次调用会**推断** `T`（类似 C++ 的模板）。（幻灯片的 bug：`let output` 写了两次 → `Cannot redeclare block-scoped variable 'output'`；改掉其中一个名字即可。）

> 📝 **练习**：[问题 1](#121-问题-1哪些-typescript-文件会转译成这段-js幻灯片-14) · [演示 1](#122-演示-1给-joinntimes-加类型幻灯片-13--setup1--solution1)

> 🔗 **延伸阅读**：[TypeScript Handbook: Generics](https://www.typescriptlang.org/docs/handbook/generics.html) · [Announcing TypeScript 1.4 (union types)](https://devblogs.microsoft.com/typescript/announcing-typescript-1-4/) · [TypeScript Handbook: Optional parameters](https://www.typescriptlang.org/docs/handbook/2/functions.html#optional-parameters)

---

## 3. 类、接口与继承

### 3.1 类

类“和 Java 一样”：顶部是带类型的字段，然后是构造函数和方法：

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

`square.shoutout()` → `I'm pink square with an area of 900 cm squared.`（`lecture.js` 中是同样的 JS `class`，字段没有类型。）

### 3.2 接口（加分幻灯片）

接口（interface）描述一个对象的“输入”和“输出”：它必需的属性及其类型：

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

会输出面积 450 和 900。任何带有正确属性的对象字面量都是一个 `Shape`；省略 `height` 会报类型错误。（幻灯片的 bug：弯引号 `“red"` → `"red"`。）

### 3.3 继承（加分幻灯片）

类和接口都可以被**扩展**（extend）：`super(...)` 调用基类构造函数，同名方法会**重写**（override），`super.method()` 调用基类的版本：

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

会输出 `I'm cube with a volume of 27000 cm cube.`，然后（基类方法）输出 `I'm pink cube with an area of 900 cm squared.` 演示：

```viz web-demo
{"title": "Slides 17 & 74 · compiled JS of Shape and Shape3D", "interactive": true, "html": "<p>See the console.</p>", "js": "// compiled JavaScript of the slide 17 Shape class + slide 74 Shape3D (types stripped)\nclass Shape {\n    constructor(name, width, height) {\n        this.name = name;\n        this.area = width * height;\n        this.color = \"pink\";\n    }\n    ;\n    shoutout() {\n        return \"I'm \" + this.color + \" \" + this.name + \" with an area of \" + this.area + \" cm squared.\";\n    }\n}\nvar square = new Shape(\"square\", 30, 30);\nconsole.log(square.shoutout());\nclass Shape3D extends Shape {\n    constructor(name, width, height, length) {\n        super(name, width, height); //calls base class constructor\n        this.volume = length * this.area;\n    }\n    ;\n    shoutout() {\n        return \"I'm \" + this.name + \" with a volume of \" + this.volume + \" cm cube.\";\n    }\n    superShout() {\n        return super.shoutout();\n    }\n}\n\nvar cube = new Shape3D(\"cube\", 30, 30, 30);\nconsole.log(cube.shoutout());\nconsole.log(cube.superShout());\n", "height": 60}
```

### 3.4 Getter 与 setter（加分幻灯片）

`get`/`set` 在读取或赋值属性时运行代码；`private` 隐藏底层字段：

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

`emp.fullName = "Peter"` 会存入该值；一个 14 个字符的名字会抛出异常。从外部访问 `emp._fullName` 只会产生编译期错误。

---

## 4. tsconfig.json 与声明文件

`tsconfig.json` 文件：

- 表明这是一个 TypeScript **项目**；
- 指定要转译哪些文件或文件夹；
- 选择转译器选项，例如是否删除注释；
- 指定要转译到哪个版本的 ECMAScript（JavaScript）。

用下面的命令构建整个项目：

```bash
tsc --project tsconfig.json
```

**声明文件（加分幻灯片 71–72）。**`.d.ts` 保留了被擦除的类型，这样库的使用者就可以检查自己的调用：

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

`.d.ts` 就像 C++ 的头文件：只有函数签名，没有函数体。

> 🔗 **延伸阅读**：[TypeScript Handbook: tsconfig.json](https://www.typescriptlang.org/docs/handbook/tsconfig-json.html)

---

## 5. 优点、缺点与其他转译器

| TypeScript 的优点 | TypeScript 的缺点 |
|---|---|
| **类型检查**：在代码运行*之前*就能发现错误 | **转译有时很烦人**；大项目里可能很慢 |
| 编辑器可以自动补全方法和 API | 对新的 JavaScript 库可能无法开箱即用 |
| 更容易重构代码 | 适配 Angular 和 React 花了一段时间（现在是 Angular 的默认语言） |
| **面向对象**：更容易管理和维护大型代码库 | |
| 足够简单：与 Java 等面向对象语言原理相同 | |

**其他值得一提的 JavaScript 转译器：**

| | Dart | Kotlin |
|---|---|---|
| 开发者 | Google | JetBrains（开发了很多 IDE） |
| 理念 | 引入类型和类似的面向对象实践 | “更好的” Java，与 Java 完全互操作 |
| 转成 JavaScript 的方式 | `dart2js` | `kotlin.js`（配合 React 等使用） |

---

## 6. 交互式软件与 UI 工具

*话题切换：软件工具与可视化*，这只是**很窄的一小部分**；想学更多，请选 **IN4MATX 143**。

**顺序式程序（命令行）。**程序先给出提示；使用者等待，然后输入，可以建模成一个文件（`input()`、`std::cin`）。

**事件驱动编程（event-driven programming）。**程序等待使用者；输入以**事件**（鼠标按下、拖动、按键松开）的形式到达，所有事件放进同一个有序的**事件队列**（event queue），从而屏蔽设备细节（`addEventListener`，见 [Lecture 6](lec-06.zh-CN.md#7-事件与监听器)）。

**基本的交互式软件循环**在所有交互式软件的某个地方都存在：

```js
do { 
  e = read_event();          // Input
  dispatch_event(e);         // Processing
  if (damage_exists()) 
     update_display();       // Output
} while (e.type != WM_QUIT); 
```

给每个网页或应用都写一遍这个循环会很繁琐，所以**我们依赖工具来处理常见操作**。

**例子：按钮。**设置 X/Y 边界，检查鼠标按下*和*松开是否都在边界内，然后触发事件，每个按钮都要这样做。

**理解工具。**

- *什么是 UI 工具？*帮助构建 UI 的软件/库：Bootstrap（响应式）、Angular、React 等。
- *为什么要用？*它们把常见实践打包进框架，让这些实践容易遵循，让你专注于自己的应用。
- *它们带来*更快、更迭代式的设计，更好的实现，以及使用同一工具的各个应用之间的一致性。
- *为什么工具很难设计？*核心实践和人们的任务一直在变。

---

## 7. 评估工具：门槛与天花板

评估一个工具“有多有用”的四个关键术语（Myers、Hudson & Pausch，TOCHI 2000）：

| 术语 | 含义 | 幻灯片中的说明 |
|---|---|---|
| **门槛**（Threshold） | 上手有多难 | 取决于已有知识；新语言会提高门槛，借用已有概念会降低门槛。 |
| **天花板**（Ceiling） | 能做到多少事 | 与直接访问设备相比，工具会限制可能性。 |
| **阻力最小的路径**（Path of least resistance） | 工具会影响人们做出什么样的界面 | Bootstrap 页面看起来都差不多（[Lecture 4](lec-04.zh-CN.md)）。**Sapir-Whorf 假说**：语言限制思维；工具框定了我们思考设计的方式。 |
| **移动靶**（Moving targets） | 需求变化会让工具过时 | 固化的规范会约束设计；认知和技术（例如 VR）一直在演进。 |

**两者都是相对的。**最好的工具是**低门槛**、**高天花板**（Photoshop 通过提供教程来降低门槛）。

> 📝 **练习**：[问题 2](#123-问题-2photoshop-与-paint-的门槛和天花板幻灯片-38)

> 🔗 **延伸阅读**：[Myers, Hudson & Pausch (2000): Past, present, and future of user interface software tools](https://doi.org/10.1145/344949.344959)

---

## 8. 可视化工具与声明式语言

*这和可视化有什么关系？*可视化工具遵循同样的原则。

### 8.1 SVG 与 Excel

**SVG（Scalable Vector Graphics，可缩放矢量图形）**：基于 XML、类似 HTML 的标记，用来描述线、圆、矩形；浏览器负责渲染。（幻灯片：由像素组成的位图“S”与平滑的矢量“S”的对比。）

```html
<svg width="100" height="100">
  <circle cx="50" cy="50" r="40" stroke="green" stroke-width="4" fill="yellow" />
</svg>
```

一个黄色的圆，绿色边框，圆心 (50, 50)，半径 40：

```viz web-demo
{"title": "Slide 43 · an SVG circle", "interactive": true, "html": "<svg width=\"100\" height=\"100\">\n  <circle cx=\"50\" cy=\"50\" r=\"40\" stroke=\"green\" stroke-width=\"4\" fill=\"yellow\" />\n</svg>", "height": 120, "steps": [{"note": "Add a rectangle: SVG is built from shapes like this.", "html": "<svg width=\"100\" height=\"100\">\n  <circle cx=\"50\" cy=\"50\" r=\"40\" stroke=\"green\" stroke-width=\"4\" fill=\"yellow\" />\n  <rect x=\"35\" y=\"35\" width=\"30\" height=\"30\" fill=\"blue\" />\n</svg>"}]}
```

| 工具 | 门槛 | 天花板 |
|---|---|---|
| SVG | 高 | 高（什么都能画，例如 Minard 的拿破仑远征图） |
| Microsoft Excel | 低 | 低（标准图表，例如幻灯片上的“Wildlife Population”条形图） |

### 8.2 可视化工具的谱系

幻灯片 45，从门槛较低（上）到天花板较高（下）：

| 层次 | 类型 | 例子 |
|---|---|---|
| 图表工具（Charting tools） | 图表类型库 | Excel、Google Charts |
| 声明式语言 | 可视分析语法 | ggplot、VizQL |
| 声明式语言 | **可视化语法**（幻灯片中高亮） | Protovis、D3.js、**Vega-Lite** |
| 编程语言 | 图形 API | Processing、SVG、OpenGL |

### 8.3 声明式与命令式

**声明式语言**（declarative language）描述的是**做什么**（what），而不是**怎么做**（how），把**规范**（specification）与**执行**（execution）分离；**命令式**（imperative）代码则给出明确的步骤。

幻灯片把 HTML（标记）和 CSS（样式）重新归为**声明式**，把 JavaScript（编程）归为**命令式**。幻灯片 49：

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

网格：描述*是什么*。JS：*一步一步*地执行，最终输出 `number*fish*-2*blue*3*dog*2`（[Lecture 5](lec-05.zh-CN.md)）。（幻灯片的 bug：弯引号 `“col-4"`、`“col"`；已修正。）

**为什么用声明式？**迭代更快，代码更少，门槛更低，而且可以用程序生成。

> 🔗 **延伸阅读**：[Wikipedia: Vector graphics](https://en.wikipedia.org/wiki/Vector_graphics) · [Edward Tufte: posters](https://www.edwardtufte.com/tufte/posters)

---

## 9. Vega-Lite：图形语法

**目标**（Satyanarayan 等，IEEE Vis 2017）：“一种表达力强（高天花板）又简洁（低门槛）的、用于描述可视化的声明式语言”。

**图形语法**（grammar of graphics）：一张图表由以下几部分组成：

| 部分 | 含义 |
|---|---|
| **Data**（数据） | 要可视化的输入数据 |
| **Mark**（标记） | 代表数据的图形：面积（area）、柱（bar）、点（point）、图像（image）、线（line）、标签（text）、规则线（rule）、弧（arc） |
| **Transform**（变换） | 是否过滤、聚合、分箱等 |
| **Encoding**（编码） | 数据字段与标记属性（x、y、color 等）之间的映射 |
| **Scale**（比例尺） | （编码的一部分）把数据值映射成视觉值 |
| **Guides**（引导元素） | 把比例尺可视化的坐标轴和图例 |

一份规范（spec）就是一个 JSON 对象；数据通常是由记录组成的 JSON 数组（仓库里的 `seattle-weather.json`，2015 年共 365 行）：

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

加载 vega、vega-lite 和 vega-embed 脚本之后，用 `vegaEmbed('#id', spec)` 把它画出来（[演示 2](#124-演示-22000-年美国年龄分布条形图幻灯片-63--setup2--solution2)）。

> 🔗 **延伸阅读**：[Satyanarayan et al. (2017): Vega-Lite: A Grammar of Interactive Graphics](https://doi.org/10.1109/TVCG.2016.2599030)

---

## 10. 在 Vega-Lite 中构建直方图

**直方图 = 柱状图，x = 分箱后的字段，y = 计数**，再按 weather 着色。一次只改一处，逐步构建：

**第 1 步：每条记录一个刻度线**（幻灯片 55）：mark 为 `"tick"`，x = `"temperature"`：

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

每个字段都属于**四种类型**之一：

| 类型 | 含义 | 例子 |
|---|---|---|
| `quantitative` | 数值型 | temperature |
| `temporal` | 时间 | date |
| `ordinal` | 有序类别 | 年龄段、月份 |
| `nominal` | 无序类别 | weather、origin |

**第 2 步：分箱**（幻灯片 56）：在 x 上加 `bin: true`；坐标轴标题变成 `BIN(temperature)`，每个箱一个刻度线，还没有计数。

**第 3 步：计数**（幻灯片 57）：y 使用 `aggregate: "count"`；仍然是刻度线，位于各自计数的高度。

**第 4 步：柱**（幻灯片 58）：`mark: "bar"` 就变成了直方图：

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

**第 5 步：颜色**（幻灯片 59）：`color: {field: "weather", type: "nominal"}` 把每根柱拆成**堆叠**的多段，并带有图例。

演示用了 12 行内联数据（`data: {values: …}`），所以计数很小：

```viz web-demo
{"title": "Slides 55–59 · building the histogram one encoding at a time (inline rows from seattle-weather.json)", "interactive": true, "libs": ["vega-lite"], "html": "<div id=\"vis\"></div>", "js": "// 12 rows from the repo's seattle-weather.json (the demo can't load the file)\nvar weather = [\n  {\"date\": \"2015/01/01\", \"weather\": \"sun\", \"temperature\": 1.2},\n  {\"date\": \"2015/01/02\", \"weather\": \"fog\", \"temperature\": 2.8},\n  {\"date\": \"2015/01/18\", \"weather\": \"rain\", \"temperature\": 10.55},\n  {\"date\": \"2015/03/25\", \"weather\": \"fog\", \"temperature\": 10.8},\n  {\"date\": \"2015/04/01\", \"weather\": \"rain\", \"temperature\": 9.2},\n  {\"date\": \"2015/05/22\", \"weather\": \"sun\", \"temperature\": 14.2},\n  {\"date\": \"2015/06/15\", \"weather\": \"drizzle\", \"temperature\": 23.05},\n  {\"date\": \"2015/07/08\", \"weather\": \"drizzle\", \"temperature\": 22.2},\n  {\"date\": \"2015/07/31\", \"weather\": \"sun\", \"temperature\": 26.1},\n  {\"date\": \"2015/08/14\", \"weather\": \"rain\", \"temperature\": 16.65},\n  {\"date\": \"2015/08/22\", \"weather\": \"drizzle\", \"temperature\": 19.45},\n  {\"date\": \"2015/10/19\", \"weather\": \"fog\", \"temperature\": 14.7}\n];\n\nvegaEmbed(\"#vis\", {\n  data: {values: weather},\n  mark: \"tick\",\n  encoding: {\n    x: {field: \"temperature\", type: \"quantitative\"}\n  }\n}, {actions: false});", "height": 260, "tab": "js", "steps": [{"note": "Slide 56: bin: true groups the temperatures into bins.", "js": "vegaEmbed(\"#vis\", {\n  data: {values: weather},\n  mark: \"tick\",\n  encoding: {\n    x: {bin: true, field: \"temperature\", type: \"quantitative\"}\n  }\n}, {actions: false});"}, {"note": "Slide 57: y counts the records in each bin (still ticks).", "js": "vegaEmbed(\"#vis\", {\n  data: {values: weather},\n  mark: \"tick\",\n  encoding: {\n    x: {bin: true, field: \"temperature\", type: \"quantitative\"},\n    y: {aggregate: \"count\", type: \"quantitative\"}\n  }\n}, {actions: false});"}, {"note": "Slide 58: change the mark to bar, and it's a histogram.", "js": "vegaEmbed(\"#vis\", {\n  data: {values: weather},\n  mark: \"bar\",\n  encoding: {\n    x: {bin: true, field: \"temperature\", type: \"quantitative\"},\n    y: {aggregate: \"count\", type: \"quantitative\"}\n  }\n}, {actions: false});"}, {"note": "Slide 59: color by the nominal weather field; the bars stack automatically.", "js": "vegaEmbed(\"#vis\", {\n  data: {values: weather},\n  mark: \"bar\",\n  encoding: {\n    x: {bin: true, field: \"temperature\", type: \"quantitative\"},\n    y: {aggregate: \"count\", type: \"quantitative\"},\n    color: {field: \"weather\", type: \"nominal\"}\n  }\n}, {actions: false});"}]}
```

> 🧪 **演示文件**：[seattle-weather.json](https://github.com/travislindenreid/INF33-Demos/blob/main/W3_L2_Oct15_TypeScript_VegaLite/demos/setup/seattle-weather.json)

> ⚠️ **易错点**：幻灯片加载的是 `"weather-seattle.json"`，而仓库里的文件叫 `seattle-weather.json`；`url` 写错会得到一张空图表，且不报错。（幻灯片里的 `snow` 在仓库的 2015 年数据中并不存在。）

---

## 11. 合理的默认值及其覆盖

幻灯片 59 从未指定颜色、分箱宽度、坐标轴标签或堆叠方式：Vega-Lite 自己选了**“合理的默认值”**（sensible defaults）。

**覆盖默认值**（幻灯片 61）：自定义颜色比例尺，把每个 `domain` 值映射到一个 `range` 颜色：

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

幻灯片的 bug：`scale` 被放在了 `color` *旁边*，所以 Vega-Lite 会丢弃它（并给出警告）→ 应像上面这样放进 `color` 里面（弯引号 `“#1f77b4"` 也已修正）。

**每月降水量**（幻灯片 62）：`timeUnit: "month"` 按月份对日期（例如 "2018-10-17"）分组并标注；`aggregate: "mean"` 求平均值：

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

幻灯片的 bug：仓库数据里没有 `precipitation`（演示改用 temperature），而且 `quantitative` 类型的月份**画不出柱**；请使用 `"ordinal"`（如幻灯片所示）或 `"temporal"`。

```viz web-demo
{"title": "Slides 61–62 · overriding the color scale, then a monthly mean (inline rows from seattle-weather.json)", "interactive": true, "libs": ["vega-lite"], "html": "<div id=\"vis\"></div>", "js": "// 12 rows from the repo's seattle-weather.json (the demo can't load the file)\nvar weather = [\n  {\"date\": \"2015/01/01\", \"weather\": \"sun\", \"temperature\": 1.2},\n  {\"date\": \"2015/01/02\", \"weather\": \"fog\", \"temperature\": 2.8},\n  {\"date\": \"2015/01/18\", \"weather\": \"rain\", \"temperature\": 10.55},\n  {\"date\": \"2015/03/25\", \"weather\": \"fog\", \"temperature\": 10.8},\n  {\"date\": \"2015/04/01\", \"weather\": \"rain\", \"temperature\": 9.2},\n  {\"date\": \"2015/05/22\", \"weather\": \"sun\", \"temperature\": 14.2},\n  {\"date\": \"2015/06/15\", \"weather\": \"drizzle\", \"temperature\": 23.05},\n  {\"date\": \"2015/07/08\", \"weather\": \"drizzle\", \"temperature\": 22.2},\n  {\"date\": \"2015/07/31\", \"weather\": \"sun\", \"temperature\": 26.1},\n  {\"date\": \"2015/08/14\", \"weather\": \"rain\", \"temperature\": 16.65},\n  {\"date\": \"2015/08/22\", \"weather\": \"drizzle\", \"temperature\": 19.45},\n  {\"date\": \"2015/10/19\", \"weather\": \"fog\", \"temperature\": 14.7}\n];\n\n// slide 61, with scale moved inside color (see the note above)\nvegaEmbed(\"#vis\", {\n  data: {values: weather},\n  mark: \"bar\",\n  encoding: {\n    x: {bin: true, field: \"temperature\", type: \"quantitative\"},\n    y: {aggregate: \"count\", type: \"quantitative\"},\n    color: {\n      field: \"weather\", type: \"nominal\",\n      scale: {\n        domain: [\"sun\",\"fog\",\"drizzle\",\"rain\",\"snow\"],\n        range: [\"#e7ba52\",\"#c7c7c7\",\"#aec7e8\",\"#1f77b4\",\"#9467bd\"]\n      }\n    }\n  }\n}, {actions: false});", "height": 260, "tab": "js", "steps": [{"note": "Slide 62's idea on the repo data: timeUnit month on date, y = mean temperature (the repo file has no precipitation field).", "js": "// slide 62 (ordinal month; temperature instead of precipitation)\nvegaEmbed(\"#vis\", {\n  data: {values: weather},\n  mark: \"bar\",\n  encoding: {\n    x: {timeUnit: \"month\", field: \"date\", type: \"ordinal\"},\n    y: {aggregate: \"mean\", field: \"temperature\", type: \"quantitative\"}\n  }\n}, {actions: false});"}]}
```

**合理的默认值是 Vega-Lite 的秘诀**（幻灯片 67）：**更低的门槛**（规范简洁），**同样的天花板**（可以覆盖）。缺点：图表**看起来很相似**（阻力最小的路径，和栅格框架一样）（[第 7 节](#7-评估工具门槛与天花板)）。

课堂上的 **Vega-Lite 演示**（幻灯片 63，`setup2.js`，“Not TypeScript!”）就是[演示 2](#124-演示-22000-年美国年龄分布条形图幻灯片-63--setup2--solution2)。

> 📝 **练习**：[演示 2](#124-演示-22000-年美国年龄分布条形图幻灯片-63--setup2--solution2) · [问题 3](#125-问题-3哪个-vega-lite-规范能画出这张散点图幻灯片-64)

---

## 12. 课堂问题与演示（附解答）

### 12.1 问题 1：哪些 TypeScript 文件会转译成这段 JS？（幻灯片 14）

下面哪些 TypeScript 文件会转译成

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
- **D** 1 和 2
- **E** 1、2 和 3

> ✍️ **先自己试一试。**

**答案：E**（幻灯片 16 公布）。

- 类型会被**擦除**：文件 1 和 2 的 `:number` 都会消失（用 tsc 转译仓库里 `q1.ts` 的各个版本可以确认）。
- 文件 3 是纯 JS，而 TS 是超集，所以它转译后还是它自己。
- 陷阱：严格模式会对文件 3 报错（`implicitly has an 'any' type`），但**仍然会输出同样的 JS**。

> 🧪 **演示文件**：[q1.ts](https://github.com/travislindenreid/INF33-Demos/blob/main/W3_L2_Oct15_TypeScript_VegaLite/q1/q1.ts) · [q1.js](https://github.com/travislindenreid/INF33-Demos/blob/main/W3_L2_Oct15_TypeScript_VegaLite/q1/q1.js)

返回 [2. 类型](#2-类型)。

### 12.2 演示 1：给 joinNTimes 加类型（幻灯片 13 · setup1 → solution1）

任务，来自 `setup1.ts`：

- 用纯 JavaScript 写出这个函数：把字符串数组用“join”字符连接起来，并在每次结果后拼上换行符（`'\n'`）。
- 给该函数的所有参数和返回值加上类型。
- 这会如何改变哪些函数调用是合法的？

要尝试的三个调用（在起始代码中被注释掉了）：

```ts
//console.log(joinNTimes(['hello', 'my', 'name', 'is', 'theresa'], ' ', 3));
//console.log(joinNTimes(['in4matx', 133], '-', 2))
//console.log(joinNTimes(['two', 'too', 'to'], 2, 4))
```

> ✍️ **先自己试一试。**

**答案。**纯 JS（仓库里的 `setup1.js`）：

```js
function joinNTimes(arrOfStr, joinStr, n) {
    var joinedStr = '';
    for (var i = 0; i < n; i++) {
        joinedStr += arrOfStr.join(joinStr) + '\n';
    }
    return joinedStr;
}
```

没有类型时，**三个调用都能运行**（幻灯片上的 console 输出）：

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

`join` 会把 `133` 强制转换成 `"133"`，并把 `2` 当作分隔符 `"2"`。

加上类型后（来自 `solution1.ts`）：

```ts
function joinNTimes(arrOfStr:string[], joinStr:string, n:number):string {
	var joinedStr:string = '';
	for(var i:number=0;i<n;i++) {
		joinedStr += arrOfStr.join(joinStr) + '\n';
	}
	return joinedStr;
}
```

现在**只有第一个调用是合法的**：

| 调用 | tsc |
|---|---|
| `joinNTimes(['hello', …, 'theresa'], ' ', 3)` | 通过 |
| `joinNTimes(['in4matx', 133], '-', 2)` | `Type 'number' is not assignable to type 'string'.`（`string[]` 里有 `133`） |
| `joinNTimes(['two', 'too', 'to'], 2, 4)` | `Argument of type 'number' is not assignable to parameter of type 'string'.`（`joinStr`） |

`solution1.js` 只保留了第一个调用。（仓库里的小怪癖：`solution1.ts` 整个都在 `/* … */` 里。）

> 🧪 **演示文件**：[setup1.html](https://github.com/travislindenreid/INF33-Demos/blob/main/W3_L2_Oct15_TypeScript_VegaLite/demos/setup/setup1.html) · [setup1.ts](https://github.com/travislindenreid/INF33-Demos/blob/main/W3_L2_Oct15_TypeScript_VegaLite/demos/setup/setup1.ts) · [setup1.js](https://github.com/travislindenreid/INF33-Demos/blob/main/W3_L2_Oct15_TypeScript_VegaLite/demos/setup/setup1.js) · [solution1.ts](https://github.com/travislindenreid/INF33-Demos/blob/main/W3_L2_Oct15_TypeScript_VegaLite/demos/solution/solution1.ts) · [solution1.js](https://github.com/travislindenreid/INF33-Demos/blob/main/W3_L2_Oct15_TypeScript_VegaLite/demos/solution/solution1.js)

返回 [2. 类型](#2-类型)。

### 12.3 问题 2：Photoshop 与 Paint 的门槛和天花板（幻灯片 38）

相对而言，Adobe Photoshop 和 Microsoft Paint 的*门槛*和*天花板*分别如何？（它们是制作图像的工具，但原则同样适用。）

- **A** Photoshop：高天花板、高门槛；Paint：低天花板、低门槛
- **B** Photoshop：高天花板、低门槛；Paint：低天花板、高门槛
- **C** Photoshop：低天花板、高门槛；Paint：高天花板、低门槛
- **D** Photoshop：低天花板、低门槛；Paint：高天花板、高门槛
- **E** 我很困惑，只是点一下拿参与分

> ✍️ **先自己试一试。**

**答案：A**（幻灯片 40 公布）。

- **天花板**：Photoshop 能做的事多得多（图层、滤镜、照片编辑），因此排除 C 和 D。
- **门槛**：Paint 很容易上手；Photoshop 需要学习（所以它提供教程，幻灯片 41），因此排除 B。
- 两个术语都是相对的。

返回 [7. 评估工具](#7-评估工具门槛与天花板)。

### 12.4 演示 2：2000 年美国年龄分布条形图（幻灯片 63 · setup2 → solution2）

任务（`setup2.js`）：画一张美国年龄分布的条形图，**年龄在 Y 轴，人数在 X 轴**。`population.json` 的记录（从网上加载；文件夹里也有一份副本）：

```json
[{"year":1850,"age":0,"sex":1,"people":1483789},
{"year":1850,"age":0,"sex":2,"people":1450376},
...]
```

起始代码（`setup2.html` 从 jsDelivr 加载 vega 5.21.0、vega-lite 5.2.0、vega-embed 6.20.2，外加一个 `<h1>` 和一个空的 `<div id="plot">`）：

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

按原样运行会失败：`Invalid specification … includes at least one of … "mark", "layer", …`。

> ✍️ **先自己试一试。**

**答案**（`solution2.js` 用来替换那行注释的部分）：

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

- `mark: "bar"`，**y = age，类型 `ordinal`**：每个年龄组一根柱，按顺序排列。
- **x = `people` 的 `sum`**：把每个年龄的两条记录（sex 1 和 2）加起来。
- `axis: {"title": "population"}` 覆盖了默认标题（`Sum of people`）。
- `transform` 过滤器只保留 2000 年的行。

结果：19 根柱，年龄 0–90，最长的在 35–40 岁（约 2300 万）。v4 的 `$schema` 会产生一条无害的警告。

演示：包含 0、10、…、90 岁的 2000 年数据，外加一行会被过滤器丢弃的 1990 年数据：

```viz web-demo
{"title": "Demo 2 · solution2.js with inline rows (DOMContentLoaded wrapper dropped; the demo runs after the page)", "libs": ["vega-lite"], "html": "<h1>U.S. age distribution in 2000</h1>\n<div id=\"plot\">\n</div>", "js": "// population.json, year 2000 rows for ages 0,10,...,90 (+ one 1990 row the filter drops)\nvar population = [\n  {\"year\": 2000, \"age\": 0, \"sex\": 1, \"people\": 9735380},\n  {\"year\": 2000, \"age\": 0, \"sex\": 2, \"people\": 9310714},\n  {\"year\": 2000, \"age\": 10, \"sex\": 1, \"people\": 10563233},\n  {\"year\": 2000, \"age\": 10, \"sex\": 2, \"people\": 10022524},\n  {\"year\": 2000, \"age\": 20, \"sex\": 1, \"people\": 9731315},\n  {\"year\": 2000, \"age\": 20, \"sex\": 2, \"people\": 9324244},\n  {\"year\": 2000, \"age\": 30, \"sex\": 1, \"people\": 10205879},\n  {\"year\": 2000, \"age\": 30, \"sex\": 2, \"people\": 10119296},\n  {\"year\": 2000, \"age\": 40, \"sex\": 1, \"people\": 11320252},\n  {\"year\": 2000, \"age\": 40, \"sex\": 2, \"people\": 11488578},\n  {\"year\": 2000, \"age\": 50, \"sex\": 1, \"people\": 8507934},\n  {\"year\": 2000, \"age\": 50, \"sex\": 2, \"people\": 8911133},\n  {\"year\": 2000, \"age\": 60, \"sex\": 1, \"people\": 5123399},\n  {\"year\": 2000, \"age\": 60, \"sex\": 2, \"people\": 5668961},\n  {\"year\": 2000, \"age\": 70, \"sex\": 1, \"people\": 3792145},\n  {\"year\": 2000, \"age\": 70, \"sex\": 2, \"people\": 5184855},\n  {\"year\": 2000, \"age\": 80, \"sex\": 1, \"people\": 1902638},\n  {\"year\": 2000, \"age\": 80, \"sex\": 2, \"people\": 3221898},\n  {\"year\": 2000, \"age\": 90, \"sex\": 1, \"people\": 336303},\n  {\"year\": 2000, \"age\": 90, \"sex\": 2, \"people\": 1064581},\n  {\"year\": 1990, \"age\": 0, \"sex\": 1, \"people\": 9307465},\n  {\"year\": 1990, \"age\": 0, \"sex\": 2, \"people\": 8894007}\n];\n\nvar schema = {\n    \"data\": { \"values\": population },\n    \"transform\": [{\"filter\": \"datum.year == 2000\"}], /*Only select population data from 2000*/\n    \"mark\": \"bar\",\n    \"encoding\": {\n        \"y\": {\n          \"field\": \"age\", \"type\": \"ordinal\"\n        },\n        \"x\": {\n          \"aggregate\": \"sum\", \"field\": \"people\", \"type\": \"quantitative\",\n          \"axis\": {\"title\": \"population\"}\n        }\n    }\n}\nvegaEmbed('#plot', schema, {actions:false});", "height": 340, "tab": "js"}
```

> 🧪 **演示文件**：[setup2.html](https://github.com/travislindenreid/INF33-Demos/blob/main/W3_L2_Oct15_TypeScript_VegaLite/demos/setup/setup2.html) · [setup2.js](https://github.com/travislindenreid/INF33-Demos/blob/main/W3_L2_Oct15_TypeScript_VegaLite/demos/setup/setup2.js) · [solution2.html](https://github.com/travislindenreid/INF33-Demos/blob/main/W3_L2_Oct15_TypeScript_VegaLite/demos/solution/solution2.html) · [solution2.js](https://github.com/travislindenreid/INF33-Demos/blob/main/W3_L2_Oct15_TypeScript_VegaLite/demos/solution/solution2.js) · [population.json](https://github.com/travislindenreid/INF33-Demos/blob/main/W3_L2_Oct15_TypeScript_VegaLite/demos/setup/population.json)

返回 [11. 合理的默认值](#11-合理的默认值及其覆盖)。

### 12.5 问题 3：哪个 Vega-Lite 规范能画出这张散点图？（幻灯片 64）

这张可视化图在 Vega-Lite 中应该怎么写？（假设字段名都是正确的。）图表：空心圆，**Horsepower** 在 x 轴（0–200+），**Miles_per_Gallon** 在 y 轴（0–50），按 **Origin** 着色（Europe 蓝、Japan 橙、USA 红）。

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

（选项字母以公布答案的幻灯片 66 为准；题目幻灯片上的顺序不同。A 和 E 保留了幻灯片中的弯引号 `“`。）

> ✍️ **先自己试一试。**

**答案：B**（幻灯片 66 公布）。

- **Mark**：空心圆 = `"point"`；`"ticks"` 不是合法的 mark（C 会报错），因此排除 C 和 E。
- **坐标轴**：Horsepower 在 x，MPG 在 y，都是 `quantitative`；A 和 E 把它们互换并设成了 `ordinal`（E 里还有拼写错误 `"MPT"`）。
- **颜色**：Origin 是无序的，所以用 `nominal`（三种色相）。D 的 `ordinal` 会给出同一色相的不同深浅：

```viz web-demo
{"title": "Question 3 · option B (nominal color), then option D (ordinal color)", "libs": ["vega-lite"], "html": "<div id=\"vis\"></div>", "js": "// three made-up rows, just to compare B (nominal) with D (ordinal)\nvar cars = [\n  {\"Horsepower\": 130, \"MPG\": 18, \"Origin\": \"USA\"},\n  {\"Horsepower\": 95, \"MPG\": 24, \"Origin\": \"Japan\"},\n  {\"Horsepower\": 46, \"MPG\": 26, \"Origin\": \"Europe\"}\n];\nfunction show(colorType) {\n  vegaEmbed(\"#vis\", {\n    data: {values: cars},\n    mark: \"point\",\n    encoding: {\n      x: {field: \"Horsepower\", type: \"quantitative\"},\n      y: {field: \"MPG\", type: \"quantitative\"},\n      color: {field: \"Origin\", type: colorType}\n    }\n  }, {actions: false});\n}\nshow(\"nominal\"); // option B", "height": 240, "tab": "js", "steps": [{"note": "Option D: ordinal color turns the three origins into shades of one hue, unlike the slide's chart.", "js": "show(\"ordinal\"); // option D"}]}
```

返回 [11. 合理的默认值](#11-合理的默认值及其覆盖)。

---

## 13. 速查与必记的 5 个要点

**TypeScript**

| 语法 / 命令 | 含义 |
|---|---|
| `npm install -g typescript` | 安装 `tsc` |
| `tsc hello.ts` | 写出 `hello.js`（类型被去掉） |
| `tsc --project tsconfig.json` | 按配置文件构建项目 |
| `tsc --declaration test.ts` | 同时写出 `test.d.ts`（只含类型） |
| `npm install --save @types/lib` | 某个 JS 库的类型声明 |
| `var x:number = 133;` | 带标注的变量；`var x = 133;` 推断为 `number` |
| `number`, `boolean`, `string`, `void`, `null`, `undefined`, `any` | 预定义类型 |
| `function f(a: string, b: number): string` | 参数类型与返回类型 |
| `string[]` | 字符串数组 |
| `x: number \| number[]` | 联合类型 |
| `f(x?: number)` / `f(x = 10)` | 可选参数 / 默认参数 |
| `interface Shape { color?: string; }` | 对象的形状；`?` = 可选属性 |
| `class B extends A { constructor(){ super(...) } }` | 继承；`super.m()` 调用基类方法 |
| `private`, `get` / `set` | 隐藏字段；访问器属性 |
| `function identity<T>(arg: T): T` | 泛型函数 |

**工具评估**

| 术语 | 含义 |
|---|---|
| 门槛（Threshold） | 上手有多难（希望低） |
| 天花板（Ceiling） | 能做到多少事（希望高） |
| 阻力最小的路径（Path of least resistance） | 工具塑造了人们做出的东西（所有 Bootstrap / Vega-Lite 的产出看起来都很像） |
| 移动靶（Moving targets） | 需求变化会让工具过时 |

**Vega-Lite**

| 部分 | 例子 |
|---|---|
| data | `data: {url: "file.json"}` 或 `data: {values: [...]}` |
| mark | `"bar"`, `"tick"`, `"point"`, `"line"`, `"area"`, `"rule"`, `"text"`, `"arc"` |
| 字段类型 | `quantitative`, `temporal`, `ordinal`, `nominal` |
| bin | `x: {bin: true, field: "temperature", type: "quantitative"}` |
| aggregate | `y: {aggregate: "count", type: "quantitative"}`；还有 `"sum"`、`"mean"` |
| color | `color: {field: "weather", type: "nominal"}` |
| 自定义 scale | `color: {…, scale: {domain: [...], range: [...]}}`（写在通道内部） |
| time | `x: {timeUnit: "month", field: "date", type: "ordinal"}` |
| filter | `transform: [{"filter": "datum.year == 2000"}]` |
| 画出来 | `vegaEmbed('#plot', spec, {actions: false})` |

**必记的 5 个要点**

1. TS 的类型是**先检查，再擦除**：有类型和没类型的代码输出同样的 JS，即使有类型错误也一样。
2. 类型是可选的：`var x = 133` 会被**推断**为 `number`；参数类型决定哪些调用是合法的。
3. **门槛** = 上手有多难，**天花板** = 能做到多少事；希望门槛低、天花板高；两者都是相对的（Photoshop 高/高，Paint 低/低）。
4. 声明式 = *做什么*（HTML、CSS、Vega-Lite）；命令式 = 一步步的*怎么做*（JS）。Vega-Lite 的**合理默认值**降低了门槛；可以覆盖则保住了天花板。
5. Vega-Lite 规范 = **data + mark + encoding**，并为字段选对类型；直方图 = `bar`、分箱的 x、`count` 的 y。